export const RECIPIENT='rabota@ochakovo.ru';
export const JOB_LABELS={undecided:'Пока выбираю — хочу обсудить',lab:'Химик-лаборант',engineer:'Специалист по автоматизации',bottling:'Оператор линии розлива',technology:'Оператор технологического цеха',warehouse:'Оператор складского комплекса',keeper:'Кладовщик'};
export function mailConfigured(env){return env.MAIL_PROVIDER==='resend'&&!!env.RESEND_API_KEY&&typeof env.MAIL_FROM==='string'&&/^[^\r\n]+@[^\r\n]+$/.test(env.MAIL_FROM)}
export function notificationPayload(application,env){return {from:env.MAIL_FROM,to:[RECIPIENT],subject:`Первая смена · заявка ${application.id}`,text:[`Новая заявка «Первая смена»`,`Идентификатор: ${application.id}`,`Дата заявки (UTC): ${application.created_at}`,`ФИО: ${application.name}`,`Способ связи: ${application.contact_method==='email'?'Электронная почта':'Телефон'}`,`Контакт: ${application.contact}`,`Дата рождения: ${application.dob}`,`Вуз или колледж: ${application.education}`,`Направление: ${JOB_LABELS[application.job]||application.job}`,`Готовность приступить: ${application.readiness}`,`Версия согласия: ${application.consent_version}`,`Источник перехода: ${application.source}`,`Место открытия анкеты: ${application.entry}`].join('\n')};}
export async function notificationState(db,id){const r=await db.prepare('SELECT state,provider_id,attempts,last_error,updated_at FROM mail_outbox WHERE application_id=?').bind(id).first();return r||{state:'pending',attempts:0}}
export async function deliverNotification(db,env,id,{fetch:send=globalThis.fetch,now=Date.now()}={}){
 if(!mailConfigured(env))return notificationState(db,id);
 const app=await db.prepare('SELECT * FROM applications WHERE id=?').bind(id).first();if(!app)throw Error('application_not_found');
 let row=await db.prepare('SELECT * FROM mail_outbox WHERE application_id=?').bind(id).first();if(!row)return {state:'pending'};
 if(row.state==='accepted'||row.state==='needs_review'||row.state==='cabinet')return notificationState(db,id);
 // Provider idempotency lasts 24h. An ambiguous attempt older than 23h must be
 // investigated by HR; a blind resend could create a second email.
 if(row.first_attempt_at&&now-row.first_attempt_at>=23*3600000&&['unknown','sending'].includes(row.state)){
  await db.prepare("UPDATE mail_outbox SET state='needs_review',last_error='provider_status_unknown',updated_at=? WHERE application_id=? AND state!='accepted'").bind(new Date(now).toISOString(),id).run();return notificationState(db,id);
 }
 const lock=crypto.randomUUID();
 const claimed=await db.prepare("UPDATE mail_outbox SET state='sending',lock_token=?,lease_until=?,attempts=attempts+1,first_attempt_at=COALESCE(first_attempt_at,?),payload_json=COALESCE(payload_json,?),updated_at=? WHERE application_id=? AND next_attempt_at<=? AND (state IN ('pending','failed','unknown') OR (state='sending' AND lease_until<?)) RETURNING *").bind(lock,now+60000,now,JSON.stringify(notificationPayload(app,env)),new Date(now).toISOString(),id,now,now).first();
 if(!claimed)return notificationState(db,id);
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);
 let state='unknown',error='network_or_timeout',providerId=null;
 try{
  const response=await send('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`ochakovo-application/${id}`},body:claimed.payload_json,signal:controller.signal});
  if(response.ok){const result=await response.json();if(typeof result.id==='string'&&result.id.length<200){state='accepted';providerId=result.id;error=null}else error='unconfirmed_provider_response'}
  else if(response.status>=400&&response.status<500){state='failed';error=`provider_http_${response.status}`}else error='provider_unavailable';
 }catch{}finally{clearTimeout(timer)}
 await db.prepare('UPDATE mail_outbox SET state=?,provider_id=?,last_error=?,next_attempt_at=?,lease_until=0,lock_token=NULL,updated_at=? WHERE application_id=? AND lock_token=?').bind(state,providerId,error,now+Math.min(3600000,30000*2**Math.min(claimed.attempts,7)),new Date(now).toISOString(),id,lock).run();
 return notificationState(db,id);
}

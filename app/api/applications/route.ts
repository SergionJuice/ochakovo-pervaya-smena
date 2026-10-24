import { runtime,json,sameOrigin,readJson } from '../../../lib/server';
import { config,UUID,ENTRIES,SOURCES,validateApplication,storeApplication,hash } from '../../../lib/recruitment.mjs';
import { deliverNotification } from '../../../lib/mail.mjs';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'forbidden'},403);
 const env=runtime(),c=config(env);if(!c.active||!env.DB)return json({error:'intake_unavailable',message:'Не удалось связаться с отделом подбора. Данные остались в форме — попробуй ещё раз.'},503);
 let data;try{data=await readJson(req)}catch{return json({error:'invalid_body',message:'Не удалось прочитать анкету.'},400)}
 if(!data||typeof data!=='object'||Array.isArray(data)||data.website)return json({error:'invalid_request',message:'Не удалось отправить анкету.'},400);
 if(!UUID.test(data.submissionKey||'')||!SOURCES.includes(data.source)||!ENTRIES.includes(data.entry))return json({error:'invalid_request'},400);
 const errors=validateApplication(data) as unknown as Record<string,string>;if(data.consent!==true||data.consentVersion!==c.consent.version)errors.consent='Прочитай и подтверди актуальное согласие.';
 if(Object.keys(errors).length)return json({error:'validation',fields:errors,message:'Проверь отмеченные поля.'},422);
 try{
 const ip=req.headers.get('cf-connecting-ip')||'unknown',bucket=Math.floor(Date.now()/600000),key=await hash('application:'+ip+':'+bucket);
 const rate=await env.DB.prepare('INSERT INTO intake_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,(bucket+2)*600000).first();
 await env.DB.prepare('DELETE FROM intake_limits WHERE expires_at<?').bind(Date.now()).run();
 if(rate.count>15)return json({error:'rate_limited',message:'Слишком много попыток. Данные сохранены в форме. Попробуй через 10 минут.'},429);
 const r=await storeApplication(env.DB,data,c);if(r.conflict)return json({error:'submission_conflict',message:'Заявка с этим номером уже сохранена с другими данными. Не отправляй её повторно — уточни изменения у отдела подбора.'},409);
 let notification={state:c.notifications?'pending':'cabinet'};if(c.notifications){try{notification=await deliverNotification(env.DB,env,r.id)}catch{}}
 return json({status:'saved',id:r.id,recipient:c.recipient,notification:{state:notification.state}},r.replayed?200:201);
 }catch{return json({error:'save_failed',message:'Не удалось подтвердить сохранение. Данные остались в форме. Повтори попытку — дубликат не появится.'},503)}
}

import { mailConfigured, RECIPIENT } from './mail.mjs';
export const JOB_IDS=['undecided','lab','engineer','bottling','technology','warehouse','keeper'];
export const READINESS=['Готов(а) сейчас','Через 2 недели','В течение месяца','После окончания учёбы','Хочу обсудить'];
export const ENTRIES=['home','map','game','lab','line','warehouse','finish','directions','menu','unknown'];
export const SOURCES=['direct','talent_fair','university','social','career_site','qr','other'];
export const EVENTS=['visit','game_start','level_complete','form_open','application_success','application_error','local_save'];
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function config(env){const recipient=RECIPIENT,text=(env.APPLICATION_CONSENT_TEXT||'').trim(),version=(env.APPLICATION_CONSENT_VERSION||'').trim();const active=env.APPLICATIONS_ENABLED==='true'&&!!text&&!!version&&String(env.HR_PASSWORD_PEPPER||'').length>=32;const notifications=env.APPLICATION_DELIVERY==='email'&&mailConfigured(env);return {active,notifications,recipient,consent:{text,version}};}
export function validateApplication(data,now=new Date()){
 data=data&&typeof data==='object'?data:{};const errors={};for(const [k,max]of Object.entries({name:160,contact:200,dob:10,education:240,readiness:50,job:20}))if(typeof data[k]!=='string'||data[k].length>max)errors[k]='Проверь это поле.';
 if(!errors.name&&(!data.name.trim()||data.name.trim().split(/\s+/).length<2))errors.name='Укажи фамилию и имя, отчество — если есть.';
 if(!['tel','email'].includes(data.contactMethod))errors.contact='Выбери способ связи.';
 if(!errors.contact){const value=data.contact.trim();const valid=data.contactMethod==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value):/^\+?[\d\s()\-]+$/.test(value)&&value.replace(/\D/g,'').length>=10&&value.replace(/\D/g,'').length<=15;if(!valid)errors.contact=data.contactMethod==='email'?'Укажи корректную электронную почту.':'Укажи телефон: 10–15 цифр.';}
 const dob=typeof data.dob==='string'?data.dob:'';const date=/^\d{4}-\d{2}-\d{2}$/.test(dob)?new Date(dob+'T12:00:00Z'):new Date(NaN);const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);const [y,m,d]=today.split('-').map(Number);const parts=dob.split('-').map(Number);
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==data.dob||parts[0]<1900||data.dob>today)errors.dob='Укажи корректную дату рождения.';else if(y-parts[0]-(m<parts[1]||m===parts[1]&&d<parts[2]?1:0)<18)errors.dob='Практика и работа доступны с 18 лет.';
 if(!JOB_IDS.includes(data.job))errors.job='Выбери направление или «Пока выбираю».';
 if(!READINESS.includes(data.readiness))errors.readiness='Укажи готовность приступить.';
 if(!errors.education&&data.education.trim().length<3)errors.education='Укажи вуз или колледж.';
 return errors;
}
export function cleanEvent(data){if(!data||typeof data!=='object'||Object.keys(data).some(k=>!['id','event','source','entry','stage','outcome'].includes(k)))return null;if(!UUID.test(data.id||'')||!EVENTS.includes(data.event)||data.event==='application_success')return null;if(!SOURCES.includes(data.source)||!ENTRIES.includes(data.entry)||!['none','lab','line','warehouse'].includes(data.stage)||!['none','network','validation','storage','unavailable','server'].includes(data.outcome))return null;return {id:data.id,event:data.event,source:data.source,entry:data.entry,stage:data.stage,outcome:data.outcome};}
export async function hash(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('')}
export async function storeApplication(db,data,cfg){
 const normalized=Object.fromEntries(['name','contact','contactMethod','dob','job','readiness','education'].map(k=>[k,data[k].trim()]));
 const payloadHash=await hash(JSON.stringify({...normalized,consentVersion:data.consentVersion}));
 const existing=await db.prepare('SELECT id,payload_hash FROM applications WHERE submission_key=?').bind(data.submissionKey).first();
 if(existing)return existing.payload_hash===payloadHash?{id:existing.id,replayed:true}:{conflict:true};
 const id=crypto.randomUUID(),createdAt=new Date().toISOString();
 // Unique submission key guarantees one application even for concurrent requests.
 await db.batch([
 db.prepare('INSERT INTO applications (id,submission_key,payload_hash,created_at,name,contact,contact_method,dob,job,readiness,education,source,entry,consent_version,consent_text,recipient,status,search_text) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(submission_key) DO NOTHING').bind(id,data.submissionKey,payloadHash,createdAt,normalized.name,normalized.contact,normalized.contactMethod,normalized.dob,normalized.job,normalized.readiness,normalized.education,data.source,data.entry,cfg.consent.version,cfg.consent.text,cfg.recipient,'Новая',[normalized.name,normalized.contact,normalized.education].join(' ').toLocaleLowerCase('ru-RU')),
 db.prepare("INSERT INTO events (id,event,source,entry,stage,outcome,created_at) SELECT id,'application_success',source,entry,'none','none',created_at FROM applications WHERE submission_key=? ON CONFLICT(id) DO NOTHING").bind(data.submissionKey),
 db.prepare("INSERT INTO mail_outbox (application_id,state,attempts,next_attempt_at,lease_until,updated_at) SELECT id,?,0,0,0,created_at FROM applications WHERE submission_key=? ON CONFLICT(application_id) DO NOTHING").bind(cfg.notifications?'pending':'cabinet',data.submissionKey)
 ]);
 const row=await db.prepare('SELECT id,payload_hash FROM applications WHERE submission_key=?').bind(data.submissionKey).first();
 if(!row)throw new Error('write_not_confirmed');
 return row.payload_hash===payloadHash?{id:row.id,replayed:row.id!==id}:{conflict:true};
}

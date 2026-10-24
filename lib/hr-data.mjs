import {JOB_IDS,UUID} from './recruitment.mjs';
export const APP_COLUMNS='a.id,a.created_at,a.name,a.contact,a.contact_method,a.dob,a.job,a.readiness,a.education,a.source,a.entry,a.status,a.consent_version,a.recipient,m.state AS mail_state,m.provider_id,m.attempts,m.last_error,m.updated_at AS mail_updated_at';
const JOIN=' FROM applications a LEFT JOIN mail_outbox m ON m.application_id=a.id';
export function filters(params){const conditions=[],args=[];const job=params.get('job')||'',q=(params.get('q')||'').trim().toLocaleLowerCase('ru-RU').slice(0,120);if(job&&JOB_IDS.includes(job)){conditions.push('a.job=?');args.push(job)}if(q){conditions.push("(instr(a.search_text,?)>0 OR (a.search_text='' AND (instr(lower(a.name),?)>0 OR instr(lower(a.contact),?)>0 OR instr(lower(a.education),?)>0)))");args.push(q,q,q,q)}return{conditions,args,q,job}}
export async function readApplications(db,params,{exportAll=false}={}){
 const id=params.get('id');if(id){if(!UUID.test(id))return{application:null};const application=await db.prepare('SELECT '+APP_COLUMNS+JOIN+' WHERE a.id=?').bind(id).first();return{application}}
 const {conditions,args}=filters(params),where=conditions.length?' WHERE '+conditions.join(' AND '):'';
 const count=await db.prepare('SELECT COUNT(*) n FROM applications a'+where).bind(...args).first();
 const total=await db.prepare('SELECT COUNT(*) n FROM applications').first();
 if(exportAll){if(count.n>10000)throw Object.assign(Error('В выборке больше 10 000 анкет. Выбери направление или уточни поиск для выгрузки.'),{status:413});const all=await db.prepare('SELECT '+APP_COLUMNS+JOIN+where+' ORDER BY a.created_at DESC,a.id DESC').bind(...args).all();return{applications:all.results,total:total.n,matched:count.n}}
 const cursor=params.get('cursor');let c;try{c=JSON.parse(cursor||'null')}catch{};
 const pageConditions=[...conditions],pageArgs=[...args];if(Array.isArray(c)&&c.length===2&&typeof c[0]==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(c[0])&&UUID.test(c[1])){pageConditions.push('(a.created_at<? OR (a.created_at=? AND a.id<?))');pageArgs.push(c[0],c[0],c[1])}
 const pageWhere=pageConditions.length?' WHERE '+pageConditions.join(' AND '):'';
 const rows=(await db.prepare('SELECT '+APP_COLUMNS+JOIN+pageWhere+' ORDER BY a.created_at DESC,a.id DESC LIMIT 51').bind(...pageArgs).all()).results;
 const more=rows.length>50,applications=rows.slice(0,50),last=applications.at(-1);
 return{applications,total:total.n,matched:count.n,next:more?JSON.stringify([last.created_at,last.id]):null};
}

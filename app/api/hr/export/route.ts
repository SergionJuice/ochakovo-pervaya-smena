import {runtime,json,hrAccess} from '../../../../lib/server';
import {readApplications} from '../../../../lib/hr-data.mjs';
import {applicationsWorkbook} from '../../../../lib/excel.mjs';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const {user,authorized}=await hrAccess(req);if(!user)return json({error:'authentication_required',message:'Войди в HR-кабинет, чтобы скачать заявки.'},401);if(!authorized)return json({error:'password_change_required',message:'Сначала установи новый пароль.'},403);
 try{const params=new URL(req.url).searchParams,data=await readApplications(runtime().DB,params,{exportAll:true});if('application' in data&&!data.application)return json({message:'Заявка не найдена.'},404);
 const rows='application' in data?[data.application]:data.applications;const bytes=applicationsWorkbook(rows);const filename=params.has('id')?'ochakovo-application.xlsx':'ochakovo-applications.xlsx';
 return new Response(new Uint8Array(bytes).buffer,{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="'+filename+'"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch(error){const e=error as {status?:number;message?:string};return json({message:e.status===413?e.message:'Не удалось подготовить Excel. Попробуй ещё раз.'},e.status===413?413:503)}
}

import {runtime,json,hrAccess} from '../../../../lib/server';
import {readApplications} from '../../../../lib/hr-data.mjs';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const {user,authorized}=await hrAccess(req);if(!user)return json({error:'authentication_required'},401);if(!authorized)return json({error:'password_change_required'},403);
 try{const db=runtime().DB;if(!db)return json({error:'unavailable'},503);const data=await readApplications(db,new URL(req.url).searchParams);return 'application' in data&&!data.application?json({error:'not_found'},404):json(data)}catch{return json({error:'unavailable',message:'Не удалось загрузить заявки. Обнови список.'},503)}
}

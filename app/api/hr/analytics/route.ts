import { runtime,json,hrAccess } from '../../../../lib/server';
export const dynamic='force-dynamic';
export async function GET(req:Request){const {user,authorized}=await hrAccess(req);if(!user)return json({error:'authentication_required'},401);if(!authorized)return json({error:'access_denied'},403);try{const result=await runtime().DB.prepare('SELECT event,entry,source,stage,outcome,count(*) AS total FROM events GROUP BY event,entry,source,stage,outcome ORDER BY event,entry').all();return json({rows:result.results})}catch{return json({error:'unavailable'},503)}}

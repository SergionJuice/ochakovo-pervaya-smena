import {runtime,json,sameOrigin,readJson} from '../../../../lib/server';
import {changePassword,sessionCookie} from '../../../../lib/hr-auth.mjs';
export const dynamic='force-dynamic';
export async function POST(req:Request){if(!sameOrigin(req))return json({error:'forbidden'},403);try{const env=runtime();const result=await changePassword(env.DB,env,req,await readJson(req,3000));return result.token?json({changed:true},200,{'Set-Cookie':sessionCookie(result.token,req)}):json({message:result.error},result.status)}catch{return json({message:'Не удалось изменить пароль.'},503)}}

import {runtime,json,sameOrigin,readJson} from '../../../../lib/server';
import {login,sessionCookie} from '../../../../lib/hr-auth.mjs';
export const dynamic='force-dynamic';
export async function POST(req:Request){if(!sameOrigin(req))return json({error:'forbidden'},403);try{const env=runtime();if(!env.DB)return json({message:'Вход временно недоступен.'},503);const result=await login(env.DB,env,req,await readJson(req,2000));return result.token?json({mustChange:result.mustChange},200,{'Set-Cookie':sessionCookie(result.token,req)}):json({message:result.error},result.status)}catch{return json({message:'Не удалось войти. Попробуй ещё раз.'},503)}}

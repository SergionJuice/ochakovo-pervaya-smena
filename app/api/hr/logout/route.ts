import {runtime,json,sameOrigin} from '../../../../lib/server';
import {logout,sessionCookie} from '../../../../lib/hr-auth.mjs';
export const dynamic='force-dynamic';
export async function POST(req:Request){if(!sameOrigin(req))return json({error:'forbidden'},403);try{await logout(runtime().DB,req);return json({signedOut:true},200,{'Set-Cookie':sessionCookie('',req,true)})}catch{return json({message:'Не удалось завершить сеанс. Повтори выход.'},503)}}

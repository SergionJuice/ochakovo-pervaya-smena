import { hash } from './recruitment.mjs';
export const HR_COOKIE='ochakovo_hr';
const SESSION_MS=8*60*60*1000;
const enc=new TextEncoder();
export function randomToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')}
export function equal(a='',b=''){if(typeof a!=='string'||typeof b!=='string')return false;let n=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)n|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return n===0}
export async function passwordHash(password,pepper,salt=randomToken()){
 if(!pepper||pepper.length<32)throw Error('auth_not_configured');
 const hmac=await crypto.subtle.importKey('raw',enc.encode(pepper),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const prehash=await crypto.subtle.sign('HMAC',hmac,enc.encode(password));
 const key=await crypto.subtle.importKey('raw',prehash,'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256);
 const digest=Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
 return `pbkdf2-hmac-sha256$100000$${salt}$${digest}`;
}
export async function verifyPassword(password,stored,pepper){if(typeof stored!=='string')return false;const parts=stored.split('$');if(parts.length!==4||parts[0]!=='pbkdf2-hmac-sha256'||parts[1]!=='100000')return false;return equal(await passwordHash(password,pepper,parts[2]),stored)}
export function passwordError(value){return typeof value!=='string'||value.length<12||value.length>128?'Пароль должен содержать от 12 до 128 символов.':null}
export function sessionCookie(token,req,clear=false){const secure=new URL(req.url).protocol==='https:';return `${HR_COOKIE}=${clear?'':token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear?0:SESSION_MS/1000}${secure?'; Secure':''}`}
export function cookieToken(req){const all=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith(HR_COOKIE+'='));return all.length===1?all[0].slice(HR_COOKIE.length+1):''}
export async function authSession(db,req,now=Date.now()){
 const token=cookieToken(req);if(!/^[a-f0-9]{64}$/.test(token))return null;
 return db.prepare('SELECT u.id,u.must_change,u.password_version,s.token_hash,s.expires_at FROM hr_sessions s JOIN hr_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND s.password_version=u.password_version').bind(await hash(token),now).first();
}
async function issueSession(db,user,now){const token=randomToken();await db.prepare('INSERT INTO hr_sessions (token_hash,user_id,password_version,created_at,expires_at) VALUES (?,?,?,?,?)').bind(await hash(token),user.id,user.password_version,now,now+SESSION_MS).run();return token}
export async function login(db,env,req,data,now=Date.now()){
 if(!env.HR_PASSWORD_PEPPER||env.HR_PASSWORD_PEPPER.length<32)return {status:503,error:'Вход временно недоступен.'};
 const ip=req.headers.get('cf-connecting-ip')||'local';const bucket=Math.floor(now/600000);const key=await hash('hr-login:'+ip+':'+bucket);
 const count=await db.prepare('INSERT INTO hr_login_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,(bucket+2)*600000).first();
 await db.prepare('DELETE FROM hr_login_limits WHERE expires_at<?').bind(now).run();
 await db.prepare('DELETE FROM hr_sessions WHERE expires_at<?').bind(now).run();
 if(count.count>8)return {status:429,error:'Слишком много попыток. Попробуй через 10 минут.'};
 const username=typeof data?.username==='string'?data.username.trim():'';const password=data?.password;
 if(typeof password!=='string'||password.length>128||username!=='HR')return {status:401,error:'Не удалось войти. Проверь данные.'};
 let user=await db.prepare('SELECT * FROM hr_users WHERE id=?').bind('HR').first();
 if(!user){
  if(!equal(password,'HR'))return {status:401,error:'Не удалось войти. Проверь данные.'};
  const hashed=await passwordHash('HR',env.HR_PASSWORD_PEPPER);
  await db.prepare('INSERT INTO hr_users (id,password_hash,must_change,password_version,updated_at) VALUES (?,?,1,1,?) ON CONFLICT(id) DO NOTHING').bind('HR',hashed,new Date(now).toISOString()).run();
  user=await db.prepare('SELECT * FROM hr_users WHERE id=?').bind('HR').first();
 }
 // Initial credentials issue a restricted session: only password change / logout.
 if(!await verifyPassword(password,user.password_hash,env.HR_PASSWORD_PEPPER))return {status:401,error:'Не удалось войти. Проверь данные.'};
 return {status:200,token:await issueSession(db,user,now),mustChange:!!user.must_change};
}
export async function changePassword(db,env,req,data,now=Date.now()){
 const session=await authSession(db,req,now);if(!session)return {status:401,error:'Войди в кабинет.'};
 const bucket=Math.floor(now/600000),rateKey=await hash('hr-password:'+session.id+':'+bucket);const rate=await db.prepare('INSERT INTO hr_login_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(rateKey,(bucket+2)*600000).first();if(rate.count>8)return {status:429,error:'Слишком много попыток. Попробуй через 10 минут.'};
 const error=passwordError(data?.newPassword);if(error)return {status:422,error};
 if(data.newPassword!==data.confirmPassword)return {status:422,error:'Пароли не совпадают.'};
 if(typeof data.currentPassword!=='string'||data.currentPassword.length>128)return {status:422,error:'Укажи текущий пароль.'};
 const user=await db.prepare('SELECT * FROM hr_users WHERE id=?').bind(session.id).first();
 if(!await verifyPassword(data.currentPassword,user.password_hash,env.HR_PASSWORD_PEPPER))return {status:403,error:'Текущий пароль указан неверно.'};
 if(equal(data.currentPassword,data.newPassword))return {status:422,error:'Новый пароль должен отличаться от текущего.'};
 const hashed=await passwordHash(data.newPassword,env.HR_PASSWORD_PEPPER);
 const updated=await db.prepare('UPDATE hr_users SET password_hash=?,must_change=0,password_version=password_version+1,updated_at=? WHERE id=? AND password_version=? RETURNING password_version').bind(hashed,new Date(now).toISOString(),session.id,session.password_version).first();
 if(!updated)return {status:409,error:'Пароль уже изменён. Войди снова.'};
 await db.prepare('DELETE FROM hr_sessions WHERE user_id=?').bind(session.id).run();
 return {status:200,token:await issueSession(db,{id:session.id,password_version:updated.password_version},now)};
}
export async function logout(db,req){const token=cookieToken(req);if(token)await db.prepare('DELETE FROM hr_sessions WHERE token_hash=?').bind(await hash(token)).run()}
export async function hrReady(db){if(!db)return false;try{const r=await db.prepare('SELECT must_change FROM hr_users WHERE id=?').bind('HR').first();return !!r&&!r.must_change}catch{return false}}

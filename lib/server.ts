import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
import { authSession } from './hr-auth.mjs';
export function runtime(){return env as unknown as Record<string,any>}
export function json(body:unknown,status=200,extra:Record<string,string>={}){return Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}})}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin}
export async function readJson(req:Request,max=12000){if(!req.headers.get('content-type')?.startsWith('application/json'))throw new Error('type');if(Number(req.headers.get('content-length')||0)>max)throw new Error('size');const raw=await req.text();if(new TextEncoder().encode(raw).length>max)throw new Error('size');return JSON.parse(raw)}
export async function hrAccess(req?:Request){try{const request=req||new Request('https://local.invalid',{headers:await headers()});const user=runtime().DB?await authSession(runtime().DB,request):null;return {user,authorized:!!user&&!user.must_change}}catch{return {user:null,authorized:false}}}

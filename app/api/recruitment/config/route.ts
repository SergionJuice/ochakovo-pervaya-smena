import { runtime,json } from '../../../../lib/server';
import { config } from '../../../../lib/recruitment.mjs';
export const dynamic='force-dynamic';
export async function GET(){const env=runtime(),c=config(env),active=c.active&&!!env.DB;return json({mode:active?'server':'unavailable',recipient:active?c.recipient:null,consent:active?c.consent:null,delivery: c.notifications?'email':'cabinet',analytics:true})}

import {hrAccess,json} from '../../../../lib/server';
export const dynamic='force-dynamic';
export async function GET(req:Request){const {user,authorized}=await hrAccess(req);return json({authenticated:!!user,mustChange:!!user?.must_change,authorized},user?200:401)}

import { sourceSummary } from '../../lib/catalog.mjs';
export default async req => {
  if(req.method!=='GET' && req.method!=='HEAD') return new Response('Method not allowed',{status:405});
  const {snapshotDate,corpusSha256,sources}=sourceSummary();
  return new Response(req.method==='HEAD'?null:JSON.stringify({status:'ok',service:'teacher-growth-knowledge',version:'0.1.0',snapshotDate,corpusSha256,items:sources.reduce((n,s)=>n+s.itemCount,0)}),
    {headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
};
export const config = {path:'/health'};

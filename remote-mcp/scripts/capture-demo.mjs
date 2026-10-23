import {writeFile,mkdir} from 'node:fs/promises';
const base='https://teacher-growth-knowledge.netlify.app';
async function call(name,args){const r=await fetch(base+'/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})});if(!r.ok)throw Error(r.status);return (await r.json()).result;}
const search=await call('search_checklist_items',{query:'เด็กเงียบ',family:'classroom',limit:2});
const read=await call('get_checklist_items',{ids:search.structuredContent.results.map(x=>x.id)});
const ai=await call('get_checklist_items',{ids:['AI-P1-09','AI-P2-17']});
const missing=await call('get_checklist_items',{ids:['CL-P1-99']});
const reject=await call('delete_file',{});
const data={capturedAt:new Date().toISOString(),base,search,read,ai,missing,reject};
await mkdir(new URL('../artifacts/demo/',import.meta.url),{recursive:true});
await writeFile(new URL('../artifacts/demo/live-demo-data.json',import.meta.url),JSON.stringify(data,null,2));
console.log('Captured 5 actual public MCP responses');

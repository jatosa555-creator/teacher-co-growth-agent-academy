import assert from 'node:assert/strict';
import {writeFile, mkdir} from 'node:fs/promises';
const base = process.argv[2];
if (!base || new URL(base).protocol !== 'https:') throw Error('Actual HTTPS base URL required');
const reports=[];
async function check(name, fn){await fn(); reports.push({name,status:'pass'});}
const headers={'content-type':'application/json',accept:'application/json, text/event-stream'};
async function rpc(method,params){const r=await fetch(base+'/mcp',{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:1,method,...(params?{params}:{})}),signal:AbortSignal.timeout(30000)}); assert.equal(r.status,200); return r.json();}
async function call(name,args){const j=await rpc('tools/call',{name,arguments:args}); return j.result;}
const health=await (await fetch(base+'/health',{signal:AbortSignal.timeout(30000)})).json();
await check('public HTTPS health and pinned corpus',async()=>{assert.equal(health.status,'ok');assert.equal(health.items,138);assert.equal(health.corpusSha256,'b2ddca43e1b760682c2d53b09d2c648e1535d1d250de636262e2a23c82a23cc6');});
await check('initialize',async()=>{const j=await rpc('initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'release-verification',version:'1'}});assert.equal(j.result.serverInfo.name,'teacher-growth-knowledge');});
await check('exactly three read-only tools',async()=>{const j=await rpc('tools/list');assert.equal(j.result.tools.length,3);for(const t of j.result.tools){assert.equal(t.annotations.readOnlyHint,true);assert.equal(t.annotations.destructiveHint,false);}});
await check('Thai topic search then exact source read',async()=>{const r=await call('search_checklist_items',{query:'เด็กเงียบ',family:'classroom',limit:3});assert.ok(r.structuredContent.results.length);const ids=r.structuredContent.results.map(x=>x.id);const read=await call('get_checklist_items',{ids});assert.equal(read.structuredContent.items.length,ids.length);for(const i of read.structuredContent.items)assert.ok(i.citation.includes('page='+i.page));});
await check('two AI items retain exact source pages',async()=>{const r=await call('get_checklist_items',{ids:['AI-P1-09','AI-P2-17']});assert.deepEqual(r.structuredContent.items.map(x=>[x.id,x.page]),[['AI-P1-09',1],['AI-P2-17',3]]);});
await check('AI family and pillar filter',async()=>{const r=await call('search_checklist_items',{query:'community portfolio',family:'ai',pillar:4});assert.ok(r.structuredContent.results.length);assert.ok(r.structuredContent.results.every(x=>x.family==='ai'&&x.pillar===4));});
await check('source manifest returned',async()=>{const r=await call('list_checklist_sources',{});assert.ok(!r.isError);});
await check('missing ID does not fabricate an item',async()=>{const r=await call('get_checklist_items',{ids:['CL-P1-99']});assert.equal(r.structuredContent.found,false);assert.deepEqual(r.structuredContent.items,[]);assert.deepEqual(r.structuredContent.missingIds,['CL-P1-99']);});
await check('unsupported write tool rejected',async()=>{const r=await call('delete_file',{});assert.equal(r.isError,true);});
await check('arbitrary path and oversized query rejected',async()=>{for(const [name,args] of [['get_checklist_items',{ids:['../private.txt']}],['search_checklist_items',{query:'x'.repeat(161)}]]){const r=await call(name,args);assert.equal(r.isError,true);}});
await check('GET MCP and untrusted Origin rejected',async()=>{const g=await fetch(base+'/mcp');assert.equal(g.status,405);const o=await fetch(base+'/mcp',{method:'OPTIONS',headers:{origin:'https://untrusted.example'}});assert.equal(o.status,403);});
const report={verifiedAt:new Date().toISOString(),base,health,checks:reports,limitations:['Protocol/server checks only; not model behavior, native installation, free-account access or teacher-outcome evidence.']};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
await writeFile(new URL('../artifacts/live-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));

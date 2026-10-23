import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleMcp } from '../lib/server.mjs';
import health from '../netlify/functions/health.mjs';

const root=fileURLToPath(new URL('../public/',import.meta.url));
const port=Number(process.env.PORT || 8770);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const security={'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'"};
const app=createServer(async(req,res)=>{
  const url=new URL(req.url,`http://127.0.0.1:${port}`);
  try {
    if(url.pathname==='/mcp'||url.pathname==='/health') {
      let size=0;const chunks=[];
      for await(const part of req){size+=part.length;if(size>16384){res.writeHead(413);res.end('Payload too large');return;}chunks.push(part);}
      const request=new Request(url,{method:req.method,headers:req.headers,...(req.method==='GET'||req.method==='HEAD'?{}:{body:Buffer.concat(chunks)})});
      const response=await(url.pathname==='/mcp'?handleMcp(request):health(request));
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    const pathname=decodeURIComponent(url.pathname);
    const path=resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
    if(!path.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(path);
    res.writeHead(200,{...security,'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404);res.end('Not found');}
});
app.listen(port,'127.0.0.1',()=>console.log(`Teacher Growth MCP + website: http://127.0.0.1:${port}`));

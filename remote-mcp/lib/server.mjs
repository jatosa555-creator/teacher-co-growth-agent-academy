import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import { sourceSummary, getItems, searchItems } from './catalog.mjs';

const family = z.enum(['classroom','ai']).optional().describe('classroom for Classroom V8; ai for responsible AI and future pathways. Omit to search both; do not merge their scores.');
const annotations = { readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false };
const result = data => ({ content:[{ type:'text', text:JSON.stringify(data) }], structuredContent:data });

export function buildServer() {
  const server = new McpServer({ name:'teacher-growth-knowledge', version:'0.1.0' }, {
    instructions:'Read-only project checklist library. Use short topic keywords, never student names, full lesson plans or private records. Search, read selected exact items, then connect 2–3 criteria to teacher-provided evidence. Cite the returned item/page links. Evidence suggestions are not marks or validated scores. This is a dated snapshot, not live Drive access.'
  });
  server.registerTool('search_checklist_items', {
    title:'Find relevant teacher checklist items',
    description:'Search the project’s dated Classroom Practical Checklist V8 and AI Teacher Practice Checklist. Use short Thai/English topic keywords to find 2–3 relevant original items with source IDs and pages. Read selected IDs before applying criteria. Read-only public library; do not send lesson text or personal data.',
    inputSchema:z.strictObject({ query:z.string().trim().min(1).max(160).describe('Short topic keywords, e.g. เด็กเงียบ หมุนบทบาท or community portfolio; no names or full lesson text.'), family,
      pillar:z.number().int().min(1).max(4).optional().describe('Optional source pillar 1–4.'), limit:z.number().int().min(1).max(6).default(3).describe('Maximum search hits, default 3; read only selected items.') }), annotations
  }, async args => result(searchItems(args)));
  server.registerTool('get_checklist_items', {
    title:'Read exact source items and citations',
    description:'Read 1–6 checklist IDs returned by search. Returns complete original item text, exact PDF page, source URL, snapshot date and literal Markdown citation. Missing IDs return no invented item. Evidence suggestions are labeled separately from reflection prompts; no teacher grading or classroom outcome claims.',
    inputSchema:z.strictObject({ ids:z.array(z.string().regex(/^(CL|AI)-P[1-4]-\d{2}$/)).min(1).max(6).refine(x => new Set(x).size===x.length,'IDs must be unique').describe('Selected project item IDs such as CL-P1-02 or AI-P2-17; never file paths or URLs.') }), annotations
  }, async ({ids}) => result(getItems(ids)));
  server.registerTool('list_checklist_sources', {
    title:'Inspect checklist source versions',
    description:'List the two project-provided source documents, original Drive links, snapshot date, PDF fingerprints and counts of reflection/evidence items. Use to check provenance and coverage. Does not browse Drive or establish a newer version.',
    inputSchema:z.strictObject({ family }), annotations
  }, async ({family}) => result(sourceSummary(family)));
  return server;
}

const webOrigins = new Set(['https://chatgpt.com','https://chat.openai.com','https://platform.openai.com']);
export async function handleMcp(req) {
  const origin = req.headers.get('origin');
  const ownOrigin = new URL(req.url).origin;
  if (origin && origin !== ownOrigin && !webOrigins.has(origin)) return new Response('Origin not allowed',{status:403});
  const headers = { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Vary':'Origin' };
  if (origin) Object.assign(headers, { 'Access-Control-Allow-Origin':origin, 'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id', 'Access-Control-Expose-Headers':'MCP-Protocol-Version, MCP-Session-Id' });
  if (req.method==='OPTIONS') return new Response(null,{status:204,headers});
  if (req.method!=='POST') return new Response('Method not allowed',{status:405,headers:{...headers,Allow:'POST, OPTIONS'}});
  // Authentication intentionally omitted: only the owner-approved public
  // checklist snapshot is served. There are no user accounts or private tools.
  const server=buildServer();
  const transport=new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator:undefined, enableJsonResponse:true, maxRequestBodySize:16384 });
  try {
    await server.connect(transport);
    const response=await transport.handleRequest(req);
    for (const [key,value] of Object.entries(headers)) response.headers.set(key,value);
    return response;
  } catch {
    // Never log arguments, user content, tokens or request bodies.
    return new Response('MCP request failed',{status:500,headers});
  } finally {
    await server.close();
  }
}

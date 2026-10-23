import test from 'node:test';
import assert from 'node:assert/strict';
import { handleMcp } from '../lib/server.mjs';

const endpoint = 'https://mcp.test/';
const headers = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' };

async function rpc(method, params, id = 1) {
  const response = await handleMcp(new Request(endpoint, {
    method: 'POST', headers,
    body: JSON.stringify({ jsonrpc: '2.0', id, method, ...(params === undefined ? {} : { params }) })
  }));
  return { response, body: await response.json() };
}

async function tool(name, args) {
  const { response, body } = await rpc('tools/call', { name, arguments: args });
  assert.equal(response.status, 200);
  return body.result;
}

test('initializes MCP and advertises exactly three read-only tools', async () => {
  const init = await rpc('initialize', {
    protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'handler-test', version: '1' }
  });
  assert.equal(init.response.status, 200);
  assert.equal(init.body.result.serverInfo.name, 'teacher-growth-knowledge');
  assert.ok(init.body.result.capabilities.tools);

  const listed = await rpc('tools/list');
  const tools = listed.body.result.tools;
  assert.deepEqual(tools.map(x => x.name).sort(), [
    'get_checklist_items', 'list_checklist_sources', 'search_checklist_items'
  ]);
  for (const item of tools) {
    assert.equal(item.annotations.readOnlyHint, true);
    assert.equal(item.annotations.destructiveHint, false);
    assert.equal(item.annotations.openWorldHint, false);
  }
});

test('searches Thai and English and applies family and pillar filters', async () => {
  const thai = await tool('search_checklist_items', { query: 'เด็กเงียบ' });
  assert.ok(thai.structuredContent.results.some(x => x.family === 'classroom'));

  const english = await tool('search_checklist_items', { query: 'community portfolio', family: 'ai' });
  assert.ok(english.structuredContent.results.length > 0);
  assert.ok(english.structuredContent.results.every(x => x.family === 'ai'));

  const pillar = await tool('search_checklist_items', { query: 'community', family: 'ai', pillar: 4 });
  assert.ok(pillar.structuredContent.results.length > 0);
  assert.ok(pillar.structuredContent.results.every(x => x.family === 'ai' && x.pillar === 4));

  const absent = await tool('search_checklist_items', { query: 'quartz submarine orchestra' });
  assert.equal(absent.structuredContent.totalMatches, 0);
  assert.deepEqual(absent.structuredContent.results, []);
});

test('reads exact item and page citation; unknown ID is reported without fabricated item', async () => {
  const read = await tool('get_checklist_items', { ids: ['AI-P2-17'] });
  const item = read.structuredContent.items[0];
  assert.equal(read.structuredContent.found, true);
  assert.equal(item.id, 'AI-P2-17');
  assert.equal(item.page, 3);
  assert.match(item.citation, /AI-P2-17/);
  assert.match(item.citation, /page=3/);

  const missing = await tool('get_checklist_items', { ids: ['AI-P2-99'] });
  assert.equal(missing.structuredContent.found, false);
  assert.deepEqual(missing.structuredContent.missingIds, ['AI-P2-99']);
  assert.deepEqual(missing.structuredContent.items, []);
});

test('rejects malformed, duplicate, unknown-field, too-long, and out-of-range inputs', async () => {
  const invalidCalls = [
    ['get_checklist_items', { ids: ['AI-P2-17', 'AI-P2-17'] }],
    ['get_checklist_items', { ids: ['../private.txt'] }],
    ['get_checklist_items', { ids: ['AI-P2-17'], path: 'private.txt' }],
    ['search_checklist_items', { query: 'x'.repeat(161) }],
    ['search_checklist_items', { query: 'community', limit: 0 }],
    ['search_checklist_items', { query: 'community', mystery: true }],
    ['list_checklist_sources', { family: 'unknown' }]
  ];
  for (const [name, args] of invalidCalls) {
    const result = await tool(name, args);
    assert.equal(result.isError, true, `${name} should reject ${JSON.stringify(args)}`);
  }
});

test('unknown and delete-like tools fail as MCP tool errors', async () => {
  for (const name of ['unknown_tool', 'delete_file']) {
    const result = await tool(name, {});
    assert.equal(result.isError, true);
  }
});

test('HTTP boundary handles malformed JSON, unsupported methods, CORS, and body size', async () => {
  const malformed = await handleMcp(new Request(endpoint, { method: 'POST', headers, body: '{' }));
  assert.ok([400, 500].includes(malformed.status));

  const get = await handleMcp(new Request(endpoint, { method: 'GET' }));
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('allow'), 'POST, OPTIONS');

  const blocked = await handleMcp(new Request(endpoint, {
    method: 'OPTIONS', headers: { origin: 'https://attacker.example' }
  }));
  assert.equal(blocked.status, 403);

  const preflight = await handleMcp(new Request(endpoint, {
    method: 'OPTIONS', headers: { origin: 'https://chatgpt.com' }
  }));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://chatgpt.com');

  const oversized = await handleMcp(new Request(endpoint, {
    method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'tools/list', padding: 'x'.repeat(17000) })
  }));
  assert.equal(oversized.status, 413);
});

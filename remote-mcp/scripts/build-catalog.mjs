import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const product = fileURLToPath(new URL('../../', import.meta.url));
const remote = fileURLToPath(new URL('../', import.meta.url));
const sha = value => createHash('sha256').update(value).digest('hex');
const receipt = JSON.parse(await readFile(resolve(product, 'tests/checklist-source-receipts.json'), 'utf8'));
const sources = [];
const items = [];
for (const source of receipt.sources) {
  const family = source.prefix === 'CL' ? 'classroom' : 'ai';
  const stem = family === 'classroom' ? 'classroom-v8' : 'ai-practice';
  const texts = new Map();
  for (let pillar = 1; pillar <= 4; pillar++) {
    const text = (await readFile(resolve(product, `plugin/skills/teacher-growth/references/${stem}-p${pillar}.md`), 'utf8')).replaceAll('\r\n', '\n');
    const pattern = /^### ((?:CL|AI)-P[1-4]-\d{2})\n\n(.*?)\n\nที่มา: \[PDF หน้า (\d+)\]\(([^)]+)\) · (.*?) · ประเภท: (reflection|evidence)\n/gms;
    for (const m of text.matchAll(pattern)) {
      if (texts.has(m[1])) throw new Error('Duplicate source item');
      texts.set(m[1], { text: m[2], page: Number(m[3]), url: m[4], section: m[5], kind: m[6] });
    }
  }
  if (texts.size !== source.checkboxCount) throw new Error('Incomplete source snapshot');
  for (const item of source.items) {
    const found = texts.get(item.id);
    if (!found || sha(found.text) !== item.textSha256 || found.page !== item.page || found.kind !== item.kind || found.url !== `${source.url}#page=${item.page}`) throw new Error(`Unverified source item ${item.id}`);
    items.push({ id: item.id, family, pillar: item.pillar, ...found, sourceTitle: source.family,
      sourceModified: source.modifiedTime, sourcePdfSha256: source.pdfSha256,
      textSha256: item.textSha256, snapshotDate: receipt.snapshotDate,
      citation: `[${item.id} · หน้า ${item.page}](${found.url})`, coverage: 'full_item' });
  }
  sources.push({ family, title: source.family, url: source.url, modifiedTime: source.modifiedTime,
    pdfSha256: source.pdfSha256, snapshotDate: receipt.snapshotDate, pages: source.pages,
    itemCount: source.checkboxCount, reflectionCount: source.items.filter(x => x.kind === 'reflection').length,
    evidenceCount: source.items.filter(x => x.kind === 'evidence').length, perPillar: source.perPillar });
}
if (items.length !== 138 || new Set(items.map(x => x.id)).size !== 138) throw new Error('Wrong corpus inventory');
const catalog = { snapshotDate: receipt.snapshotDate, corpusSha256: sha(JSON.stringify(items)), sources, items };
await mkdir(resolve(remote, 'data'), { recursive: true });
await writeFile(resolve(remote, 'data/catalog.mjs'), '// Generated from verified source Markdown. Do not edit by hand.\nexport default '+JSON.stringify(catalog, null, 2)+';\n');
console.log(`Catalog: ${items.length} verified items; ${catalog.corpusSha256}`);

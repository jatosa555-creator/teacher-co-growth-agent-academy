import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parseSourceItems } from '../lib/source-parser.mjs';

test('LF and Windows CRLF preserve every source item, exact text, type and locator',async()=>{
  const receipts=JSON.parse(await readFile(new URL('../../tests/checklist-source-receipts.json',import.meta.url),'utf8'));
  let count=0;
  for(const source of receipts.sources){
    const stem=source.prefix==='CL'?'classroom-v8':'ai-practice';
    for(let p=1;p<=4;p++){
      const text=await readFile(new URL(`../../plugin/skills/teacher-growth/references/${stem}-p${p}.md`,import.meta.url),'utf8');
      const lf=text.replaceAll('\r\n','\n');
      const a=parseSourceItems(lf),b=parseSourceItems(lf.replaceAll('\n','\r\n'));
      assert.deepEqual(a,b);
      const expected=source.items.filter(x=>x.pillar===p);
      assert.equal(a.length,expected.length);
      for(const item of a){
        const receipt=expected.find(x=>x.id===item.id);
        assert.ok(receipt);assert.equal(item.page,receipt.page);assert.equal(item.kind,receipt.kind);
        assert.equal(item.url,`${source.url}#page=${receipt.page}`);
        assert.equal(createHash('sha256').update(item.text).digest('hex'),receipt.textSha256);
        count++;
      }
    }
  }
  assert.equal(count,138);
});

"""Rebuild the pinned references from owner-selected PDFs, never from live URLs.

Requires PyMuPDF only for this authoring step. Runtime Skills need Markdown only.
Usage: python build_checklist_references.py --source-dir PATH
The source directory must contain source-0.pdf, source-1.pdf and matching .json
metadata saved from the selected Drive reads. Original PDFs are not distributed.
"""
from pathlib import Path
import argparse, hashlib, json, re
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT/'plugin/skills/teacher-growth/references'

def clean(text):
    text = re.sub(r'\s+', ' ', text).strip()
    # Repair only the Thai sara-am spacing artifact found in these PDF fonts.
    return re.sub(r'([ก-ฮ][่้๊๋]?) า', r'\1ำ', text)

def digest(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def is_heading(text):
    return bool(re.match(r'^(?:Self-check|Adaptive &|Before learning|During learning|When stuck|After learning|[A-D]\. |[1-4]\.[1-3] |หลักฐานที่ควรเก็บ|จุดมุ่งเน้น|5 องค์ประกอบ|[1-5]\. การ|START |LEARNING SUPPORT |APPLY |RETURN |\()',text))

def build(source_dir):
    receipt = {'snapshotDate':'2026-10-23','conversionVersion':1,'sources':[]}
    for i, prefix, stem, family in [(0,'CL','classroom-v8','Classroom Practical Checklist V8'),(1,'AI','ai-practice','AI Teacher Practice Checklist')]:
        source=source_dir/f'source-{i}.pdf'
        meta=json.loads((source_dir/f'source-{i}.json').read_text(encoding='utf-8'))
        doc=pymupdf.open(source)
        blocks={n:[] for n in range(1,5)}
        items=[]; counters={n:0 for n in range(1,5)}
        pillar=None; section='บทนำ'; pending=None; preamble=[]
        def flush():
            nonlocal pending
            if not pending: return
            pending['text']=clean(' '.join(pending.pop('lines')))
            pending['textSha256']=digest(pending['text'])
            items.append(pending)
            url=meta['url']+'#page='+str(pending['page'])
            blocks[pending['pillar']].append('### '+pending['id']+'\n\n'+pending['text']+'\n\n'+'ที่มา: [PDF หน้า '+str(pending['page'])+']('+url+') · '+pending['section']+' · ประเภท: '+pending['kind']+'\n')
            pending=None
        for page_number,page in enumerate(doc,1):
            # The image-only practical guide on Classroom page 5 is transcribed
            # and reviewed separately, not silently counted as a blank page.
            if i==0 and page_number==5: continue
            flush()
            for raw in page.get_text().splitlines():
                line=raw.strip()
                if not line: continue
                match=re.match(r'^(?:\d\) )?Pillar ([1-4]):',line)
                if match:
                    flush();pillar=int(match[1]);section='บทนำ'
                    blocks[pillar].append('## '+clean(line)+'\n');continue
                if line.startswith('□'):
                    flush()
                    if pillar is None: raise ValueError('Checkbox before pillar')
                    counters[pillar]+=1
                    pending={'id':f'{prefix}-P{pillar}-{counters[pillar]:02d}','pillar':pillar,'page':page_number,'section':section,'kind':'evidence' if section.startswith('หลักฐานที่ควรเก็บ') else 'reflection','lines':[line[1:].strip()]}
                elif is_heading(line):
                    flush();section=clean(line)
                    (blocks[pillar] if pillar else preamble).append('#### '+section+'\n')
                elif pending:
                    pending['lines'].append(line)
                else:
                    (blocks[pillar] if pillar else preamble).append(clean(line)+'\n')
            flush()
        for n in range(1,5):
            filename=f'{stem}-p{n}.md'
            header=f'# {family} — Pillar {n}\n\nต้นฉบับ: [{meta["title"]}]({meta["url"]})\n\nSnapshot: 2026-10-23 · Drive modified: {meta["modified_time"]} · PDF SHA-256: `{hashlib.sha256(source.read_bytes()).hexdigest()}`\n\nฉบับจัดโครงสร้างจากต้นฉบับที่เจ้าของโครงการเลือก: รักษารายการและลำดับเดิม รวมบรรทัดและแก้เฉพาะช่องว่างสระอำจากการสกัด PDF รหัส CL/AI เพิ่มเพื่ออ้างอิง ไม่ใช่รหัสหรือคะแนนของต้นฉบับ ข้อความคำแนะนำของระบบอยู่ใน checklist-use.md แยกจากรายการต่อไปนี้\n\n'
            if n==1: header+='## บริบทต้นฉบับ\n\n'+'\n'.join(preamble)+'\n'
            (REF/filename).write_text(header+'\n'.join(blocks[n]),encoding='utf-8')
        expected=sum(p.get_text().count('□') for p in doc)
        if len(items)!=expected: raise ValueError(f'Coverage mismatch {prefix}: {len(items)}/{expected}')
        receipt['sources'].append({'family':family,'prefix':prefix,'url':meta['url'],'modifiedTime':meta['modified_time'],'pdfSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'pages':len(doc),'checkboxCount':len(items),'perPillar':counters,'items':[{k:v for k,v in item.items() if k!='text'} for item in items]})
        print(prefix, len(items), counters)
    (ROOT/'tests/checklist-source-receipts.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--source-dir',type=Path,required=True)
    build(parser.parse_args().source_dir)

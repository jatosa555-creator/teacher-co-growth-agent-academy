"""Verify pinned Markdown against receipts and optionally the original PDFs.

Default: stdlib only. --source-dir additionally uses pypdf, an independent
extractor from the PyMuPDF authoring step. Does not validate instrument efficacy.
"""
from pathlib import Path
import argparse, hashlib, json, re

ROOT=Path(__file__).resolve().parents[1]
REF=ROOT/'plugin/skills/teacher-growth/references'

def compact(text):
    text=re.sub(r'([ก-ฮ][่้๊๋]?) า',r'\1ำ',text)
    return re.sub(r'\s+','',text)

def validate(source_dir=None):
    receipt=json.loads((ROOT/'tests/checklist-source-receipts.json').read_text(encoding='utf-8'))
    seen=set();total=0
    for source in receipt['sources']:
        prefix=source['prefix'];stem='classroom-v8' if prefix=='CL' else 'ai-practice'
        parsed={};documents={}
        for n in range(1,5):
            text=(REF/f'{stem}-p{n}.md').read_text(encoding='utf-8')
            documents[n]=text
            for match in re.finditer(r'^### ((?:CL|AI)-P([1-4])-\d{2})\n\n(.*?)\n\nที่มา: \[PDF หน้า (\d+)\]\(([^)]+)\) · (.*?) · ประเภท: (reflection|evidence)\n',text,re.M|re.S):
                item_id,pillar,body,page,url,section,kind=match.groups()
                assert item_id not in seen, 'Duplicate ID '+item_id
                assert int(pillar)==n,'Wrong pillar '+item_id
                assert not re.search(r'^###? |^#### ',body,re.M),'Section swallowed into item '+item_id
                seen.add(item_id)
                parsed[item_id]={'text':body,'page':int(page),'url':url,'section':section,'kind':kind}
        assert len(parsed)==source['checkboxCount'], 'Coverage count mismatch '+prefix
        assert set(parsed)=={x['id'] for x in source['items']},'ID inventory mismatch '+prefix
        for item in source['items']:
            actual=parsed[item['id']]
            assert hashlib.sha256(actual['text'].encode('utf-8')).hexdigest()==item['textSha256'],'Text changed '+item['id']
            assert actual['page']==item['page'] and actual['section']==item['section'] and actual['kind']==item['kind'],'Locator/type mismatch '+item['id']
            assert actual['url']==source['url']+'#page='+str(item['page']),'Source URL mismatch '+item['id']
            assert source['pdfSha256'] in documents[item['pillar']],'Missing source fingerprint'
        if source_dir:
            from pypdf import PdfReader
            path=source_dir/('source-0.pdf' if prefix=='CL' else 'source-1.pdf')
            assert hashlib.sha256(path.read_bytes()).hexdigest()==source['pdfSha256'],'Original PDF fingerprint changed'
            pages=[page.extract_text() or '' for page in PdfReader(path).pages]
            assert len(pages)==source['pages'],'Page count mismatch'
            assert sum(p.count('□') for p in pages)==len(parsed),'Original checkbox count differs'
            for item in source['items']:
                assert compact(parsed[item['id']]['text']) in compact(pages[item['page']-1]),'Original PDF text mismatch '+item['id']
        kinds={kind:sum(x['kind']==kind for x in source['items']) for kind in ['reflection','evidence']}
        print(f'PASS {prefix}: {len(parsed)} unique items, {kinds}, correct locators and text hashes')
        total+=len(parsed)
    # Check references are reachable; this does not claim a host actually loads them.
    for path in REF.glob('*.md'):
        for target in re.findall(r'\]\(([^)]+\.md)\)',path.read_text(encoding='utf-8')):
            assert (path.parent/target).is_file(),'Broken Markdown reference '+target
    guide=(REF/'classroom-v8-guide.md').read_text(encoding='utf-8')
    for code in ['BEFORE','DURING','STUCK','AFTER']:
        assert f'CL-GUIDE-{code}' in guide,'Missing image guide stage'
    assert total==138,'Unexpected pinned snapshot count'
    print('PASS: 138 items and four image-guide stages; links resolve locally')
    if source_dir: print('PASS: all item text found on its claimed PDF page using independent pypdf extraction')
    print('Not measured: native host access, learning outcomes, score validity or publication approval')

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--source-dir',type=Path)
    validate(parser.parse_args().source_dir)

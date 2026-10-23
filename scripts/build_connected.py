"""Build a NEW connected plugin from canonical skills after live verification.
Requires an actual endpoint and reviewer-accessible demo URL. Does not upload.
"""
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import argparse, hashlib, json, zipfile

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('--endpoint', required=True)
p.add_argument('--demo-url', required=True)
a = p.parse_args()
for value in [a.endpoint, a.demo_url]:
    u = urlparse(value)
    if u.scheme != 'https' or not u.hostname or u.username or u.password or u.hostname in {'example.com','localhost'}:
        p.error('Supply actual HTTPS URLs without credentials.')
if urlparse(a.endpoint).path != '/mcp':
    p.error('Expected the verified /mcp endpoint.')
base = a.endpoint.rsplit('/mcp', 1)[0]
with urlopen(base + '/health', timeout=30) as r:
    health = json.load(r)
if health.get('items') != 138 or health.get('status') != 'ok':
    raise SystemExit('Health response does not match the expected corpus.')
req = Request(a.endpoint, method='POST', headers={'Content-Type':'application/json','Accept':'application/json, text/event-stream'}, data=json.dumps({'jsonrpc':'2.0','id':1,'method':'tools/list'}).encode())
with urlopen(req, timeout=30) as r:
    names = {t['name'] for t in json.load(r)['result']['tools']}
if names != {'search_checklist_items','get_checklist_items','list_checklist_sources'}:
    raise SystemExit('Live tools do not match the package.')
files = {f.relative_to(ROOT/'plugin').as_posix(): f.read_bytes() for f in (ROOT/'plugin').rglob('*') if f.is_file() and '__pycache__' not in f.parts}
m = json.loads(files['plugin.json'])
m['name'] = 'teacher-growth-partner-connected'
m['version'] = '1.3.0'
m['description'] = 'Thai-first lesson improvement and reflection with source-backed Classroom V8 and AI Practice checklist retrieval.'
repo = 'https://github.com/jatosa555-creator/teacher-co-growth-agent-academy'
m['author'] = {'name':'CHANON PHAJUNDA','url':repo}
m['homepage'] = repo
m['repository'] = repo
o = m['extensions']['com.openai']
i = o['interface']
i.update(developerName='CHANON PHAJUNDA',websiteURL=repo,supportURL=repo+'/issues',privacyPolicyURL=repo+'/blob/main/docs/privacy.md',termsOfServiceURL=repo+'/blob/main/docs/terms.md')
i['capabilities'] = ['Improve an existing lesson','Read source-backed checklist items','Reflect on classroom evidence','Draft reusable teacher workflows']
i['longDescription'] = 'Teacher Growth Partner helps teachers improve an existing lesson, reflect on classroom evidence, and draft reusable teaching workflows in Thai. A public read-only MCP searches and reads 138 approved checklist entries from Classroom Practical Checklist V8 and AI Teacher Practice Checklist, with item IDs, exact source-page links and a dated snapshot. It selects relevant criteria, connects them to teacher-supplied evidence, and checks requested constraints before delivering a draft.\n\nPart of Teacher Co-Growth Agent Academy. Teachers choose changes and review drafts before classroom use. The MCP reads only the curated public library; it does not connect to private Google Drive, GitHub or school databases. Search queries should contain generic teaching topics, never student identifiers. Packaged Markdown provides a dated fallback when the connection is unavailable. No cross-chat memory, automatic monitoring, formal teacher rating or verified learner outcome is provided. Original Drive links may require source-owner permission.'
cases = json.loads((ROOT/'docs/submission/CONNECTED-REVIEW-CASES.json').read_text(encoding='utf-8'))
o['review'] = {'test_cases':cases,'demo_recording_url':a.demo_url,'commerce':False}
o['publication']['release_notes'] = 'Initial connected listing: read-only checklist search, exact item retrieval and source versions, plus dated Markdown fallback and compact pre-delivery QA.'
files['plugin.json'] = (json.dumps(m,ensure_ascii=False,indent=2)+'\n').encode()
files['mcp.json'] = (json.dumps({'$schema':'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json','mcpServers':{'teacher-growth-knowledge':{'type':'streamable-http','url':a.endpoint}}},indent=2)+'\n').encode()
files['skills/teacher-growth/references/connected-retrieval.md'] = (ROOT/'packaging/connected/connected-retrieval.md').read_bytes()
for name in ['teacher-growth','teacher-design-review']:
    key = 'skills/'+name+'/SKILL.md'
    body = files[key].decode('utf-8')
    ref = 'references/connected-retrieval.md' if name == 'teacher-growth' else '../teacher-growth/references/connected-retrieval.md'
    body += '\n\n## Connected checklist route\n\nWhen applying or quoting the project checklists, first read '+ref+'. Use its search → exact-item retrieval route and citation rules. General drafting needs no retrieval.\n'
    files[key] = body.encode('utf-8')
files['skills/setup/SKILL.md'] += '\n\nIf asked about connections, explain that this package retrieves only the approved public checklist library. It cannot read a private Drive or save personal records. Do not require a teacher to configure MCP before offering a useful draft.\n'.encode()
out = ROOT/'dist/teacher-growth-partner-connected-v1.3.0.zip'
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
    for name, data in sorted(files.items()):
        info = zipfile.ZipInfo(name, date_time=(2026,10,23,0,0,0))
        info.compress_type = zipfile.ZIP_DEFLATED
        z.writestr(info,data)
receipt = {'package':out.name,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'files':len(files),'endpoint':a.endpoint,'health':health,'tools':sorted(names),'demo_url':a.demo_url,'status':'built; portal validation and review still required'}
(out.with_suffix('.receipt.json')).write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(receipt,ensure_ascii=False,indent=2))

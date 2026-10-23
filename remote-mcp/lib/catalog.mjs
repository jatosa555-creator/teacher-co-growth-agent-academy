import catalog from '../data/catalog.mjs';

const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
const normalize = s => s.normalize('NFKC').toLocaleLowerCase('th').replace(/\s+/g, ' ').trim();
const stop = new Set(['ของ','ใน','และ','ที่','ให้','ได้','การ','มี','กับ','จาก','เพื่อ','เป็น','หรือ','จะ','ฉัน','ช่วย','ครู','ใช้','the','a','and','for','with']);
const aliases = [
  { terms: ['เด็กเงียบ','เงียบ','quiet','student voice','การมีส่วนร่วม'], ids: ['CL-P1-01','CL-P1-02','CL-P1-03'] },
  { terms: ['หมุนบทบาท','บทบาท','role rotation'], ids: ['CL-P1-03'] },
  { terms: ['น้ำท่วม','ภัยพิบัติ','ฉุกเฉิน','กลับมาเรียน','กลับเข้าเรียน','re-entry','disruption'], ids: ['CL-P1-08','CL-P1-09','CL-P4-02','CL-P4-05','CL-P4-09','CL-P4-10','AI-P3-15','AI-P3-16','AI-P3-17'] },
  { terms: ['เป้าหมายบทเรียน','จุดประสงค์','backward design'], ids: ['CL-P2-01'] },
  { terms: ['สองวิธี','2 วิธี','verification'], ids: ['AI-P1-09'] },
  { terms: ['สองรอบ','2 รอบ','feedback','ฟีดแบ็ก'], ids: ['AI-P2-17','AI-P2-18','AI-P2-20'] },
  { terms: ['ชุมชน','community','ผู้เกี่ยวข้อง'], ids: ['AI-P4-01','AI-P4-02','AI-P4-03'] },
  { terms: ['อาชีพ','career','โลกงาน'], ids: ['AI-P4-06','AI-P4-08','AI-P4-09'] },
  { terms: ['portfolio','แฟ้ม','สะสมผลงาน'], ids: ['AI-P4-16','AI-P4-19','AI-P4-20','AI-P4-25'] }
];

export function sourceSummary(family) {
  return { snapshotDate: catalog.snapshotDate, corpusSha256: catalog.corpusSha256,
    sources: catalog.sources.filter(x => !family || x.family === family),
    scope: 'Project-provided, dated checklist snapshot. No live Drive access or teacher records.',
    itemIds: 'Project-added stable IDs for this snapshot; not an official scoring scale.' };
}

export function getItems(ids) {
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 6 || new Set(ids).size !== ids.length) throw new Error('Supply 1–6 distinct checklist IDs.');
  const found = ids.map(id => catalog.items.find(item => item.id === id));
  if (found.some(x => !x)) return { found: false, missingIds: ids.filter((id,i) => !found[i]), items: [], snapshotDate: catalog.snapshotDate,
    message: 'ID not found in this snapshot. Search the catalog; do not infer or fabricate a source item.' };
  return { found: true, items: found, snapshotDate: catalog.snapshotDate,
    usage: 'Cite the provided citation literally. Evidence suggestions are not scoring criteria. Planned actions are not observed outcomes.' };
}

export function searchItems({ query, family, pillar, limit = 3 }) {
  if (typeof query !== 'string' || !query.trim() || query.length > 160) throw new Error('Use 1–160 characters of topic keywords, not lesson text or personal data.');
  if (!Number.isInteger(limit) || limit < 1 || limit > 6) throw new Error('Limit must be 1–6.');
  const q = normalize(query);
  const tokens = [...new Set([...segmenter.segment(q)].filter(x => x.isWordLike).map(x => normalize(x.segment)).filter(x => x.length > 1 && !stop.has(x)))];
  const tagged = new Set(aliases.filter(x => x.terms.some(term => q.includes(normalize(term)))).flatMap(x => x.ids));
  const eligible = catalog.items.filter(x => (!family || x.family === family) && (!pillar || x.pillar === pillar));
  const ranked = eligible.map(item => {
    const text = normalize(item.text+' '+item.section+' '+item.sourceTitle);
    const exact = q === normalize(item.id);
    const score = (exact ? 1000 : 0) + (tagged.has(item.id) ? 12 : 0) + (text.includes(q) ? 10 : 0) + tokens.reduce((n,t) => n + (text.includes(t) ? 2 : 0), 0);
    return { item, score };
  }).filter(x => x.score > 0).sort((a,b) => b.score-a.score || a.item.id.localeCompare(b.item.id));
  return { snapshotDate: catalog.snapshotDate, retrievalMethod: 'lexical_keywords_and_curated_tags', totalMatches: ranked.length,
    truncated: ranked.length > limit, results: ranked.slice(0,limit).map(({item}) => ({ id:item.id, family:item.family,
      pillar:item.pillar, kind:item.kind, excerpt:item.text.slice(0,360), excerptTruncated:item.text.length>360,
      page:item.page, sourceTitle:item.sourceTitle, url:item.url, citation:item.citation })),
    next: 'Read selected IDs with get_checklist_items before applying or quoting criteria. No matches means no supported match, not a failed teacher.' };
}

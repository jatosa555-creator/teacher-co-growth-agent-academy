export function parseSourceItems(text) {
  const normalized=text.replaceAll('\r\n','\n');
  const pattern=/^### ((?:CL|AI)-P[1-4]-\d{2})\n\n(.*?)\n\nที่มา: \[PDF หน้า (\d+)\]\(([^)]+)\) · (.*?) · ประเภท: (reflection|evidence)\n/gms;
  return [...normalized.matchAll(pattern)].map(m=>({id:m[1],text:m[2],page:Number(m[3]),url:m[4],section:m[5],kind:m[6]}));
}

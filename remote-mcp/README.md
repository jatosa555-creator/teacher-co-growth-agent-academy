# Teacher Growth Knowledge MCP

เซิร์ฟเวอร์ MCP แบบอ่านอย่างเดียวสำหรับค้นและอ่านรายการจาก snapshot เช็กลิสต์ที่คัดไว้ ไม่เชื่อม Drive สด ไม่มีบัญชี/OAuth หรือการอัปโหลดแผนการสอน ค้นด้วยคำสำคัญสั้น ๆ (ไม่เกิน 160 ตัวอักษร) หรืออ่านด้วยรหัสรายการ 1–6 รายการ ห้ามส่งชื่อบุคคล แผนเต็ม หรือข้อมูลส่วนตัว

เครื่องมือ: `search_checklist_items`, `get_checklist_items`, `list_checklist_sources` รายการสะท้อนคิดและข้อเสนอหลักฐานไม่ใช่คะแนนหรือผลลัพธ์ที่ยืนยันแล้ว ดู [ที่มาและขอบเขต snapshot](../docs/submission/CHECKLIST-KNOWLEDGE.md)

## ติดตั้งและรัน

ต้องใช้ Node.js 22 ขึ้นไป

```sh
npm ci
npm run build
npm start
```

`npm start` เปิดเซิร์ฟเวอร์ HTTP ในเครื่อง ค่าเริ่มต้นและการตั้งค่าพอร์ตดูที่ `scripts/serve.mjs` และ `netlify.toml` สำหรับโฮสต์ Netlify ให้ใช้คำสั่ง build ตาม `netlify.toml`; การเผยแพร่จริงและ URL ต้องตรวจสอบแยกต่างหาก

## ตรวจสอบ

```sh
npm test
```

แพ็กเกจโครงการรุ่น `0.1.0`; ใช้ `@modelcontextprotocol/sdk` รุ่น `1.32.1` (ล็อก dependency ใน `package-lock.json`)

การโฮสต์อาจประมวลผล metadata ทางเทคนิคตามนโยบายผู้ให้บริการ โดยรายละเอียดการตั้งค่าและ retention ยังต้องยืนยัน ดู [นโยบายความเป็นส่วนตัว](../docs/privacy.md) และ [ข้อกำหนด](../docs/terms.md)

### English summary

Read-only MCP server for a curated, dated checklist snapshot. Node.js 22+. Run `npm ci`, `npm run build`, `npm start`; run checks with `npm test`. Package version 0.1.0 uses MCP SDK 1.32.1. The intended public deployment URL and settings require verification. Do not submit personal data or full lesson plans.

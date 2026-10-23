# นโยบายความเป็นส่วนตัว / Privacy

**ผู้เผยแพร่ที่ระบุ:** CHANON PHAJUNDA  
**ขอบเขต:** Teacher Growth Partner และคลัง MCP สำหรับเช็กลิสต์แบบอ่านอย่างเดียว

ตรวจการทำงานออนไลน์ล่าสุด 23 ตุลาคม 2026: MCP แบบอ่านอย่างเดียวให้บริการที่ https://teacher-growth-knowledge.netlify.app/mcp บน Netlify โดยใช้ snapshot เช็กลิสต์วันที่ 23 ตุลาคม 2026 สถานะการอนุมัติและการติดตั้งผ่าน OpenAI เป็นขั้นตอนแยกจากบริการ MCP นี้

## ข้อมูลที่ส่งและการจัดการ

- MCP สาธารณะให้ค้นหาด้วยคำสำคัญสั้น ๆ หรืออ่านรายการด้วยรหัสรายการที่เลือกไว้ จำกัดคำค้น 160 ตัวอักษรและคืนข้อมูลจาก snapshot เช็กลิสต์ที่คัดไว้ ไม่มีบัญชีผู้ใช้, OAuth, การอัปโหลดแผนการสอน หรือการเชื่อม Drive สด
- เซิร์ฟเวอร์ไม่มี API ของ AI, ฐานข้อมูล, telemetry ของแอป หรือการบันทึกอาร์กิวเมนต์/เนื้อหาคำขอในตัวโค้ด อย่างไรก็ตาม ผู้ให้บริการโฮสต์อาจประมวลผลข้อมูลทางเทคนิคของคำขอตามนโยบายของตน ระยะเวลาเก็บรักษาและรายละเอียดการตั้งค่าจริงยังไม่ได้ยืนยัน จึงไม่รับรองว่าไม่มีบันทึกใด ๆ
- การใช้ Skills ส่งบริบทผ่านบทสนทนาปัจจุบันไปยัง AI host ที่เลือกใช้งาน นโยบายการประมวลผลและระยะเวลาเก็บข้อมูลของ host นั้นแยกจากโครงการนี้
- GitHub Issues เป็นพื้นที่สาธารณะและข้อมูลถูกจัดเก็บโดย GitHub แยกจาก MCP โปรดอย่าโพสต์ข้อมูลส่วนบุคคลของนักเรียนหรือรายละเอียดอ่อนไหวด้านความเป็นส่วนตัวใน Issues
- ไม่มีการซิงก์ Google Drive อัตโนมัติหรือหน่วยความจำข้ามบทสนทนา การใช้แผนส่วนตัวควรทำใน host ที่ผู้ใช้เลือกและมีสิทธิ์ใช้งาน ไม่ส่งข้อมูลดังกล่าวมาในคำค้น MCP หรือ Issues

## แหล่งข้อมูลและข้อจำกัด

รายการ MCP มาจาก snapshot โครงการของ [Classroom Practical Checklist V8](submission/CHECKLIST-KNOWLEDGE.md) และ [AI Teacher Practice Checklist](submission/CHECKLIST-KNOWLEDGE.md) ไม่ใช่การดึง Drive แบบสด เนื้อหาต้นฉบับและวิธีจัดทำระบุไว้ในเอกสารความรู้ดังกล่าว การตอบสนองและผลการเรียนของนักเรียนไม่ได้ถูกติดตามหรือยืนยันโดยบริการนี้ ครูใช้ดุลยพินิจทางวิชาชีพและรับผิดชอบการตัดสินใจในชั้นเรียน

## ติดต่อ

แจ้งปัญหาผ่าน [GitHub Issues ของโครงการ](https://github.com/jatosa555-creator/teacher-co-growth-agent-academy/issues) โปรดตรวจสอบปลายทางและการตั้งค่าความเป็นสาธารณะก่อนส่ง และอย่าใส่ข้อมูลส่วนบุคคลหรือข้อมูลอ่อนไหว

### English summary

The read-only MCP was verified online on 23 October 2026 and is hosted on Netlify. OpenAI directory approval and installation are separate and are not implied by this deployment. The public MCP is read-only and accepts short keywords or selected checklist IDs. It has no accounts, OAuth, lesson uploads, AI API, database, app telemetry, or argument logging in the code. The hosting provider may process technical request metadata; retention is unconfirmed. Skills use the current conversation under the chosen AI host’s separate policies. GitHub Issues are public, stored by GitHub, and separate from MCP. Do not post student personal data or sensitive privacy details. No automatic Drive sync, cross-chat memory, or verified classroom impact is provided.

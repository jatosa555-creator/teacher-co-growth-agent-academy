# Connected release status — 23 October 2026

## OpenAI

Teacher Growth Partner, package teacher-growth-partner-connected, metadata/Skills version 1.3.0: **In review**. Publication: **Not published**. MCP: **Configured**, domain verified.

https://platform.openai.com/plugins/manage/plugin_asdk_app_6adacf55b75c8191afd7baa14f0164e7

- Plugin ID: plugin_asdk_app_6adacf55b75c8191afd7baa14f0164e7
- Submitted draft: appsub_6adacf55b78c8191a7bebec7e91f8012
- Publisher: CHANON PHAJUNDA
- All 4 Skills: Checks passed. Latest MCP scan before submission: no findings; 3 expected read-only tools discovered.
- Review information saved: 5 positive cases, 3 negative cases, actual video URL and release notes.
- Owner explicitly approved all 6 submission attestations before the final Submit.
- A category confirmation warning remained non-blocking. Scan success does not imply approval.
- Historical Skills-only 1.2.0 draft and CoDiscover were not modified.

## Published infrastructure and evidence

- Source and support: https://github.com/jatosa555-creator/teacher-co-growth-agent-academy
- MCP: https://teacher-growth-knowledge.netlify.app/mcp
- Health: https://teacher-growth-knowledge.netlify.app/health
- Netlify project: teacher-growth-knowledge, 866a5919-5d41-48f2-ba2a-ce793b9918de. Continuous deployment from this repository main, base remote-mcp.
- Production is public; previews require existing-team SSO, explicitly approved by the owner.
- Public corpus rights explicitly approved: 58 Classroom V8 + 80 AI Practice entries. Original PDFs, source-institution logos and individual teacher/student records excluded.
- Snapshot: 2026-10-23; corpus SHA256 b2ddca43e1b760682c2d53b09d2c648e1535d1d250de636262e2a23c82a23cc6. No live Drive sync.
- 7/7 local MCP test groups and 11/11 real HTTPS protocol checks passed.
- 48-second captioned protocol walkthrough and complete public responses: https://github.com/jatosa555-creator/teacher-co-growth-agent-academy/releases/tag/mcp-review-demo-v1
- Video URL HEAD returned HTTP 200. The walkthrough uses saved actual MCP responses; it is not a recording of native ChatGPT installation or a teacher trial.

## Package

teacher-growth-partner-connected-v1.3.0.zip, 33 files. SHA256: 102359b22f2c9a660f3c362f7b7da7537900882cc41b1f9c399b4ca696e91235.

Build recipe: scripts/build_connected.py. Canonical Skills-only source remains in plugin/; the recipe overlays the connected route without maintaining a second hand-edited skill tree.

## Remaining

Wait for the OpenAI review outcome, address any feedback, then Publish after approval. No approval date is guaranteed. Native installation, mobile/free-account usability and teacher outcomes still need verification; teacher use is planned for the 5–6 November workshop. No scheduled monitoring was created.

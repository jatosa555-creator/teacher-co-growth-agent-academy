# Catalog build debug — 23 October 2026

- Reproduction: node scripts/build.mjs failed deterministically at source inventory check before bundling.
- Fail path: read Markdown -> multiline item regex -> texts.size -> source.checkboxCount guard. Candidate knobs: file path, source inventory changes, newline convention, regex end-of-file boundaries. Source-trace differential used; no debugger was attached to the one-shot authoring script.
- Disproof: the same unchanged Classroom P1 file has 11 item headers and 107 CRLF sequences. Raw regex finds 0 items; only normalizing CRLF to LF finds all 11. This excludes missing source items or wrong source path for that repro.
- Fix: normalize line endings at the catalog-reader boundary, preserving each item text and source hashes. No canonical Markdown was changed.
- Verification: build now validates all 138 item texts/locators against receipts and creates SDK-based MCP function bundles. Protocol, hosted endpoint and native-host tests remain separate and pending.

Root cause: JavaScript regex required LF while Python authoring wrote Windows CRLF. Earlier Python validation used universal-newline reading and therefore passed. Future regression should exercise LF and CRLF source reading explicitly.

# AGENTS.md - AI Development Guidelines

This repository hosts **Secriptorium**, a browser-based, client-side tool that helps people publish and submit vulnerability information. Modes: security advisory authoring (Markdown), a CVSS v3.x calculator, and SBOM / VEX authoring (CycloneDX JSON). CSAF 2.0 output for advisory mode is a **future improvement** (not implemented in the UI yet).

AI agents modifying this repository **MUST** follow the rules below.

---

## 1. Development Environment (Important)

- The maintainer has **no local development environment**. All changes are made through the GitHub.com web UI ("Add file" > "Create new file" / edit in browser) and built by **GitHub Actions**.
- Therefore: always provide **complete file contents** with the **exact repository path**, ready to paste. Avoid instructions that require running commands locally.
- Keep changes small and the build green. The first feedback loop is the Actions log; if a change may break the build, say so explicitly.
- Do not add dependencies lightly (see §2). There is no lockfile; `npm install` resolves ranges at build time.

## 2. Core Principles

- **Client-side only:** all input and processing stay in the user's browser. Never send data to any server. No `fetch`/XHR/WebSocket to external hosts.
- **Static hosting:** deployed to GitHub Pages. No backend, no database. No persistent storage (`localStorage` etc.) unless explicitly requested.
- **Minimal dependencies:** runtime dependency is `vue` only. Build tooling: `vite`, `@vitejs/plugin-vue`, `typescript`, `vue-tsc`, `@types/node`. Do not add other packages (UI kits, markdown renderers, state libraries, etc.) without explicit approval.
- **No JSON/file import** features that parse user-supplied files, unless explicitly requested (and then with strict validation).

## 3. Strict Security Rules

1. **No `v-html` and no `innerHTML`/`outerHTML`/`insertAdjacentHTML`.** Render user-controlled text only via `{{ }}`, `textContent`, or DOM APIs.
2. **Keep the CSP in `index.html` tight** (`default-src 'self'`, `script-src 'self'`, `style-src 'self'`, `connect-src 'none'`). No `eval`, `new Function`, inline `<script>`, inline event handlers, or **any inline `style="…"` attribute in templates**. Use classes: global ones in `src/style.css`, component-specific ones in the component's `<style scoped>`.
3. **No external resources:** no CDN scripts, fonts, images, or stylesheets.

## 4. Structure

- `src/main.ts` – bootstrap. `src/App.vue` – shell and mode switching.
- `src/modes/` – one screen per mode (`AdvisoryMode.vue`, `CvssCalculatorMode.vue`, `SbomMode.vue`).
- `src/components/OutputPanel.vue` – shared output panel. Modes pass `OutputTab[]` (`src/lib/output.ts`); do not duplicate copy/save logic.
- `src/lib/` – pure TypeScript logic with **no Vue imports** (`cvss.ts`: CVSS calculation and metric texts; `advisory.ts`: form types and Markdown/CSAF generation (the CSAF code is kept for the planned CSAF output and is currently unused by the UI); `i18n-ja.ts`: Japanese texts, presets and CWE samples for advisory mode; `sbom.ts`: SBOM/VEX types, paste parsing, PURL, CycloneDX generation, checks, demo data; `output.ts`: output tab type). Keep it testable in isolation.
- `src/components/CvssPicker.vue` – metric picker bound to a vector string via `v-model`.
- `src/style.css` – global styles with CSS variables and light/dark support.
- `vite.config.ts` derives `base` from `GITHUB_REPOSITORY`; do not hard-code the repository name.

## 5. Input Handling & Output Policy

- User input is passed to Markdown as typed; Markdown syntax in free-text fields is **allowed** (documented in the README), not stripped.
- The title is single-line (`oneLine()`); table cells go through `esc()` (escapes `|`, line breaks to spaces).
- The on-screen preview is plain text (`<pre>{{ }}</pre>`); never render generated Markdown/JSON as HTML.
- **CVSS:** `src/lib/cvss.ts` computes the v3.0 / v3.1 base score from the vector (only the rounding function differs between the two). Do not alter the formulas without explicit instruction. After any change, verify known vectors for both versions (`AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` = 9.8; `S:C` with all High = 10.0; all `N` impacts = 0). CVSS 4.0 is intentionally unsupported until CSAF supports it; if added, vendor the official calculator logic (BSD-2-Clause) with its notice in `THIRD_PARTY_NOTICES.md`, and show attribution (CVSS is owned by FIRST and used by permission).
- **CSAF 2.0 (future improvement):** the advisory-mode UI does not offer CSAF output yet. Adding it requires publisher name and namespace (URL) input fields. When added, the output is best-effort. `scores[].cvss_v3` is emitted only for v3.0/v3.1 vectors (with the matching `version`); a CVSS 4.0 vector is never put into CSAF 2.0. Required-but-missing items are surfaced via `csafWarnings()`. Never claim full conformance; the README tells users to validate with an official validator.

## 6. SBOM / VEX Rules

- Format: **CycloneDX JSON** (currently spec 1.6, `CDX_SPEC_VERSION` in `sbom.ts`). SBOM and VEX are **separate documents**; the VEX references SBOM components by bom-link (`urn:cdx:<serial>/1#<bom-ref>`). Both serial numbers and the timestamp live in `SbomForm`, so the same input always yields the same output. Never generate them inside the builders.
- **Never fabricate data.** Do not default a missing version, supplier or ecosystem (empty stays empty; `generic` is the neutral ecosystem). Surface gaps through `sbomChecks()`.
- VEX statements are a separate table from components: one statement = CVE × component × state (+ justification for `not_affected`). Internal state names are `not_affected | affected | under_investigation | fixed`; they are mapped to CycloneDX values only in `buildVex()` (`exploitable`, `in_triage`, `resolved`).
- Pasted text (TSV/CSV) is **untrusted input**: parse as plain text only, never as HTML; keep the limits in `LIMITS` (characters, rows, field length, statements).
- No JSON import. Persistence across sessions is by TSV export/paste of the component table only.
- Demo data is fictional and must stay marked as sample (`isDemo` adds a note property to the output). CVE details in the demo are examples; verify them against NVD before changing or relying on them.
- Planned: licenses, hashes, dependency graph, a customer-facing explanation document, possibly a CSAF VEX output (reusing the CSAF code).

## 7. Instructions for AI Code Modifications

- Be surgical; preserve responsive layout (`@media (max-width: 860px)`) and dark mode.
- Keep user-facing text in Japanese (the primary audience). Advisory mode takes its texts from `src/lib/i18n-ja.ts` (a `"text|hint"` string is shown as a label plus a hint); other modes currently have Japanese text inline. Moving them into a language file is a possible future step.
- Component `tabs` passed to `OutputPanel` must be `OutputTab[]` (`id`, `label`, `content`, `ext`, `mime`); do not use other key names.
- After UI changes, confirm there are no console errors and that the Actions build passes.

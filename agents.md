# AGENTS.md - AI Development Guidelines

This repository hosts **Secriptorium**, a browser-based, client-side tool that helps people publish and submit vulnerability information. Current mode: security advisory authoring (Markdown + CSAF 2.0). Planned mode: SBOM / VEX (CycloneDX).

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
2. **Keep the CSP in `index.html` tight** (`default-src 'self'`, `script-src 'self'`, `style-src 'self'`, `connect-src 'none'`). No `eval`, `new Function`, inline `<script>`, inline event handlers, or inline `style` attributes bound with `setAttribute`. Prefer classes in `src/style.css`.
3. **No external resources:** no CDN scripts, fonts, images, or stylesheets.

## 4. Structure

- `src/main.ts` – bootstrap. `src/App.vue` – shell and mode switching.
- `src/modes/` – one screen per mode (`AdvisoryMode.vue`; future `SbomMode.vue`, `VexMode.vue`).
- `src/components/OutputPanel.vue` – shared output panel. Modes pass `OutputTab[]` (`src/lib/output.ts`); do not duplicate copy/save logic.
- `src/lib/` – pure TypeScript logic with **no Vue imports** (types, calculation, document generation). Keep it testable in isolation.
- `src/style.css` – global styles with CSS variables and light/dark support.
- `vite.config.ts` derives `base` from `GITHUB_REPOSITORY`; do not hard-code the repository name.

## 5. Input Handling & Output Policy

- User input is passed to Markdown as typed; Markdown syntax in free-text fields is **allowed** (documented in the README), not stripped.
- The title is single-line (`oneLine()`); table cells go through `esc()` (escapes `|`, line breaks to spaces).
- The on-screen preview is plain text (`<pre>{{ }}</pre>`); never render generated Markdown/JSON as HTML.
- **CVSS:** `src/lib/advisory.ts` computes the base score from the vector. Do not alter the formulas without explicit instruction. After any change, verify known vectors (`AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` = 9.8; `S:C` with all High = 10.0; all `N` impacts = 0).
- **CSAF 2.0:** output is best-effort. Required-but-missing items are surfaced via `csafWarnings()`. Never claim full conformance; the README tells users to validate with an official validator.

## 6. Roadmap Notes (SBOM / VEX)

- Target format: **CycloneDX (JSON)** for SBOM, with VEX statements (e.g. `not_affected` with a justification). Keep the generator in `src/lib/` (e.g. `sbom.ts`) and the screen in `src/modes/`.
- Beginner-friendly features under consideration: one-click demo data, pasting components from a spreadsheet (tab-separated text) into a table, and download of the generated JSON.
- Any pasted-text parsing must be treated as untrusted input: parse as plain text, never as HTML, and cap sizes.

## 7. Instructions for AI Code Modifications

- Be surgical; preserve responsive layout (`@media (max-width: 860px)`) and dark mode.
- Keep user-facing text in Japanese (the primary audience); an i18n layer may be added later.
- After UI changes, confirm there are no console errors and that the Actions build passes.
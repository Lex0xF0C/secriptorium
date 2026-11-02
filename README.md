<p align="center">
  <img src="public/Image_secriptorium.jpg" alt="Secriptorium Logo" width="500" height="500">
</p>

# Secriptorium

**Static. Client-side. Nothing leaves your browser.**

[Live Demo](https://lex0xf0c.github.io/secriptorium/) | [https://lex0xf0c.github.io/secriptorium/](https://lex0xf0c.github.io/secriptorium/)

[日本語](#日本語) | [English](#english) | [License](#license--ライセンス)

---

## 日本語

脆弱性情報の公表・開示プロセスを支援する、ブラウザだけで動く静的Webツールです。**アドバイザリ作成**（Markdown）、**CVSS v3.x 計算**、**SBOM / VEX 作成**（CycloneDX JSON / CSAF VEX）、**security.txt（RFC 9116）生成**、**CVDポリシー作成**に対応しています。CSAF 2.0 によるアドバイザリの出力は、今後の改善構想です。

入力内容はこのブラウザの中だけで処理され、外部へ送信されません。サーバーもデータベースもありません。

### 現在できること

- **脆弱性アドバイザリ作成**
  - 入力フォーム（状況、タイトル、管理番号、CVE、概要、影響を受ける製品、バージョンの確認方法、CWE、脅威、対策、回避策、謝辞、更新履歴、連絡先など）
  - 状況（通常・緊急・攻撃確認済み・サポート終了）に応じた定型文の自動挿入
  - 定型文プリセットのワンタップ挿入（概要、バージョン確認、説明、脅威、対策、回避策、謝辞、連絡先）
  - CWE の選択（選ぶと、説明と脅威の定型文を自動挿入）。候補にない CWE の直接入力と、「CWEを判断できない」場合の自由記述にも対応
  - CVSS の項目選択（各項目に説明つき）から、基本スコアを自動入力
  - **Markdown**（WEB掲載用）のリアルタイム出力。入力内容を並べた簡易的な JSON も出力（CSAF ではありません）
- **CVSS v3.x グラフィカル計算機**
  - CVSS v3.0 / v3.1 の基本スコアと深刻度を自動計算（ベクター貼り付け、または項目ごとの説明つきグラフィカル選択）
  - よくある脆弱性シナリオ（RCE、XSS/フィッシング、LAN限定、ローカル管理者権限等）の即時適用プリセット
  - Markdown および JSON 形式での評価結果出力
- **SBOM / VEX 作成支援**
  - Excel/TSV からのコピー＆ペースト一括読み込み、表の編集・TSVコピー
  - PURL の自動生成
  - **CycloneDX 1.6 JSON** の SBOM と VEX を、別々の文書で出力
  - 入力チェック、1クリックのデモデータ読み込み
- **CSAF 2.0 VEX 作成**
  - 製品ごとの影響有無（影響なし・影響あり・修正済み・調査中）と理由を、**CSAF 2.0 VEX JSON** として出力
- **security.txt (RFC 9116) 生成**
  - 連絡先、有効期限（ISO 8601）、暗号化キー、謝辞、推奨言語、ポリシー等のテキスト生成
  - クリップボードコピーおよび `.txt` ダウンロード
- **CVD（協調的脆弱性開示）ポリシー作成**
  - ISO/IEC 29147 や ENISA のガイドラインを参考にした、ポリシーの作成（Scope, Reporting, Safe Harbor, Timeline, Preferences 等）
  - Markdown 形式での出力およびダウンロード

### 今後の予定

- アドバイザリモードへの CSAF 2.0（JSON）出力の追加（発行者名・発行者のURLの入力欄も、あわせて追加する）
- CSAF 2.0 / CycloneDX バリデーション機能の更なる強化
- SBOM / VEX の拡充（ライセンス、ハッシュ、依存関係グラフの視覚化など）
- 国際化（日英表示切り替え）の対応。現在、日本語の文言は、アドバイザリモードでは `src/lib/i18n-ja.ts` に、その他のモードでは画面のコードの中にあります

### 出力についての注意

**Markdown**

- Markdown 記法（`#`、`*`、`-`、`>`、`` ``` `` など）を入力すると、出力にそのまま反映されます。
- 管理番号・製品名・バージョンは表として出力されます。`|` は自動でエスケープされ、改行は空白になります。それ以外の記法は表の中でも有効です。
- タイトルは1行の項目です。改行は空白として扱われます。
- HTML タグは入力のまま出力され、表示は掲載先の Markdown レンダラに依存します。本ツールの画面上では、HTML として解釈されません。

**CSAF 2.0 (JSON)**

- 現在、CSAF 2.0 の JSON は、VEX モードから出力します（アドバイザリモードからは、まだ出力しません）。出力内容が厳密に規格へ適合しているかは、**公式の検証ツール（Secvisogram 等）で必ず最終確認を行ってください。**

**CVSS**

- CVSS v4.0 は、現在は使えません。CSAF 2.0 規格が CVSS v4.0 に未対応のためです（CSAF 2.1 での対応に合わせて検討します）。

**SBOM / VEX (CycloneDX / CSAF)**

- 出力は CycloneDX 1.6 JSON、または CSAF 2.0 VEX JSON です。公式の検証ツールで、必ず確認してください。
- SBOM と VEX は別々の文書として構成され、CycloneDX の VEX は bom-link（`urn:cdx:<SBOMシリアル番号>/1#<bom-ref>`）で部品を参照します。
- PURL はエコシステムと名前から自動生成します。パッケージ管理以外の部品は `generic` となります。誤判定を防ぐため自動推測は行いません（Maven は `groupId:artifactId` で入力）。
- バージョンなどの値を、補って埋めることはしません。空欄は空欄のまま出力され、チェックで知らせます。
- 貼り付けは 1 回あたり 20 万文字・2000 行まで対応しています。
- 「影響なし」などの VEX 判定は、製品提供者が自身の責任で行うものです。本ツールは判定の正当性を自動検証しません。
- デモは架空の機器の例です。CVE の内容は例示であり、使う前に NVD などで確認してください。

**共通**

- **公開前に必ず、掲載先での表示結果および検証ツールの結果を確認してください。**

### 免責

CVSS は FIRST.Org, Inc. が所有・管理する規格です（条件のもとで使用しています）。

本ツールは文書作成およびフォーマット変換の補助ツールです。公表の可否、記載内容の正確性、CVSS 評価の妥当性は利用者が判断してください。公開前に、社内（法務・広報・PSIRT等）の確認を受けることを推奨します。

### 開発とデプロイ

Vite + Vue 3 + TypeScript で構築されています。ビルドと GitHub Pages へのデプロイは GitHub Actions が自動で行います（`.github/workflows/deploy.yml`）。

1. リポジトリの Settings → Pages で、Source を「GitHub Actions」に設定します。
2. `main` ブランチに push すると、自動でビルドとデプロイが実行されます。
3. 公開 URL は Actions の実行結果および Settings → Pages に表示されます。

`vite.config.ts` の `base` はリポジトリ名から自動取得されるため、リポジトリ名を変更しても設定の変更は不要です。

### ファイル構成

| パス | 役割 |
| --- | --- |
| `index.html` | アプリの入口（厳格な CSP 設定を含む） |
| `src/main.ts` | アプリのエントリーポイント |
| `src/App.vue` | アプリ全体のレイアウトと各モードの切り替え |
| `src/modes/AdvisoryMode.vue` | アドバイザリ作成モード画面 |
| `src/modes/CvssCalculatorMode.vue` | CVSS v3.x 計算機モード画面 |
| `src/modes/SbomMode.vue` | SBOM / CycloneDX VEX 作成モード画面 |
| `src/modes/VexMode.vue` | CSAF 2.0 VEX 専用作成モード画面 |
| `src/modes/SecurityTxtMode.vue` | security.txt (RFC 9116) 作成モード画面 |
| `src/modes/CvdPolicyMode.vue` | CVD ポリシー作成モード画面 |
| `src/components/OutputPanel.vue` | 共通出力パネル（タブ切替、コピー、保存、警告表示） |
| `src/components/CvssPicker.vue` | CVSS 評価ピッカー（説明付き選択画面部品） |
| `src/lib/cvss.ts` | CVSS v3.0 / v3.1 計算ロジック・メトリック定義 |
| `src/lib/advisory.ts` | アドバイザリのデータ構造、Markdown と CSAF 2.0 の生成・警告チェック（CSAF の部分は、将来の出力用に残してあり、画面からは使われていません） |
| `src/lib/sbom.ts` | SBOM / CycloneDX VEX の型定義、TSVパース、PURL生成、CycloneDX出力、チェック、デモ |
| `src/lib/vex.ts` | CSAF 2.0 VEX 用の型定義、TSVパース、JSON生成・警告チェック |
| `src/lib/security-txt.ts` | security.txt (RFC 9116) フォーマット生成 |
| `src/lib/cvd-policy.ts` | CVD ポリシー Markdown フォーマット生成 |
| `src/lib/i18n-ja.ts` | アドバイザリモードの日本語の文言、定型文プリセット、CWE例文 |
| `src/lib/output.ts` | OutputPanel 用の型定義 |
| `src/style.css` | 全体スタイル（ダークモード対応・レスポンシブ） |

### セキュリティ方針

- 外部ネットワーク通信なし（CSP で `connect-src 'none'` を指定）
- `v-html` および `innerHTML` の不使用
- インラインの `style` 属性、外部スクリプト・外部 CSS・外部 CDN の非使用
- JSON の読み込み機能なし
- 実行時依存パッケージは Vue のみ

不具合や脆弱性を見つけた場合は、GitHub Issue よりお知らせください。

---

## English

A client-side web utility that helps with publishing and disclosing vulnerability information. It supports **advisory authoring** (Markdown), **CVSS v3.x calculation**, **SBOM / VEX authoring** (CycloneDX JSON / CSAF VEX), **security.txt (RFC 9116) generation**, and **CVD policy creation**. CSAF 2.0 output for advisories is a planned improvement.

Everything you enter is processed locally in your browser and is never transmitted to any external server. There is no backend and no database.

### Features

- **Vulnerability Advisory Authoring**
  - Form inputs (situation, title, advisory ID, CVE, summary, affected products, version check, CWE, threat, countermeasure, workaround, acknowledgments, revision history, contact, etc.)
  - Automatic standard wording depending on the situation (normal, urgent, attacks confirmed, end of support)
  - One-click presets for standard phrasing across the major sections
  - CWE selection (choosing one fills in description and threat templates), plus direct input for CWEs not in the list and free text when the CWE cannot be determined
  - CVSS metric picker (with explanations) that fills in the base score automatically
  - Real-time **Markdown** output (for web publishing), plus a simple JSON of the inputs (not CSAF)
- **Graphical CVSS v3.x Calculator**
  - Base score and severity calculations for CVSS v3.0 / v3.1
  - Preset cards for common attack scenarios (RCE, XSS, LAN-only, Local Admin, etc.)
  - Export assessment results in Markdown and JSON formats
- **SBOM / VEX Authoring**
  - Bulk copy-paste import for Excel and TSV data, table editing, TSV copy
  - Automatic PURL generation
  - **CycloneDX 1.6 JSON** output with SBOM and VEX as separate documents
  - Input checks and 1-click sample demo loading
- **CSAF 2.0 VEX Authoring**
  - Per-product status (not affected, affected, fixed, under investigation) with justification, exported as **CSAF 2.0 VEX JSON**
- **security.txt (RFC 9116) Generator**
  - Generate security.txt files with Contact, Expires (ISO 8601), Encryption, Acknowledgments, Preferred-Languages, and Policy fields
  - Direct clipboard copy and `.txt` file download
- **Coordinated Vulnerability Disclosure (CVD) Policy Generator**
  - CVD policy templates referring to ISO/IEC 29147 and ENISA guidelines (Scope, Safe Harbor, Timeline, Preferences, etc.)
  - Export in Markdown format

### Planned Enhancements

- CSAF 2.0 (JSON) output in advisory mode (together with input fields for the publisher name and URL)
- Enhanced validation checks against CSAF 2.0 and CycloneDX schemas
- Extended SBOM / VEX features (license details, hashes, visual dependency graphs)
- Multi-language (EN/JA) UI switching. Japanese text currently lives in `src/lib/i18n-ja.ts` for advisory mode and inline in the screen code for the other modes

### Notes on Output

**Markdown**

- Markdown syntax typed into form fields is passed through directly.
- Advisory IDs, product names, and versions are output as formatted tables; `|` is escaped automatically and line breaks become spaces, but other syntax still takes effect inside table cells.
- The title is a single-line field; line breaks are converted to spaces.
- HTML tags are output as typed; how they are displayed depends on the Markdown renderer of your publishing site. This tool's own screen does not interpret them as HTML.

**CSAF 2.0 (JSON)**

- Currently, CSAF 2.0 JSON is exported by the VEX mode (not yet by the advisory mode). **Always validate the generated JSON using an official validator (e.g., Secvisogram) before official publication.**

**CVSS**

- CVSS v4.0 is currently not supported due to CSAF 2.0 specification constraints (planned for evaluation with CSAF 2.1).

**SBOM / VEX (CycloneDX / CSAF)**

- Outputs CycloneDX 1.6 JSON or CSAF 2.0 VEX JSON. Always validate with an official validator.
- SBOM and VEX are maintained as distinct documents; the CycloneDX VEX links to SBOM components via `bom-link` (`urn:cdx:<serial>/1#<ref>`).
- PURLs are generated from the ecosystem and the name. Anything not from a package manager is `generic`; the tool never guesses the ecosystem. Enter Maven components as `groupId:artifactId`.
- Missing values (such as a version) are never filled in; they stay empty and are flagged by the checks.
- Pasted text is limited to 200,000 characters and 2,000 rows per paste.
- VEX judgments (e.g., "not affected") are the sole responsibility of the product supplier; the tool does not verify them.
- The demo is a fictional device. CVE details are examples; check them against NVD or similar before use.

**General**

- **Always check the rendered result on your publishing site, or the validator output, before publishing.**

### Disclaimer

CVSS is owned and managed by FIRST.Org, Inc., and is used subject to FIRST's terms.

This tool is designed to assist in drafting security documentation. The decision to publish, content accuracy, and CVSS scoring validity remain the sole responsibility of the user. Internal review (legal, PR, PSIRT) prior to publication is highly recommended.

### Development and Deployment

Built with Vite + Vue 3 + TypeScript. Automated deployment to GitHub Pages is handled via GitHub Actions (`.github/workflows/deploy.yml`).

1. Navigate to Settings → Pages and set Source to "GitHub Actions".
2. Push to the `main` branch to trigger the build and deployment workflow.

The `base` path in `vite.config.ts` is derived from the repository name, so renaming the repository requires no config change.

### Project Layout

| Path | Role |
| --- | --- |
| `index.html` | Entry point (includes a strict CSP) |
| `src/main.ts` | App bootstrap |
| `src/App.vue` | App layout and mode switching |
| `src/modes/AdvisoryMode.vue` | Advisory mode screen |
| `src/modes/CvssCalculatorMode.vue` | CVSS v3.x calculator mode screen |
| `src/modes/SbomMode.vue` | SBOM / CycloneDX VEX mode screen |
| `src/modes/VexMode.vue` | Dedicated CSAF 2.0 VEX mode screen |
| `src/modes/SecurityTxtMode.vue` | security.txt (RFC 9116) mode screen |
| `src/modes/CvdPolicyMode.vue` | CVD policy mode screen |
| `src/components/OutputPanel.vue` | Shared output panel (tabs, copy, save, warnings) |
| `src/components/CvssPicker.vue` | CVSS metric picker (with explanations) |
| `src/lib/cvss.ts` | CVSS v3.0 / v3.1 calculation and metric definitions |
| `src/lib/advisory.ts` | Advisory data structure, Markdown and CSAF 2.0 generation and warnings (the CSAF part is kept for the planned output and is currently unused by the UI) |
| `src/lib/sbom.ts` | SBOM / CycloneDX VEX types, TSV parsing, PURL generation, CycloneDX output, checks, demo |
| `src/lib/vex.ts` | CSAF 2.0 VEX types, TSV parsing, JSON generation and warnings |
| `src/lib/security-txt.ts` | security.txt (RFC 9116) generation |
| `src/lib/cvd-policy.ts` | CVD policy Markdown generation |
| `src/lib/i18n-ja.ts` | Japanese UI text, presets and CWE samples for advisory mode |
| `src/lib/output.ts` | Type definition for OutputPanel |
| `src/style.css` | Global styles (dark mode and responsive) |

### Security Policy

- No network requests (`connect-src 'none'` in CSP)
- No `v-html`, no `innerHTML`
- No inline `style` attributes, no external scripts, CDNs, or external stylesheets
- No JSON import
- Vue is the single runtime dependency

Please report any bugs or vulnerability issues via GitHub Issues.

---

## License / ライセンス

[MIT License](LICENSE) © 2026 Lex0xF0C

本ソフトウェアは MIT ライセンスのもとで提供されます。/ This software is released under the MIT License.

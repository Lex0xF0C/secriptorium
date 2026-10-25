# Secriptorium

**Static. Client-side. Nothing leaves your browser.**

[日本語](#日本語) | [English](#english) | [License](#license--ライセンス)

---

## 日本語

脆弱性情報の公表・提出を支援する、ブラウザだけで動く小さなツールです。現在は **アドバイザリ作成** に対応しており、Markdown と CSAF 2.0（JSON）を生成します。今後、SBOM / VEX（CycloneDX）の作成支援を加える予定です。

入力内容はこのブラウザの中だけで処理され、外部へ送信されません。サーバーもデータベースもありません。

### 現在できること

- アドバイザリの入力フォーム（タイトル、概要、影響を受ける製品、CWE、脅威、対策、回避策、連絡先など）
- CVSS v3.0 / v3.1 の基本スコアと深刻度を自動計算（ベクターの貼り付け、または項目ごとの説明つき選択式）
- Markdown 出力（自社サイトへの掲載用）
- CSAF 2.0（JSON）出力（機械可読な形式）。足りない項目は画面に表示
- コピー、およびファイルへの保存

### 今後の予定

- SBOM / VEX の入門・作成支援（CycloneDX 形式のエクスポートを想定）
- 日英の表示切り替え、定型文、公開前チェックなど（別リポジトリ [lite-advisory-maker](https://github.com/Lex0xF0C/lite-advisory-maker) の機能の移植）

### 出力についての注意

**Markdown**

- Markdown 記法（`#`、`*`、`-`、`>`、`` ``` `` など）を入力すると、出力にそのまま反映されます。
- 管理番号・製品名・バージョンは表として出力されます。`|` は自動でエスケープされ、改行は空白になります。それ以外の記法は表の中でも有効です。
- タイトルは1行の項目です。改行は空白として扱われます。
- HTML タグは入力のまま出力され、表示は掲載先の Markdown レンダラに依存します。本ツールの画面上では、HTML として解釈されません。

**CSAF 2.0**

- 規格上の必須項目が足りない場合は、画面に警告が出ます。ただし、出力が規格に完全に適合しているかどうかは、**公式の検証ツール（Secvisogram など）で必ず確認してください。**
- CVSS 4.0 は、CSAF 2.0 が対応していないため、現在は使えません（CSAF 2.1 で対応予定のため、対応後に検討します）。
- バージョン範囲（例：「1.5.4以前」）は、文字列のまま製品バージョンの名前として入ります。機械可読な範囲表現には、まだ対応していません。
- 日付は UTC の 0 時として出力します。
- 関連情報のうち、URL でない行は CSAF に含まれません（Markdown には含まれます）。

**共通**

- **公開前に必ず、掲載先での表示結果、または検証ツールの結果を確認してください。**

### 免責

CVSS は FIRST.Org, Inc. が所有・管理する規格です（条件のもとで使用しています）。

本ツールは文書づくりの補助です。公開の可否、内容の正確性、CVSS 評価の妥当性は、利用者が判断してください。公開前に、社内（法務・広報など）の確認を受けることを推奨します。

### 開発とデプロイ

Vite + Vue 3 + TypeScript で作られています。ビルドと GitHub Pages への公開は、GitHub Actions が自動で行います（`.github/workflows/deploy.yml`）。

1. リポジトリの Settings → Pages で、Source を「GitHub Actions」にします。
2. `main` ブランチに push すると、自動でビルドと公開が行われます。
3. 公開 URL は、Actions の実行結果と、Settings → Pages に表示されます。

`vite.config.ts` の `base` は、リポジトリ名から自動で決まります。リポジトリ名を変えても、設定を直す必要はありません。

### ファイル構成

| パス | 役割 |
| --- | --- |
| `index.html` | 入口（CSP の設定を含む） |
| `src/main.ts` | アプリの起動 |
| `src/App.vue` | 全体の枠組みとモードの切り替え |
| `src/modes/AdvisoryMode.vue` | アドバイザリ作成モードの画面 |
| `src/components/OutputPanel.vue` | 出力パネル（タブ、コピー、保存）。モード間で共用 |
| `src/components/CvssPicker.vue` | CVSS の項目選択（説明つき）とスコア計算の画面部品 |
| `src/lib/cvss.ts` | CVSS v3.0 / v3.1 の計算と、項目の定義・説明文（Vue に依存しない） |
| `src/lib/advisory.ts` | フォームの型、Markdown と CSAF の生成（Vue に依存しない） |
| `src/lib/output.ts` | 出力パネルに渡すデータの型 |
| `src/style.css` | 見た目（ダークモード対応） |

### セキュリティ方針

- ネットワーク通信なし（CSP で `connect-src 'none'`）
- `v-html` と `innerHTML` を使用しない
- 外部スクリプト・外部 CSS・CDN を使用しない
- 実行時の依存は Vue のみ

不具合や脆弱性を見つけた場合は、Issue でお知らせください。

---

## English

A small browser-only tool that helps you publish and submit vulnerability information. It currently supports **advisory writing** and generates Markdown and CSAF 2.0 (JSON). SBOM / VEX support (CycloneDX) is planned.

Everything you enter is processed in your browser and is never sent anywhere. There is no server and no database.

### What it does today

- Advisory form (title, overview, affected products, CWE, threat, countermeasure, workaround, contact, etc.)
- Automatic CVSS v3.0 / v3.1 base score and severity (paste a vector, or pick each metric with explanations)
- Markdown output (for your website)
- CSAF 2.0 (JSON) output (machine-readable); missing items are shown on screen
- Copy and save to file

### Planned

- Introductory SBOM / VEX authoring support (CycloneDX export)
- Japanese/English UI, presets and pre-publication checks (porting features from [lite-advisory-maker](https://github.com/Lex0xF0C/lite-advisory-maker))

### Notes on output

**Markdown**

- Markdown syntax (`#`, `*`, `-`, `>`, `` ``` ``, etc.) typed into the form is passed through as-is.
- Advisory ID, product names and versions are output as a table. `|` is escaped automatically and line breaks become spaces; other syntax still takes effect inside table cells.
- The title is a single-line field; line breaks are converted to spaces.
- HTML tags are output as typed; how they are displayed depends on the Markdown renderer of your publishing site. This tool's own screen does not interpret them as HTML.

**CSAF 2.0**

- If required items are missing, a warning is shown. However, **always validate the output with an official validator (e.g., Secvisogram)**; this tool does not guarantee full conformance.
- CVSS 4.0 is not available because CSAF 2.0 does not support it (it is expected in CSAF 2.1; to be considered then).
- Version ranges (e.g. "up to 1.5.4") are stored as plain strings in the product version name. Machine-readable ranges are not supported yet.
- Dates are output as 00:00 UTC.
- Reference lines that are not URLs are not included in the CSAF output (they are in the Markdown).

**General**

- **Always check the rendered result on your publishing site, or the validator output, before publishing.**

### Disclaimer

CVSS is owned and managed by FIRST.Org, Inc., and is used under the condition.

This tool only helps you draft documents. Whether to publish, the accuracy of the content and the validity of the CVSS assessment are your responsibility. We recommend an internal review (legal, PR, etc.) before publication.

### Development and deployment

Built with Vite + Vue 3 + TypeScript. GitHub Actions builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).

1. In Settings → Pages, set Source to "GitHub Actions".
2. Pushing to `main` builds and publishes the site automatically.
3. The published URL is shown in the Actions run and in Settings → Pages.

The `base` path in `vite.config.ts` is derived from the repository name, so renaming the repository requires no config change.

### Project layout

| Path | Role |
| --- | --- |
| `index.html` | Entry point (includes the CSP) |
| `src/main.ts` | App bootstrap |
| `src/App.vue` | App shell and mode switching |
| `src/modes/AdvisoryMode.vue` | Advisory mode screen |
| `src/components/OutputPanel.vue` | Output panel (tabs, copy, save), shared across modes |
| `src/components/CvssPicker.vue` | CVSS metric picker (with explanations) and score calculation UI |
| `src/lib/cvss.ts` | CVSS v3.0 / v3.1 calculation and metric definitions/explanations (no Vue dependency) |
| `src/lib/advisory.ts` | Form types, Markdown and CSAF generation (no Vue dependency) |
| `src/lib/output.ts` | Data type passed to the output panel |
| `src/style.css` | Styling (dark mode supported) |

### Security policy

- No network access (`connect-src 'none'` in the CSP)
- No `v-html`, no `innerHTML`
- No external scripts, stylesheets or CDNs
- Vue is the only runtime dependency

If you find a bug or a vulnerability, please open an issue.

---

## License / ライセンス

[MIT License](LICENSE) © 2026 Lex0xF0C

本ソフトウェアは MIT ライセンスのもとで提供されます。/ This software is released under the MIT License.

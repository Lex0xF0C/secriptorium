<p align="center">
  <img src="public/Image_secriptorium.jpg" alt="Secriptorium Logo" width="500" height="500">
</p>

# Secriptorium

**Static. Client-side. Nothing leaves your browser.**

[Live Demo](https://lex0xf0c.github.io/secriptorium/) | [https://lex0xf0c.github.io/secriptorium/](https://lex0xf0c.github.io/secriptorium/)

[日本語](#日本語) | [English](#english) | [License](#license--ライセンス)

---

## 日本語

脆弱性情報の公表・開示プロセスを包括的に支援する、ブラウザだけで動く静的Webツールです。**アドバイザリ作成**（Markdown / CSAF 2.0）、**CVSS v3.x 計算**、**SBOM / VEX 作成**（CycloneDX JSON / CSAF VEX）、**security.txt（RFC 9116）生成**、**CVDポリシー作成**に対応しています。

入力内容はこのブラウザの中だけで処理され、外部へ送信されません。サーバーもデータベースもありません。

### 現在できること

- **脆弱性アドバイザリ作成**
  - 入力フォーム（タイトル、発行者名・URL、管理番号、CVE、概要、影響を受ける製品、CWE、脅威、対策、回避策、連絡先など）
  - 定型文プリセット（概要、検証手順、説明、脅威、対策、回避策、謝辞、連絡先）のワンタップ挿入
  - CWE選択連動（選択時に説明と脅威の定型文を自動挿入）
  - **Markdown**（WEB掲載用）および **CSAF 2.0 JSON** のリアルタイム同時出力（CSAF構造警告チェック機能つき）
- **CVSS v3.x グラフィカル計算機**
  - CVSS v3.0 / v3.1 の基本スコアと深刻度を自動計算（ベクター貼り付け、または項目ごとの説明つきグラフィカル選択）
  - よくある脆弱性シナリオ（RCE、XSS/フィッシング、LAN限定、ローカル管理者権限等）の即時適用プリセット
  - Markdown および JSON 形式での評価結果出力
- **SBOM / VEX 作成支援**
  - Excel/TSV からのコピー＆ペースト一括読み込み、表の編集・TSVコピー
  - PURL の自動生成
  - **CycloneDX 1.6 JSON**（SBOM・VEX）および **CSAF 2.0 VEX JSON** の出力
  - 必須項目チェックおよびバリデーション警告表示、1クリックのデモデータ読み込み
- **security.txt (RFC 9116) 生成**
  - 連絡先、有効期限（ISO 8601）、暗号化キー、謝辞、推奨言語、ポリシ一等の安全なテキスト生成
  - クリップボードコピーおよび `.txt` ダウンロード機能
- **CVD（協調的脆弱性開示）ポリシー作成**
  - ISO/IEC 29147 や ENISA ガイドラインに準拠したポリシー作成（Scope, Reporting, Safe Harbor, Timeline, Preferences 等）
  - Markdown 形式での出力およびダウンロード

### 今後の予定

- CSAF 2.0 / CycloneDX バリデーション機能の更なる強化
- SBOM / VEX の拡充（ライセンス、ハッシュ、依存関係グラフの視覚化など）
- 国際化（日英表示切り替え）の完全対応

### 出力についての注意

**Markdown**

- Markdown 記法（`#`、`*`、`-`、`>`、`` ``` `` など）を入力すると、出力にそのまま反映されます。
- 管理番号・製品名・バージョンは表として出力されます。`|` は自動でエスケープされ、改行は空白になります。
- HTML タグは入力のまま出力され、表示は掲載先の Markdown レンダラに依存します。本ツールの画面上では HTML として解釈されません。

**CSAF 2.0 (JSON)**

- アドバイザリモードおよび VEX モードから CSAF 2.0 準拠の JSON を生成します。出力内容が厳密に規格へ適合しているかは、**公式の検証ツール（Secvisogram 等）で必ず最終確認を行ってください。**

**CVSS**

- CVSS v4.0 は、現在は使えません。CSAF 2.0 規格が CVSS v4.0 に未対応のためです（CSAF 2.1 での対応に合わせて検討します）。

**SBOM / VEX (CycloneDX / CSAF)**

- 出力は CycloneDX 1.6 JSON または CSAF 2.0 VEX JSON です。
- SBOM と VEX は別々の文書として構成され、VEX は bom-link（`urn:cdx:<SBOMシリアル番号>/1#<bom-ref>`）等で部品を参照します。
- PURL はエコシステムと名前から自動生成します。パッケージ管理以外の部品は `generic` となります。誤判定を防ぐため自動推測は行いません（Maven は `groupId:artifactId` で入力）。
- 貼り付けは 1 回あたり 20 万文字・2000 行まで対応しています。
- 「影響なし」などの VEX 判定は、製品提供者が自身の責任で行うものです。本ツールは判定の正当性を自動検証しません。

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
| `src/lib/advisory.ts` | アドバイザリデータ構造、Markdown & CSAF 2.0 生成・警告チェック |
| `src/lib/sbom.ts` | SBOM / CycloneDX VEX の型定義、TSVパース、PURL生成、CycloneDX出力 |
| `src/lib/vex.ts` | CSAF 2.0 VEX 用の型定義、TSVパース、JSON生成・警告チェック |
| `src/lib/security-txt.ts` | security.txt (RFC 9116) フォーマット生成 |
| `src/lib/cvd-policy.ts` | CVD ポリシー Markdown フォーマット生成 |
| `src/lib/i18n-ja.ts` | UI文言、定型文プリセット、CWE例文、多言語辞書定義 |
| `src/lib/output.ts` | OutputPanel 用の型定義 |
| `src/style.css` | 全体スタイル（ダークモード対応・レスポンシブ） |

### セキュリティ方針

- 外部ネットワーク通信なし（CSP で `connect-src 'none'` を指定）
- `v-html` および `innerHTML` の不使用
- 外部スクリプト・外部 CSS・外部 CDN の非使用
- 実行時依存パッケージは Vue のみ

不具合や脆弱性を見つけた場合は、GitHub Issue よりお知らせください。

---

## English

A client-side web utility designed to streamline the vulnerability management and disclosure process. It supports **advisory authoring** (Markdown / CSAF 2.0), **CVSS v3.x calculation**, **SBOM / VEX authoring** (CycloneDX JSON / CSAF VEX), **security.txt (RFC 9116) generation**, and **CVD policy creation**.

Everything you enter is processed locally in your browser and is never transmitted to any external server. There is no backend and no database.

### Features

- **Vulnerability Advisory Authoring**
  - Rich form inputs (title, publisher details, advisory ID, CVE, summary, affected products, CWE, impact, fix, workaround, contact, etc.)
  - One-click presets for standard phrasing across all major sections
  - Automatic insertion of CWE descriptions and impact templates
  - Simultaneous real-time generation of **Markdown** (for web publishing) and **CSAF 2.0 JSON** (with built-in structural validation warnings)
- **Graphical CVSS v3.x Calculator**
  - Base score and severity calculations for CVSS v3.0 / v3.1
  - Preset cards for common attack scenarios (RCE, XSS, LAN-only, Local Admin, etc.)
  - Export assessment results in Markdown and JSON formats
- **SBOM / VEX Authoring**
  - Bulk copy-paste import/export for Excel and TSV data
  - Automatic PURL generation
  - Export as **CycloneDX 1.6 JSON** (SBOM & VEX) or **CSAF 2.0 VEX JSON**
  - Validation check warnings and 1-click sample demo loading
- **security.txt (RFC 9116) Generator**
  - Generate compliant security.txt files with Contact, Expires (ISO 8601), Encryption, Acknowledgments, Preferred-Languages, and Policy fields
  - Direct clipboard copy and `.txt` file download
- **Coordinated Vulnerability Disclosure (CVD) Policy Generator**
  - Standardized CVD policy templates aligned with ISO/IEC 29147 and ENISA guidelines (Scope, Safe Harbor, Timeline, Preferences, etc.)
  - Export in Markdown format

### Planned Enhancements

- Enhanced validation checks against CSAF 2.0 and CycloneDX schemas
- Extended SBOM / VEX features (license details, hashes, visual dependency graphs)
- Full multi-language (EN/JA) UI switching

### Notes on Output

**Markdown**

- Markdown syntax typed into form fields is passed through directly.
- Advisory IDs, product names, and versions are output as formatted tables with proper escaping.

**CSAF 2.0 (JSON)**

- Advisory and VEX modes export CSAF 2.0 compliant JSON. **Always validate the generated JSON using an official validator (e.g., Secvisogram) before official publication.**

**CVSS**

- CVSS v4.0 is currently not supported due to CSAF 2.0 specification constraints (planned for evaluation with CSAF 2.1).

**SBOM / VEX (CycloneDX / CSAF)**

- Outputs CycloneDX 1.6 JSON or CSAF 2.0 VEX JSON.
- SBOM and VEX are maintained as distinct documents; VEX links to SBOM components via `bom-link` (`urn:cdx:<serial>/1#<ref>`).
- VEX judgments (e.g., "not affected") are the sole responsibility of the product supplier.

### Disclaimer

CVSS is a registered trademark owned and managed by FIRST.Org, Inc., used under license conditions.

This tool is designed to assist in drafting security documentation. The decision to publish, content accuracy, and CVSS scoring validity remain the sole responsibility of the user. Internal review (legal, PR, PSIRT) prior to publication is highly recommended.

### Development and Deployment

Built with Vite + Vue 3 + TypeScript. Automated deployment to GitHub Pages is handled via GitHub Actions (`.github/workflows/deploy.yml`).

1. Navigate to Settings → Pages and set Source to "GitHub Actions".
2. Push to the `main` branch to trigger the build and deployment workflow.

### Security Policy

- No network requests (`connect-src 'none'` in CSP)
- Zero usage of `v-html` or `innerHTML`
- No external scripts, CDNs, or external stylesheets
- Vue is the single runtime dependency

Please report any bugs or vulnerability issues via GitHub Issues.

---

## License / ライセンス

[MIT License](LICENSE) © 2026 Lex0xF0C

本ソフトウェアは MIT ライセンスのもとで提供されます。/ This software is released under the MIT License.

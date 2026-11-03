import { I18N_JA } from './i18n-ja'

export interface EvidencePreset {
  label: string
  value: string
}

export interface EvidenceItem {
  id: string
  playbookId: '4.13' | '4.14' | 'sbd_general'
  playbookTitle: string
  title: string
  description: string
  explanation: string // ★ Playbook の背景・解説
  examples: string[]  // ★ 具体的な証跡の例
  presets: EvidencePreset[] // ★ ワンタップ入力プリセット
  craRef: string
  checked: boolean
  evidenceDetail: string
}

export interface SbdAttestationForm {
  productName: string
  productVersion: string
  asserterName: string
  asserterRole: string
  assessmentDate: string
  generalNotes: string
  items: EvidenceItem[]
}

/** 初期フォームの生成 */
export function defaultSbdAttestationForm(): SbdAttestationForm {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  const today = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`

  const itemsDef = I18N_JA.sbdAttestationItems || [
    {
      id: 'ev_vuln_board',
      playbookId: '4.13',
      playbookTitle: '4.13 脆弱性管理とパッチ管理',
      title: '脆弱性追跡ボード／登録簿の維持',
      description: '発見・報告された脆弱性の深刻度、担当者、目標日、ステータスを管理している',
      explanation: '単にパッチを当てるだけでなく、報告から修正までの責任者や期限が明確に追跡可能であることを監査人や顧客へ示すための要件です。',
      examples: [
        'GitHub Issues / GitHub Projects の脆弱性管理ボード',
        'Jira / Redmine のセキュリティチケット一覧',
        'Excel / Google スプレッドシートの脆弱性管理台帳'
      ],
      presets: [
        { label: 'GitHub Issueボード', value: '[suspicious link removed]' },
        { label: 'Jira チケット一覧', value: 'Jira Project (VULN) にてステータス追跡中' },
        { label: '社内管理台帳', value: '社内セキュリティ管理台帳 (Vulnerability-Log.xlsx) で管理' }
      ],
      craRef: 'CRA 附属書I 第II部 (2), (5)'
    },
    {
      id: 'ev_sla_defined',
      playbookId: '4.13',
      playbookTitle: '4.13 脆弱性管理とパッチ管理',
      title: 'パッチ修正 SLA の定義',
      description: '深刻度に応じたトリアージ時間および是正／リリース目標SLAを定めている',
      explanation: '脆弱性受領後、放置されずに規定時間内に対応が開始される約束（SLA）が存在することを証明します。',
      examples: [
        'CVDポリシー内またはPSIRT運用要領に明記された目標時間（例: 緊急24時間以内、高14日以内）',
        'SLA定義ドキュメント'
      ],
      presets: [
        { label: '標準SLA設定', value: '緊急: 24時間以内に受領・14日以内修正 / 高: 30日以内修正' },
        { label: 'CVDポリシー連動', value: 'CVDポリシー記載の目標タイムフレームに準拠' }
      ],
      craRef: 'CRA 附属書I 第II部 (2)'
    },
    {
      id: 'ev_scan_ci',
      playbookId: '4.13',
      playbookTitle: '4.13 脆弱性管理とパッチ管理',
      title: 'CI/CD での自動スキャン実行 (SAST / 依存関係)',
      description: 'ビルド・リリース時に静的解析および依存関係スキャンが自動実行されている',
      explanation: 'コード変更やリリースごとに、ツールが自動で既知の脆弱性や不具合をチェックしていることを示します。',
      examples: [
        'GitHub Actions (Trivy / Snyk / CodeQL / Dependency Review) の実行ログ',
        'GitLab CI / SonarQube のスキャンレポート'
      ],
      presets: [
        { label: 'GitHub Actions (Trivy)', value: 'GitHub Actions (Trivy Workflow) で毎ビルド実行' },
        { label: 'Snyk CI スキャン', value: 'Snyk Container & Dependency Scan ログ確認済み' },
        { label: 'SonarQube ログ', value: 'SonarQube SAST 分析レポート出力あり' }
      ],
      craRef: 'CRA 附属書I 第I部 (1.2.a), 第II部 (1)'
    },
    {
      id: 'ev_sbom_generation',
      playbookId: '4.14',
      playbookTitle: '4.14 サプライチェーンの管理策',
      title: 'リリースごとの機械可読 SBOM (CycloneDX) 保管',
      description: 'リリース成果物とともに機械可読形式の SBOM が生成・保管されている',
      explanation: '出荷した製品にどのOSS部品が含まれているか、後から検索・特定できる状態であることを示します。',
      examples: [
        'ビルド時に生成された CycloneDX 1.6 JSON ファイル',
        'GitHub Release アセット内の bom.json'
      ],
      presets: [
        { label: 'CycloneDX JSON 保管', value: 'リリースアセット (bom.json / CycloneDX 1.6) として保管' },
        { label: 'syft 自動生成', value: 'syft ツールにより CI/CD パイプライン内で自動生成' }
      ],
      craRef: 'CRA 附属書I 第II部 (1)'
    },
    {
      id: 'ev_peer_review',
      playbookId: '4.14',
      playbookTitle: '4.14 サプライチェーンの管理策',
      title: '重要コードのコードレビュー (CODEOWNERS / ピア承認)',
      description: 'セキュリティに影響するコード変更に対し、担当者の承認が必須化されている',
      explanation: '単独の開発者が勝手に悪意あるコードや不正な設定を本番に紛れ込ませられない仕組みを実証します。',
      examples: [
        'リポジトリ内の CODEOWNERS ファイル',
        'GitHub / GitLab の Pull Request レビュー・承認履歴'
      ],
      presets: [
        { label: 'CODEOWNERS 設定', value: '.github/CODEOWNERS ファイルにてレビュー必須化' },
        { label: 'PR 承認ログ', value: 'ブランチ保護ルールにより 2名以上の承認要求を強制' }
      ],
      craRef: 'CRA 附属書I 第I部 (1.2.f)'
    },
    {
      id: 'ev_artifact_signing',
      playbookId: '4.14',
      playbookTitle: '4.14 サプライチェーンの管理策',
      title: 'ビルド成果物・パッチへの暗号署名',
      description: '配布されるファームウェアやバイナリに暗号署名が付与され完全性が検証可能',
      explanation: 'ユーザーや機器がアップデートを適用する際、途中で改ざんされていないことを検証できる根拠です。',
      examples: [
        'Sigstore Cosign によるコンテナ / バイナリ署名',
        'PGP / GPG 署名ファイル (.asc)',
        'ファームウェア署名検証ログ'
      ],
      presets: [
        { label: 'Cosign 署名', value: 'Sigstore / Cosign によるビルド証明付きキーレス署名' },
        { label: 'GPG/PGP 署名', value: 'リリースバイナリに対する GPG 署名 (.sig) を公開' }
      ],
      craRef: 'CRA 附属書I 第II部 (7)'
    },
    {
      id: 'ev_readonly_fs',
      playbookId: 'sbd_general',
      playbookTitle: 'セキュア・バイ・デフォルト基盤',
      title: 'ルートファイルシステムの読み取り専用化 (Read-only FS)',
      description: '不変なファイルシステム構成によりマルウェアの永続化・改ざんを防ぐ',
      explanation: '万が一攻撃者に侵入されても、システム領域のファイルを書き換えられない（マルウェアを居座らせない）堅牢化設計です。',
      examples: [
        'Linux パーティションテーブルの / (ro) マウント設定',
        'Docker / Container の read_only: true 設定'
      ],
      presets: [
        { label: 'Read-only マウント', value: '/etc/fstab でルートパーティションを ro 設定' },
        { label: 'Docker read_only', value: 'コンテナ起動オプション read_only: true を適用' }
      ],
      craRef: 'CRA 附属書I 第I部 (1.2.f), (1.2.j)'
    },
    {
      id: 'ev_no_default_credentials',
      playbookId: 'sbd_general',
      playbookTitle: 'セキュア・バイ・デフォルト基盤',
      title: 'ハードコードされたデフォルトパスワードの排除',
      description: '一意の初期パスワード強制または初回起動時の変更を義務付けている',
      explanation: '出荷時に「admin/admin」などの共通固定パスワードが存在せず、機器ごとに一意か、初回設定が強制される設計です。',
      examples: [
        '初回セットアップ画面のバリデーションコード',
        '個体ごとにシリアル紐付けされた初期パスワードシール'
      ],
      presets: [
        { label: '初回設定強制', value: '初回起動ウィザードにてパスワード設定を強制' },
        { label: '個体別一意キー', value: 'デバイス個体ごとに一意の初期パスワードをプロビジョニング' }
      ],
      craRef: 'CRA 附属書I 第I部 (1.2.b), (1.2.d)'
    }
  ]

  return {
    productName: '',
    productVersion: '',
    asserterName: '',
    asserterRole: 'Product Security Lead',
    assessmentDate: today,
    generalNotes: '',
    items: itemsDef.map((it) => ({
      ...it,
      checked: false,
      evidenceDetail: ''
    }))
  }
}

/** 入力チェック */
export function sbdAttestationWarnings(form: SbdAttestationForm): string[] {
  const w: string[] = []
  if (!form.productName.trim()) w.push('対象製品名')
  if (!form.productVersion.trim()) w.push('製品バージョン')
  if (!form.asserterName.trim()) w.push('適合宣言者・組織名')
  if (!form.items.some((it) => it.checked)) w.push('確認済みの最低限の証跡（1項目以上選択）')
  return w
}

/** 人間用 Markdown 証跡報告書の生成 */
export function generateSbdAttestationMarkdown(form: SbdAttestationForm): string {
  const prod = form.productName.trim() || '（製品名未入力）'
  const ver = form.productVersion.trim() || '（バージョン未入力）'
  const asserter = form.asserterName.trim() || '（宣言者未入力）'
  const role = form.asserterRole.trim() || '担当者'
  const date = form.assessmentDate.trim() || '（日付未設定）'

  const checkedItems = form.items.filter((it) => it.checked)
  const totalCount = form.items.length
  const checkedCount = checkedItems.length
  const percent = Math.round((checkedCount / totalCount) * 100)

  const lines: string[] = [
    `# セキュア・バイ・デザイン Minimum Evidence アテステーション宣言書`,
    '',
    `本ドキュメントは、ENISA Secure by Design and Default Playbook（Playbook 4.13, 4.14, 第5章）および EU サイバーレジリエンス法（CRA 附属書I）に基づき、製品のセキュリティ品質を立証する最低限の証跡（Minimum Evidence）をまとめた適合宣言書です。`,
    '',
    '## 1. 対象製品および宣言者情報',
    '',
    `| 項目 | 内容 |`,
    `| --- | --- |`,
    `| **対象製品名** | ${prod} |`,
    `| **対象バージョン** | ${ver} |`,
    `| **適合宣言者** | ${asserter} (${role}) |`,
    `| **評価・宣言実施日** | ${date} |`,
    `| **証跡充足率** | **${percent}%** (${checkedCount} / ${totalCount} 項目達成) |`,
    '',
    '## 2. 実証済み「最低限の証跡 (Minimum Evidence)」一覧',
    ''
  ]

  if (checkedItems.length === 0) {
    lines.push('_（確認済みの証跡項目はまだ選択されていません）_', '')
  } else {
    lines.push('| 原則 / カテゴリ | 証跡チェック項目 | 関連 CRA 必須要件 | 具体的証跡・ログ参照箇所 |')
    lines.push('| --- | --- | --- | --- |')
    checkedItems.forEach((it) => {
      const detail = it.evidenceDetail.trim() || '内部リポジトリ / CIログにて確認済み'
      lines.push(`| ${it.playbookTitle} | **${it.title}**<br>_${it.description}_ | \`${it.craRef}\` | ${detail} |`)
    })
    lines.push('')
  }

  lines.push('## 3. 未適用・レビュー中項目')
  const uncheckedItems = form.items.filter((it) => !it.checked)
  if (uncheckedItems.length === 0) {
    lines.push('_（すべての推奨証跡項目を満たしています）_', '')
  } else {
    uncheckedItems.forEach((it) => {
      lines.push(`- [ ] **${it.title}** (${it.playbookTitle}): ${it.description}`)
    })
    lines.push('')
  }

  if (form.generalNotes.trim()) {
    lines.push('## 4. 特記事項・補足コメント', '')
    lines.push(form.generalNotes.trim(), '')
  }

  lines.push(
    '---',
    '* 本アテステーション宣言書は Secriptorium（ブラウザ完結型 セキュア・バイ・デザイン支援ツール）にて動的生成されました。',
    ''
  )

  return lines.join('\n')
}

/** 機械処理可能 CycloneDX 1.6 CDXA (Declarations) JSON の生成 */
export function generateSbdAttestationCdxaJson(form: SbdAttestationForm): string {
  const prod = form.productName.trim() || 'unnamed-product'
  const ver = form.productVersion.trim() || '0.0.0'
  const date = form.assessmentDate.trim() ? `${form.assessmentDate.trim()}T00:00:00Z` : new Date().toISOString()
  const asserter = form.asserterName.trim() || 'Unknown Asserter'

  const checkedItems = form.items.filter((it) => it.checked)

  const cdxa = {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    serialNumber: `urn:uuid:${crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-000000000000'}`,
    version: 1,
    metadata: {
      timestamp: date,
      tools: {
        components: [
          {
            type: 'application',
            name: 'Secriptorium',
            description: 'Browser-based Secure by Design Attestation Generator'
          }
        ]
      },
      component: {
        'bom-ref': 'product-root',
        type: 'device',
        name: prod,
        version: ver
      }
    },
    declarations: {
      assessors: [
        {
          'bom-ref': 'assessor-1',
          thirdParty: false,
          organization: {
            name: asserter
          }
        }
      ],
      claims: checkedItems.map((it, idx) => ({
        'bom-ref': `claim-${idx + 1}`,
        target: 'product-root',
        predicate: it.title,
        mitigationStrategies: [it.description],
        reasoning: `Aligned with ENISA Playbook ${it.playbookId} and ${it.craRef}`
      })),
      evidence: checkedItems.map((it, idx) => ({
        'bom-ref': `evidence-${idx + 1}`,
        propertyName: it.title,
        description: it.evidenceDetail.trim() || 'Verified via internal CI/CD logs and repository evidence',
        claims: [`claim-${idx + 1}`]
      })),
      attestations: [
        {
          'bom-ref': 'attestation-root',
          summary: `Secure by Design Minimum Evidence Attestation for ${prod} ${ver}`,
          assessor: 'assessor-1',
          map: checkedItems.map((_, idx) => ({
            requirement: `ENISA-SBD-${idx + 1}`,
            claims: [`claim-${idx + 1}`],
            evidence: [`evidence-${idx + 1}`]
          }))
        }
      ]
    }
  }

  return JSON.stringify(cdxa, null, 2)
}

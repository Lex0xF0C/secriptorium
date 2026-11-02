import { I18N_JA } from './i18n-ja'

export interface CvdProcessItem {
  id: string
  title: string
  description: string
  completed: boolean
  completedDate: string
  notes: string
}

export interface CvdProcessPhase {
  id: string
  title: string
  description: string
  items: CvdProcessItem[]
}

export interface CvdProcessForm {
  cveId: string
  title: string
  reporter: string
  assignee: string
  receivedDate: string
  targetReleaseDate: string
  generalNotes: string
  phases: CvdProcessPhase[]
}

/** 初期フォーム状態の構築 */
export function defaultCvdProcessForm(): CvdProcessForm {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  const today = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`

  const phasesDef = I18N_JA.cvdProcessPhases || [
    {
      id: 'phase1',
      title: '1. 受領・初動対応 (Reception & Initial Response)',
      description: '報告の受付、受領確認の返信、および社内管理番号の採番と初期共有',
      items: [
        { id: 'intake_receipt', title: '受領確認応答の送信', description: '報告者に対して受領確認メールを送信（目標: 24〜48時間以内）' },
        { id: 'intake_log', title: '管理番号の採番とログ記録', description: '社内ID (CVD-YYYY-NNN等) の発行と対応チャネルのセットアップ' },
        { id: 'intake_scope', title: '対象製品・影響範囲の初期確認', description: '報告対象の製品・バージョン・サービスが自社管理下にあるか確認' }
      ]
    },
    {
      id: 'phase2',
      title: '2. 技術検証・修正作成 (Triage & Remediation)',
      description: '再現実験、CVSS評価、パッチ・回避策の開発と回帰テスト',
      items: [
        { id: 'triage_reproduce', title: '脆弱性の再現検証とCVSS評価', description: '報告内容に基づき実環境・検証環境で再現を確認し、CVSS基本値を仮算出' },
        { id: 'triage_severity', title: '深刻度確定と開発チームへの割り当て', description: '深刻度（緊急・重要・警告等）を決定し、修正担当開発チームを割り当て' },
        { id: 'patch_develop', title: '修正プログラム・回避策の作成', description: 'パッチコードの開発、またはパッチ適用不可時の回避策（Workaround）の策定' },
        { id: 'patch_test', title: '修正検証と回帰テストの実施', description: 'パッチにより脆弱性が解消されたこと、副作用が発生しないことを確認' }
      ]
    },
    {
      id: 'phase3',
      title: '3. 調整・アドバイザリ準備 (Coordination & Disclosure Prep)',
      description: '公表スケジュールの調整、CVE IDの手配、公表ドキュメントの作成',
      items: [
        { id: 'coord_embargo', title: '公表目標日（エンバーゴ）の調整・合意', description: '報告者・調整機関（IPA/JPCERT/CC等）と修正公表予定日を合意' },
        { id: 'coord_cve', title: 'CVE IDの確認・申請', description: 'CNA経由でCVE IDを取得、または既存CVEとの紐付けを確認' },
        { id: 'coord_advisory', title: 'アドバイザリ・VEXステートメントの作成', description: 'Secriptorium等を用いてMarkdownアドバイザリやCSAF VEXを作成' }
      ]
    },
    {
      id: 'phase4',
      title: '4. 修正公開・情報共有 (Release & Publication)',
      description: 'パッチの公式配信、アドバイザリ公開、謝辞の掲載とフォローアップ',
      items: [
        { id: 'release_patch', title: '修正版ソフトウェア・パッチの公式リリース', description: 'アップデートサーバーや配信ページに修正版を公開配信' },
        { id: 'release_advisory', title: '脆弱性アドバイザリの同時公開', description: '公式ポータルやsecurity.txt参照先へアドバイザリを公開' },
        { id: 'release_notify', title: '報告者への完了通知と謝辞の掲載', description: '報告者へ公開を連絡し、同意に基づき謝辞（Hall of Fame等）を掲載' }
      ]
    }
  ]

  const phases: CvdProcessPhase[] = phasesDef.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    items: p.items.map((it) => ({
      id: it.id,
      title: it.title,
      description: it.description,
      completed: false,
      completedDate: '',
      notes: ''
    }))
  }))

  return {
    cveId: '',
    title: '',
    reporter: '',
    assignee: '',
    receivedDate: today,
    targetReleaseDate: '',
    generalNotes: '',
    phases
  }
}

/** 進捗率の計算 */
export function calculateProgress(form: CvdProcessForm): { total: number; completed: number; percent: number } {
  let total = 0
  let completed = 0

  form.phases.forEach((phase) => {
    phase.items.forEach((item) => {
      total += 1
      if (item.completed) {
        completed += 1
      }
    })
  })

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, percent }
}

/** 入力警告チェック */
export function cvdProcessWarnings(form: CvdProcessForm): string[] {
  const w: string[] = []
  if (!form.cveId.trim()) w.push('管理番号 / CVE ID')
  if (!form.title.trim()) w.push('脆弱性件名・タイトル')
  if (!form.receivedDate.trim()) w.push('報告受領日')
  return w
}

/** Markdown 進捗レポートの自動生成 */
export function generateCvdProcessMarkdown(form: CvdProcessForm): string {
  const cve = form.cveId.trim() || '（未設定）'
  const title = form.title.trim() || '（タイトル未入力）'
  const reporter = form.reporter.trim() || '（未入力）'
  const assignee = form.assignee.trim() || '（未入力）'
  const received = form.receivedDate.trim() || '（未入力）'
  const targetDate = form.targetReleaseDate.trim() || '（未設定）'

  const { total, completed, percent } = calculateProgress(form)

  const barLength = 20
  const filledLength = Math.round((percent / 100) * barLength)
  const progressBar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength)

  const lines: string[] = [
    `# CVD プロセス管理進捗レポート: ${cve}`,
    '',
    `**案件タイトル**: ${title}`,
    '',
    '## 1. 案件基本情報',
    '',
    `| 項目 | 内容 |`,
    `| --- | --- |`,
    `| **管理番号 / CVE ID** | \`${cve}\` |`,
    `| **脆弱性件名** | ${title} |`,
    `| **報告者** | ${reporter} |`,
    `| **担当者 (PSIRT/Dev)** | ${assignee} |`,
    `| **報告受領日** | ${received} |`,
    `| **目標公開日 (エンバーゴ)** | ${targetDate} |`,
    `| **全体進捗率** | **${percent}%** (${completed} / ${total} ステップ完了) |`,
    '',
    `**進捗状況**: \`[${progressBar}]\` ${percent}%`,
    '',
    '## 2. タイムラインと完了実績',
    ''
  ]

  const completedItems: Array<{ phaseTitle: string; title: string; date: string; notes: string }> = []
  form.phases.forEach((phase) => {
    phase.items.forEach((item) => {
      if (item.completed) {
        completedItems.push({
          phaseTitle: phase.title,
          title: item.title,
          date: item.completedDate.trim() || '日付未記録',
          notes: item.notes.trim()
        })
      }
    })
  })

  if (completedItems.length === 0) {
    lines.push('_（完了したマイルストーンはまだありません）_', '')
  } else {
    completedItems.forEach((item) => {
      let lineStr = `- **[${item.date}]** ${item.title} _(${item.phaseTitle})_`
      if (item.notes) {
        lineStr += `\n  - 補足: ${item.notes}`
      }
      lines.push(lineStr)
    })
    lines.push('')
  }

  lines.push('## 3. 対応フェーズ別チェックリスト詳細', '')

  form.phases.forEach((phase) => {
    lines.push(`### ${phase.title}`)
    if (phase.description) {
      lines.push(`_${phase.description}_`, '')
    }

    phase.items.forEach((item) => {
      const checkMark = item.completed ? '[x]' : '[ ]'
      const dateStr = item.completedDate.trim() ? ` (完了日: ${item.completedDate.trim()})` : ''
      lines.push(`- ${checkMark} **${item.title}**${dateStr}`)
      lines.push(`  ${item.description}`)
      if (item.notes.trim()) {
        lines.push(`  - 📝 メモ: ${item.notes.trim()}`)
      }
    })
    lines.push('')
  })

  if (form.generalNotes.trim()) {
    lines.push('## 4. 全体備考・特記事項', '')
    lines.push(form.generalNotes.trim(), '')
  }

  lines.push(
    '---',
    '* 本進捗レポートは Secriptorium CVDプロセス管理ツール（完全ブラウザ完結型）にて動的生成されました。',
    ''
  )

  return lines.join('\n')
}

/** バックアップ用 JSON データの生成 */
export function generateCvdProcessJson(form: CvdProcessForm): string {
  const { total, completed, percent } = calculateProgress(form)
  const exportData = {
    generator: 'Secriptorium CVD Process Manager',
    exportedAt: new Date().toISOString(),
    progress: {
      totalItems: total,
      completedItems: completed,
      percentComplete: percent
    },
    metadata: {
      cveId: form.cveId,
      title: form.title,
      reporter: form.reporter,
      assignee: form.assignee,
      receivedDate: form.receivedDate,
      targetReleaseDate: form.targetReleaseDate,
      generalNotes: form.generalNotes
    },
    phases: form.phases
  }
  return JSON.stringify(exportData, null, 2)
}

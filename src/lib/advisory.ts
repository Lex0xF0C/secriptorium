// フォームの型、CVSS v3.1 の計算、Markdown と CSAF 2.0 の生成ロジック。
// 画面（App.vue）から切り離してあり、Vue に依存しません。

export interface Product {
  name: string
  version: string
}

export interface AdvisoryForm {
  title: string
  advisoryId: string // CSAF の tracking.id にもなる
  publisherName: string
  publisherNamespace: string // 発行者の URL（https://...）
  cve: string
  published: string // yyyy-mm-dd
  summary: string
  products: Product[]
  cwe: string // 例: "CWE-79 クロスサイト・スクリプティング"
  description: string
  impact: string
  cvssVector: string // 例: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
  fix: string
  workaround: string
  refs: string
  contact: string
}

export function emptyForm(): AdvisoryForm {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return {
    title: '',
    advisoryId: '',
    publisherName: '',
    publisherNamespace: '',
    cve: '',
    published: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    summary: '',
    products: [{ name: '', version: '' }],
    cwe: '',
    description: '',
    impact: '',
    cvssVector: '',
    fix: '',
    workaround: '',
    refs: '',
    contact: '',
  }
}

const T = (s: string) => s.trim()
const lines = (s: string) => T(s).split('\n').map(T).filter(Boolean)
const oneLine = (s: string) => T(s).replace(/\s*\n\s*/g, ' ')
const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ')

export const cveList = (s: string) => T(s).split(/[,、\s]+/).filter(Boolean)
export const cveOk = (c: string) => /^CVE-\d{4}-\d{4,}$/i.test(c)

// ---- CVSS v3.1（基本値） ----------------------------------------------

export type Severity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type Metrics = Record<string, string>

const ALLOWED: Record<string, string> = {
  AV: 'NALP', AC: 'LH', PR: 'NLH', UI: 'NR', S: 'UC', C: 'HLN', I: 'HLN', A: 'HLN',
}

/** ベクター文字列を解析する。8項目がそろった v3.1 形式でなければ null。 */
export function parseCvss31(vector: string): Metrics | null {
  const parts = T(vector).split('/')
  if (parts[0] !== 'CVSS:3.1') return null
  const m: Metrics = {}
  for (const part of parts.slice(1)) {
    const [k, v] = part.split(':')
    if (!k || !v || !(k in ALLOWED) || k in m || v.length !== 1 || !ALLOWED[k].includes(v)) return null
    m[k] = v
  }
  return Object.keys(ALLOWED).every((k) => k in m) ? m : null
}

const W = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 } as Record<string, number>,
  AC: { L: 0.77, H: 0.44 } as Record<string, number>,
  UI: { N: 0.85, R: 0.62 } as Record<string, number>,
  CIA: { H: 0.56, L: 0.22, N: 0 } as Record<string, number>,
  PR_U: { N: 0.85, L: 0.62, H: 0.27 } as Record<string, number>,
  PR_C: { N: 0.85, L: 0.68, H: 0.5 } as Record<string, number>,
}

function roundup(x: number): number {
  const i = Math.round(x * 100000)
  return i % 10000 === 0 ? i / 100000 : (Math.floor(i / 10000) + 1) / 10
}

export function cvssScore(m: Metrics): number {
  const changed = m.S === 'C'
  const iss = 1 - (1 - W.CIA[m.C]) * (1 - W.CIA[m.I]) * (1 - W.CIA[m.A])
  const impact = changed ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15) : 6.42 * iss
  const pr = (changed ? W.PR_C : W.PR_U)[m.PR]
  const exploit = 8.22 * W.AV[m.AV] * W.AC[m.AC] * pr * W.UI[m.UI]
  if (impact <= 0) return 0
  return changed ? roundup(Math.min(1.08 * (impact + exploit), 10)) : roundup(Math.min(impact + exploit, 10))
}

export function severityOf(score: number): Severity {
  if (score === 0) return 'NONE'
  if (score < 4) return 'LOW'
  if (score < 7) return 'MEDIUM'
  if (score < 9) return 'HIGH'
  return 'CRITICAL'
}

export const SEVERITY_JA: Record<Severity, string> = {
  NONE: 'なし', LOW: '注意', MEDIUM: '警告', HIGH: '重要', CRITICAL: '緊急',
}

/** ベクターから基本スコアと深刻度を求める（形式が正しくなければ null）。 */
export function cvssSummary(vector: string): { score: number; severity: Severity } | null {
  const m = parseCvss31(vector)
  if (!m) return null
  const score = cvssScore(m)
  return { score, severity: severityOf(score) }
}

// ---- Markdown ---------------------------------------------------------

export function buildMarkdown(f: AdvisoryForm): string {
  const L: string[] = []
  const cv = cvssSummary(f.cvssVector)
  const products = f.products.filter((p) => T(p.name) || T(p.version))

  L.push(`# ${oneLine(f.title) || '（タイトル未入力）'}`, '')

  const meta: [string, string][] = []
  if (T(f.advisoryId)) meta.push(['管理番号', T(f.advisoryId)])
  if (cv) meta.push(['深刻度', `${SEVERITY_JA[cv.severity]}（CVSS ${cv.score.toFixed(1)}）`])
  if (f.published) meta.push(['公開日', f.published])
  if (meta.length) {
    L.push('| 項目 | 内容 |', '| --- | --- |')
    meta.forEach(([k, v]) => L.push(`| ${k} | ${esc(v)} |`))
    L.push('')
  }

  if (T(f.summary)) L.push('## 概要', '', T(f.summary), '')

  if (products.length) {
    L.push('## 該当製品', '', '| 製品名 | 該当バージョン |', '| --- | --- |')
    products.forEach((p) => L.push(`| ${esc(T(p.name))} | ${esc(T(p.version))} |`))
    L.push('')
  }

  if (T(f.description) || T(f.cwe)) {
    L.push('## 脆弱性の説明', '')
    if (T(f.description)) L.push(T(f.description), '')
    if (T(f.cwe)) L.push(`- ${oneLine(f.cwe)}`, '')
  }

  if (T(f.impact) || cv) {
    L.push('## 脆弱性がもたらす脅威', '')
    if (T(f.impact)) L.push(T(f.impact), '')
    if (cv) {
      L.push(`- CVSS v3.1 基本値：${cv.score.toFixed(1)}（${SEVERITY_JA[cv.severity]}）`)
      L.push(`- ベクター：${T(f.cvssVector)}`, '')
    }
  }

  if (T(f.fix)) L.push('## 対策方法', '', T(f.fix), '')
  if (T(f.workaround)) L.push('## 回避策', '', T(f.workaround), '')

  const rel = cveList(f.cve).map((c) => (cveOk(c) ? c.toUpperCase() : c)).concat(lines(f.refs))
  if (rel.length) {
    L.push('## 関連情報', '')
    rel.forEach((r) => L.push(`- ${r}`))
    L.push('')
  }

  if (f.published) L.push('## 更新履歴', '', `- ${f.published} この脆弱性情報を公開しました。`, '')
  if (T(f.contact)) L.push('## 連絡先', '', T(f.contact), '')

  return L.join('\n').replace(/\n+$/, '\n')
}

// ---- CSAF 2.0 ---------------------------------------------------------

function parseCwe(s: string): { id: string; name: string } | null {
  const m = T(s).match(/^(CWE-\d+)\s*(.*)$/i)
  return m ? { id: m[1].toUpperCase(), name: T(m[2]) || m[1].toUpperCase() } : null
}

/** CSAF として足りない項目の名前を返す（空なら、必須項目はそろっている）。 */
export function csafWarnings(f: AdvisoryForm): string[] {
  const w: string[] = []
  const cves = cveList(f.cve)
  if (!T(f.title)) w.push('タイトル')
  if (!T(f.advisoryId)) w.push('管理番号（tracking.id）')
  if (!T(f.publisherName)) w.push('発行者名')
  if (!/^https?:\/\//.test(T(f.publisherNamespace))) w.push('発行者のURL（https:// で始まる）')
  if (!T(f.published)) w.push('公開日')
  if (!f.products.some((p) => T(p.name) && T(p.version))) w.push('影響を受ける製品とバージョン')
  if (cves.length === 0 || !cves.every(cveOk)) w.push('CVE番号（CVE-YYYY-NNNN の形式）')
  if (!parseCwe(f.cwe)) w.push('CWE（CWE-79 のような形式で始める）')
  if (!cvssSummary(f.cvssVector)) w.push('CVSS v3.1 ベクター')
  return w
}

export function buildCsaf(f: AdvisoryForm) {
  const products = f.products.filter((p) => T(p.name) || T(p.version))
  const ids = products.map((_, i) => `CSAFPID-${String(i + 1).padStart(4, '0')}`)
  const vendor = T(f.publisherName)
  // 日付は UTC の 00:00 として出力します（必要なら +09:00 などに変更してください）
  const date = T(f.published) ? `${T(f.published)}T00:00:00Z` : ''
  const cwe = parseCwe(f.cwe)
  const cv = cvssSummary(f.cvssVector)
  const refs = lines(f.refs)
    .filter((l) => /^https?:\/\//.test(l))
    .map((url) => ({ url, summary: url, category: 'external' }))

  const notes = []
  if (T(f.description)) notes.push({ category: 'description', title: '脆弱性の説明', text: T(f.description) })
  if (T(f.impact)) notes.push({ category: 'details', title: '脆弱性がもたらす脅威', text: T(f.impact) })

  const remediations = []
  if (T(f.fix)) remediations.push({ category: 'vendor_fix', details: T(f.fix), product_ids: ids.length ? ids : undefined })
  if (T(f.workaround)) remediations.push({ category: 'workaround', details: T(f.workaround), product_ids: ids.length ? ids : undefined })

  const vulnBase = {
    cwe: cwe ?? undefined,
    notes: notes.length ? notes : undefined,
    product_status: ids.length ? { known_affected: ids } : undefined,
    remediations: remediations.length ? remediations : undefined,
    scores:
      cv && ids.length
        ? [{
            products: ids,
            cvss_v3: {
              version: '3.1',
              vectorString: T(f.cvssVector),
              baseScore: cv.score,
              baseSeverity: cv.severity,
            },
          }]
        : undefined,
    references: refs.length ? refs : undefined,
  }
  const cves = cveList(f.cve).filter(cveOk).map((c) => c.toUpperCase())

  const docNotes = []
  if (T(f.summary)) docNotes.push({ category: 'summary', title: '概要', text: T(f.summary) })
  if (T(f.contact)) docNotes.push({ category: 'other', title: '連絡先', text: T(f.contact) })

  // undefined の項目は JSON.stringify で自動的に省かれます
  return {
    document: {
      category: 'csaf_security_advisory',
      csaf_version: '2.0',
      lang: 'ja',
      title: oneLine(f.title),
      publisher: { category: 'vendor', name: vendor, namespace: T(f.publisherNamespace) },
      tracking: {
        id: T(f.advisoryId),
        status: 'final',
        version: '1',
        initial_release_date: date,
        current_release_date: date,
        revision_history: [{ date, number: '1', summary: 'Initial release' }],
      },
      notes: docNotes.length ? docNotes : undefined,
    },
    product_tree: products.length
      ? {
          branches: [{
            category: 'vendor',
            name: vendor,
            branches: products.map((p, i) => ({
              category: 'product_name',
              name: T(p.name),
              branches: [{
                category: 'product_version',
                name: T(p.version) || 'unknown',
                product: { name: `${T(p.name)} ${T(p.version)}`.trim(), product_id: ids[i] },
              }],
            })),
          }],
        }
      : undefined,
    vulnerabilities: (cves.length ? cves : [undefined]).map((cve) => ({ cve, ...vulnBase })),
  }
}

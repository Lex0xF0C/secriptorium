// CVSS v3.0 / v3.1 の基本値（Base）の計算と、項目の定義（名称・説明文）。
// Vue に依存しません。
// CVSS は FIRST.Org, Inc. が所有・管理する規格です（条件のもとで使用しています）。
// 仕様: https://www.first.org/cvss/v3.1/specification-document
//       https://www.first.org/cvss/v3.0/specification-document

export type CvssVersion = '3.0' | '3.1'
export type Severity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type Metrics = Record<string, string>

export interface MetricOption {
  code: string
  label: string
  desc: string
}
export interface MetricDef {
  code: string
  name: string
  desc: string
  options: MetricOption[]
}

// 項目の定義（画面の「項目を選んで計算する」で使う、日本語の名称と説明文）
export const METRICS: MetricDef[] = [
  {
    code: "AV",
    name: "攻撃元区分（AV）",
    desc: "攻撃者がどこから脆弱性を悪用できるか。",
    options: [
      { code: "N", label: "ネットワーク", desc: "インターネットなど、離れたネットワークから攻撃できる。" },
      { code: "A", label: "隣接", desc: "同一セグメントや無線LANなど、近いネットワーク内からのみ攻撃できる。" },
      { code: "L", label: "ローカル", desc: "機器に直接ログインするか、ファイルを開かせるなどの方法で攻撃する。" },
      { code: "P", label: "物理", desc: "機器に物理的に接触して攻撃する必要がある。" },
    ],
  },
  {
    code: "AC",
    name: "攻撃条件の複雑さ（AC）",
    desc: "攻撃の成否が、攻撃者に制御できない条件にどれだけ左右されるか。",
    options: [
      { code: "L", label: "低", desc: "特別な条件なしに、何度でも攻撃が成功する。" },
      { code: "H", label: "高", desc: "特定の設定やタイミングなど、攻撃者が制御できない条件がそろう必要がある。" },
    ],
  },
  {
    code: "PR",
    name: "必要な特権レベル（PR）",
    desc: "攻撃の前に、攻撃者が持っている必要のある権限。",
    options: [
      { code: "N", label: "不要", desc: "認証なしで攻撃できる。" },
      { code: "L", label: "低", desc: "一般ユーザー程度の権限が必要。" },
      { code: "H", label: "高", desc: "管理者など、強い権限が必要。" },
    ],
  },
  {
    code: "UI",
    name: "ユーザー関与レベル（UI）",
    desc: "攻撃の成立に、攻撃者以外の利用者の操作が必要か。",
    options: [
      { code: "N", label: "不要", desc: "利用者の操作なしで攻撃できる。" },
      { code: "R", label: "要", desc: "リンクのクリックやファイルを開くなど、利用者の操作が必要。" },
    ],
  },
  {
    code: "S",
    name: "スコープ（S）",
    desc: "脆弱なコンポーネントを越えて、別の権限管理の範囲にまで影響が及ぶか。",
    options: [
      { code: "U", label: "変更なし", desc: "影響は、脆弱なコンポーネント自身の権限範囲にとどまる。" },
      { code: "C", label: "変更あり", desc: "別のコンポーネントにも影響が及ぶ（例：仮想マシンから外側のホストOSへ）。" },
    ],
  },
  {
    code: "C",
    name: "機密性への影響（C）",
    desc: "情報が漏えいする度合い。",
    options: [
      { code: "H", label: "高", desc: "すべての情報、または重大な情報が漏えいする。" },
      { code: "L", label: "低", desc: "一部の情報が漏えいするが、攻撃者が選べる範囲は限られる。" },
      { code: "N", label: "なし", desc: "情報は漏えいしない。" },
    ],
  },
  {
    code: "I",
    name: "完全性への影響（I）",
    desc: "情報が改ざんされる度合い。",
    options: [
      { code: "H", label: "高", desc: "すべての情報、または重大な情報を改ざんできる。" },
      { code: "L", label: "低", desc: "一部を改ざんできるが、攻撃者が制御できる範囲は限られる。" },
      { code: "N", label: "なし", desc: "改ざんはできない。" },
    ],
  },
  {
    code: "A",
    name: "可用性への影響（A）",
    desc: "サービスや機能が使えなくなる度合い。",
    options: [
      { code: "H", label: "高", desc: "完全に停止させられる、または機能を継続的に失わせられる。" },
      { code: "L", label: "低", desc: "性能低下や一部機能の中断は起こるが、完全には停止しない。" },
      { code: "N", label: "なし", desc: "可用性への影響はない。" },
    ],
  },
]

const ALLOWED: Record<string, string> = Object.fromEntries(
  METRICS.map((m) => [m.code, m.options.map((o) => o.code).join('')]),
)
const ORDER = METRICS.map((m) => m.code)

/** ベクター文字列を解析する。8項目がそろった v3.0 / v3.1 形式でなければ null。 */
export function parseCvss(vector: string): { version: CvssVersion; metrics: Metrics } | null {
  const parts = vector.trim().split('/')
  const version = parts[0] === 'CVSS:3.1' ? '3.1' : parts[0] === 'CVSS:3.0' ? '3.0' : null
  if (!version) return null
  const metrics: Metrics = {}
  for (const part of parts.slice(1)) {
    const [k, v] = part.split(':')
    if (!k || !v || !(k in ALLOWED) || k in metrics || v.length !== 1 || !ALLOWED[k].includes(v)) return null
    metrics[k] = v
  }
  return ORDER.every((k) => k in metrics) ? { version, metrics } : null
}

/** 選択から、ベクター文字列を作る。8項目がそろっていなければ空文字。 */
export function buildVector(version: CvssVersion, metrics: Metrics): string {
  if (!ORDER.every((k) => metrics[k])) return ''
  return `CVSS:${version}/` + ORDER.map((k) => `${k}:${metrics[k]}`).join('/')
}

const W = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 } as Record<string, number>,
  AC: { L: 0.77, H: 0.44 } as Record<string, number>,
  UI: { N: 0.85, R: 0.62 } as Record<string, number>,
  CIA: { H: 0.56, L: 0.22, N: 0 } as Record<string, number>,
  PR_U: { N: 0.85, L: 0.62, H: 0.27 } as Record<string, number>,
  PR_C: { N: 0.85, L: 0.68, H: 0.5 } as Record<string, number>,
}

// 切り上げの定義だけが、v3.0 と v3.1 で異なります。
// v3.0: 小数第1位への単純な切り上げ。v3.1: 浮動小数点の誤差を避ける定義。
function roundup30(x: number): number {
  return Math.ceil(x * 10) / 10
}
function roundup31(x: number): number {
  const i = Math.round(x * 100000)
  return i % 10000 === 0 ? i / 100000 : (Math.floor(i / 10000) + 1) / 10
}

export function cvssScore(version: CvssVersion, m: Metrics): number {
  const roundup = version === '3.0' ? roundup30 : roundup31
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

/** ベクターから、バージョン・基本スコア・深刻度を求める（形式が正しくなければ null）。 */
export function cvssSummary(vector: string): { version: CvssVersion; score: number; severity: Severity } | null {
  const p = parseCvss(vector)
  if (!p) return null
  const score = cvssScore(p.version, p.metrics)
  return { version: p.version, score, severity: severityOf(score) }
}

// src/lib/vex.ts

import { cveList, cveOk } from './advisory'

export type VexStatus = 'known_not_affected' | 'known_affected' | 'fixed' | 'under_investigation'

export type VexJustification =
  | 'vulnerable_code_not_present'
  | 'vulnerable_code_not_in_execute_path'
  | 'vulnerable_code_cannot_be_controlled_by_adversary'
  | 'inline_mitigations_already_exist'
  | ''

export interface VexProduct {
  name: string
  version: string
  status: VexStatus
  justification: VexJustification
  detail: string // 補足説明や緩和策・修正パッチURL
}

export interface VexForm {
  cve: string // 対象のCVE番号（例: CVE-2026-1234）
  advisoryId: string // 文書管理番号（例: VEX-2026-001）
  publisherName: string // 発行者名
  publisherNamespace: string // 発行者URL（https://...）
  published: string // 公開日 (yyyy-mm-dd)
  summary: string // 調査の全体概要
  products: VexProduct[] // 製品ポートフォリオ一覧
  refs: string // 参照リンク
  contact: string // 問い合わせ窓口
}

export function emptyVexForm(): VexForm {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return {
    cve: '',
    advisoryId: '',
    publisherName: '',
    publisherNamespace: '',
    published: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    summary: '',
    products: [
      { name: '', version: '', status: 'known_not_affected', justification: 'vulnerable_code_not_present', detail: '' }
    ],
    refs: '',
    contact: '',
  }
}

const T = (s: string) => s.trim()
const lines = (s: string) => T(s).split('\n').map(T).filter(Boolean)
const oneLine = (s: string) => T(s).replace(/\s*\n\s*/g, ' ')

/** CSAF VEX として不足している必須項目の検証 */
export function vexWarnings(f: VexForm): string[] {
  const w: string[] = []
  const cves = cveList(f.cve)

  if (cves.length === 0 || !cves.every(cveOk)) w.push('対象CVE番号（CVE-YYYY-NNNN 形式）')
  if (!T(f.advisoryId)) w.push('管理番号（tracking.id）')
  if (!T(f.publisherName)) w.push('発行者名')
  if (!/^https?:\/\//.test(T(f.publisherNamespace))) w.push('発行者のURL（https:// で始まる）')
  if (!T(f.published)) w.push('公開日')
  if (!f.products.some((p) => T(p.name) && T(p.version))) w.push('対象製品とバージョン')

  return w
}

/** CSAF 2.0 VEX (csaf_vex) JSON の生成 */
export function buildCsafVex(f: VexForm) {
  const validProducts = f.products.filter((p) => T(p.name) || T(p.version))
  const date = T(f.published) ? `${T(f.published)}T00:00:00Z` : ''
  const vendor = T(f.publisherName)

  // 製品ごとにユニークな Product ID を採番
  const prodWithIds = validProducts.map((p, i) => ({
    ...p,
    id: `CSAFPID-${String(i + 1).padStart(4, '0')}`
  }))

  // ステータスごとの Product ID グルーピング
  const statusGroup: Record<VexStatus, string[]> = {
    known_not_affected: [],
    known_affected: [],
    fixed: [],
    under_investigation: []
  }

  prodWithIds.forEach((p) => {
    statusGroup[p.status].push(p.id)
  })

  // not_affected 時の Justification (flags) の構築
  const flags: any[] = []
  const notAffectedProds = prodWithIds.filter((p) => p.status === 'known_not_affected' && p.justification)
  const justGroup: Record<string, string[]> = {}
  notAffectedProds.forEach((p) => {
    if (!justGroup[p.justification]) justGroup[p.justification] = []
    justGroup[p.justification].push(p.id)
  })
  Object.entries(justGroup).forEach(([just, ids]) => {
    flags.push({ label: just, product_ids: ids })
  })

  // 補足コメント（threats / remediations）の構築
  const remediations: any[] = []
  const threats: any[] = []
  prodWithIds.forEach((p) => {
    if (T(p.detail)) {
      if (p.status === 'fixed' || p.status === 'known_affected') {
        remediations.push({
          category: p.status === 'fixed' ? 'vendor_fix' : 'workaround',
          details: `${T(p.name)} ${T(p.version)}: ${T(p.detail)}`,
          product_ids: [p.id]
        })
      } else {
        threats.push({
          category: 'impact',
          details: `${T(p.name)} ${T(p.version)}: ${T(p.detail)}`,
          product_ids: [p.id]
        })
      }
    }
  })

  const refs = lines(f.refs)
    .filter((l) => /^https?:\/\//.test(l))
    .map((url) => ({ url, summary: url, category: 'external' }))

  const cves = cveList(f.cve).filter(cveOk).map((c) => c.toUpperCase())

  return {
    document: {
      category: 'csaf_vex',
      csaf_version: '2.0',
      lang: 'ja',
      title: `VEX Statement for ${cves.join(', ') || 'CVE'}`,
      publisher: { category: 'vendor', name: vendor, namespace: T(f.publisherNamespace) },
      tracking: {
        id: T(f.advisoryId),
        status: 'final',
        version: '1',
        initial_release_date: date,
        current_release_date: date,
        revision_history: [{ date, number: '1', summary: 'Initial VEX release' }]
      },
      notes: T(f.summary) ? [{ category: 'summary', title: '概要', text: T(f.summary) }] : undefined
    },
    product_tree: validProducts.length
      ? {
          branches: [
            {
              category: 'vendor',
              name: vendor,
              branches: validProducts.map((p, i) => ({
                category: 'product_name',
                name: T(p.name),
                branches: [
                  {
                    category: 'product_version',
                    name: T(p.version) || 'unknown',
                    product: { name: `${T(p.name)} ${T(p.version)}`.trim(), product_id: prodWithIds[i].id }
                  }
                ]
              }))
            }
          ]
        }
      : undefined,
    vulnerabilities: (cves.length ? cves : [undefined]).map((cve) => ({
      cve,
      product_status: {
        known_not_affected: statusGroup.known_not_affected.length ? statusGroup.known_not_affected : undefined,
        known_affected: statusGroup.known_affected.length ? statusGroup.known_affected : undefined,
        fixed: statusGroup.fixed.length ? statusGroup.fixed : undefined,
        under_investigation: statusGroup.under_investigation.length ? statusGroup.under_investigation : undefined
      },
      flags: flags.length ? flags : undefined,
      threats: threats.length ? threats : undefined,
      remediations: remediations.length ? remediations : undefined,
      references: refs.length ? refs : undefined
    }))
  }
}

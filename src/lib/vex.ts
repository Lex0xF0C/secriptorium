import { cveList, cveOk } from './advisory'
import { I18N_JA } from './i18n-ja'

export type VexStatus = 'known_not_affected' | 'known_affected' | 'fixed' | 'under_investigation'

export type VexJustification =
  | 'vulnerable_code_not_present'
  | 'vulnerable_code_not_in_execute_path'
  | 'vulnerable_code_cannot_be_controlled_by_adversary'
  | 'inline_mitigations_already_exist'
  | ''

export type VexActionCategory = 'vendor_fix' | 'workaround' | 'mitigation' | 'none_available' | 'impact'

export interface VexProduct {
  name: string
  version: string
  status: VexStatus
  justification: VexJustification
  actionCategory: VexActionCategory // ★ 明示的分類
  detail: string
}

export interface VexForm {
  cve: string
  advisoryId: string
  publisherName: string
  publisherNamespace: string
  published: string
  summary: string
  products: VexProduct[]
  refs: string
  contact: string
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
      { name: '', version: '', status: 'known_not_affected', justification: 'vulnerable_code_not_present', actionCategory: 'impact', detail: '' }
    ],
    refs: '',
    contact: '',
  }
}

const T = (s: unknown) => (typeof s === 'string' ? s.trim() : String(s || '').trim())
const lines = (s: string) => T(s).split('\n').map(T).filter(Boolean)

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

/** Excel / スプレッドシートからの TSV パース */
export function parseVexProducts(text: string): { products: VexProduct[]; warnings: string[] } {
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const products: VexProduct[] = []
  const warnings: string[] = []

  rawLines.forEach((line, idx) => {
    if (idx === 0 && /^(製品|プロダクト|Product|Name|名称)\b/i.test(line)) {
      return
    }

    const cols = line.split('\t').map((c) => c.trim())
    if (cols.length === 0 || !cols[0]) return

    const name = cols[0]
    const version = cols[1] || ''
    const rawStatus = cols[2] || ''
    const rawJust = cols[3] || ''
    const detail = cols[4] || cols.slice(3).join(' ')

    let status: VexStatus = 'known_not_affected'
    const sLower = rawStatus.toLowerCase()
    if (sLower.includes('affected') || sLower.includes('影響あり') || sLower.includes('対象')) {
      if (sLower.includes('not') || sLower.includes('影響なし') || sLower.includes('対象外')) {
        status = 'known_not_affected'
      } else {
        status = 'known_affected'
      }
    } else if (sLower.includes('fixed') || sLower.includes('修正') || sLower.includes('対応済')) {
      status = 'fixed'
    } else if (sLower.includes('investigation') || sLower.includes('調査') || sLower.includes('確認中')) {
      status = 'under_investigation'
    }

    let justification: VexJustification = status === 'known_not_affected' ? 'vulnerable_code_not_present' : ''
    const jLower = rawJust.toLowerCase()
    if (jLower.includes('not_in_execute_path') || jLower.includes('実行パス') || jLower.includes('経路')) {
      justification = 'vulnerable_code_not_in_execute_path'
    } else if (jLower.includes('cannot_be_controlled') || jLower.includes('制御不能')) {
      justification = 'vulnerable_code_cannot_be_controlled_by_adversary'
    } else if (jLower.includes('mitigations') || jLower.includes('緩和策')) {
      justification = 'inline_mitigations_already_exist'
    } else if (jLower.includes('not_present') || jLower.includes('未搭載') || jLower.includes('存在しない')) {
      justification = 'vulnerable_code_not_present'
    }

    // デフォルトの分類設定
    let actionCategory: VexActionCategory = 'impact'
    if (status === 'fixed') {
      actionCategory = 'vendor_fix'
    } else if (status === 'known_affected') {
      actionCategory = 'workaround'
    }

    products.push({
      name,
      version,
      status,
      justification,
      actionCategory,
      detail: cols[4] ? detail : (rawJust && !justification ? rawJust : detail)
    })
  })

  if (products.length === 0 && rawLines.length > 0) {
    warnings.push('有効な製品データが検出できませんでした。タブ区切り（TSV）形式になっているか確認してください。')
  }

  return { products, warnings }
}

export function toVexTsv(products: VexProduct[]): string {
  const statusJA = I18N_JA?.vex?.status || {}
  const justJA = I18N_JA?.vex?.justification || {}

  const header = '製品名\tバージョン\tステータス\t影響なし理由\t補足メモ'
  const rows = products
    .filter((p) => T(p.name) || T(p.version))
    .map((p) => [
      p.name,
      p.version,
      statusJA[p.status] || p.status,
      p.status === 'known_not_affected' ? (justJA[p.justification] || p.justification) : '',
      p.detail
    ].join('\t'))

  return [header, ...rows].join('\n')
}

/** CSAF 2.0 VEX (csaf_vex) JSON の生成 */
export function buildCsafVex(f: VexForm) {
  const validProducts = f.products.filter((p) => T(p.name) || T(p.version))
  const date = T(f.published) ? `${T(f.published)}T00:00:00Z` : ''
  const vendor = T(f.publisherName) || 'Vendor'

  const prodWithIds = validProducts.map((p, i) => ({
    ...p,
    id: `CSAFPID-${String(i + 1).padStart(4, '0')}`
  }))

  const statusGroup: Record<VexStatus, string[]> = {
    known_not_affected: [],
    known_affected: [],
    fixed: [],
    under_investigation: []
  }

  prodWithIds.forEach((p) => {
    statusGroup[p.status].push(p.id)
  })

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

  const remediations: any[] = []
  const threats: any[] = []

  // ★ 明示的な actionCategory を元に CSAF 構造へ割り当て
  prodWithIds.forEach((p) => {
    if (!T(p.detail)) return

    const detailText = `${T(p.name)} ${T(p.version)}: ${T(p.detail)}`
    const cat = p.actionCategory || (p.status === 'fixed' ? 'vendor_fix' : 'impact')

    if (['vendor_fix', 'workaround', 'mitigation', 'none_available'].includes(cat)) {
      remediations.push({
        category: cat,
        details: detailText,
        product_ids: [p.id]
      })
    } else {
      threats.push({
        category: 'impact',
        details: detailText,
        product_ids: [p.id]
      })
    }
  })

  const refs = lines(f.refs)
    .filter((l) => /^https?:\/\//.test(l))
    .map((url) => ({ url, summary: url, category: 'external' }))

  const cves = cveList(f.cve).filter(cveOk).map((c) => c.toUpperCase())

  // ★1. 製品名 (p.name) ごとにグループ化する
  const productGroupMap = new Map<string, typeof prodWithIds>()
  prodWithIds.forEach((p) => {
    const pName = T(p.name) || 'Unknown Product'
    if (!productGroupMap.has(pName)) {
      productGroupMap.set(pName, [])
    }
    productGroupMap.get(pName)!.push(p)
  })

  // ★2. グループ化した製品名の下に各バージョンブランチを並べる
  const productBranches = Array.from(productGroupMap.entries()).map(([pName, items]) => ({
    category: 'product_name',
    name: pName,
    branches: items.map((item) => ({
      category: 'product_version',
      name: T(item.version) || 'unknown',
      product: {
        name: `${T(item.name)} ${T(item.version)}`.trim(),
        product_id: item.id
      }
    }))
  }))

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
    
    // ★3. 重複が解消されたスマートなプロダクトツリーを出力
    product_tree: validProducts.length
      ? {
          branches: [
            {
              category: 'vendor',
              name: vendor,
              branches: productBranches
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

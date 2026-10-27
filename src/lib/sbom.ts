// SBOM / VEX のデータ型、貼り付け（TSV / CSV）の解析、PURL の生成、
// CycloneDX (JSON) の生成、入力チェック、デモデータ。Vue に依存しません。
//
// 設計の要点
// - 部品表（SBOM）と、脆弱性ごとの判定（VEX）は、別の表として持つ。
//   VEX の1件は「どの脆弱性（CVE）が、どの部品に対して、どういう状態か」を表すため。
// - 出力は、入力データだけで決まる（同じ入力なら同じ出力）。
//   シリアル番号と作成時刻は、入力データの側（SbomForm）に持たせる。
// - 貼り付けた内容は、プレーンテキストとして解析する。サイズに上限を設ける。
// - 入力にない値を、勝手に補わない（バージョンが空なら空のまま。チェックで知らせる）。

// ---- 型 ---------------------------------------------------------------

export const LIMITS = { maxChars: 200_000, maxRows: 2000, maxField: 200, maxStatements: 500 }

export const ECOSYSTEMS = ['generic', 'npm', 'pypi', 'maven', 'golang', 'nuget', 'cargo'] as const
export type Ecosystem = (typeof ECOSYSTEMS)[number]

export const COMPONENT_TYPES = ['library', 'framework', 'application', 'operating-system', 'firmware'] as const
export type ComponentType = (typeof COMPONENT_TYPES)[number]

export const ROOT_TYPES = ['application', 'firmware', 'device'] as const
export type RootType = (typeof ROOT_TYPES)[number]

export interface SbomComponent {
  id: string // 画面上の行の識別用（出力には使わない）
  name: string
  version: string
  supplier: string
  ecosystem: Ecosystem
  type: ComponentType
}

// 状態の名前は、VEX で共通して使われる言葉にしておく。CycloneDX の言葉への変換は出力時に行う。
export const VEX_STATES = ['not_affected', 'affected', 'under_investigation', 'fixed'] as const
export type VexState = (typeof VEX_STATES)[number]

// CycloneDX の analysis.justification の値
export const JUSTIFICATIONS = [
  'code_not_present',
  'code_not_reachable',
  'requires_configuration',
  'requires_dependency',
  'requires_environment',
  'protected_by_compiler',
  'protected_at_runtime',
  'protected_at_perimeter',
  'protected_by_mitigating_control',
] as const
export type Justification = (typeof JUSTIFICATIONS)[number]

export interface VexStatement {
  id: string
  cve: string
  componentId: string // SbomComponent.id
  state: VexState
  justification: Justification | '' // state が not_affected のときだけ使う
  detail: string
}

export interface SbomForm {
  appName: string
  appVersion: string
  appType: RootType
  appSupplier: string // 製造元（任意）
  author: string // この文書の作成者
  serial: string // SBOM のシリアル番号（UUID）
  vexSerial: string // VEX のシリアル番号（UUID）
  timestamp: string // 作成時刻（ISO 8601）
  isDemo: boolean
  components: SbomComponent[]
  statements: VexStatement[]
}

// 画面に出す日本語の名前と説明
export const STATE_JA: Record<VexState, string> = {
  not_affected: '影響なし',
  affected: '影響あり',
  under_investigation: '調査中',
  fixed: '修正済み',
}

export const TYPE_JA: Record<ComponentType, string> = {
  library: 'ライブラリ',
  framework: 'フレームワーク',
  application: 'アプリケーション',
  'operating-system': 'OS',
  firmware: 'ファームウェア',
}
export const ROOT_JA: Record<RootType, string> = {
  application: 'アプリケーション',
  firmware: 'ファームウェア',
  device: '機器（デバイス）',
}

// 「影響なし」と言える理由。上ほど、よくある理由
export const JUSTIFICATION_JA: Record<Justification, string> = {
  code_not_present: '問題の部品（コード）が、製品に含まれていない',
  code_not_reachable: '含まれているが、問題のコードが、製品のどこからも呼び出されない',
  requires_configuration: '攻撃には特定の設定が必要で、製品はその設定になっていない',
  requires_dependency: '攻撃には別の部品が必要で、製品にはそれがない',
  requires_environment: '攻撃には特定の動作環境が必要で、製品の環境にはあてはまらない',
  protected_by_compiler: 'コンパイラの保護機能で、攻撃が成立しない',
  protected_at_runtime: '実行時の保護（ASLR、サンドボックスなど）で、攻撃が成立しない',
  protected_at_perimeter: '製品の外側（ネットワーク境界など）で、攻撃が遮断される',
  protected_by_mitigating_control: 'ほかの緩和策で、攻撃が防がれている',
}

// ---- 小さな道具 -------------------------------------------------------

function randomHex(bytes: number): string {
  const a = new Uint8Array(bytes)
  crypto.getRandomValues(a)
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function newId(): string {
  return randomHex(4)
}

/** UUID v4。crypto.randomUUID がない環境では getRandomValues から作る（固定値は使わない）。 */
export function newUuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const h = randomHex(16).split('')
  h[12] = '4'
  h[16] = '89ab'[parseInt(h[16], 16) % 4]
  const s = h.join('')
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`
}

/** 見えない文字や全角スペースを整え、前後の空白を除き、長さを制限する。 */
function clean(s: string): string {
  return s
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u00A0\u3000]/g, ' ')
    .trim()
    .slice(0, LIMITS.maxField)
}
/** バージョンなどの短い値用。全角の英数字を半角にそろえる。 */
const norm = (s: string) => clean(s).normalize('NFKC')

export function emptySbomForm(): SbomForm {
  return {
    appName: '',
    appVersion: '',
    appType: 'application',
    appSupplier: '',
    author: '',
    serial: newUuid(),
    vexSerial: newUuid(),
    timestamp: new Date().toISOString(),
    isDemo: false,
    components: [],
    statements: [],
  }
}

export function newComponent(p: Partial<SbomComponent> = {}): SbomComponent {
  return { id: newId(), name: '', version: '', supplier: '', ecosystem: 'generic', type: 'library', ...p }
}

export function newStatement(p: Partial<VexStatement> = {}): VexStatement {
  return { id: newId(), cve: '', componentId: '', state: 'under_investigation', justification: '', detail: '', ...p }
}

// ---- 貼り付けの解析（Excel の TSV、または CSV） ---------------------------

/** 引用符つきの項目（Excel が、タブや改行を含む項目に付ける）に対応した、区切り文字の解析。 */
function parseDelimited(text: string, delim: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuote = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++ } else inQuote = false
      } else cell += ch
    } else if (ch === '"' && cell === '') inQuote = true
    else if (ch === delim) { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += ch
  }
  row.push(cell)
  rows.push(row)
  return rows
}

type Field = 'name' | 'version' | 'supplier' | 'ecosystem' | 'type'
const HEADERS: Record<Field, string[]> = {
  name: ['name', 'component', 'component name', 'コンポーネント', 'コンポーネント名', '部品', '部品名', '名称', '名前', 'ライブラリ'],
  version: ['version', 'ver', 'バージョン'],
  supplier: ['supplier', 'vendor', 'サプライヤー', 'サプライヤ', '供給元', 'ベンダー', 'ベンダ', '提供元'],
  ecosystem: ['ecosystem', 'purl type', 'エコシステム', 'パッケージ種別'],
  type: ['type', 'component type', '種別', 'コンポーネント種別'],
}
const DEFAULT_ORDER: Field[] = ['name', 'version', 'supplier', 'ecosystem', 'type']

function detectHeader(cells: string[]): Field[] | null {
  const map: Field[] = []
  let hits = 0
  for (const c of cells) {
    const key = c.normalize('NFKC').toLowerCase()
    const f = (Object.keys(HEADERS) as Field[]).find((k) => HEADERS[k].includes(key))
    if (f) hits++
    map.push(f ?? ('' as Field))
  }
  return map.includes('name') && map.includes('version') && hits >= 2 ? map : null
}

export interface ParseResult {
  components: SbomComponent[]
  warnings: string[]
}

/**
 * Excel などから貼り付けた表を、部品の一覧にする。
 * 列の順は「名前、バージョン、サプライヤー、エコシステム、種別」（後ろの列は省略可）。
 * 1行目が見出し（日本語・英語）なら、見出しの並びに従う。タブ区切りがなければ、カンマ区切りとして読む。
 */
export function parseComponents(raw: string): ParseResult {
  const warnings: string[] = []
  let text = raw
  if (text.length > LIMITS.maxChars) {
    text = text.slice(0, LIMITS.maxChars)
    warnings.push(`入力が長すぎるため、先頭の ${LIMITS.maxChars} 文字だけを読み取りました。`)
  }
  const delim = text.includes('\t') ? '\t' : ','
  const rows = parseDelimited(text, delim)
    .map((r) => r.map(clean))
    .filter((r) => r.some((c) => c !== '') && !r[0].startsWith('#'))

  let order = DEFAULT_ORDER as Field[]
  if (rows.length) {
    const h = detectHeader(rows[0])
    if (h) { order = h; rows.shift() }
  }
  const col = (r: string[], f: Field) => {
    const i = order.indexOf(f)
    return i >= 0 ? (r[i] ?? '') : ''
  }

  const components: SbomComponent[] = []
  const seen = new Set<string>()
  let badEco = 0, badType = 0, dup = 0, noName = 0
  for (const r of rows) {
    if (components.length >= LIMITS.maxRows) {
      warnings.push(`行数が多いため、先頭の ${LIMITS.maxRows} 行だけを読み取りました。`)
      break
    }
    const name = col(r, 'name')
    if (!name) { noName++; continue }
    const version = norm(col(r, 'version'))
    const key = `${name.toLowerCase()}\t${version}`
    if (seen.has(key)) { dup++; continue }
    seen.add(key)
    const eco = norm(col(r, 'ecosystem')).toLowerCase()
    const typ = norm(col(r, 'type')).toLowerCase()
    const ecosystem = (ECOSYSTEMS as readonly string[]).includes(eco) ? (eco as Ecosystem) : 'generic'
    const type = (COMPONENT_TYPES as readonly string[]).includes(typ) ? (typ as ComponentType) : 'library'
    if (eco && ecosystem === 'generic' && eco !== 'generic') badEco++
    if (typ && type === 'library' && typ !== 'library') badType++
    components.push(newComponent({ name, version, supplier: col(r, 'supplier'), ecosystem, type }))
  }
  if (noName) warnings.push(`名前が空の行を ${noName} 行、読み飛ばしました。`)
  if (dup) warnings.push(`名前とバージョンが同じ行を ${dup} 行、読み飛ばしました。`)
  if (badEco) warnings.push(`エコシステムとして読み取れない値が ${badEco} 行あり、generic にしました。`)
  if (badType) warnings.push(`種別として読み取れない値が ${badType} 行あり、library にしました。`)
  return { components, warnings }
}

function tsvCell(s: string): string {
  return /[\t\r\n"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * 部品の一覧を、Excel に貼り付けられる TSV にする（1行目は見出し）。
 * 次回、そのまま貼り戻せる。JSON の読み込みを設けない代わりの、保存の手段。
 */
export function toTsv(components: SbomComponent[]): string {
  const head = ['名前', 'バージョン', 'サプライヤー', 'エコシステム', '種別']
  const rows = components.map((c) => [c.name, c.version, c.supplier, c.ecosystem, c.type])
  return [head, ...rows].map((r) => r.map(tsvCell).join('\t')).join('\n') + '\n'
}

// ---- PURL（Package URL） -----------------------------------------------

const enc = (s: string) => encodeURIComponent(s).replace(/%3A/gi, ':')

/**
 * 部品から PURL を作る。作れないときは null（例：maven で groupId:artifactId の形でない）。
 * 規則：npm のスコープ（@scope/name）と maven の groupId、golang のパスは、名前空間として分ける。
 * npm・pypi・golang は、小文字にそろえる。pypi は _ を - にする。
 */
export function buildPurl(c: Pick<SbomComponent, 'name' | 'version' | 'ecosystem'>): string | null {
  const name = c.name.trim()
  if (!name) return null
  let ns = ''
  let n = name
  switch (c.ecosystem) {
    case 'npm': {
      const s = name.toLowerCase()
      const i = s.indexOf('/')
      if (s.startsWith('@') && i > 0) { ns = s.slice(0, i); n = s.slice(i + 1) } else n = s
      break
    }
    case 'pypi':
      n = name.toLowerCase().replace(/_/g, '-')
      break
    case 'maven': {
      const i = name.indexOf(':')
      if (i <= 0 || i === name.length - 1) return null
      ns = name.slice(0, i)
      n = name.slice(i + 1)
      break
    }
    case 'golang': {
      const s = name.toLowerCase()
      const i = s.lastIndexOf('/')
      if (i > 0) { ns = s.slice(0, i); n = s.slice(i + 1) } else n = s
      break
    }
    default:
      break
  }
  const path = [ns ? ns.split('/').map(enc).join('/') : '', enc(n)].filter(Boolean).join('/')
  const v = c.version.trim()
  return `pkg:${c.ecosystem}/${path}${v ? '@' + enc(v) : ''}`
}

// ---- CycloneDX ---------------------------------------------------------

export const CDX_SPEC_VERSION = '1.6'
export const CVE_RE = /^CVE-\d{4}-\d{4,}$/i

const STATE_CDX: Record<VexState, string> = {
  not_affected: 'not_affected',
  affected: 'exploitable',
  under_investigation: 'in_triage',
  fixed: 'resolved',
}

function bomRefs(form: SbomForm): Map<string, string> {
  const m = new Map<string, string>()
  form.components.filter((c) => c.name.trim()).forEach((c, i) => m.set(c.id, `comp-${i + 1}`))
  return m
}

function metadata(form: SbomForm) {
  const supplier = form.appSupplier.trim()
  return {
    timestamp: form.timestamp,
    tools: { components: [{ type: 'application', name: 'Secriptorium' }] },
    authors: form.author.trim() ? [{ name: form.author.trim() }] : undefined,
    component: {
      'bom-ref': 'root',
      type: form.appType,
      name: form.appName.trim() || 'unnamed',
      version: form.appVersion.trim() || undefined,
      supplier: supplier ? { name: supplier } : undefined,
    },
    properties: form.isDemo ? [{ name: 'secriptorium:note', value: 'SAMPLE DATA - fictional product' }] : undefined,
  }
}

/** CycloneDX の SBOM（部品表）を作る。JSON.stringify で、undefined の項目は省かれる。 */
export function buildSbom(form: SbomForm) {
  const refs = bomRefs(form)
  const comps = form.components.filter((c) => c.name.trim())
  return {
    bomFormat: 'CycloneDX',
    specVersion: CDX_SPEC_VERSION,
    serialNumber: `urn:uuid:${form.serial}`,
    version: 1,
    metadata: metadata(form),
    components: comps.map((c) => ({
      'bom-ref': refs.get(c.id),
      type: c.type,
      name: c.name.trim(),
      version: c.version.trim() || undefined,
      supplier: c.supplier.trim() ? { name: c.supplier.trim() } : undefined,
      purl: buildPurl(c) ?? undefined,
    })),
    dependencies: [{ ref: 'root', dependsOn: comps.map((c) => refs.get(c.id)) }],
  }
}

/** 有効な判定だけを取り出す（CVE 番号の形式が正しく、部品が存在するもの）。 */
export function validStatements(form: SbomForm): VexStatement[] {
  const refs = bomRefs(form)
  return form.statements.filter((s) => CVE_RE.test(s.cve.trim()) && refs.has(s.componentId))
}

/**
 * CycloneDX の VEX を作る。SBOM とは別の文書で、bom-link（urn:cdx:<SBOMのシリアル>/<版>#<bom-ref>）で
 * SBOM の部品を指す。VEX は SBOM より頻繁に更新されるため、別の文書にしている。
 */
export function buildVex(form: SbomForm) {
  const refs = bomRefs(form)
  const link = (compId: string) => `urn:cdx:${form.serial}/1#${refs.get(compId)}`
  return {
    bomFormat: 'CycloneDX',
    specVersion: CDX_SPEC_VERSION,
    serialNumber: `urn:uuid:${form.vexSerial}`,
    version: 1,
    metadata: metadata(form),
    vulnerabilities: validStatements(form).map((s) => {
      const id = s.cve.trim().toUpperCase()
      return {
        id,
        source: { name: 'NVD', url: `https://nvd.nist.gov/vuln/detail/${id}` },
        analysis: {
          state: STATE_CDX[s.state],
          justification: s.state === 'not_affected' && s.justification ? s.justification : undefined,
          detail: s.detail.trim() || undefined,
        },
        affects: [{ ref: link(s.componentId) }],
      }
    }),
  }
}

// ---- 入力チェック -------------------------------------------------------

export interface Check {
  scope: 'sbom' | 'vex' // どちらの出力に関係するか
  level: 'must' | 'rec'
  ok: boolean
  label: string
}

/** 画面に出すチェックの一覧。SBOM の最低限の要素（名前・バージョン・供給者・識別子・依存関係・作成者・時刻）を意識している。 */
export function sbomChecks(form: SbomForm): Check[] {
  const comps = form.components.filter((c) => c.name.trim())
  const count = (f: (c: SbomComponent) => boolean) => comps.filter(f).length
  const noVer = count((c) => !c.version.trim())
  const noSup = count((c) => !c.supplier.trim())
  const generic = count((c) => c.ecosystem === 'generic')
  const noPurl = count((c) => buildPurl(c) === null)
  const st = form.statements
  const badCve = st.filter((s) => !CVE_RE.test(s.cve.trim())).length
  const noComp = st.filter((s) => !bomRefs(form).has(s.componentId)).length
  const noReason = st.filter((s) => s.state === 'not_affected' && !s.justification).length
  const row = (scope: Check['scope'], level: Check['level'], ok: boolean, label: string): Check => ({ scope, level, ok, label })
  return [
    row('sbom', 'must', !!form.appName.trim(), '製品名'),
    row('sbom', 'must', !!form.appVersion.trim(), '製品のバージョン'),
    row('sbom', 'must', !!form.author.trim(), '作成者'),
    row('sbom', 'must', comps.length > 0, '部品が1つ以上ある'),
    row('sbom', 'must', noVer === 0, noVer ? `バージョンが空の部品：${noVer} 件` : '全部品にバージョンがある'),
    row('sbom', 'rec', noSup === 0, noSup ? `サプライヤーが空の部品：${noSup} 件` : '全部品にサプライヤーがある'),
    row('sbom', 'rec', generic === 0, generic ? `エコシステムが generic の部品：${generic} 件（パッケージ管理の部品は、指定すると識別しやすい）` : '全部品のエコシステムを指定済み'),
    row('sbom', 'must', noPurl === 0, noPurl ? `識別子（PURL）を作れない部品：${noPurl} 件（maven は「groupId:artifactId」の形で入力）` : '全部品の識別子（PURL）を作れる'),
    row('vex', 'must', badCve === 0, badCve ? `CVE 番号の形式が正しくない判定：${badCve} 件` : '判定の CVE 番号の形式が正しい'),
    row('vex', 'must', noComp === 0, noComp ? `対象の部品が選ばれていない判定：${noComp} 件` : '判定の対象部品が選ばれている'),
    row('vex', 'must', noReason === 0, noReason ? `「影響なし」なのに理由がない判定：${noReason} 件` : '「影響なし」の判定に、すべて理由がある'),
    row('vex', 'rec', st.length > 0, st.length ? '判定が1件以上ある' : '判定が1件もない（VEX に載せる脆弱性がない）'),
  ]
}

// ---- デモデータ ---------------------------------------------------------

/**
 * 1クリックのデモ用データ。架空のIoT機器の例。
 * 注意：CVE 番号と影響の記述は例示用。実在の脆弱性の内容は、NVD などで確認してから使うこと。
 */
export function demoSbomForm(): SbomForm {
  const f = emptySbomForm()
  const comp = (name: string, version: string, supplier: string, type: ComponentType = 'library') =>
    newComponent({ name, version, supplier, type, ecosystem: 'generic' })
  const kernel = comp('linux-kernel', '5.10.100', 'kernel.org', 'operating-system')
  const busybox = comp('busybox', '1.35.0', 'busybox.net')
  const zlib = comp('zlib', '1.2.11', 'zlib.net')
  const openssl = comp('openssl', '1.1.1n', 'OpenSSL Project')
  const curl = comp('curl', '7.79.1', 'curl project')
  return {
    ...f,
    appName: 'SAMPLE-IoT-Gateway',
    appVersion: '2.4.1',
    appType: 'firmware',
    appSupplier: 'Example Devices Inc.（架空）',
    author: 'Example Devices Inc. PSIRT（架空）',
    isDemo: true,
    components: [kernel, busybox, zlib, openssl, curl],
    statements: [
      newStatement({
        cve: 'CVE-2018-25032', componentId: zlib.id, state: 'not_affected', justification: 'code_not_reachable',
        detail: '本製品は zlib の展開（inflate）のみを使用しており、圧縮（deflate）の機能は呼び出していません。',
      }),
      newStatement({
        cve: 'CVE-2022-2068', componentId: openssl.id, state: 'not_affected', justification: 'code_not_present',
        detail: '問題のあるスクリプト（c_rehash）を、製品のファームウェアに含めていません。',
      }),
      newStatement({
        cve: 'CVE-2023-38545', componentId: curl.id, state: 'affected', justification: '',
        detail: '該当します。修正版（8.4.0 以降）を含むファームウェアを、次回のアップデートで提供する予定です。',
      }),
    ],
  }
}

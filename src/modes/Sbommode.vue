<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'
import {
  COMPONENT_TYPES,
  ECOSYSTEMS,
  JUSTIFICATIONS,
  JUSTIFICATION_JA,
  LIMITS,
  ROOT_JA,
  ROOT_TYPES,
  STATE_JA,
  TYPE_JA,
  VEX_STATES,
  buildSbom,
  buildVex,
  demoSbomForm,
  emptySbomForm,
  newComponent,
  newStatement,
  parseComponents,
  sbomChecks,
  toTsv,
} from '../lib/sbom'
import type { SbomComponent } from '../lib/sbom'

const form = reactive(emptySbomForm())
const pasteText = ref('')
const notes = ref<string[]>([])
const msg = ref('')

function flash(text: string) {
  msg.value = text
  window.setTimeout(() => (msg.value = ''), 2500)
}

// ---- デモ・消去 ----
function loadDemo() {
  Object.assign(form, demoSbomForm())
  pasteText.value = ''
  notes.value = []
}
function clearAll() {
  if (!window.confirm('入力内容をすべて消去します。よろしいですか？')) return
  Object.assign(form, emptySbomForm())
  pasteText.value = ''
  notes.value = []
}

// ---- 部品 ----
const keyOf = (c: SbomComponent) => `${c.name.trim().toLowerCase()}\t${c.version.trim()}`

function addFromPaste() {
  const r = parseComponents(pasteText.value)
  const have = new Set(form.components.map(keyOf))
  const fresh = r.components.filter((c) => !have.has(keyOf(c)))
  const room = Math.max(LIMITS.maxRows - form.components.length, 0)
  const added = fresh.slice(0, room)
  form.components.push(...added)
  const out = [`${added.length} 件を追加しました。`, ...r.warnings]
  const skipped = r.components.length - fresh.length
  if (skipped) out.push(`表にすでにある ${skipped} 件を、読み飛ばしました。`)
  if (fresh.length > added.length) out.push(`部品は最大 ${LIMITS.maxRows} 件までのため、${fresh.length - added.length} 件を追加できませんでした。`)
  notes.value = out
  pasteText.value = ''
}
function addComponent() {
  if (form.components.length < LIMITS.maxRows) form.components.push(newComponent())
}
function removeComponent(id: string) {
  const i = form.components.findIndex((c) => c.id === id)
  if (i >= 0) form.components.splice(i, 1)
  form.statements.forEach((s) => {
    if (s.componentId === id) s.componentId = ''
  })
}
async function copyTsv() {
  try {
    await navigator.clipboard.writeText(toTsv(form.components))
    flash('表をコピーしました。Excel に貼り付けられます')
  } catch {
    flash('コピーできませんでした')
  }
}
const compLabel = (c: SbomComponent) => `${c.name || '（名前なし）'}${c.version ? ' ' + c.version : ''}`

// ---- 判定（VEX） ----
function addStatement() {
  if (form.statements.length < LIMITS.maxStatements) {
    form.statements.push(newStatement({ componentId: form.components[0]?.id ?? '' }))
  }
}
function removeStatement(id: string) {
  const i = form.statements.findIndex((s) => s.id === id)
  if (i >= 0) form.statements.splice(i, 1)
}

// ---- チェックと出力 ----
const checks = computed(() => sbomChecks(form))
const missing = (scope: 'sbom' | 'vex') =>
  checks.value.filter((c) => c.scope === scope && c.level === 'must' && !c.ok).map((c) => c.label)

const baseName = computed(() => (form.appName.trim() || 'sbom') + (form.appVersion.trim() ? '-' + form.appVersion.trim() : ''))

const tabs = computed<OutputTab[]>(() => [
  {
    id: 'sbom',
    label: 'SBOM (CycloneDX JSON)',
    content: JSON.stringify(buildSbom(form), null, 2),
    ext: '.cdx.json',
    mime: 'application/json;charset=utf-8',
    warnings: missing('sbom'),
  },
  {
    id: 'vex',
    label: 'VEX (CycloneDX JSON)',
    content: JSON.stringify(buildVex(form), null, 2),
    ext: '.vex.cdx.json',
    mime: 'application/json;charset=utf-8',
    warnings: missing('vex'),
  },
])
</script>

<template>
  <div class="cols">
    <section class="panel" aria-label="入力フォーム">
      <details class="intro">
        <summary>SBOM / VEX とは？（はじめての方へ）</summary>
        <p><strong>SBOM（部品表）</strong>は、製品に含まれる部品（ライブラリや OS など）の一覧です。</p>
        <p>
          <strong>VEX</strong>は、「この脆弱性は、御社の製品に影響しますか？」という問いへの回答です。部品に脆弱性が見つかっても、
          製品ではその機能を呼び出していないなど、影響しない場合があります。その場合は、「影響なし」と理由を示して、取引先に伝えられます。
        </p>
        <p>使い方：①製品の情報 → ②部品を表に入れる（Excel から貼り付けられます） → ③脆弱性ごとの判定。右側に、SBOM と VEX が、別々の文書で出来ます。</p>
        <p class="warn">「影響なし」などの判定は、製品の提供者が、自分の責任で行うものです。このツールは、判定の正しさを確認しません。</p>
      </details>

      <div class="bar">
        <button type="button" class="primary" @click="loadDemo">デモを読み込む</button>
        <button type="button" @click="clearAll">入力を消去</button>
      </div>
      <p v-if="form.isDemo" class="demo">
        架空の機器のサンプルです。実在の製品の判定ではありません。CVE の内容は、使う前に NVD などで確認してください。
        <button type="button" @click="form.isDemo = false">サンプルの印を外す</button>
      </p>

      <fieldset>
        <legend>① 製品の情報</legend>
        <label>製品名
          <input v-model="form.appName" :maxlength="LIMITS.maxField" placeholder="例：SAMPLE-IoT-Gateway" />
        </label>
        <div class="row">
          <label>バージョン
            <input v-model="form.appVersion" :maxlength="LIMITS.maxField" placeholder="例：2.4.1" />
          </label>
          <label>種別
            <select v-model="form.appType">
              <option v-for="t in ROOT_TYPES" :key="t" :value="t">{{ ROOT_JA[t] }}</option>
            </select>
          </label>
        </div>
        <div class="row">
          <label>製造元（任意）
            <input v-model="form.appSupplier" :maxlength="LIMITS.maxField" placeholder="例：株式会社サンプル" />
          </label>
          <label>この文書の作成者
            <input v-model="form.author" :maxlength="LIMITS.maxField" placeholder="例：製品セキュリティ担当" />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>② 部品（{{ form.components.length }} 件）</legend>
        <label>Excel などから貼り付け
          <textarea
            v-model="pasteText"
            :maxlength="LIMITS.maxChars"
            placeholder="1行に1部品。列は「名前」「バージョン」「サプライヤー」の順で、タブ区切り（Excel からコピーした形）です。エコシステム・種別の列は省略できます。1行目が見出し行でも構いません。"
          />
        </label>
        <div class="bar">
          <button type="button" class="primary" :disabled="!pasteText.trim()" @click="addFromPaste">表に追加</button>
          <button type="button" @click="addComponent">部品を1行追加</button>
          <button type="button" :disabled="!form.components.length" @click="copyTsv">表を Excel 用にコピー</button>
          <span class="status" role="status">{{ msg }}</span>
        </div>
        <ul v-if="notes.length" class="notes">
          <li v-for="(n, i) in notes" :key="i">{{ n }}</li>
        </ul>

        <div v-for="c in form.components" :key="c.id" class="comp">
          <div class="r1">
            <input v-model="c.name" :maxlength="LIMITS.maxField" placeholder="部品の名前" aria-label="部品の名前" />
            <input v-model="c.version" :maxlength="LIMITS.maxField" placeholder="バージョン" aria-label="バージョン" />
            <button type="button" @click="removeComponent(c.id)">削除</button>
          </div>
          <div class="r2">
            <label class="mini">サプライヤー
              <input v-model="c.supplier" :maxlength="LIMITS.maxField" />
            </label>
            <label class="mini">エコシステム
              <select v-model="c.ecosystem">
                <option v-for="e in ECOSYSTEMS" :key="e" :value="e">{{ e }}</option>
              </select>
            </label>
            <label class="mini">種別
              <select v-model="c.type">
                <option v-for="t in COMPONENT_TYPES" :key="t" :value="t">{{ TYPE_JA[t] }}</option>
              </select>
            </label>
          </div>
        </div>
        <p class="hint">
          エコシステムは、npm や PyPI などのパッケージ管理から入れた部品のときに指定します。C/C++ の部品や OS など、それ以外は generic のままにします。
          maven は「groupId:artifactId」の形で入力してください。
        </p>
      </fieldset>

      <fieldset>
        <legend>③ 脆弱性の判定（VEX）（{{ form.statements.length }} 件）</legend>
        <p class="hint">取引先に聞かれた脆弱性（CVE）ごとに、どの部品について、製品に影響があるかを答えます。</p>
        <div v-for="s in form.statements" :key="s.id" class="stmt">
          <div class="r1">
            <input v-model="s.cve" maxlength="30" placeholder="CVE-2026-0001" aria-label="CVE 番号" />
            <select v-model="s.componentId" aria-label="対象の部品">
              <option value="">（対象の部品を選ぶ）</option>
              <option v-for="c in form.components" :key="c.id" :value="c.id">{{ compLabel(c) }}</option>
            </select>
            <button type="button" @click="removeStatement(s.id)">削除</button>
          </div>
          <div class="r2">
            <label class="mini">判定
              <select v-model="s.state">
                <option v-for="v in VEX_STATES" :key="v" :value="v">{{ STATE_JA[v] }}</option>
              </select>
            </label>
            <label v-if="s.state === 'not_affected'" class="mini">影響なしと言える理由
              <select v-model="s.justification">
                <option value="">（理由を選んでください）</option>
                <option v-for="j in JUSTIFICATIONS" :key="j" :value="j">{{ JUSTIFICATION_JA[j] }}</option>
              </select>
            </label>
          </div>
          <label class="mini">説明（取引先に伝えたいこと）
            <textarea v-model="s.detail" class="s3" />
          </label>
        </div>
        <button type="button" :disabled="form.statements.length >= LIMITS.maxStatements" @click="addStatement">判定を追加</button>
      </fieldset>

      <fieldset>
        <legend>④ チェック</legend>
        <ul class="check-list">
          <li v-for="(c, i) in checks" :key="i" :class="c.ok ? 'ok' : 'ng'">
            {{ c.ok ? '✓' : '□' }} {{ c.label }}（{{ c.level === 'must' ? '必須' : '推奨' }}）
          </li>
        </ul>
      </fieldset>
    </section>

    <OutputPanel :tabs="tabs" :base-name="baseName" />
  </div>
</template>

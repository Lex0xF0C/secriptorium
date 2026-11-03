<!-- src/modes/SbomMode.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../lib/i18n'
import {
  type SbomForm,
  type Ecosystem,
  type ComponentType,
  type RootType,
  type VexState,
  type Justification,
  ECOSYSTEMS,
  COMPONENT_TYPES,
  ROOT_TYPES,
  VEX_STATES,
  JUSTIFICATIONS,
  defaultForm,
  loadDemoForm,
  parseTsvComponents,
  parseTsvStatements,
  buildSbom,
  buildVex,
  sbomChecks
} from '../lib/sbom'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'

const { lang, t } = useI18n()

const form = ref<SbomForm>(defaultForm())
const pasteText = ref('')
const toastMsg = ref('')
let toastTimer: number | null = null

const showToast = (msg: string) => {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMsg.value = '' }, 2800)
}

const loadDemo = () => {
  form.value = loadDemoForm()
  showToast(lang.value === 'en' ? 'Loaded sample demo data' : 'デモ用サンプルデータを読み込みました')
}

const addComp = () => {
  form.value.components.push({
    id: Math.random().toString(36).substring(2, 9),
    name: '',
    version: '',
    supplier: '',
    ecosystem: 'npm',
    type: 'library'
  })
}

const removeComp = (idx: number) => {
  form.value.components.splice(idx, 1)
}

const addStmt = () => {
  form.value.statements.push({
    id: Math.random().toString(36).substring(2, 9),
    cve: '',
    componentId: form.value.components?.id || '',
    state: 'not_affected',
    justification: 'code_not_present',
    detail: ''
  })
}

const removeStmt = (idx: number) => {
  form.value.statements.splice(idx, 1)
}

const importTsvComps = () => {
  if (!pasteText.value.trim()) return
  const parsed = parseTsvComponents(pasteText.value)
  if (parsed.length > 0) {
    form.value.components.push(...parsed)
    pasteText.value = ''
    showToast(lang.value === 'en' ? `Imported ${parsed.length} components` : `${parsed.length} 件の部品を一括追加しました`)
  }
}

const checks = computed(() => sbomChecks(form.value))
const sbomJson = computed(() => JSON.stringify(buildSbom(form.value), null, 2))
const vexJson = computed(() => JSON.stringify(buildVex(form.value), null, 2))

const tabs = computed<OutputTab[]>(() => [
  {
    id: 'sbom_cdx',
    label: 'CycloneDX SBOM (.cdx.json)',
    content: sbomJson.value,
    ext: '.cdx.json',
    mime: 'application/json;charset=utf-8'
  },
  {
    id: 'vex_cdx',
    label: 'CycloneDX VEX (.vex.json)',
    content: vexJson.value,
    ext: '.vex.json',
    mime: 'application/json;charset=utf-8'
  }
])
</script>

<template>
  <main class="cols">
    <section class="panel" aria-label="SBOM / VEX Inputs">
      <h2>SBOM / VEX (CycloneDX 1.6) {{ lang === 'en' ? 'Authoring' : '作成' }}</h2>
      
      <div class="demo">
        <span>💡 {{ lang === 'en' ? 'Try sample data:' : 'サンプルデータを読み込んで試す:' }}</span>
        <button type="button" @click="loadDemo">{{ lang === 'en' ? 'Load Demo Data' : 'デモデータを読込' }}</button>
      </div>

      <div v-if="toastMsg" class="bar toast-bar">
        <span class="status toast-text">{{ toastMsg }}</span>
      </div>

      <!-- 基本情報 -->
      <fieldset class="section-box">
        <legend>📦 {{ lang === 'en' ? 'Target Product Info' : '対象製品情報' }}</legend>
        <div class="row">
          <label>{{ lang === 'en' ? 'Product Name' : '製品名 / アプリ名' }}
            <input type="text" v-model="form.appName" placeholder="e.g., SafeGate-X1" />
          </label>
          <label>{{ lang === 'en' ? 'Version' : 'バージョン' }}
            <input type="text" v-model="form.appVersion" placeholder="e.g., v2.1.0" />
          </label>
        </div>
        <div class="row">
          <label>{{ lang === 'en' ? 'Product Type' : '製品種別' }}
            <select v-model="form.appType">
              <option v-for="tCode in ROOT_TYPES" :key="tCode" :value="tCode">{{ tCode }}</option>
            </select>
          </label>
          <label>{{ lang === 'en' ? 'Author / Organization' : '作成者 / 組織名' }}
            <input type="text" v-model="form.author" placeholder="e.g., PSIRT Team" />
          </label>
        </div>
      </fieldset>

      <!-- 部品表 (SBOM Components) -->
      <fieldset class="section-box">
        <legend>🧩 {{ lang === 'en' ? 'Components (Software Bill of Materials)' : '部品一覧 (SBOM Components)' }}</legend>

        <div v-for="(c, idx) in form.components" :key="c.id" class="comp">
          <div class="r1">
            <input type="text" v-model="c.name" :placeholder="lang === 'en' ? 'Component Name' : '部品名 (例: express)'" />
            <input type="text" v-model="c.version" :placeholder="lang === 'en' ? 'Version' : 'バージョン (例: 4.18.2)'" />
            <button type="button" @click="removeComp(idx)">{{ t.vex?.btnDelProd || '削除' }}</button>
          </div>
          <div class="r2">
            <input type="text" v-model="c.supplier" :placeholder="lang === 'en' ? 'Supplier / Vendor' : 'サプライヤー (任意)'" />
            <select v-model="c.ecosystem">
              <option v-for="e in ECOSYSTEMS" :key="e" :value="e">{{ e }}</option>
            </select>
            <select v-model="c.type">
              <option v-for="ct in COMPONENT_TYPES" :key="ct" :value="ct">{{ ct }}</option>
            </select>
          </div>
        </div>

        <button type="button" class="primary" @click="addComp">+ {{ t.vex?.btnAddProd || '部品を追加' }}</button>

        <!-- TSV 一括コピペ -->
        <details style="margin-top: 10px;">
          <summary>📋 {{ lang === 'en' ? 'Excel / TSV Bulk Import' : 'Excel / TSV 一括貼り付け' }}</summary>
          <textarea v-model="pasteText" rows="3" :placeholder="lang === 'en' ? 'Name \\t Version \\t Supplier' : '部品名\\tバージョン\\tサプライヤー'"></textarea>
          <button type="button" @click="importTsvComps" style="margin-top: 4px;">{{ t.vex?.btnImportAppend || '一括追加' }}</button>
        </details>
      </fieldset>

      <!-- VEX 判定 (Vulnerability Statements) -->
      <fieldset class="section-box">
        <legend>🛡️ {{ lang === 'en' ? 'VEX Statements (Vulnerability Impact)' : 'VEX 脆弱性影響判定' }}</legend>

        <div v-for="(s, idx) in form.statements" :key="s.id" class="stmt">
          <div class="r1">
            <input type="text" v-model="s.cve" placeholder="e.g., CVE-2026-1234" />
            <select v-model="s.componentId">
              <option v-for="c in form.components" :key="c.id" :value="c.id">
                {{ c.name || '(Unnamed)' }} ({{ c.version || '?' }})
              </option>
            </select>
            <button type="button" @click="removeStmt(idx)">{{ t.vex?.btnDelProd || '削除' }}</button>
          </div>
          <div class="r2">
            <select v-model="s.state">
              <option v-for="st in VEX_STATES" :key="st" :value="st">
                {{ t.vex?.status[st] || st }}
              </option>
            </select>
            <select v-if="s.state === 'not_affected'" v-model="s.justification">
              <option v-for="j in JUSTIFICATIONS" :key="j" :value="j">
                {{ t.vex?.justification[j] || j }}
              </option>
            </select>
          </div>
        </div>

        <button type="button" class="primary" @click="addStmt">+ {{ lang === 'en' ? 'Add VEX Statement' : 'VEX判定を追加' }}</button>
      </fieldset>

      <!-- バリデーションチェック一覧 -->
      <fieldset class="section-box">
        <legend>🔍 {{ lang === 'en' ? 'Quality Checklist' : '品質確認チェック' }}</legend>
        <ul class="check-list">
          <li v-for="(chk, idx) in checks" :key="idx" :class="{ ng: !chk.ok }">
            {{ chk.ok ? '✅' : '⚠️' }} [{{ chk.scope.toUpperCase() }}] {{ chk.label }}
          </li>
        </ul>
      </fieldset>
    </section>

    <OutputPanel class="out" :tabs="tabs" base-name="sbom-vex" />
  </main>
</template>

<style scoped>
.demo { border: 1px dashed var(--accent); border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
.toast-bar { margin-bottom: 12px; }
.toast-text { color: var(--accent); font-weight: 600; }
.section-box { border: 1px solid var(--line); border-radius: 6px; padding: 12px 14px; margin-bottom: 16px; }
.comp, .stmt { border: 1px solid var(--line); border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; background: var(--bg); }
.comp .r1 { display: grid; grid-template-columns: 1.6fr 1fr auto; gap: 8px; margin-bottom: 6px; }
.comp .r2 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.stmt .r1 { display: grid; grid-template-columns: 1fr 1.4fr auto; gap: 8px; margin-bottom: 6px; }
.stmt .r2 { display: grid; grid-template-columns: 1fr 2fr; gap: 8px; }
.check-list { list-style: none; margin: 0; padding: 0; font-size: 0.88rem; }
.check-list li { margin-bottom: 4px; }
.check-list li.ng { color: var(--warn); font-weight: 600; }
</style>

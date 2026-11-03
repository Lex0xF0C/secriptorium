<!-- src/modes/VexMode.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../lib/i18n'
import {
  type VexForm,
  type VexProductStatus,
  defaultVexForm,
  parseTsvVexProducts,
  buildCsafVex,
  vexWarnings
} from '../lib/vex'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'

const { lang, t } = useI18n()

const form = ref<VexForm>(defaultVexForm())
const mode = ref<'form' | 'paste'>('form')
const pasteText = ref('')
const toastMsg = ref('')
let toastTimer: number | null = null

const showToast = (msg: string) => {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMsg.value = '' }, 2800)
}

const addProduct = () => {
  form.value.products.push({
    id: Math.random().toString(36).substring(2, 9),
    name: '',
    version: '',
    status: 'known_not_affected',
    justification: 'vulnerable_code_not_present',
    impactDetail: ''
  })
}

const removeProduct = (idx: number) => {
  form.value.products.splice(idx, 1)
}

const importTsv = () => {
  if (!pasteText.value.trim()) return
  const parsed = parseTsvVexProducts(pasteText.value)
  if (parsed.length > 0) {
    form.value.products.push(...parsed)
    pasteText.value = ''
    showToast(lang.value === 'en' ? `Imported ${parsed.length} items` : `${parsed.length} 件の製品ステータスをインポートしました`)
  }
}

const csafVexJson = computed(() => JSON.stringify(buildCsafVex(form.value), null, 2))
const warnings = computed(() => vexWarnings(form.value))

const tabs = computed<OutputTab[]>(() => [
  {
    id: 'csaf_vex',
    label: 'CSAF 2.0 VEX (.json)',
    content: csafVexJson.value,
    ext: '.json',
    mime: 'application/json;charset=utf-8',
    warnings: warnings.value
  }
])
</script>

<template>
  <main class="cols">
    <section class="panel" aria-label="CSAF 2.0 VEX Form">
      <h2>{{ t.vex?.title || 'Product Portfolio VEX Generator' }}</h2>
      <p class="sub-intro">{{ t.vex?.intro }}</p>

      <div v-if="toastMsg" class="bar toast-bar">
        <span class="status toast-text">{{ toastMsg }}</span>
      </div>

      <!-- メタデータ入力 -->
      <fieldset class="section-box">
        <legend>📝 {{ lang === 'en' ? 'VEX Metadata' : 'VEX 文書メタデータ' }}</legend>
        <div class="row">
          <label>{{ t.vex?.cveLabel }}
            <input type="text" v-model="form.cve" :placeholder="t.vex?.cvePh" />
          </label>
          <label>{{ t.vex?.docIdLabel }}
            <input type="text" v-model="form.documentId" :placeholder="t.vex?.docIdPh" />
          </label>
        </div>

        <div class="row">
          <label>{{ t.vex?.pubNameLabel }}
            <input type="text" v-model="form.publisherName" :placeholder="t.vex?.pubNamePh" />
          </label>
          <label>{{ t.vex?.pubNsLabel }}
            <input type="url" v-model="form.publisherNamespace" :placeholder="t.vex?.pubNsPh" />
          </label>
        </div>

        <label>{{ t.vex?.summaryLabel }}
          <textarea v-model="form.summary" rows="2" :placeholder="t.vex?.summaryPh"></textarea>
        </label>
      </fieldset>

      <!-- モード切替（フォーム入力 / TSV一括） -->
      <fieldset class="section-box">
        <legend>🏢 {{ t.vex?.prodSectionTitle }}</legend>

        <div class="mode-switch-bar">
          <button type="button" :class="{ primary: mode === 'form' }" @click="mode = 'form'">
            {{ t.vex?.modeForm }}
          </button>
          <button type="button" :class="{ primary: mode === 'paste' }" @click="mode = 'paste'">
            {{ t.vex?.modePaste }}
          </button>
        </div>

        <!-- フォーム入力モード -->
        <div v-if="mode === 'form'" class="products-form-list">
          <div v-for="(p, idx) in form.products" :key="p.id" class="vex-product-card">
            <div class="r1">
              <input type="text" v-model="p.name" :placeholder="t.ui.pn || 'Product Name'" />
              <input type="text" v-model="p.version" :placeholder="t.ui.pv || 'Version'" />
              <button type="button" @click="removeProduct(idx)">{{ t.vex?.btnDelProd }}</button>
            </div>
            <div class="r2">
              <select v-model="p.status">
                <option value="known_not_affected">{{ t.vex?.status['known_not_affected'] }}</option>
                <option value="known_affected">{{ t.vex?.status['known_affected'] }}</option>
                <option value="fixed">{{ t.vex?.status['fixed'] }}</option>
                <option value="under_investigation">{{ t.vex?.status['under_investigation'] }}</option>
              </select>
              <select v-if="p.status === 'known_not_affected'" v-model="p.justification">
                <option value="vulnerable_code_not_present">{{ t.vex?.justification['vulnerable_code_not_present'] }}</option>
                <option value="vulnerable_code_not_in_execute_path">{{ t.vex?.justification['vulnerable_code_not_in_execute_path'] }}</option>
                <option value="vulnerable_code_cannot_be_controlled_by_adversary">{{ t.vex?.justification['vulnerable_code_cannot_be_controlled_by_adversary'] }}</option>
                <option value="inline_mitigations_already_exist">{{ t.vex?.justification['inline_mitigations_already_exist'] }}</option>
              </select>
            </div>
          </div>
          <button type="button" class="primary" @click="addProduct">+ {{ t.vex?.btnAddProd }}</button>
        </div>

        <!-- Excel / TSV 貼り付けモード -->
        <div v-else class="paste-mode-wrap">
          <p class="hint">{{ t.vex?.pasteGuideIntro }}</p>
          <textarea v-model="pasteText" rows="5" :placeholder="t.vex?.pastePh"></textarea>
          <button type="button" class="primary btn-import" @click="importTsv">
            {{ t.vex?.btnImportAppend }}
          </button>
        </div>
      </fieldset>
    </section>

    <OutputPanel class="out" :tabs="tabs" base-name="csaf-vex" />
  </main>
</template>

<style scoped>
.sub-intro { margin: 0 0 16px; color: var(--sub); font-size: 0.9rem; }
.toast-bar { margin-bottom: 12px; }
.toast-text { color: var(--accent); font-weight: 600; }
.section-box { border: 1px solid var(--line); border-radius: 6px; padding: 12px 14px; margin-bottom: 16px; }
.mode-switch-bar { display: flex; gap: 8px; margin-bottom: 12px; }
.vex-product-card { border: 1px solid var(--line); border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; background: var(--bg); }
.vex-product-card .r1 { display: grid; grid-template-columns: 1.6fr 1fr auto; gap: 8px; margin-bottom: 6px; }
.vex-product-card .r2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.btn-import { margin-top: 8px; }
</style>

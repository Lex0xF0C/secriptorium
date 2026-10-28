<script setup lang="ts">
import { ref, computed } from 'vue'
import { I18N_JA } from '../lib/i18n-ja'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'
import {
  buildCsafVex,
  vexWarnings,
  parseVexProducts,
  toVexTsv,
  type VexForm,
  type VexProduct,
  type VexStatus
} from '../lib/vex'

const L = I18N_JA

// 入力モード切替 ('form' | 'paste')
const inputMode = ref<'form' | 'paste'>('form')

// フォーム入力状態
const cve = ref('')
const aid = ref('')
const publisherName = ref('')
const publisherNamespace = ref('')
const pub = ref(new Date().toISOString().split('T'))
const summary = ref('')
const refs = ref('')
const contact = ref('')

// TSV貼り付け用エリアとトースト状態
const pasteText = ref('')
const pasteNotes = ref<string[]>([])
const toastMsg = ref('')
let toastTimer: number | null = null

const showToast = (msg: string) => {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMsg.value = '' }, 2800)
}

// 製品マトリクス状態
const prods = ref<VexProduct[]>([
  { name: '', version: '', status: 'known_not_affected', justification: 'vulnerable_code_not_present', detail: '' }
])

const addProd = () => {
  prods.value.push({
    name: '',
    version: '',
    status: 'known_not_affected',
    justification: 'vulnerable_code_not_present',
    detail: ''
  })
}

const removeProd = (idx: number) => {
  prods.value.splice(idx, 1)
  if (prods.value.length === 0) addProd()
}

// ★ 未定義だった「見出し行コピー関数」を定義
const copyTemplateHeader = async () => {
  const header = '製品名\tバージョン\tステータス\t影響なし理由\t補足メモ\n'
  try {
    await navigator.clipboard.writeText(header)
    showToast(L?.ui?.copiedTsv || '見出し行をコピーしました')
  } catch {
    // クリップボード API 制限時のフォールバック処理
    try {
      const textarea = document.createElement('textarea')
      textarea.value = header
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      showToast(L?.ui?.copiedTsv || '見出し行をコピーしました')
    } catch {
      showToast(L?.ui?.copyfail || 'コピーできませんでした')
    }
  }
}

// コピペ一括読み込みハンドラ ('append': 一括追加, 'replace': 上書き)
const handleImportPaste = (mode: 'append' | 'replace') => {
  if (!pasteText.value.trim()) {
    showToast('貼り付け用テキストを入力してください')
    return
  }
  const result = parseVexProducts(pasteText.value)
  if (result.products.length === 0) {
    pasteNotes.value = result.warnings.length ? result.warnings : ['読込可能なデータが見つかりませんでした']
    return
  }

  if (mode === 'replace') {
    prods.value = result.products
    pasteNotes.value = [`${result.products.length} 件の製品データで上書きしました`]
  } else {
    if (prods.value.length === 1 && !prods.value.name && !prods.value.version) {
      prods.value = result.products
    } else {
      prods.value.push(...result.products)
    }
    pasteNotes.value = [`${result.products.length} 件の製品データを追加しました`]
  }

  showToast('データを読み込みました')
}

const handleExportToPasteArea = () => {
  pasteText.value = toVexTsv(prods.value)
  showToast('現在の表データをテキストエリアに出力しました')
}
// クリップボードへコピー
const handleCopyTsv = async () => {
  try {
    await navigator.clipboard.writeText(toVexTsv(prods.value))
    showToast(L?.ui?.copied || 'コピーしました')
  } catch {
    showToast(L?.ui?.copyfail || 'コピーできませんでした')
  }
}

// フォームオブジェクト集約
const formObject = computed<VexForm>(() => ({
  cve: cve.value,
  advisoryId: aid.value,
  publisherName: publisherName.value,
  publisherNamespace: publisherNamespace.value,
  published: pub.value,
  summary: summary.value,
  products: prods.value,
  refs: refs.value,
  contact: contact.value
}))

// CSAF VEX JSON
const csafVexOutput = computed(() => JSON.stringify(buildCsafVex(formObject.value), null, 2))

// Markdown Summary
const markdownOutput = computed(() => {
  const Ls: string[] = []
  Ls.push(`# VEX Statement: ${cve.value || 'CVE未入力'}`, '')
  if (aid.value) Ls.push(`- **管理番号**: ${aid.value}`)
  if (pub.value) Ls.push(`- **公開日**: ${pub.value}`)
  if (publisherName.value) Ls.push(`- **発行者**: ${publisherName.value}`)
  Ls.push('')

  if (summary.value.trim()) {
    Ls.push('## 概要', '', summary.value.trim(), '')
  }

  Ls.push('## 製品別影響ステータス', '')
  Ls.push('| 製品名 | バージョン | ステータス | 影響なし理由 / 補足 |')
  Ls.push('| --- | --- | --- | --- |')

  const statusLabel = L?.vex?.status || {}

  prods.value.forEach((p) => {
    if (p.name || p.version) {
      const justText = p.status === 'known_not_affected' ? (L?.vex?.justification?.[p.justification] || p.justification) : ''
      const note = [justText, p.detail].filter(Boolean).join(' - ')
      Ls.push(`| ${p.name || '-'} | ${p.version || '-'} | ${statusLabel[p.status] || p.status} | ${note || '-'} |`)
    }
  })

  return Ls.join('\n')
})

const tabs = computed<OutputTab[]>(() => [
  {
    id: 'csaf-vex',
    label: 'CSAF 2.0 VEX (JSON)',
    content: csafVexOutput.value,
    ext: '.json',
    mime: 'application/json;charset=utf-8',
    warnings: vexWarnings(formObject.value)
  },
  {
    id: 'markdown',
    label: 'Markdown Summary',
    content: markdownOutput.value,
    ext: '.md',
    mime: 'text/markdown;charset=utf-8'
  }
])
</script>

<template>
  <div class="cols">
    <div class="panel advisory-form-panel">
      <h2>{{ L.vex.title }}</h2>
      <p class="hint">{{ L.vex.intro }}</p>

      <form @submit.prevent class="form-container">
        <!-- 対象CVE番号 -->
        <div>
          <label>{{ L.vex.cveLabel }}</label>
          <input type="text" v-model="cve" :placeholder="L.vex.cvePh" />
        </div>

        <!-- 発行者情報 -->
        <div class="row">
          <div>
            <label>{{ L.vex.pubNameLabel }}</label>
            <input type="text" v-model="publisherName" :placeholder="L.vex.pubNamePh" />
          </div>
          <div>
            <label>{{ L.vex.pubNsLabel }}</label>
            <input type="url" v-model="publisherNamespace" :placeholder="L.vex.pubNsPh" />
          </div>
        </div>

        <!-- 製品影響判定マトリクスエリア -->
        <div class="products-section">
          <div class="section-header-bar">
            <label class="section-title">{{ L.vex.prodSectionTitle }}（全 {{ prods.length }} 件）</label>
            
            <div class="mode-toggle-btns" role="tablist">
              <button type="button" :class="{ active: inputMode === 'form' }" @click="inputMode = 'form'">
                {{ L.vex.modeForm }}
              </button>
              <button type="button" :class="{ active: inputMode === 'paste' }" @click="inputMode = 'paste'">
                {{ L.vex.modePaste }}
              </button>
            </div>
          </div>

          <!-- ① フォーム入力モード -->
          <div v-if="inputMode === 'form'" class="mode-content">
            <div class="action-bar">
              <button type="button" class="btn-sub" @click="handleCopyTsv">
                {{ L.vex.btnCopyTsv }}
              </button>
            </div>

            <div v-for="(p, index) in prods" :key="index" class="vex-product-card">
              <div class="row">
                <input type="text" v-model="p.name" placeholder="製品名" />
                <input type="text" v-model="p.version" placeholder="バージョン" />
              </div>

              <div class="row">
                <div>
                  <label class="sub-label">ステータス</label>
                  <select v-model="p.status">
                    <option v-for="(label, k) in L.vex.status" :key="k" :value="k">
                      {{ label }} ({{ k }})
                    </option>
                  </select>
                </div>

                <div v-if="p.status === 'known_not_affected'">
                  <label class="sub-label">影響なしの理由 (Justification)</label>
                  <select v-model="p.justification">
                    <option v-for="(label, k) in L.vex.justification" :key="k" :value="k">
                      {{ label }} ({{ k }})
                    </option>
                  </select>
                </div>
              </div>

              <div class="del-btn-bar">
                <button type="button" class="del-btn" @click="removeProd(index)">{{ L.vex.btnDelProd }}</button>
              </div>
            </div>

            <button type="button" @click="addProd" class="add-btn">{{ L.vex.btnAddProd }}</button>
          </div>

          <!-- ② Excelコピペ (TSV一括) モード -->
          <div v-else class="mode-content paste-container">
            <details class="paste-guide" open>
              <summary>{{ L.vex.pasteGuideTitle }}</summary>
              <div class="guide-content">
                <p>{{ L.vex.pasteGuideIntro }}</p>

                <div class="allowed-words">
                  <p><strong>【指定文言リスト】</strong>（以下のいずれかの文字をそのままご使用ください）</p>
                  <ul>
                    <li>
                      <strong>ステータス</strong>: 
                      <span class="code-badge-group">
                        <code v-for="(label, k) in L?.vex?.status" :key="k">{{ label }}</code>
                      </span>
                    </li>
                    <li>
                      <strong>影響なし理由</strong>: 
                      <span class="code-badge-group">
                        <code v-for="(label, k) in L?.vex?.justification" :key="k">{{ label }}</code>
                      </span>
                    </li>
                  </ul>
                </div>

                <button type="button" class="btn-sub" @click="copyTemplateHeader">
                  {{ L.vex.btnCopyHeader }}
                </button>
              </div>
            </details>

            <textarea v-model="pasteText" rows="7" class="tsv-textarea" :placeholder="L.vex.pastePh"></textarea>

            <div class="paste-btn-bar">
              <button type="button" class="primary" @click="handleImportPaste('append')">
                {{ L.vex.btnImportAppend }}
              </button>
              <button type="button" class="btn-warn" @click="handleImportPaste('replace')">
                {{ L.vex.btnImportReplace }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>

    <div class="panel out">
      <OutputPanel :tabs="tabs" base-name="vex-statement" />
    </div>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;
}
.toast-bar {
  margin-top: 10px;
}
.toast-text {
  color: var(--accent, #0056b3);
  font-weight: 600;
}
.products-section {
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  padding: 14px;
  background: var(--bg-card, #ffffff);
}
.section-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.section-title {
  font-weight: bold;
  font-size: 1rem;
}
.mode-toggle-btns {
  display: flex;
  gap: 4px;
  background: var(--bg-sub, #f0f0f0);
  padding: 3px;
  border-radius: 6px;
}
.mode-toggle-btns button {
  padding: 5px 10px;
  font-size: 0.85rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  color: #666;
}
.mode-toggle-btns button.active {
  background: var(--bg-main, #ffffff);
  color: var(--accent, #0056b3);
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
.btn-sub {
  font-size: 0.82rem;
  padding: 4px 8px;
}
.vex-product-card {
  border: 1px solid var(--border, #ccc);
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg-sub, #f9f9f9);
}
.sub-label {
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 2px;
}
.del-btn-bar {
  display: flex;
  justify-content: flex-end;
}
.del-btn {
  font-size: 0.8rem;
  color: #c00;
  background: transparent;
  border: none;
  cursor: pointer;
}
.add-btn {
  margin-top: 4px;
}
.tsv-textarea {
  width: 100%;
  font-family: monospace;
  font-size: 0.88rem;
  line-height: 1.4;
  white-space: pre;
}
.hint-text {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 8px;
}
.paste-notes {
  margin: 8px 0;
  padding: 8px 12px;
  background: #eef6ff;
  border-left: 4px solid var(--accent, #0056b3);
  border-radius: 4px;
}
.note-item {
  font-size: 0.85rem;
  margin: 2px 0;
}
.paste-btn-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.btn-warn {
  background-color: #d9534f;
  color: white;
}
.allowed-words ul {
  margin: 6px 0 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.code-badge-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-left: 6px;
  vertical-align: middle;
}

.code-badge-group code {
  background: var(--bg-sub, #eef2f7);
  border: 1px solid var(--border, #cbd5e1);
  color: var(--text, #1e293b);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.82rem;
  white-space: nowrap;
}
</style>

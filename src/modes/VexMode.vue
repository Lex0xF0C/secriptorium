<script setup lang="ts">
import { ref, computed } from 'vue'
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

// 入力モード切替 ('form' | 'paste')
const inputMode = ref<'form' | 'paste'>('form')

// フォーム入力状態 (メモリ内管理)
const cve = ref('')
const aid = ref('')
const publisherName = ref('')
const publisherNamespace = ref('')
const pub = ref(new Date().toISOString().split('T')[0])
const summary = ref('')
const refs = ref('')
const contact = ref('')

// TSV貼り付け用エリアとメッセージ
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
    // 空の初期行が1件だけの場合は置き換え
    if (prods.value.length === 1 && !prods.value[0].name && !prods.value[0].version) {
      prods.value = result.products
    } else {
      prods.value.push(...result.products)
    }
    pasteNotes.value = [`${result.products.length} 件の製品データを追加しました`]
  }

  showToast('データを読み込みました')
}

// 現在の表データをTSVテキストエリアに出力
const handleExportToPasteArea = () => {
  pasteText.value = toVexTsv(prods.value)
  showToast('現在の表データをテキストエリアに出力しました')
}

// クリップボードへコピー
const handleCopyTsv = async () => {
  try {
    await navigator.clipboard.writeText(toVexTsv(prods.value))
    showToast('Excel用の表データをコピーしました')
  } catch {
    showToast('コピーできませんでした')
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

  const statusLabel: Record<VexStatus, string> = {
    known_not_affected: '影響なし (Not Affected)',
    known_affected: '影響あり (Affected)',
    fixed: '修正済み (Fixed)',
    under_investigation: '調査中 (Under Investigation)'
  }

  prods.value.forEach((p) => {
    if (p.name || p.version) {
      const justText = p.status === 'known_not_affected' ? p.justification : ''
      const note = [justText, p.detail].filter(Boolean).join(' - ')
      Ls.push(`| ${p.name || '-'} | ${p.version || '-'} | ${statusLabel[p.status]} | ${note || '-'} |`)
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
    <!-- 左側：入力フォーム -->
    <div class="panel advisory-form-panel">
      <h2>製品ポートフォリオ VEX 作成</h2>
      <p class="hint">特定CVEに対する自社製品群の影響調査ステータスを CSAF 2.0 VEX 形式で一括出力します。</p>

      <div v-if="toastMsg" class="bar toast-bar">
        <span class="status toast-text">{{ toastMsg }}</span>
      </div>

      <form @submit.prevent class="form-container">
        <!-- 対象CVE番号 -->
        <div>
          <label>対象 CVE 番号（必須）</label>
          <input type="text" v-model="cve" placeholder="例：CVE-2026-1234" />
        </div>

        <!-- CSAF 発行者情報 -->
        <div class="row">
          <div>
            <label>発行者名（組織名・PSIRT名）</label>
            <input type="text" v-model="publisherName" placeholder="例：株式会社サンプル PSIRT" />
          </div>
          <div>
            <label>発行者URL（Namespace）</label>
            <input type="url" v-model="publisherNamespace" placeholder="https://example.co.jp" />
          </div>
        </div>

        <!-- 管理番号・公開日 -->
        <div class="row">
          <div>
            <label>文書管理番号</label>
            <input type="text" v-model="aid" placeholder="VEX-2026-001" />
          </div>
          <div>
            <label>公開日</label>
            <input type="date" v-model="pub" />
          </div>
        </div>

        <!-- 全体概要 -->
        <div>
          <label>調査の全体概要</label>
          <textarea v-model="summary" rows="2" placeholder="本脆弱性に対する自社製品群の影響調査結果です。"></textarea>
        </div>

        <!-- 製品影響判定マトリクスエリア -->
        <div class="products-section">
          <div class="section-header-bar">
            <label class="section-title">製品別ステータス設定（全 {{ prods.length }} 件）</label>
            
            <!-- モード切り替えトグルボタン -->
            <div class="mode-toggle-btns" role="tablist">
              <button
                type="button"
                :class="{ active: inputMode === 'form' }"
                @click="inputMode = 'form'"
              >
                📝 フォーム入力 (1件ずつ)
              </button>
              <button
                type="button"
                :class="{ active: inputMode === 'paste' }"
                @click="inputMode = 'paste'"
              >
                📋 Excelコピペ (TSV一括)
              </button>
            </div>
          </div>

          <!-- ① フォーム入力モード -->
          <div v-if="inputMode === 'form'" class="mode-content">
            <div class="action-bar">
              <button type="button" class="btn-sub" @click="handleCopyTsv">
                📋 現在の表をExcel用にコピー
              </button>
            </div>

            <div v-for="(p, index) in prods" :key="index" class="vex-product-card">
              <div class="row">
                <input type="text" v-model="p.name" placeholder="製品名（例: Gateway Appliance）" />
                <input type="text" v-model="p.version" placeholder="バージョン（例: v1.0〜v2.4）" />
              </div>

              <div class="row">
                <div>
                  <label class="sub-label">ステータス</label>
                  <select v-model="p.status">
                    <option value="known_not_affected">影響なし (known_not_affected)</option>
                    <option value="known_affected">影響あり (known_affected)</option>
                    <option value="fixed">修正済み (fixed)</option>
                    <option value="under_investigation">調査中 (under_investigation)</option>
                  </select>
                </div>

                <div v-if="p.status === 'known_not_affected'">
                  <label class="sub-label">影響なしの理由 (Justification)</label>
                  <select v-model="p.justification">
                    <option value="vulnerable_code_not_present">該当コード未搭載 (not_present)</option>
                    <option value="vulnerable_code_not_in_execute_path">実行パスが存在しない (not_in_execute_path)</option>
                    <option value="vulnerable_code_cannot_be_controlled_by_adversary">攻撃者から制御不能 (cannot_be_controlled)</option>
                    <option value="inline_mitigations_already_exist">緩和策適用済み (mitigations_exist)</option>
                  </select>
                </div>
              </div>

              <div>
                <input type="text" v-model="p.detail" placeholder="補足説明・回避策・パッチ情報など（任意）" />
              </div>

              <div class="del-btn-bar">
                <button type="button" class="del-btn" @click="removeProd(index)">この製品を削除</button>
              </div>
            </div>

            <button type="button" @click="addProd" class="add-btn">+ 製品を追加</button>
          </div>

          <!-- ② Excelコピペ (TSV一括) モード -->
          <div v-else class="mode-content paste-container">
            <p class="hint-text">
              Excel やスプレッドシートの行（製品名 / バージョン / ステータス / 理由 / 補足）をそのまま貼り付けできます。
            </p>
            <textarea
              v-model="pasteText"
              rows="8"
              class="tsv-textarea"
              placeholder="製品名&#9;バージョン&#9;ステータス&#9;影響なし理由&#9;補足メモ&#10;例:&#10;Gateway Appliance&#9;v2.4.1以前&#9;影響なし&#9;該当コード未搭載&#9;機能オフ&#10;Sensor Node&#9;v1.0.0&#9;影響あり&#9;&#9;次回FWで修正&#10;Cloud Console&#9;全バージョン&#9;修正済み&#9;&#9;2026-10-28適用済"
            ></textarea>

            <div v-if="pasteNotes.length" class="paste-notes">
              <p v-for="(note, i) in pasteNotes" :key="i" class="note-item">ℹ️ {{ note }}</p>
            </div>

            <div class="paste-btn-bar">
              <button type="button" class="primary" @click="handleImportPaste('append')">
                + 一括追加（表の末尾に追加）
              </button>
              <button type="button" class="btn-warn" @click="handleImportPaste('replace')">
                🔄 既存の表を上書き
              </button>
              <button type="button" class="btn-sub" @click="handleExportToPasteArea">
                📤 現在の表をここに出力
              </button>
            </div>
          </div>
        </div>

        <!-- 関連URL -->
        <div>
          <label>参照リンク (URL)</label>
          <textarea v-model="refs" rows="2" placeholder="https://..."></textarea>
        </div>
      </form>
    </div>

    <!-- 右側：出力パネル -->
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
</style>

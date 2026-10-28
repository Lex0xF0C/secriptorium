<script setup lang="ts">
import { ref, computed } from 'vue'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'
import {
  buildCsafVex,
  vexWarnings,
  type VexForm,
  type VexProduct,
  type VexStatus,
  type VexJustification
} from '../lib/vex'

// フォーム入力状態 (メモリ内管理)
const cve = ref('')
const aid = ref('')
const publisherName = ref('')
const publisherNamespace = ref('')
const pub = ref(new Date().toISOString().split('T')[0])
const summary = ref('')
const refs = ref('')
const contact = ref('')

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

// フォームオブジェクトの集約
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

// CSAF VEX JSON の計算
const csafVexOutput = computed(() => JSON.stringify(buildCsafVex(formObject.value), null, 2))

// 人間用 Markdown レポートの計算
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

// OutputPanel 用タブ設定
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
      <p class="hint">特定のCVEに対する自社製品群の影響調査ステータスを CSAF 2.0 VEX 形式で一括出力します。</p>

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

        <!-- 製品影響判定マトリクス（メイン入力エリア） -->
        <div>
          <label>製品別ステータス設定</label>
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
}
.add-btn {
  margin-top: 4px;
}
</style>

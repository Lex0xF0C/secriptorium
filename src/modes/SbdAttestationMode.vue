<script setup lang="ts">
import { ref, computed } from 'vue'
import { I18N_JA } from '../lib/i18n-ja'
import {
  defaultSbdAttestationForm,
  sbdAttestationWarnings,
  generateSbdAttestationMarkdown,
  generateSbdAttestationCdxaJson,
  type SbdAttestationForm,
  type EvidenceItem
} from '../lib/sbd-attestation'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'

const ui = I18N_JA.sbdAttestationUi || {}
const form = ref<SbdAttestationForm>(defaultSbdAttestationForm())

const toastMsg = ref('')
let toastTimer: number | null = null

const showToast = (msg: string) => {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMsg.value = '' }, 2800)
}

const checkedCount = computed(() => form.value.items.filter((it) => it.checked).length)
const totalCount = computed(() => form.value.items.length)
const progressPercent = computed(() => Math.round((checkedCount.value / totalCount.value) * 100))

const resetForm = () => {
  if (window.confirm(ui.resetConfirm || 'すべてのチェックと証跡メモを初期化します。よろしいですか？')) {
    form.value = defaultSbdAttestationForm()
    showToast('初期化しました')
  }
}

const markdownOutput = computed<string>(() => generateSbdAttestationMarkdown(form.value))
const cdxaJsonOutput = computed<string>(() => generateSbdAttestationCdxaJson(form.value))
const warnings = computed<string[]>(() => sbdAttestationWarnings(form.value))

const tabs = computed<OutputTab[]>(() => [
  {
    id: 'markdown',
    label: 'Markdown 証跡報告書',
    content: markdownOutput.value,
    ext: '.md',
    mime: 'text/markdown;charset=utf-8',
    warnings: warnings.value
  },
  {
    id: 'cdxa_json',
    label: 'CycloneDX 1.6 CDXA (機械可読JSON)',
    content: cdxaJsonOutput.value,
    ext: '.json',
    mime: 'application/json;charset=utf-8'
  }
])
</script>

<template>
  <main class="cols">
    <section class="panel" aria-label="セキュア・バイ・デザイン アテステーション入力">
      <h2>{{ ui.title || 'セキュア・バイ・デザイン 最低限の証跡 アテステーション生成' }}</h2>
      <p class="sub-intro">{{ ui.subtitle }}</p>

      <div v-if="toastMsg" class="bar toast-bar">
        <span class="status toast-text">{{ toastMsg }}</span>
      </div>

      <div class="notice-box">
        <span class="notice-icon">🔒</span>
        <p class="notice-text">{{ ui.noticeBadge }}</p>
      </div>

      <!-- 基本情報 -->
      <fieldset class="section-box">
        <legend>📋 対象製品と宣言者情報</legend>
        <div class="row">
          <label>{{ ui.productName?.split('|') || '対象製品名' }}
            <span class="hint">{{ ui.productName?.split('|')[1] }}</span>
            <input type="text" v-model="form.productName" placeholder="例: SafeGate-X1" />
          </label>
          <label>{{ ui.productVersion?.split('|') || '製品バージョン' }}
            <span class="hint">{{ ui.productVersion?.split('|')[1] }}</span>
            <input type="text" v-model="form.productVersion" placeholder="例: v2.1.0" />
          </label>
        </div>

        <div class="row">
          <label>{{ ui.asserterName?.split('|') || '適合宣言者・組織名' }}
            <span class="hint">{{ ui.asserterName?.split('|')[1] }}</span>
            <input type="text" v-model="form.asserterName" placeholder="例: 株式会社サンプル PSIRT" />
          </label>
          <label>{{ ui.asserterRole?.split('|') || '担当役割' }}
            <input type="text" v-model="form.asserterRole" placeholder="例: Product Security Lead" />
          </label>
        </div>

        <div class="row">
          <label>{{ ui.assessmentDate }}
            <input type="date" v-model="form.assessmentDate" />
          </label>
        </div>
      </fieldset>

      <!-- 証跡充足率バー -->
      <div class="progress-box">
        <div class="progress-header">
          <span class="progress-title">📊 証跡（Minimum Evidence）充足率: <strong>{{ progressPercent }}%</strong> ({{ checkedCount }} / {{ totalCount }})</span>
          <button type="button" class="btn-reset" @click="resetForm">{{ ui.btnReset || '🔄 初期化' }}</button>
        </div>
        <progress class="sbd-progress-bar" max="100" :value="progressPercent"></progress>
      </div>

      <!-- チェックリスト -->
      <div class="checklist-section">
        <h3>{{ ui.checklistTitle || '✅ 最低限の証跡（Minimum Evidence）チェックリスト' }}</h3>

        <div v-for="item in form.items" :key="item.id" class="evidence-card" :class="{ checked: item.checked }">
          <label class="evidence-checkbox">
            <input type="checkbox" v-model="item.checked" />
            <span class="item-title">{{ item.title }}</span>
            <span class="playbook-tag">{{ item.playbookTitle }}</span>
          </label>

          <p class="item-desc">{{ item.description }}</p>
          <span class="cra-badge">CRA 関連要件: {{ item.craRef }}</span>

          <div v-if="item.checked" class="evidence-detail-box">
            <label class="detail-label">具体的な証跡ログ / URL / ファイルパス:
              <input
                type="text"
                v-model="item.evidenceDetail"
                placeholder="例: [suspicious link removed] または docs/evidence/sast-log.json"
              />
            </label>
          </div>
        </div>
      </div>

      <!-- 特記事項 -->
      <fieldset class="section-box">
        <legend>📝 {{ ui.generalNotes?.split('|') || '特記事項・補足コメント' }}</legend>
        <textarea v-model="form.generalNotes" rows="3" placeholder="例外事項や補足説明を自由記述できます"></textarea>
      </fieldset>
    </section>

    <OutputPanel class="out" :tabs="tabs" base-name="sbd-minimum-evidence-attestation" />
  </main>
</template>

<style scoped>
.sub-intro { margin: 0 0 16px; color: var(--sub); font-size: 0.9rem; }
.toast-bar { margin-bottom: 12px; }
.toast-text { color: var(--accent); font-weight: 600; }
.notice-box {
  background: var(--bg); border: 1px solid var(--line); border-radius: 6px;
  padding: 10px 12px; margin-bottom: 16px; display: flex; gap: 8px; align-items: flex-start;
}
.notice-icon { font-size: 1.1rem; }
.notice-text { margin: 0; font-size: 0.82rem; color: var(--ink); line-height: 1.4; }
.section-box { border: 1px solid var(--line); border-radius: 6px; padding: 12px 14px; margin-bottom: 16px; }
.progress-box {
  background: var(--panel); border: 1px solid var(--line); border-radius: 6px;
  padding: 12px 14px; margin-bottom: 16px;
}
.progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.progress-title { font-size: 0.9rem; color: var(--ink); }
.btn-reset { font-size: 0.78rem; padding: 3px 8px; background: var(--bg); }
.sbd-progress-bar { width: 100%; height: 10px; border-radius: 5px; appearance: none; border: none; background-color: var(--line); }
.sbd-progress-bar::-webkit-progress-value { background-color: var(--accent); border-radius: 5px; }
.checklist-section { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.checklist-section h3 { font-size: 1rem; margin: 0 0 4px 0; color: var(--ink); }
.evidence-card {
  border: 1px solid var(--line); border-radius: 6px; padding: 12px;
  background: var(--panel); transition: all 0.2s ease;
}
.evidence-card.checked { border-color: var(--accent); background: rgba(76, 184, 203, 0.05); }
.evidence-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; flex-wrap: wrap; }
.evidence-checkbox input[type="checkbox"] { width: auto; cursor: pointer; }
.item-title { font-size: 0.92rem; font-weight: 600; color: var(--ink); }
.playbook-tag { font-size: 0.72rem; background: var(--bg); border: 1px solid var(--line); padding: 1px 6px; border-radius: 4px; color: var(--sub); }
.item-desc { font-size: 0.82rem; color: var(--sub); margin: 6px 0 6px 24px; line-height: 1.35; }
.cra-badge { font-size: 0.72rem; color: var(--accent); margin-left: 24px; display: inline-block; font-weight: 600; }
.evidence-detail-box { margin-top: 8px; margin-left: 24px; }
.detail-label { font-size: 0.78rem; font-weight: normal; color: var(--ink); display: block; }
.detail-label input { margin-top: 4px; padding: 4px 8px; font-size: 0.8rem; }
</style>

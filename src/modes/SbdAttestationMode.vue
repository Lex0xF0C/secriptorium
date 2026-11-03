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

const applyPreset = (item: EvidenceItem, presetValue: string) => {
  item.evidenceDetail = presetValue
  item.checked = true
  showToast('証跡プリセットを自動補完しました')
}

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
      <h2>{{ ui.title || 'セキュア・バイ・デザイン 最低限の証跡 (Minimum Evidence) アテステーション生成' }}</h2>
      <p class="sub-intro">{{ ui.subtitle }}</p>

      <div v-if="toastMsg" class="bar toast-bar">
        <span class="status toast-text">{{ toastMsg }}</span>
      </div>

      <!-- 初心者向け用語解説ボックス -->
      <div class="guide-box">
        <p class="guide-title">💡 「アテステーション (適合宣言)」と「最低限の証跡 (Minimum Evidence)」とは？</p>
        <p class="guide-text">
          欧州CRAの適合性評価（モジュールA）等において、<strong>「自社製品が意図通り安全に設計・開発・テストされている根拠」</strong>を監査人や顧客に機械可読（CycloneDX CDXA）および文書形式で実証するための構造化データです。リポジトリやCI/CDにある既存のログ・URLを紐付けるだけで宣言書を自動生成できます。
        </p>
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
          <label>{{ ui.assessmentDate || '評価・宣言実施日' }}
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

          <!-- ★ Playbook 直伝の解説テキスト (折りたたみ) -->
          <details class="playbook-details">
            <summary>📘 Playbook の解説と具体例を見る</summary>
            <div class="details-content">
              <p class="details-explanation"><strong>目的・背景:</strong> {{ item.explanation }}</p>
              <p class="details-examples-title"><strong>該当する具体的証跡の例:</strong></p>
              <ul>
                <li v-for="(ex, exIdx) in item.examples" :key="exIdx">{{ ex }}</li>
              </ul>
            </div>
          </details>

          <!-- 具体的証跡の入力欄 & ワンタッププリセット -->
          <div class="evidence-detail-box">
            <div class="preset-label-bar">
              <span class="detail-label">具体的な証跡ログ / URL / ファイルパス:</span>
              <div class="preset-buttons">
                <button
                  v-for="(ps, psIdx) in item.presets"
                  :key="psIdx"
                  type="button"
                  class="btn-preset-chip"
                  @click="applyPreset(item, ps.value)"
                >
                  + {{ ps.label }}
                </button>
              </div>
            </div>
            <input
              type="text"
              v-model="item.evidenceDetail"
              placeholder="例: [suspicious link removed] または docs/evidence/sast.json"
            />
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
.guide-box {
  background: rgba(76, 184, 203, 0.08); border: 1px solid var(--accent); border-radius: 6px;
  padding: 12px; margin-bottom: 14px;
}
.guide-title { font-size: 0.88rem; font-weight: bold; color: var(--ink); margin: 0 0 4px 0; }
.guide-text { font-size: 0.82rem; color: var(--sub); margin: 0; line-height: 1.45; }
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
.playbook-details { margin: 8px 0 8px 24px; font-size: 0.82rem; color: var(--sub); }
.playbook-details summary { cursor: pointer; color: var(--accent); font-weight: 600; }
.details-content { background: var(--bg); border: 1px solid var(--line); border-radius: 4px; padding: 8px 12px; margin-top: 6px; }
.details-explanation { margin: 0 0 6px 0; line-height: 1.4; color: var(--ink); }
.details-examples-title { margin: 0 0 4px 0; color: var(--ink); }
.details-content ul { margin: 0; padding-left: 1.2em; }
.details-content li { margin-bottom: 2px; }
.evidence-detail-box { margin-top: 10px; margin-left: 24px; }
.preset-label-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }
.detail-label { font-size: 0.78rem; font-weight: 600; color: var(--ink); }
.preset-buttons { display: flex; gap: 4px; flex-wrap: wrap; }
.btn-preset-chip { font-size: 0.72rem; padding: 2px 6px; background: var(--bg); border: 1px solid var(--line); border-radius: 4px; cursor: pointer; }
.btn-preset-chip:hover { border-color: var(--accent); color: var(--accent); }
.evidence-detail-box input { padding: 5px 8px; font-size: 0.82rem; }
</style>

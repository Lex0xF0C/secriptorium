<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../lib/i18n'
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

const { t } = useI18n()
const form = ref<SbdAttestationForm>(defaultSbdAttestationForm())

// 言語切替に応じて表示用アイテム配列を更新
const localizedItems = computed<EvidenceItem[]>(() => {
  const itemsDef = t.value.sbdAttestationItems || []
  return form.value.items.map((it) => {
    const matched = itemsDef.find((def) => def.id === it.id)
    if (matched) {
      return {
        ...it,
        playbookTitle: matched.playbookTitle,
        title: matched.title,
        description: matched.description,
        explanation: matched.explanation,
        examples: matched.examples,
        presets: matched.presets,
        craRef: matched.craRef
      }
    }
    return it
  })
})

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
  const target = form.value.items.find((i) => i.id === item.id)
  if (target) {
    target.evidenceDetail = presetValue
    target.checked = true
  }
  showToast(t.value.ui.presetSuccess || 'Inserted preset')
}

const resetForm = () => {
  if (window.confirm(t.value.sbdAttestationUi?.resetConfirm || 'Reset checklist?')) {
    form.value = defaultSbdAttestationForm()
    showToast('Reset completed')
  }
}

const markdownOutput = computed<string>(() => generateSbdAttestationMarkdown(form.value))
const cdxaJsonOutput = computed<string>(() => generateSbdAttestationCdxaJson(form.value))
const warnings = computed<string[]>(() => sbdAttestationWarnings(form.value))

const tabs = computed<OutputTab[]>(() => [
  {
    id: 'markdown',
    label: 'Markdown Evidence Report',
    content: markdownOutput.value,
    ext: '.md',
    mime: 'text/markdown;charset=utf-8',
    warnings: warnings.value
  },
  {
    id: 'cdxa_json',
    label: 'CycloneDX 1.6 CDXA (Machine JSON)',
    content: cdxaJsonOutput.value,
    ext: '.json',
    mime: 'application/json;charset=utf-8'
  }
])
</script>

<template>
  <main class="cols">
    <section class="panel" aria-label="Secure by Design Attestation Input">
      <h2>{{ t.sbdAttestationUi?.title }}</h2>
      <p class="sub-intro">{{ t.sbdAttestationUi?.subtitle }}</p>

      <div v-if="toastMsg" class="bar toast-bar">
        <span class="status toast-text">{{ toastMsg }}</span>
      </div>

      <div class="notice-box">
        <span class="notice-icon">🔒</span>
        <p class="notice-text">{{ t.sbdAttestationUi?.noticeBadge }}</p>
      </div>

      <!-- 基本情報 -->
      <fieldset class="section-box">
        <legend>📋 {{ t.sbdAttestationUi?.productName?.split('|')[0] }}</legend>
        <div class="row">
          <label>{{ t.sbdAttestationUi?.productName?.split('|')[0] }}
            <input type="text" v-model="form.productName" placeholder="e.g., SafeGate-X1" />
          </label>
          <label>{{ t.sbdAttestationUi?.productVersion?.split('|')[0] }}
            <input type="text" v-model="form.productVersion" placeholder="e.g., v2.1.0" />
          </label>
        </div>

        <div class="row">
          <label>{{ t.sbdAttestationUi?.asserterName?.split('|')[0] }}
            <input type="text" v-model="form.asserterName" placeholder="e.g., Sample Corp PSIRT" />
          </label>
          <label>{{ t.sbdAttestationUi?.asserterRole?.split('|')[0] }}
            <input type="text" v-model="form.asserterRole" placeholder="e.g., Product Security Lead" />
          </label>
        </div>

        <div class="row">
          <label>{{ t.sbdAttestationUi?.assessmentDate }}
            <input type="date" v-model="form.assessmentDate" />
          </label>
        </div>
      </fieldset>

      <!-- 証跡充足率バー -->
      <div class="progress-box">
        <div class="progress-header">
          <span class="progress-title">📊 Minimum Evidence Progress: <strong>{{ progressPercent }}%</strong> ({{ checkedCount }} / {{ totalCount }})</span>
          <button type="button" class="btn-reset" @click="resetForm">{{ t.sbdAttestationUi?.btnReset }}</button>
        </div>
        <progress class="sbd-progress-bar" max="100" :value="progressPercent"></progress>
      </div>

      <!-- チェックリスト -->
      <div class="checklist-section">
        <h3>{{ t.sbdAttestationUi?.checklistTitle }}</h3>

        <div v-for="item in localizedItems" :key="item.id" class="evidence-card" :class="{ checked: item.checked }">
          <label class="evidence-checkbox">
            <input
              type="checkbox"
              :checked="form.items.find(i => i.id === item.id)?.checked"
              @change="(e) => {
                const target = form.items.find(i => i.id === item.id);
                if (target) target.checked = (e.target as HTMLInputElement).checked;
              }"
            />
            <span class="item-title">{{ item.title }}</span>
            <span class="playbook-tag">{{ item.playbookTitle }}</span>
          </label>

          <p class="item-desc">{{ item.description }}</p>
          <span class="cra-badge">CRA Ref: {{ item.craRef }}</span>

          <!-- Playbook 解説 -->
          <details class="playbook-details">
            <summary>📘 Playbook Guidance & Examples</summary>
            <div class="details-content">
              <p class="details-explanation"><strong>Objective:</strong> {{ item.explanation }}</p>
              <p class="details-examples-title"><strong>Evidence Examples:</strong></p>
              <ul>
                <li v-for="(ex, exIdx) in item.examples" :key="exIdx">{{ ex }}</li>
              </ul>
            </div>
          </details>

          <!-- 入力欄 & プリセット -->
          <div class="evidence-detail-box">
            <div class="preset-label-bar">
              <span class="detail-label">Evidence Log / URL / Path:</span>
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
              :value="form.items.find(i => i.id === item.id)?.evidenceDetail"
              @input="(e) => {
                const target = form.items.find(i => i.id === item.id);
                if (target) target.evidenceDetail = (e.target as HTMLInputElement).value;
              }"
              placeholder="e.g., docs/evidence/scan-report.json"
            />
          </div>
        </div>
      </div>

      <!-- 特記事項 -->
      <fieldset class="section-box">
        <legend>📝 {{ t.sbdAttestationUi?.generalNotes?.split('|')[0] }}</legend>
        <textarea v-model="form.generalNotes" rows="3" placeholder="Optional notes"></textarea>
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

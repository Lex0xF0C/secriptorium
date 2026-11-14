<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../lib/i18n'
import {
  defaultCvdProcessForm,
  calculateProgress,
  cvdProcessWarnings,
  generateCvdProcessMarkdown,
  generateCvdProcessJson,
  type CvdProcessForm,
  type CvdProcessPhase,
  type CvdProcessItem
} from '../lib/cvd-process'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'

const { lang, t } = useI18n()

const ui = computed(() => t.value.cvdProcessUi || {})
const fields = computed(() => t.value.cvdProcessFields || {})

const form = ref<CvdProcessForm>(defaultCvdProcessForm(lang.value))
const filterStatus = ref<'all' | 'pending' | 'done'>('all')

const toastMsg = ref('')
let toastTimer: number | null = null

const showToast = (msg: string) => {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMsg.value = '' }, 2800)
}

const progress = computed(() => calculateProgress(form.value))

const toggleItem = (item: CvdProcessItem) => {
  item.completed = !item.completed
  if (item.completed && !item.completedDate) {
    const d = new Date()
    const p = (n: number) => String(n).padStart(2, '0')
    item.completedDate = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  }
}

const setPhaseState = (phase: CvdProcessPhase, completed: boolean) => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  const today = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`

  phase.items.forEach((item) => {
    item.completed = completed
    if (completed && !item.completedDate) {
      item.completedDate = today
    }
  })
}

const resetForm = () => {
  if (window.confirm(ui.value.resetConfirm || 'チェックリストの入力をデフォルト初期状態に戻します。よろしいですか？')) {
    form.value = defaultCvdProcessForm(lang.value)
    showToast(ui.value.resetToast || '初期状態にリセットしました')
  }
}

// 言語切替に応じてフェーズ名と項目定義を動的ローカライズ
const localizedPhases = computed(() => {
  const defs = t.value.cvdProcessPhases || []
  return form.value.phases.map((phase) => {
    const pDef = defs.find((d) => d.id === phase.id)
    return {
      ...phase,
      title: pDef ? pDef.title : phase.title,
      description: pDef ? pDef.description : phase.description,
      items: phase.items.map((item) => {
        const iDef = pDef?.items.find((it) => it.id === item.id)
        return {
          ...item,
          title: iDef ? iDef.title : item.title,
          description: iDef ? iDef.description : item.description,
        }
      })
    }
  })
})

const markdownOutput = computed<string>(() => generateCvdProcessMarkdown(form.value, lang.value))
const jsonOutput = computed<string>(() => generateCvdProcessJson(form.value))
const warnings = computed<string[]>(() => cvdProcessWarnings(form.value, lang.value))

const tabs = computed<OutputTab[]>(() => [
  {
    id: 'markdown',
    label: ui.value.tabMarkdown || 'Markdown進捗レポート',
    content: markdownOutput.value,
    ext: '.md',
    mime: 'text/markdown;charset=utf-8',
    warnings: warnings.value
  },
  {
    id: 'json',
    label: ui.value.tabJson || 'JSONデータ (バックアップ)',
    content: jsonOutput.value,
    ext: '.json',
    mime: 'application/json;charset=utf-8'
  }
])
</script>

<template>
  <main class="cols">
    <!-- 左側：入力＆チェックリストフォーム -->
    <section class="panel" aria-label="CVDプロセス管理フォーム">
      <h2>{{ ui.title || 'CVDプロセス管理・タイムライン生成' }}</h2>
      <p class="sub-intro">{{ ui.subtitle }}</p>

      <!-- トースト通知 -->
      <div v-if="toastMsg" class="bar toast-bar">
        <span class="status toast-text">{{ toastMsg }}</span>
      </div>

      <!-- 完全ブラウザ完結・データ不保持の警告バッジ -->
      <div class="notice-box">
        <span class="notice-icon">🔒</span>
        <p class="notice-text">{{ ui.noticeBadge }}</p>
      </div>

      <!-- 案件基本情報 -->
      <fieldset class="section-box">
        <legend>📋 {{ ui.legendBasic || '1. 案件基本情報' }}</legend>
        <div class="row">
          <label>{{ fields.cveId?.split('|')[0] || '管理番号 / CVE ID' }}
            <span class="hint">{{ fields.cveId?.split('|')[1] }}</span>
            <input type="text" v-model="form.cveId" placeholder="e.g., CVE-2026-0001 / CVD-2026-001" />
          </label>
          <label>{{ fields.title?.split('|')[0] || '脆弱性件名・タイトル' }}
            <span class="hint">{{ fields.title?.split('|')[1] }}</span>
            <input type="text" v-model="form.title" placeholder="e.g., Auth Bypass Flaw" />
          </label>
        </div>

        <div class="row">
          <label>{{ fields.reporter?.split('|')[0] || '報告者名・連絡先' }}
            <span class="hint">{{ fields.reporter?.split('|')[1] }}</span>
            <input type="text" v-model="form.reporter" placeholder="e.g., CERT/CC, Researcher" />
          </label>
          <label>{{ fields.assignee?.split('|')[0] || '社内担当者 / PSIRT' }}
            <span class="hint">{{ fields.assignee?.split('|')[1] }}</span>
            <input type="text" v-model="form.assignee" placeholder="e.g., PSIRT Dev Team" />
          </label>
        </div>

        <div class="row">
          <label>{{ fields.receivedDate?.split('|')[0] || '報告受領日' }}
            <span class="hint">{{ fields.receivedDate?.split('|')[1] }}</span>
            <input type="date" v-model="form.receivedDate" />
          </label>
          <label>{{ fields.targetReleaseDate?.split('|')[0] || '目標公開日 (エンバーゴ)' }}
            <span class="hint">{{ fields.targetReleaseDate?.split('|')[1] }}</span>
            <input type="date" v-model="form.targetReleaseDate" />
          </label>
        </div>
      </fieldset>

      <!-- 進捗状況の可視化バー -->
      <div class="progress-box">
        <div class="progress-header">
          <span class="progress-title">📊 {{ ui.progressLabel || '全体の進捗状況' }}: <strong>{{ progress.percent }}%</strong> ({{ progress.completed }} / {{ progress.total }})</span>
          <button type="button" class="btn-reset" @click="resetForm">{{ ui.btnReset || '🔄 デフォルト状態にリセット' }}</button>
        </div>
        <progress class="cvd-progress-bar" max="100" :value="progress.percent"></progress>

        <!-- フィルタリングボタン -->
        <div class="filter-bar">
          <span class="filter-label">{{ ui.filterLabel || '表示フィルター:' }}</span>
          <button
            type="button"
            class="filter-btn"
            :class="{ active: filterStatus === 'all' }"
            @click="filterStatus = 'all'"
          >
            {{ ui.filterAll || 'すべて表示' }}
          </button>
          <button
            type="button"
            class="filter-btn"
            :class="{ active: filterStatus === 'pending' }"
            @click="filterStatus = 'pending'"
          >
            {{ ui.filterPending || '未完了のみ' }}
          </button>
          <button
            type="button"
            class="filter-btn"
            :class="{ active: filterStatus === 'done' }"
            @click="filterStatus = 'done'"
          >
            {{ ui.filterDone || '完了済みのみ' }}
          </button>
        </div>
      </div>

      <!-- フェーズ別チェックリスト -->
      <div class="phases-container">
        <h3 class="section-title">✅ {{ ui.phaseTitle || '対応フェーズ別チェックリスト' }}</h3>

        <div v-for="phase in localizedPhases" :key="phase.id" class="phase-card">
          <div class="phase-header">
            <div>
              <h4 class="phase-title">{{ phase.title }}</h4>
              <p class="phase-desc">{{ phase.description }}</p>
            </div>
            <div class="phase-actions">
              <button type="button" class="btn-phase-action" @click="setPhaseState(phase, true)">
                {{ ui.btnAllDone || '全完了' }}
              </button>
              <button type="button" class="btn-phase-action" @click="setPhaseState(phase, false)">
                {{ ui.btnAllClear || '解除' }}
              </button>
            </div>
          </div>

          <div class="checklist-items">
            <div
              v-for="item in phase.items"
              :key="item.id"
              v-show="filterStatus === 'all' || (filterStatus === 'pending' && !item.completed) || (filterStatus === 'done' && item.completed)"
              class="item-row"
              :class="{ completed: item.completed }"
            >
              <div class="item-main">
                <label class="checkbox-container">
                  <input
                    type="checkbox"
                    :checked="item.completed"
                    @change="toggleItem(item)"
                  />
                  <span class="item-title">{{ item.title }}</span>
                </label>
                <p class="item-desc">{{ item.description }}</p>
              </div>

              <div class="item-meta">
                <div class="item-date-input">
                  <span class="meta-label">{{ ui.completedDateLabel || '完了日:' }}</span>
                  <input
                    type="date"
                    v-model="item.completedDate"
                    :disabled="!item.completed"
                  />
                </div>
                <div class="item-notes-input">
                  <input
                    type="text"
                    v-model="item.notes"
                    :placeholder="ui.notesPh || 'メモ・関連URL・対応者など'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 全体備考 -->
      <fieldset class="section-box">
        <legend>📝 {{ fields.generalNotes?.split('|')[0] || '全体備考・特記事項' }}</legend>
        <p class="hint">{{ fields.generalNotes?.split('|')[1] }}</p>
        <textarea
          v-model="form.generalNotes"
          rows="3"
          :placeholder="ui.generalNotesPh || '非公開情報、検証環境、ステークホルダーとの事前調整メモなど'"
        ></textarea>
      </fieldset>
    </section>

    <!-- 右側：共通 OutputPanel によるリアルタイムプレビュー＆保存出力 -->
    <OutputPanel class="out" :tabs="tabs" base-name="cvd-process-report" />
  </main>
</template>

<style scoped>
.sub-intro {
  margin: 0 0 16px;
  color: var(--sub);
  font-size: 0.9rem;
}
.toast-bar {
  margin-bottom: 12px;
}
.toast-text {
  color: var(--accent);
  font-weight: 600;
}
.notice-box {
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.notice-icon {
  font-size: 1.1rem;
}
.notice-text {
  margin: 0;
  font-size: 0.82rem;
  color: var(--ink);
  line-height: 1.4;
}
.section-box {
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 16px;
}
.section-title {
  font-size: 1.05rem;
  margin: 20px 0 12px 0;
  color: var(--ink);
}

.progress-box {
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 16px;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.progress-title {
  font-size: 0.95rem;
  color: var(--ink);
}
.btn-reset {
  background: transparent;
  border: 1px solid var(--line);
  padding: 4px 8px;
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  color: var(--sub);
}
.btn-reset:hover {
  color: var(--ink);
  border-color: var(--ink);
}
.cvd-progress-bar {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}
.cvd-progress-bar::-webkit-progress-bar {
  background-color: var(--line);
}
.cvd-progress-bar::-webkit-progress-value {
  background-color: var(--accent);
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.filter-label {
  font-size: 0.8rem;
  color: var(--sub);
  margin-right: 4px;
}
.filter-btn {
  background: var(--panel);
  border: 1px solid var(--line);
  padding: 3px 8px;
  font-size: 0.78rem;
  border-radius: 4px;
  cursor: pointer;
  color: var(--sub);
}
.filter-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.phases-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
}
.phase-card {
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--bg);
  padding: 12px;
}
.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 8px;
  gap: 12px;
}
.phase-title {
  margin: 0 0 2px 0;
  font-size: 0.95rem;
  color: var(--ink);
}
.phase-desc {
  margin: 0;
  font-size: 0.78rem;
  color: var(--sub);
}
.phase-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.btn-phase-action {
  background: var(--panel);
  border: 1px solid var(--line);
  padding: 2px 6px;
  font-size: 0.72rem;
  border-radius: 3px;
  cursor: pointer;
  color: var(--sub);
}
.btn-phase-action:hover {
  color: var(--ink);
  border-color: var(--ink);
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 4px;
  transition: all 0.2s;
}
.item-row.completed {
  border-color: var(--accent);
  background: rgba(76, 184, 203, 0.05);
}
.item-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  margin: 0 !important;
}
.checkbox-container input[type="checkbox"] {
  width: auto;
  margin: 0;
}
.item-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink);
}
.item-desc {
  margin: 0 0 0 22px;
  font-size: 0.78rem;
  color: var(--sub);
  line-height: 1.3;
}
.item-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-left: 22px;
  flex-wrap: wrap;
}
.item-date-input {
  display: flex;
  align-items: center;
  gap: 4px;
}
.meta-label {
  font-size: 0.75rem;
  color: var(--sub);
}
.item-date-input input[type="date"] {
  padding: 2px 6px;
  font-size: 0.78rem;
  height: auto;
}
.item-notes-input {
  flex: 1;
  min-width: 180px;
}
.item-notes-input input[type="text"] {
  padding: 3px 6px;
  font-size: 0.78rem;
  height: auto;
}
</style>

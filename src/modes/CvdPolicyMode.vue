<!-- src/modes/CvdPolicyMode.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../lib/i18n'
import { generateCvdPolicy, type CvdPolicyForm } from '../lib/cvd-policy'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'

const { lang, t } = useI18n()

// 言語切替に応じて辞書プロパティを動的に取得
const ui = computed(() => t.value.cvdUi || {})
const fields = computed(() => t.value.cvdFields || {})
const presets = computed(() => t.value.cvdPresets || [])

const form = ref<CvdPolicyForm>({
  orgName: '',
  contactEmail: '',
  scope: '',
  reporting: '',
  safeHarbor: '',
  timeline: '',
  preferences: '',
  acknowledgments: ''
})

const toastMsg = ref('')
let toastTimer: number | null = null

const showToast = (msg: string) => {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMsg.value = '' }, 2800)
}

// クイックセットアップ（言語に応じたプリセットテンプレートを適用）
const applyPreset = (presetValues: CvdPolicyForm) => {
  form.value.scope = presetValues.scope
  form.value.reporting = presetValues.reporting
  form.value.safeHarbor = presetValues.safeHarbor
  form.value.timeline = presetValues.timeline
  form.value.preferences = presetValues.preferences
  form.value.acknowledgments = presetValues.acknowledgments
  showToast(t.value.ui?.presetSuccess || 'Preset applied')
}

// 現在の選択言語 (lang.value) を渡して Markdown を動的生成
const markdownOutput = computed<string>(() => generateCvdPolicy(form.value, lang.value))

// OutputPanel に渡すためのタブ定義
const tabs = computed<OutputTab[]>(() => [
  {
    id: 'markdown',
    label: 'Markdown',
    content: markdownOutput.value,
    ext: '.md',
    mime: 'text/markdown;charset=utf-8',
  }
])
</script>

<template>
  <main class="cols">
    <!-- 左側：入力フォームパネル -->
    <section class="panel" aria-label="CVD Policy Form">
      <h2>{{ ui.cvdTitle }}</h2>
      <p class="sub-intro">{{ ui.cvdSubtitle }}</p>

      <!-- トースト通知 -->
      <div v-if="toastMsg" class="bar toast-bar">
        <span class="status toast-text">{{ toastMsg }}</span>
      </div>

      <!-- 💡 クイックセットアップ（プリセット選択） -->
      <div class="preset-box" v-if="presets.length > 0">
        <p class="preset-title">{{ ui.presetTitle }}</p>
        <div class="preset-buttons">
          <button
            v-for="p in presets"
            :key="p.id"
            type="button"
            class="preset-btn"
            @click="applyPreset(p.values)"
          >
            <span class="preset-label">{{ p.label }}</span>
            <span class="preset-desc">{{ p.desc }}</span>
          </button>
        </div>
      </div>

      <div class="row">
        <label>{{ fields.orgName?.split('|') }}
          <span class="hint">{{ fields.orgName?.split('|')[1] }}</span>
          <input type="text" v-model="form.orgName" placeholder="e.g., Sample Corp" />
        </label>
        <label>{{ fields.contactEmail?.split('|') }}
          <span class="hint">{{ fields.contactEmail?.split('|')[1] }}</span>
          <input type="text" v-model="form.contactEmail" placeholder="security@example.com" />
        </label>
      </div>

      <label>{{ fields.scope?.split('|') }}
        <span class="hint">{{ fields.scope?.split('|')[1] }}</span>
        <textarea v-model="form.scope" rows="3"></textarea>
      </label>

      <label>{{ fields.reporting?.split('|') }}
        <span class="hint">{{ fields.reporting?.split('|')[1] }}</span>
        <textarea v-model="form.reporting" rows="3"></textarea>
      </label>

      <label>{{ fields.safeHarbor?.split('|') }}
        <span class="hint">{{ fields.safeHarbor?.split('|')[1] }}</span>
        <textarea v-model="form.safeHarbor" rows="3"></textarea>
      </label>

      <label>{{ fields.timeline?.split('|') }}
        <span class="hint">{{ fields.timeline?.split('|')[1] }}</span>
        <textarea v-model="form.timeline" rows="3"></textarea>
      </label>

      <label>{{ fields.preferences?.split('|') }}
        <span class="hint">{{ fields.preferences?.split('|')[1] }}</span>
        <textarea v-model="form.preferences" rows="3"></textarea>
      </label>

      <label>{{ fields.acknowledgments?.split('|') }}
        <span class="hint">{{ fields.acknowledgments?.split('|')[1] }}</span>
        <textarea v-model="form.acknowledgments" rows="2"></textarea>
      </label>
    </section>

    <!-- 右側：共通 OutputPanel によるリアルタイムプレビュー＆保存出力 -->
    <OutputPanel class="out" :tabs="tabs" base-name="cvd-policy" />
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
.preset-box {
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}
.preset-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 8px 0;
}
.preset-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}
.preset-btn {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: all 0.2s ease;
}
.preset-btn:hover {
  border-color: var(--accent);
  background: rgba(76, 184, 203, 0.08);
}
.preset-label {
  font-size: 0.82rem;
  font-weight: bold;
  color: var(--ink);
}
.preset-desc {
  font-size: 0.72rem;
  color: var(--sub);
  line-height: 1.2;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { I18N_JA } from '../lib/i18n-ja'
import { generateCvdPolicy, type CvdPolicyForm } from '../lib/cvd-policy'

const ui = I18N_JA.cvdUi || {}
const fields = I18N_JA.cvdFields || {}

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

const markdownOutput = ref<string>(generateCvdPolicy(form.value))

const updateOutput = () => {
  markdownOutput.value = generateCvdPolicy(form.value)
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(markdownOutput.value)
    alert(ui.copiedCvd || 'コピーしました')
  } catch (e) {
    alert('コピーに失敗しました')
  }
}

const downloadMarkdown = () => {
  const blob = new Blob([markdownOutput.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'cvd-policy.md'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<template>
  <div class="cvd-mode">
    <h2>{{ ui.cvdTitle || 'CVDポリシー作成ツール' }}</h2>
    <p class="subtitle">{{ ui.cvdSubtitle }}</p>

    <div class="container">
      <!-- 入力フォーム -->
      <div class="form-section" @input="updateOutput">
        <div class="field" v-for="(desc, key) in fields" :key="key">
          <label>{{ desc.split('|')[0] }}</label>
          <span class="hint">{{ desc.split('|')[1] }}</span>
          <template v-if="key === 'orgName' || key === 'contactEmail'">
            <input type="text" v-model="form[key as keyof CvdPolicyForm]" :placeholder="desc.split('|')[1]" />
          </template>
          <template v-else>
            <textarea v-model="form[key as keyof CvdPolicyForm]" rows="3" :placeholder="desc.split('|')[1]"></textarea>
          </template>
        </div>
      </div>

      <!-- プレビュー・出力エリア -->
      <div class="preview-section">
        <div class="actions">
          <button type="button" @click="copyToClipboard">{{ ui.copyCvd || '📋 コピー' }}</button>
          <button type="button" @click="downloadMarkdown">{{ ui.dlCvd || '💾 保存' }}</button>
        </div>
        <pre class="preview-box"><code>{{ markdownOutput }}</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cvd-mode { padding: 1rem; }
.subtitle { margin-bottom: 1.5rem; color: #555; }
.container { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.field { margin-bottom: 1rem; display: flex; flex-direction: column; }
.field label { font-weight: bold; margin-bottom: 0.2rem; }
.hint { font-size: 0.85rem; color: #666; margin-bottom: 0.4rem; }
.field input, .field textarea { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
.actions { margin-bottom: 0.8rem; display: flex; gap: 0.5rem; }
.preview-box { background: #f4f4f4; padding: 1rem; border-radius: 4px; max-height: 650px; overflow-y: auto; white-space: pre-wrap; font-family: monospace; font-size: 0.9rem; }
</style>

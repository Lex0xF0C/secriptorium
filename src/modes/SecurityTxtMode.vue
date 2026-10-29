<script setup lang="ts">
import { ref, computed } from 'vue'
import { I18N_JA } from '../lib/i18n-ja'
import { generateSecurityTxt, type SecurityTxtForm } from '../lib/security-txt'

const form = ref<SecurityTxtForm>({
  contact: 'mailto:security@example.com',
  expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  encryption: '',
  acknowledgments: '',
  preferredLanguages: 'ja, en',
  canonical: '',
  policy: '',
  hiring: ''
})

const toastMessage = ref('')

const fields = computed(() => {
  const raw = I18N_JA.securityTxtFields as Record<string, string>
  return Object.entries(raw).map(([key, val]) => {
    const [label, hint] = val.split('|')
    return {
      key: key as keyof SecurityTxtForm,
      label,
      hint
    }
  })
})

const outputText = computed(() => generateSecurityTxt(form.value))

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(outputText.value)
    toastMessage.value = I18N_JA.ui.copiedSecurityTxt || 'コピーしました'
    setTimeout(() => { toastMessage.value = '' }, 3000)
  } catch {
    toastMessage.value = 'コピーに失敗しました'
  }
}

const handleDownload = () => {
  const blob = new Blob([outputText.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'security.txt'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<template>
  <!-- style.css の .cols をそのまま利用して左右2カラムに分割 -->
  <main class="cols">
    <!-- 左側：入力パネル -->
    <div class="panel">
      <h2>{{ I18N_JA.ui.securityTxtTitle }}</h2>
      <p class="hint">{{ I18N_JA.ui.securityTxtSubtitle }}</p>

      <form @submit.prevent>
        <div v-for="f in fields" :key="f.key">
          <label :for="f.key">{{ f.label }}</label>
          <textarea
            v-if="f.key === 'contact'"
            :id="f.key"
            v-model="form[f.key]"
          ></textarea>
          <input
            v-else
            :id="f.key"
            v-model="form[f.key]"
            type="text"
          />
          <span v-if="f.hint" class="hint">{{ f.hint }}</span>
        </div>
      </form>
    </div>

    <!-- 右側：プレビュー・出力パネル (.out でsticky化) -->
    <div class="panel out">
      <div class="bar">
        <h3>プレビュー (.well-known/security.txt)</h3>
      </div>
      <div class="bar">
        <button type="button" class="primary" @click="handleCopy">{{ I18N_JA.ui.copySecurityTxt }}</button>
        <button type="button" @click="handleDownload">{{ I18N_JA.ui.dlSecurityTxt }}</button>
      </div>

      <pre><code>{{ outputText }}</code></pre>
      <p v-if="toastMessage" class="hint" role="status" style="color: var(--accent);">{{ toastMessage }}</p>
    </div>
  </main>
</template>

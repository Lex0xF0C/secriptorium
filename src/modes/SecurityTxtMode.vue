<!-- src/modes/SecurityTxtMode.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../lib/i18n'
import { generateSecurityTxt, type SecurityTxtForm } from '../lib/security-txt'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'

const { t } = useI18n()

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

// 言語設定に応じてフィールド名とヒントを動的パース
const fields = computed(() => {
  const raw = (t.value.securityTxtFields || {}) as Record<string, string>
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

const tabs = computed<OutputTab[]>(() => [
  {
    id: 'securitytxt',
    label: 'security.txt',
    content: outputText.value,
    ext: '.txt',
    mime: 'text/plain;charset=utf-8'
  }
])
</script>

<template>
  <main class="cols">
    <!-- 左側：入力パネル -->
    <div class="panel">
      <h2>{{ t.ui.securityTxtTitle }}</h2>
      <p class="hint">{{ t.ui.securityTxtSubtitle }}</p>

      <form @submit.prevent>
        <div v-for="f in fields" :key="f.key">
          <label :for="f.key">{{ f.label }}</label>
          <textarea
            v-if="f.key === 'contact'"
            :id="f.key"
            v-model="form[f.key]"
            rows="2"
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

    <!-- 右側：プレビュー・出力パネル -->
    <OutputPanel class="out" :tabs="tabs" base-name="security" />
  </main>
</template>

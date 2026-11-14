<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '../lib/i18n'
import type { OutputTab } from '../lib/output'

const props = defineProps<{ tabs: OutputTab[]; baseName: string }>()
const { lang, t } = useI18n()

const outTexts = computed(() => t.value.out || {
  label: '出力',
  copy: 'コピー',
  copied: 'コピーしました',
  copyFail: 'コピーできませんでした。範囲選択して手動でコピーしてください',
  saveAs: '{ext} で保存',
  saved: '保存しました',
  missing: 'この形式として足りない項目：'
})

const current = ref(0)
const msg = ref('')
const active = computed(() => props.tabs[Math.min(current.value, props.tabs.length - 1)])

function flash(text: string) {
  msg.value = text
  window.setTimeout(() => (msg.value = ''), 2500)
}

async function copy() {
  try {
    await navigator.clipboard.writeText(active.value.content)
    flash(outTexts.value.copied)
  } catch {
    flash(outTexts.value.copyFail)
  }
}

function download() {
  const tab = active.value
  const name = props.baseName.trim().replace(/[^\w.-]+/g, '_') || 'advisory'
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([tab.content], { type: tab.mime }))
  a.download = name + tab.ext
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  flash(outTexts.value.saved)
}
</script>

<template>
  <section class="panel out" :aria-label="outTexts.label">
    <div class="tabs" role="tablist">
      <button
        v-for="(tabItem, i) in tabs"
        :key="tabItem.id"
        type="button"
        role="tab"
        :aria-selected="i === current"
        :class="{ on: i === current }"
        @click="current = i"
      >{{ tabItem.label }}</button>
    </div>
    <p v-if="active.warnings && active.warnings.length" class="warn">
      {{ outTexts.missing }}{{ active.warnings.join(lang === 'en' ? ', ' : '、') }}
    </p>
    <div class="bar">
      <button type="button" class="primary" @click="copy">{{ outTexts.copy }}</button>
      <button type="button" @click="download">{{ outTexts.saveAs.replace('{ext}', active.ext) }}</button>
      <span class="status" role="status">{{ msg }}</span>
    </div>
    <pre>{{ active.content }}</pre>
  </section>
</template>

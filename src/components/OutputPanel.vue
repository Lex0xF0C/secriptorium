<script setup lang="ts">
import { computed, ref } from 'vue'
import type { OutputTab } from '../lib/output'

const props = defineProps<{ tabs: OutputTab[]; baseName: string }>()

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
    flash('コピーしました')
  } catch {
    flash('コピーできませんでした。範囲選択して手動でコピーしてください')
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
  flash('保存しました')
}
</script>

<template>
  <section class="panel out" aria-label="出力">
    <div class="tabs" role="tablist">
      <button
        v-for="(t, i) in tabs"
        :key="t.id"
        type="button"
        role="tab"
        :aria-selected="i === current"
        :class="{ on: i === current }"
        @click="current = i"
      >{{ t.label }}</button>
    </div>
    <p v-if="active.warnings && active.warnings.length" class="warn">
      この形式として足りない項目：{{ active.warnings.join('、') }}
    </p>
    <div class="bar">
      <button type="button" class="primary" @click="copy">コピー</button>
      <button type="button" @click="download">{{ active.ext }} で保存</button>
      <span class="status" role="status">{{ msg }}</span>
    </div>
    <pre>{{ active.content }}</pre>
  </section>
</template>

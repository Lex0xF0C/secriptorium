<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { METRICS, SEVERITY_JA, buildVector, cvssSummary, parseCvss } from '../lib/cvss'
import type { CvssVersion } from '../lib/cvss'
import { useI18n } from '../lib/i18n'

// v-model には CVSS のベクター文字列を渡します。
// 8項目がそろうとベクターを返し、そろっていないときは空文字を返します。
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { t } = useI18n()
const ui = computed(() => t.value.cvssUi || {})

const version = ref<CvssVersion>('3.1')
const sel = reactive<Record<string, string>>({})

const vector = computed(() => buildVector(version.value, sel))
const summary = computed(() => cvssSummary(vector.value))
const remaining = computed(() => METRICS.filter((m) => !sel[m.code]).length)

// 言語設定に応じたメトリクス一覧の動的ローカライズ
const localizedMetrics = computed(() => {
  const dict = t.value.cvss || {}
  return METRICS.map((m) => {
    const entry = dict[m.code]
    if (!entry) return m
    const [name, desc, optsDict] = entry
    return {
      code: m.code,
      name,
      desc,
      options: m.options.map((o) => {
        const optEntry = optsDict?.[o.code]
        return {
          code: o.code,
          label: optEntry ? optEntry[0] : o.label,
          desc: optEntry ? optEntry[1] : o.desc
        }
      })
    }
  })
})

const severityLabel = computed(() => {
  if (!summary.value) return ''
  const key = summary.value.severity.toLowerCase()
  return t.value.sev[key] || SEVERITY_JA[summary.value.severity] || summary.value.severity
})

// 外側（ベクターの入力欄）で正しいベクターが入力されたら、選択に反映する
watch(
  () => props.modelValue,
  (v) => {
    if (v === vector.value) return
    const p = parseCvss(v)
    if (!p) return
    version.value = p.version
    for (const k of Object.keys(sel)) delete sel[k]
    Object.assign(sel, p.metrics)
  },
  { immediate: true },
)

function update() {
  emit('update:modelValue', vector.value)
}
function pick(metric: string, code: string) {
  sel[metric] = code
  update()
}
function onVersion(e: Event) {
  version.value = (e.target as HTMLSelectElement).value as CvssVersion
  update()
}
function clear() {
  for (const k of Object.keys(sel)) delete sel[k]
  update()
}
</script>

<template>
  <div class="cvss-picker">
    <label>{{ ui.ver || 'CVSS のバージョン' }}
      <select :value="version" @change="onVersion">
        <option value="3.1">3.1</option>
        <option value="3.0">3.0</option>
        <option disabled>{{ ui.ver4Notice || '4.0（準備中。CSAF 2.0 が未対応のため）' }}</option>
      </select>
    </label>

    <fieldset v-for="m in localizedMetrics" :key="m.code">
      <legend>{{ m.name }}</legend>
      <p class="mdesc">{{ m.desc }}</p>
      <label v-for="o in m.options" :key="o.code" class="opt">
        <input
          type="radio"
          :name="'cvss-' + m.code"
          :value="o.code"
          :checked="sel[m.code] === o.code"
          @change="pick(m.code, o.code)"
        />
        <span class="on">{{ o.label }}</span>
        <span class="od">{{ o.desc }}</span>
      </label>
    </fieldset>

    <p v-if="summary" class="hint">
      {{ (ui.summary || '基本スコア {score}（{sev}）／ {vector}').replace('{score}', summary.score.toFixed(1)).replace('{sev}', severityLabel).replace('{vector}', vector) }}
    </p>
    <p v-else class="hint">
      {{ (ui.remaining || 'あと {n} 項目を選ぶと、基本スコアとベクターが入ります。').replace('{n}', String(remaining)) }}
    </p>
    <button type="button" @click="clear">{{ ui.reset || '選択をすべて解除' }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { METRICS, SEVERITY_JA, buildVector, cvssSummary, parseCvss } from '../lib/cvss'
import type { CvssVersion } from '../lib/cvss'

// v-model には CVSS のベクター文字列を渡します。
// 8項目がそろうとベクターを返し、そろっていないときは空文字を返します。
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const version = ref<CvssVersion>('3.1')
const sel = reactive<Record<string, string>>({})

const vector = computed(() => buildVector(version.value, sel))
const summary = computed(() => cvssSummary(vector.value))
const remaining = computed(() => METRICS.filter((m) => !sel[m.code]).length)

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
    <label>CVSS のバージョン
      <select :value="version" @change="onVersion">
        <option value="3.1">3.1</option>
        <option value="3.0">3.0</option>
        <option disabled>4.0（準備中。CSAF 2.0 が未対応のため）</option>
      </select>
    </label>

    <fieldset v-for="m in METRICS" :key="m.code">
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
      基本スコア {{ summary.score.toFixed(1) }}（{{ SEVERITY_JA[summary.severity] }}）／ {{ vector }}
    </p>
    <p v-else class="hint">あと {{ remaining }} 項目を選ぶと、基本スコアとベクターが入ります。</p>
    <button type="button" @click="clear">選択をすべて解除</button>
  </div>
</template>

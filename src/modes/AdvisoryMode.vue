<script setup lang="ts">
import { computed, reactive } from 'vue'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'
import {
  SEVERITY_JA,
  buildCsaf,
  buildMarkdown,
  csafWarnings,
  cvssSummary,
  emptyForm,
} from '../lib/advisory'

const form = reactive(emptyForm())

const cvss = computed(() => cvssSummary(form.cvssVector))
const cvssText = computed(() => {
  if (!form.cvssVector.trim()) return 'CVSS:3.1/ で始まる、8項目そろったベクターを入力すると、基本スコアを自動で計算します。'
  if (!cvss.value) return 'CVSS v3.1 のベクターとして読み取れません（8項目がそろっているか確認してください）。'
  return `基本スコア ${cvss.value.score.toFixed(1)}（${SEVERITY_JA[cvss.value.severity]}）`
})

const tabs = computed<OutputTab[]>(() => [
  {
    id: 'md',
    label: 'Markdown',
    content: buildMarkdown(form),
    ext: '.md',
    mime: 'text/markdown;charset=utf-8',
  },
  {
    id: 'csaf',
    label: 'CSAF 2.0 (JSON)',
    content: JSON.stringify(buildCsaf(form), null, 2),
    ext: '.json',
    mime: 'application/json;charset=utf-8',
    warnings: csafWarnings(form),
  },
])

function addProduct() {
  form.products.push({ name: '', version: '' })
}
function removeProduct(i: number) {
  form.products.splice(i, 1)
}
</script>

<template>
  <main class="cols">
    <section class="panel" aria-label="入力フォーム">
      <label>タイトル
        <input v-model="form.title" placeholder="例：〇〇製品における××××の脆弱性" />
      </label>
      <div class="row">
        <label>管理番号
          <input v-model="form.advisoryId" placeholder="ADV-2026-001" />
        </label>
        <label>公開日
          <input v-model="form.published" type="date" />
        </label>
      </div>
      <div class="row">
        <label>発行者名
          <input v-model="form.publisherName" placeholder="株式会社サンプル" />
        </label>
        <label>発行者のURL
          <input v-model="form.publisherNamespace" placeholder="https://example.co.jp" />
        </label>
      </div>
      <label>CVE番号（カンマ区切り）
        <input v-model="form.cve" placeholder="CVE-2026-0001, CVE-2026-0002" />
      </label>
      <label>概要
        <textarea v-model="form.summary" />
      </label>

      <fieldset>
        <legend>影響を受ける製品</legend>
        <div v-for="(p, i) in form.products" :key="i" class="prod">
          <input v-model="p.name" placeholder="製品名" aria-label="製品名" />
          <input v-model="p.version" placeholder="バージョン（例：1.0〜2.3.4）" aria-label="バージョン" />
          <button type="button" @click="removeProduct(i)">削除</button>
        </div>
        <button type="button" @click="addProduct">製品を追加</button>
      </fieldset>

      <label>脆弱性の種類（CWE）
        <input v-model="form.cwe" placeholder="例：CWE-79 クロスサイト・スクリプティング" />
      </label>
      <label>脆弱性の説明
        <textarea v-model="form.description" />
      </label>
      <label>脆弱性がもたらす脅威
        <textarea v-model="form.impact" />
      </label>

      <label>CVSS v3.1 ベクター
        <input v-model="form.cvssVector" placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" />
      </label>
      <p class="hint" :class="{ ng: form.cvssVector.trim() && !cvss }">{{ cvssText }}</p>

      <label>対策方法
        <textarea v-model="form.fix" />
      </label>
      <label>回避策
        <textarea v-model="form.workaround" />
      </label>
      <label>関連情報（URLなど。1行に1つ）
        <textarea v-model="form.refs" />
      </label>
      <label>連絡先
        <textarea v-model="form.contact" />
      </label>
    </section>

    <OutputPanel :tabs="tabs" :base-name="form.advisoryId" />
  </main>
</template>

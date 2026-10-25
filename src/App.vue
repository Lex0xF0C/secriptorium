<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  SEVERITY_JA,
  buildCsaf,
  buildMarkdown,
  csafWarnings,
  cvssSummary,
  emptyForm,
} from './lib/advisory'

const form = reactive(emptyForm())
const tab = ref<'md' | 'csaf'>('md')
const msg = ref('')

const markdown = computed(() => buildMarkdown(form))
const csaf = computed(() => JSON.stringify(buildCsaf(form), null, 2))
const warnings = computed(() => csafWarnings(form))
const output = computed(() => (tab.value === 'md' ? markdown.value : csaf.value))

const cvss = computed(() => cvssSummary(form.cvssVector))
const cvssText = computed(() => {
  if (!form.cvssVector.trim()) return 'CVSS:3.1/ で始まる、8項目そろったベクターを入力すると、基本スコアを自動で計算します。'
  if (!cvss.value) return 'CVSS v3.1 のベクターとして読み取れません（8項目がそろっているか確認してください）。'
  return `基本スコア ${cvss.value.score.toFixed(1)}（${SEVERITY_JA[cvss.value.severity]}）`
})

function addProduct() {
  form.products.push({ name: '', version: '' })
}
function removeProduct(i: number) {
  form.products.splice(i, 1)
}

function flash(text: string) {
  msg.value = text
  window.setTimeout(() => (msg.value = ''), 2500)
}

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    flash('コピーしました')
  } catch {
    flash('コピーできませんでした。範囲選択して手動でコピーしてください')
  }
}

function download() {
  const isMd = tab.value === 'md'
  const blob = new Blob([output.value], {
    type: isMd ? 'text/markdown;charset=utf-8' : 'application/json;charset=utf-8',
  })
  const name = form.advisoryId.trim().replace(/[^\w.-]+/g, '_') || 'advisory'
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name + (isMd ? '.md' : '.json')
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  flash('保存しました')
}
</script>

<template>
  <header class="top">
    <h1>脆弱性アドバイザリ作成ツール</h1>
    <p>入力した内容はこのブラウザの中だけで処理され、外部には送信されません。</p>
  </header>

  <main>
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

    <section class="panel out" aria-label="出力">
      <div class="tabs" role="tablist">
        <button type="button" role="tab" :aria-selected="tab === 'md'" :class="{ on: tab === 'md' }" @click="tab = 'md'">Markdown</button>
        <button type="button" role="tab" :aria-selected="tab === 'csaf'" :class="{ on: tab === 'csaf' }" @click="tab = 'csaf'">CSAF 2.0 (JSON)</button>
      </div>
      <p v-if="tab === 'csaf' && warnings.length" class="warn">
        CSAF として足りない項目：{{ warnings.join('、') }}
      </p>
      <div class="bar">
        <button type="button" class="primary" @click="copy">コピー</button>
        <button type="button" @click="download">{{ tab === 'md' ? '.mdで保存' : '.jsonで保存' }}</button>
        <span class="status" role="status">{{ msg }}</span>
      </div>
      <pre>{{ output }}</pre>
    </section>
  </main>
</template>

<style>
:root {
  --bg: #f3f6f7; --panel: #fff; --ink: #1c2733; --sub: #5b6b78; --line: #d3dce1;
  --accent: #0b6e7f; --accent-ink: #fff; --warn: #b4442b;
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #12191e; --panel: #1a242b; --ink: #e6edf1; --sub: #9aabb7; --line: #2f3e48;
    --accent: #4cb8cb; --accent-ink: #0b1a1f; --warn: #ff8a6b;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--bg); color: var(--ink);
  font: 15px/1.7 "Hiragino Sans", "Yu Gothic UI", "Meiryo", system-ui, sans-serif;
}
.top { max-width: 1280px; margin: 0 auto; padding: 20px 20px 4px; }
.top h1 { font-size: 1.35rem; margin: 0 0 4px; }
.top p { margin: 0; color: var(--sub); font-size: 0.9rem; }
main {
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px;
  max-width: 1280px; margin: 0 auto; padding: 16px 20px 40px;
}
@media (max-width: 860px) { main { grid-template-columns: 1fr; } }
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 16px 18px; }
.out { position: sticky; top: 12px; align-self: start; max-height: calc(100vh - 24px); overflow: auto; }
@media (max-width: 860px) { .out { position: static; max-height: none; } }
label { display: block; font-weight: 600; font-size: 0.88rem; margin: 14px 0 4px; }
input, textarea {
  width: 100%; font: inherit; font-weight: 400; color: var(--ink); background: var(--bg);
  border: 1px solid var(--line); border-radius: 6px; padding: 7px 9px;
}
textarea { min-height: 5.5em; resize: vertical; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
fieldset { border: 1px solid var(--line); border-radius: 6px; margin: 14px 0 0; padding: 6px 12px 12px; }
legend { font-weight: 600; font-size: 0.88rem; padding: 0 6px; }
.prod { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; margin-bottom: 6px; }
button {
  font: inherit; cursor: pointer; border-radius: 6px; border: 1px solid var(--line);
  background: var(--panel); color: var(--ink); padding: 6px 12px;
}
button.primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); font-weight: 600; }
.hint { margin: 4px 0 0; color: var(--sub); font-size: 0.85rem; }
.hint.ng, .warn { color: var(--warn); }
.warn { margin: 0 0 8px; font-size: 0.88rem; }
.tabs { display: flex; gap: 6px; margin-bottom: 10px; }
.tabs button.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); font-weight: 600; }
.bar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px; }
.status { color: var(--sub); font-size: 0.85rem; }
pre {
  white-space: pre-wrap; word-break: break-word; margin: 0; min-height: 320px; padding: 12px;
  font: 13px/1.65 ui-monospace, "Cascadia Mono", Consolas, monospace;
  background: var(--bg); border: 1px solid var(--line); border-radius: 6px;
}
</style>

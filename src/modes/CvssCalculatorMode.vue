<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  METRICS, 
  cvssSummary, 
  severityOf, 
  SEVERITY_JA, 
  cvssSummary as getCvssSummary, 
  type CvssVersion, 
  type Metrics, 
  parseCvss, // parseVector から parseCvss に変更
  buildVector 
} from '../lib/cvss'
import OutputPanel from '../components/OutputPanel.vue'

// バージョン（3.1 / 3.0）
const version = ref<CvssVersion>('3.1')

// メトリックの初期値（例: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H）
const metrics = ref<Metrics>({
  AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U',
  C: 'H', I: 'H', A: 'H'
})

// ベクトル文字列を直接入力・ペーストするためのテキスト
const vectorInput = ref('')
const parseError = ref('')

// スコアと深刻度の算出
const score = computed(() => cvssScore(version.value, metrics.value))
const severity = computed(() => severityOf(score.value))

// 現在のベクトル文字列を生成
const currentVector = computed(() => {
  return `CVSS:${version.value}/AV:${metrics.value.AV}/AC:${metrics.value.AC}/PR:${metrics.value.PR}/UI:${metrics.value.UI}/S:${metrics.value.S}/C:${metrics.value.C}/I:${metrics.value.I}/A:${metrics.value.A}`
})

// 日本語の解説文のサマリー
const summaryText = computed(() => cvssSummary(metrics.value))

// 各項目の選択変更
const selectOption = (metricCode: string, optionCode: string) => {
  metrics.value = { ...metrics.value, [metricCode]: optionCode }
  vectorInput.value = currentVector.value
  parseError.value = ''
}

// ベクトル文字列が入力・ペーストされたときの処理
const handleVectorInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  vectorInput.value = val
  const parsed = parseVector(val)
  if (parsed) {
    version.value = parsed.version
    metrics.value = parsed.metrics
    parseError.value = ''
  } else if (val.trim() !== '') {
    parseError.value = 'ベクトルの形式が正しくありません (例: CVSS:3.1/AV:N/...)'
  }
}

// 初期化時にベクトル入力欄を同期
vectorInput.value = currentVector.value

// OutputPanel に渡すタブデータの作成
const tabs = computed(() => [
  {
    key: 'markdown',
    label: 'Markdown',
    content: `### CVSS v${version.value} 評価結果\n- **スコア**: ${score.value} (${SEVERITY_JA[severity.value]})\n- **ベクトル**: \`${currentVector.value}\`\n- **概要**: ${summaryText.value}\n`,
    filename: 'cvss-result.md'
  },
  {
    key: 'json',
    label: 'JSON',
    content: JSON.stringify({
      version: version.value,
      vector: currentVector.value,
      score: score.value,
      severity: severity.value,
      summary: summaryText.value,
      metrics: metrics.value
    }, null, 2),
    filename: 'cvss-result.json'
  }
])
</script>

<template>
  <div class="cvss-calculator-mode">
    <div class="calculator-main">
      <h2>CVSS v3.x グラフィカル計算機</h2>
      <p class="subtitle">項目をクリックして選択するか、ベクトル文字列を直接貼り付けてください。</p>

      <!-- バージョン切り替え ＆ ベクトル直接入力 -->
      <div class="vector-bar">
        <div class="version-switch">
          <label><input type="radio" v-model="version" value="3.1" /> CVSS v3.1</label>
          <label><input type="radio" v-model="version" value="3.0" /> CVSS v3.0</label>
        </div>
        <div class="vector-input-wrap">
          <input 
            type="text" 
            :value="vectorInput" 
            @input="handleVectorInput" 
            placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" 
          />
        </div>
      </div>
      <p v-if="parseError" class="error-msg">{{ parseError }}</p>

      <!-- グラフィカル・スコアタワー -->
      <div class="score-tower" :data-severity="severity">
        <div class="score-number">{{ score.toFixed(1) }}</div>
        <div class="score-badge">{{ SEVERITY_JA[severity] }} ({{ severity }})</div>
        <div class="score-summary">{{ summaryText }}</div>
      </div>

      <!-- メトリック選択カード群 -->
      <div class="metrics-grid">
        <div v-for="def in METRICS" :key="def.code" class="metric-card">
          <h3>{{ def.name }}</h3>
          <p class="metric-desc">{{ def.desc }}</p>
          <div class="options-group">
            <button
              v-for="opt in def.options"
              :key="opt.code"
              type="button"
              :class="{ active: metrics[def.code] === opt.code }"
              @click="selectOption(def.code, opt.code)"
            >
              <span class="opt-code">{{ opt.code }}</span>
              <span class="opt-label">{{ opt.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 右側：出力パネル（共用） -->
    <div class="calculator-output">
      <OutputPanel :tabs="tabs" base-name="cvss-assessment" />
    </div>
  </div>
</template>

<style scoped>
.cvss-calculator-mode {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  align-items: start;
}
@media (max-width: 1024px) {
  .cvss-calculator-mode {
    grid-template-columns: 1fr;
  }
}
.calculator-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.vector-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.vector-input-wrap input {
  width: 100%;
  min-width: 320px;
  padding: 8px 12px;
  font-family: monospace;
  font-size: 0.9rem;
}
.error-msg {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin: 0;
}
/* スコアタワーのグラフィカル表示 */
.score-tower {
  padding: 20px;
  border-radius: 8px;
  background: var(--bg-card, #1e1e1e);
  border: 1px solid var(--border-color, #333);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.score-number {
  font-size: 3rem;
  font-weight: bold;
  line-height: 1;
}
.score-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9rem;
  background: #333;
}
/* 深刻度ごとのカラーアクセント */
.score-tower[data-severity="CRITICAL"] .score-badge { background: #8B0000; color: #fff; }
.score-tower[data-severity="HIGH"] .score-badge { background: #D2691E; color: #fff; }
.score-tower[data-severity="MEDIUM"] .score-badge { background: #DAA520; color: #000; }
.score-tower[data-severity="LOW"] .score-badge { background: #2E8B57; color: #fff; }
.score-tower[data-severity="NONE"] .score-badge { background: #555; color: #fff; }

.score-summary {
  font-size: 0.95rem;
  color: var(--text-secondary, #ccc);
  max-width: 600px;
}
/* メトリック選択カード */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.metric-card {
  background: var(--bg-card, #1e1e1e);
  border: 1px solid var(--border-color, #333);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.metric-card h3 {
  margin: 0;
  font-size: 1rem;
}
.metric-desc {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary, #aaa);
}
.options-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}
.options-group button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid var(--border-color, #444);
  border-radius: 4px;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}
.options-group button:hover {
  background: rgba(255, 255, 255, 0.05);
}
.options-group button.active {
  background: var(--accent-color, #3a75c4);
  border-color: var(--accent-color, #3a75c4);
  color: #fff;
  font-weight: bold;
}
.opt-code {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.85rem;
}
.opt-label {
  font-size: 0.85rem;
}
</style>

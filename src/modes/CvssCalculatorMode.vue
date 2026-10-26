<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  METRICS, 
  cvssScore, 
  severityOf, 
  SEVERITY_JA, 
  cvssSummary, 
  type CvssVersion, 
  type Metrics, 
  parseCvss,
  buildVector 
} from '../lib/cvss'
import OutputPanel from '../components/OutputPanel.vue'

// バージョン（3.1 / 3.0）
const version = ref<CvssVersion>('3.1')

// メトリックの初期値
const metrics = ref<Metrics>({
  AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U',
  C: 'H', I: 'H', A: 'H'
})

// テキスト入力用の文字列
const vectorInput = ref('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H')
const parseError = ref('')

// 現在のボタン選択から生成される正しいベクトル文字列
const currentVector = computed(() => buildVector(version.value, metrics.value))

// ボタンが押されたとき
const selectOption = (metricCode: string, optionCode: string) => {
  metrics.value = { ...metrics.value, [metricCode]: optionCode }
  vectorInput.value = buildVector(version.value, metrics.value)
  parseError.value = ''
}

// バージョン変更
const setVersion = (v: CvssVersion) => {
  version.value = v
  vectorInput.value = buildVector(v, metrics.value)
}

// テキストボックスの変更を適用する
const applyVector = () => {
  const val = vectorInput.value
  if (typeof val !== 'string') {
    parseError.value = '文字列を入力してください'
    return
  }
  const parsed = parseCvss(val.trim())
  if (parsed) {
    version.value = parsed.version
    metrics.value = parsed.metrics
    parseError.value = ''
  } else {
    parseError.value = 'ベクトルの形式が正しくありません (例: CVSS:3.1/AV:N/...)'
  }
}

// プリセットを適用する関数
const applyPreset = (presetVector: string, presetVer: CvssVersion = '3.1') => {
  version.value = presetVer
  vectorInput.value = presetVector
  const parsed = parseCvss(presetVector)
  if (parsed) {
    metrics.value = parsed.metrics
    parseError.value = ''
  }
}

// スコアと深刻度の算出
const score = computed(() => cvssScore(version.value, metrics.value))
const severity = computed(() => severityOf(score.value))

// OutputPanel に渡すタブデータの作成
const tabs = computed(() => [
  {
    key: 'markdown',
    label: 'Markdown',
    content: `### CVSS v${version.value} 評価結果\n- **スコア**: ${score.value.toFixed(1)} (${SEVERITY_JA[severity.value]})\n- **ベクトル**: \`${currentVector.value}\`\n`,
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
      <p class="subtitle">項目をクリックするか、よくあるシナリオのプリセットを選んで素早く評価できます。</p>

      <!-- バージョン切り替え ＆ ベクトル直接入力 -->
      <div class="vector-bar">
        <div class="version-switch">
          <label>
            <input 
              type="radio" 
              name="cvss-ver" 
              :checked="version === '3.1'" 
              @change="setVersion('3.1')" 
            /> CVSS v3.1
          </label>
          <label>
            <input 
              type="radio" 
              name="cvss-ver" 
              :checked="version === '3.0'" 
              @change="setVersion('3.0')" 
            /> CVSS v3.0
          </label>
        </div>
        <div class="vector-input-wrap">
          <input 
            type="text" 
            v-model="vectorInput" 
            placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" 
            @keyup.enter="applyVector"
          />
          <button type="button" @click="applyVector">適用</button>
        </div>
      </div>
      <p v-if="parseError" class="error-msg">{{ parseError }}</p>

      <!-- グラフィカル・スコアタワー -->
      <div class="score-tower" :data-severity="severity">
        <div class="score-number">{{ score.toFixed(1) }}</div>
        <div class="score-badge">{{ SEVERITY_JA[severity] }} ({{ severity }})</div>
      </div>

      <!-- 💡 リッチなお助けプリセット群（通常時の文字色を改善） -->
      <div class="preset-section">
        <span class="preset-title">💡 よくある脆弱性シナリオ（クリックで反映）:</span>
        <div class="preset-cards">
          
          <div class="preset-card" @click="applyPreset('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H')">
            <div class="preset-header">🌐 ネットから認証なし (RCE等)</div>
            <div class="preset-desc">インターネット公開Webアプリ等で、未認証の攻撃者が遠隔からシステムを完全に掌握する最悪のケース。</div>
          </div>

          <div class="preset-card" @click="applyPreset('CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N')">
            <div class="preset-header">🖱️ ユーザ操作が必要 (XSS / フィッシング)</div>
            <div class="preset-desc">被害者にリンク踏み等の操作をさせることで、別ドメインへ影響（スコープ変更）を及ぼすパターン。</div>
          </div>

          <div class="preset-card" @click="applyPreset('CVSS:3.1/AV:A/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H')">
            <div class="preset-header">🛡️ 内部ネットワーク限定サービス</div>
            <div class="preset-desc">外部からは直接アクセスできず、同一社内LANや無線LANセグメントからの接続が前提となる脆弱性。</div>
          </div>

          <div class="preset-card" @click="applyPreset('CVSS:3.1/AV:L/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H')">
            <div class="preset-header">💻 ローカル・管理者権限必須</div>
            <div class="preset-desc">既に端末へアクセスしている状態から、さらにシステム管理者権限（root/SYSTEM）を奪うパターン。</div>
          </div>

        </div>
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
.vector-input-wrap {
  display: flex;
  gap: 8px;
  flex: 1;
  min-width: 300px;
}
.vector-input-wrap input {
  flex: 1;
  padding: 8px 12px;
  font-family: monospace;
  font-size: 0.9rem;
}
.error-msg {
  color: var(--warn, #ff6b6b);
  font-size: 0.85rem;
  margin: 0;
}
.score-tower {
  padding: 20px;
  border-radius: 8px;
  background: var(--panel, #1e1e1e);
  border: 1px solid var(--line, #333);
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
.score-tower[data-severity="CRITICAL"] .score-badge { background: #8B0000; color: #fff; }
.score-tower[data-severity="HIGH"] .score-badge { background: #D2691E; color: #fff; }
.score-tower[data-severity="MEDIUM"] .score-badge { background: #DAA520; color: #000; }
.score-tower[data-severity="LOW"] .score-badge { background: #2E8B57; color: #fff; }
.score-tower[data-severity="NONE"] .score-badge { background: #555; color: #fff; }

/* プリセットカードのスタイル */
.preset-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--line, #333);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.preset-title {
  font-size: 0.85rem;
  color: var(--sub, #bbb);
  font-weight: bold;
}
.preset-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}
.preset-card {
  background: var(--panel, #252525);
  border: 1px solid var(--line, #444);
  border-radius: 6px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #222; /* 通常時はダークな背景に映えるしっかりした濃色・黒字系、あるいはクリアな明色 */
}
.preset-card {
  background: #f5f7fa; /* 明るめの背景にして、黒文字がくっきり映えるように調整 */
  border: 1px solid #d1d5db;
  color: #111827; /* はっきりとした黒文字 */
}
.preset-card:hover {
  background: #e5e7eb;
  border-color: var(--accent, #3a75c4);
  transform: translateY(-1px);
}
.preset-header {
  font-size: 0.85rem;
  font-weight: bold;
  color: #111827; /* 通常時からくっきりした黒文字 */
}
.preset-desc {
  font-size: 0.75rem;
  color: #4b5563; /* 読みやすい少し濃い目のグレー */
  line-height: 1.3;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.metric-card {
  background: var(--panel, #1e1e1e);
  border: 1px solid var(--line, #333);
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
  color: var(--sub, #aaa);
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
  border: 1px solid var(--line, #444);
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
  background: var(--accent, #3a75c4);
  border-color: var(--accent, #3a75c4);
  color: var(--accent-ink, #fff);
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

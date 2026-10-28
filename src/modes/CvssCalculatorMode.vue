<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  METRICS, 
  cvssScore, 
  severityOf, 
  SEVERITY_JA, 
  type CvssVersion, 
  type Metrics, 
  parseCvss,
  buildVector 
} from '../lib/cvss'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'

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
const tabs = computed<OutputTab[]>(() => [
  {
    id: 'markdown',
    label: 'Markdown',
    content: `### CVSS v${version.value} 評価結果\n- **スコア**: ${score.value.toFixed(1)} (${SEVERITY_JA[severity.value]})\n- **ベクトル**: \`${currentVector.value}\`\n`,
    ext: '.md',
    mime: 'text/markdown;charset=utf-8'
  },
  {
    id: 'json',
    label: 'JSON',
    content: JSON.stringify({
      version: version.value,
      vector: currentVector.value,
      score: score.value,
      severity: severity.value,
      metrics: metrics.value
    }, null, 2),
    ext: '.json',
    mime: 'application/json;charset=utf-8'
  }
])
</script>

<template>
  <div class="cols">
    <!-- 左側：計算機メインパネル -->
    <div class="panel calculator-main-panel">
      <h2>CVSS v3.x グラフィカル計算機</h2>
      <p class="hint">項目をクリックするか、よくあるシナリオのプリセットを選んで素早く評価できます。</p>

      <!-- バージョン切り替え ＆ ベクトル直接入力 -->
      <div class="bar bar-top">
        <div class="version-switch">
          <label class="ver-label">
            <input 
              type="radio" 
              name="cvss-ver" 
              :checked="version === '3.1'" 
              @change="setVersion('3.1')" 
              class="ver-radio"
            /> CVSS v3.1
          </label>
          <label class="ver-label">
            <input 
              type="radio" 
              name="cvss-ver" 
              :checked="version === '3.0'" 
              @change="setVersion('3.0')" 
              class="ver-radio"
            /> CVSS v3.0
          </label>
        </div>
      </div>

      <div class="row row-top">
        <div class="vec-row">
          <input 
            type="text" 
            v-model="vectorInput" 
            placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" 
            @keyup.enter="applyVector"
            class="vec-input"
          />
          <button type="button" class="primary" @click="applyVector">適用</button>
        </div>
      </div>
      <p v-if="parseError" class="hint warn parse-error">{{ parseError }}</p>

      <!-- グラフィカル・スコアタワー（共通パネルのデザインに統合） -->
      <div class="score-tower" :data-severity="severity">
        <div class="score-number">{{ score.toFixed(1) }}</div>
        <div class="score-badge">{{ SEVERITY_JA[severity] }} ({{ severity }})</div>
      </div>

      <!-- 💡 よくある脆弱性シナリオプリセット群 -->
      <div class="preset-section">
        <label class="preset-title">💡 よくある脆弱性シナリオ（クリックで反映）:</label>
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

      <!-- メトリック選択カード群（共通の fieldset / legend / opt を活用） -->
      <div class="metrics-grid">
        <fieldset v-for="def in METRICS" :key="def.code">
          <legend>{{ def.name }}</legend>
          <p class="mdesc">{{ def.desc }}</p>
          <div class="opt-list">
            <label
              v-for="opt in def.options"
              :key="opt.code"
              class="opt metric-opt"
              :class="{ 'active-opt': metrics[def.code] === opt.code }"
              @click="selectOption(def.code, opt.code)"
            >
              <input
                type="radio"
                :name="def.code"
                :value="opt.code"
                :checked="metrics[def.code] === opt.code"
                @change.stop="selectOption(def.code, opt.code)"
              />
              <span class="opt-code" :class="{ on: metrics[def.code] === opt.code }">[{{ opt.code }}] {{ opt.label }}</span>
              <span class="od opt-desc">{{ opt.desc }}</span>
            </label>
          </div>
        </fieldset>
      </div>
    </div>

    <!-- 右側：出力パネル（共通クラス適用） -->
    <div class="panel out">
      <OutputPanel :tabs="tabs" base-name="cvss-assessment" />
    </div>
  </div>
</template>

<style scoped>
/* インラインの style 属性をやめ、クラスにしたもの（CSP の方針に合わせるため） */
.bar-top { margin-top: 14px; }
.version-switch { display: flex; gap: 12px; align-items: center; }
.ver-label { margin: 0; cursor: pointer; }
.ver-radio { width: auto; margin-right: 4px; }
.row-top { margin-top: 8px; }
.vec-row { display: flex; gap: 8px; width: 100%; grid-column: span 2; }
.vec-input { font-family: monospace; flex: 1; }
.parse-error { margin-top: 4px; }
.preset-title { margin-top: 0; }
.opt-list { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
.metric-opt { cursor: pointer; padding: 4px 6px; border-radius: 4px; margin: 2px 0; }
.opt-code { font-family: monospace; }
.opt-desc { color: var(--sub); font-size: 0.8rem; }

/* スコアタワーの共通変数・クラス準拠スタイル */
.score-tower {
  margin-top: 14px;
  padding: 16px;
  border-radius: 6px;
  background: var(--bg);
  border: 1px solid var(--line);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.score-number {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1;
  color: var(--ink);
}
.score-badge {
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
  background: var(--line);
  color: var(--ink);
}
.score-tower[data-severity="CRITICAL"] .score-badge { background: #8B0000; color: #fff; }
.score-tower[data-severity="HIGH"] .score-badge { background: #D2691E; color: #fff; }
.score-tower[data-severity="MEDIUM"] .score-badge { background: #DAA520; color: #1c2733; }
.score-tower[data-severity="LOW"] .score-badge { background: #2E8B57; color: #fff; }
.score-tower[data-severity="NONE"] .score-badge { background: var(--sub); color: #fff; }

/* プリセットセクション＆カード */
.preset-section {
  margin-top: 14px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.preset-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}
.preset-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.preset-card:hover {
  border-color: var(--accent);
  background: rgba(76, 184, 203, 0.08);
}
.preset-header {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink);
}
.preset-desc {
  font-size: 0.75rem;
  color: var(--sub);
  line-height: 1.3;
}

/* メトリック選択グリッド */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
  margin-top: 14px;
}
.opt.active-opt {
  background: rgba(76, 184, 203, 0.12);
  border: 1px solid var(--accent);
}
</style>

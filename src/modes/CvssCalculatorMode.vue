<!-- src/modes/CvssCalculatorMode.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../lib/i18n'
import { 
  METRICS, 
  cvssScore, 
  severityOf, 
  type CvssVersion, 
  type Metrics, 
  parseCvss,
  buildVector 
} from '../lib/cvss'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'

const { lang, t } = useI18n()

const version = ref<CvssVersion>('3.1')
const metrics = ref<Metrics>({
  AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U',
  C: 'H', I: 'H', A: 'H'
})

const vectorInput = ref('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H')
const parseError = ref('')

const currentVector = computed(() => buildVector(version.value, metrics.value))

const selectOption = (metricCode: string, optionCode: string) => {
  metrics.value = { ...metrics.value, [metricCode]: optionCode }
  vectorInput.value = buildVector(version.value, metrics.value)
  parseError.value = ''
}

const setVersion = (v: CvssVersion) => {
  version.value = v
  vectorInput.value = buildVector(v, metrics.value)
}

const applyVector = () => {
  const val = vectorInput.value
  if (typeof val !== 'string') {
    parseError.value = 'Invalid input'
    return
  }
  const parsed = parseCvss(val.trim())
  if (parsed) {
    version.value = parsed.version
    metrics.value = parsed.metrics
    parseError.value = ''
  } else {
    parseError.value = lang.value === 'en' ? 'Invalid CVSS vector format' : 'ベクトルの形式が正しくありません (例: CVSS:3.1/AV:N/...)'
  }
}

const applyPreset = (presetVector: string, presetVer: CvssVersion = '3.1') => {
  version.value = presetVer
  vectorInput.value = presetVector
  const parsed = parseCvss(presetVector)
  if (parsed) {
    metrics.value = parsed.metrics
    parseError.value = ''
  }
}

const score = computed(() => cvssScore(version.value, metrics.value))
const severity = computed(() => severityOf(score.value))

// 言語に応じた深刻度ラベルの取得
const severityLabel = computed(() => {
  const key = severity.value.toLowerCase()
  return t.value.sev[key] || severity.value
})

const tabs = computed<OutputTab[]>(() => [
  {
    id: 'markdown',
    label: 'Markdown',
    content: `### CVSS v${version.value} Assessment Result\n- **Score**: ${score.value.toFixed(1)} (${severityLabel.value})\n- **Vector**: \`${currentVector.value}\`\n`,
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
    <div class="panel calculator-main-panel">
      <h2>{{ t.ui.cvssl || 'CVSS v3.x Calculator' }}</h2>
      <p class="hint">{{ t.ui.cvsss || 'Select metrics or apply vector string directly.' }}</p>

      <!-- バージョン切替 -->
      <div class="bar" style="margin-top: 14px;">
        <div class="version-switch" style="display: flex; gap: 12px; align-items: center;">
          <label style="margin: 0; cursor: pointer;">
            <input 
              type="radio" 
              name="cvss-ver" 
              :checked="version === '3.1'" 
              @change="setVersion('3.1')" 
              style="width: auto; margin-right: 4px;"
            /> CVSS v3.1
          </label>
          <label style="margin: 0; cursor: pointer;">
            <input 
              type="radio" 
              name="cvss-ver" 
              :checked="version === '3.0'" 
              @change="setVersion('3.0')" 
              style="width: auto; margin-right: 4px;"
            /> CVSS v3.0
          </label>
        </div>
      </div>

      <!-- ベクトル直接入力 -->
      <div class="row" style="margin-top: 8px;">
        <div style="display: flex; gap: 8px; width: 100%; grid-column: span 2;">
          <input 
            type="text" 
            v-model="vectorInput" 
            placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" 
            @keyup.enter="applyVector"
            style="font-family: monospace; flex: 1;"
          />
          <button type="button" class="primary" @click="applyVector">
            {{ lang === 'en' ? 'Apply' : '適用' }}
          </button>
        </div>
      </div>
      <p v-if="parseError" class="hint warn" style="margin-top: 4px;">{{ parseError }}</p>

      <!-- スコアタワー -->
      <div class="score-tower" :data-severity="severity">
        <div class="score-number">{{ score.toFixed(1) }}</div>
        <div class="score-badge">{{ severityLabel }} ({{ severity }})</div>
      </div>

      <!-- お助けシナリオプリセット -->
      <div class="preset-section">
        <label style="margin-top: 0;">💡 {{ lang === 'en' ? 'Common Vulnerability Scenarios:' : 'よくある脆弱性シナリオ（クリックで反映）:' }}</label>
        <div class="preset-cards">
          <div class="preset-card" @click="applyPreset('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H')">
            <div class="preset-header">🌐 {{ lang === 'en' ? 'Unauthenticated Remote (RCE)' : 'ネットから認証なし (RCE等)' }}</div>
            <div class="preset-desc">{{ lang === 'en' ? 'Unauthenticated remote attacker takes full control of the system over the network.' : 'インターネット公開Webアプリ等で、未認証の攻撃者が遠隔からシステムを完全に掌握する最悪のケース。' }}</div>
          </div>

          <div class="preset-card" @click="applyPreset('CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N')">
            <div class="preset-header">🖱️ {{ lang === 'en' ? 'User Interaction Required (XSS)' : 'ユーザ操作が必要 (XSS / フィッシング)' }}</div>
            <div class="preset-desc">{{ lang === 'en' ? 'Victim performs an action (e.g. clicking a link) resulting in cross-site script execution.' : '被害者にリンク踏み等の操作をさせることで、別ドメインへ影響（スコープ変更）を及ぼすパターン。' }}</div>
          </div>

          <div class="preset-card" @click="applyPreset('CVSS:3.1/AV:A/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H')">
            <div class="preset-header">🛡️ {{ lang === 'en' ? 'Adjacent Network Only' : '内部ネットワーク限定サービス' }}</div>
            <div class="preset-desc">{{ lang === 'en' ? 'Exploitable only from the same local subnet or Bluetooth/Wi-Fi proximity.' : '外部からは直接アクセスできず、同一社内LANや無線LANセグメントからの接続が前提となる脆弱性。' }}</div>
          </div>

          <div class="preset-card" @click="applyPreset('CVSS:3.1/AV:L/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H')">
            <div class="preset-header">💻 {{ lang === 'en' ? 'Local Privilege Escalation' : 'ローカル・管理者権限必須' }}</div>
            <div class="preset-desc">{{ lang === 'en' ? 'Attacker with existing local access escalates privileges to administrative levels.' : '既に端末へアクセスしている状態から、さらにシステム管理者権限（root/SYSTEM）を奪うパターン。' }}</div>
          </div>
        </div>
      </div>

      <!-- メトリック選択カード群 -->
      <div class="metrics-grid">
        <fieldset v-for="def in METRICS" :key="def.code">
          <legend>{{ def.name }}</legend>
          <p class="mdesc">{{ def.desc }}</p>
          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
            <label
              v-for="opt in def.options"
              :key="opt.code"
              class="opt"
              :class="{ 'active-opt': metrics[def.code] === opt.code }"
              @click="selectOption(def.code, opt.code)"
              style="cursor: pointer; padding: 4px 6px; border-radius: 4px; margin: 2px 0;"
            >
              <input
                type="radio"
                :name="def.code"
                :value="opt.code"
                :checked="metrics[def.code] === opt.code"
                @change.stop="selectOption(def.code, opt.code)"
              />
              <span :class="{ on: metrics[def.code] === opt.code }" style="font-family: monospace;">[{{ opt.code }}] {{ opt.label }}</span>
              <span class="od" style="color: var(--sub); font-size: 0.8rem;">{{ opt.desc }}</span>
            </label>
          </div>
        </fieldset>
      </div>
    </div>

    <!-- 右側：共通 OutputPanel -->
    <div class="panel out">
      <OutputPanel :tabs="tabs" base-name="cvss-assessment" />
    </div>
  </div>
</template>

<style scoped>
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

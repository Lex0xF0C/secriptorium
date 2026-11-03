<!-- src/components/CraGuide.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { I18N_JA } from '../lib/i18n-ja'

type ModeKey = 'advisory' | 'vex' | 'sbom' | 'cvss' | 'securitytxt' | 'cvd' | 'cvdprocess' | 'gna'

const props = defineProps<{
  currentMode: ModeKey
}>()

const emit = defineEmits<{
  (e: 'select-mode', key: ModeKey): void
}>()

const isOpen = ref(true)

const toggleGuide = () => {
  isOpen.value = !isOpen.value
}

const selectMode = (key: ModeKey) => {
  emit('select-mode', key)
}
</script>

<template>
  <aside class="cra-guide-panel" aria-label="CRA対応ロードマップ">
    <div class="cra-guide-header" @click="toggleGuide">
      <div class="cra-guide-title">
        <span class="cra-icon">🇪🇺</span>
        <h3>CRA（欧州サイバーレジリエンス法）対応ロードマップ</h3>
        <span class="cra-badge">開発者・SME向けガイド</span>
      </div>
      <button type="button" class="btn-toggle" :aria-expanded="isOpen">
        {{ isOpen ? '▲ ガイドを折りたたむ' : '▼ はじめての方はこちら（CRA対応の流れを見る）' }}
      </button>
    </div>

    <div v-if="isOpen" class="cra-guide-body">
      <p class="cra-intro">
        欧州に輸出・展開するデジタル要素製品で求められる脆弱性管理プロセス（CRA附属書I）を4ステップで作成・運用できます。
      </p>

      <div class="cra-steps-grid">
        <!-- ステップ1 -->
        <div class="cra-step-card" :class="{ active: props.currentMode === 'securitytxt' }">
          <div class="step-badge">ステップ 1</div>
          <h4 class="step-title">報告窓口の公開</h4>
          <p class="step-desc">
            外部研究者やユーザーが脆弱性を安全に報告できる連絡先（RFC 9116）を公開します。
          </p>
          <div class="step-cra-ref">CRA要件: 脆弱性報告窓口の提供 (6)</div>
          <button
            type="button"
            class="btn-step-action"
            @click="selectMode('securitytxt')"
          >
            security.txt を作成する →
          </button>
        </div>

        <!-- ステップ2 -->
        <div class="cra-step-card" :class="{ active: props.currentMode === 'cvd' }">
          <div class="step-badge">ステップ 2</div>
          <h4 class="step-title">CVD方針の策定</h4>
          <p class="step-desc">
            報告受付時の対応ルール、タイムライン、免責条項（セーフハーバー）を定義します。
          </p>
          <div class="step-cra-ref">CRA要件: CVDポリシーの確立 (5)</div>
          <button
            type="button"
            class="btn-step-action"
            @click="selectMode('cvd')"
          >
            CVDポリシーを作成する →
          </button>
        </div>

        <!-- ステップ3 -->
        <div class="cra-step-card" :class="{ active: props.currentMode === 'sbom' }">
          <div class="step-badge">ステップ 3</div>
          <h4 class="step-title">部品表 (SBOM) の整備</h4>
          <p class="step-desc">
            製品に含まれるオープンソースやサードパーティ部品（CycloneDX）を可視化します。
          </p>
          <div class="step-cra-ref">CRA要件: コンポーネント特定 (1)</div>
          <button
            type="button"
            class="btn-step-action"
            @click="selectMode('sbom')"
          >
            SBOMを生成する →
          </button>
        </div>

        <!-- ステップ4 -->
        <div class="cra-step-card" :class="{ active: ['cvdprocess', 'vex', 'advisory', 'cvss'].includes(props.currentMode) }">
          <div class="step-badge">ステップ 4</div>
          <h4 class="step-title">脆弱性対応と公表</h4>
          <p class="step-desc">
            内部進捗を管理し、製品への影響（VEX）や修正アドバイザリを公開します。
          </p>
          <div class="step-cra-ref">CRA要件: 迅速な是正・情報公開 (2, 4)</div>
          <div class="step-multi-buttons">
            <button type="button" class="btn-step-sub" @click="selectMode('cvdprocess')">内部管理</button>
            <button type="button" class="btn-step-sub" @click="selectMode('vex')">VEX作成</button>
            <button type="button" class="btn-step-sub" @click="selectMode('advisory')">アドバイザリ</button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.cra-guide-panel {
  max-width: 1280px;
  margin: 12px auto 0;
  padding: 0 20px;
}
.cra-guide-header {
  background: var(--panel);
  border: 1px solid var(--accent);
  border-radius: 8px 8px 0 0;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  flex-wrap: wrap;
  gap: 8px;
}
.cra-guide-panel:has(.cra-guide-body:not(*)) .cra-guide-header {
  border-radius: 8px;
}
.cra-guide-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cra-icon {
  font-size: 1.2rem;
}
.cra-guide-title h3 {
  margin: 0;
  font-size: 0.98rem;
  color: var(--ink);
}
.cra-badge {
  font-size: 0.72rem;
  background: rgba(76, 184, 203, 0.15);
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}
.btn-toggle {
  font-size: 0.8rem;
  padding: 4px 10px;
  background: var(--bg);
  border-color: var(--line);
}
.cra-guide-body {
  background: var(--panel);
  border: 1px solid var(--accent);
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 14px 16px 18px;
}
.cra-intro {
  margin: 0 0 12px 0;
  font-size: 0.85rem;
  color: var(--sub);
}
.cra-steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 12px;
}
.cra-step-card {
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}
.cra-step-card.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}
.step-badge {
  font-size: 0.72rem;
  font-weight: bold;
  color: var(--accent);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.step-title {
  font-size: 0.92rem;
  margin: 0 0 6px 0;
  color: var(--ink);
}
.step-desc {
  font-size: 0.8rem;
  color: var(--sub);
  margin: 0 0 8px 0;
  line-height: 1.35;
  flex-grow: 1;
}
.step-cra-ref {
  font-size: 0.72rem;
  color: var(--sub);
  margin-bottom: 8px;
  opacity: 0.85;
}
.btn-step-action {
  width: 100%;
  font-size: 0.8rem;
  padding: 6px 10px;
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
  font-weight: 600;
  text-align: center;
}
.step-multi-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.btn-step-sub {
  flex: 1;
  font-size: 0.75rem;
  padding: 4px 6px;
  background: var(--panel);
  border-color: var(--line);
}
.btn-step-sub:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>

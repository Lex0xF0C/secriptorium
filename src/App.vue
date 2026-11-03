<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue'
import AdvisoryMode from './modes/AdvisoryMode.vue'
import SbomMode from './modes/SbomMode.vue'
import VexMode from './modes/VexMode.vue' 
import CvssCalculatorMode from './modes/CvssCalculatorMode.vue'
import SecurityTxtMode from './modes/SecurityTxtMode.vue'
import CvdPolicyMode from './modes/CvdPolicyMode.vue'
import CvdProcessMode from './modes/CvdProcessMode.vue'
import SbdAttestationMode from './modes/SbdAttestationMode.vue'
import GnaMode from './modes/GnaMode.vue'
import CraGuide from './components/CraGuide.vue'
import { useI18n } from './lib/i18n'

type ModeKey = 'advisory' | 'vex' | 'sbom' | 'cvss' | 'securitytxt' | 'cvd' | 'cvdprocess' | 'sbdattestation' | 'gna'

const { lang, setLanguage, t } = useI18n()

const currentModeKey = ref<ModeKey>('advisory')
const currentComponent = shallowRef(AdvisoryMode)

// 言語切替に応じて動的に表示名が変わるモード定義
const modes = computed(() => [
  { key: 'advisory' as ModeKey, label: t.value.ui.h1 || '脆弱性アドバイザリ', component: AdvisoryMode, enabled: true },
  { key: 'vex' as ModeKey, label: t.value.vex?.title || '製品ポートフォリオ VEX', component: VexMode, enabled: true }, 
  { key: 'sbom' as ModeKey, label: 'SBOM / VEX', component: SbomMode, enabled: true },
  { key: 'cvss' as ModeKey, label: t.value.ui.cvssl || 'CVSS v3.x 計算機', component: CvssCalculatorMode, enabled: true },
  { key: 'securitytxt' as ModeKey, label: t.value.ui.securityTxtTitle || 'security.txt 作成', component: SecurityTxtMode, enabled: true },
  { key: 'cvd' as ModeKey, label: t.value.cvdUi?.cvdTitle || 'CVDポリシー', component: CvdPolicyMode, enabled: true },
  { key: 'cvdprocess' as ModeKey, label: t.value.ui.modeCvdProcess || 'CVDプロセス管理', component: CvdProcessMode, enabled: true },
  { key: 'sbdattestation' as ModeKey, label: t.value.ui.modeSbdAttestation || 'SbD 最低限の証跡', component: SbdAttestationMode, enabled: true },
  { key: 'gna' as ModeKey, label: t.value.ui.modeGna || 'GNA / BCP-06 支援', component: GnaMode, enabled: false }
])

const switchModeByKey = (key: ModeKey) => {
  const mode = modes.value.find(m => m.key === key)
  if (mode) switchMode(mode)
}

const switchMode = (mode: any) => {
  if (!mode.enabled || !mode.component) return
  currentModeKey.value = mode.key
  currentComponent.value = mode.component
}
</script>

<template>
  <header class="top">
    <div class="header-main-bar">
      <h1>Secriptorium - {{ t.ui.h1 }}</h1>
      <!-- 言語切替スイッチャー -->
      <div class="lang-switcher" role="group" aria-label="Language Switcher">
        <button
          type="button"
          class="btn-lang"
          :class="{ active: lang === 'ja' }"
          @click="setLanguage('ja')"
        >
          🇯🇵 日本語
        </button>
        <button
          type="button"
          class="btn-lang"
          :class="{ active: lang === 'en' }"
          @click="setLanguage('en')"
        >
          🇬🇧 English
        </button>
      </div>
    </div>
    <p>{{ t.ui.intro }}</p>

    <div class="modes" role="tablist">
      <button
        v-for="m in modes"
        :key="m.key"
        type="button"
        role="tab"
        :aria-selected="currentModeKey === m.key"
        :class="{ on: currentModeKey === m.key }"
        :disabled="!m.enabled"
        @click="switchMode(m)"
      >
        {{ m.label }}
      </button>
    </div>
  </header>

  <!-- CRA適合ロードマップナビゲーション -->
  <CraGuide :current-mode="currentModeKey" @select-mode="switchModeByKey" />

  <main>
    <KeepAlive>
      <component :is="currentComponent" />
    </KeepAlive>
  </main>
</template>

<style scoped>
.header-main-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.header-main-bar h1 {
  margin: 0;
}
.lang-switcher {
  display: flex;
  gap: 4px;
  background: var(--panel);
  border: 1px solid var(--line);
  padding: 3px;
  border-radius: 6px;
}
.btn-lang {
  font-size: 0.8rem;
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--sub);
  transition: all 0.15s ease;
}
.btn-lang.active {
  background: var(--accent);
  color: var(--accent-ink);
  font-weight: 600;
}
</style>

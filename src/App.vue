<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import AdvisoryMode from './modes/AdvisoryMode.vue'
import SbomMode from './modes/SbomMode.vue'
import VexMode from './modes/VexMode.vue' 
import CvssCalculatorMode from './modes/CvssCalculatorMode.vue'
import SecurityTxtMode from './modes/SecurityTxtMode.vue'
import CvdPolicyMode from './modes/CvdPolicyMode.vue'
type ModeKey = 'advisory' | 'sbom' | 'cvss' | 'securitytxt'| 'cvd' 

interface ModeItem {
  key: ModeKey
  label: string
  component: any
  enabled: boolean
}

const currentModeKey = ref<ModeKey>('advisory')
const currentComponent = shallowRef(AdvisoryMode)

const modes: ModeItem[] = [
  { key: 'advisory', label: '脆弱性アドバイザリ', component: AdvisoryMode, enabled: true },
  { key: 'vex', label: '製品ポートフォリオ VEX (CSAF VEX)', component: VexMode, enabled: true }, 
  { key: 'sbom', label: 'SBOM / VEX', component: SbomMode, enabled: true },
  { key: 'cvss', label: 'CVSS v3.x 計算機', component: CvssCalculatorMode, enabled: true },
  { key: 'securitytxt', label: 'security.txt 作成', component: SecurityTxtMode, enabled: true },
  { key: 'cvd', label: 'CVDポリシー', component: CvdPolicyMode, enabled: true }
]

const switchMode = (mode: ModeItem) => {
  if (!mode.enabled || !mode.component) return
  currentModeKey.value = mode.key
  currentComponent.value = mode.component
}
</script>

<template>
  <!-- style.css の .top クラスが適用される共通ヘッダとモード切り替えタブ -->
  <header class="top">
    <h1>Secriptorium 脆弱性アドバイザリ・SBOM・CVSSツール</h1>
    <p>入力した内容はこのブラウザの中だけで処理され、外部には送信されません。</p>

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

  <!-- 選択されたモードのコンポーネントを表示 -->
  <!-- KeepAlive: タブを切り替えても、入力内容が消えないようにする -->
  <main>
    <KeepAlive>
      <component :is="currentComponent" />
    </KeepAlive>
  </main>
</template>

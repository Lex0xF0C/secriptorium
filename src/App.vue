<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import AdvisoryMode from './modes/AdvisoryMode.vue'
// 将来追加されるモード
// import SbomMode from './modes/SbomMode.vue'
// import VexMode from './modes/VexMode.vue'

type ModeKey = 'advisory' | 'sbom' | 'vex'

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
  { key: 'sbom', label: 'SBOM (CycloneDX)', component: null, enabled: false }, // 未実装時は無効
  { key: 'vex', label: 'VEX', component: null, enabled: false }, // 未実装時は無効
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
    <h1>脆弱性アドバイザリ作成ツール</h1>
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
  <main>
    <component :is="currentComponent" />
  </main>
</template>

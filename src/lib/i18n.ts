import { ref, computed, readonly } from 'vue'
import { I18N_JA, type AdvisoryI18n } from './i18n-ja'
import { I18N_EN } from './i18n-en'

export type Language = 'ja' | 'en'

// 現在の選択言語（デフォルト: 'ja'）
const currentLang = ref<Language>('ja')

/** 言語を変更する関数 */
export function setLanguage(lang: Language) {
  if (lang === 'ja' || lang === 'en') {
    currentLang.value = lang
  }
}

/** Vue コンポーネント用の i18n コンポーザブル Hook */
export function useI18n() {
  const t = computed<AdvisoryI18n>(() => {
    return currentLang.value === 'en' ? I18N_EN : I18N_JA
  })

  return {
    lang: readonly(currentLang),
    setLanguage,
    t
  }
}

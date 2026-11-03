// src/lib/i18n.ts
import { ref, computed, readonly } from 'vue';
import { I18N_JA, AdvisoryI18n } from './i18n-ja';

// 2. 対応言語型の定義（要求仕様に基づき ja, en に対応）
export type Language = 'ja' | 'en';

// 3. 現在の言語状態（デフォルトは 'ja'）をリアクティブに管理
const currentLang = ref<Language>('ja');

// 3. 言語変更関数
const setLanguage = (lang: Language) => {
  currentLang.value = lang;
};

// --- 4. 各言語辞書のインポート（未作成の言語ファイル用の仮スタブ定義） ---
// ※ i18n-en.ts, i18n-de.ts を正式に作成した場合は、以下のスタブを削除して
//    import { I18N_EN } from './i18n-en'; 
//    のように実ファイルからのインポートに切り替えてください。

const I18N_EN: AdvisoryI18n = JSON.parse(JSON.stringify(I18N_JA)); // 仮スタブ（英語用）

// 言語コードと辞書のマッピング
const dictionaries: Record<Language, AdvisoryI18n> = {
  ja: I18N_JA,
  en: I18N_EN,
};

// 4. 選択された言語に応じた辞書オブジェクトを返す computed (t / currentI18n)
const currentI18n = computed<AdvisoryI18n>(() => {
  return dictionaries[currentLang.value] || I18N_JA;
});

// エクスポート（読み取り専用のリアクティブ状態と、変更関数、辞書アクセサ）
export {
  currentLang,
  setLanguage,
  currentI18n,
  currentI18n as t, // コンポーネント内で t.ui.h1 のように簡潔にアクセスするためのエイリアス
};

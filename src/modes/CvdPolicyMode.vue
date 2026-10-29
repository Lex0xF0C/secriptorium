<script setup lang="ts">
import { ref, computed } from 'vue'
import { I18N_JA } from '../lib/i18n-ja'
import { generateCvdPolicy, type CvdPolicyForm } from '../lib/cvd-policy'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'

const ui = I18N_JA.cvdUi || {}
const fields = I18N_JA.cvdFields || {}

const form = ref<CvdPolicyForm>({
  orgName: '',
  contactEmail: '',
  scope: '',
  reporting: '',
  safeHarbor: '',
  timeline: '',
  preferences: '',
  acknowledgments: ''
})

const markdownOutput = computed<string>(() => generateCvdPolicy(form.value))

// OutputPanel に渡すためのタブ定義（他のモードと統一）
const tabs = computed<OutputTab[]>(() => [
  {
    id: 'md',
    label: 'Markdown',
    content: markdownOutput.value,
    ext: '.md',
    mime: 'text/markdown;charset=utf-8',
  }
])
</script>

<template>
  <main class="cols">
    <!-- 左側：入力フォームパネル -->
    <section class="panel" aria-label="CVDポリシー入力フォーム">
      <h2>{{ ui.cvdTitle || 'CVDポリシー作成ツール' }}</h2>
      <p class="sub-intro">{{ ui.cvdSubtitle }}</p>

      <div class="row">
        <label>{{ fields.orgName?.split('|')[0] || '組織名・企業名' }}
          <span class="hint">{{ fields.orgName?.split('|')[1] }}</span>
          <input type="text" v-model="form.orgName" placeholder="例: 株式会社〇〇" />
        </label>
        <label>{{ fields.contactEmail?.split('|')[0] || '報告用メールアドレス' }}
          <span class="hint">{{ fields.contactEmail?.split('|')[1] }}</span>
          <input type="text" v-model="form.contactEmail" placeholder="security@example.com" />
        </label>
      </div>

      <label>{{ fields.scope?.split('|')[0] || '適用範囲 (Scope)' }}
        <span class="hint">{{ fields.scope?.split('|')[1] }}</span>
        <textarea v-model="form.scope" rows="3" placeholder="本ポリシーの対象となる製品、サービス、ドメインなど"></textarea>
      </label>

      <label>{{ fields.reporting?.split('|')[0] || '脆弱性の報告方法 (Reporting)' }}
        <span class="hint">{{ fields.reporting?.split('|')[1] }}</span>
        <textarea v-model="form.reporting" rows="3" placeholder="報告時に含めてほしい情報や暗号化(PGP)の案内など"></textarea>
      </label>

      <label>{{ fields.safeHarbor?.split('|')[0] || 'セーフハーバー (Safe Harbor)' }}
        <span class="hint">{{ fields.safeHarbor?.split('|')[1] }}</span>
        <textarea v-model="form.safeHarbor" rows="3" placeholder="善意で行われたセキュリティ調査に対する法的免責の明示"></textarea>
      </label>

      <label>{{ fields.timeline?.split('|')[0] || '対応のタイムフレーム (Timeline)' }}
        <span class="hint">{{ fields.timeline?.split('|')[1] }}</span>
        <textarea v-model="form.timeline" rows="2" placeholder="初動の受領確認（例: 24〜48時間以内）や初期評価の目安"></textarea>
      </label>

      <label>{{ fields.preferences?.split('|')[0] || '開示の調整とエンバーゴ (Preferences)' }}
        <span class="hint">{{ fields.preferences?.split('|')[1] }}</span>
        <textarea v-model="form.preferences" rows="2" placeholder="修正プログラム公開までの調整ルールや非公開期間"></textarea>
      </label>

      <label>{{ fields.acknowledgments?.split('|')[0] || '謝辞 (Acknowledgments)' }}
        <span class="hint">{{ fields.acknowledgments?.split('|')[1] }}</span>
        <textarea v-model="form.acknowledgments" rows="2" placeholder="発見者への謝辞掲載方針やクレジット表記に関する条件"></textarea>
      </label>
    </section>

    <!-- 右側：共通 OutputPanel によるリアルタイムプレビュー＆保存出力 -->
    <OutputPanel class="out" :tabs="tabs" base-name="cvd-policy" />
  </main>
</template>

<style scoped>
.sub-intro {
  margin: 0 0 16px;
  color: var(--sub);
  font-size: 0.9rem;
}
</style>

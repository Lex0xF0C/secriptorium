<script setup lang="ts">
import { ref, computed } from 'vue';
import { I18N_JA } from '../lib/i18n-ja';
import { createDefaultGnaProfile, serializeGnaJson, validateGnaProfile, type GnaProfile } from '../lib/gna';

// 状態管理（リアクティブなGNAプロファイル）
const profile = ref<GnaProfile>(createDefaultGnaProfile());

// コピー成功・エラーなどのステータス表示用
const copied = ref(false);
const errors = computed(() => validateGnaProfile(profile.value));

// 生成されるJSON文字列
const jsonOutput = computed(() => serializeGnaJson(profile.value));

// クリップボードへのコピー機能
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(jsonOutput.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch (e) {
    console.error('Failed to copy text: ', e);
  }
};

// JSONファイルとしてのダウンロード機能
const downloadJson = () => {
  const blob = new Blob([jsonOutput.value], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bcp06-conformance-${profile.value.gnaId || 'gna'}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="gna-mode-container">
    <!-- ヘッダーおよび概要 -->
    <div class="top">
      <h1>{{ I18N_JA.gnaUi?.gnaTitle || "GNA (GCVE Numbering Authority) 支援ツール" }}</h1>
      <p>{{ I18N_JA.gnaUi?.gnaSubtitle || "BCP-06 準拠の Conformance JSON やメタデータをブラウザ内でサポートします。" }}</p>
    </div>

    <!-- 完全ブラウザ完結モード & ID管理の警告バッジ -->
    <div class="cols" style="padding-top: 0; padding-bottom: 0;">
      <div class="panel" style="grid-column: 1 / -1; background: var(--panel); border-color: var(--line);">
        <div style="display: flex; gap: 8px; align-items: flex-start;">
          <span style="font-size: 1.2rem;">🔒</span>
          <p class="hint" style="margin: 0; color: var(--ink);">
            {{ I18N_JA.gnaUi?.gnaConstraintNotice || "完全ブラウザ完結モード：ツール側でデータやIDの重複履歴は保持されません。重複排除やバックアップは自社の管理台帳（Git等）で必ず行ってください。" }}
          </p>
        </div>
      </div>
    </div>

    <!-- エラー表示（もしあれば） -->
    <div class="cols" style="padding-top: 0; padding-bottom: 0;" v-if="errors.length > 0">
      <div class="panel" style="grid-column: 1 / -1; border-color: var(--warn);">
        <ul class="check-list">
          <li v-for="(err, idx) in errors" :key="idx" class="ng">⚠️ {{ err }}</li>
        </ul>
      </div>
    </div>

    <!-- メインコンテンツ（2カラムレイアウト） -->
    <div class="cols">
      <!-- 左側：入力フォームパネル -->
      <div class="panel">
        <label for="gna-id">GNA 識別子 (gna_id)</label>
        <input 
          id="gna-id"
          type="text" 
          v-model="profile.gnaId" 
          placeholder="例: 65535 または GNA-001" 
        />
        <p class="hint">割り当てられた一意のGNA識別子を入力してください。</p>

        <label for="bcp-version">BCP バージョン (gcve_bcp_version)</label>
        <input 
          id="bcp-version"
          type="text" 
          v-model="profile.gcveBcpVersion" 
        />

        <label for="disclosure-model">開示モデル (disclosure_model)</label>
        <select id="disclosure-model" v-model="profile.disclosureProcess.disclosureModel">
          <option value="immediate_full_disclosure">即時完全開示 (immediate_full_disclosure)</option>
          <option value="coordinated_disclosure">協調的開示 (coordinated_disclosure)</option>
          <option value="partial">部分的調整 (partial)</option>
        </select>

        <fieldset>
          <legend>ガバナンス・ポリシー設定</legend>
          
          <label for="policy-url">開示ポリシー URL (disclosure_policy_url)</label>
          <input 
            id="policy-url"
            type="url" 
            v-model="profile.governance.disclosurePolicyUrl" 
            placeholder="https://example.com/disclosure-policy" 
          />

          <div class="opt" style="margin-top: 10px;">
            <input type="checkbox" id="has-sec-contact" v-model="profile.governance.hasSecurityContact" />
            <label for="has-sec-contact" style="margin: 0; font-weight: normal;">セキュリティ連絡先を保持している (has_security_contact)</label>
          </div>

          <label for="contact-type">連絡先タイプ (security_contact_type)</label>
          <input 
            id="contact-type"
            type="text" 
            v-model="profile.governance.securityContactType" 
          />
        </fieldset>

        <fieldset>
          <legend>同期エンドポイント設定</legend>

          <div class="opt" style="margin-top: 4px;">
            <input type="checkbox" id="prov-sync" v-model="profile.synchronization.providesSyncEndpoint" />
            <label for="prov-sync" style="margin: 0; font-weight: normal;">同期用エンドポイントを提供している (provides_sync_endpoint)</label>
          </div>

          <div v-if="profile.synchronization.providesSyncEndpoint" style="margin-top: 10px;">
            <label for="sync-url">同期エンドポイント URL (sync_endpoint_url)</label>
            <input 
              id="sync-url"
              type="url" 
              v-model="profile.synchronization.syncEndpointUrl" 
              placeholder="https://example.com/gcve-sync" 
            />
          </div>
        </fieldset>
      </div>

      <!-- 右側：プレビュー & アクションパネル -->
      <div class="panel out">
        <div class="bar">
          <span style="font-weight: 600; font-size: 0.9rem;">Conformance JSON プレビュー</span>
          <div style="margin-left: auto; display: flex; gap: 8px;">
            <button class="primary" @click="copyToClipboard">
              {{ copied ? "コピーしました！" : (I18N_JA.gnaUi?.copyGnaJson || "JSONをコピー") }}
            </button>
            <button @click="downloadJson">
              {{ I18N_JA.gnaUi?.dlGnaJson || "JSONをダウンロード" }}
            </button>
          </div>
        </div>

        <pre><code>{{ jsonOutput }}</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 独自のレイアウト崩れを防ぎ、グローバルCSSの .cols, .panel, input, button などの定義を最大限活用します */
.gna-mode-container {
  width: 100%;
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { I18N_JA } from '../lib/i18n-ja'
import OutputPanel from '../components/OutputPanel.vue'
import type { OutputTab } from '../lib/output'
import CvssPicker from '../components/CvssPicker.vue'
import { cvssSummary } from '../lib/cvss'
import { buildCsaf, csafWarnings, type AdvisoryForm } from '../lib/advisory'

const L = I18N_JA

// フォームの入力状態（すべてメモリ内の ref で管理）
const status = ref('normal')
const title = ref('')
const publisherName = ref('')
const publisherNamespace = ref('')
const aid = ref('')
const cve = ref('')
const pub = ref(new Date().toISOString().split('T')[0])
const upd = ref('')
const summary = ref('')
const versioncheck = ref('')
const cwe = ref('')
const cwenote = ref('')
const cweOther = ref('') // 候補にないCWEの直接入力
const CWE_OTHER = '__other__' // 選択肢「候補にないCWE」を表す内部の値
const desc = ref('')
const impact = ref('')
const score = ref('')
const sev = ref('')
const vector = ref('')
const fix = ref('')
const work = ref('')
const refs = ref('')
const credit = ref('')
const hist = ref('')
const contact = ref('')

// 製品リスト
interface Product {
  name: string
  ver: string
}
const prods = ref<Product[]>([{ name: '', ver: '' }])

// 自動入力のトラッキング用
const autoDesc = ref('')
const autoImpact = ref('')
const toastMsg = ref('')
let toastTimer: number | null = null

const showToast = (msg: string) => {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMsg.value = '' }, 2800)
}

// 製品の追加・削除
const addProd = () => prods.value.push({ name: '', ver: '' })
const removeProd = (idx: number) => {
  prods.value.splice(idx, 1)
  if (prods.value.length === 0) addProd()
}

// 深刻度の自動判定
const calculatedSev = computed(() => {
  if (sev.value) return sev.value
  const n = parseFloat(score.value)
  if (isNaN(n)) return ''
  if (n === 0) return 'none'
  if (n < 4) return 'low'
  if (n < 7) return 'medium'
  if (n < 9) return 'high'
  return 'critical'
})

// ベクター変更時にCvssPickerからスコアを自動連動させる
const autoScore = ref('')
watch(vector, (v) => {
  const s = cvssSummary(v)
  if (s) {
    score.value = s.score.toFixed(1)
    autoScore.value = score.value
  } else if (score.value === autoScore.value) {
    score.value = ''
    autoScore.value = ''
  }
})

// CWE選択連動（候補から選ばれたら説明と脅威の例文を自動挿入）
const handleCweChange = () => {
  const val = cwe.value.trim()
  const cweKey = val.split(' ')[0]
  const tx = L.cweText[cweKey]
  if (!tx) return

  let skipped = 0
  if (!desc.value.trim() || desc.value === autoDesc.value) {
    desc.value = tx[0]
    autoDesc.value = tx[0]
  } else {
    skipped++
  }

  const impText = L.imp[tx[1]] || tx[1]
  if (!impact.value.trim() || impact.value === autoImpact.value) {
    impact.value = impText
    autoImpact.value = impText
  } else {
    skipped++
  }

  showToast(skipped ? L.ui.autoSkip : L.ui.autoOk)
}

// 定型文ボタン（presets）の挿入ハンドラ
const applyPreset = (targetField: string, textTemplate: string) => {
  const resolvedText = L.imp[textTemplate] || textTemplate
  
  switch (targetField) {
    case 'summary':
      summary.value = summary.value ? summary.value + '\n' + resolvedText : resolvedText
      break
    case 'versioncheck':
      versioncheck.value = versioncheck.value ? versioncheck.value + '\n' + resolvedText : resolvedText
      break
    case 'desc':
      desc.value = desc.value ? desc.value + '\n' + resolvedText : resolvedText
      break
    case 'impact':
      impact.value = impact.value ? impact.value + '\n' + resolvedText : resolvedText
      break
    case 'fix':
      fix.value = fix.value ? fix.value + '\n' + resolvedText : resolvedText
      break
    case 'work':
      work.value = work.value ? work.value + '\n' + resolvedText : resolvedText
      break
    case 'credit':
      credit.value = credit.value ? credit.value + '\n' + resolvedText : resolvedText
      break
    case 'contact':
      contact.value = contact.value ? contact.value + '\n' + resolvedText : resolvedText
      break
  }
  showToast('定型文を挿入しました')
}

// フォーム入力値を advisory.ts の AdvisoryForm 型構造に集約
const formObject = computed<AdvisoryForm>(() => ({
  title: title.value,
  advisoryId: aid.value,
  publisherName: publisherName.value,
  publisherNamespace: publisherNamespace.value,
  cve: cve.value,
  published: pub.value,
  summary: summary.value,
  products: prods.value.map(p => ({ name: p.name, version: p.ver })),
  cwe: cwe.value === CWE_OTHER ? cweOther.value : cwe.value,
  description: desc.value,
  impact: impact.value,
  cvssVector: vector.value,
  fix: fix.value,
  workaround: work.value,
  refs: refs.value,
  contact: contact.value,
}))

// Markdown生成ロジック
const markdownOutput = computed(() => {
  const U = L.ui
  const Ls: string[] = []
  const m: [string, string][] = []
  const sevk = calculatedSev.value
  const sevName = sevk ? L.sev[sevk] : ''

  const cleanTitle = title.value.trim().replace(/\s*\n\s*/g, ' ') || U.untitled
  Ls.push(`# ${cleanTitle}`, '')

  if (aid.value.trim()) m.push([U.mid, aid.value.trim()])
  if (sevName) m.push([U.msev, score.value.trim() ? L.ui.fSev.replace('{s}', sevName).replace('{n}', score.value.trim()) : sevName])
  if (pub.value) m.push([U.mpub, pub.value])
  if (upd.value) m.push([U.mupd, upd.value])

  if (m.length) {
    Ls.push(`| ${U.tItem} | ${U.tCont} |`, '| --- | --- |')
    m.forEach(r => Ls.push(`| ${r[0]} | ${r[1].replace(/\|/g, '\\|')} |`))
    Ls.push('')
  }

  const statText = L.stat[status.value] || ''
  const sm = [statText, summary.value.trim()].filter(Boolean).join('\n\n')
  if (sm) Ls.push(`## ${U.oOver}`, '', sm, '')

  const validProds = prods.value.filter(p => p.name.trim() || p.ver.trim())
  if (validProds.length || versioncheck.value.trim()) {
    Ls.push(`## ${U.oAff}`, '')
    if (validProds.length) {
      Ls.push(U.oAffT, '', `| ${U.tProd} | ${U.tVer} |`, '| --- | --- |')
      validProds.forEach(p => Ls.push(`| ${p.name.replace(/\|/g, '\\|')} | ${p.ver.replace(/\|/g, '\\|')} |`))
      Ls.push('')
    }
    if (versioncheck.value.trim()) Ls.push(U.oVerHow, '', versioncheck.value.trim(), '')
  }

  const cweVal = cwe.value === CWE_OTHER ? cweOther.value.trim().replace(/\s*\n\s*/g, ' ') : cwe.value.trim()
  if (desc.value.trim() || cweVal) {
    Ls.push(`## ${U.oDesc}`, '')
    if (desc.value.trim()) Ls.push(desc.value.trim(), '')
    if (cweVal === L.unk) {
      Ls.push(L.ui.fCweUnk.replace('{t}', cwenote.value.trim().replace(/\n/g, ' ')), '')
    } else if (cweVal) {
      Ls.push(`- ${cweVal}`, '')
    }
  }

  if (impact.value.trim() || score.value.trim()) {
    Ls.push(`## ${U.oImp}`, '')
    if (impact.value.trim()) Ls.push(impact.value.trim(), '')
    if (score.value.trim()) {
      const ver = cvssSummary(vector.value)?.version ?? '3.1'
      Ls.push(L.ui.fCvss.replace('v3.1', 'v' + ver).replace('{n}', score.value.trim()).replace('{s}', sevName))
    }
    if (vector.value.trim()) Ls.push(L.ui.fVec.replace('{v}', vector.value.trim()))
    Ls.push('')
  }

  const activeFix = fix.value.trim() || (status.value === 'eol' ? L.eolfix : '')
  if (activeFix) Ls.push(`## ${U.oFix}`, '', activeFix, '')
  if (work.value.trim()) Ls.push(`## ${U.oWork}`, '', work.value.trim(), '')

  const rel = cve.value.split(/[,、\s]+/).filter(Boolean).concat(refs.value.split('\n').map(s => s.trim()).filter(Boolean))
  if (rel.length) {
    Ls.push(`## ${U.oRel}`, '')
    rel.forEach(r => Ls.push(`- ${r}`))
    Ls.push('')
  }

  if (credit.value.trim()) Ls.push(`## ${U.oCred}`, '', credit.value.trim(), '')
  if (pub.value || hist.value.trim()) {
    Ls.push(`## ${U.oHist}`, '')
    if (pub.value) Ls.push(`- ${pub.value} ${U.pubd}`)
    hist.value.split('\n').map(s => s.trim()).filter(Boolean).forEach(r => Ls.push(`- ${r}`))
    Ls.push('')
  }
  if (contact.value.trim()) Ls.push(`## ${U.oCont}`, '', contact.value.trim(), '')

  return Ls.join('\n').replace(/\n+$/, '\n')
})

// OutputPanel に渡す OutputTab 定義（CSAF 2.0 JSON とバリデーション警告を組み込み）
const tabs = computed<OutputTab[]>(() => [
  {
    id: 'markdown',
    label: 'Markdown',
    content: markdownOutput.value,
    ext: '.md',
    mime: 'text/markdown;charset=utf-8'
  },
  {
    id: 'csaf',
    label: 'CSAF 2.0 (JSON)',
    content: JSON.stringify(buildCsaf(formObject.value), null, 2),
    ext: '.json',
    mime: 'application/json;charset=utf-8',
    warnings: csafWarnings(formObject.value)
  }
])
</script>

<template>
  <div class="cols">
    <!-- 左側：入力パネル -->
    <div class="panel advisory-form-panel">
      <h2>{{ L.ui.h1 }}</h2>
      <p class="hint">{{ L.ui.intro }}</p>

      <div v-if="toastMsg" class="bar toast-bar">
        <span class="status toast-text">{{ toastMsg }}</span>
      </div>

      <form @submit.prevent class="form-container">
        <!-- 状況ステータス -->
        <div>
          <label>{{ L.ui.stl }}</label>
          <select v-model="status">
            <option value="normal">{{ L.ui.st0 }}</option>
            <option value="urgent">{{ L.ui.st1 }}</option>
            <option value="attack">{{ L.ui.st2 }}</option>
            <option value="eol">{{ L.ui.st3 }}</option>
          </select>
        </div>

        <!-- タイトル -->
        <div>
          <label>{{ L.ui.tl.split('|')[0] }}</label>
          <p class="hint">{{ L.ui.tl.split('|')[1] }}</p>
          <input type="text" v-model="title" :placeholder="L.ui.tph" />
        </div>

        <!-- CSAF 発行者情報（組織名・URL） -->
        <div class="row">
          <div>
            <label>発行者名（組織名・PSIRT名）</label>
            <input type="text" v-model="publisherName" placeholder="例：株式会社サンプル PSIRT" />
          </div>
          <div>
            <label>発行者URL（Namespace）</label>
            <input type="url" v-model="publisherNamespace" placeholder="https://example.co.jp" />
          </div>
        </div>

        <!-- 管理番号・CVE -->
        <div class="row">
          <div>
            <label>{{ L.ui.aidl.split('|')[0] }}</label>
            <input type="text" v-model="aid" placeholder="ADV-2026-001" />
          </div>
          <div>
            <label>{{ L.ui.cvel.split('|')[0] }}</label>
            <input type="text" v-model="cve" placeholder="CVE-2026-1234" />
          </div>
        </div>

        <!-- 公開日・更新日 -->
        <div class="row">
          <div>
            <label>{{ L.ui.publ }}</label>
            <input type="date" v-model="pub" />
          </div>
          <div>
            <label>{{ L.ui.updl.split('|')[0] }}</label>
            <input type="date" v-model="upd" />
          </div>
        </div>

        <!-- 概要 + プリセットボタン -->
        <div>
          <div class="label-bar">
            <label>{{ L.ui.suml.split('|')[0] }}</label>
            <div class="preset-btns">
              <button 
                v-for="(p, idx) in L.presets.summary" 
                :key="idx" 
                type="button" 
                @click="applyPreset('summary', p[1])"
              >
                +{{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="summary" rows="3" :placeholder="L.ui.sumph"></textarea>
        </div>

        <!-- 影響を受ける製品 -->
        <div>
          <label>{{ L.ui.prodl.split('|')[0] }}</label>
          <div v-for="(p, index) in prods" :key="index" class="prod">
            <input type="text" v-model="p.name" :placeholder="L.ui.pn" />
            <input type="text" v-model="p.ver" :placeholder="L.ui.pv" />
            <button type="button" @click="removeProd(index)">{{ L.ui.pdel }}</button>
          </div>
          <button type="button" @click="addProd">+ {{ L.ui.addprod }}</button>
        </div>

        <!-- バージョン確認方法 + プリセットボタン -->
        <div>
          <div class="label-bar">
            <label>{{ L.ui.vcl }}</label>
            <div class="preset-btns">
              <button 
                v-for="(p, idx) in L.presets.versioncheck" 
                :key="idx" 
                type="button" 
                @click="applyPreset('versioncheck', p[1])"
              >
                +{{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="versioncheck" rows="2" placeholder="確認手順を入力..."></textarea>
        </div>

        <!-- 脆弱性の種類（CWE選択連動） -->
        <div>
          <label>{{ L.ui.cwel.split('|')[0] }}</label>
          <p class="hint">{{ L.ui.cwel.split('|')[1] }}</p>
          <select v-model="cwe" @change="handleCweChange">
            <option value="">-- CWEを選択してください --</option>
            <option :value="CWE_OTHER">{{ L.ui.cweo }}</option>
            <option :value="L.unk">{{ L.unk }}</option>
            <option v-for="c in L.cwes" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div v-if="cwe === CWE_OTHER">
          <label>{{ L.ui.cweol.split('|')[0] }}</label>
          <p class="hint">{{ L.ui.cweol.split('|')[1] }}</p>
          <input type="text" v-model="cweOther" :placeholder="L.ui.cweoph" />
        </div>

        <div v-if="cwe === L.unk">
          <label>{{ L.ui.cwenl.split('|')[0] }}</label>
          <p class="hint">{{ L.ui.cwenl.split('|')[1] }}</p>
          <input type="text" v-model="cwenote" :placeholder="L.ui.cwenph" />
        </div>

        <!-- 脆弱性の説明（Description） + プリセットボタン -->
        <div>
          <div class="label-bar">
            <label>{{ L.ui.descl.split('|')[0] }}</label>
            <div class="preset-btns">
              <button 
                v-for="(p, idx) in L.presets.desc" 
                :key="idx" 
                type="button" 
                @click="applyPreset('desc', p[1])"
              >
                +{{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="desc" rows="4" placeholder="脆弱性の詳細な説明..."></textarea>
        </div>

        <!-- 脅威（Impact） + プリセットボタン -->
        <div>
          <div class="label-bar">
            <label>{{ L.ui.impl.split('|')[0] }}</label>
            <div class="preset-btns">
              <button 
                v-for="(p, idx) in L.presets.impact" 
                :key="idx" 
                type="button" 
                @click="applyPreset('impact', p[1])"
              >
                ⚡ {{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="impact" rows="3" placeholder="もたらされる脅威..."></textarea>
        </div>

        <!-- CVSS 基本スコア & ベクター -->
        <div class="row">
          <div>
            <label>{{ L.ui.scorel }}</label>
            <input type="text" v-model="score" placeholder="6.5" />
          </div>
          <div>
            <label>{{ L.ui.sevl }}</label>
            <input type="text" :value="calculatedSev ? L.sev[calculatedSev] : ''" disabled placeholder="自動判定" />
          </div>
        </div>
        <div>
          <label>{{ L.ui.vecl }}</label>
          <input type="text" v-model="vector" placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" />
        </div>

        <!-- CVSS計算ピッカー -->
        <details>
          <summary>{{ L.ui.cvsss || '項目を選んでスコアを計算する（各項目に説明があります）' }}</summary>
          <CvssPicker v-model="vector" />
        </details>

        <!-- 対策方法 + プリセット -->
        <div>
          <div class="label-bar">
            <label>{{ L.ui.fixl.split('|')[0] }}</label>
            <div class="preset-btns">
              <button 
                v-for="(p, idx) in L.presets.fix" 
                :key="idx" 
                type="button" 
                @click="applyPreset('fix', p[1])"
              >
                +{{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="fix" rows="3" placeholder="修正版の入手先や適用手順..."></textarea>
        </div>

        <!-- 回避策 + プリセット -->
        <div>
          <div class="label-bar">
            <label>{{ L.ui.workl.split('|')[0] }}</label>
            <div class="preset-btns">
              <button 
                v-for="(p, idx) in L.presets.work" 
                :key="idx" 
                type="button" 
                @click="applyPreset('work', p[1])"
              >
                +{{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="work" rows="2" placeholder="回避策..."></textarea>
        </div>

        <!-- 関連情報 -->
        <div>
          <label>{{ L.ui.refl }}</label>
          <textarea v-model="refs" rows="2" placeholder="https://jvn.jp/..."></textarea>
        </div>

        <!-- 謝辞 + プリセット -->
        <div>
          <div class="label-bar">
            <label>{{ L.ui.credl.split('|')[0] }}</label>
            <div class="preset-btns">
              <button 
                v-for="(p, idx) in L.presets.credit" 
                :key="idx" 
                type="button" 
                @click="applyPreset('credit', p[1])"
              >
                +{{ p[0] }}
              </button>
            </div>
          </div>
          <input type="text" v-model="credit" placeholder="発見者への謝辞..." />
        </div>

        <!-- 連絡先 + プリセット -->
        <div>
          <div class="label-bar">
            <label>{{ L.ui.contl }}</label>
            <div class="preset-btns">
              <button 
                v-for="(p, idx) in L.presets.contact" 
                :key="idx" 
                type="button" 
                @click="applyPreset('contact', p[1])"
              >
                +{{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="contact" rows="2" placeholder="問い合わせ窓口..."></textarea>
        </div>
      </form>
    </div>

    <!-- 右側：出力パネル（共通クラス適用） -->
    <div class="panel out">
      <OutputPanel :tabs="tabs" base-name="advisory" />
    </div>
  </div>
</template>

<style scoped>
.toast-bar {
  margin-top: 10px;
}
.toast-text {
  color: var(--accent);
  font-weight: 600;
}
.form-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;
}
.label-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 14px 0 4px;
}
.label-bar label {
  margin: 0 !important;
}
.preset-btns {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.preset-btns button {
  padding: 3px 8px;
  font-size: 0.8rem;
}
</style>

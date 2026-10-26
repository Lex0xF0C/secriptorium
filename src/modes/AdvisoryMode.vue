<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { I18N_JA } from '../lib/i18n-ja'
import OutputPanel from '../components/OutputPanel.vue'

const L = I18N_JA

// フォームの入力状態
const status = ref('urgent')
const title = ref('')
const aid = ref('')
const cve = ref('')
const pub = ref(new Date().toISOString().split('T')[0])
const upd = ref('')
const summary = ref('')
const versioncheck = ref('')
const cwe = ref('')
const cwenote = ref('')
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

// CWE選択連動（候補から選ばれたら説明と影響を自動挿入）
const handleCweChange = () => {
  const val = cwe.value.trim()
  const cweKey = val.split(' ')[0]
  const tx = L.cweText[cweKey]
  if (!tx) return

  let skipped = 0
  // 概要説明の挿入
  if (!desc.value.trim() || desc.value === autoDesc.value) {
    desc.value = tx[0]
    autoDesc.value = tx[0]
  } else {
    skipped++
  }

  // 脅威影響の挿入
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
  // プレースホルダーやキーの解決（impactなどの場合）
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

  if (desc.value.trim() || cwe.value.trim()) {
    Ls.push(`## ${U.oDesc}`, '')
    if (desc.value.trim()) Ls.push(desc.value.trim(), '')
    if (cwe.value.trim() === L.unk) {
      Ls.push(L.ui.fCweUnk.replace('{t}', cwenote.value.trim().replace(/\n/g, ' ')), '')
    } else if (cwe.value.trim()) {
      Ls.push(`- ${cwe.value.trim()}`, '')
    }
  }

  if (impact.value.trim() || score.value.trim()) {
    Ls.push(`## ${U.oImp}`, '')
    if (impact.value.trim()) Ls.push(impact.value.trim(), '')
    if (score.value.trim()) Ls.push(L.ui.fCvss.replace('{n}', score.value.trim()).replace('{s}', sevName))
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

// OutputPanel に渡すタブデータの定義
const tabs = computed(() => [
  {
    key: 'markdown',
    label: 'Markdown',
    content: markdownOutput.value,
    filename: 'vulnerability-advisory.md'
  },
  {
    key: 'json',
    label: 'JSON',
    content: JSON.stringify({
      status: status.value,
      title: title.value,
      aid: aid.value,
      cve: cve.value,
      pub: pub.value,
      summary: summary.value,
      prods: prods.value,
      cwe: cwe.value,
      desc: desc.value,
      impact: impact.value,
      score: score.value,
      vector: vector.value,
      fix: fix.value,
      work: work.value
    }, null, 2),
    filename: 'vulnerability-advisory.json'
  }
])
</script>

<template>
  <div class="advisory-mode">
    <div class="advisory-form-container">
      <h2>{{ L.ui.h1 }}</h2>
      <p class="intro-text">{{ L.ui.intro }}</p>

      <div v-if="toastMsg" class="toast-banner">{{ toastMsg }}</div>

      <form @submit.prevent class="advisory-form">
        <!-- 状況ステータス -->
        <div class="form-group">
          <label>{{ L.ui.stl }}</label>
          <select v-model="status">
            <option value="normal">{{ L.ui.st0 }}</option>
            <option value="urgent">{{ L.ui.st1 }}</option>
            <option value="attack">{{ L.ui.st2 }}</option>
            <option value="eol">{{ L.ui.st3 }}</option>
          </select>
        </div>

        <!-- タイトル -->
        <div class="form-group">
          <label>{{ L.ui.tl.split('|')[0] }} <span class="hint">{{ L.ui.tl.split('|')[1] }}</span></label>
          <input type="text" v-model="title" :placeholder="L.ui.tph" />
        </div>

        <!-- 管理番号・CVE -->
        <div class="form-row">
          <div class="form-group">
            <label>{{ L.ui.aidl.split('|')[0] }}</label>
            <input type="text" v-model="aid" placeholder="ADV-2026-001" />
          </div>
          <div class="form-group">
            <label>{{ L.ui.cvel.split('|')[0] }}</label>
            <input type="text" v-model="cve" placeholder="CVE-2026-1234" />
          </div>
        </div>

        <!-- 公開日・更新日 -->
        <div class="form-row">
          <div class="form-group">
            <label>{{ L.ui.publ }}</label>
            <input type="date" v-model="pub" />
          </div>
          <div class="form-group">
            <label>{{ L.ui.updl.split('|')[0] }}</label>
            <input type="date" v-model="upd" />
          </div>
        </div>

        <!-- 概要 + プリセットボタン -->
        <div class="form-group">
          <div class="label-with-presets">
            <label>{{ L.ui.suml.split('|')[0] }}</label>
            <div class="preset-inline-btns">
              <button 
                v-for="(p, idx) in L.presets.summary" 
                :key="idx" 
                type="button" 
                class="mini-pre-btn"
                @click="applyPreset('summary', p[1])"
              >
                ＋{{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="summary" rows="3" :placeholder="L.ui.sumph"></textarea>
        </div>

        <!-- 影響を受ける製品 -->
        <div class="form-group">
          <label>{{ L.ui.prodl.split('|')[0] }}</label>
          <div v-for="(p, index) in prods" :key="index" class="prod-row">
            <input type="text" v-model="p.name" :placeholder="L.ui.pn" />
            <input type="text" v-model="p.ver" :placeholder="L.ui.pv" />
            <button type="button" class="del-btn" @click="removeProd(index)">{{ L.ui.pdel }}</button>
          </div>
          <button type="button" class="secondary-btn" @click="addProd">+ {{ L.ui.addprod }}</button>
        </div>

        <!-- バージョン確認方法 + プリセットボタン -->
        <div class="form-group">
          <div class="label-with-presets">
            <label>{{ L.ui.vcl }}</label>
            <div class="preset-inline-btns">
              <button 
                v-for="(p, idx) in L.presets.versioncheck" 
                :key="idx" 
                type="button" 
                class="mini-pre-btn"
                @click="applyPreset('versioncheck', p[1])"
              >
                ＋{{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="versioncheck" rows="2" placeholder="確認手順を入力..."></textarea>
        </div>

        <!-- 脆弱性の種類（CWE選択連動） -->
        <div class="form-group">
          <label>{{ L.ui.cwel }}</label>
          <select v-model="cwe" @change="handleCweChange" class="cwe-select">
            <option value="">-- CWEを選択してください --</option>
            <option :value="L.unk">{{ L.unk }}</option>
            <option v-for="c in L.cwes" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div v-if="cwe === L.unk" class="form-group">
          <label>{{ L.ui.cwenl }}</label>
          <input type="text" v-model="cwenote" :placeholder="L.ui.cwenph" />
        </div>

        <!-- 脆弱性の説明（Description） + プリセットボタン -->
        <div class="form-group">
          <div class="label-with-presets">
            <label>{{ L.ui.descl.split('|')[0] }}</label>
            <div class="preset-inline-btns">
              <button 
                v-for="(p, idx) in L.presets.desc" 
                :key="idx" 
                type="button" 
                class="mini-pre-btn"
                @click="applyPreset('desc', p[1])"
              >
                ＋{{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="desc" rows="4" placeholder="脆弱性の詳細な説明..."></textarea>
        </div>

        <!-- 脅威（Impact） + プリセットボタン（被害シナリオ別） -->
        <div class="form-group">
          <div class="label-with-presets">
            <label>{{ L.ui.impl.split('|')[0] }}</label>
            <div class="preset-inline-btns">
              <button 
                v-for="(p, idx) in L.presets.impact" 
                :key="idx" 
                type="button" 
                class="mini-pre-btn scenario-badge"
                @click="applyPreset('impact', p[1])"
              >
                ⚡ {{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="impact" rows="3" placeholder="もたらされる脅威..."></textarea>
        </div>

        <!-- CVSS 基本スコア & ベクター -->
        <div class="form-row">
          <div class="form-group">
            <label>{{ L.ui.scorel }}</label>
            <input type="text" v-model="score" placeholder="6.5" />
          </div>
          <div class="form-group">
            <label>{{ L.ui.sevl }}</label>
            <input type="text" :value="calculatedSev ? L.sev[calculatedSev] : ''" disabled placeholder="自動判定" />
          </div>
        </div>
        <div class="form-group">
          <label>{{ L.ui.vecl }}</label>
          <input type="text" v-model="vector" placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" />
        </div>

        <!-- 対策方法 + プリセット -->
        <div class="form-group">
          <div class="label-with-presets">
            <label>{{ L.ui.fixl.split('|')[0] }}</label>
            <div class="preset-inline-btns">
              <button 
                v-for="(p, idx) in L.presets.fix" 
                :key="idx" 
                type="button" 
                class="mini-pre-btn"
                @click="applyPreset('fix', p[1])"
              >
                ＋{{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="fix" rows="3" placeholder="修正版の入手先や適用手順..."></textarea>
        </div>

        <!-- 回避策 + プリセット -->
        <div class="form-group">
          <div class="label-with-presets">
            <label>{{ L.ui.workl.split('|')[0] }}</label>
            <div class="preset-inline-btns">
              <button 
                v-for="(p, idx) in L.presets.work" 
                :key="idx" 
                type="button" 
                class="mini-pre-btn"
                @click="applyPreset('work', p[1])"
              >
                ＋{{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="work" rows="2" placeholder="回避策..."></textarea>
        </div>

        <!-- 関連情報 -->
        <div class="form-group">
          <label>{{ L.ui.refl }}</label>
          <textarea v-model="refs" rows="2" placeholder="https://jvn.jp/..."></textarea>
        </div>

        <!-- 謝辞 + プリセット -->
        <div class="form-group">
          <div class="label-with-presets">
            <label>{{ L.ui.credl.split('|')[0] }}</label>
            <div class="preset-inline-btns">
              <button 
                v-for="(p, idx) in L.presets.credit" 
                :key="idx" 
                type="button" 
                class="mini-pre-btn"
                @click="applyPreset('credit', p[1])"
              >
                ＋{{ p[0] }}
              </button>
            </div>
          </div>
          <input type="text" v-model="credit" placeholder="発見者への謝辞..." />
        </div>

        <!-- 連絡先 + プリセット -->
        <div class="form-group">
          <div class="label-with-presets">
            <label>{{ L.ui.contl }}</label>
            <div class="preset-inline-btns">
              <button 
                v-for="(p, idx) in L.presets.contact" 
                :key="idx" 
                type="button" 
                class="mini-pre-btn"
                @click="applyPreset('contact', p[1])"
              >
                ＋{{ p[0] }}
              </button>
            </div>
          </div>
          <textarea v-model="contact" rows="2" placeholder="問い合わせ窓口..."></textarea>
        </div>
      </form>
    </div>

    <!-- 右側出力パネル -->
    <div class="advisory-output-container">
      <OutputPanel :tabs="tabs" base-name="advisory" />
    </div>
  </div>
</template>

<style scoped>
.advisory-mode {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  align-items: start;
}
@media (max-width: 1024px) {
  .advisory-mode {
    grid-template-columns: 1fr;
  }
}
.advisory-form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--panel, #1e1e1e);
  border: 1px solid var(--line, #333);
  border-radius: 8px;
  padding: 20px;
}
.intro-text {
  font-size: 0.85rem;
  color: var(--sub, #aaa);
  margin: 0 0 10px 0;
  line-height: 1.4;
}
.toast-banner {
  background: rgba(58, 117, 196, 0.2);
  border: 1px solid var(--accent, #3a75c4);
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  text-align: center;
}
.advisory-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
label {
  font-size: 0.85rem;
  font-weight: bold;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.hint {
  font-weight: normal;
  font-size: 0.75rem;
  color: var(--sub, #888);
}
input[type="text"],
input[type="date"],
select,
textarea {
  background: #252525;
  border: 1px solid var(--line, #444);
  border-radius: 4px;
  padding: 8px 10px;
  color: #fff;
  font-size: 0.9rem;
  font-family: inherit;
}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--accent, #3a75c4);
}
.label-with-presets {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.preset-inline-btns {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.mini-pre-btn {
  background: #2d2d2d;
  border: 1px solid #555;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 0.75rem;
  color: #ccc;
  cursor: pointer;
  transition: all 0.2s;
}
.mini-pre-btn:hover {
  background: var(--accent, #3a75c4);
  color: #fff;
  border-color: var(--accent, #3a75c4);
}
.scenario-badge {
  background: rgba(58, 117, 196, 0.15);
  border-color: #3a75c4;
  color: #e2e8f0;
}
.prod-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  margin-bottom: 6px;
}
.del-btn {
  background: #552222;
  border: 1px solid #773333;
  color: #fff;
  padding: 0 10px;
  border-radius: 4px;
  cursor: pointer;
}
.del-btn:hover {
  background: #882222;
}
.secondary-btn {
  background: transparent;
  border: 1px dashed var(--line, #555);
  border-radius: 4px;
  padding: 6px;
  color: var(--sub, #aaa);
  cursor: pointer;
  font-size: 0.85rem;
}
.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}
</style>

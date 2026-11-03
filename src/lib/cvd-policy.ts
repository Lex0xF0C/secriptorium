// src/lib/cvd-policy.ts

export interface CvdPolicyForm {
  orgName: string
  contactEmail: string
  scope: string
  reporting: string
  safeHarbor: string
  timeline: string
  preferences: string
  acknowledgments: string
}

/**
 * フォームデータと言語設定に基づき、CVDポリシー (Markdown) を動的に生成する
 */
export function generateCvdPolicy(data: CvdPolicyForm, lang: 'ja' | 'en' = 'ja'): string {
  const isEn = lang === 'en'
  const org = data.orgName.trim() || (isEn ? '[Organization Name]' : '（組織名未入力）')
  const email = data.contactEmail.trim() || 'security@example.com'

  if (isEn) {
    return [
      `# Coordinated Vulnerability Disclosure (CVD) Policy`,
      `**${org}**`,
      '',
      `## 1. Introduction`,
      `${org} is committed to ensuring the security and safety of our products and services. We welcome security researchers and community reports regarding potential vulnerabilities in our scope.`,
      '',
      `## 2. Scope`,
      data.scope.trim() || 'This policy applies to all software products, official websites, and services operated by our organization.',
      '',
      `## 3. Reporting Guidelines & Security Contact`,
      `If you believe you have discovered a vulnerability, please contact us via:`,
      `* **Security Contact Email**: \`${email}\``,
      `* **Required Details**:`,
      data.reporting.trim() || '  - Detailed description of the vulnerability\n  - Reproduction steps, PoC, or relevant log excerpts\n  - Affected product name and version range',
      '',
      `## 4. Safe Harbor Commitment`,
      data.safeHarbor.trim() || 'We will not pursue civil or criminal legal action against security researchers who conduct good-faith security research complying with this policy.',
      '',
      `## 5. Response Timeframe & SLA`,
      `We strive to handle reported vulnerabilities according to the following target timeline:`,
      `* **Initial Acknowledgment**: ${data.timeline.trim() || 'Within 24 to 48 hours upon reception'}`,
      '',
      `## 6. Coordinated Disclosure & Embargo`,
      data.preferences.trim() || 'We request a mutual embargo period prior to patch release to protect users and systems.',
      '',
      `## 7. Researcher Acknowledgments`,
      data.acknowledgments.trim() || 'We appreciate the contributions of researchers who practice responsible disclosure and will credit them with consent.',
      '',
      '---',
      '* Generated via Secriptorium CVD Policy Generator.'
    ].join('\n')
  }

  return [
    `# ${org} 協調的な脆弱性開示 (CVD) ポリシー`,
    '',
    `## 1. はじめに`,
    `${org}（以下、「当社」）は、お客様や利用者にご利用いただく製品およびサービスのセキュリティと安全性を最優先事項と考えています。本ポリシーは、セキュリティ研究者や一般の報告者が当社の製品における脆弱性を安全かつ迅速に報告するための手順とガイドラインを定めたものです。`,
    '',
    `## 2. 適用範囲 (Scope)`,
    data.scope.trim() || '本ポリシーは、当社が提供するすべてのソフトウェア製品、公式ウェブサイト、およびインフラストラクチャに適用されます。',
    '',
    `## 3. 脆弱性の報告方法 (Reporting)`,
    `セキュリティ上の脆弱性を発見された場合は、以下の窓口までご報告ください。`,
    `* **報告用窓口**: \`${email}\``,
    `* **推奨される記載事項**:`,
    data.reporting.trim() || '  - 発見された脆弱性の詳細な説明\n  - 再現手順、PoC（概念実証）、またはログ\n  - 影響を受ける製品名およびバージョン',
    '',
    `## 4. セーフハーバー（法的免責）`,
    data.safeHarbor.trim() || '当社は、善意に基づく（悪意のない）セキュリティ調査および脆弱性報告に対して、法的措置を取らないこと（セーフハーバー）を約します。',
    '',
    `## 5. 対応のタイムフレーム (Timeline)`,
    `当社は報告された脆弱性に対し、以下の目安で誠実に対応します。`,
    `* **受領確認**: ${data.timeline.trim() || '報告を受領してから通常 24 〜 48 時間以内に受領確認の連絡を行います。'}`,
    '',
    `## 6. 開示の調整とエンバーゴ (Preferences)`,
    data.preferences.trim() || '当社は、修正プログラムが準備されるまでの間、脆弱性の詳細を非公開とする相互協定（エンバーゴ期間）へのご協力をお願いしております。',
    '',
    `## 7. 謝辞 (Acknowledgments)`,
    data.acknowledgments.trim() || '責任ある脆弱性の開示を通じて製品の安全性向上にご協力いただいたセキュリティ研究者に対し、ご希望に応じて謝辞やクレジットを掲載させていただきます。',
    '',
    '---',
    '* 本ポリシーは ENISA のガイドラインおよび関連する国際標準に準拠して作成されています。'
  ].join('\n')
}

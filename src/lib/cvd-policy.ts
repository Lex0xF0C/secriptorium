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

export function generateCvdPolicy(form: CvdPolicyForm): string {
  const org = form.orgName.trim() || '（組織名未入力）'
  const email = form.contactEmail.trim() || 'security@example.com'

  const lines: string[] = [
    `# ${org} セキュリティ脆弱性開示ポリシー (CVD Policy)`,
    '',
    `${org}（以下、「当社」）は、セキュリティ研究者やコミュニティからの協調的な脆弱性開示（Coordinated Vulnerability Disclosure: CVD）を受け付けています。本ポリシーでは、脆弱性報告の受付方法、適用範囲、および対応方針について定めています。`,
    '',
    '## 1. 適用範囲 (Scope)',
    form.scope.trim() || '（適用範囲が未入力です）',
    '',
    '## 2. 脆弱性の報告方法 (Reporting)',
    `脆弱性を発見された場合は、以下の窓口まで電子メールにてご報告ください。`,
    '',
    `- **報告用窓口**: \`${email}\``,
    '',
    form.reporting.trim() || '（報告方法や推奨情報が未入力です）',
    '',
    '## 3. セーフハーバー (Safe Harbor)',
    '当社は、セキュリティ研究者が以下の条件を遵守して善意で行った調査活動について、法的措置を講じません。',
    '',
    form.safeHarbor.trim() || '（セーフハーバーの方針が未入力です）',
    '',
    '## 4. 対応のタイムフレーム (Timeline)',
    '当社は、ご報告いただいた脆弱性に対して以下の目安で対応を行います。',
    '',
    form.timeline.trim() || '（タイムフレームが未入力です）',
    '',
    '## 5. 開示の調整とエンバーゴ (Preferences)',
    '修正プログラムの提供とエコシステムの安全性を最優先するため、原則として以下の調整にご協力をお願いいたします。',
    '',
    form.preferences.trim() || '（エンバーゴや開示調整の方針が未入力です）',
    '',
    '## 6. 謝辞 (Acknowledgments)',
    '当社の製品やサービスの安全性を向上させるために貢献していただいたセキュリティ研究者に対し、感謝の意を表します。',
    '',
    form.acknowledgments.trim() || '（謝辞の方針が未入力です)',
    '',
    '---',
    `* 本ポリシーは ENISA（欧州連合サイバーセキュリティ局）のガイドラインおよび関連する国際標準に準拠して作成されています。`,
    ''
  ]

  return lines.join('\n')
}

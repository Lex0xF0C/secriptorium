// src/lib/cvd-policy.ts
export interface CvdPolicyForm {
  orgName: string;
  contactEmail: string;
  scope: string;
  reporting: string;
  safeHarbor: string;
  timeline: string;
  preferences: string;
  acknowledgments: string;
}

/**
 * フォームデータから ENISA 準拠の CVD ポリシー (Markdown) を生成する
 */
export function generateCvdPolicy(data: CvdPolicyForm): string {
  const org = data.orgName.trim() || '当社';
  const email = data.contactEmail.trim() || 'security@example.com';

  return `# ${org} 協調的な脆弱性開示 (CVD) ポリシー

## 1. はじめに
${org}（以下、「当社」）は、お客様や利用者にご利用いただく製品およびサービスのセキュリティと安全性を最優先事項と考えています。
本ポリシーは、セキュリティ研究者や一般の報告者が、当社の製品における脆弱性を安全かつ迅速に報告するための手順とガイドラインを定めたものです。

## 2. 適用範囲 (Scope)
${data.scope.trim() || '本ポリシーは、当社が提供するすべてのソフトウェア製品、公式ウェブサイト、およびインフラストラクチャに適用されます。'}

## 3. 脆弱性の報告方法 (Reporting)
セキュリティ上の脆弱性を発見された場合は、以下の方法で当社までご報告ください。
* **連絡先アドレス**: ${email}
* **報告内容への期待事項**:
${data.reporting.trim() || '  - 発見された脆弱性の詳細な説明\n  - 再現手順、PoC（概念実証）、またはログ\n  - 影響を受ける製品名およびバージョン'}

## 4. セーフハーバー（法的免責）
${data.safeHarbor.trim() || '当社は、善意に基づく（悪意のない）セキュリティ調査および脆弱性報告に対して、法的措置を取らないこと（セーフハーバー）をお約束します。調査の際は、ユーザーのデータ保護、サービスの可用性維持、およびプライバシーの尊重を遵守してください。'}

## 5. 対応のタイムフレーム (Timeline)
当社は報告された脆弱性に対し、以下の目安で誠実に対応します。
* **受領確認**: ${data.timeline.trim() || '報告を受領してから通常 24 〜 48 時間以内に受領確認の連絡を行います。'}
* **進捗報告**: 脆弱性の深刻度や検証結果に応じ、適宜進捗をご連絡します。

## 6. 開示の調整とエンバーゴ
${data.preferences.trim() || '当社は、ユーザーを保護するための修正プログラムが準備・展開されるまでの間、脆弱性の詳細が一般に公開されないよう、原則として一定期間（エンバーゴ期間）の非公開にご協力をお願いしております。'}

## 7. 謝辞 (Acknowledgments)
${data.acknowledgments.trim() || '当社は、責任ある脆弱性の開示を通じて製品の安全性向上にご協力いただいたセキュリティ研究者に対し、ご希望に応じて謝辞やクレジットを掲載させていただきます。'}
`;
}

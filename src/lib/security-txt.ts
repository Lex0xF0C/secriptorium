// src/lib/security-txt.ts
export interface SecurityTxtForm {
  contact: string;
  expires: string;
  encryption: string;
  acknowledgments: string;
  preferredLanguages: string;
  canonical: string;
  policy: string;
  hiring: string;
}

/**
 * 入力されたフォームデータから RFC 9116 準拠の security.txt 文字列を生成する
 */
export function generateSecurityTxt(data: SecurityTxtForm): string {
  const lines: string[] = [];

  if (data.contact.trim()) {
    const contacts = data.contact.split('\n').map(c => c.trim()).filter(Boolean);
    contacts.forEach(c => lines.push(`Contact: ${c}`));
  }

  if (data.expires.trim()) {
    lines.push(`Expires: ${data.expires.trim()}`);
  }

  if (data.encryption.trim()) {
    lines.push(`Encryption: ${data.encryption.trim()}`);
  }

  if (data.acknowledgments.trim()) {
    lines.push(`Acknowledgments: ${data.acknowledgments.trim()}`);
  }

  if (data.preferredLanguages.trim()) {
    lines.push(`Preferred-Languages: ${data.preferredLanguages.trim()}`);
  }

  if (data.canonical.trim()) {
    lines.push(`Canonical: ${data.canonical.trim()}`);
  }

  if (data.policy.trim()) {
    lines.push(`Policy: ${data.policy.trim()}`);
  }

  if (data.hiring.trim()) {
    lines.push(`Hiring: ${data.hiring.trim()}`);
  }

  return lines.join('\n') + '\n';
}

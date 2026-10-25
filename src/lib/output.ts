// 出力パネル（OutputPanel.vue）に渡す、1つのタブ分のデータ。
// アドバイザリでも、将来の SBOM / VEX でも、同じパネルを使い回します。
export interface OutputTab {
  id: string
  label: string
  content: string // 表示・コピー・保存する本文
  ext: string // 保存時の拡張子（例: '.md'）
  mime: string // 保存時の MIME タイプ
  warnings?: string[] // 足りない項目の名前（あれば警告として表示）
}

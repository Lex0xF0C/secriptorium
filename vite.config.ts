import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Actions 上では、環境変数 GITHUB_REPOSITORY（例: "owner/repo"）が自動で入ります。
// プロジェクトサイトの URL は https://owner.github.io/repo/ なので、base は '/repo/' にします。
// リポジトリ名が "owner.github.io"（ユーザーサイト）の場合は '/' にします。
// → リポジトリ名を変えても、この設定は書き換えなくて済みます。
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const base = repo && !repo.endsWith('.github.io') ? `/${repo}/` : '/'

export default defineConfig({
  base,
  plugins: [vue()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})

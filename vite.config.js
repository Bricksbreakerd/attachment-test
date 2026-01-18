import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/attachment-test/', // 注意：这里必须和你的仓库名一致，前后都要有斜杠
})
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  // 部署基路径：GitHub Pages 的项目页位于 https://<user>.github.io/<repo>/ 子路径下，
  // CI 通过环境变量 VITE_BASE 注入仓库名（见 .github/workflows/ci-cd.yml）；
  // 本地开发与默认构建仍为根路径 '/'
  base: process.env.VITE_BASE || '/',
  plugins: [vue(),
     tailwindcss(), // 激活 Tailwind v4 引擎
     // Gzip 预压缩：构建结束后在产物目录里生成同名 .gz 文件，
     // 由静态服务器（nginx / CDN）按 Accept-Encoding 直接下发，省掉运行时压缩开销
     viteCompression({
       algorithm: 'gzip',        // 压缩算法（默认 gzip）
       ext: '.gz',
       threshold: 1025,          // 小于约 1KB 的文件压缩收益抵不过开销，跳过
       deleteOriginFile: false,  // 保留原文件，兼容不接受 gzip 的客户端
       verbose: true,            // 构建日志里打印每个文件的压缩前后体积
     }),
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src')
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Vite 8 底层打包器是 Rolldown，
        // 用 codeSplitting.groups 把第三方库拆成独立 chunk（取代已废弃的 manualChunks）
        codeSplitting: {
          groups: [
            // vue 全家桶单独成块：只有升级这些依赖时 hash 才会变，
            // 业务代码改动不会影响浏览器里已缓存的这份文件
            {
              name: 'vue-vendor',
              test: /node_modules[\\/](?:vue|@vue|vue-router|pinia)[\\/]/,
            },
            // 其余第三方依赖兜底放一起，避免日后引入新库时被打进业务 chunk
            {
              name: 'vendor',
              test: /node_modules/,
            },
          ],
        },
      },
    },
  },
})

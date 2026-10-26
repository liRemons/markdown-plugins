import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * demo 目录通过 vite 起本地服务,直接读取 `src/` 源码,
 * 修改源码后 HMR 立即生效;与 `npm run build` 走的 tsup 路径互不干扰。
 *
 * 联调 `remons-render-markdown` 请走标准的 npm link 流程(见 package.json scripts),
 * 不在这里做路径 alias,以免污染解析规则、影响真实集成语义。
 */
export default defineConfig({
  root: path.resolve(dirname, 'demo'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: { javascriptEnabled: true },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    // `npm run dev:build` 会把 demo 打包到 dist-demo/,便于静态部署自查
    outDir: path.resolve(dirname, 'dist-demo'),
    emptyOutDir: true,
  },
});

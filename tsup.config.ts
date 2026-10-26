import { defineConfig } from 'tsup';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const less = require('less');

// 使用 import.meta.url 推导目录，避免在原生 ESM 下 __dirname 未定义
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 自动扫描 plugins 目录生成 entry
const pluginsDir = path.join(__dirname, 'src', 'plugins');
const pluginEntries: Record<string, string> = {};
if (fs.existsSync(pluginsDir)) {
  for (const name of fs.readdirSync(pluginsDir)) {
    const indexPath = path.join(pluginsDir, name, 'index.tsx');
    if (fs.existsSync(indexPath)) {
      pluginEntries[`plugins/${name}`] = `src/plugins/${name}/index.tsx`;
    }
  }
}

export default defineConfig({
  entry: {
    // Main entry
    index: 'src/index.ts',
    // Auto-discovered plugin entries
    ...pluginEntries,
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  // 与 package.json peerDependencies + 纯运行时依赖保持一致
  // esbuild 的 external 对父包匹配会自动覆盖子路径(例如 react-dom/client、remons-calendar/style.css)
  external: [
    'react',
    'react-dom',
    '@ant-design/icons',
    'markdown-it-container',
    'remons-calendar',
    'json5',
    // remons-calendar 内部引用 antd/dayjs，作为可选 peer 保持外部，避免重复打包
    'antd',
    'dayjs',
  ],
  bundle: true,
  noExternal: [],
  css: true,
  injectStyle: false,
  outDir: 'dist',
  esbuildOptions(options) {
    options.outbase = 'src';
  },
  esbuildPlugins: [
    {
      name: 'less-plugin',
      setup(build) {
        build.onLoad({ filter: /\.less$/, namespace: 'file' }, async (args: any) => {
          const fileContent = fs.readFileSync(args.path, 'utf8');
          // esbuild onLoad args 没有 directory 字段,需要从 path 推导 dirname
          const dirname = path.dirname(args.path);
          const result = await less.render(fileContent, {
            paths: [dirname],
            filename: args.path,
          });
          return {
            contents: result.css,
            loader: 'css',
          };
        });
      },
    },
  ],
});

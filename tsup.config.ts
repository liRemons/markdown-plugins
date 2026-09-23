import { defineConfig } from 'tsup';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const less = require('less');

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
  external: ['react', 'react-dom', 'antd', '@ant-design/icons', 'markdown-it-container', 'remons-calendar'],
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
          const result = await less.render(fileContent, {
            paths: [args.directory],
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
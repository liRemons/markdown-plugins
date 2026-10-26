/**
 * 校验 package.json 的 `exports` 字段:
 * 1. 与 src/plugins 目录下的插件一一对应
 * 2. 与 dist 下真实产出的 JS/CSS 文件一致
 *
 * 之前是"重新生成并覆写 package.json",这样会带来 git dirty 状态 + 手写内容被静默覆盖的问题。
 * 现在改成校验模式,漂移时构建失败,强制维护者在 package.json 里做显式改动。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const pluginsDir = path.join(root, 'src', 'plugins');
const distDir = path.join(root, 'dist');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const errors = [];

// 1. 扫描 src/plugins 得到应有的插件集合
const expectedPlugins = [];
if (fs.existsSync(pluginsDir)) {
  for (const name of fs.readdirSync(pluginsDir)) {
    const indexPath = path.join(pluginsDir, name, 'index.tsx');
    if (fs.existsSync(indexPath)) expectedPlugins.push(name);
  }
}

const declaredSubpaths = Object.keys(pkg.exports || {}).filter(k => k.startsWith('./plugins/'));

// 2. 每个 src/plugins/<name> 都应在 exports 里出现(不带 /style.css 的那条)
for (const name of expectedPlugins) {
  const entryKey = `./plugins/${name}`;
  const styleKey = `./plugins/${name}/style.css`;
  if (!pkg.exports[entryKey]) {
    errors.push(`exports 缺失入口: ${entryKey}`);
    continue;
  }
  if (!pkg.exports[styleKey]) {
    errors.push(`exports 缺失样式: ${styleKey}`);
  }
  // 3. 校验 dist 里真的有对应文件
  const distFiles = [
    `plugins/${name}.js`,
    `plugins/${name}.cjs`,
    `plugins/${name}.d.ts`,
    `plugins/${name}.d.cts`,
    `plugins/${name}.css`,
  ];
  for (const f of distFiles) {
    const p = path.join(distDir, f);
    if (!fs.existsSync(p)) errors.push(`dist 缺失产物: dist/${f}`);
  }
}

// 4. exports 里声明了但 src 里已删除的插件,应清理
for (const key of declaredSubpaths) {
  const name = key.replace('./plugins/', '').replace(/\/style\.css$/, '');
  if (!expectedPlugins.includes(name)) {
    errors.push(`exports 存在未知插件: ${key} (src/plugins/${name} 不存在)`);
  }
}

if (errors.length) {
  console.error('❌ exports 校验未通过:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}

console.log(
  '✅ exports 校验通过,覆盖插件:',
  expectedPlugins.join(', '),
);

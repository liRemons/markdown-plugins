import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const pluginsDir = path.join(root, 'src', 'plugins');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const { exports: _currentExports, ...restPkg } = pkg;

const newExports = {
  ".": {
    "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
  },
  "./style.css": "./dist/index.css"
};

if (fs.existsSync(pluginsDir)) {
  for (const name of fs.readdirSync(pluginsDir)) {
    const indexPath = path.join(pluginsDir, name, 'index.tsx');
    if (fs.existsSync(indexPath)) {
      newExports[`./plugins/${name}`] = {
        "import": { "types": `./dist/plugins/${name}.d.ts`, "default": `./dist/plugins/${name}.js` },
        "require": { "types": `./dist/plugins/${name}.d.cts`, "default": `./dist/plugins/${name}.cjs` }
      };
      // 为每个插件添加独立的 CSS 导出
      newExports[`./plugins/${name}/style.css`] = `./dist/plugins/${name}.css`;
    }
  }
}

fs.writeFileSync(pkgPath, JSON.stringify({ ...restPkg, exports: newExports }, null, 2) + '\n', 'utf-8');
console.log('Generated exports for plugins:', Object.keys(newExports).filter(k => k.startsWith('./plugins/')));

import typescript from '@rollup/plugin-typescript';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/esm/index.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'auto',
      },
    ],
    plugins: [
      external(),
      typescript({ tsconfig: './tsconfig.json' }),
      resolve(),
      postcss({
        minimize: true,
        extract: 'styles.css',
        extensions: ['.less'],
      }),
    ],
    external: ['react', 'react-dom', 'antd', '@ant-design/icons', 'markdown-it-container'],
  },
  {
    input: 'dist/esm/index.d.ts',
    output: [{ file: 'dist/esm/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/],
  },
];

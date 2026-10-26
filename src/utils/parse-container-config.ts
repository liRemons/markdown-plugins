/**
 * 内部工具方法的 barrel,方便按语义分组的引用。
 * 实现已按角色拆分到三个文件:
 * - `parse-container-config-core.ts`: markdown 原始串 -> config 对象的解析
 * - `typed-attrs.ts`:                 config <-> DOM data-* 属性的编解码协议
 * - `react-mount.tsx`:                markdown-it block container + React 挂载
 */
export { parseContainerConfig, escapeRegExp, stripConfigBlock } from './parse-container-config-core';
export { createContainerComponent } from './react-mount';

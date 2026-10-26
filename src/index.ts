import './index.less';

import renderAmap from './plugins/render-amap';
import renderBadge from './plugins/render-badge';
import renderShareCode from './plugins/render-share-code';
import renderLinkCard from './plugins/render-link-preview-card';
import renderCalendar from './plugins/render-calendar';
import type { MarkdownItLike } from './types';

// 插件 - markdown-it container 插件
// 支持 tree-shake: 每个插件都是独立导出,注册动作在 md.use(plugin) 时才发生
// 未使用的插件在 bundle 阶段可被安全消除
export { renderAmap, renderBadge, renderShareCode, renderLinkCard, renderCalendar };

// 运行时配置(host / iconfont CDN / 白名单 / logger / 图标表)
export { configure, resetConfig } from './config';
export type { MarkdownPluginConfig, CalendarIconConfig } from './config';

// 内置的 type -> iconfont 图标 id 映射,使用方可基于它写自己的扩展
// configure({ icons: { ...DEFAULT_ICONS, myNewIcon: 'icon-xxx' } })
export { DEFAULT_ICONS } from './default-icons';

// markdown-it 实例形状,与官方 MarkdownIt 类型结构兼容
export type { MarkdownItLike } from './types';

/**
 * 复制/patch 场景需要"跳过"的 DOM 节点选择器。
 * 所有插件挂载后都会在容器上打 `data-md-persist` / `data-md-mounted` 属性,
 * 因此使用方只需一条通用选择器即可覆盖全部插件产物,不再需要枚举类名。
 *
 * 用法:
 * ```ts
 * import { excludedSelectors } from 'remons-markdown-plugins';
 * <RenderMarkdown excludedSelectors={excludedSelectors} ... />
 * ```
 */
export const excludedSelectors: string[] = [
  '[data-md-persist]',
  '[data-md-mounted]',
];

/**
 * 将所有插件一次性注册到 markdown-it 实例。
 * 用法: `md.use(registerAll)`
 */
export function registerAll(md: MarkdownItLike): void {
  renderAmap(md);
  renderBadge(md);
  renderShareCode(md);
  renderLinkCard(md);
  renderCalendar(md);
}

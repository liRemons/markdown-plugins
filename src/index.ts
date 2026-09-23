import './index.less';

import renderAmap from './plugins/render-amap';
import renderBadge from './plugins/render-badge';
import renderShareCode from './plugins/render-share-code';
import renderLinkCard from './plugins/render-link-preview-card';
import renderCalendar from './plugins/render-calendar';

// 插件 - markdown-it container 插件
// 支持 tree-shake: 每个插件都是独立导出，未使用的插件会被消除
export { renderAmap, renderBadge, renderShareCode, renderLinkCard, renderCalendar };

export const excludedSelectors = ['.badge-container', '.link-preview-card-container']

// 将所有插件注册到 markdown-it 实例中
// 用法: md.use(registerAll)
export function registerAll(md: any): void {
  renderAmap(md);
  renderBadge(md);
  renderShareCode(md);
  renderLinkCard(md);
  renderCalendar(md);
}

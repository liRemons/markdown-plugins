import './index.less';

import renderAmap from './plugins/render-amap';
import renderBadge from './plugins/render-badge';
import renderShareCode from './plugins/render-share-code';
import renderLinkCard from './plugins/render-link-preview-card';

// Plugins - markdown-it container plugins
// Tree-shakeable: each plugin is a named export, unused plugins will be eliminated
export { renderAmap, renderBadge, renderShareCode, renderLinkCard };

export const excludedSelectors = ['.badge-container', '.link-preview-card-container']

// Register all plugins to a markdown-it instance
// Usage: md.use(registerAll)
export function registerAll(md: any): void {
  renderAmap(md);
  renderBadge(md);
  renderShareCode(md);
  renderLinkCard(md);
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import RenderMarkdown from 'remons-render-markdown';
import 'remons-render-markdown/style.css';
import {
  configure,
  resetConfig,
  excludedSelectors,
  renderAmap,
  renderBadge,
  renderCalendar,
  renderLinkCard,
  renderShareCode,
} from '@/index';
import { SAMPLES, SAMPLE_KEYS } from './samples';

/**
 * 走真实集成路径:demo 里的 markdown 由 `remons-render-markdown` 渲染,
 * 本仓库的插件通过 `customRenderers` 注入进去,`excludedSelectors` 直接透传。
 * 这条链路验证的是库在下游项目里的实际工作方式,比手工 mount 更接近真相。
 */
const PLUGIN_LIST = [renderAmap, renderBadge, renderCalendar, renderLinkCard, renderShareCode];

/**
 * 观察 RenderMarkdown 内部实际渲染出的 DOM,方便在 demo 底部打印挂载统计。
 */
function useMountStats(hostRef: React.RefObject<HTMLElement>) {
  const [stats, setStats] = useState({ pending: 0, mounted: 0 });
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const refresh = () => {
      setStats({
        pending: host.querySelectorAll('[data-md-persist]:not([data-md-mounted])').length,
        mounted: host.querySelectorAll('[data-md-mounted]').length,
      });
    };
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(host, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [hostRef]);
  return stats;
}

const App: React.FC = () => {
  const [active, setActive] = useState<string>(SAMPLE_KEYS[0]);
  const [input, setInput] = useState<string>(SAMPLES[SAMPLE_KEYS[0]]);
  // nonce 拼进 RenderMarkdown 的 key,configure 变更后 +1 强制整体重挂载,
  // 让被 excludedSelectors 保护的已挂载节点重新读取最新配置。
  const [nonce, setNonce] = useState(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const stats = useMountStats(hostRef);

  const selectSample = (key: string) => {
    setActive(key);
    setInput(SAMPLES[key]);
  };

  // 演示 configure API:运行时追加自定义图标。
  // 自动切到 customIcon 样例(里面有一个 type:'wechat' 的 badge),效果才看得见。
  const addWechatIcon = () => {
    configure({ icons: { wechat: 'icon-sharecode' } });
    setActive('customIcon');
    setInput(SAMPLES['customIcon']);
    setNonce(n => n + 1);
  };

  // 演示全局级日历图标配置:configure({ calendarIcons }) 一次注入,处处生效。
  // 自动切到 calendar 样例(未写容器级 icons),这样能看到全局表接管的效果。
  const applyGlobalCalendarIcons = () => {
    configure({
      calendarIcons: [
        { key: 'transport', type: 'travelMethod', tip: '出发' },
        { key: 'hotel', type: 'hotel', tip: '睡点' },
        { key: 'attraction', emoji: '⭐', tip: '打卡' },
        { key: 'food', emoji: '🍜', tip: '觅食' },
      ],
    });
    setActive('calendar');
    setInput(SAMPLES['calendar']);
    setNonce(n => n + 1);
  };

  // 恢复库默认配置(ogpHost / 主机白名单 / iconfontScriptUrl / icons / calendarIcons / logger)。
  const resetEverything = () => {
    resetConfig();
    setNonce(n => n + 1);
  };

  // 记住 customRenderers 数组的引用,RenderMarkdown 内部按初始化语义读取
  const customRenderers = useMemo(() => PLUGIN_LIST, []);

  return (
    <div className="app">
      <header className="topbar">
        <h1>remons-markdown-plugins · Demo</h1>
        <nav className="tabs">
          {SAMPLE_KEYS.map(key => (
            <button
              key={key}
              type="button"
              className={key === active ? 'tab active' : 'tab'}
              onClick={() => selectSample(key)}
            >
              {key}
            </button>
          ))}
        </nav>
        <div className="actions">
          <button type="button" onClick={addWechatIcon}>追加 wechat 图标</button>
          <button type="button" onClick={applyGlobalCalendarIcons}>设置全局日历图标</button>
          <button type="button" onClick={resetEverything}>恢复默认 configure</button>
        </div>
      </header>

      <main className="content">
        <section className="editor">
          <div className="editor-label">Markdown 源</div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
          />
        </section>
        <section className="preview">
          <div className="editor-label">
            渲染结果 · <span title="未挂载的占位符">pending: {stats.pending}</span> ·{' '}
            <span title="已挂载的 React 组件">mounted: {stats.mounted}</span>
          </div>
          <div ref={hostRef} className="md-content">
            <RenderMarkdown
              key={`${active}#${nonce}`}
              content={input}
              customRenderers={customRenderers}
              excludedSelectors={excludedSelectors}
            />
          </div>
        </section>
      </main>

      <footer className="tips">
        <p>
          提示:demo 里的 markdown 源可以直接改;插件通过 <code>customRenderers</code> 注入到
          <code>remons-render-markdown</code>,与真实集成完全一致。
          未接入 iconfont 时,图标区域会展示为空白 SVG,不影响其他功能验证。
        </p>
      </footer>
    </div>
  );
};

export default App;

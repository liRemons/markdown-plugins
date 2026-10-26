import { DEFAULT_ICONS } from './default-icons';

/**
 * 全局运行时配置。
 * 使用方可以在应用启动时调用 `configure({...})` 覆盖默认值,
 * 之后加载的插件、OGP 请求、图标脚本、日志输出都会读取这里的最新值。
 *
 * 之所以做成"运行时可变更"而不是"构造参数",是因为 markdown-it 插件通常在渲染阶段
 * 就被 `md.use(...)` 注册,而 configure 更适合在应用入口统一注入。
 */

/** 日历插件的图标配置项:type(本库 iconfont) 与 emoji(直接透传) 二选一 */
export interface CalendarIconConfig {
  /** 唯一 key,schedules[].icon 通过它引用图标 */
  key: string;
  /** 展示提示文案(缺省用 key) */
  tip?: string;
  /** 本库 iconfont 图标 type,经 typeToIcon 解析成图标节点 */
  type?: string;
  /** emoji / 纯文本图标,直接透传(优先级低于 type) */
  emoji?: string;
}

export interface MarkdownPluginConfig {
  /** OGP 抓取服务基址,例如 `https://remons.cn:3008` */
  ogpHost?: string;
  /** 相对 URL 在没有站点环境时的兜底远程主机 */
  defaultRemoteHost?: string;
  /** 判断"是否运行在受信任站点"的 hostname 白名单 */
  trustedHostnames?: string[];
  /** iconfont 脚本地址(传给 @ant-design/icons 的 createFromIconfontCN) */
  iconfontScriptUrl?: string;
  /**
   * type -> iconfont 图标 id 的映射表。
   * 默认包含库内置的一套(见 `default-icons.ts`),iconfont 命名不受约定约束,
   * 因此新增图标一律通过 configure 在这里登记,而不需要改库源码。
   * 写入时采用浅合并:同名 key 覆盖,不同名 key 追加。
   */
  icons?: Record<string, string>;
  /**
   * 日历插件日程可用图标表(全局级),按 `configure > 容器级 icons` 优先级生效。
   * 缺省为空数组,此时日历插件回退到自身内置的默认图标表。
   * 容器 config 里的 `icons` 会覆盖这一全局表。
   */
  calendarIcons?: CalendarIconConfig[];
  /**
   * 内部告警/错误日志出口,默认 `console`。
   * 传入自定义实现可以接管库内部所有 warn/error(比如接入 Sentry)。
   */
  logger?: {
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  };
}

const DEFAULT: Required<MarkdownPluginConfig> = {
  ogpHost: 'https://remons.cn:3008',
  defaultRemoteHost: 'https://remons.cn',
  trustedHostnames: ['remons.cn', 'lucky.work'],
  iconfontScriptUrl: 'https://at.alicdn.com/t/c/font_5232281_g68qrbd1z2.js',
  icons: { ...DEFAULT_ICONS },
  calendarIcons: [],
  logger: { warn: console.warn.bind(console), error: console.error.bind(console) },
};

const state: Required<MarkdownPluginConfig> = { ...DEFAULT };

/**
 * 覆盖运行时配置。多次调用会做浅合并,后写入的字段胜出。
 * @example
 * ```ts
 * import { configure } from 'remons-markdown-plugins';
 * configure({
 *   ogpHost: 'https://your-ogp.example.com',
 *   iconfontScriptUrl: '//at.alicdn.com/t/c/font_xxx.js',
 * });
 * ```
 */
export function configure(next: MarkdownPluginConfig): void {
  if (next.ogpHost !== undefined) state.ogpHost = next.ogpHost;
  if (next.defaultRemoteHost !== undefined) state.defaultRemoteHost = next.defaultRemoteHost;
  if (next.trustedHostnames !== undefined) state.trustedHostnames = [...next.trustedHostnames];
  if (next.iconfontScriptUrl !== undefined) state.iconfontScriptUrl = next.iconfontScriptUrl;
  // icons 采用浅合并,同名 key 以用户传入的为准,方便覆盖内置映射或追加新图标
  if (next.icons !== undefined) state.icons = { ...state.icons, ...next.icons };
  // calendarIcons 整体替换(图标表是列表,不做浅合并)
  if (next.calendarIcons !== undefined) state.calendarIcons = [...next.calendarIcons];
  if (next.logger !== undefined) state.logger = next.logger;
}

/** 读取当前配置(供库内部使用) */
export function getConfig(): Readonly<Required<MarkdownPluginConfig>> {
  return state;
}

/** 恢复默认配置,主要给测试/热更新使用 */
export function resetConfig(): void {
  Object.assign(state, DEFAULT);
  state.trustedHostnames = [...DEFAULT.trustedHostnames];
  state.icons = { ...DEFAULT_ICONS };
  state.calendarIcons = [];
}

/** 内部日志包装,统一走可配置的 logger */
export const log = {
  warn: (...args: unknown[]) => state.logger.warn(...args),
  error: (...args: unknown[]) => state.logger.error(...args),
};

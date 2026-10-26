# remons-markdown-plugins

一组基于 markdown-it 的容器插件,支持在 Markdown 中渲染 React 组件。支持块级容器和行级容器两种语法。

> **v2 破坏性变更提示**:相对 v1 有若干不兼容改动,升级前请阅读 [Migration](#migration-v1--v2) 章节。

## 安装

```bash
npm install remons-markdown-plugins
```

## 依赖

以下 peer 依赖需要自行安装:

- React >= 18.0.0
- React DOM >= 18.0.0
- @ant-design/icons >= 5.0.0
- markdown-it >= 13.0.0(仅在渲染阶段用到)

v2 起 **不再依赖 `antd`** —— 内部的 loading 与 toast 已改为库内实现,只需安装 `@ant-design/icons`(图标)。

其他运行时依赖(`markdown-it-container`、`json5`、`remons-calendar`)已内置。

## 使用

### 引入样式

```ts
import 'remons-markdown-plugins/style.css';
```

### 可选:配置运行时参数

```ts
import { configure } from 'remons-markdown-plugins';

configure({
  // OGP 抓取服务地址
  ogpHost: 'https://your-ogp.example.com',
  // 相对链接的兑底远程主机
  defaultRemoteHost: 'https://your-site.com',
  // 判定"运行在自家站点"的 hostname 白名单
  trustedHostnames: ['your-site.com', 'admin.your-site.com'],
  // iconfont CDN
  iconfontScriptUrl: 'https://at.alicdn.com/t/c/font_xxx.js',
  // type -> iconfont 图标 id 的映射表(浅合并追加/覆盖内置项)
  icons: {
    wechat: 'icon-wechat-2026',
    // 也可以重写内置项
    hotel: 'icon-hotel-new',
  },
  // 内部日志出口,默认 console
  logger: { warn: myLogger.warn, error: myLogger.error },
});
```

### 注册插件

#### 方式一:注册所有插件

```ts
import { registerAll } from 'remons-markdown-plugins';

md.use(registerAll);
```

#### 方式二:按需引入(支持 tree-shake)

```ts
import { renderAmap, renderBadge } from 'remons-markdown-plugins';

md.use(renderBadge);
md.use(renderAmap);
```

> v2 起 `createContainerComponent` 不再在模块求值时安装 MutationObserver,注册动作发生在 `md.use(plugin)` 时。未 `use` 的插件在打包阶段可被安全 tree-shake。

#### 方式三:按子路径引入(只打包单个插件)

```ts
import renderBadge from 'remons-markdown-plugins/plugins/render-badge';
import 'remons-markdown-plugins/plugins/render-badge/style.css';

md.use(renderBadge);
```

可用子路径:

- `remons-markdown-plugins/plugins/render-amap`
- `remons-markdown-plugins/plugins/render-badge`
- `remons-markdown-plugins/plugins/render-calendar`
- `remons-markdown-plugins/plugins/render-share-code`
- `remons-markdown-plugins/plugins/render-link-preview-card`

每个子路径都提供配套的 `style.css`。

### 复制 / Patch 排除节点

```ts
import { excludedSelectors } from 'remons-markdown-plugins';

<RenderMarkdown excludedSelectors={excludedSelectors} ... />
```

`excludedSelectors` 是**通用的属性选择器**(`[data-md-persist]`、`[data-md-mounted]`),所有插件产物都自带这些标记,不再需要按类名逐个枚举。

## 语法说明

### 块级容器

```markdown
:::tagName{config}
:::

:::tagName
{
  key: 'value'
}
:::
```

### 行级容器

```markdown
:::tagName{config}:::
```

### 配置格式

- 按 JSON5 解析,支持单引号、无引号键名、注释等
- 行级容器的配置需写在同一行内(暂不支持嵌套大括号)
- 所有容器均支持 `class` 属性,为渲染节点追加自定义类名
- **v2 起 props 支持类型透传**:数字/布尔/数组/对象 会原样传给组件,不再需要"JSON 字符串里再套 JSON 字符串"

底层协议:非字符串值会被 `JSON.stringify` 后写入 `data-xxx`,同时把键名记录在 `data-md-typed` 上;挂载时按 `data-md-typed` 决定哪些属性需要 `JSON.parse` 还原。

### 图标扩展

iconfont 里的图标 id 由设计师自由命名(例如 `redbook` 对应的是 `icon-xiaohongshu`),
无法靠命名规则推导，因此本库采用**显式映射表 + 运行时扩展**：

- 内置默认表参见 [`src/default-icons.ts`](./src/default-icons.ts)。使用方 **无需修改库源码** 就能新增图标。
- 新增图标时，在应用入口 `configure({ icons: { ...DEFAULT_ICONS, myType: 'icon-xxx' } })`，
  或依赖默认浅合并直接 `configure({ icons: { myType: 'icon-xxx' } })`。
- 未登记的 `type`，`typeToIcon` 返回 `''`（与历史行为一致），可参与
  `x || fallback` 兑底。

```ts
import { configure, DEFAULT_ICONS } from 'remons-markdown-plugins';

// 只追加新项
configure({ icons: { wechat: 'icon-wechat-2026' } });

// 或基于内置表重建一份自己的表
configure({
  icons: {
    ...DEFAULT_ICONS,
    hotel: 'icon-hotel-v2',
  },
});
```

## 插件说明

### 1. 地图导航 (amap)

```markdown
:::amap{url: "https://uri.amap.com/marker?position=121.47,31.21&name=外滩", label: "外滩"}
:::
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | string | 是 | 地图 URL |
| label | string | 是 | 地址描述 |

### 2. 徽标 (badge)

```markdown
:::badge{content: "2小时12分", type: "duration"}::: :::badge{content: "123KM", type: "distance"}:::
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 徽标内容 |
| type | string | 否 | 图标类型:`duration` / `distance` / `routePlanning` / `parking` / `reservation` / `highlightAttraction` / `travelMethod` / `itinerary` / `hotel` / `calendar` / `time` / `price` / `redbook` / `website` / `address` / `amap` / `ctrip` / `meituan` / `sharecode` |
| block | `"true"` \| `"false"` | 否 | 是否块级显示 |
| url | string | 否 | 点击跳转链接(自动 `noopener`) |

### 3. 分享口令 (shareCode)

```markdown
:::shareCode{content: "#携程旅行#... https://m.ctrip.com/xxx", type: "ctrip"}
:::
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 需包含 http/https 链接才会渲染 |
| type | string | 是 | 平台图标类型,与 `badge` 共用 `icons` 表(`redbook` / `ctrip` / `meituan` / `wechat` …);未登记的 type 会回退到 `sharecode` 图标 |

### 4. 链接预览卡片 (linkCard)

```markdown
:::linkCard{content: "https://remons.cn"}:::
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 预览的 URL |

### 5. 日历 (calendar)

数据直接透传给 [`remons-calendar`](https://www.npmjs.com/package/remons-calendar) 的 `Calendar` 组件，字段与其 `TodoRange` / `DailySchedule` 类型对齐：

```markdown
:::calendar
{
  todos: [
    { id: 't1', name: '北京行程', start: '2026-10-01', end: '2026-10-03', color: '#1677ff' }
  ],
  schedules: [
    { id: 's1', icon: 'hotel', date: '2026-10-01', name: '酒店办理入住', startTime: '10:30' },
    { id: 's2', icon: 'attraction', date: '2026-10-02', name: '故宫深度游', startTime: '14:00', endTime: '17:00' }
  ]
}
:::
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| todos | `TodoRange[]` | 否 | 待办横条（日期范围）：`id` / `name` / `start` / `end` / `color` 必填，`startTime` / `endTime`(`HH:mm`) 可选 |
| schedules | `DailySchedule[]` | 否 | 单日日程：`id` / `icon` / `date` / `name` 必填，`startTime` / `endTime`(`HH:mm`) 可选 |
| icons | `IconConfig[]` | 否 | 自定义图标表，缺省用内置的 `hotel` / `attraction` / `transport` / `food`。每项：`key`（必填）、`tip`、`type`（本库 iconfont 图标）、`emoji`（直接透传文本/emoji） |

自定义图标示例（`type` 走 iconfont、`emoji` 直接用字符）：

```markdown
:::calendar
{
  icons: [
    { key: 'stay', type: 'hotel', tip: '住宿' },
    { key: 'food', emoji: '🍜', tip: '美食' }
  ],
  schedules: [
    { id: 's1', icon: 'stay', date: '2026-10-01', name: '酒店入住' },
    { id: 's2', icon: 'food', date: '2026-10-02', name: 'Local小吃' }
  ]
}
:::
```

> `schedules[].icon` 是图标 **key**（非 emoji），`remons-calendar` 会按 key 在图标表里查找对应图标与 tip；未命中的 key 不渲染图标。
> `isPreview` 写死为 `true`，日历为只读展示，禁用新增/编辑。

**图标表三级优先级**（从高到低）：

1. **容器级 `icons`**：写在具体日历的 config 里，只影响当前日历，适合临时换套图标。
2. **全局级 `configure({ calendarIcons })`**：应用入口统一注入，全站日历共享，一次配置处处生效（推荐主路径，与库的 `iconfontScriptUrl` / `icons` 同为全局图标关注点）。
3. **内置默认**：`hotel` / `attraction` / `transport` / `food`，零配置开箱即用。

```ts
import { configure } from 'remons-markdown-plugins';

// 全局自定义图标表（容器级 icons 会覆盖它；两者都未提供则用内置默认）
configure({
  calendarIcons: [
    { key: 'hotel', type: 'hotel', tip: '住宿' },
    { key: 'food', emoji: '🍜', tip: '美食' },
  ],
});
```

> **兼容**：v1 的 `value: '{...}'` 字符串包装（整段 JSON 转义后塞进 `value`）仍被自动识别——缺顶层 `todos` / `schedules` 时会回退到 `JSON.parse(value)`。存量内容无需改写；**新内容推荐直接把 `todos` / `schedules` 以数组字面量写在顶层**，不必再双重转义。

## Migration: v1 → v2

| 主题 | v1 行为 | v2 行为 | 迁移动作 |
|---|---|---|---|
| peer 依赖 | 需要 `antd` | 不再需要 `antd`,只保留 `@ant-design/icons` | 若无其它用法可从项目移除 `antd` |
| `excludedSelectors` | 枚举 `.badge-container`、`.link-preview-card-container` 等类名 | 通用 `[data-md-persist]` + `[data-md-mounted]` | 若你曾按类名手写排除,请改为属性选择器 |
| `calendar` 插件的 `value` prop | 传字符串(内部再 `JSON.parse`) | 直接传 `todos` / `schedules` 数组 | 更新 markdown 里的 config |
| 块级容器 DOM 结构 | `<div ...><div class="render-md-plugin-raw" style="display:none">...` | `<div ...><template class="render-md-plugin-raw">...` | 若你曾按 `div[style*="display:none"]` 定位过,请改为 `template` |
| MutationObserver 时机 | 每个插件 import 时装一个 | 全库共享单个,由 `md.use()` 触发 | 若从未 `md.use()` 就期望插件挂载(不推荐用法),需在初始化时显式 `md.use(registerAll)` |
| `configure` API | 无 | 新增,可覆盖 `ogpHost` / `iconfontScriptUrl` 等 | 想换 OGP 服务或 CDN 时使用 |
| `IsPC` | 首字母大写 | 更名为 `isPC`,`IsPC` 保留为 deprecated 别名 | 无感迁移,建议改用小写名 |
| 类型 | `md: any` | 新增 `MarkdownItLike` 类型,内部基本收敛 | 无破坏 |

## 开发

```bash
npm install
npm run typecheck    # 类型检查
npm run lint         # ESLint
npm run format       # Prettier 全量格式化
npm run build        # tsup + 校验 exports
npm run build:watch  # 监听构建
```

### Demo

`demo/` 目录提供一份基于 [Vite](https://vitejs.dev) 的本地预览页，覆盖 5 个插件、`configure` API、自定义图标等场景，左侧编辑 markdown、右侧实时预览。

```bash
npm run dev            # http://localhost:5173
npm run dev:build      # 打包到 dist-demo/,用于静态部署自查
npm run dev:preview    # 预览 dev:build 产物
```

demo 直接引用 `src/`,库代码修改会触发 HMR。样式会同时引入 `src/index.less` 和 `remons-render-markdown/style.css`。

### 与 remons-render-markdown 本地联调

本库的真实下游是 [`remons-render-markdown`](https://www.npmjs.com/package/remons-render-markdown),demo 里的 `<RenderMarkdown>` 就是它。
默认从 registry 拉取发布版;需要联调本地仓库时走业界标准的 `npm link`:

```bash
# 一次性:把兄弟目录的 render-markdown 链过来(会写 node_modules 里的 junction)
npm run link:rm

# render-markdown 修改后需重新构建它自己的 dist
npm run link:rm:build

# 联调结束,恢复成 registry 安装版本
npm run unlink:rm
```

> 反方向联调(在 render-markdown 项目里链本库的 dist):先在本仓库 `npm link`,再到 render-markdown 项目 `npm link remons-markdown-plugins`。

## License

MIT

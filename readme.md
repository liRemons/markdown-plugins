# remons-markdown-plugins

一组基于 markdown-it 的容器插件，支持在 Markdown 中渲染 React 组件。支持块级容器和行级容器两种语法。

## 安装

```bash
npm install remons-markdown-plugins
```

## 依赖

以下 peer 依赖需要自行安装：

- React >= 18.0.0
- React DOM >= 18.0.0
- Ant Design >= 5.0.0
- @ant-design/icons >= 5.0.0
- markdown-it（用于创建 md 实例）

其他依赖（markdown-it-container、json5 等）已内置，随包自动安装。

## 使用

### 引入样式

```css
import 'remons-markdown-plugins/style.css';
```

### 注册插件

#### 方式一：注册所有插件

```typescript
import { registerAll } from 'remons-markdown-plugins';

md.use(registerAll);
```

#### 方式二：单独使用插件（支持 tree-shake）

```typescript
import { renderAmap, renderBadge, renderShareCode, renderLinkCard, renderCalendar } from 'remons-markdown-plugins';

md.use(renderAmap);
md.use(renderBadge);
md.use(renderShareCode);
md.use(renderLinkCard);
md.use(renderCalendar);
```

#### 方式三：按子路径引入（只打包单个插件）

每个插件都有独立的子路径导出，可以只引入需要的插件：

```typescript
import renderBadge from 'remons-markdown-plugins/plugins/render-badge';
import 'remons-markdown-plugins/plugins/render-badge/style.css';

md.use(renderBadge);
```

可用子路径：

- `remons-markdown-plugins/plugins/render-amap`
- `remons-markdown-plugins/plugins/render-badge`
- `remons-markdown-plugins/plugins/render-calendar`
- `remons-markdown-plugins/plugins/render-share-code`
- `remons-markdown-plugins/plugins/render-link-preview-card`

各子路径均提供对应的 `style.css`（如 `remons-markdown-plugins/plugins/render-badge/style.css`）。

### 其他导出

```typescript
import { excludedSelectors } from 'remons-markdown-plugins';
```

- `excludedSelectors`：插件渲染容器节点的选择器列表（`.badge-container`、`.link-preview-card-container`）。配合 `remons-render-markdown` 使用时，传入 `RenderMarkdown` 的 `excludedSelectors` 属性，可在复制 Markdown 内容时排除这些容器的节点。

## 插件说明

### 1. 地图导航 (amap)

在 Markdown 中插入高德地图导航卡片，显示地址并提供复制地址和打开导航的操作。

**块级语法：**

```markdown
:::amap{url: "https://uri.amap.com/marker?position=121.473701,31.215149&name=外滩", label: "外滩"}
:::
```

**行级语法：**

```markdown
:::amap{url: "https://uri.amap.com/marker?position=121.473701,31.215149&name=外滩", label: "外滩"}:::
```

**属性：**

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | string | 是 | 地图 URL |
| label | string | 是 | 地址描述 |

---

### 2. 徽标 (badge)

在 Markdown 中渲染各种类型的徽标组件，支持时长、距离、路线、停车等类型。

**块级语法：**

```markdown
:::badge{content: "2小时12分", type: "duration"}
:::
```

**行级语法：**

```markdown
:::badge{content: "2小时12分", type: "duration"}:::
```

**支持多个徽标同行显示：**

```markdown
:::badge{content: "2小时12分", type: "duration"}::: :::badge{content: "123KM", type: "distance"}::: :::badge{content: "洛阳-运城", type: "routePlanning"}:::
```

**属性：**

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 徽标显示内容 |
| type | string | 否 | 徽标图标类型，支持 `duration`、`distance`、`routePlanning`、`parking`、`reservation`、`highlightAttraction`、`travelMethod`、`itinerary`、`hotel`、`calendar`、`time`、`price`、`redbook`、`website`、`address`、`amap`、`ctrip`、`meituan`、`sharecode` |
| block | string | 否 | 是否块级显示，`"true"` 为块级 |
| url | string | 否 | 点击跳转链接（新标签页打开） |

---

### 3. 分享口令 (shareCode)

渲染分享链接卡片，支持携程、美团等平台的分享口令解析。

**块级语法：**

```markdown
:::shareCode{content: "#携程旅行#分享酒店：...", type: "ctrip"}
:::
```

**行级语法：**

```markdown
:::shareCode{content: "#携程旅行#分享酒店：...", type: "ctrip"}:::
```

> 注意：`content` 中必须包含 http/https 链接才会渲染卡片，否则不渲染。若包含链接，卡片会获取 OGP 信息展示站点信息，并支持复制口令、打开链接。

**属性：**

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 分享口令内容（需包含 http/https 链接） |
| type | string | 否 | 分享类型，如 `ctrip`、`meituan`、`redbook` 等，用于匹配图标 |

---

### 4. 链接预览卡片 (linkCard)

根据 URL 自动获取 OGP 信息，渲染链接预览卡片。

**块级语法：**

```markdown
:::linkCard{content: "https://remons.cn"}
:::
```

**行级语法：**

```markdown
:::linkCard{content: "https://remons.cn"}:::
```

**属性：**

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 预览的 URL 地址 |

---

### 5. 日历 (calendar)

在 Markdown 中渲染日历组件（基于 `remons-calendar`），以预览模式展示待办（todos）与日程（schedules）。

**块级语法：**

```markdown
:::calendar
{
  value: '{"todos":[], "schedules":[]}'
}
:::
```

> 注意：`value` 为 JSON 字符串（内部再 `JSON.parse`），建议用块级语法书写；`todos`/`schedules` 的具体结构参考 `remons-calendar` 的类型定义。

**属性：**

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | string | 是 | JSON 字符串，解析后包含 `todos`（待办数组）与 `schedules`（日程数组） |

## 语法说明

本插件支持两种容器语法：

### 块级容器

块级容器需要独立的开始标记和结束标记：

```markdown
:::tagName{config}
:::
```

### 行级容器

行级容器在同一个标记内完成，可以与其他内容同行显示：

```markdown
:::tagName{config}:::
```

### 配置格式

- 配置按 JSON5 解析，支持单引号、无引号键名等 JSON5 语法
- 行级容器的配置需写在同一行内
- 所有容器均支持 `class` 属性，为渲染节点追加自定义类名
- 块级容器的配置也可以写在容器内部，支持多行：

```markdown
:::amap
{
  url: 'https://uri.amap.com/marker?position=121.473701,31.215149&name=外滩',
  label: '外滩'
}
:::
```

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 监听构建
npm run build:watch
```

## License

MIT
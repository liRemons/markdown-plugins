# remons-markdown-plugins

一组基于 markdown-it 的容器插件，支持在 Markdown 中渲染 React 组件。支持块级容器和行级容器两种语法。

## 安装

```bash
npm install remons-markdown-plugins
```

## 依赖

- React >= 18.0.0
- React DOM >= 18.0.0
- Ant Design >= 5.0.0
- @ant-design/icons >= 5.0.0
- markdown-it-container >= 2.0.0

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
import { renderAmap, renderBadge, renderShareCode, renderLinkCard } from 'remons-markdown-plugins';

md.use(renderAmap);
md.use(renderBadge);
md.use(renderShareCode);
md.use(renderLinkCard);
```

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
| type | string | 否 | 徽标类型，如 `duration`, `distance`, `routePlanning`, `parking` 等 |
| block | string | 否 | 是否块级显示，`"true"` 为块级 |
| url | string | 否 | 点击跳转链接 |

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

**属性：**

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 分享口令内容 |
| type | string | 是 | 分享类型，如 `ctrip`, `meituan` 等 |

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
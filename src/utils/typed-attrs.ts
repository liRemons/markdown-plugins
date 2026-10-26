/**
 * 容器 config -> DOM data-* 属性的类型化协议。
 *
 * 之前所有 props 都被强制转成字符串,导致复杂数据(数组/对象)无法直接透传,
 * 使用者不得不写"字符串里再嵌 JSON 字符串"的双重转义。
 *
 * 现在的方案:
 * - 字符串:原样写入 `data-{key}="escaped string"`
 * - 数字/布尔/null/对象/数组:`JSON.stringify` 后写入,并把 key 追加到 `data-md-typed` 属性
 * - 挂载时读取 `data-md-typed` 决定哪些 key 需要 `JSON.parse` 还原成原类型
 *
 * 这样既能带类型透传,也不会因为字符串本身形似 JSON 而被误解析。
 */

const TYPED_ATTR = 'data-md-typed';

/** 是否是可以在 HTML 属性里安全透传的 primitive */
function isPlainString(v: unknown): v is string {
  return typeof v === 'string';
}

/**
 * 把 config 对象转成 data-* 属性字符串。
 * @param config JSON5.parse 之后的配置对象
 * @param escapeHtml markdown-it 的 HTML 转义函数
 */
export function encodeConfigToDataAttrs(
  config: Record<string, unknown>,
  escapeHtml: (str: string) => string,
): string {
  const typedKeys: string[] = [];
  const parts: string[] = [];

  for (const [key, val] of Object.entries(config)) {
    let raw: string;
    if (isPlainString(val)) {
      raw = val;
    } else if (val === undefined) {
      raw = '';
    } else {
      try {
        raw = JSON.stringify(val);
      } catch {
        raw = String(val);
      }
      typedKeys.push(key);
    }
    parts.push(`data-${key}="${escapeHtml(raw)}"`);
  }

  if (typedKeys.length > 0) {
    parts.push(`${TYPED_ATTR}="${escapeHtml(typedKeys.join(','))}"`);
  }
  return parts.join(' ');
}

/**
 * 从占位符元素读取 data-* 属性,还原成 React 组件的 props。
 * 与 encodeConfigToDataAttrs 对称:被标记的 key 会 JSON.parse 回原类型,其他保持字符串。
 */
export function decodeDataAttrsToProps(el: HTMLElement): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const typedKeySet = new Set<string>();

  // 预扫一次 `data-md-typed`: encode 时它排在所有 data-* 之后,
  // 必须先把 typed key 收集齐,否则 data-todos/data-schedules 会被当成字符串解码,
  // 导致数组/对象丢失原型方法(如 "xxx".forEach is not a function)。
  const typedRaw = el.getAttribute(TYPED_ATTR);
  if (typedRaw) {
    typedRaw.split(',').forEach(k => {
      const t = k.trim();
      if (t) typedKeySet.add(t);
    });
  }

  for (const attr of el.attributes) {
    if (attr.name === TYPED_ATTR) continue;
    if (!attr.name.startsWith('data-')) continue;
    // 跳过 placeholder / 生命周期协议属性
    if (attr.name.endsWith('-placeholder')) continue;
    if (attr.name === 'data-md-persist' || attr.name === 'data-md-key') continue;

    const key = attr.name.slice(5);
    props[key] = typedKeySet.has(key) ? safeParse(attr.value) : attr.value;
  }
  return props;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * 从 DOM 中读取原始内容(mount 兜底)。
 * - 若块级容器把内联配置放在隐藏的 <template> 里,template 的渲染内容
 *   存在 `.content` DocumentFragment 中,不能直接用 el.textContent 拿到
 * - 行级 / 无 template 场景,回退到 el.textContent
 */
export function readRawInnerContent(el: HTMLElement): string {
  const tpl = el.querySelector('template');
  if (tpl) {
    const frag = (tpl as HTMLTemplateElement).content;
    return frag?.textContent?.trim() ?? '';
  }
  return el.textContent?.trim() ?? '';
}

/** 供外部识别的通用节点标记,复制/patch 等场景可以按此筛选 */
export const MD_PERSIST_ATTR = 'data-md-persist';
export const MD_KEY_ATTR = 'data-md-key';
/** 所有插件挂载后的节点都会带这个标记,是跨插件通用的"React 渲染节点"识别方式 */
export const MD_MOUNTED_ATTR = 'data-md-mounted';

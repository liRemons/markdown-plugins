/**
 * 内置 type -> iconfont 图标 id 的默认映射表。
 *
 * 之所以做成显式表而不是"按命名规则推导":iconfont 上的图标 id 由设计师在
 * iconfont 平台上自由命名(例如 `redbook` 对应的是 `icon-xiaohongshu`),
 * 无法约定 `icon-{type.toLowerCase()}` 之类的转换规则。
 *
 * 使用方通过 `configure({ icons: { ... } })` 可以:
 * - 追加自定义映射(浅合并,不影响已有条目)
 * - 覆盖内置条目(同名 key 后者胜出)
 */
export const DEFAULT_ICONS: Record<string, string> = {
  amap: 'icon-amap',
  redbook: 'icon-xiaohongshu',
  price: 'icon-price',
  time: 'icon-time',
  address: 'icon-address',
  ctrip: 'icon-ctrip',
  meituan: 'icon-meituan',
  sharecode: 'icon-sharecode',
  distance: 'icon-distance',
  duration: 'icon-duration',
  routePlanning: 'icon-routeplanning',
  reservation: 'icon-reservation',
  parking: 'icon-parking',
  highlightAttraction: 'icon-highlightattraction',
  travelMethod: 'icon-travelmethod',
  website: 'icon-website',
  itinerary: 'icon-itinerary',
  calendar: 'icon-calendar',
  hotel: 'icon-hotel',
};

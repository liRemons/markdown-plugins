/**
 * 每个插件的 markdown 样例,直接对应 README 里的语法。
 *
 * 全部使用模板字符串:markdown 本身就是多行文本,直接用反引号写最贴近
 * 真实文档;想加代码围栏或 `${` 记得转义 (`\`` / `\${`)。
 * 用 `.trim()` 去掉模板首尾的换行,让预览区从第一行开始。
 */
export const SAMPLES: Record<string, string> = {
  badge: /*html*/ `
:::badge
{ type: 'redbook', name: '小红书', value: '99.9万' }
:::

:::badge
{ type: 'price', name: '门票', value: '¥350' }
:::

:::badge
{ type: 'hotel', name: '住宿', value: '3 晚' }
:::
`.trim(),

  amap: /*html*/ `
:::amap
{ lng: '116.397428', lat: '39.90923', name: '故宫博物院', address: '北京市东城区景山前街 4 号' }
:::

:::amap
{ lng: '121.4737', lat: '31.2304', name: '外滩', address: '上海市黄浦区中山东一路' }
:::
`.trim(),

  calendar: /*html*/ `
:::calendar
{
  todos: [
    { id: 't1', name: '北京行程', start: '2026-10-01', end: '2026-10-03', color: '#1677ff' }
  ],
  schedules: [
    { id: 's1', icon: 'transport', date: '2026-10-01', name: '抵达北京南站', startTime: '09:00' },
    { id: 's2', icon: 'hotel', date: '2026-10-01', name: '酒店办理入住', startTime: '10:30' },
    { id: 's3', icon: 'attraction', date: '2026-10-02', name: '故宫深度游', startTime: '14:00', endTime: '17:00' }
  ]
}
:::
`.trim(),

  // v1 旧写法:整段 JSON 字符串塞进 `value`，验证向后兼容。
  calendarLegacy: /*html*/ `
:::calendar
{ value: '{"todos":[{"id":"t1","name":"洛阳","start":"2026-09-27","end":"2026-09-30","color":"#1677ff"}],"schedules":[{"id":"s1","icon":"hotel","date":"2026-09-27","name":"洛阳"}]}' }
:::

> 上方为 v1 存量格式（value 字符串包装），新版仍会自动 JSON.parse 兼容；新内容请用顶层数组写法。
`.trim(),

  // 外部传入自定义图标表:type 走 iconfont，emoji 直接当文本图标。
  calendarCustomIcon: /*html*/ `
:::calendar
{
  icons: [
    { key: 'stay', type: 'hotel', tip: '住宿' },
    { key: 'fun', emoji: '🎢', tip: '玩乐' }
  ],
  todos: [
    { id: 't1', name: '上海行程', start: '2026-10-01', end: '2026-10-02', color: '#fa8c16' }
  ],
  schedules: [
    { id: 's1', icon: 'stay', date: '2026-10-01', name: '外滩酒店入住', startTime: '14:00' },
    { id: 's2', icon: 'fun', date: '2026-10-01', name: '迪士尼乐园', startTime: '09:00', endTime: '20:00' }
  ]
}
:::

> icons 字段覆盖了内置默认表，日程只能引用 stay / fun 两个 key（之前的 hotel/transport 在此例中不再可用）。
`.trim(),

  shareCode: /*html*/ `
:::shareCode
{ content: '复制这条口令打开小红书 https://www.xiaohongshu.com/explore', type: 'redbook' }
:::

:::shareCode
{ content: '打开链接领取优惠 https://example.com/coupon/abc' }
:::
`.trim(),

  linkCard: /*html*/ `
:::linkCard
https://www.xiaohongshu.com/explore
:::

> 卡片会调用 \`configure({ ogpHost })\` 里配置的抓取服务读取 OGP;
> demo 环境未搭 OGP 服务时,会展示 fallback(标题 = URL、图标 = website)。
`.trim(),

  mixed: /*html*/ `
# 混合样例

:::badge
{ type: 'calendar', name: '行程日期', value: '3 天 2 晚' }
:::

:::amap
{ lng: '116.397428', lat: '39.90923', name: '故宫博物院', address: '北京市东城区' }
:::

:::shareCode
{ content: '复制口令打开 https://www.xiaohongshu.com/explore', type: 'redbook' }
:::

普通段落、**加粗**、[链接](https://example.com) 与插件互不干扰。
`.trim(),

  customIcon: /*html*/ `
# 通过 configure 追加自定义图标

点击顶部 "追加 wechat 图标" 按钮后,下面的 badge 会显示对应 iconfont 图标。

:::badge
{ type: 'wechat', name: '微信', value: '联系客服' }
:::

未登记的 type(比如 \`foo\`)会走 \`typeToIcon\` 返回空,不影响布局。
`.trim(),
};

export const SAMPLE_KEYS = Object.keys(SAMPLES);

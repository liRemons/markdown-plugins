import React from "react";
import { createFromIconfontCN } from '@ant-design/icons';
import { getConfig } from '../config';

/**
 * Icon 组件采用懒初始化:
 * - 模块求值时不注册 scriptUrl,避免 `createFromIconfontCN` 在 configure() 之前
 *   被绑定到默认 CDN 上
 * - 首次渲染时读 getConfig().iconfontScriptUrl,兼容使用方在应用启动阶段
 *   通过 configure() 覆盖 CDN 地址的场景
 */
let cachedIcon: React.ComponentType<{ className?: string; type: string }> | null = null;
let cachedScriptUrl: string | null = null;

function getIconComp() {
  const scriptUrl = getConfig().iconfontScriptUrl;
  if (!cachedIcon || cachedScriptUrl !== scriptUrl) {
    cachedIcon = createFromIconfontCN({ scriptUrl });
    cachedScriptUrl = scriptUrl;
  }
  return cachedIcon;
}

interface IconProps {
  type: string;
  className?: string;
}

const MarkdownIcon: React.FC<IconProps> = ({ type, className }) => {
  const Icon = getIconComp();
  return <Icon className={className ?? 'markdown-icon'} type={type} />;
};

/**
 * 查询当前配置下 type 对应的 iconfont 图标 id。
 * 未登记的 type 返回空字符串,便于调用方做 `x || fallback` 之类的兜底。
 */
export function resolveIconType(type: string): string {
  if (!type) return '';
  return getConfig().icons[type] || '';
}

/**
 * 将 markdown config 里的 `type` 转成对应的 React 图标节点。
 * - 空 type 或未在 `configure({ icons })` / 内置表中登记的 type 返回 `''`,
 *   与历史调用点的 `typeToIcon(x) || fallback` 语义一致
 * - 新增图标无需修改本库,使用方在应用入口调用
 *   `configure({ icons: { newType: 'icon-xxx' } })` 即可生效
 */
export const typeToIcon = (type: string): React.ReactNode => {
  const iconType = resolveIconType(type);
  if (!iconType) return '';
  return <MarkdownIcon type={iconType} />;
};

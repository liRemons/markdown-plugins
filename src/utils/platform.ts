/**
 * 判断当前是否运行在桌面端。
 * - SSR 环境默认按 PC 处理,与历史行为一致
 * - 只依赖 UA + viewport,不引入第三方库
 */
export function isPC(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  return !(
    /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth <= 768
  );
}

/** @deprecated 使用 isPC,保留一个版本周期便于迁移 */
export const IsPC = isPC;

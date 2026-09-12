/**
 * Check if the current platform is PC
 */
export function IsPC(): boolean {
  if (typeof window === 'undefined') return true;
  return !(/Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 768);
}
/**
 * Copy text to clipboard
 * 优先使用异步 Clipboard API,不可用时降级到 execCommand。
 * 若两者都失败会抛错,便于调用方在 UI 层展示错误反馈。
 */
export async function copy(text: string | undefined): Promise<void> {
  if (!text) return;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    throw new Error('clipboard unavailable');
  } catch {
    // fallback for older browsers or non-secure contexts
    const ok = legacyCopy(text);
    if (!ok) throw new Error('copy failed');
  }
}

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

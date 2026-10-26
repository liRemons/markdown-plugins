import JSON5 from 'json5';
import { log } from '../config';

/**
 * 从原始字符串里定位第一个平衡的 `{...}` 块,按 JSON5 解析。
 *
 * 支持 markdown 容器 config 常见的两种形式:
 *   1. body 里就是纯 JSON5: `{ type: 'a', value: 1 }`
 *   2. body 里混合文本与 config: `复制口令 https://x.com { type: 'a' }`
 *
 * 找不到平衡 `{...}` 或 JSON5 解析失败,返回空对象。
 */
export function parseContainerConfig(raw: string): Record<string, unknown> {
  if (!raw) return {};
  const trimmed = raw.trim();
  if (!trimmed) return {};

  let depth = 0;
  let start = -1;
  let end = -1;
  let inStr: string | null = null;
  let esc = false;
  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed[i];
    if (esc) { esc = false; continue; }
    if (inStr) {
      if (c === '\\') esc = true;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth < 0) { depth = 0; start = -1; continue; }
      if (depth === 0 && start !== -1) { end = i; break; }
    }
  }
  if (start === -1 || end === -1) return {};

  try {
    return JSON5.parse(trimmed.slice(start, end + 1));
  } catch (e) {
    log.warn('[markdown-plugins] Failed to parse config:', e);
    return {};
  }
}

/** 转义用户提供的 tagName,避免正则元字符干扰匹配 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 从原始 body 里剥离第一个平衡的 `{...}` 块,返回剩余可读文本。
 * 用于给 shareCode / linkCard 这种"config + 正文"混排的容器补充 `content` prop。
 * 没有平衡 `{...}` 时直接返回 trim 后的原文。
 */
export function stripConfigBlock(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  let depth = 0;
  let start = -1;
  let end = -1;
  let inStr: string | null = null;
  let esc = false;
  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed[i];
    if (esc) { esc = false; continue; }
    if (inStr) {
      if (c === '\\') esc = true;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth < 0) { depth = 0; start = -1; continue; }
      if (depth === 0 && start !== -1) { end = i; break; }
    }
  }
  if (start === -1 || end === -1) return trimmed;
  return (trimmed.slice(0, start) + trimmed.slice(end + 1)).trim();
}

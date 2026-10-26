import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import mdContainer from 'markdown-it-container';
import { log } from '../config';
import type { MarkdownItLike } from '../types';
import { parseContainerConfig, stripConfigBlock } from './parse-container-config-core';
import {
  MD_KEY_ATTR,
  MD_PERSIST_ATTR,
  MD_MOUNTED_ATTR,
  encodeConfigToDataAttrs,
  decodeDataAttrsToProps,
} from './typed-attrs';

/* --------------------------------------------------------------------------
 * 全局共享 MutationObserver
 * - 由 md.use(plugin) 时懒装,避免模块求值阶段产生副作用影响 tree-shake
 * - 多个插件共用同一个 observer,消除每个插件一个 body-level observer 的开销
 * -------------------------------------------------------------------------- */

type MountEntry = { placeholderAttr: string; mount: (el: HTMLElement) => void };

/** mount 后的 React Root,用于节点真正从 DOM 移除时卸载,避免内存泄漏 */
const elementRoots = new WeakMap<HTMLElement, Root>();
/** 已注册的插件:tagName -> { placeholderAttr, mount },供共享 observer 分派 */
const registry = new Map<string, MountEntry>();
let observerInstalled = false;

const unmountDetached = (el: HTMLElement) => {
  if (el.isConnected) return;
  const root = elementRoots.get(el);
  if (!root) return;
  try {
    root.unmount();
  } catch (e) {
    log.warn('[markdown-plugins] unmount error:', e);
  }
  elementRoots.delete(el);
};

const cleanupRemovedTree = (node: Node) => {
  if (!(node instanceof HTMLElement)) return;
  if (node.matches(`[${MD_MOUNTED_ATTR}]`)) unmountDetached(node);
  node.querySelectorAll<HTMLElement>(`[${MD_MOUNTED_ATTR}]`).forEach(unmountDetached);
};

const canObserve = () =>
  typeof window !== 'undefined'
  && typeof MutationObserver !== 'undefined'
  && typeof document !== 'undefined';

const ensureSharedObserver = () => {
  if (observerInstalled || !canObserve()) return;
  observerInstalled = true;

  const scanExisting = () => {
    for (const { placeholderAttr, mount } of registry.values()) {
      document.querySelectorAll<HTMLElement>(`[${placeholderAttr}]`).forEach(mount);
    }
  };

  const start = () => {
    scanExisting();
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          for (const { placeholderAttr, mount } of registry.values()) {
            const selector = `[${placeholderAttr}]`;
            if (node.matches(selector)) mount(node);
            node.querySelectorAll<HTMLElement>(selector).forEach(mount);
          }
        }
        for (const node of mutation.removedNodes) {
          cleanupRemovedTree(node);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
};

/* --------------------------------------------------------------------------
 * markdown-it-container block 侧:body 内容抽取
 * -------------------------------------------------------------------------- */

/**
 * 遍历容器 body 的顶层 tokens,把可读文本抽出来拼接。
 * 段落里的 inline token 用 `token.content`(渲染前的原始字符串),
 * 保留换行、空格、引号等格式,方便后续 JSON5 解析。
 */
const collectBodyRaw = (tokens: any[], start: number, end: number): string => {
  const parts: string[] = [];
  for (let i = start; i < end; i++) {
    const t = tokens[i];
    if (!t) continue;
    if (t.type === 'inline' || t.type === 'fence' || t.type === 'code_block' || t.type === 'html_block') {
      parts.push(t.content ?? '');
    }
  }
  return parts.join('\n');
};

/**
 * 找到与 opening token 对应的 closing token 下标(处理同名嵌套)。
 * 找不到返回 tokens.length(视作自动闭合)。
 */
const findMatchingClose = (tokens: any[], openIdx: number, tagName: string): number => {
  let level = 1;
  for (let i = openIdx + 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === `container_${tagName}_open`) level++;
    else if (t.type === `container_${tagName}_close`) {
      level--;
      if (level === 0) return i;
    }
  }
  return tokens.length;
};

/** 基于 tagName + 原始 body 的稳定 hash,供使用方做增量渲染匹配 */
const makeRenderKey = (tagName: string, raw: string): string => {
  const text = (tagName + '|' + raw).replace(/\s+/g, '').trim();
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return `${tagName}-${Math.abs(hash)}`;
};

/* --------------------------------------------------------------------------
 * 组件工厂
 * -------------------------------------------------------------------------- */

export type ContainerComponent<P = Record<string, unknown>> = React.FC<P>;

/**
 * 创建 markdown-it-container 容器组件。
 *
 * 支持的 markdown 语法:
 *
 * ```md
 * :::badge
 * { type: 'redbook', name: '小红书', value: 123 }
 * :::
 * ```
 *
 * config 写在容器 body 里(允许多行),内部按 JSON5 解析。
 * 也兼容单行式 `:::badge { ... }`,当 info 行有非 tagName 内容时优先取它。
 *
 * 渲染出的 DOM 结构:
 * ```html
 * <div class="render-md-plugin render-md-plugin-badge-container"
 *      data-md-persist="badge" data-md-key="badge-xxx">
 *   <div class="render-md-plugin-placeholder"
 *        data-badge-placeholder data-type="redbook" data-name="小红书"
 *        data-md-typed="value">
 *     <template class="render-md-plugin-raw">...原始 body...</template>
 *   </div>
 * </div>
 * ```
 * mount 时 placeholder 内部会被 React 接管,template 也随之被清除。
 *
 * @param tagName 容器标签名,与 markdown 里的 `:::tagName` 对应
 * @param Component React 组件,接收 config 里各字段(带原类型)作为 props
 * @returns `(md) => void` 注册函数;`md.use()` 时才启动共享 observer
 */
export function createContainerComponent(tagName: string) {
  return (Component: ContainerComponent<any>): ((md: MarkdownItLike) => void) => {
    const placeholderAttr = `data-${tagName}-placeholder`;

    const mount = (el: HTMLElement) => {
      if (elementRoots.has(el)) return;
      if (!el.isConnected) return;

      const props = decodeDataAttrsToProps(el);
      // 无论 config 是否命中,都从同元素内 <template> 取原始 body,
      // 剥除第一个平衡的 `{...}` 块后作为 `content`——支持 shareCode 这种
      // "config 行 + 正文行" 混排。已有同名 props 时不覆盖。
      const template = el.querySelector<HTMLTemplateElement>('template.render-md-plugin-raw');
      const raw = template
        ? (template.content?.textContent || template.textContent || '')
        : '';
      const stripped = stripConfigBlock(raw);
      if (stripped && props.content === undefined) {
        props.content = stripped;
      }

      el.setAttribute(MD_MOUNTED_ATTR, tagName);
      el.removeAttribute(placeholderAttr);

      const root = createRoot(el);
      elementRoots.set(el, root);
      try {
        root.render(React.createElement(Component, props));
      } catch (e) {
        // 组件抛错时回滚挂载标记,保持 placeholder 属性以便后续重试,避免留下空白卡片
        log.error(`[${tagName}] render error:`, e);
        try { root.unmount(); } catch { /* noop */ }
        elementRoots.delete(el);
        el.removeAttribute(MD_MOUNTED_ATTR);
        el.setAttribute(placeholderAttr, '');
      }
    };

    // 注册与 observer 启动都延迟到 md.use(),保证未使用的插件可被 tree-shake
    return (md: MarkdownItLike) => {
      registry.set(tagName, { placeholderAttr, mount });
      ensureSharedObserver();

      // 供 body tokens 消费后指向 no-op 渲染规则,避免 markdown-it 二次输出
      const consumedType = `_md_consumed_${tagName}`;
      md.renderer.rules[consumedType] = () => '';

      md.use(mdContainer as any, tagName, {
        validate: (params: string) => {
          // `:::badge` / `:::badge xxx` 都接受,首词命中 tagName 即视作我们的容器
          const first = params.trim().split(/\s+/, 1)[0];
          return first === tagName;
        },
        render: (tokens: any[], idx: number) => {
          if (tokens[idx].nesting === 1) {
            const closeIdx = findMatchingClose(tokens, idx, tagName);
            const inlineInfo = tokens[idx].info.trim().replace(tagName, '').trim();
            const bodyRaw = collectBodyRaw(tokens, idx + 1, closeIdx);
            const rawBody = inlineInfo || bodyRaw;

            // 消费掉 body tokens,防止 markdown-it 再次渲染它们
            for (let i = idx + 1; i < closeIdx; i++) {
              tokens[i].type = consumedType;
            }

            const config = parseContainerConfig(rawBody);
            const dataAttrs = encodeConfigToDataAttrs(config, md.utils.escapeHtml);
            const key = makeRenderKey(tagName, rawBody);
            const outerClass = `render-md-plugin render-md-plugin-${tagName}-container ${(config.class as string) || ''}`.trim();
            const innerAttrs = dataAttrs ? ' ' + dataAttrs : '';
            const safeBody = md.utils.escapeHtml(rawBody);

            return `<div class="${outerClass}" ${MD_PERSIST_ATTR}="${md.utils.escapeHtml(tagName)}" ${MD_KEY_ATTR}="${md.utils.escapeHtml(key)}">`
              + `<div class="render-md-plugin-placeholder" ${placeholderAttr}${innerAttrs}>`
              + `<template class="render-md-plugin-raw">${safeBody}</template>`
              + `</div>`
              + `</div>`;
          }
          // 开标签已经自带闭合,close 不再 emit
          return '';
        },
      });
    };
  };
}

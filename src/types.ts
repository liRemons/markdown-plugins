/**
 * markdown-it 用到的最小接口子集。
 * 之所以自己声明:避免强行引入 `@types/markdown-it` 作为 peer(很多项目里
 * markdown-it 只是构建期依赖,类型未必安装)。使用方如果已经安装了官方类型,
 * 传进来的实例结构完全兼容这个子集。
 */

export type MarkdownItRuleFn = (
  state: any,
  silent: boolean,
  startLine?: number,
  endLine?: number,
  src?: string,
) => boolean;

export type MarkdownItRenderRule = (
  tokens: any[],
  idx: number,
  options: unknown,
  env: unknown,
  self: unknown,
) => string;

export interface MarkdownItRuler {
  before: (beforeName: string, ruleName: string, fn: MarkdownItRuleFn) => void;
  after: (afterName: string, ruleName: string, fn: MarkdownItRuleFn) => void;
  push: (ruleName: string, fn: MarkdownItRuleFn) => void;
}

export interface MarkdownItParser {
  ruler: MarkdownItRuler;
}

export interface MarkdownItRenderer {
  rules: Record<string, MarkdownItRenderRule>;
}

export interface MarkdownItUtils {
  escapeHtml: (str: string) => string;
}

/**
 * 本库实际用到的 markdown-it 实例形状。
 * 若你手上有官方 `MarkdownIt` 类型,直接传入即可,二者结构兼容。
 */
export interface MarkdownItLike {
  use: (plugin: (...args: any[]) => any, ...params: any[]) => MarkdownItLike;
  inline: MarkdownItParser & { renderer: MarkdownItRenderer };
  block: MarkdownItParser & { renderer: MarkdownItRenderer };
  renderer: MarkdownItRenderer;
  utils: MarkdownItUtils;
}

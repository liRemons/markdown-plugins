/**
 * markdown-it 官方 `@types/markdown-it` 未安装,demo 里只用到最基础的构造与 render API,
 * 直接依赖库自带的 `MarkdownItLike` 类型即可,不需要引入完整类型定义。
 */
declare module 'markdown-it' {
  import type { MarkdownItLike } from '../src/types';
  interface MarkdownItOptions {
    html?: boolean;
    linkify?: boolean;
    breaks?: boolean;
    typographer?: boolean;
  }
  class MarkdownIt implements MarkdownItLike {
    constructor(preset?: string | MarkdownItOptions, options?: MarkdownItOptions);
    use: MarkdownItLike['use'];
    render: (src: string, env?: unknown) => string;
    renderInline: (src: string, env?: unknown) => string;
    inline: MarkdownItLike['inline'];
    block: MarkdownItLike['block'];
    renderer: MarkdownItLike['renderer'];
    utils: MarkdownItLike['utils'];
  }
  export = MarkdownIt;
}

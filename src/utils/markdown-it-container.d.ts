declare module 'markdown-it-container' {
  /** markdown-it-container 的 token 扩展信息 */
  interface ContainerToken {
    type: string;
    nesting: number;
    info: string;
    markup: string;
    block: boolean;
    map: [number, number] | null;
    children: ContainerToken[] | null;
    content: string;
    level: number;
    attrJoin: (name: string, value: string) => void;
  }

  type RenderToken = (
    tokens: ContainerToken[],
    idx: number,
    md: unknown,
    env: unknown,
    self: unknown
  ) => string;

  type Validate = (params: string, markup: string) => boolean;

  interface ContainerOptions {
    /** 容器标记字符,默认 `:` */
    marker?: string;
    validate?: Validate;
    render?: RenderToken;
  }

  /** markdown-it 插件本体,直接由 `md.use(container, name, options)` 消费 */
  function markdownItContainer(md: unknown, name: string, options?: ContainerOptions): void;

  export = markdownItContainer;
}

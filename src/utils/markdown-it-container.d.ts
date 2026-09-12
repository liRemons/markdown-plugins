declare module 'markdown-it-container' {
  import { Options } from 'markdown-it';
  function plugin(
    md: any,
    asnClass: string,
    options?: { validate?: (params: string) => boolean; render?: (tokens: any[], idx: number) => string }
  ): void;
  export default plugin;
}
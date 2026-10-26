export const hasProtocolFun = (url: string | undefined): boolean =>
  url != null && /^https?:\/\//i.test(url);

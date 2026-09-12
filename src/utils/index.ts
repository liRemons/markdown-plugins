import React from "react";

export const HOST = "https://remons.cn:3008";

export const img = (svg: string, height: number = 120, className?: string) => {
  return React.createElement("img", {
    style: { height: `${height}px` },
    src: svg,
    alt: "",
    className,
  });
};

export const hasProtocolFun = (url: string | undefined): boolean => 
  url != null && /^https?:\/\//i.test(url)



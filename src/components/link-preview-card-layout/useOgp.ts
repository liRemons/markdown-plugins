import { useEffect, useState, useRef, useCallback } from 'react';
import { hasProtocolFun } from '../../utils';
import { getConfig } from '../../config';

export interface OgpData {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
  type: string;
  locale: string;
  favicon: string;
}

interface UseOgpResult {
  ogpData: OgpData | null;
  loading: boolean;
  imageError: boolean;
  setImageError: (v: boolean) => void;
  finalUrl: string;
  refetch: () => void;
}

// 缓存上限,避免 SPA 长时间运行导致内存无界增长
const OGP_CACHE_LIMIT = 200;

// Map 保持插入顺序,达到上限时按最旧写入淘汰
const ogpCache = new Map<string, OgpData>();
const requestCache = new Map<string, Promise<OgpData | null>>();

function setCacheWithLimit(key: string, value: OgpData) {
  if (ogpCache.size >= OGP_CACHE_LIMIT) {
    const oldest = ogpCache.keys().next().value;
    if (oldest !== undefined) ogpCache.delete(oldest);
  }
  ogpCache.set(key, value);
}

function fetchOgp(finalUrl: string, fetchOgpUrl: string, noCache?: boolean): Promise<OgpData | null> {
  if (!noCache && ogpCache.has(finalUrl)) {
    return Promise.resolve(ogpCache.get(finalUrl) || null);
  }
  if (requestCache.has(finalUrl)) {
    return requestCache.get(finalUrl)!;
  }

  const host = getConfig().ogpHost;
  const cacheParam = noCache ? '&noCache=true' : '';
  const promise = fetch(`${host}/ogp/fetch?url=${encodeURIComponent(fetchOgpUrl)}${cacheParam}`)
    .then(res => res.json())
    .then(res => {
      if (res.success && res.data) {
        setCacheWithLimit(finalUrl, res.data);
        return res.data;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      requestCache.delete(finalUrl);
    });

  requestCache.set(finalUrl, promise);
  return promise;
}

/** 是否运行在受信任站点(白名单通过 configure({ trustedHostnames }) 覆盖) */
export const isWebsite = () => {
  if (typeof window === 'undefined') return false;
  return getConfig().trustedHostnames.includes(window.location.hostname);
};

const safeOrigin = () => (typeof window === 'undefined' ? '' : window.location.origin);

export function useOgp(url: string): UseOgpResult {
  const [ogpData, setOgpData] = useState<OgpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const mountedRef = useRef(true);

  const trimmed = url?.trim();
  const hasProtocol = hasProtocolFun(trimmed);
  const origin = safeOrigin();
  const finalUrl = hasProtocol
    ? trimmed
    : `${origin}${trimmed?.startsWith('/') ? '' : '/'}${trimmed}`;

  let fetchOgpUrl = '';
  if (hasProtocol) {
    fetchOgpUrl = finalUrl;
  } else if (isWebsite()) {
    fetchOgpUrl = `${origin}${trimmed?.startsWith('/') ? '' : '/'}${trimmed}`;
  } else {
    fetchOgpUrl = `${getConfig().defaultRemoteHost}${trimmed?.startsWith('/') ? '' : '/'}${trimmed}`;
  }

  const refetch = useCallback(() => {
    if (!trimmed) return;
    // 刷新:清除本地缓存,并向后端携带 noCache=true 不使用缓存
    ogpCache.delete(finalUrl);
    setImageError(false);
    setLoading(true);
    fetchOgp(finalUrl, fetchOgpUrl, true).then(data => {
      if (mountedRef.current) {
        if (data) setOgpData(data);
        setLoading(false);
      }
    });
  }, [finalUrl, fetchOgpUrl, trimmed]);

  useEffect(() => {
    mountedRef.current = true;
    if (!trimmed) {
      setLoading(false);
      return;
    }
    setImageError(false);

    if (ogpCache.has(finalUrl)) {
      setOgpData(ogpCache.get(finalUrl) || null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOgp(finalUrl, fetchOgpUrl).then(data => {
      if (mountedRef.current) {
        if (data) setOgpData(data);
        setLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalUrl]);

  return { ogpData, loading, imageError, setImageError, finalUrl, refetch };
}

import { useEffect, useState, useRef } from 'react';
import { hasProtocolFun, HOST } from '../../utils';

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
  error: boolean;
  imageError: boolean;
  setImageError: (v: boolean) => void;
  finalUrl: string;
  hasProtocol: boolean;
}

// Global cache for OGP data to avoid duplicate requests
const ogpCache = new Map<string, OgpData>();
// Track in-flight requests to avoid duplicate fetches
const requestCache = new Map<string, Promise<OgpData | null>>();

function fetchOgp(finalUrl: string): Promise<OgpData | null> {
  if (ogpCache.has(finalUrl)) {
    return Promise.resolve(ogpCache.get(finalUrl));
  }
  if (requestCache.has(finalUrl)) {
    return requestCache.get(finalUrl)!;
  }

  const promise = fetch(`${HOST}/ogp/fetch?url=${encodeURIComponent(finalUrl)}`)
    .then(res => res.json())
    .then(res => {
      if (res.success && res.data) {
        ogpCache.set(finalUrl, res.data);
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

export function useOgp(url: string): UseOgpResult {
  const [ogpData, setOgpData] = useState<OgpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const mountedRef = useRef(true);

  const trimmed = url?.trim();
  const hasProtocol = hasProtocolFun(trimmed);
  const finalUrl = hasProtocol
    ? trimmed
    : `${window.location.origin}${trimmed?.startsWith('/') ? '' : '/'}${trimmed}`;

  useEffect(() => {
    mountedRef.current = true;
    if (!trimmed) {
      setLoading(false);
      setError(true);
      return;
    }
    setImageError(false);

    // Check cache first
    if (ogpCache.has(finalUrl)) {
      setOgpData(ogpCache.get(finalUrl));
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOgp(finalUrl).then(data => {
      if (mountedRef.current) {
        if (data) {
          setOgpData(data);
        } else {
          setError(true);
        }
        setLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
    };
  }, [finalUrl]);

  return { ogpData, loading, error, imageError, setImageError, finalUrl, hasProtocol };
}
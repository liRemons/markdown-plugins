import React, { Fragment, useState, useMemo, useCallback } from 'react';
import { RedoOutlined } from '@ant-design/icons';
import { isPC } from '../../utils/platform';
import { useOgp } from './useOgp';
import LinkButton from '../link-button';
import Spinner from '../spinner';
import { typeToIcon } from '../../utils/type-to-icon';
import './index.less';

const websiteSvg = typeToIcon('website');

interface LinkPreviewCardLayoutProps {
  url: string;
  description?: string;
  favicon?: string | React.ReactNode;
  actions?: React.ReactNode;
  title?: string;
}

const LinkPreviewCardLayoutInner: React.FC<LinkPreviewCardLayoutProps> = ({ url, description, favicon, actions, title }) => {
  const { ogpData, loading, finalUrl, imageError, setImageError, refetch } = useOgp(url);
  const [faviconError, setFaviconError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, [setImageError]);

  const handleFaviconError = useCallback(() => {
    setFaviconError(true);
  }, []);

  const onReload = useCallback(() => {
    // 刷新ogp（向后端携带 noCache=true，不使用缓存）
    setFaviconError(false);
    refetch();
  }, [refetch]);


  const displayInfo = useMemo(() => {
    // 容错解析 hostname:finalUrl 为相对路径/无效 URL 时不抛
    let hostname = '';
    try {
      hostname = new URL(finalUrl).hostname;
    } catch {
      hostname = '';
    }
    const displayTitle = !url ? title : (ogpData?.title || (hostname ? `链接 ${hostname}` : '链接'));
    const displayDesc = ogpData?.description || description || finalUrl;
    const displayImage = ogpData?.image || '';
    const displayFavicon = ogpData?.favicon || '';
    let displaySiteName = ogpData?.siteName || hostname;
    return { displayTitle, displayDesc, displayImage, displayFavicon, displaySiteName };
  }, [ogpData, finalUrl, description]);

  const renderFavicon = useMemo(() => {
    if (favicon) {
      return favicon;
    }
    if (displayInfo.displayFavicon && !faviconError) {
      return <img className="link-preview-favicon" src={displayInfo.displayFavicon} alt="" onError={handleFaviconError} />;
    }
    return websiteSvg;
  }, [favicon, displayInfo.displayFavicon, faviconError, handleFaviconError]);

  const rightComponent = useMemo(() => (
    <Fragment>
      <div className="link-preview-info">
        <div className="link-preview-title">
          {renderFavicon}
          <span className="link-preview-title-text">{displayInfo.displayTitle}</span>
        </div>
        {displayInfo.displayDesc && <div className="link-preview-desc">{displayInfo.displayDesc}</div>}
        <div className="link-preview-site">{url ? displayInfo.displaySiteName : ''}</div>
      </div>
      <div className="link-preview-actions">
        {
          actions || <Fragment>
            <LinkButton copyContent={finalUrl} componentType="div" />
            <LinkButton href={finalUrl} componentType="a" />
          </Fragment>
        }
      </div>
    </Fragment>
  ), [renderFavicon, displayInfo, actions, finalUrl]);

  const imageComponent = useMemo(() => {
    if (!displayInfo.displayImage || imageError) return null;
    return (
      <div className="link-preview-image" style={{ '--image': `url("${displayInfo.displayImage}")` } as any}>
        <img src={displayInfo.displayImage} onError={handleImageError} />
      </div>
    );
  }, [displayInfo.displayImage, imageError, handleImageError]);

  if (loading) {
    return (
      <div className="link-preview-card-container">
        <div className="link-preview-loading">
          <Spinner size="small" />
          <span>加载预览中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="link-preview-card-container">
      <div className="link-preview-card">
        <div className="refresh-btn" onClick={onReload}><RedoOutlined /></div>
        {imageComponent}
        {
          isPC() ? rightComponent : <div className="link-preview-right">
            {rightComponent}
          </div>
        }
      </div>
    </div>
  );
};

const LinkPreviewCardLayout = React.memo(LinkPreviewCardLayoutInner);

export default LinkPreviewCardLayout;
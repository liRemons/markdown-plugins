import React, { Fragment, useState, useMemo, useCallback } from 'react';
import { Spin } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { IsPC } from '../../utils/platform';
import { useOgp } from './useOgp';
import LinkButton from '../link-button';
import { typeToIcon } from '../../utils/type-to-icon';
import './index.less';

const websiteSvg = typeToIcon('website');

interface LinkPreviewCardLayoutProps {
  url: string;
  description?: string;
  favicon?: string | React.ReactNode;
  actions?: React.ReactNode;
}

const LinkPreviewCardLayoutInner: React.FC<LinkPreviewCardLayoutProps> = ({ url, description, favicon, actions }) => {
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
    const displayTitle = ogpData?.title || `链接 ${new URL(finalUrl).hostname}`;
    const displayDesc = ogpData?.description || description || finalUrl;
    const displayImage = ogpData?.image || '';
    const displayFavicon = ogpData?.favicon || '';
    let displaySiteName = ogpData?.siteName || '';
    try {
      if (!displaySiteName) {
        displaySiteName = new URL(finalUrl).hostname;
      }
    } catch (e) {
      // ignore
    }
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
        <div className="link-preview-site">{displayInfo.displaySiteName}</div>
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
          <Spin size="small" />
          <span>加载预览中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="link-preview-card-container">
      <div className="link-preview-card">
        <div className="refresh-btn cricle" onClick={onReload}><RedoOutlined /></div>
        {imageComponent}
        {
          IsPC() ? rightComponent : <div className="link-preview-right">
            {rightComponent}
          </div>
        }
      </div>
    </div>
  );
};

const LinkPreviewCardLayout = React.memo(LinkPreviewCardLayoutInner);

export default LinkPreviewCardLayout;
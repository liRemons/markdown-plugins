import React, { Fragment, useMemo } from 'react';
import { createContainerComponent } from '../../utils/parse-container-config';
import LinkPreviewCardLayout from '../../components/link-preview-card-layout';
import { typeToIcon } from '../../utils/type-to-icon';
import LinkButton from '../../components/link-button';

const ShareCodeContainerInner: React.FC<{ content?: string; type?: string }> = ({ content = '', type }) => {
  const url = content.match(/https?:\/\/[^\s<>"']+/)?.[0] || '';
  const icon = typeToIcon(type || '') || typeToIcon('sharecode');

  const actionsWithUrl = useMemo(() => {
    return (
      <Fragment>
        <LinkButton componentType="div" copyContent={content}>
          {typeToIcon('sharecode')}复制口令
        </LinkButton>
        {url ? <LinkButton href={url} componentType="a" copyContent={content} /> : null}
      </Fragment>
    );
  }, [url, content]);

  return <LinkPreviewCardLayout
    url={url}
    title="口令"
    description={content}
    favicon={icon}
    actions={actionsWithUrl}
  />;
};

const ShareCodeContainer = React.memo(ShareCodeContainerInner);

export default createContainerComponent('shareCode')(ShareCodeContainer);

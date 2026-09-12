import React, { useCallback } from 'react';
import { typeToIcon } from '../../utils/type-to-icon';
import { createContainerComponent } from '../../utils/parse-container-config';
import './index.less'

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

const BadgeContainerInner: React.FC<{ type: string; content: string; block: string; url?: string; }> = ({ type, content, block, url }) => {
  const handleClick = useCallback(() => {
    if (url) {
      window.open(url, '_blank');
    }
  }, [url]);


  return (
    <div className={cn('badge-container', block === 'true' ? 'block' : '')} onClick={handleClick}>
      {typeToIcon(type)}
      <span>{content}</span>
    </div>
  );
};

const BadgeContainer = React.memo(BadgeContainerInner);

export default createContainerComponent('badge')(BadgeContainer);

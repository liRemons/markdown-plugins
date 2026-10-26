import React, { useCallback } from 'react';
import { typeToIcon } from '../../utils/type-to-icon';
import { createContainerComponent } from '../../utils/parse-container-config';
import './index.less'

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

interface BadgeProps {
  type?: string;
  content?: string;
  block?: string;
  url?: string;
}

const BadgeContainerInner: React.FC<BadgeProps> = ({ type, content, block, url }) => {
  const handleClick = useCallback(() => {
    if (url) {
      window.open(url, '_blank', 'noopener');
    }
  }, [url]);

  const clickable = Boolean(url);

  return (
    <div
      className={cn('badge-container', block === 'true' ? 'block' : '')}
      onClick={clickable ? handleClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } } : undefined}
    >
      {typeToIcon(type || '')}
      <span>{content}</span>
    </div>
  );
};

const BadgeContainer = React.memo(BadgeContainerInner);

export default createContainerComponent('badge')(BadgeContainer);

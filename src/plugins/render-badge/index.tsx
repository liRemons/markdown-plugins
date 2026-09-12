import React from 'react';
import { typeToIcon } from '../../utils/type-to-icon';
import { createContainerComponent } from '../../utils/parse-container-config';
import './index.less'

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

const BadgeContainer: React.FC<{ type: string; content: string; block: string; url?: string; }> = ({ type, content, block, url }) => {
  const handleClick = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };


  return (
    <div className={cn('badge-container', block === 'true' ? 'block' : '')} onClick={handleClick}>
      {typeToIcon(type)} 
      <span>{content}</span>
    </div>
  );
};

export default createContainerComponent('badge')(BadgeContainer);

import React from 'react';
import './index.less';

interface SpinnerProps {
  size?: 'small' | 'default';
}

/** 替代 antd `Spin` 的极简 CSS Spinner,不依赖任何 UI 库 */
const Spinner: React.FC<SpinnerProps> = ({ size = 'default' }) => {
  return (
    <span
      className={`md-plugin-spinner md-plugin-spinner-${size}`}
      role="status"
      aria-label="loading"
    />
  );
};

export default React.memo(Spinner);

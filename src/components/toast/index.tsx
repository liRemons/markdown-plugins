import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './toast.less';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  text: string;
  type: ToastType;
}

let container: HTMLDivElement | null = null;
let seq = 0;
const items: ToastItem[] = [];
let listeners: Array<(items: ToastItem[]) => void> = [];

function ensureContainer() {
  if (typeof document === 'undefined') return;
  if (container) return;
  container = document.createElement('div');
  container.className = 'md-plugin-toast-root';
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  createRoot(container).render(<ToastList />);
}

function push(text: string, type: ToastType) {
  if (typeof document === 'undefined') return;
  ensureContainer();
  const id = ++seq;
  items.push({ id, text, type });
  listeners.forEach(fn => fn([...items]));
  // 2s 后自动消失
  setTimeout(() => dismiss(id), 2000);
}

function dismiss(id: number) {
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) {
    items.splice(idx, 1);
    listeners.forEach(fn => fn([...items]));
  }
}

const ToastList: React.FC = () => {
  const [list, setList] = useState<ToastItem[]>([]);
  useEffect(() => {
    listeners.push(setList);
    setList([...items]);
    return () => {
      listeners = listeners.filter(fn => fn !== setList);
    };
  }, []);
  return (
    <>
      {list.map(item => (
        <div key={item.id} className={`md-plugin-toast md-plugin-toast-${item.type}`}>
          {item.text}
        </div>
      ))}
    </>
  );
};

/**
 * 极简 toast,替代之前对 antd message 的依赖。
 * 保持与 antd message 一致的 API 门面,方便回退或平滑迁移。
 */
export const toast = {
  success: (text: string) => push(text, 'success'),
  error: (text: string) => push(text, 'error'),
  info: (text: string) => push(text, 'info'),
};

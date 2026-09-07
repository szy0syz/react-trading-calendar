import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils';

export type PoptipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type PoptipTrigger = 'hover' | 'click';

export interface PoptipProps {
  /** 气泡标题（可选） */
  title?: React.ReactNode;
  /** 气泡主体内容（支持富文本/JSX/文本） */
  content: React.ReactNode;
  /** 被挂载的目标子组件 */
  children: React.ReactElement;
  /** 触发方式：悬停显示(默认) 或 点击切换 */
  trigger?: PoptipTrigger;
  /** 弹出方位，默认 top */
  placement?: PoptipPlacement;
  /** 浮层宽度控制，如 'w-auto whitespace-nowrap', 'w-48', 'w-64' 等，默认 w-auto */
  widthClass?: string;
  /** 额外自定义类名 */
  className?: string;
  /** 禁用弹窗 */
  disabled?: boolean;
  /** 是否允许鼠标与浮层交互（默认 false，悬停提示默认禁用交互以支持穿透且离开目标立即关闭） */
  interactive?: boolean;
}

const placementConfig: Record<
  PoptipPlacement,
  { container: string; arrow: string }
> = {
  top: {
    container: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    arrow: '-bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-900',
  },
  bottom: {
    container: 'top-full left-1/2 -translate-x-1/2 mt-2',
    arrow: '-top-1 left-1/2 -translate-x-1/2 border-l border-t border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-900',
  },
  left: {
    container: 'right-full top-1/2 -translate-y-1/2 mr-2',
    arrow: '-right-1 top-1/2 -translate-y-1/2 border-t border-r border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-900',
  },
  right: {
    container: 'left-full top-1/2 -translate-y-1/2 ml-2',
    arrow: '-left-1 top-1/2 -translate-y-1/2 border-b border-l border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-900',
  },
};

export const Poptip: React.FC<PoptipProps> = ({
  title,
  content,
  children,
  trigger = 'hover',
  placement = 'top',
  widthClass = 'w-auto whitespace-nowrap',
  className = '',
  disabled = false,
  interactive = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    if (disabled || trigger !== 'hover') return;
    clearTimer();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (disabled || trigger !== 'hover') return;
    clearTimer();
    if (interactive) {
      timerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 120);
    } else {
      setIsOpen(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if (trigger === 'click') {
      e.stopPropagation();
      setIsOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (trigger !== 'click' || !isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isOpen, trigger]);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  if (!content) return children;

  const config = placementConfig[placement];

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-flex items-center justify-center', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      {isOpen && !disabled && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 transition-opacity duration-150',
            interactive ? 'pointer-events-auto' : 'pointer-events-none select-none',
            config.container
          )}
          onMouseEnter={interactive ? handleMouseEnter : undefined}
          onMouseLeave={interactive ? handleMouseLeave : undefined}
        >
          <div
            className={cn(
              widthClass,
              'relative rounded-md border border-slate-200/90 dark:border-slate-700/80 bg-white text-slate-800 dark:bg-slate-900/95 dark:text-slate-200 px-2 py-1 text-xs shadow-lg shadow-black/30 dark:shadow-black/60 backdrop-blur-md font-sans normal-case'
            )}
          >
            {title && (
              <div className="mb-1 pb-1 font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800">
                {title}
              </div>
            )}
            <div className="leading-tight text-center">{content}</div>
            {/* 45度旋转小箭头（带边框） */}
            <div className={cn('absolute w-2 h-2 rotate-45 pointer-events-none', config.arrow)} />
          </div>
        </div>
      )}
    </div>
  );
};

Poptip.displayName = 'Poptip';

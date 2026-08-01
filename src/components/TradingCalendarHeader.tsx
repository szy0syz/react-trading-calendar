import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTradingCalendar } from '../context/TradingCalendarContext';
import { cn } from '../utils';

export const TradingCalendarHeader: React.FC = React.memo(() => {
  const { title, statusText, theme, showThemeToggle, onThemeToggle } = useTradingCalendar();

  return (
    <div className="flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-3 border-b border-slate-200 dark:border-slate-800/80">
      <div className="flex items-center space-x-2 sm:space-x-3 truncate">
        {/* macOS 风格三点装饰 */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
        </div>
        <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 tracking-wide truncate">
          {title}
        </span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
        {showThemeToggle && onThemeToggle && (
          <button
            type="button"
            onClick={() => onThemeToggle(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              "p-1 sm:p-1.5 rounded-lg transition-colors duration-200",
              "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
            )}
            title={`切换为${theme === 'dark' ? '白天' : '黑夜'}模式`}
          >
            {theme === 'dark'
              ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            }
          </button>
        )}

        {/* 实时状态指示灯 */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs font-semibold text-emerald-500 dark:text-emerald-400">
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500" />
          </span>
          <span>{statusText}</span>
        </div>
      </div>
    </div>
  );
});

TradingCalendarHeader.displayName = 'TradingCalendarHeader';

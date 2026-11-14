import React from 'react';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTradingCalendar } from '../context/TradingCalendarContext';
import { cn, shiftYearMonth } from '../utils';

interface TradingCalendarControlsProps {
  year: number;
  month: number;
  hasPrevMonth?: boolean;
  hasNextMonth?: boolean;
}

const NAV_BUTTON_CLASS = cn(
  "p-0.5 sm:p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors duration-150",
  "dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800",
  "focus:outline-none focus-visible:outline-none focus:ring-0",
  "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
);

export const TradingCalendarControls: React.FC<TradingCalendarControlsProps> = React.memo(({
  year,
  month,
  hasPrevMonth = true,
  hasNextMonth = true,
}) => {
  const { sectionTitle, onMonthChange } = useTradingCalendar();

  const handleMonthShift = (delta: -1 | 1, enabled: boolean) => {
    if (!onMonthChange || !enabled) return;
    const target = shiftYearMonth(year, month, delta);
    onMonthChange(target.year, target.month);
  };

  return (
    <div className="flex items-center justify-between px-2 sm:px-6 pt-2 sm:pt-2.5 pb-1.5 sm:pb-2">
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 dark:text-emerald-400" />
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {sectionTitle}
        </h2>
      </div>

      <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-50 dark:bg-slate-900/60 shadow-inner">
        <button
          type="button"
          onClick={() => handleMonthShift(-1, hasPrevMonth)}
          disabled={!hasPrevMonth}
          className={NAV_BUTTON_CLASS}
          aria-label="上个月"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <span className="px-2 sm:px-4 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide select-none">
          {year}年 {month.toString().padStart(2, '0')}月
        </span>

        <button
          type="button"
          onClick={() => handleMonthShift(1, hasNextMonth)}
          disabled={!hasNextMonth}
          className={NAV_BUTTON_CLASS}
          aria-label="下个月"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

TradingCalendarControls.displayName = 'TradingCalendarControls';

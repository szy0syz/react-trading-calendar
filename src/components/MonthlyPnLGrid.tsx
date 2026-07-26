import React from 'react';
import { ColorScheme, MonthlySummary } from '../types';
import { cn, formatPnL, getPnLTextStyle } from '../utils';

interface MonthlyPnLGridProps {
  year: number;
  currentMonth: number;
  monthlySummaries?: MonthlySummary[];
  colorScheme?: ColorScheme;
  onMonthChange?: (year: number, month: number) => void;
}

export const MonthlyPnLGrid: React.FC<MonthlyPnLGridProps> = React.memo(({
  year,
  currentMonth,
  monthlySummaries = [],
  colorScheme = 'greenUpRedDown',
  onMonthChange,
}) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getMonthlyPnL = (m: number) => {
    const summary = monthlySummaries.find((item) => item.month === m);
    return summary ? summary.pnl : undefined;
  };

  return (
    <div className="flex-1 bg-slate-50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-xl p-2.5 sm:p-3.5 shadow-inner flex flex-col justify-between">
      <div className="text-center mb-2">
        <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          月度盈亏 · {year}
        </span>
      </div>

      {/* 小屏 4 列 x 3 行，中大屏 6 列 x 2 行，自适应排版 */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
        {months.map((m) => {
          const isSelected = m === currentMonth;
          const pnl = getMonthlyPnL(m);

          return (
            <div
              key={m}
              onClick={() => onMonthChange?.(year, m)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all duration-200 select-none overflow-hidden",
                onMonthChange && "cursor-pointer hover:scale-[1.02]",
                isSelected
                  ? "bg-white border-emerald-500 shadow-sm dark:bg-[#0d1624] dark:border-emerald-500/80"
                  : "bg-white border-slate-200 dark:bg-[#0c1522]/80 dark:border-slate-800/60"
              )}
            >
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">
                {m}月
              </span>
              <span className={cn("text-[11px] sm:text-xs font-mono font-bold tracking-tight truncate w-full text-center", getPnLTextStyle(pnl, colorScheme))}>
                {formatPnL(pnl)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

MonthlyPnLGrid.displayName = 'MonthlyPnLGrid';

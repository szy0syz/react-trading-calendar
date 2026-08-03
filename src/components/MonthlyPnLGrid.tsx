import React from 'react';
import { MonthlySummary } from '../types';
import { useTradingCalendar } from '../context/TradingCalendarContext';
import { cn, formatPnL, getPnLTextStyle } from '../utils';

interface MonthlyPnLGridProps {
  year: number;
  currentMonth: number;
  monthlySummaries?: MonthlySummary[];
}

export const MonthlyPnLGrid: React.FC<MonthlyPnLGridProps> = React.memo(({
  year,
  currentMonth,
  monthlySummaries = [],
}) => {
  const { colorScheme, density, onMonthChange } = useTradingCalendar();
  const isCompact = density === 'compact';

  // O(1) 月度数据查找（useMemo 避免每次渲染重建 Map）
  const monthlyPnLMap = React.useMemo(
    () => new Map(monthlySummaries.map((s) => [s.month, s.pnl])),
    [monthlySummaries],
  );

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className={cn(
      "flex-1 bg-slate-50/50 border border-slate-200 dark:bg-[#0b1322]/80 dark:border-slate-800/80 rounded-xl shadow-inner flex flex-col justify-between",
      isCompact ? "p-2 sm:p-2.5" : "p-2.5 sm:p-3.5"
    )}>
      <div className="text-center mb-1.5">
        <span className="text-[11px] sm:text-xs font-medium tracking-wider text-slate-500 dark:text-slate-400">
          月度盈亏 · {year}
        </span>
      </div>

      {/* 小屏 4列×3行，中大屏 6列×2行 */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
        {months.map((m) => {
          const isSelected = m === currentMonth;
          const pnl = monthlyPnLMap.get(m);
          const hasData = monthlyPnLMap.has(m) && pnl != null;
          const isClickable = Boolean(onMonthChange && hasData);

          return (
            <div
              key={`${year}-m-${m}`}
              onClick={() => {
                if (isClickable) {
                  onMonthChange?.(year, m);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border transition-all duration-150 select-none overflow-hidden",
                isCompact ? "py-1.5 px-0.5" : "py-2 px-1",
                isClickable
                  ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  : "opacity-80 cursor-not-allowed",
                isSelected
                  ? "bg-slate-100 border-emerald-500 shadow-sm dark:bg-[#121d2d] dark:border-emerald-500/90"
                  : "bg-white border-slate-200 dark:bg-[#101926] dark:border-slate-800/40"
              )}
            >
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">
                {m}月
              </span>
              <span className={cn(
                "text-[11px] sm:text-xs font-mono font-bold tracking-tight truncate w-full text-center",
                getPnLTextStyle(pnl, colorScheme)
              )}>
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

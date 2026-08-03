import React from 'react';
import { DailyRecord, WeeklySummary } from '../types';
import { useTradingCalendar } from '../context/TradingCalendarContext';
import { useCalendarGrid } from '../hooks/useCalendarGrid';
import { cn, formatPnL, formatDayLabel, getPnLBadgeStyle, getPnLTextStyle } from '../utils';
import type { ColorScheme } from '../types';

// 仅保留数据相关 props，样式/回调均从 Context 消费

interface WeeklyCalendarGridProps {
  year: number;
  month: number;
  dailyRecords: DailyRecord[];
  weeklySummaries?: WeeklySummary[];
}

// 子组件：单日单元格

interface CalendarDayCellProps {
  day: DailyRecord;
  colorScheme: ColorScheme;
  onDateClick?: (record: DailyRecord) => void;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({ day, colorScheme, onDateClick }) => {
  const isNonTrading = day.isNonTradingDay;
  const isClickable = Boolean(onDateClick) && day.pnl != null;

  return (
    <td
      onClick={isClickable ? () => onDateClick?.(day) : undefined}
      className={cn(
        "py-2 sm:py-3 px-0.5 sm:px-1.5 text-center relative transition-colors duration-150 rounded-md sm:rounded-lg select-none overflow-hidden",
        isClickable
          ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40"
          : "cursor-default",
        isNonTrading && "bg-diagonal-stripes border border-slate-200 dark:border-slate-800/30"
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-0.5 sm:space-y-1">
        <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 dark:text-slate-400">
          {formatDayLabel(day.date)}
        </span>
        <span className={cn(
          "text-xs sm:text-sm font-mono tracking-tighter sm:tracking-tight truncate w-full inline-block",
          getPnLTextStyle(day.pnl, colorScheme)
        )}>
          {formatPnL(day.pnl)}
        </span>
      </div>
    </td>
  );
};

// 子组件：周度汇总徽章

interface WeekSummaryBadgeProps {
  weeklyPnL?: number | null;
  colorScheme: ColorScheme;
}

const WeekSummaryBadge: React.FC<WeekSummaryBadgeProps> = ({ weeklyPnL, colorScheme }) => (
  <td className="py-2 sm:py-3 px-0.5 sm:px-2 text-center">
    <span className={getPnLBadgeStyle(weeklyPnL, colorScheme)}>
      {formatPnL(weeklyPnL)}
    </span>
  </td>
);

// 主组件：纯渲染，计算逻辑委托给 useCalendarGrid

export const WeeklyCalendarGrid: React.FC<WeeklyCalendarGridProps> = React.memo(({
  year,
  month,
  dailyRecords,
  weeklySummaries,
}) => {
  const { colorScheme, onDateClick } = useTradingCalendar();
  const weekRows = useCalendarGrid(year, month, dailyRecords, weeklySummaries);

  return (
    <div className="px-3 sm:px-6 pb-2 sm:pb-3 w-full overflow-hidden">
      <table className="w-full table-fixed border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
            {/* 手机屏隐藏周数列，≥640px 展示 */}
            <th className="hidden sm:table-cell py-2 sm:py-3 px-1 sm:px-2 w-16 sm:w-20 font-normal" />
            <th className="py-2 sm:py-3 px-0.5 sm:px-2 text-center w-[16%] sm:w-[15%]">周一</th>
            <th className="py-2 sm:py-3 px-0.5 sm:px-2 text-center w-[16%] sm:w-[15%]">周二</th>
            <th className="py-2 sm:py-3 px-0.5 sm:px-2 text-center w-[16%] sm:w-[15%]">周三</th>
            <th className="py-2 sm:py-3 px-0.5 sm:px-2 text-center w-[16%] sm:w-[15%]">周四</th>
            <th className="py-2 sm:py-3 px-0.5 sm:px-2 text-center w-[16%] sm:w-[15%]">周五</th>
            <th className="py-2 sm:py-3 px-0.5 sm:px-2 text-center w-[20%] sm:w-[18%]">周度盈亏</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {weekRows.map((row, idx) => (
            <tr
              key={`${year}-${month}-week-${row.weekNumber}-${idx}`}
              className="group hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors duration-150"
            >
              <td className="hidden sm:table-cell py-2 sm:py-3 px-0.5 sm:px-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                第 {row.weekNumber} 周
              </td>

              {row.days.map((day, idx) =>
                day ? (
                  <CalendarDayCell
                    key={day.date + idx}
                    day={day}
                    colorScheme={colorScheme}
                    onDateClick={onDateClick}
                  />
                ) : (
                  <td key={idx} className="py-2 sm:py-3 px-0.5 sm:px-2" />
                )
              )}

              <WeekSummaryBadge weeklyPnL={row.weeklyPnL} colorScheme={colorScheme} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

WeeklyCalendarGrid.displayName = 'WeeklyCalendarGrid';

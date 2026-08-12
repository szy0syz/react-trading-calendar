import React from 'react';
import { DailyRecord, WeeklySummary } from '../types';
import { useTradingCalendar } from '../context/TradingCalendarContext';
import { useCalendarGrid } from '../hooks/useCalendarGrid';
import { cn, formatPnL, formatDayLabel, getPnLBadgeStyle, getPnLTextStyle } from '../utils';
import type { ColorScheme } from '../types';
import { CalendarDayTooltip } from './CalendarDayTooltip';

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
  isCompact?: boolean;
  onDateClick?: (record: DailyRecord) => void;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({ day, colorScheme, isCompact = true, onDateClick }) => {
  const isNonTrading = day.isNonTradingDay;
  const isClickable = Boolean(onDateClick) && day.pnl != null;
  const hasTrades = day.tradesCount != null && day.tradesCount > 0;

  return (
    <td
      onClick={isClickable ? () => onDateClick?.(day) : undefined}
      className={cn(
        "text-center relative group/cell transition-colors duration-150 rounded-md select-none",
        isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-1.5 sm:rounded-lg",
        isClickable
          ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40"
          : "cursor-default",
        isNonTrading && "bg-diagonal-stripes border border-slate-200/50 dark:border-slate-800/40 opacity-70"
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-0.5">
        <div className="relative inline-flex items-center justify-center">
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 dark:text-slate-400">
            {formatDayLabel(day.date)}
          </span>
          {day.hasNote && (
            <span
              data-testid="review-note-badge"
              aria-label="有复盘笔记"
              title="有复盘笔记"
              className="absolute -right-2 top-0.5 pointer-events-none block h-1 w-1 rounded-full bg-cyan-400/90 dark:bg-cyan-300/90 shadow-[0_0_4px_rgba(34,211,238,0.6)]"
            />
          )}
        </div>
        <span className={cn(
          "text-xs sm:text-sm font-mono font-bold tracking-tight truncate w-full inline-block mt-0.5",
          getPnLTextStyle(day.pnl, colorScheme)
        )}>
          {formatPnL(day.pnl)}
        </span>
      </div>

      {hasTrades && (
        <div className="hidden group-hover/cell:block">
          <CalendarDayTooltip day={day} />
        </div>
      )}
    </td>
  );
};

// 子组件：周度汇总徽章

interface WeekSummaryBadgeProps {
  weeklyPnL?: number | null;
  colorScheme: ColorScheme;
  isCompact?: boolean;
}

const WeekSummaryBadge: React.FC<WeekSummaryBadgeProps> = ({ weeklyPnL, colorScheme, isCompact = true }) => (
  <td className={cn("text-center px-0.5 sm:px-2", isCompact ? "py-1.5 sm:py-2" : "py-2 sm:py-3")}>
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
  const { colorScheme, density, onDateClick } = useTradingCalendar();
  const weekRows = useCalendarGrid(year, month, dailyRecords, weeklySummaries);
  const isCompact = density === 'compact';

  return (
    <div className="px-3.5 sm:px-6 pb-2 sm:pb-3 w-full overflow-visible">
      <table className="w-full table-fixed border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
            <th className={cn("hidden md:table-cell px-1 font-normal w-12 sm:w-20 text-slate-400", isCompact ? "py-1.5 sm:py-2" : "py-2 sm:py-3")} />
            <th className={cn("text-center w-[16%] sm:w-[15%]", isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-2")}>周一</th>
            <th className={cn("text-center w-[16%] sm:w-[15%]", isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-2")}>周二</th>
            <th className={cn("text-center w-[16%] sm:w-[15%]", isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-2")}>周三</th>
            <th className={cn("text-center w-[16%] sm:w-[15%]", isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-2")}>周四</th>
            <th className={cn("text-center w-[16%] sm:w-[15%]", isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-2")}>周五</th>
            <th className={cn("text-center w-[20%] sm:w-[18%]", isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-2")}>周度盈亏</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {weekRows.map((row, idx) => (
            <tr
              key={`${year}-${month}-week-${row.weekNumber}-${idx}`}
              className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors duration-150"
            >
              <td className={cn(
                "hidden md:table-cell px-0.5 sm:px-1 text-[10px] sm:text-xs font-normal text-slate-400 dark:text-slate-400 whitespace-nowrap select-none",
                isCompact ? "py-1.5 sm:py-2" : "py-2 sm:py-3"
              )}>
                第 {row.weekNumber} 周
              </td>

              {row.days.map((day, idx) =>
                day ? (
                  <CalendarDayCell
                    key={day.date + idx}
                    day={day}
                    colorScheme={colorScheme}
                    isCompact={isCompact}
                    onDateClick={onDateClick}
                  />
                ) : (
                  <td key={idx} className={cn("px-0.5 sm:px-1", isCompact ? "py-1.5 sm:py-2" : "py-2 sm:py-3")} />
                )
              )}

              <WeekSummaryBadge weeklyPnL={row.weeklyPnL} colorScheme={colorScheme} isCompact={isCompact} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

WeeklyCalendarGrid.displayName = 'WeeklyCalendarGrid';

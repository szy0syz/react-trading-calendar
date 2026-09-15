import React, { useRef, useState } from 'react';
import { DailyRecord, WeeklySummary, CellEffectLevel, isCalendarLevelEffect } from '../types';
import { useTradingCalendar } from '../context/TradingCalendarContext';
import { useTradingEffect, LocalCellEffects } from './effects';
import { useCalendarGrid } from '../hooks/useCalendarGrid';
import { cn, formatPnL, formatDayLabel, getPnLBadgeStyle, getPnLTextStyle } from '../utils';
import type { ColorScheme } from '../types';
import { CalendarDayTooltip } from './CalendarDayTooltip';
import { Poptip } from './Poptip';

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

  const { onCellHoverEffect } = useTradingCalendar();
  const { activeGlobalEffect, requestGlobalEffect, cancelPendingIntent } = useTradingEffect();
  const [localEffect, setLocalEffect] = useState<CellEffectLevel | null>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  const isTarget = activeGlobalEffect?.targetDate === day.date;

  const handleMouseEnter = () => {
    if (!onCellHoverEffect || isNonTrading) return;
    const effectLevel = onCellHoverEffect(day);
    if (!effectLevel) return;

    if (isCalendarLevelEffect(effectLevel)) {
      const rootEl = cellRef.current?.closest('.tc-calendar-root');
      if (cellRef.current && rootEl) {
        const cellRect = cellRef.current.getBoundingClientRect();
        const rootRect = rootEl.getBoundingClientRect();
        requestGlobalEffect(day.date, effectLevel, {
          x: cellRect.left - rootRect.left + cellRect.width / 2,
          y: cellRect.top - rootRect.top + cellRect.height / 2,
          width: cellRect.width,
          height: cellRect.height,
        });
      }
    } else {
      setLocalEffect(effectLevel);
    }
  };

  const handleMouseLeave = () => {
    cancelPendingIntent(day.date);
    if (localEffect) {
      setLocalEffect(null);
    }
  };

  const cellBody = (
    <div
      ref={cellRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-date={day.date}
      data-effect-target={isTarget ? 'true' : undefined}
      className={cn(
        "tc-calendar-cell relative flex flex-col items-center justify-center space-y-0.5 w-full h-full rounded-md transition-colors duration-150 select-none",
        isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-1.5 sm:rounded-lg",
        isClickable ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50" : "cursor-default",
        isNonTrading && "bg-diagonal-stripes border border-slate-200/50 dark:border-slate-800/40 opacity-70"
      )}
    >
      {/* 局部级微动效（纯 Cell 局部自闭环） */}
      {localEffect && <LocalCellEffects level={localEffect} />}

      <div className="relative inline-flex items-center justify-center">
        <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 dark:text-slate-400">
          {formatDayLabel(day.date)}
        </span>
        {day.hasNote && (
          <span
            data-testid="review-note-badge"
            role="img"
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
  );

  return (
    <td
      onClick={isClickable ? () => onDateClick?.(day) : undefined}
      className="text-center p-0 align-middle"
    >
      {hasTrades ? (
        <Poptip
          content={<CalendarDayTooltip day={day} />}
          placement="top"
          className="w-full h-full flex"
        >
          {cellBody}
        </Poptip>
      ) : (
        cellBody
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
  <td className={cn("text-center px-0.5 sm:px-1.5", isCompact ? "py-1.5 sm:py-2" : "py-2 sm:py-3")}>
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
    <div className="px-2 sm:px-6 pb-1.5 sm:pb-2 w-full overflow-visible">
      <table className="w-full table-fixed border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
            <th className={cn("hidden md:table-cell px-1 font-normal w-12 sm:w-20 text-slate-400", isCompact ? "py-1.5 sm:py-2" : "py-2 sm:py-3")} />
            <th className={cn("text-center w-[15%]", isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-2")}>周一</th>
            <th className={cn("text-center w-[15%]", isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-2")}>周二</th>
            <th className={cn("text-center w-[15%]", isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-2")}>周三</th>
            <th className={cn("text-center w-[15%]", isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-2")}>周四</th>
            <th className={cn("text-center w-[15%]", isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-2")}>周五</th>
            <th className={cn("text-center w-[25%] sm:w-[18%]", isCompact ? "py-1.5 sm:py-2 px-0.5 sm:px-1" : "py-2 sm:py-3 px-0.5 sm:px-2")}>
              <span className="sm:hidden">周汇总</span>
              <span className="hidden sm:inline">周度盈亏</span>
            </th>
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

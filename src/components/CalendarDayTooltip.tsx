import React from 'react';
import { Activity } from 'lucide-react';
import { DailyRecord } from '../types';

interface CalendarDayTooltipProps {
  day: DailyRecord;
}

/**
 * 每日单元格悬浮提示内容（精致紧凑排版）
 */
export const CalendarDayTooltip: React.FC<CalendarDayTooltipProps> = ({ day }) => {
  if (day.tradesCount == null || day.tradesCount <= 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap px-0.5">
      <Activity className="w-3 h-3 text-sky-500 dark:text-sky-400 shrink-0 stroke-[2.2]" />
      <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 tracking-tight">
        {`${day.tradesCount} 笔交易`}
      </span>
    </div>
  );
};

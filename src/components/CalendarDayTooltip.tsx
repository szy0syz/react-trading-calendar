import React from 'react';
import { Activity } from 'lucide-react';
import { DailyRecord } from '../types';

interface CalendarDayTooltipProps {
  day: DailyRecord;
}

export const CalendarDayTooltip: React.FC<CalendarDayTooltipProps> = ({ day }) => {
  // 仅在有交易笔数时显示
  if (day.tradesCount == null || day.tradesCount <= 0) {
    return null;
  }

  return (
    <div
      role="tooltip"
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none whitespace-nowrap transition-all duration-200 ease-out animate-in fade-in zoom-in-95"
    >
      <div className="relative rounded-md px-2.5 py-1.5 shadow-xl border bg-white text-slate-800 border-slate-200/90 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700/80 backdrop-blur-md flex items-center space-x-1.5">
        <Activity className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
        <span className="text-xs font-semibold font-mono text-slate-800 dark:text-slate-100 tracking-tight">
          {day.tradesCount} 笔交易
        </span>

        {/* 底部指示箭头 */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white border-r border-b border-slate-200/90 dark:bg-slate-800 dark:border-slate-700/80" />
      </div>
    </div>
  );
};

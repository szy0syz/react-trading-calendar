import React from 'react';
import { ColorScheme, DailyRecord, WeeklySummary } from '../types';
import { cn, formatPnL, getPnLBadgeStyle, getPnLTextStyle } from '../utils';

interface WeeklyCalendarGridProps {
  year: number;
  month: number;
  dailyRecords: DailyRecord[];
  weeklySummaries?: WeeklySummary[];
  colorScheme?: ColorScheme;
  onDateClick?: (record: DailyRecord) => void;
}

interface ProcessedWeekRow {
  weekNumber: number;
  days: (DailyRecord | null)[];
  weeklyPnL?: number;
}

export const WeeklyCalendarGrid: React.FC<WeeklyCalendarGridProps> = React.memo(({
  year,
  month,
  dailyRecords,
  weeklySummaries,
  colorScheme = 'greenUpRedDown',
  onDateClick,
}) => {
  const recordMap = React.useMemo(() => {
    const map = new Map<string, DailyRecord>();
    dailyRecords.forEach((r) => {
      map.set(r.date, r);
      if (r.date.includes('-')) {
        const parts = r.date.split('-');
        if (parts.length === 3) {
          map.set(`${parts[1]}/${parts[2]}`, r);
        }
      }
    });
    return map;
  }, [dailyRecords]);

  const weekRows = React.useMemo<ProcessedWeekRow[]>(() => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);

    const startDate = new Date(firstDayOfMonth);
    const dayOfWeek = startDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + diffToMonday);

    const rows: ProcessedWeekRow[] = [];

    const getWeekNumber = (d: Date) => {
      const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const dayNum = date.getUTCDay() || 7;
      date.setUTCDate(date.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    };

    let currPointer = new Date(startDate);

    while (currPointer <= lastDayOfMonth || rows.length < 5) {
      const currentWeekNum = getWeekNumber(currPointer);
      const daysInWeek: (DailyRecord | null)[] = [];

      let weekAutoPnL = 0;
      let hasWeekData = false;

      for (let i = 0; i < 5; i++) {
        const m = (currPointer.getMonth() + 1).toString().padStart(2, '0');
        const d = currPointer.getDate().toString().padStart(2, '0');
        const yyyy = currPointer.getFullYear();
        const fullDateStr = `${yyyy}-${m}-${d}`;
        const shortDateStr = `${m}/${d}`;

        const found = recordMap.get(fullDateStr) || recordMap.get(shortDateStr);

        if (found) {
          daysInWeek.push(found);
          if (found.pnl !== undefined && found.pnl !== null) {
            weekAutoPnL += found.pnl;
            hasWeekData = true;
          }
        } else {
          daysInWeek.push({
            date: shortDateStr,
            pnl: undefined,
          });
        }

        currPointer.setDate(currPointer.getDate() + 1);
      }

      currPointer.setDate(currPointer.getDate() + 2);

      const customWeekSummary = weeklySummaries?.find((w) => w.weekNumber === currentWeekNum);
      const finalWeekPnL = customWeekSummary ? customWeekSummary.pnl : (hasWeekData ? weekAutoPnL : undefined);

      rows.push({
        weekNumber: currentWeekNum,
        days: daysInWeek,
        weeklyPnL: finalWeekPnL,
      });

      if (rows.length >= 6) break;
    }

    return rows;
  }, [year, month, recordMap, weeklySummaries]);

  return (
    <div className="px-3 sm:px-6 pb-4 sm:pb-6 w-full overflow-hidden">
      <table className="w-full table-fixed border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
            {/* 手机屏 (＜640px) 隐藏周数列，仅在 Tablet/iPad/Desktop (≥640px) 展示 */}
            <th className="hidden sm:table-cell py-2 sm:py-3 px-1 sm:px-2 w-16 sm:w-20 font-normal"></th>
            <th className="py-2 sm:py-3 px-0.5 sm:px-2 text-center w-[16%] sm:w-[15%]">周一</th>
            <th className="py-2 sm:py-3 px-0.5 sm:px-2 text-center w-[16%] sm:w-[15%]">周二</th>
            <th className="py-2 sm:py-3 px-0.5 sm:px-2 text-center w-[16%] sm:w-[15%]">周三</th>
            <th className="py-2 sm:py-3 px-0.5 sm:px-2 text-center w-[16%] sm:w-[15%]">周四</th>
            <th className="py-2 sm:py-3 px-0.5 sm:px-2 text-center w-[16%] sm:w-[15%]">周五</th>
            <th className="py-2 sm:py-3 px-0.5 sm:px-2 text-center w-[20%] sm:w-[18%]">周度盈亏</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {weekRows.map((row) => (
            <tr key={row.weekNumber} className="group hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors duration-150">
              {/* 周数文本列：手机屏隐藏 (hidden)，Tablet/iPad/Desktop 显示 (sm:table-cell) */}
              <td className="hidden sm:table-cell py-2 sm:py-3 px-0.5 sm:px-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                第 {row.weekNumber} 周
              </td>

              {row.days.map((day, idx) => {
                if (!day) return <td key={idx} className="py-2 sm:py-3 px-0.5 sm:px-2"></td>;

                const isNonTrading = day.isNonTradingDay;

                return (
                  <td
                    key={day.date + idx}
                    onClick={() => onDateClick?.(day)}
                    className={cn(
                      "py-2 sm:py-3 px-0.5 sm:px-1.5 text-center relative transition-all duration-150 rounded-md sm:rounded-lg select-none overflow-hidden",
                      onDateClick && "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40",
                      isNonTrading && "bg-diagonal-stripes border border-slate-200 dark:border-slate-800/30"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center space-y-0.5 sm:space-y-1">
                      <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 dark:text-slate-400">
                        {day.date.includes('-') ? day.date.substring(5).replace('-', '/') : day.date}
                      </span>
                      <span className={cn("text-xs sm:text-sm font-mono tracking-tighter sm:tracking-tight truncate w-full inline-block", getPnLTextStyle(day.pnl, colorScheme))}>
                        {formatPnL(day.pnl)}
                      </span>
                    </div>
                  </td>
                );
              })}

              <td className="py-2 sm:py-3 px-0.5 sm:px-2 text-center">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-full px-1 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-mono font-bold border shadow-sm transition-all duration-200 truncate",
                    getPnLBadgeStyle(row.weeklyPnL, colorScheme)
                  )}
                >
                  {formatPnL(row.weeklyPnL)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

WeeklyCalendarGrid.displayName = 'WeeklyCalendarGrid';

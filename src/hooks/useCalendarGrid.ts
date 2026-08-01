import React from 'react';
import type { DailyRecord, WeeklySummary } from '../types';
import { normalizeDateKey } from '../utils';

// 供 WeeklyCalendarGrid 共用

export interface ProcessedWeekRow {
  /** ISO 周数 */
  weekNumber: number;
  /** 周内 5 个交易日数据，null 表示占位（该位置无数据的情况） */
  days: (DailyRecord | null)[];
  /** 周度盈亏（优先使用 weeklySummaries 中的数据，fallback 到自动累计） */
  weeklyPnL?: number | null;
}

// ISO 8601 周数计算（珬立纯函数，便于单元测试）

export function getISOWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// 构建 DailyRecord 查找 Map，同时索引 YYYY-MM-DD 和 MM/DD 两种格式

export function buildRecordMap(records: DailyRecord[]): Map<string, DailyRecord> {
  const map = new Map<string, DailyRecord>();
  for (const r of records) {
    map.set(r.date, r);
    // 若原始数据为 YYYY-MM-DD 格式，同时建立 MM/DD 的快捷索引
    const normalized = normalizeDateKey(r.date);
    if (normalized !== r.date) {
      map.set(normalized, r);
    }
  }
  return map;
}

// 构建当月周行数据

export function buildWeekRows(
  year: number,
  month: number,
  recordMap: Map<string, DailyRecord>,
  weeklySummaries?: WeeklySummary[],
): ProcessedWeekRow[] {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);

  // 找到包含本月第一天的周的周一
  const startDate = new Date(firstDayOfMonth);
  const dow = startDate.getDay(); // 0=Sun
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  startDate.setDate(startDate.getDate() + diffToMonday);

  const rows: ProcessedWeekRow[] = [];
  const currPointer = new Date(startDate);

  while (currPointer <= lastDayOfMonth || rows.length < 5) {
    const currentWeekNum = getISOWeekNumber(currPointer);
    const daysInWeek: (DailyRecord | null)[] = [];

    let weekAutoPnL = 0;
    let hasWeekData = false;

    // 遍历周一到周五（5 个交易日）
    for (let i = 0; i < 5; i++) {
      const mm = (currPointer.getMonth() + 1).toString().padStart(2, '0');
      const dd = currPointer.getDate().toString().padStart(2, '0');
      const yyyy = currPointer.getFullYear();

      const fullDateStr = `${yyyy}-${mm}-${dd}`;
      const shortDateStr = `${mm}/${dd}`;

      const found = recordMap.get(fullDateStr) ?? recordMap.get(shortDateStr);

      if (found) {
        daysInWeek.push(found);
        if (found.pnl != null) {
          weekAutoPnL += found.pnl;
          hasWeekData = true;
        }
      } else {
        // 无数据的交易日：用 shortDateStr 占位，方便渲染
        daysInWeek.push({ date: shortDateStr, pnl: undefined });
      }

      currPointer.setDate(currPointer.getDate() + 1);
    }

    // 跳过周六、周日
    currPointer.setDate(currPointer.getDate() + 2);

    // 优先使用外部传入的 weeklySummaries，否则用自动累计值
    const customWeekSummary = weeklySummaries?.find((w) => w.weekNumber === currentWeekNum);
    const finalWeekPnL = customWeekSummary
      ? customWeekSummary.pnl
      : hasWeekData
        ? weekAutoPnL
        : undefined;

    rows.push({ weekNumber: currentWeekNum, days: daysInWeek, weeklyPnL: finalWeekPnL });

    if (rows.length >= 6) break;
  }

  return rows;
}

// 自定义 Hook：组合 buildRecordMap + buildWeekRows，供组件直接消费

export function useCalendarGrid(
  year: number,
  month: number,
  dailyRecords: DailyRecord[],
  weeklySummaries?: WeeklySummary[],
): ProcessedWeekRow[] {
  const recordMap = React.useMemo(() => buildRecordMap(dailyRecords), [dailyRecords]);

  const weekRows = React.useMemo(
    () => buildWeekRows(year, month, recordMap, weeklySummaries),
    [year, month, recordMap, weeklySummaries],
  );

  return weekRows;
}

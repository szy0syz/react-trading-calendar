import { describe, it, expect } from 'vitest';
import { getISOWeekNumber, buildRecordMap, buildWeekRows } from './useCalendarGrid';
import type { DailyRecord } from '../types';

describe('useCalendarGrid pure functions', () => {
  // ---------------------------------------------------------------------------
  // getISOWeekNumber
  // ---------------------------------------------------------------------------

  describe('getISOWeekNumber', () => {
    it('should return correct ISO week number for a known date', () => {
      // 2026-01-01 is a Thursday, ISO week 1
      expect(getISOWeekNumber(new Date(2026, 0, 1))).toBe(1);
    });

    it('should return week 1 for the first week of 2024 (Jan 1 is a Monday)', () => {
      expect(getISOWeekNumber(new Date(2024, 0, 1))).toBe(1);
    });

    it('should handle Sunday correctly (treated as day 7 in ISO)', () => {
      // 2026-08-02 is a Sunday, same week as Mon 2026-07-27
      const sunday = new Date(2026, 7, 2);
      const monday = new Date(2026, 6, 27);
      expect(getISOWeekNumber(sunday)).toBe(getISOWeekNumber(monday));
    });

    it('should correctly compute week 31 for 2026-07-28 (Monday)', () => {
      expect(getISOWeekNumber(new Date(2026, 6, 28))).toBe(31);
    });
  });

  // ---------------------------------------------------------------------------
  // buildRecordMap
  // ---------------------------------------------------------------------------

  describe('buildRecordMap', () => {
    it('should index records by their original date key', () => {
      const records: DailyRecord[] = [{ date: '07/15', pnl: 100 }];
      const map = buildRecordMap(records);
      expect(map.get('07/15')).toEqual({ date: '07/15', pnl: 100 });
    });

    it('should create a MM/DD shorthand index for YYYY-MM-DD records', () => {
      const records: DailyRecord[] = [{ date: '2026-07-15', pnl: 200 }];
      const map = buildRecordMap(records);
      // Original key
      expect(map.get('2026-07-15')).toBeDefined();
      // Shorthand key
      expect(map.get('07/15')).toBeDefined();
      expect(map.get('07/15')?.pnl).toBe(200);
    });

    it('should handle empty array', () => {
      const map = buildRecordMap([]);
      expect(map.size).toBe(0);
    });

    it('should handle records with null pnl', () => {
      const records: DailyRecord[] = [{ date: '2026-07-15', pnl: null }];
      const map = buildRecordMap(records);
      expect(map.get('2026-07-15')?.pnl).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // buildWeekRows
  // ---------------------------------------------------------------------------

  describe('buildWeekRows', () => {
    it('should return 5 or 6 rows for a typical month', () => {
      const rows = buildWeekRows(2026, 7, new Map());
      expect(rows.length).toBeGreaterThanOrEqual(5);
      expect(rows.length).toBeLessThanOrEqual(6);
    });

    it('should populate days with placeholder records for dates without data', () => {
      const rows = buildWeekRows(2026, 7, new Map());
      rows.forEach((row) => {
        expect(row.days).toHaveLength(5); // Mon-Fri
        row.days.forEach((day) => {
          expect(day).not.toBeNull();
        });
      });
    });

    it('should inject DailyRecord data when recordMap contains matching date', () => {
      const record: DailyRecord = { date: '2026-07-07', pnl: 500 };
      const map = buildRecordMap([record]);
      const rows = buildWeekRows(2026, 7, map);
      const allDays = rows.flatMap((r) => r.days).filter(Boolean) as DailyRecord[];
      const matched = allDays.find((d) => d.pnl === 500);
      expect(matched).toBeDefined();
    });

    it('should prefer weeklySummaries pnl over auto-computed weekly total', () => {
      const rows = buildWeekRows(2026, 7, new Map(), [{ weekNumber: 27, pnl: 9999 }]);
      const week27 = rows.find((r) => r.weekNumber === 27);
      if (week27) {
        expect(week27.weeklyPnL).toBe(9999);
      }
    });

    it('should handle cross-year boundary (December → January)', () => {
      const rows = buildWeekRows(2025, 12, new Map());
      expect(rows.length).toBeGreaterThanOrEqual(5);
    });

    it('should skip previous month week when month starts on Sunday (e.g. March 2026)', () => {
      // 2026-03-01 is Sunday. Week 9 (Feb 23-27) has 0 days in March.
      // First trading row must be Week 10 starting on 03/02.
      const rows = buildWeekRows(2026, 3, new Map());
      expect(rows[0].weekNumber).toBe(10);
      expect(rows[0].days[0]?.date).toBe('03/02');
      expect(rows.length).toBe(5);
    });

    it('should skip previous month week when month starts on Saturday (e.g. August 2026)', () => {
      // 2026-08-01 is Saturday.
      // First trading row must start on Monday 08/03.
      const rows = buildWeekRows(2026, 8, new Map());
      expect(rows[0].days[0]?.date).toBe('08/03');
      expect(rows.length).toBe(5);
    });

    it('should return exactly 4 rows for a 28-day February starting on Monday (e.g. Feb 2021)', () => {
      const rows = buildWeekRows(2021, 2, new Map());
      expect(rows.length).toBe(4);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  formatPnL,
  formatPercent,
  getPnLTextStyle,
  getPnLBadgeStyle,
  normalizeDateKey,
  formatDayLabel,
} from './utils';

describe('utils formatting helper functions', () => {
  describe('formatPnL', () => {
    it('should format positive PnL with plus sign and comma separators', () => {
      expect(formatPnL(10273)).toBe('+10,273');
      expect(formatPnL(500)).toBe('+500');
    });

    it('should format negative PnL with minus sign and comma separators', () => {
      expect(formatPnL(-4709)).toBe('-4,709');
      expect(formatPnL(-100)).toBe('-100');
    });

    it('should format 0 as "0"', () => {
      expect(formatPnL(0)).toBe('0');
    });

    it('should return "—" for undefined or null values', () => {
      expect(formatPnL(undefined)).toBe('—');
      expect(formatPnL(null)).toBe('—');
    });
  });

  describe('formatPercent', () => {
    it('should format positive percentage correctly', () => {
      expect(formatPercent(0.3696)).toBe('+36.96%');
      expect(formatPercent(0.1)).toBe('+10.00%');
    });

    it('should format negative percentage correctly', () => {
      expect(formatPercent(-0.155)).toBe('-15.50%');
    });

    it('should return "—" for undefined or null values', () => {
      expect(formatPercent(undefined)).toBe('—');
      expect(formatPercent(null)).toBe('—');
    });
  });

  describe('getPnLTextStyle (Green Up vs Red Up)', () => {
    it('should apply green for positive and red for negative in greenUpRedDown mode', () => {
      const posClass = getPnLTextStyle(100, 'greenUpRedDown');
      const negClass = getPnLTextStyle(-100, 'greenUpRedDown');
      expect(posClass).toContain('text-emerald');
      expect(negClass).toContain('text-rose');
    });

    it('should reverse colors in redUpGreenDown mode (A-share)', () => {
      const posClass = getPnLTextStyle(100, 'redUpGreenDown');
      const negClass = getPnLTextStyle(-100, 'redUpGreenDown');
      expect(posClass).toContain('text-rose');
      expect(negClass).toContain('text-emerald');
    });

    it('should return neutral text style for 0 or undefined', () => {
      const neutralClass = getPnLTextStyle(undefined, 'greenUpRedDown');
      expect(neutralClass).toContain('text-slate-400');
    });

    it('should return neutral text style for null', () => {
      const nullClass = getPnLTextStyle(null, 'greenUpRedDown');
      expect(nullClass).toContain('text-slate-400');
    });
  });

  describe('getPnLBadgeStyle', () => {
    it('should return appropriate badge background and border classes for positive PnL', () => {
      const style = getPnLBadgeStyle(500, 'greenUpRedDown');
      expect(style).toContain('bg-emerald-50');
      expect(style).toContain('text-emerald-600');
    });

    it('should return appropriate badge background and border classes for negative PnL', () => {
      const style = getPnLBadgeStyle(-500, 'greenUpRedDown');
      expect(style).toContain('bg-rose-50');
      expect(style).toContain('text-rose-600');
    });

    it('should return neutral badge style for undefined', () => {
      const style = getPnLBadgeStyle(undefined);
      expect(style).toContain('bg-slate-100');
    });

    it('should return zero badge style for 0', () => {
      const style = getPnLBadgeStyle(0);
      expect(style).toContain('bg-slate-200');
    });
  });

  describe('normalizeDateKey', () => {
    it('should convert YYYY-MM-DD to MM/DD', () => {
      expect(normalizeDateKey('2026-07-15')).toBe('07/15');
      expect(normalizeDateKey('2026-01-01')).toBe('01/01');
    });

    it('should return MM/DD format unchanged', () => {
      expect(normalizeDateKey('07/15')).toBe('07/15');
      expect(normalizeDateKey('01/01')).toBe('01/01');
    });
  });

  describe('formatDayLabel', () => {
    it('should format YYYY-MM-DD to MM/DD for display', () => {
      expect(formatDayLabel('2026-08-01')).toBe('08/01');
    });

    it('should return MM/DD unchanged', () => {
      expect(formatDayLabel('08/01')).toBe('08/01');
    });
  });
});

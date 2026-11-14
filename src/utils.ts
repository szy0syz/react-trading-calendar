import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { COLOR_SCHEME_TOKENS, getPnLSentiment, pnlBadgeVariants } from './theme/colorSchemes';
import type { ColorScheme, DailyRecord, MonthlySummary } from './types';


// Tailwind 类名合并工具

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 数值格式化

/** 格式化 PnL 金额，四舍五入不要小数，undefined/null 返回 "—" */
export function formatPnL(val?: number | null): string {
  if (val == null) return '—';
  const rounded = Math.round(val);
  if (rounded === 0) return '0';
  const formatted = Math.abs(rounded).toLocaleString('en-US');
  return rounded > 0 ? `+${formatted}` : `-${formatted}`;
}

/** 格式化百分比（小数形式输入，如 0.3696 → "+37%"），四舍五入不要小数 */
export function formatPercent(val?: number | null): string {
  if (val == null) return '—';
  const pct = Math.round(val * 100);
  if (pct === 0) return '0%';
  return val > 0 ? `+${pct}%` : `${pct}%`;
}

/** 格式化本金/资金金额简写（例如 100000 → "$100k", 1500000 → "$1.5M"），支持可选 fallback（默认 "—"） */
export function formatCapital(val?: number | null, fallback = '—'): string {
  if (val == null || isNaN(val)) return fallback;
  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (absVal >= 1_000_000) {
    const m = absVal / 1_000_000;
    return `${sign}$${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  if (absVal >= 1_000) {
    const k = absVal / 1_000;
    return `${sign}$${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }
  return `${sign}$${absVal.toLocaleString('en-US')}`;
}



// PnL 样式工具（消费 COLOR_SCHEME_TOKENS 配置，无 if-else 枚举）

/** 返回 PnL 文本颜色 + 字重 Tailwind 类 */
export function getPnLTextStyle(
  val?: number | null,
  colorScheme: ColorScheme = 'greenUpRedDown',
): string {
  const sentiment = getPnLSentiment(val);
  if (sentiment === 'empty' || sentiment === 'zero') {
    return 'text-slate-400 dark:text-slate-500 font-normal';
  }
  return COLOR_SCHEME_TOKENS[colorScheme][sentiment].text;
}

/** 返回 PnL 徽章背景 + 边框 + 文本 Tailwind 类（含 CVA base 类） */
export function getPnLBadgeStyle(
  val?: number | null,
  colorScheme: ColorScheme = 'greenUpRedDown',
): string {
  const sentiment = getPnLSentiment(val);
  const base = pnlBadgeVariants({ sentiment });
  if (sentiment === 'empty' || sentiment === 'zero') return base;
  return cn(base, COLOR_SCHEME_TOKENS[colorScheme][sentiment].badge);
}

// 日期格式与日历推算工具（外部及内部对日期处理的统一纯函数入口）

export interface ParsedDateParts {
  year?: number;
  month: number;
  day: number;
}

/**
 * 统一解析 YYYY-MM-DD 或 MM/DD 日期字符串
 */
export function parseDateParts(date: string): ParsedDateParts | null {
  if (!date) return null;
  const s = date.trim();
  if (s.length === 10 && s[4] === '-' && s[7] === '-') {
    const year = Number(s.slice(0, 4));
    const month = Number(s.slice(5, 7));
    const day = Number(s.slice(8, 10));
    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
      return { year, month, day };
    }
    return null;
  }
  if (s.includes('/')) {
    const [mStr, dStr] = s.split('/');
    const month = Number(mStr);
    const day = Number(dStr);
    if (!Number.isNaN(month) && !Number.isNaN(day)) {
      return { month, day };
    }
  }
  return null;
}

/**
 * 推算上个月 (-1) 或下个月 (+1) 的年份与月份
 */
export function shiftYearMonth(
  year: number,
  month: number,
  delta: -1 | 1,
): { year: number; month: number } {
  if (delta === -1) {
    return {
      year: month === 1 ? year - 1 : year,
      month: month === 1 ? 12 : month - 1,
    };
  }
  return {
    year: month === 12 ? year + 1 : year,
    month: month === 12 ? 1 : month + 1,
  };
}

/**
 * 将 YYYY-MM-DD 格式日期规范化为 MM/DD（用于 Map 索引 key 统一）。
 * 已是 MM/DD 格式的字符串原样返回。
 */
export function normalizeDateKey(date: string): string {
  if (date.length === 10 && date[4] === '-' && date[7] === '-') {
    // YYYY-MM-DD → MM/DD
    return `${date.slice(5, 7)}/${date.slice(8, 10)}`;
  }
  return date;
}

/**
 * 将日期字符串格式化为渲染用的 MM/DD 标签。
 * 支持 YYYY-MM-DD 和 MM/DD 两种输入格式。
 */
export function formatDayLabel(date: string): string {
  return normalizeDateKey(date);
}

/**
 * 判断日期字符串是否属于当前视图月份（支持 YYYY-MM-DD 和 MM/DD 格式）
 */
export function isCurrentMonthDate(
  date: string,
  month: number,
  year?: number,
): boolean {
  const parts = parseDateParts(date);
  if (!parts) return false;
  if (parts.year !== undefined && year !== undefined) {
    return parts.year === year && parts.month === month;
  }
  return parts.month === month;
}

/**
 * 检查指定年份和月份是否有交易记录或月度总结数据
 */
export function hasMonthData(
  targetYear: number,
  targetMonth: number,
  dailyRecords: DailyRecord[] = [],
  monthlySummaries: MonthlySummary[] = [],
  currentYear: number = targetYear,
): boolean {
  const hasInMonthly = monthlySummaries.some(
    (s) => s.month === targetMonth && s.pnl != null,
  );
  if (hasInMonthly) return true;

  return dailyRecords.some((record) => {
    if (!record?.date) return false;
    const parts = parseDateParts(record.date);
    if (!parts) return false;
    const recordYear = parts.year ?? currentYear;
    return recordYear === targetYear && parts.month === targetMonth;
  });
}


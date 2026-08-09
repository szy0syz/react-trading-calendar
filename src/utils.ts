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

// 日期格式工具（下面两个函数是外部对日期处理的唯一入口）

/**
 * 将 YYYY-MM-DD 格式日期规范化为 MM/DD（用于 Map 索引 key 统一）。
 * 已是 MM/DD 格式的字符串原样返回。
 * 这是日期格式处理的唯一入口，避免"魔法"散落各处。
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
 * 检查指定年份和月份是否有交易记录或月度总结数据
 */
export function hasMonthData(
  targetYear: number,
  targetMonth: number,
  dailyRecords: DailyRecord[] = [],
  monthlySummaries: MonthlySummary[] = [],
  currentYear: number = targetYear
): boolean {
  // 1. 检查 monthlySummaries 中是否有该月份的有效 PnL 数据
  const hasInMonthly = monthlySummaries.some(
    (s) => s.month === targetMonth && s.pnl != null
  );
  if (hasInMonthly) return true;

  // 2. 检查 dailyRecords 中是否有属于 targetYear 和 targetMonth 的记录
  const hasInDaily = dailyRecords.some((record) => {
    if (!record || !record.date) return false;
    const dateStr = record.date.trim();

    // 格式: YYYY-MM-DD
    if (dateStr.length === 10 && dateStr[4] === '-' && dateStr[7] === '-') {
      const y = parseInt(dateStr.slice(0, 4), 10);
      const m = parseInt(dateStr.slice(5, 7), 10);
      return y === targetYear && m === targetMonth;
    }

    // 格式: MM/DD
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      const m = parseInt(parts[0], 10);
      return m === targetMonth && targetYear === currentYear;
    }

    return false;
  });

  return hasInDaily;
}


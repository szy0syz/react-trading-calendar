import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { COLOR_SCHEME_TOKENS, getPnLSentiment, pnlBadgeVariants } from './theme/colorSchemes';
import type { ColorScheme } from './types';

// Tailwind 类名合并工具

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 数值格式化

/** 格式化 PnL 金额，undefined/null 返回 "—" */
export function formatPnL(val?: number | null): string {
  if (val == null) return '—';
  if (val === 0) return '0';
  const formatted = Math.abs(val).toLocaleString('en-US');
  return val > 0 ? `+${formatted}` : `-${formatted}`;
}

/** 格式化百分比（小数形式输入，如 0.3696 → "+36.96%"） */
export function formatPercent(val?: number | null): string {
  if (val == null) return '—';
  const pct = (val * 100).toFixed(2);
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

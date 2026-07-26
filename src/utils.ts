import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ColorScheme } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPnL(val?: number): string {
  if (val === undefined || val === null) {
    return '—';
  }
  if (val === 0) {
    return '0';
  }
  const formatted = Math.abs(val).toLocaleString('en-US');
  return val > 0 ? `+${formatted}` : `-${formatted}`;
}

export function formatPercent(val?: number): string {
  if (val === undefined || val === null) return '—';
  const pct = (val * 100).toFixed(2);
  return val > 0 ? `+${pct}%` : `${pct}%`;
}

export function getPnLTextStyle(val?: number, colorScheme: ColorScheme = 'greenUpRedDown'): string {
  if (val === undefined || val === null || val === 0) {
    return 'text-slate-400 dark:text-slate-500 font-normal';
  }

  const isPositive = val > 0;
  if (colorScheme === 'greenUpRedDown') {
    return isPositive ? 'text-emerald-500 dark:text-emerald-400 font-semibold' : 'text-rose-500 dark:text-rose-400 font-semibold';
  }
  return isPositive ? 'text-rose-500 dark:text-rose-400 font-semibold' : 'text-emerald-500 dark:text-emerald-400 font-semibold';
}

export function getPnLBadgeStyle(val?: number, colorScheme: ColorScheme = 'greenUpRedDown'): string {
  if (val === undefined || val === null) {
    return 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-900/40 dark:border-slate-800/80 dark:text-slate-500';
  }
  if (val === 0) {
    return 'bg-slate-200 border-slate-300 text-slate-700 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300';
  }

  const isPositive = val > 0;
  if (colorScheme === 'greenUpRedDown') {
    return isPositive
      ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-[#081b18] dark:border-emerald-500/40 dark:text-emerald-400'
      : 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-[#1a0a0d] dark:border-rose-500/40 dark:text-rose-400';
  }
  return isPositive
    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-[#1a0a0d] dark:border-rose-500/40 dark:text-rose-400'
    : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-[#081b18] dark:border-emerald-500/40 dark:text-emerald-400';
}

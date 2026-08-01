import { cva } from 'class-variance-authority';
import type { ColorScheme } from '../types';

// 颜色方案 Token 表
// 新增 colorScheme 只需在此处追加一条记录，无需修改任何函数（开闭原则）

interface ColorTokens {
  positive: { text: string; badge: string };
  negative: { text: string; badge: string };
}

export const COLOR_SCHEME_TOKENS: Record<ColorScheme, ColorTokens> = {
  greenUpRedDown: {
    positive: {
      text: 'text-emerald-500 dark:text-emerald-400 font-semibold',
      badge:
        'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-[#081b18] dark:border-emerald-500/40 dark:text-emerald-400',
    },
    negative: {
      text: 'text-rose-500 dark:text-rose-400 font-semibold',
      badge:
        'bg-rose-50 border-rose-200 text-rose-600 dark:bg-[#1a0a0d] dark:border-rose-500/40 dark:text-rose-400',
    },
  },
  redUpGreenDown: {
    positive: {
      text: 'text-rose-500 dark:text-rose-400 font-semibold',
      badge:
        'bg-rose-50 border-rose-200 text-rose-600 dark:bg-[#1a0a0d] dark:border-rose-500/40 dark:text-rose-400',
    },
    negative: {
      text: 'text-emerald-500 dark:text-emerald-400 font-semibold',
      badge:
        'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-[#081b18] dark:border-emerald-500/40 dark:text-emerald-400',
    },
  },
};

// CVA 变体：周度汇总徽章
// positive/negative 的颜色 token 由调用者从 COLOR_SCHEME_TOKENS 中注入（见 getPnLBadgeStyle）
export const pnlBadgeVariants = cva(
  'inline-flex items-center justify-center w-full px-1 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-mono font-bold border shadow-sm transition-all duration-200 truncate',
  {
    variants: {
      sentiment: {
        positive: '',
        negative: '',
        zero: 'bg-slate-200 border-slate-300 text-slate-700 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300',
        empty: 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-900/40 dark:border-slate-800/80 dark:text-slate-500',
      },
    },
    defaultVariants: { sentiment: 'empty' },
  },
);

// 根据 PnL 值派生 sentiment 类型，作为 CVA/Token 查找的统一入口

export type PnLSentiment = 'positive' | 'negative' | 'zero' | 'empty';

export function getPnLSentiment(val?: number | null): PnLSentiment {
  if (val == null) return 'empty';
  if (val === 0) return 'zero';
  return val > 0 ? 'positive' : 'negative';
}

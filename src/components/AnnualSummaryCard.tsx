import React from 'react';
import { Info } from 'lucide-react';
import { AnnualSummary, ColorScheme } from '../types';
import { cn, formatPercent, formatPnL, getPnLTextStyle } from '../utils';

interface AnnualSummaryCardProps {
  annualSummary?: AnnualSummary;
  colorScheme?: ColorScheme;
}

export const AnnualSummaryCard: React.FC<AnnualSummaryCardProps> = React.memo(({
  annualSummary,
  colorScheme = 'greenUpRedDown',
}) => {
  const rate = annualSummary?.annualizedReturnRate;
  const totalPnL = annualSummary?.totalPnL;

  return (
    <div className="w-full md:w-60 shrink-0 relative p-[1.5px] rounded-xl overflow-hidden shadow-lg border border-emerald-500/30 dark:border-emerald-500/40">
      <div className="absolute inset-[-150%] animate-border-spin bg-[conic-gradient(from_0deg,transparent_0deg,rgba(251,191,36,0.25)_18deg,#fbbf24_45deg,rgba(251,191,36,0.25)_72deg,transparent_90deg,transparent_360deg)] opacity-95 pointer-events-none" />

      <div className="relative z-10 w-full h-full bg-slate-50 dark:bg-[#0c1522] rounded-[10px] p-2.5 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="flex items-center space-x-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>年化收益率</span>
          <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer" />
        </div>

        <div className="mt-1 mb-2">
          <span
            className={cn(
              "text-2xl md:text-3xl font-extrabold font-mono tracking-tight leading-none",
              getPnLTextStyle(rate, colorScheme)
            )}
          >
            {formatPercent(rate)}
          </span>
        </div>

        <div className="flex flex-col items-center mt-3">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0">
            今年收益
          </span>
          <span
            className={cn(
              "text-base md:text-lg font-bold font-mono tracking-tight",
              getPnLTextStyle(totalPnL, colorScheme)
            )}
          >
            {formatPnL(totalPnL)}
          </span>
        </div>
      </div>
    </div>
  );
});

AnnualSummaryCard.displayName = 'AnnualSummaryCard';

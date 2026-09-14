import React from 'react';
import { Info } from 'lucide-react';
import { AnnualSummary, CustomAnnualSummary } from '../types';
import { useTradingCalendar } from '../context/TradingCalendarContext';
import { cn, formatCapital, formatPercent, formatPnL, getPnLTextStyle } from '../utils';
import { Poptip } from './Poptip';

interface AnnualSummaryCardProps {
  annualSummary?: AnnualSummary;
  /** 自定义年度统计渲染内容，替换跑马灯内部默认的所有内容（包括年化、今年收益、初始金额等） */
  customAnnualSummary?: CustomAnnualSummary;
}

export const AnnualSummaryCard: React.FC<AnnualSummaryCardProps> = React.memo(({
  annualSummary,
  customAnnualSummary,
}) => {
  const { colorScheme, theme } = useTradingCalendar();

  const rate = annualSummary?.annualizedReturnRate;
  const totalPnL = annualSummary?.totalPnL;
  const initialCapital = annualSummary?.initialCapital;

  return (
    <div className="w-full sm:w-60 shrink-0 relative p-[1.5px] rounded-xl shadow-lg border border-emerald-500/30 dark:border-emerald-500/40">
      {/* 跑马灯边框光晕 (裁剪在绝对定位层内部，不影响外层 Poptip 浮层) */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute inset-[-150%] animate-border-spin bg-[conic-gradient(from_0deg,transparent_0deg,rgba(251,191,36,0.25)_18deg,#fbbf24_45deg,rgba(251,191,36,0.25)_72deg,transparent_90deg,transparent_360deg)] opacity-95" />
      </div>

      <div className="relative z-10 w-full h-full bg-slate-50 dark:bg-[#0c1522] rounded-[10px] p-2.5 flex flex-col items-center justify-center text-center overflow-hidden">
        {customAnnualSummary ? (
          typeof customAnnualSummary === 'function'
            ? customAnnualSummary({ annualSummary, colorScheme, theme })
            : customAnnualSummary
        ) : (
          <>
            <div className="flex items-center space-x-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>年化收益率</span>
          {initialCapital != null && (
            <Poptip
              content={`初始金额 ${formatCapital(initialCapital)}`}
              placement="top"
              widthClass="w-auto whitespace-nowrap"
            >
              <span
                className="inline-flex items-center cursor-pointer p-0.5"
                role="button"
                tabIndex={0}
                aria-label="年化收益率说明"
              >
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" />
              </span>
            </Poptip>
          )}
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

        <div className="flex flex-col items-center mt-2 sm:mt-2.5">
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
      </>
    )}
  </div>
</div>
  );
});

AnnualSummaryCard.displayName = 'AnnualSummaryCard';

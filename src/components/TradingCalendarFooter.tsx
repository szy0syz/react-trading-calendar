import React from 'react';

interface TradingCalendarFooterProps {
  currency?: string;
  updateText?: string;
}

export const TradingCalendarFooter: React.FC<TradingCalendarFooterProps> = React.memo(({
  currency = '美元 (USD)',
  updateText = '每日更新',
}) => {
  return (
    <div className="py-3 text-center border-t border-slate-200 dark:border-slate-800/40">
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
        单位: {currency} · {updateText}
      </span>
    </div>
  );
});

TradingCalendarFooter.displayName = 'TradingCalendarFooter';

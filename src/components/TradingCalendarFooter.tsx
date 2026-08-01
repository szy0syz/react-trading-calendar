import React from 'react';
import { useTradingCalendar } from '../context/TradingCalendarContext';

export const TradingCalendarFooter: React.FC = React.memo(() => {
  const { currency, updateText } = useTradingCalendar();

  return (
    <div className="py-2 text-center border-t border-slate-200 dark:border-slate-800/40">
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
        单位: {currency} · {updateText}
      </span>
    </div>
  );
});

TradingCalendarFooter.displayName = 'TradingCalendarFooter';

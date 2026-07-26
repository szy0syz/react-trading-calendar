import React from 'react';
import { TradingCalendarProps } from './types';
import { TradingCalendarHeader } from './components/TradingCalendarHeader';
import { TradingCalendarControls } from './components/TradingCalendarControls';
import { WeeklyCalendarGrid } from './components/WeeklyCalendarGrid';
import { MonthlyPnLGrid } from './components/MonthlyPnLGrid';
import { AnnualSummaryCard } from './components/AnnualSummaryCard';
import { TradingCalendarFooter } from './components/TradingCalendarFooter';
import { cn } from './utils';

const currentDate = new Date();

export const TradingCalendar: React.FC<TradingCalendarProps> = React.memo(({
  year = currentDate.getFullYear(),
  month = currentDate.getMonth() + 1,
  dailyRecords = [],
  weeklySummaries,
  monthlySummaries = [],
  annualSummary,
  currency = '美元 (USD)',
  updateText = '每日实时更新',
  title = '实盘交易记录',
  statusText = '实时',
  colorScheme = 'greenUpRedDown',
  theme = 'dark',
  showThemeToggle = false,
  onMonthChange,
  onDateClick,
  onThemeToggle,
  className,
  style,
}) => {
  return (
    <div
      data-theme={theme}
      data-color-scheme={colorScheme}
      style={style}
      className={cn(
        "tc-calendar-root w-full max-w-4xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border transition-all duration-300",
        theme === 'dark'
          ? "bg-[#0b1322] border-slate-800 text-slate-100 dark"
          : "bg-white border-slate-200 text-slate-900",
        className
      )}
    >
      <TradingCalendarHeader
        title={title}
        statusText={statusText}
        theme={theme}
        showThemeToggle={showThemeToggle}
        onThemeToggle={onThemeToggle}
      />

      <TradingCalendarControls
        year={year}
        month={month}
        onMonthChange={onMonthChange}
      />

      <WeeklyCalendarGrid
        year={year}
        month={month}
        dailyRecords={dailyRecords}
        weeklySummaries={weeklySummaries}
        colorScheme={colorScheme}
        onDateClick={onDateClick}
      />

      <div className="px-3.5 sm:px-6 pb-4 sm:pb-6 flex flex-col md:flex-row gap-3.5 items-stretch">
        <MonthlyPnLGrid
          year={year}
          currentMonth={month}
          monthlySummaries={monthlySummaries}
          colorScheme={colorScheme}
          onMonthChange={onMonthChange}
        />
        <AnnualSummaryCard
          annualSummary={annualSummary}
          colorScheme={colorScheme}
        />
      </div>

      <TradingCalendarFooter
        currency={currency}
        updateText={updateText}
      />
    </div>
  );
});

TradingCalendar.displayName = 'TradingCalendar';

import React from 'react';
import { TradingCalendarProps, isCalendarLevelEffect } from './types';
import { TradingCalendarProvider, useTradingCalendar } from './context/TradingCalendarContext';
import { TradingCalendarHeader } from './components/TradingCalendarHeader';
import { TradingCalendarControls } from './components/TradingCalendarControls';
import { WeeklyCalendarGrid } from './components/WeeklyCalendarGrid';
import { MonthlyPnLGrid } from './components/MonthlyPnLGrid';
import { AnnualSummaryCard } from './components/AnnualSummaryCard';
import { TradingCalendarFooter } from './components/TradingCalendarFooter';
import {
  TradingEffectProvider,
  useTradingEffect,
  LazyCalendarStageEffects,
  scheduleIdlePreload,
} from './components/effects';
import { cn, hasMonthData, shiftYearMonth } from './utils';

interface TradingCalendarContentProps
  extends Pick<
    TradingCalendarProps,
    | 'weeklySummaries'
    | 'annualSummary'
    | 'customAnnualSummary'
    | 'className'
    | 'style'
  > {
  year: number;
  month: number;
  dailyRecords: NonNullable<TradingCalendarProps['dailyRecords']>;
  monthlySummaries: NonNullable<TradingCalendarProps['monthlySummaries']>;
  computedHasPrevMonth: boolean;
  computedHasNextMonth: boolean;
}

const TradingCalendarContent: React.FC<TradingCalendarContentProps> = ({
  year,
  month,
  dailyRecords,
  weeklySummaries,
  monthlySummaries,
  annualSummary,
  customAnnualSummary,
  className,
  style,
  computedHasPrevMonth,
  computedHasNextMonth,
}) => {
  const { theme, colorScheme, onCellHoverEffect } = useTradingCalendar();
  const { activeGlobalEffect, completeGlobalEffect } = useTradingEffect();

  // 仅在用户鼠标/指针移入日历容器时才按需触发静默预加载动效引擎 chunk，避免在首屏挂载阶段抢占关键请求链 (Avoid chaining critical requests)
  const handleCalendarPointerEnter = React.useCallback(() => {
    if (!onCellHoverEffect) return;
    const hasPotentialGlobalEffect = dailyRecords.some((record) => {
      const level = onCellHoverEffect(record);
      return isCalendarLevelEffect(level);
    });
    scheduleIdlePreload(hasPotentialGlobalEffect);
  }, [dailyRecords, onCellHoverEffect]);

  return (
    <div
      data-theme={theme}
      data-color-scheme={colorScheme}
      data-calendar-effect={activeGlobalEffect?.level}
      style={style}
      className={cn(
        "tc-calendar-root relative w-full max-w-4xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border transition-colors duration-200",
        theme === 'dark'
          ? "bg-[#0b1322] border-slate-800 text-slate-100 dark"
          : "bg-white border-slate-200 text-slate-900",
        className
      )}
      onPointerEnter={handleCalendarPointerEnter}
    >
      <TradingCalendarHeader />

      <TradingCalendarControls
        year={year}
        month={month}
        hasPrevMonth={computedHasPrevMonth}
        hasNextMonth={computedHasNextMonth}
      />

      <WeeklyCalendarGrid
        year={year}
        month={month}
        dailyRecords={dailyRecords}
        weeklySummaries={weeklySummaries}
      />

      <div className="px-2 sm:px-6 pb-2.5 sm:pb-3.5 flex flex-col sm:flex-row gap-3.5 items-stretch">
        <MonthlyPnLGrid
          year={year}
          currentMonth={month}
          monthlySummaries={monthlySummaries}
        />
        <AnnualSummaryCard
          annualSummary={annualSummary}
          customAnnualSummary={customAnnualSummary}
        />
      </div>

      <TradingCalendarFooter />

      {/* 异步按需加载的全局动效舞台浮层（仅在激活时挂载，播完自动卸载） */}
      {activeGlobalEffect && (
        <React.Suspense fallback={null}>
          <LazyCalendarStageEffects
            effect={activeGlobalEffect}
            onComplete={completeGlobalEffect}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export const TradingCalendar: React.FC<TradingCalendarProps> = React.memo(({
  year,
  month,
  dailyRecords = [],
  weeklySummaries,
  monthlySummaries = [],
  annualSummary,
  customAnnualSummary,
  currency = '美元 (USD)',
  updateText = '每日实时更新',
  title = '实盘交易记录',
  statusText = '实时',
  headerRight,
  sectionTitle = '交易记录',
  colorScheme = 'greenUpRedDown',
  theme = 'dark',
  density = 'compact',
  showThemeToggle = false,
  hasPrevMonth,
  hasNextMonth,
  onMonthChange,
  onDateClick,
  onDateHover,
  onDateHoverEnd,
  onThemeToggle,
  onCellHoverEffect,
  className,
  style,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const resolvedYear = year ?? currentYear;
  const resolvedMonth = month ?? currentMonth;

  const prev = shiftYearMonth(resolvedYear, resolvedMonth, -1);
  const next = shiftYearMonth(resolvedYear, resolvedMonth, 1);

  // 处于当前月（当前月尚未过完）或未来月份时，禁止切换至下月
  const isCurrentOrFuture =
    resolvedYear > currentYear || (resolvedYear === currentYear && resolvedMonth >= currentMonth);

  const computedHasPrevMonth =
    hasPrevMonth ??
    hasMonthData(prev.year, prev.month, dailyRecords, monthlySummaries, resolvedYear);

  const computedHasNextMonth =
    !isCurrentOrFuture &&
    (hasNextMonth ??
      hasMonthData(next.year, next.month, dailyRecords, monthlySummaries, resolvedYear));

  return (
    <TradingCalendarProvider
      colorScheme={colorScheme}
      theme={theme}
      density={density}
      title={title}
      statusText={statusText}
      headerRight={headerRight}
      currency={currency}
      updateText={updateText}
      sectionTitle={sectionTitle}
      showThemeToggle={showThemeToggle}
      onDateClick={onDateClick}
      onDateHover={onDateHover}
      onDateHoverEnd={onDateHoverEnd}
      onMonthChange={onMonthChange}
      onThemeToggle={onThemeToggle}
      onCellHoverEffect={onCellHoverEffect}
    >
      <TradingEffectProvider>
        <TradingCalendarContent
          year={resolvedYear}
          month={resolvedMonth}
          dailyRecords={dailyRecords}
          weeklySummaries={weeklySummaries}
          monthlySummaries={monthlySummaries}
          annualSummary={annualSummary}
          customAnnualSummary={customAnnualSummary}
          computedHasPrevMonth={computedHasPrevMonth}
          computedHasNextMonth={computedHasNextMonth}
          className={className}
          style={style}
        />
      </TradingEffectProvider>
    </TradingCalendarProvider>
  );
});

TradingCalendar.displayName = 'TradingCalendar';


import { useState } from 'react';
import { TradingCalendar } from '../src/TradingCalendar';
import { ColorScheme, DailyRecord, Theme } from '../src/types';

const now = new Date();

export function App() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('greenUpRedDown');
  const [lastClickedDate, setLastClickedDate] = useState<string | null>(null);

  // 演示 Mock 交易数据
  const mockDailyRecords: DailyRecord[] = [
    // Week 27
    { date: `${year}-06-29`, pnl: -641 },
    { date: `${year}-06-30`, pnl: 10273 },
    { date: `${year}-07-01`, pnl: undefined },
    { date: `${year}-07-02`, pnl: undefined },
    { date: `${year}-07-03`, isNonTradingDay: true },

    // Week 28
    { date: `${year}-07-06`, pnl: -4709 },
    { date: `${year}-07-07`, pnl: 11245 },
    { date: `${year}-07-08`, pnl: 3523 },
    { date: `${year}-07-09`, pnl: 5128 },
    { date: `${year}-07-10`, pnl: -4217 },

    // Week 29
    { date: `${year}-07-13`, pnl: -4018 },
    { date: `${year}-07-14`, pnl: 8778 },
    { date: `${year}-07-15`, pnl: 15240 },
    { date: `${year}-07-16`, pnl: 4896 },
    { date: `${year}-07-17`, pnl: -3065 },

    // Week 30
    { date: `${year}-07-20`, pnl: 4830 },
    { date: `${year}-07-21`, pnl: -5383 },
    { date: `${year}-07-22`, pnl: 8783 },
    { date: `${year}-07-23`, pnl: 11258 },
    { date: `${year}-07-24`, pnl: -2493 },

    // Week 31
    { date: `${year}-07-27`, pnl: undefined },
    { date: `${year}-07-28`, pnl: undefined },
    { date: `${year}-07-29`, pnl: undefined },
    { date: `${year}-07-30`, pnl: undefined },
    { date: `${year}-07-31`, pnl: undefined },
  ];

  const mockWeeklySummaries = [
    { weekNumber: 27, pnl: 9632 },
    { weekNumber: 28, pnl: 10970 },
    { weekNumber: 29, pnl: 21831 },
    { weekNumber: 30, pnl: 16995 },
    { weekNumber: 31, pnl: undefined },
  ];

  const mockMonthlySummaries = [
    { month: 1, pnl: 71737 },
    { month: 2, pnl: 79699 },
    { month: 3, pnl: 25666 },
    { month: 4, pnl: 100346 },
    { month: 5, pnl: 19550 },
    { month: 6, pnl: 30150 },
    { month: 7, pnl: 49796 },
  ];

  const mockAnnualSummary = {
    year: year,
    annualizedReturnRate: 0.3696,
    totalPnL: 376944,
  };

  return (
    <div
      data-theme={theme}
      className={`min-h-screen p-6 md:p-12 transition-colors duration-300 ${
        theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* 顶部 Playground 控制面板 */}
      <div className="max-w-4xl mx-auto mb-8 p-4 bg-white border border-slate-200 text-slate-900 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-100 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
            TradingCalendar 组件在线 Playground
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            纯渲染组件演示 · 独立发布 NPM · 支持主题与红绿配色切换
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
          >
            当前主题: {theme === 'dark' ? '🌙 黑夜 (Dark)' : '☀️ 白天 (Light)'}
          </button>

          <button
            type="button"
            onClick={() => setColorScheme(cs => (cs === 'greenUpRedDown' ? 'redUpGreenDown' : 'greenUpRedDown'))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
          >
            配色方案: {colorScheme === 'greenUpRedDown' ? '🟢 绿涨红跌 (美股)' : '🔴 红涨绿跌 (A股)'}
          </button>
        </div>
      </div>

      {lastClickedDate && (
        <div className="max-w-4xl mx-auto mb-4 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            已触发 onDateClick 回调: 点击日期 {lastClickedDate}
          </span>
        </div>
      )}

      {/* 日历核心组件：零硬编码，默认加载当前系统年月 */}
      <TradingCalendar
        year={year}
        month={month}
        dailyRecords={mockDailyRecords}
        weeklySummaries={mockWeeklySummaries}
        monthlySummaries={mockMonthlySummaries}
        annualSummary={mockAnnualSummary}
        colorScheme={colorScheme}
        theme={theme}
        showThemeToggle
        onMonthChange={(newYear, newMonth) => {
          setYear(newYear);
          setMonth(newMonth);
        }}
        onDateClick={(rec) => setLastClickedDate(rec.date)}
        onThemeToggle={(newTheme) => setTheme(newTheme)}
      />
    </div>
  );
}

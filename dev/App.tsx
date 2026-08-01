import { useState, useMemo } from 'react';
import { TradingCalendar } from '../src/TradingCalendar';
import { ColorScheme, DailyRecord, MonthlySummary, Theme, WeeklySummary } from '../src/types';

const now = new Date();

// ---------------------------------------------------------------------------
// 辅助：根据年月动态生成当月 mock 数据（始终与当前视图月份对齐）
// ---------------------------------------------------------------------------

function buildMockData(year: number, month: number): {
  dailyRecords: DailyRecord[];
  weeklySummaries: WeeklySummary[];
} {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyRecords: DailyRecord[] = [];

  // 预设 PnL 种子，循环复用，模拟真实的涨跌节奏
  const pnlSeed = [
    -641, 10273, undefined, undefined, 11245,
    3523, 5128, -4217, -4018, 8778,
    15240, 4896, -3065, 4830, -5383,
    8783, 11258, -2493, undefined, undefined,
  ];

  let seedIdx = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay(); // 0=Sun, 6=Sat

    // 跳过周末
    if (dow === 0 || dow === 6) continue;

    const mm = String(month).padStart(2, '0');
    const dd = String(d).padStart(2, '0');

    dailyRecords.push({
      date: `${year}-${mm}-${dd}`,
      pnl: pnlSeed[seedIdx % pnlSeed.length],
    });
    seedIdx++;
  }

  // 按 ISO 周号分组，自动累计周度盈亏
  const weekMap = new Map<number, number>();
  for (const r of dailyRecords) {
    if (r.pnl == null) continue;
    const d = new Date(r.date);
    const wn = getISOWeekNumber(d);
    weekMap.set(wn, (weekMap.get(wn) ?? 0) + r.pnl);
  }
  const weeklySummaries: WeeklySummary[] = Array.from(weekMap.entries()).map(
    ([weekNumber, pnl]) => ({ weekNumber, pnl }),
  );

  return { dailyRecords, weeklySummaries };
}

/** ISO 8601 周数（与组件内逻辑保持一致） */
function getISOWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ---------------------------------------------------------------------------
// 全年月度数据（固定演示，不随月份切换变化）
// ---------------------------------------------------------------------------

const mockMonthlySummaries: MonthlySummary[] = [
  { month: 1, pnl: 71737 },
  { month: 2, pnl: 79699 },
  { month: 3, pnl: 25666 },
  { month: 4, pnl: 100346 },
  { month: 5, pnl: 19550 },
  { month: 6, pnl: 30150 },
  { month: 7, pnl: 49796 },
  { month: 8, pnl: 51147 },
];

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export function App() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('greenUpRedDown');
  const [lastClickedDate, setLastClickedDate] = useState<string | null>(null);

  // 动态计算当前视图月份的 mock 数据
  const { dailyRecords, weeklySummaries } = useMemo(
    () => buildMockData(year, month),
    [year, month],
  );

  const mockAnnualSummary = {
    year,
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
            纯渲染组件演示 · 支持主题与红绿配色切换
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
        dailyRecords={dailyRecords}
        weeklySummaries={weeklySummaries}
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

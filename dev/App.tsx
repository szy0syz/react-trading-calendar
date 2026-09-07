import { useState, useMemo } from 'react';
import { TradingCalendar } from '../src/TradingCalendar';
import { ColorScheme, DailyRecord, MonthlySummary, Theme, WeeklySummary, CellEffectLevel } from '../src/types';

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

  // 预设 PnL 种子，覆盖 8 级动效的典型涨跌额度（+$8,650 ~ +$115,000，-$11,550 ~ -$120,000）
  const pnlSeed = [
    8650, 14500, 36000, 72000, 115000,
    -11550, -65000, -120000, 8778, 15240,
    4896, -3065, 4830, -5383, 8783,
    11258, -2493, undefined, undefined,
  ];

  // 预设交易笔数 mock 数据
  const tradesCountSeed: (number | null | undefined)[] = [
    2, 12, 0, null, 8,
    3, undefined, 6, 0, 15,
    18, 7, null, 9, 11,
    8, 14, 0, undefined, undefined,
  ];

  // 预设复盘笔记 hasNote mock 数据（部分日期为 true）
  const hasNoteSeed: boolean[] = [
    true, false, false, true, false,
    false, true, false, false, false,
    true, false, true, false, false,
  ];

  let seedIdx = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay(); // 0=Sun, 6=Sat

    // 跳过周末
    if (dow === 0 || dow === 6) continue;

    const mm = String(month).padStart(2, '0');
    const dd = String(d).padStart(2, '0');

    const pnl = pnlSeed[seedIdx % pnlSeed.length];
    const tradesCount = tradesCountSeed[seedIdx % tradesCountSeed.length];
    const hasNote = hasNoteSeed[seedIdx % hasNoteSeed.length];

    dailyRecords.push({
      date: `${year}-${mm}-${dd}`,
      pnl,
      tradesCount,
      hasNote,
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

  const INITIAL_CAPITAL = 100_000;

  const mockAnnualSummary = {
    year,
    annualizedReturnRate: 0.3696,
    totalPnL: 376944,
    initialCapital: INITIAL_CAPITAL,
  };

  // 业务方规则（Demo 演示）：按 100k 初始资金精确计算当天收益率（%）并映射至 8 级动效
  const handleCellHoverEffect = (day: DailyRecord): CellEffectLevel | null => {
    if (day.pnl == null || day.isNonTradingDay) return null;

    // 当日盈亏占初始资金的百分比
    const returnRate = (day.pnl / INITIAL_CAPITAL) * 100;

    // --- 盈利系列 (Profit: 纯 Cell 局部微徽章自闭环，0 侵入其他数据) ---
    // 5. 无人能敌 (>=100%，即当日盈利 >= $100k) -> 👑 皇冠勋章
    if (returnRate >= 100) return CellEffectLevel.PROFIT_INVINCIBLE;
    // 4. 厉害 (50% ~ <100%，即当日盈利 $50k ~ $100k) -> 👍 点赞勋章
    if (returnRate >= 50) return CellEffectLevel.PROFIT_AWESOME;
    // 3. 棒 (20% ~ <50%，即当日盈利 $20k ~ $50k) -> 🚀 火箭勋章
    if (returnRate >= 20) return CellEffectLevel.PROFIT_GREAT;
    // 2. 还不错 (10% ~ <20%，即当日盈利 $10k ~ $20k) -> ✦ 星芒微粒
    if (returnRate >= 10) return CellEffectLevel.PROFIT_NICE;
    // 1. 马虎马虎 (0% ~ <10%，即当日盈利 > $0 ~ < $10k) -> 翠绿呼吸微光
    if (returnRate > 0) return CellEffectLevel.PROFIT_PASSABLE;

    // --- 亏损系列 (Loss) ---
    // 3. 烂透了 (< -100%，即当日亏损超过本金 <-$100k) -> 赛博故障熔断 + 裂纹 + 👎 熔断点踩
    if (returnRate < -100) return CellEffectLevel.LOSS_ABYSMAL;
    // 2. 太差劲了 (-50% ~ -100%，即当日亏损 -$50k ~ -$100k) -> 重力下沉 + 单圈光圈 + ⚠️ 警报
    if (returnRate <= -50) return CellEffectLevel.LOSS_TERRIBLE;
    // 1. 不好 (0% ~ -50%，即当日亏损 $0 ~ -$50k) -> 右上角 🙁 徽章
    return CellEffectLevel.LOSS_BAD;
  };

  return (
    <div
      data-theme={theme}
      className={`min-h-screen p-6 md:p-12 transition-colors duration-300 ${
        theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* 顶部 Playground 控制面板 */}
      <div className="max-w-4xl mx-auto mb-6 p-4 bg-white border border-slate-200 text-slate-900 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-100 rounded-xl shadow-lg flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
              TradingCalendar 组件在线 Playground
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              支持 8 级动效（5 级盈利纯局部微徽章自闭环 + 3 级亏损）· 纯非侵入优雅体验
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

        {/* 动效快捷说明标签 */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-wrap gap-2 text-[11px] font-mono">
          <span className="text-slate-400">悬停测试指南:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            +$8,650 (马虎马虎 · 呼吸微光)
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            +$14,500 (还不错 · ✦ 星芒)
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            +$36,000 (棒 · 🚀 火箭徽章)
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/50">
            +$72,000 (厉害 · 👍 点赞徽章)
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50">
            +$115,000 (无人能敌 · 👑 皇冠徽章)
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
            -$11,550 (不好 · 🙁 徽章)
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/50">
            -$65,000 (太差劲了 · ⚠️ 警报)
          </span>
          <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-200 font-bold border border-red-500/60">
            -$120,000 (烂透了 · 👎 熔断)
          </span>
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
        onCellHoverEffect={handleCellHoverEffect}
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

import React from 'react';

export type ColorScheme = 'greenUpRedDown' | 'redUpGreenDown';
export type Theme = 'dark' | 'light';

export interface DailyRecord {
  /** 日期字符串，格式如 "YYYY-MM-DD" 或 "MM/DD" */
  date: string;
  /** 每日盈亏金额 */
  pnl?: number | null;
  /** 当日交易笔数 */
  tradesCount?: number | null;
  /** 是否为休市/非交易日 */
  isNonTradingDay?: boolean;
  /** 备注信息 */
  note?: string;
  /** 是否存在复盘笔记，为 true 时单元格右上角会显示微光点 Badge */
  hasNote?: boolean;
}

export interface WeeklySummary {
  /** ISO 周数 */
  weekNumber: number;
  /** 当周盈亏金额 */
  pnl?: number | null;
}

export interface MonthlySummary {
  /** 月份 (1 - 12) */
  month: number;
  /** 当月盈亏金额 */
  pnl?: number | null;
}

export interface AnnualSummary {
  /** 年份 */
  year: number;
  /** 年化收益率，例如 0.3696 代表 36.96% */
  annualizedReturnRate: number;
  /** 今年累计收益总额 */
  totalPnL: number;
  /**
   * 初始本金/金额原始数值（可选，未提供时不显示提示气泡与图标）。
   * 传入完整数值（例如 100000、120000 或 1500000，无需手动除以 1000）。
   * 组件内部会自动转换为友好的格式（如 100000 → "$100k", 120000 → "$120k", 1500000 → "$1.5M"）。
   */
  initialCapital?: number;
}

export interface AnnualSummaryRenderProps {
  /** 当前年度统计基础数据 (年化收益率, 今年收益, 初始金额等) */
  annualSummary?: AnnualSummary;
  /** 当前涨跌配色模式 */
  colorScheme: ColorScheme;
  /** 当前主题模式 */
  theme: Theme;
}

export type CustomAnnualSummary =
  | React.ReactNode
  | ((props: AnnualSummaryRenderProps) => React.ReactNode);

export interface TradingCalendarProps {
  /** 视图年份，默认当前系统年份 */
  year?: number;
  /** 视图月份 (1 - 12)，默认当前系统月份 */
  month?: number;
  /** 每日交易记录数据 */
  dailyRecords?: DailyRecord[];
  /** 周度盈亏总结 */
  weeklySummaries?: WeeklySummary[];
  /** 月度盈亏总结 */
  monthlySummaries?: MonthlySummary[];
  /** 年度与年化收益总结 */
  annualSummary?: AnnualSummary;
  /**
   * 自定义年度统计渲染内容（可选，支持 ReactNode 或 Render Function）。
   * 传入时将完全替换跑马灯内部默认的所有内容（包括年化收益率、今年收益、初始金额提示等），外框跑马灯效果与尺寸约束保持不变。
   */
  customAnnualSummary?: CustomAnnualSummary;

  /** 货币单位名称，默认 "美元 (USD)" */
  currency?: string;
  /** 更新提示文案，默认 "每日更新" */
  updateText?: string;
  /** 窗口标题，默认 "实盘交易记录" */
  title?: string;
  /** 状态指示文本，默认 "实时" */
  statusText?: string;
  /** 交易记录区域标题（Controls 区），默认 "交易记录" */
  sectionTitle?: string;

  /** 涨跌配色模式：greenUpRedDown (美股/国际) | redUpGreenDown (A股) */
  colorScheme?: ColorScheme;
  /** 主题模式：dark | light */
  theme?: Theme;
  /** 是否在 Header 展示主题切换按钮 */
  showThemeToggle?: boolean;

  /** 是否有上个月数据（未传则根据 dailyRecords / monthlySummaries 自动识别） */
  hasPrevMonth?: boolean;
  /** 是否有下个月数据（未传则根据 dailyRecords / monthlySummaries 自动识别） */
  hasNextMonth?: boolean;

  /** 月份切换回调 */
  onMonthChange?: (year: number, month: number) => void;
  /** 点击具体日期单元格回调 */
  onDateClick?: (record: DailyRecord) => void;
  /** 主题切换回调 */
  onThemeToggle?: (theme: Theme) => void;

  /** 布局密度：compact (紧凑模式，默认) | normal (舒展模式) */
  density?: 'compact' | 'normal';
  /** 根容器自定义类名 */
  className?: string;
  /** 根容器自定义样式 */
  style?: React.CSSProperties;

  /**
   * 单元格悬停动效解析回调（可选）。
   * 由调用方根据 day 数据自主判断返回 CellEffectLevel 或 null/undefined。
   * Calendar 组件不侵入具体业务判断（如金额或百分比规则）。
   */
  onCellHoverEffect?: (day: DailyRecord) => CellEffectLevel | null | undefined;
}

/**
 * 交易日历单元格动效级别枚举
 *
 * 1. 局部级 (Cell Level，纯单元格自闭环微动效，不干扰其他单元格，鼠标离开即平滑复原)：
 *    - 盈利系列：
 *      - PROFIT_PASSABLE: 翠绿呼吸外框与跑马微光
 *      - PROFIT_NICE: 翠绿外框与 ✦ 星芒粒子
 *      - PROFIT_GREAT: 翡翠能量外框与 🚀 火箭勋章
 *      - PROFIT_AWESOME: 翡翠双重流光与 👍 点赞勋章
 *      - PROFIT_INVINCIBLE: 香槟金流光与 👑 皇冠勋章
 *    - 亏损轻度微动效：
 *      - LOSS_BAD: 暗红微光外框与 🙁 沮丧勋章
 *
 * 2. 全局级 (Calendar Level，全日历宏观警报，由全局互斥锁保护)：
 *    - LOSS_TERRIBLE: 重力下沉、全场倾斜灰化、单圈深红光圈放大与 ⚠️ 警报
 *    - LOSS_ABYSMAL: 全息故障熔断、红色裂纹电光线与 👎 点踩徽章
 */
export enum CellEffectLevel {
  // --- 盈利系列 (Profit: 纯 Cell 局部微徽章自闭环) ---
  /** 1. 马虎马虎 - Cell 级：微澜呼吸光晕 */
  PROFIT_PASSABLE = 'profit_passable',
  /** 2. 还不错 - Cell 级：轻盈上浮微跃动与金色微粒 (✦) */
  PROFIT_NICE = 'profit_nice',
  /** 3. 棒 - Cell 级：能量流光环绕与火箭勋章 (🚀) */
  PROFIT_GREAT = 'profit_great',
  /** 4. 厉害 - Cell 级：双重翡翠流光与点赞勋章 (👍) */
  PROFIT_AWESOME = 'profit_awesome',
  /** 5. 无人能敌 - Cell 级：香槟金流光与皇冠勋章 (👑) */
  PROFIT_INVINCIBLE = 'profit_invincible',

  // --- 亏损系列 (Loss) ---
  /** 1. 不好 - Cell 级：暗红微光外框与右上角沮丧勋章 (🙁) */
  LOSS_BAD = 'loss_bad',
  /** 2. 太差劲了 - Calendar 级：重力下沉震颤、单圈光圈与警报 (⚠️) */
  LOSS_TERRIBLE = 'loss_terrible',
  /** 3. 烂透了 - Calendar 级：全息熔断故障、红色裂纹与点踩徽章 (👎) */
  LOSS_ABYSMAL = 'loss_abysmal',
}

/**
 * 判断动效级别是否为全局 Calendar 级（需激活全局互斥锁与全场联动）
 * 盈利系列已全部收敛为纯 Cell 级微交互，仅重度亏损保留全局警示。
 */
export function isCalendarLevelEffect(level?: CellEffectLevel | null): boolean {
  if (!level) return false;
  return (
    level === CellEffectLevel.LOSS_TERRIBLE ||
    level === CellEffectLevel.LOSS_ABYSMAL
  );
}

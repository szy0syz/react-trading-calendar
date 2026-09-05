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
}

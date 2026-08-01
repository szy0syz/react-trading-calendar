import React from 'react';

export type ColorScheme = 'greenUpRedDown' | 'redUpGreenDown';
export type Theme = 'dark' | 'light';

export interface DailyRecord {
  /** 日期字符串，格式如 "YYYY-MM-DD" 或 "MM/DD" */
  date: string;
  /** 每日盈亏金额 */
  pnl?: number | null;
  /** 是否为休市/非交易日 */
  isNonTradingDay?: boolean;
  /** 备注信息 */
  note?: string;
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
}

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

  /** 月份切换回调 */
  onMonthChange?: (year: number, month: number) => void;
  /** 点击具体日期单元格回调 */
  onDateClick?: (record: DailyRecord) => void;
  /** 主题切换回调 */
  onThemeToggle?: (theme: Theme) => void;

  /** 根容器自定义类名 */
  className?: string;
  /** 根容器自定义样式 */
  style?: React.CSSProperties;
}

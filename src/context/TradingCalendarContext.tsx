import React from 'react';
import type { ColorScheme, DailyRecord, Theme } from '../types';

// Context 值类型

export interface TradingCalendarContextValue {
  /** 涨跌配色模式 */
  colorScheme: ColorScheme;
  /** 主题模式 */
  theme: Theme;
  /** 窗口标题 */
  title: string;
  /** 状态指示文本 */
  statusText: string;
  /** 货币单位名称 */
  currency: string;
  /** 更新提示文案 */
  updateText: string;
  /** 交易记录区域标题（Controls 区标题）*/
  sectionTitle: string;
  /** 是否展示主题切换按钮 */
  showThemeToggle: boolean;
  /** 点击具体日期单元格回调 */
  onDateClick?: (record: DailyRecord) => void;
  /** 月份切换回调 */
  onMonthChange?: (year: number, month: number) => void;
  /** 主题切换回调 */
  onThemeToggle?: (theme: Theme) => void;
}

// 默认値：确保在 Provider 外消费时也有合理 fallback

const defaultContextValue: TradingCalendarContextValue = {
  colorScheme: 'greenUpRedDown',
  theme: 'dark',
  title: '实盘交易记录',
  statusText: '实时',
  currency: '美元 (USD)',
  updateText: '每日实时更新',
  sectionTitle: '交易记录',
  showThemeToggle: false,
};

export const TradingCalendarContext =
  React.createContext<TradingCalendarContextValue>(defaultContextValue);

// Provider 组件

interface TradingCalendarProviderProps extends TradingCalendarContextValue {
  children: React.ReactNode;
}

export const TradingCalendarProvider: React.FC<TradingCalendarProviderProps> = ({
  children,
  ...value
}) => (
  <TradingCalendarContext.Provider value={value}>
    {children}
  </TradingCalendarContext.Provider>
);

// 消费 Hook

export function useTradingCalendar(): TradingCalendarContextValue {
  return React.useContext(TradingCalendarContext);
}

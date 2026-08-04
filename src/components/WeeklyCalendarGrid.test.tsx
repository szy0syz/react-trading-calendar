import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeeklyCalendarGrid } from './WeeklyCalendarGrid';
import { TradingCalendarProvider } from '../context/TradingCalendarContext';
import { DailyRecord } from '../types';

const buildContext = (overrides?: Partial<Parameters<typeof TradingCalendarProvider>[0]>) => ({
  colorScheme: 'greenUpRedDown' as const,
  theme: 'dark' as const,
  title: 'Test',
  statusText: '实时',
  currency: 'USD',
  updateText: '每日更新',
  sectionTitle: '交易记录',
  showThemeToggle: false,
  ...overrides,
});

describe('<WeeklyCalendarGrid />', () => {
  const mockDailyRecords: DailyRecord[] = [
    { date: '2026-07-06', pnl: -4709 },
    { date: '2026-07-07', pnl: 11245 },
    { date: '2026-07-03', isNonTradingDay: true },
  ];

  it('renders weekly PnL and non-trading day cell pattern', () => {
    const { container } = render(
      <TradingCalendarProvider {...buildContext()}>
        <WeeklyCalendarGrid
          year={2026}
          month={7}
          dailyRecords={mockDailyRecords}
        />
      </TradingCalendarProvider>
    );

    expect(screen.getByText('+11,245')).toBeInTheDocument();
    expect(screen.getByText('-4,709')).toBeInTheDocument();

    const nonTradingCell = container.querySelector('.bg-diagonal-stripes');
    expect(nonTradingCell).toBeInTheDocument();
  });

  it('triggers onDateClick callback when a date cell is clicked', () => {
    const onDateClickMock = vi.fn();

    render(
      <TradingCalendarProvider {...buildContext({ onDateClick: onDateClickMock })}>
        <WeeklyCalendarGrid
          year={2026}
          month={7}
          dailyRecords={mockDailyRecords}
        />
      </TradingCalendarProvider>
    );

    const targetVal = screen.getByText('+11,245');
    const targetTd = targetVal.closest('td');
    expect(targetTd).not.toBeNull();

    if (targetTd) {
      fireEvent.click(targetTd);
      expect(onDateClickMock).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2026-07-07',
          pnl: 11245,
        })
      );
    }
  });

  it('does not trigger onDateClick and lacks cursor-pointer for cells without pnl', () => {
    const onDateClickMock = vi.fn();
    const { container } = render(
      <TradingCalendarProvider {...buildContext({ onDateClick: onDateClickMock })}>
        <WeeklyCalendarGrid
          year={2026}
          month={7}
          dailyRecords={mockDailyRecords}
        />
      </TradingCalendarProvider>
    );

    const nonTradingCell = container.querySelector('.bg-diagonal-stripes');
    expect(nonTradingCell).not.toBeNull();
    expect(nonTradingCell?.classList.contains('cursor-pointer')).toBe(false);

    if (nonTradingCell) {
      fireEvent.click(nonTradingCell);
      expect(onDateClickMock).not.toHaveBeenCalled();
    }
  });

  it('renders trade count tooltip only when tradesCount is a positive number', () => {
    const recordsWithTrades: DailyRecord[] = [
      { date: '2026-07-06', pnl: -641, tradesCount: 0 },
      { date: '2026-07-07', pnl: 11245, tradesCount: 12 },
      { date: '2026-07-08', pnl: -1200, tradesCount: null },
      { date: '2026-07-09', pnl: 3523, tradesCount: undefined },
    ];

    render(
      <TradingCalendarProvider {...buildContext()}>
        <WeeklyCalendarGrid
          year={2026}
          month={7}
          dailyRecords={recordsWithTrades}
        />
      </TradingCalendarProvider>
    );

    expect(screen.getByText('12 笔交易')).toBeInTheDocument();
    expect(screen.queryByText('0 笔交易')).not.toBeInTheDocument();
  });
});

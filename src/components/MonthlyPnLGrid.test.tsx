import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthlyPnLGrid } from './MonthlyPnLGrid';
import { TradingCalendarProvider } from '../context/TradingCalendarContext';

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

describe('<MonthlyPnLGrid />', () => {
  const mockMonthlySummaries = [
    { month: 1, pnl: 71737 },
    { month: 7, pnl: 49796 },
  ];

  it('renders 12 month cards and displays PnL values', () => {
    render(
      <TradingCalendarProvider {...buildContext()}>
        <MonthlyPnLGrid
          year={2026}
          currentMonth={7}
          monthlySummaries={mockMonthlySummaries}
        />
      </TradingCalendarProvider>
    );

    expect(screen.getByText('1月')).toBeInTheDocument();
    expect(screen.getByText('+71,737')).toBeInTheDocument();
    expect(screen.getByText('7月')).toBeInTheDocument();
    expect(screen.getByText('+49,796')).toBeInTheDocument();
  });

  it('triggers onMonthChange when a month card is clicked', () => {
    const onMonthChangeMock = vi.fn();

    render(
      <TradingCalendarProvider {...buildContext({ onMonthChange: onMonthChangeMock })}>
        <MonthlyPnLGrid
          year={2026}
          currentMonth={7}
          monthlySummaries={mockMonthlySummaries}
        />
      </TradingCalendarProvider>
    );

    const month5Text = screen.getByText('5月');
    const month5Card = month5Text.closest('div');
    expect(month5Card).not.toBeNull();

    if (month5Card) {
      fireEvent.click(month5Card);
      expect(onMonthChangeMock).toHaveBeenCalledWith(2026, 5);
    }
  });
});

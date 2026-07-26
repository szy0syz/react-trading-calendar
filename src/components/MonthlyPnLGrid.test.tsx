import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthlyPnLGrid } from './MonthlyPnLGrid';

describe('<MonthlyPnLGrid />', () => {
  const mockMonthlySummaries = [
    { month: 1, pnl: 71737 },
    { month: 7, pnl: 49796 },
  ];

  it('renders 12 month cards and displays PnL values', () => {
    render(
      <MonthlyPnLGrid
        year={2026}
        currentMonth={7}
        monthlySummaries={mockMonthlySummaries}
      />
    );

    expect(screen.getByText('1月')).toBeInTheDocument();
    expect(screen.getByText('+71,737')).toBeInTheDocument();
    expect(screen.getByText('7月')).toBeInTheDocument();
    expect(screen.getByText('+49,796')).toBeInTheDocument();
  });

  it('triggers onMonthChange when a month card is clicked', () => {
    const onMonthChangeMock = vi.fn();

    render(
      <MonthlyPnLGrid
        year={2026}
        currentMonth={7}
        monthlySummaries={mockMonthlySummaries}
        onMonthChange={onMonthChangeMock}
      />
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

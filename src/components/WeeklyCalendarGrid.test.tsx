import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeeklyCalendarGrid } from './WeeklyCalendarGrid';
import { DailyRecord } from '../types';

describe('<WeeklyCalendarGrid />', () => {
  const mockDailyRecords: DailyRecord[] = [
    { date: '2026-07-06', pnl: -4709 },
    { date: '2026-07-07', pnl: 11245 },
    { date: '2026-07-03', isNonTradingDay: true },
  ];

  it('renders weekly PnL and non-trading day cell pattern', () => {
    const { container } = render(
      <WeeklyCalendarGrid
        year={2026}
        month={7}
        dailyRecords={mockDailyRecords}
      />
    );

    expect(screen.getByText('+11,245')).toBeInTheDocument();
    expect(screen.getByText('-4,709')).toBeInTheDocument();

    const nonTradingCell = container.querySelector('.bg-diagonal-stripes');
    expect(nonTradingCell).toBeInTheDocument();
  });

  it('triggers onDateClick callback when a date cell is clicked', () => {
    const onDateClickMock = vi.fn();

    render(
      <WeeklyCalendarGrid
        year={2026}
        month={7}
        dailyRecords={mockDailyRecords}
        onDateClick={onDateClickMock}
      />
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
});

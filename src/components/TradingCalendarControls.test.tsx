import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TradingCalendarControls } from './TradingCalendarControls';

describe('<TradingCalendarControls />', () => {
  it('renders current year and month title correctly', () => {
    render(<TradingCalendarControls year={2026} month={7} />);
    expect(screen.getByText('交易记录')).toBeInTheDocument();
    expect(screen.getByText('2026年 07月')).toBeInTheDocument();
  });

  it('handles prev month year rollover when in January (month = 1)', () => {
    const onMonthChangeMock = vi.fn();
    render(<TradingCalendarControls year={2026} month={1} onMonthChange={onMonthChangeMock} />);

    const prevBtn = screen.getByLabelText('上个月');
    fireEvent.click(prevBtn);
    expect(onMonthChangeMock).toHaveBeenCalledWith(2025, 12);
  });

  it('handles next month year rollover when in December (month = 12)', () => {
    const onMonthChangeMock = vi.fn();
    render(<TradingCalendarControls year={2026} month={12} onMonthChange={onMonthChangeMock} />);

    const nextBtn = screen.getByLabelText('下个月');
    fireEvent.click(nextBtn);
    expect(onMonthChangeMock).toHaveBeenCalledWith(2027, 1);
  });
});

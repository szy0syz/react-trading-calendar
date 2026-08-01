import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TradingCalendarControls } from './TradingCalendarControls';
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

describe('<TradingCalendarControls />', () => {
  it('renders current year and month title correctly', () => {
    render(
      <TradingCalendarProvider {...buildContext()}>
        <TradingCalendarControls year={2026} month={7} />
      </TradingCalendarProvider>
    );
    expect(screen.getByText('交易记录')).toBeInTheDocument();
    expect(screen.getByText('2026年 07月')).toBeInTheDocument();
  });

  it('handles prev month year rollover when in January (month = 1)', () => {
    const onMonthChangeMock = vi.fn();
    render(
      <TradingCalendarProvider {...buildContext({ onMonthChange: onMonthChangeMock })}>
        <TradingCalendarControls year={2026} month={1} />
      </TradingCalendarProvider>
    );

    const prevBtn = screen.getByLabelText('上个月');
    fireEvent.click(prevBtn);
    expect(onMonthChangeMock).toHaveBeenCalledWith(2025, 12);
  });

  it('handles next month year rollover when in December (month = 12)', () => {
    const onMonthChangeMock = vi.fn();
    render(
      <TradingCalendarProvider {...buildContext({ onMonthChange: onMonthChangeMock })}>
        <TradingCalendarControls year={2026} month={12} />
      </TradingCalendarProvider>
    );

    const nextBtn = screen.getByLabelText('下个月');
    fireEvent.click(nextBtn);
    expect(onMonthChangeMock).toHaveBeenCalledWith(2027, 1);
  });

  it('renders custom sectionTitle from context', () => {
    render(
      <TradingCalendarProvider {...buildContext({ sectionTitle: '实盘记录' })}>
        <TradingCalendarControls year={2026} month={7} />
      </TradingCalendarProvider>
    );
    expect(screen.getByText('实盘记录')).toBeInTheDocument();
  });
});

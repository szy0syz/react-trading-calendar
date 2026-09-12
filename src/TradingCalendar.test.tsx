import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TradingCalendar } from './TradingCalendar';

describe('<TradingCalendar /> Root Component', () => {
  it('renders without crashing with default props', () => {
    const { container } = render(<TradingCalendar />);
    expect(screen.getByText('实盘交易记录')).toBeInTheDocument();
    expect(screen.getByText('实时')).toBeInTheDocument();
    expect(container.querySelector('.tc-calendar-root')).toBeInTheDocument();
  });

  it('renders custom title, statusText, currency, and updateText', () => {
    render(
      <TradingCalendar
        title="我的自选实盘"
        statusText="已同步"
        currency="人民币 (CNY)"
        updateText="每小时更新"
      />
    );
    expect(screen.getByText('我的自选实盘')).toBeInTheDocument();
    expect(screen.getByText('已同步')).toBeInTheDocument();
    expect(screen.getByText(/单位: 人民币 \(CNY\) · 每小时更新/)).toBeInTheDocument();
  });

  it('handles theme toggling and showThemeToggle prop correctly', () => {
    const onThemeToggleMock = vi.fn();

    const { rerender } = render(
      <TradingCalendar
        theme="dark"
        showThemeToggle={false}
        onThemeToggle={onThemeToggleMock}
      />
    );

    expect(screen.queryByTitle(/切换为/)).not.toBeInTheDocument();

    rerender(
      <TradingCalendar
        theme="dark"
        showThemeToggle={true}
        onThemeToggle={onThemeToggleMock}
      />
    );

    const toggleBtn = screen.getByTitle('切换为白天模式');
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(onThemeToggleMock).toHaveBeenCalledWith('light');
  });

  it('triggers onMonthChange when clicking month navigation buttons if data is available', () => {
    const onMonthChangeMock = vi.fn();

    render(
      <TradingCalendar
        year={2026}
        month={7}
        monthlySummaries={[
          { month: 6, pnl: 100 },
          { month: 7, pnl: 200 },
          { month: 8, pnl: 300 },
        ]}
        onMonthChange={onMonthChangeMock}
      />
    );

    const prevBtn = screen.getByLabelText('上个月');
    const nextBtn = screen.getByLabelText('下个月');

    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(prevBtn);
    expect(onMonthChangeMock).toHaveBeenCalledWith(2026, 6);

    fireEvent.click(nextBtn);
    expect(onMonthChangeMock).toHaveBeenCalledWith(2026, 8);
  });

  it('disables prev/next month button when no data exists for target month', () => {
    const onMonthChangeMock = vi.fn();

    render(
      <TradingCalendar
        year={2026}
        month={7}
        monthlySummaries={[{ month: 7, pnl: 200 }]} // only month 7 has data
        onMonthChange={onMonthChangeMock}
      />
    );

    const prevBtn = screen.getByLabelText('上个月');
    const nextBtn = screen.getByLabelText('下个月');

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeDisabled();

    fireEvent.click(prevBtn);
    fireEvent.click(nextBtn);

    expect(onMonthChangeMock).not.toHaveBeenCalled();
  });

  it('respects explicit hasPrevMonth and hasNextMonth props', () => {
    render(
      <TradingCalendar
        year={2026}
        month={7}
        hasPrevMonth={false}
        hasNextMonth={true}
      />
    );

    const prevBtn = screen.getByLabelText('上个月');
    const nextBtn = screen.getByLabelText('下个月');

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
  });

  it('renders correctly with density prop', () => {
    const { container, rerender } = render(<TradingCalendar density="compact" />);
    expect(container.querySelector('.tc-calendar-root')).toBeInTheDocument();

    rerender(<TradingCalendar density="normal" />);
    expect(container.querySelector('.tc-calendar-root')).toBeInTheDocument();
  });

  it('renders customAnnualSummary when passed to TradingCalendar', () => {
    render(
      <TradingCalendar
        customAnnualSummary={<div data-testid="root-custom-stats">Root Custom Stats</div>}
      />
    );
    expect(screen.getByTestId('root-custom-stats')).toBeInTheDocument();
    expect(screen.getByText('Root Custom Stats')).toBeInTheDocument();
    expect(screen.queryByText('年化收益率')).not.toBeInTheDocument();
  });

  it('renders headerRight when passed to TradingCalendar and hides default status indicator', () => {
    render(
      <TradingCalendar
        headerRight={<button data-testid="custom-header-slot">Switch Account</button>}
      />
    );
    expect(screen.getByTestId('custom-header-slot')).toBeInTheDocument();
    expect(screen.getByText('Switch Account')).toBeInTheDocument();
    expect(screen.queryByText('实时')).not.toBeInTheDocument();
  });

  describe('future month navigation disallowance', () => {
    it('disables next month button when current view month is current system month or future', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 8, 12)); // 系统当前为 2026年9月12日

      const onMonthChangeMock = vi.fn();
      render(
        <TradingCalendar
          year={2026}
          month={9}
          monthlySummaries={[
            { month: 8, pnl: 500 },
            { month: 9, pnl: 300 },
            { month: 10, pnl: 200 }, // 即使有未来月数据
          ]}
          onMonthChange={onMonthChangeMock}
        />
      );

      const nextBtn = screen.getByLabelText('下个月');
      expect(nextBtn).toBeDisabled();
      expect(nextBtn.className).toContain('disabled:cursor-not-allowed');

      fireEvent.click(nextBtn);
      expect(onMonthChangeMock).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('allows next month button in August to navigate to September when system date is in September', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 8, 12)); // 系统当前为 2026年9月12日

      const onMonthChangeMock = vi.fn();
      render(
        <TradingCalendar
          year={2026}
          month={8}
          monthlySummaries={[
            { month: 8, pnl: 500 },
            { month: 9, pnl: 300 },
          ]}
          onMonthChange={onMonthChangeMock}
        />
      );

      const nextBtn = screen.getByLabelText('下个月');
      expect(nextBtn).not.toBeDisabled();

      fireEvent.click(nextBtn);
      expect(onMonthChangeMock).toHaveBeenCalledWith(2026, 9);

      vi.useRealTimers();
    });
  });
});

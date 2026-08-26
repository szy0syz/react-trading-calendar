import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnnualSummaryCard } from './AnnualSummaryCard';
import { TradingCalendarProvider } from '../context/TradingCalendarContext';

const defaultContext = {
  colorScheme: 'greenUpRedDown' as const,
  theme: 'dark' as const,
  title: 'Test',
  statusText: '实时',
  currency: 'USD',
  updateText: '每日更新',
  sectionTitle: '交易记录',
  showThemeToggle: false,
};

describe('<AnnualSummaryCard />', () => {
  const mockAnnualSummary = {
    year: 2026,
    annualizedReturnRate: 0.3696,
    totalPnL: 376944,
  };

  it('renders annual return rate percentage and total PnL correctly', () => {
    render(
      <TradingCalendarProvider {...defaultContext}>
        <AnnualSummaryCard annualSummary={mockAnnualSummary} />
      </TradingCalendarProvider>
    );

    expect(screen.getByText('年化收益率')).toBeInTheDocument();
    expect(screen.getByText('+37%')).toBeInTheDocument();
    expect(screen.getByText('今年收益')).toBeInTheDocument();
    expect(screen.getByText('+376,944')).toBeInTheDocument();
  });

  it('renders "—" placeholders when no annualSummary is provided', () => {
    render(
      <TradingCalendarProvider {...defaultContext}>
        <AnnualSummaryCard />
      </TradingCalendarProvider>
    );
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it('shows "初始金额 $100k" in Poptip when initialCapital is provided and info icon is hovered', () => {
    render(
      <TradingCalendarProvider {...defaultContext}>
        <AnnualSummaryCard
          annualSummary={{
            ...mockAnnualSummary,
            initialCapital: 100000,
          }}
        />
      </TradingCalendarProvider>
    );

    const infoTrigger = screen.getByLabelText('年化收益率说明');
    expect(screen.queryByText('初始金额 $100k')).not.toBeInTheDocument();

    fireEvent.mouseEnter(infoTrigger);
    expect(screen.getByText('初始金额 $100k')).toBeInTheDocument();
  });

  it('does not render info icon or Poptip when initialCapital is undefined or null', () => {
    render(
      <TradingCalendarProvider {...defaultContext}>
        <AnnualSummaryCard annualSummary={mockAnnualSummary} />
      </TradingCalendarProvider>
    );

    expect(screen.queryByLabelText('年化收益率说明')).not.toBeInTheDocument();
    expect(screen.queryByText(/初始金额/)).not.toBeInTheDocument();
  });
});


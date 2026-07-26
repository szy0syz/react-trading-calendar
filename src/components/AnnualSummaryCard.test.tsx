import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnnualSummaryCard } from './AnnualSummaryCard';

describe('<AnnualSummaryCard />', () => {
  const mockAnnualSummary = {
    year: 2026,
    annualizedReturnRate: 0.3696,
    totalPnL: 376944,
  };

  it('renders annual return rate percentage and total PnL correctly', () => {
    render(
      <AnnualSummaryCard
        annualSummary={mockAnnualSummary}
        colorScheme="greenUpRedDown"
      />
    );

    expect(screen.getByText('年化收益率')).toBeInTheDocument();
    expect(screen.getByText('+36.96%')).toBeInTheDocument();
    expect(screen.getByText('今年收益')).toBeInTheDocument();
    expect(screen.getByText('+376,944')).toBeInTheDocument();
  });
});

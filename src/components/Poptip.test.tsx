import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Poptip } from './Poptip';

describe('<Poptip />', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children and does not show tooltip by default', () => {
    render(
      <Poptip content={<div>Tooltip Info</div>}>
        <button>Trigger Button</button>
      </Poptip>
    );

    expect(screen.getByText('Trigger Button')).toBeInTheDocument();
    expect(screen.queryByText('Tooltip Info')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouseEnter and has pointer-events-none by default', () => {
    render(
      <Poptip content={<div>Tooltip Info</div>}>
        <div>Target Cell</div>
      </Poptip>
    );

    const cell = screen.getByText('Target Cell');
    fireEvent.mouseEnter(cell);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.className).toContain('pointer-events-none');
    expect(tooltip.className).not.toContain('pointer-events-auto');
  });

  it('immediately closes tooltip on mouseLeave when interactive=false (default)', () => {
    render(
      <Poptip content={<div>Tooltip Info</div>}>
        <div>Target Cell</div>
      </Poptip>
    );

    const cell = screen.getByText('Target Cell');
    fireEvent.mouseEnter(cell);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Leave the cell - should disappear immediately without timer tick
    fireEvent.mouseLeave(cell);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('keeps tooltip open during timeout when interactive=true', () => {
    render(
      <Poptip content={<div>Tooltip Info</div>} interactive>
        <div>Target Cell</div>
      </Poptip>
    );

    const cell = screen.getByText('Target Cell');
    fireEvent.mouseEnter(cell);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('pointer-events-auto');

    // Leave the cell - should still be visible before timer fires
    fireEvent.mouseLeave(cell);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Advance timer past 120ms
    act(() => {
      vi.advanceTimersByTime(130);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('supports click trigger', () => {
    render(
      <Poptip content={<div>Clicked Content</div>} trigger="click">
        <button>Click Me</button>
      </Poptip>
    );

    const btn = screen.getByRole('button', { name: 'Click Me' });
    expect(screen.queryByText('Clicked Content')).not.toBeInTheDocument();

    fireEvent.click(btn);
    expect(screen.getByText('Clicked Content')).toBeInTheDocument();

    // Click outside to close
    fireEvent.click(document.body);
    expect(screen.queryByText('Clicked Content')).not.toBeInTheDocument();
  });
});

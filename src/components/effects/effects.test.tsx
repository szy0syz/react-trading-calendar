import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { CellEffectLevel, isCalendarLevelEffect } from '../../types';
import {
  TradingEffectProvider,
  useTradingEffect,
  LocalCellEffects,
  CalendarStageEffects,
} from './index';
import { TradingCalendar } from '../../TradingCalendar';

describe('CellEffectLevel and isCalendarLevelEffect', () => {
  it('correctly classifies calendar-level (global alerts) vs cell-level (pure local badges) effects', () => {
    // 盈利系列（全部已收敛为纯 Cell 级微动效，不干扰全局）
    expect(isCalendarLevelEffect(CellEffectLevel.PROFIT_PASSABLE)).toBe(false);
    expect(isCalendarLevelEffect(CellEffectLevel.PROFIT_NICE)).toBe(false);
    expect(isCalendarLevelEffect(CellEffectLevel.PROFIT_GREAT)).toBe(false);
    expect(isCalendarLevelEffect(CellEffectLevel.PROFIT_AWESOME)).toBe(false);
    expect(isCalendarLevelEffect(CellEffectLevel.PROFIT_INVINCIBLE)).toBe(false);

    // 亏损系列（仅重度亏损保留全局警示）
    expect(isCalendarLevelEffect(CellEffectLevel.LOSS_BAD)).toBe(false);
    expect(isCalendarLevelEffect(CellEffectLevel.LOSS_TERRIBLE)).toBe(true);
    expect(isCalendarLevelEffect(CellEffectLevel.LOSS_ABYSMAL)).toBe(true);

    // 空值防守
    expect(isCalendarLevelEffect(null)).toBe(false);
    expect(isCalendarLevelEffect(undefined)).toBe(false);
  });
});

describe('LocalCellEffects', () => {
  it('renders correctly for all 5 profit levels and local loss level', () => {
    // L1: 呼吸微光
    const { container: c1 } = render(<LocalCellEffects level={CellEffectLevel.PROFIT_PASSABLE} />);
    expect(c1.querySelector('.animate-pulse')).toBeInTheDocument();

    // L2: 星芒 ✦
    const { container: c2 } = render(<LocalCellEffects level={CellEffectLevel.PROFIT_NICE} />);
    expect(c2.textContent).toContain('✦');

    // L3: 火箭 🚀
    const { container: c3 } = render(<LocalCellEffects level={CellEffectLevel.PROFIT_GREAT} />);
    expect(c3.textContent).toContain('🚀');

    // L4: 点赞 👍
    const { container: c4 } = render(<LocalCellEffects level={CellEffectLevel.PROFIT_AWESOME} />);
    expect(c4.textContent).toContain('👍');

    // L5: 皇冠 👑
    const { container: c5 } = render(<LocalCellEffects level={CellEffectLevel.PROFIT_INVINCIBLE} />);
    expect(c5.textContent).toContain('👑');

    // 亏损 L1: 🙁 徽章
    const { container: c6 } = render(<LocalCellEffects level={CellEffectLevel.LOSS_BAD} />);
    expect(c6.firstElementChild).toBeInTheDocument();
    expect(c6.textContent).toContain('🙁');
  });
});

// 测试组件：测试 TradingEffectContext 互斥锁与防抖逻辑
const TestSchedulerConsumer: React.FC = () => {
  const {
    activeGlobalEffect,
    isGlobalLocked,
    requestGlobalEffect,
    cancelPendingIntent,
    completeGlobalEffect,
  } = useTradingEffect();

  return (
    <div>
      <div data-testid="locked-status">{isGlobalLocked ? 'locked' : 'unlocked'}</div>
      <div data-testid="active-level">{activeGlobalEffect?.level ?? 'none'}</div>
      <div data-testid="active-target">{activeGlobalEffect?.targetDate ?? 'none'}</div>

      <button
        data-testid="btn-trigger-terrible"
        onClick={() =>
          requestGlobalEffect('2026-08-25', CellEffectLevel.LOSS_TERRIBLE, {
            x: 150,
            y: 200,
            width: 80,
            height: 60,
          })
        }
      >
        Trigger Terrible
      </button>

      <button
        data-testid="btn-trigger-abysmal"
        onClick={() =>
          requestGlobalEffect('2026-08-26', CellEffectLevel.LOSS_ABYSMAL, {
            x: 180,
            y: 220,
            width: 80,
            height: 60,
          })
        }
      >
        Trigger Abysmal
      </button>

      <button
        data-testid="btn-cancel"
        onClick={() => cancelPendingIntent('2026-08-25')}
      >
        Cancel
      </button>

      <button
        data-testid="btn-complete"
        onClick={() => completeGlobalEffect()}
      >
        Complete
      </button>
    </div>
  );
};

describe('TradingEffectContext & Mutex Lock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays execution by 250ms for intent recognition', () => {
    render(
      <TradingEffectProvider>
        <TestSchedulerConsumer />
      </TradingEffectProvider>
    );

    expect(screen.getByTestId('locked-status').textContent).toBe('unlocked');
    expect(screen.getByTestId('active-level').textContent).toBe('none');

    // 点击请求触发
    fireEvent.click(screen.getByTestId('btn-trigger-terrible'));

    // 100ms 后依然不应激活（防抖生效中）
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId('locked-status').textContent).toBe('unlocked');
    expect(screen.getByTestId('active-level').textContent).toBe('none');

    // 达到 250ms 后正式激活并锁定
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByTestId('locked-status').textContent).toBe('locked');
    expect(screen.getByTestId('active-level').textContent).toBe(CellEffectLevel.LOSS_TERRIBLE);
    expect(screen.getByTestId('active-target').textContent).toBe('2026-08-25');
  });

  it('cancels pending intent if mouse leaves before 250ms', () => {
    render(
      <TradingEffectProvider>
        <TestSchedulerConsumer />
      </TradingEffectProvider>
    );

    fireEvent.click(screen.getByTestId('btn-trigger-terrible'));

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // 鼠标在 100ms 时划出并取消
    fireEvent.click(screen.getByTestId('btn-cancel'));

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // 不应被触发
    expect(screen.getByTestId('locked-status').textContent).toBe('unlocked');
    expect(screen.getByTestId('active-level').textContent).toBe('none');
  });

  it('enforces mutual exclusion (mutex lock) while a global effect is playing', () => {
    render(
      <TradingEffectProvider>
        <TestSchedulerConsumer />
      </TradingEffectProvider>
    );

    // 触发第一个全局动效
    fireEvent.click(screen.getByTestId('btn-trigger-terrible'));
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByTestId('locked-status').textContent).toBe('locked');
    expect(screen.getByTestId('active-level').textContent).toBe(CellEffectLevel.LOSS_TERRIBLE);

    // 正在播放中时，尝试触发第二个全局动效，应被互斥锁立即丢弃阻断
    fireEvent.click(screen.getByTestId('btn-trigger-abysmal'));
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // 状态依然是第一个，第二个没有切入
    expect(screen.getByTestId('active-level').textContent).toBe(CellEffectLevel.LOSS_TERRIBLE);
    expect(screen.getByTestId('active-target').textContent).toBe('2026-08-25');

    // 释放锁
    fireEvent.click(screen.getByTestId('btn-complete'));
    expect(screen.getByTestId('locked-status').textContent).toBe('unlocked');
    expect(screen.getByTestId('active-level').textContent).toBe('none');
  });
});

describe('TradingCalendar Integration with onCellHoverEffect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders purely local micro badge (👍) on profit hover without global disruption', () => {
    const mockHoverEffect = vi.fn((day) => {
      if (day.pnl && day.pnl >= 50000) {
        return CellEffectLevel.PROFIT_AWESOME;
      }
      return null;
    });

    const records = [
      { date: '2026-08-24', pnl: 72000, tradesCount: 5 },
      { date: '2026-08-25', pnl: 1500, tradesCount: 2 },
    ];

    const { container } = render(
      <TradingCalendar
        year={2026}
        month={8}
        dailyRecords={records}
        onCellHoverEffect={mockHoverEffect}
      />
    );

    const cell24 = container.querySelector('[data-date="2026-08-24"]');
    expect(cell24).toBeInTheDocument();

    // 鼠标悬停在 08/24 (+$72,000)
    fireEvent.mouseEnter(cell24!);
    expect(mockHoverEffect).toHaveBeenCalled();

    // 盈利动效是纯 Cell 局部动效：无需等待 250ms 全局防抖，立即在本地渲染 👍 徽章
    expect(cell24?.textContent).toContain('👍');

    // 日历根节点不会携带任何阻碍全局阅读的 calendar-effect 属性
    const root = container.querySelector('.tc-calendar-root');
    expect(root).not.toHaveAttribute('data-calendar-effect');

    // 其他单元格（08/25）不受任何视觉干扰，完整可读
    const cell25 = container.querySelector('[data-date="2026-08-25"]');
    expect(cell25?.textContent).toContain('+1,500');

    // 鼠标移出后，本地动效平滑清理
    fireEvent.mouseLeave(cell24!);
    expect(cell24?.textContent).not.toContain('👍');
  });
});

describe('CalendarStageEffects Loss Animations', () => {
  it('renders LOSS_TERRIBLE with exactly one expanding ring and warning emoji ⚠️', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <CalendarStageEffects
        effect={{
          level: CellEffectLevel.LOSS_TERRIBLE,
          targetDate: '2026-08-25',
          targetRect: { x: 100, y: 100, width: 80, height: 50 },
        }}
        onComplete={onComplete}
      />
    );

    // 含有 ⚠️ 警报
    expect(container.textContent).toContain('⚠️');
    expect(container.textContent).not.toContain('👎');

    // 仅有一圈光圈脉冲框（border-rose-600）
    const rings = container.querySelectorAll('.border-rose-600');
    expect(rings.length).toBe(1);
  });

  it('renders LOSS_ABYSMAL with thumbs-down emoji 👎 and cyber crack svg', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <CalendarStageEffects
        effect={{
          level: CellEffectLevel.LOSS_ABYSMAL,
          targetDate: '2026-08-26',
          targetRect: { x: 120, y: 120, width: 80, height: 50 },
        }}
        onComplete={onComplete}
      />
    );

    // 含有 👎 熔断点踩，不含 ⚠️
    expect(container.textContent).toContain('👎');
    expect(container.textContent).not.toContain('⚠️');

    // 含有故障裂纹 SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});


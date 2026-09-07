import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { CellEffectLevel, isCalendarLevelEffect } from '../../types';
import { GlobalEffectPayload, TargetRect, TradingEffectContextValue } from './types';

const defaultContext: TradingEffectContextValue = {
  activeGlobalEffect: null,
  isGlobalLocked: false,
  requestGlobalEffect: () => {},
  cancelPendingIntent: () => {},
  completeGlobalEffect: () => {},
};

export const TradingEffectContext = createContext<TradingEffectContextValue>(defaultContext);

export interface TradingEffectProviderProps {
  children: React.ReactNode;
}

export const TradingEffectProvider: React.FC<TradingEffectProviderProps> = ({ children }) => {
  const [activeGlobalEffect, setActiveGlobalEffect] = useState<GlobalEffectPayload | null>(null);
  const [isGlobalLocked, setIsGlobalLocked] = useState<boolean>(false);

  // 防抖计时器引用
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDateRef = useRef<string | null>(null);
  // 安全降级超时定时器
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completeGlobalEffect = useCallback(() => {
    setActiveGlobalEffect(null);
    setIsGlobalLocked(false);
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);

  const cancelPendingIntent = useCallback((date: string) => {
    if (pendingDateRef.current === date && pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
      pendingDateRef.current = null;
    }
  }, []);

  const requestGlobalEffect = useCallback(
    (date: string, level: CellEffectLevel, rect: TargetRect) => {
      // 1. 若非 Calendar 级动效，不在此调度
      if (!isCalendarLevelEffect(level)) return;

      // 2. 若全局已上锁（正在播放另一个全局动效），静默丢弃，互斥保护
      if (isGlobalLocked) return;

      // 3. 取消之前的待执行意图
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }

      pendingDateRef.current = date;

      // 4. 250ms 意图识别防抖（避免划过误触）
      pendingTimerRef.current = setTimeout(() => {
        pendingTimerRef.current = null;
        pendingDateRef.current = null;

        // 再次校验锁状态
        setIsGlobalLocked((currentLocked) => {
          if (currentLocked) return currentLocked;

          setActiveGlobalEffect({
            level,
            targetDate: date,
            targetRect: rect,
          });

          // 设置 3.5s 强制安全超时，防止极端情况下未正常触发 complete 回调导致永久锁死
          if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
          safetyTimeoutRef.current = setTimeout(() => {
            setActiveGlobalEffect(null);
            setIsGlobalLocked(false);
          }, 3500);

          return true;
        });
      }, 250);
    },
    [isGlobalLocked]
  );

  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  return (
    <TradingEffectContext.Provider
      value={{
        activeGlobalEffect,
        isGlobalLocked,
        requestGlobalEffect,
        cancelPendingIntent,
        completeGlobalEffect,
      }}
    >
      {children}
    </TradingEffectContext.Provider>
  );
};

export function useTradingEffect(): TradingEffectContextValue {
  return useContext(TradingEffectContext);
}

import React from 'react';

/**
 * 异步动态加载的全局 Calendar 级舞台动效组件（重度亏损全场警报与熔断故障）
 * 确保初始渲染时不会将此 chunk 打包进关键首屏执行路径
 */
export const LazyCalendarStageEffects = React.lazy(
  () => import('./CalendarStageEffects')
);

/**
 * 静默预拉取函数：在后台加载动效 chunk
 */
export function preloadStageEffects(): void {
  try {
    import('./CalendarStageEffects');
  } catch {
    // 预拉取失败静默忽略
  }
}

/**
 * 智能调度空闲预加载：当检测到当前月份可能触发全局动效时，在 requestIdleCallback 时段静默拉取
 */
export function scheduleIdlePreload(hasPotentialHighEffect: boolean): void {
  if (!hasPotentialHighEffect || typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      preloadStageEffects();
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      preloadStageEffects();
    }, 1000);
  }
}

import { CellEffectLevel } from '../../types';

export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GlobalEffectPayload {
  level: CellEffectLevel;
  targetDate: string;
  targetRect: TargetRect;
}

export interface TradingEffectContextValue {
  /** 当前激活的全局 Calendar 级动效（未触发时为 null） */
  activeGlobalEffect: GlobalEffectPayload | null;
  /** 全局互斥锁：是否正在播放全局动效 */
  isGlobalLocked: boolean;
  /**
   * 请求触发动效（包含 250ms 意图防抖与互斥检测）
   * @param date 触发的日期字符串
   * @param level 目标动效等级
   * @param rect 目标单元格相对于日历根节点的几何矩形
   */
  requestGlobalEffect: (date: string, level: CellEffectLevel, rect: TargetRect) => void;
  /**
   * 鼠标离开时尝试取消未生效的意图计时器
   */
  cancelPendingIntent: (date: string) => void;
  /**
   * 全局动效播放完毕，主动通知释放互斥锁
   */
  completeGlobalEffect: () => void;
}

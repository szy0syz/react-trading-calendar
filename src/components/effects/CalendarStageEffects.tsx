import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CellEffectLevel } from '../../types';
import { GlobalEffectPayload } from './types';

export interface CalendarStageEffectsProps {
  effect: GlobalEffectPayload;
  onComplete: () => void;
}

export const CalendarStageEffects: React.FC<CalendarStageEffectsProps> = ({
  effect,
  onComplete,
}) => {
  const { level, targetRect } = effect;

  // 根据亏损级别设置动效持续时间
  useEffect(() => {
    let duration = 1800;
    if (level === CellEffectLevel.LOSS_TERRIBLE) duration = 1600;
    if (level === CellEffectLevel.LOSS_ABYSMAL) duration = 2000;

    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [level, onComplete]);

  return (
    <div
      data-testid="calendar-stage-effects-root"
      className="absolute inset-0 pointer-events-none overflow-hidden z-30"
    >
      <AnimatePresence mode="wait">
        {/* 全局级宏观警示：重度亏损全场联动 */}
        {/* 亏损 L2: 太差劲了 (LOSS_TERRIBLE) - 重力沉降 + 单圈暗红光圈 + ⚠️ */}
        {level === CellEffectLevel.LOSS_TERRIBLE && (
          <React.Fragment key="loss_terrible">
            {/* 深红警报单圈光圈放大脉冲 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.9 }}
              animate={{ scale: [0.8, 2.0], opacity: [0.9, 0] }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                left: targetRect.x,
                top: targetRect.y,
                width: targetRect.width,
                height: targetRect.height,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.6)] pointer-events-none"
            />

            {/* 灰烬与泪滴微粒向下飘落 */}
            {[-18, -6, 6, 18].map((offset, idx) => (
              <motion.div
                key={idx}
                initial={{
                  x: targetRect.x + offset,
                  y: targetRect.y,
                  opacity: 0.8,
                  scale: 1,
                }}
                animate={{
                  y: targetRect.y + 50 + idx * 8,
                  opacity: [0.8, 0],
                  scale: [1, 0.4],
                }}
                transition={{ duration: 0.9, delay: 0.1 * idx, ease: 'easeIn' }}
                className="absolute w-1.5 h-1.5 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.8)] pointer-events-none"
              />
            ))}

            {/* 警报三角叹号 ⚠️ */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.9] }}
              transition={{ duration: 0.4 }}
              style={{ left: targetRect.x, top: targetRect.y - 25 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-rose-500 font-bold text-lg select-none filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] z-50 pointer-events-none"
            >
              ⚠️
            </motion.div>
          </React.Fragment>
        )}

        {/* ================================================================= */}
        {/* 亏损 L3: 烂透了 (LOSS_ABYSMAL) - 赛博熔断闪烁 + 碎裂电光线 + 👎 */}
        {/* ================================================================= */}
        {level === CellEffectLevel.LOSS_ABYSMAL && (
          <React.Fragment key="loss_abysmal">
            {/* 0.2s 瞬时全息故障扫掠条纹 */}
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.6, 0.1, 0.5, 0] }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 bg-gradient-to-b from-rose-950/40 via-red-500/10 to-rose-950/40 pointer-events-none mix-blend-overlay"
            />

            {/* 目标单元格表面的 SVG 裂痕电光 */}
            <svg
              style={{
                left: targetRect.x,
                top: targetRect.y,
                width: targetRect.width * 1.3,
                height: targetRect.height * 1.3,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 overflow-visible"
              viewBox="0 0 100 100"
            >
              <motion.path
                d="M 10 20 L 45 50 L 30 70 L 65 85 L 90 95"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1], opacity: [1, 0.8, 0] }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
              <motion.path
                d="M 85 15 L 55 45 L 70 65 L 40 90"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1], opacity: [1, 0.8, 0] }}
                transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
              />
            </svg>

            {/* 点踩/熔断徽章 👎 */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.9] }}
              transition={{ duration: 0.4 }}
              style={{ left: targetRect.x, top: targetRect.y - 25 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-rose-500 font-bold text-lg select-none filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] z-50 pointer-events-none"
            >
              👎
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarStageEffects;

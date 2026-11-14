import React from 'react';
import { motion } from 'motion/react';
import type { TargetAndTransition } from 'motion/react';
import { CellEffectLevel } from '../../types';

interface LocalCellEffectsProps {
  level: CellEffectLevel;
}

interface BadgeEffectConfig {
  emoji: string;
  borderClassName: string;
  badgeClassName: string;
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  damping: number;
}

/**
 * 表驱动徽章类局部动效配置：统一渲染外框高亮 + 右上角弹簧徽章
 */
const BADGE_EFFECT_CONFIGS: Partial<Record<CellEffectLevel, BadgeEffectConfig>> = {
  // 盈利 L3: 棒 - 能量流光环绕与点赞弹射徽章 (👍)
  [CellEffectLevel.PROFIT_GREAT]: {
    emoji: '👍',
    borderClassName: 'border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.45)]',
    badgeClassName:
      '-top-3 -right-2.5 w-[26px] h-[26px] bg-gradient-to-r from-emerald-500 to-teal-400 text-[14px] shadow-md border border-emerald-200/60',
    initial: { scale: 0, rotate: -20, opacity: 0 },
    animate: { scale: [0, 1.25, 1], rotate: [0, 10, 0], opacity: 1 },
    damping: 15,
  },
  // 盈利 L4: 厉害 - 翡翠双重流光与火箭弹射徽章 (🚀)
  [CellEffectLevel.PROFIT_AWESOME]: {
    emoji: '🚀',
    borderClassName:
      'border-2 border-emerald-400 bg-emerald-500/10 shadow-[0_0_18px_rgba(52,211,153,0.5)]',
    badgeClassName:
      '-top-3.5 -right-3 w-[28px] h-[28px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 text-[16px] shadow-lg border border-emerald-200/80 shadow-emerald-500/25',
    initial: { scale: 0, rotate: -20, opacity: 0 },
    animate: { scale: [0, 1.3, 1], rotate: [0, 10, 0], opacity: 1 },
    damping: 14,
  },
  // 盈利 L5: 无人能敌 - 香槟金流光外框与皇冠弹射徽章 (👑)
  [CellEffectLevel.PROFIT_INVINCIBLE]: {
    emoji: '👑',
    borderClassName:
      'border-2 border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.55)]',
    badgeClassName:
      '-top-4 -right-3.5 w-[32px] h-[32px] bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-[19px] shadow-xl border-2 border-amber-100 shadow-amber-500/35',
    initial: { scale: 0, y: -8, rotate: -15, opacity: 0 },
    animate: { scale: [0, 1.35, 1], y: 0, rotate: [0, 12, 0], opacity: 1 },
    damping: 13,
  },
  // 亏损 L1: 不好 - 暗红微光外框与右上角弹射微徽章 (🙁)
  [CellEffectLevel.LOSS_BAD]: {
    emoji: '🙁',
    borderClassName: 'border border-rose-400/60 bg-rose-500/5 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
    badgeClassName:
      '-top-3.5 -right-3 w-[28px] h-[28px] bg-gradient-to-r from-rose-500 to-red-400 text-[18px] shadow-md border border-rose-200/60',
    initial: { scale: 0, rotate: 15, opacity: 0 },
    animate: { scale: [0, 1.25, 1], rotate: [0, -8, 0], opacity: 1 },
    damping: 15,
  },
};

export const LocalCellEffects: React.FC<LocalCellEffectsProps> = ({ level }) => {
  // 盈利 L1: 马虎马虎 - 微澜呼吸光晕与底部微光跑马线
  if (level === CellEffectLevel.PROFIT_PASSABLE) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-md z-10">
        <div className="absolute inset-0 rounded-md border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)] animate-pulse" />
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
        />
      </div>
    );
  }

  // 盈利 L2: 还不错 - 轻盈上浮微跃动与香槟金微粒
  if (level === CellEffectLevel.PROFIT_NICE) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-visible rounded-md z-10">
        <div className="absolute inset-0 rounded-md border border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.3)]" />
        {[-12, 0, 12].map((offset, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], y: -15 - i * 3, scale: [0.5, 1, 0.7] }}
            transition={{ duration: 0.9 + i * 0.15, repeat: Infinity, delay: i * 0.2 }}
            className="absolute top-0 text-[10px] select-none text-amber-300 font-bold"
            style={{ left: `calc(50% + ${offset}px)` }}
          >
            ✦
          </motion.span>
        ))}
      </div>
    );
  }

  const badgeConfig = BADGE_EFFECT_CONFIGS[level];
  if (!badgeConfig) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible rounded-md z-20">
      <div className={`absolute inset-0 rounded-md ${badgeConfig.borderClassName}`} />
      <motion.div
        initial={badgeConfig.initial}
        animate={badgeConfig.animate}
        transition={{ type: 'spring', stiffness: 450, damping: badgeConfig.damping }}
        className={`absolute rounded-full flex items-center justify-center leading-none select-none ${badgeConfig.badgeClassName}`}
      >
        {badgeConfig.emoji}
      </motion.div>
    </div>
  );
};

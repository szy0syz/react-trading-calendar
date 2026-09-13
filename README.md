# react-trading-calendar

轻量、高性能、开箱即用的纯渲染交易记录日历组件 (React + Tailwind CSS v4)。支持美股/A股红绿配色切换、明暗主题、交易笔数 Hover 提示、移动端响应式布局。

[![GitHub Repo](https://img.shields.io/badge/GitHub-szy0syz%2Freact--trading--calendar-blue?logo=github)](https://github.com/szy0syz/react-trading-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Trading Calendar Demo](./demo.gif)

---

## ✨ 特性

- 🚀 **纯渲染零副作用**：全数据由 Props 驱动，组件内部不持有任何请求逻辑。
- ⚡ **交易笔数 Hover 提示**：支持设置每日交易笔数 (`tradesCount`)，鼠标悬停即刻浮现双主题响应的极简提示徽章。
- 🎨 **主题与配色**：支持 `dark` / `light` 主题，以及 `greenUpRedDown` (美股) / `redUpGreenDown` (A股) 涨跌配色。
- 📱 **移动端响应式**：窄屏自动隐藏周数列，月度面板切换为 4×3 布局，无横向滚动条。
- 🎭 **8 级悬停动效系统**：内置 5 级盈利（🚀/👍/👑 勋章）与 3 级亏损（🙁/⚠️/👎 宏观警报），业务完全解耦，首屏零阻塞按需异步加载。
- 📦 **轻量打包**：提供 ESM、CJS 及 TypeScript 类型声明，CSS 仅 ~8.9KB (gzipped)。
- 🔌 **高级扩展**：通过 `useTradingCalendar()` Hook 可在任意子树内消费全局 Context，支持二次封装。

---

## 📦 安装

```bash
pnpm add react-trading-calendar
# 或
npm install react-trading-calendar
```

---

## 💡 快速上手

```tsx
import { useState } from 'react';
import { TradingCalendar } from 'react-trading-calendar';
import 'react-trading-calendar/style.css';

export function App() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const dailyRecords = [
    { date: '2026-08-04', pnl: -4709, tradesCount: 2 },
    { date: '2026-08-05', pnl: 11245, tradesCount: 12 },
    { date: '2026-08-06', pnl: 3523, tradesCount: 5 },
  ];

  return (
    <TradingCalendar
      year={year}
      month={month}
      dailyRecords={dailyRecords}
      colorScheme="greenUpRedDown"
      theme="dark"
      onMonthChange={(y, m) => { setYear(y); setMonth(m); }}
      onDateClick={(record) => console.log('Clicked:', record)}
    />
  );
}
```

---

## ⚙️ Props API

| 属性名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `year` | `number` | 当前系统年份 | 视图年份 |
| `month` | `number` | 当前系统月份 | 视图月份 (1 - 12) |
| `dailyRecords` | `DailyRecord[]` | `[]` | 每日交易数据列表 |
| `weeklySummaries` | `WeeklySummary[]` | 自动按日累计 | 可选周度盈亏覆盖 |
| `monthlySummaries` | `MonthlySummary[]` | `[]` | 月度盈亏数据列表 |
| `annualSummary` | `AnnualSummary` | `undefined` | 年化收益总结 |
| `colorScheme` | `'greenUpRedDown' \| 'redUpGreenDown'` | `'greenUpRedDown'` | 涨跌配色 (美股/A股) |
| `theme` | `'dark' \| 'light'` | `'dark'` | 明暗主题 |
| `showThemeToggle` | `boolean` | `false` | 是否显示 Header 内的主题切换按钮 |
| `title` | `string` | `'实盘交易记录'` | 顶部窗口标题 |
| `statusText` | `string` | `'实时'` | 顶部状态文本 |
| `sectionTitle` | `string` | `'交易记录'` | 控制栏区域标题 |
| `currency` | `string` | `'美元 (USD)'` | 底部货币单位 |
| `updateText` | `string` | `'每日实时更新'` | 底部更新提示 |
| `onMonthChange` | `(year, month) => void` | — | 月份切换回调 |
| `onDateClick` | `(record: DailyRecord) => void` | — | 点击日期单元格回调 |
| `onThemeToggle` | `(theme: Theme) => void` | — | 主题切换回调 |
| `onCellHoverEffect` | `(day: DailyRecord) => CellEffectLevel \| null \| undefined` | `undefined` | 单元格悬停动效判定回调（未传则不触发动效） |
| `className` | `string` | — | 根容器附加类名 |
| `style` | `React.CSSProperties` | — | 根容器内联样式 |

### 数据类型

```ts
interface DailyRecord {
  date: string;            // 'YYYY-MM-DD' 或 'MM/DD'
  pnl?: number | null;     // 盈亏金额
  tradesCount?: number | null; // 交易笔数 (悬停浮现 "X 笔交易")
  isNonTradingDay?: boolean;
  note?: string;
}

interface WeeklySummary  { weekNumber: number; pnl?: number | null; }
interface MonthlySummary { month: number;      pnl?: number | null; }
interface AnnualSummary  {
  year: number;
  annualizedReturnRate: number; // 如 0.3696 = 36.96%
  totalPnL: number;
}
```

---

## 🎭 单元格悬停动效 (Cell Hover Effects)

组件提供了一套高品质、纯局部与全场宏观联动兼备的 8 级动效反馈系统，采用 **业务完全解耦、回调按需触发** 的架构设计：

- **业务零侵入**：组件内部不内置任何硬编码的涨跌金额或百分比规则。由调用方传入 `onCellHoverEffect` 回调函数，根据当前单元格数据（`DailyRecord`）自主计算并返回动效等级枚举 `CellEffectLevel`。
- **默认静默**：若未传入 `onCellHoverEffect`，单元格保持极速纯原生渲染，完全不挂载动效 DOM。
- **作用域分层隔离**：
  - **局部级 (Cell Level)**：5 级盈利系列与轻度亏损均为纯单元格微徽章自闭环，离开即复原，**0 侵入其他单元格数据**；
  - **全局级 (Calendar Level)**：仅重度亏损激活全场联动预警（日历重力下沉灰化 / 赛博全息熔断），内置 **250ms 意图识别防抖** 与 **全局单例互斥锁 (Mutex Lock)**，彻底杜绝鼠标划过误触与动画重叠撕裂。
- **首屏 0 阻塞**：全局舞台动效模块通过动态 `React.lazy` 按需打包（~3.6KB gzip），支持空闲时间（`requestIdleCallback`）静默预拉取。

### 1. 动效级别一览表

| 级别枚举 `CellEffectLevel` | 类型 | 视觉呈现细节 | 推荐业务参考阈值 |
| :--- | :--- | :--- | :--- |
| `PROFIT_PASSABLE` | 局部 Cell 级 | 翠绿外框呼吸微光 + 底部极细跑马光线 | 轻度盈利（如 0% ~ 10%） |
| `PROFIT_NICE` | 局部 Cell 级 | 翠绿外框微光 + 单元格内浮现 3 颗香槟金升腾微粒 (✦) | 良好盈利（如 10% ~ 20%） |
| `PROFIT_GREAT` | 局部 Cell 级 | 2px 翡翠高亮外框 + 右上角 26px 弹射勋章：👍 **点赞勋章** | 显著盈利（如 20% ~ 50%） |
| `PROFIT_AWESOME` | 局部 Cell 级 | 2px 翡翠流光外框 + 柔和底衬 + 右上角 28px 弹射勋章：🚀 **火箭勋章** | 卓越盈利（如 50% ~ 100%） |
| `PROFIT_INVINCIBLE`| 局部 Cell 级 | 2px 香槟金外框 + 金色微暗影 + 右上角 32px 尊贵勋章：👑 **皇冠勋章** | 终极爆发盈利（如 ≥ 100%） |
| `LOSS_BAD` | 局部 Cell 级 | 暗红微光外框 + 淡红半透明底衬 + 右上角 28px 弹射勋章：🙁 **沮丧勋章** | 轻度亏损（如 0% ~ -50%） |
| `LOSS_TERRIBLE` | 全局 Calendar 级 | 全场下沉重击震颤 + 周边格倾斜灰化 + 目标格单圈红光放大 + ⚠️ **警报** | 严重亏损（如 -50% ~ -100%） |
| `LOSS_ABYSMAL` | 全局 Calendar 级 | 全场赛博朋克 RGB 故障熔断 + 发光红色裂纹电光线 + 🩸 **滴血** + 👎 **熔断勋章** | 极端巨额亏损（如 < -100%） |

---

### 2. 调用与触发函数编写示例

只需从包中导出 `CellEffectLevel` 枚举，并实现 `onCellHoverEffect` 函数传给 `<TradingCalendar />`：

```tsx
import { useState } from 'react';
import { TradingCalendar, CellEffectLevel } from 'react-trading-calendar';
import type { DailyRecord } from 'react-trading-calendar';
import 'react-trading-calendar/style.css';

export function MyTradingCalendar() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(8);

  // 假设基准本金为 100k，可根据业务自由定义计算规则
  const INITIAL_CAPITAL = 100_000;

  /**
   * 动效触发规则解析函数：
   * 接收当前鼠标悬停的 dailyRecord，返回对应的 CellEffectLevel 枚举值（或返回 null/undefined 不触发）
   */
  const handleCellHoverEffect = (day: DailyRecord): CellEffectLevel | null => {
    // 非交易日或无盈亏数据时不触发动效
    if (day.pnl == null || day.isNonTradingDay) return null;

    // 计算当日收益率百分比
    const returnRate = (day.pnl / INITIAL_CAPITAL) * 100;

    // --- 盈利系列 (纯局部微徽章自闭环，不干扰阅读) ---
    if (returnRate >= 100) return CellEffectLevel.PROFIT_INVINCIBLE; // 👑 皇冠勋章
    if (returnRate >= 50)  return CellEffectLevel.PROFIT_AWESOME;    // 🚀 火箭勋章
    if (returnRate >= 20)  return CellEffectLevel.PROFIT_GREAT;      // 👍 点赞勋章
    if (returnRate >= 10)  return CellEffectLevel.PROFIT_NICE;       // ✦ 星芒微粒
    if (returnRate > 0)    return CellEffectLevel.PROFIT_PASSABLE;   // 呼吸跑马微光

    // --- 亏损系列 ---
    if (returnRate < -100) return CellEffectLevel.LOSS_ABYSMAL;     // 👎 赛博故障熔断 (全局宏观预警)
    if (returnRate <= -50) return CellEffectLevel.LOSS_TERRIBLE;    // ⚠️ 重力下沉灰化 (全局宏观预警)
    return CellEffectLevel.LOSS_BAD;                                // 🙁 沮丧勋章 (纯局部自闭环)
  };

  return (
    <TradingCalendar
      year={year}
      month={month}
      dailyRecords={myDailyRecords}
      colorScheme="greenUpRedDown"
      theme="dark"
      onCellHoverEffect={handleCellHoverEffect} // 挂载动效解析触发函数
    />
  );
}
```

---

## 🔌 高级用法：二次封装

重构后的组件内置 `TradingCalendarContext`，允许在 `TradingCalendar` 的任意子树内直接消费全局配置：

```tsx
import { useTradingCalendar } from 'react-trading-calendar';

function MyCustomBadge() {
  const { colorScheme, theme } = useTradingCalendar();
  // ...
}
```

---

## 📄 License

[MIT](./LICENSE)

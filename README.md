# react-trading-calendar

轻量、高性能、开箱即用的纯渲染交易记录日历组件 (React + Tailwind CSS)。支持美股/A股红绿配色切换、明暗黑夜模式、移动端响应式布局。

---

## ✨ 特性

- 🚀 **纯渲染零依赖**：无硬编码接口，全数据由 Props 驱动。
- 🎨 **主题与配色**：支持 `dark` / `light` 主题，以及 `greenUpRedDown` (美股) / `redUpGreenDown` (A股) 涨跌配色。
- 📱 **移动端响应式**：窄屏自适应隐藏周数列，自动切换为 4x3 月度布局，绝无横向滚动条。
- 📦 **轻量打包**：提供 ESM、CJS 及 TypeScript 类型声明，纯净 CSS 仅 ~7.5KB (gzipped)。

---

## 📦 安装

```bash
# pnpm
pnpm add react-trading-calendar

# npm
npm install react-trading-calendar
```

---

## 💡 快速上手

```tsx
import { useState } from 'react';
import { TradingCalendar } from 'react-trading-calendar';
import 'react-trading-calendar/style.css';

export function App() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(7);

  const mockDailyRecords = [
    { date: '2026-07-06', pnl: -4709 },
    { date: '2026-07-07', pnl: 11245 },
    { date: '2026-07-08', pnl: 3523 },
    { date: '2026-07-09', pnl: 5128 },
    { date: '2026-07-10', pnl: -4217 },
  ];

  return (
    <TradingCalendar
      year={year}
      month={month}
      dailyRecords={mockDailyRecords}
      colorScheme="greenUpRedDown"
      theme="dark"
      onMonthChange={(y, m) => {
        setYear(y);
        setMonth(m);
      }}
      onDateClick={(record) => console.log('Clicked:', record)}
    />
  );
}
```

---

## ⚙️ Props API

| 属性名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `year` | `number` | `当前系统年份` | 视图年份 |
| `month` | `number` | `当前系统月份` | 视图月份 (1 - 12) |
| `dailyRecords` | `DailyRecord[]` | `[]` | 每日盈亏数据列表 |
| `weeklySummaries` | `WeeklySummary[]` | `自动根据日数据计算` | 可选周度盈亏覆盖数据 |
| `monthlySummaries` | `MonthlySummary[]` | `[]` | 12 个月度盈亏数据列表 |
| `annualSummary` | `AnnualSummary` | `undefined` | 年度与年化收益总结数据 |
| `colorScheme` | `'greenUpRedDown' \| 'redUpGreenDown'` | `'greenUpRedDown'` | 涨跌配色 (美股/A股) |
| `theme` | `'dark' \| 'light'` | `'dark'` | 明暗主题模式 |
| `showThemeToggle` | `boolean` | `false` | 是否在 Header 展示主题切换按钮 |
| `currency` | `string` | `'美元 (USD)'` | 货币单位展示文案 |
| `updateText` | `string` | `'每日实时更新'` | 状态更新提示文案 |
| `title` | `string` | `'实盘交易记录'` | 顶部窗口标题 |
| `statusText` | `string` | `'实时'` | 顶部状态文本 |
| `onMonthChange` | `(year: number, month: number) => void` | `-` | 月份切换回调 |
| `onDateClick` | `(record: DailyRecord) => void` | `-` | 点击具体日期单元格回调 |
| `onThemeToggle` | `(theme: Theme) => void` | `-` | 主题切换回调 |
| `className` | `string` | `-` | 根容器自定义类名 |
| `style` | `React.CSSProperties` | `-` | 根容器自定义样式 |

---

## 📄 License

[MIT](./LICENSE)

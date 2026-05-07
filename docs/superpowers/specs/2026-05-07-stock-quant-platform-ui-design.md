# 智能股票量化交易平台 - UI 设计文档

> 版本: v1.0
> 日期: 2026-05-07
> 风格: Financial Glassmorphism + Apple Vision Pro 透明质感

---

## 1. 设计理念

### 1.1 设计方向

融合 **Apple Vision Pro 的空间计算美学** 与 **高端金融终端的专业感**，打造一款具有未来感、通透感、沉浸式的量化交易界面。

核心关键词：**通透、精准、沉浸、流动**

### 1.2 灵感来源

- Apple Vision Pro 的 glass material 设计语言
- Bloomberg Terminal 的专业数据密度
- 苹果 iOS 18 的液态玻璃效果
- 高端手表表盘的精密感

### 1.3 设计原则

1. **通透层级**：通过透明度、模糊、折射创造空间深度
2. **数据优先**：金融数据是主角，UI 是优雅的容器
3. **动态反馈**：数字变化、状态切换都有流畅的过渡
4. **暗色主导**：深色背景减少眼部疲劳，突出数据发光效果
5. **一屏掌控**：关键信息密度高但不杂乱，专业用户一眼获取全貌

---

## 2. 色彩系统

### 2.1 主色调

```css
/* 背景层级 - 深邃太空感 */
--bg-primary: #05070a;           /* 最深背景 - 接近纯黑带蓝调 */
--bg-secondary: #0c1220;         /* 卡片底层 - 深蓝黑 */
--bg-tertiary: #111a2e;          /* 抬升表面 - 稍亮的蓝黑 */
--bg-elevated: #162038;          /* 悬浮元素 - 带透明感的蓝 */

/* 玻璃效果层级 */
--glass-bg: rgba(255, 255, 255, 0.03);
--glass-bg-hover: rgba(255, 255, 255, 0.06);
--glass-bg-active: rgba(255, 255, 255, 0.09);
--glass-border: rgba(255, 255, 255, 0.06);
--glass-border-highlight: rgba(255, 255, 255, 0.12);
--glass-backdrop: blur(24px) saturate(1.2);

/* 文字颜色 */
--text-primary: rgba(255, 255, 255, 0.92);
--text-secondary: rgba(255, 255, 255, 0.60);
--text-tertiary: rgba(255, 255, 255, 0.38);
--text-disabled: rgba(255, 255, 255, 0.22);

/* 金融语义色 - 发光效果 */
--up-primary: #00e5a0;           /* 上涨 - 青绿荧光 */
--up-glow: rgba(0, 229, 160, 0.4);
--up-subtle: rgba(0, 229, 160, 0.12);

--down-primary: #ff4567;         /* 下跌 - 玫瑰红荧光 */
--down-glow: rgba(255, 69, 103, 0.4);
--down-subtle: rgba(255, 69, 103, 0.12);

--accent-primary: #5b8def;       /* 强调 - 冰蓝 */
--accent-glow: rgba(91, 141, 239, 0.4);
--accent-subtle: rgba(91, 141, 239, 0.12);

--warning: #ffb84d;              /* 警告 - 琥珀 */
--warning-glow: rgba(255, 184, 77, 0.4);

--info: #64d2ff;                 /* 信息 - 天蓝 */
--info-glow: rgba(100, 210, 255, 0.4);
```

### 2.2 渐变系统

```css
/* 玻璃折射渐变 - 用于卡片顶部边缘 */
--gradient-glass-top: linear-gradient(
  180deg,
  rgba(255, 255, 255, 0.1) 0%,
  rgba(255, 255, 255, 0.02) 40%,
  transparent 100%
);

/* 上涨渐变 */
--gradient-up: linear-gradient(135deg, #00e5a0 0%, #00c8a0 50%, #00a884 100%);

/* 下跌渐变 */
--gradient-down: linear-gradient(135deg, #ff4567 0%, #e63e5c 50%, #cc2b48 100%);

/* 强调渐变 */
--gradient-accent: linear-gradient(135deg, #5b8def 0%, #7b9ef0 50%, #9bb3f2 100%);

/* 背景环境光 */
--gradient-ambient: radial-gradient(
  ellipse at 30% 20%,
  rgba(91, 141, 239, 0.08) 0%,
  transparent 50%
);
```

### 2.3 发光效果

```css
/* 上涨发光 */
--glow-up: 0 0 20px rgba(0, 229, 160, 0.3),
           0 0 40px rgba(0, 229, 160, 0.1),
           inset 0 1px 0 rgba(255, 255, 255, 0.1);

/* 下跌发光 */
--glow-down: 0 0 20px rgba(255, 69, 103, 0.3),
             0 0 40px rgba(255, 69, 103, 0.1),
             inset 0 1px 0 rgba(255, 255, 255, 0.1);

/* 强调发光 */
--glow-accent: 0 0 20px rgba(91, 141, 239, 0.3),
               0 0 40px rgba(91, 141, 239, 0.1);

/* 卡片悬浮发光 */
--glow-card: 0 8px 32px rgba(0, 0, 0, 0.4),
             0 2px 8px rgba(0, 0, 0, 0.2),
             inset 0 1px 0 rgba(255, 255, 255, 0.08);
```

---

## 3. 字体系统

### 3.1 字体选择

```css
/* 数字与数据 - 等宽字体，精确对齐 */
--font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;

/* 标题与强调 - 现代几何感 */
--font-display: 'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif;

/* 正文 - 清晰易读 */
--font-body: 'SF Pro Text', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

### 3.2 字号层级

```css
/* 大数字展示 - 资产、盈亏 */
--text-hero: 48px;        /* 总资产等核心数字 */
--text-hero-weight: 300;  /* 极细，优雅 */
--text-hero-tracking: -0.02em;

/* 大标题 */
--text-h1: 32px;
--text-h1-weight: 600;

/* 模块标题 */
--text-h2: 24px;
--text-h2-weight: 600;

/* 卡片标题 */
--text-h3: 18px;
--text-h3-weight: 500;

/* 正文 */
--text-body: 14px;
--text-body-weight: 400;
--text-body-line-height: 1.5;

/* 小字/标签 */
--text-caption: 12px;
--text-caption-weight: 400;

/* 数据标签 */
--text-label: 11px;
--text-label-weight: 500;
--text-label-tracking: 0.05em;
--text-label-transform: uppercase;
```

### 3.3 数字特殊处理

```css
/* 价格数字 - 等宽，小数位淡化 */
.price-display {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

.price-integer {
  font-size: 24px;
  font-weight: 500;
}

.price-decimal {
  font-size: 16px;
  font-weight: 400;
  opacity: 0.6;
}

/* 涨跌幅 - 带符号，发光 */
.change-up {
  color: var(--up-primary);
  text-shadow: 0 0 12px var(--up-glow);
}

.change-down {
  color: var(--down-primary);
  text-shadow: 0 0 12px var(--down-glow);
}
```

---

## 4. 玻璃拟态组件规范

### 4.1 玻璃卡片 (Glass Card)

```css
.glass-card {
  /* 基础 */
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);

  /* 边框 */
  border: 1px solid var(--glass-border);
  border-radius: 20px;

  /* 阴影 */
  box-shadow: var(--glow-card);

  /* 顶部高光 */
  position: relative;
  overflow: hidden;
}

/* 顶部折射光带 */
.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 20%,
    rgba(255, 255, 255, 0.25) 50%,
    rgba(255, 255, 255, 0.15) 80%,
    transparent 100%
  );
}

/* 悬停状态 */
.glass-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-highlight);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5),
              0 4px 16px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 4.2 玻璃按钮 (Glass Button)

```css
/* 主按钮 - 带渐变背景 */
.glass-button-primary {
  background: linear-gradient(
    135deg,
    rgba(91, 141, 239, 0.2) 0%,
    rgba(91, 141, 239, 0.1) 100%
  );
  backdrop-filter: blur(16px);
  border: 1px solid rgba(91, 141, 239, 0.3);
  border-radius: 12px;
  padding: 10px 20px;
  color: var(--accent-primary);
  font-weight: 500;
  box-shadow: 0 0 20px rgba(91, 141, 239, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.glass-button-primary:hover {
  background: linear-gradient(
    135deg,
    rgba(91, 141, 239, 0.3) 0%,
    rgba(91, 141, 239, 0.15) 100%
  );
  border-color: rgba(91, 141, 239, 0.5);
  box-shadow: 0 0 30px rgba(91, 141, 239, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* 次要按钮 - 纯玻璃 */
.glass-button-secondary {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 10px 20px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.glass-button-secondary:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-highlight);
  color: var(--text-primary);
}

/* 危险按钮 - 红色发光 */
.glass-button-danger {
  background: linear-gradient(
    135deg,
    rgba(255, 69, 103, 0.15) 0%,
    rgba(255, 69, 103, 0.05) 100%
  );
  border: 1px solid rgba(255, 69, 103, 0.25);
  color: var(--down-primary);
  box-shadow: 0 0 20px rgba(255, 69, 103, 0.08);
}
```

### 4.3 玻璃输入框 (Glass Input)

```css
.glass-input {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.glass-input::placeholder {
  color: var(--text-tertiary);
}

.glass-input:focus {
  outline: none;
  border-color: rgba(91, 141, 239, 0.5);
  box-shadow: 0 0 0 3px rgba(91, 141, 239, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.3);
}
```

### 4.4 玻璃标签页 (Glass Tabs)

```css
.glass-tabs {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 4px;
  display: flex;
  gap: 4px;
}

.glass-tab {
  padding: 8px 16px;
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.25s ease;
  cursor: pointer;
}

.glass-tab:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.03);
}

.glass-tab-active {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1),
              0 2px 8px rgba(0, 0, 0, 0.2);
}
```

### 4.5 玻璃表格 (Glass Table)

```css
.glass-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.glass-table thead th {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--glass-border);
  padding: 12px 16px;
  font-size: var(--text-label);
  font-weight: var(--text-label-weight);
  letter-spacing: var(--text-label-tracking);
  text-transform: var(--text-label-transform);
  color: var(--text-tertiary);
  text-align: left;
}

.glass-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  transition: background 0.15s ease;
}

.glass-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.glass-table tbody td {
  padding: 14px 16px;
  font-size: var(--text-body);
  color: var(--text-secondary);
}

/* 选中行 */
.glass-table tbody tr.selected {
  background: rgba(91, 141, 239, 0.06);
  border-left: 2px solid var(--accent-primary);
}
```

### 4.6 玻璃下拉菜单 (Glass Dropdown)

```css
.glass-dropdown {
  background: rgba(12, 18, 32, 0.95);
  backdrop-filter: blur(32px) saturate(1.5);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6),
              0 8px 24px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.glass-dropdown-item {
  padding: 10px 16px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.15s ease;
  cursor: pointer;
}

.glass-dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}
```

---

## 5. 页面布局设计

### 5.1 整体布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  顶部导航栏 (Glass Navbar)                                    │
│  [Logo] [市场] [持仓] [信号] [策略] [回测] [新闻] [设置]        │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│  侧边栏   │              主内容区域                            │
│ (Glass)  │              (Glass Cards Grid)                   │
│          │                                                   │
│ [资产概览] │  ┌──────────────┐  ┌──────────────┐              │
│ [快速操作]│  │   大盘指数    │  │   持仓盈亏    │              │
│ [关注列表]│  │   (Glass)    │  │   (Glass)    │              │
│          │  └──────────────┘  └──────────────┘              │
│          │                                                   │
│          │  ┌────────────────────────────────────┐          │
│          │  │         信号/策略面板               │          │
│          │  │            (Glass)                 │          │
│          │  └────────────────────────────────────┘          │
│          │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

### 5.2 顶部导航栏

- 高度: 64px
- 背景: `rgba(5, 7, 10, 0.8)` + `backdrop-filter: blur(20px)`
- 底部边框: 1px solid `rgba(255, 255, 255, 0.06)`
- 左侧: Logo + 品牌名
- 中部: 导航菜单（市场、持仓、信号、策略、回测、新闻）
- 右侧: 通知铃铛 + 用户头像下拉

### 5.3 侧边栏

- 宽度: 260px（可折叠至 64px）
- 背景: `rgba(12, 18, 32, 0.6)` + `backdrop-filter: blur(20px)`
- 右侧边框: 1px solid `rgba(255, 255, 255, 0.04)`
- 内容:
  - 资产总览卡片（玻璃卡片，显示总资产、当日盈亏）
  - 快捷操作按钮组
  - 自选股/关注列表
  - 系统状态指示器

### 5.4 主内容区

- 背景: 深色渐变 + 环境光效果
- 布局: CSS Grid，自适应列数
- 间距: 20px
- 卡片尺寸: 根据内容自适应，最小 320px

---

## 6. 核心页面设计

### 6.1 首页 Dashboard

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  欢迎语 + 日期                    [刷新] [导出] [设置]        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  资产总览卡片 (Hero Glass Card)                      │   │
│  │  总资产 ¥1,234,567.89    当日 +¥12,345 (+1.02%)      │   │
│  │  [收益曲线迷你图]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  上证指数     │  │  深证成指     │  │  创业板指     │     │
│  │  3,234.56    │  │  10,234.56   │  │  2,123.45    │     │
│  │  +0.85%      │  │  +1.12%      │  │  -0.23%      │     │
│  │  [迷你K线]   │  │  [迷你K线]   │  │  [迷你K线]   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │   持仓盈亏排行      │  │   最新买卖信号      │            │
│  │   (Glass Table)    │  │   (Glass List)     │            │
│  └────────────────────┘  └────────────────────┘            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │   策略表现概览                                       │   │
│  │   [策略1] [策略2] [策略3] ...                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 资产总览卡片 (Hero Card)
- 尺寸: 全宽，高度 180px
- 背景: 渐变玻璃 + 微妙的动态渐变动画
- 内容:
  - 左侧: 总资产大数字（hero 字号，等宽字体）
  - 右侧: 当日盈亏 + 收益率（带颜色+发光）
  - 底部: 收益曲线迷你图（Sparkline）
- 特效: 背景有缓慢流动的渐变光带

### 6.2 持仓管理页

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  [组合选择下拉]  [添加持仓+]  [导入] [导出]                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  组合概览卡片                                        │   │
│  │  总市值 | 总成本 | 浮动盈亏 | 收益率 | 持仓数量        │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  持仓列表 (Glass Table)                              │   │
│  │  代码 | 名称 | 成本 | 现价 | 数量 | 市值 | 盈亏 | 操作  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  行业分布     │  │  盈亏分布     │  │  市值分布     │     │
│  │  (饼图)      │  │  (柱状图)    │  │  (环形图)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 行情中心页

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  [搜索框]  [市场筛选] [行业筛选] [排序方式]                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  股票列表 (Glass Table)                              │   │
│  │  代码 | 名称 | 现价 | 涨跌 | 涨跌幅 | 成交量 | 市值   │   │
│  │  行悬停显示迷你K线图                                  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  选中股票详情                                        │   │
│  │  [K线图] [成交量] [MACD] [KDJ] 等技术指标切换        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 买卖信号页

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  [信号类型筛选] [强度筛选] [时间范围] [手动扫描]             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  信号列表 (Glass Cards)                              │   │
│  │  每个信号一张卡片，显示:                              │   │
│  │  [股票名称] [信号类型图标] [强度条] [触发价格]         │   │
│  │  [信号描述] [技术指标详情] [操作按钮]                  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  信号统计     │  │  信号胜率     │                        │
│  │  (数据卡片)   │  │  (趋势图)    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

#### 信号卡片设计
- 卡片左侧有彩色竖条指示信号类型（买入=绿色，卖出=红色）
- 信号强度用 5 段发光条表示
- 卡片悬停展开更多技术指标详情

### 6.5 策略管理页

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  [新建策略+]  [策略模板库]  [批量操作]                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ 策略卡片1 │ │ 策略卡片2 │ │ 策略卡片3 │ │ 策略卡片4 │     │
│  │ (Glass)  │ │ (Glass)  │ │ (Glass)  │ │ (Glass)  │     │
│  │ [运行中] │ │ [已暂停] │ │ [运行中] │ │ [待配置] │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  选中策略详情                                        │   │
│  │  [参数配置面板] [回测按钮] [信号历史]                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 策略卡片设计
- 卡片顶部: 策略名称 + 状态指示器（发光圆点）
- 卡片中部: 策略类型标签 + 最近信号
- 卡片底部: 胜率/盈亏比 + 操作按钮
- 运行中策略卡片有微妙的脉冲发光动画

### 6.6 回测系统页

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  [选择策略] [参数配置] [时间范围] [开始回测]                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  回测结果概览                                        │   │
│  │  总收益 | 年化收益 | 最大回撤 | 夏普比率 | 胜率       │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  收益曲线图 (主图)                                   │   │
│  │  [策略收益线] [基准线] [买卖点标记]                   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  回撤曲线     │  │  月度收益     │  │  交易明细     │     │
│  │  (面积图)    │  │  (热力图)    │  │  (表格)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 6.7 新闻监控页

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  [关键词搜索] [来源筛选] [情绪筛选] [机会分数范围]            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  新闻列表 (Glass Cards)                              │   │
│  │  每条新闻一张卡片:                                    │   │
│  │  [来源标签] [时间] [情绪标签] [机会分数]               │   │
│  │  [标题] [AI摘要] [关联股票]                           │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  情绪分布     │  │  热点词云     │                        │
│  │  (环形图)    │  │  (词云图)    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

#### 新闻卡片设计
- 左侧: 情绪颜色条（利好=绿，利空=红，中性=灰）
- 右上角: 机会分数徽章（>=70分有发光效果）
- 标题: 悬停显示完整内容
- AI摘要: 折叠/展开

### 6.8 设置页

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  [个人资料] [推送配置] [策略偏好] [数据管理] [系统设置]       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  当前选中标签内容                                     │   │
│  │  (Glass Card 表单)                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 图表设计规范

### 7.1 K线图/蜡烛图

```css
/* 上涨蜡烛 */
.candle-up {
  fill: var(--up-primary);
  stroke: var(--up-primary);
  filter: drop-shadow(0 0 4px var(--up-glow));
}

/* 下跌蜡烛 */
.candle-down {
  fill: var(--down-primary);
  stroke: var(--down-primary);
  filter: drop-shadow(0 0 4px var(--down-glow));
}

/* 图表背景 */
.chart-bg {
  background: transparent;
}

/* 网格线 */
.chart-grid {
  stroke: rgba(255, 255, 255, 0.04);
  stroke-dasharray: 4 4;
}

/* 坐标轴文字 */
.chart-axis-text {
  fill: var(--text-tertiary);
  font-size: 11px;
  font-family: var(--font-mono);
}

/* 十字光标 */
.chart-crosshair {
  stroke: rgba(255, 255, 255, 0.15);
  stroke-dasharray: 4 4;
}
```

### 7.2 折线图/面积图

```css
/* 收益曲线 */
.profit-line {
  stroke: var(--accent-primary);
  stroke-width: 2;
  fill: none;
  filter: drop-shadow(0 0 8px var(--accent-glow));
}

/* 收益面积 */
.profit-area {
  fill: url(#profit-gradient);
}

/* 渐变定义 */
#profit-gradient {
  gradientUnits: userSpaceOnUse;
  x1: 0, y1: 0;
  x2: 0, y2: 100%;
  stop-color-1: rgba(91, 141, 239, 0.2);
  stop-color-2: rgba(91, 141, 239, 0);
}
```

### 7.3 饼图/环形图

```css
/* 环形图 */
.donut-chart {
  /* 使用 conic-gradient 或 SVG */
}

.donut-segment {
  stroke-linecap: round;
  transition: stroke-width 0.3s ease;
}

.donut-segment:hover {
  stroke-width: 24;
  filter: drop-shadow(0 0 8px currentColor);
}
```

### 7.4 热力图

```css
/* 月度收益热力图 */
.heatmap-cell {
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.heatmap-cell:hover {
  transform: scale(1.1);
  z-index: 1;
  box-shadow: 0 0 12px currentColor;
}

.heatmap-up {
  background: var(--up-primary);
}

.heatmap-down {
  background: var(--down-primary);
}

.heatmap-neutral {
  background: rgba(255, 255, 255, 0.1);
}
```

---

## 8. 动画与交互

### 8.1 页面加载动画

```css
/* 卡片依次入场 */
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

.card-enter {
  animation: card-enter 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* 错开时间 */
.card-enter:nth-child(1) { animation-delay: 0.05s; }
.card-enter:nth-child(2) { animation-delay: 0.1s; }
.card-enter:nth-child(3) { animation-delay: 0.15s; }
/* ... */
```

### 8.2 数字滚动动画

```css
/* 数字变化时的滚动效果 */
@keyframes number-roll {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.number-change {
  animation: number-roll 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 8.3 悬停效果

```css
/* 卡片悬停上浮 */
.card-hover {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5),
              0 4px 16px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 按钮悬停发光 */
.btn-glow:hover {
  box-shadow: 0 0 20px currentColor,
              0 0 40px currentColor;
}
```

### 8.4 脉冲动画（用于运行中状态）

```css
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px currentColor,
                0 0 10px currentColor;
  }
  50% {
    box-shadow: 0 0 15px currentColor,
                0 0 30px currentColor;
  }
}

.pulse-active {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

### 8.5 背景流动渐变

```css
@keyframes ambient-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.ambient-bg {
  background: linear-gradient(
    -45deg,
    rgba(91, 141, 239, 0.03),
    rgba(0, 229, 160, 0.02),
    rgba(255, 69, 103, 0.02),
    rgba(91, 141, 239, 0.03)
  );
  background-size: 400% 400%;
  animation: ambient-flow 15s ease infinite;
}
```

---

## 9. 响应式设计

### 9.1 断点定义

```css
--breakpoint-sm: 640px;   /* 手机横屏 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 小桌面 */
--breakpoint-xl: 1280px;  /* 标准桌面 */
--breakpoint-2xl: 1536px; /* 大桌面 */
```

### 9.2 布局适配

| 断点 | 侧边栏 | 卡片列数 | 导航 |
|------|--------|---------|------|
| < 768px | 隐藏（抽屉式） | 1列 | 底部标签栏 |
| 768-1024px | 折叠（图标+tooltip） | 1-2列 | 顶部导航 |
| 1024-1280px | 展开 | 2列 | 顶部导航 |
| > 1280px | 展开 | 3-4列 | 顶部导航 |

### 9.3 移动端适配要点

- 卡片全宽显示
- 表格横向滚动
- 图表支持手势缩放
- 底部固定快捷操作栏
- 触摸友好的按钮尺寸（最小 44x44px）

---

## 10. 图标系统

### 10.1 图标风格

- 使用 **Lucide React** 图标库
- 线条风格: 1.5px 描边
- 圆角: 2px
- 尺寸规范:
  - 导航图标: 20px
  - 按钮图标: 16px
  - 表格图标: 14px
  - 状态指示: 8px

### 10.2 图标颜色

```css
.icon-default { color: var(--text-tertiary); }
.icon-hover { color: var(--text-secondary); }
.icon-active { color: var(--accent-primary); }
.icon-up { color: var(--up-primary); }
.icon-down { color: var(--down-primary); }
.icon-warning { color: var(--warning); }
```

---

## 11. 特殊效果

### 11.1 数据刷新闪烁

```css
/* 数据更新时的闪烁提示 */
@keyframes data-flash {
  0% { background: transparent; }
  50% { background: rgba(91, 141, 239, 0.1); }
  100% { background: transparent; }
}

.data-updated {
  animation: data-flash 0.8s ease;
}
```

### 11.2 加载状态

```css
/* 骨架屏 */
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.06) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 旋转加载器 */
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 11.3 滚动条样式

```css
/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

---

## 12. Tailwind CSS 配置

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#05070a',
          secondary: '#0c1220',
          tertiary: '#111a2e',
          elevated: '#162038',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.03)',
          'bg-hover': 'rgba(255, 255, 255, 0.06)',
          'bg-active': 'rgba(255, 255, 255, 0.09)',
          border: 'rgba(255, 255, 255, 0.06)',
          'border-highlight': 'rgba(255, 255, 255, 0.12)',
        },
        up: {
          DEFAULT: '#00e5a0',
          glow: 'rgba(0, 229, 160, 0.4)',
          subtle: 'rgba(0, 229, 160, 0.12)',
        },
        down: {
          DEFAULT: '#ff4567',
          glow: 'rgba(255, 69, 103, 0.4)',
          subtle: 'rgba(255, 69, 103, 0.12)',
        },
        accent: {
          DEFAULT: '#5b8def',
          glow: 'rgba(91, 141, 239, 0.4)',
          subtle: 'rgba(91, 141, 239, 0.12)',
        },
        warning: {
          DEFAULT: '#ffb84d',
          glow: 'rgba(255, 184, 77, 0.4)',
        },
      },
      fontFamily: {
        mono: ['SF Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['SF Pro Display', '-apple-system', 'Helvetica Neue', 'sans-serif'],
        body: ['SF Pro Text', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      fontSize: {
        hero: ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '300' }],
        h1: ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        h2: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        label: ['11px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
      },
      borderRadius: {
        glass: '20px',
        'glass-sm': '12px',
        'glass-lg': '24px',
      },
      backdropBlur: {
        glass: '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-hover': '0 12px 48px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        'glow-up': '0 0 20px rgba(0, 229, 160, 0.3), 0 0 40px rgba(0, 229, 160, 0.1)',
        'glow-down': '0 0 20px rgba(255, 69, 103, 0.3), 0 0 40px rgba(255, 69, 103, 0.1)',
        'glow-accent': '0 0 20px rgba(91, 141, 239, 0.3), 0 0 40px rgba(91, 141, 239, 0.1)',
      },
      animation: {
        'card-enter': 'card-enter 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'ambient-flow': 'ambient-flow 15s ease infinite',
        'skeleton': 'skeleton-loading 1.5s ease-in-out infinite',
        'spin': 'spin 0.8s linear infinite',
      },
      keyframes: {
        'card-enter': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)', filter: 'blur(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '50%': { boxShadow: '0 0 15px currentColor, 0 0 30px currentColor' },
        },
        'ambient-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'skeleton-loading': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
};
```

---

## 13. 组件清单

### 13.1 shadcn/ui 基础组件（需玻璃化改造）

| 组件 | 用途 | 改造要点 |
|------|------|---------|
| Button | 按钮 | 玻璃背景 + 发光边框 |
| Card | 卡片 | 毛玻璃 + 顶部高光 |
| Input | 输入框 | 深色背景 + 聚焦发光 |
| Select | 下拉选择 | 玻璃下拉面板 |
| Dialog | 弹窗 | 玻璃模态框 + 模糊背景 |
| Table | 表格 | 玻璃表头 + 悬停效果 |
| Tabs | 标签页 | 玻璃标签容器 |
| Badge | 徽章 | 发光效果 |
| Tooltip | 提示 | 玻璃提示框 |
| DropdownMenu | 下拉菜单 | 玻璃菜单 |
| ScrollArea | 滚动区域 | 自定义滚动条 |
| Separator | 分隔线 | 半透明分隔 |
| Skeleton | 骨架屏 | 玻璃风格骨架 |
| Toast | 通知 | 玻璃通知卡片 |
| Alert | 警告 | 彩色发光边框 |

### 13.2 自定义业务组件

| 组件 | 用途 | 说明 |
|------|------|------|
| GlassCard | 玻璃卡片 | 基础容器组件 |
| HeroCard | 资产总览 | 大数字展示 |
| IndexCard | 指数卡片 | 迷你K线+数据 |
| SignalCard | 信号卡片 | 信号类型+强度 |
| StrategyCard | 策略卡片 | 策略状态+指标 |
| NewsCard | 新闻卡片 | 情绪+评分 |
| HoldingRow | 持仓行 | 盈亏实时计算 |
| KlineChart | K线图 | 蜡烛图+指标 |
| ProfitChart | 收益曲线 | 面积图 |
| HeatmapChart | 热力图 | 月度收益 |
| DonutChart | 环形图 | 分布统计 |
| Sparkline | 迷你图 | 趋势缩略 |
| PriceDisplay | 价格显示 | 整数+小数分离 |
| ChangeBadge | 涨跌幅 | 颜色+发光 |
| StrengthBar | 强度条 | 分段发光 |
| StatusDot | 状态点 | 脉冲动画 |
| PushConfigForm | 推送配置 | 多渠道表单 |
| BacktestReport | 回测报告 | 多图表组合 |

---

## 14. 设计原则检查清单

- [ ] 所有卡片使用玻璃拟态效果（backdrop-filter + 半透明背景）
- [ ] 顶部有微妙的高光折射线
- [ ] 涨跌幅数字有对应颜色的发光效果
- [ ] 按钮有悬停时的发光增强
- [ ] 页面背景有缓慢流动的环境渐变
- [ ] 卡片入场有错开的淡入动画
- [ ] 数据更新有闪烁提示
- [ ] 运行中状态有脉冲发光动画
- [ ] 滚动条使用自定义细滚动条
- [ ] 所有数字使用等宽字体对齐
- [ ] 价格显示整数和小数分离
- [ ] 深色主题为主，支持浅色模式切换
- [ ] 响应式适配移动端
- [ ] 图标统一使用 Lucide，1.5px 描边
- [ ] 阴影使用多层柔和阴影，非单一阴影

---

*UI 设计文档结束*

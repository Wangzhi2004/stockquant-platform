# 智能股票量化交易平台 - 产品设计文档 (PRD)

> 版本: v1.0
> 日期: 2026-05-07
> 状态: 待评审

---

## 1. 产品概述

### 1.1 产品定位

面向国内 A 股市场的智能量化投资分析与决策支持平台，集持仓管理、新闻机会挖掘、买卖点信号、高级量化策略、回测验证、智能推送于一体，部署于云服务器，支持个人使用及后续小范围多人协作。

### 1.2 目标用户

-  primary: 个人投资者，具备一定投资经验，希望通过量化工具提升决策质量
-  secondary: 小范围投资交流群/小团队（预留多用户架构）

### 1.3 核心价值

1. **自动化跟踪**：持仓盈亏实时监控，告别手动计算
2. **机会发现**：AI 驱动的新闻分析，捕捉市场机会
3. **数据化决策**：技术指标 + 量化策略生成可操作的买卖信号
4. **策略验证**：完整的回测系统，验证策略有效性
5. **及时触达**：多渠道推送，重要信号不错过

---

## 2. 功能需求

### 2.1 用户与权限系统

#### 2.1.1 用户管理
- 用户注册：邮箱/手机号 + 密码
- 用户登录：JWT Token 认证，支持 Remember Me
- 密码找回：邮箱验证码重置
- 个人中心：修改密码、绑定推送渠道、设置关注板块

#### 2.1.2 权限模型（预留）
- 角色：管理员、普通用户
- 管理员可查看系统运行状态、管理用户
- 普通用户仅可查看自己的数据

### 2.2 持仓管理系统

#### 2.2.1 投资组合
- 支持创建多个投资组合（如"主账户"、"实验账户"）
- 每个组合独立计算盈亏

#### 2.2.2 持仓录入
- 手动添加：股票代码、成本价、持仓数量、买入日期
- 批量导入：CSV/Excel 模板导入
- 交易记录：支持记录买入/卖出/分红/配股/送股

#### 2.2.3 实时盈亏计算
- 对接行情接口，实时计算每只持仓的
  - 当前市值、浮动盈亏、盈亏比例
  - 当日盈亏、当日涨跌幅
- 组合层面汇总：总成本、总市值、总浮动盈亏、总收益率

#### 2.2.4 持仓分析
- 行业分布饼图
- 市值分布（大盘/中盘/小盘）
- 盈亏排名（Top 盈利 / Top 亏损）
- 持仓时间分析（平均持仓天数）

### 2.3 行情数据采集

#### 2.3.1 数据范围
- A 股全市场：沪深主板、创业板、科创板、北交所
- 指数：上证指数、深证成指、创业板指、科创50、沪深300等
- ETF/LOF 基金

#### 2.3.2 K线数据
- 日K线（主要）
- 周K线、月K线
- 分钟K线：1分钟、5分钟、15分钟、30分钟、60分钟（预留）

#### 2.3.3 实时行情
- 定时轮询机制：交易时段内每 5-15 秒刷新
- 非交易时段降低频率

#### 2.3.4 基本面数据
- 股票基础信息：名称、行业、市值、PE、PB、ROE 等
- 财务报表：季度/年度营收、利润、现金流（预留）
- 业绩预告、公告信息

#### 2.3.5 数据更新策略
- 日K数据：交易日收盘后自动全量更新
- 实时行情：交易时段定时轮询
- 基础信息：每周全量更新一次
- 增量更新 + 数据校验，避免重复请求

### 2.4 新闻监控与机会发现

#### 2.4.1 新闻采集
- 多源聚合：
  - 财联社 7x24 快讯
  - 东方财富要闻
  - 同花顺财经
  - 上市公司公告
- 更新频率：5-15 分钟轮询

#### 2.4.2 关键词过滤
- 用户自定义关注列表：个股、板块、概念
- 系统默认关注：持仓股票自动加入监控

#### 2.4.3 AI 摘要分析
- 调用大模型 API（DeepSeek / Qwen）
- 分析维度：
  - 新闻摘要（100字以内）
  - 影响方向：利好/利空/中性
  - 影响程度：高/中/低
  - 关联板块/个股
  - 建议操作：关注/买入/卖出/观望

#### 2.4.4 机会评分系统
- 评分维度（0-100分）：
  - 新闻情绪得分（基于 AI 分析）
  - 关联度得分（与用户持仓/关注的相关性）
  - 时效性得分（新闻新鲜度）
  - 历史验证得分（类似新闻过往表现）
- 高分机会（>=70分）自动推送提醒

#### 2.4.5 热点追踪
- 概念板块热度排行
- 个股热度排行
- 资金流向监控（主力净流入/流出）

### 2.5 买卖点信号系统

#### 2.5.1 技术指标策略（内置）

| 策略名称 | 买入信号 | 卖出信号 |
|---------|---------|---------|
| MACD 金叉死叉 | DIF 上穿 DEA | DIF 下穿 DEA |
| KDJ 超买超卖 | K<20 且 K 上穿 D | K>80 且 K 下穿 D |
| RSI 强弱 | RSI<30 回升 | RSI>70 回落 |
| 均线多头/空头 | 短期均线上穿长期均线 | 短期均线下穿长期均线 |
| 布林带突破 | 价格触及下轨反弹 | 价格触及上轨回落 |
| 量价配合 | 放量上涨 | 缩量滞涨/放量下跌 |

#### 2.5.2 复合信号
- 多指标共振：2个及以上指标同时发出同向信号
- 信号强度分级：
  - 强烈买入：3个及以上指标共振 + 放量
  - 买入：2个指标共振 或 单一强信号
  - 观望：指标矛盾或无明确方向
  - 卖出：2个指标共振看空
  - 强烈卖出：3个及以上指标共振 + 放量下跌

#### 2.5.3 信号追踪
- 记录每个信号的发出时间、价格、信号类型
- 追踪信号后续表现（N天后涨跌幅）
- 统计各信号的胜率、盈亏比

### 2.6 高级量化策略引擎

#### 2.6.1 内置策略库

**A. 多因子选股策略**
- 价值因子：低 PE、低 PB、高股息率
- 质量因子：高 ROE、高 ROA、低负债率
- 动量因子：近期涨幅排名、52周新高
- 波动率因子：低 Beta、低波动率
- 组合方式：等权 / 市值加权 / 因子加权

**B. 均值回归策略**
- 布林带均值回归：价格偏离均值一定标准差后回归
- 配对交易：相关性高的股票对，价差偏离时做多/做空

**C. 趋势跟踪策略**
- 海龟交易法则：突破 N 日高点买入，跌破 N 日低点卖出
- 双均线策略：短期均线上穿长期均线买入，反之卖出
- 通道突破：突破唐奇安通道买入

**D. 事件驱动策略**
- 财报季策略：业绩预告超预期买入
- 分红策略：高分红股票除权前买入
- 政策驱动：行业政策利好板块轮动

**E. 技术指标组合策略**
- MACD + RSI + 均线三重过滤
- KDJ + 成交量确认

**F. 资金流向策略**
- 主力净流入连续 N 日为正
- 大单资金占比提升

#### 2.6.2 策略参数调优
- 参数范围设置
- 网格搜索：遍历参数组合，找出最优参数
- 遗传算法优化（预留）

#### 2.6.3 策略组合管理
- 多策略权重配置
- 策略相关性分析
- 组合收益/风险计算

#### 2.6.4 策略表现监控
- 实时跟踪各策略近期信号
- 策略胜率、盈亏比、最大回撤统计
- 策略对比排名

### 2.7 回测系统

#### 2.7.1 回测参数
- 起始资金：默认 100 万，可配置
- 手续费：买入 0.03% + 卖出 0.03% + 印花税 0.05%
- 滑点：默认 0.01 元或 0.1%
- 时间范围：用户指定起止日期
- 标的范围：单股 / 多股 / 全市场

#### 2.7.2 回测指标
- 总收益率、年化收益率
- 最大回撤、最大回撤持续时间
- 夏普比率、索提诺比率
- 胜率、盈亏比
- 交易次数、平均持仓天数
- 阿尔法、贝塔

#### 2.7.3 回测报告
- 收益曲线图（策略 vs 基准）
- 回撤曲线图
- 月度收益热力图
- 交易明细表（每笔交易的盈亏）
- 参数敏感性分析图

#### 2.7.4 回测任务管理
- 异步执行（Celery）
- 任务状态：排队中/运行中/已完成/失败
- 历史回测记录保存

### 2.8 推送通知系统

#### 2.8.1 推送渠道
- 企业微信机器人 Webhook
- 钉钉机器人 Webhook
- 飞书机器人 Webhook
- SMTP 邮件推送

#### 2.8.2 推送场景
- **买卖点信号**：信号触发时即时推送
- **持仓异动**：持仓股票涨跌幅超过阈值（如 +/-5%）
- **每日收盘报告**：交易日收盘后推送当日盈亏汇总
- **新闻机会**：高分机会（>=70分）即时推送
- **策略调仓建议**：策略引擎生成调仓信号时推送
- **系统通知**：回测完成、数据更新完成等

#### 2.8.3 推送控制
- 推送开关：按类型开启/关闭
- 静默时段：如 23:00 - 09:00 不推送
- 频率限制：同类信号合并，避免刷屏
- 推送模板：支持自定义消息格式

### 2.9 报表与可视化

#### 2.9.1 大盘概览
- 主要指数实时行情卡片
- 涨跌家数统计
- 板块涨幅排行

#### 2.9.2 个人资产看板
- 总资产、当日盈亏、累计盈亏大数字展示
- 收益率曲线（日/周/月/年）
- 资产分布图

#### 2.9.3 策略表现看板
- 各策略近期信号列表
- 策略胜率排行
- 策略收益对比图

#### 2.9.4 回测结果展示
- 回测报告详情页
- 交互式图表（收益曲线、回撤曲线）
- 交易明细表格（支持排序/筛选）

---

## 3. 非功能需求

### 3.1 性能要求
- 页面首屏加载 < 2s
- API 响应时间 < 500ms（P95）
- 行情数据更新延迟 < 15s
- 回测任务支持并发执行

### 3.2 可用性要求
- 系统可用性 >= 99%
- 交易时段（9:30-15:00）核心服务不中断
- 数据备份：每日自动备份

### 3.3 安全要求
- 用户密码 bcrypt 加密存储
- JWT Token 设置合理过期时间
- API 限流防止滥用
- 敏感操作（修改密码、删除数据）需二次确认
- 不存储用户交易密码等敏感信息

### 3.4 扩展性要求
- 应用层支持多实例横向扩展
- 数据库支持读写分离（预留）
- 任务队列支持多 Worker 扩展

---

## 4. 技术架构

### 4.1 整体架构

```
用户层 (Web/微信/钉钉/飞书/邮件)
    |
API 网关层 (Nginx - 反向代理/SSL/静态文件)
    |
应用服务层 (FastAPI - REST API)
    |
任务调度层 (Celery + Redis)
    |
数据存储层 (PostgreSQL + Redis + 文件存储)
    |
外部接口层 (AKShare/Tushare/新闻API/大模型API)
```

### 4.2 技术选型

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | React | 18+ | UI 框架 |
| 前端语言 | TypeScript | 5.0+ | 类型安全 |
| UI 组件 | shadcn/ui + Tailwind CSS | latest | 现代玻璃风格 UI |
| 图表库 | Recharts + ECharts | latest | 数据可视化 |
| 状态管理 | Zustand | latest | 轻量状态管理 |
| 后端框架 | FastAPI | 0.110+ | 异步高性能 |
| Python | Python | 3.11+ | 运行时 |
| ORM | SQLAlchemy | 2.0+ | 数据库 ORM |
| 迁移工具 | Alembic | latest | 数据库迁移 |
| 任务队列 | Celery | 5.3+ | 异步任务 |
| 消息代理 | Redis | 7.0+ | 缓存 + 队列 |
| 数据库 | PostgreSQL | 15+ | 主数据库 |
| 数据科学 | pandas, numpy, scipy | latest | 数据处理 |
| 回测框架 | vectorbt / backtrader | latest | 策略回测 |
| 数据采集 | akshare | latest | 主数据源 |
| AI 分析 | DeepSeek API | latest | 新闻分析 |
| 容器化 | Docker + Docker Compose | latest | 部署 |

### 4.3 前端设计风格

**金融玻璃拟态风格 (Financial Glassmorphism)**

- 深色主题为主（#0a0e1a 背景），支持浅色模式切换
- 卡片使用毛玻璃效果（backdrop-filter: blur(16px)）
- 半透明边框（rgba(255,255,255,0.08)）
- 渐变色彩点缀：
  - 上涨：青绿色渐变 (#00d4aa → #00a884)
  - 下跌：玫瑰红渐变 (#ff4757 → #cc2b48)
  - 强调：蓝紫色渐变 (#6366f1 → #8b5cf6)
- 数据可视化：深色背景图表，发光效果
- 字体：Inter / Roboto Mono（数字等宽）
- 圆角：卡片 12-16px，按钮 8px
- 阴影：柔和的彩色阴影（与数据状态呼应）

### 4.4 项目目录结构

```
stock-quant-platform/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI 应用入口
│   │   ├── core/
│   │   │   ├── config.py        # 配置管理
│   │   │   ├── security.py      # JWT/密码加密
│   │   │   ├── logging.py       # 日志配置
│   │   │   └── exceptions.py    # 异常定义
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py      # 认证相关
│   │   │   │   ├── users.py     # 用户管理
│   │   │   │   ├── portfolio.py # 持仓管理
│   │   │   │   ├── market.py    # 行情数据
│   │   │   │   ├── news.py      # 新闻监控
│   │   │   │   ├── signals.py   # 买卖信号
│   │   │   │   ├── strategies.py# 策略管理
│   │   │   │   ├── backtest.py  # 回测系统
│   │   │   │   └── push.py      # 推送配置
│   │   │   └── deps.py          # 依赖注入
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── portfolio.py
│   │   │   ├── stock.py
│   │   │   ├── kline.py
│   │   │   ├── news.py
│   │   │   ├── signal.py
│   │   │   ├── strategy.py
│   │   │   ├── backtest.py
│   │   │   └── push.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── portfolio.py
│   │   │   ├── market.py
│   │   │   ├── news.py
│   │   │   ├── signal.py
│   │   │   ├── strategy.py
│   │   │   ├── backtest.py
│   │   │   └── push.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── user_service.py
│   │   │   ├── portfolio_service.py
│   │   │   ├── market_service.py
│   │   │   ├── news_service.py
│   │   │   ├── signal_service.py
│   │   │   ├── strategy_service.py
│   │   │   ├── backtest_service.py
│   │   │   └── push_service.py
│   │   ├── tasks/
│   │   │   ├── __init__.py
│   │   │   ├── celery_app.py    # Celery 配置
│   │   │   ├── market_tasks.py  # 行情采集任务
│   │   │   ├── news_tasks.py    # 新闻监控任务
│   │   │   ├── signal_tasks.py  # 信号计算任务
│   │   │   ├── strategy_tasks.py# 策略运行任务
│   │   │   └── push_tasks.py    # 推送任务
│   │   ├── strategies/
│   │   │   ├── __init__.py
│   │   │   ├── base.py          # 策略基类
│   │   │   ├── technical/       # 技术指标策略
│   │   │   ├── multi_factor/    # 多因子策略
│   │   │   ├── mean_reversion/  # 均值回归策略
│   │   │   ├── trend_following/ # 趋势跟踪策略
│   │   │   ├── event_driven/    # 事件驱动策略
│   │   │   └── flow/            # 资金流向策略
│   │   ├── backtest/
│   │   │   ├── __init__.py
│   │   │   ├── engine.py        # 回测引擎
│   │   │   ├── metrics.py       # 指标计算
│   │   │   └── report.py        # 报告生成
│   │   ├── data/
│   │   │   ├── __init__.py
│   │   │   ├── akshare_client.py# AKShare 封装
│   │   │   ├── tushare_client.py# Tushare 封装
│   │   │   └── sync.py          # 数据同步逻辑
│   │   ├── news/
│   │   │   ├── __init__.py
│   │   │   ├── crawler.py       # 新闻爬虫
│   │   │   ├── analyzer.py      # AI 分析
│   │   │   └── scorer.py        # 机会评分
│   │   └── push/
│   │       ├── __init__.py
│   │       ├── wechat.py        # 微信推送
│   │       ├── dingtalk.py      # 钉钉推送
│   │       ├── feishu.py        # 飞书推送
│   │       └── email.py         # 邮件推送
│   ├── alembic/                 # 数据库迁移
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/          # 公共组件
│   │   │   ├── ui/              # shadcn/ui 组件
│   │   │   ├── layout/          # 布局组件
│   │   │   ├── charts/          # 图表组件
│   │   │   └── glass/           # 玻璃拟态组件
│   │   ├── pages/               # 页面
│   │   │   ├── Dashboard/       # 首页看板
│   │   │   ├── Portfolio/       # 持仓管理
│   │   │   ├── Market/          # 行情中心
│   │   │   ├── News/            # 新闻监控
│   │   │   ├── Signals/         # 买卖信号
│   │   │   ├── Strategies/      # 策略管理
│   │   │   ├── Backtest/        # 回测系统
│   │   │   └── Settings/        # 设置
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── services/            # API 服务
│   │   ├── store/               # Zustand 状态管理
│   │   ├── types/               # TypeScript 类型
│   │   ├── utils/               # 工具函数
│   │   ├── styles/              # 全局样式
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── docker-compose.yml
├── .env.example
├── Makefile
└── docs/
    ├── api/                     # API 文档
    ├── deployment/              # 部署文档
    └── strategies/              # 策略文档
```

---

## 5. 数据库设计

### 5.1 核心表结构

#### users（用户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID PK | 用户ID |
| email | VARCHAR(255) UNIQUE | 邮箱 |
| phone | VARCHAR(20) UNIQUE | 手机号 |
| hashed_password | VARCHAR(255) | 加密密码 |
| nickname | VARCHAR(50) | 昵称 |
| avatar | VARCHAR(255) | 头像URL |
| role | ENUM('admin','user') | 角色 |
| is_active | BOOLEAN | 是否激活 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### portfolios（投资组合表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID PK | 组合ID |
| user_id | UUID FK | 用户ID |
| name | VARCHAR(50) | 组合名称 |
| description | TEXT | 描述 |
| initial_capital | DECIMAL(15,2) | 初始资金 |
| created_at | TIMESTAMP | 创建时间 |

#### holdings（持仓表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID PK | 持仓ID |
| portfolio_id | UUID FK | 组合ID |
| stock_code | VARCHAR(10) | 股票代码 |
| stock_name | VARCHAR(50) | 股票名称 |
| cost_price | DECIMAL(12,4) | 成本价 |
| quantity | INTEGER | 持仓数量 |
| buy_date | DATE | 买入日期 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### transactions（交易记录表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID PK | 记录ID |
| portfolio_id | UUID FK | 组合ID |
| stock_code | VARCHAR(10) | 股票代码 |
| type | ENUM('buy','sell','dividend','split') | 交易类型 |
| price | DECIMAL(12,4) | 价格 |
| quantity | INTEGER | 数量 |
| fee | DECIMAL(12,4) | 手续费 |
| date | DATE | 交易日期 |
| created_at | TIMESTAMP | 创建时间 |

#### stocks（股票基础信息表）
| 字段 | 类型 | 说明 |
|------|------|------|
| code | VARCHAR(10) PK | 股票代码 |
| name | VARCHAR(50) | 股票名称 |
| exchange | VARCHAR(10) | 交易所 |
| industry | VARCHAR(50) | 行业 |
| sector | VARCHAR(50) | 板块 |
| market_cap | BIGINT | 总市值 |
| pe_ttm | DECIMAL(10,2) | 市盈率TTM |
| pb | DECIMAL(10,2) | 市净率 |
| roe | DECIMAL(10,2) | 净资产收益率 |
| dividend_yield | DECIMAL(10,4) | 股息率 |
| updated_at | TIMESTAMP | 更新时间 |

#### kline_daily（日K线数据表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL PK | 自增ID |
| stock_code | VARCHAR(10) | 股票代码 |
| date | DATE | 日期 |
| open | DECIMAL(12,4) | 开盘价 |
| high | DECIMAL(12,4) | 最高价 |
| low | DECIMAL(12,4) | 最低价 |
| close | DECIMAL(12,4) | 收盘价 |
| volume | BIGINT | 成交量 |
| amount | DECIMAL(18,2) | 成交额 |
| change_pct | DECIMAL(10,4) | 涨跌幅 |
| UNIQUE(stock_code, date) | | 唯一索引 |

#### news_articles（新闻文章表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID PK | 新闻ID |
| source | VARCHAR(50) | 来源 |
| source_url | VARCHAR(500) | 原文链接 |
| title | VARCHAR(255) | 标题 |
| content | TEXT | 内容 |
| publish_time | TIMESTAMP | 发布时间 |
| related_stocks | VARCHAR(500) | 关联股票 |
| related_sectors | VARCHAR(500) | 关联板块 |
| sentiment | ENUM('positive','negative','neutral') | 情绪 |
| sentiment_score | DECIMAL(5,2) | 情绪分数 |
| opportunity_score | DECIMAL(5,2) | 机会评分 |
| ai_summary | TEXT | AI摘要 |
| ai_suggestion | VARCHAR(50) | AI建议 |
| created_at | TIMESTAMP | 创建时间 |

#### strategy_configs（策略配置表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID PK | 配置ID |
| user_id | UUID FK | 用户ID |
| name | VARCHAR(50) | 策略名称 |
| type | VARCHAR(50) | 策略类型 |
| params | JSONB | 策略参数 |
| is_active | BOOLEAN | 是否启用 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### strategy_signals（策略信号表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID PK | 信号ID |
| strategy_id | UUID FK | 策略ID |
| stock_code | VARCHAR(10) | 股票代码 |
| signal_type | ENUM('buy','sell','strong_buy','strong_sell','hold') | 信号类型 |
| signal_strength | INTEGER | 信号强度 1-5 |
| price | DECIMAL(12,4) | 触发价格 |
| date | DATE | 信号日期 |
| description | TEXT | 信号描述 |
| is_validated | BOOLEAN | 是否验证 |
| validated_result | DECIMAL(10,4) | 验证结果（N天后涨跌幅） |
| created_at | TIMESTAMP | 创建时间 |

#### backtest_jobs（回测任务表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID PK | 任务ID |
| user_id | UUID FK | 用户ID |
| strategy_id | UUID FK | 策略ID |
| name | VARCHAR(50) | 任务名称 |
| params | JSONB | 回测参数 |
| status | ENUM('pending','running','completed','failed') | 状态 |
| progress | INTEGER | 进度 0-100 |
| result | JSONB | 结果数据 |
| started_at | TIMESTAMP | 开始时间 |
| completed_at | TIMESTAMP | 完成时间 |
| created_at | TIMESTAMP | 创建时间 |

#### push_configs（推送配置表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID PK | 配置ID |
| user_id | UUID FK | 用户ID |
| channel | ENUM('wechat','dingtalk','feishu','email') | 渠道 |
| config | JSONB | 配置详情 |
| is_active | BOOLEAN | 是否启用 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### push_logs（推送日志表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID PK | 日志ID |
| user_id | UUID FK | 用户ID |
| channel | VARCHAR(20) | 渠道 |
| type | VARCHAR(50) | 推送类型 |
| title | VARCHAR(255) | 标题 |
| content | TEXT | 内容 |
| status | ENUM('success','failed') | 状态 |
| error_msg | TEXT | 错误信息 |
| created_at | TIMESTAMP | 创建时间 |

---

## 6. API 设计概要

### 6.1 认证相关
- `POST /api/v1/auth/register` - 注册
- `POST /api/v1/auth/login` - 登录
- `POST /api/v1/auth/refresh` - 刷新 Token
- `POST /api/v1/auth/forgot-password` - 找回密码
- `POST /api/v1/auth/reset-password` - 重置密码

### 6.2 用户管理
- `GET /api/v1/users/me` - 获取当前用户
- `PUT /api/v1/users/me` - 更新用户信息
- `PUT /api/v1/users/me/password` - 修改密码

### 6.3 持仓管理
- `GET /api/v1/portfolios` - 获取投资组合列表
- `POST /api/v1/portfolios` - 创建投资组合
- `GET /api/v1/portfolios/{id}` - 获取组合详情
- `GET /api/v1/portfolios/{id}/holdings` - 获取持仓列表
- `POST /api/v1/portfolios/{id}/holdings` - 添加持仓
- `PUT /api/v1/holdings/{id}` - 更新持仓
- `DELETE /api/v1/holdings/{id}` - 删除持仓
- `GET /api/v1/portfolios/{id}/transactions` - 获取交易记录
- `POST /api/v1/portfolios/{id}/transactions` - 添加交易记录

### 6.4 行情数据
- `GET /api/v1/market/stocks` - 获取股票列表
- `GET /api/v1/market/stocks/{code}` - 获取股票详情
- `GET /api/v1/market/stocks/{code}/kline` - 获取K线数据
- `GET /api/v1/market/indices` - 获取指数行情
- `GET /api/v1/market/hot-sectors` - 获取热点板块

### 6.5 新闻监控
- `GET /api/v1/news` - 获取新闻列表
- `GET /api/v1/news/{id}` - 获取新闻详情
- `GET /api/v1/news/opportunities` - 获取机会列表
- `POST /api/v1/news/analyze` - 手动分析新闻

### 6.6 买卖信号
- `GET /api/v1/signals` - 获取信号列表
- `GET /api/v1/signals/{id}` - 获取信号详情
- `GET /api/v1/signals/stats` - 获取信号统计
- `POST /api/v1/signals/scan` - 手动扫描信号

### 6.7 策略管理
- `GET /api/v1/strategies` - 获取策略列表
- `POST /api/v1/strategies` - 创建策略
- `GET /api/v1/strategies/{id}` - 获取策略详情
- `PUT /api/v1/strategies/{id}` - 更新策略
- `DELETE /api/v1/strategies/{id}` - 删除策略
- `POST /api/v1/strategies/{id}/run` - 运行策略
- `GET /api/v1/strategies/{id}/signals` - 获取策略信号

### 6.8 回测系统
- `POST /api/v1/backtest` - 创建回测任务
- `GET /api/v1/backtest` - 获取回测任务列表
- `GET /api/v1/backtest/{id}` - 获取回测详情
- `GET /api/v1/backtest/{id}/report` - 获取回测报告
- `DELETE /api/v1/backtest/{id}` - 删除回测任务

### 6.9 推送配置
- `GET /api/v1/push/configs` - 获取推送配置
- `POST /api/v1/push/configs` - 添加推送配置
- `PUT /api/v1/push/configs/{id}` - 更新推送配置
- `DELETE /api/v1/push/configs/{id}` - 删除推送配置
- `POST /api/v1/push/test` - 测试推送

---

## 7. 任务调度设计

### 7.1 定时任务清单

| 任务 | 频率 | 说明 |
|------|------|------|
| sync_stock_list | 每周一 09:00 | 同步股票基础信息 |
| sync_kline_daily | 交易日 15:30 | 同步日K线数据 |
| sync_realtime_quotes | 交易时段每 15s | 同步实时行情 |
| sync_fundamental | 每周一 09:30 | 同步基本面数据 |
| crawl_news | 每 5 分钟 | 采集新闻 |
| analyze_news | 每 10 分钟 | AI分析新闻 |
| calculate_signals | 交易时段每 15 分钟 | 计算买卖信号 |
| run_strategies | 交易时段每 30 分钟 | 运行量化策略 |
| daily_report | 交易日 15:30 | 生成收盘报告 |
| cleanup_old_data | 每天 03:00 | 清理过期数据 |

### 7.2 异步任务
- 回测任务：用户触发，Celery 异步执行
- 批量导入：用户上传文件后异步处理
- 推送任务：信号触发后异步推送

---

## 8. 部署方案

### 8.1 服务器要求
- CPU: 4核+（推荐 8核）
- 内存: 8GB+（推荐 16GB）
- 磁盘: 100GB+ SSD
- 带宽: 5Mbps+
- 系统: Ubuntu 22.04 LTS

### 8.2 Docker Compose 编排

```yaml
# 核心服务
- nginx: 反向代理、静态文件服务
- fastapi: 主应用服务（可扩展多实例）
- celery-worker: 任务执行 Worker
- celery-beat: 定时任务调度器
- postgres: PostgreSQL 数据库
- redis: Redis 缓存 + 消息队列
```

### 8.3 环境变量配置
- 数据库连接信息
- Redis 连接信息
- AKShare/Tushare API Token
- DeepSeek API Key
- 推送渠道 Webhook 配置
- JWT Secret Key

### 8.4 部署步骤
1. 服务器环境准备（Docker + Docker Compose）
2. 克隆代码仓库
3. 配置环境变量（.env）
4. 执行数据库迁移
5. 启动 Docker Compose
6. 配置 Nginx 反向代理 + SSL
7. 验证服务状态

---

## 9. 风险与合规

### 9.1 数据合规
- 仅使用公开可获取的市场数据
- 不存储用户交易密码等敏感信息
- 用户数据加密存储

### 9.2 投资建议声明
- 系统生成的信号和建议仅供参考，不构成投资建议
- 用户需自行承担投资决策风险
- 在系统中添加明确的风险提示

### 9.3 技术风险
- 数据源不稳定：AKShare 为开源项目，需有备用数据源
- API 限流：合理控制请求频率，避免被封禁
- 服务中断：交易时段核心服务需高可用

---

## 10. 迭代路线图

### Phase 1: 基础功能（4-6 周）
- 用户系统 + 持仓管理
- 行情数据采集 + 展示
- 基础技术指标信号
- 推送系统（微信/钉钉）

### Phase 2: 量化核心（4-6 周）
- 高级量化策略引擎
- 回测系统
- 新闻监控 + AI 分析
- 策略表现监控

### Phase 3: 优化扩展（2-4 周）
- 前端 UI 优化（玻璃风格）
- 报表中心完善
- 多用户支持
- 性能优化

### Phase 4: 高级功能（后续）
- 实时行情 WebSocket
- 更多数据源对接
- 机器学习策略
- 移动端适配

---

## 11. 附录

### 11.1 内置策略清单

| 编号 | 策略名称 | 类型 | 说明 |
|------|---------|------|------|
| S001 | MACD 金叉死叉 | 技术指标 | DIF/DEA 交叉 |
| S002 | KDJ 超买超卖 | 技术指标 | K/D/J 值区间 |
| S003 | RSI 强弱反转 | 技术指标 | 相对强弱指数 |
| S004 | 均线多头排列 | 技术指标 | 短期>中期>长期均线 |
| S005 | 布林带突破 | 技术指标 | 价格突破上下轨 |
| S006 | 量价齐升 | 技术指标 | 价格上涨+成交量放大 |
| S007 | 价值选股 | 多因子 | 低PE+低PB+高股息 |
| S008 | 质量选股 | 多因子 | 高ROE+低负债 |
| S009 | 动量选股 | 多因子 | 近期涨幅排名 |
| S010 | 低波动选股 | 多因子 | 低Beta+低波动率 |
| S011 | 布林带均值回归 | 均值回归 | 价格偏离回归 |
| S012 | 海龟交易法则 | 趋势跟踪 | 突破N日高低点 |
| S013 | 双均线趋势 | 趋势跟踪 | 短期/长期均线交叉 |
| S014 | 财报超预期 | 事件驱动 | 业绩预告超预期 |
| S015 | 高分红策略 | 事件驱动 | 高股息率股票 |
| S016 | 主力净流入 | 资金流向 | 连续N日主力净流入 |
| S017 | MACD+RSI+均线 | 组合策略 | 三重指标过滤 |
| S018 | 多因子综合 | 组合策略 | 价值+质量+动量组合 |

### 11.2 技术栈版本锁定

```
Python: 3.11+
FastAPI: 0.110+
SQLAlchemy: 2.0+
Celery: 5.3+
Redis: 7.0+
PostgreSQL: 15+
React: 18+
TypeScript: 5.0+
Node.js: 20+
```

---

*文档结束*

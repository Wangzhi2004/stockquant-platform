# 智能股票量化交易平台 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个面向国内A股市场的智能量化投资分析与决策支持平台，包含持仓管理、行情数据、新闻监控、买卖信号、18种量化策略、回测系统、多渠道推送，采用金融玻璃拟态UI风格。

**Architecture:** FastAPI + SQLAlchemy 后端，React + TypeScript + Tailwind CSS + shadcn/ui 前端，Celery + Redis 任务队列，PostgreSQL 数据库，Docker Compose 部署。数据源自 AKShare，AI分析调用 DeepSeek API。

**Tech Stack:** Python 3.11, FastAPI, SQLAlchemy 2.0, Celery, Redis, PostgreSQL, React 18, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Recharts, AKShare, DeepSeek API

---

## 项目结构

```
stock-quant-platform/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── logging.py
│   │   │   └── exceptions.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
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
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── portfolio.py
│   │   │       ├── market.py
│   │   │       ├── news.py
│   │   │       ├── signals.py
│   │   │       ├── strategies.py
│   │   │       ├── backtest.py
│   │   │       └── push.py
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
│   │   │   ├── celery_app.py
│   │   │   ├── market_tasks.py
│   │   │   ├── news_tasks.py
│   │   │   ├── signal_tasks.py
│   │   │   ├── strategy_tasks.py
│   │   │   └── push_tasks.py
│   │   ├── strategies/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── technical/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── macd.py
│   │   │   │   ├── kdj.py
│   │   │   │   ├── rsi.py
│   │   │   │   ├── ma.py
│   │   │   │   ├── bollinger.py
│   │   │   │   └── volume.py
│   │   │   ├── multi_factor/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── value.py
│   │   │   │   ├── quality.py
│   │   │   │   ├── momentum.py
│   │   │   │   └── low_volatility.py
│   │   │   ├── mean_reversion/
│   │   │   │   ├── __init__.py
│   │   │   │   └── bollinger_reversion.py
│   │   │   ├── trend_following/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── turtle.py
│   │   │   │   └── dual_ma.py
│   │   │   ├── event_driven/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── earnings.py
│   │   │   │   └── dividend.py
│   │   │   ├── flow/
│   │   │   │   ├── __init__.py
│   │   │   │   └── main_force.py
│   │   │   └── composite/
│   │   │       ├── __init__.py
│   │   │       ├── triple_filter.py
│   │   │       └── multi_factor_combo.py
│   │   ├── backtest/
│   │   │   ├── __init__.py
│   │   │   ├── engine.py
│   │   │   ├── metrics.py
│   │   │   └── report.py
│   │   ├── data/
│   │   │   ├── __init__.py
│   │   │   ├── akshare_client.py
│   │   │   ├── tushare_client.py
│   │   │   └── sync.py
│   │   ├── news/
│   │   │   ├── __init__.py
│   │   │   ├── crawler.py
│   │   │   ├── analyzer.py
│   │   │   └── scorer.py
│   │   └── push/
│   │       ├── __init__.py
│   │       ├── wechat.py
│   │       ├── dingtalk.py
│   │       ├── feishu.py
│   │       └── email.py
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_portfolio.py
│   │   ├── test_market.py
│   │   ├── test_signals.py
│   │   └── test_strategies.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── charts/
│   │   │   │   ├── KlineChart.tsx
│   │   │   │   ├── ProfitChart.tsx
│   │   │   │   ├── HeatmapChart.tsx
│   │   │   │   ├── DonutChart.tsx
│   │   │   │   └── Sparkline.tsx
│   │   │   ├── glass/
│   │   │   │   ├── GlassCard.tsx
│   │   │   │   ├── GlassButton.tsx
│   │   │   │   ├── GlassInput.tsx
│   │   │   │   ├── GlassTabs.tsx
│   │   │   │   └── GlassTable.tsx
│   │   │   ├── common/
│   │   │   │   ├── PriceDisplay.tsx
│   │   │   │   ├── ChangeBadge.tsx
│   │   │   │   ├── StrengthBar.tsx
│   │   │   │   └── StatusDot.tsx
│   │   │   └── pages/
│   │   │       ├── Dashboard/
│   │   │       │   ├── HeroCard.tsx
│   │   │       │   ├── IndexCard.tsx
│   │   │       │   └── DashboardPage.tsx
│   │   │       ├── Portfolio/
│   │   │       │   └── PortfolioPage.tsx
│   │   │       ├── Market/
│   │   │       │   └── MarketPage.tsx
│   │   │       ├── News/
│   │   │       │   └── NewsPage.tsx
│   │   │       ├── Signals/
│   │   │       │   └── SignalsPage.tsx
│   │   │       ├── Strategies/
│   │   │       │   └── StrategiesPage.tsx
│   │   │       ├── Backtest/
│   │   │       │   └── BacktestPage.tsx
│   │   │       └── Settings/
│   │   │           └── SettingsPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePortfolio.ts
│   │   │   ├── useMarket.ts
│   │   │   └── useWebSocket.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── portfolio.ts
│   │   │   ├── market.ts
│   │   │   ├── news.ts
│   │   │   ├── signals.ts
│   │   │   ├── strategies.ts
│   │   │   ├── backtest.ts
│   │   │   └── push.ts
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   ├── authStore.ts
│   │   │   ├── portfolioStore.ts
│   │   │   └── marketStore.ts
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   ├── user.ts
│   │   │   ├── portfolio.ts
│   │   │   ├── market.ts
│   │   │   ├── news.ts
│   │   │   ├── signal.ts
│   │   │   ├── strategy.ts
│   │   │   ├── backtest.ts
│   │   │   └── push.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── calculations.ts
│   │   │   └── constants.ts
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── glass.css
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
    ├── api/
    ├── deployment/
    └── strategies/
```

---

## Phase 1: 基础设施搭建

### Task 1: 项目初始化与 Docker 环境

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `Makefile`
- Create: `.gitignore`

- [ ] **Step 1: 创建 docker-compose.yml**

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      - AKSHARE_TOKEN=${AKSHARE_TOKEN}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  celery-worker:
    build: ./backend
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      - AKSHARE_TOKEN=${AKSHARE_TOKEN}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    volumes:
      - ./backend:/app
    command: celery -A app.tasks.celery_app worker --loglevel=info

  celery-beat:
    build: ./backend
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      - AKSHARE_TOKEN=${AKSHARE_TOKEN}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    volumes:
      - ./backend:/app
    command: celery -A app.tasks.celery_app beat --loglevel=info

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - app-network
    command: npm run dev

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

- [ ] **Step 2: 创建 .env.example**

```bash
# Database
POSTGRES_USER=stockquant
POSTGRES_PASSWORD=changeme
POSTGRES_DB=stockquant
DATABASE_URL=postgresql://stockquant:changeme@postgres:5432/stockquant

# Redis
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=your-super-secret-key-change-this

# Data Sources
AKSHARE_TOKEN=
TUSHARE_TOKEN=

# AI
DEEPSEEK_API_KEY=

# Push
WECHAT_WEBHOOK=
DINGTALK_WEBHOOK=
FEISHU_WEBHOOK=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

- [ ] **Step 3: 创建 Makefile**

```makefile
.PHONY: up down build logs migrate test

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

migrate:
	docker-compose exec backend alembic upgrade head

makemigrations:
	docker-compose exec backend alembic revision --autogenerate -m "$(msg)"

test:
	docker-compose exec backend pytest

shell:
	docker-compose exec backend bash

frontend:
	docker-compose exec frontend bash
```

- [ ] **Step 4: 创建 .gitignore**

```gitignore
# Environment
.env
.venv
venv/

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Node
node_modules/
dist/
*.log
npm-debug.log*

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Docker
postgres_data/
redis_data/
```

- [ ] **Step 5: 启动基础设施**

```bash
docker-compose up -d postgres redis
```

---

### Task 2: 后端项目初始化

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/requirements.txt`
- Create: `backend/Dockerfile`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/security.py`
- Create: `backend/app/core/exceptions.py`
- Create: `backend/app/core/logging.py`

- [ ] **Step 1: 创建 requirements.txt**

```txt
fastapi==0.110.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
alembic==1.13.1
psycopg2-binary==2.9.9
redis==5.0.1
celery==5.3.6
pydantic==2.5.3
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
akshare==1.12.0
pandas==2.1.4
numpy==1.26.3
httpx==0.26.0
pytest==7.4.4
pytest-asyncio==0.23.3
```

- [ ] **Step 2: 创建 Dockerfile**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 3: 创建 core/config.py**

```python
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "StockQuant Platform"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql://stockquant:changeme@localhost:5432/stockquant"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Data Sources
    AKSHARE_TOKEN: str = ""
    TUSHARE_TOKEN: str = ""
    
    # AI
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_API_URL: str = "https://api.deepseek.com/v1/chat/completions"
    
    # Push
    WECHAT_WEBHOOK: str = ""
    DINGTALK_WEBHOOK: str = ""
    FEISHU_WEBHOOK: str = ""
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

- [ ] **Step 4: 创建 core/security.py**

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        return None
```

- [ ] **Step 5: 创建 core/exceptions.py**

```python
from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class AuthenticationError(AppException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class AuthorizationError(AppException):
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class NotFoundError(AppException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ValidationError(AppException):
    def __init__(self, detail: str = "Validation error"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)
```

- [ ] **Step 6: 创建 main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.v1 import auth, users, portfolio, market, news, signals, strategies, backtest, push

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="智能股票量化交易平台 API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(portfolio.router, prefix="/api/v1/portfolios", tags=["portfolio"])
app.include_router(market.router, prefix="/api/v1/market", tags=["market"])
app.include_router(news.router, prefix="/api/v1/news", tags=["news"])
app.include_router(signals.router, prefix="/api/v1/signals", tags=["signals"])
app.include_router(strategies.router, prefix="/api/v1/strategies", tags=["strategies"])
app.include_router(backtest.router, prefix="/api/v1/backtest", tags=["backtest"])
app.include_router(push.router, prefix="/api/v1/push", tags=["push"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

- [ ] **Step 7: 构建后端镜像**

```bash
cd backend && docker build -t stockquant-backend .
```

---

### Task 3: 前端项目初始化

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/Dockerfile`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/styles/globals.css`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "stockquant-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "recharts": "^2.10.3",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

- [ ] **Step 2: 创建 tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
      borderRadius: {
        glass: '20px',
        'glass-sm': '12px',
        'glass-lg': '24px',
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
      },
      keyframes: {
        'card-enter': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '50%': { boxShadow: '0 0 15px currentColor, 0 0 30px currentColor' },
        },
        'ambient-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 3: 创建 globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #05070a;
    --bg-secondary: #0c1220;
    --bg-tertiary: #111a2e;
    --bg-elevated: #162038;
    
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-bg-hover: rgba(255, 255, 255, 0.06);
    --glass-border: rgba(255, 255, 255, 0.06);
    --glass-border-highlight: rgba(255, 255, 255, 0.12);
    
    --text-primary: rgba(255, 255, 255, 0.92);
    --text-secondary: rgba(255, 255, 255, 0.60);
    --text-tertiary: rgba(255, 255, 255, 0.38);
    
    --up-primary: #00e5a0;
    --up-glow: rgba(0, 229, 160, 0.4);
    --down-primary: #ff4567;
    --down-glow: rgba(255, 69, 103, 0.4);
    --accent-primary: #5b8def;
    --accent-glow: rgba(91, 141, 239, 0.4);
  }
  
  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'SF Pro Text', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }
}

@layer components {
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(24px) saturate(1.2);
    -webkit-backdrop-filter: blur(24px) saturate(1.2);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    position: relative;
    overflow: hidden;
  }
  
  .glass-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 20%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0.15) 80%, transparent 100%);
  }
  
  .glass-card:hover {
    background: var(--glass-bg-hover);
    border-color: var(--glass-border-highlight);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* Custom scrollbar */
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

- [ ] **Step 4: 创建 main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

- [ ] **Step 5: 创建 App.tsx**

```tsx
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import DashboardPage from './components/pages/Dashboard/DashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}

export default App
```

- [ ] **Step 6: 安装依赖**

```bash
cd frontend && npm install
```

---

## Phase 2: 数据库与模型

### Task 4: 数据库模型定义

**Files:**
- Create: `backend/app/models/base.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/portfolio.py`
- Create: `backend/app/models/stock.py`
- Create: `backend/app/models/kline.py`
- Create: `backend/app/models/news.py`
- Create: `backend/app/models/signal.py`
- Create: `backend/app/models/strategy.py`
- Create: `backend/app/models/backtest.py`
- Create: `backend/app/models/push.py`
- Create: `backend/alembic/env.py`

- [ ] **Step 1: 创建 base.py**

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 2: 创建 user.py**

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    nickname = Column(String(50), nullable=True)
    avatar = Column(String(255), nullable=True)
    role = Column(Enum("admin", "user", name="user_role"), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

- [ ] **Step 3: 创建 portfolio.py**

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Numeric, DateTime, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(50), nullable=False)
    description = Column(String, nullable=True)
    initial_capital = Column(Numeric(15, 2), default=1000000)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="portfolios")
    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="portfolio", cascade="all, delete-orphan")


class Holding(Base):
    __tablename__ = "holdings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"), nullable=False)
    stock_code = Column(String(10), nullable=False)
    stock_name = Column(String(50), nullable=False)
    cost_price = Column(Numeric(12, 4), nullable=False)
    quantity = Column(Integer, nullable=False)
    buy_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    portfolio = relationship("Portfolio", back_populates="holdings")


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"), nullable=False)
    stock_code = Column(String(10), nullable=False)
    type = Column(Enum("buy", "sell", "dividend", "split", name="transaction_type"), nullable=False)
    price = Column(Numeric(12, 4), nullable=False)
    quantity = Column(Integer, nullable=False)
    fee = Column(Numeric(12, 4), default=0)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    portfolio = relationship("Portfolio", back_populates="transactions")
```

- [ ] **Step 4: 创建 stock.py**

```python
from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Numeric, DateTime
from app.models.base import Base


class Stock(Base):
    __tablename__ = "stocks"
    
    code = Column(String(10), primary_key=True)
    name = Column(String(50), nullable=False)
    exchange = Column(String(10), nullable=False)
    industry = Column(String(50), nullable=True)
    sector = Column(String(50), nullable=True)
    market_cap = Column(BigInteger, nullable=True)
    pe_ttm = Column(Numeric(10, 2), nullable=True)
    pb = Column(Numeric(10, 2), nullable=True)
    roe = Column(Numeric(10, 2), nullable=True)
    dividend_yield = Column(Numeric(10, 4), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

- [ ] **Step 5: 创建 kline.py**

```python
from sqlalchemy import Column, String, Date, Numeric, BigInteger, UniqueConstraint
from app.models.base import Base


class KlineDaily(Base):
    __tablename__ = "kline_daily"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    stock_code = Column(String(10), nullable=False)
    date = Column(Date, nullable=False)
    open = Column(Numeric(12, 4), nullable=False)
    high = Column(Numeric(12, 4), nullable=False)
    low = Column(Numeric(12, 4), nullable=False)
    close = Column(Numeric(12, 4), nullable=False)
    volume = Column(BigInteger, nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    change_pct = Column(Numeric(10, 4), nullable=True)
    
    __table_args__ = (
        UniqueConstraint("stock_code", "date", name="uix_kline_stock_date"),
    )
```

- [ ] **Step 6: 创建 news.py**

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class NewsArticle(Base):
    __tablename__ = "news_articles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source = Column(String(50), nullable=False)
    source_url = Column(String(500), nullable=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    publish_time = Column(DateTime, nullable=True)
    related_stocks = Column(String(500), nullable=True)
    related_sectors = Column(String(500), nullable=True)
    sentiment = Column(Enum("positive", "negative", "neutral", name="news_sentiment"), nullable=True)
    sentiment_score = Column(Numeric(5, 2), nullable=True)
    opportunity_score = Column(Numeric(5, 2), nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_suggestion = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

- [ ] **Step 7: 创建 signal.py**

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Numeric, DateTime, Integer, Enum, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class StrategySignal(Base):
    __tablename__ = "strategy_signals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategy_configs.id"), nullable=False)
    stock_code = Column(String(10), nullable=False)
    signal_type = Column(Enum("buy", "sell", "strong_buy", "strong_sell", "hold", name="signal_type"), nullable=False)
    signal_strength = Column(Integer, default=1)
    price = Column(Numeric(12, 4), nullable=True)
    date = Column(DateTime, nullable=False)
    description = Column(Text, nullable=True)
    is_validated = Column(Boolean, default=False)
    validated_result = Column(Numeric(10, 4), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

- [ ] **Step 8: 创建 strategy.py**

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import Base


class StrategyConfig(Base):
    __tablename__ = "strategy_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(50), nullable=False)
    type = Column(String(50), nullable=False)
    params = Column(JSONB, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

- [ ] **Step 9: 创建 backtest.py**

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import Base


class BacktestJob(Base):
    __tablename__ = "backtest_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategy_configs.id"), nullable=True)
    name = Column(String(50), nullable=False)
    params = Column(JSONB, default={})
    status = Column(Enum("pending", "running", "completed", "failed", name="backtest_status"), default="pending")
    progress = Column(Integer, default=0)
    result = Column(JSONB, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

- [ ] **Step 10: 创建 push.py**

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import Base


class PushConfig(Base):
    __tablename__ = "push_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    channel = Column(Enum("wechat", "dingtalk", "feishu", "email", name="push_channel"), nullable=False)
    config = Column(JSONB, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PushLog(Base):
    __tablename__ = "push_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    channel = Column(String(20), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    status = Column(Enum("success", "failed", name="push_status"), nullable=False)
    error_msg = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

- [ ] **Step 11: 创建 alembic 配置**

```python
# alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.core.config import get_settings
from app.models.base import Base
from app.models import user, portfolio, stock, kline, news, signal, strategy, backtest, push

settings = get_settings()
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_url():
    return settings.DATABASE_URL

def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

- [ ] **Step 12: 初始化 alembic 并创建迁移**

```bash
cd backend
alembic init alembic
alembic revision --autogenerate -m "init"
alembic upgrade head
```

---

## Phase 3: 认证与用户系统

### Task 5: 认证 API

**Files:**
- Create: `backend/app/schemas/user.py`
- Create: `backend/app/services/user_service.py`
- Create: `backend/app/api/v1/auth.py`
- Create: `backend/app/api/deps.py`

- [ ] **Step 1: 创建 user schema**

```python
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    nickname: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PasswordChange(BaseModel):
    old_password: str
    new_password: str
```

- [ ] **Step 2: 创建 user_service.py**

```python
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, PasswordChange
from app.core.security import get_password_hash, verify_password
from app.core.exceptions import AuthenticationError, NotFoundError, ValidationError


class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_id(self, user_id: UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()
    
    def create(self, user_data: UserCreate) -> User:
        if self.get_by_email(user_data.email):
            raise ValidationError("Email already registered")
        
        db_user = User(
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            nickname=user_data.nickname,
            phone=user_data.phone,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def authenticate(self, email: str, password: str) -> User:
        user = self.get_by_email(email)
        if not user:
            raise AuthenticationError("Invalid email or password")
        if not verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")
        if not user.is_active:
            raise AuthenticationError("User is inactive")
        return user
    
    def update(self, user_id: UUID, user_data: UserUpdate) -> User:
        user = self.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        
        for field, value in user_data.model_dump(exclude_unset=True).items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def change_password(self, user_id: UUID, password_data: PasswordChange) -> User:
        user = self.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        
        if not verify_password(password_data.old_password, user.hashed_password):
            raise AuthenticationError("Invalid old password")
        
        user.hashed_password = get_password_hash(password_data.new_password)
        self.db.commit()
        self.db.refresh(user)
        return user
```

- [ ] **Step 3: 创建 deps.py**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError
from app.models.base import get_db
from app.models.user import User
from app.core.security import decode_access_token
from app.core.exceptions import AuthenticationError

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise AuthenticationError("Invalid token")
    
    user_id = payload.get("sub")
    if user_id is None:
        raise AuthenticationError("Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise AuthenticationError("User not found")
    
    if not user.is_active:
        raise AuthenticationError("User is inactive")
    
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
```

- [ ] **Step 4: 创建 auth.py**

```python
from datetime import timedelta
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.services.user_service import UserService
from app.core.security import create_access_token
from app.core.config import get_settings
from app.core.exceptions import AuthenticationError

router = APIRouter()
settings = get_settings()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.create(user_data)
    return user


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.authenticate(login_data.email, login_data.password)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
async def refresh_token(current_user = Depends(get_current_user)):
    access_token = create_access_token(
        data={"sub": str(current_user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}
```

- [ ] **Step 5: 测试认证 API**

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","nickname":"Test User"}'

curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

### Task 6: 用户管理 API

**Files:**
- Create: `backend/app/api/v1/users.py`

- [ ] **Step 1: 创建 users.py**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, PasswordChange
from app.services.user_service import UserService
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = UserService(db)
    user = service.update(current_user.id, user_data)
    return user


@router.put("/me/password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = UserService(db)
    service.change_password(current_user.id, password_data)
    return {"message": "Password changed successfully"}
```

---

## Phase 4: 持仓管理系统

### Task 7: 持仓管理 API

**Files:**
- Create: `backend/app/schemas/portfolio.py`
- Create: `backend/app/services/portfolio_service.py`
- Create: `backend/app/api/v1/portfolio.py`

- [ ] **Step 1: 创建 portfolio schema**

```python
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal


class PortfolioBase(BaseModel):
    name: str
    description: Optional[str] = None
    initial_capital: Optional[Decimal] = Decimal("1000000")


class PortfolioCreate(PortfolioBase):
    pass


class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    initial_capital: Optional[Decimal] = None


class HoldingBase(BaseModel):
    stock_code: str
    stock_name: str
    cost_price: Decimal
    quantity: int
    buy_date: date


class HoldingCreate(HoldingBase):
    pass


class HoldingUpdate(BaseModel):
    cost_price: Optional[Decimal] = None
    quantity: Optional[int] = None


class HoldingResponse(HoldingBase):
    id: UUID
    portfolio_id: UUID
    created_at: datetime
    updated_at: datetime
    current_price: Optional[Decimal] = None
    market_value: Optional[Decimal] = None
    profit_loss: Optional[Decimal] = None
    profit_loss_pct: Optional[Decimal] = None
    
    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    stock_code: str
    type: str
    price: Decimal
    quantity: int
    fee: Optional[Decimal] = Decimal("0")
    date: date


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: UUID
    portfolio_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class PortfolioResponse(PortfolioBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    total_market_value: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    total_profit_loss: Optional[Decimal] = None
    total_profit_loss_pct: Optional[Decimal] = None
    holdings_count: Optional[int] = None
    
    class Config:
        from_attributes = True


class PortfolioDetailResponse(PortfolioResponse):
    holdings: List[HoldingResponse]
    transactions: List[TransactionResponse]
```

- [ ] **Step 2: 创建 portfolio_service.py**

```python
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.portfolio import Portfolio, Holding, Transaction
from app.models.stock import Stock
from app.schemas.portfolio import (
    PortfolioCreate, PortfolioUpdate, HoldingCreate, HoldingUpdate,
    TransactionCreate
)
from app.core.exceptions import NotFoundError, ValidationError
from app.data.akshare_client import AKShareClient


class PortfolioService:
    def __init__(self, db: Session):
        self.db = db
        self.market_client = AKShareClient()
    
    def create_portfolio(self, user_id: UUID, data: PortfolioCreate) -> Portfolio:
        portfolio = Portfolio(
            user_id=user_id,
            name=data.name,
            description=data.description,
            initial_capital=data.initial_capital,
        )
        self.db.add(portfolio)
        self.db.commit()
        self.db.refresh(portfolio)
        return portfolio
    
    def get_portfolios(self, user_id: UUID) -> List[Portfolio]:
        return self.db.query(Portfolio).filter(Portfolio.user_id == user_id).all()
    
    def get_portfolio(self, portfolio_id: UUID, user_id: UUID) -> Portfolio:
        portfolio = self.db.query(Portfolio).filter(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == user_id
        ).first()
        if not portfolio:
            raise NotFoundError("Portfolio not found")
        return portfolio
    
    def update_portfolio(self, portfolio_id: UUID, user_id: UUID, data: PortfolioUpdate) -> Portfolio:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(portfolio, field, value)
        self.db.commit()
        self.db.refresh(portfolio)
        return portfolio
    
    def delete_portfolio(self, portfolio_id: UUID, user_id: UUID) -> None:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        self.db.delete(portfolio)
        self.db.commit()
    
    def add_holding(self, portfolio_id: UUID, user_id: UUID, data: HoldingCreate) -> Holding:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        holding = Holding(
            portfolio_id=portfolio_id,
            stock_code=data.stock_code,
            stock_name=data.stock_name,
            cost_price=data.cost_price,
            quantity=data.quantity,
            buy_date=data.buy_date,
        )
        self.db.add(holding)
        self.db.commit()
        self.db.refresh(holding)
        return holding
    
    def get_holdings(self, portfolio_id: UUID, user_id: UUID) -> List[Holding]:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        return portfolio.holdings
    
    def update_holding(self, holding_id: UUID, user_id: UUID, data: HoldingUpdate) -> Holding:
        holding = self.db.query(Holding).join(Portfolio).filter(
            Holding.id == holding_id,
            Portfolio.user_id == user_id
        ).first()
        if not holding:
            raise NotFoundError("Holding not found")
        
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(holding, field, value)
        self.db.commit()
        self.db.refresh(holding)
        return holding
    
    def delete_holding(self, holding_id: UUID, user_id: UUID) -> None:
        holding = self.db.query(Holding).join(Portfolio).filter(
            Holding.id == holding_id,
            Portfolio.user_id == user_id
        ).first()
        if not holding:
            raise NotFoundError("Holding not found")
        self.db.delete(holding)
        self.db.commit()
    
    def add_transaction(self, portfolio_id: UUID, user_id: UUID, data: TransactionCreate) -> Transaction:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        transaction = Transaction(
            portfolio_id=portfolio_id,
            stock_code=data.stock_code,
            type=data.type,
            price=data.price,
            quantity=data.quantity,
            fee=data.fee,
            date=data.date,
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def get_transactions(self, portfolio_id: UUID, user_id: UUID) -> List[Transaction]:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        return portfolio.transactions
    
    def calculate_portfolio_stats(self, portfolio_id: UUID, user_id: UUID) -> dict:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        holdings = portfolio.holdings
        
        total_cost = sum(h.cost_price * h.quantity for h in holdings)
        total_market_value = 0
        total_profit_loss = 0
        
        for holding in holdings:
            try:
                current_price = self.market_client.get_realtime_quote(holding.stock_code)
                market_value = current_price * holding.quantity
                profit_loss = market_value - (holding.cost_price * holding.quantity)
                
                total_market_value += market_value
                total_profit_loss += profit_loss
            except Exception:
                continue
        
        profit_loss_pct = (total_profit_loss / total_cost * 100) if total_cost > 0 else 0
        
        return {
            "total_cost": total_cost,
            "total_market_value": total_market_value,
            "total_profit_loss": total_profit_loss,
            "total_profit_loss_pct": profit_loss_pct,
            "holdings_count": len(holdings),
        }
```

- [ ] **Step 3: 创建 portfolio API**

```python
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.base import get_db
from app.models.user import User
from app.schemas.portfolio import (
    PortfolioCreate, PortfolioUpdate, PortfolioResponse, PortfolioDetailResponse,
    HoldingCreate, HoldingUpdate, HoldingResponse,
    TransactionCreate, TransactionResponse
)
from app.services.portfolio_service import PortfolioService
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[PortfolioResponse])
async def list_portfolios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    portfolios = service.get_portfolios(current_user.id)
    
    result = []
    for portfolio in portfolios:
        stats = service.calculate_portfolio_stats(portfolio.id, current_user.id)
        portfolio_data = PortfolioResponse.model_validate(portfolio)
        portfolio_data.total_market_value = stats["total_market_value"]
        portfolio_data.total_cost = stats["total_cost"]
        portfolio_data.total_profit_loss = stats["total_profit_loss"]
        portfolio_data.total_profit_loss_pct = stats["total_profit_loss_pct"]
        portfolio_data.holdings_count = stats["holdings_count"]
        result.append(portfolio_data)
    
    return result


@router.post("", response_model=PortfolioResponse, status_code=201)
async def create_portfolio(
    data: PortfolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    portfolio = service.create_portfolio(current_user.id, data)
    return portfolio


@router.get("/{portfolio_id}", response_model=PortfolioDetailResponse)
async def get_portfolio(
    portfolio_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    portfolio = service.get_portfolio(portfolio_id, current_user.id)
    return portfolio


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(
    portfolio_id: UUID,
    data: PortfolioUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    portfolio = service.update_portfolio(portfolio_id, current_user.id, data)
    return portfolio


@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    service.delete_portfolio(portfolio_id, current_user.id)
    return {"message": "Portfolio deleted"}


@router.get("/{portfolio_id}/holdings", response_model=List[HoldingResponse])
async def list_holdings(
    portfolio_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    holdings = service.get_holdings(portfolio_id, current_user.id)
    return holdings


@router.post("/{portfolio_id}/holdings", response_model=HoldingResponse, status_code=201)
async def add_holding(
    portfolio_id: UUID,
    data: HoldingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    holding = service.add_holding(portfolio_id, current_user.id, data)
    return holding


@router.put("/holdings/{holding_id}", response_model=HoldingResponse)
async def update_holding(
    holding_id: UUID,
    data: HoldingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    holding = service.update_holding(holding_id, current_user.id, data)
    return holding


@router.delete("/holdings/{holding_id}")
async def delete_holding(
    holding_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    service.delete_holding(holding_id, current_user.id)
    return {"message": "Holding deleted"}


@router.get("/{portfolio_id}/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    portfolio_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    transactions = service.get_transactions(portfolio_id, current_user.id)
    return transactions


@router.post("/{portfolio_id}/transactions", response_model=TransactionResponse, status_code=201)
async def add_transaction(
    portfolio_id: UUID,
    data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    transaction = service.add_transaction(portfolio_id, current_user.id, data)
    return transaction
```

---

## Phase 5: 行情数据系统

### Task 8: 数据采集客户端

**Files:**
- Create: `backend/app/data/akshare_client.py`
- Create: `backend/app/data/sync.py`
- Create: `backend/app/schemas/market.py`
- Create: `backend/app/services/market_service.py`
- Create: `backend/app/api/v1/market.py`

- [ ] **Step 1: 创建 akshare_client.py**

```python
import akshare as ak
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime, date
from decimal import Decimal


class AKShareClient:
    def __init__(self):
        self._cache = {}
    
    def get_stock_list(self) -> pd.DataFrame:
        """获取A股列表"""
        try:
            df = ak.stock_zh_a_spot_em()
            return df
        except Exception as e:
            raise Exception(f"Failed to get stock list: {str(e)}")
    
    def get_realtime_quote(self, stock_code: str) -> Decimal:
        """获取实时行情"""
        try:
            df = ak.stock_zh_a_spot_em()
            stock = df[df["代码"] == stock_code]
            if stock.empty:
                raise Exception(f"Stock {stock_code} not found")
            return Decimal(str(stock.iloc[0]["最新价"]))
        except Exception as e:
            raise Exception(f"Failed to get quote for {stock_code}: {str(e)}")
    
    def get_kline_daily(self, stock_code: str, start_date: str, end_date: str) -> pd.DataFrame:
        """获取日K线数据"""
        try:
            df = ak.stock_zh_a_hist(
                symbol=stock_code,
                period="daily",
                start_date=start_date,
                end_date=end_date,
                adjust="qfq"
            )
            return df
        except Exception as e:
            raise Exception(f"Failed to get kline for {stock_code}: {str(e)}")
    
    def get_index_quote(self, index_code: str) -> Dict:
        """获取指数行情"""
        try:
            df = ak.index_zh_a_spot_em()
            index = df[df["代码"] == index_code]
            if index.empty:
                raise Exception(f"Index {index_code} not found")
            row = index.iloc[0]
            return {
                "code": index_code,
                "name": row["名称"],
                "price": Decimal(str(row["最新价"])),
                "change": Decimal(str(row["涨跌额"])),
                "change_pct": Decimal(str(row["涨跌幅"])),
            }
        except Exception as e:
            raise Exception(f"Failed to get index quote: {str(e)}")
    
    def get_hot_sectors(self) -> pd.DataFrame:
        """获取热点板块"""
        try:
            df = ak.stock_board_industry_name_em()
            return df.head(20)
        except Exception as e:
            raise Exception(f"Failed to get hot sectors: {str(e)}")
```

- [ ] **Step 2: 创建 sync.py**

```python
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.stock import Stock
from app.models.kline import KlineDaily
from app.data.akshare_client import AKShareClient
from app.models.base import SessionLocal


def sync_stock_list():
    """同步股票基础信息"""
    db = SessionLocal()
    try:
        client = AKShareClient()
        df = client.get_stock_list()
        
        for _, row in df.iterrows():
            stock = db.query(Stock).filter(Stock.code == row["代码"]).first()
            if not stock:
                stock = Stock(code=row["代码"])
            
            stock.name = row["名称"]
            stock.exchange = "SH" if row["代码"].startswith("6") else "SZ"
            stock.industry = row.get("所属行业", "")
            stock.market_cap = int(row.get("总市值", 0))
            
            db.add(stock)
        
        db.commit()
        print(f"Synced {len(df)} stocks")
    except Exception as e:
        print(f"Error syncing stock list: {e}")
    finally:
        db.close()


def sync_kline_daily(stock_code: str = None):
    """同步日K线数据"""
    db = SessionLocal()
    try:
        client = AKShareClient()
        
        if stock_code:
            stocks = [stock_code]
        else:
            stocks = [s.code for s in db.query(Stock).all()]
        
        end_date = datetime.now().strftime("%Y%m%d")
        start_date = (datetime.now() - timedelta(days=365)).strftime("%Y%m%d")
        
        for code in stocks:
            try:
                df = client.get_kline_daily(code, start_date, end_date)
                
                for _, row in df.iterrows():
                    kline = db.query(KlineDaily).filter(
                        KlineDaily.stock_code == code,
                        KlineDaily.date == row["日期"]
                    ).first()
                    
                    if not kline:
                        kline = KlineDaily(
                            stock_code=code,
                            date=row["日期"],
                        )
                    
                    kline.open = row["开盘"]
                    kline.high = row["最高"]
                    kline.low = row["最低"]
                    kline.close = row["收盘"]
                    kline.volume = int(row["成交量"])
                    kline.amount = row["成交额"]
                    kline.change_pct = row.get("涨跌幅", 0)
                    
                    db.add(kline)
                
                db.commit()
            except Exception as e:
                print(f"Error syncing kline for {code}: {e}")
                continue
        
        print(f"Synced kline data")
    except Exception as e:
        print(f"Error syncing kline: {e}")
    finally:
        db.close()
```

- [ ] **Step 3: 创建 market schema**

```python
from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal


class StockInfo(BaseModel):
    code: str
    name: str
    exchange: str
    industry: Optional[str] = None
    sector: Optional[str] = None
    market_cap: Optional[int] = None
    pe_ttm: Optional[Decimal] = None
    pb: Optional[Decimal] = None
    roe: Optional[Decimal] = None
    dividend_yield: Optional[Decimal] = None


class KlineData(BaseModel):
    date: str
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int
    amount: Decimal
    change_pct: Optional[Decimal] = None


class IndexQuote(BaseModel):
    code: str
    name: str
    price: Decimal
    change: Decimal
    change_pct: Decimal


class HotSector(BaseModel):
    name: str
    change_pct: Decimal
    leading_stock: Optional[str] = None
```

- [ ] **Step 4: 创建 market_service.py**

```python
from typing import List
from sqlalchemy.orm import Session
from app.models.stock import Stock
from app.models.kline import KlineDaily
from app.data.akshare_client import AKShareClient
from app.schemas.market import StockInfo, KlineData, IndexQuote, HotSector


class MarketService:
    def __init__(self, db: Session):
        self.db = db
        self.client = AKShareClient()
    
    def get_stock_list(self, skip: int = 0, limit: int = 100) -> List[StockInfo]:
        stocks = self.db.query(Stock).offset(skip).limit(limit).all()
        return [StockInfo.model_validate(s) for s in stocks]
    
    def get_stock_detail(self, code: str) -> StockInfo:
        stock = self.db.query(Stock).filter(Stock.code == code).first()
        if not stock:
            raise Exception("Stock not found")
        return StockInfo.model_validate(stock)
    
    def get_kline(self, code: str, limit: int = 100) -> List[KlineData]:
        klines = self.db.query(KlineDaily).filter(
            KlineDaily.stock_code == code
        ).order_by(KlineDaily.date.desc()).limit(limit).all()
        return [KlineData.model_validate(k) for k in reversed(klines)]
    
    def get_indices(self) -> List[IndexQuote]:
        indices = [
            {"code": "000001", "name": "上证指数"},
            {"code": "399001", "name": "深证成指"},
            {"code": "399006", "name": "创业板指"},
            {"code": "000688", "name": "科创50"},
            {"code": "000300", "name": "沪深300"},
        ]
        
        result = []
        for idx in indices:
            try:
                quote = self.client.get_index_quote(idx["code"])
                result.append(IndexQuote(**quote))
            except Exception:
                continue
        
        return result
    
    def get_hot_sectors(self) -> List[HotSector]:
        try:
            df = self.client.get_hot_sectors()
            sectors = []
            for _, row in df.iterrows():
                sectors.append(HotSector(
                    name=row.get("板块名称", ""),
                    change_pct=row.get("涨跌幅", 0),
                ))
            return sectors
        except Exception:
            return []
```

- [ ] **Step 5: 创建 market API**

```python
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.schemas.market import StockInfo, KlineData, IndexQuote, HotSector
from app.services.market_service import MarketService

router = APIRouter()


@router.get("/stocks", response_model=List[StockInfo])
async def list_stocks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    return service.get_stock_list(skip, limit)


@router.get("/stocks/{code}", response_model=StockInfo)
async def get_stock(code: str, db: Session = Depends(get_db)):
    service = MarketService(db)
    return service.get_stock_detail(code)


@router.get("/stocks/{code}/kline", response_model=List[KlineData])
async def get_kline(code: str, limit: int = 100, db: Session = Depends(get_db)):
    service = MarketService(db)
    return service.get_kline(code, limit)


@router.get("/indices", response_model=List[IndexQuote])
async def get_indices(db: Session = Depends(get_db)):
    service = MarketService(db)
    return service.get_indices()


@router.get("/hot-sectors", response_model=List[HotSector])
async def get_hot_sectors(db: Session = Depends(get_db)):
    service = MarketService(db)
    return service.get_hot_sectors()
```

---

## Phase 6: 策略引擎

### Task 9: 策略基类与技术指标策略

**Files:**
- Create: `backend/app/strategies/base.py`
- Create: `backend/app/strategies/technical/macd.py`
- Create: `backend/app/strategies/technical/kdj.py`
- Create: `backend/app/strategies/technical/rsi.py`
- Create: `backend/app/strategies/technical/ma.py`
- Create: `backend/app/strategies/technical/bollinger.py`
- Create: `backend/app/strategies/technical/volume.py`

- [ ] **Step 1: 创建策略基类**

```python
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from decimal import Decimal
import pandas as pd


class Signal:
    def __init__(
        self,
        stock_code: str,
        signal_type: str,  # buy, sell, strong_buy, strong_sell, hold
        strength: int,  # 1-5
        price: Optional[Decimal] = None,
        date: Optional[datetime] = None,
        description: str = "",
        indicators: Optional[Dict[str, Any]] = None
    ):
        self.stock_code = stock_code
        self.signal_type = signal_type
        self.strength = strength
        self.price = price
        self.date = date or datetime.now()
        self.description = description
        self.indicators = indicators or {}


class StrategyBase(ABC):
    def __init__(self, name: str, params: Optional[Dict[str, Any]] = None):
        self.name = name
        self.params = params or {}
        self.description = ""
    
    @abstractmethod
    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        """分析数据并生成信号"""
        pass
    
    def validate_data(self, df: pd.DataFrame) -> bool:
        """验证数据是否足够"""
        required_columns = ["open", "high", "low", "close", "volume"]
        return all(col in df.columns for col in required_columns) and len(df) >= 20
```

- [ ] **Step 2: 创建 MACD 策略**

```python
import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class MACDStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("MACD金叉死叉", params)
        self.description = "基于MACD指标的金叉买入、死叉卖出策略"
        self.fast = self.params.get("fast", 12)
        self.slow = self.params.get("slow", 26)
        self.signal = self.params.get("signal", 9)
    
    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []
        
        df = df.copy()
        df["ema_fast"] = df["close"].ewm(span=self.fast, adjust=False).mean()
        df["ema_slow"] = df["close"].ewm(span=self.slow, adjust=False).mean()
        df["dif"] = df["ema_fast"] - df["ema_slow"]
        df["dea"] = df["dif"].ewm(span=self.signal, adjust=False).mean()
        df["macd"] = 2 * (df["dif"] - df["dea"])
        
        signals = []
        
        # 检查最近两天
        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]
            
            # 金叉: DIF上穿DEA
            if prev["dif"] <= prev["dea"] and curr["dif"] > curr["dea"]:
                strength = 3
                if curr["macd"] > 0:
                    strength = 4
                
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="buy",
                    strength=strength,
                    price=curr["close"],
                    description=f"MACD金叉: DIF({curr['dif']:.2f})上穿DEA({curr['dea']:.2f})",
                    indicators={"dif": curr["dif"], "dea": curr["dea"], "macd": curr["macd"]}
                ))
            
            # 死叉: DIF下穿DEA
            elif prev["dif"] >= prev["dea"] and curr["dif"] < curr["dea"]:
                strength = 3
                if curr["macd"] < 0:
                    strength = 4
                
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="sell",
                    strength=strength,
                    price=curr["close"],
                    description=f"MACD死叉: DIF({curr['dif']:.2f})下穿DEA({curr['dea']:.2f})",
                    indicators={"dif": curr["dif"], "dea": curr["dea"], "macd": curr["macd"]}
                ))
        
        return signals
```

- [ ] **Step 3: 创建 KDJ 策略**

```python
import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class KDJStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("KDJ超买超卖", params)
        self.description = "基于KDJ指标的超买超卖策略"
        self.n = self.params.get("n", 9)
        self.m1 = self.params.get("m1", 3)
        self.m2 = self.params.get("m2", 3)
    
    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []
        
        df = df.copy()
        low_list = df["low"].rolling(window=self.n, min_periods=self.n).min()
        high_list = df["high"].rolling(window=self.n, min_periods=self.n).max()
        rsv = (df["close"] - low_list) / (high_list - low_list) * 100
        
        df["k"] = rsv.ewm(com=self.m1 - 1, adjust=False).mean()
        df["d"] = df["k"].ewm(com=self.m2 - 1, adjust=False).mean()
        df["j"] = 3 * df["k"] - 2 * df["d"]
        
        signals = []
        
        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]
            
            # K<20 且 K上穿D: 超卖反弹
            if curr["k"] < 20 and prev["k"] <= prev["d"] and curr["k"] > curr["d"]:
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="buy",
                    strength=4,
                    price=curr["close"],
                    description=f"KDJ超卖反弹: K({curr['k']:.1f})<20 且上穿D({curr['d']:.1f})",
                    indicators={"k": curr["k"], "d": curr["d"], "j": curr["j"]}
                ))
            
            # K>80 且 K下穿D: 超买回落
            elif curr["k"] > 80 and prev["k"] >= prev["d"] and curr["k"] < curr["d"]:
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="sell",
                    strength=4,
                    price=curr["close"],
                    description=f"KDJ超买回落: K({curr['k']:.1f})>80 且下穿D({curr['d']:.1f})",
                    indicators={"k": curr["k"], "d": curr["d"], "j": curr["j"]}
                ))
        
        return signals
```

- [ ] **Step 4: 创建 RSI 策略**

```python
import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class RSIStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("RSI强弱反转", params)
        self.description = "基于RSI指标的强弱反转策略"
        self.period = self.params.get("period", 14)
        self.overbought = self.params.get("overbought", 70)
        self.oversold = self.params.get("oversold", 30)
    
    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []
        
        df = df.copy()
        delta = df["close"].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=self.period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=self.period).mean()
        rs = gain / loss
        df["rsi"] = 100 - (100 / (1 + rs))
        
        signals = []
        
        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]
            
            # RSI<30 回升: 超卖买入
            if prev["rsi"] < self.oversold and curr["rsi"] > prev["rsi"]:
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="buy",
                    strength=3,
                    price=curr["close"],
                    description=f"RSI超卖回升: RSI({curr['rsi']:.1f})<{self.oversold}后回升",
                    indicators={"rsi": curr["rsi"]}
                ))
            
            # RSI>70 回落: 超买卖出
            elif prev["rsi"] > self.overbought and curr["rsi"] < prev["rsi"]:
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="sell",
                    strength=3,
                    price=curr["close"],
                    description=f"RSI超买回落: RSI({curr['rsi']:.1f})>{self.overbought}后回落",
                    indicators={"rsi": curr["rsi"]}
                ))
        
        return signals
```

- [ ] **Step 5: 创建均线策略**

```python
import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class MAStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("均线多头排列", params)
        self.description = "基于均线系统的多头排列/空头排列策略"
        self.short_period = self.params.get("short_period", 5)
        self.medium_period = self.params.get("medium_period", 20)
        self.long_period = self.params.get("long_period", 60)
    
    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []
        
        df = df.copy()
        df["ma_short"] = df["close"].rolling(window=self.short_period).mean()
        df["ma_medium"] = df["close"].rolling(window=self.medium_period).mean()
        df["ma_long"] = df["close"].rolling(window=self.long_period).mean()
        
        signals = []
        
        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]
            
            # 金叉: 短期上穿长期
            if (prev["ma_short"] <= prev["ma_long"] and 
                curr["ma_short"] > curr["ma_long"] and
                curr["ma_short"] > curr["ma_medium"] > curr["ma_long"]):
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="buy",
                    strength=4,
                    price=curr["close"],
                    description=f"均线多头排列: MA{self.short_period}上穿MA{self.long_period}",
                    indicators={
                        f"ma{self.short_period}": curr["ma_short"],
                        f"ma{self.medium_period}": curr["ma_medium"],
                        f"ma{self.long_period}": curr["ma_long"]
                    }
                ))
            
            # 死叉: 短期下穿长期
            elif (prev["ma_short"] >= prev["ma_long"] and 
                  curr["ma_short"] < curr["ma_long"] and
                  curr["ma_short"] < curr["ma_medium"] < curr["ma_long"]):
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="sell",
                    strength=4,
                    price=curr["close"],
                    description=f"均线空头排列: MA{self.short_period}下穿MA{self.long_period}",
                    indicators={
                        f"ma{self.short_period}": curr["ma_short"],
                        f"ma{self.medium_period}": curr["ma_medium"],
                        f"ma{self.long_period}": curr["ma_long"]
                    }
                ))
        
        return signals
```

- [ ] **Step 6: 创建布林带策略**

```python
import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class BollingerStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("布林带突破", params)
        self.description = "基于布林带的价格突破策略"
        self.period = self.params.get("period", 20)
        self.std_dev = self.params.get("std_dev", 2)
    
    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []
        
        df = df.copy()
        df["ma"] = df["close"].rolling(window=self.period).mean()
        df["std"] = df["close"].rolling(window=self.period).std()
        df["upper"] = df["ma"] + (df["std"] * self.std_dev)
        df["lower"] = df["ma"] - (df["std"] * self.std_dev)
        
        signals = []
        
        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]
            
            # 触及下轨反弹
            if prev["close"] <= prev["lower"] and curr["close"] > curr["lower"]:
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="buy",
                    strength=3,
                    price=curr["close"],
                    description=f"布林带下轨反弹: 价格触及下轨后回升",
                    indicators={"upper": curr["upper"], "ma": curr["ma"], "lower": curr["lower"]}
                ))
            
            # 触及上轨回落
            elif prev["close"] >= prev["upper"] and curr["close"] < curr["upper"]:
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="sell",
                    strength=3,
                    price=curr["close"],
                    description=f"布林带上轨回落: 价格触及上轨后回落",
                    indicators={"upper": curr["upper"], "ma": curr["ma"], "lower": curr["lower"]}
                ))
        
        return signals
```

- [ ] **Step 7: 创建量价策略**

```python
import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class VolumeStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("量价齐升", params)
        self.description = "基于成交量配合的价格突破策略"
        self.volume_ma_period = self.params.get("volume_ma_period", 20)
        self.volume_ratio = self.params.get("volume_ratio", 1.5)
    
    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []
        
        df = df.copy()
        df["volume_ma"] = df["volume"].rolling(window=self.volume_ma_period).mean()
        df["price_change"] = df["close"].pct_change()
        
        signals = []
        
        if len(df) >= 2:
            curr = df.iloc[-1]
            
            # 放量上涨
            if (curr["volume"] > curr["volume_ma"] * self.volume_ratio and
                curr["price_change"] > 0.02):
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="buy",
                    strength=3,
                    price=curr["close"],
                    description=f"放量上涨: 成交量放大{curr['volume']/curr['volume_ma']:.1f}倍, 涨幅{curr['price_change']*100:.1f}%",
                    indicators={"volume": curr["volume"], "volume_ma": curr["volume_ma"], "change": curr["price_change"]}
                ))
            
            # 缩量滞涨或放量下跌
            elif (curr["volume"] > curr["volume_ma"] * self.volume_ratio and
                  curr["price_change"] < -0.02):
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="sell",
                    strength=3,
                    price=curr["close"],
                    description=f"放量下跌: 成交量放大{curr['volume']/curr['volume_ma']:.1f}倍, 跌幅{curr['price_change']*100:.1f}%",
                    indicators={"volume": curr["volume"], "volume_ma": curr["volume_ma"], "change": curr["price_change"]}
                ))
        
        return signals
```

---

### Task 10: 策略注册与信号服务

**Files:**
- Create: `backend/app/strategies/__init__.py`
- Create: `backend/app/services/signal_service.py`
- Create: `backend/app/api/v1/signals.py`
- Create: `backend/app/tasks/signal_tasks.py`

- [ ] **Step 1: 创建策略注册表**

```python
from app.strategies.technical.macd import MACDStrategy
from app.strategies.technical.kdj import KDJStrategy
from app.strategies.technical.rsi import RSIStrategy
from app.strategies.technical.ma import MAStrategy
from app.strategies.technical.bollinger import BollingerStrategy
from app.strategies.technical.volume import VolumeStrategy

STRATEGY_REGISTRY = {
    "macd": MACDStrategy,
    "kdj": KDJStrategy,
    "rsi": RSIStrategy,
    "ma": MAStrategy,
    "bollinger": BollingerStrategy,
    "volume": VolumeStrategy,
}


def get_strategy(strategy_type: str, params: dict = None):
    if strategy_type not in STRATEGY_REGISTRY:
        raise ValueError(f"Unknown strategy type: {strategy_type}")
    return STRATEGY_REGISTRY[strategy_type](params)


def list_strategies():
    return [
        {
            "type": key,
            "name": strategy_class("", {}).name if hasattr(strategy_class, "__name__") else key,
            "description": getattr(strategy_class("", {}), "description", "")
        }
        for key, strategy_class in STRATEGY_REGISTRY.items()
    ]
```

- [ ] **Step 2: 创建 signal_service.py**

```python
from typing import List
from sqlalchemy.orm import Session
from app.models.signal import StrategySignal
from app.models.kline import KlineDaily
from app.models.strategy import StrategyConfig
from app.strategies import get_strategy
from app.schemas.signal import SignalCreate, SignalResponse
import pandas as pd


class SignalService:
    def __init__(self, db: Session):
        self.db = db
    
    def scan_signals(self, stock_code: str, strategy_type: str = None) -> List[StrategySignal]:
        """扫描指定股票的信号"""
        # 获取K线数据
        klines = self.db.query(KlineDaily).filter(
            KlineDaily.stock_code == stock_code
        ).order_by(KlineDaily.date.asc()).all()
        
        if len(klines) < 20:
            return []
        
        # 转换为DataFrame
        df = pd.DataFrame([{
            "date": k.date,
            "open": float(k.open),
            "high": float(k.high),
            "low": float(k.low),
            "close": float(k.close),
            "volume": k.volume,
            "amount": float(k.amount),
            "stock_code": stock_code,
        } for k in klines])
        
        signals = []
        
        # 运行所有策略
        from app.strategies import STRATEGY_REGISTRY
        for stype, strategy_class in STRATEGY_REGISTRY.items():
            if strategy_type and stype != strategy_type:
                continue
            
            strategy = strategy_class()
            strategy_signals = strategy.analyze(df)
            
            for sig in strategy_signals:
                db_signal = StrategySignal(
                    strategy_id=None,  # 系统策略
                    stock_code=sig.stock_code,
                    signal_type=sig.signal_type,
                    signal_strength=sig.strength,
                    price=sig.price,
                    date=sig.date,
                    description=sig.description,
                )
                self.db.add(db_signal)
                signals.append(db_signal)
        
        self.db.commit()
        return signals
    
    def get_signals(self, stock_code: str = None, signal_type: str = None, limit: int = 100) -> List[StrategySignal]:
        query = self.db.query(StrategySignal)
        
        if stock_code:
            query = query.filter(StrategySignal.stock_code == stock_code)
        if signal_type:
            query = query.filter(StrategySignal.signal_type == signal_type)
        
        return query.order_by(StrategySignal.created_at.desc()).limit(limit).all()
    
    def get_signal_stats(self) -> dict:
        """获取信号统计"""
        total = self.db.query(StrategySignal).count()
        buy_count = self.db.query(StrategySignal).filter(StrategySignal.signal_type.in_(["buy", "strong_buy"])).count()
        sell_count = self.db.query(StrategySignal).filter(StrategySignal.signal_type.in_(["sell", "strong_sell"])).count()
        
        return {
            "total": total,
            "buy_count": buy_count,
            "sell_count": sell_count,
            "buy_ratio": buy_count / total * 100 if total > 0 else 0,
        }
```

- [ ] **Step 3: 创建 signals API**

```python
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.schemas.signal import SignalResponse, SignalScanRequest
from app.services.signal_service import SignalService

router = APIRouter()


@router.get("", response_model=List[SignalResponse])
async def list_signals(
    stock_code: str = None,
    signal_type: str = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    service = SignalService(db)
    return service.get_signals(stock_code, signal_type, limit)


@router.post("/scan")
async def scan_signals(
    request: SignalScanRequest,
    db: Session = Depends(get_db)
):
    service = SignalService(db)
    signals = service.scan_signals(request.stock_code, request.strategy_type)
    return {"count": len(signals), "signals": signals}


@router.get("/stats")
async def get_signal_stats(db: Session = Depends(get_db)):
    service = SignalService(db)
    return service.get_signal_stats()
```

---

## Phase 7: 前端玻璃组件

### Task 11: 玻璃组件库

**Files:**
- Create: `frontend/src/components/glass/GlassCard.tsx`
- Create: `frontend/src/components/glass/GlassButton.tsx`
- Create: `frontend/src/components/glass/GlassInput.tsx`
- Create: `frontend/src/components/glass/GlassTabs.tsx`
- Create: `frontend/src/components/glass/GlassTable.tsx`

- [ ] **Step 1: 创建 GlassCard**

```tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: 'up' | 'down' | 'accent' | null
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = true,
  glow = null,
}) => {
  const glowClasses = {
    up: 'shadow-glow-up',
    down: 'shadow-glow-down',
    accent: 'shadow-glow-accent',
  }

  return (
    <div
      className={cn(
        'glass-card',
        hover && 'hover:translate-y-[-2px]',
        glow && glowClasses[glow],
        className
      )}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: 创建 GlassButton**

```tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface GlassButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className,
  onClick,
  disabled,
}) => {
  const variants = {
    primary: 'bg-accent/20 border-accent/30 text-accent hover:bg-accent/30 hover:border-accent/50',
    secondary: 'bg-glass-bg border-glass-border text-text-secondary hover:bg-glass-bg-hover hover:border-glass-border-highlight hover:text-text-primary',
    danger: 'bg-down/10 border-down/25 text-down hover:bg-down/20 hover:border-down/40',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(
        'rounded-glass-sm backdrop-blur-md transition-all duration-200 border font-medium',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 3: 创建 GlassInput**

```tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface GlassInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: string
  className?: string
}

export const GlassInput: React.FC<GlassInputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full bg-black/20 backdrop-blur-md border border-glass-border rounded-glass-sm',
        'px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary',
        'focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10',
        'transition-all duration-200',
        className
      )}
    />
  )
}
```

- [ ] **Step 4: 创建 Dashboard 页面**

```tsx
import React from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { TrendingUp, TrendingDown, Activity, Bell } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Hero Card */}
      <GlassCard className="p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-up/5" />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-text-tertiary text-sm mb-2">总资产</p>
              <h1 className="text-hero font-mono text-text-primary">
                ¥1,234,567<span className="text-2xl opacity-60">.89</span>
              </h1>
            </div>
            <div className="text-right">
              <p className="text-text-tertiary text-sm mb-2">当日盈亏</p>
              <div className="flex items-center gap-2 text-up">
                <TrendingUp className="w-5 h-5" />
                <span className="text-2xl font-mono">+¥12,345</span>
                <span className="text-sm">(+1.02%)</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Index Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-text-tertiary text-sm">上证指数</span>
            <Activity className="w-4 h-4 text-text-tertiary" />
          </div>
          <div className="text-2xl font-mono text-text-primary mb-2">3,234.56</div>
          <div className="flex items-center gap-1 text-up">
            <TrendingUp className="w-4 h-4" />
            <span>+0.85%</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-text-tertiary text-sm">深证成指</span>
            <Activity className="w-4 h-4 text-text-tertiary" />
          </div>
          <div className="text-2xl font-mono text-text-primary mb-2">10,234.56</div>
          <div className="flex items-center gap-1 text-up">
            <TrendingUp className="w-4 h-4" />
            <span>+1.12%</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-text-tertiary text-sm">创业板指</span>
            <Activity className="w-4 h-4 text-text-tertiary" />
          </div>
          <div className="text-2xl font-mono text-text-primary mb-2">2,123.45</div>
          <div className="flex items-center gap-1 text-down">
            <TrendingDown className="w-4 h-4" />
            <span>-0.23%</span>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <GlassButton variant="primary" size="md">
          <Bell className="w-4 h-4 mr-2" />
          查看信号
        </GlassButton>
        <GlassButton variant="secondary" size="md">
          持仓管理
        </GlassButton>
        <GlassButton variant="secondary" size="md">
          策略回测
        </GlassButton>
      </div>
    </div>
  )
}
```

---

## Phase 8: 部署

### Task 12: Docker 部署

- [ ] **Step 1: 构建并启动所有服务**

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 执行数据库迁移
docker-compose exec backend alembic upgrade head

# 查看日志
docker-compose logs -f
```

- [ ] **Step 2: 验证服务**

```bash
# 健康检查
curl http://localhost:8000/health

# 测试注册
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","nickname":"Test"}'

# 前端访问
open http://localhost:5173
```

---

## 测试策略

### 单元测试
- 每个 Service 类需要对应的测试文件
- 使用 pytest + pytest-asyncio
- 数据库测试使用 SQLite 内存数据库

### 集成测试
- API 端点测试
- 策略回测验证
- 数据同步测试

### 前端测试
- 组件渲染测试
- 用户交互测试

---

## 后续迭代

1. **Phase 2**: 新闻监控 + AI分析 + 推送系统
2. **Phase 3**: 高级策略（多因子、趋势跟踪、事件驱动）
3. **Phase 4**: 回测系统完善 + 报表中心
4. **Phase 5**: 性能优化 + 多用户支持

---

*实施计划结束*

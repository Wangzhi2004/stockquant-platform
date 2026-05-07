from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import get_settings
from app.api.v1 import auth, users, market, portfolio, signals, strategies, backtest, news, push, ws
import traceback

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="智能股票量化交易平台 API",
    version="1.0.0",
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(portfolio.router, prefix="/api/v1/portfolios", tags=["portfolio"])
app.include_router(market.router, prefix="/api/v1/market", tags=["market"])
app.include_router(news.router, prefix="/api/v1/news", tags=["news"])
app.include_router(signals.router, prefix="/api/v1/signals", tags=["signals"])
app.include_router(strategies.router, prefix="/api/v1/strategies", tags=["strategies"])
app.include_router(backtest.router, prefix="/api/v1/backtest", tags=["backtest"])
app.include_router(push.router, prefix="/api/v1/push", tags=["push"])
app.include_router(ws.router, tags=["websocket"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}

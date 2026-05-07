from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "StockQuant Platform"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "sqlite:///./stockquant.db"
    
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

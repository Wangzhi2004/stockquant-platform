import logging
import sys
from typing import Optional

from app.core.config import get_settings


LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

_logger_cache: dict = {}


def setup_logging(level: Optional[str] = None) -> logging.Logger:
    settings = get_settings()
    log_level = level or ("DEBUG" if settings.DEBUG else "INFO")
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    if root_logger.handlers:
        return root_logger

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    console_formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)

    logging.getLogger("uvicorn").setLevel(numeric_level)
    logging.getLogger("uvicorn.access").setLevel(numeric_level)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.WARNING if numeric_level > logging.DEBUG else logging.DEBUG
    )

    return root_logger


def get_logger(name: str) -> logging.Logger:
    if name not in _logger_cache:
        logger = logging.getLogger(name)
        _logger_cache[name] = logger
    return _logger_cache[name]

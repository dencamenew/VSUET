#!/usr/bin/env python3
"""
VSUET FastAPI Application Runner
"""
import uvicorn
from app.config.settings import settings

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level="info"
    )

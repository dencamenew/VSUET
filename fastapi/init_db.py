#!/usr/bin/env python3
"""
Database initialization script for VSUET FastAPI
"""
from sqlalchemy import create_engine
from app.config.settings import settings
from app.models.database import Base

def init_database():
    """Initialize database tables"""
    engine = create_engine(settings.database_url)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_database()




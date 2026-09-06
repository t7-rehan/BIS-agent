"""Database engine, session management, and lifecycle utilities."""

import os
from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy declarative models."""
    pass


def get_engine(database_url: str = settings.DATABASE_URL) -> Engine:
    """Create and return a SQLAlchemy Engine configured for SQLite or other DBMS."""
    connect_args = {}
    if database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False

        # Ensure directory for sqlite file exists if it is a relative/absolute file path
        # Example: sqlite:///./data/bis.db or sqlite:///data/bis.db
        db_path = database_url.replace("sqlite:///", "")
        if db_path and not db_path.startswith(":memory:"):
            db_dir = Path(db_path).parent
            if db_dir and not db_dir.exists():
                db_dir.mkdir(parents=True, exist_ok=True)

    engine = create_engine(database_url, connect_args=connect_args)

    # Enforce SQLite foreign key constraints
    if database_url.startswith("sqlite"):
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON;")
            cursor.close()

    return engine


engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a safe transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(target_engine: Engine = engine) -> None:
    """Create all registered database tables."""
    Base.metadata.create_all(bind=target_engine)


def reset_db(target_engine: Engine = engine) -> None:
    """Drop and recreate all registered database tables."""
    Base.metadata.drop_all(bind=target_engine)
    Base.metadata.create_all(bind=target_engine)

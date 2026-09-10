"""
Naive-UTC timestamp helper.

`datetime.utcnow()` is deprecated as of Python 3.12. The model columns are
declared timezone-aware, but the SQLite driver stores naive wall-clock values,
so the whole backend standardises on *naive UTC* to keep round-trips stable.
This helper is the single place that decision lives.
"""

from datetime import datetime, timezone


def utcnow() -> datetime:
    """Current UTC time as a naive datetime (drop-in replacement for utcnow())."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

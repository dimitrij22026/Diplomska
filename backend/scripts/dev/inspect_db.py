"""Quick SQLite schema inspection helper.

Execute from backend directory:
    python scripts/dev/inspect_db.py
"""

import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "finance_app.db")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print("Tables:", cursor.fetchall())

cursor.execute("PRAGMA table_info(users);")
print("Users table columns:", cursor.fetchall())

conn.close()

"""Legacy SQLite helper. Prefer Alembic for schema migrations.

Execute from backend directory:
    python scripts/dev/run_migration.py
"""

import os
import sqlite3
import uuid

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "finance_app.db")

print(f"Database path: {DB_PATH}")

if not os.path.exists(DB_PATH):
    print("Database file not found!")
    raise SystemExit(1)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(advice_entries)")
columns = [col[1] for col in cursor.fetchall()]
print(f"Current columns: {columns}")

if "conversation_id" not in columns:
    print("Adding conversation_id column...")
    cursor.execute("ALTER TABLE advice_entries ADD COLUMN conversation_id VARCHAR(36)")

    cursor.execute("SELECT id FROM advice_entries")
    rows = cursor.fetchall()
    for row in rows:
        cursor.execute(
            "UPDATE advice_entries SET conversation_id = ? WHERE id = ?",
            (str(uuid.uuid4()), row[0]),
        )

    conn.commit()
    print(f"Column added and {len(rows)} existing entries updated with unique conversation IDs")
else:
    print("conversation_id column already exists")

cursor.execute("PRAGMA table_info(advice_entries)")
columns = [col[1] for col in cursor.fetchall()]
print(f"Final columns: {columns}")

conn.close()
print("Done!")

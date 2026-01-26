"""
Run this script to add the conversation_id column to the database.
Execute from the backend directory: python run_migration.py
"""
import sqlite3
import uuid
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), "finance_app.db")

print(f"Database path: {db_path}")

if not os.path.exists(db_path):
    print("Database file not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if column exists
cursor.execute("PRAGMA table_info(advice_entries)")
columns = [col[1] for col in cursor.fetchall()]
print(f"Current columns: {columns}")

if "conversation_id" not in columns:
    print("Adding conversation_id column...")
    cursor.execute(
        "ALTER TABLE advice_entries ADD COLUMN conversation_id VARCHAR(36)")

    # Update existing entries with unique UUIDs
    cursor.execute("SELECT id FROM advice_entries")
    rows = cursor.fetchall()
    for row in rows:
        cursor.execute(
            "UPDATE advice_entries SET conversation_id = ? WHERE id = ?",
            (str(uuid.uuid4()), row[0])
        )

    conn.commit()
    print(
        f"Column added and {len(rows)} existing entries updated with unique conversation IDs")
else:
    print("conversation_id column already exists")

# Verify
cursor.execute("PRAGMA table_info(advice_entries)")
columns = [col[1] for col in cursor.fetchall()]
print(f"Final columns: {columns}")

conn.close()
print("Done!")

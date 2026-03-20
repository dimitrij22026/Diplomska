"""Legacy SQLite helper. Prefer Alembic for schema migrations.

Execute from backend directory:
    python scripts/dev/add_missing_columns.py
"""

import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "finance_app.db")


def add_column_if_not_exists(cursor, table, column, column_type, default=None):
    """Add a column to a table if it doesn't exist."""
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [row[1] for row in cursor.fetchall()]

    if column not in columns:
        default_clause = f" DEFAULT {default}" if default is not None else ""
        sql = f"ALTER TABLE {table} ADD COLUMN {column} {column_type}{default_clause}"
        print(f"Adding column: {column} to {table}")
        cursor.execute(sql)
        return True

    print(f"Column {column} already exists in {table}")
    return False


def main():
    print(f"Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("\n--- Current users table schema ---")
    cursor.execute("PRAGMA table_info(users)")
    for row in cursor.fetchall():
        print(f"  {row[1]}: {row[2]}")

    print("\n--- Adding missing columns ---")
    add_column_if_not_exists(cursor, "users", "is_email_verified", "BOOLEAN", "0")
    add_column_if_not_exists(cursor, "users", "profile_picture", "VARCHAR(500)", "NULL")

    conn.commit()

    print("\n--- Updated users table schema ---")
    cursor.execute("PRAGMA table_info(users)")
    for row in cursor.fetchall():
        print(f"  {row[1]}: {row[2]}")

    print("\n--- Current users ---")
    cursor.execute("SELECT id, email, full_name, is_email_verified FROM users")
    for row in cursor.fetchall():
        print(f"  ID: {row[0]}, Email: {row[1]}, Name: {row[2]}, Verified: {row[3]}")

    conn.close()
    print("\nDone!")


if __name__ == "__main__":
    main()

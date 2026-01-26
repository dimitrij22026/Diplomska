import sqlite3


conn = sqlite3.connect("./finance_app.db")
cursor = conn.cursor()


# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print("Tables:", cursor.fetchall())


# Inspect columns in users table
cursor.execute("PRAGMA table_info(users);")
print("Users table columns:", cursor.fetchall())


conn.close()

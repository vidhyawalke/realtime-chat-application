import sqlite3
from typing import List, Dict, Any
from server.config import config

class DatabaseManager:
    """Handles SQLite persistence for chat messages and channels."""
    def __init__(self, db_path: str = config.DB_FILE):
        self.db_path = db_path
        self.init_db()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    channel TEXT NOT NULL,
                    username TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp TEXT NOT NULL
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel)")
            conn.commit()

    def save_message(self, channel: str, username: str, content: str, timestamp: str) -> None:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO messages (channel, username, content, timestamp) VALUES (?, ?, ?, ?)",
                (channel, username, content, timestamp)
            )
            conn.commit()

    def get_recent_messages(self, channel: str, limit: int = config.MAX_HISTORY_PER_CHANNEL) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT channel, username, content, timestamp FROM messages WHERE channel = ? ORDER BY id DESC LIMIT ?",
                (channel, limit)
            )
            rows = cursor.fetchall()
            return [
                {"channel": r[0], "username": r[1], "content": r[2], "timestamp": r[3]}
                for r in reversed(rows)
            ]

db_manager = DatabaseManager()

import asyncio
import json
import sqlite3
from datetime import datetime
from typing import Dict, Set

try:
    import websockets
    WEBSOCKETS_INSTALLED = True
except ImportError:
    WEBSOCKETS_INSTALLED = False

PORT = 8080
DB_FILE = "chat_history.db"

# -------------------------------------------------------------
# Database Setup for Message Persistence (SQLite)
# -------------------------------------------------------------
def init_db():
    conn = sqlite3.connect(DB_FILE)
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
    conn.commit()
    conn.close()

def save_message(channel: str, username: str, content: str, timestamp: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (channel, username, content, timestamp) VALUES (?, ?, ?, ?)",
        (channel, username, content, timestamp)
    )
    conn.commit()
    conn.close()

def get_recent_messages(channel: str, limit: int = 30):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT channel, username, content, timestamp FROM messages WHERE channel = ? ORDER BY id DESC LIMIT ?",
        (channel, limit)
    )
    rows = cursor.fetchall()
    conn.close()
    return [
        {"channel": r[0], "username": r[1], "content": r[2], "timestamp": r[3]}
        for r in reversed(rows)
    ]

# -------------------------------------------------------------
# WebSocket Hub & Room Manager
# -------------------------------------------------------------
# Channel -> Set of active websocket connections
channel_subscriptions: Dict[str, Set] = {
    "general": set(),
    "engineering": set(),
    "random": set()
}

# Connection -> Username mapping
connected_users: Dict[Any, str] = {}

async def broadcast_to_channel(channel: str, payload: dict):
    """Sends JSON message to all subscribers of a specific channel."""
    subscribers = list(channel_subscriptions.get(channel, set()))
    message_str = json.dumps(payload)
    for ws in subscribers:
        try:
            await ws.send(message_str)
        except Exception:
            pass

async def broadcast_user_list():
    """Broadcasts current online users across all active clients."""
    all_users = list(set(connected_users.values()))
    payload = {
        "type": "USER_PRESENCE",
        "users": all_users,
        "count": len(all_users)
    }
    message_str = json.dumps(payload)
    for ws in list(connected_users.keys()):
        try:
            await ws.send(message_str)
        except Exception:
            pass

async def handle_connection(websocket, path=None):
    current_channel = "general"
    username = f"User_{id(websocket) % 1000}"
    connected_users[websocket] = username
    channel_subscriptions[current_channel].add(websocket)

    print(f"[CONNECTED] {username} joined channel #{current_channel}")

    # Send message history
    history = get_recent_messages(current_channel)
    await websocket.send(json.dumps({
        "type": "HISTORY",
        "channel": current_channel,
        "messages": history,
        "assigned_user": username
    }))

    await broadcast_user_list()
    await broadcast_to_channel(current_channel, {
        "type": "SYSTEM",
        "channel": current_channel,
        "content": f"{username} joined #{current_channel}",
        "timestamp": datetime.now().strftime("%H:%M")
    })

    try:
        async for raw_message in websocket:
            data = json.loads(raw_message)
            msg_type = data.get("type")

            if msg_type == "SET_USERNAME":
                old_name = connected_users.get(websocket, username)
                new_name = data.get("username", old_name).strip()[:20]
                connected_users[websocket] = new_name
                username = new_name
                await broadcast_user_list()

            elif msg_type == "SWITCH_CHANNEL":
                new_channel = data.get("channel", "general")
                # Remove from old channel
                if current_channel in channel_subscriptions and websocket in channel_subscriptions[current_channel]:
                    channel_subscriptions[current_channel].remove(websocket)
                
                # Add to new channel
                if new_channel not in channel_subscriptions:
                    channel_subscriptions[new_channel] = set()
                channel_subscriptions[new_channel].add(websocket)
                current_channel = new_channel

                # Send history of new channel
                history = get_recent_messages(current_channel)
                await websocket.send(json.dumps({
                    "type": "HISTORY",
                    "channel": current_channel,
                    "messages": history
                }))

            elif msg_type == "CHAT_MESSAGE":
                content = data.get("content", "").strip()
                if content:
                    ts = datetime.now().strftime("%H:%M")
                    save_message(current_channel, username, content, ts)
                    await broadcast_to_channel(current_channel, {
                        "type": "MESSAGE",
                        "channel": current_channel,
                        "username": username,
                        "content": content,
                        "timestamp": ts
                    })

            elif msg_type == "TYPING":
                await broadcast_to_channel(current_channel, {
                    "type": "TYPING_STATUS",
                    "channel": current_channel,
                    "username": username,
                    "is_typing": data.get("is_typing", False)
                })

    except Exception as e:
        print(f"[DISCONNECT] {username}: {e}")
    finally:
        # Cleanup
        if websocket in connected_users:
            del connected_users[websocket]
        if current_channel in channel_subscriptions and websocket in channel_subscriptions[current_channel]:
            channel_subscriptions[current_channel].remove(websocket)
        await broadcast_user_list()
        await broadcast_to_channel(current_channel, {
            "type": "SYSTEM",
            "channel": current_channel,
            "content": f"{username} left the channel",
            "timestamp": datetime.now().strftime("%H:%M")
        })

async def main():
    init_db()
    if not WEBSOCKETS_INSTALLED:
        print("="*60)
        print("⚠️ 'websockets' library is required to run server.")
        print("Please install: pip install websockets")
        print("="*60)
        return

    print("="*60)
    print(f"🚀 PulseChat WebSocket Server running on ws://localhost:{PORT}")
    print(f"📁 SQLite database: {DB_FILE}")
    print("="*60)
    async with websockets.serve(handle_connection, "0.0.0.0", PORT):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer terminated.")

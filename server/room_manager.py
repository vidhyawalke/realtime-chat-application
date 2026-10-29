import json
from typing import Dict, Set, Any
from server.config import config

class RoomManager:
    """Manages active WebSocket connections, channel subscriptions, and presence."""
    def __init__(self):
        self.channel_subscriptions: Dict[str, Set[Any]] = {
            channel: set() for channel in config.DEFAULT_CHANNELS
        }
        self.connected_users: Dict[Any, str] = {}

    def register_client(self, websocket: Any, username: str, default_channel: str = "general") -> None:
        self.connected_users[websocket] = username
        if default_channel not in self.channel_subscriptions:
            self.channel_subscriptions[default_channel] = set()
        self.channel_subscriptions[default_channel].add(websocket)

    def unregister_client(self, websocket: Any, current_channel: str) -> str:
        username = self.connected_users.pop(websocket, "Unknown User")
        if current_channel in self.channel_subscriptions and websocket in self.channel_subscriptions[current_channel]:
            self.channel_subscriptions[current_channel].remove(websocket)
        return username

    def switch_channel(self, websocket: Any, old_channel: str, new_channel: str) -> None:
        if old_channel in self.channel_subscriptions and websocket in self.channel_subscriptions[old_channel]:
            self.channel_subscriptions[old_channel].remove(websocket)
        if new_channel not in self.channel_subscriptions:
            self.channel_subscriptions[new_channel] = set()
        self.channel_subscriptions[new_channel].add(websocket)

    def set_username(self, websocket: Any, new_name: str) -> None:
        self.connected_users[websocket] = new_name.strip()[:25]

    async def broadcast_to_channel(self, channel: str, payload: dict) -> None:
        subscribers = list(self.channel_subscriptions.get(channel, set()))
        message_str = json.dumps(payload)
        for ws in subscribers:
            try:
                await ws.send(message_str)
            except Exception:
                pass

    async def broadcast_presence(self) -> None:
        all_users = list(set(self.connected_users.values()))
        payload = {
            "type": "USER_PRESENCE",
            "users": all_users,
            "count": len(all_users)
        }
        message_str = json.dumps(payload)
        for ws in list(self.connected_users.keys()):
            try:
                await ws.send(message_str)
            except Exception:
                pass

room_manager = RoomManager()

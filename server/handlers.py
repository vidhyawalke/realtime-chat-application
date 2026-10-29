import json
from datetime import datetime
from server.room_manager import room_manager
from server.database import db_manager

async def handle_client_session(websocket, path=None):
    current_channel = "general"
    username = f"Developer_{id(websocket) % 1000}"
    room_manager.register_client(websocket, username, current_channel)

    print(f"[WS Connect] {username} entered #{current_channel}")

    # Send historical messages
    history = db_manager.get_recent_messages(current_channel)
    await websocket.send(json.dumps({
        "type": "HISTORY",
        "channel": current_channel,
        "messages": history,
        "assigned_user": username
    }))

    await room_manager.broadcast_presence()
    await room_manager.broadcast_to_channel(current_channel, {
        "type": "SYSTEM",
        "channel": current_channel,
        "content": f"{username} entered #{current_channel}",
        "timestamp": datetime.now().strftime("%H:%M")
    })

    try:
        async for raw_msg in websocket:
            event = json.loads(raw_msg)
            event_type = event.get("type")

            if event_type == "SET_USERNAME":
                new_name = event.get("username", username)
                room_manager.set_username(websocket, new_name)
                username = new_name
                await room_manager.broadcast_presence()

            elif event_type == "SWITCH_CHANNEL":
                new_channel = event.get("channel", "general")
                room_manager.switch_channel(websocket, current_channel, new_channel)
                current_channel = new_channel

                # Deliver history of new channel
                history = db_manager.get_recent_messages(current_channel)
                await websocket.send(json.dumps({
                    "type": "HISTORY",
                    "channel": current_channel,
                    "messages": history
                }))

            elif event_type == "CHAT_MESSAGE":
                content = event.get("content", "").strip()
                if content:
                    ts = datetime.now().strftime("%H:%M")
                    db_manager.save_message(current_channel, username, content, ts)
                    await room_manager.broadcast_to_channel(current_channel, {
                        "type": "MESSAGE",
                        "channel": current_channel,
                        "username": username,
                        "content": content,
                        "timestamp": ts
                    })

            elif event_type == "TYPING":
                await room_manager.broadcast_to_channel(current_channel, {
                    "type": "TYPING_STATUS",
                    "channel": current_channel,
                    "username": username,
                    "is_typing": event.get("is_typing", False)
                })

    except Exception as exc:
        print(f"[WS Disconnect] {username}: {exc}")
    finally:
        room_manager.unregister_client(websocket, current_channel)
        await room_manager.broadcast_presence()
        await room_manager.broadcast_to_channel(current_channel, {
            "type": "SYSTEM",
            "channel": current_channel,
            "content": f"{username} left #{current_channel}",
            "timestamp": datetime.now().strftime("%H:%M")
        })

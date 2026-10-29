import asyncio
import websockets
from server.config import config
from server.handlers import handle_client_session
from server.database import db_manager

async def start_server():
    db_manager.init_db()
    print("="*60)
    print(f"🚀 PulseChat WebSocket Hub active on ws://{config.HOST}:{config.PORT}")
    print(f"💾 Message Store: {config.DB_FILE}")
    print("="*60)
    async with websockets.serve(handle_client_session, config.HOST, config.PORT):
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(start_server())
    except KeyboardInterrupt:
        print("\n[PulseChat] Server gracefully shut down.")

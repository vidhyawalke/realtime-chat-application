import asyncio
from server.main import start_server

if __name__ == "__main__":
    try:
        asyncio.run(start_server())
    except KeyboardInterrupt:
        print("\n[PulseChat] Exiting server.")

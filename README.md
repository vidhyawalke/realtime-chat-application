# Real-Time WebSocket Chat Application

A real-time collaborative workspace and multi-channel messaging platform built with **Python Async WebSockets** on the backend and multi-platform clients (**Web + React Native**).

## Technical Stack
- **Backend:** Python (`asyncio`, `websockets`, `sqlite3`)
- **Web Client:** HTML5, Modern Vanilla JavaScript (ES6+), Tailwind CSS
- **Mobile Component:** React Native (`<FlatList>`, `<KeyboardAvoidingView>`, `<TextInput>`)
- **Networking:** OSI Layer 4/7 TCP WebSockets protocol (`ws://`)
- **Database:** SQLite relational message persistence

## Features
- **Multi-Channel Rooms:** Seamless switching across `#general`, `#engineering`, and `#random`.
- **Live User Presence & Typing Status:** Real-time broadcast of active participants and dynamic typing notifications.
- **Message Persistence:** Chat history automatically stored in SQLite.
- **Cross-Platform Architecture:** Web client along with a clean React Native mobile component ready for Expo / Android / iOS.

## Project Structure
```
realtime-chat-application/
├── server.py                        # Python WebSocket hub & SQLite message store
├── requirements.txt                 # Dependencies
├── client/
│   └── index.html                   # Web client application UI
├── mobile_component/
│   └── ChatScreen.jsx               # React Native mobile component
└── README.md
```

## Getting Started

### 1. Run the WebSocket Server
```bash
pip install -r requirements.txt
python server.py
```
- Server listens on: `ws://localhost:8080`

### 2. Open the Web Client
Double-click `client/index.html` to open in any web browser. Open two browser windows to test real-time chatting across sessions.

### 3. Review the Mobile Component
Inspect `mobile_component/ChatScreen.jsx` to review the React Native mobile implementation.

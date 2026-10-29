/**
 * WebSocket Network Adapter
 * Handles socket lifecycle, payloads, and event callbacks.
 */
class ChatSocketAdapter {
  constructor(url, handlers) {
    this.url = url;
    this.handlers = handlers;
    this.ws = null;
    this.isConnected = false;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.handlers.onConnect) this.handlers.onConnect();
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (this.handlers.onMessage) this.handlers.onMessage(payload);
        } catch (err) {
          console.error("[ChatSocket] Parse error:", err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (this.handlers.onDisconnect) this.handlers.onDisconnect();
        setTimeout(() => this.connect(), window.ChatConfig.RECONNECT_INTERVAL_MS);
      };

      this.ws.onerror = (err) => {
        console.warn("[ChatSocket] Socket error:", err);
        this.ws.close();
      };
    } catch (e) {
      console.warn("[ChatSocket] Connection exception:", e);
      if (this.handlers.onDisconnect) this.handlers.onDisconnect();
    }
  }

  send(payload) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }
}

window.ChatSocketAdapter = ChatSocketAdapter;

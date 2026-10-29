/**
 * Main Controller
 * Coordinates network events with the UI renderer and DOM triggers.
 */
document.addEventListener('DOMContentLoaded', () => {
  const ui = new window.ChatUIRenderer();
  let currentChannel = window.ChatConfig.DEFAULT_CHANNEL;
  let myUsername = 'Dev_' + Math.floor(Math.random() * 900 + 100);
  let typingTimeout = null;

  const usernameInput = document.getElementById('usernameInput');
  const saveUsernameBtn = document.getElementById('saveUsernameBtn');
  const messageInput = document.getElementById('messageInput');
  const chatForm = document.getElementById('chatForm');

  usernameInput.value = myUsername;

  const socketAdapter = new window.ChatSocketAdapter(window.ChatConfig.WS_URL, {
    onConnect: () => {
      ui.setConnectionState(true);
      socketAdapter.send({ type: 'SET_USERNAME', username: myUsername });
    },
    onDisconnect: () => {
      ui.setConnectionState(false);
    },
    onMessage: (data) => {
      switch (data.type) {
        case 'HISTORY':
          ui.clearMessages();
          if (data.assigned_user) {
            myUsername = data.assigned_user;
            usernameInput.value = myUsername;
          }
          (data.messages || []).forEach((msg) => {
            ui.appendMessage(msg.username, msg.content, msg.timestamp, msg.username === myUsername);
          });
          break;

        case 'MESSAGE':
          ui.appendMessage(data.username, data.content, data.timestamp, data.username === myUsername);
          break;

        case 'SYSTEM':
          ui.appendSystemNotice(data.content, data.timestamp);
          break;

        case 'USER_PRESENCE':
          ui.updatePresence(data.users, data.count, myUsername);
          break;

        case 'TYPING_STATUS':
          if (data.username !== myUsername) {
            ui.setTypingIndicator(data.username, data.is_typing);
          }
          break;
      }
    }
  });

  socketAdapter.connect();

  // Channel switching
  window.switchChannel = (channelName) => {
    currentChannel = channelName;
    document.getElementById('activeChannelName').textContent = channelName;
    messageInput.placeholder = `Type message into #${channelName}...`;

    ['general', 'engineering', 'random'].forEach((ch) => {
      const btn = document.getElementById(`chan-${ch}`);
      if (btn) {
        if (ch === channelName) {
          btn.className = "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition bg-indigo-600/20 text-indigo-300 border border-indigo-500/30";
        } else {
          btn.className = "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition";
        }
      }
    });

    if (socketAdapter.isConnected) {
      socketAdapter.send({ type: 'SWITCH_CHANNEL', channel: channelName });
    } else {
      ui.clearMessages();
      ui.appendSystemNotice(`Switched to #${channelName} (Demo Active)`, new Date().toLocaleTimeString().slice(0, 5));
    }
  };

  // User rename
  saveUsernameBtn.addEventListener('click', () => {
    const newName = usernameInput.value.trim();
    if (newName) {
      myUsername = newName;
      socketAdapter.send({ type: 'SET_USERNAME', username: myUsername });
    }
  });

  // Typing emitter
  messageInput.addEventListener('input', () => {
    if (socketAdapter.isConnected) {
      socketAdapter.send({ type: 'TYPING', is_typing: true });
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socketAdapter.send({ type: 'TYPING', is_typing: false });
      }, 1400);
    }
  });

  // Form submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();
    if (!content) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (socketAdapter.isConnected) {
      socketAdapter.send({ type: 'CHAT_MESSAGE', content });
    } else {
      ui.appendMessage(myUsername, content, timestamp, true);
      setTimeout(() => {
        ui.appendMessage('DemoBot', `Received: "${content}" (running in local demo mode)`, timestamp, false);
      }, 500);
    }

    messageInput.value = '';
  });

  ui.appendSystemNotice("Welcome to PulseChat! Connect python run.py to activate multi-client socket broadcast.", "12:00");
});

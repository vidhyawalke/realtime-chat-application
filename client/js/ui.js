/**
 * UI Renderer for PulseChat
 * Manages DOM updates, scrolling, message nodes, presence lists.
 */
class ChatUIRenderer {
  constructor() {
    this.container = document.getElementById('messagesContainer');
    this.userList = document.getElementById('userList');
    this.userCount = document.getElementById('userCount');
    this.connBadge = document.getElementById('connBadge');
    this.connDot = document.getElementById('connDot');
    this.connText = document.getElementById('connText');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.typingText = document.getElementById('typingText');
    this.activeChannelName = document.getElementById('activeChannelName');
    this.messageInput = document.getElementById('messageInput');
  }

  escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  }

  setConnectionState(connected) {
    if (connected) {
      this.connBadge.className = "flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      this.connDot.className = "w-2 h-2 rounded-full bg-emerald-400";
      this.connText.textContent = "Live Socket Connected";
    } else {
      this.connBadge.className = "flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20";
      this.connDot.className = "w-2 h-2 rounded-full bg-amber-400 animate-pulse";
      this.connText.textContent = "Offline (Demo Active)";
    }
  }

  appendMessage(sender, text, timestamp, isMe) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex flex-col ${isMe ? 'items-end' : 'items-start'}`;
    msgDiv.innerHTML = `
      <div class="flex items-center gap-2 mb-1">
        <span class="text-xs font-semibold ${isMe ? 'text-indigo-400' : 'text-slate-400'}">${this.escapeHtml(sender)}</span>
        <span class="text-[10px] text-slate-500">${timestamp || 'Just now'}</span>
      </div>
      <div class="px-4 py-2.5 rounded-2xl text-sm message-bubble ${
        isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
      }">
        ${this.escapeHtml(text)}
      </div>
    `;
    this.container.appendChild(msgDiv);
    this.container.scrollTop = this.container.scrollHeight;
  }

  appendSystemNotice(text, timestamp) {
    const notice = document.createElement('div');
    notice.className = "flex justify-center my-2";
    notice.innerHTML = `
      <span class="bg-slate-800/80 text-slate-400 text-xs px-3 py-1 rounded-full border border-slate-700/50">
        <i class="fa-solid fa-circle-info mr-1 text-slate-500"></i> ${this.escapeHtml(text)} (${timestamp})
      </span>
    `;
    this.container.appendChild(notice);
    this.container.scrollTop = this.container.scrollHeight;
  }

  updatePresence(users, count, myUsername) {
    this.userCount.textContent = count || users.length;
    this.userList.innerHTML = '';
    users.forEach((u) => {
      const li = document.createElement('li');
      li.className = "flex items-center gap-2 px-2 py-1";
      const isSelf = u === myUsername;
      li.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span> ${this.escapeHtml(u)} ${isSelf ? '<span class="text-[10px] text-indigo-400 font-semibold">(You)</span>' : ''}`;
      this.userList.appendChild(li);
    });
  }

  setTypingIndicator(username, isTyping) {
    if (isTyping) {
      this.typingText.textContent = `${this.escapeHtml(username)} is typing...`;
      this.typingIndicator.classList.remove('opacity-0');
    } else {
      this.typingIndicator.classList.add('opacity-0');
    }
  }

  clearMessages() {
    this.container.innerHTML = '';
  }
}

window.ChatUIRenderer = ChatUIRenderer;

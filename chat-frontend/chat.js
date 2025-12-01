class ChatSystem {
  constructor() {
    this.baseURL = 'http://localhost:5001/chat';
    this.token = localStorage.getItem('token');
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.selectedUser = null;
    this.pollingInterval = null;
    this.typingTimeout = null;
    this.socket = null;
    
    this.init();
  }

  init() {
    this.createChatUI();
    this.setupEventListeners();
    this.connectSocket();
    
    if (this.token) {
      this.loadUsers();
      this.startPolling();
    }
  }

  createChatUI() {
    const chatHTML = `
      <div class="chat-container" id="chatContainer">
        <div class="chat-header">
          <h5><i class="bi bi-chat-dots"></i> Chat</h5>
          <button class="chat-close" onclick="chatSystem.closeChat()">×</button>
        </div>
        
        <div class="chat-body">
          <!-- User Sidebar -->
          <div class="user-sidebar" id="userSidebar">
            <ul class="user-list" id="userList"></ul>
          </div>
          
          <!-- Chat Window -->
          <div class="chat-window" id="chatWindow">
            <div class="chat-window-header">
              <button class="back-button" onclick="chatSystem.showUserList()">←</button>
              <div class="user-avatar" id="chatUserAvatar"></div>
              <h6 id="chatUserName"></h6>
            </div>
            
            <div class="messages-container" id="messagesContainer"></div>
            
            <div class="typing-indicator" id="typingIndicator">
              <span id="typingUser"></span> is typing...
            </div>
            
            <div class="chat-input-container">
              <div class="chat-input-wrapper">
                <textarea 
                  class="chat-input" 
                  id="chatInput" 
                  placeholder="Type a message..."
                  rows="1"
                ></textarea>
                <div class="chat-actions">
                  <button class="chat-button emoji" onclick="chatSystem.toggleEmojiPicker()">😊</button>
                  <button class="chat-button send" onclick="chatSystem.sendMessage()">
                    <i class="bi bi-send"></i>
                  </button>
                </div>
              </div>
              
              <div class="emoji-picker" id="emojiPicker"></div>
            </div>
          </div>
        </div>
      </div>
      
      <button class="chat-toggle" id="chatToggle" onclick="chatSystem.toggleChat()">
        <i class="bi bi-chat-dots"></i>
      </button>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatHTML);
  }

  setupEventListeners() {
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    chatInput.addEventListener('input', () => {
      this.handleTyping();
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
      const emojiPicker = document.getElementById('emojiPicker');
      const emojiButton = e.target.closest('.emoji');
      
      if (!emojiPicker.contains(e.target) && !emojiButton) {
        emojiPicker.classList.remove('show');
      }
    });
  }

  connectSocket() {
    if (typeof io !== 'undefined') {
      this.socket = io('http://localhost:5001', {
        auth: { token: this.token }
      });

      this.socket.on('connect', () => {
        console.log('Connected to chat server');
      });

      this.socket.on('new_message', (data) => {
        this.handleNewMessage(data);
      });

      this.socket.on('typing_status', (data) => {
        this.handleTypingStatus(data);
      });

      this.socket.on('message_read', (data) => {
        this.handleMessageRead(data);
      });
    }
  }

  async loadUsers() {
    try {
      const response = await this.apiCall('/users', 'GET');
      if (response.success) {
        this.displayUsers(response.users);
        this.checkUnreadMessages(response.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  displayUsers(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = users.map(user => `
      <li class="user-item" onclick="chatSystem.selectUser('${user._id}', '${user.name}', ${user.isOnline})">
        <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div class="user-info">
          <div class="user-name">${user.name}</div>
          <div class="user-status">
            <span class="${user.isOnline ? 'online-indicator' : 'offline-indicator'}"></span>
            ${user.isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
        <div class="unread-badge" id="unread-${user._id}" style="display: none;">0</div>
      </li>
    `).join('');
  }

  async selectUser(userId, userName, isOnline) {
    this.selectedUser = { id: userId, name: userName, isOnline };
    
    // Update UI
    document.getElementById('chatUserName').textContent = userName;
    document.getElementById('chatUserAvatar').textContent = userName.charAt(0).toUpperCase();
    
    // Show chat window
    document.getElementById('userSidebar').style.display = 'none';
    document.getElementById('chatWindow').classList.add('active');
    
    // Join chat room
    if (this.socket) {
      this.socket.emit('join_chat', userId);
    }
    
    // Load messages
    await this.loadMessages(userId);
    
    // Mark messages as read
    await this.markAsRead(userId);
    
    // Clear unread badge
    const badge = document.getElementById(`unread-${userId}`);
    if (badge) badge.style.display = 'none';
  }

  async loadMessages(userId) {
    try {
      const response = await this.apiCall(`/${userId}`, 'GET');
      if (response.success) {
        this.displayMessages(response.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  displayMessages(messages) {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = messages.map(msg => {
      const isSent = msg.sender === this.currentUser.id;
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return `
        <div class="message ${isSent ? 'sent' : 'received'}">
          <div class="message-bubble">
            <p class="message-text">${this.escapeHtml(msg.message)}</p>
            <div class="message-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');
    
    this.scrollToBottom();
  }

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message || !this.selectedUser) return;
    
    try {
      const response = await this.apiCall(`/${this.selectedUser.id}`, 'POST', { message });
      
      if (response.success) {
        input.value = '';
        this.addMessageToUI(response.data, true);
        this.scrollToBottom();
        
        // Stop typing indicator
        this.stopTyping();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  addMessageToUI(messageData, isSent) {
    const container = document.getElementById('messagesContainer');
    const time = new Date(messageData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageHTML = `
      <div class="message ${isSent ? 'sent' : 'received'}">
        <div class="message-bubble">
          <p class="message-text">${this.escapeHtml(messageData.message)}</p>
          <div class="message-time">${time}</div>
        </div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', messageHTML);
  }

  handleNewMessage(data) {
    if (this.selectedUser && data.sender._id === this.selectedUser.id) {
      this.addMessageToUI(data.message, false);
      this.scrollToBottom();
      this.playNotificationSound();
    } else {
      // Show unread badge
      const badge = document.getElementById(`unread-${data.sender._id}`);
      if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
        badge.style.display = 'flex';
      }
      
      this.playNotificationSound();
      this.showToast(`${data.sender.name}: ${data.message.message}`);
    }
  }

  handleTypingStatus(data) {
    if (this.selectedUser && data.userId === this.selectedUser.id) {
      const indicator = document.getElementById('typingIndicator');
      const typingUser = document.getElementById('typingUser');
      
      if (data.isTyping) {
        typingUser.textContent = this.selectedUser.name;
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    }
  }

  handleMessageRead(data) {
    // Handle message read receipts if needed
  }

  handleTyping() {
    if (!this.selectedUser) return;
    
    // Send typing status
    this.apiCall(`/${this.selectedUser.id}/typing`, 'POST', { isTyping: true });
    
    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    // Stop typing after 2 seconds
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 2000);
  }

  stopTyping() {
    if (this.selectedUser) {
      this.apiCall(`/${this.selectedUser.id}/typing`, 'POST', { isTyping: false });
    }
  }

  async markAsRead(userId) {
    try {
      await this.apiCall(`/${userId}/read`, 'POST');
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  async checkUnreadMessages(users) {
    try {
      const response = await this.apiCall('/unread/counts', 'GET');
      if (response.success) {
        Object.entries(response.unreadCounts).forEach(([userId, count]) => {
          const badge = document.getElementById(`unread-${userId}`);
          if (badge && count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
          }
        });
        
        // Show chat toggle has messages
        const hasUnread = Object.values(response.unreadCounts).some(count => count > 0);
        const toggle = document.getElementById('chatToggle');
        if (hasUnread) {
          toggle.classList.add('has-messages');
        }
      }
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  }

  toggleEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    picker.classList.toggle('show');
    
    if (picker.children.length === 0) {
      this.createEmojiPicker();
    }
  }

  createEmojiPicker() {
    const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '🤝', '💪'];
    
    const picker = document.getElementById('emojiPicker');
    picker.innerHTML = emojis.map(emoji => `
      <button class="emoji-button" onclick="chatSystem.insertEmoji('${emoji}')">${emoji}</button>
    `).join('');
  }

  insertEmoji(emoji) {
    const input = document.getElementById('chatInput');
    input.value += emoji;
    input.focus();
    document.getElementById('emojiPicker').classList.remove('show');
  }

  showUserList() {
    document.getElementById('userSidebar').style.display = 'block';
    document.getElementById('chatWindow').classList.remove('active');
    
    if (this.socket && this.selectedUser) {
      this.socket.emit('leave_chat', this.selectedUser.id);
    }
    
    this.selectedUser = null;
  }

  toggleChat() {
    const container = document.getElementById('chatContainer');
    container.classList.toggle('open');
    
    if (container.classList.contains('open')) {
      document.getElementById('chatToggle').classList.remove('has-messages');
    }
  }

  closeChat() {
    document.getElementById('chatContainer').classList.remove('open');
    this.showUserList();
  }

  startPolling() {
    this.pollingInterval = setInterval(() => {
      if (this.selectedUser) {
        this.loadMessages(this.selectedUser.id);
      }
      this.checkUnreadMessages();
    }, 2000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
  }

  playNotificationSound() {
    // Create a simple notification sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTgIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }

  showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'chat-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 2000;
      animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async apiCall(endpoint, method = 'GET', data = null) {
    const config = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    return await response.json();
  }
}

// Initialize chat system
let chatSystem;
if (typeof window !== 'undefined') {
  chatSystem = new ChatSystem();
}

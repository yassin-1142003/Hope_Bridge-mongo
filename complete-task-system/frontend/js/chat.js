// Chat System
class ChatSystem {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.socket = null;
    this.users = [];
    this.conversations = [];
    this.currentChat = null;
    this.messages = [];
    this.unreadCounts = {};
    this.typingUsers = {};
    this.isTyping = false;
    this.typingTimeout = null;
    this.currentTaskId = null;
    
    this.init();
  }

  init() {
    this.createChatContainer();
    this.setupEventListeners();
    this.connectSocket();
    this.loadUsers();
    this.loadConversations();
    this.checkUnreadMessages();
  }

  createChatContainer() {
    const chatHTML = `
      <div class="chat-container" id="chatContainer">
        <div class="chat-header">
          <h5><i class="bi bi-chat-dots me-2"></i>Messages</h5>
          <button class="chat-close" id="chatClose">
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <div class="chat-body">
          <!-- User Sidebar -->
          <div class="user-sidebar" id="userSidebar">
            <div class="p-3 border-bottom">
              <input type="text" class="form-control form-control-sm" id="userSearch" placeholder="Search users...">
            </div>
            <ul class="user-list" id="userList">
              <!-- Users will be loaded here -->
            </ul>
          </div>
          
          <!-- Chat Window -->
          <div class="chat-window" id="chatWindow">
            <div class="chat-window-header" id="chatWindowHeader">
              <button class="back-button" id="backButton">
                <i class="bi bi-arrow-left"></i>
              </button>
              <h6 id="currentChatUser">Select a user to chat</h6>
              <div class="chat-actions">
                <button class="chat-action-btn" id="videoCallBtn" title="Video Call">
                  <i class="bi bi-camera-video"></i>
                </button>
                <button class="chat-action-btn" id="voiceCallBtn" title="Voice Call">
                  <i class="bi bi-telephone"></i>
                </button>
              </div>
            </div>
            
            <div class="messages-container" id="messagesContainer">
              <!-- Messages will be loaded here -->
            </div>
            
            <div class="typing-indicator" id="typingIndicator">
              <span id="typingUser">User</span> is typing
              <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
            </div>
            
            <div class="chat-input-container">
              <div class="chat-input-wrapper">
                <button class="chat-button" id="attachBtn" title="Attach file">
                  <i class="bi bi-paperclip"></i>
                </button>
                <textarea class="chat-input" id="chatInput" placeholder="Type a message..." rows="1"></textarea>
                <button class="chat-button" id="emojiBtn" title="Add emoji">
                  <i class="bi bi-emoji-smile"></i>
                </button>
                <button class="chat-button send" id="sendBtn" title="Send message">
                  <i class="bi bi-send"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Chat Toggle Button -->
      <button class="chat-toggle" id="chatToggle">
        <i class="bi bi-chat-dots"></i>
      </button>
      
      <!-- Emoji Picker -->
      <div class="emoji-picker" id="emojiPicker">
        ${this.getEmojis().map(emoji => `
          <button class="emoji-button" data-emoji="${emoji}">${emoji}</button>
        `).join('')}
      </div>
      
      <!-- File Input (Hidden) -->
      <input type="file" id="fileInput" style="display: none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.jpg,.jpeg,.png,.gif">
    `;

    document.getElementById('chatSystem').innerHTML = chatHTML;
  }

  getEmojis() {
    return ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '🤝', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'];
  }

  setupEventListeners() {
    // Chat toggle
    document.getElementById('chatToggle').addEventListener('click', () => {
      this.toggleChat();
    });

    // Chat close
    document.getElementById('chatClose').addEventListener('click', () => {
      this.closeChat();
    });

    // User search
    document.getElementById('userSearch').addEventListener('input', (e) => {
      this.searchUsers(e.target.value);
    });

    // Chat input
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

    // Send button
    document.getElementById('sendBtn').addEventListener('click', () => {
      this.sendMessage();
    });

    // Emoji button
    document.getElementById('emojiBtn').addEventListener('click', () => {
      this.toggleEmojiPicker();
    });

    // Emoji picker
    document.getElementById('emojiPicker').addEventListener('click', (e) => {
      if (e.target.classList.contains('emoji-button')) {
        this.insertEmoji(e.target.dataset.emoji);
      }
    });

    // File attachment
    document.getElementById('attachBtn').addEventListener('click', () => {
      document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', (e) => {
      this.handleFileAttachment(e.target.files[0]);
    });

    // Back button
    document.getElementById('backButton').addEventListener('click', () => {
      this.showUserList();
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#emojiBtn') && !e.target.closest('#emojiPicker')) {
        this.hideEmojiPicker();
      }
    });
  }

  connectSocket() {
    this.socket = io('http://localhost:5000', {
      auth: {
        token: window.authSystem.getToken()
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    this.socket.on('new_message', (data) => {
      this.handleNewMessage(data);
    });

    this.socket.on('message_sent', (data) => {
      this.handleMessageSent(data);
    });

    this.socket.on('user_typing', (data) => {
      this.handleUserTyping(data);
    });

    this.socket.on('messages_read', (data) => {
      this.handleMessagesRead(data);
    });

    this.socket.on('user_status_updated', (data) => {
      this.handleUserStatusUpdate(data);
    });

    this.socket.on('new_task', (data) => {
      this.handleNewTask(data);
    });

    this.socket.on('task_status_updated', (data) => {
      this.handleTaskStatusUpdated(data);
    });
  }

  async loadUsers() {
    try {
      const response = await this.apiCall('/chat/users');
      if (response.success) {
        this.users = response.data.users;
        this.renderUserList();
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  renderUserList() {
    const userList = document.getElementById('userList');
    userList.innerHTML = this.users.map(user => `
      <li class="user-item" data-user-id="${user._id}">
        <div class="user-avatar">
          ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : user.name.charAt(0).toUpperCase()}
          ${user.isOnline ? '<div class="online-status-dot"></div>' : '<div class="offline-status-dot"></div>'}
        </div>
        <div class="user-info">
          <div class="user-name">${this.escapeHtml(user.name)}</div>
          <div class="user-status">
            ${user.isOnline ? 
              '<i class="bi bi-circle-fill online-indicator"></i> Online' : 
              `<i class="bi bi-circle offline-indicator"></i> ${this.getLastSeenText(user.lastSeen)}`
            }
          </div>
        </div>
        ${this.unreadCounts[user._id] ? `
          <div class="unread-badge">${this.unreadCounts[user._id]}</div>
        ` : ''}
      </li>
    `).join('');

    // Add click listeners
    userList.querySelectorAll('.user-item').forEach(item => {
      item.addEventListener('click', () => {
        const userId = item.dataset.userId;
        this.openChat(userId);
      });
    });
  }

  async loadConversations() {
    try {
      const response = await this.apiCall('/chat/conversations');
      if (response.success) {
        this.conversations = response.data.conversations;
        this.updateConversationList();
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  async openChat(userId) {
    this.currentChat = userId;
    const user = this.users.find(u => u._id === userId);
    
    if (!user) return;

    // Update UI
    document.getElementById('currentChatUser').textContent = user.name;
    document.getElementById('userSidebar').style.display = 'none';
    document.getElementById('chatWindow').classList.add('active');

    // Load messages
    await this.loadMessages(userId);

    // Mark messages as read
    await this.markAsRead(userId);

    // Clear unread count
    delete this.unreadCounts[userId];
    this.updateChatToggleBadge();
  }

  async loadMessages(userId) {
    try {
      const response = await this.apiCall(`/chat/${userId}`);
      if (response.success) {
        this.messages = response.data.messages;
        this.renderMessages();
        this.scrollToBottom();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  renderMessages() {
    const container = document.getElementById('messagesContainer');
    const currentUserId = window.authSystem.getCurrentUser()._id;

    container.innerHTML = this.messages.map(message => {
      const isSent = message.sender._id === currentUserId;
      return `
        <div class="message ${isSent ? 'sent' : 'received'}">
          <div class="message-avatar">
            ${message.sender.avatar ? 
              `<img src="${message.sender.avatar}" alt="${message.sender.name}">` : 
              message.sender.name.charAt(0).toUpperCase()
            }
          </div>
          <div class="message-content">
            <div class="message-bubble">
              ${message.attachment ? this.renderAttachment(message.attachment) : ''}
              ${message.messageType === 'emoji' ? 
                `<span style="font-size: 2rem;">${message.message}</span>` : 
                `<p class="message-text">${this.escapeHtml(message.message)}</p>`
              }
            </div>
            <div class="message-info">
              <span class="message-time">${this.formatTime(message.createdAt)}</span>
              ${isSent ? `
                <span class="message-status">
                  ${message.isRead ? '<i class="bi bi-check2-all text-primary"></i>' : '<i class="bi bi-check2"></i>'}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderAttachment(attachment) {
    const isImage = attachment.mimetype.startsWith('image/');
    
    if (isImage) {
      return `
        <div class="message-attachment">
          <img src="${this.baseURL.replace('/api', '')}/uploads/${attachment.filename}" 
               alt="${attachment.originalname}" style="max-width: 200px; border-radius: 8px;">
          <div class="attachment-info">
            <div class="file-name">${this.escapeHtml(attachment.originalname)}</div>
            <div class="file-size">${this.formatFileSize(attachment.size)}</div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="file-attachment">
          <div class="file-icon">
            <i class="bi bi-file-earmark"></i>
          </div>
          <div class="file-info">
            <div class="file-name">${this.escapeHtml(attachment.originalname)}</div>
            <div class="file-size">${this.formatFileSize(attachment.size)}</div>
          </div>
          <a href="${this.baseURL.replace('/api', '')}/uploads/${attachment.filename}" 
             class="file-download" download>
            <i class="bi bi-download"></i>
          </a>
        </div>
      `;
    }
  }

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message || !this.currentChat) return;

    try {
      const response = await this.apiCall(`/chat/${this.currentChat}`, 'POST', {
        message,
        taskId: this.currentTaskId
      });

      if (response.success) {
        input.value = '';
        this.messages.push(response.data.message);
        this.renderMessages();
        this.scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.showToast('Failed to send message', 'error');
    }
  }

  handleTyping() {
    if (!this.currentChat) return;

    if (!this.isTyping) {
      this.isTyping = true;
      this.socket.emit('typing_start', { receiverId: this.currentChat });
    }

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
      this.socket.emit('typing_stop', { receiverId: this.currentChat });
    }, 1000);
  }

  handleNewMessage(data) {
    const { message, sender } = data;
    const currentUserId = window.authSystem.getCurrentUser()._id;

    if (message.receiver._id === currentUserId) {
      // Message is for current user
      if (this.currentChat === message.sender._id) {
        // Add to current chat
        this.messages.push(message);
        this.renderMessages();
        this.scrollToBottom();
        this.markAsRead(message.sender._id);
      } else {
        // Update unread count
        this.unreadCounts[message.sender._id] = (this.unreadCounts[message.sender._id] || 0) + 1;
        this.updateChatToggleBadge();
        this.renderUserList();
        
        // Show notification
        this.showToast(`${sender.name}: ${message.message}`, 'info');
      }
    }
  }

  handleMessageSent(data) {
    const { message } = data;
    if (this.currentChat === message.receiver._id) {
      this.messages.push(message);
      this.renderMessages();
      this.scrollToBottom();
    }
  }

  handleUserTyping(data) {
    const { userId, userName, isTyping } = data;
    
    if (this.currentChat === userId) {
      const indicator = document.getElementById('typingIndicator');
      const typingUser = document.getElementById('typingUser');
      
      if (isTyping) {
        typingUser.textContent = userName;
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    }
  }

  handleMessagesRead(data) {
    const { userId } = data;
    
    // Update message read status in current chat
    this.messages.forEach(message => {
      if (message.receiver._id === userId) {
        message.isRead = true;
      }
    });
    
    this.renderMessages();
  }

  handleUserStatusUpdate(data) {
    const { userId, isOnline, lastSeen } = data;
    
    // Update user in list
    const user = this.users.find(u => u._id === userId);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = new Date(lastSeen);
      this.renderUserList();
    }
  }

  handleNewTask(data) {
    // Handle new task notification
    const { task, sender } = data;
    this.showToast(`New task: ${task.title}`, 'info');
    
    // Update task system if available
    if (window.taskSystem) {
      window.taskSystem.loadTasks();
      window.taskSystem.checkNewTasks();
    }
  }

  handleTaskStatusUpdated(data) {
    // Handle task status update
    const { task, updatedBy, oldStatus, newStatus } = data;
    this.showToast(`Task "${task.title}" status changed to ${newStatus}`, 'info');
    
    // Update task system if available
    if (window.taskSystem) {
      window.taskSystem.loadTasks();
    }
  }

  async markAsRead(userId) {
    try {
      await this.apiCall(`/chat/${userId}/read`, 'POST');
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  async checkUnreadMessages() {
    try {
      const response = await this.apiCall('/chat/unread/count');
      if (response.success) {
        const totalUnread = response.data.unreadCount;
        this.updateChatToggleBadge(totalUnread);
      }
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  }

  updateChatToggleBadge(count = null) {
    const toggle = document.getElementById('chatToggle');
    const totalUnread = count !== null ? count : Object.values(this.unreadCounts).reduce((sum, count) => sum + count, 0);
    
    if (totalUnread > 0) {
      toggle.classList.add('has-messages');
      toggle.innerHTML = `
        <i class="bi bi-chat-dots"></i>
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">${totalUnread}</span>
      `;
    } else {
      toggle.classList.remove('has-messages');
      toggle.innerHTML = '<i class="bi bi-chat-dots"></i>';
    }
  }

  searchUsers(query) {
    const filteredUsers = this.users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    
    const userList = document.getElementById('userList');
    userList.innerHTML = filteredUsers.map(user => `
      <li class="user-item" data-user-id="${user._id}">
        <div class="user-avatar">
          ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : user.name.charAt(0).toUpperCase()}
          ${user.isOnline ? '<div class="online-status-dot"></div>' : '<div class="offline-status-dot"></div>'}
        </div>
        <div class="user-info">
          <div class="user-name">${this.escapeHtml(user.name)}</div>
          <div class="user-status">
            ${user.isOnline ? 
              '<i class="bi bi-circle-fill online-indicator"></i> Online' : 
              `<i class="bi bi-circle offline-indicator"></i> ${this.getLastSeenText(user.lastSeen)}`
            }
          </div>
        </div>
        ${this.unreadCounts[user._id] ? `
          <div class="unread-badge">${this.unreadCounts[user._id]}</div>
        ` : ''}
      </li>
    `).join('');

    // Re-add click listeners
    userList.querySelectorAll('.user-item').forEach(item => {
      item.addEventListener('click', () => {
        const userId = item.dataset.userId;
        this.openChat(userId);
      });
    });
  }

  showUserList() {
    document.getElementById('userSidebar').style.display = 'block';
    document.getElementById('chatWindow').classList.remove('active');
    this.currentChat = null;
  }

  toggleChat() {
    const container = document.getElementById('chatContainer');
    container.classList.toggle('open');
    
    if (container.classList.contains('open')) {
      this.loadUsers();
      this.loadConversations();
    }
  }

  closeChat() {
    const container = document.getElementById('chatContainer');
    container.classList.remove('open');
    this.showUserList();
  }

  toggleEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    picker.classList.toggle('show');
  }

  hideEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    picker.classList.remove('show');
  }

  insertEmoji(emoji) {
    const input = document.getElementById('chatInput');
    input.value += emoji;
    input.focus();
    this.hideEmojiPicker();
  }

  handleFileAttachment(file) {
    if (!file || !this.currentChat) return;

    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('message', ''); // Empty message for file attachment

    fetch(`${this.baseURL}/chat/${this.currentChat}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${window.authSystem.getToken()}`
      },
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        this.messages.push(data.data.message);
        this.renderMessages();
        this.scrollToBottom();
      } else {
        this.showToast('Failed to send file', 'error');
      }
    })
    .catch(error => {
      console.error('Error sending file:', error);
      this.showToast('Failed to send file', 'error');
    });

    // Clear file input
    document.getElementById('fileInput').value = '';
  }

  openWithTask(taskId) {
    this.currentTaskId = taskId;
    this.toggleChat();
  }

  scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
  }

  updateConversationList() {
    // Update user list with conversation info
    this.conversations.forEach(conv => {
      const user = conv.senderInfo._id === window.authSystem.getCurrentUser()._id ? 
        conv.receiverInfo : conv.senderInfo;
      
      const userItem = document.querySelector(`[data-user-id="${user._id}"]`);
      if (userItem) {
        // Update last message preview
        const statusEl = userItem.querySelector('.user-status');
        if (conv.lastMessage) {
          const lastMsg = conv.lastMessage.message.length > 20 ? 
            conv.lastMessage.message.substring(0, 20) + '...' : 
            conv.lastMessage.message;
          statusEl.innerHTML = `
            ${user.isOnline ? 
              '<i class="bi bi-circle-fill online-indicator"></i>' : 
              '<i class="bi bi-circle offline-indicator"></i>'
            }
            <span class="ms-1">${this.escapeHtml(lastMsg)}</span>
          `;
        }
        
        // Update unread count
        const existingBadge = userItem.querySelector('.unread-badge');
        if (conv.unreadCount > 0) {
          if (existingBadge) {
            existingBadge.textContent = conv.unreadCount;
          } else {
            userItem.innerHTML += `<div class="unread-badge">${conv.unreadCount}</div>`;
          }
        } else if (existingBadge) {
          existingBadge.remove();
        }
      }
    });
  }

  // Utility functions
  showToast(message, type = 'info') {
    window.authSystem.showToast(message, type);
  }

  async apiCall(endpoint, method = 'GET', data = null) {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.authSystem.getToken()}`
      }
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    return await response.json();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    
    return date.toLocaleDateString();
  }

  getLastSeenText(lastSeen) {
    if (!lastSeen) return 'Never';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    
    return date.toLocaleDateString();
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Initialize chat system when auth is ready
window.chatSystem = new ChatSystem();

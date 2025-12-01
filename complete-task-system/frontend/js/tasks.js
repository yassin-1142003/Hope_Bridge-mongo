// Task Management System
class TaskSystem {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.tasks = [];
    this.users = [];
    this.selectedUsers = [];
    this.currentFilter = {
      status: '',
      priority: '',
      search: '',
      type: 'received' // 'received', 'sent', 'all'
    };
    this.autoRefreshInterval = null;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadUsers();
    this.loadTasks();
    this.startAutoRefresh();
  }

  setupEventListeners() {
    // Create task button
    document.getElementById('createTaskBtn').addEventListener('click', () => {
      this.showCreateTaskModal();
    });

    // Save task button
    document.getElementById('saveTaskBtn').addEventListener('click', () => {
      this.createTask();
    });

    // My tasks button
    document.getElementById('myTasksBtn').addEventListener('click', () => {
      this.switchView('received');
    });

    // Sent tasks button
    document.getElementById('sentTasksBtn').addEventListener('click', () => {
      this.switchView('sent');
    });

    // Filters
    document.getElementById('statusFilter').addEventListener('change', (e) => {
      this.currentFilter.status = e.target.value;
      this.loadTasks();
    });

    document.getElementById('priorityFilter').addEventListener('change', (e) => {
      this.currentFilter.priority = e.target.value;
      this.loadTasks();
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.currentFilter.search = e.target.value;
      this.loadTasks();
    });

    // User selection in create task modal
    document.getElementById('userDropdown').addEventListener('click', (e) => {
      if (e.target.classList.contains('user-dropdown-item')) {
        e.preventDefault();
        this.toggleUserSelection(e.target);
      }
    });
  }

  async loadUsers() {
    try {
      const response = await this.apiCall('/users/all');
      if (response.success) {
        this.users = response.data.users;
        this.populateUserDropdown();
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  populateUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.innerHTML = this.users.map(user => `
      <li class="user-dropdown-item" data-user-id="${user._id}">
        <input type="checkbox" id="user-${user._id}" value="${user._id}">
        <label for="user-${user._id}" style="cursor: pointer; margin: 0;">
          <div class="d-flex align-items-center">
            <div class="user-avatar me-2" style="width: 24px; height: 24px; font-size: 0.7rem;">
              ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : user.name.charAt(0).toUpperCase()}
            </div>
            <span>${user.name}</span>
            <small class="ms-auto text-muted">${user.department || ''}</small>
          </div>
        </label>
      </li>
    `).join('');
  }

  toggleUserSelection(element) {
    const userId = element.dataset.userId;
    const checkbox = element.querySelector('input[type="checkbox"]');
    const user = this.users.find(u => u._id === userId);
    
    if (!user) return;

    if (checkbox.checked) {
      checkbox.checked = false;
      this.selectedUsers = this.selectedUsers.filter(id => id !== userId);
    } else {
      checkbox.checked = true;
      this.selectedUsers.push(userId);
    }

    this.updateSelectedUsersDisplay();
  }

  updateSelectedUsersDisplay() {
    const container = document.getElementById('selectedUsers');
    const selectedUserElements = this.selectedUsers.map(userId => {
      const user = this.users.find(u => u._id === userId);
      if (!user) return '';
      
      return `
        <div class="selected-user">
          <span>${user.name}</span>
          <span class="remove-user" data-user-id="${userId}">×</span>
        </div>
      `;
    }).join('');

    container.innerHTML = selectedUserElements;

    // Add event listeners to remove buttons
    container.querySelectorAll('.remove-user').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.dataset.userId;
        this.removeSelectedUser(userId);
      });
    });
  }

  removeSelectedUser(userId) {
    this.selectedUsers = this.selectedUsers.filter(id => id !== userId);
    
    // Update checkbox
    const checkbox = document.querySelector(`#user-${userId}`);
    if (checkbox) checkbox.checked = false;
    
    this.updateSelectedUsersDisplay();
  }

  async loadTasks() {
    try {
      this.showLoading(true);
      
      let endpoint = '/tasks/my-tasks';
      if (this.currentFilter.type === 'sent') {
        endpoint = '/tasks/sent';
      }

      const params = new URLSearchParams();
      if (this.currentFilter.status) params.append('status', this.currentFilter.status);
      if (this.currentFilter.priority) params.append('priority', this.currentFilter.priority);
      if (this.currentFilter.search) params.append('search', this.currentFilter.search);

      const response = await this.apiCall(`${endpoint}?${params}`);
      
      if (response.success) {
        this.tasks = response.data.tasks;
        this.renderTasks();
        this.updateStats();
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.showToast('Error loading tasks', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  renderTasks() {
    const container = document.getElementById('taskCards');
    const emptyState = document.getElementById('emptyState');

    if (this.tasks.length === 0) {
      container.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    container.innerHTML = this.tasks.map(task => this.createTaskCard(task)).join('');

    // Add event listeners to task cards
    container.querySelectorAll('.show-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.target.dataset.taskId;
        this.showTaskDetails(taskId);
      });
    });

    container.querySelectorAll('.update-status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.target.dataset.taskId;
        const status = e.target.dataset.status;
        this.updateTaskStatus(taskId, status);
      });
    });
  }

  createTaskCard(task) {
    const isSent = task.sender._id === window.authSystem.getCurrentUser()._id;
    const statusClass = `status-${task.status.replace('_', '-')}`;
    const priorityClass = `priority-${task.priority}`;
    
    return `
      <div class="task-card" data-task-id="${task._id}">
        <div class="task-card-header">
          <div class="task-card-title">${this.escapeHtml(task.title)}</div>
          <div class="task-card-meta">
            <span class="priority-badge ${priorityClass}">${task.priority}</span>
            <span>${new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="task-card-body">
          <div class="task-card-description">
            ${this.escapeHtml(task.description.substring(0, 150))}${task.description.length > 150 ? '...' : ''}
          </div>
          ${task.tags && task.tags.length > 0 ? `
            <div class="task-card-tags">
              ${task.tags.map(tag => `<span class="task-tag">#${this.escapeHtml(tag)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        <div class="task-card-footer">
          <div>
            <span class="status-badge ${statusClass}">${task.status.replace('-', ' ')}</span>
            <small class="text-muted ms-2">
              ${isSent ? 'To: ' : 'From: '}
              ${isSent ? 
                task.receivers.map(r => r.name).join(', ') : 
                task.sender.name
              }
            </small>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-primary show-task-btn" data-task-id="${task._id}">
              <i class="bi bi-eye me-1"></i>Show
            </button>
            ${!isSent && task.status !== 'completed' ? `
              <button class="btn btn-sm btn-success update-status-btn ms-1" data-task-id="${task._id}" data-status="completed">
                <i class="bi bi-check me-1"></i>Done
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  async showTaskDetails(taskId) {
    try {
      const response = await this.apiCall(`/tasks/${taskId}`);
      
      if (response.success) {
        const task = response.data.task;
        this.renderTaskModal(task);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('taskDetailsModal'));
        modal.show();
      }
    } catch (error) {
      console.error('Error loading task details:', error);
      this.showToast('Error loading task details', 'error');
    }
  }

  renderTaskModal(task) {
    const isSent = task.sender._id === window.authSystem.getCurrentUser()._id;
    const statusClass = `status-${task.status.replace('_', '-')}`;
    const priorityClass = `priority-${task.priority}`;
    
    const modalBody = document.getElementById('taskModalBody');
    modalBody.innerHTML = `
      <div class="task-details-header">
        <h4 class="task-details-title">${this.escapeHtml(task.title)}</h4>
        <div class="task-details-meta">
          <span class="priority-badge ${priorityClass}">${task.priority}</span>
          <span class="status-badge ${statusClass}">${task.status.replace('-', ' ')}</span>
          <span><i class="bi bi-calendar me-1"></i>${new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div class="task-details-description">
        <h6>Description</h6>
        <p>${this.escapeHtml(task.description)}</p>
      </div>

      <div class="task-details-receivers">
        <h6>${isSent ? 'Assigned To' : 'From'}</h6>
        <div class="receiver-list">
          ${isSent ? 
            task.receivers.map(receiver => `
              <div class="receiver-chip">
                <div class="user-avatar me-2" style="width: 24px; height: 24px; font-size: 0.7rem;">
                  ${receiver.avatar ? `<img src="${receiver.avatar}" alt="${receiver.name}">` : receiver.name.charAt(0).toUpperCase()}
                </div>
                ${this.escapeHtml(receiver.name)}
              </div>
            `).join('') : 
            `
              <div class="receiver-chip">
                <div class="user-avatar me-2" style="width: 24px; height: 24px; font-size: 0.7rem;">
                  ${task.sender.avatar ? `<img src="${task.sender.avatar}" alt="${task.sender.name}">` : task.sender.name.charAt(0).toUpperCase()}
                </div>
                ${this.escapeHtml(task.sender.name)}
              </div>
            `
          }
        </div>
      </div>

      ${task.attachment ? `
        <div class="task-details-attachment">
          <h6>Attachment</h6>
          <div class="attachment-preview">
            <div class="attachment-icon">
              <i class="bi bi-file-earmark"></i>
            </div>
            <div class="file-info">
              <div class="file-name">${this.escapeHtml(task.attachment.originalname)}</div>
              <div class="file-size">${this.formatFileSize(task.attachment.size)}</div>
            </div>
            <a href="${this.baseURL.replace('/api', '')}/uploads/${task.attachment.filename}" 
               class="file-download" download>
              <i class="bi bi-download"></i>
            </a>
          </div>
        </div>
      ` : ''}

      ${task.dueDate ? `
        <div class="task-details-due-date">
          <h6>Due Date</h6>
          <p><i class="bi bi-calendar-event me-2"></i>${new Date(task.dueDate).toLocaleDateString()}</p>
        </div>
      ` : ''}

      ${!isSent ? `
        <div class="status-update">
          <div class="status-update-label">Update Status</div>
          <div class="status-actions">
            <button class="status-btn ${task.status === 'pending' ? 'active' : ''}" 
                    data-status="pending" onclick="taskSystem.updateTaskStatus('${task._id}', 'pending')">
              Pending
            </button>
            <button class="status-btn ${task.status === 'in-progress' ? 'active' : ''}" 
                    data-status="in-progress" onclick="taskSystem.updateTaskStatus('${task._id}', 'in-progress')">
              In Progress
            </button>
            <button class="status-btn ${task.status === 'completed' ? 'active' : ''}" 
                    data-status="completed" onclick="taskSystem.updateTaskStatus('${task._id}', 'completed')">
              Completed
            </button>
          </div>
        </div>
      ` : ''}

      <div class="task-details-actions">
        <button class="btn btn-primary" onclick="taskSystem.openChatForTask('${task._id}')">
          <i class="bi bi-chat-dots me-2"></i>Chat About This Task
        </button>
        ${isSent ? `
          <button class="btn btn-outline-danger" onclick="taskSystem.deleteTask('${task._id}')">
            <i class="bi bi-trash me-2"></i>Delete
          </button>
        ` : ''}
      </div>

      ${task.comments && task.comments.length > 0 ? `
        <div class="comments-section">
          <h6 class="comments-header">Comments (${task.comments.length})</h6>
          ${task.comments.map(comment => `
            <div class="comment-item">
              <div class="comment-header">
                <span class="comment-author">${this.escapeHtml(comment.user.name)}</span>
                <span class="comment-time">${new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <div class="comment-text">${this.escapeHtml(comment.text)}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${!isSent ? `
        <div class="add-comment">
          <h6>Add Comment</h6>
          <textarea class="form-control" id="comment-${task._id}" placeholder="Add a comment..." rows="3"></textarea>
          <button class="btn btn-primary btn-sm mt-2" onclick="taskSystem.addComment('${task._id}')">
            <i class="bi bi-send me-1"></i>Add Comment
          </button>
        </div>
      ` : ''}
    `;
  }

  async createTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const tags = document.getElementById('taskTags').value.split(',').map(t => t.trim()).filter(t => t);
    const attachment = document.getElementById('taskAttachment').files[0];

    if (!title || !description) {
      this.showToast('Please fill in all required fields', 'error');
      return;
    }

    if (this.selectedUsers.length === 0) {
      this.showToast('Please assign task to at least one user', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priority', priority);
      formData.append('receivers', JSON.stringify(this.selectedUsers));
      
      if (dueDate) formData.append('dueDate', dueDate);
      if (tags.length > 0) formData.append('tags', JSON.stringify(tags));
      if (attachment) formData.append('attachment', attachment);

      const response = await fetch(`${this.baseURL}/tasks/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${window.authSystem.getToken()}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        this.showToast('Task created successfully!', 'success');
        this.closeCreateTaskModal();
        this.loadTasks();
        this.updateStats();
      } else {
        this.showToast(result.message || 'Failed to create task', 'error');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      this.showToast('Error creating task', 'error');
    }
  }

  async updateTaskStatus(taskId, status) {
    try {
      const response = await this.apiCall(`/tasks/${taskId}/status`, 'PATCH', { status });
      
      if (response.success) {
        this.showToast('Task status updated', 'success');
        this.loadTasks();
        this.updateStats();
        
        // Update modal if open
        const modal = bootstrap.Modal.getInstance(document.getElementById('taskDetailsModal'));
        if (modal) {
          this.showTaskDetails(taskId);
        }
      } else {
        this.showToast(response.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      this.showToast('Error updating task status', 'error');
    }
  }

  async deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await this.apiCall(`/tasks/${taskId}`, 'DELETE');
      
      if (response.success) {
        this.showToast('Task deleted successfully', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('taskDetailsModal'));
        if (modal) modal.hide();
        
        this.loadTasks();
        this.updateStats();
      } else {
        this.showToast(response.message || 'Failed to delete task', 'error');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      this.showToast('Error deleting task', 'error');
    }
  }

  async addComment(taskId) {
    const textarea = document.getElementById(`comment-${taskId}`);
    const text = textarea.value.trim();

    if (!text) {
      this.showToast('Please enter a comment', 'error');
      return;
    }

    try {
      const response = await this.apiCall(`/tasks/${taskId}/comment`, 'POST', { text });
      
      if (response.success) {
        textarea.value = '';
        this.showToast('Comment added', 'success');
        this.showTaskDetails(taskId); // Refresh modal
      } else {
        this.showToast(response.message || 'Failed to add comment', 'error');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      this.showToast('Error adding comment', 'error');
    }
  }

  async updateStats() {
    try {
      const response = await this.apiCall('/tasks/stats');
      
      if (response.success) {
        const stats = response.data.stats;
        const totalTasks = response.data.totalTasks;
        
        // Update stat cards
        document.getElementById('totalTasks').textContent = totalTasks || 0;
        document.getElementById('newTasks').textContent = stats.find(s => s._id === 'new')?.count || 0;
        document.getElementById('inProgressTasks').textContent = stats.find(s => s._id === 'in-progress')?.count || 0;
        document.getElementById('completedTasks').textContent = stats.find(s => s._id === 'completed')?.count || 0;
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  switchView(type) {
    this.currentFilter.type = type;
    
    // Update section title
    const titles = {
      'received': 'My Tasks',
      'sent': 'Sent Tasks',
      'all': 'All Tasks'
    };
    document.getElementById('sectionTitle').textContent = titles[type] || 'Tasks';
    
    this.loadTasks();
  }

  showCreateTaskModal() {
    // Reset form
    document.getElementById('createTaskForm').reset();
    this.selectedUsers = [];
    this.updateSelectedUsersDisplay();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('createTaskModal'));
    modal.show();
  }

  closeCreateTaskModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('createTaskModal'));
    if (modal) modal.hide();
  }

  openChatForTask(taskId) {
    // Close task modal
    const taskModal = bootstrap.Modal.getInstance(document.getElementById('taskDetailsModal'));
    if (taskModal) taskModal.hide();
    
    // Open chat with task context
    if (window.chatSystem) {
      window.chatSystem.openWithTask(taskId);
    }
  }

  startAutoRefresh() {
    // Refresh tasks every 10 seconds
    this.autoRefreshInterval = setInterval(() => {
      if (window.authSystem.isAuthenticated()) {
        this.loadTasks();
        this.checkNewTasks();
      }
    }, 10000);
  }

  async checkNewTasks() {
    try {
      const response = await this.apiCall('/tasks/new');
      
      if (response.success && response.data.count > 0) {
        this.showNewTasksAlert(response.data.tasks);
      }
    } catch (error) {
      console.error('Error checking new tasks:', error);
    }
  }

  showNewTasksAlert(newTasks) {
    const alertBtn = document.getElementById('newTasksAlert');
    const countBadge = document.getElementById('newTasksCount');
    const dropdown = document.getElementById('newTasksDropdown');
    const list = document.getElementById('newTasksList');

    // Update badge
    countBadge.textContent = newTasks.length;
    alertBtn.style.display = 'block';

    // Update dropdown list
    list.innerHTML = newTasks.map(task => `
      <li>
        <a class="dropdown-item" href="#" onclick="taskSystem.showTaskDetails('${task._id}')">
          <div class="d-flex justify-content-between">
            <strong>${this.escapeHtml(task.title)}</strong>
            <small class="text-muted">${new Date(task.createdAt).toLocaleTimeString()}</small>
          </div>
          <small class="text-muted">From: ${task.sender.name}</small>
        </a>
      </li>
    `).join('');
  }

  showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const container = document.getElementById('taskCards');
    
    if (show) {
      spinner.style.display = 'block';
      container.style.display = 'none';
    } else {
      spinner.style.display = 'none';
      container.style.display = 'grid';
    }
  }

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

  // Utility functions
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Initialize task system when auth is ready
window.taskSystem = new TaskSystem();

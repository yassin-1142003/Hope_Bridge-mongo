// Dashboard Controller
class DashboardController {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.notifications = [];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadDashboardData();
    this.startPeriodicUpdates();
  }

  setupEventListeners() {
    // Profile button
    document.getElementById('profileBtn').addEventListener('click', (e) => {
      e.preventDefault();
      this.showProfile();
    });

    // Stats button
    document.getElementById('statsBtn').addEventListener('click', (e) => {
      e.preventDefault();
      this.showStatistics();
    });

    // New tasks dropdown
    document.getElementById('newTasksAlert').addEventListener('click', (e) => {
      e.preventDefault();
      this.loadNewTasks();
    });
  }

  async loadDashboardData() {
    if (!window.authSystem.isAuthenticated()) return;

    try {
      // Load user stats
      await this.loadUserStats();
      
      // Load new tasks
      await this.loadNewTasks();
      
      // Update online status
      await this.updateOnlineStatus(true);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  async loadUserStats() {
    try {
      const response = await this.apiCall('/users/stats');
      
      if (response.success) {
        const stats = response.data;
        
        // Update stat cards
        document.getElementById('totalTasks').textContent = stats.totalTasks || 0;
        document.getElementById('newTasks').textContent = stats.unreadCount || 0;
        document.getElementById('inProgressTasks').textContent = 
          stats.taskStats.find(s => s._id === 'in-progress')?.count || 0;
        document.getElementById('completedTasks').textContent = 
          stats.taskStats.find(s => s._id === 'completed')?.count || 0;
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  async loadNewTasks() {
    try {
      const response = await this.apiCall('/tasks/new');
      
      if (response.success && response.data.count > 0) {
        this.showNewTasksAlert(response.data.tasks);
      } else {
        this.hideNewTasksAlert();
      }
    } catch (error) {
      console.error('Error loading new tasks:', error);
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
        <a class="dropdown-item" href="#" onclick="taskSystem.showTaskDetails('${task._id}'); return false;">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <strong>${this.escapeHtml(task.title)}</strong>
              <br>
              <small class="text-muted">
                <i class="bi bi-person me-1"></i>${task.sender.name}
                <span class="ms-2">
                  <i class="bi bi-clock me-1"></i>${this.formatTime(task.createdAt)}
                </span>
              </small>
            </div>
            <span class="badge bg-primary ms-2">${task.priority}</span>
          </div>
        </a>
      </li>
    `).join('');

    // Show notification toast
    this.showToast(`You have ${newTasks.length} new task${newTasks.length > 1 ? 's' : ''}`, 'info');
  }

  hideNewTasksAlert() {
    const alertBtn = document.getElementById('newTasksAlert');
    alertBtn.style.display = 'none';
  }

  async updateOnlineStatus(isOnline) {
    try {
      await this.apiCall('/users/online-status', 'PUT', { isOnline });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  showProfile() {
    const user = window.authSystem.getCurrentUser();
    
    const modalHTML = `
      <div class="modal fade" id="profileModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-person-circle me-2"></i>Profile
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="text-center mb-4">
                <div class="user-avatar mx-auto mb-3" style="width: 80px; height: 80px; font-size: 2rem;">
                  ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : user.name.charAt(0).toUpperCase()}
                </div>
                <h4>${this.escapeHtml(user.name)}</h4>
                <p class="text-muted">${this.escapeHtml(user.email)}</p>
                <span class="badge bg-primary">${user.role}</span>
                ${user.department ? `<span class="badge bg-secondary ms-1">${this.escapeHtml(user.department)}</span>` : ''}
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="card">
                    <div class="card-body text-center">
                      <h5 class="card-title text-primary">Total Tasks</h5>
                      <p class="card-text display-6" id="profileTotalTasks">0</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card">
                    <div class="card-body text-center">
                      <h5 class="card-title text-success">Completed</h5>
                      <p class="card-text display-6" id="profileCompletedTasks">0</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-3">
                <small class="text-muted">
                  <i class="bi bi-calendar me-1"></i>Member since ${new Date(user.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" id="editProfileBtn">
                <i class="bi bi-pencil me-2"></i>Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('profileModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Load profile stats
    this.loadProfileStats();

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('profileModal'));
    modal.show();

    // Setup edit profile button
    document.getElementById('editProfileBtn').addEventListener('click', () => {
      this.showEditProfile();
    });
  }

  async loadProfileStats() {
    try {
      const response = await this.apiCall('/tasks/stats');
      
      if (response.success) {
        const totalTasks = response.data.totalTasks;
        const completedCount = response.data.stats.find(s => s._id === 'completed')?.count || 0;
        
        document.getElementById('profileTotalTasks').textContent = totalTasks;
        document.getElementById('profileCompletedTasks').textContent = completedCount;
      }
    } catch (error) {
      console.error('Error loading profile stats:', error);
    }
  }

  showEditProfile() {
    const user = window.authSystem.getCurrentUser();
    
    const editModalHTML = `
      <div class="modal fade" id="editProfileModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-pencil me-2"></i>Edit Profile
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="editProfileForm">
                <div class="mb-3">
                  <label class="form-label">Full Name</label>
                  <input type="text" class="form-control" id="editName" value="${this.escapeHtml(user.name)}" required>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" id="editEmail" value="${this.escapeHtml(user.email)}" readonly>
                  <small class="text-muted">Email cannot be changed</small>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Department</label>
                  <input type="text" class="form-control" id="editDepartment" value="${this.escapeHtml(user.department || '')}" placeholder="Optional">
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Avatar URL</label>
                  <input type="url" class="form-control" id="editAvatar" value="${this.escapeHtml(user.avatar || '')}" placeholder="Optional">
                  <small class="text-muted">Enter URL to profile picture</small>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="saveProfileBtn">
                <i class="bi bi-check me-2"></i>Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('editProfileModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', editModalHTML);

    // Close profile modal
    bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();

    // Show edit modal
    const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    modal.show();

    // Setup save button
    document.getElementById('saveProfileBtn').addEventListener('click', () => {
      this.saveProfile();
    });
  }

  async saveProfile() {
    const name = document.getElementById('editName').value.trim();
    const department = document.getElementById('editDepartment').value.trim();
    const avatar = document.getElementById('editAvatar').value.trim();

    if (!name) {
      this.showToast('Name is required', 'error');
      return;
    }

    try {
      const response = await this.apiCall('/auth/profile', 'PUT', {
        name,
        department,
        avatar
      });

      if (response.success) {
        // Update local user data
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.authSystem.user = updatedUser;

        // Update UI
        document.getElementById('userName').textContent = updatedUser.name;

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();

        this.showToast('Profile updated successfully', 'success');
      } else {
        this.showToast(response.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      this.showToast('Error updating profile', 'error');
    }
  }

  showStatistics() {
    const modalHTML = `
      <div class="modal fade" id="statisticsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-bar-chart me-2"></i>Task Statistics
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row" id="statsContent">
                <div class="col-12 text-center">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading statistics...</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('statisticsModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('statisticsModal'));
    modal.show();

    // Load statistics
    this.loadStatistics();
  }

  async loadStatistics() {
    try {
      const [taskStats, userStats] = await Promise.all([
        this.apiCall('/tasks/stats'),
        this.apiCall('/users/stats')
      ]);

      const statsContent = document.getElementById('statsContent');
      
      if (taskStats.success && userStats.success) {
        const stats = taskStats.data;
        const user = userStats.data;

        statsContent.innerHTML = `
          <div class="col-md-6 mb-4">
            <div class="card">
              <div class="card-header bg-primary text-white">
                <h6 class="mb-0"><i class="bi bi-list-task me-2"></i>Task Overview</h6>
              </div>
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-4">
                    <h4 class="text-primary">${stats.totalTasks}</h4>
                    <small>Total Tasks</small>
                  </div>
                  <div class="col-4">
                    <h4 class="text-warning">${stats.overdueTasks}</h4>
                    <small>Overdue</small>
                  </div>
                  <div class="col-4">
                    <h4 class="text-success">${user.completedTasks || 0}</h4>
                    <small>Completed</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-6 mb-4">
            <div class="card">
              <div class="card-header bg-success text-white">
                <h6 class="mb-0"><i class="bi bi-check-circle me-2"></i>Status Breakdown</h6>
              </div>
              <div class="card-body">
                ${stats.stats.map(stat => `
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge bg-${this.getStatusColor(stat._id)}">${stat._id.replace('-', ' ')}</span>
                    <span class="badge bg-secondary">${stat.count}</span>
                  </div>
                `).join('')}
                ${stats.stats.length === 0 ? '<p class="text-muted text-center">No tasks found</p>' : ''}
              </div>
            </div>
          </div>
          
          <div class="col-12">
            <div class="card">
              <div class="card-header bg-info text-white">
                <h6 class="mb-0"><i class="bi bi-graph-up me-2"></i>Activity Summary</h6>
              </div>
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-md-3">
                    <h5 class="text-info">${user.sentTasks}</h5>
                    <small>Tasks Sent</small>
                  </div>
                  <div class="col-md-3">
                    <h5 class="text-primary">${user.receivedTasks}</h5>
                    <small>Tasks Received</small>
                  </div>
                  <div class="col-md-3">
                    <h5 class="text-warning">${user.unreadCount}</h5>
                    <small>New Tasks</small>
                  </div>
                  <div class="col-md-3">
                    <h5 class="text-success">${user.completedTasks || 0}</h5>
                    <small>Completed</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        statsContent.innerHTML = `
          <div class="col-12 text-center">
            <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
            <h5 class="mt-3">Unable to load statistics</h5>
            <p class="text-muted">Please try again later</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      document.getElementById('statsContent').innerHTML = `
        <div class="col-12 text-center">
          <i class="bi bi-exclamation-triangle display-1 text-danger"></i>
          <h5 class="mt-3">Error loading statistics</h5>
          <p class="text-muted">Please try again later</p>
        </div>
      `;
    }
  }

  getStatusColor(status) {
    const colors = {
      'new': 'primary',
      'pending': 'warning',
      'in-progress': 'info',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
  }

  startPeriodicUpdates() {
    // Update dashboard data every 30 seconds
    setInterval(() => {
      if (window.authSystem.isAuthenticated()) {
        this.loadDashboardData();
      }
    }, 30000);

    // Update online status every 5 minutes
    setInterval(() => {
      if (window.authSystem.isAuthenticated()) {
        this.updateOnlineStatus(true);
      }
    }, 300000);
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
}

// Initialize dashboard when auth is ready
window.dashboardController = new DashboardController();

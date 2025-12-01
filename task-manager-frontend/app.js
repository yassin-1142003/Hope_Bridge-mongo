// Task Manager Frontend Application
class TaskManager {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
        this.refreshInterval = null;
        this.users = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        
        if (this.token) {
            this.showDashboard();
            this.startAutoRefresh();
        } else {
            this.showLoginModal();
        }
    }

    setupEventListeners() {
        // Auth forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        
        // Task form
        document.getElementById('sendTaskForm').addEventListener('submit', (e) => this.handleSendTask(e));
    }

    // Authentication Methods
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await this.apiCall('/auth/login', 'POST', { email, password });
            
            if (response.success) {
                this.token = response.data.token;
                this.user = response.data.user;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                this.showDashboard();
                this.startAutoRefresh();
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                modal.hide();
                
                this.showAlert('Login successful!', 'success');
            } else {
                this.showAlert(response.message || 'Login failed', 'danger');
            }
        } catch (error) {
            this.showAlert('Login failed. Please try again.', 'danger');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;

        try {
            const response = await this.apiCall('/auth/register', 'POST', { name, email, password, role });
            
            if (response.success) {
                this.token = response.data.token;
                this.user = response.data.user;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                this.showDashboard();
                this.startAutoRefresh();
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                modal.hide();
                
                this.showAlert('Registration successful!', 'success');
            } else {
                this.showAlert(response.message || 'Registration failed', 'danger');
            }
        } catch (error) {
            this.showAlert('Registration failed. Please try again.', 'danger');
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.token = null;
        this.user = {};
        this.stopAutoRefresh();
        
        // Show login modal
        const modal = new bootstrap.Modal(document.getElementById('loginModal'));
        modal.show();
        
        // Clear dashboard
        document.getElementById('userInfo').textContent = '';
        document.getElementById('sentTasksList').innerHTML = '<div class="text-center text-muted py-4"><i class="bi bi-inbox fs-1"></i><p>Please login to view tasks</p></div>';
        document.getElementById('receivedTasksList').innerHTML = '<div class="text-center text-muted py-4"><i class="bi bi-inbox fs-1"></i><p>Please login to view tasks</p></div>';
        
        // Hide alert section
        document.getElementById('alertSection').classList.add('hidden');
    }

    // Dashboard Methods
    showDashboard() {
        document.getElementById('userInfo').textContent = `${this.user.name} (${this.user.role})`;
        this.loadTasks();
        this.loadUsers();
    }

    showLoginModal() {
        const modal = new bootstrap.Modal(document.getElementById('loginModal'));
        modal.show();
    }

    // Task Management Methods
    async loadTasks() {
        try {
            const [sentResponse, receivedResponse, newTasksResponse] = await Promise.all([
                this.apiCall('/tasks/sent', 'GET'),
                this.apiCall('/tasks/received', 'GET'),
                this.apiCall('/tasks/new', 'GET')
            ]);

            if (sentResponse.success) {
                this.displayTasks(sentResponse.data.tasks, 'sentTasksList', 'sent');
                document.getElementById('sentTaskCount').textContent = sentResponse.data.count;
            }

            if (receivedResponse.success) {
                this.displayTasks(receivedResponse.data.tasks, 'receivedTasksList', 'received');
                document.getElementById('receivedTaskCount').textContent = receivedResponse.data.count;
            }

            if (newTasksResponse.success && newTasksResponse.data.count > 0) {
                this.showNewTasksAlert(newTasksResponse.data.count);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    async loadUsers() {
        try {
            // For demo purposes, we'll create some sample users
            // In a real app, you'd have an endpoint to get all users
            const select = document.getElementById('taskReceiver');
            select.innerHTML = '<option value="">Select a user...</option>';
            
            // Add sample users (in production, fetch from API)
            const sampleUsers = [
                { id: 'sample1', name: 'John Doe', email: 'john@example.com' },
                { id: 'sample2', name: 'Jane Smith', email: 'jane@example.com' },
                { id: 'sample3', name: 'Bob Johnson', email: 'bob@example.com' }
            ];
            
            sampleUsers.forEach(user => {
                if (user.email !== this.user.email) {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${user.name} (${user.email})`;
                    select.appendChild(option);
                }
            });
            
            this.users = sampleUsers;
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    displayTasks(tasks, containerId, type) {
        const container = document.getElementById(containerId);
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1"></i>
                    <p>No ${type} tasks yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => this.createTaskCard(task, type)).join('');
    }

    createTaskCard(task, type) {
        const otherPerson = type === 'sent' ? task.receiver : task.sender;
        const date = new Date(task.createdAt).toLocaleDateString();
        const attachmentIcon = task.attachment ? '<i class="bi bi-paperclip"></i>' : '';
        
        return `
            <div class="task-card fade-in" onclick="taskManager.showTaskDetails('${task._id}')">
                <div class="task-card-header">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <div class="task-${type === 'sent' ? 'receiver' : 'sender'}">
                            <i class="bi bi-person me-1"></i>${otherPerson.name}
                        </div>
                        <div class="task-date">
                            <i class="bi bi-calendar me-1"></i>${date}
                        </div>
                    </div>
                </div>
                <div class="task-card-body">
                    <div class="task-status status-${task.status}">
                        ${task.status.replace('-', ' ')}
                    </div>
                    ${attachmentIcon ? `
                        <div class="task-attachment">
                            <span class="attachment-badge">
                                ${attachmentIcon} Attachment
                            </span>
                        </div>
                    ` : ''}
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-eye me-1"></i>Show Task
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async handleSendTask(e) {
        e.preventDefault();
        
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const receiver = document.getElementById('taskReceiver').value;
        const attachmentFile = document.getElementById('taskAttachment').files[0];
        
        if (!receiver) {
            this.showAlert('Please select a receiver', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('receiver', receiver);
        if (attachmentFile) {
            formData.append('attachment', attachmentFile);
        }

        try {
            const response = await this.apiCall('/tasks/send', 'POST', formData, true);
            
            if (response.success) {
                this.showAlert('Task sent successfully!', 'success');
                document.getElementById('sendTaskForm').reset();
                this.loadTasks();
            } else {
                this.showAlert(response.message || 'Failed to send task', 'danger');
            }
        } catch (error) {
            this.showAlert('Failed to send task. Please try again.', 'danger');
        }
    }

    async showTaskDetails(taskId) {
        try {
            const response = await this.apiCall(`/tasks/${taskId}`, 'GET');
            
            if (response.success) {
                const task = response.data.task;
                this.displayTaskModal(task);
            } else {
                this.showAlert('Failed to load task details', 'danger');
            }
        } catch (error) {
            this.showAlert('Failed to load task details', 'danger');
        }
    }

    displayTaskModal(task) {
        const modalTitle = document.getElementById('taskModalTitle');
        const modalBody = document.getElementById('taskModalBody');
        const modalFooter = document.getElementById('taskModalFooter');
        
        modalTitle.textContent = task.title;
        
        const createdDate = new Date(task.createdAt).toLocaleString();
        const updatedDate = new Date(task.updatedAt).toLocaleString();
        
        modalBody.innerHTML = `
            <div class="task-detail-section">
                <div class="task-detail-label">Description</div>
                <div class="task-detail-value">${task.description}</div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="task-detail-section">
                        <div class="task-detail-label">Sender</div>
                        <div class="task-detail-value">
                            <i class="bi bi-person me-1"></i>${task.sender.name} (${task.sender.email})
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="task-detail-section">
                        <div class="task-detail-label">Receiver</div>
                        <div class="task-detail-value">
                            <i class="bi bi-person me-1"></i>${task.receiver.name} (${task.receiver.email})
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="task-detail-section">
                        <div class="task-detail-label">Status</div>
                        <div class="task-status status-${task.status}">
                            ${task.status.replace('-', ' ')}
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="task-detail-section">
                        <div class="task-detail-label">Created</div>
                        <div class="task-detail-value">${createdDate}</div>
                    </div>
                </div>
            </div>
            
            ${task.attachment ? `
                <div class="task-detail-section">
                    <div class="task-detail-label">Attachment</div>
                    <a href="${this.baseURL}/uploads/${task.attachment}" 
                       class="btn btn-outline-primary btn-sm" 
                       target="_blank">
                        <i class="bi bi-download me-1"></i>Download Attachment
                    </a>
                </div>
            ` : ''}
            
            <div class="task-detail-section">
                <div class="task-detail-label">Last Updated</div>
                <div class="task-detail-value">${updatedDate}</div>
            </div>
        `;
        
        // Add status update buttons if user is the receiver
        if (task.receiver._id === this.user.id) {
            modalFooter.innerHTML = `
                <div class="me-auto">
                    <small class="text-muted">Update Status:</small>
                    <div class="mt-2">
                        <button class="btn btn-sm status-update-btn ${task.status === 'pending' ? 'btn-warning' : 'btn-outline-warning'}" 
                                onclick="taskManager.updateTaskStatus('${task._id}', 'pending')"
                                ${task.status === 'pending' ? 'disabled' : ''}>
                            <i class="bi bi-clock me-1"></i>Pending
                        </button>
                        <button class="btn btn-sm status-update-btn ${task.status === 'in-progress' ? 'btn-info' : 'btn-outline-info'}" 
                                onclick="taskManager.updateTaskStatus('${task._id}', 'in-progress')"
                                ${task.status === 'in-progress' ? 'disabled' : ''}>
                            <i class="bi bi-arrow-repeat me-1"></i>In Progress
                        </button>
                        <button class="btn btn-sm status-update-btn ${task.status === 'done' ? 'btn-success' : 'btn-outline-success'}" 
                                onclick="taskManager.updateTaskStatus('${task._id}', 'done')"
                                ${task.status === 'done' ? 'disabled' : ''}>
                            <i class="bi bi-check-circle me-1"></i>Done
                        </button>
                    </div>
                </div>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            `;
        } else {
            modalFooter.innerHTML = `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            `;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('taskModal'));
        modal.show();
    }

    async updateTaskStatus(taskId, newStatus) {
        try {
            const response = await this.apiCall(`/tasks/${taskId}/status`, 'PATCH', { status: newStatus });
            
            if (response.success) {
                this.showAlert('Task status updated successfully!', 'success');
                this.loadTasks();
                
                // Update modal content
                this.showTaskDetails(taskId);
            } else {
                this.showAlert(response.message || 'Failed to update status', 'danger');
            }
        } catch (error) {
            this.showAlert('Failed to update task status', 'danger');
        }
    }

    showNewTasksAlert(count) {
        const alertSection = document.getElementById('alertSection');
        const newTaskCount = document.getElementById('newTaskCount');
        
        newTaskCount.textContent = count;
        alertSection.classList.remove('hidden');
        alertSection.classList.add('new-task-alert');
    }

    async showNewTasksModal() {
        try {
            const response = await this.apiCall('/tasks/new', 'GET');
            
            if (response.success) {
                const tasks = response.data.tasks;
                const modalBody = document.getElementById('newTasksModalBody');
                
                if (tasks.length === 0) {
                    modalBody.innerHTML = '<p class="text-muted">No new tasks.</p>';
                } else {
                    modalBody.innerHTML = tasks.map(task => `
                        <div class="task-card mb-2" onclick="taskManager.showTaskDetails('${task._id}')">
                            <div class="task-card-header">
                                <div class="task-title">${task.title}</div>
                                <div class="task-meta">
                                    <div class="task-sender">
                                        <i class="bi bi-person me-1"></i>${task.sender.name}
                                    </div>
                                    <div class="task-date">
                                        <i class="bi bi-calendar me-1"></i>${new Date(task.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
                
                const modal = new bootstrap.Modal(document.getElementById('newTasksModal'));
                modal.show();
                
                // Hide the alert after viewing
                document.getElementById('alertSection').classList.add('hidden');
            }
        } catch (error) {
            this.showAlert('Failed to load new tasks', 'danger');
        }
    }

    // Auto-refresh functionality
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.loadTasks();
        }, 10000); // Refresh every 10 seconds
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Utility Methods
    async apiCall(endpoint, method = 'GET', data = null, isFormData = false) {
        const config = {
            method,
            headers: {}
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (!isFormData && data) {
            config.headers['Content-Type'] = 'application/json';
            config.body = JSON.stringify(data);
        } else if (data) {
            config.body = data;
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, config);
        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Request failed');
        }

        return responseData;
    }

    showAlert(message, type = 'info') {
        // Create alert container if it doesn't exist
        let alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'alertContainer';
            alertContainer.style.position = 'fixed';
            alertContainer.style.top = '20px';
            alertContainer.style.right = '20px';
            alertContainer.style.zIndex = '9999';
            document.body.appendChild(alertContainer);
        }

        const alertId = 'alert-' + Date.now();
        const alertHTML = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        alertContainer.insertAdjacentHTML('beforeend', alertHTML);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
                bsAlert.close();
            }
        }, 5000);
    }
}

// Initialize the application
const taskManager = new TaskManager();

// Global function for logout
function logout() {
    taskManager.logout();
}

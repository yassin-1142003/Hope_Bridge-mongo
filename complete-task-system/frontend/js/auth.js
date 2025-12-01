// Authentication System
class AuthSystem {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.baseURL = 'http://localhost:5000/api';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkAuthStatus();
  }

  setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.login();
    });

    // Register form
    document.getElementById('registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.register();
    });

    // Show/hide forms
    document.getElementById('showRegister').addEventListener('click', (e) => {
      e.preventDefault();
      this.showRegisterForm();
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
      e.preventDefault();
      this.showLoginForm();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      this.logout();
    });
  }

  checkAuthStatus() {
    if (this.token && this.user.id) {
      this.showDashboard();
    } else {
      this.showAuth();
    }
  }

  showAuth() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('dashboardContainer').style.display = 'none';
  }

  showDashboard() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    
    // Update user info
    document.getElementById('userName').textContent = this.user.name;
    
    // Initialize dashboard
    if (window.taskSystem) {
      window.taskSystem.init();
    }
  }

  showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
  }

  showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
  }

  async login() {
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
        this.showToast('Login successful!', 'success');
      } else {
        this.showToast(response.message || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showToast('Login failed. Please try again.', 'error');
    }
  }

  async register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const department = document.getElementById('registerDepartment').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    // Validation
    if (password !== confirmPassword) {
      this.showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      this.showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const response = await this.apiCall('/auth/register', 'POST', {
        name,
        email,
        department,
        password
      });

      if (response.success) {
        this.token = response.data.token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        this.showDashboard();
        this.showToast('Registration successful!', 'success');
      } else {
        this.showToast(response.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.showToast('Registration failed. Please try again.', 'error');
    }
  }

  logout() {
    // Call logout API
    this.apiCall('/auth/logout', 'POST').catch(console.error);
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    this.token = null;
    this.user = {};
    
    // Show auth screen
    this.showAuth();
    this.showToast('Logged out successfully', 'info');
    
    // Clear forms
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
  }

  async apiCall(endpoint, method = 'GET', data = null) {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    return await response.json();
  }

  showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    toast.style.cssText = `
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      animation: slideIn 0.3s ease;
    `;
    
    toast.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get auth token
  getToken() {
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.token && this.user.id);
  }

  // Check user role
  hasRole(role) {
    return this.user.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Check if user is manager
  isManager() {
    return this.hasRole('manager') || this.isAdmin();
  }
}

// Initialize auth system
window.authSystem = new AuthSystem();

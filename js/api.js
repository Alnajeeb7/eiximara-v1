/**
 * EIXIMARA API Client
 * Handles all communication with the backend server
 */

const API = {
  // Base URL - change this if your backend runs on a different port/host
  BASE_URL: '/api',

  // Get stored auth token
  getToken() {
    return localStorage.getItem('eiximara_token');
  },

  // Get stored user
  getUser() {
    const user = localStorage.getItem('eiximara_user');
    return user ? JSON.parse(user) : null;
  },

  // Save auth data
  saveAuth(token, user) {
    localStorage.setItem('eiximara_token', token);
    localStorage.setItem('eiximara_user', JSON.stringify(user));
  },

  // Clear auth data
  clearAuth() {
    localStorage.removeItem('eiximara_token');
    localStorage.removeItem('eiximara_user');
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getToken();
  },

  // Check if user is admin
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.BASE_URL}${endpoint}`;
    console.log(`[API] Request: ${options.method || "GET"} ${url}`);
    const token = this.getToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Make sure the backend is running.');
      }
      throw error;
    }
  },

  // =====================
  // AUTH ENDPOINTS
  // =====================

  async register(email, password, firstName, lastName) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: { email, password, firstName, lastName },
    });
    this.saveAuth(data.token, data.user);
    return data;
  },

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    this.saveAuth(data.token, data.user);
    return data;
  },

  async googleLogin(credential) {
    const data = await this.request('/auth/google', {
      method: 'POST',
      body: { credential },
    });
    this.saveAuth(data.token, data.user);
    return data;
  },

  async getCurrentUser() {
    return await this.request('/auth/me');
  },

  logout() {
    this.clearAuth();
    window.location.href = 'auth.html';
  },

  // =====================
  // PROJECT ENDPOINTS
  // =====================

  async getProjects() {
    return await this.request('/projects');
  },

  async getProject(id) {
    return await this.request(`/projects/${id}`);
  },

  async createProject(projectType, description, budget, timeline) {
    return await this.request('/projects', {
      method: 'POST',
      body: { projectType, description, budget, timeline },
    });
  },

  async submitPayment(projectId, paymentUrl) {
    return await this.request(`/projects/${projectId}/payment`, {
      method: 'POST',
      body: { paymentUrl },
    });
  },

  // =====================
  // MESSAGE ENDPOINTS
  // =====================

  async getMessages() {
    return await this.request('/messages');
  },

  async getProjectMessages(projectId) {
    return await this.request(`/messages/project/${projectId}`);
  },

  async sendMessage(projectId, content) {
    return await this.request('/messages', {
      method: 'POST',
      body: { projectId, content },
    });
  },

  async getUnreadCount() {
    return await this.request('/messages/unread/count');
  },

  // =====================
  // ADMIN ENDPOINTS
  // =====================

  async getStats() {
    return await this.request('/admin/stats');
  },

  async updateProjectStatus(projectId, status, progress, description) {
    return await this.request(`/admin/projects/${projectId}/status`, {
      method: 'PUT',
      body: { status, progress, description },
    });
  },

  async verifyPayment(projectId) {
    return await this.request(`/admin/projects/${projectId}/verify-payment`, {
      method: 'PUT',
    });
  },

  async setPaymentAmount(projectId, amount) {
    return await this.request(`/admin/projects/${projectId}/payment-amount`, {
      method: 'PUT',
      body: { amount },
    });
  },

  async deliverProject(projectId, projectUrl, githubRepo) {
    return await this.request(`/admin/projects/${projectId}/deliver`, {
      method: 'PUT',
      body: { projectUrl, githubRepo },
    });
  },

  async transferGitHub(projectId) {
    return await this.request(`/admin/projects/${projectId}/transfer-github`, {
      method: 'PUT',
    });
  },

  async getUsers() {
    return await this.request('/admin/users');
  },

  // =====================
  // HEALTH CHECK
  // =====================

  async checkHealth() {
    try {
      const data = await this.request('/health');
      return { online: true, ...data };
    } catch (error) {
      return { online: false, error: error.message };
    }
  },
};

// Make API available globally
window.API = API;

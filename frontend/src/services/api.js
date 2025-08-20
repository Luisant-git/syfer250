const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  // Campaign methods
  async getCampaigns() {
    return this.request('/campaigns');
  }

  async getCampaign(id) {
    return this.request(`/campaigns/${id}`);
  }

  async createCampaign(campaignData) {
    return this.request('/campaigns', {
      method: 'POST',
      body: campaignData,
    });
  }

  async updateCampaign(id, campaignData) {
    return this.request(`/campaigns/${id}`, {
      method: 'PUT',
      body: campaignData,
    });
  }

  async deleteCampaign(id) {
    return this.request(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  // Sender methods
  async getSenders() {
    return this.request('/senders');
  }

  async createSender(senderData) {
    return this.request('/senders', {
      method: 'POST',
      body: senderData,
    });
  }

  async updateSender(id, senderData) {
    return this.request(`/senders/${id}`, {
      method: 'PUT',
      body: senderData,
    });
  }

  async deleteSender(id) {
    return this.request(`/senders/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics methods
  async getDashboardStats() {
    return this.request('/analytics/dashboard');
  }

  async getCampaignAnalytics(campaignId) {
    return this.request(`/analytics/campaign/${campaignId}`);
  }

  // User methods
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(userData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: userData,
    });
  }

  // Settings methods
  async getSettings() {
    return this.request('/user/settings');
  }

  async updateSettings(settingsData) {
    return this.request('/user/settings', {
      method: 'PUT',
      body: settingsData,
    });
  }

  async updatePassword(passwordData) {
    return this.request('/user/password', {
      method: 'PUT',
      body: passwordData,
    });
  }

  // Block List methods
  async getBlockList(search = '', source = 'all') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (source !== 'all') params.append('source', source);
    
    return this.request(`/blocklist?${params.toString()}`);
  }

  async getBlockListStats() {
    return this.request('/blocklist/stats');
  }

  async addToBlockList(email, reason) {
    return this.request('/blocklist', {
      method: 'POST',
      body: { email, reason },
    });
  }

  async bulkAddToBlockList(emails, reason = 'Bulk import') {
    return this.request('/blocklist/bulk', {
      method: 'POST',
      body: { emails, reason },
    });
  }

  async removeFromBlockList(id) {
    return this.request(`/blocklist/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkRemoveFromBlockList(ids) {
    return this.request('/blocklist/bulk/remove', {
      method: 'DELETE',
      body: { ids },
    });
  }

  // Inbox methods
  async getEmailAccounts() {
    return this.request('/inbox/accounts');
  }

  async addEmailAccount(email, provider, settings = {}) {
    return this.request('/inbox/accounts', {
      method: 'POST',
      body: { email, provider, settings },
    });
  }

  async getEmails(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key].toString());
      }
    });
    
    return this.request(`/inbox/emails?${searchParams.toString()}`);
  }

  async getEmail(id) {
    return this.request(`/inbox/emails/${id}`);
  }

  async updateEmail(id, updates) {
    return this.request(`/inbox/emails/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async bulkUpdateEmails(emailIds, updates) {
    return this.request('/inbox/emails/bulk', {
      method: 'PUT',
      body: { emailIds, updates },
    });
  }

  async deleteEmails(emailIds) {
    return this.request('/inbox/emails', {
      method: 'DELETE',
      body: { emailIds },
    });
  }

  async getFolders() {
    return this.request('/inbox/folders');
  }

  async syncEmails(accountId) {
    return this.request(`/inbox/accounts/${accountId}/sync`, {
      method: 'POST',
    });
  }
}

export default new ApiService();
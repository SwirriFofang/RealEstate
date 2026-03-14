// API Service for LandInvest Backend
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token') || null;
  }

  // Helper method for API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const config = {
      headers: {
        ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const validatorMsg = Array.isArray(data?.errors) && data.errors.length > 0 ? data.errors[0]?.msg : '';
        throw new Error(validatorMsg || data?.error || data?.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);

      // Network-layer failures (no HTTP response) often surface as TypeError: Failed to fetch.
      // Provide a clearer hint to help debugging local dev proxy/backend connectivity.
      const msg = String(error?.message || "");
      if (
        error?.name === 'TypeError' &&
        (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror'))
      ) {
        throw new Error(
          'Backend not reachable. Make sure the backend server is running on http://localhost:5000 and the Vite dev server proxy is enabled.'
        );
      }

      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // User methods
  async getUserProfile() {
    return await this.request('/users/profile');
  }

  async updateUserProfile(userData) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(passwordData) {
    return await this.request('/users/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Listings methods
  async getListings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/listings?${queryString}` : '/listings';
    return await this.request(endpoint);
  }

  async getListing(id) {
    return await this.request(`/listings/${id}`);
  }

  async createListing(listingData) {
    return await this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async updateListing(id, listingData) {
    return await this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  }

  async deleteListing(id) {
    return await this.request(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyListings() {
    return await this.request('/listings/my-listings');
  }

  async extendListingDuration(id, days) {
    return await this.request(`/listings/${id}/extend`, {
      method: 'PUT',
      body: JSON.stringify({ days }),
    });
  }

  // Investments methods
  async getInvestments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/investments?${queryString}` : '/investments';
    return await this.request(endpoint);
  }

  async getMyInvestments() {
    return await this.request('/investments/my-investments');
  }

  async createInvestment(investmentData) {
    return await this.request('/investments', {
      method: 'POST',
      body: JSON.stringify(investmentData),
    });
  }

  async confirmInvestment(id) {
    return await this.request(`/investments/${id}/confirm`, {
      method: 'PUT',
    });
  }

  async getListingInvestments(listingId) {
    return await this.request(`/investments/listing/${listingId}`);
  }

  // File upload methods
  async uploadListingFile(listingId, file) {
    const formData = new FormData();
    formData.append('files', file);

    return await this.request(`/upload/listing/${listingId}`, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async uploadListingFiles(listingId, files) {
    const formData = new FormData();
    (Array.isArray(files) ? files : []).forEach((file) => {
      if (file) {
        formData.append('files', file);
      }
    });

    return await this.request(`/upload/listing/${listingId}`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async deleteFile(fileId) {
    return await this.request(`/upload/file/${fileId}`, {
      method: 'DELETE',
    });
  }

  async getListingFiles(listingId) {
    return await this.request(`/upload/listing/${listingId}`);
  }

  // Health check
  async healthCheck() {
    return await this.request('/health');
  }

  // Get file URL
  getFileUrl(filename) {
    if (!filename) return '';

    // If backend stored an absolute-ish path like `/uploads/<generated-name>`
    // serve it from the static uploads route.
    if (typeof filename === 'string' && filename.startsWith('/uploads/')) {
      return filename;
    }

    // Legacy behavior: protected route that serves by filename.
    return `${this.baseURL}/upload/serve/${filename}`;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

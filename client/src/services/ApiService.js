// client/src/services/ApiService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds timeout
    });
    
    // Get token from localStorage if it exists
    this.token = localStorage.getItem('github_token');
    if (this.token) {
      this.setAuthHeader(this.token);
    }

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
          this.removeAuthHeader();
          window.location.reload();
        }
        throw error;
      }
    );
  }

  setAuthHeader(token) {
    this.token = token;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('github_token', token);
  }

  removeAuthHeader() {
    delete this.api.defaults.headers.common['Authorization'];
    localStorage.removeItem('github_token');
    this.token = null;
  }

  async authenticateGitHub(token) {
    try {
      const response = await this.api.post('/auth/github', { token });
      if (response.data.success) {
        this.setAuthHeader(token);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Authentication failed');
    }
  }

  async getRepositories() {
    try {
      const response = await this.api.get('/repositories');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch repositories');
    }
  }

  async getRepositoryFiles(owner, repo) {
    try {
      const response = await this.api.get(`/repositories/${owner}/${repo}/files`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch repository files');
    }
  }

  async getFileContent(owner, repo, path) {
    try {
      const response = await this.api.get(`/repositories/${owner}/${repo}/files/${path}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch file content');
    }
  }

  async generateTestSummaries(files, repository) {
    try {
      const response = await this.api.post('/generate/summaries', { 
        files, 
        repository 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate test summaries');
    }
  }

  async generateTestCode(summary, files, repository) {
    try {
      const response = await this.api.post('/generate/code', { 
        summary, 
        files, 
        repository 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate test code');
    }
  }

  async createPullRequest(repository, testCode, filename, title, description) {
    try {
      const response = await this.api.post('/create-pr', {
        repository,
        testCode,
        filename,
        title,
        description
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create pull request');
    }
  }

  // Utility method to check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Utility method to get current token
  getToken() {
    return this.token;
  }
}

export default new ApiService();
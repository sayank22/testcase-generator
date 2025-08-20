// client/src/services/ApiService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      withCredentials: true, // keep cookies/sessions if used
    });

    this.token = localStorage.getItem('github_token');
    if (this.token) {
      this.setAuthHeader(this.token);
    }

    // Interceptor to handle errors globally
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
          this.removeAuthHeader();
          window.location.href = '/login'; // redirect if unauthorized
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

  /**
   * OAuth Step 2: Exchange GitHub "code" for access token
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await this.api.get(`/auth/github/callback?code=${code}`);
      const { token } = response.data;
      if (token) {
        this.setAuthHeader(token);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'GitHub OAuth exchange failed');
    }
  }

  // ✅ All endpoints prefixed with /api
  async getRepositories() {
    const { data } = await this.api.get('/repositories');
    return data;
  }

  async getRepositoryFiles(owner, repo) {
    const { data } = await this.api.get(`/repositories/${owner}/${repo}/files`);
    return data;
  }

  async getFileContent(owner, repo, path) {
    const { data } = await this.api.get(`/repositories/${owner}/${repo}/files/${encodeURIComponent(path)}`);
    return data;
  }

  async generateTestSummaries(files, repository) {
    const { data } = await this.api.post('/generate/summaries', { files, repository });
    return data;
  }

  async generateTestCode(summary, files, repository) {
    const { data } = await this.api.post('/generate/code', { summary, files, repository });
    return data;
  }

  async createPullRequest(repository, testCode, filename, title, description) {
    const { data } = await this.api.post('/pr', {
      repository,
      testCode,
      filename,
      title,
      description,
    });
    return data;
  }

  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }
}

export default new ApiService();

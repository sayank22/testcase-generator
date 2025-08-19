// hooks/useTestCaseFlow.js
import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

export const useTestCaseFlow = () => {
  // State
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [testSummaries, setTestSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');

  // Initialize authentication
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    // Check localStorage first
    const localToken = localStorage.getItem('github_token');
    if (localToken) {
      ApiService.setAuthHeader(localToken);
      setAuthenticated(true);
      setCurrentStep(2);
      loadRepositories();
      return;
    }

    // Parse query params for sessionId
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('sessionId') || params.get('token');

    if (sessionId) {
      ApiService.setAuthHeader(sessionId);
      setAuthenticated(true);
      setCurrentStep(2);
      loadRepositories();

      // Clean up URL
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  };

  const loadRepositories = async () => {
    try {
      setLoading(true);
      setError('');
      const repos = await ApiService.getRepositories();
      setRepositories(repos);
    } catch (err) {
      console.error(err);
      setError('Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  const startGitHubOAuth = () => {
    const backendBase = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    window.location.href = `${backendBase}/api/auth/github/start`;
  };

  const handleRepoSelect = async (repo) => {
    try {
      setSelectedRepo(repo);
      setLoading(true);
      setError('');

      const [owner, repoName] = repo.full_name.split('/');
      const repoFiles = await ApiService.getRepositoryFiles(owner, repoName);

      setFiles(repoFiles);
      setCurrentStep(3);
    } catch (error) {
      console.error(error);
      setError('Failed to load repository files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileToggle = (file) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.path === file.path);
      if (isSelected) {
        return prev.filter(f => f.path !== file.path);
      } else {
        return [...prev, file];
      }
    });
  };

  const generateTestSummaries = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const ownerRepo = selectedRepo.full_name.split('/');
      const payload = {
        owner: ownerRepo[0],
        repo: ownerRepo[1],
        files: selectedFiles.map(f => f.path)
      };

      const response = await ApiService.api.post('/repositories/generate-summaries', payload);
      setTestSummaries(response.data.summaries || []);
      setCurrentStep(4);
    } catch (err) {
      console.error(err);
      setError('Failed to generate test summaries');
    } finally {
      setLoading(false);
    }
  };

  const generateTestCode = async (summary) => {
    try {
      setSelectedSummary(summary);
      setLoading(true);
      setError('');

      const ownerRepo = selectedRepo.full_name.split('/');
      const payload = {
        owner: ownerRepo[0],
        repo: ownerRepo[1],
        summary,
        files: selectedFiles.map(f => f.path)
      };

      const response = await ApiService.api.post('/repositories/generate-code', payload);
      setGeneratedCode(response.data.code || response.data);
      setCurrentStep(5);
    } catch (err) {
      console.error(err);
      setError('Failed to generate test code');
    } finally {
      setLoading(false);
    }
  };

  const createPullRequest = async () => {
    try {
      setLoading(true);
      setError('');

      const ownerRepo = selectedRepo.full_name.split('/');
      const filename = `${selectedSummary.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.test.js`;
      const filePath = `tests/${filename}`;

      const payload = {
        owner: ownerRepo[0],
        repo: ownerRepo[1],
        branch: 'main',
        filePath,
        code: generatedCode
      };

      const response = await ApiService.api.post('/repositories/create-pr', payload);
      const prUrl = response.data.prUrl || response.data.html_url || response.data.url;
      alert(`Pull Request created successfully! ${prUrl}`);
    } catch (err) {
      console.error(err);
      setError('Failed to create pull request');
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    repositories,
    selectedRepo,
    files,
    selectedFiles,
    testSummaries,
    selectedSummary,
    generatedCode,
    loading,
    authenticated,
    currentStep,
    error,
    // Actions
    setSelectedFiles,
    handleRepoSelect,
    handleFileToggle,
    generateTestSummaries,
    generateTestCode,
    createPullRequest,
    startGitHubOAuth,
    setError
  };
};
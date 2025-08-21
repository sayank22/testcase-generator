// client/src/hooks/useTestCaseFlow.js - Key improvements only
import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

export const useTestCaseFlow = () => {
  // ✅ Keep all your existing state exactly the same
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

  // ✅ Keep your existing useEffect
  useEffect(() => {
    initializeAuth();
  }, []);

  // ✅ Keep your existing initializeAuth - it works fine!
  const initializeAuth = () => {
    const localToken = localStorage.getItem('github_token');
    if (localToken) {
      ApiService.setAuthHeader(localToken);
      setAuthenticated(true);
      setCurrentStep(2);
      loadRepositories();
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('sessionId') || params.get('token');

    if (sessionId) {
      ApiService.setAuthHeader(sessionId);
      setAuthenticated(true);
      setCurrentStep(2);
      loadRepositories();

      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  };

  // ✅ Enhanced error handling for loadRepositories
  const loadRepositories = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const repos = await ApiService.getRepositories();
      setRepositories(repos);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load repositories';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Keep your existing startGitHubOAuth
  const startGitHubOAuth = () => {
    const backendBase = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    window.location.href = `${backendBase}/api/auth/github/start`;
  };

  // ✅ Enhanced validation for generateTestSummaries
  const generateTestSummaries = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    if (selectedFiles.length > 10) {
      setError('Please select no more than 10 files to avoid AI token limits');
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
      const summaries = response.data.summaries || response.data || [];
      
      if (!Array.isArray(summaries) || summaries.length === 0) {
        throw new Error('No test summaries were generated. The AI might not have found suitable test cases for these files.');
      }

      setTestSummaries(summaries);
      setCurrentStep(4);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to generate test summaries';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enhanced validation for generateTestCode
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
      const code = response.data.code || response.data;
      
      if (!code || typeof code !== 'string') {
        throw new Error('Invalid test code generated');
      }

      setGeneratedCode(code);
      setCurrentStep(5);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to generate test code';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enhanced createPullRequest with better success feedback
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
      
      if (prUrl) {
        alert(`🎉 Pull Request created successfully!\n\nView it here: ${prUrl}`);
      } else {
        alert('✅ Pull Request created successfully!');
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to create pull request';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Keep all your existing functions: handleRepoSelect, handleFileToggle, etc.
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
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load repository files';
      setError(errorMsg);
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

  return {
    // State - keep exactly as you have
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
    // Actions - keep exactly as you have
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
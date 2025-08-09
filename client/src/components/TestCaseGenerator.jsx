// client/src/components/TestCaseGenerator.jsx

import React, { useState, useEffect } from 'react';
import { Github, FileCode, Play, GitPullRequest, CheckSquare, Code, Loader2, AlertCircle, Plus } from 'lucide-react';
import ApiService from '../services/ApiService';

const TestCaseGenerator = () => {
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [testSummaries, setTestSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      setGithubToken(token);
      setAuthenticated(true);
      setCurrentStep(2);
      loadRepositories();
    }
  }, []);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      const repos = await ApiService.getRepositories();
      setRepositories(repos);
      setLoading(false);
    } catch (error) {
      setError('Failed to load repositories');
      setLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    if (!githubToken.trim()) {
      setError('Please enter a valid GitHub token');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const result = await ApiService.authenticateGitHub(githubToken);
      
      if (result.success) {
        setAuthenticated(true);
        setCurrentStep(2);
        await loadRepositories();
      } else {
        setError('Failed to authenticate with GitHub');
      }
    } catch (error) {
      setError('Invalid GitHub token or authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRepoSelect = async (repo) => {
    try {
      setSelectedRepo(repo);
      setLoading(true);
      
      const [owner, repoName] = repo.full_name.split('/');
      const repoFiles = await ApiService.getRepositoryFiles(owner, repoName);
      
      setFiles(repoFiles);
      setCurrentStep(3);
    } catch (error) {
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
      
      const summaries = await ApiService.generateTestSummaries(selectedFiles, selectedRepo);
      setTestSummaries(summaries);
      setCurrentStep(4);
    } catch (error) {
      setError('Failed to generate test summaries');
    } finally {
      setLoading(false);
    }
  };

  const generateTestCode = async (summary) => {
    try {
      setSelectedSummary(summary);
      setLoading(true);
      
      const result = await ApiService.generateTestCode(summary, selectedFiles, selectedRepo);
      setGeneratedCode(result.code);
      setCurrentStep(5);
    } catch (error) {
      setError('Failed to generate test code');
    } finally {
      setLoading(false);
    }
  };

  const createPullRequest = async () => {
    try {
      setLoading(true);
      
      const title = `Add automated test cases: ${selectedSummary.title}`;
      const description = `Generated test cases for:\n\n${selectedSummary.description}\n\nFramework: ${selectedSummary.framework}\nTest Count: ${selectedSummary.testCount}`;
      
      await ApiService.createPullRequest(
        selectedRepo,
        generatedCode,
        `${selectedSummary.title.toLowerCase().replace(/\s+/g, '-')}.test.js`,
        title,
        description
      );
      
      alert('Pull Request created successfully! 🎉');
    } catch (error) {
      setError('Failed to create pull request');
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = ({ step, title, completed }) => (
    <div className={`flex items-center ${completed ? 'text-green-600' : step === currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
        completed ? 'bg-green-600 border-green-600 text-white' : 
        step === currentStep ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
      }`}>
        {completed ? <CheckSquare className="w-4 h-4" /> : step}
      </div>
      <span className="ml-2 font-medium">{title}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Test Case Generator</h1>
                <p className="text-gray-600">Generate automated test cases for your GitHub repositories</p>
              </div>
            </div>
            {authenticated && (
              <div className="text-sm text-green-600 flex items-center">
                <CheckSquare className="w-4 h-4 mr-1" />
                Connected to GitHub
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <StepIndicator step={1} title="GitHub Auth" completed={authenticated} />
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <StepIndicator step={2} title="Select Repo" completed={currentStep > 2} />
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <StepIndicator step={3} title="Choose Files" completed={currentStep > 3} />
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <StepIndicator step={4} title="Test Summaries" completed={currentStep > 4} />
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <StepIndicator step={5} title="Generate & PR" completed={currentStep > 5} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Step 1: GitHub Authentication */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Connect to GitHub</h2>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Personal Access Token
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Need a token? <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Create one here</a>
              </p>
              <button
                onClick={handleGitHubAuth}
                disabled={loading}
                className="mt-4 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Github className="w-4 h-4 mr-2" />
                )}
                Connect GitHub
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Repository Selection */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Select Repository</h2>
            <div className="grid gap-4">
              {repositories.map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => handleRepoSelect(repo)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileCode className="w-5 h-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium text-gray-900">{repo.name}</h3>
                        <p className="text-sm text-gray-600">{repo.full_name}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {repo.language}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: File Selection */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              Select Files for Test Generation
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({selectedRepo?.name})
              </span>
            </h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Choose the files you want to generate test cases for:</p>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <label key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFiles.some(f => f.path === file.path)}
                      onChange={() => handleFileToggle(file)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Code className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{file.path}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {file.language}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {selectedFiles.length} file(s) selected
              </span>
              <button
                onClick={generateTestSummaries}
                disabled={loading || selectedFiles.length === 0}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Generate Test Summaries
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Test Summaries */}
        {currentStep === 4 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Generated Test Case Summaries</h2>
            <div className="space-y-4">
              {testSummaries.map((summary) => (
                <div key={summary.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{summary.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{summary.description}</p>
                    </div>
                    <button
                      onClick={() => generateTestCode(summary)}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center text-sm"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Generate Code
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Framework: {summary.framework}</span>
                    <span>Tests: {summary.testCount}</span>
                    <span>Files: {summary.files.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Generated Code & PR */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Generated Test Code</h2>
                <button
                  onClick={createPullRequest}
                  disabled={loading}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <GitPullRequest className="w-4 h-4 mr-2" />
                  )}
                  Create Pull Request
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-3">Test Summary</h3>
              {selectedSummary && (
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {selectedSummary.title}</p>
                  <p><strong>Framework:</strong> {selectedSummary.framework}</p>
                  <p><strong>Test Count:</strong> {selectedSummary.testCount}</p>
                  <p><strong>Files Covered:</strong> {selectedSummary.files.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && currentStep > 1 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-900">
                {currentStep === 2 ? 'Fetching repositories...' :
                 currentStep === 3 ? 'Loading files...' :
                 currentStep === 4 ? 'Generating test summaries...' :
                 currentStep === 5 ? 'Generating test code...' : 'Processing...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCaseGenerator;
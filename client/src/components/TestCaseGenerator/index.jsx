import React, { useState, useEffect } from 'react';
import { Github, CheckSquare } from 'lucide-react';
import ApiService from '../../services/ApiService';
import ProgressSteps from './ProgressSteps';
import AuthSection from './AuthSection';
import RepositoryList from './RepositoryList';
import FileSelector from './FileSelector';
import TestSummaryList from './TestSummaryList';
import CodeGeneration from './CodeGeneration';
import ErrorDisplay from './ErrorDisplay';
import LoadingOverlay from './LoadingOverlay';
import SuccessNotification from './SuccessNotification';
import { useTestCaseFlow } from '../../hooks/useTestCaseFlow';

const TestCaseGenerator = () => {
  const [successNotification, setSuccessNotification] = React.useState({
    show: false,
    title: '',
    message: '',
    actionUrl: '',
    actionText: ''
  });

  const {
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
  } = useTestCaseFlow();

  const handleCreatePullRequest = async () => {
    try {
      const result = await createPullRequest();
      
      // Show success notification
      setSuccessNotification({
        show: true,
        title: 'Pull Request Created! 🎉',
        message: 'Your test cases have been successfully submitted to GitHub.',
        actionUrl: result?.prUrl || result?.html_url || result?.url,
        actionText: 'View Pull Request'
      });
    } catch (error) {
      // Error is already handled in the hook
      console.error('PR creation failed:', error);
    }
  };

  const handleCloseSuccessNotification = () => {
    setSuccessNotification(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="relative">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                    <Github className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Test Case Generator
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base lg:text-lg">
                    Generate automated test cases for your GitHub repositories with AI
                  </p>
                </div>
              </div>

              <div className="flex justify-center sm:justify-end">
                <AuthSection 
                  authenticated={authenticated}
                  onStartOAuth={startGitHubOAuth}
                />
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <ProgressSteps currentStep={currentStep} authenticated={authenticated} />

          {/* Error Display */}
          <ErrorDisplay error={error} />

          {/* Step-based Content with smooth transitions */}
          <div className="transition-all duration-500 ease-in-out">
            {currentStep === 2 && (
              <div className="animate-fade-in">
                <RepositoryList 
                  repositories={repositories}
                  onRepoSelect={handleRepoSelect}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-fade-in">
                <FileSelector
                  selectedRepo={selectedRepo}
                  files={files}
                  selectedFiles={selectedFiles}
                  onFileToggle={handleFileToggle}
                  onGenerateTestSummaries={generateTestSummaries}
                  loading={loading}
                />
              </div>
            )}

            {currentStep === 4 && (
              <div className="animate-fade-in">
                <TestSummaryList
                  testSummaries={testSummaries}
                  onGenerateTestCode={generateTestCode}
                />
              </div>
            )}

            {currentStep === 5 && (
              <div className="animate-fade-in">
                <CodeGeneration
                  generatedCode={generatedCode}
                  selectedSummary={selectedSummary}
                  onCreatePullRequest={handleCreatePullRequest}
                  loading={loading}
                />
              </div>
            )}
          </div>

          {/* Loading Overlay */}
          <LoadingOverlay loading={loading} currentStep={currentStep} />
          
          {/* Success Notification */}
          <SuccessNotification
            show={successNotification.show}
            title={successNotification.title}
            message={successNotification.message}
            actionUrl={successNotification.actionUrl}
            actionText={successNotification.actionText}
            onClose={handleCloseSuccessNotification}
          />
        </div>
      </div>
    </div>
  );
};

export default TestCaseGenerator;
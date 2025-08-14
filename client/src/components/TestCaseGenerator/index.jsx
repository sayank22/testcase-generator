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
import { useTestCaseFlow } from '../../hooks/useTestCaseFlow';

const TestCaseGenerator = () => {
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

            <AuthSection 
              authenticated={authenticated}
              onStartOAuth={startGitHubOAuth}
            />
          </div>
        </div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={currentStep} authenticated={authenticated} />

        {/* Error Display */}
        <ErrorDisplay error={error} />

        {/* Step-based Content */}
        {currentStep === 2 && (
          <RepositoryList 
            repositories={repositories}
            onRepoSelect={handleRepoSelect}
          />
        )}

        {currentStep === 3 && (
          <FileSelector
            selectedRepo={selectedRepo}
            files={files}
            selectedFiles={selectedFiles}
            onFileToggle={handleFileToggle}
            onGenerateTestSummaries={generateTestSummaries}
            loading={loading}
          />
        )}

        {currentStep === 4 && (
          <TestSummaryList
            testSummaries={testSummaries}
            onGenerateTestCode={generateTestCode}
          />
        )}

        {currentStep === 5 && (
          <CodeGeneration
            generatedCode={generatedCode}
            selectedSummary={selectedSummary}
            onCreatePullRequest={createPullRequest}
            loading={loading}
          />
        )}

        {/* Loading Overlay */}
        <LoadingOverlay loading={loading} currentStep={currentStep} />
      </div>
    </div>
  );
};

export default TestCaseGenerator;
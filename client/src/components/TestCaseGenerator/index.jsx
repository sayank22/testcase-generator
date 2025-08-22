import React from 'react';
import { Github } from 'lucide-react';
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
    setSelectedFiles,
    handleRepoSelect,
    handleFileToggle,
    generateTestSummaries,
    generateTestCode,
    createPullRequest,
    startGitHubOAuth,
  } = useTestCaseFlow();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-xl shadow-sm">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Test Case Generator
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Generate automated test cases for your GitHub repositories
                </p>
              </div>
            </div>

            {/* Auth */}
            <AuthSection 
              authenticated={authenticated}
              onStartOAuth={startGitHubOAuth}
            />
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm p-3 md:p-5 border border-gray-100">
          <ProgressSteps currentStep={currentStep} authenticated={authenticated} />
        </div>

        {/* Error */}
        <ErrorDisplay error={error} />

        {/* Steps */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100">
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
        </div>

        {/* Loading */}
        <LoadingOverlay loading={loading} currentStep={currentStep} />
      </div>
    </div>
  );
};

export default TestCaseGenerator;

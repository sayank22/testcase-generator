// components/TestCaseGenerator/LoadingOverlay.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, Github, FileCode, Brain, Code, GitPullRequest } from 'lucide-react';

const LoadingOverlay = ({ loading, currentStep }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!loading) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [loading]);

  if (!loading || currentStep <= 1) return null;

  const getLoadingInfo = () => {
    switch (currentStep) {
      case 2: 
        return {
          icon: Github,
          title: 'Fetching Repositories',
          message: 'Connecting to GitHub and loading your repositories',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 3: 
        return {
          icon: FileCode,
          title: 'Loading Files',
          message: 'Analyzing repository structure and source files',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50'
        };
      case 4: 
        return {
          icon: Brain,
          title: 'Generating Test Summaries',
          message: 'AI is analyzing your code and creating test strategies',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        };
      case 5: 
        return {
          icon: Code,
          title: 'Generating Test Code',
          message: 'Creating comprehensive test cases for your project',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 6:
        return {
          icon: GitPullRequest,
          title: 'Creating Pull Request',
          message: 'Submitting your generated tests to GitHub',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        };
      default: 
        return {
          icon: Loader2,
          title: 'Processing',
          message: 'Working on your request',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const { icon: Icon, title, message, color, bgColor } = getLoadingInfo();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-fade-in">
        {/* Loading Icon */}
        <div className={`${bgColor} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6`}>
          <Icon className={`w-8 h-8 ${color} ${Icon === Loader2 ? 'animate-spin' : 'animate-pulse'}`} />
        </div>
        
        {/* Title and Message */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {title}{dots}
          </h3>
          <p className="text-gray-600">
            {message}
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse`}
            style={{
              width: '100%',
              animation: 'loading-bar 2s ease-in-out infinite'
            }}
          ></div>
        </div>
        
        {/* AI Processing Indicator */}
        {(currentStep === 4 || currentStep === 5) && (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>AI is thinking</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;

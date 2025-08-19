// components/TestCaseGenerator/LoadingOverlay.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = ({ loading, currentStep }) => {
  if (!loading || currentStep <= 1) return null;

  const getLoadingMessage = () => {
    switch (currentStep) {
      case 2: return 'Fetching repositories...';
      case 3: return 'Loading files...';
      case 4: return 'Generating test summaries...';
      case 5: return 'Generating test code...';
      default: return 'Processing...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-gray-900">{getLoadingMessage()}</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;

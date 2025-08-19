// components/TestCaseGenerator/ErrorDisplay.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
      <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
      <span className="text-red-700">{error}</span>
    </div>
  );
};

export default ErrorDisplay;
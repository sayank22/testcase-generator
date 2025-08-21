// components/TestCaseGenerator/ErrorDisplay.jsx
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="p-1 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            Something went wrong
          </h3>
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-4 p-1 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
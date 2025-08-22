// components/TestCaseGenerator/CodeGeneration.jsx
import React from 'react';
import { GitPullRequest, Loader2 } from 'lucide-react';

const CodeGeneration = ({ generatedCode, selectedSummary, onCreatePullRequest, loading }) => {
  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4 sm:p-6">
      {/* Generated Test Code */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Generated Test Code</h2>
          <button
            onClick={onCreatePullRequest}
            disabled={loading}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center w-full sm:w-auto justify-center"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <GitPullRequest className="w-4 h-4 mr-2" />
            )}
            Create Pull Request
          </button>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[400px]">
          <pre className="text-green-400 text-xs sm:text-sm">
            <code>{generatedCode}</code>
          </pre>
        </div>
      </div>

      {/* Test Summary */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Test Summary</h3>
        {selectedSummary ? (
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Title:</strong> {selectedSummary.title}</p>
            <p><strong>Framework:</strong> {selectedSummary.framework}</p>
            <p><strong>Test Count:</strong> {selectedSummary.testCount}</p>
            <p><strong>Files Covered:</strong> {selectedSummary.files.join(', ')}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No summary selected yet.</p>
        )}
      </div>
    </div>
  );
};

export default CodeGeneration;

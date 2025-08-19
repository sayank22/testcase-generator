// components/TestCaseGenerator/CodeGeneration.jsx
import React from 'react';
import { GitPullRequest, Loader2 } from 'lucide-react';

const CodeGeneration = ({ generatedCode, selectedSummary, onCreatePullRequest, loading }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generated Test Code</h2>
          <button
            onClick={onCreatePullRequest}
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
  );
};

export default CodeGeneration;
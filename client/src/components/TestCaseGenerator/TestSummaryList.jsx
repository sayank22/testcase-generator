// components/TestCaseGenerator/TestSummaryList.jsx
import React from 'react';
import { Play } from 'lucide-react';

const TestSummaryList = ({ testSummaries, onGenerateTestCode }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Generated Test Case Summaries</h2>
      <div className="space-y-4">
        {testSummaries.map((summary) => (
          <div 
            key={summary.id} 
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{summary.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{summary.description}</p>
              </div>
              <button
                onClick={() => onGenerateTestCode(summary)}
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
  );
};

export default TestSummaryList;
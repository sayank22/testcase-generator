// components/TestCaseGenerator/TestSummaryList.jsx
import React from 'react';
import { Play } from 'lucide-react';

const TestSummaryList = ({ testSummaries, onGenerateTestCode }) => {
  return (
    <div className="bg-gray-50 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Generated Test Case Summaries
      </h2>
      
      <div className="space-y-4">
        {testSummaries.map((summary) => (
          <div 
            key={summary.id} 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all transform hover:scale-[1.01]"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{summary.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{summary.description}</p>
              </div>
              
              <button
                onClick={() => onGenerateTestCode(summary)}
                className="mt-3 sm:mt-0 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center text-sm"
              >
                <Play className="w-4 h-4 mr-1" />
                Generate Code
              </button>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-2">
              <span className="px-2 py-1 bg-gray-100 rounded-md">
                Framework: {summary.framework}
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-md">
                Tests: {summary.testCount}
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-md">
                Files: {summary.files.join(', ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestSummaryList;

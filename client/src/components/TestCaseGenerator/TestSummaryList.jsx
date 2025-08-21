// components/TestCaseGenerator/TestSummaryList.jsx
import React from 'react';
import { Play, FileCode, TestTube, Target, CheckCircle, ArrowRight } from 'lucide-react';

const TestSummaryCard = ({ summary, onGenerateTestCode }) => {
  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <TestTube className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
              {summary.title}
            </h3>
          </div>
          <p className="text-gray-600 leading-relaxed line-clamp-2">
            {summary.description}
          </p>
        </div>
        
        <button
          onClick={() => onGenerateTestCode(summary)}
          className="ml-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-xl font-medium flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus-ring"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Generate Code
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div className="flex items-center space-x-2 text-sm">
          <div className="p-1 bg-blue-50 rounded">
            <Target className="w-3 h-3 text-blue-600" />
          </div>
          <span className="text-gray-600">Framework:</span>
          <span className="font-medium text-gray-900">{summary.framework}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <div className="p-1 bg-purple-50 rounded">
            <CheckCircle className="w-3 h-3 text-purple-600" />
          </div>
          <span className="text-gray-600">Tests:</span>
          <span className="font-medium text-gray-900">{summary.testCount}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <div className="p-1 bg-indigo-50 rounded">
            <FileCode className="w-3 h-3 text-indigo-600" />
          </div>
          <span className="text-gray-600">Files:</span>
          <span className="font-medium text-gray-900">{summary.files.length}</span>
        </div>
      </div>
      
      {/* File List */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Covered Files:</p>
        <div className="flex flex-wrap gap-1">
          {summary.files.slice(0, 3).map((file, index) => (
            <span 
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
            >
              {file.split('/').pop()}
            </span>
          ))}
          {summary.files.length > 3 && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              +{summary.files.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const TestSummaryList = ({ testSummaries, onGenerateTestCode }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generated Test Case Summaries</h2>
        <p className="text-gray-600">
          AI has analyzed your code and generated {testSummaries.length} test strategies. Choose one to generate the actual test code.
        </p>
      </div>
      
      {testSummaries.length === 0 ? (
        <div className="text-center py-12">
          <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No test summaries available</h3>
          <p className="text-gray-500">Generate test summaries first to see them here</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {testSummaries.map((summary, index) => (
            <TestSummaryCard
              key={summary.id || index}
              summary={summary}
              onGenerateTestCode={onGenerateTestCode}
            />
          ))}
        </div>
      )}
      
      {testSummaries.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-blue-100 rounded">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Pro Tip</h4>
              <p className="text-sm text-blue-700 mt-1">
                Review each summary carefully. The AI has created different testing approaches - choose the one that best fits your project's needs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSummaryList;
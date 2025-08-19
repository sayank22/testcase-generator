// components/TestCaseGenerator/FileSelector.jsx
import React from 'react';
import { Code, Plus, Loader2 } from 'lucide-react';

const FileSelector = ({ 
  selectedRepo, 
  files, 
  selectedFiles, 
  onFileToggle, 
  onGenerateTestSummaries, 
  loading 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">
        Select Files for Test Generation
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({selectedRepo?.name})
        </span>
      </h2>
      <div className="mb-6">
        <p className="text-gray-600 mb-4">Choose the files you want to generate test cases for:</p>
        <div className="space-y-2">
          {files.map((file, index) => (
            <label 
              key={index} 
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedFiles.some(f => f.path === file.path)}
                onChange={() => onFileToggle(file)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Code className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">{file.path}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {file.language}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {selectedFiles.length} file(s) selected
        </span>
        <button
          onClick={onGenerateTestSummaries}
          disabled={loading || selectedFiles.length === 0}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Generate Test Summaries
        </button>
      </div>
    </div>
  );
};

export default FileSelector;
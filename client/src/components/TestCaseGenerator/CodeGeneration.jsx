// components/TestCaseGenerator/CodeGeneration.jsx
import React, { useState } from 'react';
import { GitPullRequest, Loader2, Copy, Check, Download, Eye, EyeOff, Code, TestTube, FileCode, Target } from 'lucide-react';

const CodeGeneration = ({ generatedCode, selectedSummary, onCreatePullRequest, loading }) => {
  const [copied, setCopied] = useState(false);
  const [showFullCode, setShowFullCode] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSummary?.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'test'}.test.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const displayCode = showFullCode ? generatedCode : generatedCode.slice(0, 1000);
  const isCodeTruncated = generatedCode.length > 1000;

  return (
    <div className="space-y-6">
      {/* Code Display */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Generated Test Code</h2>
                <p className="text-gray-300 text-sm">Ready to be added to your repository</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              
              <button
                onClick={downloadCode}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Download</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="bg-gray-900 p-6 overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono leading-relaxed">
              <code>{displayCode}</code>
            </pre>
            
            {isCodeTruncated && !showFullCode && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-20 flex items-end justify-center pb-4">
                <button
                  onClick={() => setShowFullCode(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Show Full Code</span>
                </button>
              </div>
            )}
            
            {showFullCode && isCodeTruncated && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowFullCode(false)}
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Show Less</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Code Stats */}
          <div className="bg-gray-800 px-6 py-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <div className="flex items-center space-x-4">
                <span>Lines: {generatedCode.split('\n').length}</span>
                <span>Characters: {generatedCode.length}</span>
                <span>Language: JavaScript</span>
              </div>
              <div className="text-xs text-gray-400">
                Generated with AI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Summary Card */}
      {selectedSummary && (
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TestTube className="w-5 h-5 mr-2 text-green-600" />
            Test Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Test Title</h4>
                <p className="text-gray-900">{selectedSummary.title}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Framework</h4>
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <Target className="w-3 h-3 mr-1" />
                  {selectedSummary.framework}
                </span>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Test Count</h4>
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <TestTube className="w-3 h-3 mr-1" />
                  {selectedSummary.testCount} tests
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Files Covered</h4>
              <div className="space-y-1">
                {selectedSummary.files.map((file, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <FileCode className="w-3 h-3 mr-2 text-gray-400" />
                    {file}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={onCreatePullRequest}
          disabled={loading}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-8 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 focus-ring"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
          ) : (
            <GitPullRequest className="w-6 h-6 mr-3" />
          )}
          {loading ? 'Creating Pull Request...' : 'Create Pull Request'}
        </button>
      </div>
      
      {/* Success Message Area */}
      <div className="text-center">
        <p className="text-gray-600 text-sm">
          This will create a new branch and pull request with your generated test code
        </p>
      </div>
    </div>
  );
};

export default CodeGeneration;
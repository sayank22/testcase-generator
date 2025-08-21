// components/TestCaseGenerator/FileSelector.jsx
import React, { useState, useMemo } from 'react';
import { Code, Plus, Loader2, Search, Filter, CheckSquare, Square, Folder, File, ArrowRight } from 'lucide-react';

const FileTree = ({ files, selectedFiles, onFileToggle, searchTerm, selectedLanguage }) => {
  // Group files by directory
  const fileTree = useMemo(() => {
    const tree = {};
    
    files.forEach(file => {
      const pathParts = file.path.split('/');
      const fileName = pathParts.pop();
      const dirPath = pathParts.join('/') || 'root';
      
      if (!tree[dirPath]) {
        tree[dirPath] = [];
      }
      tree[dirPath].push({ ...file, fileName });
    });
    
    return tree;
  }, [files]);

  const filteredTree = useMemo(() => {
    const filtered = {};
    
    Object.keys(fileTree).forEach(dirPath => {
      const filteredFiles = fileTree[dirPath].filter(file => {
        const matchesSearch = searchTerm === '' || 
          file.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.fileName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesLanguage = selectedLanguage === '' || file.language === selectedLanguage;
        
        return matchesSearch && matchesLanguage;
      });
      
      if (filteredFiles.length > 0) {
        filtered[dirPath] = filteredFiles;
      }
    });
    
    return filtered;
  }, [fileTree, searchTerm, selectedLanguage]);

  return (
    <div className="space-y-4">
      {Object.keys(filteredTree).sort().map(dirPath => (
        <div key={dirPath} className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Folder className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">
                {dirPath === 'root' ? 'Root Directory' : dirPath}
              </span>
              <span className="text-xs text-gray-500">
                ({filteredTree[dirPath].length} files)
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredTree[dirPath].map((file, index) => {
              const isSelected = selectedFiles.some(f => f.path === file.path);
              return (
                <label 
                  key={index} 
                  className="flex items-center space-x-3 p-4 hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onFileToggle(file)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus-ring"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-1">
                    <File className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className={`text-gray-900 group-hover:text-blue-700 transition-colors ${
                      isSelected ? 'font-medium' : ''
                    }`}>
                      {file.fileName}
                    </span>
                  </div>
                  
                  {file.language && (
                    <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {file.language}
                    </span>
                  )}
                  
                  {isSelected && (
                    <CheckSquare className="w-4 h-4 text-green-600" />
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const FileSelector = ({ 
  selectedRepo, 
  files, 
  selectedFiles, 
  onFileToggle, 
  onGenerateTestSummaries, 
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const languages = useMemo(() => {
    const langs = [...new Set(files.map(file => file.language).filter(Boolean))];
    return langs.sort();
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = searchTerm === '' || 
        file.path.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLanguage = selectedLanguage === '' || file.language === selectedLanguage;
      
      return matchesSearch && matchesLanguage;
    });
  }, [files, searchTerm, selectedLanguage]);

  const handleSelectAll = () => {
    const allSelected = filteredFiles.every(file => 
      selectedFiles.some(f => f.path === file.path)
    );
    
    if (allSelected) {
      // Deselect all filtered files
      filteredFiles.forEach(file => {
        if (selectedFiles.some(f => f.path === file.path)) {
          onFileToggle(file);
        }
      });
    } else {
      // Select all filtered files
      filteredFiles.forEach(file => {
        if (!selectedFiles.some(f => f.path === file.path)) {
          onFileToggle(file);
        }
      });
    }
  };

  const isAllSelected = filteredFiles.length > 0 && filteredFiles.every(file => 
    selectedFiles.some(f => f.path === file.path)
  );

  const isPartiallySelected = filteredFiles.some(file => 
    selectedFiles.some(f => f.path === file.path)
  ) && !isAllSelected;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Files for Test Generation
        </h2>
        <p className="text-gray-600">
          Choose files from <span className="font-medium text-blue-600">{selectedRepo?.name}</span> to generate test cases for
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Selection Controls */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : isPartiallySelected ? (
              <Square className="w-4 h-4 fill-blue-200" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span className="font-medium">
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </span>
          </button>
          
          <span className="text-gray-400">|</span>
          
          <span className="text-sm text-gray-600">
            {selectedFiles.length} of {filteredFiles.length} files selected
          </span>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            Max 10 files recommended for optimal AI performance
          </div>
        )}
      </div>

      {/* File Tree */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <File className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="mb-6 max-h-96 overflow-y-auto">
          <FileTree
            files={filteredFiles}
            selectedFiles={selectedFiles}
            onFileToggle={onFileToggle}
            searchTerm={searchTerm}
            selectedLanguage={selectedLanguage}
          />
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={onGenerateTestSummaries}
          disabled={loading || selectedFiles.length === 0}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-8 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus-ring"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <ArrowRight className="w-5 h-5 mr-2" />
          )}
          Generate Test Summaries
        </button>
      </div>
    </div>
  );
};

export default FileSelector;
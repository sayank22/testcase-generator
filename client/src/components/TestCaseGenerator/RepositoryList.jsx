// components/TestCaseGenerator/RepositoryList.jsx
import React, { useState, useMemo } from 'react';
import { FileCode, Search, Star, GitFork, Calendar, Filter, Grid, List } from 'lucide-react';

const RepositoryCard = ({ repo, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(repo)}
      className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg cursor-pointer transition-all duration-200 transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            <FileCode className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {repo.name}
            </h3>
            <p className="text-sm text-gray-500">{repo.full_name}</p>
          </div>
        </div>
        {repo.language && (
          <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            {repo.language}
          </span>
        )}
      </div>
      
      {repo.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{repo.description}</p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          {repo.stargazers_count !== undefined && (
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>{repo.stargazers_count}</span>
            </div>
          )}
          {repo.forks_count !== undefined && (
            <div className="flex items-center space-x-1">
              <GitFork className="w-3 h-3" />
              <span>{repo.forks_count}</span>
            </div>
          )}
        </div>
        {repo.updated_at && (
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const RepositoryList = ({ repositories, onRepoSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const languages = useMemo(() => {
    const langs = [...new Set(repositories.map(repo => repo.language).filter(Boolean))];
    return langs.sort();
  }, [repositories]);

  const filteredRepositories = useMemo(() => {
    return repositories.filter(repo => {
      const matchesSearch = searchTerm === '' || 
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLanguage = selectedLanguage === '' || repo.language === selectedLanguage;
      
      return matchesSearch && matchesLanguage;
    });
  }, [repositories, searchTerm, selectedLanguage]);

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select Repository</h2>
          <p className="text-gray-600 mt-1">Choose a repository to generate test cases for</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search repositories..."
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

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredRepositories.length} of {repositories.length} repositories
        </p>
      </div>

      {/* Repository Grid/List */}
      {filteredRepositories.length === 0 ? (
        <div className="text-center py-12">
          <FileCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredRepositories.map((repo) => (
            <RepositoryCard
              key={repo.id}
              repo={repo}
              onSelect={onRepoSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RepositoryList;
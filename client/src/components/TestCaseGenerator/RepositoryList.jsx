// components/TestCaseGenerator/RepositoryList.jsx
import React from 'react';
import { FileCode } from 'lucide-react';

const RepositoryList = ({ repositories, onRepoSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Select Repository</h2>
      <div className="grid gap-4">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            onClick={() => onRepoSelect(repo)}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileCode className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-medium text-gray-900">{repo.name}</h3>
                  <p className="text-sm text-gray-600">{repo.full_name}</p>
                </div>
              </div>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {repo.language}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepositoryList;
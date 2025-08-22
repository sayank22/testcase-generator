// components/TestCaseGenerator/RepositoryList.jsx
import React from 'react';
import { FileCode } from 'lucide-react';

const RepositoryList = ({ repositories, onRepoSelect }) => {
  return (
    <div className="bg-gradient-to-r from-gray-100 to-stone-200 rounded-lg shadow-md p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
        Select Repository
      </h2>
      <div className="grid gap-4">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            onClick={() => onRepoSelect(repo)}
            className="p-4 border border-gray-200 rounded-lg 
                       hover:border-blue-400 hover:bg-blue-50 cursor-pointer 
                       transition-colors duration-200 ease-in-out"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              {/* Repo Info */}
              <div className="flex items-center space-x-3 mb-2 md:mb-0">
                <FileCode className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-medium text-gray-900 text-base md:text-lg">
                    {repo.name}
                  </h3>
                  <p className="text-sm text-gray-600">{repo.full_name}</p>
                </div>
              </div>

              {/* Language Tag */}
              <span className="self-start md:self-auto text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
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

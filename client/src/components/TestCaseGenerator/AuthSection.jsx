// components/TestCaseGenerator/AuthSection.jsx
import React from 'react';
import { Github, CheckSquare } from 'lucide-react';

const AuthSection = ({ authenticated, onStartOAuth }) => {
  if (authenticated) {
    return (
      <div className="text-sm text-green-600 flex items-center">
        <CheckSquare className="w-4 h-4 mr-1" />
        Connected to GitHub
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      <button
        onClick={onStartOAuth}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center"
      >
        <Github className="w-4 h-4 mr-2" />
        Login with GitHub
      </button>
    </div>
  );
};

export default AuthSection;
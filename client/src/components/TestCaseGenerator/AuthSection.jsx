// components/TestCaseGenerator/AuthSection.jsx
import React from 'react';
import { Github, CheckCircle, Shield } from 'lucide-react';

const AuthSection = ({ authenticated, onStartOAuth }) => {
  if (authenticated) {
    return (
      <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <span className="text-green-700 font-medium text-sm">Connected to GitHub</span>
        </div>
        <Shield className="w-4 h-4 text-green-500" />
      </div>
    );
  }

  return (
    <div className="flex space-x-3">
      <button
        onClick={onStartOAuth}
        className="group bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white py-3 px-6 rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus-ring"
      >
        <Github className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
        <span className="font-medium">Connect GitHub</span>
      </button>
    </div>
  );
};

export default AuthSection;
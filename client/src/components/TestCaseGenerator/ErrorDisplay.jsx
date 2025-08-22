// components/TestCaseGenerator/ErrorDisplay.jsx
import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

const ErrorDisplay = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gradient-to-r from-red-100 to-red-50 border border-red-300 rounded-lg p-4 mb-6 flex items-start shadow-sm"
    >
      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
      <span className="text-red-800 text-sm sm:text-base flex-1">{error}</span>
      
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-red-500 hover:text-red-700 focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

export default ErrorDisplay;

// components/TestCaseGenerator/LoadingOverlay.jsx
import React from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingOverlay = ({ loading, currentStep }) => {
  if (!loading || currentStep <= 1) return null;

  const getLoadingMessage = () => {
    switch (currentStep) {
      case 2:
        return "Fetching repositories...";
      case 3:
        return "Loading files...";
      case 4:
        return "Generating test summaries...";
      case 5:
        return "Generating test code...";
      default:
        return "Processing...";
    }
  };

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-black/60 to-blue-900/70 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl px-6 py-5 sm:px-8 sm:py-6 flex items-center space-x-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-gray-900 font-medium text-sm sm:text-base">
              {getLoadingMessage()}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;

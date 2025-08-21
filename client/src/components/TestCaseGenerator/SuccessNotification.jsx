// components/TestCaseGenerator/SuccessNotification.jsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, ExternalLink, X, Sparkles } from 'lucide-react';

const ConfettiPiece = ({ delay, duration, color }) => (
  <div
    className={`absolute w-2 h-2 ${color} rounded-full animate-bounce opacity-80`}
    style={{
      left: `${Math.random() * 100}%`,
      animationDelay: `${delay}ms`,
      animationDuration: `${duration}ms`,
      transform: `translateY(-${Math.random() * 100 + 50}px)`,
    }}
  />
);

const SuccessNotification = ({ 
  show, 
  onClose, 
  title = "Success!", 
  message, 
  actionUrl, 
  actionText = "View Pull Request" 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  if (!show) return null;

  const confettiColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Confetti Animation */}
      {isVisible && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              delay={i * 100}
              duration={2000 + Math.random() * 1000}
              color={confettiColors[Math.floor(Math.random() * confettiColors.length)]}
            />
          ))}
        </div>
      )}

      {/* Success Card */}
      <div
        className={`pointer-events-auto bg-white rounded-2xl shadow-2xl border border-green-200 p-6 mx-4 max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Action Button */}
        {actionUrl && (
          <div className="flex justify-center mb-4">
            <a
              href={actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{actionText}</span>
            </a>
          </div>
        )}

        {/* Celebration Message */}
        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex justify-center space-x-1 mb-2">
            {['🎉', '✨', '🚀', '✨', '🎉'].map((emoji, index) => (
              <span
                key={index}
                className="text-lg animate-bounce"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {emoji}
              </span>
            ))}
          </div>
          <p className="text-green-800 font-medium text-sm">
            Your test cases have been successfully generated and submitted!
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-1 rounded-full transition-all duration-8000 ease-linear"
              style={{ width: isVisible ? '0%' : '100%' }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">
            Auto-closing in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;
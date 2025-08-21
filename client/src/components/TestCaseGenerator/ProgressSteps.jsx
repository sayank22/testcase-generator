// components/TestCaseGenerator/ProgressSteps.jsx
import React from 'react';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

const StepIndicator = ({ step, title, description, completed, current, index }) => (
  <div className={`flex flex-col items-center text-center transition-all duration-300 ${
    completed ? 'text-green-600' : 
    current ? 'text-blue-600' : 
    'text-gray-400'
  }`}>
    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
      completed ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-500 text-white shadow-lg scale-110' :
      current ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg scale-110' : 
      'border-gray-300 bg-white hover:border-gray-400'
    }`}>
      {completed ? (
        <CheckCircle className="w-6 h-6 animate-bounce" />
      ) : current ? (
        <div className="relative">
          <Circle className="w-6 h-6" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{step}</span>
          </div>
        </div>
      ) : (
        <span className="text-sm font-medium">{step}</span>
      )}
      
      {current && (
        <div className="absolute -inset-2 border-2 border-blue-300 rounded-full animate-ping opacity-30"></div>
      )}
    </div>
    
    <div className="mt-3">
      <span className={`font-semibold text-xs sm:text-sm ${current ? 'text-blue-700' : ''}`}>{title}</span>
      <p className="text-xs mt-1 text-gray-500 max-w-16 sm:max-w-20 hidden sm:block">{description}</p>
    </div>
  </div>
);

const ProgressSteps = ({ currentStep, authenticated }) => {
  const steps = [
    { 
      step: 1, 
      title: "GitHub Auth", 
      description: "Connect your account",
      completed: authenticated 
    },
    { 
      step: 2, 
      title: "Select Repo", 
      description: "Choose repository",
      completed: currentStep > 2 
    },
    { 
      step: 3, 
      title: "Choose Files", 
      description: "Pick source files",
      completed: currentStep > 3 
    },
    { 
      step: 4, 
      title: "Test Summaries", 
      description: "Review AI suggestions",
      completed: currentStep > 4 
    },
    { 
      step: 5, 
      title: "Generate & PR", 
      description: "Create pull request",
      completed: currentStep > 5 
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
      <div className="flex items-center justify-between relative overflow-x-auto">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 hidden sm:block">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-out"
            style={{ 
              width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100)}%` 
            }}
          ></div>
        </div>

        <div className="flex items-center justify-between w-full min-w-max sm:min-w-0">
          {steps.map((stepData, index) => (
            <React.Fragment key={stepData.step}>
              <div className="relative z-10 bg-white rounded-full p-1 flex-shrink-0">
                <StepIndicator
                  step={stepData.step}
                  title={stepData.title}
                  description={stepData.description}
                  completed={stepData.completed}
                  current={stepData.step === currentStep}
                  index={index}
                />
              </div>
              {/* Mobile connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-2 sm:hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-out"
                    style={{ 
                      width: stepData.completed ? '100%' : '0%'
                    }}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Current Step Description */}
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-gray-600 text-sm sm:text-base">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
        </p>
      </div>
    </div>
  );
};

export default ProgressSteps;

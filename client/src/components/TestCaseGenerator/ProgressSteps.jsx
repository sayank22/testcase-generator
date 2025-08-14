/ components/TestCaseGenerator/ProgressSteps.jsx
import React from 'react';
import { CheckSquare } from 'lucide-react';

const StepIndicator = ({ step, title, completed, current }) => (
  <div className={`flex items-center ${
    completed ? 'text-green-600' : 
    current ? 'text-blue-600' : 
    'text-gray-400'
  }`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
      completed ? 'bg-green-600 border-green-600 text-white' :
      current ? 'border-blue-600 bg-blue-50' : 
      'border-gray-300'
    }`}>
      {completed ? <CheckSquare className="w-4 h-4" /> : step}
    </div>
    <span className="ml-2 font-medium">{title}</span>
  </div>
);

const ProgressSteps = ({ currentStep, authenticated }) => {
  const steps = [
    { step: 1, title: "GitHub Auth", completed: authenticated },
    { step: 2, title: "Select Repo", completed: currentStep > 2 },
    { step: 3, title: "Choose Files", completed: currentStep > 3 },
    { step: 4, title: "Test Summaries", completed: currentStep > 4 },
    { step: 5, title: "Generate & PR", completed: currentStep > 5 }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center">
        {steps.map((stepData, index) => (
          <React.Fragment key={stepData.step}>
            <StepIndicator
              step={stepData.step}
              title={stepData.title}
              completed={stepData.completed}
              current={stepData.step === currentStep}
            />
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;

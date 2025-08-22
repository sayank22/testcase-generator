// components/TestCaseGenerator/ProgressSteps.jsx
import React from "react";
import { CheckSquare } from "lucide-react";

const StepIndicator = ({ step, title, completed, current }) => (
  <div
    className={`flex items-center sm:flex-col sm:items-start gap-2 transition-all ${
      completed
        ? "text-green-600"
        : current
        ? "text-blue-600"
        : "text-gray-400"
    }`}
    aria-current={current ? "step" : undefined}
  >
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 font-semibold transition-colors duration-300
        ${
          completed
            ? "bg-green-600 border-green-600 text-white"
            : current
            ? "border-blue-600 bg-blue-50 text-blue-600"
            : "border-gray-300 text-gray-400"
        }`}
    >
      {completed ? <CheckSquare className="w-5 h-5" /> : step}
    </div>
    <span className="font-medium text-sm sm:text-base">{title}</span>
  </div>
);

const ProgressSteps = ({ currentStep, authenticated }) => {
  const steps = [
    { step: 1, title: "GitHub Auth", completed: authenticated },
    { step: 2, title: "Select Repo", completed: currentStep > 2 },
    { step: 3, title: "Choose Files", completed: currentStep > 3 },
    { step: 4, title: "Test Summaries", completed: currentStep > 4 },
    { step: 5, title: "Generate & PR", completed: currentStep > 5 },
  ];

  return (
    <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-gray-50 rounded-2xl shadow-md p-4 sm:p-6 mb-6">
      {/* Desktop Layout */}
      <div className="hidden sm:flex justify-between items-center relative">
        {steps.map((stepData, index) => (
          <React.Fragment key={stepData.step}>
            <StepIndicator
              step={stepData.step}
              title={stepData.title}
              completed={stepData.completed}
              current={stepData.step === currentStep}
            />
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 transition-all duration-500 ${
                  steps[index].completed ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col sm:hidden gap-6">
        {steps.map((stepData, index) => (
          <React.Fragment key={stepData.step}>
            <StepIndicator
              step={stepData.step}
              title={stepData.title}
              completed={stepData.completed}
              current={stepData.step === currentStep}
            />
            {index < steps.length - 1 && (
              <div
                className={`w-0.5 h-8 mx-4 transition-all duration-500 ${
                  steps[index].completed ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;

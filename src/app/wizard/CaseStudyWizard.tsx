'use client';

import { FC } from 'react';
import { useFormStore } from '@/store/form-store';
import { useAutoSave } from '@/hooks/useAutoSave';

interface CaseStudyWizardProps {
  onComplete: (data: any) => void;
}

const CaseStudyWizard: FC<CaseStudyWizardProps> = ({ onComplete }) => {
  const { formData, updateFormData, currentStep, completedSteps } = useFormStore();
  const { saveNow } = useAutoSave();

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      // Navigation logic would go here
    }
  };

  const isStepValid = (step: number): boolean => {
    // Validation logic would go here
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Case Study Wizard</h1>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <p>Wizard content will be implemented here</p>
        <button 
          onClick={() => onComplete(formData)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Complete
        </button>
      </div>
    </div>
  );
};

export default CaseStudyWizard;
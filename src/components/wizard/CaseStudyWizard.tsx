'use client';

import { FC } from 'react';
import { useFormStore } from '@/store/form-store';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface CaseStudyWizardProps {
  onComplete: (data: any) => void;
}

const CaseStudyWizard: FC<CaseStudyWizardProps> = ({ onComplete }) => {
  const { 
    formData, 
    updateFormData, 
    currentStep, 
    setCurrentStep, 
    markStepCompleted,
    completedSteps 
  } = useFormStore();
  const { saveNow } = useAutoSave();

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { title: 'Project Info', description: 'Basic project information' },
    { title: 'Situation', description: 'Initial situation and objectives' },
    { title: 'Approach', description: 'Strategic approach and methodology' },
    { title: 'Team', description: 'Team roles and milestones' },
    { title: 'Results', description: 'Success metrics and ROI' },
    { title: 'Media', description: 'Images and testimonials' },
  ];

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      markStepCompleted(currentStep);
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(formData);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.projectName && formData.clientName && formData.industry);
      case 2:
        return !!(formData.initialSituation && formData.objectives.length > 0);
      case 3:
        return !!(formData.strategicApproach && formData.technologies.length > 0);
      case 4:
        return !!(formData.keyRoles.length > 0);
      case 5:
        return !!(formData.successMetrics.length > 0);
      case 6:
        return true;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1ProjectInfo formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step2Situation formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3Approach formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4Team formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <Step5Results formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <Step6Media formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Create Case Study</h1>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Step Navigation */}
        <div className="flex justify-between items-center mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${
                index + 1 === currentStep
                  ? 'text-blue-600 font-semibold'
                  : completedSteps.includes(index + 1)
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-2 ${
                  index + 1 === currentStep
                    ? 'bg-blue-600 text-white'
                    : completedSteps.includes(index + 1)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {completedSteps.includes(index + 1) ? '✓' : index + 1}
              </div>
              <span className="text-xs">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-2">{steps[currentStep - 1].title}</h2>
        <p className="text-gray-600 mb-6">{steps[currentStep - 1].description}</p>
        
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={saveNow}
          >
            Save Draft
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isStepValid(currentStep)}
          >
            {currentStep === totalSteps ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step Components
const Step1ProjectInfo: FC<{ formData: any; updateFormData: any }> = ({ formData, updateFormData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2">Project Name *</label>
        <input
          type="text"
          value={formData.projectName}
          onChange={(e) => updateFormData('projectName', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter project name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Client Name *</label>
        <input
          type="text"
          value={formData.clientName}
          onChange={(e) => updateFormData('clientName', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter client name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Industry *</label>
        <select
          value={formData.industry}
          onChange={(e) => updateFormData('industry', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select industry</option>
          <option value="technology">Technology</option>
          <option value="healthcare">Healthcare</option>
          <option value="finance">Finance</option>
          <option value="retail">Retail</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="education">Education</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Company Size</label>
        <select
          value={formData.companySize}
          onChange={(e) => updateFormData('companySize', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select size</option>
          <option value="startup">Startup (1-10)</option>
          <option value="small">Small (11-50)</option>
          <option value="medium">Medium (51-200)</option>
          <option value="large">Large (201-1000)</option>
          <option value="enterprise">Enterprise (1000+)</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Start Date</label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => updateFormData('startDate', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">End Date</label>
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => updateFormData('endDate', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Budget</label>
      <input
        type="text"
        value={formData.budget}
        onChange={(e) => updateFormData('budget', e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="e.g., $50,000 - $100,000"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Budget Visibility</label>
      <div className="flex gap-4">
        {['hidden', 'range', 'exact'].map((option) => (
          <label key={option} className="flex items-center">
            <input
              type="radio"
              name="budgetVisibility"
              value={option}
              checked={formData.budgetVisibility === option}
              onChange={(e) => updateFormData('budgetVisibility', e.target.value)}
              className="mr-2"
            />
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </label>
        ))}
      </div>
    </div>
  </div>
);

const Step2Situation: FC<{ formData: any; updateFormData: any }> = ({ formData, updateFormData }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">Initial Situation *</label>
      <textarea
        value={formData.initialSituation}
        onChange={(e) => updateFormData('initialSituation', e.target.value)}
        rows={4}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Describe the initial situation and challenges..."
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Objectives *</label>
      {formData.objectives.map((objective: string, index: number) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={objective}
            onChange={(e) => {
              const newObjectives = [...formData.objectives];
              newObjectives[index] = e.target.value;
              updateFormData('objectives', newObjectives);
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Objective ${index + 1}`}
          />
          {formData.objectives.length > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const newObjectives = formData.objectives.filter((_: any, i: number) => i !== index);
                updateFormData('objectives', newObjectives);
              }}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => updateFormData('objectives', [...formData.objectives, ''])}
      >
        Add Objective
      </Button>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Key Performance Indicators</label>
      {formData.kpis.map((kpi: string, index: number) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={kpi}
            onChange={(e) => {
              const newKpis = [...formData.kpis];
              newKpis[index] = e.target.value;
              updateFormData('kpis', newKpis);
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`KPI ${index + 1}`}
          />
          {formData.kpis.length > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const newKpis = formData.kpis.filter((_: any, i: number) => i !== index);
                updateFormData('kpis', newKpis);
              }}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => updateFormData('kpis', [...formData.kpis, ''])}
      >
        Add KPI
      </Button>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Constraints</label>
      <textarea
        value={formData.constraints}
        onChange={(e) => updateFormData('constraints', e.target.value)}
        rows={3}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Describe any constraints or limitations..."
      />
    </div>
  </div>
);

const Step3Approach: FC<{ formData: any; updateFormData: any }> = ({ formData, updateFormData }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">Strategic Approach *</label>
      <textarea
        value={formData.strategicApproach}
        onChange={(e) => updateFormData('strategicApproach', e.target.value)}
        rows={4}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Describe your strategic approach and methodology..."
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Technologies Used *</label>
      {formData.technologies.map((tech: string, index: number) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={tech}
            onChange={(e) => {
              const newTech = [...formData.technologies];
              newTech[index] = e.target.value;
              updateFormData('technologies', newTech);
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Technology ${index + 1}`}
          />
          {formData.technologies.length > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const newTech = formData.technologies.filter((_: any, i: number) => i !== index);
                updateFormData('technologies', newTech);
              }}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => updateFormData('technologies', [...formData.technologies, ''])}
      >
        Add Technology
      </Button>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Methodologies</label>
      {formData.methodologies.map((method: string, index: number) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={method}
            onChange={(e) => {
              const newMethods = [...formData.methodologies];
              newMethods[index] = e.target.value;
              updateFormData('methodologies', newMethods);
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Methodology ${index + 1}`}
          />
          {formData.methodologies.length > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const newMethods = formData.methodologies.filter((_: any, i: number) => i !== index);
                updateFormData('methodologies', newMethods);
              }}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => updateFormData('methodologies', [...formData.methodologies, ''])}
      >
        Add Methodology
      </Button>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Implementation Phases</label>
      {formData.implementationPhases.map((phase: string, index: number) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={phase}
            onChange={(e) => {
              const newPhases = [...formData.implementationPhases];
              newPhases[index] = e.target.value;
              updateFormData('implementationPhases', newPhases);
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Phase ${index + 1}`}
          />
          {formData.implementationPhases.length > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const newPhases = formData.implementationPhases.filter((_: any, i: number) => i !== index);
                updateFormData('implementationPhases', newPhases);
              }}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => updateFormData('implementationPhases', [...formData.implementationPhases, ''])}
      >
        Add Phase
      </Button>
    </div>
  </div>
);

const Step4Team: FC<{ formData: any; updateFormData: any }> = ({ formData, updateFormData }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">Key Roles *</label>
      {formData.keyRoles.map((role: any, index: number) => (
        <div key={index} className="border rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              value={role.role}
              onChange={(e) => {
                const newRoles = [...formData.keyRoles];
                newRoles[index].role = e.target.value;
                updateFormData('keyRoles', newRoles);
              }}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Role title"
            />
            <input
              type="text"
              value={role.name}
              onChange={(e) => {
                const newRoles = [...formData.keyRoles];
                newRoles[index].name = e.target.value;
                updateFormData('keyRoles', newRoles);
              }}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Name"
            />
            <input
              type="text"
              value={role.responsibility}
              onChange={(e) => {
                const newRoles = [...formData.keyRoles];
                newRoles[index].responsibility = e.target.value;
                updateFormData('keyRoles', newRoles);
              }}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Responsibility"
            />
          </div>
          {formData.keyRoles.length > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const newRoles = formData.keyRoles.filter((_: any, i: number) => i !== index);
                updateFormData('keyRoles', newRoles);
              }}
            >
              Remove Role
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => updateFormData('keyRoles', [...formData.keyRoles, { role: '', name: '', responsibility: '' }])}
      >
        Add Role
      </Button>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Partners</label>
      {formData.partners.map((partner: string, index: number) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={partner}
            onChange={(e) => {
              const newPartners = [...formData.partners];
              newPartners[index] = e.target.value;
              updateFormData('partners', newPartners);
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Partner ${index + 1}`}
          />
          {formData.partners.length > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const newPartners = formData.partners.filter((_: any, i: number) => i !== index);
                updateFormData('partners', newPartners);
              }}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => updateFormData('partners', [...formData.partners, ''])}
      >
        Add Partner
      </Button>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Milestones</label>
      {formData.milestones.map((milestone: any, index: number) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="date"
            value={milestone.date}
            onChange={(e) => {
              const newMilestones = [...formData.milestones];
              newMilestones[index].date = e.target.value;
              updateFormData('milestones', newMilestones);
            }}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            value={milestone.description}
            onChange={(e) => {
              const newMilestones = [...formData.milestones];
              newMilestones[index].description = e.target.value;
              updateFormData('milestones', newMilestones);
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Milestone description"
          />
          {formData.milestones.length > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const newMilestones = formData.milestones.filter((_: any, i: number) => i !== index);
                updateFormData('milestones', newMilestones);
              }}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => updateFormData('milestones', [...formData.milestones, { date: '', description: '' }])}
      >
        Add Milestone
      </Button>
    </div>
  </div>
);

const Step5Results: FC<{ formData: any; updateFormData: any }> = ({ formData, updateFormData }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">Success Metrics *</label>
      {formData.successMetrics.map((metric: any, index: number) => (
        <div key={index} className="border rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              value={metric.metric}
              onChange={(e) => {
                const newMetrics = [...formData.successMetrics];
                newMetrics[index].metric = e.target.value;
                updateFormData('successMetrics', newMetrics);
              }}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Metric name"
            />
            <input
              type="text"
              value={metric.value}
              onChange={(e) => {
                const newMetrics = [...formData.successMetrics];
                newMetrics[index].value = e.target.value;
                updateFormData('successMetrics', newMetrics);
              }}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Current value"
            />
            <input
              type="text"
              value={metric.improvement}
              onChange={(e) => {
                const newMetrics = [...formData.successMetrics];
                newMetrics[index].improvement = e.target.value;
                updateFormData('successMetrics', newMetrics);
              }}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Improvement %"
            />
          </div>
          {formData.successMetrics.length > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const newMetrics = formData.successMetrics.filter((_: any, i: number) => i !== index);
                updateFormData('successMetrics', newMetrics);
              }}
            >
              Remove Metric
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => updateFormData('successMetrics', [...formData.successMetrics, { metric: '', value: '', improvement: '' }])}
      >
        Add Metric
      </Button>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Return on Investment (ROI)</label>
      <input
        type="text"
        value={formData.roi}
        onChange={(e) => updateFormData('roi', e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="e.g., 250% ROI in 12 months"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Qualitative Benefits</label>
      {formData.qualitativeBenefits.map((benefit: string, index: number) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={benefit}
            onChange={(e) => {
              const newBenefits = [...formData.qualitativeBenefits];
              newBenefits[index] = e.target.value;
              updateFormData('qualitativeBenefits', newBenefits);
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Benefit ${index + 1}`}
          />
          {formData.qualitativeBenefits.length > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const newBenefits = formData.qualitativeBenefits.filter((_: any, i: number) => i !== index);
                updateFormData('qualitativeBenefits', newBenefits);
              }}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => updateFormData('qualitativeBenefits', [...formData.qualitativeBenefits, ''])}
      >
        Add Benefit
      </Button>
    </div>
  </div>
);

const Step6Media: FC<{ formData: any; updateFormData: any }> = ({ formData, updateFormData }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">Images</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500 mb-4">Image upload functionality will be implemented here</p>
        <p className="text-sm text-gray-400">Drag and drop images or click to browse</p>
      </div>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Testimonials</label>
      {formData.testimonials.map((testimonial: any, index: number) => (
        <div key={index} className="border rounded-lg p-4 mb-4">
          <div className="space-y-4">
            <textarea
              value={testimonial.quote}
              onChange={(e) => {
                const newTestimonials = [...formData.testimonials];
                newTestimonials[index].quote = e.target.value;
                updateFormData('testimonials', newTestimonials);
              }}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Testimonial quote"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={testimonial.author}
                onChange={(e) => {
                  const newTestimonials = [...formData.testimonials];
                  newTestimonials[index].author = e.target.value;
                  updateFormData('testimonials', newTestimonials);
                }}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Author name"
              />
              <input
                type="text"
                value={testimonial.role}
                onChange={(e) => {
                  const newTestimonials = [...formData.testimonials];
                  newTestimonials[index].role = e.target.value;
                  updateFormData('testimonials', newTestimonials);
                }}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Author role/title"
              />
            </div>
          </div>
          {formData.testimonials.length > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const newTestimonials = formData.testimonials.filter((_: any, i: number) => i !== index);
                updateFormData('testimonials', newTestimonials);
              }}
              className="mt-4"
            >
              Remove Testimonial
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => updateFormData('testimonials', [...formData.testimonials, { quote: '', author: '', role: '' }])}
      >
        Add Testimonial
      </Button>
    </div>
  </div>
);

export default CaseStudyWizard;
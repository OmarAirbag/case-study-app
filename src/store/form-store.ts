import { create } from 'zustand'
import { CaseStudy } from '@/types/case-study'

interface FormStore {
  currentCaseStudyId: string | null
  formData: CaseStudy['formData']
  currentStep: number
  completedSteps: number[]
  
  setCurrentCaseStudyId: (id: string | null) => void
  updateFormData: (field: keyof CaseStudy['formData'], value: unknown) => void
  setCurrentStep: (step: number) => void
  markStepCompleted: (step: number) => void
  resetForm: () => void
  loadFormData: (data: CaseStudy['formData']) => void
}

const initialFormData: CaseStudy['formData'] = {
  // Step 1
  projectName: '',
  clientName: '',
  industry: '',
  companySize: '',
  startDate: '',
  endDate: '',
  budget: '',
  budgetVisibility: 'hidden',
  
  // Step 2
  initialSituation: '',
  objectives: [''],
  kpis: [''],
  constraints: '',
  
  // Step 3
  strategicApproach: '',
  technologies: [''],
  methodologies: [''],
  implementationPhases: [''],
  
  // Step 4
  keyRoles: [{ role: '', name: '', responsibility: '' }],
  partners: [''],
  milestones: [{ date: '', description: '' }],
  
  // Step 5
  successMetrics: [{ metric: '', value: '', improvement: '' }],
  roi: '',
  qualitativeBenefits: [''],
  
  // Step 6
  images: [],
  testimonials: [{ quote: '', author: '', role: '' }],
}

export const useFormStore = create<FormStore>((set) => ({
  currentCaseStudyId: null,
  formData: initialFormData,
  currentStep: 1,
  completedSteps: [],
  
  setCurrentCaseStudyId: (id) => set({ currentCaseStudyId: id }),
  
  updateFormData: (field, value) => 
    set((state) => ({
      formData: { ...state.formData, [field]: value }
    })),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  markStepCompleted: (step) => 
    set((state) => ({
      completedSteps: [...new Set([...state.completedSteps, step])]
    })),
  
  resetForm: () => set({
    currentCaseStudyId: null,
    formData: initialFormData,
    currentStep: 1,
    completedSteps: []
  }),
  
  loadFormData: (data) => set({ formData: data })
}))
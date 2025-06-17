export interface CaseStudy {
  id?: string;
  userId: string;
  orgId?: string;
  createdBy: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  formData: {
    // Step 1
    projectName: string;
    clientName: string;
    industry: string;
    companySize: string;
    startDate: string;
    endDate: string;
    budget: string;
    budgetVisibility: 'hidden' | 'range' | 'exact';
    
    // Step 2
    initialSituation: string;
    objectives: string[];
    kpis: string[];
    constraints: string;
    
    // Step 3
    strategicApproach: string;
    technologies: string[];
    methodologies: string[];
    implementationPhases: string[];
    
    // Step 4
    keyRoles: Array<{
      role: string;
      name: string;
      responsibility: string;
    }>;
    partners: string[];
    milestones: Array<{
      date: string;
      description: string;
    }>;
    
    // Step 5
    successMetrics: Array<{
      metric: string;
      value: string;
      improvement: string;
    }>;
    roi: string;
    qualitativeBenefits: string[];
    
    // Step 6
    images: string[];
    testimonials: Array<{
      quote: string;
      author: string;
      role: string;
    }>;
  };
}
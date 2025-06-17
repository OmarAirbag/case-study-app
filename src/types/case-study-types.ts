export interface CaseStudy {
  id?: string;
  userId: string;
  orgId?: string; // Organization ID - optional for personal case studies
  createdBy?: string; // User ID who created it (for org tracking)
  lastEditedBy?: string; // User ID who last edited (for org tracking)
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  sharedWith?: string[]; // Array of user IDs for specific sharing
  visibility?: 'private' | 'organization' | 'public'; // Visibility level
  
  formData: {
    // Step 1 - Overview
    projectName: string;
    clientName: string;
    industry: string;
    companySize: string;
    startDate: string;
    endDate: string;
    budget: string;
    budgetVisibility: 'hidden' | 'range' | 'exact';
    
    // Step 2 - Context
    initialSituation: string;
    objectives: string[];
    kpis: string[];
    constraints: string;
    
    // Step 3 - Solution
    strategicApproach: string;
    technologies: string[];
    methodologies: string[];
    implementationPhases: string[];
    
    // Step 4 - Team
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
    
    // Step 5 - Results
    successMetrics: Array<{
      metric: string;
      value: string;
      improvement: string;
    }>;
    roi: string;
    qualitativeBenefits: string[];
    
    // Step 6 - Media
    images: string[];
    testimonials: Array<{
      quote: string;
      author: string;
      role: string;
    }>;
    charts?: Array<{
      type: 'bar' | 'line' | 'pie' | 'doughnut';
      data: any;
      title: string;
    }>;
  };
  
  // Metadata
  metadata?: {
    views?: number;
    likes?: number;
    shares?: number;
    lastViewedAt?: Date;
    tags?: string[];
    category?: string;
    language?: string;
  };
  
  // Organization specific
  orgMetadata?: {
    department?: string;
    project?: string;
    client?: string;
    approvedBy?: string;
    approvalDate?: Date;
  };
}

// Case Study Statistics
export interface CaseStudyStats {
  totalViews: number;
  uniqueViews: number;
  avgTimeSpent: number;
  shareCount: number;
  downloadCount: number;
  conversionRate?: number;
}

// Case Study Template
export interface CaseStudyTemplate {
  id: string;
  name: string;
  description: string;
  industry?: string;
  thumbnail?: string;
  structure: Partial<CaseStudy['formData']>;
  isPublic: boolean;
  isPremium: boolean;
  createdBy: string;
  createdAt: Date;
}

// Case Study Activity
export interface CaseStudyActivity {
  id: string;
  caseStudyId: string;
  userId: string;
  userEmail?: string;
  action: 'created' | 'updated' | 'published' | 'unpublished' | 'deleted' | 'viewed' | 'shared' | 'downloaded';
  timestamp: Date;
  metadata?: {
    changes?: string[];
    recipient?: string;
    format?: string;
  };
}

// Export options
export interface ExportOptions {
  format: 'html' | 'pdf' | 'docx' | 'pptx';
  template?: string;
  includeImages: boolean;
  includeCharts: boolean;
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  watermark?: boolean;
  password?: string;
}

// Filter options for listing
export interface CaseStudyFilter {
  status?: 'draft' | 'published' | 'all';
  orgId?: string;
  userId?: string;
  createdAfter?: Date;
  createdBefore?: 
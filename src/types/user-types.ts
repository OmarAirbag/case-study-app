import { SubscriptionPlan } from './organization';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Organization related
  currentOrgId?: string; // Org attualmente selezionata
  personalOrgId?: string; // Org personale creata automaticamente
  organizations: string[]; // Lista di tutte le org di cui è membro
  
  // Profile
  profile?: {
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    company?: string; // Nome azienda se non usa org
    phone?: string;
    timezone?: string;
    language?: string;
    bio?: string;
  };
  
  // Settings
  settings?: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    twoFactorEnabled: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
  
  // Subscription (per account personali senza org)
  personalSubscription?: {
    plan: SubscriptionPlan;
    validUntil?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  
  // Metadata
  metadata?: {
    source?: string; // come si è registrato
    referrer?: string;
    utmParams?: Record<string, string>;
  };
  
  // Stats
  stats?: {
    totalCaseStudies: number;
    totalOrganizations: number;
    lastLoginAt?: Date;
  };
}

// Extended auth user with org context
export interface AuthUser extends User {
  // Current organization context
  currentOrganization?: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
  };
}

// User invite data (prima che accetti)
export interface PendingUser {
  email: string;
  invitations: Array<{
    orgId: string;
    orgName: string;
    invitedAt: Date;
    role: string;
  }>;
}

// User preferences per org
export interface UserOrgPreferences {
  userId: string;
  orgId: string;
  notifications: {
    caseStudyUpdates: boolean;
    newMembers: boolean;
    mentions: boolean;
  };
  defaultView?: 'grid' | 'list';
  favoritesCaseStudies?: string[];
}
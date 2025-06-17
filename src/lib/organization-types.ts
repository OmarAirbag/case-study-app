// Enums per ruoli e stati
export enum OrganizationRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

// Interfacce principali
export interface Organization {
  id: string;
  name: string;
  slug?: string; // URL-friendly name
  description?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  subscription: {
    plan: SubscriptionPlan;
    validUntil?: Date;
    seats?: number; // numero massimo membri
  };
  settings: {
    maxMembers: number;
    maxCaseStudies?: number;
    features: string[];
    defaultRole: OrganizationRole;
    allowMemberInvite: boolean; // se i membri possono invitare
  };
  metadata?: {
    industry?: string;
    size?: string;
    website?: string;
    country?: string;
  };
}

export interface OrganizationMember {
  id: string;
  orgId: string;
  userId: string;
  role: OrganizationRole;
  joinedAt: Date;
  invitedBy: string;
  lastActiveAt?: Date;
  permissions?: string[]; // permessi custom override
  // Dati denormalizzati per performance
  user?: {
    email: string;
    displayName: string;
    photoURL?: string;
  };
}

export interface Invitation {
  id: string;
  orgId: string;
  email: string;
  role: OrganizationRole;
  invitedBy: string;
  invitedByName?: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  status: InvitationStatus;
  token: string; // token sicuro per validazione
  message?: string; // messaggio personalizzato
  // Dati org per preview nell'email
  organization?: {
    name: string;
    logo?: string;
  };
}

// Permessi granulari
export interface Permission {
  resource: 'case_study' | 'member' | 'organization' | 'billing';
  action: 'create' | 'read' | 'update' | 'delete' | 'publish' | 'invite';
  scope?: 'own' | 'all'; // own = solo propri, all = tutti
}

// Mappa dei permessi per ruolo
export const ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  [OrganizationRole.OWNER]: [
    // Accesso completo a tutto
    { resource: 'case_study', action: 'create', scope: 'all' },
    { resource: 'case_study', action: 'read', scope: 'all' },
    { resource: 'case_study', action: 'update', scope: 'all' },
    { resource: 'case_study', action: 'delete', scope: 'all' },
    { resource: 'case_study', action: 'publish', scope: 'all' },
    { resource: 'member', action: 'create', scope: 'all' },
    { resource: 'member', action: 'read', scope: 'all' },
    { resource: 'member', action: 'update', scope: 'all' },
    { resource: 'member', action: 'delete', scope: 'all' },
    { resource: 'member', action: 'invite', scope: 'all' },
    { resource: 'organization', action: 'read', scope: 'all' },
    { resource: 'organization', action: 'update', scope: 'all' },
    { resource: 'organization', action: 'delete', scope: 'all' },
    { resource: 'billing', action: 'read', scope: 'all' },
    { resource: 'billing', action: 'update', scope: 'all' },
  ],
  [OrganizationRole.ADMIN]: [
    // Può gestire case study e membri
    { resource: 'case_study', action: 'create', scope: 'all' },
    { resource: 'case_study', action: 'read', scope: 'all' },
    { resource: 'case_study', action: 'update', scope: 'all' },
    { resource: 'case_study', action: 'delete', scope: 'all' },
    { resource: 'case_study', action: 'publish', scope: 'all' },
    { resource: 'member', action: 'create', scope: 'all' },
    { resource: 'member', action: 'read', scope: 'all' },
    { resource: 'member', action: 'update', scope: 'all' },
    { resource: 'member', action: 'invite', scope: 'all' },
    { resource: 'organization', action: 'read', scope: 'all' },
    { resource: 'organization', action: 'update', scope: 'all' },
  ],
  [OrganizationRole.MEMBER]: [
    // Può gestire propri case study
    { resource: 'case_study', action: 'create', scope: 'all' },
    { resource: 'case_study', action: 'read', scope: 'all' },
    { resource: 'case_study', action: 'update', scope: 'own' },
    { resource: 'case_study', action: 'delete', scope: 'own' },
    { resource: 'case_study', action: 'publish', scope: 'own' },
    { resource: 'member', action: 'read', scope: 'all' },
    { resource: 'organization', action: 'read', scope: 'all' },
  ],
  [OrganizationRole.VIEWER]: [
    // Solo lettura
    { resource: 'case_study', action: 'read', scope: 'all' },
    { resource: 'member', action: 'read', scope: 'all' },
    { resource: 'organization', action: 'read', scope: 'all' },
  ],
};

// Helper type per verificare permessi
export type PermissionCheck = {
  resource: Permission['resource'];
  action: Permission['action'];
  ownerId?: string; // per verificare scope 'own'
};

// Limiti per piano di abbonamento
export const PLAN_LIMITS = {
  [SubscriptionPlan.FREE]: {
    maxMembers: 3,
    maxCaseStudies: 10,
    maxOrganizations: 1,
    features: ['basic_templates', 'html_export'],
  },
  [SubscriptionPlan.PRO]: {
    maxMembers: 10,
    maxCaseStudies: 100,
    maxOrganizations: 3,
    features: ['basic_templates', 'advanced_templates', 'html_export', 'pdf_export', 'custom_branding'],
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxMembers: -1, // unlimited
    maxCaseStudies: -1,
    maxOrganizations: -1,
    features: ['all'],
  },
};

// Eventi per audit log
export interface OrganizationEvent {
  id: string;
  orgId: string;
  userId: string;
  userEmail: string;
  action: 'member_invited' | 'member_joined' | 'member_removed' | 'role_changed' | 
          'org_created' | 'org_updated' | 'org_deleted' | 'case_study_created' | 
          'case_study_deleted' | 'subscription_changed';
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Context type per passare org corrente nell'app
export interface OrganizationContext {
  currentOrg: Organization | null;
  membership: OrganizationMember | null;
  permissions: Permission[];
  isLoading: boolean;
}
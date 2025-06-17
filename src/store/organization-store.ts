import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Organization, OrganizationMember, Permission, ROLE_PERMISSIONS } from '@/lib/organization-types';

interface OrganizationStore {
  // Current organization context
  currentOrg: Organization | null;
  currentMembership: OrganizationMember | null;
  currentPermissions: Permission[];
  
  // All user's organizations
  userOrganizations: Organization[];
  
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  setCurrentOrg: (org: Organization | null) => void;
  setCurrentMembership: (membership: OrganizationMember | null) => void;
  setUserOrganizations: (orgs: Organization[]) => void;
  switchOrganization: (orgId: string) => void;
  updateOrganization: (orgId: string, updates: Partial<Organization>) => void;
  addOrganization: (org: Organization) => void;
  removeOrganization: (orgId: string) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
  
  // Permission helpers
  hasPermission: (resource: string, action: string, ownerId?: string) => boolean;
  canCreateCaseStudy: () => boolean;
  canEditCaseStudy: (ownerId?: string) => boolean;
  canDeleteCaseStudy: (ownerId?: string) => boolean;
  canInviteMembers: () => boolean;
  canManageOrganization: () => boolean;
  canManageBilling: () => boolean;
  isOwner: () => boolean;
  isAdmin: () => boolean;
  isMember: () => boolean;
  isViewer: () => boolean;
}

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentOrg: null,
      currentMembership: null,
      currentPermissions: [],
      userOrganizations: [],
      isLoading: false,
      isInitialized: false,

      // Actions
      setCurrentOrg: (org) => {
        const membership = get().currentMembership;
        const permissions = membership ? ROLE_PERMISSIONS[membership.role] : [];
        
        set({ 
          currentOrg: org,
          currentPermissions: permissions
        });
      },

      setCurrentMembership: (membership) => {
        const permissions = membership ? ROLE_PERMISSIONS[membership.role] : [];
        
        set({ 
          currentMembership: membership,
          currentPermissions: permissions
        });
      },

      setUserOrganizations: (orgs) => set({ userOrganizations: orgs }),

      switchOrganization: (orgId) => {
        const { userOrganizations } = get();
        const org = userOrganizations.find(o => o.id === orgId);
        if (org) {
          set({ currentOrg: org });
          // Note: membership should be updated by a separate call
        }
      },

      updateOrganization: (orgId, updates) => {
        set((state) => ({
          userOrganizations: state.userOrganizations.map(org =>
            org.id === orgId ? { ...org, ...updates } : org
          ),
          currentOrg: state.currentOrg?.id === orgId 
            ? { ...state.currentOrg, ...updates } 
            : state.currentOrg
        }));
      },

      addOrganization: (org) => {
        set((state) => ({
          userOrganizations: [...state.userOrganizations, org]
        }));
      },

      removeOrganization: (orgId) => {
        set((state) => ({
          userOrganizations: state.userOrganizations.filter(org => org.id !== orgId),
          currentOrg: state.currentOrg?.id === orgId ? null : state.currentOrg
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),

      reset: () => set({
        currentOrg: null,
        currentMembership: null,
        currentPermissions: [],
        userOrganizations: [],
        isLoading: false,
        isInitialized: false
      }),

      // Permission helpers
      hasPermission: (resource, action, ownerId) => {
        const { currentMembership, currentPermissions } = get();
        if (!currentMembership) return false;

        return currentPermissions.some(permission => {
          if (permission.resource !== resource || permission.action !== action) {
            return false;
          }
          
          // Check scope
          if (permission.scope === 'own' && ownerId && ownerId !== currentMembership.userId) {
            return false;
          }
          
          return true;
        });
      },

      canCreateCaseStudy: () => {
        const { currentMembership } = get();
        // Allow if no organization (backward compatibility) or has permission
        if (!currentMembership) return true;
        return get().hasPermission('case_study', 'create');
      },

      canEditCaseStudy: (ownerId) => {
        return get().hasPermission('case_study', 'update', ownerId);
      },

      canDeleteCaseStudy: (ownerId) => {
        return get().hasPermission('case_study', 'delete', ownerId);
      },

      canInviteMembers: () => {
        const { currentMembership } = get();
        if (!currentMembership) return false;
        return get().hasPermission('member', 'invite');
      },

      canManageOrganization: () => {
        const { currentMembership } = get();
        if (!currentMembership) return false;
        return get().hasPermission('organization', 'update');
      },

      canManageBilling: () => {
        return get().hasPermission('billing', 'update');
      },

      isOwner: () => {
        return get().currentMembership?.role === 'owner';
      },

      isAdmin: () => {
        const role = get().currentMembership?.role;
        return role === 'owner' || role === 'admin';
      },

      isMember: () => {
        const role = get().currentMembership?.role;
        return role === 'owner' || role === 'admin' || role === 'member';
      },

      isViewer: () => {
        return get().currentMembership?.role === 'viewer';
      }
    }),
    {
      name: 'organization-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentOrg: state.currentOrg,
        // Don't persist sensitive data
      }),
    }
  )
);
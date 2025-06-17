import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizationStore } from '@/store/organization-store';
import { organizationService } from '@/lib/organization-service';
import { Organization, OrganizationRole, InvitationStatus } from '@/lib/organization-types';
import toast from 'react-hot-toast';

export function useOrganization() {
  const { user } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  
  const {
    currentOrg,
    currentMembership,
    userOrganizations,
    isLoading,
    isInitialized,
    setCurrentOrg,
    setCurrentMembership,
    setUserOrganizations,
    setLoading,
    setInitialized,
    reset,
    hasPermission,
    canCreateCaseStudy,
    canEditCaseStudy,
    canDeleteCaseStudy,
    canInviteMembers,
    canManageOrganization,
    canManageBilling,
    isOwner,
    isAdmin,
    isMember,
    isViewer
  } = useOrganizationStore();

  // Initialize organizations when user logs in
  useEffect(() => {
    if (user && !isInitialized) {
      initializeOrganizations();
    } else if (!user && isInitialized) {
      reset();
    }
  }, [user, isInitialized]);

  // Load current membership when org changes
  useEffect(() => {
    if (user && currentOrg) {
      loadCurrentMembership();
    }
  }, [user, currentOrg?.id]);

  const initializeOrganizations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Initializing organizations for user:', user.email);
      
      // Load all user's organizations
      const orgs = await organizationService.getUserOrganizations(user.uid);
      console.log('Found organizations:', orgs);
      setUserOrganizations(orgs);

      // Set current org (from localStorage or first available)
      if (orgs.length > 0) {
        const savedOrgId = currentOrg?.id;
        const orgToSet = orgs.find(o => o.id === savedOrgId) || orgs[0];
        console.log('Setting current org:', orgToSet);
        setCurrentOrg(orgToSet);
      } else {
        // No organizations - create personal org or continue without
        console.log('No organizations found, creating personal workspace...');
        await createPersonalOrganization();
      }

      setInitialized(true);
    } catch (error) {
      console.error('Error initializing organizations:', error);
      toast.error('Error loading organizations');
      
      // Continue without organization for backward compatibility
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentMembership = async () => {
    if (!user || !currentOrg) return;

    try {
      const membership = await organizationService.getMembershipByUser(user.uid, currentOrg.id);
      setCurrentMembership(membership);
    } catch (error) {
      console.error('Error loading membership:', error);
    }
  };

  const createPersonalOrganization = async () => {
    if (!user) return;

    try {
      console.log('Creating personal organization for:', user.email);
      
      const orgId = await organizationService.createOrganization(user.uid, {
        name: `${user.displayName || user.email}'s Workspace`,
        description: 'Personal workspace',
        subscription: {
          plan: 'free' as const,
          seats: 1
        },
        settings: {
          maxMembers: 1,
          features: ['basic_templates', 'html_export'],
          defaultRole: OrganizationRole.MEMBER,
          allowMemberInvite: false
        }
      });

      console.log('Created organization with ID:', orgId);

      const newOrg = await organizationService.getOrganization(orgId);
      if (newOrg) {
        console.log('Fetched new organization:', newOrg);
        setUserOrganizations([newOrg]);
        setCurrentOrg(newOrg);
      }
    } catch (error) {
      console.error('Error creating personal organization:', error);
      toast.error('Error creating personal workspace');
      
      // Continue without organization for backward compatibility
      setInitialized(true);
    }
  };

  const createOrganization = async (
    name: string,
    description?: string
  ): Promise<string | null> => {
    if (!user) return null;

    setLocalLoading(true);
    try {
      const orgId = await organizationService.createOrganization(user.uid, {
        name,
        description,
        subscription: {
          plan: 'free' as const,
          seats: 3
        },
        settings: {
          maxMembers: 3,
          features: ['basic_templates', 'html_export'],
          defaultRole: OrganizationRole.MEMBER,
          allowMemberInvite: false
        }
      });

      // Reload organizations
      await initializeOrganizations();
      
      // Switch to new org
      const newOrg = await organizationService.getOrganization(orgId);
      if (newOrg) {
        setCurrentOrg(newOrg);
      }

      toast.success('Organizzazione creata con successo!');
      return orgId;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Errore nella creazione dell\'organizzazione');
      return null;
    } finally {
      setLocalLoading(false);
    }
  };

  const switchOrganization = async (orgId: string) => {
    const org = userOrganizations.find(o => o.id === orgId);
    if (!org) {
      toast.error('Organizzazione non trovata');
      return;
    }

    setCurrentOrg(org);
    
    // Update user's currentOrgId in database
    if (user) {
      // This would update the user document to remember the selection
      // await userService.updateCurrentOrg(user.uid, orgId);
    }

    toast.success(`Passato a ${org.name}`);
  };

  const inviteMember = async (
    email: string,
    role: OrganizationRole,
    message?: string
  ): Promise<boolean> => {
    if (!user || !currentOrg || !canInviteMembers()) {
      toast.error('Non hai i permessi per invitare membri');
      return false;
    }

    setLocalLoading(true);
    try {
      const token = await organizationService.createInvitation(
        currentOrg.id,
        email,
        role,
        user.uid,
        user.displayName || user.email || undefined,
        message
      );

      // Here you would send the invitation email
      // For now, just log the invite link
      const inviteLink = `${window.location.origin}/invite?token=${token}`;
      console.log('Invite link:', inviteLink);

      toast.success(`Invito inviato a ${email}`);
      return true;
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Errore nell\'invio dell\'invito');
      return false;
    } finally {
      setLocalLoading(false);
    }
  };

  const acceptInvitation = async (token: string): Promise<string | null> => {
    if (!user) {
      toast.error('Devi effettuare l\'accesso per accettare l\'invito');
      return null;
    }

    setLocalLoading(true);
    try {
      const orgId = await organizationService.acceptInvitation(token, user.uid);
      
      // Reload organizations
      await initializeOrganizations();
      
      // Switch to new org
      const newOrg = await organizationService.getOrganization(orgId);
      if (newOrg) {
        setCurrentOrg(newOrg);
        toast.success(`Benvenuto in ${newOrg.name}!`);
      }

      return orgId;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Invito non valido o scaduto');
      return null;
    } finally {
      setLocalLoading(false);
    }
  };

  const updateMemberRole = async (
    memberId: string,
    newRole: OrganizationRole
  ): Promise<boolean> => {
    if (!user || !isAdmin()) {
      toast.error('Non hai i permessi per modificare i ruoli');
      return false;
    }

    try {
      await organizationService.updateMemberRole(memberId, newRole, user.uid);
      toast.success('Ruolo aggiornato con successo');
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Errore nell\'aggiornamento del ruolo');
      return false;
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    if (!user || !isAdmin()) {
      toast.error('Non hai i permessi per rimuovere membri');
      return false;
    }

    try {
      await organizationService.removeMember(memberId, user.uid);
      toast.success('Membro rimosso con successo');
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Errore nella rimozione del membro');
      return false;
    }
  };

  const leaveOrganization = async (): Promise<boolean> => {
    if (!user || !currentOrg || !currentMembership) {
      return false;
    }

    if (isOwner()) {
      toast.error('Il proprietario non può lasciare l\'organizzazione');
      return false;
    }

    try {
      await organizationService.removeMember(currentMembership.id, user.uid);
      
      // Reload organizations
      await initializeOrganizations();
      
      toast.success('Hai lasciato l\'organizzazione');
      return true;
    } catch (error) {
      console.error('Error leaving organization:', error);
      toast.error('Errore nel lasciare l\'organizzazione');
      return false;
    }
  };

  return {
    // State
    currentOrg,
    currentMembership,
    userOrganizations,
    isLoading: isLoading || localLoading,
    
    // Actions
    createOrganization,
    switchOrganization,
    inviteMember,
    acceptInvitation,
    updateMemberRole,
    removeMember,
    leaveOrganization,
    
    // Permissions
    hasPermission,
    canCreateCaseStudy,
    canEditCaseStudy,
    canDeleteCaseStudy,
    canInviteMembers,
    canManageOrganization,
    canManageBilling,
    isOwner,
    isAdmin,
    isMember,
    isViewer
  };
}
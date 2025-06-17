import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Organization, 
  OrganizationMember, 
  Invitation, 
  OrganizationRole,
  InvitationStatus,
  SubscriptionPlan,
  PLAN_LIMITS,
  OrganizationEvent 
} from '@/types/organization';
import { v4 as uuidv4 } from 'uuid';

const ORGANIZATIONS_COLLECTION = 'organizations';
const MEMBERS_COLLECTION = 'organizationMembers';
const INVITATIONS_COLLECTION = 'invitations';
const EVENTS_COLLECTION = 'organizationEvents';

export const organizationService = {
  // ===== ORGANIZATIONS =====
  
  async createOrganization(
    userId: string, 
    data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>
  ): Promise<string> {
    const orgId = uuidv4();
    const batch = writeBatch(db);

    // Create organization
    const organization: Omit<Organization, 'id'> = {
      ...data,
      ownerId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: data.subscription || {
        plan: SubscriptionPlan.FREE,
        seats: PLAN_LIMITS[SubscriptionPlan.FREE].maxMembers
      },
      settings: {
        ...data.settings,
        maxMembers: data.settings?.maxMembers || PLAN_LIMITS[SubscriptionPlan.FREE].maxMembers,
        features: data.settings?.features || PLAN_LIMITS[SubscriptionPlan.FREE].features,
        defaultRole: data.settings?.defaultRole || OrganizationRole.MEMBER,
        allowMemberInvite: data.settings?.allowMemberInvite ?? false
      }
    };

    batch.set(doc(db, ORGANIZATIONS_COLLECTION, orgId), {
      ...organization,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Add owner as first member
    const memberId = uuidv4();
    const ownerMember: Omit<OrganizationMember, 'id'> = {
      orgId,
      userId,
      role: OrganizationRole.OWNER,
      joinedAt: new Date(),
      invitedBy: userId // self-invited
    };

    batch.set(doc(db, MEMBERS_COLLECTION, memberId), {
      ...ownerMember,
      joinedAt: serverTimestamp()
    });

    // Log event
    await this.logEvent(orgId, userId, 'org_created', { organizationName: data.name });

    await batch.commit();
    return orgId;
  },

  async getOrganization(orgId: string): Promise<Organization | null> {
    const docSnap = await getDoc(doc(db, ORGANIZATIONS_COLLECTION, orgId));
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Organization;
    }
    
    return null;
  },

  async updateOrganization(
    orgId: string, 
    updates: Partial<Omit<Organization, 'id' | 'createdAt' | 'ownerId'>>
  ): Promise<void> {
    await updateDoc(doc(db, ORGANIZATIONS_COLLECTION, orgId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteOrganization(orgId: string): Promise<void> {
    // This should be called only by owner and should delete all related data
    const batch = writeBatch(db);

    // Delete organization
    batch.delete(doc(db, ORGANIZATIONS_COLLECTION, orgId));

    // Delete all members
    const membersQuery = query(
      collection(db, MEMBERS_COLLECTION),
      where('orgId', '==', orgId)
    );
    const members = await getDocs(membersQuery);
    members.forEach(doc => batch.delete(doc.ref));

    // Delete all invitations
    const invitesQuery = query(
      collection(db, INVITATIONS_COLLECTION),
      where('orgId', '==', orgId)
    );
    const invites = await getDocs(invitesQuery);
    invites.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
  },

  // ===== MEMBERS =====

  async getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
    const q = query(
      collection(db, MEMBERS_COLLECTION),
      where('orgId', '==', orgId),
      orderBy('joinedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const members: OrganizationMember[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      members.push({
        id: doc.id,
        ...data,
        joinedAt: data.joinedAt?.toDate() || new Date()
      } as OrganizationMember);
    });
    
    return members;
  },

  async getMembershipByUser(userId: string, orgId: string): Promise<OrganizationMember | null> {
    const q = query(
      collection(db, MEMBERS_COLLECTION),
      where('userId', '==', userId),
      where('orgId', '==', orgId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        joinedAt: data.joinedAt?.toDate() || new Date()
      } as OrganizationMember;
    }
    
    return null;
  },

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    // Get all memberships for user
    const membershipsQuery = query(
      collection(db, MEMBERS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const membershipDocs = await getDocs(membershipsQuery);
    const orgIds = membershipDocs.docs.map(doc => doc.data().orgId);
    
    if (orgIds.length === 0) return [];
    
    // Get all organizations
    const organizations: Organization[] = [];
    for (const orgId of orgIds) {
      const org = await this.getOrganization(orgId);
      if (org) organizations.push(org);
    }
    
    return organizations;
  },

  async updateMemberRole(
    memberId: string, 
    newRole: OrganizationRole,
    updatedBy: string
  ): Promise<void> {
    const memberDoc = await getDoc(doc(db, MEMBERS_COLLECTION, memberId));
    if (!memberDoc.exists()) throw new Error('Member not found');

    const memberData = memberDoc.data();
    const oldRole = memberData.role;

    await updateDoc(doc(db, MEMBERS_COLLECTION, memberId), {
      role: newRole
    });

    // Log event
    await this.logEvent(memberData.orgId, updatedBy, 'role_changed', {
      memberId,
      oldRole,
      newRole
    });
  },

  async removeMember(memberId: string, removedBy: string): Promise<void> {
    const memberDoc = await getDoc(doc(db, MEMBERS_COLLECTION, memberId));
    if (!memberDoc.exists()) throw new Error('Member not found');

    const memberData = memberDoc.data();
    
    await deleteDoc(doc(db, MEMBERS_COLLECTION, memberId));

    // Log event
    await this.logEvent(memberData.orgId, removedBy, 'member_removed', {
      removedUserId: memberData.userId
    });
  },

  // ===== INVITATIONS =====

  async createInvitation(
    orgId: string,
    email: string,
    role: OrganizationRole,
    invitedBy: string,
    invitedByName?: string,
    message?: string
  ): Promise<string> {
    const inviteId = uuidv4();
    const token = uuidv4(); // Simple token, in production use crypto
    
    const invitation: Omit<Invitation, 'id'> = {
      orgId,
      email,
      role,
      invitedBy,
      invitedByName,
      message,
      token,
      status: InvitationStatus.PENDING,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    await setDoc(doc(db, INVITATIONS_COLLECTION, inviteId), {
      ...invitation,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(invitation.expiresAt)
    });

    // Log event
    await this.logEvent(orgId, invitedBy, 'member_invited', { email, role });

    return token;
  },

  async getInvitationByToken(token: string): Promise<Invitation | null> {
    const q = query(
      collection(db, INVITATIONS_COLLECTION),
      where('token', '==', token),
      where('status', '==', InvitationStatus.PENDING),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      // Check if expired
      const expiresAt = data.expiresAt?.toDate() || new Date();
      if (expiresAt < new Date()) {
        await this.updateInvitationStatus(doc.id, InvitationStatus.EXPIRED);
        return null;
      }
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt
      } as Invitation;
    }
    
    return null;
  },

  async acceptInvitation(token: string, userId: string): Promise<string> {
    const invitation = await this.getInvitationByToken(token);
    if (!invitation) throw new Error('Invalid or expired invitation');

    const batch = writeBatch(db);

    // Update invitation status
    batch.update(doc(db, INVITATIONS_COLLECTION, invitation.id), {
      status: InvitationStatus.ACCEPTED,
      acceptedAt: serverTimestamp()
    });

    // Add user as member
    const memberId = uuidv4();
    const member: Omit<OrganizationMember, 'id'> = {
      orgId: invitation.orgId,
      userId,
      role: invitation.role,
      joinedAt: new Date(),
      invitedBy: invitation.invitedBy
    };

    batch.set(doc(db, MEMBERS_COLLECTION, memberId), {
      ...member,
      joinedAt: serverTimestamp()
    });

    await batch.commit();

    // Log event
    await this.logEvent(invitation.orgId, userId, 'member_joined', {
      invitedBy: invitation.invitedBy,
      role: invitation.role
    });

    return invitation.orgId;
  },

  async getOrganizationInvitations(
    orgId: string, 
    status?: InvitationStatus
  ): Promise<Invitation[]> {
    let q = query(
      collection(db, INVITATIONS_COLLECTION),
      where('orgId', '==', orgId),
      orderBy('createdAt', 'desc')
    );
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const querySnapshot = await getDocs(q);
    const invitations: Invitation[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      invitations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date()
      } as Invitation);
    });
    
    return invitations;
  },

  async updateInvitationStatus(
    inviteId: string, 
    status: InvitationStatus
  ): Promise<void> {
    await updateDoc(doc(db, INVITATIONS_COLLECTION, inviteId), {
      status
    });
  },

  async cancelInvitation(inviteId: string): Promise<void> {
    await this.updateInvitationStatus(inviteId, InvitationStatus.DECLINED);
  },

  // ===== EVENTS/AUDIT LOG =====

  async logEvent(
    orgId: string,
    userId: string,
    action: OrganizationEvent['action'],
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventId = uuidv4();
    const event: Omit<OrganizationEvent, 'id' | 'userEmail'> = {
      orgId,
      userId,
      action,
      metadata,
      createdAt: new Date()
    };

    await setDoc(doc(db, EVENTS_COLLECTION, eventId), {
      ...event,
      createdAt: serverTimestamp()
    });
  },

  async getOrganizationEvents(
    orgId: string, 
    limitCount: number = 50
  ): Promise<OrganizationEvent[]> {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('orgId', '==', orgId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const events: OrganizationEvent[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as OrganizationEvent);
    });
    
    return events;
  },

  // ===== PERMISSIONS =====

  hasPermission(
    member: OrganizationMember,
    resource: string,
    action: string,
    ownerId?: string
  ): boolean {
    const rolePermissions = ROLE_PERMISSIONS[member.role];
    
    return rolePermissions.some(permission => {
      if (permission.resource !== resource || permission.action !== action) {
        return false;
      }
      
      // Check scope
      if (permission.scope === 'own' && ownerId && ownerId !== member.userId) {
        return false;
      }
      
      return true;
    });
  }
};
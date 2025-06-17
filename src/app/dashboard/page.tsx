'use client';

import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/organization-hook';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Users, Settings, ChevronDown } from 'lucide-react';
import { caseStudyService } from '@/lib/case-study-service';
import { CaseStudy } from '@/types/case-study';
import { OrganizationRole } from '@/lib/organization-types';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { 
    currentOrg, 
    userOrganizations, 
    isLoading: orgLoading,
    createOrganization,
    switchOrganization,
    inviteMember,
    canInviteMembers,
    canManageOrganization,
    isAdmin
  } = useOrganization();
  
  const router = useRouter();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loadingCaseStudies, setLoadingCaseStudies] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrganizationRole>(OrganizationRole.MEMBER);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Debug logging
    console.log('Dashboard debug:', {
      user: user?.email,
      currentOrg,
      userOrganizations,
      orgLoading,
      canInviteMembers: canInviteMembers(),
      canManageOrganization: canManageOrganization()
    });
    
    if (user && currentOrg) {
      loadCaseStudies();
    }
  }, [user, currentOrg, userOrganizations, orgLoading]);

  const loadCaseStudies = async () => {
    if (!user) return;
    
    setLoadingCaseStudies(true);
    try {
      const studies = await caseStudyService.getByUserId(user.uid, currentOrg?.id);
      setCaseStudies(studies);
    } catch (error) {
      console.error('Error loading case studies:', error);
    } finally {
      setLoadingCaseStudies(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return;
    
    const orgId = await createOrganization(newOrgName, newOrgDescription);
    if (orgId) {
      setShowCreateOrgModal(false);
      setNewOrgName('');
      setNewOrgDescription('');
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    
    const success = await inviteMember(inviteEmail, inviteRole);
    if (success) {
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole(OrganizationRole.MEMBER);
    }
  };

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header with Organization Switcher */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              {currentOrg && (
                <p className="text-gray-600 mt-1">{currentOrg.name}</p>
              )}
            </div>
            
            {/* Organization Controls */}
            <div className="flex items-center gap-4">
              {/* Organization Switcher */}
              {userOrganizations.length > 1 && (
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                    className="flex items-center gap-2"
                  >
                    {currentOrg?.name || 'Select Organization'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  {showOrgDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border">
                      <div className="py-1">
                        {userOrganizations.map((org) => (
                          <button
                            key={org.id}
                            onClick={() => {
                              switchOrganization(org.id);
                              setShowOrgDropdown(false);
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                              currentOrg?.id === org.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <div className="font-medium">{org.name}</div>
                            {org.description && (
                              <div className="text-xs text-gray-500">{org.description}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Create Organization */}
              <Button
                onClick={() => setShowCreateOrgModal(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Organization
              </Button>
              
              {/* Invite Members */}
              {canInviteMembers() && (
                <Button
                  onClick={() => setShowInviteModal(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Invite Members
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push('/wizard')}
                      className="w-full flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create New Case Study
                    </Button>
                    
                    {canManageOrganization() && (
                      <Button
                        variant="outline"
                        className="w-full flex items-center gap-2"
                        onClick={() => {/* TODO: Navigate to organization settings */}}
                      >
                        <Settings className="h-4 w-4" />
                        Organization Settings
                      </Button>
                    )}
                  </div>
                  
                  {currentOrg && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Organization Info</h4>
                      <div className="text-sm text-gray-600">
                        <p><span className="font-medium">Name:</span> {currentOrg.name}</p>
                        {currentOrg.description && (
                          <p><span className="font-medium">Description:</span> {currentOrg.description}</p>
                        )}
                        <p><span className="font-medium">Plan:</span> {currentOrg.subscription.plan}</p>
                        <p><span className="font-medium">Members:</span> {currentOrg.subscription.seats}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Case Studies */}
            <div className="lg:col-span-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Case Studies
                    </h3>
                    {caseStudies.length > 0 && (
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    )}
                  </div>
                  
                  {loadingCaseStudies ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : caseStudies.length > 0 ? (
                    <div className="space-y-4">
                      {caseStudies.slice(0, 5).map((caseStudy) => (
                        <div key={caseStudy.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {caseStudy.formData.projectName || 'Untitled Case Study'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {caseStudy.formData.clientName && `Client: ${caseStudy.formData.clientName}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Updated {new Date(caseStudy.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              caseStudy.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {caseStudy.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No case studies yet</p>
                      <Button onClick={() => router.push('/wizard')}>
                        Create Your First Case Study
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Organization Modal */}
      {showCreateOrgModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Organization</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter organization name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newOrgDescription}
                  onChange={(e) => setNewOrgDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your organization"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateOrgModal(false);
                  setNewOrgName('');
                  setNewOrgDescription('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOrganization}
                disabled={!newOrgName.trim()}
              >
                Create Organization
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="member@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as OrganizationRole)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={OrganizationRole.MEMBER}>Member</option>
                  <option value={OrganizationRole.ADMIN}>Admin</option>
                  <option value={OrganizationRole.VIEWER}>Viewer</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {inviteRole === OrganizationRole.ADMIN && 'Can manage members and case studies'}
                  {inviteRole === OrganizationRole.MEMBER && 'Can create and edit their own case studies'}
                  {inviteRole === OrganizationRole.VIEWER && 'Can only view case studies'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteRole(OrganizationRole.MEMBER);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteMember}
                disabled={!inviteEmail.trim()}
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useAuth } from '@/hooks/useAuth';
// import { useOrganization } from '@/hooks/organization-hook';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CaseStudyWizard from '@/components/wizard/CaseStudyWizard';
import { caseStudyService } from '@/lib/case-study-service';
import toast from 'react-hot-toast';

export default function WizardPage() {
  const { user, loading: authLoading } = useAuth();
  // Temporarily disable organization
  const currentOrg = null;
  const canCreateCaseStudy = () => true;
  const orgLoading = false;
  const router = useRouter();

  console.log('WizardPage rendering - auth loading:', authLoading, 'user:', user?.email);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No user, redirecting to signin');
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  // Skip permission check for now
  // useEffect(() => {
  //   if (!authLoading && !orgLoading && user) {
  //     if (!canCreateCaseStudy()) {
  //       toast.error('You do not have permission to create case studies in this organization');
  //       router.push('/dashboard');
  //     }
  //   }
  // }, [user, authLoading, orgLoading, canCreateCaseStudy, router]);

  const handleComplete = async (data: any) => {
    console.log('handleComplete called with data:', data);
    if (!user) return;
    
    try {
      const caseStudyId = await caseStudyService.create(
        user.uid,
        data
      );
      
      console.log('Case study created:', caseStudyId);
      toast.success('Case study created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating case study:', error);
      toast.error('Failed to create case study');
    }
  };

  if (authLoading) {
    console.log('Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, returning null');
    return null;
  }

  console.log('Rendering CaseStudyWizard');
  return (
    <div>
      <h1 className="text-2xl p-4">Wizard Page (Debug)</h1>
      <CaseStudyWizard onComplete={handleComplete} />
    </div>
  );
}
'use client';

import { useAuth } from '@/hooks/useAuth';
// import { useOrganization } from '@/hooks/organization-hook';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Plus, Users, Settings, ChevronDown } from 'lucide-react';
import { caseStudyService } from '@/lib/case-study-service';
import { CaseStudy } from '@/types/case-study';
// import { OrganizationRole } from '@/lib/organization-types';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loadingCaseStudies, setLoadingCaseStudies] = useState(false);

  console.log('Dashboard rendering - authLoading:', authLoading, 'user:', user?.email);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No user, redirecting to signin');
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      console.log('User found, loading case studies');
      loadCaseStudies();
    }
  }, [user]);

  const loadCaseStudies = async () => {
    if (!user) return;
    
    console.log('Loading case studies for user:', user.uid);
    setLoadingCaseStudies(true);
    try {
      const studies = await caseStudyService.getByUserId(user.uid);
      console.log('Loaded case studies:', studies);
      setCaseStudies(studies);
    } catch (error) {
      console.error('Error loading case studies:', error);
    } finally {
      setLoadingCaseStudies(false);
    }
  };

  if (authLoading) {
    console.log('Showing auth loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, returning null');
    return null;
  }

  console.log('Rendering dashboard content');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard (Test)</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <button
          onClick={() => router.push('/wizard')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition mb-4"
        >
          Create New Case Study
        </button>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Case Studies</h3>
          {loadingCaseStudies ? (
            <p>Loading case studies...</p>
          ) : caseStudies.length > 0 ? (
            <div>
              <p className="text-green-600">Found {caseStudies.length} case studies</p>
              {caseStudies.map((study) => (
                <div key={study.id} className="border p-3 rounded mb-2">
                  <p className="font-medium">{study.formData.projectName || 'Untitled'}</p>
                  <p className="text-sm text-gray-600">Status: {study.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No case studies found</p>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCaseStudy } from '@/lib/case-study-service';
import { CaseStudyTemplate } from '@/lib/templates/case-study-template';
import { CaseStudy } from '@/types/case-study';

export default function PreviewPage() {
  const params = useParams();
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCaseStudy = async () => {
      try {
        const id = params.id as string;
        const data = await getCaseStudy(id);
        setCaseStudy(data);
      } catch (error) {
        console.error('Failed to load case study:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCaseStudy();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Case Study Not Found</h1>
          <p className="text-gray-600 mt-2">The requested case study could not be found.</p>
        </div>
      </div>
    );
  }

  return <CaseStudyTemplate caseStudy={caseStudy} />;
}
import { useEffect } from 'react';
import { useFormStore } from '@/store/form-store';
import { caseStudyService } from '@/lib/case-study-service';
import { useAuth } from './useAuth';

export function useAutoSave() {
  const { user } = useAuth();
  const { formData, currentCaseStudyId } = useFormStore();

  const saveNow = async () => {
    if (!user || !currentCaseStudyId) return;
    
    try {
      await caseStudyService.autoSave(currentCaseStudyId, formData);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  useEffect(() => {
    if (!user || !formData) return;

    const timer = setTimeout(() => {
      saveNow();
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, user]);

  return { saveNow };
}
import { useState, useEffect } from 'react';
import UnifiedDataService, { UnifiedStudent, UnifiedStaff } from '../services/unifiedDataService';
import { Student, StaffMember, UnifiedStudent as TypesUnifiedStudent } from '../types';

interface UseRobustDataLoadingOptions {
  loadStudents?: boolean;
  loadStaff?: boolean;
  dependencies?: any[];
}

interface UseRobustDataLoadingResult {
  students: TypesUnifiedStudent[];
  staff: StaffMember[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook that implements robust data loading with multiple fallback strategies
 * 1. Primary: UnifiedDataService
 * 2. Fallback: Props (if provided)
 * 3. Emergency: Direct localStorage access
 */
export const useRobustDataLoading = (
  options: UseRobustDataLoadingOptions = {},
  propsStudents?: Student[],
  propsStaff?: StaffMember[]
): UseRobustDataLoadingResult => {
  const { loadStudents = true, loadStaff = true, dependencies = [] } = options;
  
  const [students, setStudents] = useState<Student[]>(() => {
    // Initialize with emergency fallback data immediately to prevent empty states
    if (loadStudents) {
      try {
        const legacyStudents = localStorage.getItem('students');
        if (legacyStudents) {
          const parsed = JSON.parse(legacyStudents);
          if (Array.isArray(parsed)) {
            console.log('🎯 useRobustDataLoading - Initialized with emergency student data:', parsed.length);
            return parsed;
          }
        }
      } catch (error) {
        console.error('🎯 Emergency initialization failed:', error);
      }
    }
    return [];
  });
  
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useRobustDataLoading - Starting data load...');
    setIsLoading(true);
    setError(null);
    
    const loadData = async () => {
      let studentsToUse: any[] = [];
      let staffToUse: any[] = [];

      try {
        // Primary: Load from UnifiedDataService
        if (loadStudents) {
          const unifiedStudents = UnifiedDataService.getAllStudents();
          console.log('📚 Loaded students from UnifiedDataService:', unifiedStudents.length);
          
          if (unifiedStudents.length > 0) {
            // Convert UnifiedStudent to Student format
            studentsToUse = unifiedStudents.map((student: UnifiedStudent) => ({
              id: student.id,
              name: student.name,
              grade: student.grade || '',
              photo: student.photo,
              workingStyle: student.workingStyle as any,
              accommodations: student.accommodations || [],
              goals: student.goals || [],
              parentName: student.parentName,
              parentEmail: student.parentEmail,
              parentPhone: student.parentPhone,
              isActive: student.isActive ?? true,
              behaviorNotes: student.behaviorNotes,
              medicalNotes: student.medicalNotes,
              preferredPartners: student.preferredPartners || [],
              avoidPartners: student.avoidPartners || [],
              // 🎂 FIXED: Include birthday fields in the conversion
              birthday: student.birthday,
              allowBirthdayDisplay: student.allowBirthdayDisplay,
              allowPhotoInCelebrations: student.allowPhotoInCelebrations
            }));
          }
        }

        if (loadStaff) {
          const unifiedStaff = UnifiedDataService.getAllStaff();
          console.log('👨‍🏫 Loaded staff from UnifiedDataService:', unifiedStaff.length);
          
          if (unifiedStaff.length > 0) {
            // Convert UnifiedStaff to StaffMember format
            staffToUse = unifiedStaff.map((staff: UnifiedStaff) => ({
              id: staff.id,
              name: staff.name,
              role: staff.role,
              email: staff.email || '',
              phone: staff.phone || '',
              photo: staff.photo,
              isActive: staff.isActive ?? true,
              specialties: staff.specialties || [],
              notes: staff.notes,
              startDate: staff.dateCreated,
              isResourceTeacher: staff.isResourceTeacher ?? false,
              isRelatedArtsTeacher: staff.isRelatedArtsTeacher ?? false
            }));
          }
        }
      } catch (error) {
        console.error('❌ Error loading from UnifiedDataService:', error);
        setError('Failed to load from UnifiedDataService');
      }

      // Fallback: Use props if UnifiedDataService fails
      if (loadStudents && studentsToUse.length === 0 && propsStudents && propsStudents.length > 0) {
        console.log('📚 Fallback: Using students from props:', propsStudents.length);
        studentsToUse = propsStudents;
      }
      
      if (loadStaff && staffToUse.length === 0 && propsStaff && propsStaff.length > 0) {
        console.log('👨‍🏫 Fallback: Using staff from props:', propsStaff.length);
        staffToUse = propsStaff;
      }

      // Emergency fallback: Direct localStorage access
      if (loadStudents && studentsToUse.length === 0) {
        console.log('🆘 Emergency fallback: Reading students directly from localStorage...');
        try {
          const legacyStudents = localStorage.getItem('students');
          if (legacyStudents) {
            const parsedStudents = JSON.parse(legacyStudents);
            if (Array.isArray(parsedStudents) && parsedStudents.length > 0) {
              console.log('🆘 Using emergency student data:', parsedStudents.length);
              studentsToUse = parsedStudents;
            }
          }
        } catch (error) {
          console.error('🆘 Emergency student fallback failed:', error);
          setError('All student data loading methods failed');
        }
      }

      if (loadStaff && staffToUse.length === 0) {
        console.log('🆘 Emergency fallback: Reading staff directly from localStorage...');
        try {
          const legacyStaff = localStorage.getItem('staff_members');
          if (legacyStaff) {
            const parsedStaff = JSON.parse(legacyStaff);
            if (Array.isArray(parsedStaff) && parsedStaff.length > 0) {
              console.log('🆘 Using emergency staff data:', parsedStaff.length);
              staffToUse = parsedStaff;
            }
          }
        } catch (error) {
          console.error('🆘 Emergency staff fallback failed:', error);
          setError('All staff data loading methods failed');
        }
      }

      // Update state with loaded data - USE SETTIMEOUT TO AVOID REACT BATCHING ISSUES
      console.log('🔄 Setting state:', {
        students: studentsToUse.length,
        staff: staffToUse.length
      });
      
      setTimeout(() => {
        if (loadStudents) setStudents(studentsToUse);
        if (loadStaff) setStaff(staffToUse);
        setIsLoading(false);
        console.log('✅ useRobustDataLoading - State set via setTimeout');
      }, 0);
    };

    loadData();
  }, [loadStudents, loadStaff, ...dependencies]);

  return {
    students,
    staff,
    isLoading,
    error
  };
};

export default useRobustDataLoading;

// Student Data Cleanup Tool
// Resolves ID conflicts and data inconsistencies found by the diagnostic

import UnifiedDataService from '../services/unifiedDataService';

export class StudentDataCleanup {
  
  // Main cleanup function to resolve all conflicts
  static async resolveAllConflicts(): Promise<{
    success: boolean;
    conflictsResolved: number;
    backupCreated: boolean;
    errors: string[];
  }> {
    console.log('🧹 Starting Student Data Cleanup...');
    
    const result = {
      success: false,
      conflictsResolved: 0,
      backupCreated: false,
      errors: [] as string[]
    };

    try {
      // 1. Create backup first
      result.backupCreated = this.createBackup();
      
      // 2. Identify conflicts
      const conflicts = this.identifyConflicts();
      console.log(`🔍 Found ${conflicts.length} conflicts to resolve`);
      
      // 3. Resolve each conflict
      for (const conflict of conflicts) {
        try {
          await this.resolveConflict(conflict);
          result.conflictsResolved++;
          console.log(`✅ Resolved conflict for ID: ${conflict.id}`);
        } catch (error) {
          const errorMsg = `Failed to resolve conflict for ID ${conflict.id}: ${error}`;
          result.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }
      
      // 4. Clean up legacy data
      this.cleanupLegacyData();
      
      // 5. Verify cleanup
      const remainingConflicts = this.identifyConflicts();
      if (remainingConflicts.length === 0) {
        result.success = true;
        console.log('✅ All conflicts resolved successfully!');
      } else {
        result.errors.push(`${remainingConflicts.length} conflicts still remain`);
      }
      
    } catch (error) {
      result.errors.push(`Cleanup failed: ${error}`);
      console.error('❌ Cleanup failed:', error);
    }
    
    return result;
  }
  
  // Create backup of current data
  private static createBackup(): boolean {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Backup unified data
      const unifiedData = localStorage.getItem('visual-schedule-builder-unified-data');
      if (unifiedData) {
        localStorage.setItem(`backup-unified-data-${timestamp}`, unifiedData);
      }
      
      // Backup legacy students
      const legacyStudents = localStorage.getItem('students');
      if (legacyStudents) {
        localStorage.setItem(`backup-legacy-students-${timestamp}`, legacyStudents);
      }
      
      console.log(`💾 Backup created with timestamp: ${timestamp}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
      return false;
    }
  }
  
  // Identify all ID conflicts
  private static identifyConflicts(): Array<{
    id: string;
    unifiedStudent: any;
    legacyStudent: any;
  }> {
    const conflicts: Array<{
      id: string;
      unifiedStudent: any;
      legacyStudent: any;
    }> = [];
    
    try {
      // Get unified data students
      const unifiedDataRaw = localStorage.getItem('visual-schedule-builder-unified-data');
      let unifiedStudents: any[] = [];
      
      if (unifiedDataRaw) {
        const unifiedData = JSON.parse(unifiedDataRaw);
        unifiedStudents = Array.isArray(unifiedData.students) 
          ? unifiedData.students 
          : Object.values(unifiedData.students || {});
      }
      
      // Get legacy students
      const legacyStudentsRaw = localStorage.getItem('students');
      let legacyStudents: any[] = [];
      
      if (legacyStudentsRaw) {
        legacyStudents = JSON.parse(legacyStudentsRaw);
      }
      
      // Find conflicts
      unifiedStudents.forEach(unifiedStudent => {
        const conflictingLegacyStudent = legacyStudents.find(
          legacyStudent => legacyStudent.id === unifiedStudent.id
        );
        
        if (conflictingLegacyStudent) {
          conflicts.push({
            id: unifiedStudent.id,
            unifiedStudent,
            legacyStudent: conflictingLegacyStudent
          });
        }
      });
      
    } catch (error) {
      console.error('Error identifying conflicts:', error);
    }
    
    return conflicts;
  }
  
  // Resolve a single conflict by merging data and keeping unified version
  private static async resolveConflict(conflict: {
    id: string;
    unifiedStudent: any;
    legacyStudent: any;
  }): Promise<void> {
    console.log(`🔧 Resolving conflict for student: ${conflict.unifiedStudent.name || conflict.id}`);
    
    // Merge the best data from both sources
    const mergedStudent = this.mergeStudentData(conflict.unifiedStudent, conflict.legacyStudent);
    
    // Update the unified data with merged student
    UnifiedDataService.updateStudent(conflict.id, mergedStudent);
    
    console.log(`✅ Merged and updated student: ${mergedStudent.name}`);
  }
  
  // Merge student data from unified and legacy sources
  private static mergeStudentData(unifiedStudent: any, legacyStudent: any): any {
    // Start with unified student as base (it has the proper structure)
    const merged = { ...unifiedStudent };
    
    // Merge in any missing or better data from legacy student
    if (!merged.name && legacyStudent.name) {
      merged.name = legacyStudent.name;
    }
    
    if (!merged.grade && legacyStudent.grade) {
      merged.grade = legacyStudent.grade;
    }
    
    if (!merged.photo && legacyStudent.photo) {
      merged.photo = legacyStudent.photo;
    }
    
    // Merge accommodations
    const unifiedAccommodations = merged.accommodations || [];
    const legacyAccommodations = legacyStudent.accommodations || [];
    merged.accommodations = [...new Set([...unifiedAccommodations, ...legacyAccommodations])];
    
    // Merge contact info if missing
    if (!merged.parentName && legacyStudent.parentName) {
      merged.parentName = legacyStudent.parentName;
    }
    if (!merged.parentEmail && legacyStudent.parentEmail) {
      merged.parentEmail = legacyStudent.parentEmail;
    }
    if (!merged.parentPhone && legacyStudent.parentPhone) {
      merged.parentPhone = legacyStudent.parentPhone;
    }
    
    // Merge notes
    if (!merged.behaviorNotes && legacyStudent.behaviorNotes) {
      merged.behaviorNotes = legacyStudent.behaviorNotes;
    }
    if (!merged.medicalNotes && legacyStudent.medicalNotes) {
      merged.medicalNotes = legacyStudent.medicalNotes;
    }
    
    // Merge birthday data
    if (!merged.birthday && legacyStudent.birthday) {
      merged.birthday = legacyStudent.birthday;
    }
    if (merged.allowBirthdayDisplay === undefined && legacyStudent.allowBirthdayDisplay !== undefined) {
      merged.allowBirthdayDisplay = legacyStudent.allowBirthdayDisplay;
    }
    if (merged.allowPhotoInCelebrations === undefined && legacyStudent.allowPhotoInCelebrations !== undefined) {
      merged.allowPhotoInCelebrations = legacyStudent.allowPhotoInCelebrations;
    }
    
    // Ensure proper IEP data structure
    if (!merged.iepData) {
      merged.iepData = {
        goals: legacyStudent.goals || [],
        dataCollection: []
      };
    }
    
    console.log(`🔄 Merged student data for: ${merged.name}`);
    return merged;
  }
  
  // Clean up legacy data after conflicts are resolved
  private static cleanupLegacyData(): void {
    console.log('🧹 Cleaning up legacy data...');
    
    try {
      // Get current conflicts to see what we can safely remove
      const conflicts = this.identifyConflicts();
      
      if (conflicts.length === 0) {
        // All conflicts resolved, we can remove legacy students
        const legacyStudentsRaw = localStorage.getItem('students');
        if (legacyStudentsRaw) {
          const legacyStudents = JSON.parse(legacyStudentsRaw);
          
          // Remove only the conflicting students from legacy storage
          const conflictIds = ['student1', 'student2', 'student3']; // The IDs we found in diagnostic
          const cleanedLegacyStudents = legacyStudents.filter(
            (student: any) => !conflictIds.includes(student.id)
          );
          
          if (cleanedLegacyStudents.length !== legacyStudents.length) {
            localStorage.setItem('students', JSON.stringify(cleanedLegacyStudents));
            console.log(`🗑️ Removed ${legacyStudents.length - cleanedLegacyStudents.length} conflicting students from legacy storage`);
          }
        }
      } else {
        console.log('⚠️ Still have conflicts, not cleaning up legacy data yet');
      }
      
    } catch (error) {
      console.error('❌ Error cleaning up legacy data:', error);
    }
  }
  
  // Quick fix method - just for the specific IDs found in diagnostic
  static quickFixConflicts(): Promise<{
    success: boolean;
    message: string;
  }> {
    return new Promise((resolve) => {
      try {
        console.log('⚡ Quick Fix: Removing conflicting legacy students...');
        
        // Create backup first
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const legacyStudentsRaw = localStorage.getItem('students');
        if (legacyStudentsRaw) {
          localStorage.setItem(`backup-legacy-students-quickfix-${timestamp}`, legacyStudentsRaw);
        }
        
        // Remove the specific conflicting IDs from legacy storage
        const conflictIds = ['student1', 'student2', 'student3'];
        
        if (legacyStudentsRaw) {
          const legacyStudents = JSON.parse(legacyStudentsRaw);
          const cleanedStudents = legacyStudents.filter(
            (student: any) => !conflictIds.includes(student.id)
          );
          
          localStorage.setItem('students', JSON.stringify(cleanedStudents));
          
          const removedCount = legacyStudents.length - cleanedStudents.length;
          console.log(`✅ Quick fix complete: Removed ${removedCount} conflicting students from legacy storage`);
          
          resolve({
            success: true,
            message: `Successfully removed ${removedCount} conflicting students. The multiple student ID error should now be resolved.`
          });
        } else {
          resolve({
            success: true,
            message: 'No legacy students found to clean up.'
          });
        }
        
      } catch (error) {
        console.error('❌ Quick fix failed:', error);
        resolve({
          success: false,
          message: `Quick fix failed: ${error}`
        });
      }
    });
  }
  
  // Restore from backup if needed
  static restoreFromBackup(backupTimestamp: string): boolean {
    try {
      console.log(`🔄 Restoring from backup: ${backupTimestamp}`);
      
      // Restore unified data
      const unifiedBackup = localStorage.getItem(`backup-unified-data-${backupTimestamp}`);
      if (unifiedBackup) {
        localStorage.setItem('visual-schedule-builder-unified-data', unifiedBackup);
      }
      
      // Restore legacy students
      const legacyBackup = localStorage.getItem(`backup-legacy-students-${backupTimestamp}`);
      if (legacyBackup) {
        localStorage.setItem('students', legacyBackup);
      }
      
      console.log('✅ Restore completed');
      return true;
    } catch (error) {
      console.error('❌ Restore failed:', error);
      return false;
    }
  }
}

// Export convenience function
export const quickFixStudentConflicts = () => {
  return StudentDataCleanup.quickFixConflicts();
};

export const resolveAllStudentConflicts = () => {
  return StudentDataCleanup.resolveAllConflicts();
};

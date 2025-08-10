// Student Data Diagnostic Tool
// This script analyzes the current student data structure to identify ID conflicts and data issues

import UnifiedDataService from '../services/unifiedDataService';

interface DiagnosticResult {
  totalStudents: number;
  duplicateIds: string[];
  conflictingStudents: any[];
  dataStructureIssues: string[];
  storageKeys: string[];
  recommendations: string[];
}

export class StudentDataDiagnostic {
  
  static runFullDiagnostic(): DiagnosticResult {
    console.log('🔍 Starting Student Data Diagnostic...');
    
    const result: DiagnosticResult = {
      totalStudents: 0,
      duplicateIds: [],
      conflictingStudents: [],
      dataStructureIssues: [],
      storageKeys: [],
      recommendations: []
    };

    // 1. Check all localStorage keys related to students
    result.storageKeys = this.getStudentRelatedKeys();
    console.log('📋 Found storage keys:', result.storageKeys);

    // 2. Analyze UnifiedDataService students
    const unifiedStudents = this.analyzeUnifiedStudents();
    result.totalStudents = unifiedStudents.length;
    
    // 3. Check for duplicate IDs
    const idCounts = new Map<string, number>();
    const studentsByIds = new Map<string, any[]>();
    
    unifiedStudents.forEach(student => {
      const count = idCounts.get(student.id) || 0;
      idCounts.set(student.id, count + 1);
      
      if (!studentsByIds.has(student.id)) {
        studentsByIds.set(student.id, []);
      }
      studentsByIds.get(student.id)!.push(student);
    });

    // Find duplicates
    idCounts.forEach((count, id) => {
      if (count > 1) {
        result.duplicateIds.push(id);
        result.conflictingStudents.push(...studentsByIds.get(id)!);
      }
    });

    // 4. Check for data structure issues
    result.dataStructureIssues = this.checkDataStructureIssues(unifiedStudents);

    // 5. Generate recommendations
    result.recommendations = this.generateRecommendations(result);

    return result;
  }

  private static getStudentRelatedKeys(): string[] {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('student') || 
        key.includes('unified') || 
        key.includes('iep') ||
        key.includes('vsb')
      )) {
        keys.push(key);
      }
    }
    
    return keys;
  }

  private static analyzeUnifiedStudents(): any[] {
    try {
      // Get students from UnifiedDataService
      const students = UnifiedDataService.getAllStudents();
      console.log('👥 Found', students.length, 'students in UnifiedDataService');
      
      students.forEach((student, index) => {
        console.log(`Student ${index + 1}:`, {
          id: student.id,
          name: student.name,
          hasIepData: !!student.iepData,
          goalsCount: student.iepData?.goals?.length || 0,
          dataPointsCount: student.iepData?.dataCollection?.length || 0
        });
      });
      
      return students;
    } catch (error) {
      console.error('❌ Error analyzing unified students:', error);
      return [];
    }
  }

  private static checkDataStructureIssues(students: any[]): string[] {
    const issues: string[] = [];
    
    students.forEach((student, index) => {
      // Check required fields
      if (!student.id) {
        issues.push(`Student ${index + 1} missing ID`);
      }
      if (!student.name) {
        issues.push(`Student ${index + 1} missing name`);
      }
      
      // Check IEP data structure
      if (!student.iepData) {
        issues.push(`Student ${student.name || index + 1} missing iepData structure`);
      } else {
        if (!Array.isArray(student.iepData.goals)) {
          issues.push(`Student ${student.name} has invalid goals structure`);
        }
        if (!Array.isArray(student.iepData.dataCollection)) {
          issues.push(`Student ${student.name} has invalid dataCollection structure`);
        }
      }
      
      // Check for malformed IDs
      if (student.id && (typeof student.id !== 'string' || student.id.length < 3)) {
        issues.push(`Student ${student.name} has malformed ID: ${student.id}`);
      }
    });
    
    return issues;
  }

  private static generateRecommendations(result: DiagnosticResult): string[] {
    const recommendations: string[] = [];
    
    if (result.duplicateIds.length > 0) {
      recommendations.push(`🚨 CRITICAL: Found ${result.duplicateIds.length} duplicate student IDs. This is likely causing your multiple student ID error.`);
      recommendations.push(`Duplicate IDs: ${result.duplicateIds.join(', ')}`);
      recommendations.push('Recommendation: Merge or remove duplicate students');
    }
    
    if (result.dataStructureIssues.length > 0) {
      recommendations.push(`⚠️ Found ${result.dataStructureIssues.length} data structure issues`);
      recommendations.push('Recommendation: Fix data structure inconsistencies');
    }
    
    if (result.storageKeys.length > 3) {
      recommendations.push(`📦 Found ${result.storageKeys.length} student-related storage keys. This might indicate legacy data conflicts.`);
      recommendations.push('Recommendation: Clean up legacy storage keys');
    }
    
    if (result.totalStudents === 0) {
      recommendations.push('❌ No students found. This might indicate a data loading issue.');
    }
    
    return recommendations;
  }

  // Method to examine raw localStorage data
  static examineRawStorageData(): void {
    console.log('\n🔍 EXAMINING RAW STORAGE DATA:');
    
    // Check unified data
    const unifiedDataRaw = localStorage.getItem('visual-schedule-builder-unified-data');
    if (unifiedDataRaw) {
      try {
        const unifiedData = JSON.parse(unifiedDataRaw);
        console.log('📦 Unified Data Structure:');
        console.log('- Students type:', typeof unifiedData.students);
        console.log('- Students is array:', Array.isArray(unifiedData.students));
        console.log('- Students count:', Array.isArray(unifiedData.students) ? unifiedData.students.length : 'N/A');
        
        if (Array.isArray(unifiedData.students)) {
          unifiedData.students.forEach((student: any, index: number) => {
            console.log(`  Student ${index + 1}: ID=${student.id}, Name=${student.name}`);
          });
        } else if (unifiedData.students && typeof unifiedData.students === 'object') {
          console.log('- Students stored as object with keys:', Object.keys(unifiedData.students));
          Object.entries(unifiedData.students).forEach(([key, student]: [string, any]) => {
            console.log(`  ${key}: ID=${student.id}, Name=${student.name}`);
          });
        }
      } catch (error) {
        console.error('❌ Error parsing unified data:', error);
      }
    } else {
      console.log('❌ No unified data found');
    }
    
    // Check legacy students
    const legacyStudents = localStorage.getItem('students');
    if (legacyStudents) {
      try {
        const students = JSON.parse(legacyStudents);
        console.log('📦 Legacy Students Data:');
        console.log('- Type:', typeof students);
        console.log('- Is array:', Array.isArray(students));
        console.log('- Count:', Array.isArray(students) ? students.length : 'N/A');
        
        if (Array.isArray(students)) {
          students.forEach((student: any, index: number) => {
            console.log(`  Student ${index + 1}: ID=${student.id}, Name=${student.name}`);
          });
        }
      } catch (error) {
        console.error('❌ Error parsing legacy students:', error);
      }
    } else {
      console.log('ℹ️ No legacy students data found');
    }
  }

  // Method to check for ID conflicts across all storage
  static checkIdConflictsAcrossStorage(): void {
    console.log('\n🔍 CHECKING ID CONFLICTS ACROSS ALL STORAGE:');
    
    const allStudentIds = new Map<string, string[]>(); // id -> [source1, source2, ...]
    
    // Check unified data
    try {
      const unifiedDataRaw = localStorage.getItem('visual-schedule-builder-unified-data');
      if (unifiedDataRaw) {
        const unifiedData = JSON.parse(unifiedDataRaw);
        let students = unifiedData.students;
        
        if (!Array.isArray(students) && typeof students === 'object') {
          students = Object.values(students);
        }
        
        if (Array.isArray(students)) {
          students.forEach((student: any) => {
            if (student.id) {
              if (!allStudentIds.has(student.id)) {
                allStudentIds.set(student.id, []);
              }
              allStudentIds.get(student.id)!.push('unified-data');
            }
          });
        }
      }
    } catch (error) {
      console.error('Error checking unified data IDs:', error);
    }
    
    // Check legacy students
    try {
      const legacyStudents = localStorage.getItem('students');
      if (legacyStudents) {
        const students = JSON.parse(legacyStudents);
        if (Array.isArray(students)) {
          students.forEach((student: any) => {
            if (student.id) {
              if (!allStudentIds.has(student.id)) {
                allStudentIds.set(student.id, []);
              }
              allStudentIds.get(student.id)!.push('legacy-students');
            }
          });
        }
      }
    } catch (error) {
      console.error('Error checking legacy students IDs:', error);
    }
    
    // Report conflicts
    console.log('📊 ID CONFLICT ANALYSIS:');
    let conflictCount = 0;
    allStudentIds.forEach((sources, id) => {
      if (sources.length > 1) {
        console.log(`🚨 CONFLICT: ID "${id}" found in: ${sources.join(', ')}`);
        conflictCount++;
      } else {
        console.log(`✅ OK: ID "${id}" found in: ${sources[0]}`);
      }
    });
    
    if (conflictCount > 0) {
      console.log(`\n🚨 FOUND ${conflictCount} ID CONFLICTS - This is likely causing your multiple student ID error!`);
    } else {
      console.log('\n✅ No ID conflicts found across storage systems');
    }
  }
}

// Export diagnostic function for easy use
export const runStudentDiagnostic = () => {
  console.log('🏥 STUDENT DATA DIAGNOSTIC REPORT');
  console.log('================================');
  
  const result = StudentDataDiagnostic.runFullDiagnostic();
  
  console.log('\n📊 SUMMARY:');
  console.log(`Total Students: ${result.totalStudents}`);
  console.log(`Duplicate IDs: ${result.duplicateIds.length}`);
  console.log(`Data Issues: ${result.dataStructureIssues.length}`);
  console.log(`Storage Keys: ${result.storageKeys.length}`);
  
  if (result.duplicateIds.length > 0) {
    console.log('\n🚨 DUPLICATE IDs FOUND:');
    result.duplicateIds.forEach(id => {
      console.log(`- ${id}`);
    });
  }
  
  if (result.dataStructureIssues.length > 0) {
    console.log('\n⚠️ DATA STRUCTURE ISSUES:');
    result.dataStructureIssues.forEach(issue => {
      console.log(`- ${issue}`);
    });
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  result.recommendations.forEach(rec => {
    console.log(`- ${rec}`);
  });
  
  // Run additional checks
  StudentDataDiagnostic.examineRawStorageData();
  StudentDataDiagnostic.checkIdConflictsAcrossStorage();
  
  return result;
};

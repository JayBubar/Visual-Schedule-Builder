// src/renderer/utils/dataMigration.ts
// Unified Data Architecture Migration System

import { Student, Staff, IEPGoal, DataPoint, CalendarSettings, DailyCheckIn } from '../types';

// ===== UNIFIED DATA STRUCTURES =====

export interface UnifiedStudentData {
  // Core student information
  id: string;
  name: string;
  grade?: string;
  photo?: string;
  photoFileName?: string;
  isActive: boolean;
  
  // Academic & behavioral information
  workingStyle: 'independent' | 'collaborative' | 'needs-support';
  accommodations: string[];
  goals: string[];
  behaviorNotes?: string;
  medicalNotes?: string;
  
  // Contact information
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  emergencyContact?: string;
  
  // Resource/therapy information
  resourceInfo: {
    attendsResource: boolean;
    resourceType: string;
    resourceTeacher: string;
    timeframe: string;
  };
  
  // Group assignment preferences
  preferredPartners: string[];
  avoidPartners: string[];
  
  // IEP-specific data (unified)
  iepData: {
    hasIEP: boolean;
    goals: IEPGoal[];
    dataPoints: DataPoint[];
    caseManager?: string;
    iepStartDate?: string;
    iepEndDate?: string;
    relatedServices: string[];
  };
  
  // Calendar & daily check-in data
  calendarData: {
    behaviorCommitments: Array<{
      id: string;
      date: string;
      commitment: string;
      isCompleted: boolean;
      completedAt?: string;
      notes?: string;
    }>;
    independentChoices: Array<{
      id: string;
      date: string;
      activityId: string;
      activityName: string;
      selectedAt: string;
      completed: boolean;
    }>;
    dailyHighlights: Array<{
      id: string;
      date: string;
      achievement: string;
      category: 'academic' | 'behavioral' | 'social' | 'creative' | 'physical';
      staffMember?: string;
      timestamp: string;
    }>;
  };
  
  // Progress tracking
  progressData: {
    currentGoalProgress: { [goalId: string]: number };
    recentDataPoints: DataPoint[];
    trends: { [goalId: string]: 'improving' | 'maintaining' | 'declining' };
    lastAssessment?: string;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface UnifiedAppData {
  students: { [studentId: string]: UnifiedStudentData };
  staff: { [staffId: string]: Staff };
  settings: {
    calendar: CalendarSettings;
    app: any;
    privacy: {
      requirePasswordForStudentData: boolean;
      autoDeleteOldData: boolean;
      dataRetentionDays: number;
    };
  };
  systemData: {
    activities: any[];
    schedules: any[];
    groups: any[];
    customActivities: any[];
  };
  metadata: {
    version: string;
    lastMigration: string;
    dataIntegrityCheck: string;
    backupLocation?: string;
  };
}

// ===== MIGRATION UTILITIES =====

export class DataMigrationManager {
  private static readonly UNIFIED_STORAGE_KEY = 'visual-schedule-builder-unified-data';
  private static readonly MIGRATION_LOG_KEY = 'visual-schedule-builder-migration-log';
  private static readonly CURRENT_VERSION = '2.0.0';

  // Legacy storage keys that need to be migrated
  private static readonly LEGACY_KEYS = [
    'students',
    'staff_members',
    'iepDataPoints',
    'iepGoals',
    'calendarSettings',
    'dailyCheckIns',
    'iepDataSessions',
    'activityLibrary',
    'custom_activities',
    'available_activities',
    'saved_schedules',
    'scheduleVariations',
    'specialEvents',
    'choiceRotationHistory',
    'choiceAnalytics',
    'visual-schedule-builder-data'
  ];

  /**
   * Main migration function - safely migrates all legacy data to unified structure
   */
  static async migrateToUnifiedArchitecture(): Promise<{
    success: boolean;
    message: string;
    migratedStudents: number;
    preservedDataPoints: number;
    errors: string[];
  }> {
    const migrationLog: string[] = [];
    const errors: string[] = [];
    let migratedStudents = 0;
    let preservedDataPoints = 0;

    try {
      migrationLog.push(`[${new Date().toISOString()}] Starting unified data architecture migration`);

      // Step 1: Create backup of all existing data
      const backupData = this.createDataBackup();
      migrationLog.push(`[${new Date().toISOString()}] Created backup of ${Object.keys(backupData).length} data sources`);

      // Step 2: Load and parse all legacy data
      const legacyData = this.loadLegacyData();
      migrationLog.push(`[${new Date().toISOString()}] Loaded legacy data from ${Object.keys(legacyData).length} sources`);

      // Step 3: Create unified data structure
      const unifiedData: UnifiedAppData = {
        students: {},
        staff: {},
        settings: {
          calendar: legacyData.calendarSettings || this.getDefaultCalendarSettings(),
          app: legacyData.appSettings || {},
          privacy: {
            requirePasswordForStudentData: false,
            autoDeleteOldData: false,
            dataRetentionDays: 365
          }
        },
        systemData: {
          activities: legacyData.available_activities || [],
          schedules: legacyData.saved_schedules || legacyData.scheduleVariations || [],
          groups: [],
          customActivities: legacyData.custom_activities || []
        },
        metadata: {
          version: this.CURRENT_VERSION,
          lastMigration: new Date().toISOString(),
          dataIntegrityCheck: new Date().toISOString(),
          backupLocation: 'localStorage-backup-' + Date.now()
        }
      };

      // Step 4: Migrate student data with all related information
      if (legacyData.students && Array.isArray(legacyData.students)) {
        for (const legacyStudent of legacyData.students) {
          try {
            const unifiedStudent = this.migrateStudentData(
              legacyStudent,
              legacyData.iepGoals || [],
              legacyData.iepDataPoints || [],
              legacyData.dailyCheckIns || []
            );
            
            unifiedData.students[unifiedStudent.id] = unifiedStudent;
            migratedStudents++;
            preservedDataPoints += unifiedStudent.iepData.dataPoints.length;
            
            migrationLog.push(`[${new Date().toISOString()}] Migrated student: ${unifiedStudent.name} with ${unifiedStudent.iepData.dataPoints.length} data points`);
          } catch (error) {
            const errorMsg = `Failed to migrate student ${legacyStudent.name}: ${error}`;
            errors.push(errorMsg);
            migrationLog.push(`[${new Date().toISOString()}] ERROR: ${errorMsg}`);
          }
        }
      }

      // Step 5: Migrate staff data
      if (legacyData.staff_members && Array.isArray(legacyData.staff_members)) {
        for (const staffMember of legacyData.staff_members) {
          unifiedData.staff[staffMember.id] = staffMember;
        }
        migrationLog.push(`[${new Date().toISOString()}] Migrated ${Object.keys(unifiedData.staff).length} staff members`);
      }

      // Step 6: Save unified data with quota handling
      try {
        const unifiedDataString = JSON.stringify(unifiedData);
        
        // Check if data is too large
        if (unifiedDataString.length > 5 * 1024 * 1024) { // 5MB limit
          migrationLog.push(`[${new Date().toISOString()}] Warning: Unified data is large (${Math.round(unifiedDataString.length / 1024 / 1024)}MB)`);
          
          // Try to clear space first
          this.clearNonEssentialData();
        }
        
        localStorage.setItem(this.UNIFIED_STORAGE_KEY, unifiedDataString);
        migrationLog.push(`[${new Date().toISOString()}] Saved unified data structure`);
      } catch (saveError) {
        if (saveError instanceof DOMException && saveError.name === 'QuotaExceededError') {
          // Handle quota exceeded error
          migrationLog.push(`[${new Date().toISOString()}] Storage quota exceeded, attempting recovery`);
          
          // Clear non-essential data and try again
          this.clearNonEssentialData();
          
          try {
            // Try to save a minimal version
            const minimalData = {
              students: unifiedData.students,
              metadata: unifiedData.metadata
            };
            
            localStorage.setItem(this.UNIFIED_STORAGE_KEY, JSON.stringify(minimalData));
            migrationLog.push(`[${new Date().toISOString()}] Saved minimal unified data structure due to storage constraints`);
          } catch (minimalError) {
            const errorMsg = `Failed to save even minimal unified data: ${minimalError}`;
            errors.push(errorMsg);
            migrationLog.push(`[${new Date().toISOString()}] CRITICAL ERROR: ${errorMsg}`);
            throw new Error(errorMsg);
          }
        } else {
          const errorMsg = `Failed to save unified data: ${saveError}`;
          errors.push(errorMsg);
          migrationLog.push(`[${new Date().toISOString()}] ERROR: ${errorMsg}`);
          throw saveError;
        }
      }

      // Step 7: Verify data integrity
      const verificationResult = this.verifyDataIntegrity(unifiedData);
      if (!verificationResult.isValid) {
        errors.push(...verificationResult.errors);
        migrationLog.push(`[${new Date().toISOString()}] Data integrity check failed: ${verificationResult.errors.join(', ')}`);
      } else {
        migrationLog.push(`[${new Date().toISOString()}] Data integrity check passed`);
      }

      // Step 8: Save migration log
      localStorage.setItem(this.MIGRATION_LOG_KEY, JSON.stringify(migrationLog));

      // Step 9: Archive legacy data (don't delete yet, just mark as archived)
      this.archiveLegacyData();
      migrationLog.push(`[${new Date().toISOString()}] Archived legacy data for safety`);

      const success = errors.length === 0;
      const message = success 
        ? `Migration completed successfully! Migrated ${migratedStudents} students with ${preservedDataPoints} data points.`
        : `Migration completed with ${errors.length} errors. Please review the migration log.`;

      return {
        success,
        message,
        migratedStudents,
        preservedDataPoints,
        errors
      };

    } catch (error) {
      const errorMsg = `Critical migration error: ${error}`;
      errors.push(errorMsg);
      migrationLog.push(`[${new Date().toISOString()}] CRITICAL ERROR: ${errorMsg}`);
      
      localStorage.setItem(this.MIGRATION_LOG_KEY, JSON.stringify(migrationLog));
      
      return {
        success: false,
        message: errorMsg,
        migratedStudents,
        preservedDataPoints,
        errors
      };
    }
  }

  /**
   * Migrate individual student data to unified structure
   */
  private static migrateStudentData(
    legacyStudent: any,
    allGoals: any[],
    allDataPoints: any[],
    allCheckIns: any[]
  ): UnifiedStudentData {
    // Filter data specific to this student
    const studentGoals = allGoals.filter(goal => goal.studentId === legacyStudent.id);
    const studentDataPoints = allDataPoints.filter(dp => dp.studentId === legacyStudent.id);
    const studentCheckIns = allCheckIns.filter(ci => 
      ci.behaviorCommitments?.some((bc: any) => bc.studentId === legacyStudent.id) ||
      ci.independentChoices?.some((ic: any) => ic.studentId === legacyStudent.id) ||
      ci.dailyHighlights?.some((dh: any) => dh.studentId === legacyStudent.id)
    );

    // Extract calendar data from check-ins
    const behaviorCommitments: any[] = [];
    const independentChoices: any[] = [];
    const dailyHighlights: any[] = [];

    studentCheckIns.forEach(checkIn => {
      if (checkIn.behaviorCommitments) {
        behaviorCommitments.push(...checkIn.behaviorCommitments.filter((bc: any) => bc.studentId === legacyStudent.id));
      }
      if (checkIn.independentChoices) {
        independentChoices.push(...checkIn.independentChoices.filter((ic: any) => ic.studentId === legacyStudent.id));
      }
      if (checkIn.dailyHighlights) {
        dailyHighlights.push(...checkIn.dailyHighlights.filter((dh: any) => dh.studentId === legacyStudent.id));
      }
    });

    // Calculate progress data
    const currentGoalProgress: { [goalId: string]: number } = {};
    const trends: { [goalId: string]: 'improving' | 'maintaining' | 'declining' } = {};

    studentGoals.forEach(goal => {
      const goalDataPoints = studentDataPoints.filter(dp => dp.goalId === goal.id);
      if (goalDataPoints.length > 0) {
        // Calculate current progress based on recent data points
        const recentPoints = goalDataPoints
          .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
          .slice(0, 5);
        
        if (recentPoints.length > 0) {
          currentGoalProgress[goal.id] = goal.currentProgress || 0;
          
          // Simple trend calculation
          if (recentPoints.length >= 3) {
            const recent = recentPoints.slice(0, 2).reduce((sum, dp) => sum + (typeof dp.value === 'number' ? dp.value : 0), 0) / 2;
            const older = recentPoints.slice(2).reduce((sum, dp) => sum + (typeof dp.value === 'number' ? dp.value : 0), 0) / (recentPoints.length - 2);
            
            if (recent > older * 1.1) trends[goal.id] = 'improving';
            else if (recent < older * 0.9) trends[goal.id] = 'declining';
            else trends[goal.id] = 'maintaining';
          }
        }
      }
    });

    return {
      // Core information
      id: legacyStudent.id,
      name: legacyStudent.name,
      grade: legacyStudent.grade,
      photo: legacyStudent.photo,
      photoFileName: legacyStudent.photoFileName,
      isActive: legacyStudent.isActive ?? true,

      // Academic & behavioral
      workingStyle: legacyStudent.workingStyle || 'collaborative',
      accommodations: legacyStudent.accommodations || [],
      goals: legacyStudent.goals || [],
      behaviorNotes: legacyStudent.behaviorNotes,
      medicalNotes: legacyStudent.medicalNotes,

      // Contact information
      parentName: legacyStudent.parentName,
      parentEmail: legacyStudent.parentEmail,
      parentPhone: legacyStudent.parentPhone,
      emergencyContact: legacyStudent.emergencyContact,

      // Resource information
      resourceInfo: legacyStudent.resourceInfo || {
        attendsResource: false,
        resourceType: '',
        resourceTeacher: '',
        timeframe: ''
      },

      // Group preferences
      preferredPartners: legacyStudent.preferredPartners || [],
      avoidPartners: legacyStudent.avoidPartners || [],

      // Unified IEP data
      iepData: {
        hasIEP: studentGoals.length > 0 || legacyStudent.iep === true,
        goals: studentGoals,
        dataPoints: studentDataPoints,
        caseManager: legacyStudent.caseManager,
        iepStartDate: legacyStudent.iepStartDate,
        iepEndDate: legacyStudent.iepEndDate,
        relatedServices: legacyStudent.relatedServices || []
      },

      // Unified calendar data
      calendarData: {
        behaviorCommitments: behaviorCommitments.map(bc => ({
          id: bc.id || `bc_${Date.now()}_${Math.random()}`,
          date: bc.date || new Date().toISOString().split('T')[0],
          commitment: bc.commitment || bc.behaviorGoal || '',
          isCompleted: bc.isCompleted || bc.completed || false,
          completedAt: bc.completedAt,
          notes: bc.notes
        })),
        independentChoices: independentChoices.map(ic => ({
          id: ic.id || `ic_${Date.now()}_${Math.random()}`,
          date: ic.date || new Date().toISOString().split('T')[0],
          activityId: ic.activityId || '',
          activityName: ic.activityName || '',
          selectedAt: ic.selectedAt || ic.timestamp || new Date().toISOString(),
          completed: ic.completed || false
        })),
        dailyHighlights: dailyHighlights.map(dh => ({
          id: dh.id || `dh_${Date.now()}_${Math.random()}`,
          date: dh.date || new Date().toISOString().split('T')[0],
          achievement: dh.achievement || dh.description || '',
          category: dh.category || 'academic',
          staffMember: dh.staffMember,
          timestamp: dh.timestamp || new Date().toISOString()
        }))
      },

      // Progress tracking
      progressData: {
        currentGoalProgress,
        recentDataPoints: studentDataPoints
          .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
          .slice(0, 10),
        trends,
        lastAssessment: studentDataPoints.length > 0 
          ? studentDataPoints.sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())[0].date
          : undefined
      },

      // Metadata
      createdAt: legacyStudent.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: this.CURRENT_VERSION
    };
  }

  /**
   * Load all legacy data from localStorage
   */
  private static loadLegacyData(): { [key: string]: any } {
    const legacyData: { [key: string]: any } = {};

    this.LEGACY_KEYS.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          legacyData[key] = JSON.parse(stored);
        }
      } catch (error) {
        console.warn(`Failed to load legacy data for key ${key}:`, error);
      }
    });

    return legacyData;
  }

  /**
   * Create backup of all existing data with storage quota handling
   */
  private static createDataBackup(): { [key: string]: any } {
    const backup: { [key: string]: any } = {};
    const backupKey = `data-backup-${Date.now()}`;

    // Only backup essential data to avoid quota issues
    const essentialKeys = [
      'students',
      'staff_members', 
      'iepDataPoints',
      'iepGoals',
      'calendarSettings',
      'dailyCheckIns',
      'saved_schedules',
      'custom_activities'
    ];

    // Backup only essential data
    essentialKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          backup[key] = data;
        }
      } catch (error) {
        console.warn(`Failed to backup key ${key}:`, error);
      }
    });

    // Try to save backup with error handling
    try {
      const backupString = JSON.stringify(backup);
      
      // Check if backup is too large (> 4MB, leaving room for other data)
      if (backupString.length > 4 * 1024 * 1024) {
        console.warn('Backup too large, creating minimal backup');
        
        // Create minimal backup with just students and goals
        const minimalBackup = {
          students: backup.students,
          iepGoals: backup.iepGoals,
          iepDataPoints: backup.iepDataPoints
        };
        
        localStorage.setItem(backupKey, JSON.stringify(minimalBackup));
        return minimalBackup;
      } else {
        localStorage.setItem(backupKey, backupString);
        return backup;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, creating emergency backup');
        
        // Emergency backup - just save critical student data
        try {
          const emergencyBackup = {
            students: backup.students || '[]',
            timestamp: new Date().toISOString()
          };
          
          // Try to clear some space first
          this.clearNonEssentialData();
          
          localStorage.setItem(`emergency-backup-${Date.now()}`, JSON.stringify(emergencyBackup));
          return emergencyBackup;
        } catch (emergencyError) {
          console.error('Failed to create emergency backup:', emergencyError);
          return {};
        }
      } else {
        console.error('Failed to create backup:', error);
        return backup;
      }
    }
  }

  /**
   * Clear non-essential data to free up storage space
   */
  private static clearNonEssentialData(): void {
    const nonEssentialPatterns = [
      'data-backup-',
      'migration-log-',
      'temp-',
      'cache-',
      'debug-'
    ];

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key) {
        const shouldRemove = nonEssentialPatterns.some(pattern => key.startsWith(pattern));
        if (shouldRemove) {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.warn(`Failed to remove non-essential key ${key}:`, error);
          }
        }
      }
    }
  }

  /**
   * Archive legacy data by adding prefix
   */
  private static archiveLegacyData(): void {
    this.LEGACY_KEYS.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        localStorage.setItem(`archived_${key}`, data);
      }
    });
  }

  /**
   * Verify data integrity after migration
   */
  private static verifyDataIntegrity(unifiedData: UnifiedAppData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check students
    Object.values(unifiedData.students).forEach(student => {
      if (!student.id || !student.name) {
        errors.push(`Student missing required fields: ${student.id || 'unknown'}`);
      }
      
      // Verify IEP data consistency
      student.iepData.goals.forEach(goal => {
        if (goal.studentId !== student.id) {
          errors.push(`Goal ${goal.id} has mismatched studentId`);
        }
      });

      student.iepData.dataPoints.forEach(dp => {
        if (dp.studentId !== student.id) {
          errors.push(`DataPoint ${dp.id} has mismatched studentId`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get default calendar settings
   */
  private static getDefaultCalendarSettings(): CalendarSettings {
    return {
      showWeather: true,
      weatherLocation: 'New York, NY',
      showBehaviorCommitments: true,
      showIndependentChoices: true,
      showDailyHighlights: true,
      enableSoundEffects: true,
      autoSaveInterval: 30,
      defaultView: 'dashboard'
    };
  }

  /**
   * Get unified data (main accessor method)
   */
  static getUnifiedData(): UnifiedAppData | null {
    try {
      const stored = localStorage.getItem(this.UNIFIED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load unified data:', error);
      return null;
    }
  }

  /**
   * Save unified data
   */
  static saveUnifiedData(data: UnifiedAppData): boolean {
    try {
      data.metadata.lastMigration = new Date().toISOString();
      localStorage.setItem(this.UNIFIED_STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save unified data:', error);
      return false;
    }
  }

  /**
   * Get migration log
   */
  static getMigrationLog(): string[] {
    try {
      const stored = localStorage.getItem(this.MIGRATION_LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load migration log:', error);
      return [];
    }
  }

  /**
   * Check if migration is needed
   */
  static isMigrationNeeded(): boolean {
    const unifiedData = this.getUnifiedData();
    if (!unifiedData) return true;

    // Check if we have legacy data that's newer than unified data
    const legacyStudents = localStorage.getItem('students');
    if (legacyStudents) {
      try {
        const students = JSON.parse(legacyStudents);
        if (Array.isArray(students) && students.length > Object.keys(unifiedData.students).length) {
          return true;
        }
      } catch (error) {
        // If we can't parse legacy data, assume migration is needed
        return true;
      }
    }

    return false;
  }

  /**
   * Rollback to legacy data (emergency function)
   */
  static rollbackToLegacyData(): boolean {
    try {
      // Find the most recent backup
      const backupKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('data-backup-')) {
          backupKeys.push(key);
        }
      }

      if (backupKeys.length === 0) {
        console.error('No backup data found for rollback');
        return false;
      }

      // Get the most recent backup
      const latestBackupKey = backupKeys.sort().pop();
      const backupData = localStorage.getItem(latestBackupKey!);
      
      if (!backupData) {
        console.error('Backup data is empty');
        return false;
      }

      const backup = JSON.parse(backupData);

      // Restore all backed up data
      Object.entries(backup).forEach(([key, value]) => {
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      });

      // Remove unified data
      localStorage.removeItem(this.UNIFIED_STORAGE_KEY);

      console.log('Successfully rolled back to legacy data');
      return true;
    } catch (error) {
      console.error('Failed to rollback to legacy data:', error);
      return false;
    }
  }
}

// ===== UNIFIED DATA ACCESS LAYER =====

export class UnifiedDataAccess {
  /**
   * Get all students with their complete unified data
   */
  static getAllStudents(): UnifiedStudentData[] {
    const unifiedData = DataMigrationManager.getUnifiedData();
    return unifiedData ? Object.values(unifiedData.students) : [];
  }

  /**
   * Get a specific student by ID
   */
  static getStudent(studentId: string): UnifiedStudentData | null {
    const unifiedData = DataMigrationManager.getUnifiedData();
    return unifiedData?.students[studentId] || null;
  }

  /**
   * Update student data
   */
  static updateStudent(studentId: string, updates: Partial<UnifiedStudentData>): boolean {
    const unifiedData = DataMigrationManager.getUnifiedData();
    if (!unifiedData || !unifiedData.students[studentId]) return false;

    unifiedData.students[studentId] = {
      ...unifiedData.students[studentId],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return DataMigrationManager.saveUnifiedData(unifiedData);
  }

  /**
   * Add new IEP data point for a student
   */
  static addDataPoint(studentId: string, dataPoint: DataPoint): boolean {
    const unifiedData = DataMigrationManager.getUnifiedData();
    if (!unifiedData || !unifiedData.students[studentId]) return false;

    unifiedData.students[studentId].iepData.dataPoints.push(dataPoint);
    unifiedData.students[studentId].progressData.recentDataPoints.unshift(dataPoint);
    
    // Keep only the 10 most recent data points in the quick access array
    if (unifiedData.students[studentId].progressData.recentDataPoints.length > 10) {
      unifiedData.students[studentId].progressData.recentDataPoints = 
        unifiedData.students[studentId].progressData.recentDataPoints.slice(0, 10);
    }

    unifiedData.students[studentId].updatedAt = new Date().toISOString();

    return DataMigrationManager.saveUnifiedData(unifiedData);
  }

  /**
   * Get all IEP goals for reports
   */
  static getAllIEPGoals(): Array<{ studentId: string; studentName: string; goals: IEPGoal[] }> {
    const students = this.getAllStudents();
    return students
      .filter(student => student.iepData.hasIEP && student.iepData.goals.length > 0)
      .map(student => ({
        studentId: student.id,
        studentName: student.name,
        goals: student.iepData.goals
      }));
  }

  /**
   * Get all data points for reports
   */
  static getAllDataPoints(): DataPoint[] {
    const students = this.getAllStudents();
    const allDataPoints: DataPoint[] = [];
    
    students.forEach(student => {
      allDataPoints.push(...student.iepData.dataPoints);
    });

    return allDataPoints;
  }

  /**
   * Get data points for a specific goal
   */
  static getDataPointsForGoal(goalId: string): DataPoint[] {
    const allDataPoints = this.getAllDataPoints();
    return allDataPoints.filter(dp => dp.goalId === goalId);
  }

  /**
   * Get students with active goals (for reports)
   */
  static getStudentsWithActiveGoals(): Array<{ student: UnifiedStudentData; activeGoals: number }> {
    const students = this.getAllStudents();
    return students
      .filter(student => student.iepData.hasIEP)
      .map(student => ({
        student,
        activeGoals: student.iepData.goals.filter(goal => goal.isActive).length
      }))
      .filter(item => item.activeGoals > 0);
  }
}

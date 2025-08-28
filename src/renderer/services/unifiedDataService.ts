// Unified Data Service - UPDATED to fix migration issues
// src/renderer/services/unifiedDataService.ts

import { 
  IEPGoal as BaseIEPGoal, 
  DataPoint, 
  Student, 
  EnhancedDataPoint, 
  SchoolYearPeriod, 
  GoalInheritance,
  WeatherHistory 
} from '../types';

// Extended IEP Goal interface for backward compatibility
export interface IEPGoal extends Omit<BaseIEPGoal, 'domain' | 'measurementType'> {
  domain: 'academic' | 'behavioral' | 'social-emotional' | 'physical' | 'communication' | 'adaptive';
  measurementType: 'percentage' | 'frequency' | 'duration' | 'rating' | 'yes-no' | 'independence';
  title: string;
  shortTermObjective: string;
  criteria: string;
  target: number;
  priority: 'high' | 'medium' | 'low';
  dateCreated: string;
  lastDataPoint?: string;
  dataPoints: number;
  currentProgress: number;
  linkedActivityIds?: string[];
  
  // Enhanced SMART goal properties
  nineWeekMilestones?: {
    quarter1: { target: number; actual?: number; notes?: string };
    quarter2: { target: number; actual?: number; notes?: string };
    quarter3: { target: number; actual?: number; notes?: string };
    quarter4: { target: number; actual?: number; notes?: string };
  };
  inheritedFrom?: {
    previousGoalId: string;
    previousYear: string;
    carryOverReason: string;
    modifications: string[];
  };
  iepMeetingDate?: string;
  reviewDates?: string[];
  complianceNotes?: string;
}

export interface UnifiedStudent {
  // Basic student info
  id: string;
  name: string;
  grade: string;
  photo?: string;
  workingStyle?: string;
  dateCreated: string;
  
  // Legacy properties for backward compatibility
  accommodations?: string[];
  goals?: string[]; // Legacy IEP goals as strings
  preferredPartners?: string[];
  avoidPartners?: string[];
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  isActive?: boolean;
  behaviorNotes?: string;
  medicalNotes?: string;
  
  // Birthday and celebration preferences
  birthday?: string;
  allowBirthdayDisplay?: boolean;
  allowPhotoInCelebrations?: boolean;
  
  // Resource & accommodation info
  resourceInformation?: {
    attendsResourceServices: boolean;
    accommodations: string[];
    relatedServices: string[];
    allergies: string[];
    medicalNeeds: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  
  resourceInfo?: {
    attendsResource: boolean;
    resourceType: string;
    resourceTeacher: string;
    timeframe: string;
  };
  
  // IEP data (now unified)
  iepData: {
    goals: IEPGoal[];
    dataCollection: DataPoint[];
    progressAnalytics?: {
      overallProgress: number;
      goalsMet: number;
      totalGoals: number;
      lastDataCollection: string;
    };
  };
  
  // Calendar preferences
  calendarPreferences?: {
    behaviorCommitments: any[];
    dailyHighlights: any[];
    independentChoices: any[];
  };
  
  // Schedule preferences
  schedulePreferences?: {
    preferredActivities: string[];
    accommodationNeeds: string[];
  };
}

// Staff member interface
export interface UnifiedStaff {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  photo?: string;
  isActive: boolean;
  dateCreated: string;
  specialties?: string[];
  notes?: string;
  isResourceTeacher?: boolean;
  isRelatedArtsTeacher?: boolean;
  permissions?: {
    canEditStudents: boolean;
    canViewReports: boolean;
    canManageGoals: boolean;
  };
}

// Activity interface
export interface UnifiedActivity {
  id: string;
  name: string;
  category: string;
  description?: string;
  duration?: number;
  materials?: string[];
  instructions?: string;
  adaptations?: string[];
  linkedGoalIds?: string[];
  isCustom: boolean;
  dateCreated: string;
}

// Calendar data interfaces
export interface BehaviorCommitment {
  id: string;
  studentId: string;
  commitment: string;
  date: string;
  status: 'pending' | 'completed' | 'missed';
  notes?: string;
}

// Additional behavior commitment interface for new methods
interface BehaviorCommitmentData {
  studentId: string;
  text: string;
  achieved: boolean;
  achievedAt: string | null;
  category?: string;
}


export interface IndependentChoice {
  id: string;
  studentId: string;
  choice: string;
  date: string;
  completed: boolean;
  notes?: string;
}

// Attendance interfaces
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD format
  isPresent: boolean;
  notes?: string;
  timestamp: string;
}

export interface UnifiedData {
  students: UnifiedStudent[];
  staff: UnifiedStaff[];
  activities: UnifiedActivity[];
  attendance: AttendanceRecord[];
  calendar: {
    behaviorCommitments: BehaviorCommitment[];
    independentChoices: IndependentChoice[];
  };
  settings: {
    visualScheduleBuilderSettings?: any;
    [key: string]: any;
  };
  metadata: {
    version: string;
    migratedAt: string;
    totalGoals: number;
    totalDataPoints: number;
    totalStaff: number;
    totalActivities: number;
    totalAttendanceRecords: number;
  };
}

class UnifiedDataService {
  // 🔧 FIXED: Use the correct key that migration created
  private static readonly UNIFIED_KEY = 'visual-schedule-builder-unified-data';
  private static readonly LEGACY_STUDENT_KEY = 'students';
  

  /**
   * CRITICAL: Get all unified data from localStorage
   * This is the foundation method that everything else depends on
   */
  static getUnifiedData(): any {
    try {
      const data = localStorage.getItem(this.UNIFIED_KEY);
      if (data) {
        const parsedData = JSON.parse(data);
        
        // Convert object structure to array structure if needed
        if (parsedData.students && !Array.isArray(parsedData.students)) {
          const studentsArray = Object.values(parsedData.students);
          parsedData.students = studentsArray;
          
          // Save the converted structure
          this.saveUnifiedData(parsedData);
        }
        
        // Convert staff object structure to array structure if needed
        if (parsedData.staff && !Array.isArray(parsedData.staff)) {
          parsedData.staff = Object.values(parsedData.staff);
          
          // Save the converted structure
          this.saveUnifiedData(parsedData);
        }
        
        return parsedData;
      } else {
        // Create default structure if it doesn't exist
        console.log('🔧 UDS: No unified data found, creating default structure');
        return this.createDefaultUnifiedData();
      }
    } catch (error) {
      console.error('UDS: Failed to get unified data:', error);
      return this.createDefaultUnifiedData();
    }
  }

  /**
   * CRITICAL: Create default data structure
   * This ensures the app has a valid data structure to work with
   */
  static createDefaultUnifiedData(): any {
    const defaultData = {
      students: [],
      staff: [],
      activities: [],
      attendance: [],
      calendar: {
        behaviorCommitments: [],
        independentChoices: []
      },
      settings: {},
      metadata: {
        version: '2.0',
        migratedAt: new Date().toISOString(),
        totalGoals: 0,
        totalDataPoints: 0,
        totalStaff: 0,
        totalActivities: 0,
        totalAttendanceRecords: 0
      }
    };
    
    // Save the default structure
    this.saveUnifiedData(defaultData);
    console.log('✅ UDS: Created default unified data structure');
    return defaultData;
  }

  /**
   * UTILITY: Check if legacy data exists
   */
  static hasLegacyData(): boolean {
    const legacyKeys = [
      'students',
      'iepGoals', 
      'iepDataPoints',
      'visualScheduleBuilderSettings',
      'calendarSettings'
    ];
    
    return legacyKeys.some(key => localStorage.getItem(key) !== null);
  }
  
  // Save unified data
  static saveUnifiedData(data: UnifiedData): void {
    try {
      localStorage.setItem(this.UNIFIED_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving unified data:', error);
    }
  }
  
  // 🔧 NEW: Recover missing data points from legacy data
  static recoverMissingDataPoints(): boolean {
    try {
      // Get current unified data
      const unifiedData = this.getUnifiedData();
      if (!unifiedData) {
        console.error('No unified data found');
        return false;
      }
      
      // Get legacy data points
      const legacyDataPointsStr = localStorage.getItem('iepDataPoints') || localStorage.getItem('archived_iepDataPoints');
      const legacyGoalsStr = localStorage.getItem('iepGoals') || localStorage.getItem('archived_iepGoals');
      
      if (!legacyDataPointsStr) {
        console.log('No legacy data points found to recover');
        return false;
      }
      
      const legacyDataPoints = JSON.parse(legacyDataPointsStr);
      const legacyGoals = legacyGoalsStr ? JSON.parse(legacyGoalsStr) : [];
      
      // Create a map of legacy goal IDs to new goal IDs
      const goalIdMap = new Map();
      
      // Build goal ID mapping
      unifiedData.students.forEach(student => {
        student.iepData.goals.forEach(unifiedGoal => {
          // Find matching legacy goal by description or other identifier
          const matchingLegacyGoal = legacyGoals.find(lg => 
            lg.description === unifiedGoal.description || 
            lg.measurableObjective === unifiedGoal.shortTermObjective ||
            lg.studentId === student.id
          );
          
          if (matchingLegacyGoal) {
            goalIdMap.set(matchingLegacyGoal.id, {
              newGoalId: unifiedGoal.id,
              studentId: student.id
            });
          }
        });
      });
      
      // Recover data points
      let recoveredCount = 0;
      
      legacyDataPoints.forEach(legacyDataPoint => {
        const mapping = goalIdMap.get(legacyDataPoint.goalId);
        if (mapping) {
          const student = unifiedData.students.find(s => s.id === mapping.studentId);
          if (student) {
            // Convert legacy data point to unified format
            const recoveredDataPoint: DataPoint = {
              id: legacyDataPoint.id || Date.now().toString() + Math.random(),
              goalId: mapping.newGoalId,
              studentId: mapping.studentId,
              date: legacyDataPoint.date,
              time: legacyDataPoint.time,
              value: legacyDataPoint.value,
              totalOpportunities: legacyDataPoint.totalOpportunities,
              notes: legacyDataPoint.notes,
              context: legacyDataPoint.context,
              activityId: legacyDataPoint.activityId,
              collector: legacyDataPoint.collector || 'Unknown',
              photos: legacyDataPoint.photos || [],
              voiceNotes: legacyDataPoint.voiceNotes || []
            };
            
            // Check if data point already exists
            const exists = student.iepData.dataCollection.some(dp => 
              dp.date === recoveredDataPoint.date && 
              dp.time === recoveredDataPoint.time && 
              dp.goalId === recoveredDataPoint.goalId
            );
            
            if (!exists) {
              student.iepData.dataCollection.push(recoveredDataPoint);
              recoveredCount++;
            }
          }
        }
      });
      
      // Update metadata
      unifiedData.metadata.totalDataPoints = unifiedData.students.reduce(
        (total, s) => total + s.iepData.dataCollection.length, 0
      );
      unifiedData.metadata.totalGoals = unifiedData.students.reduce(
        (total, s) => total + s.iepData.goals.length, 0
      );
      
      // Save updated data
      this.saveUnifiedData(unifiedData);
      
      return recoveredCount > 0;
      
    } catch (error) {
      console.error('Error recovering data points:', error);
      return false;
    }
  }
  
  // Get all students with full data
  static getAllStudents(): UnifiedStudent[] {
    // Try unified data first
    const unifiedData = this.getUnifiedData();
    
    if (unifiedData && unifiedData.students) {
      // The unified data has students as an array inside the object
      if (Array.isArray(unifiedData.students) && unifiedData.students.length > 0) {
        // Before returning, ensure all students have proper iepData structure
        const studentsWithProperStructure = unifiedData.students.map(student => 
          this.ensureStudentIEPDataStructure(student)
        );
        
        return studentsWithProperStructure;
      }
    }
    
    // FALLBACK: Read directly from legacy students key
    try {
      const legacyStudents = localStorage.getItem('students');
      
      if (legacyStudents) {
        const students = JSON.parse(legacyStudents);
        
        // Convert legacy format to unified format
        const convertedStudents = students.map((student: any) => ({
          ...student,
          dateCreated: student.dateCreated || new Date().toISOString(),
          iepData: student.iepData || { 
            hasIEP: false,
            goals: [], 
            dataPoints: [],
            dataCollection: [] 
          },
          // Ensure all required fields exist
          isActive: student.isActive !== undefined ? student.isActive : true,
          workingStyle: student.workingStyle || 'independent',
          accommodations: student.accommodations || [],
          goals: student.goals || [],
          resourceInfo: student.resourceInfo || {
            attendsResource: false,
            resourceType: '',
            resourceTeacher: '',
            timeframe: ''
          }
        }));
        
        // Ensure proper iepData structure for legacy students too
        const studentsWithProperStructure = convertedStudents.map(student => 
          this.ensureStudentIEPDataStructure(student)
        );
        
        return studentsWithProperStructure;
      }
    } catch (error) {
      console.error('❌ Failed to load legacy students:', error);
    }
    
    return [];
  }
  
  // Get specific student by ID
  static getStudent(studentId: string): UnifiedStudent | null {
    const students = this.getAllStudents();
    return students.find(s => s.id === studentId) || null;
  }
  
  // Get student's IEP goals
  static getStudentGoals(studentId: string): IEPGoal[] {
    const student = this.getStudent(studentId);
    return student?.iepData.goals || [];
  }
  
  // Ensure all students have proper iepData structure
  static ensureStudentIEPDataStructure(student: UnifiedStudent): UnifiedStudent {
    if (!student.iepData) {
      student.iepData = {
        goals: [],
        dataCollection: []
      };
    }
    
    if (!student.iepData.goals) {
      student.iepData.goals = [];
    }
    
    if (!student.iepData.dataCollection) {
      student.iepData.dataCollection = [];
    }
    
    return student;
  }

  // Get student's data points
  static getStudentDataPoints(studentId: string): DataPoint[] {
    const student = this.getStudent(studentId);
    
    // Add null checks
    if (student && student.iepData && student.iepData.dataCollection && Array.isArray(student.iepData.dataCollection)) {
      return student.iepData.dataCollection;
    }
    
    return [];
  }
  
  // Get data points for a specific goal
  static getGoalDataPoints(goalId: string): DataPoint[] {
    const students = this.getAllStudents();
    const allDataPoints: DataPoint[] = [];
    
    students.forEach(student => {
      // Add proper null/undefined checks
      if (student.iepData && student.iepData.dataCollection && Array.isArray(student.iepData.dataCollection)) {
        const goalDataPoints = student.iepData.dataCollection.filter(
          dp => dp.goalId === goalId
        );
        allDataPoints.push(...goalDataPoints);
      } else {
        // Initialize empty dataCollection if missing
        if (!student.iepData) {
          student.iepData = { goals: [], dataCollection: [] };
        } else if (!student.iepData.dataCollection) {
          student.iepData.dataCollection = [];
        }
      }
    });
    
    return allDataPoints.sort((a, b) => 
      new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
    );
  }
  
  // Add new student
  static addStudent(studentData: Partial<UnifiedStudent>): UnifiedStudent {
    console.log('🔧 UnifiedDataService.addStudent() called with:', studentData);
    
    // Get current unified data structure
    let unifiedData = this.getUnifiedData();
    if (!unifiedData) {
      console.log('⚠️ No unified data found, creating new structure');
      unifiedData = {
        students: [],
        staff: [],
        activities: [],
        attendance: [],
        calendar: {
          behaviorCommitments: [],
          independentChoices: []
        },
        settings: {},
        metadata: {
          version: '2.0',
          migratedAt: new Date().toISOString(),
          totalGoals: 0,
          totalDataPoints: 0,
          totalStaff: 0,
          totalActivities: 0,
          totalAttendanceRecords: 0
        }
      };
    }
    
    // Create new student with all required fields
    const newStudent: UnifiedStudent = {
      id: studentData.id || Date.now().toString(),
      name: studentData.name || '',
      grade: studentData.grade || '',
      photo: studentData.photo,
      dateCreated: new Date().toISOString().split('T')[0],
      workingStyle: studentData.workingStyle || 'independent',
      accommodations: studentData.accommodations || [],
      goals: studentData.goals || [],
      preferredPartners: studentData.preferredPartners || [],
      avoidPartners: studentData.avoidPartners || [],
      parentName: studentData.parentName,
      parentEmail: studentData.parentEmail,
      parentPhone: studentData.parentPhone,
      isActive: studentData.isActive !== undefined ? studentData.isActive : true,
      behaviorNotes: studentData.behaviorNotes,
      medicalNotes: studentData.medicalNotes,
      // Birthday fields
      birthday: studentData.birthday,
      allowBirthdayDisplay: studentData.allowBirthdayDisplay,
      allowPhotoInCelebrations: studentData.allowPhotoInCelebrations,
      // IEP data
      iepData: studentData.iepData || {
        goals: [],
        dataCollection: []
      },
      // Resource information
      resourceInformation: studentData.resourceInformation,
      // Calendar preferences
      calendarPreferences: studentData.calendarPreferences,
      // Schedule preferences
      schedulePreferences: studentData.schedulePreferences
    };
    
    console.log('🎂 New student created with birthday data:', {
      id: newStudent.id,
      name: newStudent.name,
      birthday: newStudent.birthday,
      allowBirthdayDisplay: newStudent.allowBirthdayDisplay,
      allowPhotoInCelebrations: newStudent.allowPhotoInCelebrations
    });
    
    // Add student to unified data
    unifiedData.students.push(newStudent);
    
    // Update metadata
    unifiedData.metadata.totalGoals = unifiedData.students.reduce((total, s) => {
      const goalsCount = s.iepData?.goals?.length || 0;
      return total + goalsCount;
    }, 0);

    unifiedData.metadata.totalDataPoints = unifiedData.students.reduce((total, s) => {
      const dataPointsCount = s.iepData?.dataCollection?.length || 0;
      return total + dataPointsCount;
    }, 0);
    
    console.log('💾 Saving unified data with', unifiedData.students.length, 'students');
    
    // Save the entire unified data structure
    this.saveUnifiedData(unifiedData);
    
    console.log('✅ Student saved successfully. Verifying...');
    
    // Verify the save worked
    const verification = this.getUnifiedData();
    if (verification && verification.students) {
      console.log('🔍 Verification: Found', verification.students.length, 'students in storage');
      const savedStudent = verification.students.find(s => s.id === newStudent.id);
      if (savedStudent) {
        console.log('✅ New student verified in storage:', savedStudent.name);
        console.log('🎂 Birthday data verified:', {
          birthday: savedStudent.birthday,
          allowBirthdayDisplay: savedStudent.allowBirthdayDisplay,
          allowPhotoInCelebrations: savedStudent.allowPhotoInCelebrations
        });
      } else {
        console.error('❌ New student NOT found in storage after save!');
      }
    } else {
      console.error('❌ Could not verify save - no unified data found');
    }
    
    return newStudent;
  }
  
  // Update student
  static updateStudent(studentId: string, updates: Partial<UnifiedStudent>): void {
    console.log('🔧 UnifiedDataService.updateStudent() called with:', { studentId, updates });
    console.log('🎂 Birthday data in updates:', {
      birthday: updates.birthday,
      allowBirthdayDisplay: updates.allowBirthdayDisplay,
      allowPhotoInCelebrations: updates.allowPhotoInCelebrations
    });
    
    // Get current unified data structure
    let unifiedData = this.getUnifiedData();
    if (!unifiedData) {
      console.error('❌ No unified data found for update');
      return;
    }
    
    // Find the student to update
    const studentIndex = unifiedData.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
      console.error('❌ Student not found for update:', studentId);
      return;
    }
    
    // Handle both resourceInfo and resourceInformation during transition
    const processedUpdates = { ...updates };
    if ((updates as any).resourceInfo && !(updates as any).resourceInformation) {
      processedUpdates.resourceInformation = (updates as any).resourceInfo;
    }
    
    // Update the student with all fields, ensuring birthday fields are preserved
    const currentStudent = unifiedData.students[studentIndex];
    const updatedStudent = {
      ...currentStudent,
      ...processedUpdates,
      // Explicitly ensure birthday fields are included
      birthday: updates.birthday !== undefined ? updates.birthday : currentStudent.birthday,
      allowBirthdayDisplay: updates.allowBirthdayDisplay !== undefined ? updates.allowBirthdayDisplay : currentStudent.allowBirthdayDisplay,
      allowPhotoInCelebrations: updates.allowPhotoInCelebrations !== undefined ? updates.allowPhotoInCelebrations : currentStudent.allowPhotoInCelebrations
    };
    
    console.log('🎂 Updated student with birthday data:', {
      id: updatedStudent.id,
      name: updatedStudent.name,
      birthday: updatedStudent.birthday,
      allowBirthdayDisplay: updatedStudent.allowBirthdayDisplay,
      allowPhotoInCelebrations: updatedStudent.allowPhotoInCelebrations,
      accommodations: updatedStudent.accommodations?.length || 0,
      parentName: updatedStudent.parentName,
      behaviorNotes: updatedStudent.behaviorNotes?.length || 0
    });
    
    // Replace the student in the array
    unifiedData.students[studentIndex] = updatedStudent;
    
    // Update metadata
    unifiedData.metadata.totalGoals = unifiedData.students.reduce((total, s) => {
      const goalsCount = s.iepData?.goals?.length || 0;
      return total + goalsCount;
    }, 0);

    unifiedData.metadata.totalDataPoints = unifiedData.students.reduce((total, s) => {
      const dataPointsCount = s.iepData?.dataCollection?.length || 0;
      return total + dataPointsCount;
    }, 0);
    
    console.log('💾 Saving updated unified data with', unifiedData.students.length, 'students');
    
    // Save the entire unified data structure
    this.saveUnifiedData(unifiedData);
    
    console.log('✅ Student updated successfully. Verifying...');
    
    // Verify the update worked
    const verification = this.getUnifiedData();
    if (verification && verification.students) {
      console.log('🔍 Verification: Found', verification.students.length, 'students in storage');
      const updatedStudentVerification = verification.students.find(s => s.id === studentId);
      if (updatedStudentVerification) {
        console.log('✅ Updated student verified in storage:', updatedStudentVerification.name);
        console.log('🎂 All data verified:', {
          birthday: updatedStudentVerification.birthday,
          allowBirthdayDisplay: updatedStudentVerification.allowBirthdayDisplay,
          allowPhotoInCelebrations: updatedStudentVerification.allowPhotoInCelebrations,
          accommodations: updatedStudentVerification.accommodations?.length || 0,
          parentName: updatedStudentVerification.parentName,
          behaviorNotes: updatedStudentVerification.behaviorNotes?.length || 0
        });
      } else {
        console.error('❌ Updated student NOT found in storage after save!');
      }
    } else {
      console.error('❌ Could not verify update - no unified data found');
    }
  }
  
  // Add IEP goal to student
  static addGoalToStudent(studentId: string, goal: Omit<IEPGoal, 'id' | 'studentId'>): IEPGoal {
    console.log('🎯 UnifiedDataService.addGoalToStudent() called for student:', studentId);
    console.log('🎯 Goal data:', goal);
    
    // Get current unified data structure
    let unifiedData = this.getUnifiedData();
    if (!unifiedData) {
      console.error('❌ No unified data found');
      throw new Error('No unified data found');
    }
    
    // Find the student
    const studentIndex = unifiedData.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
      console.error('❌ Student not found:', studentId);
      throw new Error('Student not found');
    }
    
    const student = unifiedData.students[studentIndex];
    
    // Create new goal
    const newGoal: IEPGoal = {
      ...goal,
      id: Date.now().toString(),
      studentId: studentId
    };
    
    console.log('🎯 Created new goal:', newGoal);
    
    // Ensure student has iepData structure
    if (!student.iepData) {
      student.iepData = { goals: [], dataCollection: [] };
    }
    if (!student.iepData.goals) {
      student.iepData.goals = [];
    }
    
    // Add goal to student
    student.iepData.goals.push(newGoal);
    
    // Update the student in the unified data
    unifiedData.students[studentIndex] = student;
    
    // Update metadata
    unifiedData.metadata.totalGoals = unifiedData.students.reduce((total, s) => {
      const goalsCount = s.iepData?.goals?.length || 0;
      return total + goalsCount;
    }, 0);
    
    // Save the entire unified data structure
    this.saveUnifiedData(unifiedData);
    
    console.log('✅ Goal added successfully. Student now has', student.iepData.goals.length, 'goals');
    
    return newGoal;
  }
  
  // Update IEP goal
  static updateGoal(goalId: string, updates: Partial<IEPGoal>): void {
    const students = this.getAllStudents();
    
    for (const student of students) {
      const goalIndex = student.iepData.goals.findIndex(g => g.id === goalId);
      if (goalIndex !== -1) {
        student.iepData.goals[goalIndex] = { 
          ...student.iepData.goals[goalIndex], 
          ...updates 
        };
        this.saveStudents(students);
        return;
      }
    }
  }
  
  // Add data point to goal
  static addDataPoint(dataPoint: Omit<DataPoint, 'id'>): DataPoint {
    console.log('📊 UnifiedDataService.addDataPoint() called with:', dataPoint);
    
    // Validate required fields
    if (!dataPoint.studentId) {
      throw new Error('Student ID is required');
    }
    if (!dataPoint.goalId) {
      throw new Error('Goal ID is required');
    }
    if (!dataPoint.date) {
      throw new Error('Date is required');
    }
    if (!dataPoint.time) {
      throw new Error('Time is required');
    }
    if (dataPoint.value === undefined || dataPoint.value === null) {
      throw new Error('Value is required');
    }
    if (!dataPoint.collector) {
      throw new Error('Collector is required');
    }
    
    // Get current unified data structure
    let unifiedData = this.getUnifiedData();
    if (!unifiedData) {
      console.error('❌ No unified data found');
      throw new Error('No unified data found');
    }
    
    // Find the student
    const studentIndex = unifiedData.students.findIndex(s => s.id === dataPoint.studentId);
    if (studentIndex === -1) {
      console.error('❌ Student not found:', dataPoint.studentId);
      throw new Error('Student not found');
    }
    
    const student = unifiedData.students[studentIndex];
    
    // Verify the goal exists for this student
    const goalExists = student.iepData.goals.some(g => g.id === dataPoint.goalId);
    if (!goalExists) {
      console.error('❌ Goal not found for student:', dataPoint.goalId);
      throw new Error('Goal not found for this student');
    }
    
    // Create new data point with proper validation
    const newDataPoint: DataPoint = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      studentId: dataPoint.studentId,
      goalId: dataPoint.goalId,
      date: dataPoint.date,
      time: dataPoint.time,
      value: Number(dataPoint.value),
      totalOpportunities: dataPoint.totalOpportunities ? Number(dataPoint.totalOpportunities) : undefined,
      notes: dataPoint.notes || '',
      context: dataPoint.context || '',
      activityId: dataPoint.activityId,
      collector: dataPoint.collector,
      photos: dataPoint.photos || [],
      voiceNotes: dataPoint.voiceNotes || []
    };
    
    console.log('📊 Created new data point:', newDataPoint);
    
    // Ensure student has iepData structure
    if (!student.iepData) {
      student.iepData = { goals: [], dataCollection: [] };
    }
    if (!student.iepData.dataCollection) {
      student.iepData.dataCollection = [];
    }
    
    // Add data point to student
    student.iepData.dataCollection.push(newDataPoint);
    
    // Update the student in the unified data
    unifiedData.students[studentIndex] = student;
    
    // Update goal progress analytics
    const goal = student.iepData.goals.find(g => g.id === dataPoint.goalId);
    if (goal) {
      // Calculate current progress based on recent data points
      const goalDataPoints = student.iepData.dataCollection
        .filter(dp => dp.goalId === dataPoint.goalId)
        .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
      
      if (goalDataPoints.length > 0) {
        // Calculate average of last 5 data points for current progress
        const recentDataPoints = goalDataPoints.slice(0, 5);
        const averageValue = recentDataPoints.reduce((sum, dp) => sum + dp.value, 0) / recentDataPoints.length;
        
        goal.currentProgress = Math.round(averageValue);
        goal.dataPoints = goalDataPoints.length;
        goal.lastDataPoint = newDataPoint.date;
        
        console.log('📊 Updated goal progress:', {
          goalId: goal.id,
          currentProgress: goal.currentProgress,
          dataPoints: goal.dataPoints,
          lastDataPoint: goal.lastDataPoint
        });
      }
    }
    
    // Update metadata
    unifiedData.metadata.totalDataPoints = unifiedData.students.reduce((total, s) => {
      const dataPointsCount = s.iepData?.dataCollection?.length || 0;
      return total + dataPointsCount;
    }, 0);
    
    // Update progress analytics for the student
    if (!student.iepData.progressAnalytics) {
      student.iepData.progressAnalytics = {
        overallProgress: 0,
        goalsMet: 0,
        totalGoals: 0,
        lastDataCollection: ''
      };
    }
    
    const activeGoals = student.iepData.goals.filter(g => g.isActive);
    const totalProgress = activeGoals.reduce((sum, g) => sum + (g.currentProgress || 0), 0);
    const averageProgress = activeGoals.length > 0 ? totalProgress / activeGoals.length : 0;
    const goalsMet = activeGoals.filter(g => (g.currentProgress || 0) >= (g.target || 80)).length;
    
    student.iepData.progressAnalytics = {
      overallProgress: Math.round(averageProgress),
      goalsMet: goalsMet,
      totalGoals: activeGoals.length,
      lastDataCollection: newDataPoint.date
    };
    
    console.log('📊 Updated student progress analytics:', student.iepData.progressAnalytics);
    
    // Save the entire unified data structure
    this.saveUnifiedData(unifiedData);
    
    console.log('✅ Data point added successfully. Student now has', student.iepData.dataCollection.length, 'data points');
    
    return newDataPoint;
  }
  
  // Save all students to unified data
  private static saveStudents(students: UnifiedStudent[]): void {
    const currentData = this.getUnifiedData();
    const unifiedData: UnifiedData = {
      students: students,
      staff: currentData?.staff || [],
      activities: currentData?.activities || [],
      attendance: currentData?.attendance || [],
      calendar: currentData?.calendar || {
        behaviorCommitments: [],
        independentChoices: []
      },
      settings: currentData?.settings || {},
      metadata: {
        version: '2.0',
        migratedAt: new Date().toISOString(),
        totalGoals: students.reduce((total, s) => total + (s.iepData?.goals?.length || 0), 0),
        totalDataPoints: students.reduce((total, s) => total + (s.iepData?.dataCollection?.length || 0), 0),
        totalStaff: currentData?.staff?.length || 0,
        totalActivities: currentData?.activities?.length || 0,
        totalAttendanceRecords: currentData?.attendance?.length || 0
      }
    };
    
    this.saveUnifiedData(unifiedData);
  }

  // ===== STAFF MANAGEMENT METHODS =====
  
  // Get all staff members
  static getAllStaff(): UnifiedStaff[] {
    const unifiedData = this.getUnifiedData();
    return unifiedData?.staff || [];
  }
  
  // Get specific staff member by ID
  static getStaff(staffId: string): UnifiedStaff | null {
    const staff = this.getAllStaff();
    return staff.find(s => s.id === staffId) || null;
  }
  
  // Add new staff member
  static addStaff(staffData: Partial<UnifiedStaff>): UnifiedStaff {
    const staff = this.getAllStaff();
    const newStaff: UnifiedStaff = {
      id: staffData.id || Date.now().toString(),
      name: staffData.name || '',
      role: staffData.role || '',
      isActive: staffData.isActive !== undefined ? staffData.isActive : true,
      dateCreated: new Date().toISOString().split('T')[0],
      ...staffData
    };
    
    staff.push(newStaff);
    this.saveStaff(staff);
    return newStaff;
  }
  
  // Update staff member
  static updateStaff(staffId: string, updates: Partial<UnifiedStaff>): void {
    const staff = this.getAllStaff();
    const index = staff.findIndex(s => s.id === staffId);
    
    if (index !== -1) {
      staff[index] = { ...staff[index], ...updates };
      this.saveStaff(staff);
    }
  }
  
  // Delete staff member
  static deleteStaff(staffId: string): void {
    const staff = this.getAllStaff();
    const filteredStaff = staff.filter(s => s.id !== staffId);
    this.saveStaff(filteredStaff);
  }
  
  // Save staff to unified data
  private static saveStaff(staff: UnifiedStaff[]): void {
    const currentData = this.getUnifiedData();
    if (currentData) {
      currentData.staff = staff;
      currentData.metadata.totalStaff = staff.length;
      this.saveUnifiedData(currentData);
    }
  }
  

  // ===== ACTIVITY MANAGEMENT METHODS =====
  
  // Get all activities
  static getAllActivities(): UnifiedActivity[] {
    const unifiedData = this.getUnifiedData();
    return unifiedData?.activities || [];
  }
  
  // Get specific activity by ID
  static getActivity(activityId: string): UnifiedActivity | null {
    const activities = this.getAllActivities();
    return activities.find(a => a.id === activityId) || null;
  }
  
  // Add new activity
  static addActivity(activityData: Partial<UnifiedActivity>): UnifiedActivity {
    const activities = this.getAllActivities();
    const newActivity: UnifiedActivity = {
      id: activityData.id || Date.now().toString(),
      name: activityData.name || '',
      category: activityData.category || 'custom',
      isCustom: activityData.isCustom !== undefined ? activityData.isCustom : true,
      dateCreated: new Date().toISOString().split('T')[0],
      ...activityData
    };
    
    activities.push(newActivity);
    this.saveActivities(activities);
    return newActivity;
  }
  
  // Update activity
  static updateActivity(activityId: string, updates: Partial<UnifiedActivity>): void {
    const activities = this.getAllActivities();
    const index = activities.findIndex(a => a.id === activityId);
    
    if (index !== -1) {
      activities[index] = { ...activities[index], ...updates };
      this.saveActivities(activities);
    }
  }
  
  // Delete activity
  static deleteActivity(activityId: string): void {
    const activities = this.getAllActivities();
    const filteredActivities = activities.filter(a => a.id !== activityId);
    this.saveActivities(filteredActivities);
  }
  
  // Save activities to unified data
  private static saveActivities(activities: UnifiedActivity[]): void {
    const currentData = this.getUnifiedData();
    if (currentData) {
      currentData.activities = activities;
      currentData.metadata.totalActivities = activities.length;
      this.saveUnifiedData(currentData);
    }
  }
  

  // ===== CALENDAR DATA METHODS =====
  
  // Get behavior commitments
  static getBehaviorCommitments(studentId?: string): BehaviorCommitment[] {
    const unifiedData = this.getUnifiedData();
    const commitments = unifiedData?.calendar?.behaviorCommitments || [];
    
    if (studentId) {
      return commitments.filter(c => c.studentId === studentId);
    }
    
    return commitments;
  }
  
  // Add behavior commitment
  static addBehaviorCommitment(commitment: Omit<BehaviorCommitment, 'id'>): BehaviorCommitment {
    const commitments = this.getBehaviorCommitments();
    const newCommitment: BehaviorCommitment = {
      ...commitment,
      id: Date.now().toString()
    };
    
    commitments.push(newCommitment);
    this.saveBehaviorCommitments(commitments);
    return newCommitment;
  }
  
  // Update behavior commitment
  static updateBehaviorCommitment(commitmentId: string, updates: Partial<BehaviorCommitment>): void {
    const commitments = this.getBehaviorCommitments();
    const index = commitments.findIndex(c => c.id === commitmentId);
    
    if (index !== -1) {
      commitments[index] = { ...commitments[index], ...updates };
      this.saveBehaviorCommitments(commitments);
    }
  }
  
  // Save behavior commitments
  private static saveBehaviorCommitments(commitments: BehaviorCommitment[]): void {
    const currentData = this.getUnifiedData();
    if (currentData) {
      if (!currentData.calendar) {
        currentData.calendar = { behaviorCommitments: [], independentChoices: [] };
      }
      currentData.calendar.behaviorCommitments = commitments;
      this.saveUnifiedData(currentData);
    }
  }
  
  // Get legacy behavior commitments
  private static getLegacyBehaviorCommitments(): BehaviorCommitment[] {
    try {
      const legacy = localStorage.getItem('behavior_commitments');
      if (legacy) {
        const data = JSON.parse(legacy);
        return Object.entries(data).flatMap(([studentId, commitments]: [string, any]) =>
          (commitments || []).map((c: any) => ({
            id: c.id || Date.now().toString(),
            studentId: studentId,
            commitment: c.commitment || c.text || '',
            date: c.date || new Date().toISOString().split('T')[0],
            status: c.status || 'pending',
            notes: c.notes
          }))
        );
      }
    } catch (error) {
      console.error('Error reading legacy behavior commitments:', error);
    }
    
    return [];
  }
  
  
  // Get independent choices
  static getIndependentChoices(studentId?: string): IndependentChoice[] {
    const unifiedData = this.getUnifiedData();
    const choices = unifiedData?.calendar?.independentChoices || [];
    
    if (studentId) {
      return choices.filter(c => c.studentId === studentId);
    }
    
    return choices;
  }
  
  // Add independent choice
  static addIndependentChoice(choice: Omit<IndependentChoice, 'id'>): IndependentChoice {
    const choices = this.getIndependentChoices();
    const newChoice: IndependentChoice = {
      ...choice,
      id: Date.now().toString()
    };
    
    choices.push(newChoice);
    this.saveIndependentChoices(choices);
    return newChoice;
  }
  
  // Save independent choices
  private static saveIndependentChoices(choices: IndependentChoice[]): void {
    const currentData = this.getUnifiedData();
    if (currentData) {
      if (!currentData.calendar) {
        currentData.calendar = { behaviorCommitments: [], independentChoices: [] };
      }
      currentData.calendar.independentChoices = choices;
      this.saveUnifiedData(currentData);
    }
  }
  
  // Get legacy independent choices
  private static getLegacyIndependentChoices(): IndependentChoice[] {
    try {
      const legacy = localStorage.getItem('calendar_choices');
      if (legacy) {
        const data = JSON.parse(legacy);
        return Object.entries(data).flatMap(([studentId, choices]: [string, any]) =>
          (choices || []).map((c: any) => ({
            id: c.id || Date.now().toString(),
            studentId: studentId,
            choice: c.choice || c.text || '',
            date: c.date || new Date().toISOString().split('T')[0],
            completed: c.completed || false,
            notes: c.notes
          }))
        );
      }
    } catch (error) {
      console.error('Error reading legacy independent choices:', error);
    }
    
    return [];
  }

  // ===== ATTENDANCE METHODS =====
  
  // Get today's date in YYYY-MM-DD format
  private static getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }
  
  // Get all attendance records
  static getAllAttendance(): AttendanceRecord[] {
    const unifiedData = this.getUnifiedData();
    return unifiedData?.attendance || [];
  }
  
  // Get attendance records for a specific date
  static getAttendanceForDate(date: string): AttendanceRecord[] {
    const allAttendance = this.getAllAttendance();
    return allAttendance.filter(record => record.date === date);
  }
  
  // Get today's attendance records
  static getTodayAttendance(): AttendanceRecord[] {
    const today = this.getTodayDateString();
    return this.getAttendanceForDate(today);
  }
  
  // Get absent students for a specific date
  static getAbsentStudentsForDate(date: string): string[] {
    const attendance = this.getAttendanceForDate(date);
    return attendance
      .filter(record => !record.isPresent)
      .map(record => record.studentId);
  }
  
  // Get absent students for today
  static getAbsentStudentsToday(): string[] {
    const today = this.getTodayDateString();
    return this.getAbsentStudentsForDate(today);
  }
  
  // Update student attendance
  static updateStudentAttendance(studentId: string, date: string, isPresent: boolean, notes?: string): void {
    const allAttendance = this.getAllAttendance();
    
    // Find existing record for this student and date
    const existingIndex = allAttendance.findIndex(
      record => record.studentId === studentId && record.date === date
    );
    
    const attendanceRecord: AttendanceRecord = {
      id: existingIndex >= 0 ? allAttendance[existingIndex].id : Date.now().toString(),
      studentId,
      date,
      isPresent,
      notes: notes || '',
      timestamp: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      // Update existing record
      allAttendance[existingIndex] = attendanceRecord;
    } else {
      // Add new record
      allAttendance.push(attendanceRecord);
    }
    
    this.saveAttendance(allAttendance);
    console.log(`📋 Updated attendance for student ${studentId} on ${date}: ${isPresent ? 'Present' : 'Absent'}`);
  }
  
  // Update today's attendance for a student
  static updateStudentAttendanceToday(studentId: string, isPresent: boolean, notes?: string): void {
    const today = this.getTodayDateString();
    this.updateStudentAttendance(studentId, today, isPresent, notes);
  }
  
  // Initialize attendance for all students on a given date (all present by default)
  static initializeAttendanceForDate(date: string): void {
    const students = this.getAllStudents();
    const existingAttendance = this.getAttendanceForDate(date);
    
    students.forEach(student => {
      // Only initialize if no record exists for this student on this date
      const hasRecord = existingAttendance.some(record => record.studentId === student.id);
      if (!hasRecord) {
        this.updateStudentAttendance(student.id, date, true); // Default to present
      }
    });
    
    console.log(`📋 Initialized attendance for ${date}: ${students.length} students`);
  }
  
  // Initialize today's attendance
  static initializeTodayAttendance(): void {
    const today = this.getTodayDateString();
    this.initializeAttendanceForDate(today);
  }
  
  // Reset attendance for a date (set all students to present)
  static resetAttendanceForDate(date: string): void {
    const students = this.getAllStudents();
    
    students.forEach(student => {
      this.updateStudentAttendance(student.id, date, true, '');
    });
    
    console.log(`📋 Reset attendance for ${date}: All students marked present`);
  }
  
  // Reset today's attendance
  static resetTodayAttendance(): void {
    const today = this.getTodayDateString();
    this.resetAttendanceForDate(today);
  }
  
  // Filter active (present) students from a student array
  static filterActiveStudents(students: any[]): any[] {
    const absentStudentIds = this.getAbsentStudentsToday();
    return students.filter(student => !absentStudentIds.includes(student.id));
  }
  
  // Save attendance records to unified data
  private static saveAttendance(attendance: AttendanceRecord[]): void {
    const currentData = this.getUnifiedData();
    if (currentData) {
      currentData.attendance = attendance;
      currentData.metadata.totalAttendanceRecords = attendance.length;
      this.saveUnifiedData(currentData);
    }
  }
  
  // Migrate legacy attendance data
  static migrateLegacyAttendance(): boolean {
    try {
      console.log('🔄 Migrating legacy attendance data...');
      
      const migratedRecords: AttendanceRecord[] = [];
      let migratedCount = 0;
      
      // Look for legacy attendance keys (attendance-YYYY-MM-DD)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('attendance-')) {
          try {
            const dateStr = key.replace('attendance-', '');
            const legacyData = localStorage.getItem(key);
            
            if (legacyData) {
              const attendanceRecords = JSON.parse(legacyData);
              
              attendanceRecords.forEach((record: any) => {
                const migratedRecord: AttendanceRecord = {
                  id: record.id || `${record.studentId}-${dateStr}`,
                  studentId: record.studentId,
                  date: dateStr,
                  isPresent: record.isPresent,
                  notes: record.notes || '',
                  timestamp: record.timestamp || new Date().toISOString()
                };
                
                migratedRecords.push(migratedRecord);
                migratedCount++;
              });
            }
          } catch (error) {
            console.error(`Error migrating attendance data for ${key}:`, error);
          }
        }
      }
      
      if (migratedRecords.length > 0) {
        this.saveAttendance(migratedRecords);
        console.log(`✅ Migrated ${migratedCount} attendance records from legacy storage`);
        return true;
      } else {
        console.log('ℹ️ No legacy attendance data found to migrate');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error migrating legacy attendance data:', error);
      return false;
    }
  }

  // ===== SETTINGS METHODS =====
  
  /**
   * CRITICAL: Get settings from unified data
   * This is the method that Morning Meeting Hub is trying to call
   */
  static getSettings(): any {
    try {
      const unifiedData = this.getUnifiedData();
      const settings = unifiedData?.settings || {};
      console.log('📄 UDS: Retrieved settings:', Object.keys(settings));
      return settings;
    } catch (error) {
      console.error('❌ UDS: Failed to get settings:', error);
      return {};
    }
  }
  
  // Update settings
  static updateSettings(settings: any): void {
    const currentData = this.getUnifiedData();
    if (currentData) {
      currentData.settings = { ...currentData.settings, ...settings };
      this.saveUnifiedData(currentData);
    }
  }

  // ===== MIGRATION METHODS =====
  
  // Migrate all legacy data to unified system
  static migrateAllLegacyData(): boolean {
    try {
      console.log('Starting comprehensive legacy data migration...');
      
      // Get or create unified data structure
      let unifiedData = this.getUnifiedData();
      if (!unifiedData) {
        unifiedData = {
          students: [],
          staff: [],
          activities: [],
          attendance: [],
          calendar: {
            behaviorCommitments: [],
            independentChoices: []
          },
          settings: {},
          metadata: {
            version: '2.0',
            migratedAt: new Date().toISOString(),
            totalGoals: 0,
            totalDataPoints: 0,
            totalStaff: 0,
            totalActivities: 0,
            totalAttendanceRecords: 0
          }
        };
      }
      
      // Migrate students (if not already done)
      if (unifiedData.students.length === 0) {
        unifiedData.students = this.getLegacyStudents();
      }
      
      // Migrate staff
      unifiedData.staff = [];
      
      // Migrate activities
      unifiedData.activities = [];
      
      // Migrate calendar data
      unifiedData.calendar.behaviorCommitments = this.getLegacyBehaviorCommitments();
      unifiedData.calendar.independentChoices = this.getLegacyIndependentChoices();
      
      // Migrate settings
      const legacySettings = localStorage.getItem('visualScheduleBuilderSettings');
      if (legacySettings) {
        unifiedData.settings.visualScheduleBuilderSettings = JSON.parse(legacySettings);
      }
      
      // Update metadata
      unifiedData.metadata = {
        version: '2.0',
        migratedAt: new Date().toISOString(),
        totalGoals: unifiedData.students.reduce((total, s) => total + s.iepData.goals.length, 0),
        totalDataPoints: unifiedData.students.reduce((total, s) => total + s.iepData.dataCollection.length, 0),
        totalStaff: unifiedData.staff.length,
        totalActivities: unifiedData.activities.length,
        totalAttendanceRecords: unifiedData.attendance.length
      };
      
      // Save unified data
      this.saveUnifiedData(unifiedData);
      
      console.log('Comprehensive migration completed successfully');
      console.log(`Migrated: ${unifiedData.students.length} students, ${unifiedData.staff.length} staff, ${unifiedData.activities.length} activities`);
      
      return true;
      
    } catch (error) {
      console.error('Error during comprehensive migration:', error);
      return false;
    }
  }
  
  // Legacy fallback methods
  private static getLegacyStudents(): UnifiedStudent[] {
    try {
      const legacyStudents = localStorage.getItem(this.LEGACY_STUDENT_KEY);
      if (legacyStudents) {
        const students = JSON.parse(legacyStudents);
        // Convert legacy students to unified format
        return students.map((student: any) => ({
          ...student,
          iepData: {
            goals: [],
            dataCollection: []
          }
        }));
      }
    } catch (error) {
      console.error('Error reading legacy students:', error);
    }
    
    return [];
  }
  
  // ===== ENHANCED SMART GOAL MANAGEMENT METHODS =====
  // Educator-focused methods for SMART goals and nine-week progress monitoring
  
  // Calculate current school year period
  static getCurrentSchoolYear(): SchoolYearPeriod {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based
    
    // School year typically starts in August/September
    let startYear, endYear;
    if (currentMonth >= 7) { // August or later
      startYear = currentYear;
      endYear = currentYear + 1;
    } else {
      startYear = currentYear - 1;
      endYear = currentYear;
    }
    
    const startDate = `${startYear}-08-15`; // Typical school start
    const endDate = `${endYear}-06-15`; // Typical school end
    
    // Calculate 9-week quarters (approximate)
    const start = new Date(startDate);
    const q1End = new Date(start.getTime() + (9 * 7 * 24 * 60 * 60 * 1000));
    const q2End = new Date(q1End.getTime() + (9 * 7 * 24 * 60 * 60 * 1000));
    const q3End = new Date(q2End.getTime() + (9 * 7 * 24 * 60 * 60 * 1000));
    const q4End = new Date(endDate);
    
    return {
      year: `${startYear}-${endYear}`,
      startDate,
      endDate,
      quarters: {
        q1: { 
          start: startDate, 
          end: q1End.toISOString().split('T')[0], 
          weekNumber: 9 
        },
        q2: { 
          start: q1End.toISOString().split('T')[0], 
          end: q2End.toISOString().split('T')[0], 
          weekNumber: 18 
        },
        q3: { 
          start: q2End.toISOString().split('T')[0], 
          end: q3End.toISOString().split('T')[0], 
          weekNumber: 27 
        },
        q4: { 
          start: q3End.toISOString().split('T')[0], 
          end: endDate, 
          weekNumber: 36 
        }
      }
    };
  }
  
  // Get current quarter for nine-week progress monitoring
  static getCurrentQuarter(): 'q1' | 'q2' | 'q3' | 'q4' {
    const schoolYear = this.getCurrentSchoolYear();
    const today = new Date().toISOString().split('T')[0];
    
    if (today <= schoolYear.quarters.q1.end) return 'q1';
    if (today <= schoolYear.quarters.q2.end) return 'q2';
    if (today <= schoolYear.quarters.q3.end) return 'q3';
    return 'q4';
  }
  
  // Create SMART goal with nine-week milestones
  static createSMARTGoal(
    studentId: string, 
    goalData: {
      title: string;
      domain: 'academic' | 'behavioral' | 'social-emotional' | 'physical' | 'communication' | 'adaptive';
      description: string;
      shortTermObjective: string;
      measurementType: 'percentage' | 'frequency' | 'duration' | 'rating' | 'yes-no' | 'independence';
      criteria: string;
      target: number;
      priority: 'high' | 'medium' | 'low';
      baseline?: { value: number; date: string; notes?: string };
      nineWeekTargets?: { q1: number; q2: number; q3: number; q4: number };
      inheritedFrom?: {
        previousGoalId: string;
        previousYear: string;
        carryOverReason: string;
        modifications: string[];
      };
    }
  ): IEPGoal {
    const now = new Date();
    const dateCreated = now.toISOString().split('T')[0];
    
    // Auto-generate nine-week milestones if not provided
    const nineWeekMilestones = goalData.nineWeekTargets ? {
      quarter1: { target: goalData.nineWeekTargets.q1 },
      quarter2: { target: goalData.nineWeekTargets.q2 },
      quarter3: { target: goalData.nineWeekTargets.q3 },
      quarter4: { target: goalData.nineWeekTargets.q4 }
    } : {
      quarter1: { target: Math.round(goalData.target * 0.25) },
      quarter2: { target: Math.round(goalData.target * 0.50) },
      quarter3: { target: Math.round(goalData.target * 0.75) },
      quarter4: { target: goalData.target }
    };
    
    const smartGoal: Omit<IEPGoal, 'id' | 'studentId'> = {
      title: goalData.title,
      domain: goalData.domain,
      description: goalData.description,
      shortTermObjective: goalData.shortTermObjective,
      measurableObjective: goalData.shortTermObjective,
      measurementType: goalData.measurementType,
      criteria: goalData.criteria,
      targetCriteria: goalData.criteria,
      target: goalData.target,
      priority: goalData.priority,
      dateCreated,
      createdDate: dateCreated,
      lastUpdated: now.toISOString(),
      dataPoints: 0,
      currentProgress: goalData.baseline?.value || 0,
      isActive: true,
      dataCollectionSchedule: 'daily', // Default for educator workflow
      nineWeekMilestones,
      inheritedFrom: goalData.inheritedFrom,
      baseline: goalData.baseline,
      reviewDates: []
    };
    
    return this.addGoalToStudent(studentId, smartGoal);
  }
  
  // Update nine-week milestone progress
  static updateNineWeekProgress(
    goalId: string, 
    quarter: 'quarter1' | 'quarter2' | 'quarter3' | 'quarter4',
    actual: number,
    notes?: string
  ): void {
    const students = this.getAllStudents();
    
    for (const student of students) {
      const goal = student.iepData.goals.find(g => g.id === goalId);
      if (goal) {
        if (!goal.nineWeekMilestones) {
          goal.nineWeekMilestones = {
            quarter1: { target: Math.round(goal.target * 0.25) },
            quarter2: { target: Math.round(goal.target * 0.50) },
            quarter3: { target: Math.round(goal.target * 0.75) },
            quarter4: { target: goal.target }
          };
        }
        
        goal.nineWeekMilestones[quarter].actual = actual;
        if (notes) {
          goal.nineWeekMilestones[quarter].notes = notes;
        }
        
        goal.lastUpdated = new Date().toISOString();
        this.saveStudents(students);
        return;
      }
    }
  }
  
  // Get progress analysis for educator dashboard
  static getProgressAnalysis(studentId: string): {
    overallProgress: number;
    goalsMet: number;
    totalGoals: number;
    onTrackGoals: number;
    needsAttentionGoals: number;
    quarterProgress: {
      quarter: 'q1' | 'q2' | 'q3' | 'q4';
      goalsOnTrack: number;
      goalsBehind: number;
      goalsAhead: number;
    };
    lastDataCollection: string;
    daysSinceLastData: number;
  } {
    const student = this.getStudent(studentId);
    if (!student || !student.iepData.goals.length) {
      return {
        overallProgress: 0,
        goalsMet: 0,
        totalGoals: 0,
        onTrackGoals: 0,
        needsAttentionGoals: 0,
        quarterProgress: {
          quarter: this.getCurrentQuarter(),
          goalsOnTrack: 0,
          goalsBehind: 0,
          goalsAhead: 0
        },
        lastDataCollection: '',
        daysSinceLastData: 0
      };
    }
    
    const activeGoals = student.iepData.goals.filter(g => g.isActive);
    const currentQuarter = this.getCurrentQuarter();
    
    // Calculate overall progress
    const totalProgress = activeGoals.reduce((sum, g) => sum + (g.currentProgress || 0), 0);
    const overallProgress = activeGoals.length > 0 ? Math.round(totalProgress / activeGoals.length) : 0;
    
    // Count goals met (at or above target)
    const goalsMet = activeGoals.filter(g => (g.currentProgress || 0) >= g.target).length;
    
    // Analyze quarter progress
    let goalsOnTrack = 0;
    let goalsBehind = 0;
    let goalsAhead = 0;
    
    activeGoals.forEach(goal => {
      if (goal.nineWeekMilestones) {
        const quarterTarget = goal.nineWeekMilestones[`quarter${currentQuarter.slice(1)}` as keyof typeof goal.nineWeekMilestones]?.target || 0;
        const currentProgress = goal.currentProgress || 0;
        
        if (currentProgress >= quarterTarget * 1.1) { // 10% ahead
          goalsAhead++;
        } else if (currentProgress >= quarterTarget * 0.9) { // Within 10%
          goalsOnTrack++;
        } else {
          goalsBehind++;
        }
      }
    });
    
    // Find last data collection date
    let lastDataCollection = '';
    let daysSinceLastData = 0;
    
    if (student.iepData.dataCollection.length > 0) {
      const sortedData = student.iepData.dataCollection.sort(
        (a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
      );
      lastDataCollection = sortedData[0].date;
      
      const lastDate = new Date(lastDataCollection);
      const today = new Date();
      daysSinceLastData = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    return {
      overallProgress,
      goalsMet,
      totalGoals: activeGoals.length,
      onTrackGoals: goalsOnTrack,
      needsAttentionGoals: goalsBehind,
      quarterProgress: {
        quarter: currentQuarter,
        goalsOnTrack,
        goalsBehind,
        goalsAhead
      },
      lastDataCollection,
      daysSinceLastData
    };
  }
  
  // Add enhanced data point with trial tracking
  static addEnhancedDataPoint(dataPoint: Omit<EnhancedDataPoint, 'id'>): EnhancedDataPoint {
    // First add as regular data point
    const basicDataPoint = this.addDataPoint(dataPoint);
    
    // Then enhance with additional properties
    const enhancedDataPoint: EnhancedDataPoint = {
      ...basicDataPoint,
      trialsCorrect: dataPoint.trialsCorrect,
      trialsTotal: dataPoint.trialsTotal,
      trialDetails: dataPoint.trialDetails,
      sessionType: dataPoint.sessionType,
      environmentalFactors: dataPoint.environmentalFactors,
      accommodationsUsed: dataPoint.accommodationsUsed,
      behaviorNotes: dataPoint.behaviorNotes,
      confidenceLevel: dataPoint.confidenceLevel,
      masteryIndicator: dataPoint.masteryIndicator,
      nextSteps: dataPoint.nextSteps,
      percentageCorrect: dataPoint.percentageCorrect,
      sessionDuration: dataPoint.sessionDuration,
      dataQuality: dataPoint.dataQuality
    };
    
    // Calculate percentage if trials provided
    if (dataPoint.trialsCorrect !== undefined && dataPoint.trialsTotal !== undefined && dataPoint.trialsTotal > 0) {
      enhancedDataPoint.percentageCorrect = Math.round((dataPoint.trialsCorrect / dataPoint.trialsTotal) * 100);
      enhancedDataPoint.value = enhancedDataPoint.percentageCorrect;
    }
    
    // Auto-determine mastery indicator
    if (dataPoint.confidenceLevel === 'high' && (enhancedDataPoint.percentageCorrect || enhancedDataPoint.value) >= 80) {
      enhancedDataPoint.masteryIndicator = true;
    }
    
    return enhancedDataPoint;
  }
  
  // Get goals needing attention (for teacher dashboard)
  static getGoalsNeedingAttention(): {
    studentId: string;
    studentName: string;
    goalId: string;
    goalTitle: string;
    daysSinceLastData: number;
    currentProgress: number;
    target: number;
    priority: 'high' | 'medium' | 'low';
    reason: 'no-recent-data' | 'behind-target' | 'declining-trend';
  }[] {
    const students = this.getAllStudents();
    const needsAttention: any[] = [];
    const today = new Date();
    
    students.forEach(student => {
      student.iepData.goals.filter(g => g.isActive).forEach(goal => {
        const goalDataPoints = student.iepData.dataCollection
          .filter(dp => dp.goalId === goal.id)
          .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
        
        let reason: 'no-recent-data' | 'behind-target' | 'declining-trend' | null = null;
        let daysSinceLastData = 0;
        
        // Check for no recent data
        if (goalDataPoints.length === 0) {
          reason = 'no-recent-data';
          daysSinceLastData = 999;
        } else {
          const lastDataDate = new Date(goalDataPoints[0].date);
          daysSinceLastData = Math.floor((today.getTime() - lastDataDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastData > 7) {
            reason = 'no-recent-data';
          }
        }
        
        // Check if behind target for current quarter
        if (!reason && goal.nineWeekMilestones) {
          const currentQuarter = this.getCurrentQuarter();
          const quarterTarget = goal.nineWeekMilestones[`quarter${currentQuarter.slice(1)}` as keyof typeof goal.nineWeekMilestones]?.target || 0;
          
          if ((goal.currentProgress || 0) < quarterTarget * 0.8) { // 20% behind
            reason = 'behind-target';
          }
        }
        
        // Check for declining trend
        if (!reason && goalDataPoints.length >= 3) {
          const recent3 = goalDataPoints.slice(0, 3);
          const isDecline = recent3[0].value < recent3[1].value && recent3[1].value < recent3[2].value;
          
          if (isDecline) {
            reason = 'declining-trend';
          }
        }
        
        if (reason) {
          needsAttention.push({
            studentId: student.id,
            studentName: student.name,
            goalId: goal.id,
            goalTitle: goal.title,
            daysSinceLastData,
            currentProgress: goal.currentProgress || 0,
            target: goal.target,
            priority: goal.priority,
            reason
          });
        }
      });
    });
    
    // Sort by priority and days since last data
    return needsAttention.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.daysSinceLastData - a.daysSinceLastData;
    });
  }
  
  // Create goal inheritance record
  static inheritGoal(
    currentGoalId: string,
    previousGoalId: string,
    previousYear: string,
    carryOverReason: 'not-mastered' | 'partial-mastery' | 'new-environment' | 'skill-refinement',
    modifications: string[]
  ): void {
    const students = this.getAllStudents();
    
    for (const student of students) {
      const goal = student.iepData.goals.find(g => g.id === currentGoalId);
      if (goal) {
        goal.inheritedFrom = {
          previousGoalId,
          previousYear,
          carryOverReason,
          modifications
        };
        
        goal.lastUpdated = new Date().toISOString();
        this.saveStudents(students);
        return;
      }
    }
  }
  
  // Get goal inheritance history
  static getGoalInheritanceHistory(goalId: string): GoalInheritance | null {
    const students = this.getAllStudents();
    
    for (const student of students) {
      const goal = student.iepData.goals.find(g => g.id === goalId);
      if (goal && goal.inheritedFrom) {
        // Build inheritance chain
        const previousGoals: any[] = [];
        
        // Add current inheritance info
        previousGoals.push({
          goalId: goal.inheritedFrom.previousGoalId,
          year: goal.inheritedFrom.previousYear,
          finalProgress: 0, // Would need to be stored separately
          carryOverReason: goal.inheritedFrom.carryOverReason,
          modifications: goal.inheritedFrom.modifications
        });
        
        return {
          currentGoalId: goalId,
          previousGoals,
          continuityNotes: `Goal inherited from ${goal.inheritedFrom.previousYear} due to ${goal.inheritedFrom.carryOverReason}`
        };
      }
    }
    
    return null;
  }
  
  // Generate educator-friendly progress report
  static generateEducatorProgressReport(studentId: string, timeframe: 'week' | 'month' | 'quarter'): {
    student: { id: string; name: string };
    reportPeriod: { start: string; end: string };
    overallSummary: {
      totalGoals: number;
      goalsOnTrack: number;
      goalsMet: number;
      averageProgress: number;
      dataPointsCollected: number;
    };
    goalDetails: {
      goalId: string;
      title: string;
      domain: string;
      currentProgress: number;
      target: number;
      trend: 'improving' | 'stable' | 'declining';
      recentDataPoints: number;
      nextSteps: string;
    }[];
    recommendations: string[];
  } {
    const student = this.getStudent(studentId);
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Analyze goals
    const activeGoals = student.iepData.goals.filter(g => g.isActive);
    const goalDetails = activeGoals.map(goal => {
      const goalDataPoints = student.iepData.dataCollection
        .filter(dp => dp.goalId === goal.id && dp.date >= startDateStr && dp.date <= endDateStr)
        .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
      
      // Determine trend
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (goalDataPoints.length >= 3) {
        const recent = goalDataPoints.slice(0, 3);
        const oldest = recent[recent.length - 1].value;
        const newest = recent[0].value;
        
        if (newest > oldest + 5) trend = 'improving';
        else if (newest < oldest - 5) trend = 'declining';
      }
      
      return {
        goalId: goal.id,
        title: goal.title,
        domain: goal.domain,
        currentProgress: goal.currentProgress || 0,
        target: goal.target,
        trend,
        recentDataPoints: goalDataPoints.length,
        nextSteps: goalDataPoints[0]?.notes || 'Continue current intervention'
      };
    });
    
    // Calculate summary
    const totalDataPoints = goalDetails.reduce((sum, g) => sum + g.recentDataPoints, 0);
    const averageProgress = goalDetails.length > 0 
      ? Math.round(goalDetails.reduce((sum, g) => sum + g.currentProgress, 0) / goalDetails.length)
      : 0;
    const goalsOnTrack = goalDetails.filter(g => g.currentProgress >= g.target * 0.8).length;
    const goalsMet = goalDetails.filter(g => g.currentProgress >= g.target).length;
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (totalDataPoints < activeGoals.length * 3) {
      recommendations.push('Increase data collection frequency for more accurate progress monitoring');
    }
    
    const decliningGoals = goalDetails.filter(g => g.trend === 'declining');
    if (decliningGoals.length > 0) {
      recommendations.push(`Review intervention strategies for ${decliningGoals.length} goal(s) showing declining trend`);
    }
    
    const lowDataGoals = goalDetails.filter(g => g.recentDataPoints < 2);
    if (lowDataGoals.length > 0) {
      recommendations.push(`Collect more data for ${lowDataGoals.length} goal(s) with insufficient recent data`);
    }
    
    return {
      student: { id: student.id, name: student.name },
      reportPeriod: { start: startDateStr, end: endDateStr },
      overallSummary: {
        totalGoals: activeGoals.length,
        goalsOnTrack,
        goalsMet,
        averageProgress,
        dataPointsCollected: totalDataPoints
      },
      goalDetails,
      recommendations
    };
  }

  // Check if system is using unified data
  static isUsingUnifiedData(): boolean {
    return this.getUnifiedData() !== null;
  }
  
  /**
   * CRITICAL: System status check
   * Helps diagnose data issues
   */
  static getSystemStatus(): any {
    try {
      const unifiedData = this.getUnifiedData();
      return {
        hasUnifiedData: !!unifiedData,
        totalStudents: unifiedData?.students?.length || 0,
        totalStaff: unifiedData?.staff?.length || 0,
        totalActivities: unifiedData?.activities?.length || 0,
        totalGoals: unifiedData?.metadata?.totalGoals || 0,
        totalDataPoints: unifiedData?.metadata?.totalDataPoints || 0,
        dataVersion: unifiedData?.metadata?.version || 'unknown',
        hasLegacyData: this.hasLegacyData()
      };
    } catch (error) {
      console.error('❌ UDS: Failed to get system status:', error);
      return {
        hasUnifiedData: false,
        totalStudents: 0,
        totalStaff: 0,
        totalActivities: 0,
        error: error.message
      };
    }
  }

// ===== MORNING MEETING DATA METHODS =====
  
  // Save Morning Meeting step data
  static saveMorningMeetingStepData(sessionKey: string, data: any): void {
    try {
      localStorage.setItem(sessionKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save Morning Meeting step data:', error);
    }
  }

  // Load Morning Meeting step data
  static loadMorningMeetingStepData(sessionKey: string): any {
    try {
      const saved = localStorage.getItem(sessionKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load Morning Meeting step data:', error);
      return null;
    }
  }

  // ===== WEATHER HISTORY METHODS =====
  
  // Method to get all saved weather data
  static getWeatherHistory(): WeatherHistory {
    const unifiedData = this.getUnifiedData();
    if (unifiedData?.settings?.weatherHistory) {
      return unifiedData.settings.weatherHistory;
    }
    
    // Fallback to direct localStorage access for backward compatibility
    try {
      const weatherData = localStorage.getItem('weatherHistory');
      return weatherData ? JSON.parse(weatherData) : {};
    } catch (error) {
      console.error('Error reading weather history:', error);
      return {};
    }
  }

  // Method to save or update the weather for a specific day
  static saveWeatherForDate(date: string, weather: string): void {
    try {
      // Update unified data structure
      let unifiedData = this.getUnifiedData();
      if (unifiedData) {
        if (!unifiedData.settings.weatherHistory) {
          unifiedData.settings.weatherHistory = {};
        }
        unifiedData.settings.weatherHistory[date] = weather as 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy' | 'windy' | 'snowy';
        this.saveUnifiedData(unifiedData);
      }
      
      // Also save to direct localStorage for backward compatibility
      const currentWeatherHistory = this.getWeatherHistory();
      currentWeatherHistory[date] = weather as 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy' | 'windy' | 'snowy';
      localStorage.setItem('weatherHistory', JSON.stringify(currentWeatherHistory));
      
      console.log(`🌤️ Weather saved for ${date}: ${weather}`);
    } catch (error) {
      console.error('Error saving weather data:', error);
    }
  }

  // Method to get weather for a specific date
  static getWeatherForDate(date: string): 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy' | 'windy' | 'snowy' | null {
    const weatherHistory = this.getWeatherHistory();
    return weatherHistory[date] || null;
  }

  // Method to get weather for today
  static getTodayWeather(): 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy' | 'windy' | 'snowy' | null {
    const today = new Date().toISOString().split('T')[0];
    return this.getWeatherForDate(today);
  }

  // Method to get weather for the past N days
  static getRecentWeatherHistory(days: number = 7): { date: string; weather: string }[] {
    const weatherHistory = this.getWeatherHistory();
    const result: { date: string; weather: string }[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (weatherHistory[dateStr]) {
        result.push({
          date: dateStr,
          weather: weatherHistory[dateStr]
        });
      }
    }
    
    return result.reverse(); // Return in chronological order
  }

  // Method to clear weather history (for maintenance)
  static clearWeatherHistory(): void {
    try {
      // Clear from unified data
      const unifiedData = this.getUnifiedData();
      if (unifiedData) {
        unifiedData.settings.weatherHistory = {};
        this.saveUnifiedData(unifiedData);
      }
      
      // Clear from direct localStorage
      localStorage.removeItem('weatherHistory');
      
      console.log('🌤️ Weather history cleared');
    } catch (error) {
      console.error('Error clearing weather history:', error);
    }
  }

  // ===== DAILY LOGS METHODS =====
  
  // Method to get all daily logs with educational standards tracking
  static getDailyLogs(): { [date: string]: { standardsCovered: { standard: string; source: string }[] } } {
    const unifiedData = this.getUnifiedData();
    if (unifiedData?.settings?.dailyLogs) {
      return unifiedData.settings.dailyLogs;
    }
    
    // Fallback to direct localStorage access for backward compatibility
    try {
      const dailyLogsData = localStorage.getItem('dailyLogs');
      return dailyLogsData ? JSON.parse(dailyLogsData) : {};
    } catch (error) {
      console.error('Error reading daily logs:', error);
      return {};
    }
  }

  // Method to save educational standards for a specific date with duplicate prevention
  static saveStandardsForDate(date: string, standards: { standard: string; source: string }[]): void {
    try {
      // Get existing standards for the date
      const existingLogs = this.getDailyLogs();
      const existingStandards = existingLogs[date]?.standardsCovered || [];
      
      // Prevent duplicate entries for the same standard from the same source
      const newStandards = standards.filter(
        (newStd) => !existingStandards.some(
          (exStd) => exStd.standard === newStd.standard && exStd.source === newStd.source
        )
      );
      
      // Combine existing and new standards
      const updatedStandards = [...existingStandards, ...newStandards];
      
      // Update unified data structure
      let unifiedData = this.getUnifiedData();
      if (unifiedData) {
        if (!unifiedData.settings.dailyLogs) {
          unifiedData.settings.dailyLogs = {};
        }
        if (!unifiedData.settings.dailyLogs[date]) {
          unifiedData.settings.dailyLogs[date] = { standardsCovered: [] };
        }
        unifiedData.settings.dailyLogs[date].standardsCovered = updatedStandards;
        this.saveUnifiedData(unifiedData);
      }
      
      // Also save to direct localStorage for backward compatibility
      const updatedLogs = { ...existingLogs };
      if (!updatedLogs[date]) {
        updatedLogs[date] = { standardsCovered: [] };
      }
      updatedLogs[date].standardsCovered = updatedStandards;
      localStorage.setItem('dailyLogs', JSON.stringify(updatedLogs));
      
      console.log(`📚 Standards saved for ${date}: ${newStandards.length} new standards added (${updatedStandards.length} total)`);
    } catch (error) {
      console.error('Error saving standards for date:', error);
    }
  }

  // ===== BEHAVIOR COMMITMENT METHODS =====
  
  // Get behavior commitments for a specific date
  static getBehaviorCommitmentsForDate(date: string): BehaviorCommitmentData[] {
    try {
      const behaviorData = localStorage.getItem('behaviorCommitments');
      if (!behaviorData) return [];
      
      const data = JSON.parse(behaviorData);
      return data[date] || [];
    } catch (error) {
      console.error('Error getting behavior commitments:', error);
      return [];
    }
  }

  // Get behavior commitment for a specific student on a specific date
  static getBehaviorCommitmentForStudent(studentId: string, date: string): BehaviorCommitmentData | null {
    try {
      const commitments = this.getBehaviorCommitmentsForDate(date);
      return commitments.find((c: BehaviorCommitmentData) => c.studentId === studentId) || null;
    } catch (error) {
      console.error('Error getting behavior commitment for student:', error);
      return null;
    }
  }

  // Update behavior achievement status for a student
  static updateBehaviorAchievement(studentId: string, date: string, achieved: boolean): boolean {
    try {
      const behaviorData = localStorage.getItem('behaviorCommitments') || '{}';
      const data = JSON.parse(behaviorData);
      
      if (!data[date]) data[date] = [];
      
      const existingIndex = data[date].findIndex((c: BehaviorCommitmentData) => c.studentId === studentId);
      
      if (existingIndex >= 0) {
        data[date][existingIndex].achieved = achieved;
        data[date][existingIndex].achievedAt = achieved ? new Date().toISOString() : null;
      } else {
        console.warn('No behavior commitment found for student:', studentId);
        return false;
      }
      
      localStorage.setItem('behaviorCommitments', JSON.stringify(data));
      console.log('✅ Updated behavior achievement for', studentId);
      return true;
      
    } catch (error) {
      console.error('Error updating behavior achievement:', error);
      return false;
    }
  }

  // Save behavior commitment for a student
  static saveBehaviorCommitment(studentId: string, date: string, commitment: string, category?: string): boolean {
    try {
      const behaviorData = localStorage.getItem('behaviorCommitments') || '{}';
      const data = JSON.parse(behaviorData);
      
      if (!data[date]) data[date] = [];
      
      const existingIndex = data[date].findIndex((c: BehaviorCommitmentData) => c.studentId === studentId);
      
      const commitmentData: BehaviorCommitmentData = {
        studentId,
        text: commitment,
        achieved: false,
        achievedAt: null,
        category: category || 'general'
      };
      
      if (existingIndex >= 0) {
        data[date][existingIndex] = { ...data[date][existingIndex], ...commitmentData };
      } else {
        data[date].push(commitmentData);
      }
      
      localStorage.setItem('behaviorCommitments', JSON.stringify(data));
      console.log('✅ Saved behavior commitment for', studentId);
      return true;
      
    } catch (error) {
      console.error('Error saving behavior commitment:', error);
      return false;
    }
  }

  // ===== MIGRATION UTILITY =====
  
  // Migration utility - run this ONCE to migrate old data
  static migrateDailyCheckInsData(): { success: boolean; migratedCount: number; errors: string[] } {
    const result = {
      success: false,
      migratedCount: 0,
      errors: [] as string[]
    };
    
    try {
      console.log('🔄 Starting dailyCheckIns data migration...');
      
      const oldData = localStorage.getItem('dailyCheckIns');
      if (!oldData) {
        result.errors.push('No dailyCheckIns data found to migrate');
        return result;
      }
      
      const checkIns = JSON.parse(oldData);
      const behaviorData: { [date: string]: BehaviorCommitmentData[] } = {};
      
      checkIns.forEach((checkIn: any) => {
        const date = checkIn.date;
        
        // Migrate attendance data
        if (checkIn.attendance && Array.isArray(checkIn.attendance)) {
          checkIn.attendance.forEach((record: any) => {
            try {
              this.updateStudentAttendance(record.studentId, date, record.isPresent, record.notes || '');
            } catch (error) {
              result.errors.push(`Failed to migrate attendance for ${record.studentId}: ${error}`);
            }
          });
        }
        
        // Migrate behavior commitments
        if (checkIn.behaviorCommitments && Array.isArray(checkIn.behaviorCommitments)) {
          behaviorData[date] = checkIn.behaviorCommitments.map((commitment: any) => ({
            studentId: commitment.studentId,
            text: commitment.commitment || commitment.text || 'Migrated commitment',
            achieved: commitment.achieved || false,
            achievedAt: commitment.achievedAt || null,
            category: commitment.category || 'general'
          }));
          
          result.migratedCount += checkIn.behaviorCommitments.length;
        }
      });
      
      // Save migrated behavior data
      localStorage.setItem('behaviorCommitments', JSON.stringify(behaviorData));
      
      // Create backup of old data
      localStorage.setItem('dailyCheckIns_backup_' + Date.now(), oldData);
      
      // Remove old data after successful migration
      localStorage.removeItem('dailyCheckIns');
      
      result.success = true;
      console.log('✅ Migration completed successfully');
      console.log(`📦 Migrated ${result.migratedCount} behavior commitments`);
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Migration failed: ${error}`);
      console.error('❌ Migration failed:', error);
    }
    
    return result;
  }
}

export default UnifiedDataService;

// 🧪 TESTING FUNCTIONS (Add these for debugging)

/**
 * Test the UnifiedDataService to make sure it's working
 * Run this in browser console: testUnifiedDataService()
 */
function testUnifiedDataService(): boolean {
  console.log('🧪 Testing UnifiedDataService...');
  
  try {
    // Test 1: Get system status
    const status = UnifiedDataService.getSystemStatus();
    console.log('✅ System Status:', status);
    
    // Test 2: Get settings (this is what was failing)
    const settings = UnifiedDataService.getSettings();
    console.log('✅ Settings Retrieved:', settings);
    
    // Test 3: Get students
    const students = UnifiedDataService.getAllStudents();
    console.log('✅ Students Retrieved:', students.length);
    
    // Test 4: Get unified data structure
    const data = UnifiedDataService.getUnifiedData();
    console.log('✅ Unified Data Structure:', {
      hasStudents: !!data.students,
      hasStaff: !!data.staff,
      hasActivities: !!data.activities,
      hasSettings: !!data.settings
    });
    
    console.log('🎉 UnifiedDataService is working correctly!');
    return true;
  } catch (error) {
    console.error('❌ UnifiedDataService test failed:', error);
    return false;
  }
}

// Make test function available globally
(window as any).testUnifiedDataService = testUnifiedDataService;

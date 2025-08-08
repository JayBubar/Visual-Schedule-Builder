// Unified Data Service - UPDATED to fix migration issues
// src/renderer/services/unifiedDataService.ts

import { IEPGoal as BaseIEPGoal, DataPoint, Student } from '../types';

// Extended IEP Goal interface for backward compatibility
export interface IEPGoal extends Omit<BaseIEPGoal, 'domain' | 'measurementType'> {
  domain: 'academic' | 'behavioral' | 'social-emotional' | 'physical';
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

export interface DailyHighlight {
  id: string;
  studentId: string;
  highlight: string;
  date: string;
  category: 'achievement' | 'behavior' | 'social' | 'academic';
  notes?: string;
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
    dailyHighlights: DailyHighlight[];
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
  
  // Debug method to inspect localStorage
  static debugLocalStorage(): void {
    console.log('🔍 DEBUGGING localStorage contents:');
    console.log('- All localStorage keys:', Object.keys(localStorage));
    console.log('- visual-schedule-builder-unified-data:', localStorage.getItem(this.UNIFIED_KEY) ? 'EXISTS' : 'MISSING');
    console.log('- students:', localStorage.getItem('students') ? 'EXISTS' : 'MISSING');
    console.log('- vsb_students:', localStorage.getItem('vsb_students') ? 'EXISTS' : 'MISSING');
    
    const unifiedDataRaw = localStorage.getItem(this.UNIFIED_KEY);
    if (unifiedDataRaw) {
      try {
        const parsed = JSON.parse(unifiedDataRaw);
        console.log('- Unified data structure:', parsed);
        console.log('- Students in unified data:', parsed.students);
        console.log('- Students count:', Array.isArray(parsed.students) ? parsed.students.length : 'Not an array');
        
        // Check for birthday data specifically
        if (Array.isArray(parsed.students)) {
          parsed.students.forEach((student: any, index: number) => {
            console.log(`- Student ${index + 1} (${student.name}):`, {
              id: student.id,
              birthday: student.birthday,
              allowBirthdayDisplay: student.allowBirthdayDisplay,
              allowPhotoInCelebrations: student.allowPhotoInCelebrations
            });
          });
        }
      } catch (e) {
        console.error('- Error parsing unified data:', e);
      }
    }
  }

  // New method to force check birthday data persistence
  static checkBirthdayDataPersistence(): void {
    console.log('🎂 CHECKING BIRTHDAY DATA PERSISTENCE:');
    this.debugLocalStorage();
    
    // Also check if there are any competing storage operations
    console.log('🔍 Checking for competing storage keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('student') || key.includes('birthday') || key.includes('unified'))) {
        console.log(`- Found storage key: ${key}`);
        try {
          const value = localStorage.getItem(key);
          if (value && value.length < 1000) { // Only log short values
            console.log(`  Value: ${value.substring(0, 200)}...`);
          } else {
            console.log(`  Value: [${value?.length || 0} characters]`);
          }
        } catch (e) {
          console.log(`  Error reading value: ${e}`);
        }
      }
    }
  }

  // Get all unified data
  static getUnifiedData(): UnifiedData | null {
    try {
      const data = localStorage.getItem(this.UNIFIED_KEY);
      if (!data) return null;
      
      const parsedData = JSON.parse(data);
      
      // 🔧 FIXED: Convert object structure to array structure if needed
      if (parsedData.students && !Array.isArray(parsedData.students)) {
        console.log('🔄 Converting students object to array format...');
        console.log('🔍 Original students object keys:', Object.keys(parsedData.students));
        console.log('🔍 Original students object values:', Object.values(parsedData.students));
        
        const studentsArray = Object.values(parsedData.students);
        console.log('🔍 Converted array length:', studentsArray.length);
        console.log('🔍 First student in array:', studentsArray[0]);
        
        parsedData.students = studentsArray;
        
        // Save the converted structure
        this.saveUnifiedData(parsedData);
        console.log('✅ Successfully converted and saved students as array');
      } else if (parsedData.students && Array.isArray(parsedData.students)) {
        console.log('✅ Students already in array format:', parsedData.students.length, 'students');
      }
      
      // 🔧 FIXED: Convert staff object structure to array structure if needed
      if (parsedData.staff && !Array.isArray(parsedData.staff)) {
        console.log('🔄 Converting staff object to array format...');
        parsedData.staff = Object.values(parsedData.staff);
        
        // Save the converted structure
        this.saveUnifiedData(parsedData);
      } else if (parsedData.staff && Array.isArray(parsedData.staff)) {
        console.log('✅ Staff already in array format:', parsedData.staff.length, 'staff');
      }
      
      return parsedData;
    } catch (error) {
      console.error('Error reading unified data:', error);
      return null;
    }
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
      
      console.log(`Found ${legacyDataPoints.length} legacy data points to recover`);
      
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
      
      console.log(`Successfully recovered ${recoveredCount} data points`);
      return recoveredCount > 0;
      
    } catch (error) {
      console.error('Error recovering data points:', error);
      return false;
    }
  }
  
  // Get all students with full data
  static getAllStudents(): UnifiedStudent[] {
    console.log('🔍 UnifiedDataService.getAllStudents() called');
    
    // Try unified data first
    const unifiedData = this.getUnifiedData();
    console.log('Unified data exists:', !!unifiedData);
    
    if (unifiedData && unifiedData.students) {
      // The unified data has students as an array inside the object
      if (Array.isArray(unifiedData.students) && unifiedData.students.length > 0) {
        console.log('✅ Using unified data:', unifiedData.students.length, 'students');
        return unifiedData.students;
      }
      console.log('⚠️ Unified data exists but students array is empty or invalid');
    } else {
      console.log('⚠️ No unified data found or no students property');
    }
    
    // FALLBACK: Read directly from legacy students key
    console.log('⚡ Falling back to legacy student data...');
    try {
      const legacyStudents = localStorage.getItem('students');
      console.log('Legacy students raw:', legacyStudents ? 'EXISTS' : 'MISSING');
      
      if (legacyStudents) {
        const students = JSON.parse(legacyStudents);
        console.log('✅ Parsed legacy students:', students.length);
        
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
        
        console.log('🚀 Returning converted students:', convertedStudents.length);
        return convertedStudents;
      }
    } catch (error) {
      console.error('❌ Failed to load legacy students:', error);
    }
    
    console.log('💥 No student data found anywhere!');
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
  
  // Get student's data points
  static getStudentDataPoints(studentId: string): DataPoint[] {
    const student = this.getStudent(studentId);
    return student?.iepData.dataCollection || [];
  }
  
  // Get data points for a specific goal
  static getGoalDataPoints(goalId: string): DataPoint[] {
    const students = this.getAllStudents();
    const allDataPoints: DataPoint[] = [];
    
    students.forEach(student => {
      const goalDataPoints = student.iepData.dataCollection.filter(
        dp => dp.goalId === goalId
      );
      allDataPoints.push(...goalDataPoints);
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
          dailyHighlights: [],
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
    
    // Update the student with all fields, ensuring birthday fields are preserved
    const currentStudent = unifiedData.students[studentIndex];
    const updatedStudent = {
      ...currentStudent,
      ...updates,
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
      allowPhotoInCelebrations: updatedStudent.allowPhotoInCelebrations
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
        console.log('🎂 Birthday data verified:', {
          birthday: updatedStudentVerification.birthday,
          allowBirthdayDisplay: updatedStudentVerification.allowBirthdayDisplay,
          allowPhotoInCelebrations: updatedStudentVerification.allowPhotoInCelebrations
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
    const students = this.getAllStudents();
    const student = students.find(s => s.id === studentId);
    
    if (student) {
      const newGoal: IEPGoal = {
        ...goal,
        id: Date.now().toString(),
        studentId: studentId
      };
      
      student.iepData.goals.push(newGoal);
      this.saveStudents(students);
      return newGoal;
    }
    
    throw new Error('Student not found');
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
    const students = this.getAllStudents();
    const student = students.find(s => s.id === dataPoint.studentId);
    
    if (student) {
      const newDataPoint: DataPoint = {
        ...dataPoint,
        id: Date.now().toString()
      };
      
      student.iepData.dataCollection.push(newDataPoint);
      this.saveStudents(students);
      return newDataPoint;
    }
    
    throw new Error('Student not found');
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
        dailyHighlights: [],
        independentChoices: []
      },
      settings: currentData?.settings || {},
      metadata: {
        version: '2.0',
        migratedAt: new Date().toISOString(),
        totalGoals: students.reduce((total, s) => total + s.iepData.goals.length, 0),
        totalDataPoints: students.reduce((total, s) => total + s.iepData.dataCollection.length, 0),
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
        currentData.calendar = { behaviorCommitments: [], dailyHighlights: [], independentChoices: [] };
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
  
  // Get daily highlights
  static getDailyHighlights(studentId?: string): DailyHighlight[] {
    const unifiedData = this.getUnifiedData();
    const highlights = unifiedData?.calendar?.dailyHighlights || [];
    
    if (studentId) {
      return highlights.filter(h => h.studentId === studentId);
    }
    
    return highlights;
  }
  
  // Add daily highlight
  static addDailyHighlight(highlight: Omit<DailyHighlight, 'id'>): DailyHighlight {
    const highlights = this.getDailyHighlights();
    const newHighlight: DailyHighlight = {
      ...highlight,
      id: Date.now().toString()
    };
    
    highlights.push(newHighlight);
    this.saveDailyHighlights(highlights);
    return newHighlight;
  }
  
  // Save daily highlights
  private static saveDailyHighlights(highlights: DailyHighlight[]): void {
    const currentData = this.getUnifiedData();
    if (currentData) {
      if (!currentData.calendar) {
        currentData.calendar = { behaviorCommitments: [], dailyHighlights: [], independentChoices: [] };
      }
      currentData.calendar.dailyHighlights = highlights;
      this.saveUnifiedData(currentData);
    }
  }
  
  // Get legacy daily highlights
  private static getLegacyDailyHighlights(): DailyHighlight[] {
    try {
      const legacy = localStorage.getItem('daily_highlights');
      if (legacy) {
        const data = JSON.parse(legacy);
        return Object.entries(data).flatMap(([studentId, highlights]: [string, any]) =>
          (highlights || []).map((h: any) => ({
            id: h.id || Date.now().toString(),
            studentId: studentId,
            highlight: h.highlight || h.text || '',
            date: h.date || new Date().toISOString().split('T')[0],
            category: h.category || 'achievement',
            notes: h.notes
          }))
        );
      }
    } catch (error) {
      console.error('Error reading legacy daily highlights:', error);
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
        currentData.calendar = { behaviorCommitments: [], dailyHighlights: [], independentChoices: [] };
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
  
  // Get settings
  static getSettings(): any {
    const unifiedData = this.getUnifiedData();
    if (unifiedData?.settings) {
      return unifiedData.settings;
    }
    
    // Fallback to legacy settings
    try {
      const legacySettings = localStorage.getItem('visualScheduleBuilderSettings');
      return legacySettings ? JSON.parse(legacySettings) : {};
    } catch (error) {
      console.error('Error reading legacy settings:', error);
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
            dailyHighlights: [],
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
      unifiedData.calendar.dailyHighlights = this.getLegacyDailyHighlights();
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
  
  // Check if system is using unified data
  static isUsingUnifiedData(): boolean {
    return this.getUnifiedData() !== null;
  }
  
  // Get system status
  static getSystemStatus(): {
    hasUnifiedData: boolean;
    hasLegacyData: boolean;
    totalStudents: number;
    totalGoals: number;
    totalDataPoints: number;
  } {
    const unifiedData = this.getUnifiedData();
    const legacyStudents = localStorage.getItem('students');
    
    if (unifiedData) {
      // Handle students as array within the unified data object
      const studentCount = Array.isArray(unifiedData.students) ? unifiedData.students.length : 0;
      
      return {
        hasUnifiedData: true,
        hasLegacyData: legacyStudents !== null,
        totalStudents: studentCount,
        totalGoals: unifiedData.metadata?.totalGoals || 0,
        totalDataPoints: unifiedData.metadata?.totalDataPoints || 0
      };
    }
    
    return {
      hasUnifiedData: false,
      hasLegacyData: legacyStudents !== null,
      totalStudents: legacyStudents ? JSON.parse(legacyStudents).length : 0,
      totalGoals: 0,
      totalDataPoints: 0
    };
  }
}

export default UnifiedDataService;

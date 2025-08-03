// Unified Data Service - Single source of truth for all student data
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


export interface UnifiedData {
  students: UnifiedStudent[];
  metadata: {
    version: string;
    migratedAt: string;
    totalGoals: number;
    totalDataPoints: number;
  };
}

class UnifiedDataService {
  private static readonly UNIFIED_KEY = 'vsb_unified_data';
  private static readonly LEGACY_STUDENT_KEY = 'students';
  
  // Get all unified data
  static getUnifiedData(): UnifiedData | null {
    try {
      const data = localStorage.getItem(this.UNIFIED_KEY);
      return data ? JSON.parse(data) : null;
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
  
  // Get all students with full data
  static getAllStudents(): UnifiedStudent[] {
    const unifiedData = this.getUnifiedData();
    if (unifiedData) {
      return unifiedData.students;
    }
    
    // Fallback to legacy data if unified doesn't exist
    return this.getLegacyStudents();
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
    const students = this.getAllStudents();
    const newStudent: UnifiedStudent = {
      id: studentData.id || Date.now().toString(),
      name: studentData.name || '',
      grade: studentData.grade || '',
      photo: studentData.photo,
      dateCreated: new Date().toISOString().split('T')[0],
      iepData: {
        goals: [],
        dataCollection: []
      },
      ...studentData
    };
    
    students.push(newStudent);
    this.saveStudents(students);
    return newStudent;
  }
  
  // Update student
  static updateStudent(studentId: string, updates: Partial<UnifiedStudent>): void {
    const students = this.getAllStudents();
    const index = students.findIndex(s => s.id === studentId);
    
    if (index !== -1) {
      students[index] = { ...students[index], ...updates };
      this.saveStudents(students);
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
      
      // Note: Goal progress tracking would need to be implemented separately
      // as the IEPGoal interface doesn't include progress tracking properties
      
      this.saveStudents(students);
      return newDataPoint;
    }
    
    throw new Error('Student not found');
  }
  
  // Save all students to unified data
  private static saveStudents(students: UnifiedStudent[]): void {
    const unifiedData: UnifiedData = {
      students: students,
      metadata: {
        version: '2.0',
        migratedAt: new Date().toISOString(),
        totalGoals: students.reduce((total, s) => total + s.iepData.goals.length, 0),
        totalDataPoints: students.reduce((total, s) => total + s.iepData.dataCollection.length, 0)
      }
    };
    
    this.saveUnifiedData(unifiedData);
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
    const legacyStudents = localStorage.getItem(this.LEGACY_STUDENT_KEY);
    
    if (unifiedData) {
      return {
        hasUnifiedData: true,
        hasLegacyData: legacyStudents !== null,
        totalStudents: unifiedData.students.length,
        totalGoals: unifiedData.metadata.totalGoals,
        totalDataPoints: unifiedData.metadata.totalDataPoints
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

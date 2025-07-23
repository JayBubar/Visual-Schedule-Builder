// src/renderer/utils/dataStore.ts
// Data persistence utilities using Electron Store

import { Student, Staff, StudentGroup, ScheduleActivity, ActivityAssignment, Schedule } from '../types';



export interface AppSettings {
  theme: 'light' | 'dark' | 'high-contrast';
  autoSave: boolean;
  backupEnabled: boolean;
  backupLocation?: string;
  defaultDuration: number;
  timeFormat: '12' | '24';
  soundEnabled: boolean;
  notificationSettings: {
    fiveMinuteWarning: boolean;
    oneMinuteWarning: boolean;
    completionAlert: boolean;
  };
  displaySettings: {
    showPhotos: boolean;
    showNotes: boolean;
    fullScreenMode: boolean;
  };
  privacySettings: {
    requirePasswordForStudentData: boolean;
    autoDeleteOldData: boolean;
    dataRetentionDays: number;
  };
}

export interface AppData {
  staff: Staff[];
  students: Student[];
  groups: StudentGroup[];
  activities: ScheduleActivity[];
  schedules: Schedule[];
  settings: AppSettings;
  lastBackup?: string;
  version: string;
}

// Data Store Class
class DataStore {
  private data: AppData;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.data = this.getDefaultData();
    this.loadData();
  }

  private getDefaultData(): AppData {
    return {
      staff: [],
      students: [],
      groups: [],
      activities: this.getDefaultActivities(),
      schedules: [],
      settings: this.getDefaultSettings(),
      version: '1.0.0'
    };
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: 'light',
      autoSave: true,
      backupEnabled: false,
      defaultDuration: 30,
      timeFormat: '12',
      soundEnabled: true,
      notificationSettings: {
        fiveMinuteWarning: true,
        oneMinuteWarning: true,
        completionAlert: true
      },
      displaySettings: {
        showPhotos: true,
        showNotes: true,
        fullScreenMode: false
      },
      privacySettings: {
        requirePasswordForStudentData: false,
        autoDeleteOldData: false,
        dataRetentionDays: 365
      }
    };
  }

  private getDefaultActivities(): ScheduleActivity[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'default-1',
        name: 'Morning Meeting',
        icon: '🌅',
        category: 'routine',
        duration: 15,
        description: 'Circle time and calendar review',
        isCustom: false,
        tags: ['routine', 'group', 'social'],
        difficulty: 'easy',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-2',
        name: 'Reading',
        icon: '📚',
        category: 'academic',
        duration: 30,
        description: 'Guided reading and literacy activities',
        isCustom: false,
        tags: ['academic', 'literacy', 'small-group'],
        difficulty: 'medium',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-3',
        name: 'Math',
        icon: '🔢',
        category: 'academic',
        duration: 45,
        description: 'Mathematics instruction and practice',
        isCustom: false,
        tags: ['academic', 'math', 'whole-group'],
        difficulty: 'medium',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-4',
        name: 'Speech Therapy',
        icon: '🗣️',
        category: 'therapy',
        duration: 20,
        description: 'Individual speech and language therapy',
        isCustom: false,
        tags: ['therapy', 'individual', 'communication'],
        difficulty: 'hard',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-5',
        name: 'Art',
        icon: '🎨',
        category: 'special',
        duration: 30,
        description: 'Creative arts and crafts activities',
        isCustom: false,
        tags: ['creative', 'fine-motor', 'expression'],
        difficulty: 'easy',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-6',
        name: 'Physical Education',
        icon: '🏃',
        category: 'special',
        duration: 30,
        description: 'Physical activity and movement',
        isCustom: false,
        tags: ['physical', 'gross-motor', 'health'],
        difficulty: 'medium',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-7',
        name: 'Lunch',
        icon: '🍽️',
        category: 'break',
        duration: 30,
        description: 'Lunch and social time',
        isCustom: false,
        tags: ['break', 'social', 'nutrition'],
        difficulty: 'easy',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-8',
        name: 'Quiet Time',
        icon: '🧘',
        category: 'break',
        duration: 15,
        description: 'Rest and sensory break',
        isCustom: false,
        tags: ['break', 'sensory', 'regulation'],
        difficulty: 'easy',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-9',
        name: 'Science',
        icon: '🔬',
        category: 'academic',
        duration: 30,
        description: 'Science exploration and experiments',
        isCustom: false,
        tags: ['academic', 'science', 'hands-on'],
        difficulty: 'medium',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-10',
        name: 'Social Skills',
        icon: '🤝',
        category: 'therapy',
        duration: 25,
        description: 'Social interaction and communication practice',
        isCustom: false,
        tags: ['therapy', 'social', 'communication'],
        difficulty: 'hard',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-11',
        name: 'Occupational Therapy',
        icon: '✋',
        category: 'therapy',
        duration: 30,
        description: 'Fine motor and sensory activities',
        isCustom: false,
        tags: ['therapy', 'fine-motor', 'sensory'],
        difficulty: 'medium',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-12',
        name: 'Music',
        icon: '🎵',
        category: 'special',
        duration: 25,
        description: 'Music and rhythm activities',
        isCustom: false,
        tags: ['creative', 'auditory', 'expression'],
        difficulty: 'easy',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-13',
        name: 'Transition Time',
        icon: '🚶',
        category: 'routine',
        duration: 5,
        description: 'Movement between activities',
        isCustom: false,
        tags: ['routine', 'transition', 'movement'],
        difficulty: 'easy',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-14',
        name: 'Computer/Technology',
        icon: '💻',
        category: 'academic',
        duration: 20,
        description: 'Educational technology activities',
        isCustom: false,
        tags: ['technology', 'academic', 'individual'],
        difficulty: 'medium',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-15',
        name: 'Free Choice',
        icon: '🎲',
        category: 'break',
        duration: 15,
        description: 'Student-directed activity time',
        isCustom: false,
        tags: ['choice', 'independent', 'motivation'],
        difficulty: 'easy',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'default-16',
        name: 'Snack Time',
        icon: '🍎',
        category: 'break',
        duration: 10,
        description: 'Snack and hydration break',
        isCustom: false,
        tags: ['break', 'nutrition', 'social'],
        difficulty: 'easy',
        createdAt: now,
        updatedAt: now
      }
    ];
  }

  private loadData(): void {
    try {
      // In a real Electron app, this would use electron-store
      // For now, we'll use localStorage as a fallback
      const stored = localStorage.getItem('visual-schedule-builder-data');
      if (stored) {
        const parsedData = JSON.parse(stored);
        this.data = { ...this.data, ...parsedData };
        
        // Ensure default activities are always available
        if (this.data.activities.length === 0) {
          this.data.activities = this.getDefaultActivities();
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.data = this.getDefaultData();
    }
  }

  private saveData(): void {
    try {
      this.data.version = '1.0.0';
      localStorage.setItem('visual-schedule-builder-data', JSON.stringify(this.data));
      
      if (this.data.settings.autoSave) {
        console.log('Data auto-saved successfully');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Public API methods

  // Staff Management
  getStaff(): Staff[] {
    return [...this.data.staff];
  }

  addStaff(staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Staff {
    const now = new Date().toISOString();
    const newStaff: Staff = {
      ...staff,
      id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };
    
    this.data.staff.push(newStaff);
    this.saveData();
    return newStaff;
  }

  updateStaff(id: string, updates: Partial<Staff>): Staff | null {
    const index = this.data.staff.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.data.staff[index] = {
      ...this.data.staff[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    this.saveData();
    return this.data.staff[index];
  }

  deleteStaff(id: string): boolean {
    const index = this.data.staff.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.data.staff.splice(index, 1);
    this.saveData();
    return true;
  }

  // Student Management
  getStudents(): Student[] {
    return [...this.data.students];
  }

  addStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Student {
    const now = new Date().toISOString();
    const newStudent: Student = {
      ...student,
      id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };
    
    this.data.students.push(newStudent);
    this.saveData();
    return newStudent;
  }

  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const index = this.data.students.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.data.students[index] = {
      ...this.data.students[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.saveData();
    return this.data.students[index];
  }

  deleteStudent(id: string): boolean {
    const index = this.data.students.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.data.students.splice(index, 1);
    this.saveData();
    return true;
  }

  // Group Management
  getGroups(): StudentGroup[] {
    return [...this.data.groups];
  }

  addGroup(group: Omit<StudentGroup, 'id' | 'createdAt' | 'updatedAt'>): StudentGroup {
    const now = new Date().toISOString();
    const newGroup: StudentGroup = {
      ...group,
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };
    
    this.data.groups.push(newGroup);
    this.saveData();
    return newGroup;
  }

  updateGroup(id: string, updates: Partial<StudentGroup>): StudentGroup | null {
    const index = this.data.groups.findIndex(g => g.id === id);
    if (index === -1) return null;

    this.data.groups[index] = {
      ...this.data.groups[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.saveData();
    return this.data.groups[index];
  }

  deleteGroup(id: string): boolean {
    const index = this.data.groups.findIndex(g => g.id === id);
    if (index === -1) return false;

    this.data.groups.splice(index, 1);
    this.saveData();
    return true;
  }

  // Activity Management
  getActivities(): ScheduleActivity[] {
    return [...this.data.activities];
  }

  addActivity(activity: Omit<ScheduleActivity, 'id' | 'createdAt' | 'updatedAt'>): ScheduleActivity {
    const now = new Date().toISOString();
    const newActivity: ScheduleActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };
    
    this.data.activities.push(newActivity);
    this.saveData();
    return newActivity;
  }

  updateActivity(id: string, updates: Partial<ScheduleActivity>): ScheduleActivity | null {
    const index = this.data.activities.findIndex(a => a.id === id);
    if (index === -1) return null;

    this.data.activities[index] = {
      ...this.data.activities[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.saveData();
    return this.data.activities[index];
  }

  deleteActivity(id: string): boolean {
    const index = this.data.activities.findIndex(a => a.id === id);
    if (index === -1) return false;

    this.data.activities.splice(index, 1);
    this.saveData();
    return true;
  }

  // Schedule Management
  getSchedules(): Schedule[] {
    return [...this.data.schedules];
  }

  addSchedule(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Schedule {
    const now = new Date().toISOString();
    const newSchedule: Schedule = {
      ...schedule,
      id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };
    
    this.data.schedules.push(newSchedule);
    this.saveData();
    return newSchedule;
  }

  updateSchedule(id: string, updates: Partial<Schedule>): Schedule | null {
    const index = this.data.schedules.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.data.schedules[index] = {
      ...this.data.schedules[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.saveData();
    return this.data.schedules[index];
  }

  deleteSchedule(id: string): boolean {
    const index = this.data.schedules.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.data.schedules.splice(index, 1);
    this.saveData();
    return true;
  }

  // Settings Management
  getSettings(): AppSettings {
    return { ...this.data.settings };
  }

  updateSettings(updates: Partial<AppSettings>): AppSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates
    };
    
    this.saveData();
    return this.data.settings;
  }

  // Utility Methods
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData);
      
      // Validate the imported data structure
      if (importedData.staff && importedData.students && importedData.activities) {
        this.data = { ...this.data, ...importedData };
        this.saveData();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  clearAllData(): void {
    this.data = this.getDefaultData();
    this.saveData();
  }

  getDataStats() {
    return {
      staff: this.data.staff.length,
      students: this.data.students.length,
      groups: this.data.groups.length,
      activities: this.data.activities.length,
      schedules: this.data.schedules.length,
      lastSaved: localStorage.getItem('visual-schedule-builder-last-save'),
      dataSize: new Blob([JSON.stringify(this.data)]).size
    };
  }
}

// Create and export singleton instance
export const dataStore = new DataStore();
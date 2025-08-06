import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for student status management
export interface StudentStatus {
  studentId: string;
  isPresent: boolean;
  date: string;
  notes?: string;
}

export interface StudentStatusContextType {
  studentStatuses: StudentStatus[];
  absentStudents: string[];
  updateStudentStatus: (studentId: string, isPresent: boolean, notes?: string) => void;
  filterActiveStudents: (students: any[]) => any[];
  getTodayAttendance: () => StudentStatus[];
  resetDailyAttendance: () => void;
}

const StudentStatusContext = createContext<StudentStatusContextType | undefined>(undefined);

export const useStudentStatus = () => {
  const context = useContext(StudentStatusContext);
  if (!context) {
    throw new Error('useStudentStatus must be used within a StudentStatusProvider');
  }
  return context;
};

interface StudentStatusProviderProps {
  children: ReactNode;
  allStudents: any[];
}

export const StudentStatusProvider: React.FC<StudentStatusProviderProps> = ({ 
  children, 
  allStudents 
}) => {
  const [studentStatuses, setStudentStatuses] = useState<StudentStatus[]>([]);

  // Get today's date string
  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Load attendance data on mount and when date changes
  useEffect(() => {
    const today = getTodayDateString();
    const attendanceKey = `attendance-${today}`;
    
    try {
      const savedAttendance = localStorage.getItem(attendanceKey);
      if (savedAttendance) {
        const parsed = JSON.parse(savedAttendance);
        setStudentStatuses(parsed);
        console.log(`📋 Loaded attendance for ${today}:`, parsed.length, 'records');
      } else {
        // Initialize with all students present by default
        const initialStatuses = allStudents.map(student => ({
          studentId: student.id,
          isPresent: true,
          date: today,
          notes: ''
        }));
        setStudentStatuses(initialStatuses);
        localStorage.setItem(attendanceKey, JSON.stringify(initialStatuses));
        console.log(`📋 Initialized attendance for ${today}:`, initialStatuses.length, 'students');
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
      // Fallback to all present
      const fallbackStatuses = allStudents.map(student => ({
        studentId: student.id,
        isPresent: true,
        date: today,
        notes: ''
      }));
      setStudentStatuses(fallbackStatuses);
    }
  }, [allStudents]);

  // Clean up old attendance data (keep last 30 days)
  useEffect(() => {
    const cleanupOldAttendance = () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('attendance-')) {
          const dateStr = key.replace('attendance-', '');
          const date = new Date(dateStr);
          if (date < thirtyDaysAgo) {
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🧹 Cleaned up old attendance data: ${key}`);
      });
    };

    cleanupOldAttendance();
  }, []);

  // Update student attendance status
  const updateStudentStatus = (studentId: string, isPresent: boolean, notes?: string) => {
    const today = getTodayDateString();
    
    setStudentStatuses(prev => {
      const updated = prev.map(status => 
        status.studentId === studentId 
          ? { ...status, isPresent, notes: notes || '', date: today }
          : status
      );
      
      // If student not found, add new record
      if (!updated.find(s => s.studentId === studentId)) {
        updated.push({
          studentId,
          isPresent,
          date: today,
          notes: notes || ''
        });
      }
      
      // Save to localStorage
      const attendanceKey = `attendance-${today}`;
      localStorage.setItem(attendanceKey, JSON.stringify(updated));
      
      console.log(`📋 Updated attendance for student ${studentId}: ${isPresent ? 'Present' : 'Absent'}`);
      return updated;
    });
  };

  // Get list of absent student IDs
  const absentStudents = studentStatuses
    .filter(status => !status.isPresent && status.date === getTodayDateString())
    .map(status => status.studentId);

  // Filter out absent students from any student array
  const filterActiveStudents = (students: any[]) => {
    return students.filter(student => !absentStudents.includes(student.id));
  };

  // Get today's attendance records
  const getTodayAttendance = () => {
    const today = getTodayDateString();
    return studentStatuses.filter(status => status.date === today);
  };

  // Reset daily attendance (set all to present)
  const resetDailyAttendance = () => {
    const today = getTodayDateString();
    const resetStatuses = allStudents.map(student => ({
      studentId: student.id,
      isPresent: true,
      date: today,
      notes: ''
    }));
    
    setStudentStatuses(resetStatuses);
    const attendanceKey = `attendance-${today}`;
    localStorage.setItem(attendanceKey, JSON.stringify(resetStatuses));
    
    console.log(`📋 Reset attendance for ${today}: All students marked present`);
  };

  const contextValue: StudentStatusContextType = {
    studentStatuses,
    absentStudents,
    updateStudentStatus,
    filterActiveStudents,
    getTodayAttendance,
    resetDailyAttendance
  };

  return (
    <StudentStatusContext.Provider value={contextValue}>
      {children}
    </StudentStatusContext.Provider>
  );
};

export default StudentStatusProvider;

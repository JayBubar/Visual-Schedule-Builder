// File: src/renderer/hooks/useStudentData.ts
import { useState, useEffect } from 'react';
import { Student } from '../types';

export const useStudentData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = () => {
    try {
      const savedStudents = localStorage.getItem('students');
      const studentData = savedStudents ? JSON.parse(savedStudents) : [];
      setStudents(studentData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();

    // Listen for student updates from other components
    const handleStudentUpdate = (event: CustomEvent) => {
      setStudents(event.detail);
      setLoading(false);
    };

    window.addEventListener('studentDataUpdated', handleStudentUpdate as EventListener);
    
    return () => {
      window.removeEventListener('studentDataUpdated', handleStudentUpdate as EventListener);
    };
  }, []);

  const getStudentById = (id: string): Student | undefined => {
    return students.find(s => s.id === id);
  };

  const getActiveStudents = (): Student[] => {
    return students.filter(s => s.isActive !== false); // Default to active if not specified
  };

  const getStudentsByGrade = (grade: string): Student[] => {
    return students.filter(s => s.grade === grade);
  };

  const getStudentsWithIEP = (): Student[] => {
    return students.filter(s => s.iep === true);
  };

  return {
    students,
    loading,
    getStudentById,
    getActiveStudents,
    getStudentsByGrade,
    getStudentsWithIEP,
    refreshStudents: loadStudents
  };
};

// Export function to get student data synchronously (for existing code compatibility)
export const getStudentData = (): Student[] => {
  try {
    const savedStudents = localStorage.getItem('students');
    return savedStudents ? JSON.parse(savedStudents) : [];
  } catch (error) {
    console.error('Error getting student data:', error);
    return [];
  }
};
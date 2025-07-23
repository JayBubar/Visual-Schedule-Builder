// File: src/renderer/hooks/useStaffData.ts
import { useState, useEffect } from 'react';
import { StaffMember } from '../types';

export const useStaffData = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStaff = () => {
    try {
      const savedStaff = localStorage.getItem('staff_members');
      const staffData = savedStaff ? JSON.parse(savedStaff) : [];
      setStaff(staffData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading staff:', error);
      setStaff([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();

    // Listen for staff updates from other components
    const handleStaffUpdate = (event: CustomEvent) => {
      setStaff(event.detail);
      setLoading(false);
    };

    window.addEventListener('staffDataUpdated', handleStaffUpdate as EventListener);
    
    return () => {
      window.removeEventListener('staffDataUpdated', handleStaffUpdate as EventListener);
    };
  }, []);

  const getStaffById = (id: string): StaffMember | undefined => {
    return staff.find(s => s.id === id);
  };

  const getActiveStaff = (): StaffMember[] => {
    return staff.filter(s => s.isActive);
  };

  return {
    staff,
    loading,
    getStaffById,
    getActiveStaff,
    refreshStaff: loadStaff
  };
};

// Export function to get staff data synchronously (for existing code compatibility)
export const getStaffData = (): StaffMember[] => {
  try {
    const savedStaff = localStorage.getItem('staff_members');
    return savedStaff ? JSON.parse(savedStaff) : [];
  } catch (error) {
    console.error('Error getting staff data:', error);
    return [];
  }
};
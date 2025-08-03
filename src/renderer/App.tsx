// 🚀 Visual Schedule Builder - Main Application Component
// File: src/renderer/App.tsx - FIXED TO MATCH ACTUAL COMPONENT INTERFACES

import React, { useState, useEffect, useMemo } from 'react';
import { ViewType, ScheduleVariation, Student, Staff, ActivityLibraryItem, ScheduleActivity, EnhancedActivity, GroupAssignment } from './types';
import { loadFromStorage, saveToStorage } from './utils/storage';
import Navigation from './components/common/Navigation';
import ScheduleBuilder from './components/builder/ScheduleBuilder';
import SmartboardDisplay from './components/display/SmartboardDisplay';
import StudentManagement from './components/management/StudentManagement';
import StaffManagement from './components/management/StaffManagement';
import DailyCheckIn from './components/calendar/DailyCheckIn';
import ActivityLibrary from './components/common/ActivityLibrary';
import IEPDataCollectionInterface from './components/data-collection/IEPDataCollectionInterface';
import Reports from './components/reports/Reports';
import Settings from './components/management/Settings';
import ReportsExportSystem from './components/data-collection/ReportsExportSystem';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('builder');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleVariation | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [activities, setActivities] = useState<ActivityLibraryItem[]>([]);

  useEffect(() => {
    const savedStudents = loadFromStorage<Student[]>('vsb_students', []);
    const savedStaff = loadFromStorage<Staff[]>('vsb_staff', []);
    const savedActivities = loadFromStorage<ActivityLibraryItem[]>('vsb_activities', []);
    
    setStudents(savedStudents);
    setStaff(savedStaff);
    setActivities(savedActivities);
    
    console.log('App initialized with data:', {
      students: savedStudents.length,
      staff: savedStaff.length,
      activities: savedActivities.length
    });
  }, []);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    console.log('View changed to:', view);
  };

  const handleScheduleSelect = (schedule: ScheduleVariation) => {
    setSelectedSchedule(schedule);
    console.log('Schedule selected:', schedule.name);
  };

  const handleStudentsUpdate = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
    saveToStorage('vsb_students', updatedStudents);
  };

  const handleStaffUpdate = (updatedStaff: Staff[]) => {
    setStaff(updatedStaff);
    saveToStorage('vsb_staff', updatedStaff);
  };

  const handleActivitiesUpdate = (updatedActivities: ActivityLibraryItem[]) => {
    setActivities(updatedActivities);
    saveToStorage('vsb_activities', updatedActivities);
  };

  // Convert Staff[] to StaffMember[] for components that expect StaffMember
  const staffMembers = useMemo(() => {
    return staff.map(member => ({
      ...member,
      email: member.email || '', // Ensure required email field
      phone: member.phone || '', // Ensure required phone field
      specialties: member.specialties || [], // Ensure required specialties field
      photo: member.photo || null, // Ensure required photo field (can be null)
      isActive: member.isActive ?? true, // Ensure required isActive field
      startDate: member.startDate || new Date().toISOString(), // Ensure required startDate field
      isResourceTeacher: member.isResourceTeacher ?? false, // Ensure required field
      isRelatedArtsTeacher: member.isRelatedArtsTeacher ?? false // Ensure required field
    }));
  }, [staff]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            handleViewChange('builder');
            break;
          case '2':
            event.preventDefault();
            handleViewChange('display');
            break;
          case '3':
            event.preventDefault();
            handleViewChange('students');
            break;
          case '4':
            event.preventDefault();
            handleViewChange('staff');
            break;
          case '5':
            event.preventDefault();
            handleViewChange('calendar');
            break;
          case '6':
            event.preventDefault();
            handleViewChange('library');
            break;
          case '7':
            event.preventDefault();
            handleViewChange('data-collection');
            break;
          case '8':
            event.preventDefault();
            handleViewChange('reports');
            break;
          case '9':
            event.preventDefault();
            handleViewChange('settings');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <Navigation 
        currentView={currentView} 
        onViewChange={handleViewChange}
        selectedSchedule={selectedSchedule}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Schedule Builder */}
        {currentView === 'builder' && (
          <ScheduleBuilder 
            isActive={true}
          />
        )}

        {/* Smartboard Display */}
        {currentView === 'display' && (
          <SmartboardDisplay
            isActive={true}
            students={students}
            staff={staffMembers}
            currentSchedule={selectedSchedule ? {
              activities: selectedSchedule.activities,
              startTime: selectedSchedule.startTime,
              name: selectedSchedule.name
            } : undefined}
          />
        )}

        {/* Student Management */}
        {currentView === 'students' && (
          <StudentManagement 
            isActive={true}
          />
        )}

        {/* Staff Management */}
        {currentView === 'staff' && (
          <StaffManagement 
            isActive={true}
          />
        )}

        {/* Daily Check-In Calendar */}
        {currentView === 'calendar' && (
          <DailyCheckIn 
            isActive={true}
            students={students}
            staff={staffMembers}
          />
        )}

        {/* Activity Library */}
        {currentView === 'library' && (
          <ActivityLibrary 
            isActive={true}
          />
        )}

        {/* Data Collection - IEP System */}
        {currentView === 'data-collection' && (
          <IEPDataCollectionInterface 
            isActive={true}
          />
        )}

        {/* Reports */}
        {currentView === 'reports' && (
          <Reports 
            isActive={true}
            students={students}
            staff={staffMembers}
            activities={activities}
          />
        )}

        {/* Settings */}
        {currentView === 'settings' && (
          <Settings 
            isActive={true}
          />
        )}
      </div>
    </div>
  );
};

export default App;

<style>
  {`
    .app {
      min-height: 100vh;
      max-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .main-content {
      flex: 1;
      overflow: auto;
      min-height: 0;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
  `}
</style>
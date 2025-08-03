// 🚀 Visual Schedule Builder - Main Application Component
// File: src/renderer/App.tsx - FIXED TO MATCH ACTUAL COMPONENT INTERFACES

import React, { useState, useEffect, useMemo } from 'react';
import { ViewType, ScheduleVariation, Student, Staff, ActivityLibraryItem, ScheduleActivity, EnhancedActivity, GroupAssignment } from './types';
import { loadFromStorage, saveToStorage } from './utils/storage';
import { DataMigrationManager } from './utils/dataMigration';
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
import DataMigrationInterface from './components/migration/DataMigrationInterface';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('builder');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleVariation | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [activities, setActivities] = useState<ActivityLibraryItem[]>([]);
  const [showMigrationInterface, setShowMigrationInterface] = useState(false);
  const [migrationChecked, setMigrationChecked] = useState(false);

  useEffect(() => {
    // Check if migration is needed on app startup
    const checkMigration = async () => {
      try {
        const isMigrationNeeded = DataMigrationManager.isMigrationNeeded();
        if (isMigrationNeeded) {
          setShowMigrationInterface(true);
          console.log('🔄 Migration needed - showing migration interface');
        } else {
          console.log('✅ Data migration not needed or already completed');
        }
      } catch (error) {
        console.error('Error checking migration status:', error);
      } finally {
        setMigrationChecked(true);
      }
    };

    checkMigration();

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

  const handleMigrationComplete = (success: boolean) => {
    if (success) {
      setShowMigrationInterface(false);
      // Refresh the page to reload with unified data
      window.location.reload();
    } else {
      console.error('Migration failed');
      // Keep the migration interface open for retry
    }
  };

  const handleCloseMigration = () => {
    setShowMigrationInterface(false);
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
      {/* Migration Interface Overlay */}
      {showMigrationInterface && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <button
              onClick={handleCloseMigration}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(107, 114, 128, 0.1)',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: '#6b7280',
                zIndex: 1
              }}
              title="Close (migration can be accessed later from Settings)"
            >
              ×
            </button>
            <DataMigrationInterface onMigrationComplete={handleMigrationComplete} />
          </div>
        </div>
      )}

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

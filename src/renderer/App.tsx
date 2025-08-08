// 🚀 Visual Schedule Builder - Main Application Component
// File: src/renderer/App.tsx - FIXED TO MATCH ACTUAL COMPONENT INTERFACES

import React, { useState, useEffect, useMemo } from 'react';
import { ViewType, ScheduleVariation, Student, Staff, ActivityLibraryItem, ScheduleActivity, EnhancedActivity, GroupAssignment } from './types';
import { loadFromStorage, saveToStorage } from './utils/storage';
import UnifiedDataService from './services/unifiedDataService';
import { DataMigrationManager } from './utils/dataMigration';
import { ResourceScheduleProvider } from './services/ResourceScheduleManager';
import StartScreen from './components/common/StartScreen';
import Navigation from './components/common/Navigation';
import ScheduleBuilder from './components/builder/ScheduleBuilder';
import SmartboardDisplay from './components/display/SmartboardDisplay';
import StudentManagement from './components/management/StudentManagement';
import StaffManagement from './components/management/StaffManagement';
import DailyCheckIn from './components/calendar/DailyCheckIn';
import ActivityLibrary from './components/common/ActivityLibrary';
import Reports from './components/reports/Reports';
import Settings from './components/management/Settings';
import ReportsExportSystem from './components/data-collection/ReportsExportSystem';

const App: React.FC = () => {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('builder');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleVariation | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [activities, setActivities] = useState<ActivityLibraryItem[]>([]);

  useEffect(() => {
    try {
      // Force migration check and execution
      console.log('🔄 Checking for migration need...');
      
      if (DataMigrationManager.isMigrationNeeded()) {
        console.log('⚡ Migration needed - starting migration...');
        const migrationResult = DataMigrationManager.migrateToUnifiedArchitecture();
        
        migrationResult.then(result => {
          if (result.success) {
            console.log('✅ Migration successful!');
            console.log('- Migrated students:', result.migratedStudents);
            console.log('- Preserved data points:', result.preservedDataPoints);
          } else {
            console.error('❌ Migration failed:', result.errors);
            // You might want to show a user-friendly error here
          }
        });
      } else {
        console.log('ℹ️ No migration needed');
      }
      
      // 🔍 DETAILED DEBUGGING: Check what's actually in localStorage
      console.log('🔍 DEBUGGING localStorage contents:');
      console.log('- All localStorage keys:', Object.keys(localStorage));
      
      // Check specific keys
      const unifiedKey = 'visual-schedule-builder-unified-data';
      const legacyStudentKey = 'students';
      const vsbStudentKey = 'vsb_students';
      
      console.log(`- ${unifiedKey}:`, localStorage.getItem(unifiedKey) ? 'EXISTS' : 'MISSING');
      console.log(`- ${legacyStudentKey}:`, localStorage.getItem(legacyStudentKey) ? 'EXISTS' : 'MISSING');
      console.log(`- ${vsbStudentKey}:`, localStorage.getItem(vsbStudentKey) ? 'EXISTS' : 'MISSING');
      
      // Check unified data structure
      const unifiedDataRaw = localStorage.getItem(unifiedKey);
      if (unifiedDataRaw) {
        try {
          const unifiedData = JSON.parse(unifiedDataRaw);
          console.log('- Unified data structure:', {
            hasStudents: !!unifiedData.students,
            studentsType: Array.isArray(unifiedData.students) ? 'array' : typeof unifiedData.students,
            studentsLength: Array.isArray(unifiedData.students) ? unifiedData.students.length : 'N/A',
            studentsKeys: unifiedData.students ? Object.keys(unifiedData.students).slice(0, 5) : 'N/A'
          });
        } catch (e) {
          console.log('- Unified data parse error:', e);
        }
      }
      
      // Load from unified data service first
      const unifiedStudents = UnifiedDataService.getAllStudents();
      const unifiedStaff = UnifiedDataService.getAllStaff();
      const unifiedActivities = UnifiedDataService.getAllActivities();
      
      console.log('🔍 UnifiedDataService results:');
      console.log('- Students returned:', unifiedStudents.length);
      console.log('- Staff returned:', unifiedStaff.length);
      console.log('- Activities returned:', unifiedActivities.length);
      
      // Convert unified data to legacy format for components that still expect it
      const legacyStudents: Student[] = unifiedStudents.map(student => ({
        id: student.id,
        name: student.name,
        grade: student.grade || '',
        photo: student.photo,
        workingStyle: student.workingStyle as any,
        accommodations: student.accommodations || [],
        goals: student.goals || [],
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        isActive: student.isActive ?? true,
        behaviorNotes: student.behaviorNotes,
        medicalNotes: student.medicalNotes,
        preferredPartners: student.preferredPartners || [],
        avoidPartners: student.avoidPartners || []
      }));

      const legacyStaff: Staff[] = unifiedStaff.map(staff => ({
        id: staff.id,
        name: staff.name,
        role: staff.role,
        email: staff.email || '',
        phone: staff.phone || '',
        photo: staff.photo,
        isActive: staff.isActive ?? true,
        specialties: staff.specialties || [],
        notes: staff.notes,
        startDate: staff.dateCreated,
        isResourceTeacher: staff.isResourceTeacher ?? false,
        isRelatedArtsTeacher: staff.isRelatedArtsTeacher ?? false
      }));

      const legacyActivities: ActivityLibraryItem[] = unifiedActivities.map(activity => ({
        id: activity.id,
        name: activity.name,
        category: activity.category as any, // Cast to match ScheduleCategory
        description: activity.description || '',
        duration: activity.duration || 30,
        defaultDuration: activity.duration || 30,
        materials: activity.materials || [],
        instructions: activity.instructions || '',
        adaptations: activity.adaptations || [],
        isCustom: activity.isCustom,
        dateCreated: activity.dateCreated,
        emoji: '📚' // Default emoji for activities
      }));
      
      setStudents(legacyStudents);
      setStaff(legacyStaff);
      setActivities(legacyActivities);
      
      console.log('App initialized with unified data:', {
        students: legacyStudents.length,
        staff: legacyStaff.length,
        activities: legacyActivities.length
      });

      // 🐛 App Debug to verify the providers are working:
      console.log('🐛 App Debug:');
      console.log('- Students being passed to providers:', legacyStudents?.length || 0);
      console.log('- Students data:', legacyStudents?.slice(0, 2)); // First 2 students
      
    } catch (error) {
      console.error('Error loading unified data, falling back to legacy storage:', error);
      
      // Fallback to legacy storage if unified data fails
      const savedStudents = loadFromStorage<Student[]>('vsb_students', []);
      const savedStaff = loadFromStorage<Staff[]>('vsb_staff', []);
      const savedActivities = loadFromStorage<ActivityLibraryItem[]>('vsb_activities', []);
      
      setStudents(savedStudents);
      setStaff(savedStaff);
      setActivities(savedActivities);
      
      console.log('App initialized with legacy data:', {
        students: savedStudents.length,
        staff: savedStaff.length,
        activities: savedActivities.length
      });
    }
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

  // StartScreen handlers
  const handleStartMyDay = () => {
    setShowStartScreen(false);
    setCurrentView('calendar'); // Goes to Daily Check-In
  };

  const handleManageClassroom = () => {
    setShowStartScreen(false);
    setCurrentView('builder'); // Always go to Schedule Builder (main management interface)
  };

  const handleBackToStart = () => {
    setShowStartScreen(true);
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
            handleViewChange('reports');
            break;
          case '8':
            event.preventDefault();
            handleViewChange('settings');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 🚀 Handle "Use Built Schedule" event from Schedule Builder
  useEffect(() => {
    const handleUseBuiltSchedule = (event: CustomEvent) => {
      const { schedule, source, timestamp } = event.detail;
      console.log('🚀 App received useBuiltSchedule event:', {
        scheduleName: schedule.name,
        source,
        timestamp: new Date(timestamp).toLocaleTimeString(),
        activityCount: schedule.activities.length
      });
      
      // Set the temporary schedule as selected
      setSelectedSchedule(schedule);
      
      // Switch to Display mode immediately
      setCurrentView('display');
      
      console.log('✅ Switched to Display mode with temporary schedule');
    };

    window.addEventListener('useBuiltSchedule', handleUseBuiltSchedule as EventListener);
    
    return () => {
      window.removeEventListener('useBuiltSchedule', handleUseBuiltSchedule as EventListener);
    };
  }, []);

  return (
    <ResourceScheduleProvider allStudents={students.map(student => ({
      ...student,
      dateCreated: new Date().toISOString(), // Add required dateCreated field
      grade: student.grade || '',
      resourceInfo: student.resourceInfo || undefined
    }))}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Start Screen */}
        {showStartScreen && (
          <StartScreen 
            onStartMyDay={handleStartMyDay}
            onManageClassroom={handleManageClassroom}
          />
        )}

        {/* App Content - Only show when not on start screen */}
        {!showStartScreen && (
          <>
            {/* Navigation */}
            <Navigation 
              currentView={currentView} 
              onViewChange={handleViewChange}
              selectedSchedule={selectedSchedule}
              onBackToStart={handleBackToStart}
              isInDailyCheckIn={currentView === 'calendar'}
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
                selectedSchedule={selectedSchedule}
                onSwitchToScheduleBuilder={() => handleViewChange('builder')}
                onSwitchToDisplay={() => handleViewChange('display')}
              />
            )}

            {/* Activity Library */}
            {currentView === 'library' && (
              <ActivityLibrary 
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
          </>
        )}
        </div>
    </ResourceScheduleProvider>
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

import React, { useState, useEffect, useMemo } from 'react';
import Navigation from './components/common/Navigation';
import ScheduleBuilder from './components/builder/ScheduleBuilder';
import SmartboardDisplay from './components/display/SmartboardDisplay';
import ActivityLibrary from './components/common/ActivityLibrary';
import StudentManagement from './components/management/StudentManagement';
import StaffManagement from './components/management/StaffManagement';
import Settings from './components/management/Settings';
import CelebrationAnimations from './components/common/CelebrationAnimations';
import { useStaffData } from './hooks/useStaffData';
import { useStudentData } from './hooks/useStudentData';
import { ViewType, ScheduleVariation, Student, StaffMember } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('builder');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleVariation | null>(null);
  const [scheduleVariations, setScheduleVariations] = useState<ScheduleVariation[]>([]);
  
  // Use actual data from hooks (includes uploaded photos and real data)
  const { staff } = useStaffData();
  const { students } = useStudentData();

  // 🔧 CRITICAL FIX: Enhanced schedule loading with group preservation
  const loadScheduleVariations = () => {
    console.log('🔄 App.tsx - Loading schedule variations...');
    
    // Try multiple localStorage keys for maximum compatibility
    const possibleKeys = ['scheduleVariations', 'saved_schedules', 'schedules'];
    
    for (const key of possibleKeys) {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const variations: ScheduleVariation[] = JSON.parse(saved);
          console.log(`📋 Found ${variations.length} schedule variations in '${key}'`);
          
          // 🎯 CRITICAL: Preserve groupAssignments during load
          const preservedVariations = variations.map(variation => ({
            ...variation,
            activities: (variation.activities || []).map(activity => ({
              ...activity,
              // Ensure groupAssignments are preserved at top level
              groupAssignments: activity.groupAssignments || 
                               (activity.assignment as any)?.groupAssignments || 
                               []
            }))
          }));
          
          console.log('✅ Preserved group assignments:', preservedVariations.map(v => ({
            name: v.name,
            activitiesWithGroups: v.activities.filter(a => a.groupAssignments && a.groupAssignments.length > 0).length
          })));
          
          setScheduleVariations(preservedVariations);
          
          // 🎯 CRITICAL: Auto-select the most recently saved schedule
          const mostRecentSchedule = preservedVariations
            .filter(s => s.lastUsed)
            .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())[0];
          
          if (mostRecentSchedule) {
            console.log(`🎯 Auto-selecting most recent schedule: "${mostRecentSchedule.name}"`);
            setSelectedSchedule(mostRecentSchedule);
          } else if (preservedVariations.length > 0) {
            console.log(`🎯 Auto-selecting first schedule: "${preservedVariations[0].name}"`);
            setSelectedSchedule(preservedVariations[0]);
          }
          
          return; // Stop after finding schedules
        }
      } catch (error) {
        console.error(`Error loading schedules from ${key}:`, error);
      }
    }
    
    console.log('⚠️ No schedules found in localStorage');
  };

  // Initial load
  useEffect(() => {
    loadScheduleVariations();
  }, []);

  // 🔧 ENHANCED: Event listeners with proper cleanup
  useEffect(() => {
    // Listen for storage events (when localStorage changes)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'scheduleVariations' || event.key === 'saved_schedules') {
        console.log(`🔄 Storage change detected for ${event.key}, reloading...`);
        loadScheduleVariations();
      }
    };

    // Listen for custom events from ScheduleBuilder
    const handleScheduleUpdate = (event: CustomEvent) => {
      console.log('🔄 Custom schedule update event received:', event.detail);
      loadScheduleVariations();
    };

    // 🎯 CRITICAL: Listen for when user LOADS a schedule in ScheduleBuilder
    const handleScheduleLoaded = (event: CustomEvent) => {
      const { schedule, source } = event.detail;
      console.log('📥 Schedule loaded event received:', {
        scheduleName: schedule.name,
        source: source,
        activitiesWithGroups: schedule.activities.filter((a: any) => 
          a.groupAssignments && a.groupAssignments.length > 0
        ).length
      });
      
      // 🔧 CRITICAL FIX: Update selectedSchedule immediately
      const preservedSchedule = {
        ...schedule,
        activities: (schedule.activities || []).map((activity: any) => ({
          ...activity,
          groupAssignments: activity.groupAssignments || 
                           (activity.assignment as any)?.groupAssignments || 
                           []
        }))
      };
      
      setSelectedSchedule(preservedSchedule);
      console.log(`✅ Updated selectedSchedule to: ${schedule.name}`);
      
      // Also refresh schedule variations to update usage tracking
      loadScheduleVariations();
    };

    // 🎯 CRITICAL: Listen for when user saves a schedule in ScheduleBuilder
    const handleScheduleSaved = (event: CustomEvent) => {
      const { scheduleId, scheduleName } = event.detail;
      console.log('💾 Schedule saved event detected:', { scheduleId, scheduleName });
      
      // Reload schedules and auto-select the newly saved one
      setTimeout(() => {
        loadScheduleVariations();
        
        // Try to auto-select the newly saved schedule
        setTimeout(() => {
          const saved = localStorage.getItem('scheduleVariations') || localStorage.getItem('saved_schedules');
          if (saved) {
            try {
              const schedules: ScheduleVariation[] = JSON.parse(saved);
              const newSchedule = schedules.find(s => s.id === scheduleId);
              if (newSchedule) {
                setSelectedSchedule(newSchedule);
                console.log(`✅ Auto-selected newly saved schedule: ${newSchedule.name}`);
              }
            } catch (error) {
              console.error('Error auto-selecting saved schedule:', error);
            }
          }
        }, 200);
      }, 100);
    };

    // 🎯 NEW: Listen for real-time schedule building updates
    const handleScheduleBuilding = (event: CustomEvent) => {
      const { activities, startTime, name } = event.detail;
      console.log('🛠️ Schedule building update:', { 
        activityCount: activities?.length || 0, 
        startTime, 
        name 
      });
      
      // Update current working schedule for immediate display
      if (activities && activities.length > 0) {
        const workingSchedule = {
          id: 'working_schedule',
          name: name || 'Working Schedule',
          type: 'daily' as const,
          category: 'academic' as const,
          activities: activities,
          startTime: startTime || '09:00',
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString()
        };
        
        // Temporarily set as selected for immediate display
        setSelectedSchedule(workingSchedule);
      }
    };

    // Add all event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('scheduleUpdated', handleScheduleUpdate as EventListener);
    window.addEventListener('scheduleLoaded', handleScheduleLoaded as EventListener);
    window.addEventListener('scheduleSaved', handleScheduleSaved as EventListener);
    window.addEventListener('scheduleBuilding', handleScheduleBuilding as EventListener);

    console.log('✅ App.tsx event listeners registered:', {
      storage: '✅',
      scheduleUpdated: '✅', 
      scheduleLoaded: '✅ CRITICAL FIX',
      scheduleSaved: '✅',
      scheduleBuilding: '✅ NEW'
    });

    // 🎯 CRITICAL: Polling fallback for same-tab updates
    const interval = setInterval(() => {
      const saved = localStorage.getItem('scheduleVariations') || localStorage.getItem('saved_schedules');
      if (saved) {
        try {
          const current = JSON.parse(saved);
          // Only reload if the count changed (new schedule added)
          if (current.length !== scheduleVariations.length) {
            console.log('🔄 Schedule count changed, reloading...');
            loadScheduleVariations();
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }
    }, 2000); // Check every 2 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scheduleUpdated', handleScheduleUpdate as EventListener);
      window.removeEventListener('scheduleLoaded', handleScheduleLoaded as EventListener);
      window.removeEventListener('scheduleSaved', handleScheduleSaved as EventListener);
      window.removeEventListener('scheduleBuilding', handleScheduleBuilding as EventListener);
      clearInterval(interval);
      console.log('🧹 App.tsx event listeners cleaned up');
    };
  }, [scheduleVariations.length]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            setCurrentView('builder');
            break;
          case '2':
            event.preventDefault();
            setCurrentView('display');
            break;
          case '3':
            event.preventDefault();
            setCurrentView('students');
            break;
          case '4':
            event.preventDefault();
            setCurrentView('staff');
            break;
          case '5':
            event.preventDefault();
            setCurrentView('library');
            break;
          case '6':
            event.preventDefault();
            setCurrentView('celebrations');
            break;
          case ',':
            event.preventDefault();
            setCurrentView('settings');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handler functions for schedule management
  const handleScheduleSelect = (schedule: ScheduleVariation | null) => {
    console.log('🎯 App.tsx - Schedule selected:', schedule?.name || 'none');
    
    if (schedule) {
      // 🔧 CRITICAL: Preserve groupAssignments when selecting
      const preservedSchedule = {
        ...schedule,
        activities: (schedule.activities || []).map(activity => ({
          ...activity,
          groupAssignments: activity.groupAssignments || 
                           (activity.assignment as any)?.groupAssignments || 
                           []
        }))
      };
      
      console.log('✅ Schedule preserved with groups:', {
        name: preservedSchedule.name,
        activitiesWithGroups: preservedSchedule.activities.filter(a => a.groupAssignments && a.groupAssignments.length > 0).length,
        totalActivities: preservedSchedule.activities.length
      });
      
      setSelectedSchedule(preservedSchedule);
      
      // Update usage tracking
      const updatedVariations = scheduleVariations.map(s => 
        s.id === schedule.id 
          ? { ...s, lastUsed: new Date().toISOString(), usageCount: (s.usageCount || 0) + 1 }
          : s
      );
      setScheduleVariations(updatedVariations);
      localStorage.setItem('scheduleVariations', JSON.stringify(updatedVariations));
    } else {
      setSelectedSchedule(null);
    }
  };

  const handleScheduleUpdate = (updatedVariations: ScheduleVariation[]) => {
    console.log('🔄 App.tsx - Schedule variations updated:', updatedVariations.length);
    setScheduleVariations(updatedVariations);
    localStorage.setItem('scheduleVariations', JSON.stringify(updatedVariations));
  };

  // 🎯 CRITICAL: Enhanced schedule preparation for SmartboardDisplay
  const currentScheduleForDisplay = useMemo(() => {
    if (!selectedSchedule) {
      console.log('⚠️ No selectedSchedule available for display');
      return undefined;
    }

    // Ensure activities have proper structure with preserved groups
    const enhancedActivities = (selectedSchedule.activities || []).map((activity: any) => ({
      ...activity,
      // 🔧 CRITICAL: Ensure all required properties exist
      id: activity.id || `activity_${Date.now()}`,
      name: activity.name || 'Untitled Activity',
      icon: activity.icon || activity.emoji || '📝',
      duration: activity.duration || 30,
      category: activity.category || 'academic',
      description: activity.description || '',
      
      // 🎯 CRITICAL: Preserve groupAssignments for SmartboardDisplay
      groupAssignments: activity.groupAssignments || 
                       (activity.assignment as any)?.groupAssignments || 
                       [],
      
      // Preserve assignment data
      assignment: activity.assignment || {
        staffIds: [],
        groupIds: [],
        isWholeClass: true,
        notes: '',
        groupAssignments: activity.groupAssignments || []
      },
      
      // 🔥 CRITICAL: Preserve transition properties
      ...(activity.isTransition && {
        isTransition: activity.isTransition,
        transitionType: activity.transitionType,
        animationStyle: activity.animationStyle,
        showNextActivity: activity.showNextActivity,
        movementPrompts: activity.movementPrompts,
        autoStart: activity.autoStart,
        soundEnabled: activity.soundEnabled,
        customMessage: activity.customMessage
      })
    }));

    const displaySchedule = {
      activities: enhancedActivities,
      startTime: selectedSchedule.startTime || '09:00',
      name: selectedSchedule.name || 'Untitled Schedule'
    };

    console.log('🖥️ Prepared schedule for SmartboardDisplay:', {
      scheduleName: displaySchedule.name,
      activityCount: displaySchedule.activities.length,
      activitiesWithGroups: displaySchedule.activities.filter(a => 
        a.groupAssignments && a.groupAssignments.length > 0
      ).length,
      transitionActivities: displaySchedule.activities.filter(a => a.isTransition).length,
      startTime: displaySchedule.startTime
    });

    return displaySchedule;
  }, [selectedSchedule]);

  // 🎯 NEW: Debug logging for SmartboardDisplay data flow
  useEffect(() => {
    if (currentView === 'display') {
      console.log('🖥️ App.tsx - Switching to SmartboardDisplay with data:', {
        hasCurrentSchedule: !!currentScheduleForDisplay,
        scheduleName: currentScheduleForDisplay?.name,
        activityCount: currentScheduleForDisplay?.activities?.length || 0,
        activitiesWithGroups: currentScheduleForDisplay?.activities?.filter(a => 
          a.groupAssignments && a.groupAssignments.length > 0
        ).length || 0,
        staffCount: staff.length,
        studentCount: students.length,
        selectedScheduleId: selectedSchedule?.id
      });
      
      // Log first activity with groups for debugging
      const firstActivityWithGroups = currentScheduleForDisplay?.activities?.find(a => 
        a.groupAssignments && a.groupAssignments.length > 0
      );
      
      if (firstActivityWithGroups) {
        console.log('🎯 Sample activity with groups for SmartboardDisplay:', {
          name: firstActivityWithGroups.name,
          groupCount: firstActivityWithGroups.groupAssignments?.length,
          groups: firstActivityWithGroups.groupAssignments?.map(g => ({
            name: g.groupName,
            color: g.color,
            studentCount: g.studentIds?.length || 0
          }))
        });
      } else {
        console.log('⚠️ No activities with groups found for SmartboardDisplay');
      }
    }
  }, [currentView, currentScheduleForDisplay, staff, students, selectedSchedule]);

  return (
    <div className="app">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        selectedSchedule={selectedSchedule}
      />
      
      <main className="main-content">
        <ScheduleBuilder 
          isActive={currentView === 'builder'}
        />
        
        {/* 🎯 CRITICAL: Pass all necessary data to SmartboardDisplay */}
        <SmartboardDisplay 
          isActive={currentView === 'display'}
          currentSchedule={currentScheduleForDisplay}
          staff={staff}
          students={students}
        />
        
        <StudentManagement 
          isActive={currentView === 'students'} 
        />
        
        <StaffManagement 
          isActive={currentView === 'staff'} 
        />
        
        <ActivityLibrary 
          isActive={currentView === 'library'} 
        />
        
        <CelebrationAnimations 
          isActive={currentView === 'celebrations'} 
        />
        
        <Settings 
          isActive={currentView === 'settings'} 
        />
      </main>

      <style>
        {`
          .app {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          .main-content {
            flex: 1;
            overflow: auto;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
        `}
      </style>
    </div>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
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

  // Load schedule variations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('scheduleVariations');
    if (saved) {
      const variations: ScheduleVariation[] = JSON.parse(saved);
      setScheduleVariations(variations);
      
      // Auto-select the most recently used schedule
      const mostRecentSchedule = variations
        .filter(s => s.lastUsed)
        .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())[0];
      
      if (mostRecentSchedule) {
        setSelectedSchedule(mostRecentSchedule);
      } else if (variations.length > 0) {
        setSelectedSchedule(variations[0]);
      }
    }
  }, []);

  // Handler functions for schedule management
  const handleScheduleSelect = (schedule: ScheduleVariation | null) => {
    setSelectedSchedule(schedule);
    
    if (schedule) {
      const updatedVariations = scheduleVariations.map(s => 
        s.id === schedule.id 
          ? { ...s, lastUsed: new Date().toISOString(), usageCount: (s.usageCount || 0) + 1 }
          : s
      );
      setScheduleVariations(updatedVariations);
      localStorage.setItem('scheduleVariations', JSON.stringify(updatedVariations));
    }
  };

  const handleScheduleUpdate = (updatedVariations: ScheduleVariation[]) => {
    setScheduleVariations(updatedVariations);
    localStorage.setItem('scheduleVariations', JSON.stringify(updatedVariations));
  };

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
        
        <SmartboardDisplay 
          isActive={currentView === 'display'}
          currentSchedule={selectedSchedule ? {
            activities: selectedSchedule.activities,
            startTime: selectedSchedule.startTime,
            name: selectedSchedule.name
          } : undefined}
          staff={staff}
          students={students as any}
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
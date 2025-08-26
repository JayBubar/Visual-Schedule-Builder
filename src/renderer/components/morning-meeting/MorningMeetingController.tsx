import React, { useState } from 'react';
import { StandardLogEntry, Staff } from '../../types';
import { HubSettings, Student, MorningMeetingStepProps } from './types/morningMeetingTypes';
import UnifiedDataService from '../../services/unifiedDataService';

import WelcomeStep from './steps/WelcomeStep';
import CalendarMathStep from './steps/CalendarMathStep';
import SeasonalStep from './steps/SeasonalStep';
import WeatherStep from './steps/WeatherStep';

interface MorningMeetingControllerProps {
  students: Student[];
  staff: Staff[];
  hubSettings: any; // Using any for now to bypass type issues
  onClose: () => void;
  onNavigateHome: () => void;
  onNavigateToDisplay: () => void;
}

// Helper to format date as YYYY-MM-DD
const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Define the steps and their associated standards
const MEETING_STEPS = [
    { component: WelcomeStep, name: 'WelcomeStep', standards: [] },
    { 
        component: CalendarMathStep, 
        name: 'CalendarMathStep', 
        standards: ["K.H.2", "K.NR.1.1", "ELA.K.F.1.1"] 
    },
    { 
        component: SeasonalStep, 
        name: 'SeasonalStep', 
        standards: ["Science K.E.3A.2", "Science K.E.3A.3"] 
    },
    { 
        component: WeatherStep, 
        name: 'WeatherStep', 
        standards: ["Science K.E.3A.1", "K.DPSR.1.2"] 
    },
];

const MorningMeetingController: React.FC<MorningMeetingControllerProps> = ({ 
  students, 
  staff, 
  hubSettings, 
  onClose,
  onNavigateHome, 
  onNavigateToDisplay 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentDate = new Date();

  // Create the functions that the internal logic expects
  const onComplete = () => {
    console.log('🎉 Morning Meeting completed!');
    onNavigateToDisplay(); // Navigate to display view when complete
  };

  const onBackToHub = () => {
    console.log('🔙 Going back to hub...');
    onClose(); // Go back to builder/main view
  };

  const handleStartMorningMeeting = () => {
    console.log('🚀 DEBUGGING: Starting Morning Meeting...');
    
    const debugHubSettings = {
      todaysAnnouncements: {
        enabled: true,
        announcements: []
      },
      customVocabulary: {
        weather: ['sunny', 'cloudy', 'rainy', 'snowy'],
        seasonal: ['spring', 'summer', 'fall', 'winter']
      },
      videos: {
        calendarMath: [],
        weather: [],
        seasonal: [],
        behaviorCommitments: []
      },
      behaviorStatements: {
        enabled: true,
        statements: [
          'I will use kind words with my friends',
          'I will listen when my teacher is talking',
          'I will try my best in everything I do'
        ],
        allowCustom: true
      },
      behaviorCommitments: {
        enabled: true,
        commitments: []
      },
      celebrations: {
        enabled: true,
        showBirthdayPhotos: true,
        customCelebrations: []
      },
      flowCustomization: {
        enabledSteps: {
          welcome: true,
          attendance: true,
          classroomRules: true,          // CORRECT KEY
          behaviorCommitments: true,     // CORRECT KEY
          calendarMath: true,
          weather: true,
          seasonal: true,
          celebration: true,
          dayReview: true
        }
      }
    };
    
    console.log('🔧 DEBUGGING: Hub settings being set:', debugHubSettings);
    console.log('🔧 DEBUGGING: Flow steps enabled:', debugHubSettings.flowCustomization.enabledSteps);
    
    // Note: In a real implementation, you would call setHubSettings and setCurrentMode here
    // For now, we're just logging the debug information
  };

  const handleStepComplete = () => {
    // Log the standards for the step that just finished
    const stepInfo = MEETING_STEPS[currentStepIndex];
    if (stepInfo.standards.length > 0) {
        const logEntries: StandardLogEntry[] = stepInfo.standards.map(std => ({
            standard: std,
            source: stepInfo.name
        }));
        UnifiedDataService.saveStandardsForDate(formatDateKey(currentDate), logEntries);
    }
    
    // Move to the next step or finish
    if (currentStepIndex < MEETING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete(); // Entire morning meeting is done
    }
  };

  const ActiveStepComponent = MEETING_STEPS[currentStepIndex].component;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ActiveStepComponent
        students={students}
        hubSettings={hubSettings}
        currentDate={currentDate}
        onDataUpdate={() => {}}
        onStepComplete={handleStepComplete}
        onNext={handleStepComplete}
        onBack={onBackToHub}
      />
      
      {/* Add a simple navigation overlay for testing */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '1rem',
        zIndex: 1000
      }}>
        <button
          onClick={onNavigateHome}
          style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '10px',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          🏠 Home
        </button>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '10px',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          ✖️ Close
        </button>
      </div>
    </div>
  );
};

export default MorningMeetingController;

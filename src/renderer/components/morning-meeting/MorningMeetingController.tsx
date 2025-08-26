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
  hubSettings: HubSettings;
  onComplete: () => void;
  onBackToHub: () => void;
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

const MorningMeetingController: React.FC<MorningMeetingControllerProps> = ({ students, staff, hubSettings, onComplete, onBackToHub }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentDate = new Date();

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
    </div>
  );
};

export default MorningMeetingController;

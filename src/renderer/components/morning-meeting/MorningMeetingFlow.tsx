// src/renderer/components/morning-meeting/MorningMeetingFlow.tsx

import React, { useState } from 'react';
import { HubSettings, Student, MorningMeetingStepProps } from './types/morningMeetingTypes';

// Import all your step components
import WelcomeStep from './steps/WelcomeStep';
import AttendanceStep from './steps/AttendanceStep';
import BehaviorStep from './steps/BehaviorStep';
import CalendarMathStep from './steps/CalendarMathStep';
import WeatherStep from './steps/WeatherStep';
import SeasonalStep from './steps/SeasonalStep';
import CelebrationStep from './steps/CelebrationStep';
import DayReviewStep from './steps/DayReviewStep';

import MorningMeetingNavigation from './common/MorningMeetingNavigation';

export interface MorningMeetingFlowProps {
  students: Student[];
  hubSettings: HubSettings;
  onComplete: () => void;
  onBackToHub: () => void;
}

const MorningMeetingFlow: React.FC<MorningMeetingFlowProps> = ({
  students,
  hubSettings,
  onComplete,
  onBackToHub,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStepComplete, setIsStepComplete] = useState(true);

  // Define all available steps with their keys
  const allSteps = [
    { key: 'welcome', component: WelcomeStep },
    { key: 'attendance', component: AttendanceStep },
    { key: 'classroomRules', component: BehaviorStep },
    { key: 'behaviorCommitments', component: BehaviorStep }, // FIXED KEY
    { key: 'calendarMath', component: CalendarMathStep },
    { key: 'weather', component: WeatherStep },
    { key: 'seasonal', component: SeasonalStep },
    { key: 'celebration', component: CelebrationStep },
    { key: 'dayReview', component: DayReviewStep },
  ];

  // Filter steps based on hubSettings.flowCustomization.enabledSteps
  const enabledSteps = React.useMemo(() => {
    console.log('🔧 Flow: hubSettings received:', hubSettings);
    console.log('🔧 Flow: flowCustomization:', hubSettings?.flowCustomization);
    console.log('🔧 Flow: enabledSteps:', hubSettings?.flowCustomization?.enabledSteps);

    if (!hubSettings?.flowCustomization?.enabledSteps) {
      console.log('🔧 Flow: No flow customization found, using all steps');
      return allSteps.map(step => step.component);
    }

    const filteredSteps = allSteps.filter(step => {
      // Attendance is always required
      if (step.key === 'attendance') {
        return true;
      }
      
      const isEnabled = hubSettings.flowCustomization.enabledSteps[step.key] !== false;
      console.log(`🔧 Flow: Step ${step.key} enabled: ${isEnabled}`);
      return isEnabled;
    });

    console.log('🔧 Flow: Filtered steps:', filteredSteps.map(step => step.key || 'unknown'));
    return filteredSteps.map(step => step.component);
  }, [hubSettings]);

  const steps = enabledSteps;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setIsStepComplete(steps[currentStepIndex + 1] === CelebrationStep || steps[currentStepIndex + 1] === WelcomeStep); 
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setIsStepComplete(true);
    } else {
      onBackToHub();
    }
  };

  const CurrentStepComponent = steps[currentStepIndex];

  // Create props for the current step
  const stepProps = {
    students,
    hubSettings,
    currentDate: new Date(),
    onDataUpdate: () => {},
    onStepComplete: () => setIsStepComplete(true),
    onNext: handleNext,
    onBack: handleBack,
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* FIX: Add the Home button here */}
      <button
        onClick={onBackToHub}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 600
        }}
      >
        🏠 Home
      </button>

      {CurrentStepComponent && <CurrentStepComponent {...stepProps as any} />}

      <MorningMeetingNavigation
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!isStepComplete}
        isBackDisabled={currentStepIndex === 0}
      />
    </div>
  );
};

export default MorningMeetingFlow;

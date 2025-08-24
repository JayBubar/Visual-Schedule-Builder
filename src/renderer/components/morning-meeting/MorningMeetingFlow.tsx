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

  const steps = [
    WelcomeStep,
    AttendanceStep,
    BehaviorStep,      // This was previously named ClassroomRulesStep in your code
    CalendarMathStep,
    WeatherStep,
    SeasonalStep,
    CelebrationStep,
    DayReviewStep,
  ];

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

  // FIX: This object now correctly includes onNext and onBack to satisfy the type
  const stepProps: MorningMeetingStepProps = {
    students,
    hubSettings,
    currentDate: new Date(),
    onDataUpdate: () => {},
    onStepComplete: () => setIsStepComplete(true),
    onNext: handleNext, // Pass the handler
    onBack: handleBack,   // Pass the handler
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

      {CurrentStepComponent && <CurrentStepComponent {...stepProps} />}

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

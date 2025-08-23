// src/renderer/components/morning-meeting/MorningMeetingFlow.tsx

import React, { useState } from 'react';
import { HubSettings, Student } from '../../types';

// Import all your step components
import WelcomeStep from './steps/WelcomeStep';
import AttendanceStep from './steps/AttendanceStep';
import WeatherStep from './steps/WeatherStep';
import SeasonalStep from './steps/SeasonalStep';
import CalendarMathStep from './steps/CalendarMathStep';
import DayReviewStep from './steps/DayReviewStep';
import BehaviorStep from './steps/BehaviorStep';
import CelebrationStep from './steps/CelebrationStep';

// Import the new navigation component
import MorningMeetingNavigation from './common/MorningMeetingNavigation';

interface MorningMeetingFlowProps {
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
  const [isStepComplete, setIsStepComplete] = useState(false);

  const steps = [
    WelcomeStep,
    AttendanceStep,
    WeatherStep,
    SeasonalStep,
    CalendarMathStep,
    DayReviewStep,
    BehaviorStep,
    CelebrationStep,
  ];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setIsStepComplete(false); // Reset for the new step
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setIsStepComplete(true); // Assume previous steps are always complete
    } else {
      onBackToHub();
    }
  };

  const CurrentStepComponent = steps[currentStepIndex];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {CurrentStepComponent && (
        <CurrentStepComponent
          students={students}
          hubSettings={hubSettings}
          onDataUpdate={() => {}} // This can be used for data logging if needed
          // The key change is here: pass the setIsStepComplete function
          onStepComplete={() => setIsStepComplete(true)}
          // Remove onNext and onBack from the step components themselves
        />
      )}

      <MorningMeetingNavigation
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!isStepComplete}
        isBackDisabled={currentStepIndex === 0 && !onBackToHub}
        nextButtonText={currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
      />
    </div>
  );
};

export default MorningMeetingFlow;
// src/renderer/components/morning-meeting/MorningMeetingFlow.tsx

import React, { useState } from 'react';
import { HubSettings, Student, MorningMeetingStepProps } from './types/morningMeetingTypes';

// Import all step components
import WelcomeStep from './steps/WelcomeStep';
import AttendanceStep from './steps/AttendanceStep';
import ClassroomRulesStep from './steps/ClassroomRulesStep';
import BehaviorStep from './steps/BehaviorStep';
import CalendarMathStep from './steps/CalendarMathStep';
import WeatherStep from './steps/WeatherStep';
import SeasonalStep from './steps/SeasonalStep';
import CelebrationStep from './steps/CelebrationStep';
import DayReviewStep from './steps/DayReviewStep';

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

  // Define all available steps with correct keys matching hub
  const allSteps = [
    { key: 'welcome', component: WelcomeStep },
    { key: 'attendance', component: AttendanceStep },
    { key: 'classroomRules', component: ClassroomRulesStep },
    { key: 'behaviorCommitments', component: BehaviorStep },
    { key: 'calendarMath', component: CalendarMathStep },
    { key: 'weather', component: WeatherStep },
    { key: 'seasonal', component: SeasonalStep },
    { key: 'celebration', component: CelebrationStep },
    { key: 'dayReview', component: DayReviewStep },
  ];

  // Filter steps based on hubSettings.flowCustomization.enabledSteps
  const enabledSteps = React.useMemo(() => {
    if (!hubSettings?.flowCustomization?.enabledSteps) {
      return allSteps;
    }

    const filteredSteps = allSteps.filter(step => {
      // Attendance is always required
      if (step.key === 'attendance') {
        return true;
      }
      
      const isEnabled = hubSettings.flowCustomization.enabledSteps[step.key] !== false;
      return isEnabled;
    });

    return filteredSteps;
  }, [hubSettings]);

  const handleNext = () => {
    if (currentStepIndex < enabledSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      onBackToHub();
    }
  };

  const handleStepComplete = () => {
    setIsStepComplete(true);
  };

  // Safety check
  if (!enabledSteps || enabledSteps.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div>
          <h2>⚠️ Configuration Error</h2>
          <p>No steps are enabled. Please check your flow settings.</p>
          <button onClick={onBackToHub} style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid white',
            borderRadius: '10px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '1rem'
          }}>
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  const currentStep = enabledSteps[currentStepIndex];
  
  if (!currentStep) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div>
          <h2>⚠️ Navigation Error</h2>
          <p>Step not found. Please restart Morning Meeting.</p>
          <button onClick={onBackToHub} style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid white',
            borderRadius: '10px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '1rem'
          }}>
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  const StepComponent = currentStep.component;

  return (
    <div className="morning-meeting-flow">
      <StepComponent
        onNext={handleNext}
        onBack={handleBack}
        onHome={onBackToHub}
        onStepComplete={handleStepComplete}
        hubSettings={hubSettings}
        students={students}
        currentDate={new Date()}
        stepData={null}
        onDataUpdate={() => {}}
      />
    </div>
  );
};

export default MorningMeetingFlow;

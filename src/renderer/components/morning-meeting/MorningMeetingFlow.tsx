// src/renderer/components/morning-meeting/MorningMeetingFlow.tsx

import React, { useState } from 'react';
import { HubSettings, Student, MorningMeetingStepProps } from './types/morningMeetingTypes';

// Import all step components - CORRECTED
import WelcomeStep from './steps/WelcomeStep';
import AttendanceStep from './steps/AttendanceStep';
import ClassroomRulesStep from './steps/ClassroomRulesStep';
import BehaviorStep from './steps/BehaviorStep'; // NEW - Import the behavior commitments step
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

  // Define all available steps with CORRECT keys matching hub
  const allSteps = [
    { key: 'welcome', component: WelcomeStep },
    { key: 'attendance', component: AttendanceStep },
    { key: 'classroomRules', component: ClassroomRulesStep }, // FIXED KEY
    { key: 'behaviorCommitments', component: BehaviorStep }, // NEW STEP
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
      return allSteps;
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

    console.log('🔧 Flow: Filtered steps:', filteredSteps.map(step => step.key));
    return filteredSteps;
  }, [hubSettings]);

  const handleNext = () => {
    console.log(`📍 Navigation: Moving from step ${currentStepIndex} to ${currentStepIndex + 1}`);
    console.log(`📍 Current step: ${enabledSteps[currentStepIndex]?.key || 'unknown'}`);
    
    if (currentStepIndex < enabledSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      console.log(`📍 Next step: ${enabledSteps[currentStepIndex + 1]?.key || 'unknown'}`);
    } else {
      console.log('📍 Flow complete, calling onComplete');
      onComplete();
    }
  };

  const handleBack = () => {
    console.log(`📍 Navigation: Moving back from step ${currentStepIndex} to ${currentStepIndex - 1}`);
    
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      console.log(`📍 Previous step: ${enabledSteps[currentStepIndex - 1]?.key || 'unknown'}`);
    } else {
      console.log('📍 At first step, going back to hub');
      onBackToHub();
    }
  };

  const handleStepComplete = () => {
    setIsStepComplete(true);
  };

  // Safety check
  if (!enabledSteps || enabledSteps.length === 0) {
    console.error('❌ No enabled steps found!');
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
    console.error('❌ Current step not found!', { currentStepIndex, enabledStepsLength: enabledSteps.length });
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
  
  console.log(`🎯 Rendering step: ${currentStep.key} (${currentStepIndex + 1}/${enabledSteps.length})`);

  return (
    <div className="morning-meeting-flow">
      <StepComponent
        onNext={handleNext}
        onBack={handleBack}
        onStepComplete={handleStepComplete}
        hubSettings={hubSettings}
        students={students}
        currentDate={new Date()}
        stepData={null}
        onDataUpdate={() => {}}
      />
      
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

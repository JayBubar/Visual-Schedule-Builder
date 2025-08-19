// Replace existing imports with:
import { 
  WelcomeStep, 
  AttendanceStep, 
  BehaviorStep, 
  CalendarMathStep, 
  WeatherStep, 
  SeasonalStep,
  STEP_COMPONENTS,
  DEFAULT_STEP_ORDER,
  type StepKey
} from './steps';
import { 
  MorningMeetingSettings, 
  DEFAULT_MORNING_MEETING_SETTINGS 
} from './steps';
import React, { useState, useEffect } from 'react';
import { Student, StaffMember } from '../../types';

// Placeholder functions for settings management
const loadMorningMeetingSettings = (): MorningMeetingSettings => {
  // TODO: Implement actual settings loading from Hub or localStorage
  return DEFAULT_MORNING_MEETING_SETTINGS;
};

const getEnabledSteps = (settings: MorningMeetingSettings): StepKey[] => {
  // TODO: Implement logic to determine enabled steps based on settings
  const enabledStepKeys = Object.entries(settings.flowCustomization.enabledSteps)
    .filter(([_, enabled]) => enabled)
    .map(([stepKey, _]) => stepKey as StepKey);
  
  return enabledStepKeys.length > 0 ? enabledStepKeys : [...DEFAULT_STEP_ORDER];
};

interface MorningMeetingSessionData {
  startTime: Date;
  attendees: string[];
  completedSteps: StepKey[];
  stepResults: Record<string, any>;
}

interface MorningMeetingFlowProps {
  students?: Student[];
  staff?: StaffMember[];
  onComplete?: () => void;
  onNavigateHome?: () => void;
  hubSettings?: any;
}

const MorningMeetingFlow: React.FC<MorningMeetingFlowProps> = ({
  students = [],
  staff = [],
  onComplete,
  onNavigateHome,
  hubSettings: propHubSettings = {}
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [enabledSteps, setEnabledSteps] = useState<StepKey[]>([...DEFAULT_STEP_ORDER]);
  const [sessionData, setSessionData] = useState<MorningMeetingSessionData>();
  
  // Load settings from Hub or localStorage
  const [hubSettings, setHubSettings] = useState(loadMorningMeetingSettings());
  
  const totalSteps = enabledSteps.length;

  // Update when settings change
  useEffect(() => {
    const settings = loadMorningMeetingSettings();
    setHubSettings(settings);
    setEnabledSteps(getEnabledSteps(settings));
  }, []);

  const handleNext = () => {
    if (currentStepIndex < enabledSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Complete morning meeting
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const saveSessionData = (stepKey: string, data: any) => {
    // TODO: Implement actual session storage persistence
    try {
      const sessionKey = `morningMeeting_${new Date().toDateString()}_${stepKey}`;
      localStorage.setItem(sessionKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save session data:', error);
    }
  };

  const handleStepDataUpdate = (stepKey: string, data: any) => {
    setStepData(prev => ({
      ...prev,
      [stepKey]: data
    }));
    
    // Save to session storage for persistence
    saveSessionData(stepKey, data);
  };

  const renderCurrentStep = () => {
    const currentStepKey = enabledSteps[currentStepIndex];
    const StepComponent = STEP_COMPONENTS[currentStepKey];
    
    return (
      <StepComponent
        students={students}
        onNext={handleNext}
        onBack={handleBack}
        currentDate={new Date()}
        hubSettings={hubSettings}
        onDataUpdate={(data) => handleStepDataUpdate(currentStepKey, data)}
        stepData={stepData[currentStepKey]}
      />
    );
  };


  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Header */}
      <div style={{
        height: '70px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
            🌅 Morning Meeting
          </h1>
          <div style={{ fontSize: '1rem', opacity: 0.8 }}>
            Step {currentStepIndex + 1} of {totalSteps}: {enabledSteps[currentStepIndex]}
          </div>
        </div>

        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '0.5rem 0.75rem',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🏠 Home
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {renderCurrentStep()}
      </div>

      {/* Footer */}
      <div style={{
        height: '60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white'
      }}>
        <button
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          style={{
            padding: '0.75rem 1.5rem',
            background: currentStepIndex === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: currentStepIndex === 0 ? 'rgba(255, 255, 255, 0.5)' : 'white',
            cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            opacity: currentStepIndex === 0 ? 0.5 : 1
          }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: index <= currentStepIndex ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {currentStepIndex >= totalSteps - 1 ? 'Complete 🎉' : 'Next →'}
        </button>
      </div>

      <style>{`
        button:hover:not(:disabled) {
          transform: scale(1.05);
          background: rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default MorningMeetingFlow;

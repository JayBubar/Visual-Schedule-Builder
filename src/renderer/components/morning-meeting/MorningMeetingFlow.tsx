import React, { useState, useEffect, useCallback } from 'react';
import { Student, StaffMember } from '../../types';
import { 
  WelcomeStep, 
  AttendanceStep, 
  BehaviorStep, 
  CalendarMathStep, 
  WeatherStep, 
  SeasonalStep,
  STEP_COMPONENTS,
  DEFAULT_STEP_ORDER,
  type StepKey,
  MorningMeetingSettings,
  DEFAULT_MORNING_MEETING_SETTINGS
} from './steps';
import UnifiedDataService from '../../services/unifiedDataService';

interface MorningMeetingFlowProps {
  students?: Student[];
  staff?: StaffMember[];
  onComplete?: () => void;
  onNavigateHome?: () => void;
}

const MorningMeetingFlow: React.FC<MorningMeetingFlowProps> = ({
  students = [],
  staff = [],
  onComplete,
  onNavigateHome
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [hubSettings, setHubSettings] = useState<MorningMeetingSettings>(DEFAULT_MORNING_MEETING_SETTINGS);
  
  // Load Hub settings on mount
  useEffect(() => {
    const loadHubSettings = () => {
      try {
        const savedSettings = localStorage.getItem('morningMeetingSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setHubSettings({ ...DEFAULT_MORNING_MEETING_SETTINGS, ...parsed });
        }
      } catch (error) {
        console.warn('Failed to load Morning Meeting settings:', error);
        setHubSettings(DEFAULT_MORNING_MEETING_SETTINGS);
      }
    };
    
    loadHubSettings();
  }, []);

  // Get enabled steps from Hub settings - FIXED VERSION
  const enabledSteps: StepKey[] = React.useMemo(() => {
    // Get the step order from hub settings or use default
    const stepOrder = hubSettings.flowCustomization.stepOrder?.length > 0 
      ? hubSettings.flowCustomization.stepOrder 
      : [...DEFAULT_STEP_ORDER]; // Convert readonly to mutable array
    
    // Filter the ordered steps to only include enabled ones
    const orderedEnabledSteps = stepOrder.filter(stepKey => 
      hubSettings.flowCustomization.enabledSteps[stepKey as StepKey] === true
    ) as StepKey[];
    
    console.log('🔍 DEBUG: Hub Settings:', hubSettings.flowCustomization.enabledSteps);
    console.log('🔍 DEBUG: Step Order:', stepOrder);
    console.log('🔍 DEBUG: Enabled Steps:', orderedEnabledSteps);
    
    // Fallback to all steps if none are enabled (shouldn't happen, but safety)
    return orderedEnabledSteps.length > 0 ? orderedEnabledSteps : [...DEFAULT_STEP_ORDER];
  }, [hubSettings.flowCustomization.enabledSteps, hubSettings.flowCustomization.stepOrder]);

  const totalSteps = enabledSteps.length;

  // Add this useEffect to log step changes
  useEffect(() => {
    console.log('🔄 DEBUG: Current step changed to:', currentStepIndex, enabledSteps[currentStepIndex]);
  }, [currentStepIndex, enabledSteps]);

  // Use useCallback to prevent infinite loops
  const handleStepDataUpdate = useCallback((data: any) => {
    const currentStepKey = enabledSteps[currentStepIndex];
    setStepData(prev => ({
      ...prev,
      [currentStepKey]: data
    }));
    
    // Save to UnifiedDataService
    try {
      const sessionKey = `morningMeeting_${new Date().toDateString()}_${currentStepKey}`;
      UnifiedDataService.saveMorningMeetingStepData(sessionKey, data);
    } catch (error) {
      console.warn('Failed to save step data:', error);
    }
  }, [enabledSteps, currentStepIndex]);

  const handleNext = () => {
    console.log('🔍 DEBUG: handleNext called');
    console.log('🔍 DEBUG: Current index:', currentStepIndex);
    console.log('🔍 DEBUG: Total steps:', enabledSteps.length);
    console.log('🔍 DEBUG: Next step would be:', enabledSteps[currentStepIndex + 1]);
    
    if (currentStepIndex < enabledSteps.length - 1) {
      console.log('✅ DEBUG: Advancing to next step');
      setCurrentStepIndex(prev => prev + 1);
    } else {
      console.log('🎉 DEBUG: Completing Morning Meeting');
      // Complete morning meeting
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const renderCurrentStep = () => {
    const currentStepKey = enabledSteps[currentStepIndex];
    const StepComponent = STEP_COMPONENTS[currentStepKey];
    
    console.log('🔍 DEBUG: Current Step Index:', currentStepIndex);
    console.log('🔍 DEBUG: Current Step Key:', currentStepKey);
    console.log('🔍 DEBUG: Step Component:', StepComponent);
    console.log('🔍 DEBUG: All Enabled Steps:', enabledSteps);
    
    if (!StepComponent) {
      console.error('❌ DEBUG: Step Component not found for:', currentStepKey);
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          color: 'white',
          textAlign: 'center'
        }}>
          <h2>Step "{currentStepKey}" not found</h2>
          <p>Available steps: {Object.keys(STEP_COMPONENTS).join(', ')}</p>
          <p>Current index: {currentStepIndex} of {enabledSteps.length}</p>
          <button onClick={() => setCurrentStepIndex(0)} style={{
            background: 'red', color: 'white', padding: '10px', borderRadius: '5px', 
            border: 'none', cursor: 'pointer', marginTop: '10px'
          }}>
            Reset to First Step
          </button>
        </div>
      );
    }
    
    return (
      <StepComponent
        students={students}
        onNext={handleNext}
        onBack={handleBack}
        currentDate={new Date()}
        hubSettings={hubSettings}
        onDataUpdate={handleStepDataUpdate}
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

      {/* Footer - Navigation */}
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
    </div>
  );
};

export default MorningMeetingFlow;

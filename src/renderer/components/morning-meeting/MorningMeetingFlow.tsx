import React, { useState, useEffect } from 'react';
import { STEP_COMPONENTS, getEnabledStepsInOrder, StepKey } from './steps';
import { MorningMeetingStepProps } from './types/morningMeetingTypes';
import UnifiedDataService from '../../services/unifiedDataService';

interface HubSettings {
  videos: {
    calendarMath: Array<{ id: string; name: string; url: string; }>;
    weatherClothing: Array<{ id: string; name: string; url: string; }>;
    seasonalLearning: Array<{ id: string; name: string; url: string; }>;
    behaviorCommitments: Array<{ id: string; name: string; url: string; }>;
  };
  behaviorStatements: {
    enabled: boolean;
    statements: string[];
    allowCustom: boolean;
  };
  celebrations: any;
  flowCustomization: {
    enabledSteps: Record<string, boolean>;
  };
}

interface MorningMeetingFlowProps {
  hubSettings: HubSettings;
  onComplete: () => void;
  onBack: () => void;
}

interface Student {
  id: string;
  name: string;
  present?: boolean;
}

const MorningMeetingFlow: React.FC<MorningMeetingFlowProps> = ({
  hubSettings,
  onComplete,
  onBack
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [students, setStudents] = useState<Student[]>([]);

  // Get enabled steps in order
  const enabledSteps = getEnabledStepsInOrder(hubSettings.flowCustomization.enabledSteps);
  const currentStepKey = enabledSteps[currentStepIndex];
  const CurrentStepComponent = STEP_COMPONENTS[currentStepKey];

  // Load students data
  useEffect(() => {
    try {
      // Try different methods to get students
      let allStudents = [];
      if (typeof (UnifiedDataService as any).getAllStudents === 'function') {
        allStudents = (UnifiedDataService as any).getAllStudents();
      } else if (typeof (UnifiedDataService as any).getStudents === 'function') {
        allStudents = (UnifiedDataService as any).getStudents();
      } else {
        // Fallback to empty array
        allStudents = [];
      }
      setStudents(allStudents || []);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    }
  }, []);

  // Debug log to verify hubSettings.videos is flowing through
  useEffect(() => {
    console.log('🎥 MorningMeetingFlow: hubSettings.videos:', hubSettings?.videos);
    console.log('🎥 Current step:', currentStepKey);
    console.log('🎥 Videos for current step:', hubSettings?.videos?.[getVideoKey(currentStepKey)]);
  }, [hubSettings, currentStepKey]);

  // Helper function to get video key for current step
  const getVideoKey = (stepKey: StepKey): keyof typeof hubSettings.videos => {
    const videoKeyMap: Record<StepKey, keyof typeof hubSettings.videos> = {
      welcome: 'calendarMath',
      attendance: 'calendarMath',
      behavior: 'behaviorCommitments',
      calendarMath: 'calendarMath',
      weather: 'weatherClothing',
      seasonal: 'seasonalLearning',
      celebration: 'calendarMath',
      dayReview: 'calendarMath'
    };
    return videoKeyMap[stepKey] || 'calendarMath';
  };

  const handleNext = () => {
    if (currentStepIndex < enabledSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Save final completion data
      try {
        const completionData = {
          completedAt: new Date(),
          steps: enabledSteps,
          stepData,
          hubSettings: {
            videos: hubSettings.videos,
            behaviorStatements: hubSettings.behaviorStatements,
            celebrations: hubSettings.celebrations
          }
        };
        // Save to localStorage for now since saveMorningMeetingSession may not exist
        localStorage.setItem('morningMeetingSession', JSON.stringify(completionData));
      } catch (error) {
        console.error('Error saving Morning Meeting session:', error);
      }
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const handleStepDataUpdate = (data: any) => {
    setStepData(prev => ({
      ...prev,
      [currentStepKey]: data
    }));

    // Save step data to localStorage for now
    try {
      const stepDataKey = `morningMeetingStep_${currentStepKey}`;
      localStorage.setItem(stepDataKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving step data:', error);
    }
  };

  // Handle case where no steps are enabled
  if (enabledSteps.length === 0) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          No Steps Enabled
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Please enable at least one step in the Morning Meeting Hub settings.
        </p>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          ← Back to Hub
        </button>
      </div>
    );
  }

  // Handle case where step component is not found
  if (!CurrentStepComponent) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Step Not Found
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          The step "{currentStepKey}" could not be loaded.
        </p>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          ← Back to Hub
        </button>
      </div>
    );
  }

  // Create step props with all necessary data
  const stepProps: any = {
    currentDate: new Date(),
    onNext: handleNext,
    onBack: handlePrevious,
    onDataUpdate: handleStepDataUpdate,
    stepData: stepData[currentStepKey],
    hubSettings, // Pass complete hubSettings including videos
    students
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Progress indicator */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '20px',
        padding: '0.5rem 1rem',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <span style={{
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          Step {currentStepIndex + 1} of {enabledSteps.length}
        </span>
        <div style={{
          width: '100px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((currentStepIndex + 1) / enabledSteps.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #34D399, #10B981)',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <span style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.8rem',
          textTransform: 'capitalize'
        }}>
          {currentStepKey.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      </div>

      {/* Step Component */}
      <CurrentStepComponent {...stepProps} />

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '8px',
          fontSize: '0.7rem',
          zIndex: 2000
        }}>
          <div>Step: {currentStepKey}</div>
          <div>Videos: {hubSettings?.videos?.[getVideoKey(currentStepKey)]?.length || 0}</div>
          <div>Students: {students.filter(s => s.present === true).length} present</div>
        </div>
      )}
    </div>
  );
};

export default MorningMeetingFlow;
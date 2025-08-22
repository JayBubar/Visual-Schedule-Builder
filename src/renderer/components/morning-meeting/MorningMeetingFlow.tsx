import React, { useState, useEffect, useCallback } from 'react';
import { MorningMeetingStepProps } from './types/morningMeetingTypes';

// Import all step components
import WelcomeStep from './steps/WelcomeStep';
import AttendanceStep from './steps/AttendanceStep';
import BehaviorStep from './steps/BehaviorStep';
import CalendarMathStep from './steps/CalendarMathStep';
import WeatherStep from './steps/WeatherStep';
import SeasonalStep from './steps/SeasonalStep';
import CelebrationStep from './steps/CelebrationStep';
import DayReviewStep from './steps/DayReviewStep';

interface MorningMeetingFlowProps {
  onComplete: () => void;
  onExit: () => void;
  onBack?: () => void; // Add this optional prop
  students: any[];
  hubSettings: any;
}

const STEP_ORDER = [
  'welcome',
  'attendance', 
  'classroomRules',
  'calendarMath',
  'weather',
  'seasonal',
  'celebration',
  'dayReview'
] as const;

const STEP_COMPONENTS = {
  welcome: WelcomeStep,
  attendance: AttendanceStep,
  classroomRules: BehaviorStep,
  calendarMath: CalendarMathStep,
  weather: WeatherStep,
  seasonal: SeasonalStep,
  celebration: CelebrationStep,
  dayReview: DayReviewStep
};

const STEP_TITLES = {
  welcome: 'Welcome',
  attendance: 'Attendance',
  classroomRules: 'Classroom Rules',
  calendarMath: 'Calendar Math',
  weather: 'Weather',
  seasonal: 'Seasonal Fun',
  celebration: 'Celebration',
  dayReview: 'Day Review'
};

const MorningMeetingFlow: React.FC<MorningMeetingFlowProps> = ({
  onComplete,
  onExit,
  students,
  hubSettings
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentStepKey = STEP_ORDER[currentStepIndex];
  const CurrentStepComponent = STEP_COMPONENTS[currentStepKey] as React.FC<any>;

  // Handle step data updates
  const handleStepDataUpdate = useCallback((stepKey: string, data: any) => {
    setStepData(prev => ({
      ...prev,
      [stepKey]: data
    }));
  }, []);

  // Navigation functions
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < STEP_ORDER.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 200);
    } else {
      // Complete Morning Meeting
      onComplete();
    }
  }, [currentStepIndex, onComplete]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev - 1);
        setIsTransitioning(false);
      }, 200);
    }
  }, [currentStepIndex]);

  const handleGoHome = useCallback(() => {
    onExit();
  }, [onExit]);

  // Memoize the onDataUpdate callback to prevent recreation on every render
  const handleCurrentStepDataUpdate = useCallback((data: any) => {
    handleStepDataUpdate(currentStepKey, data);
  }, [handleStepDataUpdate, currentStepKey]);

  // Create step props - ensure all required props are present
  const stepProps = {
    onNext: goToNextStep,
    onBack: goToPreviousStep,
    onDataUpdate: handleCurrentStepDataUpdate,
    stepData: stepData[currentStepKey],
    hubSettings,
    students: students || [], // Always provide students array
    currentDate: new Date(),
    // Add any other props that might be needed by specific steps
    staff: [] // Some steps might need staff
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: '#000'
    }}>
      {/* 🏠 HOME BUTTON - TOP LEFT ONLY */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 100
      }}>
        <button
          onClick={handleGoHome}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          }}
        >
          🏠 Home
        </button>
      </div>

      {/* 📍 STEP INDICATOR - TOP RIGHT (CLEAN & MINIMAL) */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 100
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '0.75rem 1.5rem',
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: 600,
          textAlign: 'center',
          opacity: 0.9
        }}>
          Step {currentStepIndex + 1} of {STEP_ORDER.length}
          <div style={{
            fontSize: '0.8rem',
            opacity: 0.8,
            marginTop: '0.25rem'
          }}>
            {STEP_TITLES[currentStepKey]}
          </div>
        </div>
      </div>

      {/* 🎭 MAIN STEP CONTENT */}
      <div style={{
        width: '100%',
        height: '100%',
        opacity: isTransitioning ? 0.7 : 1,
        transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}>
        <CurrentStepComponent {...stepProps} />
      </div>

      {/* 🧭 BOTTOM NAVIGATION - PREVIOUS/NEXT ONLY */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '1rem 2rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Previous Button */}
          {currentStepIndex > 0 && (
            <button
              onClick={goToPreviousStep}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ← Previous
            </button>
          )}

          {/* Step Progress Dots (Minimal) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {STEP_ORDER.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: index === currentStepIndex 
                    ? 'rgba(255, 255, 255, 0.9)' 
                    : index < currentStepIndex 
                      ? 'rgba(76, 175, 80, 0.8)'
                      : 'rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  transform: index === currentStepIndex ? 'scale(1.3)' : 'scale(1)'
                }}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={goToNextStep}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: currentStepIndex === STEP_ORDER.length - 1
                ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                : 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (currentStepIndex === STEP_ORDER.length - 1) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)';
              } else {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              }
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              if (currentStepIndex === STEP_ORDER.length - 1) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
              } else {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {currentStepIndex === STEP_ORDER.length - 1 ? 'Complete! 🎉' : 'Next →'}
          </button>
        </div>
      </div>

      {/* CSS for enhanced animations */}
      <style>{`
        /* Smooth transitions for all interactive elements */
        button {
          user-select: none;
        }
        
        /* Glassmorphism enhancement */
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* Accessibility focus styles */
        button:focus {
          outline: 3px solid rgba(255, 215, 0, 0.6);
          outline-offset: 2px;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          button {
            border: 2px solid white !important;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MorningMeetingFlow;
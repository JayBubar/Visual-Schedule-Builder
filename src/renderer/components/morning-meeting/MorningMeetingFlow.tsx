import React, { useState, useEffect } from 'react';
import { 
  Student, 
  StaffMember, 
  DailyCheckIn as DailyCheckInType,
  WeatherData,
  CalendarSettings
} from '../../types';
import UnifiedDataService from '../../services/unifiedDataService';

// Import the core Morning Meeting step components from calendar folder
import WelcomeScreen from '../calendar/WelcomeScreen';
import AttendanceSystem from '../calendar/AttendanceSystem';
import BehaviorCommitments from '../calendar/BehaviorCommitments';
import CalendarMathStep from '../calendar/CalendarMathStep';
import WeatherClothingStep from '../calendar/WeatherClothingStep';
import SeasonalLearningStep from '../calendar/SeasonalLearningStep';
import CelebrationSystem from '../calendar/CelebrationSystem';
import DailyHighlights from '../calendar/DailyHighlights';

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
  // State management - using SmartboardDisplay-compatible patterns
  const [currentStep, setCurrentStep] = useState(1);
  const [presentStudents, setPresentStudents] = useState<Student[]>([]);
  const [absentStudents, setAbsentStudents] = useState<Student[]>([]);
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckInType | null>(null);
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings | null>(null);
  const [morningMeetingSettings, setMorningMeetingSettings] = useState<any>(null);

  const currentDate = new Date();

  // Load Morning Meeting settings from Hub
  useEffect(() => {
    try {
      const hubSettings = localStorage.getItem('morningMeetingSettings');
      if (hubSettings) {
        setMorningMeetingSettings(JSON.parse(hubSettings));
      }

      const calSettings = UnifiedDataService.getSettings()?.calendarSettings;
      if (calSettings) {
        setCalendarSettings(calSettings);
      }

      // Initialize today's check-in
      const today = currentDate.toDateString();
      const existingCheckIns = localStorage.getItem('dailyCheckIns');
      if (existingCheckIns) {
        const checkIns = JSON.parse(existingCheckIns);
        const todayData = checkIns.find((c: any) => c.date === today);
        if (todayData) {
          setTodayCheckIn(todayData);
        }
      }

      if (!todayCheckIn) {
        const newCheckIn: DailyCheckInType = {
          id: `checkin-${Date.now()}`,
          date: today,
          students: students,
          attendance: { present: [], absent: [] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setTodayCheckIn(newCheckIn);
      }
    } catch (error) {
      console.error('Error loading Morning Meeting data:', error);
    }
  }, []);

  // Get enabled steps from Hub settings
  const getEnabledSteps = () => {
    if (!morningMeetingSettings?.flowCustomization?.enabledSteps) {
      return ['welcome', 'attendance', 'behavior', 'calendarMath', 'weatherClothing', 'seasonalLearning'];
    }
    
    const enabled = morningMeetingSettings.flowCustomization.enabledSteps;
    const stepOrder = [
      'welcome', 'attendance', 'behavior', 'calendarMath', 
      'weatherClothing', 'seasonalLearning'
    ];
    
    return stepOrder.filter(step => enabled[step]);
  };

  const enabledSteps = getEnabledSteps();
  const totalSteps = enabledSteps.length;

  // Navigation functions
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (todayCheckIn) {
      saveTodayCheckIn(todayCheckIn);
    }
    
    if (onComplete) {
      onComplete();
    } else if (onNavigateHome) {
      onNavigateHome();
    }
  };

  // Data management
  const saveTodayCheckIn = (updatedCheckIn: DailyCheckInType) => {
    try {
      const existingCheckIns = localStorage.getItem('dailyCheckIns');
      const checkIns = existingCheckIns ? JSON.parse(existingCheckIns) : [];
      
      const existingIndex = checkIns.findIndex((c: any) => c.date === updatedCheckIn.date);
      if (existingIndex >= 0) {
        checkIns[existingIndex] = { ...updatedCheckIn, updatedAt: new Date().toISOString() };
      } else {
        checkIns.push(updatedCheckIn);
      }

      localStorage.setItem('dailyCheckIns', JSON.stringify(checkIns));
      setTodayCheckIn(updatedCheckIn);
    } catch (error) {
      console.error('Error saving check-in:', error);
    }
  };

  const handleAttendanceComplete = (present: Student[], absent: Student[]) => {
    setPresentStudents(present);
    setAbsentStudents(absent);
    
    if (todayCheckIn) {
      const updatedCheckIn = {
        ...todayCheckIn,
        attendance: { present, absent },
        updatedAt: new Date().toISOString()
      };
      saveTodayCheckIn(updatedCheckIn);
    }
  };

  const handleWeatherUpdate = (weather: WeatherData) => {
    if (todayCheckIn) {
      const updatedCheckIn = {
        ...todayCheckIn,
        weather: weather,
        updatedAt: new Date().toISOString()
      };
      saveTodayCheckIn(updatedCheckIn);
    }
  };

  // Get current step name
  const getCurrentStepName = () => {
    if (currentStep <= enabledSteps.length) {
      return enabledSteps[currentStep - 1];
    }
    return 'complete';
  };

  const currentStepName = getCurrentStepName();

  // Get video selection from Hub settings
  const getSelectedVideos = (category: string) => {
    return morningMeetingSettings?.videoSelection?.[category] || [];
  };

  // Dynamic screen sizing following SmartboardDisplay pattern
  const headerHeight = 70;
  const controlsHeight = 60;
  const availableContentHeight = window.innerHeight - headerHeight - controlsHeight - 20;

  // Render current step
  const renderCurrentStep = () => {
    const stepProps = {
      onNext: handleNext,
      onBack: handleBack,
      currentDate,
    };

    switch (currentStepName) {
      case 'welcome':
        return (
          <WelcomeScreen
            {...stepProps}
            welcomeSettings={morningMeetingSettings?.welcomePersonalization}
          />
        );

      case 'attendance':
        return (
          <AttendanceSystem
            {...stepProps}
            students={students}
            onAttendanceComplete={handleAttendanceComplete}
          />
        );

      case 'behavior':
        return (
          <BehaviorCommitments
            {...stepProps}
            students={presentStudents}
            behaviorSettings={morningMeetingSettings?.behaviorStatements}
            selectedVideos={getSelectedVideos('behavior')}
          />
        );

      case 'calendarMath':
        return (
          <CalendarMathStep
            {...stepProps}
            calendarSettings={calendarSettings}
          />
        );

      case 'weatherClothing':
        return (
          <WeatherClothingStep
            {...stepProps}
            calendarSettings={calendarSettings}
            onWeatherUpdate={handleWeatherUpdate}
            selectedVideos={getSelectedVideos('weather')}
          />
        );

      case 'seasonalLearning':
        return (
          <SeasonalLearningStep
            {...stepProps}
            weather={todayCheckIn?.weather}
            weatherVocabulary={calendarSettings?.weatherVocabulary}
            selectedVideos={getSelectedVideos('seasonal')}
          />
        );

      default:
        return (
          <div style={{
            height: availableContentHeight,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
            backgroundSize: '400% 400%',
            animation: 'celebrationColors 3s ease-in-out infinite',
            borderRadius: '12px',
            margin: '1rem'
          }}>
            <div style={{
              fontSize: 'clamp(4rem, 8vw, 8rem)',
              marginBottom: '2rem',
              animation: 'bounce 1s ease-in-out infinite'
            }}>
              🎉🚀🎊
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 4rem)',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem',
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}>
              Morning Meeting Complete!
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.5rem)',
              color: 'white',
              textAlign: 'center',
              marginBottom: '2rem',
              opacity: 0.9
            }}>
              Ready to start your amazing day of learning!
            </p>
            <button
              onClick={handleComplete}
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                fontWeight: '700',
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(2rem, 4vw, 3rem)',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#2c3e50',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
              }}
            >
              Continue to Schedule 📅
            </button>
          </div>
        );
    }
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
      {/* Header - Following SmartboardDisplay pattern */}
      <div style={{
        height: `${headerHeight}px`,
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
          <h1 style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            fontWeight: '700',
            margin: 0
          }}>
            🌅 Morning Meeting
          </h1>
          <div style={{
            fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
            opacity: 0.8
          }}>
            Step {currentStep} of {totalSteps}: {currentStepName.charAt(0).toUpperCase() + currentStepName.slice(1)}
          </div>
        </div>

        {/* Home button */}
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '0.5rem 0.75rem',
              fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🏠 Home
          </button>
        )}
      </div>

      {/* Content Area - Dynamic height calculation */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        height: `${availableContentHeight}px`
      }}>
        {renderCurrentStep()}
      </div>

      {/* Controls Footer - Following SmartboardDisplay pattern */}
      <div style={{
        height: `${controlsHeight}px`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white'
      }}>
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          style={{
            padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)',
            background: currentStep === 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: currentStep === 1 ? 'rgba(255, 255, 255, 0.5)' : 'white',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            opacity: currentStep === 1 ? 0.5 : 1
          }}
        >
          ← Back
        </button>

        {/* Progress indicator */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          {enabledSteps.map((_, index) => (
            <div
              key={index}
              style={{
                width: 'clamp(8px, 1vw, 12px)',
                height: 'clamp(8px, 1vw, 12px)',
                borderRadius: '50%',
                background: index < currentStep ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          style={{
            padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {currentStep >= totalSteps ? 'Complete 🎉' : 'Next →'}
        </button>
      </div>

      <style jsx>{`
        @keyframes celebrationColors {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            transform: translate3d(0, -15px, 0);
          }
          70% {
            transform: translate3d(0, -7px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default MorningMeetingFlow;
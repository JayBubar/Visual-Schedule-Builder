import React, { useState, useEffect } from 'react';
import { 
  ScheduleVariation, 
  Student, 
  StaffMember, 
  DailyCheckIn as DailyCheckInType,
  WeatherData,
  CalendarSettings
} from '../../types';
import UnifiedDataService from '../../services/unifiedDataService';

// Import new linear flow components
import WelcomeScreen from './WelcomeScreen';
import AttendanceSystem from './AttendanceSystem';
import CelebrationSystem from './CelebrationSystem';
import AreWeReady from './AreWeReady';

// Import existing components for the flow
import WeatherWidget from './WeatherWidget';
import CalendarWidget from './CalendarWidget';
import CalendarSettingsComponent from './CalendarSettings';
import BehaviorCommitments from './BehaviorCommitments';
import IndependentChoices from './IndependentChoices';

interface DailyCheckInProps {
  isActive: boolean;
  selectedSchedule?: ScheduleVariation | null;
  staff?: StaffMember[];
  students?: Student[];
  onSwitchToScheduleBuilder?: () => void;
  onSwitchToDisplay?: () => void;
}

const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  isActive,
  selectedSchedule,
  staff = [],
  students = [],
  onSwitchToScheduleBuilder,
  onSwitchToDisplay
}) => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [presentStudents, setPresentStudents] = useState<Student[]>([]);
  const [absentStudents, setAbsentStudents] = useState<Student[]>([]);
  
  // Existing state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckInType | null>(null);
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings | null>(null);
  const [realStudents, setRealStudents] = useState<Student[]>([]);
  const [realStaff, setRealStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebrationAnimation, setShowCelebrationAnimation] = useState(false);

  useEffect(() => {
    try {
      // Load students from unified data service
      const unifiedStudents = UnifiedDataService.getAllStudents();
      // Convert UnifiedStudent to Student format for compatibility
      const convertedStudents: Student[] = unifiedStudents.map(student => ({
        id: student.id,
        name: student.name,
        grade: student.grade,
        photo: student.photo,
        accommodations: student.accommodations || [],
        goals: student.goals || [],
        preferredPartners: student.preferredPartners || [],
        avoidPartners: student.avoidPartners || [],
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        isActive: student.isActive !== false,
        behaviorNotes: student.behaviorNotes,
        medicalNotes: student.medicalNotes,
        workingStyle: (student.workingStyle as "independent" | "collaborative" | "guided" | "needs-support") || "independent"
      }));
      setRealStudents(convertedStudents);

      // Load staff from unified data service
      const unifiedStaff = UnifiedDataService.getAllStaff();
      // Convert UnifiedStaff to StaffMember format for compatibility
      const convertedStaff: StaffMember[] = unifiedStaff.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        email: member.email || '',
        phone: member.phone || '',
        specialties: member.specialties || [],
        photo: member.photo || null,
        isActive: member.isActive,
        startDate: member.dateCreated,
        notes: member.notes || '',
        isResourceTeacher: member.isResourceTeacher || false,
        isRelatedArtsTeacher: member.isRelatedArtsTeacher || false
      }));
      setRealStaff(convertedStaff);

      // Load calendar settings from unified data service
      const unifiedSettings = UnifiedDataService.getSettings();
      if (unifiedSettings.calendarSettings) {
        setCalendarSettings(unifiedSettings.calendarSettings);
      } else {
        // Create default settings and save to unified data
        const defaultSettings: CalendarSettings = {
          showWeather: true,
          showBehaviorCommitments: true,
          showIndependentChoices: true,
          showDailyHighlights: true,
          enableSoundEffects: true,
          autoSaveInterval: 30,
          defaultView: 'day',
          weatherLocation: 'Columbia, SC',
          temperatureUnit: 'F',
          autoWeatherUpdate: true,
          weatherUpdateInterval: 60,
          behaviorCategories: ['kindness', 'respect', 'effort', 'responsibility', 'safety', 'learning'],
          independentChoiceCategories: ['creative', 'academic', 'social', 'break'],
          enableAchievements: true,
          morningRoutineAutoStart: false,
          showThreeDayView: true,
          calendarTheme: 'standard',
          weekStartsOn: 0,
          showWeekends: false,
          timeFormat: '12h',
          notifications: false,
          weatherUnits: 'metric',
          showWeatherAlerts: false
        };
        setCalendarSettings(defaultSettings);
        UnifiedDataService.updateSettings({ calendarSettings: defaultSettings });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadTodayCheckIn();
    }
  }, [currentDate, isLoading]);

  const loadTodayCheckIn = () => {
    const dateKey = currentDate.toISOString().split('T')[0];
    const savedCheckIns = localStorage.getItem('dailyCheckIns');
    
    if (savedCheckIns) {
      try {
        const checkIns: DailyCheckInType[] = JSON.parse(savedCheckIns);
        const todayData = checkIns.find(checkin => checkin.date === dateKey);
        
        if (todayData) {
          setTodayCheckIn(todayData);
        } else {
          createNewCheckIn(dateKey);
        }
      } catch (error) {
        console.error('Error loading check-ins:', error);
        createNewCheckIn(dateKey);
      }
    } else {
      createNewCheckIn(dateKey);
    }
  };

  const createNewCheckIn = (dateKey: string) => {
    const newCheckIn: DailyCheckInType = {
      id: `checkin_${dateKey}`,
      date: dateKey,
      weather: {
        location: calendarSettings?.weatherLocation || 'Columbia, SC',
        condition: 'unknown',
        temperature: 72,
        temperatureUnit: calendarSettings?.temperatureUnit || 'F',
        icon: '🌤️',
        description: 'Weather data loading...',
        timestamp: new Date().toISOString()
      },
      behaviorCommitments: [],
      independentChoices: [],
      yesterdayHighlights: [],
      todayPreview: [],
      tomorrowPreview: 'Schedule preview coming soon...',
      achievements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTodayCheckIn(newCheckIn);
  };

  const saveTodayCheckIn = (updatedCheckIn: DailyCheckInType) => {
    try {
      const savedCheckIns = localStorage.getItem('dailyCheckIns');
      let checkIns: DailyCheckInType[] = savedCheckIns ? JSON.parse(savedCheckIns) : [];
      
      const existingIndex = checkIns.findIndex(c => c.date === updatedCheckIn.date);
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

  const saveCalendarSettings = (newSettings: CalendarSettings) => {
    try {
      UnifiedDataService.updateSettings({ calendarSettings: newSettings });
      setCalendarSettings(newSettings);
    } catch (error) {
      console.error('Error saving calendar settings:', error);
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

  // Step navigation functions
  const handleNext = () => {
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAttendanceComplete = (present: Student[], absent: Student[]) => {
    setPresentStudents(present);
    setAbsentStudents(absent);
    
    // Auto-create absent student group for today's schedule
    if (absent.length > 0) {
      // This would integrate with your schedule builder to create an "absent" group
      console.log('Creating absent student group:', absent.map(s => s.name));
    }
  };

  const handleFinalConfirmation = () => {
    console.log('🚀 Daily Check-In Complete - Checking for temporary schedule');
    
    // Check if there's a temporary schedule from "Use Built Schedule"
    const todaySchedule = localStorage.getItem('todaySchedule');
    
    if (todaySchedule) {
      try {
        const schedule = JSON.parse(todaySchedule);
        console.log('✅ Found temporary schedule, switching to Display mode:', schedule.name);
        
        // Show celebration animation
        setShowCelebrationAnimation(true);
        
        // After animation, switch to Display mode with the temporary schedule
        setTimeout(() => {
          if (onSwitchToDisplay) {
            onSwitchToDisplay();
          }
        }, 3000);
      } catch (error) {
        console.error('Error parsing temporary schedule:', error);
        // Fallback to Schedule Builder if there's an error
        if (onSwitchToScheduleBuilder) {
          onSwitchToScheduleBuilder();
        }
      }
    } else {
      console.log('⚠️ No temporary schedule found, redirecting to Schedule Builder');
      
      // No temporary schedule, go to Schedule Builder
      if (onSwitchToScheduleBuilder) {
        onSwitchToScheduleBuilder();
      }
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        overflow: 'auto',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
          <h2>Loading Daily Check-In...</h2>
        </div>
      </div>
    );
  }

  // Show celebration animation before transitioning
  if (showCelebrationAnimation) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8)',
        backgroundSize: '400% 400%',
        animation: 'celebrationColors 2s ease-in-out infinite',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '8rem',
          marginBottom: '2rem',
          animation: 'bounce 1s ease-in-out infinite'
        }}>
          🎉🚀🎉
        </div>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '700',
          marginBottom: '1rem',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          animation: 'pulse 1s ease-in-out infinite'
        }}>
          Ready to Learn!
        </h1>
        <p style={{
          fontSize: '1.5rem',
          opacity: 0.9,
          marginBottom: '2rem'
        }}>
          Transitioning to Visual Schedule Builder...
        </p>
        
        <style>{`
          @keyframes celebrationColors {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      position: 'relative'
    }}>
      {/* Progress Indicator */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '0.5rem 1.5rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        zIndex: 1000,
        fontSize: '0.9rem',
        fontWeight: '600'
      }}>
        Step {currentStep} of 10
        <div style={{
          width: '200px',
          height: '4px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '2px',
          marginTop: '0.5rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(currentStep / 10) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10B981, #34D399)',
            borderRadius: '2px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Step Content */}
      <div style={{ paddingTop: '4rem' }}>
        {/* Step 1: Welcome Screen */}
        {currentStep === 1 && (
          <WelcomeScreen
            currentDate={currentDate}
            teacherName="Teacher"
            schoolName="Our School"
            onBegin={handleNext}
          />
        )}

        {/* Step 2: Attendance System */}
        {currentStep === 2 && (
          <AttendanceSystem
            students={realStudents}
            currentDate={currentDate}
            onAttendanceComplete={handleAttendanceComplete}
            onNext={handleNext}
          />
        )}

        {/* Step 3: Calendar Talk */}
        {currentStep === 3 && (
          <div style={{ padding: '2rem', textAlign: 'center', minHeight: '600px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              📅 Calendar Talk
            </h2>
            <p style={{
              fontSize: '1.3rem',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '2rem'
            }}>
              Let's explore today's date and talk about our calendar!
            </p>
            
            <CalendarWidget
              selectedDate={currentDate}
              onDateSelect={setCurrentDate}
              size="large"
              savedDates={[]}
            />
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={handleBack}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Back to Attendance
              </button>
              
              <button
                onClick={handleNext}
                style={{
                  background: 'rgba(34, 197, 94, 0.8)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '1rem 3rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
              >
                Continue to Weather →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Weather Discussion */}
        {currentStep === 4 && calendarSettings && (
          <div style={{ padding: '2rem', textAlign: 'center', minHeight: '600px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              🌤️ Weather Discussion
            </h2>
            <p style={{
              fontSize: '1.3rem',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '2rem'
            }}>
              Let's check today's weather and talk about what we observe!
            </p>

            <WeatherWidget
              settings={calendarSettings}
              onWeatherUpdate={handleWeatherUpdate}
              showDiscussionPrompts={true}
              size="large"
            />
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={handleBack}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Back to Calendar
              </button>
              
              <button
                onClick={handleNext}
                style={{
                  background: 'rgba(34, 197, 94, 0.8)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '1rem 3rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
              >
                Continue to Celebrations →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Celebration System */}
        {currentStep === 5 && (
          <CelebrationSystem
            currentDate={currentDate}
            students={presentStudents}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Step 6: "I Will" Choices - Behavior Commitments */}
        {currentStep === 6 && (
          <div style={{ padding: '2rem', minHeight: '600px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                ⭐ "I Will" Behavior Goals
              </h2>
              <p style={{
                fontSize: '1.3rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '2rem'
              }}>
                Let's set our positive behavior goals for today!
              </p>
            </div>

            <BehaviorCommitments
              currentDate={currentDate}
              students={presentStudents}
              todayCheckIn={todayCheckIn}
              onUpdateCheckIn={saveTodayCheckIn}
              onNext={handleNext}
              onBack={handleBack}
            />
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={handleBack}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Back to Celebrations
              </button>
              
              <button
                onClick={handleNext}
                style={{
                  background: 'rgba(34, 197, 94, 0.8)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '1rem 3rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
              >
                Continue to Choice Activities →
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Choice Activities - Independent Choices */}
        {currentStep === 7 && (
          <div style={{ padding: '2rem', minHeight: '600px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                🎯 Choice Activities
              </h2>
              <p style={{
                fontSize: '1.3rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '2rem'
              }}>
                What independent activities would you like to do today?
              </p>
            </div>

            <IndependentChoices
              selectedDate={currentDate.toISOString().split('T')[0]}
            />
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={handleBack}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Back to Behavior Goals
              </button>
              
              <button
                onClick={handleNext}
                style={{
                  background: 'rgba(34, 197, 94, 0.8)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '1rem 3rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
              >
                Continue to Schedule Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 8: Are We Ready - Schedule Summary */}
        {currentStep === 8 && (
          <AreWeReady
            currentDate={currentDate}
            presentStudents={presentStudents}
            absentStudents={absentStudents}
            selectedSchedule={selectedSchedule}
            staff={realStaff}
            onConfirm={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Step 9: Final Celebration Animation */}
        {currentStep === 9 && (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
            backgroundSize: '400% 400%',
            animation: 'celebrationColors 3s ease-in-out infinite'
          }}>
            <div style={{
              fontSize: '8rem',
              marginBottom: '2rem',
              animation: 'bounce 1s ease-in-out infinite'
            }}>
              🎉🚀🎊
            </div>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem',
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              animation: 'pulse 1s ease-in-out infinite'
            }}>
              We're All Set!
            </h1>
            <p style={{
              fontSize: '1.8rem',
              color: 'white',
              marginBottom: '2rem',
              opacity: 0.9
            }}>
              Ready for an amazing day of learning!
            </p>
            
            <button
              onClick={handleNext}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '3px solid white',
                borderRadius: '20px',
                color: 'white',
                padding: '1.5rem 3rem',
                fontSize: '1.5rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: 'glow 2s ease-in-out infinite alternate'
              }}
            >
              🚀 Start Our Visual Schedule! 🚀
            </button>

            <style>{`
              @keyframes celebrationColors {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
              }
              
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }
              
              @keyframes glow {
                from { box-shadow: 0 0 20px rgba(255,255,255,0.5); }
                to { box-shadow: 0 0 30px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.3); }
              }
            `}</style>
          </div>
        )}

        {/* Step 10: Transition to Visual Schedule */}
        {currentStep === 10 && (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '6rem', marginBottom: '2rem' }}>📋✨</div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem',
              textShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}>
              Transitioning to Visual Schedule
            </h1>
            <p style={{
              fontSize: '1.3rem',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '2rem'
            }}>
              Loading your personalized schedule...
            </p>
            
            <div style={{
              width: '300px',
              height: '8px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '2rem'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #10B981, #34D399)',
                borderRadius: '4px',
                animation: 'loading 2s ease-in-out infinite'
              }} />
            </div>

            <button
              onClick={handleFinalConfirmation}
              style={{
                background: 'linear-gradient(135deg, #10B981, #34D399)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                padding: '1.5rem 3rem',
                fontSize: '1.3rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🎯 Begin Visual Schedule Builder
            </button>

            <style>{`
              @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Settings Button */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1000
      }}>
        <button
          onClick={() => setShowSettings(true)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Calendar Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Settings Modal */}
      {calendarSettings && (
        <CalendarSettingsComponent
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={saveCalendarSettings}
          currentSettings={calendarSettings}
        />
      )}
    </div>
  );
};

export default DailyCheckIn;

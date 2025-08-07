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
  const [dailyCheckInSettings, setDailyCheckInSettings] = useState<any>(null);
  const [realStudents, setRealStudents] = useState<Student[]>([]);
  const [realStaff, setRealStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebrationAnimation, setShowCelebrationAnimation] = useState(false);
  const [showChoiceInterface, setShowChoiceInterface] = useState(false);

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

      // Load settings from unified data service - both calendar and dailyCheckIn settings
      const unifiedSettings = UnifiedDataService.getSettings();
      
      // Load Daily Check-In settings from the new Settings structure
      if (unifiedSettings.dailyCheckIn) {
        setDailyCheckInSettings(unifiedSettings.dailyCheckIn);
      }
      
      // Load legacy calendar settings for backward compatibility
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

  // Listen for settings changes from the Settings component
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      const newSettings = event.detail;
      if (newSettings.dailyCheckIn) {
        setDailyCheckInSettings(newSettings.dailyCheckIn);
        console.log('🔄 DailyCheckIn settings updated from Settings component:', newSettings.dailyCheckIn);
      }
    };

    window.addEventListener('unifiedSettingsChanged', handleSettingsChange as EventListener);
    
    return () => {
      window.removeEventListener('unifiedSettingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

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
      console.log('Creating absent student group:', absent.map(s => s.id));
    }
  };

  // Single completion logic - replace existing multi-screen logic
  const allRequiredTabsComplete = () => {
    return (
      todayCheckIn?.behaviorCommitments && 
      todayCheckIn?.behaviorCommitments.length > 0 &&
      todayCheckIn?.independentChoices &&
      todayCheckIn?.weather
    );
  };

  // 🐛 DEBUG INFO to see the completion flow
  console.log('🐛 DailyCheckIn Debug:');
  console.log('- currentStep:', currentStep);
  console.log('- todayCheckIn:', todayCheckIn);
  console.log('- All tabs completed?', allRequiredTabsComplete());

  const handleFinalConfirmation = () => {
    console.log('🚀 Daily Check-In Complete - Checking for temporary schedule');
    
    // Save any final data
    if (todayCheckIn) {
      saveTodayCheckIn(todayCheckIn);
    }
    
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
          Transitioning to Visual Schedule Display...
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

        {/* Step 3: Enhanced Calendar Talk with Split-Screen Layout */}
        {currentStep === 3 && (
          <div style={{ 
            padding: '2rem', 
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
                marginBottom: '0'
              }}>
                Let's explore today's date and discover what's happening!
              </p>
            </div>

            {/* Split-Screen Layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              flex: 1,
              minHeight: '500px',
              marginBottom: '2rem'
            }}>
              
              {/* LEFT PANEL - Calendar */}
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '20px',
                padding: '2rem',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255,255,255,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  📅
                </div>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  Interactive Calendar
                </h3>
                
                <CalendarWidget
                  selectedDate={currentDate}
                  onDateSelect={setCurrentDate}
                  size="large"
                  savedDates={[]}
                />
                
                {/* Date Display */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {formatDate(currentDate)}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.8)',
                    marginTop: '0.5rem'
                  }}>
                    Day {Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))} of {currentDate.getFullYear()}
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL - Large Date Display */}
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '20px',
                padding: '2rem',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255,255,255,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                height: '100%'
              }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '2rem'
                }}>
                  📅
                </div>
                
                <div style={{
                  fontSize: '3.5rem',
                  fontWeight: '700',
                  color: 'white',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  lineHeight: '1.2',
                  marginBottom: '1rem'
                }}>
                  Today is{' '}
                  <span style={{
                    color: '#FFD700',
                    textShadow: '0 4px 8px rgba(255,215,0,0.4)'
                  }}>
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                  </span>
                </div>
                
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: 'white',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  lineHeight: '1.2',
                  marginBottom: '1rem'
                }}>
                  It is{' '}
                  <span style={{
                    color: '#4ECDC4',
                    textShadow: '0 4px 8px rgba(78,205,196,0.4)'
                  }}>
                    {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                  </span>
                </div>
                
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: 'white',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  lineHeight: '1.2'
                }}>
                  in{' '}
                  <span style={{
                    color: '#FF6B6B',
                    textShadow: '0 4px 8px rgba(255,107,107,0.4)'
                  }}>
                    {currentDate.getFullYear()}
                  </span>
                </div>
                
                {/* Decorative elements */}
                <div style={{
                  marginTop: '2rem',
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '2rem'
                }}>
                  <span style={{ animation: 'bounce 2s infinite' }}>⭐</span>
                  <span style={{ animation: 'bounce 2s infinite 0.5s' }}>🌟</span>
                  <span style={{ animation: 'bounce 2s infinite 1s' }}>✨</span>
                </div>
                
                <style>{`
                  @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                  }
                `}</style>
              </div>
            </div>

            {/* Responsive Mobile Layout */}
            <style>{`
              @media (max-width: 768px) {
                .calendar-split-layout {
                  grid-template-columns: 1fr !important;
                  gap: 1rem !important;
                }
                
                .calendar-left-panel {
                  order: 1;
                }
                
                .calendar-right-panel {
                  order: 2;
                }
              }
            `}</style>

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: 'auto'
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
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
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
                Let's assign students to their choice activities!
              </p>
            </div>

            {/* Custom Choice Assignment Interface - Skip intermediate screen */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '20px',
              padding: '2rem',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255,255,255,0.2)',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Ready for Choice Time!
              </h3>
              <p style={{
                fontSize: '1.2rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '2rem'
              }}>
                Students will now be assigned to their independent choice activities.
              </p>
              
              {/* Quick Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '2px solid rgba(34, 197, 94, 0.4)'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                    {presentStudents.length}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                    Present Students
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '2px solid rgba(59, 130, 246, 0.4)'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📚</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                    6+
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                    Activities Ready
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    // Show the IndependentChoices interface
                    setShowChoiceInterface(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.4))',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    border: '2px solid rgba(34, 197, 94, 0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '600',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.5)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(16, 185, 129, 0.5))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.4))';
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                    Start
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                    Choice Selection
                  </div>
                </button>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                marginBottom: '2rem'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✨</div>
                <p style={{
                  fontSize: '1.1rem',
                  color: 'white',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  Choice assignments will be saved and available in the Visual Schedule Builder
                  as "Choice Item Time" activities for each student!
                </p>
              </div>
            </div>
            
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

        {/* Steps 8-10: COMBINED - Single Smooth Transition */}
        {(currentStep === 8 || currentStep === 9 || currentStep === 10) && (
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
              Ready for Learning!
            </h1>
            <p style={{
              fontSize: '1.8rem',
              color: 'white',
              marginBottom: '2rem',
              opacity: 0.9
            }}>
              Launching your Visual Schedule...
            </p>
            
            {/* Auto-transition after 3 seconds OR single button */}
            <button
              onClick={handleFinalConfirmation}
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

      {/* Choice Interface Modal */}
      {showChoiceInterface && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '95vw',
            maxHeight: '95vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                // Save assignments and close
                setShowChoiceInterface(false);
              }}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(34, 197, 94, 0.8)',
                border: '2px solid rgba(34, 197, 94, 1)',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✅ Save & Complete
            </button>
            
            <IndependentChoices
              selectedDate={currentDate.toISOString().split('T')[0]}
              onClose={() => setShowChoiceInterface(false)}
              mode="assignment-only"
            />
          </div>
        </div>
      )}

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

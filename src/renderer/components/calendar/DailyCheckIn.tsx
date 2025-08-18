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
import { DataMigrationUtility, DebugDataSources } from '../../utils/dataMigration';

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
  // NEW: Add a prop to toggle full screen mode
  isFullScreen?: boolean;
}

const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  isActive,
  selectedSchedule,
  staff = [],
  students = [],
  onSwitchToScheduleBuilder,
  onSwitchToDisplay,
  isFullScreen = false,
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
      // STEP 1: Check for and migrate legacy data FIRST
      console.log('🔄 [FIXED] DailyCheckIn initialization - checking for legacy data...');
      if (DataMigrationUtility.hasLegacyCalendarData()) {
        console.log('⚠️ Legacy calendar data detected, migrating...');
        DataMigrationUtility.migrateLegacyData();
      }

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
        workingStyle: (student.workingStyle as "independent" | "collaborative" | "guided" | "needs-support") || "independent",
        // Include birthday fields for celebrations
        birthday: (student as any).birthday,
        allowBirthdayDisplay: (student as any).allowBirthdayDisplay,
        allowPhotoInCelebrations: (student as any).allowPhotoInCelebrations
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
    let nextStep = currentStep + 1;
    
    if (nextStep <= 10) {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    let prevStep = currentStep - 1;
    
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
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
  
  // Conditionally apply a CSS class for full screen mode
  const containerClassName = isFullScreen ? 'daily-check-in full-screen-mode' : 'daily-check-in';

  if (isLoading) {
    return (
      <div className={containerClassName}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          // REMOVED INLINE BACKGROUND STYLE
          color: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
            <h2>Loading Daily Check-In...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Show celebration animation before transitioning
  if (showCelebrationAnimation) {
    return (
      <div className={containerClassName}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          // REMOVED INLINE BACKGROUND STYLE
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
      </div>
    );
  }

  return (
    <div className={containerClassName}>
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
      <div className="step-content-container">
        {/* Step 1: Welcome Screen */}
        {currentStep === 1 && (
          <WelcomeScreen
            currentDate={currentDate}
            teacherName={dailyCheckInSettings?.welcomeSettings?.showTeacherName ? "Teacher" : undefined}
            schoolName={dailyCheckInSettings?.welcomeSettings?.schoolName || "Our School"}
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

        {/* Step 3: Behavior Expectations - MOVED FROM STEP 6 */}
        {currentStep === 3 && dailyCheckInSettings?.checkInFlow?.enableBehaviorCommitments !== false && (
          <BehaviorCommitments
            students={presentStudents}  // 🎯 KEY: Now uses presentStudents after attendance
            currentDate={currentDate}
            todayCheckIn={todayCheckIn}
            onUpdateCheckIn={saveTodayCheckIn}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Step 4: Calendar Math Talk - ENHANCED CALENDAR TALK */}
        {currentStep === 4 && (
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
                📅 Calendar Math Time
              </h2>
              <p style={{
                fontSize: '1.3rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '0'
              }}>
                Let's explore today's date: Month → Week → Day!
              </p>
            </div>

            {/* PLACEHOLDER: This will be enhanced in Step 2 */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '20px',
              padding: '2rem',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255,255,255,0.2)',
              textAlign: 'center',
              flex: 1
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Calendar Learning Coming Soon!</h3>
              <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                Month → Week → Day progression with vocabulary building
              </p>
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
                ← Back to Behavior Expectations
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
                Continue to Weather & Clothing →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Weather & Clothing Discussion - ENHANCED WEATHER */}
        {currentStep === 5 && (
          <div style={{ padding: '2rem', minHeight: '600px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                🌤️ Weather & What We Wear
              </h2>
              <p style={{
                fontSize: '1.3rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '2rem'
              }}>
                Let's check the weather and talk about what to wear today!
              </p>
            </div>

            <WeatherWidget
              settings={calendarSettings}
              onWeatherUpdate={handleWeatherUpdate}
              showDiscussionPrompts={true}
              size="large"
            />
            
            {/* PLACEHOLDER: Clothing discussion will be added in Step 2 */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginTop: '2rem',
              textAlign: 'center'
            }}>
              <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>👕 Clothing Discussion Coming Soon!</h4>
              <p style={{ opacity: 0.8 }}>
                "What should we wear today?" prompts and seasonal connections
              </p>
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
                ← Back to Calendar Math
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

        {/* Step 6: Celebration System - KEEP AS-IS */}
        {currentStep === 6 && dailyCheckInSettings?.checkInFlow?.enableCelebrations !== false && (
          <CelebrationSystem
            currentDate={currentDate}
            students={presentStudents}
            onNext={handleNext}
            onBack={handleBack}
            birthdaySettings={dailyCheckInSettings?.birthdaySettings}
          />
        )}

        {/* Step 7: Choice Activities - Independent Choices */}
        {currentStep === 7 && dailyCheckInSettings?.checkInFlow?.enableChoiceActivities !== false && (
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

        {/* Step 8: Schedule Review - NEW STEP ADDED */}
        {currentStep === 8 && (
          <div style={{ padding: '2rem', minHeight: '600px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                📅 Today's Schedule Preview
              </h2>
              <p style={{
                fontSize: '1.3rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '2rem'
              }}>
                Let's review what we'll be doing today!
              </p>
            </div>

            {/* Schedule Preview */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                <p style={{ fontSize: '1.2rem' }}>
                  No specific schedule loaded for today.<br />
                  We'll follow our regular daily routine!
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
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
                ← Back to Choices
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
                Continue to Daily Highlights →
              </button>
            </div>
          </div>
        )}

        {/* Steps 9-10: COMBINED - Single Smooth Transition */}
        {(currentStep === 9 || currentStep === 10) && (
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

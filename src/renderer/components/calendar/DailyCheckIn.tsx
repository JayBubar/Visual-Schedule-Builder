import React, { useState, useEffect } from 'react';
import { 
  ScheduleVariation, 
  Student, 
  StaffMember, 
  DailyCheckIn as DailyCheckInType,
  WeatherData,
  CalendarSettings
} from '../../types';
import WeatherWidget from './WeatherWidget';
import CalendarWidget from './CalendarWidget';
import CalendarSettingsComponent from './CalendarSettings';
import BehaviorCommitments from './BehaviorCommitments';
import IndependentChoices from './IndependentChoices';
import DailyHighlights from './DailyHighlights';

interface DailyCheckInProps {
  isActive: boolean;
  selectedSchedule?: ScheduleVariation | null;
  staff?: StaffMember[];
  students?: Student[];
}

const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  isActive,
  selectedSchedule,
  staff = [],
  students = []
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckInType | null>(null);
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings | null>(null);
  const [realStudents, setRealStudents] = useState<Student[]>([]);
  const [realStaff, setRealStaff] = useState<StaffMember[]>([]);
  const [activeTab, setActiveTab] = useState<'calendar' | 'weather' | 'behavior' | 'choices' | 'highlights'>('calendar');
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem('students');
      if (savedStudents) {
        const studentData = JSON.parse(savedStudents);
        setRealStudents(studentData);
      }

      const savedStaff = localStorage.getItem('staff_members');
      if (savedStaff) {
        const staffData = JSON.parse(savedStaff);
        setRealStaff(staffData);
      }

      const savedSettings = localStorage.getItem('calendarSettings');
      if (savedSettings) {
        setCalendarSettings(JSON.parse(savedSettings));
      } else {
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
        localStorage.setItem('calendarSettings', JSON.stringify(defaultSettings));
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

  const getSavedDates = (): string[] => {
    try {
      const savedCheckIns = localStorage.getItem('dailyCheckIns');
      if (savedCheckIns) {
        const checkIns: DailyCheckInType[] = JSON.parse(savedCheckIns);
        return checkIns.map(checkin => checkin.date);
      }
    } catch (error) {
      console.error('Error getting saved dates:', error);
    }
    return [];
  };

  const saveCalendarSettings = (newSettings: CalendarSettings) => {
    try {
      localStorage.setItem('calendarSettings', JSON.stringify(newSettings));
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
          <h2>Loading Calendar...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          margin: '0 0 0.5rem 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          📅 Daily Check-In
        </h1>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '600',
          margin: '0 0 1rem 0',
          color: 'rgba(255,255,255,0.9)'
        }}>
          {formatDate(currentDate)}
        </h2>
        
        {/* Date Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            ⬅️ Yesterday
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '12px',
              color: 'white',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            Today
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            Tomorrow ➡️
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'calendar', icon: '📅', label: 'Calendar' },
          { id: 'weather', icon: '🌤️', label: 'Weather' },
          { id: 'behavior', icon: '⭐', label: 'Behavior Goals' },
          { id: 'choices', icon: '🎯', label: 'Independent Choices' },
          { id: 'highlights', icon: '🎉', label: 'Daily Highlights' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: activeTab === tab.id 
                ? 'rgba(255,255,255,0.3)' 
                : 'rgba(255,255,255,0.1)',
              border: activeTab === tab.id 
                ? '2px solid rgba(255,255,255,0.5)' 
                : '2px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              color: 'white',
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '2rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        minHeight: '500px'
      }}>
        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Interactive Calendar</h3>
              <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '2rem' }}>
                Touch-friendly calendar interface for smartboard interaction
              </p>
            </div>
            
            <CalendarWidget
              selectedDate={currentDate}
              onDateSelect={setCurrentDate}
              size="large"
              savedDates={getSavedDates()}
            />
            
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              padding: '2rem',
              margin: '2rem auto',
              maxWidth: '600px',
              textAlign: 'center'
            }}>
              <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                📅 Selected: {formatDate(currentDate)}
              </h4>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                fontSize: '1rem',
                opacity: 0.9
              }}>
                <div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥</div>
                  <div>{realStudents.length} Students</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👨‍🏫</div>
                  <div>{realStaff.length} Staff</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💾</div>
                  <div>{getSavedDates().length} Saved Days</div>
                </div>
                {selectedSchedule && (
                  <div>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
                    <div>{selectedSchedule.name}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && calendarSettings && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Today's Weather</h3>
              <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
                Live weather data and discussion prompts for classroom learning
              </p>
            </div>

            <WeatherWidget
              settings={calendarSettings}
              onWeatherUpdate={handleWeatherUpdate}
              showDiscussionPrompts={true}
              size="large"
            />
          </div>
        )}

        {/* Behavior Commitments Tab */}
        {activeTab === 'behavior' && (
          <BehaviorCommitments
            currentDate={currentDate}
            students={realStudents}
            todayCheckIn={todayCheckIn}
            onUpdateCheckIn={saveTodayCheckIn}
          />
        )}

        {/* 🎉 NEW: Independent Choices Tab - INTEGRATED! */}
        {activeTab === 'choices' && (
          <IndependentChoices
            selectedDate={currentDate.toISOString().split('T')[0]}
          />
        )}

        {/* Daily Highlights Tab */}
        {activeTab === 'highlights' && (
  <DailyHighlights
    currentDate={currentDate}
    students={realStudents}
    staff={realStaff}
    todayCheckIn={todayCheckIn}
    selectedSchedule={selectedSchedule}
    onUpdateCheckIn={saveTodayCheckIn}
  />
)}  
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '1rem',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          🎯 Session 6 Complete: Independent Choices System ✅
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          Calendar ✅ • Weather ✅ • Behavior Commitments ✅ • Independent Choices ✅ • Ready for Session 7!
        </div>
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
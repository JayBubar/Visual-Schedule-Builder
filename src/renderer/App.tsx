import React, { useState, useEffect, useMemo } from 'react';
import { ViewType, ScheduleVariation, Student, Staff, ActivityLibraryItem, ScheduleActivity, EnhancedActivity, GroupAssignment, Schedule } from './types';
import { loadFromStorage, saveToStorage } from './utils/storage';
import UnifiedDataService from './services/unifiedDataService';
import { ResourceScheduleProvider } from './services/ResourceScheduleManager';
import { loadScheduleForDate } from './utils/schedulePersistence';
import StartScreen from './components/common/StartScreen';
import Navigation from './components/common/Navigation';
import ScheduleBuilder from './components/builder/ScheduleBuilder';
import SmartboardDisplay from './components/display/SmartboardDisplay';
import StudentManagement from './components/management/StudentManagement';
import StaffManagement from './components/management/StaffManagement';
import ActivityLibrary from './components/common/ActivityLibrary';
import Reports from './components/reports/Reports';
import Settings from './components/management/Settings';
import ReportsExportSystem from './components/data-collection/ReportsExportSystem';
import GoalManager from './components/data-collection/GoalManager';
import SmartGroups from './components/smart-groups/SmartGroups';
import { SmartGroupsAIService } from './services/smartGroupsService';
import { DataPrivacyService } from './services/dataPrivacyService';
import MorningMeetingHub from './components/morning-meeting/MorningMeetingHub';
import MorningMeetingFlow from './components/morning-meeting/MorningMeetingFlow';

const App: React.FC = () => {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('builder');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleVariation | null>(null);
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [activities, setActivities] = useState<ActivityLibraryItem[]>([]);
  const [showMorningMeetingFlow, setShowMorningMeetingFlow] = useState(false);
  const [morningMeetingHubSettings, setMorningMeetingHubSettings] = useState(null);

  // Get hubSettings from UnifiedDataService
  const hubSettings = useMemo(() => {
    return UnifiedDataService.getSettings();
  }, []);

  const getMorningMeetingHubSettings = () => {
    try {
      console.log('🔧 App: getMorningMeetingHubSettings() called');
      
      const allSettings = UnifiedDataService.getSettings();
      const morningMeetingSettings = allSettings?.morningMeeting || {};
      
      console.log('🔧 App: Raw MM settings:', morningMeetingSettings);
      console.log('🔧 App: welcomeSettings found:', morningMeetingSettings.welcomeSettings);
      
      // 🔧 FIX: Transform data to match what steps expect (NO MORE RAW SETTINGS!)
      const hubSettingsForFlow = {
        welcomePersonalization: {
          schoolName: morningMeetingSettings.welcomeSettings?.schoolName || '',
          teacherName: morningMeetingSettings.welcomeSettings?.teacherName || '',
          className: morningMeetingSettings.welcomeSettings?.className || '',
          customMessage: morningMeetingSettings.welcomeSettings?.customMessage || 'Welcome to Our Classroom!'
        },
        customVocabulary: {
          weather: morningMeetingSettings.customVocabulary?.weather || ['sunny', 'cloudy', 'rainy', 'snowy'],
          seasonal: morningMeetingSettings.customVocabulary?.seasonal || ['spring', 'summer', 'fall', 'winter']
        },
        videos: {
          weather: morningMeetingSettings.selectedVideos?.weather || [],
          seasonal: morningMeetingSettings.selectedVideos?.seasonal || [],
          behaviorCommitments: morningMeetingSettings.selectedVideos?.behaviorCommitments || [],
          calendarMath: morningMeetingSettings.selectedVideos?.calendarMath || []
        },
        // 🔧 FIX: BehaviorStep expects behaviorStatements
        behaviorStatements: {
          enabled: morningMeetingSettings.behaviorCommitments?.enabled !== false,
          statements: morningMeetingSettings.behaviorCommitments?.statements || [
            'I will use kind words with my friends',
            'I will listen when my teacher is talking',
            'I will try my best in everything I do'
          ],
          allowCustom: morningMeetingSettings.behaviorCommitments?.allowCustom !== false
        },
        // 🔧 FIX: Also provide behaviorCommitments for compatibility
        behaviorCommitments: {
          enabled: morningMeetingSettings.behaviorCommitments?.enabled !== false,
          commitments: morningMeetingSettings.behaviorCommitments?.statements || [],
          allowCustom: morningMeetingSettings.behaviorCommitments?.allowCustom !== false
        },
        todaysAnnouncements: {
          enabled: morningMeetingSettings.todaysAnnouncements?.enabled !== false,
          announcements: morningMeetingSettings.todaysAnnouncements?.announcements || []
        },
        celebrations: {
          enabled: morningMeetingSettings.celebrations?.enabled !== false,
          showBirthdayPhotos: morningMeetingSettings.celebrations?.showBirthdayPhotos !== false,
          customCelebrations: morningMeetingSettings.celebrations?.customCelebrations || []
        },
        flowCustomization: {
          enabledSteps: morningMeetingSettings.checkInFlow || {
            welcome: true,
            attendance: true,
            classroomRules: true,
            behaviorCommitments: true,
            calendarMath: true,
            weather: true,
            seasonal: true,
            celebration: true,
            dayReview: true
          }
        }
      };
      
      console.log('✅ App: Clean formatted hubSettingsForFlow:', hubSettingsForFlow);
      return hubSettingsForFlow;
      
    } catch (error) {
      console.error('❌ App: Error in getMorningMeetingHubSettings:', error);
      return {
        welcomePersonalization: {
          schoolName: '',
          teacherName: '',
          className: '',
          customMessage: 'Welcome to Our Classroom!'
        },
        customVocabulary: {
          weather: ['sunny', 'cloudy', 'rainy', 'snowy'],
          seasonal: ['spring', 'summer', 'fall', 'winter']
        },
        videos: { weather: [], seasonal: [], behaviorCommitments: [], calendarMath: [] },
        behaviorStatements: { enabled: true, statements: [], allowCustom: true },
        behaviorCommitments: { enabled: true, commitments: [], allowCustom: true },
        todaysAnnouncements: { enabled: true, announcements: [] },
        celebrations: { enabled: true, showBirthdayPhotos: true, customCelebrations: [] },
        flowCustomization: { enabledSteps: { welcome: true, attendance: true, classroomRules: true, behaviorCommitments: true, calendarMath: true, weather: true, seasonal: true, celebration: true, dayReview: true } }
      };
    }
  };

  useEffect(() => {
    try {
      const hasLegacyData = localStorage.getItem('calendarSettings') ||
                            localStorage.getItem('students');

      if (hasLegacyData) {
        migrateLegacyDataQuick();
      }

      loadInitialData();

    } catch (error) {
      console.error('❌ Error initializing app:', error);
    }
  }, []);

  const migrateLegacyDataQuick = () => {
    try {
      const legacyCalendarSettings = localStorage.getItem('calendarSettings');
      if (legacyCalendarSettings) {
        const settings = JSON.parse(legacyCalendarSettings);

        if (settings.customBehaviorCommitments) {
          const customStatements = [];
          Object.keys(settings.customBehaviorCommitments).forEach(category => {
            const statements = settings.customBehaviorCommitments[category];
            statements.forEach((statement, index) => {
              customStatements.push({
                id: `migrated_${category}_${index}`,
                text: statement,
                category: category,
                isActive: true,
                isDefault: false,
                createdAt: new Date().toISOString()
              });
            });
          });

          const currentSettings = UnifiedDataService.getSettings();
          const updatedSettings = {
            ...currentSettings,
            // Note: DailyCheckIn functionality has been moved to Morning Meeting
            behaviorCommitments: {
              customStatements: customStatements
            },
            celebrations: {
              enabled: settings.celebrationsEnabled !== false,
              customCelebrations: settings.customCelebrations || []
            }
          };

          UnifiedDataService.updateSettings(updatedSettings);

          localStorage.setItem('calendarSettings_backup', legacyCalendarSettings);
          localStorage.removeItem('calendarSettings');
        }
      }
    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
  };

  const loadInitialData = () => {
    try {
      DataPrivacyService.enableEducationalSharing();

      const unifiedStudents = UnifiedDataService.getAllStudents();
      const unifiedStaff = UnifiedDataService.getAllStaff();
      const unifiedActivities = UnifiedDataService.getAllActivities();

      const legacyStudents: Student[] = unifiedStudents.map(student => ({
        id: student.id,
        name: student.name,
        grade: student.grade || '',
        photo: student.photo,
        workingStyle: student.workingStyle as any,
        accommodations: student.accommodations || [],
        goals: student.goals || [],
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        isActive: student.isActive ?? true,
        behaviorNotes: student.behaviorNotes,
        medicalNotes: student.medicalNotes,
        preferredPartners: student.preferredPartners || [],
        avoidPartners: student.avoidPartners || []
      }));

      const legacyStaff: Staff[] = unifiedStaff.map(staff => ({
        id: staff.id,
        name: staff.name,
        role: staff.role,
        email: staff.email || '',
        phone: staff.phone || '',
        photo: staff.photo,
        isActive: staff.isActive ?? true,
        specialties: staff.specialties || [],
        notes: staff.notes,
        startDate: staff.dateCreated,
        isResourceTeacher: staff.isResourceTeacher ?? false,
        isRelatedArtsTeacher: staff.isRelatedArtsTeacher ?? false
      }));

      const legacyActivities: ActivityLibraryItem[] = unifiedActivities.map(activity => ({
        id: activity.id,
        name: activity.name,
        category: activity.category as any,
        description: activity.description || '',
        duration: activity.duration || 30,
        defaultDuration: activity.duration || 30,
        materials: activity.materials || [],
        instructions: activity.instructions || '',
        adaptations: activity.adaptations || [],
        isCustom: activity.isCustom,
        dateCreated: activity.dateCreated,
        emoji: '📚'
      }));

      setStudents(legacyStudents);
      setStaff(legacyStaff);
      setActivities(legacyActivities);

    } catch (error) {
      console.error('Error loading unified data, falling back to legacy storage:', error);

      const savedStudents = loadFromStorage<Student[]>('vsb_students', []);
      const savedStaff = loadFromStorage<Staff[]>('vsb_staff', []);
      const savedActivities = loadFromStorage<ActivityLibraryItem[]>('vsb_activities', []);

      setStudents(savedStudents);
      setStaff(savedStaff);
      setActivities(savedActivities);
    }
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleScheduleSelect = (schedule: ScheduleVariation) => {
    setSelectedSchedule(schedule);
  };

  const handleStudentsUpdate = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
    saveToStorage('vsb_students', updatedStudents);
  };

  const handleStaffUpdate = (updatedStaff: Staff[]) => {
    setStaff(updatedStaff);
    saveToStorage('vsb_staff', updatedStaff);
  };

  const handleActivitiesUpdate = (updatedActivities: ActivityLibraryItem[]) => {
    setActivities(updatedActivities);
    saveToStorage('vsb_activities', updatedActivities);
  };

  const handleStartDay = async () => {
    const today = new Date();
    const savedSchedule = await loadScheduleForDate(today);

    if (savedSchedule && savedSchedule.activities && savedSchedule.activities.length > 0) {
      // If a schedule for today exists, load it into state
      setActiveSchedule({
        ...savedSchedule,
        updatedAt: savedSchedule.updatedAt || savedSchedule.createdAt
      }); // Save the whole schedule object
      setShowStartScreen(false);
      setCurrentView('display'); // Go directly to the smartboard display
    } else {
      // Otherwise, go to the standalone Morning Meeting Hub
      setShowStartScreen(false);
      setCurrentView('calendar');
    }
  };

  const handleManageClassroom = () => {
    setShowStartScreen(false);
    setCurrentView('builder');
  };

  const handleBackToStart = () => {
    setCurrentView('builder');
    setActiveSchedule(null); // Also clear any active schedule
  };

  const handleSmartGroupImplementation = (recommendation: any) => {
    // Handle the implementation of smart group recommendations
  };

  const staffMembers = useMemo(() => {
    return staff.map(member => ({
      ...member,
      email: member.email || '',
      phone: member.phone || '',
      specialties: member.specialties || [],
      photo: member.photo || null,
      isActive: member.isActive ?? true,
      startDate: member.startDate || new Date().toISOString(),
      isResourceTeacher: member.isResourceTeacher ?? false,
      isRelatedArtsTeacher: member.isRelatedArtsTeacher ?? false
    }));
  }, [staff]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            handleViewChange('builder');
            break;
          case '2':
            event.preventDefault();
            handleViewChange('display');
            break;
          case '3':
            event.preventDefault();
            handleViewChange('students');
            break;
          case '4':
            event.preventDefault();
            handleViewChange('staff');
            break;
          case '5':
            event.preventDefault();
            handleViewChange('iep-goals');
            break;
          case '6':
            event.preventDefault();
            handleViewChange('calendar');
            break;
          case '7':
            event.preventDefault();
            handleViewChange('library');
            break;
          case '8':
            event.preventDefault();
            handleViewChange('smart-groups');
            break;
          case '9':
            event.preventDefault();
            handleViewChange('reports');
            break;
          case '0':
            event.preventDefault();
            handleViewChange('settings');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const handleUseBuiltSchedule = (event: CustomEvent) => {
      const { schedule } = event.detail;

      setSelectedSchedule(schedule);
      setCurrentView('display');
    };

    window.addEventListener('useBuiltSchedule', handleUseBuiltSchedule as EventListener);

    return () => {
      window.removeEventListener('useBuiltSchedule', handleUseBuiltSchedule as EventListener);
    };
  }, []);

  // Use this conditional rendering to display either the full app or a single view
  return (
    <ResourceScheduleProvider allStudents={students.map(student => ({
      ...student,
      dateCreated: new Date().toISOString(),
      grade: student.grade || '',
      resourceInfo: student.resourceInfo || undefined
    }))}>
      {currentView === 'display' ? (
        <SmartboardDisplay
          isActive={true}
          students={students}
          staff={staffMembers}
          hubSettings={hubSettings}
          currentSchedule={activeSchedule || (selectedSchedule ? {
            ...selectedSchedule,
            updatedAt: selectedSchedule.lastUsed || selectedSchedule.createdAt
          } : undefined)}
          onNavigateHome={handleBackToStart}
          onNavigateToBuilder={() => handleViewChange('builder')}
        />
      ) : currentView === 'calendar' && !showMorningMeetingFlow ? (
        <MorningMeetingHub
          onStartMorningMeeting={() => {
            console.log('🚀 Starting Morning Meeting from Hub!');
            setShowMorningMeetingFlow(true);
          }}
          onClose={() => handleViewChange('builder')}
        />
      ) : currentView === 'calendar' && showMorningMeetingFlow ? (
        (() => {
          console.log('🔍 App: About to render MorningMeetingFlow with hubSettings:', getMorningMeetingHubSettings());
          return null;
        })(),
        <MorningMeetingFlow
          students={students}
          hubSettings={getMorningMeetingHubSettings()}
          onComplete={() => {
            setCurrentView('display');
          }}
          onBackToHub={() => {
            setShowMorningMeetingFlow(false);
          }}
        />
      ) : (
        <div className="main-app-container">
          <Navigation
            currentView={currentView}
            onViewChange={handleViewChange}
            selectedSchedule={selectedSchedule}
            onBackToStart={handleBackToStart}
          />
          <div className="main-content">
            {currentView === 'builder' && (
              <ScheduleBuilder
                isActive={true}
              />
            )}

            {currentView === 'students' && (
              <StudentManagement
                isActive={true}
              />
            )}

            {currentView === 'staff' && (
              <StaffManagement
                isActive={true}
              />
            )}

            {currentView === 'iep-goals' && (
              <GoalManager />
            )}
            {currentView === 'library' && (
              <ActivityLibrary
                isActive={true}
              />
            )}

            {currentView === 'reports' && (
              <Reports
                isActive={true}
                students={students}
                staff={staffMembers}
                activities={activities}
              />
            )}

            {currentView === 'settings' && (
              <Settings
                isActive={true}
              />
            )}

            {currentView === 'smart-groups' && (
              <SmartGroups
                isActive={true}
                onRecommendationImplemented={handleSmartGroupImplementation}
              />
            )}
          </div>
        </div>
      )}
    </ResourceScheduleProvider>
  );
};

export default App;

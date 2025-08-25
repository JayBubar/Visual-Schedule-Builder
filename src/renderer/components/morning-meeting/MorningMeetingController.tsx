import React, { useState } from 'react';
import { Student, StaffMember } from '../../types';
import MorningMeetingHub from './MorningMeetingHub';
import MorningMeetingFlow from './MorningMeetingFlow';
import UnifiedDataService from '../../services/unifiedDataService';

interface MorningMeetingControllerProps {
  students?: Student[];
  staff?: StaffMember[];
  hubSettings?: any;
  onClose: () => void;
  onNavigateHome?: () => void;
  onNavigateToDisplay?: () => void;
}

const MorningMeetingController: React.FC<MorningMeetingControllerProps> = ({
  students = [],
  staff = [],
  hubSettings: passedHubSettings,
  onClose,
  onNavigateHome,
  onNavigateToDisplay
}) => {
  const [currentMode, setCurrentMode] = useState<'hub' | 'flow'>('hub');
  const [hubSettings, setHubSettings] = useState<any>(null);

  const handleStartMorningMeeting = () => {
    // FIX: Load complete hubSettings before starting flow
    try {
      const settings = UnifiedDataService.getSettings();
      const morningMeetingSettings = settings?.morningMeeting || {};
      
      console.log('🔧 Controller: Raw MM settings:', morningMeetingSettings);
      console.log('🔧 Controller: checkInFlow from settings:', morningMeetingSettings.checkInFlow);
      
      // Build complete hubSettings object
      const completeHubSettings = {
        welcomePersonalization: {
          schoolName: morningMeetingSettings.welcomeSettings?.schoolName || '',
          teacherName: morningMeetingSettings.welcomeSettings?.teacherName || '',
          className: morningMeetingSettings.welcomeSettings?.className || '',
          customMessage: morningMeetingSettings.welcomeSettings?.customMessage || 'Welcome to Our Classroom!'
        },
        customVocabulary: {
          weather: morningMeetingSettings.customVocabulary?.weather || ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy'],
          seasonal: morningMeetingSettings.customVocabulary?.seasonal || ['spring', 'summer', 'fall', 'winter', 'bloom', 'harvest']
        },
        videos: {
          calendarMath: morningMeetingSettings.selectedVideos?.calendarMath || [],
          weather: morningMeetingSettings.selectedVideos?.weather || [],
          seasonal: morningMeetingSettings.selectedVideos?.seasonal || [],
          behaviorCommitments: morningMeetingSettings.selectedVideos?.behaviorCommitments || []
        },
        behaviorStatements: {
          enabled: morningMeetingSettings.behaviorCommitments?.enabled !== false,
          statements: morningMeetingSettings.behaviorCommitments?.statements || [
            'I will use kind words with my friends',
            'I will listen when my teacher is talking',
            'I will try my best in everything I do'
          ],
          allowCustom: morningMeetingSettings.behaviorCommitments?.allowCustom !== false
        },
        celebrations: morningMeetingSettings.celebrations || {
          enabled: true,
          showBirthdayPhotos: true,
          customCelebrations: []
        },
        flowCustomization: {
          enabledSteps: {
            welcome: true,
            attendance: true,
            behavior: true,
            calendarMath: true,
            weather: true,
            seasonal: true,
            celebration: true,
            dayReview: true,
            ...morningMeetingSettings.checkInFlow
          }
        }
      };

      console.log('🔧 Controller: Complete hubSettings being passed to Flow:', completeHubSettings);
      console.log('🔧 Controller: Flow customization enabledSteps:', completeHubSettings.flowCustomization.enabledSteps);

      // Complete hubSettings being passed to Flow
      setHubSettings(completeHubSettings);
      setCurrentMode('flow');
    } catch (error) {
      console.error('🔧 Controller: Error loading settings:', error);
      // Fallback to default settings
      setHubSettings({
        welcomePersonalization: {
          schoolName: '',
          teacherName: '',
          className: '',
          customMessage: 'Welcome to Our Classroom!'
        },
        customVocabulary: {
          weather: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy'],
          seasonal: ['spring', 'summer', 'fall', 'winter', 'bloom', 'harvest']
        },
        videos: {
          calendarMath: [],
          weather: [],
          seasonal: [],
          behaviorCommitments: []
        },
        behaviorStatements: {
          enabled: true,
          statements: [
            'I will use kind words with my friends',
            'I will listen when my teacher is talking',
            'I will try my best in everything I do'
          ],
          allowCustom: true
        },
        celebrations: {
          enabled: true,
          showBirthdayPhotos: true,
          customCelebrations: []
        },
        flowCustomization: {
          enabledSteps: {
            welcome: true,
            attendance: true,
            behavior: true,
            calendarMath: true,
            weather: true,
            seasonal: true,
            celebration: true,
            dayReview: true
          }
        }
      });
      setCurrentMode('flow');
    }
  };

  const handleMorningMeetingComplete = () => {
    // Morning Meeting completed, navigate to display view to show the schedule
    if (onNavigateToDisplay) {
      onNavigateToDisplay();
    } else {
      // Fallback to closing if no display navigation is provided
      onClose();
    }
  };

  const handleBackToHub = () => {
    setCurrentMode('hub');
  };

  if (currentMode === 'hub') {
    return (
      <MorningMeetingHub
        onStartMorningMeeting={handleStartMorningMeeting}
        onClose={onClose}
      />
    );
  }

  return (
    <MorningMeetingFlow
      hubSettings={hubSettings}
      onComplete={handleMorningMeetingComplete}
      onBackToHub={handleBackToHub}
      students={[]}
    />
  );
};

export default MorningMeetingController;

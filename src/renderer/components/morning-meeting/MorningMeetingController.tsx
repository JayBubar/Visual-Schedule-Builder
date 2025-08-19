import React, { useState } from 'react';
import { Student, StaffMember } from '../../types';
import MorningMeetingHub from './MorningMeetingHub';
import MorningMeetingFlow from './MorningMeetingFlow';

interface MorningMeetingControllerProps {
  students?: Student[];
  staff?: StaffMember[];
  onClose: () => void;
  onNavigateHome?: () => void;
}

const MorningMeetingController: React.FC<MorningMeetingControllerProps> = ({
  students = [],
  staff = [],
  onClose,
  onNavigateHome
}) => {
  const [currentMode, setCurrentMode] = useState<'hub' | 'flow'>('hub');

  const handleStartMorningMeeting = () => {
    setCurrentMode('flow');
  };

  const handleMorningMeetingComplete = () => {
    // Morning Meeting completed, close the controller
    onClose();
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
      students={students}
      staff={staff}
      onComplete={handleMorningMeetingComplete}
      onNavigateHome={onNavigateHome}
    />
  );
};

export default MorningMeetingController;
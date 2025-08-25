import React, { useState } from 'react';
import { HubSettings, Student, ScheduleActivity } from '../../types';
import MorningMeetingController from '../morning-meeting/MorningMeetingController';

// A placeholder for displaying regular activities. You can build this out further.
const ActivityDisplay: React.FC<{ activity: ScheduleActivity, onComplete: () => void }> = ({ activity, onComplete }) => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #3a6186 0%, #89253e 100%)', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{fontSize: '4rem', fontWeight: 700}}>Up Next: {activity.name}</h1>
      <p style={{fontSize: '1.5rem'}}>Duration: {activity.duration} minutes</p>
      <button onClick={onComplete} style={{padding: '1rem 2rem', fontSize: '1.2rem', marginTop: '2rem', cursor: 'pointer', borderRadius: '12px', border: 'none'}}>
        Finish Activity
      </button>
    </div>
);

interface SmartboardDisplayProps {
    students: Student[];
    staff?: any[]; // Add staff prop to match App.tsx usage
    hubSettings: HubSettings;
    currentSchedule?: {
        activities: ScheduleActivity[];
        startTime: string;
        name: string;
    };
    onNavigateHome: () => void;
    onNavigateToBuilder?: () => void; // Add onNavigateToBuilder prop to match App.tsx usage
}

const SmartboardDisplay: React.FC<SmartboardDisplayProps> = ({
  students,
  hubSettings,
  currentSchedule,
  onNavigateHome,
}) => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  if (!currentSchedule || !currentSchedule.activities || currentSchedule.activities.length === 0) {
    return (
        <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <h2>No schedule loaded for today.</h2>
            <button onClick={onNavigateHome}>Go Back</button>
        </div>
    );
  }

  const handleActivityComplete = () => {
    if (currentActivityIndex < currentSchedule.activities.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
    } else {
      // The entire day's schedule is finished
      onNavigateHome(); 
    }
  };

  const currentActivity = currentSchedule.activities[currentActivityIndex];

  // The key logic: Check if the current schedule item is Morning Meeting
  if (currentActivity.id === 'morning-meeting-placeholder' || currentActivity.name === "Morning Meeting") {
    return (
      <MorningMeetingController
        students={students}
        hubSettings={hubSettings}
        onClose={handleActivityComplete} // When MM is done, this advances the schedule
        onNavigateHome={onNavigateHome}   // The "Home" button will end the schedule
        onNavigateToDisplay={handleActivityComplete} // Alternative completion handler
      />
    );
  }

  // Otherwise, render a generic display for all other activities
  return (
    <ActivityDisplay 
        activity={currentActivity} 
        onComplete={handleActivityComplete} 
    />
  );
};

export default SmartboardDisplay;

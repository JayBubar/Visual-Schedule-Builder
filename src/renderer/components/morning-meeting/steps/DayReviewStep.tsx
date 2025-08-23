// src/renderer/components/morning-meeting/steps/DayReviewStep.tsx

import React from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

const DayReviewStep: React.FC<MorningMeetingStepProps> = ({
  currentDate,
  hubSettings,
  onStepComplete,
}) => {
  // FIX IS HERE: This logic is now corrected.
  // It filters for all announcements matching today's date.
  const todaysAnnouncements = React.useMemo(() => {
    if (!hubSettings?.dailyAnnouncements) {
      return [];
    }
    const todayStr = currentDate.toISOString().split('T')[0];
    return hubSettings.dailyAnnouncements.filter(
      (announcement) => announcement.date === todayStr
    );
  }, [hubSettings?.dailyAnnouncements, currentDate]);

  // This step can be considered complete as soon as it loads.
  React.useEffect(() => {
    if (onStepComplete) {
      onStepComplete();
    }
  }, [onStepComplete]);

  const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden',
        padding: '2rem',
        color: 'white',
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: 700,
        textShadow: '0 3px 6px rgba(0,0,0,0.2)',
        marginBottom: '1rem',
    },
    subtitle: {
        fontSize: '1.5rem',
        opacity: 0.9,
        marginBottom: '3rem',
    },
    announcementBox: {
        width: '100%',
        maxWidth: '800px',
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '24px',
        padding: '2rem',
        maxHeight: '50vh',
        overflowY: 'auto',
    },
    announcementItem: {
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '1.5rem',
        fontSize: '1.2rem',
        fontWeight: 500,
        marginBottom: '1rem',
    },
    noAnnouncements: {
        fontSize: '1.5rem',
        fontWeight: 600,
        textAlign: 'center',
        padding: '3rem',
        opacity: 0.8,
    },
  };

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.title}>📢 Today's Review</h1>
      <p style={styles.subtitle}>Let's see what's happening today!</p>

      <div style={styles.announcementBox}>
        {todaysAnnouncements.length > 0 ? (
          todaysAnnouncements.map((announcement) => (
            <div key={announcement.id} style={styles.announcementItem}>
              {announcement.text}
            </div>
          ))
        ) : (
          <div style={styles.noAnnouncements}>
            No announcements for today! ✨
          </div>
        )}
      </div>
    </div>
  );
};

export default DayReviewStep;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FIX: Corrected the import path to the central types file
import { MorningMeetingStepProps, Student } from '../types/morningMeetingTypes';

interface Celebration {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

const CelebrationStep: React.FC<MorningMeetingStepProps> = ({
  students = [],
  hubSettings,
  currentDate,
  onStepComplete,
}) => {
  const [internalSection, setInternalSection] = useState(0);

  const getFunHolidayForDate = useCallback((date: Date): Celebration => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateKey = `${month}-${day}`;
    
    const holidayDatabase: Record<string, Omit<Celebration, 'id'>> = {
      '8-26': { name: 'National Dog Day', emoji: '🐶', description: 'A day to celebrate our furry friends!' },
      '10-4': { name: 'National Taco Day', emoji: '🌮', description: 'Let\'s talk about this delicious food!' },
      '5-4': { name: 'Star Wars Day', emoji: '🚀', description: 'May the Fourth be with you!' },
    };

    const holiday = holidayDatabase[dateKey] || {
      name: 'Wonderful Wednesday',
      emoji: '✨',
      description: 'Every day is a great day to celebrate learning and friendship!',
    };
    return { id: dateKey, ...holiday };
  }, []);

  const funHoliday = useMemo(() => getFunHolidayForDate(currentDate), [currentDate, getFunHolidayForDate]);

  const birthdayStudents = useMemo(() => {
    return students.filter(student => {
      if (!student.birthday) return false;
      const birthday = new Date(student.birthday);
      return birthday.getMonth() === currentDate.getMonth() && birthday.getDate() === currentDate.getDate();
    });
  }, [students, currentDate]);

  const customCelebrations = useMemo(() => {
    return hubSettings?.celebrations?.customCelebrations || [];
  }, [hubSettings]);

  useEffect(() => {
    if (internalSection === 1) {
      onStepComplete?.();
    }
  }, [internalSection, onStepComplete]);

  const handleInternalNext = () => setInternalSection(1);
  const handleInternalBack = () => setInternalSection(0);

  const renderContent = () => {
    if (internalSection === 0) {
      return (
        <>
          <h2 style={styles.rightPanelTitle}>Today We Celebrate...</h2>
          <div style={styles.celebrationCard} className="pop-in">
            <div style={styles.celebrationEmoji}>{funHoliday.emoji}</div>
            <h3 style={styles.celebrationName}>{funHoliday.name}</h3>
            <p style={styles.celebrationDescription}>{funHoliday.description}</p>
          </div>
        </>
      );
    }

    if (internalSection === 1) {
      return (
        <>
          <h2 style={styles.rightPanelTitle}>Our Classroom's Celebrations</h2>
          <div style={styles.classroomCelebrationsContainer}>
            {birthdayStudents.length > 0 && (
              <div style={styles.celebrationSection}>
                <h4>🎂 Happy Birthday!</h4>
                {birthdayStudents.map(student => (
                  <div key={student.id} style={styles.studentCard}>
                    {student.photo && <img src={student.photo} alt={student.name} style={styles.studentPhoto} />}
                    <span>{student.name}</span>
                  </div>
                ))}
              </div>
            )}
            {customCelebrations.length > 0 && (
              <div style={styles.celebrationSection}>
                <h4>🌟 Special Announcements</h4>
                {customCelebrations.map(celeb => (
                  <div key={celeb.id} style={styles.customCard}>
                    {celeb.emoji} {celeb.message}
                  </div>
                ))}
              </div>
            )}
            {birthdayStudents.length === 0 && customCelebrations.length === 0 && (
              <p style={styles.rightPanelSubtitle}>No special classroom celebrations today.</p>
            )}
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.leftColumn}>
        <h1 style={styles.leftTitle}>🎉 Celebrations!</h1>
        <p style={styles.leftSubtitle}>Let's find something to celebrate today!</p>
        <div style={styles.divider}></div>
        <div style={styles.progressList}>
          <div onClick={() => setInternalSection(0)} style={{ ...styles.progressItem, ...(internalSection === 0 ? styles.progressItemActive : {}) }}>
            1. Today's Fun Holiday
          </div>
          <div onClick={() => setInternalSection(1)} style={{ ...styles.progressItem, ...(internalSection === 1 ? styles.progressItemActive : {}) }}>
            2. Our Classroom's Celebrations
          </div>
        </div>
      </div>
      <div style={styles.rightColumn}>
        {renderContent()}
        <div style={styles.internalNavBar}>
          {internalSection > 0 && <button onClick={handleInternalBack} style={styles.internalNavButton}>Back</button>}
          {internalSection < 1 && <button onClick={handleInternalNext} style={styles.internalNavButton}>Next Section</button>}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { height: '100%', display: 'flex', gap: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #FFD700 0%, #FF69B4 50%, #9D4EDD 100%)', fontFamily: 'system-ui, sans-serif' },
    leftColumn: { width: '350px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', color: 'white' },
    rightColumn: { flex: 1, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
    leftTitle: { fontSize: '2.5rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', marginBottom: '0.5rem' },
    leftSubtitle: { fontSize: '1.2rem', opacity: 0.8, marginBottom: '2rem' },
    divider: { height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.3)', margin: '1rem 0 2rem 0' },
    progressList: { flex: 1, overflowY: 'auto', cursor: 'pointer' },
    progressItem: { fontSize: '1.1rem', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem', fontWeight: 500, opacity: 0.7, transition: 'background-color 0.3s' },
    progressItemActive: { backgroundColor: 'rgba(255, 255, 255, 0.2)', opacity: 1, fontWeight: 600 },
    rightPanelTitle: { fontSize: '3rem', fontWeight: 700, color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.3)', textAlign: 'center', marginBottom: '2rem' },
    rightPanelSubtitle: { fontSize: '1.5rem', color: 'white', opacity: 0.9, textAlign: 'center' },
    celebrationCard: { width: '100%', maxWidth: '600px', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', padding: '3rem', textAlign: 'center', color: 'white' },
    celebrationEmoji: { fontSize: '6rem' },
    celebrationName: { fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0' },
    celebrationDescription: { fontSize: '1.2rem', opacity: 0.9 },
    classroomCelebrationsContainer: { width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' },
    celebrationSection: { width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1.5rem', color: 'white' },
    studentCard: { display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 500 },
    studentPhoto: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' },
    customCard: { background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', fontSize: '1.2rem' },
    internalNavBar: { position: 'absolute', bottom: '2rem', display: 'flex', gap: '1rem' },
    internalNavButton: { padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.5)' },
};

export default CelebrationStep;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FIX: Corrected the import path to the central types file
import { MorningMeetingStepProps, Student } from '../types/morningMeetingTypes';
import StepNavigation from '../common/StepNavigation';

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
  onNext,
  onBack,
  onHome,
  onStepComplete,
}) => {
  const [internalSection, setInternalSection] = useState(0);

const getFunHolidayForDate = useCallback((date: Date): Celebration => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateKey = `${month}-${day}`;
    
    const holidayDatabase: Record<string, Omit<Celebration, 'id'>> = {
      // January
      '1-1': { name: 'New Year\'s Day', emoji: '🎊', description: 'Welcome to a brand new year of learning!' },
      '1-19': { name: 'National Popcorn Day', emoji: '🍿', description: 'Pop into learning with this tasty treat!' },
      '1-29': { name: 'National Puzzle Day', emoji: '🧩', description: 'Every day is a puzzle to solve!' },
      
      // February
      '2-2': { name: 'Groundhog Day', emoji: '🐹', description: 'Will we see our shadow today?' },
      '2-14': { name: 'Valentine\'s Day', emoji: '💝', description: 'A day to show kindness and friendship!' },
      
      // March
      '3-2': { name: 'Read Across America Day', emoji: '📚', description: 'Let\'s celebrate the joy of reading!' },
      '3-17': { name: 'St. Patrick\'s Day', emoji: '🍀', description: 'A lucky day for learning!' },
      '3-20': { name: 'First Day of Spring', emoji: '🌸', description: 'Spring into new adventures!' },
      '3-31': { name: 'National Crayon Day', emoji: '🖍️', description: 'Color your world with creativity!' },
      
      // April
      '4-1': { name: 'April Fools\' Day', emoji: '😄', description: 'A day for harmless fun and giggles!' },
      '4-22': { name: 'Earth Day', emoji: '🌍', description: 'Let\'s take care of our beautiful planet!' },
      
      // May
      '5-1': { name: 'May Day', emoji: '🌺', description: 'Celebrate the beauty of spring!' },
      '5-4': { name: 'Star Wars Day', emoji: '🚀', description: 'May the Fourth be with you!' },
      
      // June
      '6-5': { name: 'World Environment Day', emoji: '🌱', description: 'Let\'s protect our environment!' },
      '6-8': { name: 'National Best Friends Day', emoji: '👫', description: 'Celebrate friendship and kindness!' },
      '6-21': { name: 'First Day of Summer', emoji: '☀️', description: 'Summer fun and learning begins!' },
      
      // July
      '7-4': { name: 'Independence Day', emoji: '🇺🇸', description: 'Celebrating freedom and community!' },
      
      // August
      '8-26': { name: 'National Dog Day', emoji: '🐶', description: 'A day to celebrate our furry friends!' },
      
      // September
      '9-8': { name: 'International Literacy Day', emoji: '📖', description: 'Reading opens doors to new worlds!' },
      '9-22': { name: 'First Day of Fall', emoji: '🍂', description: 'Fall into new learning adventures!' },
      
      // October
      '10-4': { name: 'National Taco Day', emoji: '🌮', description: 'Let\'s talk about this delicious food!' },
      '10-5': { name: 'World Teachers\' Day', emoji: '🍎', description: 'Celebrating all our amazing teachers!' },
      '10-31': { name: 'Halloween', emoji: '🎃', description: 'A spook-tacular day for fun!' },
      
      // November
      '11-3': { name: 'National Sandwich Day', emoji: '🥪', description: 'What\'s your favorite sandwich?' },
      '11-8': { name: 'National STEM Day', emoji: '🔬', description: 'Science, Technology, Engineering, and Math!' },
      '11-11': { name: 'Veterans Day', emoji: '🇺🇸', description: 'Honoring those who served our country!' },
      
      // December
      '12-4': { name: 'National Cookie Day', emoji: '🍪', description: 'Sweet treats and sweet learning!' },
      '12-10': { name: 'Human Rights Day', emoji: '🤝', description: 'Everyone deserves kindness and respect!' },
      '12-21': { name: 'First Day of Winter', emoji: '❄️', description: 'Winter wonderland of learning!' },
    };

    const holiday = holidayDatabase[dateKey] || {
      name: 'Wonderful Learning Day',
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
      
      {/* Step Navigation */}
      <StepNavigation navigation={{
        goNext: onNext,
        goBack: onBack,
        goHome: onHome,
        canGoBack: !!onBack,
        isLastStep: false
      }} />
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { 
        height: '100vh',
        background: 'linear-gradient(135deg, #FFD700 0%, #FF69B4 50%, #9D4EDD 100%)', 
        display: 'flex', 
        gap: '2rem', 
        padding: '2rem',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden'
    },
    leftColumn: { 
        width: '350px', 
        background: 'rgba(255, 255, 255, 0.2)', 
        backdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255, 255, 255, 0.2)', 
        borderRadius: '24px', 
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        color: 'white',
        height: 'fit-content',
        maxHeight: '100%',
        overflow: 'hidden'
    },
    rightColumn: { 
        flex: 1, 
        background: 'rgba(255, 255, 255, 0.2)', 
        backdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255, 255, 255, 0.2)', 
        borderRadius: '24px', 
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '0'
    },
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
    internalNavBar: { 
        position: 'absolute', 
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', 
        gap: '1rem',
        zIndex: 10
    },
    internalNavButton: { padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.5)' },
};

export default CelebrationStep;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';
import StepNavigation from '../common/StepNavigation';

const DayReviewStep: React.FC<MorningMeetingStepProps> = ({
  currentDate,
  hubSettings,
  onNext,
  onBack,
  onHome,
  onStepComplete,
}) => {
  const [internalSection, setInternalSection] = useState(0);

  const classroomRules = useMemo(() => hubSettings?.behaviorStatements?.statements || [], [hubSettings]);

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  // FIXED: Full date format as requested
  const fullDate = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${dayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}${getOrdinalSuffix(currentDate.getDate())}, ${currentDate.getFullYear()}`;
  }, [currentDate]);

  useEffect(() => {
    // The DayReviewStep is complete when on the final slide
    if (internalSection === 1) {
      onStepComplete?.();
    }
  }, [internalSection, onStepComplete]);

  const handleInternalNext = () => { if (internalSection < 1) setInternalSection(internalSection + 1); };
  const handleInternalBack = () => { if (internalSection > 0) setInternalSection(internalSection - 1); };

  const renderContent = () => {
    switch (internalSection) {
      case 0: // Classroom Rules Review
        return (
          <>
            <h2 style={styles.rightPanelTitle}>Classroom Rules Review</h2>
            <div style={styles.rulesContainer}>
              {hubSettings?.behaviorStatements?.enabled && hubSettings?.behaviorStatements?.statements?.length > 0 ? (
                hubSettings.behaviorStatements.statements.map((rule, index) => (
                  <div key={index} style={styles.ruleItem}>
                    <span style={styles.ruleEmoji}>{typeof rule === 'object' ? rule.emoji || '⭐' : '⭐'}</span>
                    <span>{typeof rule === 'object' ? rule.text : rule}</span>
                  </div>
                ))
              ) : (
                <p style={styles.rightPanelSubtitle}>No classroom rules have been configured in Morning Meeting Hub.</p>
              )}
            </div>
          </>
        );
      case 1: // FIXED: Today's Summary - Restructured content order
        return (
          <>
            {/* REMOVED: "Today's Summary" header and calendar icon */}
            {/* ADDED: Full date format as main header */}
            <h2 style={styles.dateHeader}>{fullDate}</h2>
            
            {/* REORDERED: Content in new sequence */}
            <div style={styles.summaryContainer}>
              
              {/* 2. Next Activity */}
              <div style={styles.summaryBox}>
                <h4>🎯 Next Activity</h4>
                <p>Morning Meeting is finishing - get ready for our first learning activity!</p>
              </div>
              
              {/* 3. Announcements */}
              <div style={styles.summaryBox}>
                <h4>📢 Announcements</h4>
                {hubSettings?.todaysAnnouncements?.enabled && hubSettings?.todaysAnnouncements?.announcements?.length > 0 ? (
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem' }}>
                    {hubSettings.todaysAnnouncements.announcements
                      .filter(announcement => announcement.trim())
                      .map((announcement, index) => (
                        <li key={index} style={{ marginBottom: '0.5rem' }}>
                          {announcement}
                        </li>
                      ))
                    }
                  </ul>
                ) : (
                  <p>No special announcements today!</p>
                )}
              </div>
              
              {/* 4. Positive Message */}
              <div style={styles.summaryBox}>
                <h4>💖 Positive Message</h4>
                <p>"Let's have a wonderful day of learning and kindness!"</p>
              </div>
              
            </div>
            
            {/* ADDED: "Start the Day" transition button */}
            <div style={styles.transitionButtonContainer}>
              <button 
                style={styles.startDayButton}
                onClick={() => {
                  // This will eventually link to 90-second transition functionality
                  console.log('🚀 Starting the day! Transition to activities...');
                  onNext?.(); // For now, proceed to next step
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 193, 7, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 193, 7, 0.3)';
                }}
              >
                🌟 Start the Day! 🌟
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.leftColumn}>
        <h1 style={styles.leftTitle}>📢 Day Review</h1>
        <p style={styles.leftSubtitle}>Let's get ready for a great day!</p>
        <div style={styles.divider}></div>
        <div style={styles.progressList}>
          <div onClick={() => setInternalSection(0)} style={{ ...styles.progressItem, ...(internalSection === 0 ? styles.progressItemActive : {}) }}>1. Rules Review</div>
          <div onClick={() => setInternalSection(1)} style={{ ...styles.progressItem, ...(internalSection === 1 ? styles.progressItemActive : {}) }}>2. Ready to Start</div>
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

// Enhanced styles with new transition button and date header
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { 
        height: '100vh',
        background: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)', 
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
    
    // FIXED: New date header style for full date format
    dateHeader: { 
        fontSize: '2.5rem', 
        fontWeight: 700, 
        color: 'white', 
        textShadow: '0 2px 5px rgba(0,0,0,0.3)', 
        textAlign: 'center', 
        marginBottom: '2rem',
        background: 'linear-gradient(45deg, #FFD93D, #FF6B6B)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: '1.2'
    },
    
    rulesContainer: { width: '100%', maxWidth: '700px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '2rem' },
    ruleItem: { display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', color: 'white', fontSize: '1.2rem', fontWeight: 500 },
    ruleEmoji: { fontSize: '1.5rem' },
    summaryContainer: { width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' },
    summaryBox: { width: '100%', maxWidth: '600px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1.5rem', color: 'white', textAlign: 'center' },
    
    // ADDED: Transition button styles
    transitionButtonContainer: {
        marginTop: '2rem',
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
    },
    
    startDayButton: {
        background: 'linear-gradient(135deg, #FFD93D 0%, #FF8E53 100%)',
        border: 'none',
        borderRadius: '25px',
        color: 'white',
        padding: '1.5rem 3rem',
        fontSize: '1.5rem',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 10px 30px rgba(255, 193, 7, 0.3)',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        minWidth: '200px'
    },
    
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

export default DayReviewStep;
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
      case 0: // Classroom Rules
        return (
          <>
            <h2 style={styles.rightPanelTitle}>Classroom Rules Review</h2>
            <div style={styles.rulesContainer}>
              {/* Use Hub data instead of hardcoded rules */}
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
      case 1: // Today's Summary
        return (
          <>
            <h2 style={styles.rightPanelTitle}>Today's Summary</h2>
            <div style={styles.summaryContainer}>
              <div style={styles.summaryBox}>
                <h4>🗓️ Today's Date</h4>
                <p>{fullDate}</p>
              </div>
              <div style={styles.summaryBox}>
                <h4>📢 Announcements</h4>
                {/* Connect to Hub data using new property name */}
                {hubSettings?.todaysAnnouncements?.enabled && hubSettings?.todaysAnnouncements?.announcements?.length > 0 ? (
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem' }}>
                    {hubSettings.todaysAnnouncements.announcements
                      .filter(announcement => announcement.trim()) // Filter out empty announcements
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
              <div style={styles.summaryBox}>
                <h4>💖 Positive Message</h4>
                <p>"Let's have a wonderful day of learning and kindness!"</p>
              </div>
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
          <div onClick={() => setInternalSection(1)} style={{ ...styles.progressItem, ...(internalSection === 1 ? styles.progressItemActive : {}) }}>2. Today's Summary</div>
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
    rulesContainer: { width: '100%', maxWidth: '700px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '2rem' },
    ruleItem: { display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', color: 'white', fontSize: '1.2rem', fontWeight: 500 },
    ruleEmoji: { fontSize: '1.5rem' },
    summaryContainer: { width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' },
    summaryBox: { width: '100%', maxWidth: '600px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1.5rem', color: 'white', textAlign: 'center' },
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

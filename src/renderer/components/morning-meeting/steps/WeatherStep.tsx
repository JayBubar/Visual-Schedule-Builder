import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

const CalendarMathStep: React.FC<MorningMeetingStepProps> = ({ currentDate, onStepComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  // State for each interactive part of the flow
  const [yearRevealed, setYearRevealed] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());
  const [monthRevealed, setMonthRevealed] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [todayRevealed, setTodayRevealed] = useState(false);
  const [yesterdayRevealed, setYesterdayRevealed] = useState(false);
  const [tomorrowRevealed, setTomorrowRevealed] = useState(false);

  const today = useMemo(() => currentDate || new Date(), [currentDate]);
  const monthNames = useMemo(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);
  const dayNames = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], []);
  const monthEmojis = useMemo(() => ['❄️', '💕', '🌸', '🌷', '🌺', '☀️', '🏖️', '🌻', '🍎', '🎃', '🦃', '🎄'], []);

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const yesterday = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() - 1); return d; }, [today]);
  const tomorrow = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() + 1); return d; }, [today]);

  const steps = useMemo(() => [
    { id: 'year', question: "What year is it?" },
    { id: 'count-months', question: "How many months are in a year?" },
    { id: 'current-month', question: "What month are we in?" },
    { id: 'days-in-month', question: `How many days are in ${monthNames[today.getMonth()]}?` },
    { id: 'days-in-week', question: "What are the days of the week?" },
    { id: 'today', question: "What is today?" },
    { id: 'yesterday', question: "That means yesterday was..." },
    { id: 'tomorrow', question: "Then what is tomorrow?" },
    { id: 'final', question: "Let's see the full date again!" },
  ], [today, monthNames]);

  const triggerCelebration = useCallback((message: string, callback?: () => void) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      callback?.();
    }, 2500);
  }, []);

  const advanceStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length]);
  
  const markStepComplete = useCallback((index: number, celebrationMessage: string) => {
    if (completedSteps.has(index)) {
      advanceStep();
      return;
    }
    triggerCelebration(celebrationMessage, advanceStep);
    setCompletedSteps(prev => new Set(prev).add(index));
  }, [triggerCelebration, advanceStep, completedSteps]);

  useEffect(() => {
    if (completedSteps.size === steps.length) {
      onStepComplete?.();
    }
  }, [completedSteps, steps.length, onStepComplete]);
  
  const handleSelectMonth = (index: number) => {
      const newSelection = new Set(selectedMonths).add(index);
      setSelectedMonths(newSelection);
      if (newSelection.size === 12) {
          markStepComplete(1, "You found all 12 months! 🎉");
      }
  };
  
  const handleSelectDay = (index: number) => {
      const newSelection = new Set(selectedDays).add(index);
      setSelectedDays(newSelection);
      if (newSelection.size === 7) {
          markStepComplete(4, "Great job! That's all 7 days of the week!");
      }
  };

  const renderRightPanelContent = () => {
    const step = steps[currentStep];
    switch(step.id) {
        case 'year':
            return (
                <div style={styles.revealContainer}>
                    {yearRevealed ? (
                        <div style={styles.revealedContent} className="pop-in">{today.getFullYear()}</div>
                    ) : (
                        <button style={styles.actionButton} onClick={() => { setYearRevealed(true); markStepComplete(0, `That's right, it's ${today.getFullYear()}! 🥳`); }}>🔍 Reveal the Year</button>
                    )}
                </div>
            );
        case 'count-months':
            return (
                <div style={styles.gridContainerMonths}>
                    {monthNames.map((month, index) => (
                        <div key={month} onClick={() => handleSelectMonth(index)} style={{...styles.card, ...(selectedMonths.has(index) ? styles.cardSelected : {})}}>
                            <div style={styles.cardEmoji}>{monthEmojis[index]}</div>
                            <div style={styles.cardTitle}>{month}</div>
                        </div>
                    ))}
                </div>
            );
        case 'current-month':
             return (
                <div style={styles.revealContainer}>
                    {monthRevealed ? (
                        <div style={styles.revealedContent} className="pop-in">{monthNames[today.getMonth()]}</div>
                    ) : (
                        <button style={styles.actionButton} onClick={() => { setMonthRevealed(true); markStepComplete(2, `Yes! We are in ${monthNames[today.getMonth()]}!`); }}>🔍 Reveal the Month</button>
                    )}
                </div>
            );
        case 'days-in-month':
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            return <div style={styles.fullDateDisplay} className="pop-in">{monthNames[today.getMonth()]} has {daysInMonth} days.</div>
        case 'days-in-week':
            return (
                <div style={styles.gridContainerDays}>
                    {dayNames.map((day, index) => (
                        <div key={day} onClick={() => handleSelectDay(index)} style={{...styles.dayCircle, ...(selectedDays.has(index) ? styles.cardSelected : {})}}>
                            {day}
                        </div>
                    ))}
                </div>
            );
        case 'today':
            return (
                <div style={styles.revealContainer}>
                    {todayRevealed ? (
                        <div style={styles.fullDateDisplay} className="pop-in">
                            {dayNames[today.getDay()]}, {monthNames[today.getMonth()]} {today.getDate()}{getOrdinalSuffix(today.getDate())}
                        </div>
                    ) : (
                        <button style={styles.actionButton} onClick={() => { setTodayRevealed(true); markStepComplete(5, "You got it! That's today!"); }}>🔍 Reveal Today</button>
                    )}
                </div>
            );
        case 'yesterday':
            return (
                 <div style={styles.timelineContainer}>
                    <div style={{...styles.timelineBox, ...(yesterdayRevealed ? styles.timelineBoxRevealed : {})}}>
                        {yesterdayRevealed ? `${dayNames[yesterday.getDay()]}, ${yesterday.getDate()}${getOrdinalSuffix(yesterday.getDate())}` : '❓'}
                    </div>
                    <div style={{...styles.timelineBox, ...styles.timelineBoxToday}}>{dayNames[today.getDay()]}</div>
                    {!yesterdayRevealed && <button style={styles.actionButton} onClick={() => { setYesterdayRevealed(true); markStepComplete(6, "That was yesterday!"); }}>🔍 Reveal Yesterday</button>}
                </div>
            );
        case 'tomorrow':
            return (
                 <div style={styles.timelineContainer}>
                    <div style={{...styles.timelineBox, ...styles.timelineBoxToday}}>{dayNames[today.getDay()]}</div>
                    <div style={{...styles.timelineBox, ...(tomorrowRevealed ? styles.timelineBoxRevealed : {})}}>
                         {tomorrowRevealed ? `${dayNames[tomorrow.getDay()]}, ${tomorrow.getDate()}${getOrdinalSuffix(tomorrow.getDate())}` : '❓'}
                    </div>
                    {!tomorrowRevealed && <button style={styles.actionButton} onClick={() => { setTomorrowRevealed(true); markStepComplete(7, "And that's tomorrow!"); }}>🔍 Reveal Tomorrow</button>}
                </div>
            );
        case 'final':
            return (
                 <div style={styles.fullDateDisplay} className="pop-in">
                    Today is {dayNames[today.getDay()]}, {monthNames[today.getMonth()]} {today.getDate()}{getOrdinalSuffix(today.getDate())}, {today.getFullYear()}! 🎉
                </div>
            );
        default: return null;
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.leftColumn}>
        <h1 style={styles.leftTitle}>📅 Calendar Math</h1>
        <p style={styles.leftSubtitle}>Let's learn about the date!</p>
        <div style={styles.divider}></div>
        <div style={styles.progressList}>
          {steps.map((s, index) => (
            <div key={s.id} onClick={() => setCurrentStep(index)} style={{ ...styles.progressItem, ...(currentStep === index ? styles.progressItemActive : {}), ...(completedSteps.has(index) ? styles.progressItemCompleted : {}) }}>
              <span style={styles.progressCheck}>{completedSteps.has(index) ? '✅' : '➡️'}</span>
              {s.question}
            </div>
          ))}
        </div>
      </div>
      <div style={styles.rightColumn}>
          {renderRightPanelContent()}
      </div>
      {showCelebration && (
        <div style={styles.celebrationOverlay}>
            <div style={styles.celebrationMessage} className="pop-in">{celebrationMessage}</div>
        </div>
       )}
       <style>{`
        .pop-in {
            animation: popInAnimation 0.5s ease-out forwards;
        }
        @keyframes popInAnimation {
            0% { transform: scale(0.5); opacity: 0; }
            80% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }
       `}</style>
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { height: '100%', display: 'flex', gap: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: 'system-ui, sans-serif' },
    leftColumn: { width: '350px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', color: 'white' },
    rightColumn: { flex: 1, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    leftTitle: { fontSize: '2.5rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', marginBottom: '0.5rem' },
    leftSubtitle: { fontSize: '1.2rem', opacity: 0.8, marginBottom: '2rem' },
    divider: { height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.3)', margin: '1rem 0 2rem 0' },
    progressList: { flex: 1, overflowY: 'auto', cursor: 'pointer' },
    progressItem: { fontSize: '1.1rem', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', fontWeight: 500, opacity: 0.6, display: 'flex', alignItems: 'center', transition: 'background-color 0.3s' },
    progressItemActive: { backgroundColor: 'rgba(255, 255, 255, 0.2)', opacity: 1, fontWeight: 600 },
    progressItemCompleted: { opacity: 1, textDecoration: 'line-through' },
    progressCheck: { marginRight: '0.75rem', fontSize: '1.2rem' },
    revealContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' },
    revealedContent: { fontSize: '8rem', fontWeight: 'bold', color: 'white', background: 'rgba(0,0,0,0.2)', padding: '2rem 4rem', borderRadius: '24px' },
    actionButton: { padding: '1.5rem 3rem', fontSize: '2rem', background: 'linear-gradient(45deg, #ffc107 0%, #ff8008 100%)', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    gridContainerMonths: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', width: '100%', alignItems: 'center' },
    card: { background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '16px', padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', color: '#333' },
    cardSelected: { background: 'linear-gradient(135deg, #28a745, #20c997)', transform: 'scale(1.05)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', color: 'white' },
    cardEmoji: { fontSize: '2.5rem' },
    cardTitle: { fontSize: '1.2rem', fontWeight: 600 },
    fullDateDisplay: { fontSize: '3.5rem', fontWeight: 'bold', textAlign: 'center', color: 'white', background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '16px' },
    gridContainerDays: { display: 'flex', flexWrap: 'wrap', gap: '1rem', width: '100%', alignItems: 'center', justifyContent: 'center' },
    dayCircle: { background: 'rgba(255, 255, 255, 0.8)', borderRadius: '16px', width: '140px', padding: '2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, color: '#333', cursor: 'pointer', transition: 'all 0.2s ease-in-out' },
    timelineContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' },
    timelineBox: { background: 'rgba(255,255,255,0.2)', borderRadius: '16px', padding: '2rem', fontSize: '2rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textAlign: 'center', minWidth: '200px' },
    timelineBoxToday: { background: 'rgba(255,255,255,0.8)', color: '#333', transform: 'scale(1.1)' },
    timelineBoxRevealed: { background: '#ffc107', color: 'black' },
    celebrationOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    celebrationMessage: { padding: '2rem 4rem', background: 'linear-gradient(45deg, #28a745, #20c997)', color: 'white', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontSize: '2rem', fontWeight: 700 },
};

export default CalendarMathStep;
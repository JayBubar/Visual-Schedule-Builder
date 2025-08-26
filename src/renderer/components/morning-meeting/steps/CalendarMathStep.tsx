import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';
import StepNavigation from '../common/StepNavigation';

// Helper function to get video URL from various possible formats
const getVideoUrl = (video: any): string | null => {
  if (video?.videoData?.videoUrl) return video.videoData.videoUrl;
  if (video?.url) return video.url;
  if (typeof video === 'string') return video;
  return null;
};

const CalendarMathStep: React.FC<MorningMeetingStepProps> = ({ currentDate, hubSettings, onNext, onBack, onStepComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());
  const [monthRevealed, setMonthRevealed] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [yesterdayRevealed, setYesterdayRevealed] = useState(false);
  const [tomorrowRevealed, setTomorrowRevealed] = useState(false);

  const today = useMemo(() => currentDate || new Date(), [currentDate]);
  const monthNames = useMemo(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);
  const dayNames = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], []);
  const monthEmojis = useMemo(() => ['❄️', '💕', '🌸', '🌷', '🌺', '☀️', '🏖️', '🌻', '🍎', '🎃', '🦃', '🎄'], []);
  
  const calendarVideos = useMemo(() => hubSettings?.videos?.calendarMath || [], [hubSettings]);
  
  const yesterday = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() - 1); return d; }, [today]);
  const tomorrow = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() + 1); return d; }, [today]);

  const steps = useMemo(() => [
    { 
      id: 'say-months', 
      question: "I can say the months of the year in order.",
      standard: "K.H.2" 
    },
    { 
      id: 'name-month', 
      question: "I can name the month we are in.",
      standard: "K.H.2 / ELA.K.F.1.3"
    },
    { 
      id: 'count-days-in-month', 
      question: "I can count the days in a month.",
      standard: "K.NR.1.1" 
    },
    // MODIFICATION: Updated question to include counting
    { 
      id: 'say-days-of-week', 
      question: "I can count and say the days of the week in order.",
      standard: "ELA.K.F.1.1"
    },
    { 
      id: 'name-today-yesterday-tomorrow', 
      question: "I can name today, yesterday, and tomorrow.",
      standard: "K.H.2"
    },
    {
      id: 'calendar-patterns',
      question: "I can see patterns on a calendar.",
      standard: "K.PAFR.2.1"
    }
  ], []);

  const triggerCelebration = useCallback((message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  }, []);
  
  const markStepComplete = useCallback((index: number, celebrationMessage: string) => {
    if (completedSteps.has(index)) return;
    triggerCelebration(celebrationMessage);
    setCompletedSteps(prev => new Set(prev).add(index));
  }, [triggerCelebration, completedSteps]);

  // NOTE: The automatic onStepComplete is removed. The user now clicks a "Finish" button.
  
  const handleSelectMonth = (index: number) => {
      const newSelection = new Set(selectedMonths).add(index);
      setSelectedMonths(newSelection);
      if (newSelection.size === 12) {
          markStepComplete(0, "You found all 12 months! 🎉");
      }
  };
  
  const handleSelectDay = (index: number) => {
      const newSelection = new Set(selectedDays).add(index);
      setSelectedDays(newSelection);
      if (newSelection.size === 7) {
          markStepComplete(3, "Great job! That's all 7 days!");
      }
  };

  const handleInternalNext = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
  const handleInternalBack = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const isStepTaskComplete = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return false;
    switch(step.id) {
        case 'say-months': return selectedMonths.size === 12;
        case 'name-month': return monthRevealed;
        case 'count-days-in-month': 
            if (!completedSteps.has(2)) {
                markStepComplete(2, `Let's count the days!`);
            }
            return true;
        case 'say-days-of-week': return selectedDays.size === 7;
        case 'name-today-yesterday-tomorrow': return yesterdayRevealed && tomorrowRevealed;
        case 'calendar-patterns': 
            if (!completedSteps.has(5)) {
                 markStepComplete(5, `Look for patterns!`);
            }
            return true;
        default: return false;
    }
  }, [currentStep, steps, selectedMonths, monthRevealed, selectedDays, yesterdayRevealed, tomorrowRevealed, completedSteps, markStepComplete]);

  const getDaysInMonth = (year: number, month: number): Date[] => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const daysInMonth = useMemo(() => getDaysInMonth(today.getFullYear(), today.getMonth()), [today]);

  const renderRightPanelContent = () => {
    const step = steps[currentStep];
    switch(step.id) {
        case 'say-months':
            return (
                <div style={styles.gridContainerMonths}>
                    {monthNames.map((month, index) => (
                        <div key={month} onClick={() => handleSelectMonth(index)} style={{...styles.card, ...(selectedMonths.has(index) ? styles.cardSelected : {})}}>
                            <div style={styles.cardNumber}>{index + 1}</div>
                            <div style={styles.cardEmoji}>{monthEmojis[index]}</div>
                            <div style={styles.cardTitle}>{month}</div>
                        </div>
                    ))}
                </div>
            );
        case 'name-month':
             return (
                <div style={styles.revealContainer}>
                    {monthRevealed ? (
                        <div style={styles.revealedContent} className="pop-in">{monthNames[today.getMonth()]}</div>
                    ) : (
                        <button style={styles.actionButton} onClick={() => { setMonthRevealed(true); markStepComplete(1, `Yes! We are in ${monthNames[today.getMonth()]}!`); }}>🔍 Reveal the Month</button>
                    )}
                </div>
            );
        case 'count-days-in-month':
        case 'calendar-patterns':
            return (
                <div style={styles.calendarGrid}>
                    {dayNames.map(day => <div key={day} style={styles.calendarHeader}>{day.substring(0, 3)}</div>)}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                    {daysInMonth.map(day => {
                        let dayStyle = styles.calendarDay;
                        if (day.getDate() === today.getDate()) {
                            dayStyle = {...dayStyle, ...styles.calendarDayToday};
                        }
                        if (step.id === 'calendar-patterns') {
                            if (day.getDate() % 2 === 0) dayStyle = {...dayStyle, ...styles.patternA};
                            else dayStyle = {...dayStyle, ...styles.patternB};
                        }
                        return (
                            <div key={day.toISOString()} style={dayStyle}>
                                {day.getDate()}
                            </div>
                        );
                    })}
                </div>
            );
        // MODIFICATION: Updated this case to include numbers for counting
        case 'say-days-of-week':
            return (
                <div style={styles.gridContainerDays}>
                    {dayNames.map((day, index) => (
                        <div key={day} onClick={() => handleSelectDay(index)} style={{...styles.dayCircle, ...(selectedDays.has(index) ? styles.cardSelected : {})}}>
                            <span style={styles.dayNumber}>{index + 1}</span>
                            {day}
                        </div>
                    ))}
                </div>
            );
        case 'name-today-yesterday-tomorrow':
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={styles.timelineContainer}>
                        <div style={{...styles.timelineBox, ...(yesterdayRevealed ? styles.timelineBoxRevealed : {})}}>
                            <div style={styles.timelineLabel}>Yesterday</div>
                            {yesterdayRevealed ? dayNames[yesterday.getDay()] : '❓'}
                        </div>
                        <div style={{...styles.timelineBox, ...styles.timelineBoxToday}}>
                            <div style={styles.timelineLabel}>Today</div>
                            {dayNames[today.getDay()]}
                        </div>
                        <div style={{...styles.timelineBox, ...(tomorrowRevealed ? styles.timelineBoxRevealed : {})}}>
                             <div style={styles.timelineLabel}>Tomorrow</div>
                            {tomorrowRevealed ? dayNames[tomorrow.getDay()] : '❓'}
                        </div>
                    </div>
                     {!tomorrowRevealed && (
                        <button style={styles.actionButton} onClick={() => {
                            setYesterdayRevealed(true);
                            setTomorrowRevealed(true);
                            markStepComplete(4, "Awesome!");
                        }}>🔍 Reveal All</button>
                    )}
                </div>
            );
        default: return null;
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.leftColumn}>
        <h1 style={styles.leftTitle}>📅 Calendar Skills</h1>
        <p style={styles.leftSubtitle}>Let's learn about the date!</p>
        <div style={styles.divider}></div>
        <div style={styles.progressList}>
          {steps.map((s, index) => (
            <div key={s.id} onClick={() => setCurrentStep(index)} style={{ ...styles.progressItem, ...(currentStep === index ? styles.progressItemActive : {}), ...(completedSteps.has(index) ? styles.progressItemCompleted : {}) }}>
              <span style={styles.progressCheck}>{completedSteps.has(index) ? '✅' : '➡️'}</span>
              <div>
                {s.question}
                <div style={styles.standardText}>Standard: {s.standard}</div>
              </div>
            </div>
          ))}
        </div>
        
        {calendarVideos.length > 0 && (
          <button style={styles.videoButton} onClick={() => {
            const videoUrl = getVideoUrl(calendarVideos[0]);
            if (videoUrl) window.open(videoUrl, '_blank', 'width=800,height=600');
          }}>
            🎬 Watch a Calendar Video
          </button>
        )}
      </div>
      <div style={styles.rightColumn}>
          <h2 style={styles.rightPanelTitle}>{steps[currentStep]?.question}</h2>
          <div style={styles.contentContainer}>
            {renderRightPanelContent()}
          </div>
          {/* FIX: This navigation logic now includes a "Finish" button for the last step */}
          <div style={styles.internalNavBar}>
            {currentStep > 0 && <button onClick={handleInternalBack} style={styles.internalNavButton}>Back</button>}
            
            {currentStep < steps.length - 1 ? (
              <button onClick={handleInternalNext} disabled={!isStepTaskComplete()} style={{...styles.internalNavButton, ...(!isStepTaskComplete() ? styles.disabledButton : {})}}>Next Section</button>
            ) : (
              <button onClick={onStepComplete} disabled={!isStepTaskComplete()} style={{...styles.finishButton, ...(!isStepTaskComplete() ? styles.disabledButton : {})}}>
                Finish Calendar Skills ✔️
              </button>
            )}
          </div>
      </div>
      {showCelebration && (
        <div style={styles.celebrationOverlay}>
            <div style={styles.celebrationMessage} className="pop-in">{celebrationMessage}</div>
        </div>
       )}

      {/* Standardized Navigation */}
      <StepNavigation navigation={{
        goNext: onNext,
        goBack: onBack,
        canGoBack: !!onBack,
        isLastStep: false
      }} />

       <style>{`.pop-in { animation: popIn 0.5s ease-out forwards; } @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
};

// MODIFICATION: Added styles for day numbers and the new finish button
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { height: '100%', display: 'flex', gap: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: 'system-ui, sans-serif' },
    leftColumn: { width: '400px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', color: 'white' },
    rightColumn: { flex: 1, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
    leftTitle: { fontSize: '2.5rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', marginBottom: '0.5rem' },
    leftSubtitle: { fontSize: '1.2rem', opacity: 0.8, marginBottom: '2rem' },
    divider: { height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.3)', margin: '1rem 0 2rem 0' },
    progressList: { flex: 1, overflowY: 'auto' },
    progressItem: { fontSize: '1.1rem', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', fontWeight: 500, opacity: 0.6, display: 'flex', alignItems: 'center', transition: 'background-color 0.3s', cursor: 'pointer' },
    progressItemActive: { backgroundColor: 'rgba(255, 255, 255, 0.2)', opacity: 1, fontWeight: 600 },
    progressItemCompleted: { opacity: 1, textDecoration: 'line-through' },
    progressCheck: { marginRight: '0.75rem', fontSize: '1.2rem' },
    standardText: { fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' },
    rightPanelTitle: { fontSize: '2.5rem', fontWeight: 700, color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.3)', textAlign: 'center', marginBottom: '1rem' },
    contentContainer: { flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    revealContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' },
    revealedContent: { fontSize: '8rem', fontWeight: 'bold', color: 'white', background: 'rgba(0,0,0,0.2)', padding: '2rem 4rem', borderRadius: '24px' },
    actionButton: { padding: '1.5rem 3rem', fontSize: '2rem', background: 'linear-gradient(45deg, #ffc107 0%, #ff8008 100%)', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    gridContainerMonths: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', width: '100%', alignItems: 'center' },
    card: { position: 'relative', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '16px', padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', color: '#333' },
    cardSelected: { background: 'linear-gradient(135deg, #28a745, #20c997)', transform: 'scale(1.05)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', color: 'white' },
    cardNumber: { position: 'absolute', top: '5px', left: '10px', fontSize: '1rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.2)' },
    cardEmoji: { fontSize: '2.5rem' },
    cardTitle: { fontSize: '1.2rem', fontWeight: 600 },
    gridContainerDays: { display: 'flex', flexWrap: 'wrap', gap: '1rem', width: '100%', alignItems: 'center', justifyContent: 'center' },
    dayCircle: { background: 'rgba(255, 255, 255, 0.8)', borderRadius: '16px', width: '180px', padding: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, color: '#333', cursor: 'pointer', transition: 'all 0.2s ease-in-out', gap: '10px' },
    dayNumber: { background: 'rgba(0,0,0,0.1)', color: '#333', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    timelineContainer: { display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: '1rem', width: '100%' },
    timelineBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', padding: '2rem', fontSize: '2.5rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textAlign: 'center', flex: 1 },
    timelineLabel: { fontSize: '1rem', fontWeight: 'normal', opacity: 0.8, marginBottom: '0.5rem' },
    timelineBoxToday: { background: 'rgba(255,255,255,0.8)', color: '#333', transform: 'scale(1.1)' },
    timelineBoxRevealed: { background: '#ffc107', color: 'black' },
    calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', width: '100%', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '16px' },
    calendarHeader: { textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'white', paddingBottom: '0.5rem' },
    calendarDay: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', fontSize: '1.5rem', color: '#333' },
    calendarDayToday: { background: '#ffc107', color: 'black', fontWeight: 'bold' },
    patternA: { background: 'rgba(135, 206, 250, 0.7)' }, 
    patternB: { background: 'rgba(255, 160, 122, 0.7)' }, 
    internalNavBar: { position: 'absolute', bottom: '2rem', display: 'flex', gap: '1rem' },
    internalNavButton: { padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', background: 'rgba(0, 86, 179, 0.7)', color: 'white', border: '1px solid rgba(255,255,255,0.5)' },
    finishButton: { padding: '0.8rem 2rem', fontSize: '1.2rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', background: 'linear-gradient(45deg, #28a745, #20c997)', color: 'white', border: 'none' },
    disabledButton: { background: 'rgba(108, 117, 125, 0.7)', cursor: 'not-allowed', color: 'rgba(255,255,255,0.5)' },
    celebrationOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    celebrationMessage: { padding: '2rem 4rem', background: 'linear-gradient(45deg, #28a745, #20c997)', color: 'white', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontSize: '2rem', fontWeight: 700 },
    videoButton: { marginTop: 'auto', padding: '1rem', fontSize: '1rem', background: 'rgba(0, 86, 179, 0.7)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 },
};

export default CalendarMathStep;

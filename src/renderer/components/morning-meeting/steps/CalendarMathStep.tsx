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

const CalendarMathStep: React.FC<MorningMeetingStepProps> = ({ currentDate, hubSettings, onNext, onBack, onHome, onStepComplete }) => {
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
  const monthEmojis = useMemo(() => ['❄️', '💕', '🌸', '🌷', '🌺', '☀️', '🌞', '🌻', '🍎', '🎃', '🦃', '🎄'], []);
  
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

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

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

  const renderMainContent = () => {
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
                <div style={styles.timelineSection}>
                    {/* Single month header */}
                    <h3 style={styles.monthHeader}>
                        {monthNames[today.getMonth()]} {today.getFullYear()}
                    </h3>
                    
                    {/* Three date boxes */}
                    <div style={styles.timelineContainer}>
                        <div style={{...styles.timelineBox, ...(yesterdayRevealed ? styles.timelineBoxRevealed : {})}}>
                            <div style={styles.timelineLabel}>Yesterday</div>
                            <div style={styles.dateNumber}>
                                {yesterdayRevealed ? `${yesterday.getDate()}${getOrdinalSuffix(yesterday.getDate())}` : '?'}
                            </div>
                            {yesterdayRevealed && <div style={styles.dayName}>{dayNames[yesterday.getDay()]}</div>}
                        </div>
                        
                        <div style={{...styles.timelineBox, ...styles.timelineBoxToday}}>
                            <div style={styles.timelineLabel}>Today</div>
                            <div style={styles.dateNumber}>
                                {today.getDate()}{getOrdinalSuffix(today.getDate())}
                            </div>
                            <div style={styles.dayName}>{dayNames[today.getDay()]}</div>
                        </div>
                        
                        <div style={{...styles.timelineBox, ...(tomorrowRevealed ? styles.timelineBoxRevealed : {})}}>
                            <div style={styles.timelineLabel}>Tomorrow</div>
                            <div style={styles.dateNumber}>
                                {tomorrowRevealed ? `${tomorrow.getDate()}${getOrdinalSuffix(tomorrow.getDate())}` : '?'}
                            </div>
                            {tomorrowRevealed && <div style={styles.dayName}>{dayNames[tomorrow.getDay()]}</div>}
                        </div>
                    </div>
                    
                    {/* Reveal button - positioned bottom right */}
                    {!tomorrowRevealed && (
                        <button 
                            style={styles.revealButton} 
                            onClick={() => {
                                setYesterdayRevealed(true);
                                setTomorrowRevealed(true);
                                markStepComplete(4, "Awesome!");
                            }}
                        >
                            Reveal All
                        </button>
                    )}
                </div>
            );
        default: return null;
    }
  };

  return (
    <div style={styles.pageContainer}>
      
      {/* Header - Compact */}
      <div style={styles.headerContainer}>
        <h1 style={styles.mainTitle}>📅 Calendar Math</h1>
        <p style={styles.subtitle}>Let's practice our calendar and counting skills!</p>
      </div>

      {/* Two-Column Layout */}
      <div style={styles.twoColumnContainer}>
        
        {/* Left Column - Main Content */}
        <div style={styles.leftColumn}>
          
          {/* Current Task Title */}
          <h2 style={styles.taskTitle}>{steps[currentStep]?.question}</h2>
          
          {/* Main Task Content - Scrollable */}
          <div style={styles.mainTaskContent} className="calendar-tasks-container">
            {renderMainContent()}
          </div>
          
          {/* Internal Navigation */}
          <div style={styles.internalNavBar}>
            {currentStep > 0 && <button onClick={handleInternalBack} style={styles.internalNavButton}>Back</button>}
            
            {currentStep < steps.length - 1 ? (
              <button onClick={handleInternalNext} disabled={!isStepTaskComplete()} style={{...styles.internalNavButton, ...(!isStepTaskComplete() ? styles.disabledButton : {})}}>Next Section</button>
            ) : (
              <button onClick={onStepComplete} disabled={!isStepTaskComplete()} style={{...styles.finishButton, ...(!isStepTaskComplete() ? styles.disabledButton : {})}}>
                Finish Calendar Math ✔️
              </button>
            )}
          </div>
        </div>
        
        {/* Right Column - Progress Sidebar */}
        <div style={styles.rightColumn}>
          <div style={styles.progressSidebar}>
            <h3 style={styles.progressTitle}>Progress</h3>
            <div style={styles.progressList}>
              {steps.map((s, index) => (
                <div key={s.id} onClick={() => setCurrentStep(index)} style={{ ...styles.progressItem, ...(currentStep === index ? styles.progressItemActive : {}), ...(completedSteps.has(index) ? styles.progressItemCompleted : {}) }}>
                  <span style={styles.progressCheck}>{completedSteps.has(index) ? '✅' : '➡️'}</span>
                  <div style={styles.progressText}>
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
        goHome: onHome,
        canGoBack: !!onBack,
        isLastStep: false
      }} />

       <style>{`
         .pop-in { animation: popIn 0.5s ease-out forwards; } 
         @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
         
         /* Smooth scrolling for calendar tasks */
         .calendar-tasks-container {
           scrollbar-width: thin;
           scrollbar-color: rgba(255,255,255,0.3) transparent;
         }
         
         .calendar-tasks-container::-webkit-scrollbar {
           width: 8px;
         }
         
         .calendar-tasks-container::-webkit-scrollbar-track {
           background: rgba(255,255,255,0.1);
           border-radius: 10px;
         }
         
         .calendar-tasks-container::-webkit-scrollbar-thumb {
           background: rgba(255,255,255,0.3);
           border-radius: 10px;
         }
         
         .calendar-tasks-container::-webkit-scrollbar-thumb:hover {
           background: rgba(255,255,255,0.5);
         }
       `}</style>
    </div>
  );
};

// Fixed styles for proper two-column layout
const styles: { [key: string]: React.CSSProperties } = {
    // Main container with proper padding
    pageContainer: { 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '1rem 2rem 140px 2rem',
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        boxSizing: 'border-box',
        fontFamily: 'system-ui, sans-serif'
    },
    
    // Compact header
    headerContainer: { 
        textAlign: 'center', 
        marginBottom: '1.5rem'
    },
    mainTitle: { 
        fontSize: '3rem',
        fontWeight: 800, 
        margin: 0, 
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', 
        background: 'linear-gradient(45deg, #FFD93D, #FF6B6B)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent' 
    },
    subtitle: { 
        fontSize: '1.3rem', 
        margin: '1rem 0 0 0', 
        opacity: 0.9, 
        fontWeight: 600 
    },
    
    // Two-column container
    twoColumnContainer: { 
        flex: 1, 
        display: 'flex', 
        gap: '2rem', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        width: '100%',
        minHeight: '0'
    },
    
    // Left column - Main content (70% width)
    leftColumn: { 
        flex: '0 0 70%',
        background: 'rgba(255, 255, 255, 0.15)', 
        backdropFilter: 'blur(15px)', 
        borderRadius: '20px', 
        padding: '2rem', 
        border: '2px solid rgba(255, 255, 255, 0.2)', 
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden'
    },
    
    // Right column - Sidebar (30% width)
    rightColumn: { 
        flex: '0 0 30%',
        display: 'flex',
        flexDirection: 'column'
    },
    
    // Task title
    taskTitle: { 
        fontSize: '2rem', 
        fontWeight: 700, 
        color: 'white', 
        textShadow: '0 2px 5px rgba(0,0,0,0.3)', 
        textAlign: 'center', 
        marginBottom: '1.5rem' 
    },
    
    // Main task content area - scrollable
    mainTaskContent: { 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflowY: 'visible',
        paddingRight: '0',
        marginRight: '0',
        gap: '1.5rem',
        minHeight: '0',
        alignItems: 'center',
        justifyContent: 'center'
    },
    
    // Progress sidebar
    progressSidebar: { 
        background: 'rgba(255, 255, 255, 0.15)', 
        backdropFilter: 'blur(15px)', 
        borderRadius: '20px', 
        padding: '1.5rem', 
        border: '2px solid rgba(255, 255, 255, 0.2)', 
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', 
        height: 'fit-content',
        maxHeight: '600px',
        overflowY: 'auto'
    },
    progressTitle: { 
        fontSize: '1.3rem', 
        fontWeight: 700, 
        marginBottom: '1rem', 
        color: 'white',
        textAlign: 'center'
    },
    progressList: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem' 
    },
    progressItem: { 
        fontSize: '0.9rem', 
        padding: '0.75rem', 
        borderRadius: '12px', 
        fontWeight: 500, 
        opacity: 0.7, 
        display: 'flex', 
        alignItems: 'flex-start', 
        transition: 'all 0.3s', 
        cursor: 'pointer',
        background: 'rgba(255, 255, 255, 0.1)'
    },
    progressItemActive: { 
        backgroundColor: 'rgba(255, 255, 255, 0.25)', 
        opacity: 1, 
        fontWeight: 600,
        transform: 'scale(1.02)'
    },
    progressItemCompleted: { 
        opacity: 1, 
        background: 'rgba(40, 167, 69, 0.3)'
    },
    progressCheck: { 
        marginRight: '0.75rem', 
        fontSize: '1rem', 
        flexShrink: 0 
    },
    progressText: { 
        flex: 1,
        lineHeight: '1.3'
    },
    standardText: { 
        fontSize: '0.7rem', 
        opacity: 0.8, 
        marginTop: '4px' 
    },
    
    // Navigation
    internalNavBar: { 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '1rem', 
        marginTop: '2rem',
        flexShrink: 0
    },
    internalNavButton: { 
        padding: '0.8rem 2rem', 
        fontSize: '1rem', 
        fontWeight: 600, 
        borderRadius: '12px', 
        cursor: 'pointer', 
        background: 'rgba(0, 86, 179, 0.7)', 
        color: 'white', 
        border: '1px solid rgba(255,255,255,0.5)',
        transition: 'all 0.3s ease'
    },
    finishButton: { 
        padding: '0.8rem 2rem', 
        fontSize: '1.2rem', 
        fontWeight: 600, 
        borderRadius: '12px', 
        cursor: 'pointer', 
        background: 'linear-gradient(45deg, #28a745, #20c997)', 
        color: 'white', 
        border: 'none',
        transition: 'all 0.3s ease'
    },
    disabledButton: { 
        background: 'rgba(108, 117, 125, 0.7)', 
        cursor: 'not-allowed', 
        color: 'rgba(255,255,255,0.5)' 
    },
    
    // Task content styles
    revealContainer: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flex: 1, 
        width: '100%' 
    },
    revealedContent: { 
        fontSize: '6rem', 
        fontWeight: 'bold', 
        color: 'white', 
        background: 'rgba(0,0,0,0.2)', 
        padding: '2rem 4rem', 
        borderRadius: '24px' 
    },
    actionButton: { 
        padding: '1.5rem 3rem', 
        fontSize: '2rem', 
        background: 'linear-gradient(45deg, #ffc107 0%, #ff8008 100%)', 
        color: 'white', 
        border: 'none', 
        borderRadius: '16px', 
        cursor: 'pointer', 
        fontWeight: 600, 
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)' 
    },
    gridContainerMonths: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '0.8rem', 
        width: '100%', 
        maxWidth: '700px'
    },
    card: { 
        position: 'relative', 
        background: 'rgba(255, 255, 255, 0.8)', 
        border: '1px solid rgba(255, 255, 255, 0.5)', 
        borderRadius: '16px', 
        padding: '0.8rem', 
        textAlign: 'center', 
        cursor: 'pointer', 
        transition: 'all 0.2s ease-in-out', 
        color: '#333'
    },
    cardSelected: { 
        background: 'linear-gradient(135deg, #28a745, #20c997)', 
        transform: 'scale(1.05)', 
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)', 
        color: 'white' 
    },
    cardNumber: { 
        position: 'absolute', 
        top: '5px', 
        left: '10px', 
        fontSize: '1rem', 
        fontWeight: 'bold', 
        color: 'rgba(0,0,0,0.2)' 
    },
    cardEmoji: { 
        fontSize: '2rem' 
    },
    cardTitle: { 
        fontSize: '1.2rem', 
        fontWeight: 600 
    },
    gridContainerDays: { 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '1rem', 
        width: '100%', 
        maxWidth: '800px',
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    dayCircle: { 
        background: 'rgba(255, 255, 255, 0.8)', 
        borderRadius: '16px', 
        width: '180px', 
        padding: '1.5rem 0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '1.5rem', 
        fontWeight: 600, 
        color: '#333', 
        cursor: 'pointer', 
        transition: 'all 0.2s ease-in-out', 
        gap: '10px'
    },
    dayNumber: { 
        background: 'rgba(0,0,0,0.1)', 
        color: '#333', 
        width: '30px', 
        height: '30px', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontWeight: 'bold' 
    },
    timelineContainer: { 
        display: 'flex', 
        alignItems: 'stretch', 
        justifyContent: 'center', 
        gap: '1rem', 
        width: '100%',
        maxWidth: '700px'
    },
    timelineBox: { 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'rgba(255,255,255,0.2)', 
        borderRadius: '16px', 
        padding: '2rem', 
        fontSize: '2.5rem', 
        fontWeight: 600, 
        color: 'rgba(255,255,255,0.7)', 
        textAlign: 'center', 
        flex: 1 
    },
    timelineLabel: { 
        fontSize: '1rem', 
        fontWeight: 'normal', 
        opacity: 0.8, 
        marginBottom: '0.5rem' 
    },
    timelineBoxToday: { 
        background: 'rgba(255,255,255,0.8)', 
        color: '#333', 
        transform: 'scale(1.1)' 
    },
    timelineBoxRevealed: { 
        background: '#ffc107', 
        color: 'black' 
    },
    calendarGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '0.5rem', 
        width: '100%', 
        maxWidth: '600px',
        background: 'rgba(0,0,0,0.2)', 
        padding: '1rem', 
        borderRadius: '16px' 
    },
    calendarHeader: { 
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: '1.2rem', 
        color: 'white', 
        paddingBottom: '0.5rem' 
    },
    calendarDay: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60px', 
        background: 'rgba(255,255,255,0.5)', 
        borderRadius: '8px', 
        fontSize: '1.5rem', 
        color: '#333' 
    },
    calendarDayToday: { 
        background: '#ffc107', 
        color: 'black', 
        fontWeight: 'bold' 
    },
    patternA: { 
        background: 'rgba(135, 206, 250, 0.7)' 
    }, 
    patternB: { 
        background: 'rgba(255, 160, 122, 0.7)' 
    },
    
    // New timeline section styles
    timelineSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        position: 'relative'
    },
    
    monthHeader: {
        fontSize: '2rem',
        fontWeight: 700,
        color: 'white',
        textAlign: 'center',
        marginBottom: '2rem',
        textShadow: '0 2px 5px rgba(0,0,0,0.3)'
    },
    
    dateNumber: {
        fontSize: '3rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem'
    },
    
    dayName: {
        fontSize: '1.5rem',
        fontWeight: 500
    },
    
    revealButton: {
        position: 'absolute',
        bottom: '1rem',
        right: '2rem',
        padding: '0.8rem 1.5rem',
        fontSize: '1rem',
        background: 'linear-gradient(45deg, #ffc107 0%, #ff8008 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 600,
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    },
    
    // Celebration and video button
    celebrationOverlay: { 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000 
    },
    celebrationMessage: { 
        padding: '2rem 4rem', 
        background: 'linear-gradient(45deg, #28a745, #20c997)', 
        color: 'white', 
        borderRadius: '25px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)', 
        fontSize: '2rem', 
        fontWeight: 700 
    },
    videoButton: { 
        marginTop: '1rem', 
        padding: '0.8rem', 
        fontSize: '0.9rem', 
        background: 'rgba(0, 86, 179, 0.7)', 
        color: 'white', 
        border: '1px solid rgba(255,255,255,0.5)', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        fontWeight: 600,
        width: '100%',
        transition: 'all 0.3s ease'
    },
};

export default CalendarMathStep;

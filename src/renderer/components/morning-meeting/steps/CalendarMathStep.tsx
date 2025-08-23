import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

const CalendarMathStep: React.FC<MorningMeetingStepProps> = ({ currentDate, onStepComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [countedMonths, setCountedMonths] = useState<Set<number>>(new Set());
  const [countedDays, setCountedDays] = useState<Set<number>>(new Set());
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());

  const today = currentDate || new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const monthNames = useMemo(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);
  const dayNames = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], []);
  const monthEmojis = useMemo(() => ['❄️', '💕', '🌸', '🌷', '🌺', '☀️', '🏖️', '🌻', '🍎', '🎃', '🦃', '🎄'], []);
  const formatDayName = useCallback((date: Date): string => dayNames[date.getDay()], [dayNames]);

  const questions = useMemo(() => [
    { id: 'months-in-year', question: "How many months are in a year?", interaction: 'count-months', celebration: "Perfect! There are 12 months! 🎉" },
    { id: 'current-month', question: "What month are we in?", interaction: 'highlight-current-month', celebration: `Great job! We're in ${monthNames[today.getMonth()]}! 🌟` },
    { id: 'days-in-week', question: "How many days are in a week?", interaction: 'count-days', celebration: "Excellent! A week has 7 days! 🎊" },
    { id: 'today', question: "What is today?", interaction: 'highlight-today', celebration: `Today is ${formatDayName(today)}! ⭐` },
    { id: 'yesterday', question: "What was yesterday?", interaction: 'show-yesterday', celebration: `Yesterday was ${formatDayName(yesterday)}! 🧠` },
    { id: 'tomorrow', question: "What will tomorrow be?", interaction: 'show-tomorrow', celebration: `Brilliant! Tomorrow is ${formatDayName(tomorrow)}! 🚀` }
  ], [today, monthNames, formatDayName, yesterday, tomorrow]);

  useEffect(() => {
    if (completedQuestions.size === questions.length) {
      onStepComplete?.();
    }
  }, [completedQuestions, questions.length, onStepComplete]);

  const triggerCelebration = useCallback((message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  }, []);
  
  const advanceToNextQuestion = useCallback(() => {
    if (completedQuestions.has(currentQuestion) && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }, [currentQuestion, questions.length, completedQuestions]);

  const markQuestionComplete = useCallback((index: number, celebrationMessage: string) => {
    triggerCelebration(celebrationMessage);
    setCompletedQuestions(prev => new Set(prev).add(index));
    setTimeout(advanceToNextQuestion, 2600);
  }, [triggerCelebration, advanceToNextQuestion]);

  const handleMonthClick = (monthIndex: number) => {
    if (countedMonths.has(monthIndex)) return;
    const newCounted = new Set(countedMonths).add(monthIndex);
    setCountedMonths(newCounted);
    if (newCounted.size === 12) {
      markQuestionComplete(0, questions[0].celebration);
    }
  };

  const handleDayClick = (dayIndex: number) => {
    if (countedDays.has(dayIndex)) return;
    const newCounted = new Set(countedDays).add(dayIndex);
    setCountedDays(newCounted);
    if (newCounted.size === 7) {
      markQuestionComplete(2, questions[2].celebration);
    }
  };

  const handleQuestionSelect = (index: number) => {
    if (index <= completedQuestions.size) {
      setCurrentQuestion(index);
    }
  };

  const renderRightPanelContent = () => {
    const question = questions[currentQuestion];
    switch (question.interaction) {
      case 'count-months':
        return (
          <div style={styles.gridContainerMonths}>
            {monthNames.map((month, index) => {
              const isCounted = countedMonths.has(index);
              return (
                <div key={month} onClick={() => handleMonthClick(index)} style={{ ...styles.card, ...(isCounted ? styles.cardSelected : {}) }}>
                  <div style={styles.cardEmoji}>{monthEmojis[index]}</div>
                  <div style={styles.cardTitle}>{month}</div>
                </div>
              );
            })}
          </div>
        );
      case 'count-days':
          return (
              <div style={styles.gridContainerDays}>
                  {dayNames.map((day, index) => {
                      const isCounted = countedDays.has(index);
                      return (
                          <div key={day} onClick={() => handleDayClick(index)} style={{ ...styles.dayCircle, ...(isCounted ? styles.cardSelected : {}) }}>
                              {day}
                          </div>
                      );
                  })}
              </div>
          );
      case 'highlight-current-month':
      case 'highlight-today': {
          const isMonth = question.interaction === 'highlight-current-month';
          const isComplete = completedQuestions.has(currentQuestion);
          return (
              <div style={styles.mysteryBox}>
                  <div style={{ ...styles.mysteryContent, ...(isComplete ? styles.mysteryContentRevealed : {}) }}>
                      <div style={{ fontSize: '6rem' }}>{isComplete ? (isMonth ? monthEmojis[today.getMonth()] : '⭐') : '❓'}</div>
                      <h3 style={{ fontSize: '3rem', margin: 0 }}>{isComplete ? (isMonth ? monthNames[today.getMonth()] : formatDayName(today)) : '???'}</h3>
                  </div>
                  {!isComplete && <button onClick={() => markQuestionComplete(currentQuestion, question.celebration)} style={styles.actionButton}>Reveal!</button>}
              </div>
          );
      }
      case 'show-yesterday':
      case 'show-tomorrow': {
          const isYesterday = question.interaction === 'show-yesterday';
          const isComplete = completedQuestions.has(currentQuestion);
          return (
            <div style={styles.timelineContainer}>
                <div style={{ ...styles.timelineBox, ...(isYesterday && isComplete ? styles.timelineBoxRevealed : {}) }}>
                    {isYesterday ? (isComplete ? formatDayName(yesterday) : '❓') : formatDayName(yesterday)}
                    <span style={styles.timelineLabel}>Yesterday</span>
                </div>
                <div style={styles.timelineArrow}>→</div>
                <div style={{ ...styles.timelineBox, ...styles.timelineBoxToday }}>
                    {formatDayName(today)}
                    <span style={styles.timelineLabel}>Today</span>
                </div>
                <div style={styles.timelineArrow}>→</div>
                <div style={{ ...styles.timelineBox, ...(!isYesterday && isComplete ? styles.timelineBoxRevealed : {}) }}>
                    {!isYesterday ? (isComplete ? formatDayName(tomorrow) : '❓') : formatDayName(tomorrow)}
                    <span style={styles.timelineLabel}>Tomorrow</span>
                </div>
                {!isComplete && <button onClick={() => markQuestionComplete(currentQuestion, question.celebration)} style={styles.actionButton}>Reveal!</button>}
            </div>
          );
      }
      default: return null;
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentGrid}>
        <div style={styles.leftColumn}>
          <h1 style={styles.leftTitle}>📅 Calendar Math</h1>
          <p style={styles.leftSubtitle}>Let's learn about months, weeks, and days!</p>
          <div style={styles.divider}></div>
          <div style={styles.progressList}>
            {questions.map((q, index) => {
              const isCompleted = completedQuestions.has(index);
              const isActive = currentQuestion === index;
              return (
                <div key={q.id} onClick={() => handleQuestionSelect(index)} style={{ ...styles.progressItem, ...(isActive ? styles.progressItemActive : {}), ...(isCompleted ? styles.progressItemCompleted : {}) }}>
                  <span style={styles.progressCheck}>{isCompleted ? '✅' : '➡️'}</span>
                  {q.question}
                </div>
              );
            })}
          </div>
        </div>
        <div style={styles.rightColumn}>
            <h2 style={styles.rightPanelTitle}>{questions[currentQuestion].question}</h2>
            {renderRightPanelContent()}
        </div>
      </div>
      {showCelebration && (
        <div style={styles.celebrationOverlay}>
            <div style={styles.celebrationMessage}>{celebrationMessage}</div>
        </div>
       )}
    </div>
  );
};

// Styles object from previous versions
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: 'system-ui, sans-serif', overflow: 'hidden', padding: '2rem' },
    contentGrid: { width: '100%', height: '100%', maxWidth: '1400px', display: 'flex', gap: '2rem' },
    leftColumn: { width: '350px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', color: 'white' },
    rightColumn: { flex: 1, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    leftTitle: { fontSize: '2.5rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', marginBottom: '0.5rem' },
    leftSubtitle: { fontSize: '1.2rem', opacity: 0.8, marginBottom: '2rem' },
    divider: { height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.3)', margin: '1rem 0 2rem 0' },
    progressList: { flex: 1, overflowY: 'auto', cursor: 'pointer' },
    progressItem: { fontSize: '1.1rem', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', fontWeight: 500, opacity: 0.6, display: 'flex', alignItems: 'center', transition: 'background-color 0.3s' },
    progressItemActive: { backgroundColor: 'rgba(255, 255, 255, 0.2)', opacity: 1, fontWeight: 600 },
    progressItemCompleted: { opacity: 1, textDecoration: 'line-through' },
    progressCheck: { marginRight: '0.75rem', fontSize: '1.2rem' },
    rightPanelTitle: { fontSize: '2.5rem', fontWeight: 700, color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.3)', textAlign: 'center', marginBottom: '2rem' },
    gridContainerMonths: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', width: '100%', flex: 1, alignItems: 'center' },
    gridContainerDays: { display: 'flex', flexWrap: 'wrap', gap: '1rem', width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center' },
    card: { background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '16px', padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', color: '#333' },
    cardSelected: { background: 'linear-gradient(135deg, #28a745, #20c997)', transform: 'scale(1.05)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', color: 'white' },
    cardEmoji: { fontSize: '2.5rem' },
    cardTitle: { fontSize: '1.2rem', fontWeight: 600 },
    dayCircle: { background: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, color: '#333', cursor: 'pointer', transition: 'all 0.2s ease-in-out' },
    mysteryBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' },
    mysteryContent: { background: 'rgba(0,0,0,0.1)', borderRadius: '24px', padding: '3rem', color: 'white', textAlign: 'center', transition: 'all 0.5s ease-in-out' },
    mysteryContentRevealed: { background: 'rgba(255,255,255,0.2)' },
    actionButton: { padding: '1rem 2rem', fontSize: '1.2rem', background: 'linear-gradient(45deg, #ffc107 0%, #ff8008 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, marginTop: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    timelineContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flex: 1, width: '100%', position: 'relative' },
    timelineBox: { background: 'rgba(255,255,255,0.2)', borderRadius: '16px', padding: '2rem', fontSize: '2rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textAlign: 'center', width: '180px', position: 'relative' },
    timelineBoxToday: { background: 'rgba(255,255,255,0.8)', color: '#333', transform: 'scale(1.1)' },
    timelineBoxRevealed: { background: '#28a745', color: 'white' },
    timelineArrow: { fontSize: '3rem', color: 'white', opacity: 0.5 },
    timelineLabel: { fontSize: '1rem', position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)', opacity: 0.8 },
    celebrationOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    celebrationMessage: { padding: '2rem 4rem', background: 'linear-gradient(45deg, #28a745, #20c997)', color: 'white', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontSize: '2rem', fontWeight: 700, animation: 'celebrate 2.5s ease-in-out forwards' },
};

export default CalendarMathStep;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

const CalendarMathStep: React.FC<MorningMeetingStepProps> = ({ currentDate, onStepComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [highlightedDay, setHighlightedDay] = useState<Date | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');

  const today = useMemo(() => currentDate || new Date(), [currentDate]);
  const monthNames = useMemo(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);
  const dayNames = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

  const questions = useMemo(() => [
    { id: 'view-calendar', question: "Let's look at the calendar!", celebration: "Great start! Here is our calendar for the month." },
    { id: 'today', question: "Can you find today's date?", celebration: `You found it! Today is ${today.getDate()}.` },
    { id: 'yesterday', question: "What was yesterday?", celebration: "Exactly! That was yesterday." },
    { id: 'tomorrow', question: "What will tomorrow be?", celebration: "That's right! That's tomorrow." },
  ], [today]);

  useEffect(() => {
    if (completedQuestions.size === questions.length) {
      onStepComplete?.();
    }
  }, [completedQuestions, questions.length, onStepComplete]);

  const triggerCelebration = useCallback((message: string, callback?: () => void) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      callback?.();
    }, 2500);
  }, []);

  const advanceToNextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }, [currentQuestion, questions.length]);

  const markQuestionComplete = useCallback((index: number, celebrationMessage: string) => {
    if (completedQuestions.has(index)) { // If already complete, just advance
        advanceToNextQuestion();
        return;
    }
    triggerCelebration(celebrationMessage, advanceToNextQuestion);
    setCompletedQuestions(prev => new Set(prev).add(index));
  }, [triggerCelebration, advanceToNextQuestion, completedQuestions]);

  const handleQuestionSelect = (index: number) => {
    if (index === 0 || completedQuestions.has(index - 1)) {
      setCurrentQuestion(index);
    }
  };
  
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };
  
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const daysInMonth = getDaysInMonth(today.getFullYear(), today.getMonth());

  useEffect(() => {
    const questionId = questions[currentQuestion]?.id;
    if (questionId === 'today' && completedQuestions.has(currentQuestion)) {
      setHighlightedDay(today);
    } else if (questionId === 'yesterday' && completedQuestions.has(currentQuestion)) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      setHighlightedDay(yesterday);
    } else if (questionId === 'tomorrow' && completedQuestions.has(currentQuestion)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      setHighlightedDay(tomorrow);
    } else {
      setHighlightedDay(null);
    }
  }, [currentQuestion, completedQuestions, today, questions]);

  const renderCalendar = () => (
    <div style={styles.calendarGrid}>
      {dayNames.map(day => <div key={day} style={styles.calendarHeader}>{day}</div>)}
      {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
      {daysInMonth.map(day => {
        const isHighlighted = highlightedDay && day.toDateString() === highlightedDay.toDateString();
        return (
          <div key={day.toISOString()} style={{ ...styles.calendarDay, ...(isHighlighted ? styles.calendarDayHighlighted : {}) }}>
            {day.getDate()}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={styles.pageContainer}>
      <div style={styles.leftColumn}>
        <h1 style={styles.leftTitle}>📅 Calendar Math</h1>
        <p style={styles.leftSubtitle}>Let's learn about the date!</p>
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
          <h2 style={styles.rightPanelTitle}>{monthNames[today.getMonth()]} {today.getFullYear()}</h2>
          <div style={styles.calendarContainer}>
              {renderCalendar()}
          </div>
          {!completedQuestions.has(currentQuestion) && (
             <button onClick={() => markQuestionComplete(currentQuestion, questions[currentQuestion].celebration)} style={styles.actionButton}>
                Click here when you're ready!
             </button>
          )}
      </div>
      {showCelebration && (
        <div style={styles.celebrationOverlay}>
            <div style={styles.celebrationMessage}>{celebrationMessage}</div>
        </div>
       )}
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { height: '100%', display: 'flex', gap: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: 'system-ui, sans-serif' },
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
    rightPanelTitle: { fontSize: '3rem', fontWeight: 700, color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.3)', textAlign: 'center', marginBottom: '1rem' },
    calendarContainer: { flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', width: '100%', background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '16px' },
    calendarHeader: { textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'white' },
    calendarDay: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', fontSize: '1.5rem', color: '#333', transition: 'all 0.3s ease' },
    calendarDayHighlighted: { background: '#ffc107', color: 'black', transform: 'scale(1.1)', boxShadow: '0 0 15px rgba(255, 193, 7, 0.7)' },
    actionButton: { padding: '1rem 2rem', fontSize: '1.2rem', background: 'linear-gradient(45deg, #28a745 0%, #20c997 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, marginTop: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    celebrationOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    celebrationMessage: { padding: '2rem 4rem', background: 'linear-gradient(45deg, #28a745, #20c997)', color: 'white', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontSize: '2rem', fontWeight: 700, animation: 'celebrate 2.5s ease-in-out forwards' },
};

export default CalendarMathStep;
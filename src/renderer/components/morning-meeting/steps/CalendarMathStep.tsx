import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

const CalendarMathStep: React.FC<MorningMeetingStepProps> = ({ currentDate, onStepComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [highlightedDay, setHighlightedDay] = useState<Date | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');

  const today = useMemo(() => currentDate || new Date(), [currentDate]);
  const yesterday = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d;
  }, [today]);
  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);

  const monthNames = useMemo(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);
  const dayNames = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], []);

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const questions = useMemo(() => [
    { id: 'full-date', question: "What is today's full date?", celebration: `Today is ${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}${getOrdinalSuffix(today.getDate())}, ${today.getFullYear()}!` },
    { id: 'ordinal-number', question: "How do we say the date?", celebration: `Right! The number is ${today.getDate()}, but we say the ${today.getDate()}${getOrdinalSuffix(today.getDate())}!` },
    { id: 'yesterday-tomorrow-numbers', question: "What were the numbers for yesterday and tomorrow?", celebration: "Great job with the numbers!" },
    { id: 'yesterday-tomorrow-days', question: "What were the days of the week for yesterday and tomorrow?", celebration: "You're a weekday expert!" },
  ], [today, dayNames, monthNames]);

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
    if (completedQuestions.has(index)) {
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

  useEffect(() => {
    const questionId = questions[currentQuestion]?.id;
    if (completedQuestions.has(currentQuestion)) {
        if (questionId === 'full-date' || questionId === 'ordinal-number') setHighlightedDay(today);
        else if (questionId === 'yesterday-tomorrow-numbers' || questionId === 'yesterday-tomorrow-days') setHighlightedDay(yesterday); // Start with yesterday
        else setHighlightedDay(null);
    } else {
        setHighlightedDay(null);
    }
  }, [currentQuestion, completedQuestions, today, yesterday, questions]);


  const renderRightPanelContent = () => {
    const question = questions[currentQuestion];
    const isComplete = completedQuestions.has(currentQuestion);

    switch(question.id) {
        case 'full-date':
            return <div style={styles.fullDateDisplay}>{dayNames[today.getDay()]}, {monthNames[today.getMonth()]} {today.getDate()}, {today.getFullYear()}</div>;
        case 'ordinal-number':
            return (
                <div style={styles.ordinalBox}>
                    <div>The Number</div>
                    <div style={styles.ordinalNumber}>{today.getDate()}</div>
                    <div>How We Say It</div>
                    <div style={styles.ordinalText}>{today.getDate()}{getOrdinalSuffix(today.getDate())}</div>
                </div>
            );
        case 'yesterday-tomorrow-numbers':
             return (
                <div style={styles.timelineContainer}>
                    <div style={{...styles.timelineBox, ...(isComplete ? styles.timelineBoxRevealed : {})}}>{yesterday.getDate()}</div>
                    <div style={styles.timelineArrow}>→</div>
                    <div style={{...styles.timelineBox, ...styles.timelineBoxToday}}>{today.getDate()}</div>
                    <div style={styles.timelineArrow}>→</div>
                    <div style={{...styles.timelineBox, ...(isComplete ? styles.timelineBoxRevealed : {})}}>{tomorrow.getDate()}</div>
                </div>
            );
        case 'yesterday-tomorrow-days':
            return (
                <div style={styles.timelineContainer}>
                    <div style={{...styles.timelineBox, ...(isComplete ? styles.timelineBoxRevealed : {})}}>{dayNames[yesterday.getDay()]}</div>
                    <div style={styles.timelineArrow}>→</div>
                    <div style={{...styles.timelineBox, ...styles.timelineBoxToday}}>{dayNames[today.getDay()]}</div>
                    <div style={styles.timelineArrow}>→</div>
                    <div style={{...styles.timelineBox, ...(isComplete ? styles.timelineBoxRevealed : {})}}>{dayNames[tomorrow.getDay()]}</div>
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
          {questions.map((q, index) => (
            <div key={q.id} onClick={() => handleQuestionSelect(index)} style={{ ...styles.progressItem, ...(currentQuestion === index ? styles.progressItemActive : {}), ...(completedQuestions.has(index) ? styles.progressItemCompleted : {}) }}>
              <span style={styles.progressCheck}>{completedQuestions.has(index) ? '✅' : '➡️'}</span>
              {q.question}
            </div>
          ))}
        </div>
      </div>
      <div style={styles.rightColumn}>
          <h2 style={styles.rightPanelTitle}>{questions[currentQuestion].question}</h2>
          <div style={styles.contentContainer}>
            {renderRightPanelContent()}
          </div>
          {!completedQuestions.has(currentQuestion) && (
             <button onClick={() => markQuestionComplete(currentQuestion, questions[currentQuestion].celebration)} style={styles.actionButton}>
                Ready!
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
    contentContainer: { flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    fullDateDisplay: { fontSize: '4rem', fontWeight: 'bold', color: 'white', background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '16px' },
    ordinalBox: { textAlign: 'center', color: 'white', background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '16px' },
    ordinalNumber: { fontSize: '6rem', fontWeight: 'bold' },
    ordinalText: { fontSize: '3rem' },
    timelineContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flex: 1, width: '100%' },
    timelineBox: { background: 'rgba(255,255,255,0.2)', borderRadius: '16px', padding: '2rem', fontSize: '2.5rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
    timelineBoxToday: { background: 'rgba(255,255,255,0.8)', color: '#333', transform: 'scale(1.1)' },
    timelineBoxRevealed: { background: '#ffc107', color: 'black' },
    timelineArrow: { fontSize: '3rem', color: 'white', opacity: 0.5 },
    actionButton: { padding: '1rem 2rem', fontSize: '1.2rem', background: 'linear-gradient(45deg, #28a745 0%, #20c997 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, marginTop: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    celebrationOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    celebrationMessage: { padding: '2rem 4rem', background: 'linear-gradient(45deg, #28a745, #20c997)', color: 'white', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontSize: '2rem', fontWeight: 700, animation: 'celebrate 2.5s ease-in-out forwards' },
};

export default CalendarMathStep;
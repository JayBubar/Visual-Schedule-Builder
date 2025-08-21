import React, { useState, useEffect } from 'react';
import { MorningMeetingStepProps, CalendarMathStepData } from '../types/morningMeetingTypes';

const CalendarMathStep: React.FC<MorningMeetingStepProps> = ({
  currentDate,
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings
}) => {
  // State for question flow
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [monthCount, setMonthCount] = useState<number>(0);
  const [dayCount, setDayCount] = useState<number>(0);
  const [countedMonths, setCountedMonths] = useState<Set<number>>(new Set());
  const [countedDays, setCountedDays] = useState<Set<number>>(new Set());
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');
  const [canProceed, setCanProceed] = useState<boolean>(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());

  // Time tracking
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [startTime] = useState(new Date());

  // Update time spent every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpentSeconds(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Questions configuration
  const questions = [
    {
      id: 'months-in-year',
      question: "How many months are in the year?",
      interaction: 'count-months',
      celebration: "Amazing! There are 12 months in a year! 🎉",
      buttonText: "Let's Count!"
    },
    {
      id: 'current-month',
      question: "What month are we in?",
      interaction: 'highlight-current-month',
      celebration: "Perfect! We're in August! 🌟",
      buttonText: "Show Current Month!"
    },
    {
      id: 'days-in-week',
      question: "How many days are in a week?",
      interaction: 'count-days',
      celebration: "Excellent! A week has 7 days! 🎊",
      buttonText: "Let's Count Days!"
    },
    {
      id: 'today',
      question: "And what is today?",
      interaction: 'highlight-today',
      celebration: "That's right! Today is Wednesday! ⭐",
      buttonText: "That's Today!"
    },
    {
      id: 'yesterday',
      question: "So what does that mean yesterday was?",
      interaction: 'show-yesterday',
      celebration: "Smart thinking! Yesterday was Tuesday! 🧠",
      buttonText: "Show Yesterday!"
    },
    {
      id: 'tomorrow',
      question: "Then tomorrow must be!",
      interaction: 'show-tomorrow',
      celebration: "Brilliant! Tomorrow will be Thursday! 🚀",
      buttonText: "Show Tomorrow!"
    }
  ];

  // Date calculations
  const today = currentDate || new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthEmojis = [
    '❄️', '💕', '🌸', '🌷', '🌺', '☀️',
    '🏖️', '🌻', '🍎', '🎃', '🦃', '🎄'
  ];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Format day name
  const formatDayName = (date: Date): string => {
    return dayNames[date.getDay()];
  };

  // Save step data with proper dependencies
  useEffect(() => {
    const stepData: CalendarMathStepData = {
      currentDate: today,
      selectedActivities: [`question-${currentQuestion}`],
      mathConcepts: Array.from(completedQuestions).map(q => questions[q].id),
      completedSections: Array.from(completedQuestions).map(q => questions[q].id),
      currentSection: questions[currentQuestion]?.id || 'months-in-year',
      currentLevel: 'day',
      completedLevels: Array.from(completedQuestions).map(q => questions[q].id),
      timeSpentSeconds: timeSpentSeconds,
      completedAt: completedQuestions.size === questions.length ? new Date() : undefined
    };
    onDataUpdate(stepData);
  }, [currentQuestion, completedQuestions, timeSpentSeconds]); // Fixed: removed circular dependencies

  // Handle month click
  const handleMonthClick = (monthIndex: number) => {
    if (!countedMonths.has(monthIndex)) {
      const newCounted = new Set(countedMonths);
      newCounted.add(monthIndex);
      setCountedMonths(newCounted);
      setMonthCount(newCounted.size);

      if (newCounted.size === 12) {
        triggerCelebration(questions[0].celebration);
        setTimeout(() => {
          setCanProceed(true);
          const newCompleted = new Set(completedQuestions);
          newCompleted.add(0);
          setCompletedQuestions(newCompleted);
        }, 2000);
      }
    }
  };

  // Handle day click for counting
  const handleDayClick = (dayIndex: number) => {
    if (!countedDays.has(dayIndex)) {
      const newCounted = new Set(countedDays);
      newCounted.add(dayIndex);
      setCountedDays(newCounted);
      setDayCount(newCounted.size);

      if (newCounted.size === 7) {
        triggerCelebration(questions[2].celebration);
        setTimeout(() => {
          setCanProceed(true);
          const newCompleted = new Set(completedQuestions);
          newCompleted.add(2);
          setCompletedQuestions(newCompleted);
        }, 2000);
      }
    }
  };

  // Handle button interactions
  const handleButtonInteraction = (questionIndex: number) => {
    const question = questions[questionIndex];
    
    switch (question.interaction) {
      case 'highlight-current-month':
        // Trigger zoom animation for current month
        const monthDisplay = document.getElementById('currentMonth');
        if (monthDisplay) {
          monthDisplay.style.opacity = '1';
          monthDisplay.style.transform = 'scale(1.2)';
          monthDisplay.style.background = 'rgba(255, 215, 0, 0.95)';
          monthDisplay.style.border = '4px solid rgba(255, 140, 0, 1)';
          monthDisplay.style.color = '#333333';
          monthDisplay.style.filter = 'blur(0px)';
          
          // Update content
          const emoji = monthDisplay.querySelector('div:first-child');
          const monthName = monthDisplay.querySelector('div:nth-child(2)');
          if (emoji) emoji.textContent = monthEmojis[today.getMonth()];
          if (monthName) monthName.textContent = monthNames[today.getMonth()];
        }
        triggerCelebration(question.celebration);
        setTimeout(() => {
          setCanProceed(true);
          const newCompleted = new Set(completedQuestions);
          newCompleted.add(questionIndex);
          setCompletedQuestions(newCompleted);
        }, 2000);
        break;

      case 'highlight-today':
        // Trigger reveal animation for today
        const todayDisplay = document.getElementById('todayReveal');
        if (todayDisplay) {
          todayDisplay.style.opacity = '1';
          todayDisplay.style.transform = 'scale(1.2)';
          todayDisplay.style.background = 'rgba(255, 215, 0, 0.95)';
          todayDisplay.style.border = '4px solid rgba(255, 140, 0, 1)';
          todayDisplay.style.color = '#333333';
          todayDisplay.style.filter = 'blur(0px)';
          
          // Update content
          const emoji = todayDisplay.querySelector('div:first-child');
          const dayName = todayDisplay.querySelector('div:nth-child(2)');
          if (emoji) emoji.textContent = '⭐';
          if (dayName) dayName.textContent = formatDayName(today);
        }
        triggerCelebration(question.celebration);
        setTimeout(() => {
          setCanProceed(true);
          const newCompleted = new Set(completedQuestions);
          newCompleted.add(questionIndex);
          setCompletedQuestions(newCompleted);
        }, 2000);
        break;

      case 'show-yesterday':
        const yesterdayElement = document.getElementById('yesterday');
        if (yesterdayElement) {
          const dayName = yesterdayElement.querySelector('.timeline-day-name');
          if (dayName) {
            dayName.textContent = formatDayName(yesterday);
            yesterdayElement.style.background = 'rgba(34, 197, 94, 0.9)';
            yesterdayElement.style.color = 'white';
            yesterdayElement.style.border = '3px solid rgba(34, 197, 94, 1)';
            yesterdayElement.style.filter = 'blur(0px)';
          }
        }
        triggerCelebration(question.celebration);
        setTimeout(() => {
          setCanProceed(true);
          const newCompleted = new Set(completedQuestions);
          newCompleted.add(questionIndex);
          setCompletedQuestions(newCompleted);
        }, 2000);
        break;

      case 'show-tomorrow':
        const tomorrowElement = document.getElementById('tomorrow');
        if (tomorrowElement) {
          const dayName = tomorrowElement.querySelector('.timeline-day-name');
          if (dayName) {
            dayName.textContent = formatDayName(tomorrow);
            tomorrowElement.style.background = 'rgba(138, 43, 226, 0.9)';
            tomorrowElement.style.color = 'white';
            tomorrowElement.style.border = '3px solid rgba(138, 43, 226, 1)';
            tomorrowElement.style.filter = 'blur(0px)';
          }
        }
        triggerCelebration(question.celebration);
        setTimeout(() => {
          setCanProceed(true);
          const newCompleted = new Set(completedQuestions);
          newCompleted.add(questionIndex);
          setCompletedQuestions(newCompleted);
        }, 2000);
        break;

      default:
        setCanProceed(true);
    }
  };

  // Show day names with animation
  const showDayNamesAnimation = () => {
    const container = document.getElementById('weekDaysShow');
    if (!container) return;

    dayNames.forEach((day, index) => {
      setTimeout(() => {
        const dayBubble = document.createElement('div');
        dayBubble.className = 'day-bubble full-name appeared counted';
        dayBubble.textContent = day;
        dayBubble.style.background = 'rgba(34, 197, 94, 0.9)';
        dayBubble.style.color = 'white';
        dayBubble.style.borderColor = 'rgba(34, 197, 94, 1)';
        container.appendChild(dayBubble);

        if (index === dayNames.length - 1) {
          setTimeout(() => {
            triggerCelebration(questions[3].celebration);
            setTimeout(() => {
              setCanProceed(true);
              const newCompleted = new Set(completedQuestions);
              newCompleted.add(3);
              setCompletedQuestions(newCompleted);
            }, 2000);
          }, 500);
        }
      }, index * 300);
    });
  };

  // Trigger celebration
  const triggerCelebration = (message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
  };

  // Navigation functions
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCanProceed(false);
    } else {
      // Complete! Move to next step
      onNext();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCanProceed(true); // Can always proceed to previously completed questions
    }
  };

  // Render different question content
  const renderQuestionContent = () => {
    const question = questions[currentQuestion];
    
    switch (question.interaction) {
      case 'count-months':
        return (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              margin: '2rem 0',
              maxWidth: '800px'
            }}>
              {monthNames.map((month, index) => (
                <div
                  key={index}
                  onClick={() => handleMonthClick(index)}
                  style={{
                    background: countedMonths.has(index) 
                      ? 'rgba(34, 197, 94, 0.9)' 
                      : 'rgba(255, 255, 255, 0.85)',
                    color: countedMonths.has(index) ? 'white' : '#333333',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: countedMonths.has(index) 
                      ? '3px solid rgba(34, 197, 94, 1)' 
                      : '3px solid rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    transform: countedMonths.has(index) ? 'scale(1.05)' : 'scale(1)',
                    userSelect: 'none'
                  }}
                >
                  {monthEmojis[index]} {month}
                  {countedMonths.has(index) && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: 'rgba(34, 197, 94, 1)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}>
                      {Array.from(countedMonths).indexOf(index) + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '1rem',
              fontSize: '1.3rem',
              fontWeight: '600',
              color: 'white'
            }}>
              Count: {monthCount} / 12
            </div>
          </>
        );

      case 'highlight-current-month':
        return (
          <>
            <div
              id="currentMonth"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '20px',
                padding: '2rem',
                margin: '2rem 0',
                transform: 'scale(0.8)',
                transition: 'all 0.8s ease',
                border: '3px solid rgba(255, 255, 255, 0.2)',
                opacity: '0.4',
                textAlign: 'center',
                filter: 'blur(2px)'
              }}
            >
              <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>
                ❓
              </div>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                marginBottom: '0.5rem'
              }}>
                ???
              </div>
              <div style={{ fontSize: '1.5rem' }}>
                {today.getFullYear()}
              </div>
            </div>
            <button
              onClick={() => handleButtonInteraction(currentQuestion)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                marginTop: '2rem'
              }}
            >
              {question.buttonText}
            </button>
          </>
        );

      case 'count-days':
        return (
          <>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              margin: '2rem 0',
              flexWrap: 'wrap'
            }}>
              {dayNames.map((day, index) => (
                <div
                  key={index}
                  onClick={() => handleDayClick(index)}
                  style={{
                    background: countedDays.has(index)
                      ? 'rgba(34, 197, 94, 0.9)'
                      : 'rgba(255, 255, 255, 0.85)',
                    color: countedDays.has(index) ? 'white' : '#333333',
                    border: countedDays.has(index)
                      ? '3px solid rgba(34, 197, 94, 1)'
                      : '3px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.4s ease',
                    userSelect: 'none',
                    transform: countedDays.has(index) ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '1rem',
              fontSize: '1.3rem',
              fontWeight: '600',
              color: 'white'
            }}>
              Count: {dayCount} / 7
            </div>
          </>
        );

      case 'show-day-names':
        return (
          <>
            <div
              id="weekDaysShow"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
                maxWidth: '600px',
                margin: '2rem auto'
              }}
            />
            <button
              onClick={() => handleButtonInteraction(currentQuestion)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                marginTop: '2rem'
              }}
            >
              {question.buttonText}
            </button>
          </>
        );

      case 'highlight-today':
        return (
          <>
            <div
              id="todayReveal"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '24px',
                padding: '3rem',
                margin: '2rem 0',
                transform: 'scale(0.8)',
                transition: 'all 0.8s ease',
                border: '3px solid rgba(255, 255, 255, 0.2)',
                opacity: '0.4',
                textAlign: 'center',
                filter: 'blur(2px)',
                minWidth: '300px'
              }}
            >
              <div style={{
                fontSize: '8rem',
                marginBottom: '1rem'
              }}>
                ❓
              </div>
              <div style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: '700',
                marginBottom: '1rem'
              }}>
                ???
              </div>
              <div style={{
                fontSize: '1.5rem'
              }}>
                {monthNames[today.getMonth()]} {today.getDate()}, {today.getFullYear()}
              </div>
            </div>
            <button
              onClick={() => handleButtonInteraction(currentQuestion)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                marginTop: '1rem'
              }}
            >
              {question.buttonText}
            </button>
          </>
        );

      case 'show-yesterday':
        return (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
              margin: '2rem 0',
              flexWrap: 'wrap'
            }}>
              <div
                id="yesterday"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '16px',
                  padding: '2rem',
                  textAlign: 'center',
                  minWidth: '150px',
                  transition: 'all 0.5s ease',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  filter: 'blur(2px)'
                }}
              >
                <div className="timeline-day-name" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  ❓
                </div>
                <div className="timeline-day-label" style={{
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  Yesterday
                </div>
              </div>
              <div style={{
                fontSize: '3rem',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                →
              </div>
              <div style={{
                background: 'rgba(255, 215, 0, 0.9)',
                color: '#333333',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                minWidth: '150px',
                border: '3px solid rgba(255, 140, 0, 1)',
                transform: 'scale(1.1)'
              }}>
                <div style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  {formatDayName(today)}
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: 'rgba(0, 0, 0, 0.7)',
                  fontWeight: '500'
                }}>
                  Today
                </div>
              </div>
            </div>
            <button
              onClick={() => handleButtonInteraction(currentQuestion)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                marginTop: '2rem'
              }}
            >
              {question.buttonText}
            </button>
          </>
        );

      case 'show-tomorrow':
        return (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
              margin: '2rem 0',
              flexWrap: 'wrap'
            }}>
              <div style={{
                background: 'rgba(34, 197, 94, 0.9)',
                color: 'white',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                minWidth: '150px',
                border: '3px solid rgba(34, 197, 94, 1)'
              }}>
                <div style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  {formatDayName(yesterday)}
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: '500'
                }}>
                  Yesterday
                </div>
              </div>
              <div style={{
                fontSize: '3rem',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                →
              </div>
              <div style={{
                background: 'rgba(255, 215, 0, 0.9)',
                color: '#333333',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                minWidth: '150px',
                border: '3px solid rgba(255, 140, 0, 1)',
                transform: 'scale(1.1)'
              }}>
                <div style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  {formatDayName(today)}
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: 'rgba(0, 0, 0, 0.7)',
                  fontWeight: '500'
                }}>
                  Today
                </div>
              </div>
              <div style={{
                fontSize: '3rem',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                →
              </div>
              <div
                id="tomorrow"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '16px',
                  padding: '2rem',
                  textAlign: 'center',
                  minWidth: '150px',
                  transition: 'all 0.5s ease',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  filter: 'blur(2px)'
                }}
              >
                <div className="timeline-day-name" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  ❓
                </div>
                <div className="timeline-day-label" style={{
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  Tomorrow
                </div>
              </div>
            </div>
            <button
              onClick={() => handleButtonInteraction(currentQuestion)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                marginTop: '2rem'
              }}
            >
              {question.buttonText}
            </button>
          </>
        );

      default:
        return <div>Question content not found</div>;
    }
  };

  return (
    <div style={{
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E9B 50%, #C8A8E9 100%)',
      color: 'white',
      position: 'relative'
    }}>
      {/* Header with progress */}
      <div style={{
        padding: '1rem 2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>📅 Calendar Math Adventure</h2>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          {questions.map((_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: completedQuestions.has(index)
                  ? 'rgba(34, 197, 94, 1)'
                  : index === currentQuestion
                  ? 'rgba(255, 255, 255, 1)'
                  : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                transform: index === currentQuestion ? 'scale(1.2)' : 'scale(1)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Video Section */}
      {hubSettings?.videos?.calendarMath && hubSettings.videos.calendarMath.length > 0 && (
        <div style={{
          padding: '1rem 2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: '600', fontSize: '1rem' }}>🎬 Videos:</span>
          {hubSettings.videos.calendarMath.map((video, index) => (
            <button
              key={index}
              onClick={() => {
                if (video.url) {
                  window.open(video.url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Play {video.name || `Video ${index + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Main Question Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '3rem',
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '900px',
          width: '100%',
          position: 'relative',
          overflow: 'visible'
        }}>
          {/* Question Header */}
          <div style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            Question {currentQuestion + 1} of {questions.length}
          </div>
          
          <div style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '700',
            marginBottom: '2rem',
            lineHeight: '1.2',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            color: 'white'
          }}>
            {questions[currentQuestion].question}
          </div>

          {/* Question Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {renderQuestionContent()}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        padding: '1rem 2rem 2rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          style={{
            background: currentQuestion === 0 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            color: currentQuestion === 0 ? 'rgba(255, 255, 255, 0.5)' : 'white',
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            fontWeight: '600',
            cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            opacity: currentQuestion === 0 ? 0.5 : 1
          }}
        >
          ← Back
        </button>

        <button
          onClick={nextQuestion}
          disabled={!canProceed && !completedQuestions.has(currentQuestion)}
          style={{
            background: (!canProceed && !completedQuestions.has(currentQuestion))
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(34, 197, 94, 0.8)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            color: (!canProceed && !completedQuestions.has(currentQuestion))
              ? 'rgba(255, 255, 255, 0.5)'
              : 'white',
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            fontWeight: '600',
            cursor: (!canProceed && !completedQuestions.has(currentQuestion))
              ? 'not-allowed'
              : 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            opacity: (!canProceed && !completedQuestions.has(currentQuestion)) ? 0.5 : 1,
            transform: (canProceed || completedQuestions.has(currentQuestion)) ? 'scale(1)' : 'scale(0.95)'
          }}
        >
          {currentQuestion === questions.length - 1 ? 'Complete! →' : 'Next Question →'}
        </button>
      </div>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '2rem',
          fontWeight: '700',
          background: 'rgba(34, 197, 94, 0.95)',
          color: 'white',
          padding: '2rem 3rem',
          borderRadius: '20px',
          zIndex: 1000,
          textAlign: 'center',
          border: '3px solid rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          animation: 'celebrate 2s ease-in-out',
          maxWidth: '80%'
        }}>
          {celebrationMessage}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes celebrate {
          0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.5); 
          }
          20% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.2); 
          }
          80% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
          }
          100% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(1); 
          }
        }

        @keyframes popIn {
          0% { 
            transform: scale(0); 
            opacity: 0; 
          }
          80% { 
            transform: scale(1.2); 
          }
          100% { 
            transform: scale(1); 
            opacity: 1; 
          }
        }

        @keyframes shimmer {
          0%, 100% { 
            transform: rotate(0deg); 
          }
          50% { 
            transform: rotate(180deg); 
          }
        }

        .highlight {
          background: rgba(255, 215, 0, 0.9) !important;
          border: 3px solid rgba(255, 140, 0, 1) !important;
          transform: scale(1.1) !important;
          color: #333333 !important;
        }

        .day-bubble.full-name {
          border-radius: 16px !important;
          width: 140px !important;
          height: 100px !important;
          font-size: 1.3rem !important;
          text-align: center !important;
          padding: 0.5rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .day-bubble.appeared {
          animation: popIn 0.5s ease-out !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .months-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          
          .timeline-container {
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          .timeline-arrow {
            transform: rotate(90deg) !important;
          }

          .week-days-container.full-names {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 480px) {
          .months-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarMathStep;

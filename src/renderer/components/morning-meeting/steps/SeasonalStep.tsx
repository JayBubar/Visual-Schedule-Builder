import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';
import StepNavigation from '../common/StepNavigation';

// Helper function to get video URL
const getVideoUrl = (video: any): string | null => {
  if (video?.videoData?.videoUrl) return video.videoData.videoUrl;
  if (video?.url) return video.url;
  if (typeof video === 'string') return video;
  return null;
};

// Data Structures
interface SeasonData { name: string; emoji: string; description: string; }
const SEASONS_DATA: { [key: string]: SeasonData } = {
  spring: { name: 'Spring', emoji: '🌸', description: 'It is warm and rainy. Flowers begin to bloom!' },
  summer: { name: 'Summer', emoji: '☀️', description: 'It is hot and sunny. Time for shorts and t-shirts!' },
  fall: { name: 'Fall', emoji: '🍂', description: 'It is cool and crisp. The leaves change colors!' },
  winter: { name: 'Winter', emoji: '❄️', description: 'It is cold and snowy. We wear heavy coats!' }
};
const SEASON_ORDER = ['spring', 'summer', 'fall', 'winter'];

const SeasonalStep: React.FC<MorningMeetingStepProps> = ({ currentDate, hubSettings, onNext, onBack, onHome, onStepComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showCelebration, setShowCelebration] = useState<string>('');
  
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  
  const [quizItems, setQuizItems] = useState<{ key: string; data: SeasonData }[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');

  const [revealedSeason, setRevealedSeason] = useState<boolean>(false);
  
  // NEW: State to dynamically control the header for the first step
  const [step1Header, setStep1Header] = useState("I can name the four seasons.");
  
  const seasonalVideos = useMemo(() => hubSettings?.videos?.seasonal || [], [hubSettings]);

  const currentSeasonKey = useMemo(() => {
    if (!currentDate) return 'summer';
    const month = currentDate.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }, [currentDate]);
  const currentSeasonData = useMemo(() => SEASONS_DATA[currentSeasonKey], [currentSeasonKey]);

  // MODIFICATION: Reverted first step text and combined standards
  const steps = useMemo(() => [
    { id: 'name-seasons', question: "I can name the four seasons.", standard: "Science K.E.3A.2 & K.E.3A.3" },
    { id: 'match-weather', question: "I can tell what the weather is usually like.", standard: "Science K.E.3A.2" },
    { id: 'current-season', question: "I can name the season we are in now.", standard: "Science K.E.3A.2" }
  ], []);

  useEffect(() => {
    if (currentStep === 1 && quizItems.length === 0) {
      const shuffled = [...SEASON_ORDER].sort(() => Math.random() - 0.5);
      setQuizItems(shuffled.map(key => ({ key, data: SEASONS_DATA[key] })));
    }
  }, [currentStep, quizItems.length]);
  
  const showCelebrationMessage = useCallback((message: string) => {
    setShowCelebration(message);
    setTimeout(() => setShowCelebration(''), 2500);
  }, []);

  const markStepComplete = useCallback((index: number) => {
    if (completedSteps.has(index)) return;
    setCompletedSteps(prev => new Set(prev).add(index));
  }, [completedSteps]);
  
  const handleInternalNext = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
  const handleInternalBack = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const isCurrentStepTaskComplete = () => {
    return completedSteps.has(currentStep);
  };

  const handleSeasonClick = useCallback((seasonKey: string) => {
    if (selectedSeasons.includes(seasonKey)) return;
    const newSelected = [...selectedSeasons, seasonKey];
    setSelectedSeasons(newSelected);
    if (newSelected.length === 4) {
        showCelebrationMessage('🎉 Great job!');
        markStepComplete(0);
        // NEW: Change the header text when the task is complete
        setStep1Header("I can say seasons happen in a circle, again and again!");
    }
  }, [selectedSeasons, showCelebrationMessage, markStepComplete]);

  const handleQuizAnswer = (selectedSeasonKey: string) => {
      const correctKey = quizItems[currentItemIndex].key;
      if (selectedSeasonKey === correctKey) {
          setFeedback('correct');
          setTimeout(() => {
              if (currentItemIndex < quizItems.length - 1) {
                  setCurrentItemIndex(prev => prev + 1);
                  setFeedback('');
              } else {
                  showCelebrationMessage('🏆 You matched them all!');
                  markStepComplete(1);
              }
          }, 1000);
      } else {
          setFeedback('incorrect');
          setTimeout(() => setFeedback(''), 1000);
      }
  };

  const handleRevealSeason = useCallback(() => {
    setRevealedSeason(true);
    showCelebrationMessage(`It's ${currentSeasonData.name}! 🎉`);
    markStepComplete(2);
  }, [currentSeasonData.name, showCelebrationMessage, markStepComplete]);

  const renderRightPanelContent = () => {
    const step = steps[currentStep];
    switch (step.id) {
      case 'name-seasons':
        const arrowsVisible = completedSteps.has(0);
        return (
          <>
            {/* MODIFICATION: Header now uses the dynamic state variable */}
            <h2 style={styles.rightPanelTitle}>{step1Header}</h2>
            <div style={styles.gridContainer}>
              {SEASON_ORDER.map(key => {
                  let arrowEmoji = '';
                  let arrowPositionStyle = {};
                  switch (key) {
                      case 'spring':
                          arrowEmoji = '➡️';
                          arrowPositionStyle = styles.arrowPositionBR;
                          break;
                      case 'summer':
                          arrowEmoji = '⬇️';
                          arrowPositionStyle = styles.arrowPositionBL;
                          break;
                      case 'winter':
                          arrowEmoji = '⬅️';
                          arrowPositionStyle = styles.arrowPositionTL;
                          break;
                      case 'fall':
                          arrowEmoji = '⬆️';
                          arrowPositionStyle = styles.arrowPositionTR;
                          break;
                  }

                  return (
                      <div key={key} onClick={() => handleSeasonClick(key)} style={{...styles.card, ...(selectedSeasons.includes(key) ? styles.cardSelected : {})}}>
                          <div style={styles.cardEmoji}>{SEASONS_DATA[key].emoji}</div>
                          <div style={styles.cardTitle}>{SEASONS_DATA[key].name}</div>
                          <div style={{...styles.arrow, ...arrowPositionStyle, ...(arrowsVisible ? styles.arrowVisible : {})}}>
                              {arrowEmoji}
                          </div>
                      </div>
                  );
              })}
            </div>
          </>
        );
      case 'match-weather':
        const currentQuizItem = quizItems[currentItemIndex];
        return (
            <>
                <h2 style={styles.rightPanelTitle}>{step.question}</h2>
                <div style={styles.quizButtonContainer}>
                    {SEASON_ORDER.map(key => (
                        <button key={key} onClick={() => handleQuizAnswer(key)} style={styles.quizButton}>
                            {SEASONS_DATA[key].emoji} {SEASONS_DATA[key].name}
                        </button>
                    ))}
                </div>
                {currentQuizItem && (
                    <div style={{...styles.quizCard, ...(feedback === 'correct' ? styles.quizCardCorrect : {}), ...(feedback === 'incorrect' ? styles.quizCardIncorrect : {})}}>
                        <div style={styles.cardEmoji}>{currentQuizItem.data.emoji}</div>
                        <p style={styles.quizCardText}>{currentQuizItem.data.description}</p>
                    </div>
                )}
            </>
        );
      case 'current-season':
        return (
          <>
            <h2 style={styles.rightPanelTitle}>{step.question}</h2>
            <div style={styles.mysteryBox}>
              {!revealedSeason ? (
                <>
                  <div style={{ fontSize: '6rem' }}>❓</div>
                  <button onClick={handleRevealSeason} style={styles.actionButton}>Reveal the Season!</button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '6rem' }}>{currentSeasonData.emoji}</div>
                  <h3 style={{ fontSize: '3rem', margin: 0, color: 'white' }}>{currentSeasonData.name}</h3>
                </>
              )}
            </div>
          </>
        );
      default: return null;
    }
  };
  
  return (
    <div style={styles.pageContainer}>
      <div style={styles.leftColumn}>
        <h1 style={styles.leftTitle}>🍂 Exploring Seasons</h1>
        {steps.map((step, index) => (
             <div key={step.id} onClick={() => setCurrentStep(index)} style={{...styles.progressItem, ...(currentStep === index ? styles.progressItemActive : {}), ...(completedSteps.has(index) ? styles.progressItemCompleted : {})}}>
                <span style={styles.progressCheck}>{completedSteps.has(index) ? '✅' : '➡️'}</span>
                <div>
                  {step.question}
                  <div style={styles.standardText}>Standard: {step.standard}</div>
                </div>
             </div>
        ))}
        {seasonalVideos.length > 0 && (
          <button style={styles.videoButton} onClick={() => {
            const videoUrl = getVideoUrl(seasonalVideos[0]);
            if (videoUrl) window.open(videoUrl, '_blank', 'width=800,height=600');
          }}>
            🎬 Watch a Season Video
          </button>
        )}
      </div>
      <div style={styles.rightColumn}>
          {renderRightPanelContent()}
          <div style={styles.internalNavBar}>
            {currentStep > 0 && <button onClick={handleInternalBack} style={styles.internalNavButton}>Back</button>}
            
            {currentStep < steps.length - 1 ? (
                <button onClick={handleInternalNext} disabled={!isCurrentStepTaskComplete()} style={{...styles.internalNavButton, ...(!isCurrentStepTaskComplete() ? styles.disabledButton : {})}}>Next</button>
            ) : (
                <button onClick={onStepComplete} disabled={!isCurrentStepTaskComplete()} style={{...styles.finishButton, ...(!isCurrentStepTaskComplete() ? styles.disabledButton : {})}}>
                    Finish Seasons ✔️
                </button>
            )}
          </div>
      </div>
      {showCelebration && (
        <div style={styles.celebrationOverlay}>
            <div style={styles.celebrationMessage}>{showCelebration}</div>
        </div>
       )}
       
       {/* Step Navigation - Higher z-index to appear above content */}
       <div style={{ position: 'relative', zIndex: 1001 }}>
         <StepNavigation navigation={{
           goNext: onNext,
           goBack: onBack,
           goHome: onHome,
           canGoBack: !!onBack,
           isLastStep: false
         }} />
       </div>
       
       <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

// Inline styles object
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { 
        height: '100%', 
        display: 'flex', 
        gap: '2rem', 
        padding: '2rem 2rem 120px 2rem', // Added bottom padding for navigation
        background: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)', 
        fontFamily: 'system-ui, sans-serif',
        boxSizing: 'border-box'
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
        color: 'white' 
    },
    rightColumn: { 
        flex: 1, 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'rgba(255, 255, 255, 0.2)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '24px', 
        padding: '2rem 2rem 120px 2rem', // Added bottom padding for navigation
        boxSizing: 'border-box'
    },
    leftTitle: { 
        fontSize: '2.5rem', 
        fontWeight: 700, 
        textShadow: '0 2px 4px rgba(0,0,0,0.2)', 
        marginBottom: '2rem' 
    },
    progressItem: { 
        cursor: 'pointer', 
        fontSize: '1.1rem', 
        padding: '1rem', 
        borderRadius: '12px', 
        marginBottom: '1rem', 
        fontWeight: 500, 
        transition: 'all 0.3s ease', 
        display: 'flex', 
        alignItems: 'center' 
    },
    progressItemActive: { 
        background: 'rgba(255, 255, 255, 0.3)', 
        fontWeight: 700 
    },
    progressItemCompleted: { 
        opacity: 1, 
        textDecoration: 'line-through' 
    },
    progressCheck: { 
        marginRight: '0.75rem', 
        fontSize: '1.2rem' 
    },
    standardText: { 
        fontSize: '0.8rem', 
        opacity: 0.7, 
        marginTop: '4px' 
    }, 
    rightPanelTitle: { 
        fontSize: '2.5rem', 
        fontWeight: 700, 
        color: 'white', 
        textShadow: '0 2px 5px rgba(0,0,0,0.3)', 
        textAlign: 'center', 
        marginBottom: '1rem' 
    },
    gridContainer: { 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1.5rem', 
        width: '80%', 
        maxWidth: '600px' 
    },
    card: { 
        background: 'rgba(255, 255, 255, 0.8)', 
        border: '1px solid rgba(255, 255, 255, 0.5)', 
        borderRadius: '16px', 
        padding: '1.5rem', 
        textAlign: 'center', 
        cursor: 'pointer', 
        transition: 'all 0.2s ease-in-out', 
        color: '#333',
        position: 'relative',
        overflow: 'hidden'
    },
    cardSelected: { 
        background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', 
        color: 'white', 
        transform: 'scale(1.05)', 
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)' 
    },
    cardEmoji: { 
        fontSize: '3rem' 
    },
    cardTitle: { 
        fontSize: '1.2rem', 
        fontWeight: 600 
    },
    arrow: {
        position: 'absolute',
        fontSize: '2rem',
        background: 'rgba(255, 255, 255, 0.9)',
        color: '#3B82F6',
        borderRadius: '8px',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        opacity: 0,
        transform: 'scale(0.5)',
        transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s'
    },
    arrowVisible: { 
        opacity: 1, 
        transform: 'scale(1)' 
    },
    arrowPositionBR: { bottom: '10px', right: '10px' },
    arrowPositionBL: { bottom: '10px', left: '10px' },
    arrowPositionTL: { top: '10px', left: '10px' },
    arrowPositionTR: { top: '10px', right: '10px' },
    quizButtonContainer: { 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem' 
    },
    quizButton: { 
        padding: '1rem 2rem', 
        fontSize: '1.2rem', 
        background: 'rgba(255,255,255,0.8)', 
        border: '1px solid rgba(255,255,255,0.5)', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        fontWeight: 600, 
        color: '#333' 
    },
    quizCard: { 
        width: '80%', 
        background: 'rgba(255,255,255,0.7)', 
        padding: '2rem', 
        borderRadius: '16px', 
        textAlign: 'center', 
        transition: 'all 0.3s ease' 
    },
    quizCardCorrect: { 
        background: 'rgba(40, 167, 69, 0.8)', 
        color: 'white' 
    },
    quizCardIncorrect: { 
        background: 'rgba(220, 53, 69, 0.8)', 
        color: 'white', 
        animation: 'shake 0.5s' 
    },
    quizCardText: { 
        fontSize: '1.5rem', 
        fontWeight: 500, 
        margin: '1rem 0 0 0' 
    },
    mysteryBox: { 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'rgba(0,0,0,0.1)', 
        borderRadius: '16px', 
        padding: '3rem', 
        width: '80%', 
        color: 'white' 
    },
    actionButton: { 
        padding: '1rem 2rem', 
        fontSize: '1.2rem', 
        background: 'linear-gradient(45deg, #28a745 0%, #20c997 100%)', 
        color: 'white', 
        border: 'none', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        fontWeight: 600, 
        marginTop: '2rem' 
    },
    internalNavBar: { 
        position: 'absolute', 
        bottom: '2rem', 
        display: 'flex', 
        gap: '1rem' 
    },
    internalNavButton: { 
        padding: '0.8rem 2rem', 
        fontSize: '1rem', 
        fontWeight: 600, 
        borderRadius: '12px', 
        cursor: 'pointer', 
        background: 'rgba(0, 86, 179, 0.7)', 
        color: 'white', 
        border: '1px solid rgba(255,255,255,0.5)' 
    },
    finishButton: { 
        padding: '0.8rem 2rem', 
        fontSize: '1.2rem', 
        fontWeight: 600, 
        borderRadius: '12px', 
        cursor: 'pointer', 
        background: 'linear-gradient(45deg, #28a745, #20c997)', 
        color: 'white', 
        border: 'none' 
    },
    disabledButton: { 
        background: 'rgba(108, 117, 125, 0.7)', 
        cursor: 'not-allowed', 
        color: 'rgba(255,255,255,0.5)' 
    },
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
        marginTop: 'auto', 
        padding: '1rem', 
        fontSize: '1rem', 
        background: 'rgba(0, 86, 179, 0.7)', 
        color: 'white', 
        border: '1px solid rgba(255,255,255,0.5)', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        fontWeight: 600 
    }
};

export default SeasonalStep;

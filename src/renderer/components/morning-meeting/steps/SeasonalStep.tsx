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
            {/* FIXED: Header now uses the dynamic state variable */}
            <h2 style={styles.rightPanelTitle}>{step1Header}</h2>
            {/* FIXED: New layout - single row with larger cards and better spacing */}
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
                {/* FIXED: Move quiz buttons to single horizontal line and make them larger */}
                <div style={styles.quizButtonContainer}>
                    {SEASON_ORDER.map(key => (
                        <button key={key} onClick={() => handleQuizAnswer(key)} style={styles.quizButton}>
                            {SEASONS_DATA[key].emoji} {SEASONS_DATA[key].name}
                        </button>
                    ))}
                </div>
                {/* FIXED: Move the quiz card DOWN to make space for larger horizontal buttons */}
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
            <div style={styles.seasonRevealContainer}>
              {!revealedSeason ? (
                <>
                  <div style={styles.mysterySeasonBox}>
                    <div style={styles.mysteryEmoji}>❓</div>
                    <p style={styles.mysteryText}>What season is it?</p>
                  </div>
                  <button onClick={handleRevealSeason} style={styles.seasonActionButton}>
                    🔍 Reveal the Season!
                  </button>
                </>
              ) : (
                <div style={styles.revealedSeasonBox} className="season-reveal-animation">
                  <div style={styles.seasonEmoji}>{currentSeasonData.emoji}</div>
                  <h3 style={styles.seasonName}>{currentSeasonData.name}</h3>
                  <p style={styles.seasonDescription}>{currentSeasonData.description}</p>
                </div>
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
       
       <StepNavigation navigation={{
         goNext: onNext,
         goBack: onBack,
         goHome: onHome,
         canGoBack: !!onBack,
         isLastStep: false
       }} />
       
       <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        
        .season-reveal-animation {
          animation: seasonReveal 1s ease-out;
        }

        @keyframes seasonReveal {
          0% { 
            transform: scale(0.5) rotate(-10deg);
            opacity: 0;
          }
          50% { 
            transform: scale(1.2) rotate(5deg);
            opacity: 0.8;
          }
          100% { 
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// FIXED STYLES - Single row layout with larger cards
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { 
        height: '100vh',
        background: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)', 
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
        marginBottom: '2rem' 
    },
    // FIXED: Keep 2x2 grid but make cards larger and better centered  
    gridContainer: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', // Back to 2x2 grid
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '2rem', // Larger gap for better spacing
        width: '100%', 
        maxWidth: '600px', // Reasonable max width for 2x2
        marginTop: '1rem',
        justifyItems: 'center', // Center items in grid cells
        alignItems: 'center'
    },
    // FIXED: Larger cards with better proportions but still 2x2
    card: { 
        background: 'rgba(255, 255, 255, 0.8)', 
        border: '1px solid rgba(255, 255, 255, 0.5)', 
        borderRadius: '20px', // Larger border radius
        padding: '2.5rem', // Increased padding more
        textAlign: 'center', 
        cursor: 'pointer', 
        transition: 'all 0.2s ease-in-out', 
        color: '#333',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '200px', // Larger minimum height
        minWidth: '200px',  // Minimum width for consistency
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    cardSelected: { 
        background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', 
        color: 'white', 
        transform: 'scale(1.05)', 
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)' 
    },
    // FIXED: Larger emoji for better visual impact
    cardEmoji: { 
        fontSize: '4rem', // Increased from 3rem
        marginBottom: '1rem'
    },
    // FIXED: Larger title text
    cardTitle: { 
        fontSize: '1.4rem', // Increased from 1.2rem
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
    arrowPositionBR: { bottom: '15px', right: '15px' },
    arrowPositionBL: { bottom: '15px', left: '15px' },
    arrowPositionTL: { top: '15px', left: '15px' },
    arrowPositionTR: { top: '15px', right: '15px' },
    // FIXED: Single horizontal line layout for quiz buttons (step 2)
    quizButtonContainer: { 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '3rem', // More space before quiz card
        width: '100%',
        justifyContent: 'center',
        flexWrap: 'nowrap' // Keep in single line
    },
    // FIXED: Larger quiz buttons for single horizontal line
    quizButton: { 
        padding: '1.5rem 2rem', // Larger padding
        fontSize: '1.4rem', // Larger font
        background: 'rgba(255,255,255,0.8)', 
        border: '1px solid rgba(255,255,255,0.5)', 
        borderRadius: '16px', // Larger border radius
        cursor: 'pointer', 
        fontWeight: 600, 
        color: '#333',
        minWidth: '140px', // Minimum width for consistency
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem'
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
    internalNavBar: { 
        position: 'absolute', 
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', 
        gap: '1rem',
        zIndex: 10
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
    },
    seasonRevealContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: '2rem'
    },
    mysterySeasonBox: {
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '20px',
        padding: '3rem',
        textAlign: 'center',
        width: '400px'
    },
    mysteryEmoji: {
        fontSize: '8rem',
        marginBottom: '1rem'
    },
    mysteryText: {
        fontSize: '1.5rem',
        color: 'white',
        margin: 0
    },
    seasonActionButton: {
        padding: '1rem 2rem',
        fontSize: '1.2rem',
        background: 'linear-gradient(45deg, #28a745 0%, #20c997 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 600
    },
    revealedSeasonBox: {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
        borderRadius: '20px',
        padding: '4rem',
        textAlign: 'center',
        width: '500px',
        border: '3px solid rgba(255,255,255,0.3)'
    },
    seasonEmoji: {
        fontSize: '10rem',
        marginBottom: '1rem',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
    },
    seasonName: {
        fontSize: '4rem',
        fontWeight: 'bold',
        margin: '1rem 0',
        color: 'white'
    },
    seasonDescription: {
        fontSize: '1.5rem',
        color: 'white',
        opacity: 0.9,
        margin: 0
    }
};

export default SeasonalStep;
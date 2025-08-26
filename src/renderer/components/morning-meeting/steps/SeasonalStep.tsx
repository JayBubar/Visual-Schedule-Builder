import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';
import { styles } from './SeasonalStep.styles';
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
       
       {/* Step Navigation */}
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
      `}</style>
    </div>
  );
};

export default SeasonalStep;

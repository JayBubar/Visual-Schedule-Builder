import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

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

const SeasonalStep: React.FC<MorningMeetingStepProps> = ({ currentDate, hubSettings, onStepComplete }) => {
  // MODIFICATION: Re-structured state for a 3-step flow
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showCelebration, setShowCelebration] = useState<string>('');
  
  // State for Step 1
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  
  // NEW: State for Step 2 (Quiz Game)
  const [quizItems, setQuizItems] = useState<{ key: string; data: SeasonData }[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');

  // State for Step 3
  const [revealedSeason, setRevealedSeason] = useState<boolean>(false);
  
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

  // MODIFICATION: New 3-step definition
  const steps = useMemo(() => [
    { id: 'name-seasons', question: "I can name the four seasons." },
    { id: 'match-weather', question: "I can tell what the weather is usually like." },
    { id: 'current-season', question: "I can name the season we are in now." }
  ], []);

  // Initialize the quiz game when entering Step 2
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

  // --- Step 1 Logic ---
  const handleSeasonClick = useCallback((seasonKey: string) => {
    if (selectedSeasons.includes(seasonKey)) return;
    const newSelected = [...selectedSeasons, seasonKey];
    setSelectedSeasons(newSelected);
    if (newSelected.length === 4) {
        showCelebrationMessage('🎉 All 4 seasons!');
        markStepComplete(0);
    }
  }, [selectedSeasons, showCelebrationMessage, markStepComplete]);

  // --- Step 2 Logic (Quiz Game) ---
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

  // --- Step 3 Logic ---
  const handleRevealSeason = useCallback(() => {
    setRevealedSeason(true);
    showCelebrationMessage(`It's ${currentSeasonData.name}! 🎉`);
    markStepComplete(2);
  }, [currentSeasonData.name, showCelebrationMessage, markStepComplete]);

  const renderRightPanelContent = () => {
    const step = steps[currentStep];
    switch (step.id) {
      case 'name-seasons':
        return (
          <>
            <h2 style={styles.rightPanelTitle}>{step.question}</h2>
            <div style={styles.gridContainer}>
              {SEASON_ORDER.map(key => (
                  <div key={key} onClick={() => handleSeasonClick(key)} style={{...styles.card, ...(selectedSeasons.includes(key) ? styles.cardSelected : {})}}>
                    <div style={styles.cardEmoji}>{SEASONS_DATA[key].emoji}</div>
                    <div style={styles.cardTitle}>{SEASONS_DATA[key].name}</div>
                  </div>
              ))}
            </div>
            {/* NEW: Cyclical pattern display */}
            {completedSteps.has(0) && (
                <div style={styles.cycleContainer}>
                    <p style={styles.cycleText}>Seasons happen in a circle, again and again!</p>
                    <div style={styles.cycleGraphic}>
                        <span>🌸</span> <span>➡️</span> <span>☀️</span> <span>➡️</span> <span>🍂</span> <span>➡️</span> <span>❄️</span> <span>🔄</span>
                    </div>
                </div>
            )}
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
                      <div style={{ fontSize: '6
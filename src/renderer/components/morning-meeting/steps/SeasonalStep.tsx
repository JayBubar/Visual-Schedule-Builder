// ========================================
// 🍂 FIXED SEASONAL STEP - PART 1
// File: src/renderer/components/morning-meeting/steps/SeasonalStep.tsx
// CRITICAL FIX: Component named 'SeasonalStep' (not 'Enhanced...')
// ========================================

import React, { useState, useEffect, useCallback } from 'react';
import { MorningMeetingStepProps, SeasonalStepData } from '../types/morningMeetingTypes';

// ========================================
// 🎯 TYPES & INTERFACES
// ========================================

interface GameItem {
  id: string;
  text: string;
  emoji: string;
  season: string;
  type: 'activity' | 'season';
}

interface SeasonData {
  name: string;
  emoji: string;
  months: string[];
  details: {
    weather: string;
    nature: string;
    activities: string;
    clothing: string;
  };
}

// ========================================
// 🌍 SEASON DATA CONFIGURATION
// ========================================

const SEASONS_DATA: { [key: string]: SeasonData } = {
  spring: {
    name: 'Spring',
    emoji: '🌸',
    months: ['March', 'April', 'May'],
    details: {
      weather: 'Warm and rainy with gentle sunshine',
      nature: 'Flowers bloom and trees grow new green leaves',
      activities: 'Planting gardens, flying kites, nature walks',
      clothing: 'Light jackets, rain boots, and colorful clothes'
    }
  },
  summer: {
    name: 'Summer',
    emoji: '☀️',
    months: ['June', 'July', 'August'],
    details: {
      weather: 'Hot and sunny with warm temperatures',
      nature: 'Trees are full of green leaves, flowers everywhere',
      activities: 'Swimming, picnics, playing outside, beach days',
      clothing: 'Shorts, t-shirts, sandals, and sun hats'
    }
  },
  fall: {
    name: 'Fall',
    emoji: '🍂',
    months: ['September', 'October', 'November'],
    details: {
      weather: 'Cool and crisp with colorful leaves falling',
      nature: 'Leaves change to red, orange, and yellow colors',
      activities: 'Jumping in leaf piles, pumpkin picking, hiking',
      clothing: 'Sweaters, jeans, boots, and cozy scarves'
    }
  },
  winter: {
    name: 'Winter',
    emoji: '❄️',
    months: ['December', 'January', 'February'],
    details: {
      weather: 'Cold and snowy with frosty mornings',
      nature: 'Trees are bare, some animals hibernate',
      activities: 'Building snowmen, skiing, drinking hot cocoa',
      clothing: 'Heavy coats, mittens, warm boots, and hats'
    }
  }
};

// ========================================
// 🎮 GAME CONFIGURATION
// ========================================

const GAME_ITEMS: GameItem[] = [
  { id: 'skiing', text: '⛷️ Skiing', emoji: '⛷️', season: 'winter', type: 'activity' },
  { id: 'swimming', text: '🏊‍♂️ Swimming', emoji: '🏊‍♂️', season: 'summer', type: 'activity' },
  { id: 'leaf-jumping', text: '🍂 Leaf Jumping', emoji: '🍂', season: 'fall', type: 'activity' },
  { id: 'planting', text: '🌱 Planting Flowers', emoji: '🌱', season: 'spring', type: 'activity' },
  { id: 'spring-season', text: '🌸 Spring', emoji: '🌸', season: 'spring', type: 'season' },
  { id: 'summer-season', text: '☀️ Summer', emoji: '☀️', season: 'summer', type: 'season' },
  { id: 'fall-season', text: '🍂 Fall', emoji: '🍂', season: 'fall', type: 'season' },
  { id: 'winter-season', text: '❄️ Winter', emoji: '❄️', season: 'winter', type: 'season' }
];
// ========================================
// 🍂 FIXED SEASONAL STEP - PART 2
// Component Definition & State Management
// CRITICAL: Named 'SeasonalStep' to match existing imports
// ========================================

const SeasonalStep: React.FC<MorningMeetingStepProps> = ({
  currentDate,
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings
}) => {
  // ========================================
  // 🎯 STATE MANAGEMENT
  // ========================================
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [revealedSeason, setRevealedSeason] = useState<boolean>(false);
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
  const [gameState, setGameState] = useState<{
    selectedItems: GameItem[];
    matches: string[];
    gameComplete: boolean;
  }>({
    selectedItems: [],
    matches: [],
    gameComplete: false
  });
  const [showCelebration, setShowCelebration] = useState<string>('');

  // ========================================
  // 🌍 SEASON DETECTION
  // ========================================
  const getCurrentSeason = useCallback((): string => {
    const month = currentDate.getMonth(); // 0-11
    
    if (month >= 2 && month <= 4) return 'spring'; // March, April, May
    if (month >= 5 && month <= 7) return 'summer'; // June, July, August  
    if (month >= 8 && month <= 10) return 'fall'; // September, October, November
    return 'winter'; // December, January, February
  }, [currentDate]);

  const currentSeason = getCurrentSeason();
  const currentSeasonData = SEASONS_DATA[currentSeason];
  
  // Get next season
  const getNextSeason = useCallback((): string => {
    const seasonOrder = ['winter', 'spring', 'summer', 'fall'];
    const currentIndex = seasonOrder.indexOf(currentSeason);
    return seasonOrder[(currentIndex + 1) % 4];
  }, [currentSeason]);

  const nextSeason = getNextSeason();
  const nextSeasonData = SEASONS_DATA[nextSeason];

  // ========================================
  // 💾 DATA PERSISTENCE (Compatible with existing system)
  // ========================================
  useEffect(() => {
    const stepData: SeasonalStepData = {
      currentSeason,
      currentSection: currentSection === 1 ? 'characteristics' : 
                     currentSection === 2 ? 'vocabulary' : 'activities',
      completedSections: completedSections.map(s => 
        s === 1 ? 'characteristics' : s === 2 ? 'vocabulary' : 'activities'
      ),
      completedActivities: gameState.matches,
      learnedVocabulary: selectedDetails,
      completedAt: completedSections.length >= 4 ? new Date() : undefined
    };
    onDataUpdate(stepData);
  }, [currentSection, completedSections, selectedDetails, gameState.matches, currentSeason, onDataUpdate]);
  // ========================================
  // 🎮 INTERACTION HANDLERS
  // ========================================
  const handleSeasonClick = useCallback((seasonKey: string) => {
    if (!selectedSeasons.includes(seasonKey)) {
      const newSelected = [...selectedSeasons, seasonKey];
      setSelectedSeasons(newSelected);
      
      if (newSelected.length === 4) {
        showCelebrationMessage('🎉 Perfect! Earth has 4 beautiful seasons! 🌍');
        setTimeout(() => markSectionComplete(1), 2000);
      }
    }
  }, [selectedSeasons]);

  const handleRevealSeason = useCallback(() => {
    setRevealedSeason(true);
    showCelebrationMessage(`🌞 Amazing! We're in ${currentSeasonData.name}! 🎉`);
    setTimeout(() => markSectionComplete(2), 2000);
  }, [currentSeasonData.name]);

  const handleDetailClick = useCallback((detailKey: string) => {
    if (!selectedDetails.includes(detailKey)) {
      const newSelected = [...selectedDetails, detailKey];
      setSelectedDetails(newSelected);
      
      if (newSelected.length === 4) {
        showCelebrationMessage(`🌟 You learned everything about ${currentSeasonData.name}! Amazing! ☀️`);
        setTimeout(() => markSectionComplete(3), 2000);
      }
    }
  }, [selectedDetails, currentSeasonData.name]);

  const handleGameItemClick = useCallback((item: GameItem) => {
    if (gameState.matches.includes(item.id)) return; // Already matched
    
    const newSelected = [...gameState.selectedItems.filter(i => i.id !== item.id), item];
    
    if (newSelected.length === 2) {
      const [item1, item2] = newSelected;
      
      if (item1.season === item2.season && item1.type !== item2.type) {
        // Correct match!
        const newMatches = [...gameState.matches, item1.id, item2.id];
        setGameState({
          selectedItems: [],
          matches: newMatches,
          gameComplete: newMatches.length === 8
        });
        
        if (newMatches.length === 8) {
          showCelebrationMessage('🏆 You won the Season Matching Game! Amazing! 🌟');
          setTimeout(() => markSectionComplete(4), 2000);
        } else {
          showCelebrationMessage('🎉 Perfect match! Great job!');
        }
      } else {
        // Wrong match
        showCelebrationMessage('🤔 Try again! Think about when you would do that activity!');
        setTimeout(() => {
          setGameState(prev => ({ ...prev, selectedItems: [] }));
        }, 1500);
      }
    } else {
      setGameState(prev => ({ ...prev, selectedItems: newSelected }));
    }
  }, [gameState]);

  const markSectionComplete = useCallback((section: number) => {
    if (!completedSections.includes(section)) {
      setCompletedSections(prev => [...prev, section]);
    }
  }, [completedSections]);

  const showCelebrationMessage = useCallback((message: string) => {
    setShowCelebration(message);
    setTimeout(() => setShowCelebration(''), 3000);
  }, []);

  const goToNextSection = useCallback(() => {
    if (currentSection < 4) {
      setCurrentSection(currentSection + 1);
    } else {
      onNext();
    }
  }, [currentSection, onNext]);

  const goToPreviousSection = useCallback(() => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    } else {
      onBack();
    }
  }, [currentSection, onBack]);
  // ========================================
  // 🎨 MAIN RENDER - COMPLETE COMPONENT
  // ========================================
  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #f9ca24 75%, #f0932b 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 8s ease-in-out infinite',
      position: 'relative',
      overflow: 'hidden',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Floating magical particles */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '2rem', opacity: 0.7, animation: 'float 6s ease-in-out infinite' }}>🌸</div>
      <div style={{ position: 'absolute', top: '20%', right: '15%', fontSize: '2rem', opacity: 0.7, animation: 'float 6s ease-in-out infinite 1s' }}>☀️</div>
      <div style={{ position: 'absolute', bottom: '30%', left: '20%', fontSize: '2rem', opacity: 0.7, animation: 'float 6s ease-in-out infinite 2s' }}>🍂</div>
      <div style={{ position: 'absolute', bottom: '15%', right: '25%', fontSize: '2rem', opacity: 0.7, animation: 'float 6s ease-in-out infinite 3s' }}>❄️</div>

      {/* Section Navigation */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '15px',
        zIndex: 100
      }}>
        {[
          { num: 1, text: '🌍 Overview' },
          { num: 2, text: '🤔 What Season?' },
          { num: 3, text: `${currentSeasonData.emoji} Season Fun` },
          { num: 4, text: '🔮 What\'s Next' }
        ].map(({ num, text }) => (
          <button
            key={num}
            onClick={() => setCurrentSection(num)}
            style={{
              background: currentSection === num ? '#ff6b6b' : 'rgba(255, 255, 255, 0.9)',
              color: currentSection === num ? 'white' : '#333',
              border: '3px solid #ff6b6b',
              borderRadius: '20px',
              padding: '15px 25px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              transform: currentSection === num ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {text}
            {completedSections.includes(num) && (
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                background: '#22c55e',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                🌟
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 40px 40px'
      }}>
        {/* Section 1: Seasons Overview */}
        {currentSection === 1 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '30px',
            padding: '4rem',
            backdropFilter: 'blur(20px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            maxWidth: '900px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', color: '#ffd700', marginBottom: '1rem', fontWeight: '700' }}>
              Question 1 of 4
            </div>
            <div style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: '800',
              marginBottom: '2rem',
              lineHeight: '1.2',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
              background: 'linear-gradient(45deg, #fff, #ffd700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🌍 How many seasons does Earth have?
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '2rem',
              margin: '2rem 0'
            }}>
              {Object.entries(SEASONS_DATA).map(([key, season]) => (
                <div
                  key={key}
                  onClick={() => handleSeasonClick(key)}
                  style={{
                    background: selectedSeasons.includes(key) 
                      ? 'linear-gradient(45deg, #22c55e, #16a34a)' 
                      : 'rgba(255, 255, 255, 0.9)',
                    color: selectedSeasons.includes(key) ? 'white' : '#333',
                    borderRadius: '25px',
                    padding: '2.5rem',
                    border: '4px solid transparent',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
                    transform: selectedSeasons.includes(key) ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <span style={{ fontSize: '5rem', marginBottom: '1rem', display: 'block' }}>
                    {season.emoji}
                  </span>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
                    {season.name}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '600', opacity: '0.8' }}>
                    {season.months.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Current Season Mystery */}
        {currentSection === 2 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '30px',
            padding: '4rem',
            backdropFilter: 'blur(20px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            maxWidth: '900px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', color: '#ffd700', marginBottom: '1rem', fontWeight: '700' }}>
              Question 2 of 4
            </div>
            <div style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: '800',
              marginBottom: '2rem',
              lineHeight: '1.2',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
              background: 'linear-gradient(45deg, #fff, #ffd700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🤔 What season are we in right now?
            </div>
            
            {!revealedSeason ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '30px',
                padding: '4rem',
                border: '4px dashed rgba(255, 255, 255, 0.8)',
                marginBottom: '3rem'
              }}>
                <div style={{ fontSize: '6rem', marginBottom: '2rem' }}>❓❓❓</div>
                <p style={{ fontSize: '1.8rem', marginBottom: '2rem', fontWeight: '600' }}>
                  It's {currentSeasonData.months[1]}... can you guess what season we're in?
                </p>
                <button
                  onClick={handleRevealSeason}
                  style={{
                    background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
                    border: 'none',
                    borderRadius: '20px',
                    color: 'white',
                    padding: '25px 50px',
                    fontSize: '1.8rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                  }}
                >
                  🔍 Reveal the Magic Season!
                </button>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 215, 0, 0.3)',
                borderRadius: '30px',
                padding: '3rem',
                border: '4px solid #ffd700'
              }}>
                <div style={{ fontSize: '6rem', marginBottom: '1.5rem' }}>{currentSeasonData.emoji}</div>
                <h2 style={{ fontSize: '4rem', marginBottom: '1rem', color: '#ffd700', fontWeight: '800' }}>
                  {currentSeasonData.name.toUpperCase()}!
                </h2>
                <p style={{ fontSize: '1.8rem', fontWeight: '600' }}>
                  🎉 Amazing! {currentSeasonData.months[1]} is in {currentSeasonData.name.toLowerCase()}! 🌞
                </p>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Season Details */}
        {currentSection === 3 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '30px',
            padding: '4rem',
            backdropFilter: 'blur(20px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            maxWidth: '900px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', color: '#ffd700', marginBottom: '1rem', fontWeight: '700' }}>
              Question 3 of 4
            </div>
            <div style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: '800',
              marginBottom: '2rem',
              lineHeight: '1.2',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
              background: 'linear-gradient(45deg, #fff, #ffd700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {currentSeasonData.emoji} What makes {currentSeasonData.name.toLowerCase()} so special?
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '2rem',
              margin: '2rem 0'
            }}>
              {Object.entries(currentSeasonData.details).map(([key, detail]) => {
                const icons = {
                  weather: '🌡️',
                  nature: '🌳',
                  activities: '🏊‍♂️',
                  clothing: '👕'
                };
                const titles = {
                  weather: `${currentSeasonData.name} Weather!`,
                  nature: 'Nature Changes!',
                  activities: 'Fun Activities!',
                  clothing: 'What We Wear!'
                };
                
                return (
                  <div
                    key={key}
                    onClick={() => handleDetailClick(key)}
                    style={{
                      background: selectedDetails.includes(key)
                        ? 'linear-gradient(45deg, #22c55e, #16a34a)'
                        : 'rgba(255, 255, 255, 0.9)',
                      color: selectedDetails.includes(key) ? 'white' : '#333',
                      borderRadius: '20px',
                      padding: '2rem',
                      border: '3px solid transparent',
                      transition: 'all 0.4s ease',
                      cursor: 'pointer',
                      transform: selectedDetails.includes(key) ? 'translateY(-8px) scale(1.05)' : 'scale(1)',
                      boxShadow: selectedDetails.includes(key) 
                        ? '0 20px 40px rgba(0,0,0,0.3)' 
                        : '0 10px 20px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}>
                      {icons[key as keyof typeof icons]}
                    </span>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1rem', color: selectedDetails.includes(key) ? 'white' : '#ff6b6b' }}>
                      {titles[key as keyof typeof titles]}
                    </div>
                    <div style={{ fontSize: '1.3rem', lineHeight: '1.5', fontWeight: '500' }}>
                      {detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 4: Next Season + Game */}
        {currentSection === 4 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '30px',
            padding: '4rem',
            backdropFilter: 'blur(20px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            maxWidth: '900px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', color: '#ffd700', marginBottom: '1rem', fontWeight: '700' }}>
              Question 4 of 4
            </div>
            <div style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: '800',
              marginBottom: '2rem',
              lineHeight: '1.2',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
              background: 'linear-gradient(45deg, #fff, #ffd700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🔮 What magical season comes next?
            </div>
            
            {/* Next Season Teaser */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '30px',
              padding: '3rem',
              border: '3px solid rgba(255, 255, 255, 0.4)',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '2rem', color: '#ffd700', marginBottom: '1rem', fontWeight: '700' }}>
                {nextSeasonData.emoji} Coming Soon...
              </div>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1.5rem',
                fontWeight: '800',
                background: 'linear-gradient(45deg, #fff, #ffd700, #ff6b6b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {nextSeasonData.name.toUpperCase()}!
              </div>
              <p style={{ fontSize: '1.6rem', marginBottom: '1.5rem', fontWeight: '600' }}>
                After {currentSeasonData.name.toLowerCase()}, {nextSeasonData.details.nature.toLowerCase()}!
              </p>
              <div style={{ fontSize: '3rem' }}>
                {nextSeasonData.emoji} {nextSeasonData.emoji} {nextSeasonData.emoji}
              </div>
            </div>
            
            {/* Season Matching Game */}
            {!gameState.gameComplete ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '25px',
                padding: '2rem',
                margin: '2rem 0',
                border: '3px solid rgba(255, 255, 255, 0.4)'
              }}>
                <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: '700' }}>
                  🎮 Season Matching Game!
                </h3>
                <p style={{ fontSize: '1.3rem', marginBottom: '2rem', fontWeight: '600' }}>
                  Match each activity to the right season!
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '2rem',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  {/* Activities Column */}
                  <div>
                    <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700' }}>🎯 Activities</h4>
                    {GAME_ITEMS.filter(item => item.type === 'activity').map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleGameItemClick(item)}
                        style={{
                          background: gameState.matches.includes(item.id)
                            ? 'linear-gradient(45deg, #22c55e, #16a34a)'
                            : gameState.selectedItems.some(si => si.id === item.id)
                            ? 'rgba(255, 107, 107, 0.9)'
                            : 'rgba(255,255,255,0.9)',
                          color: gameState.matches.includes(item.id) || gameState.selectedItems.some(si => si.id === item.id) ? 'white' : '#333',
                          padding: '1rem',
                          margin: '0.5rem 0',
                          borderRadius: '12px',
                          cursor: gameState.matches.includes(item.id) ? 'default' : 'pointer',
                          textAlign: 'center',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          border: gameState.selectedItems.some(si => si.id === item.id) ? '3px solid #ff6b6b' : 'none',
                          transform: gameState.selectedItems.some(si => si.id === item.id) ? 'scale(1.05)' : 'scale(1)'
                        }}
                      >
                        {item.text}
                      </div>
                    ))}
                  </div>
                  
                  {/* Seasons Column */}
                  <div>
                    <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700' }}>🌍 Seasons</h4>
                    {GAME_ITEMS.filter(item => item.type === 'season').map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleGameItemClick(item)}
                        style={{
                          background: gameState.matches.includes(item.id)
                            ? 'linear-gradient(45deg, #22c55e, #16a34a)'
                            : gameState.selectedItems.some(si => si.id === item.id)
                            ? 'rgba(255, 107, 107, 0.9)'
                            : item.season === 'spring' ? 'rgba(152,251,152,0.9)'
                            : item.season === 'summer' ? 'rgba(255,215,0,0.9)'
                            : item.season === 'fall' ? 'rgba(255,140,0,0.9)'
                            : 'rgba(173,216,230,0.9)',
                          color: gameState.matches.includes(item.id) || gameState.selectedItems.some(si => si.id === item.id) ? 'white' : '#333',
                          padding: '1rem',
                          margin: '0.5rem 0',
                          borderRadius: '12px',
                          cursor: gameState.matches.includes(item.id) ? 'default' : 'pointer',
                          textAlign: 'center',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          border: gameState.selectedItems.some(si => si.id === item.id) ? '3px solid #ff6b6b' : 'none',
                          transform: gameState.selectedItems.some(si => si.id === item.id) ? 'scale(1.05)' : 'scale(1)'
                        }}
                      >
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Video Section - appears after game completion
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '25px',
                padding: '2.5rem',
                border: '3px dashed rgba(255, 255, 255, 0.8)',
                marginTop: '2rem'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎬</div>
                <div style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>
                  Watch an amazing video about seasons!
                </div>
                <button
                  onClick={() => {
                    // Video functionality will be handled by hub settings
                    showCelebrationMessage('🎬 Time for an amazing season video! 📺');
                  }}
                  style={{
                    background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                    border: 'none',
                    borderRadius: '15px',
                    color: 'white',
                    padding: '20px 40px',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                  }}
                >
                  📺 Play Season Adventure!
                </button>
                <p style={{ fontSize: '1rem', marginTop: '1rem', opacity: '0.8' }}>
                  (Teacher selects the perfect video from hub settings)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '15px'
      }}>
        {currentSection > 1 && (
          <button
            onClick={goToPreviousSection}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#333',
              border: '3px solid #ff6b6b',
              borderRadius: '15px',
              padding: '18px 30px',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
            }}
          >
            ← Back
          </button>
        )}
        <button
          onClick={goToNextSection}
          style={{
            background: '#22c55e',
            color: 'white',
            border: '3px solid #22c55e',
            borderRadius: '15px',
            padding: '18px 30px',
            fontSize: '1.2rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
          }}
        >
          {currentSection === 4 ? 'Finish Season Magic! ✨' : 'Continue Magic →'}
        </button>
      </div>

      {/* Celebration Message */}
      {showCelebration && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '2.5rem',
          fontWeight: '800',
          background: 'linear-gradient(45deg, #22c55e, #16a34a)',
          color: 'white',
          padding: '2rem 3rem',
          borderRadius: '25px',
          zIndex: 1000,
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          animation: 'celebrate 3s ease-in-out'
        }}>
          {showCelebration}
        </div>
      )}

      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(-10px) rotate(240deg); }
        }
        
        @keyframes celebrate {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3) rotate(-10deg); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2) rotate(5deg); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

// ========================================
// 🚀 EXPORT - CRITICAL: Must match existing imports
// ========================================
export default SeasonalStep;
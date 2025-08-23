import React, { useState, useEffect, useCallback } from 'react';
import { MorningMeetingStepProps, SeasonalStepData } from '../types/morningMeetingTypes';

// ========================================
// 🎯 TYPES & DATA (Unchanged)
// ========================================
interface GameItem { id: string; text: string; emoji: string; season: string; type: 'activity' | 'season'; }
interface SeasonData { name: string; emoji: string; months: string[]; details: { weather: string; nature: string; activities: string; clothing: string; }; }

const SEASONS_DATA: { [key: string]: SeasonData } = {
  spring: { name: 'Spring', emoji: '🌸', months: ['March', 'April', 'May'], details: { weather: 'Warm and rainy', nature: 'Flowers bloom', activities: 'Planting gardens', clothing: 'Light jackets' } },
  summer: { name: 'Summer', emoji: '☀️', months: ['June', 'July', 'August'], details: { weather: 'Hot and sunny', nature: 'Trees are green', activities: 'Swimming, picnics', clothing: 'Shorts & t-shirts' } },
  fall: { name: 'Fall', emoji: '🍂', months: ['September', 'October', 'November'], details: { weather: 'Cool and crisp', nature: 'Leaves change color', activities: 'Jumping in leaves', clothing: 'Sweaters & jeans' } },
  winter: { name: 'Winter', emoji: '❄️', months: ['December', 'January', 'February'], details: { weather: 'Cold and snowy', nature: 'Trees are bare', activities: 'Building snowmen', clothing: 'Heavy coats' } }
};

const GAME_ITEMS: GameItem[] = [
  { id: 'skiing', text: '⛷️ Skiing', emoji: '⛷️', season: 'winter', type: 'activity' }, { id: 'swimming', text: '🏊‍♂️ Swimming', emoji: '🏊‍♂️', season: 'summer', type: 'activity' }, { id: 'leaf-jumping', text: '🍂 Leaf Jumping', emoji: '🍂', season: 'fall', type: 'activity' }, { id: 'planting', text: '🌱 Planting Flowers', emoji: '🌱', season: 'spring', type: 'activity' }, { id: 'spring-season', text: '🌸 Spring', emoji: '🌸', season: 'spring', type: 'season' }, { id: 'summer-season', text: '☀️ Summer', emoji: '☀️', season: 'summer', type: 'season' }, { id: 'fall-season', text: '🍂 Fall', emoji: '🍂', season: 'fall', type: 'season' }, { id: 'winter-season', text: '❄️ Winter', emoji: '❄️', season: 'winter', type: 'season' }
];

// ========================================
//  SeasonalStep Component
// ========================================

const SeasonalStep: React.FC<MorningMeetingStepProps> = ({
  currentDate,
  onNext,
  onBack,
  onStepComplete,
}) => {
  // ========================================
  // 🎯 STATE MANAGEMENT (Unchanged Logic)
  // ========================================
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [revealedSeason, setRevealedSeason] = useState<boolean>(false);
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
  const [gameState, setGameState] = useState<{ selectedItems: GameItem[]; matches: string[]; gameComplete: boolean; }>({ selectedItems: [], matches: [], gameComplete: false });
  const [showCelebration, setShowCelebration] = useState<string>('');

  // ========================================
  // 🌍 SEASON DETECTION (Unchanged Logic)
  // ========================================
  const getCurrentSeason = useCallback((): string => {
    const month = currentDate.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }, [currentDate]);

  const currentSeasonKey = getCurrentSeason();
  const currentSeasonData = SEASONS_DATA[currentSeasonKey];

  // ========================================
  // 🎮 INTERACTION HANDLERS (Unchanged Logic, but with new Celebration)
  // ========================================
  const showCelebrationMessage = useCallback((message: string) => {
    setShowCelebration(message);
    setTimeout(() => setShowCelebration(''), 2500); // Celebration lasts 2.5 seconds
  }, []);

  const handleSeasonClick = useCallback((seasonKey: string) => {
    if (selectedSeasons.includes(seasonKey)) return;
    const newSelected = [...selectedSeasons, seasonKey];
    setSelectedSeasons(newSelected);
    if (newSelected.length === 4) {
      showCelebrationMessage('🎉 Perfect! All 4 seasons!');
    }
  }, [selectedSeasons, showCelebrationMessage]);

  const handleRevealSeason = useCallback(() => {
    setRevealedSeason(true);
    showCelebrationMessage(`It's ${currentSeasonData.name}! 🎉`);
  }, [currentSeasonData.name, showCelebrationMessage]);

  const handleDetailClick = useCallback((detailKey: string) => {
    if (selectedDetails.includes(detailKey)) return;
    const newSelected = [...selectedDetails, detailKey];
    setSelectedDetails(newSelected);
    if (newSelected.length === 4) {
      showCelebrationMessage(`🌟 Awesome! You learned all about ${currentSeasonData.name}!`);
    }
  }, [selectedDetails, showCelebrationMessage, currentSeasonData.name]);

  const handleGameItemClick = useCallback((item: GameItem) => {
    if (gameState.matches.includes(item.id) || gameState.selectedItems.some(si => si.id === item.id)) return;
    const newSelected = [...gameState.selectedItems, item];
    if (newSelected.length === 2) {
      const [item1, item2] = newSelected;
      if (item1.season === item2.season && item1.type !== item2.type) {
        const newMatches = [...gameState.matches, item1.id, item2.id];
        setGameState({ selectedItems: [], matches: newMatches, gameComplete: newMatches.length === 8 });
        if (newMatches.length === 8) {
          showCelebrationMessage('🏆 You won the game!');
        } else {
          showCelebrationMessage('✅ Great match!');
        }
      } else {
        showCelebrationMessage('🤔 Not quite! Try again!');
        setTimeout(() => setGameState(prev => ({ ...prev, selectedItems: [] })), 1000);
      }
    } else {
      setGameState(prev => ({ ...prev, selectedItems: newSelected }));
    }
  }, [gameState, showCelebrationMessage]);

  // ========================================
  // 🧭 NAVIGATION
  // ========================================
  const goToNextSection = () => {
    if (currentSection < 4) {
      setCurrentSection(currentSection + 1);
    } else {
      // Step is complete - call onStepComplete instead of onNext
      onStepComplete?.();
    }
  };
  const goToPreviousSection = () => currentSection > 1 ? setCurrentSection(currentSection - 1) : onBack();

  const isSectionComplete = () => {
    if (currentSection === 1) return selectedSeasons.length === 4;
    if (currentSection === 2) return revealedSeason;
    if (currentSection === 3) return selectedDetails.length === 4;
    if (currentSection === 4) return gameState.gameComplete;
    return false;
  };

  // FIX: This effect checks the status of each internal section
  // and calls onStepComplete() when the requirements are met.
  useEffect(() => {
    let isComplete = false;
    switch (currentSection) {
      case 1: isComplete = selectedSeasons.length === 4; break;
      case 2: isComplete = revealedSeason; break;
      case 3: isComplete = selectedDetails.length === 4; break;
      case 4: isComplete = gameState.gameComplete; break;
      default: isComplete = false;
    }

    if (isComplete) {
      onStepComplete?.();
    }
  }, [currentSection, selectedSeasons, revealedSeason, selectedDetails, gameState.gameComplete, onStepComplete]);

  // ========================================
  // 🎨 RENDER LOGIC
  // ========================================
  const renderRightPanelContent = () => {
    switch (currentSection) {
      case 1:
        return (
          <>
            <h2 style={styles.rightPanelTitle}>How many seasons does Earth have?</h2>
            <p style={styles.rightPanelSubtitle}>Click on all four seasons below!</p>
            <div style={styles.gridContainer}>
              {Object.entries(SEASONS_DATA).map(([key, season]) => {
                const isSelected = selectedSeasons.includes(key);
                return (
                  <div key={key} onClick={() => handleSeasonClick(key)} style={{...styles.card, ...(isSelected ? styles.cardSelected : {})}}>
                    <div style={styles.cardEmoji}>{season.emoji}</div>
                    <div style={styles.cardTitle}>{season.name}</div>
                  </div>
                );
              })}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 style={styles.rightPanelTitle}>What season is it right now?</h2>
            <p style={styles.rightPanelSubtitle}>Today is in {currentDate.toLocaleString('default', { month: 'long' })}. Let's find out!</p>
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
      case 3:
        return (
          <>
            <h2 style={styles.rightPanelTitle}>What makes {currentSeasonData.name} special?</h2>
            <p style={styles.rightPanelSubtitle}>Click each card to learn more.</p>
            <div style={styles.gridContainer}>
              {Object.entries(currentSeasonData.details).map(([key, detail]) => {
                const icons: {[key: string]: string} = { weather: '🌡️', nature: '🌳', activities: '🎉', clothing: '👕' };
                const isSelected = selectedDetails.includes(key);
                return (
                  <div key={key} onClick={() => handleDetailClick(key)} style={{...styles.card, ...(isSelected ? styles.cardSelected : {})}}>
                    <div style={styles.cardEmoji}>{icons[key]}</div>
                    <div style={styles.cardTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                    <div style={styles.cardSubtitle}>{detail}</div>
                  </div>
                );
              })}
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h2 style={styles.rightPanelTitle}>Season Matching Game!</h2>
            <p style={styles.rightPanelSubtitle}>Match the activity to the correct season.</p>
            <div style={styles.gameContainer}>
              <div style={styles.gameColumn}>
                <h3 style={styles.gameColumnTitle}>Activities</h3>
                {GAME_ITEMS.filter(i => i.type === 'activity').map(item => {
                  const isMatched = gameState.matches.includes(item.id);
                  const isSelected = gameState.selectedItems.some(si => si.id === item.id);
                  return <div key={item.id} onClick={() => handleGameItemClick(item)} style={{ ...styles.gameItem, ...(isMatched ? styles.gameItemMatched : {}), ...(isSelected ? styles.gameItemSelected : {}) }}>{item.text}</div>;
                })}
              </div>
              <div style={styles.gameColumn}>
                <h3 style={styles.gameColumnTitle}>Seasons</h3>
                {GAME_ITEMS.filter(i => i.type === 'season').map(item => {
                  const isMatched = gameState.matches.includes(item.id);
                  const isSelected = gameState.selectedItems.some(si => si.id === item.id);
                  return <div key={item.id} onClick={() => handleGameItemClick(item)} style={{ ...styles.gameItem, ...(isMatched ? styles.gameItemMatched : {}), ...(isSelected ? styles.gameItemSelected : {}) }}>{item.text}</div>;
                })}
              </div>
            </div>
          </>
        );
      default: return null;
    }
  };

  return (
    <div style={styles.pageContainer}>
        {/* Main Content Area */}
        <div style={styles.contentGrid}>
            {/* Left Sidebar */}
            <div style={styles.leftColumn}>
                <h1 style={styles.leftTitle}>Exploring the Seasons</h1>
                <div style={styles.currentSeasonIndicator}>
                    <div style={styles.currentSeasonEmoji}>{currentSeasonData.emoji}</div>
                    <div>
                    <p style={styles.currentSeasonText}>The Current Season is</p>
                    <h2 style={styles.currentSeasonName}>{currentSeasonData.name}</h2>
                    </div>
                </div>
                <div style={styles.divider}></div>
                <div style={styles.seasonList}>
                    {Object.values(SEASONS_DATA).map(season => (
                    <div key={season.name} style={{...styles.seasonListItem, ...(season.name === currentSeasonData.name ? styles.seasonListItemActive : {})}}>
                        {season.emoji} {season.name}
                    </div>
                    ))}
                </div>
                <button style={styles.videoButton}>🎬 Watch a Season Video</button>
            </div>

            {/* Right Panel */}
            <div style={styles.rightColumn}>
                {renderRightPanelContent()}
            </div>
        </div>


      {/* Celebration Pop-up */}
      {showCelebration && (
        <div style={styles.celebrationOverlay}>
            <div style={styles.celebrationMessage}>{showCelebration}</div>
        </div>
       )}

      <style>{`
        @keyframes celebrate {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        }
      `}</style>
    </div>
  );
};

// ========================================
// 🎨 VIBRANT STYLES OBJECT
// ========================================
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)', fontFamily: 'system-ui, sans-serif', overflow: 'hidden', padding: '2rem' },
    contentGrid: { width: '100%', height: '100%', maxWidth: '1400px', display: 'flex', gap: '2rem' },
    leftColumn: { width: '320px', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', color: 'white' },
    rightColumn: { flex: 1, background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    leftTitle: { fontSize: '2rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', marginBottom: '2rem' },
    currentSeasonIndicator: { display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '12px', padding: '1rem' },
    currentSeasonEmoji: { fontSize: '3rem', marginRight: '1rem' },
    currentSeasonText: { margin: 0, opacity: 0.8 },
    currentSeasonName: { margin: 0, fontSize: '1.5rem', fontWeight: 700 },
    divider: { height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.3)', margin: '2rem 0' },
    seasonList: { flex: 1 },
    seasonListItem: { fontSize: '1.2rem', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem', fontWeight: 500, opacity: 0.7 },
    seasonListItemActive: { backgroundColor: 'rgba(255, 255, 255, 0.3)', fontWeight: 700, opacity: 1 },
    videoButton: { width: '100%', padding: '1rem', fontSize: '1rem', background: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, marginTop: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    rightPanelTitle: { fontSize: '2.5rem', fontWeight: 700, color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.3)', textAlign: 'center' },
    rightPanelSubtitle: { fontSize: '1.2rem', color: 'white', opacity: 0.9, textAlign: 'center', marginBottom: '2rem' },
    gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%' },
    card: { background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', color: '#333' },
    cardSelected: { background: 'linear-gradient(135deg, #abecd6 0%, #fbed96 100%)', transform: 'scale(1.05)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' },
    cardEmoji: { fontSize: '4rem', marginBottom: '1rem' },
    cardTitle: { fontSize: '1.5rem', fontWeight: 600 },
    cardSubtitle: { fontSize: '1rem', color: '#555' },
    mysteryBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '16px', padding: '3rem', width: '100%', flex: 1, color: 'white' },
    actionButton: { padding: '1rem 2rem', fontSize: '1.2rem', background: 'linear-gradient(45deg, #28a745 0%, #20c997 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, marginTop: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    gameContainer: { display: 'flex', gap: '2rem', width: '100%', maxWidth: '700px' },
    gameColumn: { flex: 1, background: 'rgba(255, 255, 255, 0.2)', borderRadius: '12px', padding: '1rem' },
    gameColumnTitle: { textAlign: 'center', fontSize: '1.2rem', fontWeight: 600, color: 'white', marginBottom: '1rem' },
    gameItem: { padding: '1rem', background: 'rgba(255, 255, 255, 0.7)', color: '#333', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', marginBottom: '0.5rem', cursor: 'pointer', textAlign: 'center', fontWeight: 500 },
    gameItemMatched: { background: '#28a745', color: 'white', cursor: 'default' },
    gameItemSelected: { background: '#ffc107', color: '#333', border: '2px solid white' },
    navBar: { position: 'absolute', bottom: '2rem', width: 'calc(100% - 4rem)', maxWidth: '1400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', borderRadius: '20px' },
    navButton: { padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.2)', color: 'white' },
    navButtonNext: { background: 'rgba(255,255,255,0.4)' },
    navButtonDisabled: { background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed' },
    navIndicator: { fontSize: '1rem', fontWeight: 500, color: 'white' },
    celebrationOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    celebrationMessage: { padding: '2rem 4rem', background: 'linear-gradient(45deg, #28a745, #20c997)', color: 'white', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontSize: '2rem', fontWeight: 700, animation: 'celebrate 2.5s ease-in-out forwards' },
};

export default SeasonalStep;

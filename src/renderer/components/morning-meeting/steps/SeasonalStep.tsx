import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

// Interfaces and Data
interface GameItem { id: string; text: string; season: string; type: 'activity' | 'season'; }
interface SeasonData { name: string; emoji: string; months: string[]; details: { weather: string; nature: string; activities: string; clothing: string; }; }

const SEASONS_DATA: { [key: string]: SeasonData } = {
  spring: { name: 'Spring', emoji: '🌸', months: ['March', 'April', 'May'], details: { weather: 'Warm and rainy', nature: 'Flowers bloom', activities: 'Planting gardens', clothing: 'Light jackets' } },
  summer: { name: 'Summer', emoji: '☀️', months: ['June', 'July', 'August'], details: { weather: 'Hot and sunny', nature: 'Trees are green', activities: 'Swimming, picnics', clothing: 'Shorts & t-shirts' } },
  fall: { name: 'Fall', emoji: '🍂', months: ['September', 'October', 'November'], details: { weather: 'Cool and crisp', nature: 'Leaves change color', activities: 'Jumping in leaves', clothing: 'Sweaters & jeans' } },
  winter: { name: 'Winter', emoji: '❄️', months: ['December', 'January', 'February'], details: { weather: 'Cold and snowy', nature: 'Trees are bare', activities: 'Building snowmen', clothing: 'Heavy coats' } }
};

const GAME_ITEMS: GameItem[] = [
  { id: 'skiing', text: '⛷️ Skiing', season: 'winter', type: 'activity' }, { id: 'swimming', text: '🏊‍♂️ Swimming', season: 'summer', type: 'activity' }, { id: 'leaf-jumping', text: '🍂 Leaf Jumping', season: 'fall', type: 'activity' }, { id: 'planting', text: '🌱 Planting Flowers', season: 'spring', type: 'activity' }, { id: 'spring-season', text: '🌸 Spring', season: 'spring', type: 'season' }, { id: 'summer-season', text: '☀️ Summer', season: 'summer', type: 'season' }, { id: 'fall-season', text: '🍂 Fall', season: 'fall', type: 'season' }, { id: 'winter-season', text: '❄️ Winter', season: 'winter', type: 'season' }
];

const SeasonalStep: React.FC<MorningMeetingStepProps> = ({ currentDate, hubSettings, onStepComplete }) => {
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [revealedSeason, setRevealedSeason] = useState<boolean>(false);
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
  const [gameState, setGameState] = useState<{ selectedItems: GameItem[]; matches: string[]; gameComplete: boolean; }>({ selectedItems: [], matches: [], gameComplete: false });
  const [showCelebration, setShowCelebration] = useState<string>('');
  
  const currentSeasonKey = useMemo(() => {
      if (!currentDate) return 'summer';
      const month = currentDate.getMonth();
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'fall';
      return 'winter';
  }, [currentDate]);
  const currentSeasonData = useMemo(() => SEASONS_DATA[currentSeasonKey], [currentSeasonKey]);
  
  const seasonalVideos = useMemo(() => hubSettings?.videos?.seasonal || [], [hubSettings]);

  const showCelebrationMessage = useCallback((message: string) => {
    setShowCelebration(message);
    setTimeout(() => setShowCelebration(''), 2500);
  }, []);

  const isSectionTaskComplete = useCallback(() => {
    switch (currentSection) {
      case 1: return selectedSeasons.length === 4;
      case 2: return revealedSeason;
      case 3: return selectedDetails.length === 4;
      case 4: return gameState.gameComplete;
      default: return false;
    }
  }, [currentSection, selectedSeasons, revealedSeason, selectedDetails, gameState.gameComplete]);
  
  useEffect(() => {
      if (currentSection === 4 && isSectionTaskComplete()) {
        onStepComplete?.();
      }
  }, [currentSection, isSectionTaskComplete, onStepComplete]);

  const handleInternalNext = () => { if (currentSection < 4) setCurrentSection(currentSection + 1); };
  const handleInternalBack = () => { if (currentSection > 1) setCurrentSection(currentSection - 1); };

  const handleSeasonClick = useCallback((seasonKey: string) => {
    if (selectedSeasons.includes(seasonKey)) return;
    const newSelected = [...selectedSeasons, seasonKey];
    setSelectedSeasons(newSelected);
    if (newSelected.length === 4) showCelebrationMessage('🎉 Perfect! All 4 seasons!');
  }, [selectedSeasons, showCelebrationMessage]);

  const handleRevealSeason = useCallback(() => {
    setRevealedSeason(true);
    showCelebrationMessage(`It's ${currentSeasonData.name}! 🎉`);
  }, [currentSeasonData.name, showCelebrationMessage]);

  const handleDetailClick = useCallback((detailKey: string) => {
    if (selectedDetails.includes(detailKey)) return;
    const newSelected = [...selectedDetails, detailKey];
    setSelectedDetails(newSelected);
    if (newSelected.length === 4) showCelebrationMessage(`🌟 Awesome! You learned all about ${currentSeasonData.name}!`);
  }, [selectedDetails, showCelebrationMessage, currentSeasonData.name]);

  const handleGameItemClick = useCallback((item: GameItem) => {
    if (gameState.matches.includes(item.id) || gameState.selectedItems.some(si => si.id === item.id)) return;
    const newSelected = [...gameState.selectedItems, item];
    if (newSelected.length === 2) {
      const [item1, item2] = newSelected;
      if (item1.season === item2.season && item1.type !== item2.type) {
        const newMatches = [...gameState.matches, item1.id, item2.id];
        setGameState({ selectedItems: [], matches: newMatches, gameComplete: newMatches.length === 8 });
        if (newMatches.length === 8) showCelebrationMessage('🏆 You won the game!');
        else showCelebrationMessage('✅ Great match!');
      } else {
        showCelebrationMessage('🤔 Not quite! Try again!');
        setTimeout(() => setGameState(prev => ({ ...prev, selectedItems: [] })), 1000);
      }
    } else {
      setGameState(prev => ({ ...prev, selectedItems: newSelected }));
    }
  }, [gameState, showCelebrationMessage]);
  
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
      <div style={styles.leftColumn}>
        <h1 style={styles.leftTitle}>🍂 Exploring the Seasons</h1>
        <div style={{...styles.progressItem, ...(currentSection === 1 ? styles.progressItemActive : {})}} onClick={() => setCurrentSection(1)}>1. Four Seasons</div>
        <div style={{...styles.progressItem, ...(currentSection === 2 ? styles.progressItemActive : {})}} onClick={() => setCurrentSection(2)}>2. Current Season</div>
        <div style={{...styles.progressItem, ...(currentSection === 3 ? styles.progressItemActive : {})}} onClick={() => setCurrentSection(3)}>3. Season Details</div>
        <div style={{...styles.progressItem, ...(currentSection === 4 ? styles.progressItemActive : {})}} onClick={() => setCurrentSection(4)}>4. Matching Game</div>
        
        {/* Video Link Button */}
        {seasonalVideos.length > 0 && (
          <button style={styles.videoButton} onClick={() => window.open(seasonalVideos[0].url, '_blank')}>
            🎬 Watch a Season Video
          </button>
        )}
      </div>
      <div style={styles.rightColumn}>
          {renderRightPanelContent()}
          <div style={styles.internalNavBar}>
            {currentSection > 1 && <button onClick={handleInternalBack} style={styles.internalNavButton}>Back</button>}
            {currentSection < 4 && <button onClick={handleInternalNext} disabled={!isSectionTaskComplete()} style={{...styles.internalNavButton, ...(!isSectionTaskComplete() ? styles.disabledButton : {})}}>Next Section</button>}
          </div>
      </div>
      {showCelebration && (
        <div style={styles.celebrationOverlay}>
            <div style={styles.celebrationMessage}>{showCelebration}</div>
        </div>
       )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { height: '100%', display: 'flex', gap: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' },
    leftColumn: { width: '300px', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2rem', color: 'white' },
    rightColumn: { flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '2rem' },
    leftTitle: { fontSize: '2rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', marginBottom: '2rem' },
    progressItem: { cursor: 'pointer', fontSize: '1.2rem', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontWeight: 500, transition: 'all 0.3s ease' },
    progressItemActive: { background: 'rgba(255, 255, 255, 0.3)', fontWeight: 700 },
    rightPanelTitle: { fontSize: '2.5rem', fontWeight: 700, color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.3)', textAlign: 'center' },
    rightPanelSubtitle: { fontSize: '1.2rem', color: 'white', opacity: 0.9, textAlign: 'center', marginBottom: '2rem' },
    gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%' },
    card: { background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', color: '#333' },
    cardSelected: { background: 'linear-gradient(135deg, #abecd6 0%, #fbed96 100%)', transform: 'scale(1.05)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' },
    cardEmoji: { fontSize: '3rem' },
    cardTitle: { fontSize: '1.2rem', fontWeight: 600 },
    cardSubtitle: { fontSize: '1rem', color: '#555' },
    mysteryBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '16px', padding: '3rem', width: '100%', color: 'white' },
    actionButton: { padding: '1rem 2rem', fontSize: '1.2rem', background: 'linear-gradient(45deg, #28a745 0%, #20c997 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, marginTop: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    gameContainer: { display: 'flex', gap: '2rem', width: '100%', maxWidth: '700px' },
    gameColumn: { flex: 1, background: 'rgba(255, 255, 255, 0.2)', borderRadius: '12px', padding: '1rem' },
    gameColumnTitle: { textAlign: 'center', fontSize: '1.2rem', fontWeight: 600, color: 'white', marginBottom: '1rem' },
    gameItem: { padding: '1rem', background: 'rgba(255, 255, 255, 0.7)', color: '#333', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', marginBottom: '0.5rem', cursor: 'pointer', textAlign: 'center', fontWeight: 500 },
    gameItemMatched: { background: '#28a745', color: 'white', cursor: 'default' },
    gameItemSelected: { background: '#ffc107', color: '#333', border: '2px solid white' },
    internalNavBar: { position: 'absolute', bottom: '2rem', display: 'flex', gap: '1rem' },
    internalNavButton: { padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', background: 'rgba(0, 86, 179, 0.7)', color: 'white', border: '1px solid rgba(255,255,255,0.5)' },
    disabledButton: { background: 'rgba(108, 117, 125, 0.7)', cursor: 'not-allowed' },
    celebrationOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    celebrationMessage: { padding: '2rem 4rem', background: 'linear-gradient(45deg, #28a745, #20c997)', color: 'white', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontSize: '2rem', fontWeight: 700, animation: 'celebrate 2.5s ease-in-out forwards' },
    videoButton: {
        marginTop: 'auto',
        padding: '1rem',
        fontSize: '1rem',
        background: 'rgba(0, 86, 179, 0.7)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 600,
    },
};

export default SeasonalStep;

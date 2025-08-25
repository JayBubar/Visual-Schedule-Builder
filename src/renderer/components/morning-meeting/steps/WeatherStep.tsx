import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

// Helper function to get video URL from various possible formats
const getVideoUrl = (video: any): string | null => {
  // Try multiple possible video URL locations
  if (video?.videoData?.videoUrl) return video.videoData.videoUrl;
  if (video?.url) return video.url;
  if (typeof video === 'string') return video;
  return null;
};

// Interfaces
interface WeatherData { temperature: number; condition: string; description: string; }
interface ClothingItem { item: string; emoji: string; }
interface WeatherSafetyTip { emoji: string; title: string; description: string; }

const WeatherStep: React.FC<MorningMeetingStepProps> = ({ currentDate = new Date(), hubSettings, onStepComplete }) => {
  const [internalSection, setInternalSection] = useState(0);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [selectedClothing, setSelectedClothing] = useState<string[]>([]);
  const [weatherRevealed, setWeatherRevealed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const season = useMemo(() => {
      const month = currentDate.getMonth() + 1;
      if (month >= 3 && month <= 5) return { name: 'Spring', emoji: '🌸' };
      if (month >= 6 && month <= 8) return { name: 'Summer', emoji: '☀️' };
      if (month >= 9 && month <= 11) return { name: 'Fall', emoji: '🍂' };
      return { name: 'Winter', emoji: '❄️' };
  }, [currentDate]);

  const generateMockWeather = useCallback(() => ({ temperature: 72, condition: 'Sunny', description: 'A beautiful day!' }), []);

  useEffect(() => {
    if (!currentWeather) setCurrentWeather(generateMockWeather());
  }, [currentWeather, generateMockWeather]);

  const clothingSuggestions: ClothingItem[] = useMemo(() => [
      { item: 'T-shirt', emoji: '👕' }, { item: 'Shorts', emoji: '🩳' },
      { item: 'Sunglasses', emoji: '🕶️' }, { item: 'Sandals', emoji: '👡' },
  ], []);

  const safetyTips: WeatherSafetyTip[] = useMemo(() => [
      {emoji: '💧', title: 'Stay Hydrated', description: 'Drink lots of water!'},
      {emoji: '🧴', title: 'Use Sunscreen', description: 'Protect your skin.'},
  ], []);
  
  const weatherVideos = useMemo(() => hubSettings?.videos?.weather || [], [hubSettings]);
  
  const triggerCelebration = useCallback((message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  }, []);

  useEffect(() => {
    // Report completion to the main flow ONLY when the final section is reached.
    if (internalSection === 2) {
      onStepComplete?.();
    }
  }, [internalSection, onStepComplete]);

  const handleInternalNext = () => { if (internalSection < 2) setInternalSection(internalSection + 1); };
  const handleInternalBack = () => { if (internalSection > 0) setInternalSection(internalSection - 1); };
  
  const revealWeather = () => {
    setWeatherRevealed(true);
    triggerCelebration("You found the weather! ☀️");
  };

  const toggleClothing = (item: string) => {
      const newSelection = selectedClothing.includes(item) ? selectedClothing.filter(i => i !== item) : [...selectedClothing, item];
      setSelectedClothing(newSelection);
      if (newSelection.length >= 2) {
          triggerCelebration("Great choices! You're ready for the day!");
      }
  };
  const isClothingComplete = selectedClothing.length >= 2;

  const handleSectionSelect = (index: number) => {
      if (index === 0) setInternalSection(0);
      if (index === 1 && weatherRevealed) setInternalSection(1);
      if (index === 2 && isClothingComplete) setInternalSection(2);
  };

  const renderContent = () => {
    switch (internalSection) {
      case 0:
        return (
          <>
            <h2 style={styles.rightPanelTitle}>What's the weather like today?</h2>
            <div style={{...styles.discoveryBox, filter: weatherRevealed ? 'none' : 'blur(10px)'}}>
                <div style={styles.weatherEmoji}>{currentWeather ? '☀️' : ''}</div>
                <div style={styles.weatherTemp}>{currentWeather?.temperature}°</div>
                <div style={styles.weatherCondition}>{currentWeather?.condition}</div>
            </div>
            {!weatherRevealed && <button style={styles.actionButton} onClick={revealWeather}>🔍 Reveal Weather</button>}
          </>
        );
      case 1:
        return (
          <>
            <h2 style={styles.rightPanelTitle}>What should we wear?</h2>
            <p style={styles.rightPanelSubtitle}>Choose at least 2 items.</p>
            <div style={styles.gridContainer}>
                {clothingSuggestions.map(item => (
                    <div key={item.item} onClick={() => toggleClothing(item.item)} style={{...styles.card, ...(selectedClothing.includes(item.item) ? styles.cardSelected : {})}}>
                        <div style={styles.cardEmoji}>{item.emoji}</div>
                        <div style={styles.cardTitle}>{item.item}</div>
                    </div>
                ))}
            </div>
          </>
        );
      case 2:
        return (
            <>
                <h2 style={styles.rightPanelTitle}>Weather Safety Tips</h2>
                <div style={styles.gridContainer}>
                    {safetyTips.map(tip => (
                        <div key={tip.title} style={{...styles.card, border: 'none', cursor: 'default'}}>
                            <div style={styles.cardEmoji}>{tip.emoji}</div>
                            <div style={styles.cardTitle}>{tip.title}</div>
                            <p>{tip.description}</p>
                        </div>
                    ))}
                </div>
            </>
        );
      default: return null;
    }
  };

  const showInternalNav = () => {
      const canGoNext = (internalSection === 0 && weatherRevealed) || (internalSection === 1 && isClothingComplete);
      return (
          <div style={styles.internalNavBar}>
              {internalSection > 0 && <button onClick={handleInternalBack} style={styles.internalNavButton}>Back</button>}
              {internalSection < 2 && <button onClick={handleInternalNext} disabled={!canGoNext} style={{...styles.internalNavButton, ...(!canGoNext ? styles.disabledButton : {})}}>Next Section</button>}
          </div>
      );
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.leftColumn}>
        <h1 style={styles.leftTitle}>{season.emoji} Weather Adventure</h1>
        <p style={styles.leftSubtitle}>Let's find out about today's weather!</p>
        <div style={styles.divider}></div>
        <div style={styles.progressList}>
            <div onClick={() => handleSectionSelect(0)} style={{...styles.progressItem, ...(internalSection === 0 ? styles.progressItemActive : {})}}>1. Discover</div>
            <div onClick={() => handleSectionSelect(1)} style={{...styles.progressItem, ...(internalSection === 1 ? styles.progressItemActive : {})}}>2. Choose Clothing</div>
            <div onClick={() => handleSectionSelect(2)} style={{...styles.progressItem, ...(internalSection === 2 ? styles.progressItemActive : {})}}>3. Safety Tips</div>
        </div>
        
        {/* Video Link Button */}
        {weatherVideos.length > 0 && (
          <button style={styles.videoButton} onClick={() => {
            const videoUrl = getVideoUrl(weatherVideos[0]);
            if (videoUrl) {
              console.log('Opening weather video:', videoUrl);
              const newWindow = window.open(videoUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
              if (!newWindow) {
                console.error('Failed to open video window - popup blocked?');
                alert('Unable to open video. Please check your popup blocker settings.');
              }
            } else {
              console.error('Video URL not found for video:', weatherVideos[0]);
              alert('Video URL not available');
            }
          }}>
            🎬 Watch a Weather Video
          </button>
        )}
      </div>
      <div style={styles.rightColumn}>
        {renderContent()}
        {showInternalNav()}
      </div>
       {showCelebration && (
        <div style={styles.celebrationOverlay}>
            <div style={styles.celebrationMessage}>{celebrationMessage}</div>
        </div>
       )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { height: '100%', display: 'flex', gap: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', fontFamily: 'system-ui, sans-serif' },
    leftColumn: { width: '300px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '24px', padding: '2rem', color: 'white' },
    rightColumn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '2rem', position: 'relative' },
    leftTitle: { fontSize: '2.5rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', marginBottom: '0.5rem' },
    leftSubtitle: { fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' },
    divider: { height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.3)', margin: '1rem 0 2rem 0' },
    progressList: { flex: 1, overflowY: 'auto' },
    progressItem: { fontSize: '1.2rem', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontWeight: 500, transition: 'all 0.3s ease', cursor: 'pointer', opacity: 0.7 },
    progressItemActive: { background: 'rgba(255, 255, 255, 0.3)', fontWeight: 700, opacity: 1 },
    rightPanelTitle: { fontSize: '2.5rem', fontWeight: 700, color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.3)', textAlign: 'center' },
    rightPanelSubtitle: { fontSize: '1.2rem', color: 'white', opacity: 0.9, textAlign: 'center', marginBottom: '2rem' },
    discoveryBox: { transition: 'all 0.5s ease', padding: '2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', textAlign: 'center', color: 'white' },
    weatherEmoji: { fontSize: '5rem' },
    weatherTemp: { fontSize: '4rem', fontWeight: 700 },
    weatherCondition: { fontSize: '1.5rem' },
    actionButton: { marginTop: '2rem', padding: '1rem 2rem', fontSize: '1.2rem', background: 'linear-gradient(45deg, #28a745 0%, #20c997 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%' },
    card: { background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', color: '#333' },
    cardSelected: { background: '#28a745', color: 'white', transform: 'scale(1.05)', boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)' },
    cardEmoji: { fontSize: '3rem' },
    cardTitle: { fontSize: '1.2rem', fontWeight: 600 },
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

export default WeatherStep;

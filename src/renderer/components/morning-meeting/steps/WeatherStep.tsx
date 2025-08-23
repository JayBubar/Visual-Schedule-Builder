// src/renderer/components/morning-meeting/steps/WeatherStep.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

// Interfaces (WeatherData, ClothingItem, etc.)
interface WeatherData { temperature: number; condition: string; description: string; }
interface ClothingItem { item: string; emoji: string; }
interface WeatherSafetyTip { emoji: string; title: string; description: string; }

const WeatherStep: React.FC<MorningMeetingStepProps> = ({
  currentDate = new Date(),
  hubSettings,
  onStepComplete,
}) => {
  const [internalSection, setInternalSection] = useState(0);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [selectedClothing, setSelectedClothing] = useState<string[]>([]);
  const [weatherRevealed, setWeatherRevealed] = useState(false);

  const season = useMemo(() => { /* ... season logic ... */ return { name: 'Summer', emoji: '☀️' }; }, [currentDate]);
  
  const generateMockWeather = useCallback(() => {
    return { temperature: 72, condition: 'Sunny', description: 'A beautiful day!' };
  }, []);

  useEffect(() => {
    if (!currentWeather) setCurrentWeather(generateMockWeather());
  }, [currentWeather, generateMockWeather]);

  const clothingSuggestions: ClothingItem[] = useMemo(() => [
    { item: 'T-shirt', emoji: '👕' },
    { item: 'Shorts', emoji: '🩳' },
    { item: 'Sunglasses', emoji: '🕶️' },
    { item: 'Sandals', emoji: '👡' },
  ], []);
  
  const safetyTips: WeatherSafetyTip[] = useMemo(() => [
      {emoji: '💧', title: 'Stay Hydrated', description: 'Drink lots of water!'},
      {emoji: '🧴', title: 'Use Sunscreen', description: 'Protect your skin.'},
  ], []);

  useEffect(() => {
    if (internalSection === 2) { // The final section of WeatherStep
      onStepComplete?.();
    }
  }, [internalSection, onStepComplete]);

  const handleInternalNext = () => { if (internalSection < 2) setInternalSection(internalSection + 1); };
  const handleInternalBack = () => { if (internalSection > 0) setInternalSection(internalSection - 1); };
  const revealWeather = () => setWeatherRevealed(true);
  const toggleClothing = (item: string) => {
    setSelectedClothing(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  const isClothingComplete = selectedClothing.length >= 2;

  const renderContent = () => {
    switch (internalSection) {
      case 0: // Discovery
        return (
          <>
            <h2 style={styles.rightPanelTitle}>What's the weather like today?</h2>
            <div style={{...styles.discoveryBox, filter: weatherRevealed ? 'none' : 'blur(10px)'}}>
                <div style={styles.weatherEmoji}>☀️</div>
                <div style={styles.weatherTemp}>{currentWeather?.temperature}°</div>
                <div style={styles.weatherCondition}>{currentWeather?.condition}</div>
            </div>
            {!weatherRevealed && <button style={styles.actionButton} onClick={revealWeather}>🔍 Reveal Weather</button>}
          </>
        );
      case 1: // Clothing
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
      case 2: // Safety
        return (
            <>
                <h2 style={styles.rightPanelTitle}>Weather Safety Tips</h2>
                <div style={styles.gridContainer}>
                    {safetyTips.map(tip => (
                        <div key={tip.title} style={{...styles.card, border: 'none'}}>
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
      const showNext = (internalSection === 0 && weatherRevealed) || (internalSection === 1 && isClothingComplete);
      const showBack = internalSection > 0;
      return (
          <div style={styles.internalNavBar}>
              {showBack && <button onClick={handleInternalBack} style={styles.internalNavButton}>Back</button>}
              {internalSection < 2 && <button onClick={handleInternalNext} disabled={!showNext} style={{...styles.internalNavButton, ...(!showNext ? styles.disabledButton : {})}}>Next</button>}
          </div>
      )
  }

  return (
    <div style={styles.pageContainer}>
      {/* Left Sidebar */}
      <div style={styles.leftColumn}>
        <h1 style={styles.leftTitle}>{season.emoji} Weather Adventure</h1>
        <div style={styles.progressItem} className={internalSection === 0 ? 'active' : ''}>1. Discover</div>
        <div style={styles.progressItem} className={internalSection === 1 ? 'active' : ''}>2. Choose Clothing</div>
        <div style={styles.progressItem} className={internalSection === 2 ? 'active' : ''}>3. Safety Tips</div>
      </div>
      {/* Right Content Panel */}
      <div style={styles.rightColumn}>
        {renderContent()}
        {showInternalNav()}
      </div>
    </div>
  );
};

// All styles would go here
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { height: '100%', display: 'flex', gap: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', fontFamily: 'system-ui, sans-serif' },
    leftColumn: { width: '300px', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '2rem', color: '#333' },
    rightColumn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '2rem' },
    leftTitle: { fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' },
    progressItem: { fontSize: '1.2rem', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontWeight: 500 },
    rightPanelTitle: { fontSize: '2.5rem', fontWeight: 700, color: '#333', textAlign: 'center' },
    rightPanelSubtitle: { fontSize: '1.2rem', color: '#555', textAlign: 'center', marginBottom: '2rem' },
    discoveryBox: { transition: 'all 0.5s ease', padding: '2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.5)', textAlign: 'center' },
    weatherEmoji: { fontSize: '5rem' },
    weatherTemp: { fontSize: '4rem', fontWeight: 700 },
    weatherCondition: { fontSize: '1.5rem' },
    actionButton: { marginTop: '2rem', padding: '1rem 2rem', fontSize: '1.2rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' },
    gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%' },
    card: { background: 'rgba(255, 255, 255, 0.8)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out' },
    cardSelected: { background: '#28a745', color: 'white', transform: 'scale(1.05)' },
    cardEmoji: { fontSize: '3rem' },
    cardTitle: { fontSize: '1.2rem', fontWeight: 600 },
    internalNavBar: { marginTop: 'auto', display: 'flex', gap: '1rem' },
    internalNavButton: { padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer' },
    disabledButton: { opacity: 0.5, cursor: 'not-allowed' },
};

export default WeatherStep;
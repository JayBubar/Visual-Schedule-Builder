import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes'; 
import { WeatherHistory, WeatherType } from '../../../types'; 
import UnifiedDataService from '../../../services/unifiedDataService';
import StepNavigation from '../common/StepNavigation';

// FIXED: Updated weather options with 6th option "Partly Cloudy"
const WEATHER_OPTIONS: { type: WeatherType, emoji: string, label: string, color: string }[] = [
    { type: 'sunny', emoji: '☀️', label: 'Sunny', color: '#FFD93D' },
    { type: 'cloudy', emoji: '☁️', label: 'Cloudy', color: '#87CEEB' },
    { type: 'partly-cloudy', emoji: '⛅', label: 'Partly Cloudy', color: '#FFA500' }, // NEW 6th option
    { type: 'rainy', emoji: '🌧️', label: 'Rainy', color: '#4682B4' },
    { type: 'windy', emoji: '💨', label: 'Windy', color: '#98FB98' },
    { type: 'snowy', emoji: '❄️', label: 'Snowy', color: '#F0F8FF' },
];

// Helper to format date as YYYY-MM-DD
const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const WeatherStep: React.FC<MorningMeetingStepProps> = ({ currentDate = new Date(), hubSettings, onNext, onBack, onHome, onStepComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [todaysWeather, setTodaysWeather] = useState<WeatherType | null>(null);
    const [weatherHistory, setWeatherHistory] = useState<WeatherHistory>({});
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Load history when component mounts
    useEffect(() => {
        setWeatherHistory(UnifiedDataService.getWeatherHistory());
    }, []);

    const steps = useMemo(() => [
        { id: 'select-weather', question: "I can look outside and tell the weather.", standard: "Science K.E.3A.1" },
        { id: 'view-chart', question: "I can put today's weather on our chart.", standard: "K.DPSR.1.2" },
        { id: 'analyze-graph', question: "I can say which weather we see more or less.", standard: "K.DPSR.1.2" }
    ], []);

    const handleSelectWeather = (weather: WeatherType) => {
        setTodaysWeather(weather);
    };

    const handleNext = () => {
        if (currentStep === 0 && todaysWeather) {
            const dateKey = formatDateKey(currentDate);
            UnifiedDataService.saveWeatherForDate(dateKey, todaysWeather);
            setWeatherHistory(prev => ({...prev, [dateKey]: todaysWeather}));
            setCompletedSteps(prev => new Set(prev).add(0));
        }
        if (currentStep === 1) {
            setCompletedSteps(prev => new Set(prev).add(1));
        }
        if (currentStep === 2) {
            setCompletedSteps(prev => new Set(prev).add(2));
        }
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };
    
    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };
    
    useEffect(() => {
        if (currentStep === steps.length -1) {
            onStepComplete?.();
        }
    }, [currentStep, steps.length, onStepComplete]);

    const renderContent = () => {
        const step = steps[currentStep];
        switch (step.id) {
            case 'select-weather':
                return (
                    <>
                        <h2 style={styles.rightPanelTitle}>{step.question}</h2>
                        {/* FIXED: 3x2 grid layout for 6 weather options */}
                        <div style={styles.gridContainer}>
                            {WEATHER_OPTIONS.map(opt => (
                                <div key={opt.type} onClick={() => handleSelectWeather(opt.type)} style={{...styles.card, ...(todaysWeather === opt.type ? styles.cardSelected : {})}}>
                                    <div style={styles.cardEmoji}>{opt.emoji}</div>
                                    <div style={styles.cardTitle}>{opt.label}</div>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 'view-chart':
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                return (
                    <>
                        <h2 style={styles.rightPanelTitle}>{step.question}</h2>
                        <div style={styles.calendarGrid}>
                            {dayNames.map(day => <div key={day} style={styles.calendarHeader}>{day}</div>)}
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const day = i + 1;
                                const date = new Date(year, month, day);
                                const dateKey = formatDateKey(date);
                                const weatherForDay = weatherHistory[dateKey];
                                const isToday = formatDateKey(currentDate) === dateKey;

                                return (
                                    <div key={day} style={{...styles.calendarDay, ...(isToday ? styles.calendarDayToday : {})}}>
                                        <span style={styles.calendarDayNumber}>{day}</span>
                                        {weatherForDay && <span style={styles.weatherIcon}>{WEATHER_OPTIONS.find(w => w.type === weatherForDay)?.emoji}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                );
            case 'analyze-graph':
                const counts = Object.values(weatherHistory).reduce((acc, weather) => {
                    acc[weather] = (acc[weather] || 0) + 1;
                    return acc;
                }, {} as Record<WeatherType, number>);

                const maxCount = Math.max(...Object.values(counts), 1);

                return (
                    <>
                        <h2 style={styles.rightPanelTitle}>{step.question}</h2>
                        {/* FIXED: Counting blocks system instead of bar chart */}
                        <div style={styles.countingBlocksContainer}>
                            {WEATHER_OPTIONS.map((opt) => {
                                const count = counts[opt.type] || 0;
                                const blocks = [];
                                
                                // Create counting blocks (5 per column, 2 columns per weather type)
                                for (let i = 0; i < count; i++) {
                                    blocks.push(
                                        <div 
                                            key={`${opt.type}-block-${i}`} 
                                            style={{
                                                ...styles.countingBlock,
                                                backgroundColor: opt.color
                                            }}
                                        />
                                    );
                                }
                                
                                return (
                                    <div key={opt.type} style={styles.weatherColumn}>
                                        {/* Color indicator and emoji */}
                                        <div style={styles.weatherHeader}>
                                            <div style={{
                                                ...styles.colorIndicator,
                                                backgroundColor: opt.color
                                            }} />
                                            <div style={styles.weatherEmoji}>{opt.emoji}</div>
                                        </div>
                                        
                                        {/* Count number */}
                                        <div style={styles.countNumber}>{count}</div>
                                        
                                        {/* Counting blocks grid */}
                                        <div style={styles.blocksGrid}>
                                            {blocks}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                );
            default: return null;
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.leftColumn}>
                <h1 style={styles.leftTitle}>🌦️ Weather Watchers</h1>
                {steps.map((step, index) => (
                    <div key={step.id} onClick={() => setCurrentStep(index)} style={{...styles.progressItem, ...(currentStep === index ? styles.progressItemActive : {}), ...(completedSteps.has(index) ? styles.progressItemCompleted : {})}}>
                        <span style={styles.progressCheck}>{completedSteps.has(index) ? '✅' : '➡️'}</span>
                        <div>
                            {step.question}
                            <div style={styles.standardText}>Standard: {step.standard}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={styles.rightColumn}>
                {renderContent()}
                <div style={styles.internalNavBar}>
                    {currentStep > 0 && <button onClick={handleBack} style={styles.internalNavButton}>Back</button>}
                    {currentStep < steps.length - 1 && (
                        <button onClick={handleNext} disabled={currentStep === 0 && !todaysWeather} style={{...styles.internalNavButton, ...(currentStep === 0 && !todaysWeather ? styles.disabledButton : {})}}>
                            Next
                        </button>
                    )}
                </div>

                {/* Standardized Navigation */}
                <StepNavigation navigation={{
                    goNext: onNext,
                    goBack: onBack,
                    goHome: onHome,
                    canGoBack: !!onBack,
                    isLastStep: false
                }} />
            </div>
        </div>
    );
};

// Enhanced styles with counting blocks system
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { 
        height: '100vh',
        background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', 
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
    leftTitle: { fontSize: '2.5rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', marginBottom: '0.5rem' },
    progressItem: { cursor: 'pointer', fontSize: '1.1rem', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontWeight: 500, transition: 'all 0.3s ease', display: 'flex', alignItems: 'center' },
    progressItemActive: { background: 'rgba(255, 255, 255, 0.3)', fontWeight: 700 },
    progressItemCompleted: { 
        opacity: 1, 
        textDecoration: 'line-through',
        background: 'rgba(40, 167, 69, 0.3)'
    },
    progressCheck: { marginRight: '0.75rem', fontSize: '1.2rem' },
    standardText: { fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' },
    rightPanelTitle: { fontSize: '2.5rem', fontWeight: 700, color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.3)', textAlign: 'center' },
    
    // FIXED: 3x2 grid container for 6 weather options
    gridContainer: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns
        gridTemplateRows: 'repeat(2, 1fr)',    // 2 rows  
        gap: '1.5rem', 
        width: '100%', 
        maxWidth: '600px', // Increased from 800px to better fit 3x2
        marginTop: '2rem' 
    },
    
    // FIXED: Larger cards to fill the 3x2 grid space better
    card: { 
        background: 'rgba(255, 255, 255, 0.7)', 
        border: '2px solid transparent', 
        borderRadius: '20px', // Larger border radius
        padding: '2rem', // Increased padding
        textAlign: 'center', 
        cursor: 'pointer', 
        transition: 'all 0.2s ease-in-out', 
        color: '#333',
        minHeight: '120px', // Minimum height for consistency
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardSelected: { 
        borderColor: '#3B82F6', 
        background: 'rgba(59, 130, 246, 0.3)', 
        color: 'white', 
        transform: 'scale(1.05)', 
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' 
    },
    cardEmoji: { 
        fontSize: '3.5rem', // Larger emoji
        marginBottom: '0.75rem'
    },
    cardTitle: { 
        fontSize: '1.3rem', // Larger title
        fontWeight: 600 
    },
    
    // Calendar styles
    calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', width: '100%', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '16px' },
    calendarHeader: { textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', color: 'white', paddingBottom: '0.5rem' },
    calendarDay: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '1rem', color: 'white', position: 'relative' },
    calendarDayNumber: { position: 'absolute', top: '5px', right: '5px', opacity: 0.7 },
    calendarDayToday: { background: 'rgba(59, 130, 246, 0.5)', border: '2px solid white' },
    weatherIcon: { fontSize: '2.5rem' },
    
    // FIXED: New counting blocks system styles
    countingBlocksContainer: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        width: '100%',
        maxWidth: '900px',
        background: 'rgba(0,0,0,0.1)',
        borderRadius: '16px',
        padding: '2rem',
        marginTop: '1rem'
    },
    
    weatherColumn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        flex: 1
    },
    
    weatherHeader: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem'
    },
    
    colorIndicator: {
        width: '24px',
        height: '24px',
        borderRadius: '6px',
        border: '2px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    
    weatherEmoji: {
        fontSize: '2rem'
    },
    
    countNumber: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1.8rem',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    
    blocksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', // 2 columns for blocks
        gap: '4px',
        maxWidth: '60px' // Keep blocks small and compact
    },
    
    countingBlock: {
        width: '24px',
        height: '24px',
        borderRadius: '4px',
        border: '2px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
    disabledButton: { 
        background: 'rgba(108, 117, 125, 0.7)', 
        cursor: 'not-allowed' 
    }
};

export default WeatherStep;
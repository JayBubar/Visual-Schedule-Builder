import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes'; // Corrected import source
import { WeatherHistory, WeatherType } from '../../../types'; 
import { styles } from './WeatherStep.styles';
import UnifiedDataService from '../../../services/unifiedDataService';
import StepNavigation from '../common/StepNavigation';

// Data
const WEATHER_OPTIONS: { type: WeatherType, emoji: string, label: string }[] = [
    { type: 'sunny', emoji: '☀️', label: 'Sunny' },
    { type: 'cloudy', emoji: '☁️', label: 'Cloudy' },
    { type: 'rainy', emoji: '🌧️', label: 'Rainy' },
    { type: 'windy', emoji: '💨', label: 'Windy' },
    { type: 'snowy', emoji: '❄️', label: 'Snowy' },
];

// Helper to format date as YYYY-MM-DD
const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const WeatherStep: React.FC<MorningMeetingStepProps> = ({ currentDate = new Date(), hubSettings, onNext, onBack, onHome, onStepComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [todaysWeather, setTodaysWeather] = useState<WeatherType | null>(null);
    const [weatherHistory, setWeatherHistory] = useState<WeatherHistory>({});

    // Load history when component mounts
    useEffect(() => {
        // FIX: Called static method directly on the class
        setWeatherHistory(UnifiedDataService.getWeatherHistory());
    }, []);

    const steps = useMemo(() => [
        { id: 'select-weather', question: "I can look outside and tell the weather.", standard: "Science K.E.3A.1" },
        { id: 'view-chart', question: "I can put today’s weather on our chart.", standard: "K.DPSR.1.2" },
        { id: 'analyze-graph', question: "I can say which weather we see more or less.", standard: "K.DPSR.1.2" }
    ], []);

    const handleSelectWeather = (weather: WeatherType) => {
        setTodaysWeather(weather);
    };

    const handleNext = () => {
        if (currentStep === 0 && todaysWeather) {
            const dateKey = formatDateKey(currentDate);
            // FIX: Called static method directly on the class
            UnifiedDataService.saveWeatherForDate(dateKey, todaysWeather);
            setWeatherHistory(prev => ({...prev, [dateKey]: todaysWeather}));
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

    // FIX: Renamed function to renderContent
    const renderContent = () => {
        const step = steps[currentStep];
        switch (step.id) {
            case 'select-weather':
                return (
                    <>
                        <h2 style={styles.rightPanelTitle}>{step.question}</h2>
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
                        <div style={styles.graphContainer}>
                           {WEATHER_OPTIONS.map(opt => {
                               const count = counts[opt.type] || 0;
                               const height = `${(count / maxCount) * 100}%`;
                               return (
                                   <div key={opt.type} style={styles.barWrapper}>
                                       <div style={styles.barCount}>{count}</div>
                                       <div style={{...styles.bar, height}} />
                                       <div style={styles.barLabel}>{opt.emoji}</div>
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
                    <div key={step.id} onClick={() => setCurrentStep(index)} style={{...styles.progressItem, ...(currentStep === index ? styles.progressItemActive : {})}}>
                        <span style={styles.progressCheck}>➡️</span>
                        <div>
                            {step.question}
                            <div style={styles.standardText}>Standard: {step.standard}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={styles.rightColumn}>
                {/* FIX: Updated function call to renderContent */}
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

export default WeatherStep;

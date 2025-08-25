import React, { useState, useEffect } from 'react';
import { UnifiedDataService } from '../services/UnifiedDataService';
import './BehaviorStep.css';

interface BehaviorStepProps {
  onNext: () => void;
  onBack: () => void;
  currentDate: Date;
}

interface BehaviorCommitment {
  id: string;
  text: string;
  icon: string;
  selected: boolean;
}

const BehaviorStep: React.FC<BehaviorStepProps> = ({ onNext, onBack, currentDate }) => {
  const [commitments, setCommitments] = useState<BehaviorCommitment[]>([]);
  const [selectedCommitments, setSelectedCommitments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default behavior commitments - kid-friendly "I will" statements
  const defaultCommitments: BehaviorCommitment[] = [
    { id: 'listen', text: 'I will listen to my teacher', icon: '👂', selected: false },
    { id: 'kind', text: 'I will be kind to my friends', icon: '💝', selected: false },
    { id: 'hands', text: 'I will keep my hands to myself', icon: '✋', selected: false },
    { id: 'try', text: 'I will try my best', icon: '⭐', selected: false },
    { id: 'help', text: 'I will help when I can', icon: '🤝', selected: false },
    { id: 'safe', text: 'I will make safe choices', icon: '🛡️', selected: false },
    { id: 'share', text: 'I will share and take turns', icon: '🎈', selected: false },
    { id: 'focus', text: 'I will focus on my work', icon: '🎯', selected: false }
  ];

  useEffect(() => {
    loadBehaviorSettings();
  }, []);

  const loadBehaviorSettings = async () => {
    try {
      const dataService = UnifiedDataService.getInstance();
      const hubSettings = await dataService.getHubSettings();
      
      // Get custom behavior commitments from hub or use defaults
      const customCommitments = hubSettings?.behaviorCommitments?.commitments || [];
      const enabled = hubSettings?.behaviorCommitments?.enabled ?? true;

      if (enabled && customCommitments.length > 0) {
        // Use custom commitments from hub
        const mappedCommitments = customCommitments.map((text: string, index: number) => ({
          id: `custom-${index}`,
          text: text.startsWith('I will') ? text : `I will ${text.toLowerCase()}`,
          icon: defaultCommitments[index % defaultCommitments.length]?.icon || '⭐',
          selected: false
        }));
        setCommitments(mappedCommitments);
      } else {
        // Use default commitments
        setCommitments([...defaultCommitments]);
      }

      // Load any previously selected commitments for today
      const todayKey = currentDate.toDateString();
      const savedSelections = localStorage.getItem(`behaviorCommitments_${todayKey}`);
      if (savedSelections) {
        setSelectedCommitments(JSON.parse(savedSelections));
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading behavior settings:', error);
      setCommitments([...defaultCommitments]);
      setIsLoading(false);
    }
  };

  const toggleCommitment = (commitmentId: string) => {
    const newSelected = selectedCommitments.includes(commitmentId)
      ? selectedCommitments.filter(id => id !== commitmentId)
      : [...selectedCommitments, commitmentId];
    
    setSelectedCommitments(newSelected);
    
    // Save to localStorage immediately
    const todayKey = currentDate.toDateString();
    localStorage.setItem(`behaviorCommitments_${todayKey}`, JSON.stringify(newSelected));
  };

  const handleNext = () => {
    // Ensure data is saved before proceeding
    const todayKey = currentDate.toDateString();
    localStorage.setItem(`behaviorCommitments_${todayKey}`, JSON.stringify(selectedCommitments));
    
    // Also save to UnifiedDataService for Visual Schedule integration
    const dataService = UnifiedDataService.getInstance();
    const selectedTexts = commitments
      .filter(c => selectedCommitments.includes(c.id))
      .map(c => c.text);
    
    dataService.saveBehaviorCommitments(currentDate, selectedTexts);
    
    onNext();
  };

  if (isLoading) {
    return (
      <div className="step-container behavior-step">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading behavior choices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="step-container behavior-step">
      <div className="step-header">
        <h1>🌟 My Behavior Goals</h1>
        <p className="step-subtitle">Choose how you want to be awesome today!</p>
      </div>

      <div className="behavior-content">
        <div className="instruction-box">
          <h3>🎯 Pick your goals for today</h3>
          <p>Tap the ones you want to work on. You can choose as many as you want!</p>
        </div>

        <div className="commitments-grid">
          {commitments.map((commitment) => {
            const isSelected = selectedCommitments.includes(commitment.id);
            return (
              <button
                key={commitment.id}
                className={`commitment-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleCommitment(commitment.id)}
                aria-pressed={isSelected}
              >
                <div className="commitment-icon">{commitment.icon}</div>
                <div className="commitment-text">{commitment.text}</div>
                {isSelected && (
                  <div className="selection-check">✅</div>
                )}
              </button>
            );
          })}
        </div>

        {selectedCommitments.length > 0 && (
          <div className="selected-summary">
            <h4>🎉 My Goals for Today:</h4>
            <div className="selected-list">
              {commitments
                .filter(c => selectedCommitments.includes(c.id))
                .map(c => (
                  <div key={c.id} className="selected-item">
                    <span className="selected-icon">{c.icon}</span>
                    <span className="selected-text">{c.text}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="step-navigation">
        <button onClick={onBack} className="nav-button secondary">
          ← Back
        </button>
        <button 
          onClick={handleNext} 
          className="nav-button primary"
          disabled={selectedCommitments.length === 0}
        >
          {selectedCommitments.length === 0 ? 'Choose at least one goal' : 'Continue →'}
        </button>
      </div>
    </div>
  );
};

export default BehaviorStep;
import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, BookOpen, Users, Clock, Star, Award, ArrowRight } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  photo?: string;
}

interface DayReviewStepProps {
  students: Student[];
  onNext: () => void;
  onBack: () => void;
  currentDate: Date;
  hubSettings: any;
  onDataUpdate: (data: any) => void;
  stepData?: any;
}

interface DayGoal {
  id: string;
  category: 'learning' | 'behavior' | 'teamwork' | 'personal';
  icon: string;
  title: string;
  description: string;
  selected: boolean;
}

interface ReflectionPrompt {
  id: string;
  question: string;
  emoji: string;
  category: 'gratitude' | 'learning' | 'friendship' | 'growth';
}

const DayReviewStep: React.FC<DayReviewStepProps> = ({
  students,
  onNext,
  onBack,
  currentDate,
  hubSettings,
  onDataUpdate,
  stepData
}) => {
  const [currentSection, setCurrentSection] = useState<'goals' | 'reflection' | 'summary'>('goals');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(stepData?.selectedGoals || []);
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>(stepData?.reflectionAnswers || {});
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  const dayGoals: DayGoal[] = [
    {
      id: 'learn_something_new',
      category: 'learning',
      icon: '🧠',
      title: 'Learn Something New',
      description: 'Discover new knowledge or master a new skill',
      selected: selectedGoals.includes('learn_something_new')
    },
    {
      id: 'help_a_friend',
      category: 'teamwork',
      icon: '🤝',
      title: 'Help a Friend',
      description: 'Support a classmate with kindness and cooperation',
      selected: selectedGoals.includes('help_a_friend')
    },
    {
      id: 'try_my_best',
      category: 'personal',
      icon: '💪',
      title: 'Try My Best',
      description: 'Give my full effort in all activities',
      selected: selectedGoals.includes('try_my_best')
    },
    {
      id: 'be_respectful',
      category: 'behavior',
      icon: '🌟',
      title: 'Be Respectful',
      description: 'Show respect to teachers, friends, and our learning space',
      selected: selectedGoals.includes('be_respectful')
    },
    {
      id: 'stay_focused',
      category: 'learning',
      icon: '🎯',
      title: 'Stay Focused',
      description: 'Pay attention and stay engaged during lessons',
      selected: selectedGoals.includes('stay_focused')
    },
    {
      id: 'show_creativity',
      category: 'personal',
      icon: '🎨',
      title: 'Show Creativity',
      description: 'Express my unique ideas and think outside the box',
      selected: selectedGoals.includes('show_creativity')
    }
  ];

  const reflectionPrompts: ReflectionPrompt[] = [
    {
      id: 'grateful_for',
      question: 'What are you most grateful for today?',
      emoji: '🙏',
      category: 'gratitude'
    },
    {
      id: 'learned_today',
      question: 'What is the most important thing you learned today?',
      emoji: '📚',
      category: 'learning'
    },
    {
      id: 'proud_moment',
      question: 'What moment made you feel proud today?',
      emoji: '⭐',
      category: 'growth'
    },
    {
      id: 'friend_highlight',
      question: 'How did you help or support a friend today?',
      emoji: '👫',
      category: 'friendship'
    }
  ];

  useEffect(() => {
    // Update data whenever selections change
    onDataUpdate({
      selectedGoals,
      reflectionAnswers,
      completedAt: new Date(),
      currentSection
    });
  }, [selectedGoals, reflectionAnswers, currentSection]);

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleReflectionChange = (promptId: string, answer: string) => {
    setReflectionAnswers(prev => ({
      ...prev,
      [promptId]: answer
    }));
  };

  const handleComplete = () => {
    setShowCompletionAnimation(true);
    setTimeout(() => {
      onNext();
    }, 2000);
  };

  const goToNextSection = () => {
    if (currentSection === 'goals') {
      setCurrentSection('reflection');
    } else if (currentSection === 'reflection') {
      setCurrentSection('summary');
    }
  };

  const goToPreviousSection = () => {
    if (currentSection === 'reflection') {
      setCurrentSection('goals');
    } else if (currentSection === 'summary') {
      setCurrentSection('reflection');
    } else {
      onBack();
    }
  };

  const canProceed = () => {
    if (currentSection === 'goals') {
      return selectedGoals.length > 0;
    } else if (currentSection === 'reflection') {
      return Object.keys(reflectionAnswers).length >= 2; // At least 2 answers
    }
    return true;
  };

  return (
    <div className="day-review-step">
      {/* Completion Animation */}
      {showCompletionAnimation && (
        <div className="completion-overlay">
          <div className="completion-animation">
            <div className="success-icon">
              <CheckCircle size={80} />
            </div>
            <h2>Morning Meeting Complete!</h2>
            <p>Great job setting intentions for today! ✨</p>
            <div className="sparkle-effects">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="sparkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="step-header">
        <div className="header-content">
          <h2 className="step-title">
            <Target size={32} />
            🎯 Day Review & Goals
          </h2>
          <p className="step-description">
            Let's set our intentions and reflect on our learning journey
          </p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="section-tabs">
        <button
          className={`tab ${currentSection === 'goals' ? 'active' : ''}`}
          onClick={() => setCurrentSection('goals')}
        >
          <Target size={20} />
          Goals
        </button>
        <button
          className={`tab ${currentSection === 'reflection' ? 'active' : ''}`}
          onClick={() => setCurrentSection('reflection')}
          disabled={selectedGoals.length === 0}
        >
          <BookOpen size={20} />
          Reflection
        </button>
        <button
          className={`tab ${currentSection === 'summary' ? 'active' : ''}`}
          onClick={() => setCurrentSection('summary')}
          disabled={Object.keys(reflectionAnswers).length < 2}
        >
          <Star size={20} />
          Summary
        </button>
      </div>

      <div className="review-content">
        {/* Goals Section */}
        {currentSection === 'goals' && (
          <div className="goals-section">
            <div className="section-intro">
              <h3>🎯 What are your goals for today?</h3>
              <p>Choose the goals that feel most important to you today. You can select as many as you'd like!</p>
            </div>

            <div className="goals-grid">
              {dayGoals.map(goal => (
                <div
                  key={goal.id}
                  className={`goal-card ${goal.selected ? 'selected' : ''}`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <div className="goal-icon">
                    {goal.icon}
                  </div>
                  <div className="goal-content">
                    <h4>{goal.title}</h4>
                    <p>{goal.description}</p>
                  </div>
                  <div className="goal-check">
                    {goal.selected ? <CheckCircle size={24} /> : <div className="check-circle" />}
                  </div>
                </div>
              ))}
            </div>

            {selectedGoals.length > 0 && (
              <div className="goals-summary">
                <h4>📋 Your Goals for Today:</h4>
                <ul>
                  {selectedGoals.map(goalId => {
                    const goal = dayGoals.find(g => g.id === goalId);
                    return goal ? (
                      <li key={goalId}>
                        {goal.icon} {goal.title}
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Reflection Section */}
        {currentSection === 'reflection' && (
          <div className="reflection-section">
            <div className="section-intro">
              <h3>💭 Let's reflect together</h3>
              <p>Take a moment to think about these questions. Your thoughts and feelings matter!</p>
            </div>

            <div className="reflection-prompts">
              {reflectionPrompts.map(prompt => (
                <div key={prompt.id} className="reflection-card">
                  <div className="prompt-header">
                    <span className="prompt-emoji">{prompt.emoji}</span>
                    <h4>{prompt.question}</h4>
                  </div>
                  <textarea
                    value={reflectionAnswers[prompt.id] || ''}
                    onChange={(e) => handleReflectionChange(prompt.id, e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="reflection-input"
                  />
                </div>
              ))}
            </div>

            <div className="reflection-encouragement">
              <div className="encouragement-card">
                <h4>💡 Remember:</h4>
                <ul>
                  <li>There are no wrong answers</li>
                  <li>Every thought and feeling is valid</li>
                  <li>Reflection helps us grow and learn</li>
                  <li>You're doing great by thinking deeply!</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Summary Section */}
        {currentSection === 'summary' && (
          <div className="summary-section">
            <div className="section-intro">
              <h3>📖 Your Day Review Summary</h3>
              <p>Here's what you've shared about your goals and reflections for today!</p>
            </div>

            <div className="summary-content">
              {/* Goals Summary */}
              <div className="summary-card">
                <h4>
                  <Target size={20} />
                  Your Goals for Today
                </h4>
                <div className="summary-goals">
                  {selectedGoals.map(goalId => {
                    const goal = dayGoals.find(g => g.id === goalId);
                    return goal ? (
                      <div key={goalId} className="summary-goal">
                        <span className="goal-emoji">{goal.icon}</span>
                        <span className="goal-text">{goal.title}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Reflections Summary */}
              <div className="summary-card">
                <h4>
                  <BookOpen size={20} />
                  Your Reflections
                </h4>
                <div className="summary-reflections">
                  {Object.entries(reflectionAnswers)
                    .filter(([_, answer]) => answer.trim())
                    .map(([promptId, answer]) => {
                      const prompt = reflectionPrompts.find(p => p.id === promptId);
                      return prompt ? (
                        <div key={promptId} className="summary-reflection">
                          <div className="reflection-question">
                            <span className="reflection-emoji">{prompt.emoji}</span>
                            <span>{prompt.question}</span>
                          </div>
                          <div className="reflection-answer">
                            "{answer}"
                          </div>
                        </div>
                      ) : null;
                    })}
                </div>
              </div>

              {/* Encouragement */}
              <div className="summary-card encouragement">
                <h4>
                  <Award size={20} />
                  You're Ready for a Great Day!
                </h4>
                <p>
                  You've set meaningful goals and taken time to reflect. 
                  Remember to check in with yourself throughout the day and celebrate your progress!
                </p>
                <div className="daily-affirmation">
                  <strong>Today's Affirmation:</strong>
                  <em>"I am capable, I am growing, and I will do my best today!" ✨</em>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="step-navigation">
        <button onClick={goToPreviousSection} className="nav-button previous">
          ← {currentSection === 'goals' ? 'Previous Step' : 'Previous'}
        </button>
        
        <div className="step-indicator">
          Step 8 of 8 • {currentSection === 'goals' ? 'Goals' : currentSection === 'reflection' ? 'Reflection' : 'Summary'}
        </div>
        
        {currentSection === 'summary' ? (
          <button onClick={handleComplete} className="nav-button complete">
            Complete Morning Meeting 🎉
          </button>
        ) : (
          <button 
            onClick={goToNextSection} 
            className={`nav-button next ${!canProceed() ? 'disabled' : ''}`}
            disabled={!canProceed()}
          >
            {currentSection === 'goals' ? 'Reflect' : 'Summary'} →
          </button>
        )}
      </div>

      <style>{`
        .day-review-step {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          position: relative;
        }

        .completion-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .completion-animation {
          text-align: center;
          color: white;
          position: relative;
        }

        .success-icon {
          color: #4CAF50;
          margin-bottom: 1rem;
          animation: bounce 0.6s ease-in-out;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
          60% {
            transform: translateY(-10px);
          }
        }

        .completion-animation h2 {
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
        }

        .completion-animation p {
          font-size: 1.2rem;
          margin: 0;
          opacity: 0.9;
        }

        .sparkle-effects {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .sparkle {
          position: absolute;
          font-size: 1.5rem;
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
        }

        .step-header {
          padding: 2rem;
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .header-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .step-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .step-description {
          font-size: 1.25rem;
          margin: 0;
          opacity: 0.9;
        }

        .section-tabs {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: rgba(0, 0, 0, 0.1);
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 0.75rem 1.5rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .tab:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tab.active {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .tab:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
        }

        .review-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .section-intro {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 2rem auto;
        }

        .section-intro h3 {
          font-size: 1.75rem;
          margin: 0 0 1rem 0;
          font-weight: 600;
        }

        .section-intro p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0;
        }

        /* Goals Section */
        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          max-width: 900px;
          margin: 0 auto 2rem auto;
        }

        .goal-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .goal-card:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .goal-card.selected {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .goal-icon {
          font-size: 2.5rem;
          width: 60px;
          text-align: center;
        }

        .goal-content {
          flex: 1;
        }

        .goal-content h4 {
          font-size: 1.2rem;
          margin: 0 0 0.5rem 0;
          font-weight: 600;
        }

        .goal-content p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .goal-check {
          color: #4CAF50;
        }

        .check-circle {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
        }

        .goals-summary {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          max-width: 500px;
          margin: 0 auto;
          backdrop-filter: blur(10px);
        }

        .goals-summary h4 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          text-align: center;
        }

        .goals-summary ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .goals-summary li {
          background: rgba(255, 255, 255, 0.1);
          margin: 0.5rem 0;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border-left: 4px solid rgba(255, 255, 255, 0.3);
        }

        /* Reflection Section */
        .reflection-prompts {
          max-width: 700px;
          margin: 0 auto 2rem auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .reflection-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .prompt-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .prompt-emoji {
          font-size: 1.5rem;
        }

        .prompt-header h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .reflection-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 1rem;
          color: white;
          font-size: 1rem;
          resize: vertical;
          backdrop-filter: blur(10px);
        }

        .reflection-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .reflection-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }

        .reflection-encouragement {
          max-width: 500px;
          margin: 0 auto;
        }

        .encouragement-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .encouragement-card h4 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          text-align: center;
        }

        .encouragement-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .encouragement-card li {
          margin: 0.5rem 0;
          padding: 0.5rem;
          text-align: center;
          opacity: 0.9;
        }

        /* Summary Section */
        .summary-content {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .summary-card h4 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0 0 1.5rem 0;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .summary-goals {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .summary-goal {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 10px;
        }

        .goal-emoji {
          font-size: 1.5rem;
        }

        .goal-text {
          font-weight: 500;
        }

        .summary-reflections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .summary-reflection {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 1.5rem;
        }

        .reflection-question {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .reflection-emoji {
          font-size: 1.25rem;
        }

        .reflection-answer {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 10px;
          font-style: italic;
          opacity: 0.9;
          border-left: 4px solid rgba(255, 255, 255, 0.3);
        }

        .summary-card.encouragement {
          text-align: center;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%);
        }

        .summary-card.encouragement p {
          font-size: 1.1rem;
          margin: 0 0 1.5rem 0;
          opacity: 0.9;
        }

        .daily-affirmation {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 1.5rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .daily-affirmation strong {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .daily-affirmation em {
          font-size: 1.2rem;
          color: #FFD93D;
          font-weight: 500;
        }

        .step-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
        }

        .nav-button {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .nav-button:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .nav-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nav-button.complete {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          border-color: #4CAF50;
          font-size: 1.1rem;
          padding: 1rem 2rem;
        }

        .nav-button.complete:hover {
          background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
        }

        .step-indicator {
          font-weight: 600;
          opacity: 0.8;
          text-align: center;
        }

        @media (max-width: 768px) {
          .step-title {
            font-size: 2rem;
          }

          .goals-grid {
            grid-template-columns: 1fr;
          }

          .goal-card {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .section-tabs {
            flex-direction: column;
            gap: 0.5rem;
          }

          .step-navigation {
            flex-direction: column;
            gap: 1rem;
          }

          .summary-goals {
            grid-template-columns: 1fr;
          }

          .reflection-question {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .review-content {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .step-title {
            font-size: 1.5rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .section-tabs {
            padding: 0.5rem 1rem;
          }

          .tab {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }

          .goals-grid {
            gap: 1rem;
          }

          .goal-card {
            padding: 1rem;
          }

          .goal-icon {
            font-size: 2rem;
          }

          .reflection-prompts {
            gap: 1rem;
          }

          .reflection-card {
            padding: 1rem;
          }

          .prompt-header {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .summary-content {
            gap: 1rem;
          }

          .summary-card {
            padding: 1rem;
          }

          .summary-goals {
            gap: 0.5rem;
          }

          .summary-goal {
            padding: 0.75rem;
          }

          .summary-reflections {
            gap: 1rem;
          }

          .summary-reflection {
            padding: 1rem;
          }

          .reflection-question {
            margin-bottom: 0.5rem;
          }

          .daily-affirmation {
            padding: 1rem;
          }

          .nav-button {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }

          .nav-button.complete {
            padding: 0.75rem 1rem;
            font-size: 1rem;
          }

          .step-indicator {
            font-size: 0.9rem;
          }
        }

        /* Print Styles */
        @media print {
          .step-navigation {
            display: none;
          }

          .section-tabs {
            display: none;
          }

          .day-review-step {
            background: white;
            color: black;
          }

          .hub-section,
          .summary-card,
          .reflection-card,
          .goal-card {
            background: white;
            border: 1px solid #ddd;
          }
        }

        /* Accessibility Improvements */
        @media (prefers-reduced-motion: reduce) {
          .sparkle,
          .completion-animation,
          .nav-button,
          .goal-card,
          .tab {
            animation: none;
            transition: none;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .day-review-step {
            background: #000;
            color: #fff;
          }

          .goal-card,
          .reflection-card,
          .summary-card,
          .tab {
            border: 2px solid #fff;
          }

          .nav-button {
            border: 2px solid #fff;
          }
        }

        /* Focus Styles for Better Accessibility */
        .nav-button:focus,
        .tab:focus,
        .goal-card:focus,
        .reflection-input:focus {
          outline: 3px solid #FFD93D;
          outline-offset: 2px;
        }

        /* Animation for Goal Selection */
        .goal-card.selected {
          animation: goal-select 0.3s ease-out;
        }

        @keyframes goal-select {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Smooth Transitions */
        .review-content {
          transition: opacity 0.3s ease-in-out;
        }

        .section-tabs .tab.active {
          animation: tab-activate 0.3s ease-out;
        }

        @keyframes tab-activate {
          0% {
            transform: translateY(-2px);
          }
          100% {
            transform: translateY(0);
          }
        }

        /* Enhanced Button States */
        .nav-button:active {
          transform: translateY(1px);
        }

        .goal-card:active {
          transform: translateY(1px) scale(0.98);
        }

        /* Loading States */
        .nav-button.disabled {
          position: relative;
          overflow: hidden;
        }

        .nav-button.disabled::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: loading-shimmer 1.5s infinite;
        }

        @keyframes loading-shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        /* Custom Scrollbar for Review Content */
        .review-content::-webkit-scrollbar {
          width: 8px;
        }

        .review-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .review-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        .review-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Enhanced Typography */
        .step-title {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .section-intro h3 {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        /* Better Form Inputs */
        .reflection-input {
          transition: all 0.3s ease;
        }

        .reflection-input:focus {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        /* Enhanced Modal Animation */
        .completion-overlay {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .completion-animation {
          animation: scale-in 0.5s ease-out;
        }

        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default DayReviewStep;

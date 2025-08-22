import React, { useState, useEffect, useCallback } from 'react';
import { Star, Gift, Calendar, Camera, Heart, Sparkles } from 'lucide-react';
import UnifiedDataService from '../../../services/unifiedDataService';

interface Student {
  id: string;
  name: string;
  photo?: string;
  birthday?: string;
}

interface Celebration {
  id: string;
  name: string;
  emoji: string;
  message: string;
  type: 'birthday' | 'silly' | 'traditional' | 'custom';
  date?: string;
  students?: string[];
  createdAt?: string;
}

interface CelebrationStepProps {
  students: Student[];
  onNext: () => void;
  onBack: () => void;
  currentDate: Date;
  hubSettings?: any;
  onDataUpdate: (data: any) => void;
  stepData?: any;
}

interface CelebrationStepData {
  currentSection: number;
  discoveredBirthdays: string[];
  selectedCelebrations: string[];
  wiggleCelebrationCompleted: boolean;
  completedAt?: string;  // Make sure this is string, not Date
}

const CelebrationStep: React.FC<CelebrationStepProps> = ({
  students,
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings
}) => {
  // State management
  const [currentSection, setCurrentSection] = useState<number>(stepData?.currentSection || 1);
  const [birthdayStudents, setBirthdayStudents] = useState<Student[]>([]);
  const [todaysCelebrations, setTodaysCelebrations] = useState<Celebration[]>([]);
  const [discoveredBirthdays, setDiscoveredBirthdays] = useState<string[]>(stepData?.discoveredBirthdays || []);
  const [selectedCelebrations, setSelectedCelebrations] = useState<string[]>(stepData?.selectedCelebrations || []);
  const [wiggleCelebrationCompleted, setWiggleCelebrationCompleted] = useState<boolean>(stepData?.wiggleCelebrationCompleted || false);
  const [celebrationEffects, setCelebrationEffects] = useState<boolean>(false);

  // Save data callback
  const saveStepData = useCallback(() => {
    // Only update when we have meaningful progress
    if (currentSection > 1 || discoveredBirthdays.length > 0 || selectedCelebrations.length > 0) {
      const data: CelebrationStepData = {
        currentSection,
        discoveredBirthdays,
        selectedCelebrations,
        wiggleCelebrationCompleted,
        completedAt: new Date().toISOString()
      };
      onDataUpdate(data);
    }
  }, [currentSection, discoveredBirthdays, selectedCelebrations, wiggleCelebrationCompleted, onDataUpdate]);

  // Initialize celebrations on mount
  useEffect(() => {
    findBirthdayStudents();
    loadTodaysCelebrations();
  }, [students]);

  // Save data when state changes
  useEffect(() => {
    saveStepData();
  }, [saveStepData]);

  // Find birthday students for today
  const findBirthdayStudents = useCallback(() => {
    const today = new Date();
    const todayBirthdays = students.filter(student => {
      if (!student.birthday) return false;
      
      const birthday = new Date(student.birthday);
      return birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate();
    });
    
    setBirthdayStudents(todayBirthdays);
  }, [students]);

  // Load today's celebrations (2 silly/traditional + 1 custom)
  const loadTodaysCelebrations = useCallback(() => {
    try {
      const today = new Date();
      const celebrations: Celebration[] = [];

      // Get silly/traditional celebrations for today
      const sillyHolidays = getSillyHolidaysForDate(today);
      celebrations.push(...sillyHolidays.slice(0, 2)); // Take first 2

      // Get custom celebration from hub settings if exists
      const customCelebration = getCustomCelebrationForToday();
      if (customCelebration) {
        celebrations.push(customCelebration);
      }

      setTodaysCelebrations(celebrations);
    } catch (error) {
      setTodaysCelebrations([]);
    }
  }, []);

  // Get silly holidays for a specific date (mock data for now)
  const getSillyHolidaysForDate = (date: Date): Celebration[] => {
    // This would integrate with a real holiday API in production
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Sample silly holidays by date
    const holidayDatabase: Record<string, Celebration[]> = {
      '8-21': [
        {
          id: 'senior-citizen-day',
          name: 'National Senior Citizens Day',
          emoji: '👴',
          message: 'A day to celebrate and honor our wise older community members!',
          type: 'traditional'
        },
        {
          id: 'poet-day',
          name: 'Poet\'s Day',
          emoji: '📝',
          message: 'Time to celebrate poetry and the beauty of words!',
          type: 'silly'
        }
      ],
      '7-18': [
        {
          id: 'hot-dog-day',
          name: 'National Hot Dog Day',
          emoji: '🌭',
          message: 'A whole day dedicated to celebrating hot dogs! Perfect for talking about favorite foods!',
          type: 'silly'
        },
        {
          id: 'ice-cream-day',
          name: 'National Ice Cream Day',
          emoji: '🍦',
          message: 'Who doesn\'t love ice cream? Let\'s celebrate this sweet treat!',
          type: 'silly'
        }
      ],
      '8-1': [
        {
          id: 'friendship-day',
          name: 'National Friendship Day',
          emoji: '👫',
          message: 'A day to celebrate the special friends in our classroom and how we care for each other!',
          type: 'traditional'
        },
        {
          id: 'raspberry-cream-pie-day',
          name: 'Raspberry Cream Pie Day',
          emoji: '🥧',
          message: 'A deliciously silly day to celebrate this yummy dessert!',
          type: 'silly'
        }
      ]
    };

    const dateKey = `${month}-${day}`;
    return holidayDatabase[dateKey] || [
      {
        id: 'learning-day',
        name: 'Every Day is Learning Day',
        emoji: '📚',
        message: 'Today is perfect for celebrating how much we love to learn!',
        type: 'traditional'
      },
      {
        id: 'smile-day',
        name: 'Share a Smile Day',
        emoji: '😊',
        message: 'Let\'s celebrate the power of smiles and kindness!',
        type: 'silly'
      }
    ];
  };

  // Get custom celebration from teacher settings
  const getCustomCelebrationForToday = (): Celebration | null => {
    try {
      const customCelebrations = hubSettings?.celebrations?.customCelebrations || [];
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Find active custom celebration for today
      const activeCelebration = customCelebrations.find((celeb: any) => {
        if (!celeb.date || !celeb.active) return false;
        
        if (celeb.recurring) {
          const celebDate = new Date(celeb.date);
          return celebDate.getMonth() === today.getMonth() && celebDate.getDate() === today.getDate();
        } else {
          return celeb.date === todayStr;
        }
      });

      if (activeCelebration) {
        return {
          id: activeCelebration.id,
          name: activeCelebration.name,
          emoji: activeCelebration.emoji || '🌟',
          message: activeCelebration.message || 'A special celebration from our teacher!',
          type: 'custom'
        };
      }
    } catch (error) {
      // Error getting custom celebration
    }
    
    return null;
  };
  // Birthday discovery handler
  const handleBirthdayDiscovery = useCallback((studentId: string) => {
    if (!discoveredBirthdays.includes(studentId)) {
      const newDiscovered = [...discoveredBirthdays, studentId];
      setDiscoveredBirthdays(newDiscovered);
      setCelebrationEffects(true);
      
      setTimeout(() => setCelebrationEffects(false), 3000);
    }
  }, [discoveredBirthdays]);

  // Celebration selection handler
  const handleCelebrationSelect = useCallback((celebrationId: string) => {
    setSelectedCelebrations(prev => {
      if (prev.includes(celebrationId)) {
        return prev.filter(id => id !== celebrationId);
      } else {
        return [...prev, celebrationId];
      }
    });
  }, []);

  // Wiggle celebration handler
  const handleWiggleCelebration = useCallback(() => {
    setWiggleCelebrationCompleted(true);
    setCelebrationEffects(true);
    
    setTimeout(() => setCelebrationEffects(false), 6000);
  }, []);

  // Section navigation
  const handleNextSection = useCallback(() => {
    if (currentSection < 3) {
      setCurrentSection(prev => prev + 1);
    } else {
      onNext();
    }
  }, [currentSection, onNext]);

  const handlePreviousSection = useCallback(() => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
    } else {
      onBack();
    }
  }, [currentSection, onBack]);

  // Validation functions
  const canAdvanceFromSection = useCallback((section: number): boolean => {
    switch (section) {
      case 1:
        // Can advance if all birthdays discovered OR if no birthdays today
        return birthdayStudents.length === 0 || discoveredBirthdays.length === birthdayStudents.length;
      case 2:
        // Can advance if at least one celebration selected
        return selectedCelebrations.length > 0;
      case 3:
        // Can advance if wiggle celebration completed
        return wiggleCelebrationCompleted;
      default:
        return true;
    }
  }, [birthdayStudents.length, discoveredBirthdays.length, selectedCelebrations.length, wiggleCelebrationCompleted]);

  // Get current section title and description
  const getSectionInfo = useCallback((section: number) => {
    switch (section) {
      case 1:
        return birthdayStudents.length > 0 
          ? {
              title: "🔍 Who's Our Birthday Star Today?",
              description: "Let's discover who gets to be extra special today! Click to reveal our birthday friends!"
            }
          : {
              title: "💖 Every Day is Special!",
              description: "No birthdays today, but that's okay! Every day is a gift and we have lots to celebrate!"
            };
      case 2:
        return {
          title: "🎉 Today's Special Celebrations!",
          description: "We have some amazing things to celebrate today! Let's choose which ones we want to highlight!"
        };
      case 3:
        return {
          title: "🎊 WIGGLE CELEBRATION TIME! 🎊",
          description: "Time to celebrate! Wave your hands in the air and watch the magic happen!"
        };
      default:
        return { title: "", description: "" };
    }
  }, [birthdayStudents.length]);

  // Get navigation button text
  const getNavigationText = useCallback(() => {
    if (currentSection === 3) {
      return wiggleCelebrationCompleted ? 'Complete! →' : 'Do Wiggle Celebration!';
    }
    
    switch (currentSection) {
      case 1:
        if (birthdayStudents.length === 0) {
          return canAdvanceFromSection(1) ? 'Celebrations →' : 'Celebrate Being Here First!';
        }
        return canAdvanceFromSection(1) ? 'Celebrations →' : 'Find Birthdays First!';
      case 2:
        return canAdvanceFromSection(2) ? 'Wiggle Time! →' : 'Select Celebrations First!';
      default:
        return 'Next →';
    }
  }, [currentSection, birthdayStudents.length, canAdvanceFromSection, wiggleCelebrationCompleted]);

  const sectionInfo = getSectionInfo(currentSection);
  return (
    <div className="celebration-step">
      {/* Floating celebration particles */}
      <div className="celebration-particle">🎉</div>
      <div className="celebration-particle">🎊</div>
      <div className="celebration-particle">🌟</div>
      <div className="celebration-particle">✨</div>
      <div className="celebration-particle">🎈</div>
      <div className="celebration-particle">🎁</div>

      {/* Confetti Animation */}
      {celebrationEffects && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="step-header">
        <div className="header-content">
          <h2 className="step-title">
            <Sparkles size={32} />
            {sectionInfo.title}
          </h2>
          <p className="step-description">
            {sectionInfo.description}
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="section-progress">
          {[1, 2, 3].map(section => (
            <div 
              key={section}
              className={`progress-dot ${
                section < currentSection ? 'completed' : 
                section === currentSection ? 'active' : ''
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="celebrations-content">
        {/* Section 1: Birthday Discovery */}
        {currentSection === 1 && (
          <div className="section section-1">
            {birthdayStudents.length > 0 ? (
              <div className="birthday-discovery">
                {birthdayStudents.map(student => (
                  <div key={student.id} className="mystery-birthday-card">
                    <div className={`student-photo-mystery ${
                      discoveredBirthdays.includes(student.id) ? 'revealed' : 'blurred'
                    }`}>
                      {student.photo ? (
                        <img src={student.photo} alt={student.name} />
                      ) : (
                        <div className="photo-placeholder">
                          <Camera size={48} />
                        </div>
                      )}
                      <div className="birthday-badge">🎂</div>
                    </div>
                    <h3 className="student-name">
                      {discoveredBirthdays.includes(student.id) 
                        ? `🎉 Happy Birthday ${student.name}! 🎉`
                        : `Mystery Friend #${birthdayStudents.indexOf(student) + 1}`
                      }
                    </h3>
                    <button
                      className="discover-button"
                      onClick={() => handleBirthdayDiscovery(student.id)}
                      disabled={discoveredBirthdays.includes(student.id)}
                    >
                      {discoveredBirthdays.includes(student.id) 
                        ? '🎂 Birthday Discovered!' 
                        : '🎉 Discover Birthday Friend!'
                      }
                    </button>
                  </div>
                ))}
                
                <div className="birthday-counter">
                  Found: {discoveredBirthdays.length} / {birthdayStudents.length} Birthday Friends! 🎂
                </div>
              </div>
            ) : (
              <div className="no-birthday-content">
                <div className="celebration-heart">
                  <div className="heart-emoji">💖</div>
                  <h3>Today We Celebrate:</h3>
                  <ul className="daily-celebrations">
                    <li>🌟 Being present and ready to learn</li>
                    <li>👫 Supporting our amazing classmates</li>
                    <li>🎯 Trying our best in everything we do</li>
                    <li>🌈 Making today a wonderful day together</li>
                  </ul>
                  <button 
                    className="discover-button"
                    onClick={() => handleBirthdayDiscovery('everyday')}
                    disabled={discoveredBirthdays.includes('everyday')}
                  >
                    {discoveredBirthdays.includes('everyday') 
                      ? '✅ We Celebrated Being Here! ✅'
                      : '✨ Let\'s Celebrate Being Here! ✨'
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 2: Celebration Selection */}
        {currentSection === 2 && (
          <div className="section section-2">
            <div className="celebrations-grid">
              {todaysCelebrations.map(celebration => (
                <div 
                  key={celebration.id}
                  className={`celebration-card ${
                    selectedCelebrations.includes(celebration.id) ? 'selected' : ''
                  } ${celebration.type === 'custom' ? 'custom' : ''}`}
                  onClick={() => handleCelebrationSelect(celebration.id)}
                >
                  <div className="celebration-emoji">{celebration.emoji}</div>
                  <div className="celebration-name">{celebration.name}</div>
                  <div className="celebration-type">
                    {celebration.type === 'custom' ? 'Custom Teacher Celebration' :
                     celebration.type === 'silly' ? 'Silly Holiday' : 'Special Holiday'}
                  </div>
                  <div className="celebration-description">
                    {celebration.message}
                  </div>
                  <button className="celebration-select-btn">
                    {selectedCelebrations.includes(celebration.id) 
                      ? '🎉 Celebrating!' 
                      : '⭐ Let\'s Celebrate This!'
                    }
                  </button>
                </div>
              ))}
            </div>
            
            <div className="celebration-selection-summary">
              <div className="summary-box">
                <h4>🌟 Our Celebrations Today:</h4>
                <div className="selected-celebrations">
                  {selectedCelebrations.length === 0 ? (
                    <em>Select celebrations above to see them here!</em>
                  ) : (
                    selectedCelebrations.map(id => {
                      const celebration = todaysCelebrations.find(c => c.id === id);
                      return celebration ? (
                        <div key={id} className="selected-celebration">
                          {celebration.emoji} {celebration.name}
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Wiggle Celebration */}
        {currentSection === 3 && (
          <div className="section section-3">
            <div className="wiggle-celebration-container">
              {!wiggleCelebrationCompleted ? (
                <div className="celebration-instructions">
                  <h3>🙌 Let's Celebrate Together!</h3>
                  <p>Wave your hands in the air and watch amazing things happen!</p>
                  
                  <button 
                    className="wiggle-start-btn" 
                    onClick={handleWiggleCelebration}
                  >
                    🎉 START THE CELEBRATION! 🎉
                  </button>
                  
                  <div className="wiggle-visual">
                    <div className="wiggle-hands">
                      <div className="hand left-hand">👋</div>
                      <div className="hand right-hand">👋</div>
                    </div>
                    <div className="wiggle-instruction">Wave your hands like this!</div>
                  </div>
                </div>
              ) : (
                <div className="wiggle-complete">
                  <div className="complete-message">
                    <h2>🎉 AMAZING CELEBRATION! 🎉</h2>
                    <p>You made today extra special with your celebration wiggle!</p>
                    <div className="celebration-summary-final">
                      <h4>🌟 What We Celebrated Today:</h4>
                      {birthdayStudents.length > 0 && discoveredBirthdays.length > 0 && (
                        <div className="summary-item">
                          🎂 Birthday celebrations for our special friends!
                        </div>
                      )}
                      {selectedCelebrations.map(id => {
                        const celebration = todaysCelebrations.find(c => c.id === id);
                        return celebration ? (
                          <div key={id} className="summary-item">
                            {celebration.emoji} {celebration.name}
                          </div>
                        ) : null;
                      })}
                      <div className="summary-item">
                        🎊 We had an amazing wiggle celebration together!
                      </div>
                    </div>
                    <button 
                      className="wiggle-again-btn" 
                      onClick={handleWiggleCelebration}
                    >
                      🎊 Celebrate Again! 🎊
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="step-navigation">
        <button 
          onClick={handlePreviousSection} 
          className="nav-button previous"
          disabled={currentSection === 1}
        >
          ← Previous
        </button>
        <div className="step-indicator">
          Section {currentSection} of 3
        </div>
        <button 
          onClick={handleNextSection} 
          className="nav-button next"
          disabled={!canAdvanceFromSection(currentSection)}
        >
          {getNavigationText()}
        </button>
      </div>

      {/* Styles */}
      <style>{`
      .celebration-step {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: linear-gradient(135deg, #FFD700 0%, #FF69B4 30%, #9D4EDD 70%, #6366F1 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        /* Floating celebration particles */
        .celebration-particle {
          position: fixed;
          font-size: 1.5rem;
          animation: float-celebration 6s ease-in-out infinite;
          opacity: 0.6;
          pointer-events: none;
          z-index: 1;
        }

        .celebration-particle:nth-child(1) { top: 10%; left: 5%; animation-delay: 0s; }
        .celebration-particle:nth-child(2) { top: 20%; left: 90%; animation-delay: 1s; }
        .celebration-particle:nth-child(3) { top: 80%; left: 10%; animation-delay: 2s; }
        .celebration-particle:nth-child(4) { top: 70%; left: 85%; animation-delay: 3s; }
        .celebration-particle:nth-child(5) { top: 40%; left: 3%; animation-delay: 1.5s; }
        .celebration-particle:nth-child(6) { top: 60%; left: 95%; animation-delay: 2.5s; }

        @keyframes float-celebration {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-15px) rotate(90deg) scale(1.1); }
          50% { transform: translateY(-30px) rotate(180deg) scale(1.2); }
          75% { transform: translateY(-15px) rotate(270deg) scale(1.1); }
        }

        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 100;
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear infinite;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .step-header {
          padding: 2rem;
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content {
          flex: 1;
        }

        .step-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .step-description {
          font-size: 1.2rem;
          margin: 0;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }

        .section-progress {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .progress-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .progress-dot.active {
          background: rgba(255, 255, 255, 1);
          transform: scale(1.3);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
        }

        .progress-dot.completed {
          background: rgba(34, 197, 94, 1);
          border-color: rgba(34, 197, 94, 1);
        }

        .celebrations-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .section {
          flex: 1;
          display: flex;
          flex-direction: column;
          animation: sectionSlideIn 0.5s ease-out;
        }

        @keyframes sectionSlideIn {
          0% { transform: translateX(50px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        /* Section 1: Birthday Discovery */
        .birthday-discovery {
          display: grid;
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .mystery-birthday-card {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          padding: 2rem;
          text-align: center;
          border: 3px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .mystery-birthday-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .student-photo-mystery {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          position: relative;
          overflow: hidden;
          border: 4px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .student-photo-mystery.blurred {
          filter: blur(15px);
          background: linear-gradient(45deg, #FF6B35, #FF8E9B);
        }

        .student-photo-mystery.revealed {
          filter: none;
          border-color: #FFD700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
          animation: birthdayReveal 0.8s ease-out;
        }

        @keyframes birthdayReveal {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        .student-photo-mystery img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .birthday-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #FFD700;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          opacity: 0;
          transform: scale(0);
          transition: all 0.3s ease;
        }

        .student-photo-mystery.revealed .birthday-badge {
          opacity: 1;
          transform: scale(1);
        }

        .student-name {
          font-size: 1.3rem;
          margin: 1rem 0;
          font-weight: 600;
        }

        .discover-button {
          background: linear-gradient(135deg, #FF6B35 0%, #FF8E9B 100%);
          border: none;
          border-radius: 20px;
          padding: 1rem 2rem;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          margin-top: 1rem;
          min-width: 200px;
        }

        .discover-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .discover-button:disabled {
          background: rgba(34, 197, 94, 0.8);
          cursor: not-allowed;
          transform: none;
        }

        .birthday-counter {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 1rem;
          text-align: center;
          font-size: 1.3rem;
          font-weight: 600;
          margin-top: 2rem;
          grid-column: 1 / -1;
        }

        /* No Birthday Content */
        .no-birthday-content {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .celebration-heart {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          padding: 3rem 2rem;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .heart-emoji {
          font-size: 5rem;
          margin-bottom: 1.5rem;
          animation: heartBeat 2s ease-in-out infinite;
        }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .daily-celebrations {
          list-style: none;
          padding: 0;
          margin: 2rem 0;
          text-align: left;
        }

        .daily-celebrations li {
          background: rgba(255, 255, 255, 0.1);
          margin: 0.75rem 0;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          border-left: 4px solid rgba(255, 255, 255, 0.3);
          font-size: 1.1rem;
        }

        /* Section 2: Celebrations */
        .celebrations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .celebration-card {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          padding: 2.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s ease;
          border: 3px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .celebration-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .celebration-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .celebration-card:hover::before {
          opacity: 1;
        }

        .celebration-card.selected {
          background: rgba(255, 255, 255, 0.25);
          border-color: #FFD700;
          transform: scale(1.05);
          box-shadow: 0 12px 30px rgba(255, 215, 0, 0.3);
        }

        .celebration-card.custom {
          border: 3px solid rgba(255, 215, 0, 0.5);
        }

        .celebration-emoji {
          font-size: 4rem;
          margin-bottom: 1rem;
          display: block;
          animation: celebrationBounce 2s ease-in-out infinite;
        }

        .celebration-card:hover .celebration-emoji {
          animation: celebrationSpin 0.8s ease-in-out;
        }

        @keyframes celebrationBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }

        @keyframes celebrationSpin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.3); }
          100% { transform: rotate(360deg) scale(1); }
        }

        .celebration-name {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #FFD700;
        }

        .celebration-type {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 1rem;
          font-style: italic;
        }

        .celebration-description {
          font-size: 1rem;
          line-height: 1.4;
          margin-bottom: 1.5rem;
          opacity: 0.9;
        }

        .celebration-select-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 15px;
          padding: 0.75rem 1.5rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .celebration-card.selected .celebration-select-btn {
          background: rgba(34, 197, 94, 0.8);
          border-color: rgba(34, 197, 94, 1);
        }

        .celebration-selection-summary {
          margin-top: 2rem;
          text-align: center;
        }

        .summary-box {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          max-width: 500px;
          margin: 0 auto;
        }

        .summary-box h4 {
          margin-bottom: 1rem;
          color: #FFD700;
        }

        .selected-celebrations {
          font-size: 1.1rem;
        }

        .selected-celebration {
          background: rgba(255, 215, 0, 0.2);
          border: 1px solid rgba(255, 215, 0, 0.5);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          margin: 0.5rem 0;
          font-weight: 600;
        }

        /* Section 3: Wiggle Celebration */
        .wiggle-celebration-container {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .celebration-instructions {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          padding: 3rem;
          backdrop-filter: blur(10px);
          margin-bottom: 2rem;
        }

        .wiggle-start-btn {
          background: linear-gradient(135deg, #FFD700 0%, #FF6B35 50%, #FF69B4 100%);
          border: none;
          border-radius: 20px;
          padding: 2rem 3rem;
          color: white;
          font-weight: 800;
          font-size: 1.4rem;
          cursor: pointer;
          margin-top: 2rem;
          text-align: center;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          animation: pulseGlow 2s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 12px 40px rgba(255, 215, 0, 0.4);
          }
        }

        .wiggle-start-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
        }

        .wiggle-visual {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 3rem;
          backdrop-filter: blur(10px);
          margin: 2rem 0;
        }

        .wiggle-hands {
          display: flex;
          justify-content: center;
          gap: 4rem;
          margin-bottom: 2rem;
        }

        .hand {
          font-size: 4rem;
          animation: wiggleHand 1s ease-in-out infinite;
        }

        .left-hand {
          animation-delay: 0s;
        }

        .right-hand {
          animation-delay: 0.5s;
        }

        @keyframes wiggleHand {
          0%, 100% { transform: rotate(-20deg) translateY(0); }
          25% { transform: rotate(20deg) translateY(-20px); }
          50% { transform: rotate(-20deg) translateY(-40px); }
          75% { transform: rotate(20deg) translateY(-20px); }
        }

        .wiggle-instruction {
          font-size: 1.3rem;
          font-weight: 600;
          color: #FFD700;
        }

        .wiggle-complete {
          background: rgba(34, 197, 94, 0.2);
          border: 3px solid rgba(34, 197, 94, 0.5);
          border-radius: 24px;
          padding: 3rem;
          backdrop-filter: blur(10px);
          text-align: center;
        }

        .complete-message h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #FFD700;
        }

        .complete-message p {
          font-size: 1.3rem;
          margin-bottom: 2rem;
        }

        .celebration-summary-final {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          margin: 2rem 0;
          text-align: left;
        }

        .celebration-summary-final h4 {
          text-align: center;
          margin-bottom: 1rem;
          color: #FFD700;
        }

        .summary-item {
          background: rgba(255, 215, 0, 0.2);
          border: 1px solid rgba(255, 215, 0, 0.5);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin: 0.5rem 0;
          font-weight: 600;
        }

        .wiggle-again-btn {
          background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
          border: none;
          border-radius: 16px;
          padding: 1rem 2rem;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .wiggle-again-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        /* Navigation */
        .step-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 1000;
          margin-bottom: 80px;
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
          min-width: 120px;
          text-align: center;
          position: relative;
          z-index: 1001;
        }

        .nav-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .nav-button.next {
          background: rgba(40, 167, 69, 0.3);
          border-color: rgba(40, 167, 69, 0.5);
          margin-right: 100px;
        }

        .nav-button.next:hover:not(:disabled) {
          background: rgba(40, 167, 69, 0.4);
        }

        .step-indicator {
          font-weight: 600;
          opacity: 0.8;
          text-align: center;
          flex: 1;
          margin: 0 1rem;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .step-title {
            font-size: 2rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .step-header {
            flex-direction: column;
            gap: 1rem;
          }

          .birthday-discovery {
            grid-template-columns: 1fr;
          }

          .celebrations-grid {
            grid-template-columns: 1fr;
          }

          .wiggle-hands {
            gap: 2rem;
          }

          .celebration-instructions {
            padding: 2rem;
          }

          .step-navigation {
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 40px;
          }

          .nav-button.next {
            margin-right: 0;
          }

          .celebrations-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CelebrationStep;

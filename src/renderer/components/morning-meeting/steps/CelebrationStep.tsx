import React, { useState, useEffect } from 'react';
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
  type: 'birthday' | 'custom';
  recurring?: boolean;
  date?: string;
  students: string[];
  createdAt: string;
}

interface CelebrationStepProps {
  students: Student[];
  onNext: () => void;
  onPrevious: () => void;
  onUpdateData: (data: any) => void;
  data?: any;
}

const CelebrationStep: React.FC<CelebrationStepProps> = ({
  students,
  onNext,
  onPrevious,
  onUpdateData,
  data
}) => {
  const [todaysCelebrations, setTodaysCelebrations] = useState<Celebration[]>([]);
  const [birthdayStudents, setBirthdayStudents] = useState<Student[]>([]);
  const [selectedCelebrations, setSelectedCelebrations] = useState<string[]>(data?.selectedCelebrations || []);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadTodaysCelebrations();
    findBirthdayStudents();
  }, [students]);

  const loadTodaysCelebrations = () => {
    try {
      // Get celebrations from settings
      const settings = UnifiedDataService.getSettings();
      const customCelebrations = settings?.morningMeeting?.celebrations?.customCelebrations || [];
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Filter celebrations for today
      const todaysCelebs = customCelebrations.filter((celeb: Celebration) => {
        if (!celeb.date) return false;
        
        if (celeb.recurring) {
          // For recurring celebrations, check month-day only
          const celebDate = new Date(celeb.date);
          return celebDate.getMonth() === today.getMonth() && celebDate.getDate() === today.getDate();
        } else {
          // For one-time celebrations, check exact date
          return celeb.date === todayStr;
        }
      });
      
      setTodaysCelebrations(todaysCelebs);
    } catch (error) {
      console.error('Error loading celebrations:', error);
      setTodaysCelebrations([]);
    }
  };

  const findBirthdayStudents = () => {
    const today = new Date();
    const todayBirthdays = students.filter(student => {
      if (!student.birthday) return false;
      
      const birthday = new Date(student.birthday);
      return birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate();
    });
    
    setBirthdayStudents(todayBirthdays);
  };

  const handleCelebrationSelect = (celebrationId: string) => {
    const newSelected = selectedCelebrations.includes(celebrationId)
      ? selectedCelebrations.filter(id => id !== celebrationId)
      : [...selectedCelebrations, celebrationId];
    
    setSelectedCelebrations(newSelected);
    onUpdateData({
      selectedCelebrations: newSelected,
      birthdayStudents: birthdayStudents.map(s => s.id),
      completedAt: new Date()
    });
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const hasCelebrations = todaysCelebrations.length > 0 || birthdayStudents.length > 0;

  return (
    <div className="celebration-step">
      {/* Confetti Animation */}
      {showConfetti && (
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

      <div className="step-header">
        <div className="header-content">
          <h2 className="step-title">
            <Sparkles size={32} />
            🎉 Celebrations
          </h2>
          <p className="step-description">
            Let's celebrate what makes today special!
          </p>
        </div>
      </div>

      <div className="celebrations-content">
        {!hasCelebrations ? (
          // No Celebrations Today
          <div className="no-celebrations">
            <div className="no-celebrations-icon">
              <Heart size={64} />
            </div>
            <h3>No Special Celebrations Today</h3>
            <p>Every day is special, but today we're focusing on learning and growing together!</p>
            <div className="daily-appreciation">
              <h4>✨ Today We Appreciate:</h4>
              <ul>
                <li>Being present and ready to learn</li>
                <li>Supporting our classmates</li>
                <li>Trying our best in everything we do</li>
                <li>Making today a great day together</li>
              </ul>
            </div>
          </div>
        ) : (
          // Has Celebrations
          <div className="celebrations-list">
            {/* Birthday Celebrations */}
            {birthdayStudents.length > 0 && (
              <div className="birthday-section">
                <h3 className="celebration-category">
                  <Gift size={24} />
                  🎂 Birthday Celebrations
                </h3>
                <div className="birthday-students">
                  {birthdayStudents.map(student => (
                    <div key={student.id} className="birthday-student">
                      <div className="student-photo">
                        {student.photo ? (
                          <img src={student.photo} alt={student.name} />
                        ) : (
                          <div className="photo-placeholder">
                            <Camera size={32} />
                          </div>
                        )}
                        <div className="birthday-badge">🎂</div>
                      </div>
                      <div className="student-info">
                        <h4>{student.name}</h4>
                        <p>Happy Birthday!</p>
                      </div>
                      <button
                        onClick={triggerConfetti}
                        className="celebration-button"
                      >
                        🎉 Celebrate!
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Celebrations */}
            {todaysCelebrations.length > 0 && (
              <div className="custom-celebrations-section">
                <h3 className="celebration-category">
                  <Star size={24} />
                  ✨ Special Celebrations
                </h3>
                <div className="custom-celebrations">
                  {todaysCelebrations.map(celebration => (
                    <div 
                      key={celebration.id} 
                      className={`celebration-card ${selectedCelebrations.includes(celebration.id) ? 'selected' : ''}`}
                      onClick={() => handleCelebrationSelect(celebration.id)}
                    >
                      <div className="celebration-emoji">
                        {celebration.emoji}
                      </div>
                      <div className="celebration-info">
                        <h4>{celebration.name}</h4>
                        <p>{celebration.message}</p>
                        {celebration.date && (
                          <div className="celebration-date">
                            <Calendar size={16} />
                            {new Date(celebration.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="celebration-check">
                        {selectedCelebrations.includes(celebration.id) ? '✅' : '⚪'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Celebration Actions */}
            <div className="celebration-actions">
              <button
                onClick={triggerConfetti}
                className="confetti-button"
              >
                🎊 Make it Rain Confetti!
              </button>
              
              <div className="celebration-summary">
                <h4>🌟 Today's Celebration Summary:</h4>
                <ul>
                  {birthdayStudents.map(student => (
                    <li key={student.id}>🎂 {student.name}'s Birthday</li>
                  ))}
                  {todaysCelebrations
                    .filter(celeb => selectedCelebrations.includes(celeb.id))
                    .map(celeb => (
                      <li key={celeb.id}>{celeb.emoji} {celeb.name}</li>
                    ))}
                </ul>
                {birthdayStudents.length === 0 && selectedCelebrations.length === 0 && (
                  <p>Select celebrations above to add them to today's summary!</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="step-navigation">
        <button onClick={onPrevious} className="nav-button previous">
          ← Previous
        </button>
        <div className="step-indicator">
          Step 7 of 8
        </div>
        <button onClick={onNext} className="nav-button next">
          Next →
        </button>
      </div>

      <style>{`
        .celebration-step {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: relative;
          overflow: hidden;
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

        .celebrations-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .no-celebrations {
          text-align: center;
          max-width: 500px;
          margin: 2rem auto;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 3rem 2rem;
          backdrop-filter: blur(10px);
        }

        .no-celebrations-icon {
          margin-bottom: 1.5rem;
          opacity: 0.8;
        }

        .no-celebrations h3 {
          font-size: 1.5rem;
          margin: 0 0 1rem 0;
        }

        .no-celebrations p {
          font-size: 1.1rem;
          margin: 0 0 2rem 0;
          opacity: 0.9;
        }

        .daily-appreciation {
          text-align: left;
          margin-top: 2rem;
        }

        .daily-appreciation h4 {
          font-size: 1.2rem;
          margin: 0 0 1rem 0;
          text-align: center;
        }

        .daily-appreciation ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .daily-appreciation li {
          margin: 0.75rem 0;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          border-left: 4px solid rgba(255, 255, 255, 0.3);
        }

        .celebrations-list {
          max-width: 800px;
          margin: 0 auto;
        }

        .celebration-category {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 1.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        .birthday-section {
          margin-bottom: 3rem;
        }

        .birthday-students {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .birthday-student {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .student-photo {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .student-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .birthday-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #FFD93D;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .student-info {
          flex: 1;
        }

        .student-info h4 {
          font-size: 1.3rem;
          margin: 0 0 0.5rem 0;
          font-weight: 600;
        }

        .student-info p {
          margin: 0;
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .celebration-button {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          border: none;
          border-radius: 15px;
          padding: 1rem 1.5rem;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .celebration-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .custom-celebrations-section {
          margin-bottom: 3rem;
        }

        .custom-celebrations {
          display: grid;
          gap: 1rem;
        }

        .celebration-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .celebration-card:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .celebration-card.selected {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .celebration-emoji {
          font-size: 2.5rem;
          width: 60px;
          text-align: center;
        }

        .celebration-info {
          flex: 1;
        }

        .celebration-info h4 {
          font-size: 1.2rem;
          margin: 0 0 0.5rem 0;
          font-weight: 600;
        }

        .celebration-info p {
          margin: 0 0 0.5rem 0;
          opacity: 0.9;
        }

        .celebration-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .celebration-check {
          font-size: 1.5rem;
        }

        .celebration-actions {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          backdrop-filter: blur(10px);
        }

        .confetti-button {
          background: linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%);
          border: none;
          border-radius: 15px;
          padding: 1rem 2rem;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          margin-bottom: 2rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .confetti-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .celebration-summary {
          text-align: left;
          max-width: 400px;
          margin: 0 auto;
        }

        .celebration-summary h4 {
          text-align: center;
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
        }

        .celebration-summary ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .celebration-summary li {
          background: rgba(255, 255, 255, 0.1);
          margin: 0.5rem 0;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border-left: 4px solid rgba(255, 255, 255, 0.3);
        }

        .celebration-summary p {
          text-align: center;
          opacity: 0.8;
          font-style: italic;
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

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .step-indicator {
          font-weight: 600;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .step-title {
            font-size: 2rem;
          }

          .birthday-student {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .celebration-card {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .step-navigation {
            flex-direction: column;
            gap: 1rem;
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
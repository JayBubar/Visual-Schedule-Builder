import React, { useState, useEffect } from 'react';
import { Student } from '../../types';

interface CelebrationSystemProps {
  currentDate: Date;
  students: Student[];
  onNext: () => void;
  onBack: () => void;
}

interface Holiday {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'major' | 'fun' | 'educational';
}

const CelebrationSystem: React.FC<CelebrationSystemProps> = ({
  currentDate,
  students,
  onNext,
  onBack
}) => {
  const [celebrationItems, setCelebrationItems] = useState<any[]>([]);
  const [showDanceParty, setShowDanceParty] = useState(false);
  const [dancePartyUsed, setDancePartyUsed] = useState(false);
  const [dancePartyTimer, setDancePartyTimer] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);

  // Holiday database - you can expand this!
  const holidayDatabase: Holiday[] = [
    // Major Holidays
    { id: 'new-year', name: 'New Year\'s Day', icon: '🎊', description: 'Starting fresh!', category: 'major' },
    { id: 'mlk-day', name: 'Martin Luther King Jr. Day', icon: '✊', description: 'Celebrating equality and dreams', category: 'major' },
    { id: 'presidents-day', name: 'Presidents\' Day', icon: '🇺🇸', description: 'Honoring our nation\'s leaders', category: 'major' },
    { id: 'memorial-day', name: 'Memorial Day', icon: '🇺🇸', description: 'Remembering our heroes', category: 'major' },
    { id: 'independence-day', name: 'Independence Day', icon: '🎆', description: 'Celebrating freedom!', category: 'major' },
    { id: 'labor-day', name: 'Labor Day', icon: '👷', description: 'Celebrating hard work', category: 'major' },
    { id: 'veterans-day', name: 'Veterans Day', icon: '🎖️', description: 'Thanking our veterans', category: 'major' },
    { id: 'thanksgiving', name: 'Thanksgiving', icon: '🦃', description: 'Grateful hearts!', category: 'major' },
    { id: 'christmas', name: 'Christmas', icon: '🎄', description: 'Joy and giving', category: 'major' },
    
    // Fun National Days (by month/date)
    { id: 'groundhog-day', name: 'Groundhog Day', icon: '🦫', description: 'Will spring come early?', category: 'fun' },
    { id: 'pi-day', name: 'Pi Day', icon: '🥧', description: 'Math is delicious!', category: 'educational' },
    { id: 'earth-day', name: 'Earth Day', icon: '🌍', description: 'Taking care of our planet', category: 'educational' },
    { id: 'star-wars-day', name: 'Star Wars Day', icon: '⭐', description: 'May the 4th be with you!', category: 'fun' },
    { id: 'national-teacher-day', name: 'National Teacher Day', icon: '🍎', description: 'Celebrating our amazing teachers!', category: 'educational' },
    { id: 'national-donut-day', name: 'National Donut Day', icon: '🍩', description: 'Sweet treats for everyone!', category: 'fun' },
    { id: 'national-ice-cream-day', name: 'National Ice Cream Day', icon: '🍦', description: 'Cool and creamy fun!', category: 'fun' },
    { id: 'national-pizza-day', name: 'National Pizza Day', icon: '🍕', description: 'Everyone loves pizza!', category: 'fun' },
    { id: 'national-cookie-day', name: 'National Cookie Day', icon: '🍪', description: 'Sweet and crunchy!', category: 'fun' },
    { id: 'national-popcorn-day', name: 'National Popcorn Day', icon: '🍿', description: 'Pop, pop, hooray!', category: 'fun' },
    { id: 'national-pancake-day', name: 'National Pancake Day', icon: '🥞', description: 'Fluffy breakfast fun!', category: 'fun' },
    { id: 'national-taco-day', name: 'National Taco Day', icon: '🌮', description: 'Taco \'bout delicious!', category: 'fun' },
    { id: 'national-hot-dog-day', name: 'National Hot Dog Day', icon: '🌭', description: 'Classic American fun!', category: 'fun' },
    { id: 'national-sandwich-day', name: 'National Sandwich Day', icon: '🥪', description: 'Between two slices of fun!', category: 'fun' },
    { id: 'national-soup-day', name: 'National Soup Day', icon: '🍲', description: 'Warm and comforting!', category: 'fun' },
    { id: 'national-backwards-day', name: 'National Backwards Day', icon: '🔄', description: 'Everything is backwards today!', category: 'fun' },
    { id: 'national-bubble-wrap-day', name: 'National Bubble Wrap Day', icon: '🫧', description: 'Pop, pop, pop!', category: 'fun' },
    { id: 'national-hugging-day', name: 'National Hugging Day', icon: '🤗', description: 'Sharing warm hugs!', category: 'fun' },
    { id: 'national-smile-day', name: 'National Smile Day', icon: '😊', description: 'Spread joy with smiles!', category: 'fun' },
    { id: 'national-kindness-day', name: 'World Kindness Day', icon: '💝', description: 'Being kind to everyone!', category: 'educational' },
    { id: 'pajama-day', name: 'Pajama Day', icon: '👔', description: 'Cozy and comfortable!', category: 'fun' },
    { id: 'crazy-hair-day', name: 'Crazy Hair Day', icon: '💇', description: 'Wild and wacky styles!', category: 'fun' },
    { id: 'red-nose-day', name: 'Red Nose Day', icon: '🔴', description: 'Having fun for a good cause!', category: 'fun' }
  ];

  useEffect(() => {
    // Check for celebrations on this date
    const celebrations = [];
    
    // Check for birthdays
    const birthdayStudents = students.filter(student => {
      if (student.birthday) {
        const birthday = new Date(student.birthday);
        return birthday.getMonth() === currentDate.getMonth() && 
               birthday.getDate() === currentDate.getDate();
      }
      return false;
    });

    if (birthdayStudents.length > 0) {
      celebrations.push({
        type: 'birthday',
        students: birthdayStudents,
        icon: '🎂',
        title: `Happy Birthday!`,
        description: `Celebrating ${birthdayStudents.map(s => s.name).join(' and ')}`
      });
    }

    // Check for holidays (simplified - you'd want more sophisticated date matching)
    const todayHolidays = getTodaysHolidays();
    celebrations.push(...todayHolidays.map(holiday => ({
      type: 'holiday',
      holiday,
      icon: holiday.icon,
      title: holiday.name,
      description: holiday.description
    })));

    // Check for special school events
    const specialEvents = getSpecialEvents();
    celebrations.push(...specialEvents);

    setCelebrationItems(celebrations);

    // Check if dance party was used today
    const today = currentDate.toDateString();
    const lastDanceParty = localStorage.getItem('lastDanceParty');
    setDancePartyUsed(lastDanceParty === today);
  }, [currentDate, students]);

  const getTodaysHolidays = (): Holiday[] => {
    // This is a simplified version - you'd want a more sophisticated matching system
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    
    const holidayMap: { [key: string]: string[] } = {
      '1-1': ['new-year'],
      '2-2': ['groundhog-day'],
      '3-14': ['pi-day'],
      '4-22': ['earth-day'],
      '5-4': ['star-wars-day'],
      '6-1': ['national-donut-day'], // First Friday in June (simplified)
      '7-4': ['independence-day'],
      '9-19': ['national-talk-like-pirate-day'],
      '10-4': ['national-taco-day'],
      '12-25': ['christmas']
    };

    const key = `${month}-${day}`;
    const todayHolidayIds = holidayMap[key] || [];
    
    // Add some random fun holidays
    if (Math.random() > 0.7) { // 30% chance of a fun holiday
      const funHolidays = ['national-hot-dog-day', 'national-pizza-day', 'national-cookie-day', 'national-smile-day'];
      const randomHoliday = funHolidays[Math.floor(Math.random() * funHolidays.length)];
      if (!todayHolidayIds.includes(randomHoliday)) {
        todayHolidayIds.push(randomHoliday);
      }
    }

    return holidayDatabase.filter(holiday => todayHolidayIds.includes(holiday.id));
  };

  const getSpecialEvents = () => {
    const events = [];
    const dayOfWeek = currentDate.getDay();
    
    // Check for common school events
    if (dayOfWeek === 5) { // Friday
      events.push({
        type: 'event',
        icon: '🎉',
        title: 'Friday Fun Day!',
        description: 'End of the week celebration!'
      });
    }

    if (dayOfWeek === 1) { // Monday
      events.push({
        type: 'event',
        icon: '💪',
        title: 'Motivation Monday!',
        description: 'Starting the week strong!'
      });
    }

    return events;
  };

  const startDanceParty = () => {
    setShowDanceParty(true);
    setIsPlaying(true);
    setDancePartyTimer(60);
    
    // Mark dance party as used today
    const today = currentDate.toDateString();
    localStorage.setItem('lastDanceParty', today);
    setDancePartyUsed(true);

    // Start countdown
    const interval = setInterval(() => {
      setDancePartyTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsPlaying(false);
          setTimeout(() => setShowDanceParty(false), 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (showDanceParty) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: isPlaying 
          ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: isPlaying ? '400% 400%' : '100% 100%',
        animation: isPlaying ? 'danceColors 2s ease-in-out infinite' : 'none'
      }}>
        <div style={{
          fontSize: isPlaying ? '8rem' : '6rem',
          marginBottom: '2rem',
          animation: isPlaying ? 'dance 1s ease-in-out infinite' : 'none'
        }}>
          {isPlaying ? '🕺💃🎵' : '🎉'}
        </div>
        
        <h2 style={{
          fontSize: '3rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '1rem',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          animation: isPlaying ? 'bounce 1s ease-in-out infinite' : 'none'
        }}>
          {isPlaying ? 'DANCE PARTY!' : 'Dance Party Complete!'}
        </h2>

        {isPlaying && (
          <div style={{
            fontSize: '4rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '2rem',
            textShadow: '0 4px 8px rgba(0,0,0,0.5)',
            border: '4px solid white',
            borderRadius: '50%',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1s ease-in-out infinite'
          }}>
            {dancePartyTimer}
          </div>
        )}

        {!isPlaying && (
          <button
            onClick={onNext}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '3px solid white',
              borderRadius: '16px',
              color: 'white',
              padding: '1.5rem 3rem',
              fontSize: '1.5rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Continue to Behavior Goals
          </button>
        )}

        <style>{`
          @keyframes danceColors {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes dance {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-20px) rotate(-5deg); }
            75% { transform: translateY(-10px) rotate(5deg); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      minHeight: '600px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      {/* Header */}
      <div>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '1rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🎉 Celebration Time!
        </h2>
        <p style={{
          fontSize: '1.3rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '0.5rem'
        }}>
          {formatDate(currentDate)}
        </p>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.8)'
        }}>
          Let's see what we're celebrating today!
        </p>
      </div>

      {/* Celebrations */}
      {celebrationItems.length > 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {celebrationItems.map((celebration, index) => (
            <div key={index} style={{
              background: celebration.type === 'birthday' 
                ? 'linear-gradient(135deg, #ff6b6b, #feca57)'
                : celebration.type === 'holiday'
                ? 'linear-gradient(135deg, #5f27cd, #00d2d3)'
                : 'linear-gradient(135deg, #ff9ff3, #f368e0)',
              borderRadius: '20px',
              padding: '2rem',
              color: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              animation: `slideIn 0.6s ease-out ${index * 0.2}s both`
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                {celebration.icon}
              </div>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '1rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {celebration.title}
              </h3>
              <p style={{
                fontSize: '1.3rem',
                opacity: 0.9,
                marginBottom: celebration.type === 'birthday' ? '1rem' : '0'
              }}>
                {celebration.description}
              </p>
              
              {celebration.type === 'birthday' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  {celebration.students.map((student: Student) => (
                    <div key={student.id} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      padding: '1rem'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: student.photo 
                          ? `url(${student.photo}) center/cover`
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'white',
                        border: '3px solid rgba(255,255,255,0.5)'
                      }}>
                        {!student.photo && student.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                        {student.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '3rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😊</div>
          <h3 style={{
            fontSize: '1.8rem',
            color: 'white',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            No Special Celebrations Today
          </h3>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.8)'
          }}>
            But every day is special when we're learning together!
          </p>
        </div>
      )}

      {/* Dance Party Button */}
      {!dancePartyUsed && (
        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '600px',
          margin: '0 auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕺💃</div>
          <h3 style={{
            fontSize: '1.8rem',
            color: 'white',
            marginBottom: '1rem',
            fontWeight: '700'
          }}>
            Daily Dance Party!
          </h3>
          <p style={{
            fontSize: '1rem',
            color: 'white',
            marginBottom: '1.5rem',
            opacity: 0.9
          }}>
            Ready for a 1-minute dance party? You can only do this once per day!
          </p>
          <button
            onClick={startDanceParty}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '3px solid white',
              borderRadius: '16px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1.3rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#ff6b6b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = 'white';
            }}
          >
            🎵 Start Dance Party! 🎵
          </button>
        </div>
      )}

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: 'auto'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
        >
          ← Back to Weather
        </button>
        
        <button
          onClick={onNext}
          style={{
            background: 'rgba(34, 197, 94, 0.8)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
        >
          Continue to Behavior Goals →
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CelebrationSystem;\
import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import UnifiedDataService from '../../services/unifiedDataService';

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
    
    // Get settings from UnifiedDataService for birthday handling
    const unifiedSettings = UnifiedDataService.getSettings();
    const birthdaySettings = unifiedSettings.dailyCheckIn?.birthdaySettings || {};
    
    // Check for birthdays with weekend handling using unified settings
    const birthdayStudents = handleWeekendBirthdays(currentDate, students, birthdaySettings);
    if (birthdayStudents.length > 0) {
      celebrations.push({
        type: 'birthday',
        icon: '🎂',
        title: birthdayStudents.length === 1 
          ? `Happy Birthday, ${birthdayStudents[0].name}!`
          : `Birthday Celebration!`,
        description: birthdayStudents.length === 1
          ? formatBirthdayMessage(birthdayStudents[0], birthdaySettings)
          : `Celebrating ${birthdayStudents.length} special birthdays today!`,
        students: birthdayStudents
      });
    }

    // Check for custom celebrations
    const customCelebrations = getCustomCelebrations(currentDate);
    celebrations.push(...customCelebrations.map(celebration => ({
      type: 'custom',
      icon: celebration.emoji,
      title: celebration.title,
      description: celebration.message
    })));

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

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper functions for birthday and celebration management
const getBirthdayStudents = (date: Date, students: Student[]): Student[] => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return students.filter(student => {
    // Check if student has birthday property and it matches today
    const birthday = (student as any).birthday;
    if (!birthday) return false;
    
    const birthdayDate = new Date(birthday);
    return birthdayDate.getMonth() + 1 === month && birthdayDate.getDate() === day;
  });
};

const getCustomCelebrations = (date: Date): any[] => {
  // Get custom celebrations from settings/storage
  try {
    const settings = JSON.parse(localStorage.getItem('calendarSettings') || '{}');
    const customCelebrations = settings.customCelebrations || [];
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateString = date.toISOString().split('T')[0];
    
    return customCelebrations.filter((celebration: any) => {
      if (!celebration.enabled) return false;
      
      if (celebration.isRecurring) {
        // For recurring celebrations, check month and day
        const celebrationDate = new Date(celebration.date);
        return celebrationDate.getMonth() + 1 === month && celebrationDate.getDate() === day;
      } else {
        // For one-time celebrations, check exact date
        return celebration.date === dateString;
      }
    });
  } catch (error) {
    console.error('Error loading custom celebrations:', error);
    return [];
  }
};

const handleWeekendBirthdays = (date: Date, students: Student[], settings: any): Student[] => {
  const birthdayStudents = getBirthdayStudents(date, students);
  const dayOfWeek = date.getDay();
  const weekendHandling = settings?.weekendBirthdayHandling || 'exact';
  
  // Handle weekend birthdays based on settings
  if (weekendHandling === 'exact') {
    return birthdayStudents;
  }
  
  // For 'friday' or 'monday' handling, check adjacent days
  const allWeekendBirthdays: Student[] = [...birthdayStudents];
  
  if (weekendHandling === 'friday' && dayOfWeek === 5) {
    // Friday - show Saturday and Sunday birthdays
    const saturday = new Date(date);
    saturday.setDate(date.getDate() + 1);
    const sunday = new Date(date);
    sunday.setDate(date.getDate() + 2);
    
    allWeekendBirthdays.push(...getBirthdayStudents(saturday, students));
    allWeekendBirthdays.push(...getBirthdayStudents(sunday, students));
  } else if (weekendHandling === 'monday' && dayOfWeek === 1) {
    // Monday - show Saturday and Sunday birthdays
    const saturday = new Date(date);
    saturday.setDate(date.getDate() - 2);
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - 1);
    
    allWeekendBirthdays.push(...getBirthdayStudents(saturday, students));
    allWeekendBirthdays.push(...getBirthdayStudents(sunday, students));
  }
  
  return allWeekendBirthdays;
};

const formatBirthdayMessage = (student: Student, settings: any): string => {
  const customMessage = (student as any).celebrationPreferences?.customCelebrationMessage;
  if (customMessage) {
    return customMessage.replace('{name}', student.name);
  }
  
  const defaultMessages = [
    `Happy Birthday, ${student.name}! 🎂`,
    `It's ${student.name}'s special day! 🎉`,
    `Celebrating ${student.name} today! 🎈`,
    `${student.name} is another year awesome! ⭐`
  ];
  
  return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
};

// Custom Celebration Manager Component
interface CustomCelebrationManagerProps {
  currentDate: Date;
}

const CustomCelebrationManager: React.FC<CustomCelebrationManagerProps> = ({ currentDate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCelebration, setNewCelebration] = useState({
    title: '',
    message: '',
    emoji: '🎉',
    isRecurring: false,
    date: currentDate.toISOString().split('T')[0]
  });

  const addCustomCelebration = () => {
    if (!newCelebration.title.trim() || !newCelebration.message.trim()) {
      alert('Please fill in both title and message fields.');
      return;
    }

    try {
      const settings = JSON.parse(localStorage.getItem('calendarSettings') || '{}');
      const customCelebrations = settings.customCelebrations || [];
      
      const celebration = {
        id: Date.now().toString(),
        title: newCelebration.title.trim(),
        message: newCelebration.message.trim(),
        emoji: newCelebration.emoji,
        date: newCelebration.date,
        isRecurring: newCelebration.isRecurring,
        enabled: true,
        createdAt: new Date().toISOString()
      };

      customCelebrations.push(celebration);
      
      const updatedSettings = {
        ...settings,
        customCelebrations
      };
      
      localStorage.setItem('calendarSettings', JSON.stringify(updatedSettings));
      
      // Reset form
      setNewCelebration({
        title: '',
        message: '',
        emoji: '🎉',
        isRecurring: false,
        date: currentDate.toISOString().split('T')[0]
      });
      setShowAddForm(false);
      
      alert('Custom celebration added successfully!');
    } catch (error) {
      console.error('Error adding custom celebration:', error);
      alert('Error adding celebration. Please try again.');
    }
  };

  const emojiOptions = ['🎉', '🎊', '🎈', '🎂', '🌟', '⭐', '🎁', '🎀', '🎯', '🏆', '🎪', '🎭'];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '20px',
      padding: '2rem',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎊</div>
      <h3 style={{
        fontSize: '1.5rem',
        color: 'white',
        marginBottom: '1rem',
        fontWeight: '600'
      }}>
        Custom Celebrations
      </h3>
      
      {!showAddForm ? (
        <>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '1.5rem'
          }}>
            Add special classroom celebrations for any date!
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '0.8rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            + Add Custom Celebration
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: '600' }}>
              Celebration Title
            </label>
            <input
              type="text"
              value={newCelebration.title}
              onChange={(e) => setNewCelebration(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Class Pizza Party"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: '600' }}>
              Celebration Message
            </label>
            <textarea
              value={newCelebration.message}
              onChange={(e) => setNewCelebration(prev => ({ ...prev, message: e.target.value }))}
              placeholder="e.g., We earned our pizza party by reading 100 books!"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: '600' }}>
                Emoji
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {emojiOptions.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewCelebration(prev => ({ ...prev, emoji }))}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: newCelebration.emoji === emoji ? '2px solid #22c55e' : '2px solid rgba(255,255,255,0.3)',
                      background: newCelebration.emoji === emoji ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.1)',
                      fontSize: '1.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: '600' }}>
                Date
              </label>
              <input
                type="date"
                value={newCelebration.date}
                onChange={(e) => setNewCelebration(prev => ({ ...prev, date: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
              
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                cursor: 'pointer',
                color: 'white'
              }}>
                <input
                  type="checkbox"
                  checked={newCelebration.isRecurring}
                  onChange={(e) => setNewCelebration(prev => ({ ...prev, isRecurring: e.target.checked }))}
                />
                <span style={{ fontSize: '0.9rem' }}>Repeat annually</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewCelebration({
                  title: '',
                  message: '',
                  emoji: '🎉',
                  isRecurring: false,
                  date: currentDate.toISOString().split('T')[0]
                });
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: 'white',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={addCustomCelebration}
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Add Celebration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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

      {/* Interactive Custom Celebration Management */}
      <CustomCelebrationManager currentDate={currentDate} />

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

export default CelebrationSystem;

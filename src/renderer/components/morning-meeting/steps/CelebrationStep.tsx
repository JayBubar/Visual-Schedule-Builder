import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MorningMeetingStepProps, Student } from '../types/morningMeetingTypes';
import StepNavigation from '../common/StepNavigation';
import UnifiedDataService from '../../../services/unifiedDataService';

interface Celebration {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

const CelebrationStep: React.FC<MorningMeetingStepProps> = ({
  students = [],
  hubSettings,
  currentDate,
  onNext,
  onBack,
  onHome,
  onStepComplete,
}) => {
  const [internalSection, setInternalSection] = useState(0);

  // FIXED: Expanded holiday database with 50+ entries for 180-day school year rotation
  const getFunHolidayForDate = useCallback((date: Date): Celebration => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // FIXED: Use date hash for consistent daily variety instead of just date key
    const dateHash = (month * 100 + day) % 53; // 53 ensures good distribution across school year
    
    const holidayDatabase: Celebration[] = [
      // January celebrations
      { id: '1', name: 'New Year\'s Day', emoji: '🎊', description: 'Welcome to a brand new year of learning!' },
      { id: '2', name: 'National Popcorn Day', emoji: '🍿', description: 'Pop into learning with this tasty treat!' },
      { id: '3', name: 'National Puzzle Day', emoji: '🧩', description: 'Every day is a puzzle to solve!' },
      { id: '4', name: 'National Hug Day', emoji: '🤗', description: 'Spread kindness with a friendly hug!' },
      
      // February celebrations
      { id: '5', name: 'Groundhog Day', emoji: '🐹', description: 'Will we see our shadow today?' },
      { id: '6', name: 'Valentine\'s Day', emoji: '💝', description: 'A day to show kindness and friendship!' },
      { id: '7', name: 'Presidents Day', emoji: '🇺🇸', description: 'Honoring our nation\'s leaders!' },
      { id: '8', name: 'National Pizza Day', emoji: '🍕', description: 'Everyone loves pizza day!' },
      
      // March celebrations
      { id: '9', name: 'Read Across America Day', emoji: '📚', description: 'Let\'s celebrate the joy of reading!' },
      { id: '10', name: 'St. Patrick\'s Day', emoji: '🍀', description: 'A lucky day for learning!' },
      { id: '11', name: 'First Day of Spring', emoji: '🌸', description: 'Spring into new adventures!' },
      { id: '12', name: 'National Crayon Day', emoji: '🖍️', description: 'Color your world with creativity!' },
      { id: '13', name: 'National Puppy Day', emoji: '🐶', description: 'Celebrating our furry friends!' },
      
      // April celebrations
      { id: '14', name: 'April Fools\' Day', emoji: '😄', description: 'A day for harmless fun and giggles!' },
      { id: '15', name: 'Earth Day', emoji: '🌍', description: 'Let\'s take care of our beautiful planet!' },
      { id: '16', name: 'National Library Day', emoji: '📖', description: 'Libraries are treasure chests of knowledge!' },
      { id: '17', name: 'National Superhero Day', emoji: '🦸‍♀️', description: 'You\'re all classroom superheroes!' },
      
      // May celebrations
      { id: '18', name: 'May Day', emoji: '🌺', description: 'Celebrate the beauty of spring!' },
      { id: '19', name: 'Star Wars Day', emoji: '🚀', description: 'May the Fourth be with you!' },
      { id: '20', name: 'Teacher Appreciation Day', emoji: '🍎', description: 'Thanking all our amazing teachers!' },
      { id: '21', name: 'National Space Day', emoji: '🌟', description: 'Reach for the stars in learning!' },
      
      // June celebrations (limited for school year)
      { id: '22', name: 'World Environment Day', emoji: '🌱', description: 'Let\'s protect our environment!' },
      { id: '23', name: 'National Best Friends Day', emoji: '👫', description: 'Celebrate friendship and kindness!' },
      { id: '24', name: 'First Day of Summer', emoji: '☀️', description: 'Summer fun and learning begins!' },
      
      // July celebrations (summer break - fewer needed)
      { id: '25', name: 'Independence Day', emoji: '🇺🇸', description: 'Celebrating freedom and community!' },
      { id: '26', name: 'National Ice Cream Day', emoji: '🍦', description: 'Cool treats for a hot day!' },
      
      // August celebrations (back to school)
      { id: '27', name: 'National Dog Day', emoji: '🐕', description: 'A day to celebrate our furry friends!' },
      { id: '28', name: 'National Friendship Day', emoji: '🤝', description: 'Making new friends at school!' },
      { id: '29', name: 'International Left-Handers Day', emoji: '✋', description: 'Celebrating all kinds of uniqueness!' },
      
      // September celebrations
      { id: '30', name: 'International Literacy Day', emoji: '📚', description: 'Reading opens doors to new worlds!' },
      { id: '31', name: 'First Day of Fall', emoji: '🍂', description: 'Fall into new learning adventures!' },
      { id: '32', name: 'National School Success Day', emoji: '🎓', description: 'Every day is a chance to succeed!' },
      { id: '33', name: 'World Kindness Day', emoji: '💝', description: 'Spread kindness everywhere you go!' },
      
      // October celebrations
      { id: '34', name: 'National Taco Day', emoji: '🌮', description: 'Let\'s talk about this delicious food!' },
      { id: '35', name: 'World Teachers\' Day', emoji: '👩‍🏫', description: 'Celebrating all our amazing teachers!' },
      { id: '36', name: 'Halloween', emoji: '🎃', description: 'A spook-tacular day for fun!' },
      { id: '37', name: 'National Cookie Day', emoji: '🍪', description: 'Sweet learning moments!' },
      
      // November celebrations
      { id: '38', name: 'National Sandwich Day', emoji: '🥪', description: 'What\'s your favorite sandwich?' },
      { id: '39', name: 'National STEM Day', emoji: '🔬', description: 'Science, Technology, Engineering, and Math!' },
      { id: '40', name: 'Veterans Day', emoji: '🇺🇸', description: 'Honoring those who served our country!' },
      { id: '41', name: 'Thanksgiving', emoji: '🦃', description: 'Grateful for learning and friendship!' },
      
      // December celebrations
      { id: '42', name: 'National Cookie Day', emoji: '🍪', description: 'Sweet treats and sweet learning!' },
      { id: '43', name: 'Human Rights Day', emoji: '🤝', description: 'Everyone deserves kindness and respect!' },
      { id: '44', name: 'First Day of Winter', emoji: '❄️', description: 'Winter wonderland of learning!' },
      { id: '45', name: 'Holiday Celebration', emoji: '🎄', description: 'Celebrating traditions and togetherness!' },
      
      // Additional fun days to reach 50+
      { id: '46', name: 'National Compliment Day', emoji: '😊', description: 'Say something nice to a friend!' },
      { id: '47', name: 'International Music Day', emoji: '🎵', description: 'Music makes everything better!' },
      { id: '48', name: 'National Art Day', emoji: '🎨', description: 'Express yourself through creativity!' },
      { id: '49', name: 'World Smile Day', emoji: '😄', description: 'Share your beautiful smile today!' },
      { id: '50', name: 'National Science Day', emoji: '🧪', description: 'Discover amazing things through science!' },
      { id: '51', name: 'International Dance Day', emoji: '💃', description: 'Move and groove to the rhythm!' },
      { id: '52', name: 'National High Five Day', emoji: '🙏', description: 'Give your classmates a high five!' }
    ];
    
    // FIXED: Select holiday based on hash for consistent daily rotation
    const selectedHoliday = holidayDatabase[dateHash];
    
    return selectedHoliday || {
      id: 'default',
      name: 'Wonderful Learning Day',
      emoji: '✨',
      description: 'Every day is a great day to celebrate learning and friendship!',
    };
  }, []);

  const funHoliday = useMemo(() => getFunHolidayForDate(currentDate), [currentDate, getFunHolidayForDate]);

  const birthdayStudents = useMemo(() => {
    // Get all students from UnifiedDataService instead of using props
    const allStudents = UnifiedDataService.getAllStudents();
    
    // Debug logging
    console.log('🎂 CelebrationStep Debug Info:');
    console.log('- Total students found:', allStudents.length);
    console.log('- Current date:', currentDate.toDateString());
    console.log('- Current month/day:', currentDate.getMonth(), currentDate.getDate());
    
    // Check each student's birthday data
    allStudents.forEach(student => {
      if (student.birthday) {
        const birthday = new Date(student.birthday);
        console.log(`- Student: ${student.name}`);
        console.log(`  Birthday: ${student.birthday}`);
        console.log(`  Parsed birthday: ${birthday.toDateString()}`);
        console.log(`  Birthday month (0-based): ${birthday.getMonth()} (${birthday.getMonth() + 1} in human terms)`);
        console.log(`  Birthday day: ${birthday.getDate()}`);
        console.log(`  Current month (0-based): ${currentDate.getMonth()} (${currentDate.getMonth() + 1} in human terms)`);
        console.log(`  Current day: ${currentDate.getDate()}`);
        console.log(`  Allow Birthday Display: ${student.allowBirthdayDisplay}`);
        console.log(`  Allow Photo in Celebrations: ${student.allowPhotoInCelebrations}`);
        console.log(`  Matches today: ${birthday.getMonth() === currentDate.getMonth() && birthday.getDate() === currentDate.getDate()}`);
      }
    });
    
    const filtered = allStudents.filter(student => {
      // Check if student has a birthday
      if (!student.birthday) {
        console.log(`❌ ${student.name}: No birthday set`);
        return false;
      }
      
      // TEMPORARY: Allow birthday display even if allowBirthdayDisplay is not explicitly set
      // This helps us debug if the issue is with the privacy setting
      if (student.allowBirthdayDisplay === false) {
        console.log(`❌ ${student.name}: Birthday display explicitly disabled`);
        return false;
      }
      
      if (!student.allowBirthdayDisplay) {
        console.log(`⚠️ ${student.name}: allowBirthdayDisplay not set, but allowing for debugging`);
      }
      
      // Check if birthday matches today's date
      // Fix timezone issue with ISO date parsing by parsing manually
      let birthday;
      if (student.birthday.includes('-')) {
        // Handle ISO format (YYYY-MM-DD) to avoid timezone issues
        const [year, month, day] = student.birthday.split('-').map(Number);
        birthday = new Date(year, month - 1, day); // month is 0-based in Date constructor
      } else {
        // Handle other formats
        birthday = new Date(student.birthday);
      }
      
      const matches = birthday.getMonth() === currentDate.getMonth() && birthday.getDate() === currentDate.getDate();
      
      if (matches) {
        console.log(`✅ ${student.name}: Birthday matches today!`);
      } else {
        console.log(`❌ ${student.name}: Birthday doesn't match today`);
      }
      
      return matches;
    });
    
    console.log('🎂 Final birthday students:', filtered.length);
    return filtered;
  }, [currentDate]);

  const customCelebrations = useMemo(() => {
    return hubSettings?.celebrations?.customCelebrations || [];
  }, [hubSettings]);

  useEffect(() => {
    if (internalSection === 1) {
      onStepComplete?.();
    }
  }, [internalSection, onStepComplete]);

  const handleInternalNext = () => setInternalSection(1);
  const handleInternalBack = () => setInternalSection(0);

  const renderContent = () => {
    if (internalSection === 0) {
      return (
        <>
          <h2 style={styles.rightPanelTitle}>Today We Celebrate...</h2>
          <div style={styles.celebrationCard} className="pop-in">
            <div style={styles.celebrationEmoji}>{funHoliday.emoji}</div>
            <h3 style={styles.celebrationName}>{funHoliday.name}</h3>
            <p style={styles.celebrationDescription}>{funHoliday.description}</p>
          </div>
          
          {/* FIXED: Debug info to show rotation working */}
          <div style={styles.debugInfo}>
            <p style={styles.debugText}>
              Holiday #{((currentDate.getMonth() + 1) * 100 + currentDate.getDate()) % 53} 
              for {currentDate.toLocaleDateString()}
            </p>
          </div>
        </>
      );
    }

    if (internalSection === 1) {
      return (
        <>
          <h2 style={styles.rightPanelTitle}>Our Classroom's Celebrations</h2>
          <div style={styles.classroomCelebrationsContainer}>
            {birthdayStudents.length > 0 && (
              <div style={styles.celebrationSection}>
                <h4>🎂 Happy Birthday!</h4>
                {birthdayStudents.map(student => (
                  <div key={student.id} style={styles.studentCard}>
                    {student.photo && student.allowPhotoInCelebrations && (
                      <img src={student.photo} alt={student.name} style={styles.studentPhoto} />
                    )}
                    <span>{student.name}</span>
                  </div>
                ))}
              </div>
            )}
            {customCelebrations.length > 0 && (
              <div style={styles.celebrationSection}>
                <h4>🌟 Special Announcements</h4>
                {customCelebrations.map(celeb => (
                  <div key={celeb.id} style={styles.customCard}>
                    {celeb.emoji} {celeb.message}
                  </div>
                ))}
              </div>
            )}
            {birthdayStudents.length === 0 && customCelebrations.length === 0 && (
              <p style={styles.rightPanelSubtitle}>No special classroom celebrations today.</p>
            )}
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.leftColumn}>
        <h1 style={styles.leftTitle}>🎉 Celebrations!</h1>
        <p style={styles.leftSubtitle}>Let's find something to celebrate today!</p>
        <div style={styles.divider}></div>
        <div style={styles.progressList}>
          <div onClick={() => setInternalSection(0)} style={{ ...styles.progressItem, ...(internalSection === 0 ? styles.progressItemActive : {}) }}>
            1. Today's Fun Holiday
          </div>
          <div onClick={() => setInternalSection(1)} style={{ ...styles.progressItem, ...(internalSection === 1 ? styles.progressItemActive : {}) }}>
            2. Our Classroom's Celebrations
          </div>
        </div>
      </div>
      <div style={styles.rightColumn}>
        {renderContent()}
        <div style={styles.internalNavBar}>
          {internalSection > 0 && <button onClick={handleInternalBack} style={styles.internalNavButton}>Back</button>}
          {internalSection < 1 && <button onClick={handleInternalNext} style={styles.internalNavButton}>Next Section</button>}
        </div>
      </div>
      
      {/* Step Navigation */}
      <StepNavigation navigation={{
        goNext: onNext,
        goBack: onBack,
        goHome: onHome,
        canGoBack: !!onBack,
        isLastStep: false
      }} />
      
      <style>{`
        .pop-in { 
          animation: popIn 0.8s ease-out forwards; 
        } 
        @keyframes popIn { 
          0% { transform: scale(0.5) rotate(-10deg); opacity: 0; } 
          60% { transform: scale(1.1) rotate(5deg); opacity: 0.9; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; } 
        }
      `}</style>
    </div>
  );
};

// Styles with debug info section
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { 
        height: '100vh',
        background: 'linear-gradient(135deg, #FFD700 0%, #FF69B4 50%, #9D4EDD 100%)', 
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
    leftSubtitle: { fontSize: '1.2rem', opacity: 0.8, marginBottom: '2rem' },
    divider: { height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.3)', margin: '1rem 0 2rem 0' },
    progressList: { flex: 1, overflowY: 'auto', cursor: 'pointer' },
    progressItem: { fontSize: '1.1rem', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem', fontWeight: 500, opacity: 0.7, transition: 'background-color 0.3s' },
    progressItemActive: { backgroundColor: 'rgba(255, 255, 255, 0.2)', opacity: 1, fontWeight: 600 },
    rightPanelTitle: { fontSize: '3rem', fontWeight: 700, color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.3)', textAlign: 'center', marginBottom: '2rem' },
    rightPanelSubtitle: { fontSize: '1.5rem', color: 'white', opacity: 0.9, textAlign: 'center' },
    celebrationCard: { 
        width: '100%', 
        maxWidth: '600px', 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '24px', 
        padding: '3rem', 
        textAlign: 'center', 
        color: 'white',
        marginBottom: '1rem'
    },
    celebrationEmoji: { fontSize: '6rem' },
    celebrationName: { fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0' },
    celebrationDescription: { fontSize: '1.2rem', opacity: 0.9 },
    
    // FIXED: Debug info section to verify rotation is working
    debugInfo: {
        background: 'rgba(0,0,0,0.1)',
        borderRadius: '12px',
        padding: '0.75rem',
        marginTop: '1rem',
        maxWidth: '600px',
        width: '100%'
    },
    debugText: {
        fontSize: '0.9rem',
        opacity: 0.7,
        margin: 0,
        textAlign: 'center',
        fontFamily: 'monospace'
    },
    
    classroomCelebrationsContainer: { width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' },
    celebrationSection: { width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1.5rem', color: 'white' },
    studentCard: { display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 500 },
    studentPhoto: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' },
    customCard: { background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', fontSize: '1.2rem' },
    internalNavBar: { 
        position: 'absolute', 
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', 
        gap: '1rem',
        zIndex: 10
    },
    internalNavButton: { padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.5)' },
};

export default CelebrationStep;

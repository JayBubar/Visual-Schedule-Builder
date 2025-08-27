import React, { useState, useEffect } from 'react';
import UnifiedDataService from '../../../services/unifiedDataService';
import StepNavigation from '../common/StepNavigation';

interface BehaviorStepProps {
  onNext: () => void;
  onBack: () => void;
  onHome: () => void;
  onStepComplete: () => void;
  currentDate: Date;
}

interface Student {
  id: string;
  name: string;
  photo?: string;
}

interface BehaviorCommitment {
  id: string;
  text: string;
  icon: string;
}

interface StudentChoice {
  studentId: string;
  studentName: string;
  commitmentId: string;
  commitmentText: string;
  timestamp: Date;
}

const BehaviorStep: React.FC<BehaviorStepProps> = ({ onNext, onBack, onHome, onStepComplete, currentDate }) => {
  const [commitments, setCommitments] = useState<BehaviorCommitment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentChoices, setStudentChoices] = useState<{[studentId: string]: StudentChoice}>({});
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [animatingCard, setAnimatingCard] = useState<string | null>(null);

  // Fun emoji array for decoration
  const decorativeEmojis = ['✨', '🌟', '⭐', '💫', '🎯', '🚀', '💎', '🔥'];
  
  // Default behavior commitments with better variety
  const defaultCommitments: BehaviorCommitment[] = [
    { id: 'listen', text: 'I will listen to my teacher', icon: '👂' },
    { id: 'kind', text: 'I will be kind to my friends', icon: '💛' },
    { id: 'hands', text: 'I will keep my hands to myself', icon: '✋' },
    { id: 'try', text: 'I will try my best', icon: '⭐' },
    { id: 'help', text: 'I will help when I can', icon: '🤝' },
    { id: 'safe', text: 'I will make safe choices', icon: '🛡️' },
    { id: 'share', text: 'I will share and take turns', icon: '🎈' },
    { id: 'focus', text: 'I will focus on my work', icon: '🎯' }
  ];

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const settings = UnifiedDataService.getSettings();
      const behaviorCommitments = settings?.morningMeeting?.behaviorCommitments;
      const customCommitments = behaviorCommitments?.commitments || [];
      const enabled = behaviorCommitments?.enabled ?? true;

      if (enabled && customCommitments.length > 0) {
        const mappedCommitments = customCommitments.map((text: string, index: number) => ({
          id: `custom-${index}`,
          text: text.startsWith('I will') ? text : `I will ${text.toLowerCase()}`,
          icon: defaultCommitments[index % defaultCommitments.length]?.icon || '⭐'
        }));
        setCommitments(mappedCommitments);
      } else {
        setCommitments([...defaultCommitments]);
      }

      // DEBUG: Load students from multiple sources
      console.log('🎯 BehaviorStep: Loading students...');
      
      const todayKey = currentDate.toDateString();
      const attendanceData = localStorage.getItem(`attendance_${todayKey}`);
      
      let loadedStudents: Student[] = [];
      
      if (attendanceData) {
        console.log('🎯 BehaviorStep: Found attendance data');
        const attendance = JSON.parse(attendanceData);
        const presentStudents = attendance.students?.filter((s: any) => s.isPresent) || [];
        loadedStudents = presentStudents;
        console.log('🎯 BehaviorStep: Present students from attendance:', presentStudents.length);
      } else {
        console.log('🎯 BehaviorStep: No attendance data, loading all students from UDS');
        const allStudents = UnifiedDataService.getAllStudents();
        loadedStudents = allStudents.map(student => ({
          id: student.id,
          name: student.name,
          photo: student.photo
        }));
        console.log('🎯 BehaviorStep: All students from UDS:', loadedStudents.length);
      }
      
      console.log('🎯 BehaviorStep: Final students array:', loadedStudents);
      console.log('🎯 BehaviorStep: Student names:', loadedStudents.map(s => s.name));
      
      setStudents(loadedStudents);

      // Load existing choices
      const savedChoices = localStorage.getItem(`behaviorChoices_${todayKey}`);
      if (savedChoices) {
        const choices = JSON.parse(savedChoices);
        setStudentChoices(choices);
        setCompletedCount(Object.keys(choices).length);
        console.log('🎯 BehaviorStep: Loaded existing choices:', Object.keys(choices).length);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading behavior step data:', error);
      setCommitments([...defaultCommitments]);
      setIsLoading(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student.id);
  };

  const handleCommitmentSelect = (commitment: BehaviorCommitment) => {
    if (!selectedStudent) return;

    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;

    const choice: StudentChoice = {
      studentId: selectedStudent,
      studentName: student.name,
      commitmentId: commitment.id,
      commitmentText: commitment.text,
      timestamp: new Date()
    };

    const newChoices = {
      ...studentChoices,
      [selectedStudent]: choice
    };

    setStudentChoices(newChoices);
    setCompletedCount(Object.keys(newChoices).length);
    
    // Animate the card
    setAnimatingCard(selectedStudent);
    setTimeout(() => setAnimatingCard(null), 800);
    
    const todayKey = currentDate.toDateString();
    localStorage.setItem(`behaviorChoices_${todayKey}`, JSON.stringify(newChoices));
    
    setSelectedStudent(null);

    if (onStepComplete) {
      onStepComplete();
    }
  };

  // Handle removing a choice (double-tap for smartboards)
  const [tapCount, setTapCount] = useState<{[key: string]: number}>({});
  const [tapTimeout, setTapTimeout] = useState<{[key: string]: NodeJS.Timeout}>({});
  
  const handleRemoveChoice = (studentId: string) => {
    const newChoices = { ...studentChoices };
    delete newChoices[studentId];
    
    setStudentChoices(newChoices);
    setCompletedCount(Object.keys(newChoices).length);
    
    const todayKey = currentDate.toDateString();
    localStorage.setItem(`behaviorChoices_${todayKey}`, JSON.stringify(newChoices));
  };

  const handleCardTap = (student: Student, event: React.MouseEvent) => {
    const studentId = student.id;
    const hasChoice = !!getStudentChoice(studentId);
    
    if (!hasChoice) {
      // No choice - open selection modal
      handleStudentSelect(student);
      return;
    }
    
    // Has choice - check for double tap to remove
    const currentTaps = (tapCount[studentId] || 0) + 1;
    setTapCount(prev => ({ ...prev, [studentId]: currentTaps }));
    
    // Clear existing timeout
    if (tapTimeout[studentId]) {
      clearTimeout(tapTimeout[studentId]);
    }
    
    if (currentTaps === 1) {
      // First tap - set timeout to reset
      const timeout = setTimeout(() => {
        setTapCount(prev => ({ ...prev, [studentId]: 0 }));
      }, 500); // 500ms window for double tap
      setTapTimeout(prev => ({ ...prev, [studentId]: timeout }));
    } else if (currentTaps === 2) {
      // Second tap - remove choice
      handleRemoveChoice(studentId);
      setTapCount(prev => ({ ...prev, [studentId]: 0 }));
      clearTimeout(tapTimeout[studentId]);
    }
  };

  const getStudentChoice = (studentId: string): StudentChoice | null => {
    return studentChoices[studentId] || null;
  };

  // Generate random emoji for students without choices
  const getRandomEmoji = (studentId: string) => {
    const index = studentId.charCodeAt(0) % decorativeEmojis.length;
    return decorativeEmojis[index];
  };

  if (isLoading) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading behavior goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Enhanced Header with Round Progress Dial */}
      <div style={styles.headerContainer}>
        {/* LEFT: Progress Dial */}
        <div style={styles.progressSection}>
          <div style={styles.progressLabel}>Progress</div>
          <div style={{
            ...styles.progressDial,
            background: `conic-gradient(
              #4CAF50 0deg, 
              #4CAF50 ${(completedCount / Math.max(students.length, 1)) * 360}deg,
              rgba(255,255,255,0.2) ${(completedCount / Math.max(students.length, 1)) * 360}deg,
              rgba(255,255,255,0.2) 360deg
            )`
          }}>
            <div style={styles.progressCenter}>
              <div style={styles.progressNumber}>{completedCount}</div>
              <div style={styles.progressTotal}>of {students.length}</div>
            </div>
          </div>
        </div>

        {/* RIGHT: I WILL Header */}
        <div style={styles.titleSection}>
          <h1 style={styles.mainTitle}>I WILL...</h1>
          <div style={styles.subtitle}>Choose your goal for today!</div>
        </div>
      </div>

      {/* Enhanced Student Grid - Debug info */}
      <div style={styles.studentsContainer}>
        {/* DEBUG: Show student count */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1rem',
          fontSize: '1rem',
          opacity: 0.8,
          background: 'rgba(255,255,255,0.1)',
          padding: '0.5rem 1rem',
          borderRadius: '10px',
          display: 'inline-block'
        }}>
          Showing {students.length} students
        </div>
        
        <div style={styles.studentsGrid}>
          {students.length === 0 ? (
            // Show message when no students
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              border: '2px dashed rgba(255,255,255,0.3)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <h3 style={{ margin: '0 0 1rem 0' }}>No Students Found</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>
                Make sure students are added and marked present in attendance.
              </p>
            </div>
          ) : (
            students.map((student, index) => {
            const choice = getStudentChoice(student.id);
            const hasChoice = !!choice;
            const isAnimating = animatingCard === student.id;
            
              console.log(`🎯 Rendering student ${index + 1}:`, student.name);
              
              return (
              <div
                key={student.id}
                onClick={(e) => handleCardTap(student, e)}
                style={{
                  ...styles.studentCard,
                  ...(hasChoice ? styles.studentCardSelected : styles.studentCardEmpty),
                  ...(isAnimating ? styles.studentCardAnimating : {})
                }}
                className="student-card"
              >
                {/* Decorative Corner Elements */}
                {!hasChoice && (
                  <>
                    <div style={{...styles.cornerEmoji, top: '8px', left: '8px'}}>
                      {getRandomEmoji(student.id)}
                    </div>
                    <div style={{...styles.cornerEmoji, top: '8px', right: '8px'}}>
                      {getRandomEmoji(student.id + '2')}
                    </div>
                  </>
                )}

                {/* Success checkmark for completed choices */}
                {hasChoice && (
                  <div style={styles.successBadge}>
                    <div style={styles.checkmark}>✓</div>
                  </div>
                )}

                {/* Student Photo - Larger and more prominent */}
                <div style={styles.studentPhotoContainer}>
                  {student.photo ? (
                    <img 
                      src={student.photo} 
                      alt={student.name} 
                      style={styles.studentPhoto} 
                    />
                  ) : (
                    <div style={{
                      ...styles.photoPlaceholder,
                      background: hasChoice 
                        ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Student Name - Larger */}
                <div style={styles.studentName}>{student.name}</div>

                {/* Choice Display or Call to Action */}
                {hasChoice ? (
                  <div style={styles.choiceDisplay}>
                    <div style={styles.choiceText}>{choice.commitmentText}</div>
                    <div style={styles.changeHint}>Double-tap to remove</div>
                  </div>
                ) : (
                  <div style={styles.callToAction}>
                    <div style={styles.tapText}>Tap to choose</div>
                    <div style={styles.tapEmoji}>👆</div>
                  </div>
                )}
              </div>
                          );
            })
          )}
        </div>
      </div>

      {/* Enhanced Selection Modal */}
      {selectedStudent && (
        <div style={styles.modalOverlay} onClick={() => setSelectedStudent(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>
              {students.find(s => s.id === selectedStudent)?.name} says,<br/>
              <span style={styles.iWillText}>"I will..."</span>
            </h3>
            
            <div style={styles.commitmentsGrid}>
              {commitments.map((commitment) => (
                <button
                  key={commitment.id}
                  style={styles.commitmentOption}
                  onClick={() => handleCommitmentSelect(commitment)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={styles.commitmentIcon}>{commitment.icon}</div>
                  <div style={styles.commitmentText}>{commitment.text}</div>
                </button>
              ))}
            </div>
            
            <button 
              style={styles.modalClose}
              onClick={() => setSelectedStudent(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <StepNavigation navigation={{
        goNext: onNext,
        goBack: onBack,
        goHome: onHome,
        canGoBack: !!onBack,
        isLastStep: false
      }} />

      {/* Enhanced CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes cardSuccess {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); box-shadow: 0 15px 35px rgba(76, 175, 80, 0.4); }
          100% { transform: scale(1.02); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .student-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2) !important;
        }
        
        @keyframes checkmarkDraw {
          0% { stroke-dasharray: 0, 100; }
          100% { stroke-dasharray: 100, 0; }
        }
      `}</style>
    </div>
  );
};

// Enhanced Styles Object
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    padding: '2rem',
    color: 'white',
    position: 'relative',
    overflowY: 'auto',
    boxSizing: 'border-box'
  },
  
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto 3rem auto',
    padding: '0 2rem',
    gap: '3rem'
  },
  
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: '0 0 200px'
  },
  
  progressLabel: {
    marginBottom: '1rem',
    fontSize: '1.3rem',
    fontWeight: 600,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  
  progressDial: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '6px solid rgba(255,255,255,0.3)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    position: 'relative'
  },
  
  progressCenter: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)'
  },
  
  progressNumber: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: 'white',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  
  progressTotal: {
    fontSize: '0.9rem',
    opacity: 0.9,
    fontWeight: 500
  },
  
  titleSection: {
    flex: 1,
    textAlign: 'center'
  },
  
  mainTitle: {
    fontSize: '4.5rem',
    fontWeight: 800,
    margin: '0 0 0.5rem 0',
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(45deg, #FFD93D, #FF6B6B, #4ECDC4)',
    backgroundSize: '200% 200%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'float 3s ease-in-out infinite'
  },
  
  subtitle: {
    fontSize: '1.3rem',
    opacity: 0.9,
    fontWeight: 500,
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  
  studentsContainer: {
    maxWidth: '1400px',                     // ✅ Wider for 6 columns
    margin: '0 auto',
    position: 'relative',
    padding: '0 2rem'                       // ✅ Side padding
  },
  
  studentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',  // ✅ 6 columns instead of 2
    gridTemplateRows: 'repeat(2, 1fr)',     // ✅ 2 rows max
    gap: '1.5rem',                          // ✅ Slightly smaller gap
    alignContent: 'center',
    justifyContent: 'center',
    minHeight: '400px',                     // ✅ Fixed height for 2 rows
    maxHeight: '500px',                     // ✅ Prevent overflow
    width: '100%'
  },
  
  studentCard: {
    borderRadius: '20px',                   // ✅ Slightly smaller border radius
    padding: '1.5rem',                      // ✅ 10% smaller padding (was 2rem)
    textAlign: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(15px)',
    position: 'relative',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    minHeight: '160px',                     // ✅ 10% smaller (was 180px)
    maxHeight: '180px',                     // ✅ Constrain height
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid transparent',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)', // ✅ Slightly smaller shadow
    overflow: 'hidden'
  },
  
  studentCardEmpty: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    animation: 'pulse 2s ease-in-out infinite'
  },
  
  studentCardSelected: {
    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.6) 0%, rgba(56, 142, 60, 0.7) 100%)',
    border: '3px solid #4CAF50',
    boxShadow: '0 15px 35px rgba(76, 175, 80, 0.3)',
    transform: 'scale(1.02)'
  },
  
  studentCardAnimating: {
    animation: 'cardSuccess 0.8s ease-out'
  },
  
  cornerEmoji: {
    position: 'absolute',
    fontSize: '1.2rem',
    animation: 'float 2s ease-in-out infinite',
    opacity: 0.7
  },
  
  successBadge: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    background: '#4CAF50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
  },
  
  checkmark: {
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  
  studentPhotoContainer: {
    marginBottom: '1rem',                   // ✅ Smaller margin (was 1.5rem)
    position: 'relative'
  },
  
  studentPhoto: {
    width: '65px',                          // ✅ 10% smaller (was 80px)
    height: '65px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid rgba(255, 255, 255, 0.4)', // ✅ Thinner border
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'     // ✅ Smaller shadow
  },
  
  photoPlaceholder: {
    width: '65px',                          // ✅ 10% smaller (was 80px)
    height: '65px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',                     // ✅ 10% smaller (was 1.8rem)
    fontWeight: 'bold',
    color: 'white',
    border: '3px solid rgba(255, 255, 255, 0.4)', // ✅ Thinner border
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'     // ✅ Smaller shadow
  },
  
  studentName: {
    fontSize: '1.2rem',                     // ✅ 10% smaller (was 1.4rem)
    fontWeight: 600,
    marginBottom: '0.8rem',                 // ✅ Smaller margin
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    lineHeight: '1.2'
  },
  
  choiceDisplay: {
    textAlign: 'center',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  
  choiceText: {
    fontSize: '1rem',
    fontWeight: 500,
    marginBottom: '0.5rem',
    lineHeight: '1.3',
    opacity: 0.95
  },
  
  changeHint: {
    fontSize: '0.8rem',
    opacity: 0.7,
    fontStyle: 'italic'
  },
  
  callToAction: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    justifyContent: 'center'
  },
  
  tapText: {
    fontSize: '1.1rem',
    fontWeight: 500,
    opacity: 0.8
  },
  
  tapEmoji: {
    fontSize: '1.5rem',
    animation: 'float 1.5s ease-in-out infinite'
  },
  
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)'
  },
  
  modalContent: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '30px',
    padding: '3rem',
    maxWidth: '700px',
    width: '90vw',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
  },
  
  modalTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: '1.6rem',
    fontWeight: 600,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  
  iWillText: {
    fontSize: '2rem',
    fontWeight: 700,
    background: 'linear-gradient(45deg, #FFD93D, #FF6B6B)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  
  commitmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  
  commitmentOption: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: 'white',
    fontFamily: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    minHeight: '120px'
  },
  
  commitmentIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem'
  },
  
  commitmentText: {
    fontSize: '1.1rem',
    fontWeight: 500,
    lineHeight: 1.3
  },
  
  modalClose: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '15px',
    color: 'white',
    padding: '1rem 2rem',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'block',
    margin: '0 auto',
    transition: 'all 0.3s ease',
    fontWeight: 500
  },
  
  loadingSpinner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '2rem'
  },
  
  spinner: {
    width: '60px',
    height: '60px',
    border: '6px solid rgba(255, 255, 255, 0.3)',
    borderTop: '6px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  loadingText: {
    fontSize: '1.3rem',
    opacity: 0.9
  }
};

export default BehaviorStep;
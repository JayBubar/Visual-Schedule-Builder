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

  // Default behavior commitments - clean, simple
  const defaultCommitments: BehaviorCommitment[] = [
    { id: 'listen', text: 'I will listen to my teacher', icon: '👂' },
    { id: 'kind', text: 'I will be kind to my friends', icon: '💝' },
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
      
      // Load settings from UnifiedDataService
      const settings = UnifiedDataService.getSettings();
      console.log('🎯 BehaviorStep: Loading settings...', settings);
      
      // Get behavior commitments - use custom if available, otherwise defaults
      const behaviorCommitments = settings?.behaviorCommitments;
      console.log('🎯 BehaviorStep: Behavior commitments found:', behaviorCommitments);

      const customCommitments = behaviorCommitments?.goals || [];
      const enabled = behaviorCommitments?.enabled ?? true;

      console.log('🎯 BehaviorStep: Using commitments:', customCommitments);
      console.log('🎯 BehaviorStep: Enabled:', enabled);

      if (enabled && customCommitments.length > 0) {
        // Use custom commitments from hub
        const mappedCommitments = customCommitments.map((text: string, index: number) => ({
          id: `custom-${index}`,
          text: text.startsWith('I will') ? text : `I will ${text.toLowerCase()}`,
          icon: defaultCommitments[index % defaultCommitments.length]?.icon || '⭐'
        }));
        setCommitments(mappedCommitments);
      } else {
        // Use defaults
        setCommitments([...defaultCommitments]);
      }

      // Load students from attendance
      const todayKey = currentDate.toDateString();
      const attendanceData = localStorage.getItem(`attendance_${todayKey}`);
      
      if (attendanceData) {
        const attendance = JSON.parse(attendanceData);
        const presentStudents = attendance.students?.filter((s: any) => s.isPresent) || [];
        setStudents(presentStudents);
      } else {
        // Fallback to all students if no attendance data
        const allStudents = UnifiedDataService.getAllStudents();
        setStudents(allStudents);
      }

      // Load any existing choices for today
      const savedChoices = localStorage.getItem(`behaviorChoices_${todayKey}`);
      if (savedChoices) {
        const choices = JSON.parse(savedChoices);
        setStudentChoices(choices);
        setCompletedCount(Object.keys(choices).length);
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
    
    // Save to localStorage
    const todayKey = currentDate.toDateString();
    localStorage.setItem(`behaviorChoices_${todayKey}`, JSON.stringify(newChoices));
    
    // Close selection modal
    setSelectedStudent(null);

    // Mark step complete if we want
    if (onStepComplete) {
      onStepComplete();
    }
  };

  const handleNext = () => {
    // Save all choices before proceeding
    const todayKey = currentDate.toDateString();
    localStorage.setItem(`behaviorChoices_${todayKey}`, JSON.stringify(studentChoices));
    
    onNext();
  };

  const getStudentChoice = (studentId: string): StudentChoice | null => {
    return studentChoices[studentId] || null;
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
      <div style={styles.stepHeader}>
        <h1 style={styles.stepTitle}>🎯 Choose Your Behavior Goals</h1>
        <p style={styles.stepSubtitle}>Each student picks one goal to focus on today!</p>
      </div>

      <div style={styles.behaviorContent}>
        {/* Progress indicator */}
        <div style={styles.progressIndicator}>
          <h3 style={styles.progressTitle}>📊 Progress: {completedCount} of {students.length} students</h3>
          <div style={styles.progressBar}>
            <div 
              style={{ 
                ...styles.progressFill,
                width: `${(completedCount / Math.max(students.length, 1)) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Student Grid */}
        <div style={styles.studentsGrid}>
          {students.map((student) => {
            const choice = getStudentChoice(student.id);
            return (
              <button
                key={student.id}
                style={choice ? styles.studentCardCompleted : styles.studentCard}
                onClick={() => handleStudentSelect(student)}
              >
                <div style={styles.studentPhoto}>
                  {student.photo ? (
                    <img src={student.photo} alt={student.name} style={styles.studentPhotoImg} />
                  ) : (
                    <div style={styles.photoPlaceholder}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={styles.studentName}>{student.name}</div>
                {choice && (
                  <div style={styles.studentChoice}>
                    <div style={styles.choiceIcon}>✅</div>
                    <div style={styles.choiceText}>{choice.commitmentText}</div>
                  </div>
                )}
                {!choice && (
                  <div style={styles.pendingIndicator}>
                    Tap to choose goal
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selection Modal */}
        {selectedStudent && (
          <div style={styles.modalOverlay} onClick={() => setSelectedStudent(null)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3 style={styles.modalTitle}>
                🎯 Choose a goal for {students.find(s => s.id === selectedStudent)?.name}
              </h3>
              
              <div style={styles.commitmentsGrid}>
                {commitments.map((commitment) => (
                  <button
                    key={commitment.id}
                    style={styles.commitmentOption}
                    onClick={() => handleCommitmentSelect(commitment)}
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
      </div>

      {/* Standardized Navigation */}
      <StepNavigation navigation={{
        goNext: onNext,
        goBack: onBack,
        goHome: onHome,
        canGoBack: !!onBack,
        isLastStep: false
      }} />

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Inline styles object
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    padding: '2rem',
    color: 'white',
    position: 'relative',
    overflowY: 'auto',
    maxHeight: '100vh',
    boxSizing: 'border-box'
  },
  stepHeader: {
    textAlign: 'center',
    marginBottom: '3rem',
    position: 'relative',
    zIndex: 1
  },
  stepTitle: {
    fontSize: '3.5rem',
    marginBottom: '1rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    fontWeight: 700
  },
  stepSubtitle: {
    fontSize: '1.5rem',
    opacity: 0.9,
    margin: 0
  },
  behaviorContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  progressIndicator: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '2rem',
    marginBottom: '3rem',
    textAlign: 'center'
  },
  progressTitle: {
    marginBottom: '1rem',
    color: 'white',
    fontSize: '1.5rem'
  },
  progressBar: {
    width: '100%',
    height: '20px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    transition: 'width 0.5s ease',
    borderRadius: '10px'
  },
  studentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1rem' // Reduced margin to prevent overlap with navigation
  },
  studentCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    padding: '1.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    color: 'white'
  },
  studentCardCompleted: {
    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    backdropFilter: 'blur(10px)',
    border: '2px solid #4CAF50',
    borderRadius: '20px',
    padding: '1.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    color: 'white',
    transform: 'scale(1.02)'
  },
  studentPhoto: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    overflow: 'hidden',
    marginBottom: '1rem',
    border: '3px solid rgba(255, 255, 255, 0.3)'
  },
  studentPhotoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white'
  },
  studentName: {
    fontSize: '1.2rem',
    fontWeight: 600,
    marginBottom: '0.5rem'
  },
  studentChoice: {
    textAlign: 'center'
  },
  choiceIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem'
  },
  choiceText: {
    fontSize: '0.9rem',
    opacity: 0.9,
    lineHeight: 1.3
  },
  pendingIndicator: {
    fontSize: '0.9rem',
    opacity: 0.7,
    fontStyle: 'italic'
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
    zIndex: 1000
  },
  modalContent: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '3rem',
    maxWidth: '600px',
    width: '90vw',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  },
  modalTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: '1.5rem'
  },
  commitmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  commitmentOption: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '15px',
    padding: '1.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: 'white',
    fontFamily: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  commitmentIcon: {
    fontSize: '2rem'
  },
  commitmentText: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.3
  },
  modalClose: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    color: 'white',
    padding: '1rem 2rem',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'block',
    margin: '0 auto',
    transition: 'all 0.3s ease'
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

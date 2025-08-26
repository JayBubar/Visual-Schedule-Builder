import React, { useState, useEffect } from 'react';
import UnifiedDataService from '../../../services/unifiedDataService';
import StepNavigation from '../common/StepNavigation';
import './BehaviorStep.css';

interface BehaviorStepProps {
  onNext: () => void;
  onBack: () => void;
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

const BehaviorStep: React.FC<BehaviorStepProps> = ({ onNext, onBack, onStepComplete, currentDate }) => {
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
      const hubSettings = settings?.morningMeeting?.hubSettings;
      
      // Get behavior commitments - use custom if available, otherwise defaults
      const customCommitments = hubSettings?.behaviorCommitments?.commitments || [];
      const enabled = hubSettings?.behaviorCommitments?.enabled ?? true;

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
      <div className="step-container behavior-step">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading behavior goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="step-container behavior-step">
      <div className="step-header">
        <h1>🎯 Choose Your Behavior Goals</h1>
        <p className="step-subtitle">Each student picks one goal to focus on today!</p>
      </div>

      <div className="behavior-content">
        {/* Progress indicator */}
        <div className="progress-indicator">
          <h3>📊 Progress: {completedCount} of {students.length} students</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(completedCount / Math.max(students.length, 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Student Grid */}
        <div className="students-grid">
          {students.map((student) => {
            const choice = getStudentChoice(student.id);
            return (
              <button
                key={student.id}
                className={`student-card ${choice ? 'completed' : 'pending'}`}
                onClick={() => handleStudentSelect(student)}
              >
                <div className="student-photo">
                  {student.photo ? (
                    <img src={student.photo} alt={student.name} />
                  ) : (
                    <div className="photo-placeholder">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="student-name">{student.name}</div>
                {choice && (
                  <div className="student-choice">
                    <div className="choice-icon">✅</div>
                    <div className="choice-text">{choice.commitmentText}</div>
                  </div>
                )}
                {!choice && (
                  <div className="pending-indicator">
                    Tap to choose goal
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selection Modal */}
        {selectedStudent && (
          <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>
                🎯 Choose a goal for {students.find(s => s.id === selectedStudent)?.name}
              </h3>
              
              <div className="commitments-grid">
                {commitments.map((commitment) => (
                  <button
                    key={commitment.id}
                    className="commitment-option"
                    onClick={() => handleCommitmentSelect(commitment)}
                  >
                    <div className="commitment-icon">{commitment.icon}</div>
                    <div className="commitment-text">{commitment.text}</div>
                  </button>
                ))}
              </div>
              
              <button 
                className="modal-close"
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
        canGoBack: !!onBack,
        isLastStep: false
      }} />
    </div>
  );
};

export default BehaviorStep;

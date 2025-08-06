// 🚀 SESSION 8: ENHANCED INDEPENDENT CHOICES - ACTIVITY LIBRARY INTEGRATION
// File: src/renderer/components/calendar/IndependentChoices.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { ActivityLibraryItem, Student, Staff, ChoiceFilter } from '../../types';
import UnifiedDataService from '../../services/unifiedDataService';
import ChoiceDataManager, { StudentChoice } from '../../utils/choiceDataManager';

// 🎨 GLASSMORPHISM STYLES FOR IndependentChoices
const styles = `
/* Main container with gradient background */
.independent-choices-container {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.1) 0%, 
    rgba(139, 92, 246, 0.1) 25%, 
    rgba(59, 130, 246, 0.1) 50%, 
    rgba(16, 185, 129, 0.1) 75%, 
    rgba(245, 158, 11, 0.1) 100%);
  backdrop-filter: blur(20px);
  padding: 1.5rem;
}

/* Glassmorphism panel base style */
.glass-panel {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 1rem !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

/* Header glass panel */
.header-glass {
  background: rgba(255, 255, 255, 0.25) !important;
  backdrop-filter: blur(25px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 1rem !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  padding: 2rem !important;
  margin-bottom: 2rem !important;
}

/* Statistics cards with glassmorphism */
.stats-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
  gap: 1rem !important;
  margin-bottom: 2rem !important;
}

.stat-card {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  border-radius: 1rem !important;
  padding: 1.5rem !important;
  text-align: center !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

/* Activity cards with enhanced glassmorphism */
.activity-card {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(20px) !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 1rem !important;
  padding: 1.5rem !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  position: relative !important;
  overflow: hidden !important;
}

.activity-card::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: -100% !important;
  width: 100% !important;
  height: 100% !important;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent) !important;
  transition: left 0.5s !important;
}

.activity-card:hover::before {
  left: 100% !important;
}

.activity-card:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  transform: translateY(-6px) scale(1.02) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2) !important;
}

.activity-card.selected {
  background: rgba(59, 130, 246, 0.3) !important;
  border-color: rgba(59, 130, 246, 0.6) !important;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.4) !important;
  animation: pulseGlow 2s infinite !important;
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
}

/* Student cards with glassmorphism */
.student-card {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(20px) !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 1rem !important;
  padding: 1rem !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  display: flex !important;
  align-items: center !important;
  gap: 1rem !important;
  min-height: 80px !important;
}

/* Student avatar styling */
.student-avatar {
  width: 50px !important;
  height: 50px !important;
  border-radius: 50% !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.student-avatar img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

.student-avatar-initials {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: bold !important;
  color: white !important;
  font-size: 1rem !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}

.student-info {
  flex: 1 !important;
  min-width: 0 !important;
}

.student-name {
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
  margin-bottom: 0.25rem !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.student-status {
  font-size: 0.875rem !important;
  color: rgba(255, 255, 255, 0.8) !important;
  line-height: 1.3 !important;
}

.student-card:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15) !important;
}

.student-card.assigned {
  background: rgba(34, 197, 94, 0.25) !important;
  border-color: rgba(34, 197, 94, 0.5) !important;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.2) !important;
}

.student-card.selectable {
  background: rgba(59, 130, 246, 0.25) !important;
  border-color: rgba(59, 130, 246, 0.5) !important;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2) !important;
  animation: breathe 2s infinite !important;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.student-card.unassigned {
  background: rgba(239, 68, 68, 0.2) !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15) !important;
}

/* Student grid layout */
.students-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
  gap: 1rem !important;
  margin: 1rem 0 !important;
}

/* Timer with advanced glassmorphism */
.timer-glass {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(25px) !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 1.5rem !important;
  padding: 2rem !important;
  text-align: center !important;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.15) !important;
}

.timer-circle {
  width: 140px !important;
  height: 140px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 auto 1.5rem !important;
  color: white !important;
  font-size: 2rem !important;
  font-weight: bold !important;
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.3) !important;
  position: relative !important;
}

.timer-circle::before {
  content: '' !important;
  position: absolute !important;
  inset: -4px !important;
  border-radius: 50% !important;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6) !important;
  z-index: -1 !important;
  animation: spin 3s linear infinite !important;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Control buttons matching Daily Highlights style */
.control-button {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(20px) !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 1rem !important;
  padding: 1rem 2rem !important;
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  position: relative !important;
  overflow: hidden !important;
}

.control-button::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: -100% !important;
  width: 100% !important;
  height: 100% !important;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent) !important;
  transition: left 0.5s !important;
}

.control-button:hover::before {
  left: 100% !important;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: translateY(-4px) scale(1.02) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2) !important;
}

.control-button.primary {
  background: rgba(16, 185, 129, 0.25) !important;
  border-color: rgba(16, 185, 129, 0.5) !important;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.2) !important;
}

.control-button.primary:hover {
  background: rgba(16, 185, 129, 0.35) !important;
  border-color: rgba(16, 185, 129, 0.7) !important;
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.3) !important;
}

.control-button.secondary {
  background: rgba(245, 158, 11, 0.25) !important;
  border-color: rgba(245, 158, 11, 0.5) !important;
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.2) !important;
}

.control-button.secondary:hover {
  background: rgba(245, 158, 11, 0.35) !important;
  border-color: rgba(245, 158, 11, 0.7) !important;
  box-shadow: 0 12px 40px rgba(245, 158, 11, 0.3) !important;
}

.control-button.danger {
  background: rgba(239, 68, 68, 0.25) !important;
  border-color: rgba(239, 68, 68, 0.5) !important;
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.2) !important;
}

.control-button.danger:hover {
  background: rgba(239, 68, 68, 0.35) !important;
  border-color: rgba(239, 68, 68, 0.7) !important;
  box-shadow: 0 12px 40px rgba(239, 68, 68, 0.3) !important;
}

/* Glass buttons for modal */
.glass-button {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 0.75rem !important;
  padding: 0.75rem 1.5rem !important;
  color: white !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.glass-button.primary {
  background: rgba(16, 185, 129, 0.3) !important;
  border-color: rgba(16, 185, 129, 0.5) !important;
}

.glass-button.secondary {
  background: rgba(245, 158, 11, 0.3) !important;
  border-color: rgba(245, 158, 11, 0.5) !important;
}

.glass-button.danger {
  background: rgba(239, 68, 68, 0.3) !important;
  border-color: rgba(239, 68, 68, 0.5) !important;
}

/* Progress bar with glassmorphism */
.progress-glass {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 1rem !important;
  height: 1rem !important;
  overflow: hidden !important;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.progress-fill {
  background: linear-gradient(90deg, #10b981, #3b82f6) !important;
  height: 100% !important;
  border-radius: 1rem !important;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5) !important;
}

/* Activities grid - 3 columns with better spacing */
.activities-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 1.5rem !important;
  margin-bottom: 2rem !important;
}

/* Enhanced activity cards */
.activity-card {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(20px) !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 1rem !important;
  padding: 2rem 1.5rem !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  position: relative !important;
  overflow: hidden !important;
  min-height: 200px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  text-align: center !important;
}

.activity-emoji {
  font-size: 3.5rem !important;
  margin-bottom: 1rem !important;
  display: block !important;
}

.activity-name {
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  margin-bottom: 0.75rem !important;
  line-height: 1.3 !important;
}

.activity-capacity {
  font-size: 0.9rem !important;
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 500 !important;
  margin-bottom: 1rem !important;
  padding: 0.5rem 1rem !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 0.5rem !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

/* Main content grid for active rotation */
.main-content-grid {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 2rem !important;
  margin-bottom: 2rem !important;
}

/* Timer controls styling */
.timer-controls {
  display: flex !important;
  justify-content: center !important;
  gap: 1.5rem !important;
  margin-top: 1.5rem !important;
  flex-wrap: wrap !important;
}

.timer-section {
  text-align: center !important;
  margin-bottom: 2rem !important;
}

/* Section headers */
.section-header {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  margin-bottom: 1.5rem !important;
}

/* Header styling to match Daily Highlights */
.header-section {
  text-align: center !important;
  margin-bottom: 2rem !important;
}

.header-title {
  font-size: 3rem !important;
  font-weight: 800 !important;
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
  margin-bottom: 0.5rem !important;
}

.header-subtitle {
  font-size: 1.25rem !important;
  color: rgba(255, 255, 255, 0.8) !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

/* Progress container styling */
.progress-container {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 1rem !important;
  padding: 1.5rem !important;
  margin-bottom: 2rem !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 1rem !important;
  height: 1rem !important;
  overflow: hidden !important;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Text styling */
.text-primary {
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 700 !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.text-secondary {
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 500 !important;
}

.text-muted {
  color: rgba(255, 255, 255, 0.6) !important;
}

/* Additional responsive grids for active rotation */
.students-responsive-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
  gap: 0.75rem !important;
}

.assigned-students-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
  gap: 0.5rem !important;
  max-height: 300px !important;
  overflow-y: auto !important;
}

/* Responsive design */
@media (max-width: 1024px) {
  .main-content-grid {
    grid-template-columns: 1fr !important;
    gap: 1.5rem !important;
  }
  
  .activities-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  .students-responsive-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
  }
  
  .assigned-students-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr !important;
  }
  
  .timer-controls {
    flex-direction: column !important;
    align-items: center !important;
  }
  
  .control-button {
    width: 100% !important;
    max-width: 300px !important;
  }
  
  .activities-grid {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 640px) {
  .independent-choices-container {
    padding: 0.75rem !important;
  }
  
  .header-title {
    font-size: 2rem !important;
  }
  
  .header-subtitle {
    font-size: 1.1rem !important;
  }
  
  .glass-panel {
    padding: 1rem !important;
  }
  
  .students-responsive-grid {
    grid-template-columns: 1fr !important;
  }
  
  .assigned-students-grid {
    grid-template-columns: 1fr !important;
  }
  
  .activity-card {
    padding: 1.5rem 1rem !important;
    min-height: 150px !important;
  }
  
  .activity-emoji {
    font-size: 2.5rem !important;
  }
}

/* Text styles for glassmorphism */
.glass-text-primary {
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 700 !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.glass-text-secondary {
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 500 !important;
}

.glass-text-muted {
  color: rgba(255, 255, 255, 0.6) !important;
}
`;

interface StudentAssignment {
  studentId: string;
  studentName: string;
  studentPhoto?: string;
  activityId: string;
  activityName: string;
  activityEmoji: string;
  assignedAt: string;
  rotationNumber: number;
}

interface ChoiceRotation {
  id: string;
  rotationNumber: number;
  duration: number; // minutes
  assignments: StudentAssignment[];
  startTime?: string;
  isActive: boolean;
  isCompleted: boolean;
}

interface IndependentChoicesProps {
  onClose?: () => void;
  selectedDate?: string;
}

const IndependentChoices: React.FC<IndependentChoicesProps> = ({ onClose, selectedDate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [choiceEligibleActivities, setChoiceEligibleActivities] = useState<ActivityLibraryItem[]>([]);
  const [currentRotation, setCurrentRotation] = useState<ChoiceRotation | null>(null);
  const [rotationHistory, setRotationHistory] = useState<ChoiceRotation[]>([]);
  const [timerMinutes, setTimerMinutes] = useState(20);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLibraryItem | null>(null);
  const [choiceFilter, setChoiceFilter] = useState<ChoiceFilter>({});
  const [showActivityLibrary, setShowActivityLibrary] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  // Load data on component mount
  useEffect(() => {
    loadStudents();
    loadChoiceEligibleActivities();
    loadRotationHistory();
    loadAnalytics();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleRotationComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  // 🎯 Load students from UnifiedDataService
  const loadStudents = () => {
    try {
      const unifiedStudents = UnifiedDataService.getAllStudents();
      // Convert UnifiedStudent to Student format for compatibility
      const convertedStudents: Student[] = unifiedStudents.map(student => ({
        id: student.id,
        name: student.name,
        grade: student.grade,
        photo: student.photo,
        accommodations: student.accommodations || [],
        goals: student.goals || [],
        preferredPartners: student.preferredPartners || [],
        avoidPartners: student.avoidPartners || [],
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        isActive: student.isActive !== false,
        behaviorNotes: student.behaviorNotes,
        medicalNotes: student.medicalNotes,
        workingStyle: (student.workingStyle as "independent" | "collaborative" | "guided" | "needs-support") || "independent"
      }));
      setStudents(convertedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    }
  };

  // 🎯 Load choice-eligible activities from UnifiedDataService
  const loadChoiceEligibleActivities = () => {
    try {
      const allActivities = UnifiedDataService.getAllActivities();
      // Convert UnifiedActivity to ActivityLibraryItem format for compatibility
      const convertedActivities: ActivityLibraryItem[] = allActivities
        .filter(activity => (activity as any).choiceEligible === true) // Only get choice-eligible activities
        .map(activity => ({
          id: activity.id,
          name: activity.name,
          description: activity.description || '',
          emoji: (activity as any).icon || '📝', // Use icon from activity or default
          defaultDuration: activity.duration || 20,
          category: activity.category as any,
          materials: activity.materials || [],
          instructions: activity.instructions || '',
          isChoiceEligible: true, // These are all choice-eligible
          choiceProperties: {
            maxStudents: 4, // Default max students
            requiresSupervision: true,
            isIndoor: true,
            setupTime: 2,
            cleanupTime: 3,
            skillLevel: 'all',
            staffSupervision: 'minimal',
            socialInteraction: 'small-group',
            quietActivity: (activity as any).tags?.includes('quiet') || false,
            messyActivity: (activity as any).tags?.includes('messy') || false,
            preparationTime: 5
          },
          usageStats: {
            timesChosen: 0,
            lastUsed: undefined,
            averageRating: undefined
          },
          tags: (activity as any).tags || [],
          difficulty: 'medium' as const,
          ageGroup: 'all' as const,
          createdAt: activity.dateCreated,
          updatedAt: activity.dateCreated,
          isCustom: activity.isCustom
        }));
      
      setChoiceEligibleActivities(convertedActivities);
      console.log(`🎯 Loaded ${convertedActivities.length} choice-eligible activities`);
    } catch (error) {
      console.error('Error loading activities:', error);
      setChoiceEligibleActivities([]);
    }
  };

  // 🎯 Load rotation history
  const loadRotationHistory = () => {
    const saved = localStorage.getItem('choiceRotationHistory');
    if (saved) {
      setRotationHistory(JSON.parse(saved));
    }
  };

  // 🎯 Load choice analytics
  const loadAnalytics = () => {
    const saved = localStorage.getItem('choiceAnalytics');
    if (saved) {
      setAnalytics(JSON.parse(saved));
    }
  };

  // 🎯 Save rotation history
  const saveRotationHistory = (history: ChoiceRotation[]) => {
    setRotationHistory(history);
    localStorage.setItem('choiceRotationHistory', JSON.stringify(history));
  };

  // 🎯 Filter activities based on current criteria
  const filteredActivities = useMemo(() => {
    return choiceEligibleActivities.filter(activity => {
      if (choiceFilter.maxStudents && activity.choiceProperties?.maxStudents && 
          activity.choiceProperties.maxStudents < choiceFilter.maxStudents) {
        return false;
      }
      
      if (choiceFilter.quietActivity && !activity.choiceProperties?.quietActivity) {
        return false;
      }
      
      if (choiceFilter.skillLevel?.length && activity.choiceProperties?.skillLevel &&
          !choiceFilter.skillLevel.includes(activity.choiceProperties.skillLevel)) {
        return false;
      }

      return true;
    });
  }, [choiceEligibleActivities, choiceFilter]);

  // 🎯 Get available activities (not at capacity)
  const getAvailableActivities = () => {
    if (!currentRotation) return filteredActivities;
    
    return filteredActivities.filter(activity => {
      const currentAssignments = currentRotation.assignments.filter(a => a.activityId === activity.id);
      const maxStudents = activity.choiceProperties?.maxStudents || 6;
      return currentAssignments.length < maxStudents;
    });
  };

  // 🎯 Get unassigned students
  const getUnassignedStudents = () => {
    if (!currentRotation) return students;
    
    const assignedStudentIds = currentRotation.assignments.map(a => a.studentId);
    return students.filter(student => !assignedStudentIds.includes(student.id));
  };

  // 🎯 Create new rotation
  const createNewRotation = () => {
    if (choiceEligibleActivities.length === 0) {
      alert('No choice-eligible activities available. Please mark activities as choice-eligible in the Activity Library.');
      return;
    }

    const newRotation: ChoiceRotation = {
      id: `rotation-${Date.now()}`,
      rotationNumber: rotationHistory.length + 1,
      duration: timerMinutes,
      assignments: [],
      isActive: true,
      isCompleted: false
    };
    
    setCurrentRotation(newRotation);
    setTimeRemaining(timerMinutes * 60);
  };

  // 📝 Helper function to format student names (Last, First → First Last)
  const formatStudentName = (name: string): string => {
    if (name.includes(', ')) {
      const [last, first] = name.split(', ');
      return `${first.trim()} ${last.trim()}`;
    }
    return name;
  };

  // 🎯 Assign student to activity
  const assignStudentToActivity = (student: Student, activity: ActivityLibraryItem) => {
    if (!currentRotation) return;

    // Check if activity is at capacity
    const currentAssignments = currentRotation.assignments.filter(a => a.activityId === activity.id);
    const maxStudents = activity.choiceProperties?.maxStudents || 6;
    
    if (currentAssignments.length >= maxStudents) {
      alert(`${activity.name} is at capacity (${maxStudents} students)`);
      return;
    }

    // Check if student is already assigned
    const existingAssignment = currentRotation.assignments.find(a => a.studentId === student.id);
    let updatedRotation;
    
    if (existingAssignment) {
      // Update existing assignment
      const updatedAssignments = currentRotation.assignments.map(assignment =>
        assignment.studentId === student.id
          ? {
              ...assignment,
              activityId: activity.id,
              activityName: activity.name,
              activityEmoji: activity.emoji,
              assignedAt: new Date().toISOString()
            }
          : assignment
      );
      
      updatedRotation = {
        ...currentRotation,
        assignments: updatedAssignments
      };
    } else {
      // Create new assignment
      const newAssignment: StudentAssignment = {
        studentId: student.id,
        studentName: formatStudentName(student.name),
        studentPhoto: student.photo,
        activityId: activity.id,
        activityName: activity.name,
        activityEmoji: activity.emoji,
        assignedAt: new Date().toISOString(),
        rotationNumber: currentRotation.rotationNumber
      };

      updatedRotation = {
        ...currentRotation,
        assignments: [...currentRotation.assignments, newAssignment]
      };
    }

    setCurrentRotation(updatedRotation);

    // 🎯 REAL-TIME SYNC: Update ChoiceDataManager immediately
    const choiceDataManager = ChoiceDataManager.getInstance();
    const studentChoices: StudentChoice[] = updatedRotation.assignments.map(assignment => ({
      studentId: assignment.studentId,
      studentName: assignment.studentName,
      activityId: assignment.activityId,
      activityName: assignment.activityName,
      activityIcon: assignment.activityEmoji,
      assignedAt: assignment.assignedAt,
      rotationNumber: assignment.rotationNumber
    }));
    
    choiceDataManager.saveTodayChoices(studentChoices);
    console.log(`🎯 Real-time sync: Updated choice data with ${studentChoices.length} assignments`);

    // Update usage analytics
    updateActivityUsage(activity.id);
  };

  // 🎯 Update activity usage statistics
  const updateActivityUsage = (activityId: string) => {
    const savedActivities = localStorage.getItem('activityLibrary');
    if (savedActivities) {
      const activities: ActivityLibraryItem[] = JSON.parse(savedActivities);
      const updatedActivities = activities.map(activity => {
        if (activity.id === activityId) {
          return {
            ...activity,
            usageStats: {
              ...activity.usageStats,
              timesUsed: (activity.usageStats?.timesUsed || 0) + 1,
              lastUsed: new Date().toISOString()
            }
          };
        }
        return activity;
      });
      
      localStorage.setItem('activityLibrary', JSON.stringify(updatedActivities));
      loadChoiceEligibleActivities(); // Refresh local state
    }
  };

  // 🎯 Remove student assignment
  const removeStudentAssignment = (studentId: string) => {
    if (!currentRotation) return;
    
    const updatedAssignments = currentRotation.assignments.filter(a => a.studentId !== studentId);
    setCurrentRotation({
      ...currentRotation,
      assignments: updatedAssignments
    });
  };

  // 🎯 Start timer
  const startTimer = () => {
    if (!currentRotation) return;
    
    setIsTimerRunning(true);
    setCurrentRotation({
      ...currentRotation,
      startTime: new Date().toISOString()
    });
  };

  // 🎯 Stop timer
  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  // 🎯 Reset timer
  const resetTimer = () => {
    setTimeRemaining(timerMinutes * 60);
    setIsTimerRunning(false);
  };

  // 🎯 Handle rotation completion
  const handleRotationComplete = () => {
    if (!currentRotation) return;

    const completedRotation = {
      ...currentRotation,
      isActive: false,
      isCompleted: true
    };

    // Save to history
    const updatedHistory = [...rotationHistory, completedRotation];
    saveRotationHistory(updatedHistory);

    // 🎯 NEW: Sync with ChoiceDataManager for SmartboardDisplay integration
    const choiceDataManager = ChoiceDataManager.getInstance();
    const studentChoices: StudentChoice[] = completedRotation.assignments.map(assignment => ({
      studentId: assignment.studentId,
      studentName: assignment.studentName,
      activityId: assignment.activityId,
      activityName: assignment.activityName,
      activityIcon: assignment.activityEmoji,
      assignedAt: assignment.assignedAt,
      rotationNumber: assignment.rotationNumber
    }));
    
    choiceDataManager.saveTodayChoices(studentChoices);
    console.log(`🎯 Synced ${studentChoices.length} choice assignments to ChoiceDataManager`);

    // Reset current rotation
    setCurrentRotation(null);
    setTimeRemaining(0);

    // Show completion celebration
    alert(`🎉 Choice Time Complete! Rotation #${completedRotation.rotationNumber} finished.\n\n✅ Student assignments saved for "Choice Item Time" activities.`);
  };

  // 🎯 Auto-assign students to activities
  const autoAssignStudents = () => {
    if (!currentRotation) return;

    const unassigned = getUnassignedStudents();
    const available = getAvailableActivities();

    if (unassigned.length === 0 || available.length === 0) return;

    const newAssignments: StudentAssignment[] = [];
    let activityIndex = 0;

    for (const student of unassigned) {
      const activity = available[activityIndex % available.length];
      
      // Check capacity
      const assignmentsForActivity = [
        ...currentRotation.assignments.filter(a => a.activityId === activity.id),
        ...newAssignments.filter(a => a.activityId === activity.id)
      ];
      
      const maxStudents = activity.choiceProperties?.maxStudents || 6;
      
      if (assignmentsForActivity.length < maxStudents) {
        newAssignments.push({
          studentId: student.id,
          studentName: formatStudentName(student.name),
          studentPhoto: student.photo,
          activityId: activity.id,
          activityName: activity.name,
          activityEmoji: activity.emoji,
          assignedAt: new Date().toISOString(),
          rotationNumber: currentRotation.rotationNumber
        });
      }
      
      activityIndex++;
    }

    setCurrentRotation({
      ...currentRotation,
      assignments: [...currentRotation.assignments, ...newAssignments]
    });
  };

  // 🎯 Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 🎯 Get activity assignment count
  const getActivityAssignmentCount = (activityId: string) => {
    if (!currentRotation) return 0;
    return currentRotation.assignments.filter(a => a.activityId === activityId).length;
  };

  // 🎯 Helper functions for student assignment interface
  const getCurrentAssignment = (studentId: string) => {
    return currentRotation?.assignments.find(a => a.studentId === studentId);
  };

  const handleStudentAssignment = (studentId: string, activityId: string) => {
    if (!currentRotation || !activityId) return;
    
    setCurrentRotation(prev => {
      if (!prev) return prev;
      
      const newAssignments = prev.assignments.filter(a => a.studentId !== studentId);
      if (activityId) {
        const activity = choiceEligibleActivities.find(a => a.id === activityId);
        if (activity) {
          const student = students.find(s => s.id === studentId);
          if (student) {
            newAssignments.push({
              studentId,
              studentName: formatStudentName(student.name),
              studentPhoto: student.photo,
              activityId,
              activityName: activity.name,
              activityEmoji: activity.emoji,
              assignedAt: new Date().toISOString(),
              rotationNumber: prev.rotationNumber
            });
          }
        }
      }
      
      return {
        ...prev,
        assignments: newAssignments
      };
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="independent-choices-container">
      
      {/* Header matching Daily Highlights */}
      <div className="header-section">
        <h3 className="header-title">
          🎯 Independent Choices
        </h3>
      </div>

      {/* No Current Rotation */}
      {!currentRotation && (
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Ready to Start Choice Time!</h2>
          <p className="text-gray-600 mb-6">
            {choiceEligibleActivities.length} choice-eligible activities are ready for students.
          </p>
          
          <div className="max-w-md mx-auto mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choice Time Duration
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="45"
                step="5"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-medium text-gray-700 w-16">
                {timerMinutes} min
              </span>
            </div>
          </div>

          <button
            onClick={createNewRotation}
            className="control-button primary"
            style={{ fontSize: '1.2rem', padding: '1.5rem 3rem' }}
          >
            🚀 Start Choice Time
          </button>

          {choiceEligibleActivities.length === 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                ⚠️ No choice-eligible activities found. Please visit the Activity Library and mark activities as choice-eligible.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Active Rotation */}
      {currentRotation && (
        <div>
          {/* Timer and Controls */}
          <div className="timer-section">
            <h4 className="section-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              ⏱️ Choice Rotation #{currentRotation.rotationNumber}
            </h4>
              
            {/* Timer Display */}
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white mb-4">
              <span className="text-3xl font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>

            {/* Timer Controls */}
            <div className="timer-controls">
              {!isTimerRunning ? (
                <button
                  onClick={startTimer}
                  className="control-button primary"
                >
                  ▶️ Start Timer
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  className="control-button danger"
                >
                  ⏸️ Pause Timer
                </button>
              )}
              
              <button
                onClick={resetTimer}
                className="control-button"
              >
                🔄 Reset
              </button>
              
              <button
                onClick={handleRotationComplete}
                className="control-button secondary"
              >
                ✅ Complete
              </button>
            </div>
          </div>

          {/* Assignment Progress */}
          <div className="progress-container">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span className="text-primary" style={{ fontSize: '1.1rem', fontWeight: '600' }}>Assignment Progress</span>
              <span className="text-secondary">
                {currentRotation.assignments.length} / {students.length} students assigned
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${students.length > 0 ? (currentRotation.assignments.length / students.length) * 100 : 0}%` 
                }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <button
              onClick={autoAssignStudents}
              className="control-button secondary"
              disabled={getUnassignedStudents().length === 0}
            >
              🎲 Auto-Assign Remaining
            </button>
          </div>

          {/* Main Assignment Interface - 2 columns like Daily Highlights */}
          <div className="main-content-grid">
            {/* Available Activities */}
            <div className="glass-panel">
              <h4 className="section-header">
                📚 Available Activities ({filteredActivities.length})
              </h4>
              
              <div className="activities-grid">
                {filteredActivities.map(activity => (
                  <div
                    key={activity.id}
                    className={`activity-card ${
                      selectedActivity?.id === activity.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedActivity(
                      selectedActivity?.id === activity.id ? null : activity
                    )}
                  >
                    <div className="activity-emoji">{activity.emoji}</div>
                    <div className="activity-name">{activity.name}</div>
                    <div className="activity-capacity">
                      {getActivityAssignmentCount(activity.id)} / {activity.choiceProperties?.maxStudents || 6} students
                    </div>

                    {/* Activity Properties */}
                    {activity.choiceProperties && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(34, 197, 94, 0.2)',
                          color: 'rgba(34, 197, 94, 0.9)',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(34, 197, 94, 0.3)'
                        }}>
                          {activity.choiceProperties.skillLevel}
                        </span>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: 'rgba(59, 130, 246, 0.9)',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}>
                          {activity.choiceProperties.socialInteraction}
                        </span>
                        {activity.choiceProperties.quietActivity && (
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(139, 92, 246, 0.2)',
                            color: 'rgba(139, 92, 246, 0.9)',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(139, 92, 246, 0.3)'
                          }}>
                            🤫 quiet
                          </span>
                        )}
                        {activity.choiceProperties.messyActivity && (
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: 'rgba(245, 158, 11, 0.9)',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(245, 158, 11, 0.3)'
                          }}>
                            🎨 messy
                          </span>
                        )}
                      </div>
                    )}

                    {/* Assigned Students Preview */}
                    {getActivityAssignmentCount(activity.id) > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        flexWrap: 'wrap',
                        marginTop: 'auto'
                      }}>
                        {currentRotation.assignments
                          .filter(a => a.activityId === activity.id)
                          .slice(0, 3)
                          .map(assignment => (
                            <div
                              key={assignment.studentId}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                border: '2px solid rgba(255, 255, 255, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                color: 'white',
                                overflow: 'hidden'
                              }}
                              title={assignment.studentName}
                            >
                              {assignment.studentPhoto ? (
                                <img
                                  src={assignment.studentPhoto}
                                  alt={assignment.studentName}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <div style={{
                                  background: 'linear-gradient(145deg, #28a745, #20c997)',
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {assignment.studentName.split(' ').map(n => n[0]).join('')}
                                </div>
                              )}
                            </div>
                          ))
                        }
                        {getActivityAssignmentCount(activity.id) > 3 && (
                          <div style={{
                            width: '28px',
                            height: '28px',
                            background: 'rgba(108, 117, 125, 0.8)',
                            borderRadius: '50%',
                            border: '2px solid rgba(255, 255, 255, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.7rem'
                          }}>
                            +{getActivityAssignmentCount(activity.id) - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Students */}
            <div className="glass-panel">
              <h4 className="section-header">
                👥 Students ({students.length})
              </h4>

              {/* Unassigned Students */}
              {getUnassignedStudents().length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h5 style={{
                    fontSize: '1.2rem',
                    color: 'rgba(239, 68, 68, 0.9)',
                    marginBottom: '1rem',
                    fontWeight: '600'
                  }}>
                    ⚠️ Unassigned ({getUnassignedStudents().length})
                  </h5>
                  <div className="students-responsive-grid">
                    {getUnassignedStudents().map(student => (
                      <div
                        key={student.id}
                        className={`student-card unassigned ${
                          selectedActivity ? 'selectable' : ''
                        }`}
                        onClick={() => {
                          if (selectedActivity) {
                            assignStudentToActivity(student, selectedActivity);
                          }
                        }}
                      >
                        <div className="student-avatar">
                          {student.photo ? (
                            <img
                              src={student.photo}
                              alt={formatStudentName(student.name)}
                            />
                          ) : (
                            <div className="student-avatar-initials" style={{
                              background: 'linear-gradient(145deg, #ef4444, #dc2626)'
                            }}>
                              {formatStudentName(student.name).split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>
                        <div className="student-info">
                          <div className="student-name">
                            {formatStudentName(student.name)}
                          </div>
                          {selectedActivity ? (
                            <div className="student-status">
                              ☝️ Click to assign to {selectedActivity.emoji} {selectedActivity.name}
                            </div>
                          ) : (
                            <div className="student-status">
                              Select an activity first
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned Students by Activity */}
              <div style={{ marginTop: '1rem' }}>
                {filteredActivities
                  .filter(activity => getActivityAssignmentCount(activity.id) > 0)
                  .map(activity => (
                    <div key={activity.id} style={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>{activity.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div className="text-primary" style={{ fontWeight: '600' }}>{activity.name}</div>
                          <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
                            {getActivityAssignmentCount(activity.id)} students assigned
                          </div>
                        </div>
                      </div>
                      
                      <div className="assigned-students-grid">
                        {currentRotation.assignments
                          .filter(assignment => assignment.activityId === activity.id)
                          .map(assignment => (
                            <div
                              key={assignment.studentId}
                              className="student-card assigned"
                            >
                              <div className="student-avatar">
                                {assignment.studentPhoto ? (
                                  <img
                                    src={assignment.studentPhoto}
                                    alt={assignment.studentName}
                                  />
                                ) : (
                                  <div className="student-avatar-initials" style={{
                                    background: 'linear-gradient(145deg, #28a745, #20c997)'
                                  }}>
                                    {assignment.studentName.split(' ').map(n => n[0]).join('')}
                                  </div>
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div className="text-primary" style={{ fontWeight: '600' }}>
                                  {assignment.studentName}
                                </div>
                                <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
                                  Assigned to {activity.emoji} {activity.name}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => removeStudentAssignment(assignment.studentId)}
                                className="control-button danger"
                                style={{
                                  fontSize: '0.8rem',
                                  padding: '0.25rem 0.5rem',
                                  minWidth: 'auto'
                                }}
                                title="Remove assignment"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  ))
                }
              </div>

              {currentRotation.assignments.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">👆</div>
                  <h4 className="text-lg font-semibold glass-text-primary mb-2">Ready to Start Assigning!</h4>
                  <p className="glass-text-secondary">1. Click an activity above to select it</p>
                  <p className="glass-text-secondary">2. Then click students to assign them</p>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Instructions */}
          {selectedActivity && (
            <div className="mt-6 glass-panel p-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{selectedActivity.emoji}</span>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold glass-text-primary mb-2">
                    ✨ Ready to assign students to: {selectedActivity.name}
                  </h4>
                  <div className="flex items-center gap-4 text-sm glass-text-secondary">
                    <span>Current: {getActivityAssignmentCount(selectedActivity.id)} / {selectedActivity.choiceProperties?.maxStudents || 6} students</span>
                    <div className="flex-1 bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((getActivityAssignmentCount(selectedActivity.id) / (selectedActivity.choiceProperties?.maxStudents || 6)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rotation History */}
      {rotationHistory.length > 0 && (
        <div className="p-6 glass-panel mt-6">
          <h3 className="text-xl font-bold glass-text-primary mb-4">
            📊 Recent Choice Rotations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rotationHistory.slice(-6).reverse().map(rotation => (
              <div key={rotation.id} className="glass-panel p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold glass-text-primary">Rotation #{rotation.rotationNumber}</h4>
                  <span className="text-xs glass-text-secondary">
                    {rotation.duration} min
                  </span>
                </div>
                <p className="text-sm glass-text-secondary mb-2">
                  {rotation.assignments.length} students assigned
                </p>
                <div className="text-xs glass-text-muted">
                  {rotation.startTime && new Date(rotation.startTime).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Library Modal */}
      {showActivityLibrary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20 flex justify-between items-center">
              <h2 className="text-2xl font-bold glass-text-primary">📚 Activity Library - Choice Management</h2>
              <button
                onClick={() => setShowActivityLibrary(false)}
                className="glass-button"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 glass-panel p-4">
                <h3 className="font-semibold glass-text-primary mb-3">🎯 Choice-Eligible Activities</h3>
                <p className="glass-text-secondary text-sm">
                  Activities marked as "Choice Ready" will automatically appear in your Independent Choices rotation.
                  Configure their properties to ensure optimal student assignments.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="stat-card">
                  <div className="text-2xl font-bold glass-text-primary">{choiceEligibleActivities.length}</div>
                  <div className="text-sm glass-text-secondary">Choice Ready</div>
                </div>
                <div className="stat-card">
                  <div className="text-2xl font-bold glass-text-primary">
                    {choiceEligibleActivities.reduce((sum, a) => sum + (a.choiceProperties?.maxStudents || 6), 0)}
                  </div>
                  <div className="text-sm glass-text-secondary">Total Capacity</div>
                </div>
                <div className="stat-card">
                  <div className="text-2xl font-bold glass-text-primary">
                    {choiceEligibleActivities.filter(a => a.choiceProperties?.quietActivity).length}
                  </div>
                  <div className="text-sm glass-text-secondary">Quiet Options</div>
                </div>
              </div>

              {/* Choice-Eligible Activities List */}
              <div className="space-y-3">
                {choiceEligibleActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold glass-text-primary mb-3">No Choice-Eligible Activities</h3>
                    <p className="glass-text-secondary">Visit the main Activity Library to mark activities as choice-eligible.</p>
                  </div>
                ) : (
                  choiceEligibleActivities.map(activity => (
                    <div key={activity.id} className="glass-panel p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{activity.emoji}</span>
                          <div>
                            <h4 className="font-semibold glass-text-primary text-lg">{activity.name}</h4>
                            <p className="text-sm glass-text-secondary">{activity.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold glass-text-primary">
                            {activity.choiceProperties?.maxStudents || 6}
                          </div>
                          <div className="text-xs glass-text-secondary">max students</div>
                        </div>
                      </div>

                      {/* Properties Grid */}
                      {activity.choiceProperties && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="glass-panel p-3">
                            <span className="glass-text-muted text-xs">Skill Level:</span>
                            <div className="font-medium glass-text-primary capitalize">{activity.choiceProperties.skillLevel}</div>
                          </div>
                          <div className="glass-panel p-3">
                            <span className="glass-text-muted text-xs">Supervision:</span>
                            <div className="font-medium glass-text-primary capitalize">{activity.choiceProperties.staffSupervision}</div>
                          </div>
                          <div className="glass-panel p-3">
                            <span className="glass-text-muted text-xs">Social:</span>
                            <div className="font-medium glass-text-primary capitalize">{activity.choiceProperties.socialInteraction}</div>
                          </div>
                          <div className="glass-panel p-3">
                            <span className="glass-text-muted text-xs">Type:</span>
                            <div className="font-medium glass-text-primary">
                              {activity.choiceProperties.quietActivity ? '🤫 Quiet' : '🔊 Active'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Usage Stats */}
                      {activity.usageStats && activity.usageStats.timesUsed && (
                        <div className="mt-4 flex gap-4 text-xs glass-text-muted">
                          <span>Used: {activity.usageStats.timesUsed} times</span>
                          {activity.usageStats.averageRating && (
                            <span>Rating: {'⭐'.repeat(Math.round(activity.usageStats.averageRating))}</span>
                          )}
                          {activity.usageStats.lastUsed && (
                            <span>Last: {new Date(activity.usageStats.lastUsed).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Instructions */}
              <div className="mt-6 glass-panel p-4">
                <h4 className="font-semibold glass-text-primary mb-3">💡 Quick Tips</h4>
                <ul className="text-sm glass-text-secondary space-y-2">
                  <li>• Activities marked as "Choice Ready" automatically appear in Independent Choices</li>
                  <li>• Configure max students, skill level, and supervision requirements for optimal assignments</li>
                  <li>• Use quiet/active settings to balance classroom energy during choice time</li>
                  <li>• Check usage stats to see which activities are most popular with students</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
       )}
      </div>
    </>
  );
};

export default IndependentChoices;

import React, { useState, useEffect } from 'react';
import EnhancedDataEntry from './EnhancedDataEntry';
import ProgressDashboard from './ProgressDashboard';
import PrintDataSheetSystem from './PrintDataSheetSystem';
import GoalManager from './GoalManager';
import { IEPIntelligenceIntegration } from '../intelligence/enhanced-intelligence-integration';
import type { GoalSuggestion } from '../intelligence/enhanced-goal-intelligence-core';

// Types
interface Student {
  id: string;
  name: string;
  grade: string;
  photo?: string;
}

interface IEPGoal {
  id: string;
  studentId: string;
  domain: 'academic' | 'behavioral' | 'social-emotional' | 'physical';
  title: string;
  description: string;
  shortTermObjective: string;
  measurementType: 'percentage' | 'frequency' | 'duration' | 'rating' | 'yes-no' | 'independence';
  criteria: string;
  target: number;
  isActive: boolean;
  priority: 'high' | 'medium' | 'low';
  dateCreated: string;
  lastDataPoint?: string;
  dataPoints: number;
  currentProgress: number;
}

interface DataSession {
  id: string;
  goalId: string;
  date: string;
  value: string | number;
  notes?: string;
  collector: string;
}

type ViewType = 'dashboard' | 'print-sheets' | 'data-entry' | 'progress' | 'goal-selection'

interface IEPDataCollectionInterfaceProps {
  isActive: boolean;
}

const IEPDataCollectionInterface: React.FC<IEPDataCollectionInterfaceProps> = ({ isActive }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [goals, setGoals] = useState<IEPGoal[]>([]);
  const [dataSessions, setDataSessions] = useState<DataSession[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<IEPGoal | null>(null);
  const [view, setView] = useState<ViewType>('dashboard');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [currentNotes, setCurrentNotes] = useState<string>('');
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [intelligenceEnabled, setIntelligenceEnabled] = useState(true);
  

  // Load data on component mount
  useEffect(() => {
    loadStudentsData();
    loadGoalsData();
    loadDataSessions();
  }, []);

  const loadStudentsData = () => {
    try {
      const savedStudents = localStorage.getItem('students');
      if (savedStudents) {
        const studentsData = JSON.parse(savedStudents);
        setStudents(studentsData);
      } else {
        // Default sample students if none exist
        const sampleStudents = [
          { id: '1', name: 'Alex Johnson', grade: '3rd Grade' },
          { id: '2', name: 'Maria Garcia', grade: '4th Grade' },
          { id: '3', name: 'Jordan Smith', grade: '2nd Grade' },
          { id: '4', name: 'Emma Wilson', grade: '3rd Grade' },
          { id: '5', name: 'Liam Brown', grade: '4th Grade' },
          { id: '6', name: 'Sophia Davis', grade: '2nd Grade' }
        ];
        setStudents(sampleStudents);
        localStorage.setItem('students', JSON.stringify(sampleStudents));
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadGoalsData = () => {
    const savedGoals = localStorage.getItem('iepGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // Sample goals for demonstration
      const sampleGoals: IEPGoal[] = [
        {
          id: 'goal-1',
          studentId: '1',
          domain: 'academic',
          title: 'Reading Comprehension',
          description: 'Reading comprehension improvement',
          shortTermObjective: 'Will answer comprehension questions with 80% accuracy',
          measurementType: 'percentage',
          criteria: '80% accuracy over 5 consecutive trials',
          target: 80,
          isActive: true,
          priority: 'high',
          dateCreated: '2024-01-15',
          dataPoints: 5,
          currentProgress: 65
        },
        {
          id: 'goal-2',
          studentId: '1',
          domain: 'behavioral',
          title: 'On-Task Behavior',
          description: 'On-task behavior during instruction',
          shortTermObjective: 'Will remain on task for 15-minute periods',
          measurementType: 'duration',
          criteria: '15 minutes sustained attention',
          target: 15,
          isActive: true,
          priority: 'medium',
          dateCreated: '2024-01-15',
          dataPoints: 8,
          currentProgress: 75
        },

        {
          id: 'goal-3',
          studentId: '2',
          domain: 'social-emotional',
          title: 'Peer Interaction',
          description: 'Peer interaction skills',
          shortTermObjective: 'Will initiate positive interactions with peers',
          measurementType: 'frequency',
          criteria: '3 positive interactions per session',
          target: 3,
          isActive: true,
          priority: 'high',
          dateCreated: '2024-01-20',
          dataPoints: 3,
          currentProgress: 60
        },
        {
          id: 'goal-4',
          studentId: '3',
          domain: 'physical',
          title: 'Fine Motor Skills',
          description: 'Fine motor coordination',
          shortTermObjective: 'Will complete writing tasks with proper grip',
          measurementType: 'rating',
          criteria: 'Rating of 4 or higher on 5-point scale',
          target: 4,
          isActive: true,
          priority: 'medium',
          dateCreated: '2024-02-01',
          dataPoints: 6,
          currentProgress: 70
        }
      ];
      setGoals(sampleGoals);
      localStorage.setItem('iepGoals', JSON.stringify(sampleGoals));
    }
  };

  const loadDataSessions = () => {
    const savedSessions = localStorage.getItem('iepDataSessions');
    if (savedSessions) {
      setDataSessions(JSON.parse(savedSessions));
    }
  };

  const handleAISuggestedGoalAdd = (suggestion: GoalSuggestion) => {
    const newGoal: IEPGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId: selectedStudent?.id || '',
      domain: suggestion.domain as 'academic' | 'behavioral' | 'social-emotional' | 'physical',
      title: suggestion.goalText.split(' ').slice(0, 3).join(' '), // First 3 words as title
      description: suggestion.goalText,
      shortTermObjective: suggestion.goalText,
      measurementType: 'percentage',
      criteria: '4 out of 5 opportunities',
      target: 80,
      isActive: true,
      priority: 'medium',
      dateCreated: new Date().toISOString().split('T')[0],
      dataPoints: 0,
      currentProgress: 0
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    localStorage.setItem('iepGoals', JSON.stringify(updatedGoals));
  };

  const getStudentGoals = (studentId: string): IEPGoal[] => {
    return goals.filter(goal => goal.studentId === studentId && goal.isActive);
  };

  const getActiveGoalsCount = (studentId: string): number => {
    return getStudentGoals(studentId).length;
  };

  const handleStartSession = (goal: IEPGoal) => {
    setSelectedGoal(goal);
    setView('data-entry');
    setCurrentValue('');
    setCurrentNotes('');
  };

  const handleSubmitData = () => {
    if (!selectedGoal || !selectedStudent || !currentValue) return;

    const newSession: DataSession = {
      id: Date.now().toString(),
      goalId: selectedGoal.id,
      date: new Date().toISOString().split('T')[0],
      value: selectedGoal.measurementType === 'percentage' ? parseFloat(currentValue) : currentValue,
      notes: currentNotes,
      collector: 'Current User'
    };

    const updatedSessions = [...dataSessions, newSession];
    setDataSessions(updatedSessions);
    localStorage.setItem('iepDataSessions', JSON.stringify(updatedSessions));

    // Reset form
    setCurrentValue('');
    setCurrentNotes('');
    
    // Show success message
    alert(`✅ Data recorded successfully for ${selectedStudent.name}!`);
  };

  const getStudentInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!isActive) return null;

  return (
    <div style={{
      height: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          📊 IEP Data Collection
        </h1>
        <p style={{
          fontSize: '1.2rem',
          opacity: 0.9
        }}>
          Professional data collection for IEP goals and objectives
        </p>
      </div>

{/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
        
          
          {[
            { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
            { id: 'print-sheets', icon: '🖨️', label: 'Print Sheets' },
            { id: 'data-entry', icon: '📝', label: 'Data Entry' },
            { id: 'progress', icon: '📈', label: 'Progress' },
            { id: 'goal-selection', icon: '🎯', label: 'Goal Manager' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as ViewType)}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: view === tab.id 
                  ? 'rgba(255,255,255,0.9)' 
                  : 'transparent',
                color: view === tab.id 
                  ? '#667eea' 
                  : 'white',
                transform: view === tab.id ? 'scale(1.05)' : 'scale(1)',
                boxShadow: view === tab.id 
                  ? '0 4px 20px rgba(0,0,0,0.2)' 
                  : 'none'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          
          {/* AI Intelligence Toggle Button */}
          <button 
            onClick={() => setShowIntelligence(!showIntelligence)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: showIntelligence 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'rgba(255,255,255,0.3)',
              color: 'white',
              transform: showIntelligence ? 'scale(1.05)' : 'scale(1)',
              boxShadow: showIntelligence 
                ? '0 4px 20px rgba(0,0,0,0.3)' 
                : 'none'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🧠</span>
            <span>{showIntelligence ? 'Hide AI' : 'AI Intelligence'}</span>
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* ADD THIS ENTIRE SECTION RIGHT HERE: */}
        {/* Enhanced Goal Intelligence Section */}
        {showIntelligence && selectedStudent && (
          <div style={{ marginBottom: '2rem' }}>
            <IEPIntelligenceIntegration
              selectedStudentId={selectedStudent.id}
              students={students}
              goals={goals.filter(g => g.studentId === selectedStudent.id)}
              onGoalAdd={handleAISuggestedGoalAdd}
              onGoalUpdate={(goalId, updates) => {
                console.log('Goal update requested:', goalId, updates);
                // Goal update logic will be implemented later
              }}
            />
          </div>
        )}
        
        {/* Your existing Dashboard View, Data Entry View, etc. continue below... */}
        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Student Selection */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '2rem' }}>👥</span>
                Select Student
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                {students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: selectedStudent?.id === student.id ? 'scale(1.02)' : 'scale(1)',
                      background: selectedStudent?.id === student.id
                        ? 'rgba(255,255,255,0.9)'
                        : 'rgba(255,255,255,0.1)',
                      color: selectedStudent?.id === student.id ? '#2c3e50' : 'white',
                      boxShadow: selectedStudent?.id === student.id
                        ? '0 8px 25px rgba(0,0,0,0.2)'
                        : '0 4px 15px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedStudent?.id !== student.id) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedStudent?.id !== student.id) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        background: selectedStudent?.id === student.id
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '3px solid rgba(255,255,255,0.3)'
                      }}>
                        {student.photo ? (
                          <img 
                            src={student.photo} 
                            alt={student.name} 
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          getStudentInitials(student.name)
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontWeight: '700',
                          fontSize: '1.3rem',
                          marginBottom: '4px'
                        }}>
                          {student.name}
                        </h3>
                        <p style={{
                          fontSize: '1rem',
                          opacity: 0.8,
                          marginBottom: '4px'
                        }}>
                          {student.grade}
                        </p>
                        <p style={{
                          fontSize: '0.9rem',
                          opacity: 0.7
                        }}>
                          {getActiveGoalsCount(student.id)} active goals
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals Overview */}
            {selectedStudent && (
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '2rem' }}>🎯</span>
                  Active Goals for {selectedStudent.name}
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {getStudentGoals(selectedStudent.id).map((goal) => (
                    <div
                      key={goal.id}
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        color: '#2c3e50',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          ...(goal.domain === 'academic' && { background: '#e3f2fd', color: '#1565c0' }),
                          ...(goal.domain === 'behavioral' && { background: '#fff3e0', color: '#ef6c00' }),
                          ...(goal.domain === 'social-emotional' && { background: '#f3e5f5', color: '#7b1fa2' }),
                          ...(goal.domain === 'physical' && { background: '#e8f5e8', color: '#2e7d32' })
                        }}>
                          {goal.domain.replace('-', ' ')}
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          background: '#f8f9fa',
                          color: '#6c757d',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {goal.measurementType}
                        </span>
                      </div>
                      
                      <h3 style={{
                        fontWeight: '700',
                        fontSize: '1.2rem',
                        marginBottom: '8px',
                        color: '#2c3e50'
                      }}>
                        {goal.title}
                      </h3>
                      <p style={{
                        color: '#6c757d',
                        fontSize: '1rem',
                        marginBottom: '8px',
                        lineHeight: '1.4'
                      }}>
                        {goal.description}
                      </p>
                      <p style={{
                        color: '#868e96',
                        fontSize: '0.9rem',
                        marginBottom: '1.5rem',
                        lineHeight: '1.4'
                      }}>
                        <strong>Criteria:</strong> {goal.criteria}
                      </p>
                      
                      <button
                        onClick={() => handleStartSession(goal)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '1.1rem',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>📝</span>
                        Start Data Session
                      </button>
                    </div>
                  ))}
                </div>

                {getStudentGoals(selectedStudent.id).length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'white'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                      No active goals found for this student.
                    </h3>
                    <p style={{ fontSize: '1rem', opacity: 0.8 }}>
                      Goals can be added through the IEP management system.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Data Entry View - Using EnhancedDataEntry */}   
        {view === 'data-entry' && selectedGoal && selectedStudent && (
          <EnhancedDataEntry
            selectedStudent={selectedStudent}
            selectedGoal={selectedGoal}
            onBack={() => setView('dashboard')}
            onDataSaved={() => {
              loadDataSessions();
            }}
          />
        )}

        {/* Fallback for Data Entry without selection */}
        {view === 'data-entry' && (!selectedGoal || !selectedStudent) && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '3rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              No Data Session Active
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '1.1rem',
              marginBottom: '2rem'
            }}>
              Select a student and goal from the dashboard to start a data collection session.
            </p>
            <button
              onClick={() => setView('dashboard')}
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#667eea',
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🏠</span>
              Go to Dashboard
            </button>
            <button
              onClick={() => setView('progress')}
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#667eea',
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '1.1rem',
                marginLeft: '1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📊</span>
              Progress Dashboard
            </button>
          </div>
        )}

        {/* Print Sheets View */}
        {view === 'print-sheets' && (
          <PrintDataSheetSystem 
            students={students}
            goals={goals}
            onBack={() => setView('dashboard')}
          />
        )}

      {/* Progress View */}
{view === 'progress' && <ProgressDashboard />}
{view === 'goal-selection' && <GoalManager />}
      </div>
    </div>
  );
};

export default IEPDataCollectionInterface;
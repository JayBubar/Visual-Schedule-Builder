import React, { useState, useEffect } from 'react';
import { Student } from '../../../types';
import { MorningMeetingStepProps, BehaviorStepData } from '../types/morningMeetingTypes';

const BehaviorStep: React.FC<MorningMeetingStepProps> = ({
  students,
  currentDate,
  onNext,
  onDataUpdate,
  stepData,
  hubSettings
}) => {
  const [behaviorChoices, setBehaviorChoices] = useState<Record<string, string>>(
    stepData?.studentBehaviorChoices || {}
  );
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Get behavior statements from hub settings or use defaults
  const behaviorStatements = hubSettings?.behaviorStatements?.statements || [
    'I will be kind to others',
    'I will listen when others are speaking', 
    'I will do my best work',
    'I will help others when they need it',
    'I will follow classroom rules'
  ];

  // Filter to only present students (from attendance step)
  const presentStudents = students.filter(student => {
    // If we have attendance data, use it; otherwise include all students
    if (stepData?.presentStudents) {
      return stepData.presentStudents.some((ps: Student) => ps.id === student.id);
    }
    return true;
  });

  // Check completion status
  useEffect(() => {
    const allStudentsHaveChoices = presentStudents.every(student => 
      behaviorChoices[student.id]
    );
    setIsComplete(allStudentsHaveChoices && presentStudents.length > 0);
  }, [behaviorChoices, presentStudents]);

  // Save behavior data whenever choices change
  useEffect(() => {
    const stepData: BehaviorStepData = {
      studentBehaviorChoices: behaviorChoices,
      completedAt: isComplete ? new Date() : undefined
    };
    onDataUpdate(stepData);
  }, [behaviorChoices, isComplete]);

  const handleBehaviorChoice = (studentId: string, statement: string) => {
    setBehaviorChoices(prev => ({
      ...prev,
      [studentId]: statement
    }));
    setSelectedStudent(null); // Close selection after choice
  };

  const clearChoice = (studentId: string) => {
    setBehaviorChoices(prev => {
      const newChoices = { ...prev };
      delete newChoices[studentId];
      return newChoices;
    });
  };

  const handleNext = () => {
    if (isComplete) {
      onNext();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStudentCard = (student: Student) => {
    const hasChoice = behaviorChoices[student.id];
    const isSelected = selectedStudent === student.id;

    return (
      <div
        key={student.id}
        style={{
          background: hasChoice 
            ? 'rgba(34, 197, 94, 0.9)' 
            : isSelected 
            ? 'rgba(59, 130, 246, 0.9)'
            : 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          border: isSelected ? '3px solid rgba(255, 255, 255, 0.8)' : 'none',
          transform: isSelected ? 'scale(1.05)' : hasChoice ? 'scale(1)' : 'scale(1.02)',
          minHeight: '200px'
        }}
        onClick={() => setSelectedStudent(isSelected ? null : student.id)}
      >
        {/* Student Photo */}
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: student.photo 
            ? `url(${student.photo}) center/cover`
            : 'linear-gradient(45deg, #667eea, #764ba2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {!student.photo && ((student as any).emoji || student.name.charAt(0).toUpperCase())}
        </div>

        {/* Student Name */}
        <div style={{
          fontWeight: '600',
          fontSize: '0.9rem',
          color: hasChoice ? 'white' : isSelected ? 'white' : '#1f2937',
          textAlign: 'center'
        }}>
          {student.name}
        </div>

        {/* Current Choice or Status */}
        <div style={{
          fontSize: '0.8rem',
          textAlign: 'center',
          color: hasChoice ? 'rgba(255,255,255,0.9)' : isSelected ? 'rgba(255,255,255,0.9)' : '#6b7280',
          lineHeight: '1.3',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {hasChoice ? (
            <div>
              <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                ⭐ Choice Made:
              </div>
              <div style={{ fontSize: '0.75rem' }}>
                "{behaviorChoices[student.id]}"
              </div>
            </div>
          ) : isSelected ? (
            'Choose a behavior goal below ↓'
          ) : (
            'Tap to choose behavior goal'
          )}
        </div>

        {/* Clear Choice Button */}
        {hasChoice && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearChoice(student.id);
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.8)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              padding: '0.25rem 0.5rem',
              fontSize: '0.7rem',
              cursor: 'pointer',
              marginTop: '0.25rem'
            }}
          >
            Change Choice
          </button>
        )}
      </div>
    );
  };

  if (presentStudents.length === 0) {
    return (
      <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          No Students Present
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Complete attendance first to set behavior goals.
        </p>
        <button
          onClick={onNext}
          style={{
            background: 'rgba(34, 197, 94, 0.8)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Skip This Step →
        </button>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        padding: '2rem 2rem 1rem 2rem',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          ⭐ Behavior Goals
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '0.5rem'
        }}>
          {formatDate(currentDate)}
        </p>
        <p style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.8)'
        }}>
          Each student chooses a behavior goal for today
        </p>
      </div>

      {/* Progress Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        padding: '0 2rem 1rem 2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '0.75rem 1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {Object.keys(behaviorChoices).length}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Completed</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '0.75rem 1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {presentStudents.length - Object.keys(behaviorChoices).length}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Remaining</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '1rem 2rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Student Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {presentStudents.map(student => renderStudentCard(student))}
        </div>

        {/* Behavior Choice Panel */}
        {selectedStudent && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginTop: '1rem',
            color: '#1f2937'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '1rem',
              textAlign: 'center',
              color: '#1f2937'
            }}>
              Choose a behavior goal for {presentStudents.find(s => s.id === selectedStudent)?.name}:
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '0.75rem'
            }}>
              {behaviorStatements.map((statement, index) => (
                <button
                  key={index}
                  onClick={() => handleBehaviorChoice(selectedStudent, statement)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    padding: '1rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    lineHeight: '1.4'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  "{statement}"
                </button>
              ))}
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '1rem'
            }}>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{
                  background: 'rgba(156, 163, 175, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{
        padding: '1rem 2rem 2rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <button
          onClick={handleNext}
          disabled={!isComplete}
          style={{
            background: isComplete
              ? 'rgba(34, 197, 94, 0.8)' 
              : 'rgba(156, 163, 175, 0.5)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: isComplete ? 'pointer' : 'not-allowed',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (isComplete) {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (isComplete) {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {isComplete ? 'Continue →' : `${Object.keys(behaviorChoices).length}/${presentStudents.length} Students Complete`}
        </button>
      </div>
    </div>
  );
};

export default BehaviorStep;

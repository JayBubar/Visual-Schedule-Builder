import React, { useState, useEffect } from 'react';
import { MorningMeetingStepProps, BehaviorStepData } from '../types/morningMeetingTypes';

interface Student {
  id: string;
  name: string;
  present?: boolean;
}

interface BehaviorCommitment {
  id: string;
  statement: string;
  category: 'kindness' | 'responsibility' | 'respect' | 'effort' | 'safety';
  icon: string;
}

const DEFAULT_BEHAVIOR_COMMITMENTS: BehaviorCommitment[] = [
  {
    id: 'kind-words',
    statement: 'I will use kind words with my friends',
    category: 'kindness',
    icon: '💝'
  },
  {
    id: 'listen-teacher',
    statement: 'I will listen when my teacher is talking',
    category: 'respect',
    icon: '👂'
  },
  {
    id: 'try-my-best',
    statement: 'I will try my best in everything I do',
    category: 'effort',
    icon: '💪'
  },
  {
    id: 'help-others',
    statement: 'I will help my classmates when they need it',
    category: 'kindness',
    icon: '🤝'
  },
  {
    id: 'follow-rules',
    statement: 'I will follow classroom rules',
    category: 'responsibility',
    icon: '📋'
  },
  {
    id: 'keep-hands-safe',
    statement: 'I will keep my hands and feet to myself',
    category: 'safety',
    icon: '✋'
  },
  {
    id: 'take-turns',
    statement: 'I will wait my turn and share with others',
    category: 'respect',
    icon: '🔄'
  },
  {
    id: 'clean-up',
    statement: 'I will clean up after myself',
    category: 'responsibility',
    icon: '🧹'
  }
];

const BehaviorStep: React.FC<MorningMeetingStepProps> = ({
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings,
  students = []
}) => {
  const [selectedCommitments, setSelectedCommitments] = useState<string[]>(
    stepData?.selectedCommitments || []
  );
  const [studentCommitments, setStudentCommitments] = useState<Record<string, string[]>>(
    stepData?.studentCommitments || {}
  );
  const [currentView, setCurrentView] = useState<'selection' | 'confirmation' | 'complete'>(
    stepData?.currentView || 'selection'
  );

  // Get selected videos for this step
  const selectedVideos = hubSettings?.videos?.behaviorCommitments || [];

  // Get behavior commitments from hub settings or use defaults
  const getBehaviorCommitments = (): BehaviorCommitment[] => {
    if (hubSettings?.behaviorStatements?.statements?.length > 0) {
      return hubSettings.behaviorStatements.statements.map((statement, index) => ({
        id: `custom-${index}`,
        statement,
        category: 'responsibility',
        icon: '⭐'
      }));
    }
    return DEFAULT_BEHAVIOR_COMMITMENTS;
  };

  const behaviorCommitments = getBehaviorCommitments();
  const presentStudents = students.filter(student => student.present === true);

  useEffect(() => {
    const stepDataUpdate: any = {
      selectedCommitments,
      studentCommitments,
      currentView,
      presentStudents: presentStudents.map(s => s.id),
      completedAt: currentView === 'complete' ? new Date() : undefined
    };
    onDataUpdate(stepDataUpdate);
  }, [selectedCommitments, studentCommitments, currentView, presentStudents, onDataUpdate]);

  const toggleCommitment = (commitmentId: string) => {
    setSelectedCommitments(prev => 
      prev.includes(commitmentId)
        ? prev.filter(id => id !== commitmentId)
        : [...prev, commitmentId]
    );
  };

  const proceedToConfirmation = () => {
    if (selectedCommitments.length > 0) {
      const initialStudentCommitments: Record<string, string[]> = {};
      presentStudents.forEach(student => {
        initialStudentCommitments[student.id] = [...selectedCommitments];
      });
      setStudentCommitments(initialStudentCommitments);
      setCurrentView('confirmation');
    }
  };

  const toggleStudentCommitment = (studentId: string, commitmentId: string) => {
    setStudentCommitments(prev => ({
      ...prev,
      [studentId]: prev[studentId]?.includes(commitmentId)
        ? prev[studentId].filter(id => id !== commitmentId)
        : [...(prev[studentId] || []), commitmentId]
    }));
  };

  const completeStep = () => {
    setCurrentView('complete');
    setTimeout(() => {
      onNext();
    }, 2000);
  };

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* VIDEO SECTION */}
      {selectedVideos.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexShrink: 0,
          padding: '1rem'
        }}>
          {selectedVideos.map((video, index) => (
            <button
              key={index}
              onClick={() => window.open(video.url, `behavior-video-${index}`, 'width=800,height=600')}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🎬 Play Behavior Video {selectedVideos.length > 1 ? ` ${index + 1}` : ''}
            </button>
          ))}
        </div>
      )}

      {/* HEADER */}
      <div style={{ padding: '1.5rem 2rem 1rem 2rem', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '0.5rem'
        }}>
          💪 Behavior Commitments
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)' }}>
          Making promises for a great day
        </p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 2rem' }}>
        {currentView === 'selection' && (
          <div>
            <h3 style={{ fontSize: '1.8rem', color: 'white', textAlign: 'center', marginBottom: '2rem' }}>
              Choose Our Behavior Commitments
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {behaviorCommitments.map((commitment) => (
                <div
                  key={commitment.id}
                  style={{
                    background: selectedCommitments.includes(commitment.id)
                      ? 'rgba(34, 197, 94, 0.3)'
                      : 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    border: selectedCommitments.includes(commitment.id)
                      ? '3px solid rgba(34, 197, 94, 0.8)'
                      : '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                  onClick={() => toggleCommitment(commitment.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>{commitment.icon}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white' }}>
                      {commitment.statement}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={proceedToConfirmation}
                disabled={selectedCommitments.length === 0}
                style={{
                  background: selectedCommitments.length > 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(156, 163, 175, 0.5)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '1.5rem 3rem',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  cursor: selectedCommitments.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                Continue with {selectedCommitments.length} commitment{selectedCommitments.length !== 1 ? 's' : ''} →
              </button>
            </div>
          </div>
        )}

        {currentView === 'confirmation' && (
          <div>
            <h3 style={{ fontSize: '1.8rem', color: 'white', textAlign: 'center', marginBottom: '2rem' }}>
              Individual Commitments
            </h3>
            {presentStudents.length > 0 ? (
              presentStudents.map((student) => (
                <div key={student.id} style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ fontSize: '1.3rem', color: 'white', marginBottom: '1rem' }}>
                    👤 {student.name}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                    {selectedCommitments.map((commitmentId) => {
                      const commitment = behaviorCommitments.find(c => c.id === commitmentId);
                      const isSelected = studentCommitments[student.id]?.includes(commitmentId);
                      return (
                        <div
                          key={commitmentId}
                          style={{
                            background: isSelected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid rgba(34, 197, 94, 0.8)' : '2px solid rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                          onClick={() => toggleStudentCommitment(student.id, commitmentId)}
                        >
                          <span>{commitment?.icon}</span>
                          <span style={{ fontSize: '0.9rem', color: 'white' }}>{commitment?.statement}</span>
                          {isSelected && <span style={{ marginLeft: 'auto' }}>✅</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ background: 'rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)' }}>
                  No students are marked as present. The selected commitments will apply to the whole class.
                </p>
              </div>
            )}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={completeStep}
                style={{
                  background: 'rgba(34, 197, 94, 0.8)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '1.5rem 3rem',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Lock in Our Commitments! →
              </button>
            </div>
          </div>
        )}

        {currentView === 'complete' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🎉</div>
            <h3 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '1rem' }}>Great Job!</h3>
            <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.9)' }}>
              We have made our behavior commitments for today!
            </p>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1rem',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '20px',
        padding: '1rem 2rem'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(156, 163, 175, 0.8)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          style={{
            background: 'rgba(34, 197, 94, 0.8)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Behavior Complete! →
        </button>
      </div>
    </div>
  );
};

export default BehaviorStep;
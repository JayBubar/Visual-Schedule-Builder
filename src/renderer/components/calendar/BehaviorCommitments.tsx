import React, { useState, useEffect } from 'react';
import { 
  Student, 
  DailyCheckIn as DailyCheckInType,
  StudentBehaviorChoice,
  ActivityHighlight
} from '../../types';

interface BehaviorCommitmentsProps {
  currentDate: Date;
  students: Student[];
  todayCheckIn: DailyCheckInType | null;
  onUpdateCheckIn: (checkIn: DailyCheckInType) => void;
}

interface BehaviorCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  commitments: string[];
  description: string;
}

const BehaviorCommitments: React.FC<BehaviorCommitmentsProps> = ({
  currentDate,
  students,
  todayCheckIn,
  onUpdateCheckIn
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('kindness');
  const [studentCommitments, setStudentCommitments] = useState<StudentBehaviorChoice[]>([]);
  const [showCelebration, setShowCelebration] = useState<string | null>(null);

  // Behavior categories with commitments
  const behaviorCategories: BehaviorCategory[] = [
    {
      id: 'kindness',
      name: 'Kindness',
      icon: '💝',
      color: '#e91e63',
      description: 'Being caring and helpful to others',
      commitments: [
        'I will be kind to my friends',
        'I will help others when they need it',
        'I will share with my classmates',
        'I will use nice words',
        'I will include everyone in activities',
        'I will say please and thank you'
      ]
    },
    {
      id: 'respect',
      name: 'Respect',
      icon: '🤝',
      color: '#2196f3',
      description: 'Treating others and our classroom with care',
      commitments: [
        'I will listen when others are talking',
        'I will raise my hand to speak',
        'I will take care of our classroom',
        'I will follow directions the first time',
        'I will use my inside voice',
        'I will keep my hands to myself'
      ]
    },
    {
      id: 'effort',
      name: 'Effort',
      icon: '💪',
      color: '#ff9800',
      description: 'Trying my best in everything I do',
      commitments: [
        'I will try my best in all activities',
        'I will ask for help when I need it',
        'I will finish my work',
        'I will not give up when things are hard',
        'I will pay attention during lessons',
        'I will practice what I learn'
      ]
    },
    {
      id: 'responsibility',
      name: 'Responsibility',
      icon: '🎯',
      color: '#4caf50',
      description: 'Taking care of myself and my belongings',
      commitments: [
        'I will clean up after myself',
        'I will take care of my belongings',
        'I will remember my homework',
        'I will be ready for activities',
        'I will make good choices',
        'I will tell the truth'
      ]
    },
    {
      id: 'safety',
      name: 'Safety',
      icon: '🛡️',
      color: '#f44336',
      description: 'Keeping myself and others safe',
      commitments: [
        'I will walk in the hallways',
        'I will use materials safely',
        'I will ask before leaving my seat',
        'I will keep food out of my mouth during non-eating times',
        'I will follow playground rules',
        'I will tell an adult if someone is hurt'
      ]
    },
    {
      id: 'learning',
      name: 'Learning',
      icon: '📚',
      color: '#9c27b0',
      description: 'Growing my mind and skills every day',
      commitments: [
        'I will ask questions when I don\'t understand',
        'I will listen to learn new things',
        'I will try new activities',
        'I will help my friends learn too',
        'I will celebrate my mistakes as learning',
        'I will be proud of my progress'
      ]
    }
  ];

  useEffect(() => {
    if (todayCheckIn) {
      setStudentCommitments(todayCheckIn.behaviorCommitments || []);
    }
  }, [todayCheckIn]);

  const getSelectedCategory = () => {
    return behaviorCategories.find(cat => cat.id === selectedCategory) || behaviorCategories[0];
  };

  const hasStudentCommitment = (studentId: string): boolean => {
    return studentCommitments.some(commitment => commitment.studentId === studentId);
  };

  const getStudentCommitment = (studentId: string): StudentBehaviorChoice | undefined => {
    return studentCommitments.find(commitment => commitment.studentId === studentId);
  };

  const addStudentCommitment = (student: Student, commitmentText: string) => {
    if (!todayCheckIn) return;

    const newCommitment: StudentBehaviorChoice = {
      id: `commitment_${student.id}_${Date.now()}`,
      studentId: student.id,
      commitmentId: `behavior_${selectedCategory}_${Date.now()}`,
      date: currentDate.toISOString().split('T')[0],
      completed: false,
      timestamp: new Date().toISOString(),
      studentName: student.name,
      studentPhoto: student.photo,
      commitment: commitmentText,
      category: selectedCategory as any,
      achieved: false,
      selectedAt: new Date().toISOString()
    };

    const updatedCommitments = studentCommitments.filter(c => c.studentId !== student.id);
    updatedCommitments.push(newCommitment);

    const updatedCheckIn = {
      ...todayCheckIn,
      behaviorCommitments: updatedCommitments,
      updatedAt: new Date().toISOString()
    };

    setStudentCommitments(updatedCommitments);
    onUpdateCheckIn(updatedCheckIn);
  };

  const toggleCommitmentAchieved = (studentId: string) => {
    if (!todayCheckIn) return;

    const updatedCommitments = studentCommitments.map(commitment => {
      if (commitment.studentId === studentId) {
        const achieved = !commitment.achieved;
        
        // Show celebration if newly achieved
        if (achieved && !commitment.achieved) {
          setShowCelebration(studentId);
          setTimeout(() => setShowCelebration(null), 3000);
          
          // Add achievement to highlights
          const student = students.find(s => s.id === studentId);
          if (student) {
            const newHighlight: ActivityHighlight = {
              id: `behavior_${Date.now()}`,
              activityId: `behavior_${Date.now()}`,
              activityName: 'Behavior Achievement',
              emoji: '🌟',
              description: `${student.name} achieved their behavior goal`,
              studentReactions: [],
              highlight: `${student.name} achieved their behavior goal: "${commitment.commitment}"`,
              timestamp: new Date().toISOString(),
              studentIds: [studentId]
            };

            const currentHighlights = todayCheckIn.yesterdayHighlights || [];
            const updatedCheckIn = {
              ...todayCheckIn,
              behaviorCommitments: updatedCommitments,
              yesterdayHighlights: [...currentHighlights, newHighlight],
              updatedAt: new Date().toISOString()
            };
            
            onUpdateCheckIn(updatedCheckIn);
            return { ...commitment, achieved, completedAt: new Date().toISOString() };
          }
        }
        
        return { ...commitment, achieved };
      }
      return commitment;
    });

    setStudentCommitments(updatedCommitments);

    if (!showCelebration) {
      const updatedCheckIn = {
        ...todayCheckIn,
        behaviorCommitments: updatedCommitments,
        updatedAt: new Date().toISOString()
      };
      onUpdateCheckIn(updatedCheckIn);
    }
  };

  const removeStudentCommitment = (studentId: string) => {
    if (!todayCheckIn) return;

    const updatedCommitments = studentCommitments.filter(c => c.studentId !== studentId);

    const updatedCheckIn = {
      ...todayCheckIn,
      behaviorCommitments: updatedCommitments,
      updatedAt: new Date().toISOString()
    };

    setStudentCommitments(updatedCommitments);
    onUpdateCheckIn(updatedCheckIn);
  };

  const getAchievementStats = () => {
    const total = studentCommitments.length;
    const achieved = studentCommitments.filter(c => c.achieved).length;
    return { total, achieved, percentage: total > 0 ? Math.round((achieved / total) * 100) : 0 };
  };

  const selectedCat = getSelectedCategory();
  const stats = getAchievementStats();

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '2rem', 
          marginBottom: '0.5rem',
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          ⭐ Behavior Commitments
        </h3>
        <p style={{ 
          fontSize: '1.2rem', 
          opacity: 0.9,
          color: 'white',
          marginBottom: '1rem'
        }}>
          Choose your "I will..." statement for today!
        </p>
        
        {/* Achievement Stats */}
        {studentCommitments.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '16px',
            padding: '1rem',
            display: 'inline-block',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              🏆 {stats.achieved} of {stats.total} achieved ({stats.percentage}%)
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '10px',
              height: '8px',
              width: '200px',
              margin: '0 auto'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #28a745, #20c997)',
                borderRadius: '10px',
                height: '100%',
                width: `${stats.percentage}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {behaviorCategories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            style={{
              background: selectedCategory === category.id 
                ? `linear-gradient(145deg, ${category.color}, ${category.color}DD)`
                : 'rgba(255,255,255,0.1)',
              border: selectedCategory === category.id 
                ? `3px solid ${category.color}`
                : '2px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              color: 'white',
              padding: '1.5rem 1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== category.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== category.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              {category.icon}
            </div>
            <div style={{ 
              fontSize: '1.2rem', 
              fontWeight: '700',
              marginBottom: '0.5rem'
            }}>
              {category.name}
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              opacity: 0.9,
              lineHeight: '1.3'
            }}>
              {category.description}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Category Commitments */}
      <div style={{
        background: `linear-gradient(145deg, ${selectedCat.color}20, ${selectedCat.color}10)`,
        borderRadius: '20px',
        padding: '2rem',
        border: `3px solid ${selectedCat.color}`,
        marginBottom: '2rem',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '3rem' }}>{selectedCat.icon}</span>
          <div>
            <h4 style={{
              margin: '0',
              fontSize: '2rem',
              fontWeight: '700',
              color: 'white'
            }}>
              {selectedCat.name} Commitments
            </h4>
            <p style={{
              margin: '0',
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.9)'
            }}>
              {selectedCat.description}
            </p>
          </div>
        </div>

        {/* Commitment Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {selectedCat.commitments.map((commitment, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '2px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'white',
                lineHeight: '1.4',
                textAlign: 'center'
              }}>
                "{commitment}"
              </div>
            </div>
          ))}
        </div>

        {/* Student Selection Grid */}
        <div>
          <h5 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            👥 Choose Students for {selectedCat.name}
          </h5>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem'
          }}>
            {students.map(student => {
              const hasCommitment = hasStudentCommitment(student.id);
              const commitment = getStudentCommitment(student.id);
              const isSelectedCategory = commitment?.category === selectedCategory;

              return (
                <div
                  key={student.id}
                  style={{
                    background: hasCommitment 
                      ? (commitment?.achieved 
                        ? 'linear-gradient(145deg, #28a745, #20c997)'
                        : `linear-gradient(145deg, ${selectedCat.color}40, ${selectedCat.color}20)`)
                      : 'rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: hasCommitment 
                      ? (commitment?.achieved 
                        ? '3px solid #28a745'
                        : `3px solid ${selectedCat.color}`)
                      : '2px solid rgba(255,255,255,0.2)',
                    textAlign: 'center',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (hasCommitment && isSelectedCategory) {
                      // Toggle achievement if same category
                      toggleCommitmentAchieved(student.id);
                    } else if (hasCommitment && !isSelectedCategory) {
                      // Ask to replace commitment
                      if (window.confirm(`${student.name} already has a commitment. Replace it with ${selectedCat.name}?`)) {
                        const selectedCommitment = selectedCat.commitments[0]; // Default to first commitment
                        addStudentCommitment(student, selectedCommitment);
                      }
                    } else {
                      // Add new commitment
                      const commitmentIndex = Math.floor(Math.random() * selectedCat.commitments.length);
                      const selectedCommitment = selectedCat.commitments[commitmentIndex];
                      addStudentCommitment(student, selectedCommitment);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!hasCommitment) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!hasCommitment) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {/* Student Photo */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: student.photo 
                      ? 'transparent' 
                      : 'linear-gradient(145deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    border: hasCommitment 
                      ? (commitment?.achieved ? '3px solid #FFD700' : `3px solid ${selectedCat.color}`)
                      : '2px solid rgba(255,255,255,0.3)',
                    boxShadow: hasCommitment 
                      ? '0 6px 20px rgba(0,0,0,0.3)'
                      : '0 4px 15px rgba(0,0,0,0.2)'
                  }}>
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <span style={{
                        fontSize: '2rem',
                        color: 'white',
                        fontWeight: '700'
                      }}>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>

                  {/* Student Name */}
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}>
                    {student.name}
                  </div>

                  {/* Commitment Status */}
                  {hasCommitment && commitment ? (
                    <div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: 'white',
                        marginBottom: '0.5rem',
                        lineHeight: '1.3'
                      }}>
                        "{commitment.commitment}"
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '1.2rem'
                        }}>
                          {commitment.achieved ? '✅' : '⏳'}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {commitment.achieved ? 'Achieved!' : 'Working on it'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      fontSize: '0.9rem',
                      color: 'rgba(255,255,255,0.8)',
                      fontStyle: 'italic'
                    }}>
                      Click to add {selectedCat.name} commitment
                    </div>
                  )}

                  {/* Remove Button */}
                  {hasCommitment && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Remove ${student.name}'s commitment?`)) {
                          removeStudentCommitment(student.id);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(220, 53, 69, 0.8)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        color: 'white',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  )}

                  {/* Achievement Celebration */}
                  {showCelebration === student.id && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(255, 215, 0, 0.95)',
                      borderRadius: '50%',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      animation: 'bounce 0.6s ease-in-out',
                      zIndex: 10
                    }}>
                      🎉
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '2rem',
        backdropFilter: 'blur(10px)',
        textAlign: 'center'
      }}>
        <h5 style={{
          fontSize: '1.3rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '1rem'
        }}>
          🏆 Quick Actions
        </h5>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => {
              const unachieved = studentCommitments.filter(c => !c.achieved);
              if (unachieved.length === 0) {
                alert('All students have already achieved their commitments! 🎉');
                return;
              }
              if (window.confirm(`Mark all ${unachieved.length} remaining commitments as achieved?`)) {
                unachieved.forEach(commitment => {
                  toggleCommitmentAchieved(commitment.studentId);
                });
              }
            }}
            disabled={studentCommitments.filter(c => !c.achieved).length === 0}
            style={{
              background: studentCommitments.filter(c => !c.achieved).length === 0
                ? 'rgba(108, 117, 125, 0.5)'
                : 'linear-gradient(145deg, #28a745, #20c997)',
              border: 'none',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: studentCommitments.filter(c => !c.achieved).length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
            }}
          >
            🌟 Celebrate All
          </button>

          <button
            onClick={() => {
              if (window.confirm('Clear all behavior commitments for today?')) {
                if (todayCheckIn) {
                  const updatedCheckIn = {
                    ...todayCheckIn,
                    behaviorCommitments: [],
                    updatedAt: new Date().toISOString()
                  };
                  setStudentCommitments([]);
                  onUpdateCheckIn(updatedCheckIn);
                }
              }
            }}
            disabled={studentCommitments.length === 0}
            style={{
              background: studentCommitments.length === 0
                ? 'rgba(108, 117, 125, 0.5)'
                : 'linear-gradient(145deg, #dc3545, #c82333)',
              border: 'none',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: studentCommitments.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
            }}
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translate(-50%, -50%) translateY(0);
          }
          40% {
            transform: translate(-50%, -50%) translateY(-10px);
          }
          60% {
            transform: translate(-50%, -50%) translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
};

export default BehaviorCommitments;
import React, { useState, useEffect } from 'react';
import { 
  Student, 
  DailyCheckIn as DailyCheckInType,
  StudentBehaviorChoice,
  ActivityHighlight,
  BehaviorStatement
} from '../../types';
import UnifiedDataService from '../../services/unifiedDataService';
import { DataMigrationUtility } from '../../utils/dataMigration';

interface BehaviorCommitmentsProps {
  currentDate: Date;
  students: Student[];
  todayCheckIn?: DailyCheckInType | null;
  onUpdateCheckIn?: (checkIn: DailyCheckInType) => void;
  onNext: () => void;
  onBack: () => void;
  selectedVideos?: string[]; // NEW: Video integration from Hub
  behaviorSettings?: {
    statements: string[];
    enabled: boolean;
  };
}

const BehaviorCommitments: React.FC<BehaviorCommitmentsProps> = ({
  currentDate,
  students,
  todayCheckIn,
  onUpdateCheckIn,
  onNext,
  onBack,
  selectedVideos = [],
  behaviorSettings
}) => {
  // State management
  const [behaviorStatements, setBehaviorStatements] = useState<BehaviorStatement[]>([]);
  const [studentChoices, setStudentChoices] = useState<{ [studentId: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic screen sizing - SmartboardDisplay compatible pattern
  const availableHeight = window.innerHeight - 140; // Account for header/footer
  const contentHeight = availableHeight - 120; // Space for navigation

  useEffect(() => {
    loadBehaviorStatements();
  }, [behaviorSettings]);

  const loadBehaviorStatements = async () => {
    setIsLoading(true);
    try {
      // Use settings from Hub if available, otherwise load from storage
      if (behaviorSettings?.enabled && behaviorSettings.statements) {
        const statements = behaviorSettings.statements.map((statement, index) => ({
          id: `statement-${index}`,
          text: statement,
          isActive: true
        }));
        setBehaviorStatements(statements);
      } else {
        // Fallback to existing system
        const settings = UnifiedDataService.getSettings();
        const dailyCheckInSettings = settings?.dailyCheckInSettings;
        
        if (dailyCheckInSettings?.behaviorStatements) {
          setBehaviorStatements(dailyCheckInSettings.behaviorStatements);
        } else {
          // Default statements
          setBehaviorStatements([
            { id: '1', text: 'I will be kind to others', isActive: true },
            { id: '2', text: 'I will listen when others are speaking', isActive: true },
            { id: '3', text: 'I will raise my hand before speaking', isActive: true },
            { id: '4', text: 'I will do my best work', isActive: true }
          ]);
        }
      }
      
      // Load existing choices
      if (todayCheckIn?.behaviorChoices) {
        const choices: { [studentId: string]: string } = {};
        todayCheckIn.behaviorChoices.forEach(choice => {
          choices[choice.studentId] = choice.statementId;
        });
        setStudentChoices(choices);
      }
    } catch (error) {
      console.error('Error loading behavior statements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentChoice = (studentId: string, statementId: string) => {
    const newChoices = { ...studentChoices, [studentId]: statementId };
    setStudentChoices(newChoices);

    // Update check-in data if callback provided
    if (todayCheckIn && onUpdateCheckIn) {
      const behaviorChoices = Object.entries(newChoices).map(([sId, sStatementId]) => ({
        studentId: sId,
        statementId: sStatementId,
        timestamp: new Date().toISOString()
      }));

      const updatedCheckIn = {
        ...todayCheckIn,
        behaviorChoices,
        updatedAt: new Date().toISOString()
      };

      onUpdateCheckIn(updatedCheckIn);
    }
  };

  const openVideo = (videoUrl: string, index: number) => {
    window.open(videoUrl, `video-window-${index}`, 'width=800,height=600,scrollbars=yes,resizable=yes');
  };

  const getCompletionPercentage = () => {
    const totalStudents = students.length;
    const completedChoices = Object.keys(studentChoices).length;
    return totalStudents > 0 ? Math.round((completedChoices / totalStudents) * 100) : 0;
  };

  const isComplete = students.length > 0 && Object.keys(studentChoices).length === students.length;

  if (isLoading) {
    return (
      <div style={{
        height: `${availableHeight}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <div style={{ fontSize: '1.5rem' }}>Loading Behavior Commitments...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: `${availableHeight}px`,
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* Video Section - NEW: Simple video buttons at top */}
      {selectedVideos && selectedVideos.length > 0 && (
        <div style={{
          padding: '1rem 2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: '600', fontSize: '1rem' }}>📹 Behavior Videos:</span>
          {selectedVideos.map((video, index) => (
            <button
              key={index}
              onClick={() => openVideo(video, index)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ▶️ Play Video {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '2rem 2rem 1rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: '700',
          margin: '0 0 0.5rem 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          💪 Behavior Commitments
        </h1>
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          opacity: 0.9,
          margin: 0
        }}>
          Choose one positive behavior to focus on today
        </p>
        
        {/* Progress Indicator */}
        <div style={{
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            {Object.keys(studentChoices).length} of {students.length} students complete
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            {getCompletionPercentage()}% 
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '0 2rem',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        {/* Behavior Statements */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            fontWeight: '600',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Today's Behavior Focus Options:
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {behaviorStatements.filter(stmt => stmt.isActive).map((statement) => (
              <div
                key={statement.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  textAlign: 'center',
                  fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
                  fontWeight: '500'
                }}
              >
                {statement.text}
              </div>
            ))}
          </div>
        </div>

        {/* Student Selection Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          paddingBottom: '2rem'
        }}>
          {students.map((student) => (
            <div
              key={student.id}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                transform: studentChoices[student.id] ? 'scale(1.02)' : 'scale(1)',
                boxShadow: studentChoices[student.id] 
                  ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '0.5rem'
                }}>
                  {student.emoji || '👤'}
                </div>
                <h4 style={{
                  fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                  fontWeight: '600',
                  margin: 0
                }}>
                  {student.name}
                </h4>
                {studentChoices[student.id] && (
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '2rem'
                  }}>
                    ✅
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {behaviorStatements.filter(stmt => stmt.isActive).map((statement) => (
                  <button
                    key={statement.id}
                    onClick={() => handleStudentChoice(student.id, statement.id)}
                    style={{
                      background: studentChoices[student.id] === statement.id 
                        ? 'rgba(46, 204, 113, 0.8)' 
                        : 'rgba(255, 255, 255, 0.2)',
                      border: studentChoices[student.id] === statement.id 
                        ? '2px solid #27ae60' 
                        : '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '0.75rem',
                      fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
                      cursor: 'pointer',
                      fontWeight: studentChoices[student.id] === statement.id ? '600' : '500',
                      transition: 'all 0.3s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (studentChoices[student.id] !== statement.id) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (studentChoices[student.id] !== statement.id) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      }
                    }}
                  >
                    {studentChoices[student.id] === statement.id && '✓ '}
                    {statement.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div style={{
        padding: '1.5rem 2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            color: 'white',
            padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Back
        </button>

        <button
          onClick={onNext}
          disabled={!isComplete}
          style={{
            background: isComplete 
              ? 'linear-gradient(145deg, #28a745, #20c997)' 
              : 'rgba(255, 255, 255, 0.1)',
            border: isComplete 
              ? 'none' 
              : '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            color: isComplete ? 'white' : 'rgba(255, 255, 255, 0.5)',
            padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
            fontWeight: '600',
            cursor: isComplete ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            opacity: isComplete ? 1 : 0.6,
            boxShadow: isComplete ? '0 4px 15px rgba(40, 167, 69, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (isComplete) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (isComplete) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
            }
          }}
        >
          {isComplete ? 'Continue →' : `Continue (${Object.keys(studentChoices).length}/${students.length})`}
        </button>
      </div>
    </div>
  );
};

export default BehaviorCommitments;
import React, { useState, useEffect } from 'react';
import { Student, StaffMember, GroupAssignment, SavedActivity } from '../../types';
import TransitionDisplay from './TransitionDisplay';
import EnhancedAbsentStudentsDisplay from './AbsentStudentsDisplay';
import OutOfClassDisplay from './OutOfClassDisplay';
import { useResourceSchedule } from '../../services/ResourceScheduleManager';
import UnifiedDataService, { UnifiedStudent, UnifiedStaff } from '../../services/unifiedDataService';
import ChoiceDataManager, { StudentChoice } from '../../utils/choiceDataManager';

// Utility function to get today's behavior commitments
const getTodaysBehaviorCommitments = (): { [studentId: string]: string } => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const savedCheckIns = localStorage.getItem('dailyCheckIns');
    
    if (savedCheckIns) {
      const checkIns = JSON.parse(savedCheckIns);
      const todayCheckIn = checkIns.find((checkin: any) => checkin.date === today);
      
      if (todayCheckIn?.behaviorCommitments) {
        const commitments: { [studentId: string]: string } = {};
        
        todayCheckIn.behaviorCommitments.forEach((commitment: any) => {
          if (commitment.studentId && commitment.commitment) {
            commitments[commitment.studentId] = commitment.commitment;
          }
        });
        
        console.log('📊 Found behavior commitments for today:', commitments);
        return commitments;
      }
    }
    
    console.log('ℹ️ No behavior commitments found for today');
    return {};
  } catch (error) {
    console.error('❌ Error loading behavior commitments:', error);
    return {};
  }
};

// =============================================================================
// WHOLE CLASS DISPLAY COMPONENTS
// =============================================================================

// Achievement Badge for Whole Class
const WholeClassAchievementBadge: React.FC<{ studentId: string }> = ({ studentId }) => {
  const [isAchieved, setIsAchieved] = useState(false);

  useEffect(() => {
    const checkAchievement = () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const savedCheckIns = localStorage.getItem('dailyCheckIns');
        
        if (savedCheckIns) {
          const checkIns = JSON.parse(savedCheckIns);
          const todayCheckIn = checkIns.find((checkin: any) => checkin.date === today);
          
          if (todayCheckIn?.behaviorCommitments) {
            const studentCommitment = todayCheckIn.behaviorCommitments.find(
              (commitment: any) => commitment.studentId === studentId
            );
            
            setIsAchieved(studentCommitment?.achieved || false);
          }
        }
      } catch (error) {
        console.error('Error checking achievement:', error);
      }
    };

    checkAchievement();
    
    // Check for updates every 30 seconds
    const interval = setInterval(checkAchievement, 30000);
    
    return () => clearInterval(interval);
  }, [studentId]);

  if (!isAchieved) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem',
      boxShadow: '0 2px 8px rgba(251, 191, 36, 0.4)',
      animation: 'pulse 2s infinite',
      border: '2px solid rgba(255, 255, 255, 0.3)'
    }}>
      ⭐
    </div>
  );
};

// Regular Student Card for Whole Class (with Behavior Statements)
const WholeClassStudentCard: React.FC<{ student: Student; showBehaviorStatements: boolean }> = ({ student, showBehaviorStatements }) => {
  const [behaviorCommitment, setBehaviorCommitment] = useState<string>('');
  const [isAchieved, setIsAchieved] = useState(false);

  useEffect(() => {
    // Get today's behavior commitment for this student
    const getTodaysCommitment = () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const savedCheckIns = localStorage.getItem('dailyCheckIns');
        
        if (savedCheckIns) {
          const checkIns = JSON.parse(savedCheckIns);
          const todayCheckIn = checkIns.find((checkin: any) => checkin.date === today);
          
          if (todayCheckIn?.behaviorCommitments) {
            const studentCommitment = todayCheckIn.behaviorCommitments.find(
              (commitment: any) => commitment.studentId === student.id
            );
            
            if (studentCommitment?.commitment) {
              setBehaviorCommitment(studentCommitment.commitment);
              setIsAchieved(studentCommitment?.achieved || false);
            }
          }
        }
      } catch (error) {
        console.error('Error loading behavior commitment:', error);
      }
    };

    getTodaysCommitment();
  }, [student.id]);

  // Toggle achievement function
  const toggleStudentAchievement = (studentId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedCheckIns = localStorage.getItem('dailyCheckIns');
      
      if (!savedCheckIns) return;
      
      const checkIns = JSON.parse(savedCheckIns);
      const todayCheckInIndex = checkIns.findIndex((checkin: any) => checkin.date === today);
      
      if (todayCheckInIndex === -1) return;
      
      const todayCheckIn = checkIns[todayCheckInIndex];
      
      if (todayCheckIn.behaviorCommitments) {
        const commitmentIndex = todayCheckIn.behaviorCommitments.findIndex(
          (commitment: any) => commitment.studentId === studentId
        );
        
        if (commitmentIndex !== -1) {
          // Toggle the achieved status
          const newAchievedStatus = !todayCheckIn.behaviorCommitments[commitmentIndex].achieved;
          todayCheckIn.behaviorCommitments[commitmentIndex].achieved = newAchievedStatus;
          todayCheckIn.behaviorCommitments[commitmentIndex].achievedAt = newAchievedStatus 
            ? new Date().toISOString() 
            : null;
          
          // Update the check-in data
          todayCheckIn.updatedAt = new Date().toISOString();
          checkIns[todayCheckInIndex] = todayCheckIn;
          
          // Save back to localStorage
          localStorage.setItem('dailyCheckIns', JSON.stringify(checkIns));
          
          // Update local state
          setIsAchieved(newAchievedStatus);
          
          console.log(`🎯 ${newAchievedStatus ? 'Achieved' : 'Unachieved'} goal for ${student.name}`);
        }
      }
    } catch (error) {
      console.error('Error toggling achievement:', error);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '1.5rem',
      textAlign: 'center',
      border: '2px solid rgba(40, 167, 69, 0.4)', // Green for whole class
      transition: 'transform 0.2s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      minHeight: (showBehaviorStatements && behaviorCommitment) ? '180px' : '120px'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.02)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
    }}
    >
      {/* Student Photo/Avatar */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: student.photo ? 'transparent' : 'linear-gradient(135deg, #28a745, #20c997)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        margin: '0 auto 1rem auto',
        border: '3px solid #28a745',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
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
            color: 'white', 
            fontWeight: '700',
            fontSize: '1.2rem'
          }}>
            {student.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Student Name */}
      <div style={{
        fontSize: '1.1rem',
        fontWeight: '700',
        color: 'white',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        marginBottom: (showBehaviorStatements && behaviorCommitment) ? '1rem' : '0'
      }}>
        {student.name}
      </div>

      {/* Enhanced Behavior Commitment Statement with Toggle */}
      {showBehaviorStatements && behaviorCommitment && (
        <div 
          onClick={() => toggleStudentAchievement(student.id)}
          style={{
            background: isAchieved 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3))' 
              : 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '0.75rem',
            border: isAchieved 
              ? '2px solid rgba(34, 197, 94, 0.8)' 
              : '1px solid rgba(40, 167, 69, 0.6)',
            backdropFilter: 'blur(5px)',
            marginTop: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Achievement Indicator */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontSize: '1.2rem',
            opacity: isAchieved ? 1 : 0.3,
            transition: 'all 0.3s ease'
          }}>
            ⭐
          </div>

          {/* Goal Label */}
          <div style={{
            fontSize: '0.7rem',
            fontWeight: '600',
            color: isAchieved 
              ? 'rgba(34, 197, 94, 1)' 
              : 'rgba(255, 255, 255, 0.8)',
            marginBottom: '0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <span>{isAchieved ? '✅ Completed' : '🎯 Today\'s Goal'}</span>
          </div>

          {/* Statement Text */}
          <div style={{
            fontSize: '0.85rem',
            fontWeight: '600',
            color: 'white',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            fontStyle: 'italic',
            lineHeight: '1.3',
            textDecoration: isAchieved ? 'line-through' : 'none',
            opacity: isAchieved ? 0.8 : 1,
            transition: 'all 0.3s ease'
          }}>
            "I will {behaviorCommitment}"
          </div>

          {/* Tap Hint */}
          <div style={{
            fontSize: '0.6rem',
            color: 'rgba(255, 255, 255, 0.6)',
            marginTop: '0.5rem',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {isAchieved ? 'Tap to undo' : 'Tap when achieved'}
          </div>

          {/* Success Animation Effect */}
          {isAchieved && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(255, 215, 0, 0.2) 50%, transparent 70%)',
              animation: 'shimmer 2s ease-in-out infinite',
              pointerEvents: 'none'
            }} />
          )}
        </div>
      )}

      {/* Achievement Badge */}
      <WholeClassAchievementBadge studentId={student.id} />
    </div>
  );
};

// Compact Student Card for Many Students
const CompactWholeClassStudentCard: React.FC<{ student: Student; showBehaviorStatements: boolean }> = ({ student, showBehaviorStatements }) => {
  const [behaviorCommitment, setBehaviorCommitment] = useState<string>('');
  const [isAchieved, setIsAchieved] = useState(false);

  useEffect(() => {
    // Same behavior commitment loading logic as above
    const getTodaysCommitment = () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const savedCheckIns = localStorage.getItem('dailyCheckIns');
        
        if (savedCheckIns) {
          const checkIns = JSON.parse(savedCheckIns);
          const todayCheckIn = checkIns.find((checkin: any) => checkin.date === today);
          
          if (todayCheckIn?.behaviorCommitments) {
            const studentCommitment = todayCheckIn.behaviorCommitments.find(
              (commitment: any) => commitment.studentId === student.id
            );
            
            if (studentCommitment?.commitment) {
              setBehaviorCommitment(studentCommitment.commitment);
              setIsAchieved(studentCommitment?.achieved || false);
            }
          }
        }
      } catch (error) {
        console.error('Error loading behavior commitment:', error);
      }
    };

    getTodaysCommitment();
  }, [student.id]);

  // Toggle achievement function
  const toggleStudentAchievement = (studentId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedCheckIns = localStorage.getItem('dailyCheckIns');
      
      if (!savedCheckIns) return;
      
      const checkIns = JSON.parse(savedCheckIns);
      const todayCheckInIndex = checkIns.findIndex((checkin: any) => checkin.date === today);
      
      if (todayCheckInIndex === -1) return;
      
      const todayCheckIn = checkIns[todayCheckInIndex];
      
      if (todayCheckIn.behaviorCommitments) {
        const commitmentIndex = todayCheckIn.behaviorCommitments.findIndex(
          (commitment: any) => commitment.studentId === studentId
        );
        
        if (commitmentIndex !== -1) {
          // Toggle the achieved status
          const newAchievedStatus = !todayCheckIn.behaviorCommitments[commitmentIndex].achieved;
          todayCheckIn.behaviorCommitments[commitmentIndex].achieved = newAchievedStatus;
          todayCheckIn.behaviorCommitments[commitmentIndex].achievedAt = newAchievedStatus 
            ? new Date().toISOString() 
            : null;
          
          // Update the check-in data
          todayCheckIn.updatedAt = new Date().toISOString();
          checkIns[todayCheckInIndex] = todayCheckIn;
          
          // Save back to localStorage
          localStorage.setItem('dailyCheckIns', JSON.stringify(checkIns));
          
          // Update local state
          setIsAchieved(newAchievedStatus);
          
          console.log(`🎯 ${newAchievedStatus ? 'Achieved' : 'Unachieved'} goal for ${student.name}`);
        }
      }
    } catch (error) {
      console.error('Error toggling achievement:', error);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '1rem',
      border: '2px solid rgba(40, 167, 69, 0.4)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      minHeight: '100px',
      transition: 'transform 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.02)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
    }}
    >
      {/* Header with photo and name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: (showBehaviorStatements && behaviorCommitment) ? '8px' : '0'
      }}>
        {/* Student Photo */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: student.photo ? 'transparent' : 'linear-gradient(135deg, #28a745, #20c997)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #28a745',
          overflow: 'hidden',
          flexShrink: 0
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
              color: 'white', 
              fontWeight: '700',
              fontSize: '1rem'
            }}>
              {student.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Student Name */}
        <div style={{
          fontSize: '1rem',
          fontWeight: '700',
          color: 'white',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {student.name}
        </div>
      </div>

      {/* Enhanced Compact Behavior Statement with Toggle */}
      {showBehaviorStatements && behaviorCommitment && (
        <div 
          onClick={() => toggleStudentAchievement(student.id)}
          style={{
            background: isAchieved 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))' 
              : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '6px 8px',
            border: isAchieved 
              ? '1px solid rgba(34, 197, 94, 0.6)' 
              : '1px solid rgba(40, 167, 69, 0.4)',
            fontSize: '0.75rem',
            fontWeight: '500',
            color: 'white',
            fontStyle: 'italic',
            lineHeight: '1.2',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textDecoration: isAchieved ? 'line-through' : 'none',
            opacity: isAchieved ? 0.8 : 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {/* Achievement Icon */}
          <span style={{
            fontSize: '0.9rem',
            opacity: isAchieved ? 1 : 0.4,
            transition: 'all 0.3s ease'
          }}>
            {isAchieved ? '✅' : '⭐'}
          </span>
          
          {/* Statement Text */}
          <span style={{ 
            flex: 1, 
            minWidth: 0,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            "I will {behaviorCommitment}"
          </span>
        </div>
      )}

      {/* Achievement Badge */}
      <WholeClassAchievementBadge studentId={student.id} />
    </div>
  );
};

// Main Whole Class Display Component
const WholeClassDisplay: React.FC<{
  students: Student[];
  activityName: string;
  showBehaviorStatements: boolean;
}> = ({ students, activityName, showBehaviorStatements }) => {
  // Filter out absent students
  const absentStudentIds = UnifiedDataService.getAbsentStudentsToday();
  const presentStudents = students.filter(student => !absentStudentIds.includes(student.id));
  
  // Determine if we should use compact mode (more than 8 students)
  const useCompactMode = presentStudents.length > 8;

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '2rem',
      border: '4px solid #28a745',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
        <h3 style={{
          margin: '0 0 1rem 0',
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          Whole Class Activity
        </h3>
        <p style={{
          margin: '0 0 1.5rem 0',
          fontSize: '1.3rem',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '500'
        }}>
          All {presentStudents.length} students participate together
        </p>
        
        {/* Show absent count if any */}
        {absentStudentIds.length > 0 && (
          <p style={{
            margin: '0',
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.7)',
            fontStyle: 'italic'
          }}>
            ({absentStudentIds.length} student{absentStudentIds.length !== 1 ? 's' : ''} absent today)
          </p>
        )}
      </div>

      {/* Student Grid */}
      {presentStudents.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: useCompactMode 
            ? 'repeat(auto-fit, minmax(140px, 1fr))' 
            : 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: useCompactMode ? '1rem' : '1.5rem',
          marginTop: '1rem'
        }}>
          {presentStudents.map((student) => (
            useCompactMode ? (
              <CompactWholeClassStudentCard
                key={student.id}
                student={student}
                showBehaviorStatements={showBehaviorStatements}
              />
            ) : (
              <WholeClassStudentCard
                key={student.id}
                student={student}
                showBehaviorStatements={showBehaviorStatements}
              />
            )
          ))}
        </div>
      )}
      
      {/* No students message */}
      {presentStudents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '1.1rem'
        }}>
          No students present for this activity
        </div>
      )}
    </div>
  );
};

// Achievement Badge Component
const BehaviorAchievementBadge: React.FC<{
  studentId: string;
  groupColor: string;
}> = ({ studentId, groupColor }) => {
  const [isAchieved, setIsAchieved] = useState(false);

  useEffect(() => {
    // Check if student achieved their behavior commitment today
    const checkAchievement = () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const savedCheckIns = localStorage.getItem('dailyCheckIns');
        
        if (savedCheckIns) {
          const checkIns = JSON.parse(savedCheckIns);
          const todayCheckIn = checkIns.find((checkin: any) => checkin.date === today);
          
          if (todayCheckIn?.behaviorCommitments) {
            const studentCommitment = todayCheckIn.behaviorCommitments.find(
              (commitment: any) => commitment.studentId === studentId
            );
            
            setIsAchieved(studentCommitment?.achieved || false);
          }
        }
      } catch (error) {
        console.error('Error checking achievement:', error);
      }
    };

    checkAchievement();
    
    // Set up interval to check for updates
    const interval = setInterval(checkAchievement, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [studentId]);

  if (!isAchieved) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem',
      boxShadow: '0 2px 8px rgba(251, 191, 36, 0.4)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      animation: 'pulse 2s infinite'
    }}>
      ⭐
    </div>
  );
};

// Enhanced Student Card with Behavior Statement
const StudentCardWithBehavior: React.FC<{ 
  student: Student; 
  groupColor: string;
  showBehaviorStatement?: boolean;
}> = ({ 
  student, 
  groupColor, 
  showBehaviorStatement = true 
}) => {
  const [behaviorCommitment, setBehaviorCommitment] = useState<string>('');

  useEffect(() => {
    if (showBehaviorStatement) {
      const todaysCommitments = getTodaysBehaviorCommitments();
      const commitment = todaysCommitments[student.id];
      setBehaviorCommitment(commitment || '');
    }
  }, [student.id, showBehaviorStatement]);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '1.5rem',
      textAlign: 'center',
      border: `2px solid ${groupColor}40`,
      transition: 'transform 0.2s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      minHeight: behaviorCommitment ? '180px' : '120px'
    }}>
      {/* Student Photo/Avatar */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: student.photo ? 'transparent' : `linear-gradient(135deg, ${groupColor}80, ${groupColor})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        margin: '0 auto 1rem auto',
        border: `3px solid ${groupColor}`,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
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
            color: 'white', 
            fontWeight: '700',
            fontSize: '1.2rem'
          }}>
            {student.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Student Name */}
      <div style={{
        fontSize: '1.1rem',
        fontWeight: '700',
        color: 'white',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        marginBottom: behaviorCommitment ? '1rem' : '0'
      }}>
        {student.name}
      </div>

      {/* Behavior Commitment Statement */}
      {showBehaviorStatement && behaviorCommitment && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '0.75rem',
          border: `1px solid ${groupColor}60`,
          backdropFilter: 'blur(5px)',
          marginTop: '0.5rem',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Today's Goal
          </div>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: '600',
            color: 'white',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            fontStyle: 'italic',
            lineHeight: '1.3'
          }}>
            "I will {behaviorCommitment}"
          </div>
        </div>
      )}

      {/* Achievement Badge (if completed) */}
      {showBehaviorStatement && behaviorCommitment && (
        <BehaviorAchievementBadge 
          studentId={student.id} 
          groupColor={groupColor}
        />
      )}
    </div>
  );
};

// Compact Student Card for when there are many students
const CompactStudentCardWithBehavior: React.FC<{ 
  student: Student; 
  groupColor: string;
}> = ({ student, groupColor }) => {
  const [behaviorCommitment, setBehaviorCommitment] = useState<string>('');

  useEffect(() => {
    const todaysCommitments = getTodaysBehaviorCommitments();
    const commitment = todaysCommitments[student.id];
    setBehaviorCommitment(commitment || '');
  }, [student.id]);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '1rem',
      border: `2px solid ${groupColor}40`,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      minHeight: '100px'
    }}>
      {/* Header with photo and name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: behaviorCommitment ? '8px' : '0'
      }}>
        {/* Student Photo */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: student.photo ? 'transparent' : `linear-gradient(135deg, ${groupColor}80, ${groupColor})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${groupColor}`,
          overflow: 'hidden',
          flexShrink: 0
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
              color: 'white', 
              fontWeight: '700',
              fontSize: '1rem'
            }}>
              {student.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Student Name */}
        <div style={{
          fontSize: '1rem',
          fontWeight: '700',
          color: 'white',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {student.name}
        </div>
      </div>

      {/* Behavior Statement */}
      {behaviorCommitment && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '6px 8px',
          border: `1px solid ${groupColor}40`,
          fontSize: '0.75rem',
          fontWeight: '500',
          color: 'white',
          fontStyle: 'italic',
          lineHeight: '1.2',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          "I will {behaviorCommitment}"
        </div>
      )}

      {/* Achievement Badge */}
      <BehaviorAchievementBadge 
        studentId={student.id} 
        groupColor={groupColor}
      />
    </div>
  );
};

interface SmartboardDisplayProps {
  isActive: boolean;
  currentSchedule?: {
    activities: SavedActivity[];
    startTime: string;
    name: string;
  };
  staff?: StaffMember[];
  students?: Student[];
}

const SmartboardDisplay: React.FC<SmartboardDisplayProps> = ({
  isActive,
  currentSchedule,
  staff = [],
  students = []
}) => {
  // 🎯 CRITICAL: ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  // State management - MUST be at the top, always called
  const [realStudents, setRealStudents] = useState<Student[]>(() => {
    // Initialize with data immediately
    try {
      const legacyStudents = localStorage.getItem('students');
      if (legacyStudents) {
        const students = JSON.parse(legacyStudents);
        if (Array.isArray(students)) {
          console.log('🎯 INITIALIZED with students:', students.length);
          return students;
        }
      }
    } catch (error) {
      console.error('🎯 Initialization failed:', error);
    }
    return [];
  });
  const [realStaff, setRealStaff] = useState<StaffMember[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [isRunning, setIsRunning] = useState(false);
  const [fallbackSchedule, setFallbackSchedule] = useState<any>(null);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [todayChoices, setTodayChoices] = useState<StudentChoice[]>([]);
  const [showBehaviorStatements, setShowBehaviorStatements] = useState(true);
  
  // Get current pull-outs from resource schedule
  const { getCurrentPullOuts } = useResourceSchedule();
  const currentPullOuts = getCurrentPullOuts();

  // 🔧 CRITICAL FIX: Load schedule from localStorage with group preservation
  useEffect(() => {
    console.log('🖥️ SmartboardDisplay - Loading schedule data...');
    
    if (!currentSchedule) {
      console.log('🔍 No currentSchedule provided, loading from localStorage...');
      
      // Try multiple possible localStorage keys
      const possibleKeys = ['scheduleVariations', 'saved_schedules', 'schedules'];
      
      for (const key of possibleKeys) {
        try {
          const saved = localStorage.getItem(key);
          if (saved) {
            const schedules = JSON.parse(saved);
            console.log(`📋 Found ${schedules.length} schedules in '${key}'`);
            
            if (schedules.length > 0) {
              // Use the most recent schedule
              const mostRecent = schedules
                .filter((s: any) => s.lastUsed)
                .sort((a: any, b: any) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())[0];
              
              const scheduleToUse = mostRecent || schedules[0];
              console.log('🎯 Using schedule:', scheduleToUse.name);
              
              // 🎯 CRITICAL: Preserve groupAssignments when loading
              const loadedActivities = (scheduleToUse.activities || []).map((activity: any) => ({
                ...activity,
                // Ensure groupAssignments are preserved
                groupAssignments: activity.groupAssignments || activity.assignment?.groupAssignments || []
              }));
              
              console.log('🔄 Loaded activities with groups:', loadedActivities.map((a: any) => ({
                name: a.name,
                groupCount: a.groupAssignments?.length || 0,
                groups: a.groupAssignments
              })));
              
              setFallbackSchedule({
                activities: loadedActivities,
                startTime: scheduleToUse.startTime || '09:00',
                name: scheduleToUse.name || 'Untitled Schedule'
              });
              break;
            }
          }
        } catch (error) {
          console.error(`Error loading from ${key}:`, error);
        }
      }
    } else {
      // 🎯 CRITICAL: Also preserve groupAssignments from currentSchedule prop
      console.log('📥 Using provided currentSchedule, preserving groups...');
      const preservedActivities = (currentSchedule.activities || []).map((activity: any) => ({
        ...activity,
        groupAssignments: activity.groupAssignments || activity.assignment?.groupAssignments || []
      }));
      
      console.log('🔄 Preserved activities from props:', preservedActivities.map((a: any) => ({
        name: a.name,
        groupCount: a.groupAssignments?.length || 0
      })));
    }
  }, [currentSchedule]);

  // Replace the existing useEffect around line 117-208 with this:
useEffect(() => {
  console.log('🖥️ SmartboardDisplay - Loading student and staff data...');
  
  const loadStudentData = async () => {
    let studentsToUse: any[] = [];
    let staffToUse: any[] = [];

    try {
      // Primary: Load from UnifiedDataService
      const unifiedStudents = UnifiedDataService.getAllStudents();
      const unifiedStaff = UnifiedDataService.getAllStaff();
      
      console.log('📚 Loaded students from UnifiedDataService:', unifiedStudents.length);
      console.log('👨‍🏫 Loaded staff from UnifiedDataService:', unifiedStaff.length);
      
      if (unifiedStudents.length > 0) {
        studentsToUse = unifiedStudents;
      }
      if (unifiedStaff.length > 0) {
        staffToUse = unifiedStaff;
      }
    } catch (error) {
      console.error('❌ Error loading from UnifiedDataService:', error);
    }

    // Fallback: Use props if UnifiedDataService fails
    if (studentsToUse.length === 0 && students && students.length > 0) {
      console.log('📚 Fallback: Using students from props:', students.length);
      studentsToUse = students;
    }
    
    if (staffToUse.length === 0 && staff && staff.length > 0) {
      console.log('👨‍🏫 Fallback: Using staff from props:', staff.length);
      staffToUse = staff;
    }

    // Emergency fallback: Direct localStorage access
    if (studentsToUse.length === 0) {
      console.log('🆘 Emergency fallback: Reading directly from localStorage...');
      try {
        const legacyStudents = localStorage.getItem('students');
        if (legacyStudents) {
          const parsedStudents = JSON.parse(legacyStudents);
          if (Array.isArray(parsedStudents) && parsedStudents.length > 0) {
            console.log('🆘 Using emergency student data:', parsedStudents.length);
            studentsToUse = parsedStudents;
          }
        }
      } catch (error) {
        console.error('🆘 Emergency fallback failed:', error);
      }
    }

    // Update state with loaded data - USE SETTIMEOUT TO AVOID REACT BATCHING ISSUES
    console.log('🔄 Setting student state:', studentsToUse.length, 'students');
    
    setTimeout(() => {
      setRealStudents(studentsToUse);
      setRealStaff(staffToUse);
      console.log('✅ State set via setTimeout');
    }, 0);
  };

  loadStudentData();
}, [isActive]); // Depend on isActive instead of empty array


  // Timer countdown effect (moved after hooks)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  // 🎯 AFTER ALL HOOKS: Now calculate derived values
  const activeSchedule = currentSchedule || fallbackSchedule;
  const currentActivity = activeSchedule?.activities[currentActivityIndex];

  // Set initial timer when activity changes
  useEffect(() => {
    if (currentActivity && currentActivity.duration) {
      setTimeRemaining(currentActivity.duration * 60);
    }
  }, [currentActivityIndex, currentActivity]);

  // Timer control functions (moved after hooks)
  const onTimerControl = (action: string) => {
    switch (action) {
      case 'play':
        setIsRunning(true);
        break;
      case 'pause':
        setIsRunning(false);
        break;
      case 'reset':
        setTimeRemaining(currentActivity?.duration ? currentActivity.duration * 60 : 1800);
        setIsRunning(false);
        break;
      case 'next':
        if (currentActivityIndex < (activeSchedule?.activities.length || 0) - 1) {
          setCurrentActivityIndex(prev => prev + 1);
          const nextActivity = activeSchedule?.activities[currentActivityIndex + 1];
          setTimeRemaining(nextActivity?.duration * 60 || 1800);
          setIsRunning(false);
        }
        break;
      case 'previous':
        if (currentActivityIndex > 0) {
          setCurrentActivityIndex(prev => prev - 1);
          const prevActivity = activeSchedule?.activities[currentActivityIndex - 1];
          setTimeRemaining(prevActivity?.duration * 60 || 1800);
          setIsRunning(false);
        }
        break;
    }
  };

  // Helper functions for group display
  const getStudentById = (studentId: string): Student | undefined => {
    return [...realStudents, ...students].find(s => s.id === studentId);
  };

  const getStaffById = (staffId: string): StaffMember | undefined => {
    return [...realStaff, ...staff].find(s => s.id === staffId);
  };

  // Helper functions
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    const percentage = currentActivity ? (timeRemaining / (currentActivity.duration * 60)) * 100 : 100;
    if (percentage > 50) return '#4CAF50';
    if (percentage > 25) return '#FF9800';
    return '#f44336';
  };

  // 🔍 DEBUG LOGGING (moved after hooks)
  console.log('🔍 DIRECT Activity Property Check:', {
    activityName: currentActivity?.name,
    hasIsTransition: currentActivity?.hasOwnProperty('isTransition'),
    isTransitionValue: currentActivity?.isTransition,
    allProperties: Object.keys(currentActivity || {}),
    category: currentActivity?.category,
    fullActivity: currentActivity
  });

  // 🎯 ENHANCED TRANSITION DETECTION (moved after hooks)
  const isTransitionActivity = 
    currentActivity?.isTransition === true ||  // Primary check
    (currentActivity?.category === 'transition' && 
     currentActivity?.transitionType) ||       // Fallback: category + transitionType
    (currentActivity?.category === 'transition' && 
     currentActivity?.animationStyle) ||       // Fallback: category + animationStyle
    (currentActivity?.name && 
     ['Movement Break', 'Brain Break', 'Transition Time', 'Get Ready', 'Clean Up Time']
     .includes(currentActivity.name));         // Fallback: known transition activity names

  // 🎯 CHOICE ITEM TIME DETECTION
  const isChoiceItemTime = currentActivity?.name === 'Choice Item Time' || 
                          (currentActivity?.category === 'system' && currentActivity?.name?.includes('Choice'));

  // Load today's choice assignments when Choice Item Time is active
  useEffect(() => {
    if (isChoiceItemTime) {
      const choiceDataManager = ChoiceDataManager.getInstance();
      const choices = choiceDataManager.getTodayChoices();
      setTodayChoices(choices);
      console.log(`🎯 Loaded ${choices.length} choice assignments for Choice Item Time`);
    }
  }, [isChoiceItemTime, currentActivityIndex]);



  // 🎯 NOW SAFE TO HAVE EARLY RETURNS - All hooks have been called
  if (!isActive) {
    return null;
  }

  // 🔧 ISOLATION FIX: Render transition in isolated container
  if (isTransitionActivity && currentActivity) {
    console.log('🎯 SmartboardDisplay - Rendering transition activity:', currentActivity.name);
    
    // Get next activity for preview
    const nextActivity = activeSchedule?.activities[currentActivityIndex + 1];
    
    return (
      <div className="smartboard-display-container" style={{ 
        height: '100vh',
        overflow: 'auto',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem',
        position: 'relative',
        zIndex: 1
      }}>
        <TransitionDisplay
          activity={{
            ...currentActivity,
            // Ensure transition properties exist even if missing
            isTransition: true,
            transitionType: currentActivity.transitionType || 'movement-break',
            animationStyle: currentActivity.animationStyle || 'running-kids',
            showNextActivity: currentActivity.showNextActivity !== false, // Default to true
            movementPrompts: currentActivity.movementPrompts || [
              'Get ready to move! 🏃‍♀️',
              'Stand up and stretch! 🙌',
              'Take a deep breath! 😮‍💨',
              'Prepare for next activity! 🎯'
            ]
          }}
          nextActivity={nextActivity}
          timeRemaining={timeRemaining}
          onTimerControl={onTimerControl}
          isRunning={isRunning}
          previousActivity={activeSchedule?.activities[currentActivityIndex - 1]}
          activityIndex={currentActivityIndex}
          totalActivities={activeSchedule?.activities.length || 1}
        />
      </div>
    );
  }

  if (!activeSchedule || !currentActivity) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        overflow: 'auto',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '1rem'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>📅</div>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>No Schedule Available</h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Please create a schedule in the Schedule Builder first.
        </p>
      </div>
    );
  }

  // Student card component
  const StudentCard: React.FC<{ student: Student; groupColor: string }> = ({ student, groupColor }) => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '1rem',
      textAlign: 'center',
      border: `2px solid ${groupColor}40`,
      transition: 'transform 0.2s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: student.photo ? 'transparent' : `linear-gradient(135deg, ${groupColor}80, ${groupColor})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        margin: '0 auto 0.5rem auto',
        border: `2px solid ${groupColor}`,
        overflow: 'hidden',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)'
      }}>
        {student.photo ? (
          <img src={student.photo} alt={student.name} style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }} />
        ) : (
          <span style={{ color: 'white', fontWeight: '700' }}>👤</span>
        )}
      </div>
      <h6 style={{
        margin: '0',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: 'white',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
      }}>
        {student.name}
      </h6>
    </div>
  );

  // Staff card component
  const StaffCard: React.FC<{ staffMember: StaffMember; groupColor: string }> = ({ staffMember, groupColor }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      background: `linear-gradient(135deg, ${groupColor}15, ${groupColor}25)`,
      borderRadius: '16px',
      padding: '1.25rem',
      border: `2px solid ${groupColor}40`,
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: staffMember.photo ? 'transparent' : `linear-gradient(135deg, ${groupColor}, ${groupColor}CC)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        border: `3px solid ${groupColor}`,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}>
        {staffMember.photo ? (
          <img src={staffMember.photo} alt={staffMember.name} style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }} />
        ) : (
          <span style={{ color: 'white', fontWeight: '700' }}>👨‍🏫</span>
        )}
      </div>
      <div>
        <h5 style={{
          margin: '0 0 0.25rem 0',
          fontSize: '1.2rem',
          fontWeight: '700',
          color: 'white',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
        }}>
          {staffMember.name}
        </h5>
        <p style={{
          margin: '0',
          fontSize: '1rem',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '600'
        }}>
          {staffMember.role}
        </p>
      </div>
    </div>
  );

  // 🎯 Enhanced Group display component with better error handling
  const GroupDisplay: React.FC<{ group: GroupAssignment; groupIndex: number }> = ({ group, groupIndex }) => {
    console.log(`🎨 Rendering group ${groupIndex + 1}:`, group);
    
    // Filter out absent students from group display using UnifiedDataService
    const absentStudentIds = UnifiedDataService.getAbsentStudentsToday();
    const activeStudentIds = (group.studentIds || []).filter((id: string) => 
      !absentStudentIds.includes(id)
    );
    
    const groupStudents = activeStudentIds.map(id => getStudentById(id)).filter(Boolean) as Student[];
    
    // Try multiple ways to get staff
    let staffMember = null;
    if (group.staffId) {
      staffMember = getStaffById(group.staffId);
    } else if (group.staffMember?.id) {
      staffMember = getStaffById(group.staffMember.id) || group.staffMember;
    }
    
    console.log(`👥 Group ${groupIndex + 1} data:`, {
      name: group.groupName,
      color: group.color,
      students: groupStudents.length,
      staff: staffMember?.name || 'None'
    });

    const groupColor = group.color || '#9C27B0';
    const useCompactMode = groupStudents.length > 6;

    return (
      <div style={{
        background: `linear-gradient(135deg, ${groupColor}20, ${groupColor}10)`,
        borderRadius: '20px',
        padding: '2rem',
        border: `4px solid ${groupColor}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            margin: '0',
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            {group.groupName || `Group ${groupIndex + 1}`}
          </h3>
          <div style={{
            background: groupColor,
            borderRadius: '12px',
            padding: '0.5rem 1rem',
            color: 'white',
            fontWeight: '600',
            fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}>
            {groupStudents.length} Student{groupStudents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Staff Member */}
        {staffMember && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'white',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
            }}>
              Staff Member
            </h4>
            <StaffCard staffMember={staffMember} groupColor={groupColor} />
          </div>
        )}

        {/* Students */}
        <div>
          <h4 style={{
            margin: '0 0 1.5rem 0',
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'white',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
          }}>
            Students
          </h4>
          {groupStudents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.1rem',
              fontStyle: 'italic'
            }}>
              No students assigned to this group
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: useCompactMode 
                ? 'repeat(auto-fit, minmax(150px, 1fr))' 
                : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: useCompactMode ? '1rem' : '1.5rem',
              marginTop: '1rem'
            }}>
              {groupStudents.map((student, studentIndex) => (
                useCompactMode ? (
                  <CompactStudentCardWithBehavior
                    key={student.id}
                    student={student}
                    groupColor={groupColor}
                  />
                ) : (
                  <StudentCardWithBehavior
                    key={student.id}
                    student={student}
                    groupColor={groupColor}
                    showBehaviorStatement={showBehaviorStatements}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Debug info for troubleshooting
  const debugInfo = {
    hasAssignment: !!currentActivity?.assignment,
    assignmentType: typeof currentActivity?.assignment,
    assignmentData: currentActivity?.assignment,
    hasDirectGroups: !!(currentActivity?.groupAssignments?.length),
    hasAssignmentGroups: !!(currentActivity?.assignment?.groupAssignments?.length)
  };

  // Get group assignments
  const groupAssignments = currentActivity.groupAssignments || currentActivity.assignment?.groupAssignments || [];

  return (
    <div style={{
      height: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      position: 'relative'
    }}>
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 4px 16px rgba(251, 191, 36, 0.6); }
          100% { transform: scale(1); box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .behavior-statement {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
      {/* Absent Students Display - Top Left Corner */}
      {(() => {
        const absentStudentIds = UnifiedDataService.getAbsentStudentsToday();
        return absentStudentIds.length > 0 && (
          <EnhancedAbsentStudentsDisplay 
            absentStudents={absentStudentIds}
            position="top-left"
            compact={true}
          />
        );
      })()}
      
      {/* Out of Class Display - Top Right Corner */}
      <OutOfClassDisplay studentsInPullOut={currentPullOuts} />
      
      {/* Header */}
      <div style={{
        padding: '1rem',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative'
      }}>
        {/* Behavior Statements Toggle Button */}
        <button
          onClick={() => setShowBehaviorStatements(!showBehaviorStatements)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(5px)'
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
          {showBehaviorStatements ? '👁️ Hide Goals' : '👁️ Show Goals'}
        </button>
        <h1 style={{
          margin: '0 0 1rem 0',
          fontSize: '3rem',
          fontWeight: '700',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          {currentActivity.icon} {currentActivity.name}
        </h1>
        
        {/* Timer */}
        <div style={{
          fontSize: '4rem',
          fontWeight: '700',
          color: getTimerColor(),
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          marginBottom: '1rem'
        }}>
          {formatTime(timeRemaining)}
        </div>

        {/* Timer Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => onTimerControl('previous')}
            disabled={currentActivityIndex === 0}
            style={{
              padding: '1rem 1.5rem',
              fontSize: '1.2rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ⏮️ Previous
          </button>
          
          <button
            onClick={() => onTimerControl(isRunning ? 'pause' : 'play')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              background: isRunning ? '#ff6b6b' : '#51cf66',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {isRunning ? '⏸️ Pause' : '▶️ Play'}
          </button>
          
          <button
            onClick={() => onTimerControl('reset')}
            style={{
              padding: '1rem 1.5rem',
              fontSize: '1.2rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Reset
          </button>
          
          <button
            onClick={() => onTimerControl('next')}
            disabled={currentActivityIndex === (activeSchedule?.activities.length || 0) - 1}
            style={{
              padding: '1rem 1.5rem',
              fontSize: '1.2rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Next ⏭️
          </button>
        </div>

        <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Activity {currentActivityIndex + 1} of {activeSchedule?.activities.length}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {/* 🎯 CHOICE ITEM TIME SPECIAL DISPLAY */}
        {isChoiceItemTime ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '4px solid #f59e0b',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Choice Item Time
            </h3>
            
            {todayChoices.length > 0 ? (
              <>
                <p style={{
                  margin: '0 0 2rem 0',
                  fontSize: '1.3rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '500'
                }}>
                  {todayChoices.length} students assigned to choice activities
                </p>
                
                <button
                  onClick={() => setShowChoiceModal(true)}
                  style={{
                    padding: '1rem 2rem',
                    fontSize: '1.2rem',
                    background: '#f59e0b',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#d97706';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f59e0b';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  📋 View Choice Assignments
                </button>
              </>
            ) : (
              <p style={{
                margin: '0',
                fontSize: '1.3rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '500',
                fontStyle: 'italic'
              }}>
                No choice assignments found for today.<br />
                Complete Daily Check-In to assign students to activities.
              </p>
            )}
          </div>
        ) : groupAssignments.length > 0 ? (
          <>
            <h2 style={{
              textAlign: 'center',
              fontSize: '2.5rem',
              marginBottom: '3rem',
              fontWeight: '600',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Group Assignments
            </h2>
            {groupAssignments.map((group, index) => (
              <GroupDisplay key={group.id || index} group={group} groupIndex={index} />
            ))}
          </>
        ) : (
          <WholeClassDisplay 
            students={realStudents}
            activityName={currentActivity.name}
            showBehaviorStatements={showBehaviorStatements}
          />
        )}
      </div>

      {/* 🎯 CHOICE ASSIGNMENTS MODAL */}
      {showChoiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 16px 50px rgba(0, 0, 0, 0.3)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            minWidth: '600px'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
              paddingBottom: '1rem'
            }}>
              <h2 style={{
                margin: '0',
                fontSize: '2rem',
                fontWeight: '700',
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                🎯 Today's Choice Assignments
              </h2>
              <button
                onClick={() => setShowChoiceModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: 'white',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Choice Activities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(() => {
                // Group choices by activity
                const choicesByActivity: { [activityId: string]: StudentChoice[] } = {};
                todayChoices.forEach(choice => {
                  if (!choicesByActivity[choice.activityId]) {
                    choicesByActivity[choice.activityId] = [];
                  }
                  choicesByActivity[choice.activityId].push(choice);
                });

                return Object.entries(choicesByActivity).map(([activityId, choices]) => {
                  const activity = choices[0]; // Get activity info from first choice
                  return (
                    <div key={activityId} style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      border: '2px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <span style={{ fontSize: '2rem' }}>{activity.activityIcon}</span>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            margin: '0',
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: 'white',
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                          }}>
                            {activity.activityName}
                          </h3>
                          <p style={{
                            margin: '0',
                            fontSize: '1rem',
                            color: 'rgba(255, 255, 255, 0.8)'
                          }}>
                            {choices.length} student{choices.length !== 1 ? 's' : ''} assigned
                          </p>
                        </div>
                      </div>

                      {/* Students assigned to this activity */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1rem'
                      }}>
                        {choices.map(choice => {
                          const student = getStudentById(choice.studentId);
                          return (
                            <div key={choice.studentId} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              background: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              padding: '0.75rem',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: student?.photo ? 'transparent' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '2px solid rgba(255, 255, 255, 0.3)'
                              }}>
                                {student?.photo ? (
                                  <img src={student.photo} alt={choice.studentName} style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }} />
                                ) : (
                                  <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: '700' }}>
                                    {choice.studentName.split(' ').map(n => n[0]).join('')}
                                  </span>
                                )}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  color: 'white',
                                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {choice.studentName}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <button
                onClick={() => setShowChoiceModal(false)}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ← Back to Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartboardDisplay;

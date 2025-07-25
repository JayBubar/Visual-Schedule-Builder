import React from 'react';

// Types matching your project structure
interface Student {
  id: string;
  name: string;
  grade?: string;
  photo?: string | null;
  workingStyle: 'independent' | 'collaborative' | 'guided' | 'needs-support';
  accommodations?: string[];
  behaviorNotes?: string;
  isActive?: boolean;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  photo?: string | null;
  specialties?: string[];
  isActive: boolean;
  startDate: string;
  notes?: string;
  isResourceTeacher?: boolean;
  isRelatedArtsTeacher?: boolean;
}

interface GroupAssignment {
  id: string;
  groupName: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
  staffMember: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  } | null;
  studentIds: string[];
  students?: Student[];
  location: string;
  groupType?: string;
  targetSkills?: string[];
}

interface EnhancedActivity {
  id: string;
  name: string;
  icon: string;
  duration: number;
  category: string;
  description?: string;
  groupingType?: 'whole-class' | 'small-groups' | 'individual' | 'flexible';
  groupAssignments?: GroupAssignment[];
}

interface EnhancedSmartboardDisplayProps {
  currentActivity?: EnhancedActivity;
  staff: StaffMember[];
  students: Student[];
  timeRemaining?: number;
  isRunning?: boolean;
  onTimerControl?: (action: 'start' | 'pause' | 'reset' | 'skip') => void;
}

const EnhancedSmartboardDisplay: React.FC<EnhancedSmartboardDisplayProps> = ({
  currentActivity,
  staff,
  students,
  timeRemaining = 1800,
  isRunning = false,
  onTimerControl
}) => {
  // ADD DEFAULT FALLBACK if currentActivity is undefined
  const activity = currentActivity || {
    id: 'default',
    name: 'No Activity Selected',
    icon: '📋',
    duration: 30,
    category: 'general',
    description: 'Please select an activity to display',
    groupingType: 'whole-class' as const,
    groupAssignments: []
  };

  // Load real student data from localStorage if available
  const [realStudents, setRealStudents] = React.useState<Student[]>(students);
  const [realStaff, setRealStaff] = React.useState<StaffMember[]>(staff);

  React.useEffect(() => {
    // Load actual students from localStorage
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      try {
        const parsedStudents = JSON.parse(savedStudents);
        setRealStudents(parsedStudents.filter((s: Student) => s.isActive !== false));
      } catch (error) {
        console.error('Error loading students for display:', error);
      }
    }

    // Load actual staff from localStorage
    const savedStaff = localStorage.getItem('staff_members');
    if (savedStaff) {
      try {
        const parsedStaff = JSON.parse(savedStaff);
        setRealStaff(parsedStaff.filter((s: StaffMember) => s.isActive));
      } catch (error) {
        console.error('Error loading staff for display:', error);
      }
    }
  }, []);

  // Color mapping for groups
  const colorMap = {
    red: '#ff6b6b',
    blue: '#4dabf7',
    green: '#51cf66',
    yellow: '#ffd43b',
    purple: '#9775fa',
    orange: '#ff922b'
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer color based on remaining time
  const getTimerColor = (): string => {
    if (timeRemaining <= 60) return '#F44336'; // Red for last minute
    if (timeRemaining <= 300) return '#FF9800'; // Orange for last 5 minutes
    return '#4CAF50'; // Green for normal time
  };

  // Get student data by ID
  const getStudentById = (studentId: string): Student | undefined => {
    return realStudents.find(s => s.id === studentId);
  };

  // Student Card Component for Display
  const StudentDisplayCard: React.FC<{ student: Student; groupColor: string }> = ({ student, groupColor }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      border: `3px solid ${groupColor}`,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      minHeight: '70px'
    }}>
      {/* Student Photo */}
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        overflow: 'hidden',
        background: student.photo 
          ? 'transparent' 
          : `linear-gradient(135deg, ${groupColor}80, ${groupColor})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: '700',
        flexShrink: 0,
        border: `2px solid ${groupColor}`
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
          student.name.charAt(0).toUpperCase()
        )}
      </div>

      {/* Student Info */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: '700',
          fontSize: '1.1rem',
          color: '#2c3e50',
          marginBottom: '0.25rem'
        }}>
          {student.name}
        </div>
        <div style={{
          fontSize: '0.9rem',
          color: '#6c757d',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <span>{student.grade || 'No grade'}</span>
          <span>•</span>
          <span style={{
            background: student.workingStyle === 'independent' ? '#28a745' : 
                       student.workingStyle === 'collaborative' ? '#007bff' : 
                       student.workingStyle === 'guided' ? '#17a2b8' : '#ffc107',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            {student.workingStyle === 'independent' && '🧠 Independent'}
            {student.workingStyle === 'collaborative' && '👥 Collaborative'}
            {student.workingStyle === 'guided' && '📖 Guided'}
            {student.workingStyle === 'needs-support' && '🤝 Needs Support'}
          </span>
        </div>
      </div>

      {/* Accommodations indicator */}
      {student.accommodations && student.accommodations.length > 0 && (
        <div style={{
          background: 'rgba(102, 126, 234, 0.1)',
          color: '#667eea',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: '600'
        }}>
          🛠️ {student.accommodations.length} accommodations
        </div>
      )}
    </div>
  );

  // Staff Card Component for Display
  const StaffDisplayCard: React.FC<{ staffMember: any; groupColor: string }> = ({ staffMember, groupColor }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1.25rem',
      background: `linear-gradient(135deg, ${groupColor}15, ${groupColor}25)`,
      borderRadius: '16px',
      border: `3px solid ${groupColor}`,
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
      marginBottom: '1rem'
    }}>
      {/* Staff Photo */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        overflow: 'hidden',
        background: staffMember.avatar && staffMember.avatar.startsWith('data:') 
          ? 'transparent' 
          : `linear-gradient(135deg, #28a745, #20c997)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: '700',
        flexShrink: 0,
        border: `3px solid ${groupColor}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}>
        {staffMember.avatar && staffMember.avatar.startsWith('data:') ? (
          <img
            src={staffMember.avatar}
            alt={staffMember.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <span>{staffMember.avatar || '👨‍🏫'}</span>
        )}
      </div>

      {/* Staff Info */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: '700',
          fontSize: '1.3rem',
          color: '#2c3e50',
          marginBottom: '0.25rem'
        }}>
          {staffMember.name}
        </div>
        <div style={{
          fontSize: '1rem',
          color: '#6c757d',
          fontWeight: '600'
        }}>
          {staffMember.role}
        </div>
      </div>

      {/* Teacher Icon */}
      <div style={{
        background: groupColor,
        color: 'white',
        padding: '12px',
        borderRadius: '50%',
        fontSize: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}>
        👨‍🏫
      </div>
    </div>
  );

  // Group Display Component
  const GroupDisplay: React.FC<{ group: GroupAssignment }> = ({ group }) => {
    const groupStudents = group.studentIds.map(id => getStudentById(id)).filter(Boolean) as Student[];
    const groupColor = colorMap[group.color] || '#667eea';

    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        border: `4px solid ${groupColor}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem',
        minHeight: '300px'
      }}>
        {/* Group Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: `2px solid ${groupColor}30`
        }}>
          <div>
            <h3 style={{
              margin: '0',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: 'white',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              {group.groupName}
            </h3>
            <p style={{
              margin: '0.5rem 0 0 0',
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '500'
            }}>
              📍 {group.location} • {groupStudents.length} students
              {group.targetSkills && group.targetSkills.length > 0 && (
                <span style={{ marginLeft: '1rem' }}>
                  🎯 {group.targetSkills.slice(0, 2).join(', ')}
                </span>
              )}
            </p>
          </div>
          
          <div style={{
            background: groupColor,
            color: 'white',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: '700',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
          }}>
            {groupStudents.length}
          </div>
        </div>

        {/* Staff Section */}
        {group.staffMember && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.3rem',
              fontWeight: '600',
              color: 'white',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              👨‍🏫 Teacher
            </h4>
            <StaffDisplayCard staffMember={group.staffMember} groupColor={groupColor} />
          </div>
        )}

        {/* Students Section */}
        <div>
          <h4 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.3rem',
            fontWeight: '600',
            color: 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            👥 Students ({groupStudents.length})
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {groupStudents.map(student => (
                <StudentDisplayCard 
                  key={student.id} 
                  student={student} 
                  groupColor={groupColor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Whole Class Display
  const WholeClassDisplay: React.FC = () => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '2rem',
      border: '4px solid #28a745',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      marginBottom: '2rem'
    }}>
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
        margin: '0',
        fontSize: '1.3rem',
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500'
      }}>
        All {realStudents.length} students participate together
      </p>
      
      {/* Show some student photos in whole class view */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        {realStudents.slice(0, 8).map(student => (
          <div
            key={student.id}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: student.photo 
                ? 'transparent' 
                : 'linear-gradient(135deg, #28a745, #20c997)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: '700',
              border: '3px solid #28a745',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
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
              student.name.charAt(0).toUpperCase()
            )}
          </div>
        ))}
        {realStudents.length > 8 && (
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '700',
            border: '3px solid #28a745'
          }}>
            +{realStudents.length - 8}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      overflow: 'auto'
    }}>
      {/* Timer and Activity Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '1.5rem 2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Activity Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flex: '1',
          minWidth: '300px'
        }}>
          <div style={{
            fontSize: '3rem',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '15px',
            borderRadius: '20px',
            minWidth: '80px',
            textAlign: 'center'
          }}>
            {activity.icon}
          </div>
          <div>
            <h1 style={{
              margin: '0',
              fontSize: '2.2rem',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              {activity.name}
            </h1>
            <p style={{
              margin: '5px 0 0 0',
              fontSize: '1.2rem',
              opacity: 0.9
            }}>
              {activity.duration} minutes • {activity.category}
              {(activity.groupAssignments || []).length > 0 && (
                <span style={{
                  marginLeft: '15px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '4px 12px',
                  borderRadius: '15px',
                  fontSize: '1rem'
                }}>
                  🎯 {(activity.groupAssignments || []).length} Groups
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Timer Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '1.5rem 2rem',
            borderRadius: '20px',
            minWidth: '150px'
          }}>
            <p style={{
              fontSize: '3rem',
              fontWeight: '700',
              margin: '0',
              color: getTimerColor(),
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              {formatTime(timeRemaining)}
            </p>
            <p style={{
              fontSize: '1rem',
              margin: '0',
              opacity: 0.9,
              fontWeight: '600'
            }}>
              Time Remaining
            </p>
          </div>

          {/* Timer Controls */}
          {onTimerControl && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => onTimerControl(isRunning ? 'pause' : 'start')}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  background: isRunning ? '#FF9800' : '#4CAF50',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isRunning ? '⏸ Pause' : '▶ Start'}
              </button>
              <button
                onClick={() => onTimerControl('skip')}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  background: '#9C27B0',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease'
                }}
              >
                🎉 Complete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Activity Content */}
      <div style={{ marginBottom: '2rem' }}>
        {/* Whole Class Activity */}
        {(!(activity.groupAssignments || []).length || 
          (activity.groupingType || 'whole-class') === 'whole-class') && (
          <WholeClassDisplay />
        )}

        {/* Group Activities */}
        {(activity.groupAssignments || []).length > 0 && 
         (activity.groupingType || 'whole-class') !== 'whole-class' && (
          <div>
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.8rem',
                fontWeight: '700',
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                🎯 Group Activities
              </h2>
              <p style={{
                margin: '0',
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500'
              }}>
                {(activity.groupAssignments || []).length} groups working on {activity.name}
              </p>
            </div>

            {/* Render each group */}
            <div style={{
              display: 'grid',
              gap: '2rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))'
            }}>
              {(activity.groupAssignments || []).map(group => (
                <GroupDisplay key={group.id} group={group} />
              ))}
            </div>
          </div>
        )}

        {/* Individual Work Display */}
        {(activity.groupingType || 'whole-class') === 'individual' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '4px solid #667eea',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧑‍💼</div>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Individual Work Time
            </h3>
            <p style={{
              margin: '0',
              fontSize: '1.3rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '500'
            }}>
              Each student works independently on {activity.name}
            </p>
          </div>
        )}

        {/* Flexible Grouping Display */}
        {(activity.groupingType || 'whole-class') === 'flexible' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '4px solid #17a2b8',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔄</div>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Flexible Grouping
            </h3>
            <p style={{
              margin: '0',
              fontSize: '1.3rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '500'
            }}>
              Mixed arrangements - groups may change during the activity
            </p>
          </div>
        )}
      </div>

      {/* Activity Instructions */}
      {(activity.description || '') && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h4 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.3rem',
            fontWeight: '600',
            color: 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            📋 Activity Instructions
          </h4>
          <p style={{
            margin: '0',
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.6'
          }}>
            {activity.description || ''}
          </p>
        </div>
      )}

      {/* Statistics Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '1rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
            {realStudents.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Total Students
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
            {realStaff.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Staff Members
          </div>
        </div>
        
        {(activity.groupAssignments || []).length > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
              {(activity.groupAssignments || []).length}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Active Groups
            </div>
          </div>
        )}
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
            {activity.duration}min
          </div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Activity Duration
          </div>
        </div>
      </div>
    </div>
  );
};

// Regular SmartboardDisplay component for backward compatibility
interface SmartboardDisplayProps {
  isActive: boolean;
  currentSchedule?: {
    activities: any[];
    startTime: string;
    name: string;
  };
  staff: StaffMember[];
  students: Student[];
}

const SmartboardDisplay: React.FC<SmartboardDisplayProps> = ({ 
  isActive, 
  currentSchedule, 
  staff, 
  students 
}) => {
  if (!isActive) return null;

  // Convert currentSchedule to currentActivity format
  const currentActivity = currentSchedule && currentSchedule.activities.length > 0 
    ? {
        id: 'current',
        name: currentSchedule.activities[0].name || 'Current Activity',
        icon: currentSchedule.activities[0].icon || '📋',
        duration: currentSchedule.activities[0].duration || 30,
        category: currentSchedule.activities[0].category || 'general',
        description: currentSchedule.activities[0].description,
        groupingType: currentSchedule.activities[0].groupingType || 'whole-class' as const,
        groupAssignments: currentSchedule.activities[0].groupAssignments || []
      }
    : undefined;

  return (
    <EnhancedSmartboardDisplay
      currentActivity={currentActivity}
      staff={staff}
      students={students}
    />
  );
};

export default SmartboardDisplay;
export { EnhancedSmartboardDisplay };
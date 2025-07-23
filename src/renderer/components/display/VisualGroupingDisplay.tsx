// Enhanced Visual Grouping Component for SmartboardDisplay
import React from 'react';
import { Student, Staff, StudentGroup } from '../../types';

interface VisualGroupingDisplayProps {
  groups: StudentGroup[];
  staff: Staff[];
  students: Student[];
  isWholeClass: boolean;
  activityName: string;
}

const VisualGroupingDisplay: React.FC<VisualGroupingDisplayProps> = ({
  groups,
  staff,
  students,
  isWholeClass,
  activityName
}) => {
  
  // Get staff member by ID
  const getStaffMember = (staffId: string) => {
    return staff.find(s => s.id === staffId);
  };

  // Get student by ID
  const getStudent = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };

  // Render avatar component
  const renderAvatar = (person: Staff | Student, size: 'large' | 'medium' | 'small' = 'medium', isTeacher: boolean = false) => {
    const sizeMap = {
      large: { width: '100px', height: '100px', fontSize: '2.5rem' },
      medium: { width: '80px', height: '80px', fontSize: '2rem' },
      small: { width: '60px', height: '60px', fontSize: '1.5rem' }
    };
    
    const avatarSize = sizeMap[size];
    
    return (
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{
          width: avatarSize.width,
          height: avatarSize.height,
          borderRadius: '50%',
          background: isTeacher 
            ? 'linear-gradient(145deg, #3498db 0%, #2980b9 100%)'
            : 'linear-gradient(145deg, #9b59b6 0%, #8e44ad 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          fontSize: avatarSize.fontSize,
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          border: isTeacher ? '4px solid #f1c40f' : '3px solid rgba(255,255,255,0.3)',
          overflow: 'hidden'
        }}>
          {person.photo ? (
            <img 
              src={person.photo} 
              alt={person.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
            />
          ) : (
            <span>{person.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        {/* Teacher Badge */}
        {isTeacher && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'linear-gradient(145deg, #f1c40f 0%, #f39c12 100%)',
            color: 'white',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: '700',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            border: '2px solid white'
          }}>
            👨‍🏫
          </div>
        )}
        
        <div style={{
          fontSize: size === 'large' ? '1.4rem' : size === 'medium' ? '1.2rem' : '1rem',
          fontWeight: '700',
          color: '#2c3e50',
          textAlign: 'center',
          maxWidth: '100px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {person.name}
        </div>
        
        {isTeacher && (
          <div style={{
            fontSize: '0.9rem',
            color: '#7f8c8d',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {(person as Staff).role}
          </div>
        )}
      </div>
    );
  };

  // Render whole class view
  if (isWholeClass) {
    return (
      <div style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafb 100%)',
        borderRadius: '25px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '1400px',
        border: '3px solid #e1e8ed',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#2c3e50',
          textAlign: 'center',
          marginBottom: '2rem',
          borderBottom: '3px solid #ecf0f1',
          paddingBottom: '1rem'
        }}>
          👥 Whole Class Activity
        </h2>
        
        {/* All Staff Leading */}
        <div style={{
          background: 'linear-gradient(145deg, #e8f4fd 0%, #d6eaf8 100%)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '2px solid #5dade2'
        }}>
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            color: '#2c3e50',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            👨‍🏫 Teachers Leading
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '2rem',
            justifyItems: 'center'
          }}>
            {staff.map(staffMember => (
              <div key={staffMember.id}>
                {renderAvatar(staffMember, 'large', true)}
              </div>
            ))}
          </div>
        </div>

        {/* All Students */}
        <div style={{
          background: 'linear-gradient(145deg, #fef9e7 0%, #fcf3cf 100%)',
          borderRadius: '20px',
          padding: '2rem',
          border: '2px solid #f7dc6f'
        }}>
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            color: '#2c3e50',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            🎓 All Students
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1.5rem',
            justifyItems: 'center'
          }}>
            {students.map(student => (
              <div key={student.id}>
                {renderAvatar(student, 'medium', false)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render small groups view with teachers in each group
  return (
    <div style={{
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafb 100%)',
      borderRadius: '25px',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '1400px',
      border: '3px solid #e1e8ed',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)'
    }}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: '900',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: '2rem',
        borderBottom: '3px solid #ecf0f1',
        paddingBottom: '1rem'
      }}>
        👥 Small Groups for {activityName}
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        {groups.map(group => {
          const groupTeacher = group.staffId ? getStaffMember(group.staffId) : null;
          const groupStudents = group.studentIds.map(id => getStudent(id)).filter(Boolean) as Student[];
          
          return (
            <div 
              key={group.id}
              style={{
                background: `linear-gradient(145deg, ${group.color}15 0%, ${group.color}25 100%)`,
                borderRadius: '20px',
                padding: '2rem',
                border: `4px solid ${group.color}`,
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            >
              {/* Group Title */}
              <h3 style={{
                fontSize: '1.6rem',
                fontWeight: '900',
                color: '#2c3e50',
                textAlign: 'center',
                marginBottom: '1.5rem',
                background: `${group.color}20`,
                padding: '0.75rem',
                borderRadius: '12px',
                border: `2px solid ${group.color}`
              }}>
                {group.label}
              </h3>

              {/* Visual Group - Teacher + Students Together */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '2px solid rgba(255, 255, 255, 0.6)'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '1.5rem',
                  justifyItems: 'center',
                  alignItems: 'start'
                }}>
                  {/* Teacher First - Visual Leadership */}
                  {groupTeacher && (
                    <div key={`teacher-${groupTeacher.id}`}>
                      {renderAvatar(groupTeacher, 'large', true)}
                    </div>
                  )}
                  
                  {/* Students in Same Visual Group */}
                  {groupStudents.map(student => (
                    <div key={`student-${student.id}`}>
                      {renderAvatar(student, 'medium', false)}
                    </div>
                  ))}
                </div>
                
                {/* Group Instructions */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: `${group.color}10`,
                  borderRadius: '10px',
                  border: `1px solid ${group.color}`,
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: '#2c3e50'
                  }}>
                    👀 Look for your face with{' '}
                    {groupTeacher ? groupTeacher.name.split(' ')[1] || groupTeacher.name : 'your teacher'}!
                  </div>
                  <div style={{
                    fontSize: '0.95rem',
                    color: '#5d6d7e',
                    marginTop: '0.5rem',
                    fontWeight: '600'
                  }}>
                    When you see your photo with{' '}
                    {groupTeacher ? groupTeacher.name.split(' ')[1] || groupTeacher.name : 'your teacher'}, 
                    that's your group!
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Learning Aid */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(145deg, #e8f8f5 0%, #d5f4e6 100%)',
        borderRadius: '16px',
        border: '3px solid #58d68d',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '800',
          color: '#27ae60',
          marginBottom: '0.5rem'
        }}>
          👀 Look for Your Photo!
        </div>
        <div style={{
          fontSize: '1.2rem',
          color: '#2c3e50',
          fontWeight: '600'
        }}>
          Find your face in the same box as your teacher - that's where you go!
        </div>
      </div>
    </div>
  );
};

export default VisualGroupingDisplay;
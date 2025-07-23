import React, { useState, useEffect } from 'react';
import { Student, StudentGroup } from '../../types';

interface GroupTemplate {
  id: string;
  name: string;
  description: string;
  groupType: 'academic' | 'therapy' | 'behavior' | 'social' | 'mixed';
  suggestedSize: number;
  color: string;
  targetSkills: string[];
}

interface GroupCreatorProps {
  students: Student[];
  groups: StudentGroup[];
  onSave: (groups: StudentGroup[]) => void;
  onCancel: () => void;
}

const GroupCreator: React.FC<GroupCreatorProps> = ({
  students,
  groups: initialGroups,
  onSave,
  onCancel
}) => {
  // State management
  const [students_list] = useState<Student[]>(students);
  const [groups, setGroups] = useState<StudentGroup[]>(initialGroups);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [draggedStudent, setDraggedStudent] = useState<Student | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // Group templates
  const groupTemplates: GroupTemplate[] = [
    {
      id: 'reading-advanced',
      name: 'Advanced Readers',
      description: 'Students reading above grade level',
      groupType: 'academic',
      suggestedSize: 4,
      color: '#3498db',
      targetSkills: ['fluency', 'comprehension', 'critical thinking']
    },
    {
      id: 'reading-support',
      name: 'Reading Support',
      description: 'Students needing additional reading support',
      groupType: 'academic',
      suggestedSize: 3,
      color: '#e74c3c',
      targetSkills: ['phonics', 'decoding', 'sight words']
    },
    {
      id: 'math-problem-solving',
      name: 'Math Problem Solvers',
      description: 'Students working on advanced math concepts',
      groupType: 'academic',
      suggestedSize: 4,
      color: '#9b59b6',
      targetSkills: ['problem solving', 'reasoning', 'application']
    },
    {
      id: 'math-foundations',
      name: 'Math Foundations',
      description: 'Students building basic math skills',
      groupType: 'academic',
      suggestedSize: 3,
      color: '#f39c12',
      targetSkills: ['number sense', 'basic operations', 'counting']
    },
    {
      id: 'social-skills',
      name: 'Social Skills Practice',
      description: 'Students working on social interaction',
      groupType: 'therapy',
      suggestedSize: 3,
      color: '#2ecc71',
      targetSkills: ['turn taking', 'sharing', 'communication']
    },
    {
      id: 'behavior-support',
      name: 'Behavior Support',
      description: 'Students needing behavior intervention',
      groupType: 'behavior',
      suggestedSize: 2,
      color: '#e67e22',
      targetSkills: ['self-regulation', 'following directions', 'impulse control']
    },
    {
      id: 'peer-partners',
      name: 'Peer Partners',
      description: 'Mixed ability partnerships',
      groupType: 'social',
      suggestedSize: 2,
      color: '#1abc9c',
      targetSkills: ['collaboration', 'peer support', 'friendship']
    },
    {
      id: 'independent-work',
      name: 'Independent Workers',
      description: 'Students who work well independently',
      groupType: 'mixed',
      suggestedSize: 5,
      color: '#34495e',
      targetSkills: ['self-direction', 'task completion', 'focus']
    }
  ];

  // Color options for custom groups
  const colorOptions = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#e67e22', '#1abc9c', '#34495e', '#e91e63', '#ff5722',
    '#795548', '#607d8b', '#ff9800', '#4caf50', '#2196f3'
  ];

  // Load initial data
  useEffect(() => {
    updateUnassignedStudents();
  }, [students_list, groups]);

  const updateUnassignedStudents = () => {
    const assignedStudentIds = new Set(
      groups.flatMap(group => group.studentIds)
    );
    
    const unassigned = students_list.filter(
      student => !assignedStudentIds.has(student.id)
    );
    
    setUnassignedStudents(unassigned);
  };

  // Create group from template
  const createGroupFromTemplate = (template: GroupTemplate) => {
    const newGroup: StudentGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      staffId: '', // Required property from base Group interface
      students: [], // Required property from base Group interface
      label: template.description,
      description: template.description,
      studentIds: [],
      color: template.color,
      isTemplate: false,
      groupType: template.groupType,
      targetSkills: template.targetSkills,
      maxSize: template.suggestedSize + 2,
      minSize: Math.max(1, template.suggestedSize - 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setGroups(prev => [...prev, newGroup]);
    setShowTemplatePanel(false);
  };

  // Create custom group
  const createCustomGroup = () => {
    const groupNumber = groups.length + 1;
    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    
    const newGroup: StudentGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Group ${groupNumber}`,
      staffId: '', // Required property from base Group interface
      students: [], // Required property from base Group interface
      label: `Custom Group ${groupNumber}`,
      description: `Custom group created for specific needs`,
      studentIds: [],
      color: randomColor,
      isTemplate: false,
      groupType: 'mixed',
      targetSkills: [],
      maxSize: 6,
      minSize: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setGroups(prev => [...prev, newGroup]);
  };

  // Delete group
  const deleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group? Students will be moved to unassigned.')) {
      setGroups(prev => prev.filter(group => group.id !== groupId));
    }
  };

  // Edit group properties
  const editGroup = (groupId: string, updates: Partial<StudentGroup>) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, ...updates, updatedAt: new Date().toISOString() }
        : group
    ));
  };

  // Drag and drop handlers
  const handleDragStart = (student: Student) => {
    setDraggedStudent(student);
  };

  const handleDragEnd = () => {
    setDraggedStudent(null);
    setDragOverGroup(null);
  };

  const handleDragOver = (e: React.DragEvent, groupId?: string) => {
    e.preventDefault();
    setDragOverGroup(groupId || 'unassigned');
  };

  const handleDragLeave = () => {
    setDragOverGroup(null);
  };

  const handleDrop = (e: React.DragEvent, targetGroupId?: string) => {
    e.preventDefault();
    if (!draggedStudent) return;

    // Remove student from current group
    setGroups(prev => prev.map(group => ({
      ...group,
      studentIds: group.studentIds.filter(id => id !== draggedStudent.id),
      students: group.studentIds.filter(id => id !== draggedStudent.id)
    })));

    // Add student to target group (if specified)
    if (targetGroupId) {
      setGroups(prev => prev.map(group => 
        group.id === targetGroupId
          ? { ...group, studentIds: [...group.studentIds, draggedStudent.id], students: [...group.studentIds, draggedStudent.id] }
          : group
      ));
    }

    handleDragEnd();
  };

  // Auto-suggest group assignments based on student compatibility
  const getSuggestedGroupmates = (student: Student): Student[] => {
    return unassignedStudents.filter(other => {
      if (other.id === student.id) return false;
      
      // Check preferred partners
      if (student.preferredPartners?.includes(other.id)) return true;
      
      // Check avoid partners
      if (student.avoidPartners?.includes(other.id)) return false;
      
      // Match working styles
      if (student.workingStyle === 'collaborative' && other.workingStyle === 'collaborative') return true;
      
      // Match skill levels (not too far apart)
      const skillLevels = ['emerging', 'developing', 'proficient', 'advanced'];
      const studentLevel = skillLevels.indexOf(student.skillLevel || 'developing');
      const otherLevel = skillLevels.indexOf(other.skillLevel || 'developing');
      
      return Math.abs(studentLevel - otherLevel) <= 1;
    });
  };

  // Quick group balancing
  const balanceGroups = () => {
    if (groups.length === 0) return;
    
    // Collect all students
    const allStudents = [...unassignedStudents];
    groups.forEach(group => {
      group.studentIds.forEach(id => {
        const student = students_list.find(s => s.id === id);
        if (student) allStudents.push(student);
      });
    });

    // Clear all groups
    const clearedGroups = groups.map(group => ({ ...group, studentIds: [], students: [] }));
    
    // Redistribute students evenly
    const studentsPerGroup = Math.floor(allStudents.length / clearedGroups.length);
    const remainder = allStudents.length % clearedGroups.length;
    
    let studentIndex = 0;
    clearedGroups.forEach((group, groupIndex) => {
      const groupSize = studentsPerGroup + (groupIndex < remainder ? 1 : 0);
      
      for (let i = 0; i < groupSize && studentIndex < allStudents.length; i++) {
        group.studentIds.push(allStudents[studentIndex].id);
        group.students.push(allStudents[studentIndex].id);
        studentIndex++;
      }
    });
    
    setGroups(clearedGroups);
  };

  // Filter students for search
  const filteredUnassigned = unassignedStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter groups
  const filteredGroups = groups.filter(group => {
    if (groupFilter === 'all') return true;
    return group.groupType === groupFilter;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '1200px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <h3>👥 Group Creator & Manager</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem', overflowY: 'auto' }}>
          
          {/* Controls Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                className="create-activity-button"
                onClick={() => setShowTemplatePanel(!showTemplatePanel)}
              >
                📋 Templates
              </button>
              <button
                className="create-activity-button"
                onClick={createCustomGroup}
              >
                ➕ Custom Group
              </button>
              <button
                className="create-activity-button"
                onClick={balanceGroups}
                disabled={groups.length === 0}
              >
                ⚖️ Balance Groups
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Types</option>
                <option value="academic">Academic</option>
                <option value="therapy">Therapy</option>
                <option value="behavior">Behavior</option>
                <option value="social">Social</option>
                <option value="mixed">Mixed</option>
              </select>
              
              <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>
                {groups.length} groups • {unassignedStudents.length} unassigned
              </div>
            </div>
          </div>

          {/* Templates Panel */}
          {showTemplatePanel && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'linear-gradient(145deg, #fff 0%, #f8f9fa 100%)',
              borderRadius: '12px',
              border: '2px solid #e9ecef'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>📋 Group Templates</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                {groupTemplates.map(template => (
                  <div
                    key={template.id}
                    style={{
                      padding: '1rem',
                      background: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      borderLeft: `6px solid ${template.color}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => createGroupFromTemplate(template)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontWeight: '700', color: '#2c3e50', marginBottom: '0.5rem' }}>
                      {template.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                      {template.description}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#495057' }}>
                      <span style={{ background: template.color, color: 'white', padding: '2px 6px', borderRadius: '4px', marginRight: '0.5rem' }}>
                        {template.groupType}
                      </span>
                      {template.suggestedSize} students
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div style={{ display: 'flex', gap: '1.5rem', minHeight: '400px' }}>
            
            {/* Unassigned Students Panel */}
            <div style={{
              flex: '0 0 300px',
              background: 'linear-gradient(145deg, #fff 0%, #f8f9fa 100%)',
              borderRadius: '12px',
              padding: '1rem',
              border: '2px solid #e9ecef'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                👦 Unassigned Students ({unassignedStudents.length})
              </h4>
              
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '14px'
                }}
              />
              
              <div
                style={{
                  minHeight: '200px',
                  padding: '1rem',
                  background: dragOverGroup === 'unassigned' ? '#e3f2fd' : '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px dashed #bdc3c7',
                  transition: 'all 0.3s ease'
                }}
                onDragOver={(e) => handleDragOver(e)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e)}
              >
                {filteredUnassigned.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
                    {searchTerm ? 'No students match search' : 'All students assigned!'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredUnassigned.map(student => (
                      <StudentCard
                        key={student.id}
                        student={student}
                        onDragStart={() => handleDragStart(student)}
                        onDragEnd={handleDragEnd}
                        suggestedPartners={getSuggestedGroupmates(student)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Groups Panel */}
            <div style={{ flex: '1' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                🎯 Groups ({filteredGroups.length})
              </h4>
              
              {filteredGroups.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '2px dashed #bdc3c7',
                  color: '#6c757d'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                  <h3>No Groups Created</h3>
                  <p>Use templates or create custom groups to get started</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem',
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  {filteredGroups.map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      students={students_list}
                      isDragOver={dragOverGroup === group.id}
                      onDragOver={(e) => handleDragOver(e, group.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, group.id)}
                      onEdit={(updates) => editGroup(group.id, updates)}
                      onDelete={() => deleteGroup(group.id)}
                      onStudentRemove={(studentId) => {
                        editGroup(group.id, {
                          studentIds: group.studentIds.filter(id => id !== studentId),
                          students: group.studentIds.filter(id => id !== studentId)
                        });
                      }}
                      colorOptions={colorOptions}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className="save-btn" 
            onClick={() => onSave(groups)}
          >
            💾 Save Groups ({groups.length})
          </button>
        </div>
      </div>
    </div>
  );
};

// Student Card Component
interface StudentCardProps {
  student: Student;
  onDragStart: () => void;
  onDragEnd: () => void;
  suggestedPartners: Student[];
  isInGroup?: boolean;
  onRemove?: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onDragStart,
  onDragEnd,
  suggestedPartners,
  isInGroup = false,
  onRemove
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        cursor: 'grab',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Student Avatar */}
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {student.photo ? (
          <img 
            src={student.photo} 
            alt={student.name}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '8px',
              objectFit: 'cover'
            }}
          />
        ) : (
          <span style={{ fontSize: '1.2rem' }}>👦</span>
        )}
      </div>

      {/* Student Info */}
      <div style={{ flex: '1', minWidth: '0' }}>
        <div style={{
          fontWeight: '700',
          color: '#2c3e50',
          fontSize: '0.9rem',
          marginBottom: '0.25rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {student.name}
        </div>
        
        {student.skillLevel && (
          <div style={{
            fontSize: '0.75rem',
            color: '#6c757d',
            marginBottom: '0.25rem'
          }}>
            {student.skillLevel}
          </div>
        )}
        
        {student.accommodations.length > 0 && (
          <div style={{ fontSize: '0.7rem', color: '#495057' }}>
            {student.accommodations.slice(0, 2).join(', ')}
            {student.accommodations.length > 2 && '...'}
          </div>
        )}
      </div>

      {/* Remove Button (for students in groups) */}
      {isInGroup && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      )}

      {/* Suggested Partners Indicator */}
      {!isInGroup && suggestedPartners.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#28a745',
          color: 'white',
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          {suggestedPartners.length}
        </div>
      )}
    </div>
  );
};

// Group Card Component
interface GroupCardProps {
  group: StudentGroup;
  students: Student[];
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onEdit: (updates: Partial<StudentGroup>) => void;
  onDelete: () => void;
  onStudentRemove: (studentId: string) => void;
  colorOptions: string[];
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  students,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onEdit,
  onDelete,
  onStudentRemove,
  colorOptions
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [editLabel, setEditLabel] = useState(group.label);
  const [editColor, setEditColor] = useState(group.color);

  const groupStudents = group.studentIds
    .map(id => students.find(s => s.id === id))
    .filter(Boolean) as Student[];

  const handleSaveEdit = () => {
    onEdit({
      name: editName,
      label: editLabel,
      color: editColor
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(group.name);
    setEditLabel(group.label);
    setEditColor(group.color);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        background: isDragOver ? '#e3f2fd' : '#fff',
        borderRadius: '12px',
        border: `2px solid ${isDragOver ? '#2196f3' : '#e9ecef'}`,
        borderLeft: `6px solid ${group.color}`,
        padding: '1rem',
        transition: 'all 0.3s ease',
        minHeight: '200px'
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Group Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div style={{ flex: '1' }}>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '4px'
                }}
              />
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginBottom: '8px'
                }}
              />
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                {colorOptions.slice(0, 8).map(color => (
                  <div
                    key={color}
                    onClick={() => setEditColor(color)}
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: color,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: editColor === color ? '2px solid #000' : '1px solid #ccc'
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    padding: '4px 8px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    padding: '4px 8px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h5 style={{
                margin: '0 0 0.25rem 0',
                color: '#2c3e50',
                fontSize: '1rem',
                fontWeight: '700'
              }}>
                {group.name}
              </h5>
              <div style={{
                fontSize: '0.85rem',
                color: '#6c757d',
                marginBottom: '0.5rem'
              }}>
                {group.label}
              </div>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                <span style={{
                  background: group.color,
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: '600'
                }}>
                  {group.groupType}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#495057'
                }}>
                  {groupStudents.length} students
                </span>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#6c757d',
                padding: '4px'
              }}
              title="Edit group"
            >
              ✏️
            </button>
            <button
              onClick={onDelete}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#e74c3c',
                padding: '4px'
              }}
              title="Delete group"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Group Students */}
      <div style={{
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '0.75rem',
        minHeight: '100px',
        border: '1px dashed #dee2e6'
      }}>
        {groupStudents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6c757d',
            fontSize: '0.85rem',
            padding: '1rem'
          }}>
            Drop students here
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {groupStudents.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                onDragStart={() => {}}
                onDragEnd={() => {}}
                suggestedPartners={[]}
                isInGroup={true}
                onRemove={() => onStudentRemove(student.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Group Stats */}
      {groupStudents.length > 0 && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: '6px',
          fontSize: '0.75rem',
          color: '#495057'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Size: {groupStudents.length}</span>
            {group.maxSize && (
              <span>
                Max: {group.maxSize}
                {groupStudents.length > group.maxSize && (
                  <span style={{ color: '#e74c3c', marginLeft: '4px' }}>⚠️</span>
                )}
              </span>
            )}
          </div>
          
          {/* Skill Level Distribution */}
          {(() => {
            const skillCounts = groupStudents.reduce((acc, student) => {
              const level = student.skillLevel || 'unknown';
              acc[level] = (acc[level] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            return Object.keys(skillCounts).length > 1 ? (
              <div style={{ marginTop: '4px' }}>
                Skills: {Object.entries(skillCounts)
                  .map(([level, count]) => `${level}(${count})`)
                  .join(', ')}
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};

export default GroupCreator;
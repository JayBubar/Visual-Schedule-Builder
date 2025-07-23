// ActivityAssignmentModal.tsx - Modal for assigning staff and creating student groups
import React, { useState, useEffect } from 'react';
import { Staff, Student, Group, Assignment, SavedActivity } from '../../types';

interface ActivityAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: SavedActivity | null;
  availableStaff: Staff[];
  availableStudents: Student[];
  onSave: (assignment: Assignment, selectedStaff: Staff[], selectedStudents: Student[]) => void;
}

interface DragItem {
  id: string;
  type: 'student';
  student: Student;
}

const AVAILABLE_COLORS = [
  { name: 'Blue', value: '#3498db' },
  { name: 'Red', value: '#e74c3c' },
  { name: 'Green', value: '#2ecc71' },
  { name: 'Purple', value: '#9b59b6' },
  { name: 'Orange', value: '#f39c12' },
  { name: 'Teal', value: '#1abc9c' },
  { name: 'Pink', value: '#e91e63' },
  { name: 'Indigo', value: '#3f51b5' },
  { name: 'Amber', value: '#ff9800' },
  { name: 'Cyan', value: '#00bcd4' }
];

const ActivityAssignmentModal: React.FC<ActivityAssignmentModalProps> = ({
  isOpen,
  onClose,
  activity,
  availableStaff,
  availableStudents,
  onSave
}) => {
  const [isWholeClass, setIsWholeClass] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<Staff[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'preview'>('setup');

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen && activity) {
      // Load existing assignment data if available
      if (activity.assignment) {
        setIsWholeClass(activity.assignment.isWholeClass);
        if (activity.assignment.groups) {
          setGroups(activity.assignment.groups);
          // Set assigned students based on groups
          const assignedStudentIds = activity.assignment.groups.flatMap(g => g.students);
          const assigned = availableStudents.filter(s => assignedStudentIds.includes(s.id));
          const unassigned = availableStudents.filter(s => !assignedStudentIds.includes(s.id));
          setSelectedStudents(assigned);
          setUnassignedStudents(unassigned);
        } else {
          setSelectedStudents(availableStudents);
          setUnassignedStudents([]);
        }
      } else {
        // Default to whole class with all staff and students
        setSelectedStaff(availableStaff);
        setSelectedStudents(availableStudents);
        setUnassignedStudents([]);
        setGroups([]);
      }
      
      if (activity.staff) {
        setSelectedStaff(activity.staff);
      } else {
        setSelectedStaff(availableStaff);
      }
    }
  }, [isOpen, activity, availableStaff, availableStudents]);

  // Handle staff selection
  const toggleStaffSelection = (staff: Staff) => {
    setSelectedStaff(prev => 
      prev.find(s => s.id === staff.id)
        ? prev.filter(s => s.id !== staff.id)
        : [...prev, staff]
    );
  };

  // Handle student selection for whole class
  const toggleStudentSelection = (student: Student) => {
    if (isWholeClass) {
      setSelectedStudents(prev => 
        prev.find(s => s.id === student.id)
          ? prev.filter(s => s.id !== student.id)
          : [...prev, student]
      );
    }
  };

  // Create new group
  const createNewGroup = () => {
    const usedColors = groups.map(g => g.color);
    const availableColor = AVAILABLE_COLORS.find(c => !usedColors.includes(c.value));
    
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: `Group ${groups.length + 1}`,
      staffId: selectedStaff[0]?.id || '',
      students: [],
      color: availableColor?.value || AVAILABLE_COLORS[0].value
    };
    
    setGroups([...groups, newGroup]);
  };

  // Delete group
  const deleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      // Move students back to unassigned
      const groupStudents = availableStudents.filter(s => group.students.includes(s.id));
      setUnassignedStudents(prev => [...prev, ...groupStudents]);
    }
    setGroups(groups.filter(g => g.id !== groupId));
  };

  // Update group
  const updateGroup = (groupId: string, updates: Partial<Group>) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, ...updates } : g));
  };

  // Drag and drop handlers
  const handleDragStart = (student: Student) => {
    setDraggedItem({ id: student.id, type: 'student', student });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnGroup = (groupId: string) => {
    if (draggedItem && draggedItem.type === 'student') {
      const student = draggedItem.student;
      
      // Remove from current group if assigned
      setGroups(groups.map(g => ({
        ...g,
        students: g.students.filter(id => id !== student.id)
      })));
      
      // Add to target group
      setGroups(groups.map(g => 
        g.id === groupId 
          ? { ...g, students: [...g.students, student.id] }
          : g
      ));
      
      // Remove from unassigned
      setUnassignedStudents(prev => prev.filter(s => s.id !== student.id));
    }
    setDraggedItem(null);
  };

  const handleDropOnUnassigned = () => {
    if (draggedItem && draggedItem.type === 'student') {
      const student = draggedItem.student;
      
      // Remove from all groups
      setGroups(groups.map(g => ({
        ...g,
        students: g.students.filter(id => id !== student.id)
      })));
      
      // Add to unassigned if not already there
      if (!unassignedStudents.find(s => s.id === student.id)) {
        setUnassignedStudents(prev => [...prev, student]);
      }
    }
    setDraggedItem(null);
  };

  // Save assignment
  const handleSave = () => {
    const assignment: Assignment = {
      isWholeClass,
      groups: isWholeClass ? undefined : groups
    };
    
    onSave(assignment, selectedStaff, isWholeClass ? selectedStudents : availableStudents);
    onClose();
  };

  // Switch to small groups mode
  const switchToSmallGroups = () => {
    setIsWholeClass(false);
    setUnassignedStudents(selectedStudents);
    if (groups.length === 0) {
      createNewGroup();
    }
  };

  if (!isOpen || !activity) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'hidden',
        color: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: '700' }}>
              {activity.emoji} {activity.name} - Assignment Setup
            </h2>
            <p style={{ margin: 0, opacity: 0.8 }}>
              Configure staff and student groupings for this activity
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          padding: '0 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {[
            { id: 'setup', label: 'Setup Groups', icon: '⚙️' },
            { id: 'preview', label: 'Preview', icon: '👁️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid white' : '3px solid transparent',
                color: 'white',
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '2rem'
        }}>
          {activeTab === 'setup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Assignment Type Selection */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '15px',
                padding: '1.5rem',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>Assignment Type</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setIsWholeClass(true)}
                    style={{
                      background: isWholeClass ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      border: `2px solid ${isWholeClass ? 'white' : 'rgba(255, 255, 255, 0.3)'}`,
                      borderRadius: '12px',
                      padding: '1rem 1.5rem',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      minWidth: '150px'
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>🌟</span>
                    <span>Whole Class</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      All students together
                    </span>
                  </button>
                  
                  <button
                    onClick={switchToSmallGroups}
                    style={{
                      background: !isWholeClass ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      border: `2px solid ${!isWholeClass ? 'white' : 'rgba(255, 255, 255, 0.3)'}`,
                      borderRadius: '12px',
                      padding: '1rem 1.5rem',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      minWidth: '150px'
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>👥</span>
                    <span>Small Groups</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      Divide into groups
                    </span>
                  </button>
                </div>
              </div>

              {/* Staff Selection */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '15px',
                padding: '1.5rem',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>👩‍🏫 Select Staff</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '1rem'
                }}>
                  {availableStaff.map(staff => (
                    <div
                      key={staff.id}
                      onClick={() => toggleStaffSelection(staff)}
                      style={{
                        background: selectedStaff.find(s => s.id === staff.id) 
                          ? 'rgba(255, 255, 255, 0.3)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        border: `2px solid ${selectedStaff.find(s => s.id === staff.id) 
                          ? 'white' 
                          : 'rgba(255, 255, 255, 0.3)'}`,
                        borderRadius: '12px',
                        padding: '1rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        {staff.photo}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                        {staff.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                        {staff.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Assignment */}
              {isWholeClass ? (
                // Whole Class Student Selection
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>👨‍🎓 Select Students</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: '1rem'
                  }}>
                    {availableStudents.map(student => (
                      <div
                        key={student.id}
                        onClick={() => toggleStudentSelection(student)}
                        style={{
                          background: selectedStudents.find(s => s.id === student.id) 
                            ? 'rgba(255, 255, 255, 0.3)' 
                            : 'rgba(255, 255, 255, 0.1)',
                          border: `2px solid ${selectedStudents.find(s => s.id === student.id) 
                            ? 'white' 
                            : 'rgba(255, 255, 255, 0.3)'}`,
                          borderRadius: '12px',
                          padding: '1rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                          {student.photo}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                          {student.name}
                        </div>
                        {student.readingLevel && (
                          <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                            {student.readingLevel}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Small Groups Management
                <div style={{ display: 'flex', gap: '2rem', height: '400px' }}>
                  {/* Unassigned Students */}
                  <div style={{
                    flex: '0 0 200px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
                      📋 Unassigned Students
                    </h4>
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDropOnUnassigned}
                      style={{
                        minHeight: '300px',
                        border: '2px dashed rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      {unassignedStudents.map(student => (
                        <div
                          key={student.id}
                          draggable
                          onDragStart={() => handleDragStart(student)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            cursor: 'grab',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem'
                          }}
                        >
                          <span style={{ fontSize: '1.2rem' }}>{student.photo}</span>
                          <span>{student.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Groups */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>👥 Student Groups</h4>
                      <button
                        onClick={createNewGroup}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem 1rem',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        + Add Group
                      </button>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem',
                      flex: 1
                    }}>
                      {groups.map(group => (
                        <div
                          key={group.id}
                          style={{
                            background: `linear-gradient(145deg, ${group.color}dd, ${group.color}aa)`,
                            borderRadius: '15px',
                            padding: '1rem',
                            border: `2px solid ${group.color}`,
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          {/* Group Header */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem'
                          }}>
                            <input
                              type="text"
                              value={group.name}
                              onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                              style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.3rem 0.5rem',
                                color: 'white',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                flex: 1
                              }}
                            />
                            <button
                              onClick={() => deleteGroup(group.id)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '6px',
                                width: '24px',
                                height: '24px',
                                color: 'white',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                marginLeft: '0.5rem'
                              }}
                            >
                              ×
                            </button>
                          </div>

                          {/* Staff Assignment */}
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.8rem', opacity: 0.9, display: 'block', marginBottom: '0.5rem' }}>
                              Lead Staff:
                            </label>
                            <select
                              value={group.staffId}
                              onChange={(e) => updateGroup(group.id, { staffId: e.target.value })}
                              style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.3rem 0.5rem',
                                color: 'white',
                                fontSize: '0.8rem',
                                width: '100%'
                              }}
                            >
                              <option value="">Select Staff</option>
                              {selectedStaff.map(staff => (
                                <option key={staff.id} value={staff.id} style={{ color: 'black' }}>
                                  {staff.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Color Selection */}
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.8rem', opacity: 0.9, display: 'block', marginBottom: '0.5rem' }}>
                              Group Color:
                            </label>
                            <div style={{
                              display: 'flex',
                              gap: '0.3rem',
                              flexWrap: 'wrap'
                            }}>
                              {AVAILABLE_COLORS.map(color => (
                                <button
                                  key={color.value}
                                  onClick={() => updateGroup(group.id, { color: color.value })}
                                  style={{
                                    background: color.value,
                                    border: group.color === color.value ? '2px solid white' : '2px solid transparent',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer'
                                  }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Drop Zone for Students */}
                          <div
                            onDragOver={handleDragOver}
                            onDrop={() => handleDropOnGroup(group.id)}
                            style={{
                              flex: 1,
                              border: '2px dashed rgba(255, 255, 255, 0.5)',
                              borderRadius: '8px',
                              padding: '0.5rem',
                              minHeight: '100px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.3rem'
                            }}
                          >
                            <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '0.3rem' }}>
                              Students ({group.students.length}):
                            </div>
                            {group.students.map(studentId => {
                              const student = availableStudents.find(s => s.id === studentId);
                              if (!student) return null;
                              return (
                                <div
                                  key={student.id}
                                  draggable
                                  onDragStart={() => handleDragStart(student)}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: '6px',
                                    padding: '0.3rem 0.5rem',
                                    cursor: 'grab',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  <span style={{ fontSize: '1rem' }}>{student.photo}</span>
                                  <span>{student.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.5rem', textAlign: 'center' }}>
                👁️ Visual Grouping Preview
              </h3>
              
              {isWholeClass ? (
                // Whole Class Preview
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2rem'
                }}>
                  {/* Staff */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    {selectedStaff.map(staff => (
                      <div
                        key={staff.id}
                        style={{
                          background: 'linear-gradient(145deg, #667eea, #764ba2)',
                          borderRadius: '50%',
                          width: '80px',
                          height: '80px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '2rem',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                          border: '3px solid rgba(255,255,255,0.3)'
                        }}
                      >
                        <div>{staff.photo}</div>
                        <div style={{
                          fontSize: '0.6rem',
                          fontWeight: '600',
                          marginTop: '0.3rem',
                          textAlign: 'center'
                        }}>
                          {staff.name.split(' ')[0]}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Students */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                    gap: '1rem',
                    justifyItems: 'center',
                    maxWidth: '600px'
                  }}>
                    {selectedStudents.map(student => (
                      <div
                        key={student.id}
                        style={{
                          background: 'linear-gradient(145deg, #2ecc71, #27ae60)',
                          borderRadius: '50%',
                          width: '60px',
                          height: '60px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.5rem',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                          border: '2px solid rgba(255,255,255,0.4)'
                        }}
                      >
                        <div>{student.photo}</div>
                        <div style={{
                          fontSize: '0.5rem',
                          fontWeight: '600',
                          marginTop: '0.2rem'
                        }}>
                          {student.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    opacity: 0.9
                  }}>
                    🌟 Whole Class Activity
                  </div>
                </div>
              ) : (
                // Small Groups Preview
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '2rem',
                  justifyItems: 'center'
                }}>
                  {groups.map(group => {
                    const groupStaff = selectedStaff.find(s => s.id === group.staffId);
                    const groupStudents = availableStudents.filter(s => group.students.includes(s.id));
                    
                    return (
                      <div
                        key={group.id}
                        style={{
                          background: `linear-gradient(145deg, ${group.color}dd, ${group.color}aa)`,
                          borderRadius: '20px',
                          padding: '1.5rem',
                          backdropFilter: 'blur(10px)',
                          border: `3px solid ${group.color}`,
                          boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                          minHeight: '200px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          minWidth: '200px'
                        }}
                      >
                        {/* Group Name */}
                        <h4 style={{
                          color: 'white',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          margin: '0 0 1rem 0',
                          textAlign: 'center',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                          {group.name}
                        </h4>

                        {/* Staff */}
                        {groupStaff && (
                          <div style={{
                            background: 'rgba(255,255,255,0.9)',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: group.color,
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                            border: `2px solid ${group.color}`,
                            marginBottom: '1rem'
                          }}
                        >
                          <div>{groupStaff.photo}</div>
                          <div style={{
                            fontSize: '0.4rem',
                            marginTop: '0.2rem',
                            textAlign: 'center'
                          }}>
                            {groupStaff.name.split(' ')[0]}
                          </div>
                        </div>
                        )}

                        {/* Students */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '0.5rem',
                          justifyItems: 'center'
                        }}>
                          {groupStudents.map(student => (
                            <div
                              key={student.id}
                              style={{
                                background: 'rgba(255,255,255,0.95)',
                                borderRadius: '50%',
                                width: '50px',
                                height: '50px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: group.color,
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                                border: `2px solid ${group.color}`
                              }}
                            >
                              <div>{student.photo}</div>
                              <div style={{
                                fontSize: '0.4rem',
                                marginTop: '0.2rem',
                                textAlign: 'center',
                                fontWeight: '700'
                              }}>
                                {student.name}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Group indicator */}
                        <div style={{
                          marginTop: '1rem',
                          padding: '0.3rem 0.8rem',
                          background: 'rgba(255,255,255,0.2)',
                          borderRadius: '15px',
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>
                          {groupStudents.length} students
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            {isWholeClass 
              ? `${selectedStaff.length} staff, ${selectedStudents.length} students selected`
              : `${groups.length} groups created`
            }
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.8rem 1.5rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                border: '2px solid white',
                borderRadius: '8px',
                padding: '0.8rem 1.5rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              💾 Save Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityAssignmentModal;
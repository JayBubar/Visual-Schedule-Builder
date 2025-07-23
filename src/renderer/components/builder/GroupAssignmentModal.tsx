import React, { useState, useEffect } from 'react';
import { useStaffData } from '../../hooks/useStaffData';
import { useStudentData } from '../../hooks/useStudentData';
import { EnhancedActivity, GroupAssignment, Student, StaffMember, GroupTemplate, GroupingType } from '../../types';
import { DEFAULT_GROUP_TEMPLATES } from '../../utils/schedulePersistence';
import { GROUP_COLORS, getGroupingIcon, getGroupingDescription } from '../../utils/groupingHelpers';

interface GroupAssignmentModalProps {
  activity: EnhancedActivity;
  staff: StaffMember[];
  onSave: (updatedActivity: EnhancedActivity) => void;
  onCancel: () => void;
}

const GroupAssignmentModal: React.FC<GroupAssignmentModalProps> = ({
  activity,
  staff,
  onSave,
  onCancel
}) => {
  // Use real staff data from hook
  const { staff: allStaff } = useStaffData();
  const { students } = useStudentData();
  
  // Photo display helper function
  const renderStudentPhoto = (student: Student) => (
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden' }}>
      {student.photo ? (
        <img src={student.photo} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ background: '#667eea', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1rem', fontWeight: '700' }}>
          {student.name.split(' ').map(n => n[0]).join('')}
        </div>
      )}
    </div>
  );
  
  const [groupingType, setGroupingType] = useState<GroupingType>(activity.groupingType);
  const [groupAssignments, setGroupAssignments] = useState<GroupAssignment[]>(activity.groupAssignments);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Get unassigned students
  const getUnassignedStudents = () => {
    const assignedStudentIds = groupAssignments.flatMap(group => group.studentIds);
    return students.filter(student => !assignedStudentIds.includes(student.id));
  };

  // Get available staff (not yet assigned to groups)
  const getAvailableStaff = () => {
    const assignedStaffIds = groupAssignments.map(group => group.staffMember.id);
    return allStaff.filter(staffMember => !assignedStaffIds.includes(staffMember.id));
  };

  // Apply template
  const applyTemplate = (template: GroupTemplate) => {
    const newGroups: GroupAssignment[] = [];
    const currentlyAssigned = new Set<string>(); // Track staff assignments for this template
    
    for (let i = 0; i < template.groupCount; i++) {
      const color = template.suggestedColors[i] || GROUP_COLORS[i]?.value || 'blue';
      
      // Get available staff that aren't already assigned in current groups OR in this new template
      const availableStaff = allStaff.filter(staff => 
        !groupAssignments.some(group => group.staffMember.id === staff.id) &&
        !currentlyAssigned.has(staff.id)
      );
      
      // Select the best available staff member
      const selectedStaff = availableStaff[0] || allStaff[i % allStaff.length] || allStaff[0];
      
      if (selectedStaff) {
        currentlyAssigned.add(selectedStaff.id);
      }
      
      newGroups.push({
        id: `group-${Date.now()}-${i}`,
        groupName: `${template.name} ${i + 1}`,
        color: color as any,
        staffMember: {
          id: selectedStaff.id,
          name: selectedStaff.name,
          role: selectedStaff.role,
          avatar: selectedStaff.avatar,
          photo: selectedStaff.photo
        },
        studentIds: [],
        location: '',
        activityVariation: '',
        notes: ''
      });
    }
    
    setGroupAssignments(newGroups);
    setGroupingType('small-groups');
    setSelectedTemplate('');
  };

  // Add new group
  const addGroup = () => {
    const usedColors = groupAssignments.map(g => g.color);
    const availableColor = GROUP_COLORS.find(c => !usedColors.includes(c.value as any))?.value || 'blue';
    
    // Get truly available staff members
    const availableStaff = allStaff.filter(staff => 
      !groupAssignments.some(group => group.staffMember.id === staff.id)
    );
    
    // Select best available staff or cycle through all staff if needed
    const selectedStaff = availableStaff[0] || allStaff[groupAssignments.length % allStaff.length] || allStaff[0];
    
    const newGroup: GroupAssignment = {
      id: `group-${Date.now()}`,
      groupName: `Group ${groupAssignments.length + 1}`,
      color: availableColor as any,
      staffMember: {
        id: selectedStaff.id,
        name: selectedStaff.name,
        role: selectedStaff.role,
        avatar: selectedStaff.avatar,
        photo: selectedStaff.photo
      },
      studentIds: [],
      location: '',
      activityVariation: '',
      notes: ''
    };
    
    setGroupAssignments([...groupAssignments, newGroup]);
  };

  // Update specific group
  const updateGroup = (groupId: string, updates: Partial<GroupAssignment>) => {
    setGroupAssignments(prev => 
      prev.map(group => 
        group.id === groupId ? { ...group, ...updates } : group
      )
    );
  };

  // Remove group
  const removeGroup = (groupId: string) => {
    setGroupAssignments(prev => prev.filter(group => group.id !== groupId));
  };

  // Move student to group
  const moveStudentToGroup = (studentId: string, targetGroupId: string) => {
    // Remove student from all groups first
    const clearedGroups = groupAssignments.map(group => ({
      ...group,
      studentIds: group.studentIds.filter(id => id !== studentId)
    }));
    
    // Add to target group if specified
    if (targetGroupId) {
      const updatedGroups = clearedGroups.map(group => 
        group.id === targetGroupId 
          ? { ...group, studentIds: [...group.studentIds, studentId] }
          : group
      );
      setGroupAssignments(updatedGroups);
    } else {
      // Just remove from all groups
      setGroupAssignments(clearedGroups);
    }
  };

  // Quick Actions
  const assignAllStudents = () => {
    if (groupAssignments.length === 0) return;
    
    const studentsPerGroup = Math.ceil(students.length / groupAssignments.length);
    const updatedGroups = groupAssignments.map((group, index) => {
      const startIndex = index * studentsPerGroup;
      const endIndex = Math.min(startIndex + studentsPerGroup, students.length);
      const assignedStudents = students.slice(startIndex, endIndex).map(s => s.id);
      
      return {
        ...group,
        studentIds: assignedStudents
      };
    });
    
    setGroupAssignments(updatedGroups);
  };

  const clearAllStudents = () => {
    const clearedGroups = groupAssignments.map(group => ({
      ...group,
      studentIds: []
    }));
    setGroupAssignments(clearedGroups);
  };

  // Save changes
  const handleSave = () => {
    const updatedActivity: EnhancedActivity = {
      ...activity,
      groupingType,
      groupAssignments: groupingType === 'small-groups' ? groupAssignments : []
    };
    onSave(updatedActivity);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '1200px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <h3>🎯 Group Assignment - {activity.name}</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto' }}>
          {/* Activity Context */}
          <div style={{
            background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
              📊 Activity: {activity.emoji} {activity.name}
            </h4>
            <p style={{ margin: '0', color: '#6c757d', fontSize: '0.9rem' }}>
              Duration: {activity.duration} minutes | Category: {activity.category}
            </p>
          </div>

          {/* Grouping Type Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>👥 Grouping Type</h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {(['whole-class', 'small-groups', 'individual', 'flexible'] as GroupingType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setGroupingType(type)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: groupingType === type ? '3px solid #667eea' : '2px solid #e1e8ed',
                    borderRadius: '12px',
                    background: groupingType === type 
                      ? 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)' 
                      : 'white',
                    color: groupingType === type ? 'white' : '#2c3e50',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{getGroupingIcon(type)}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div>{type.replace('-', ' ').toUpperCase()}</div>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      opacity: 0.8,
                      fontWeight: '400'
                    }}>
                      {getGroupingDescription(type).split(' ').slice(0, 4).join(' ')}...
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Small Groups Setup */}
          {groupingType === 'small-groups' && (
            <>
              {/* Quick Templates */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>🚀 Quick Setup Templates</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {DEFAULT_GROUP_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      style={{
                        padding: '1rem',
                        border: '2px solid #e1e8ed',
                        borderRadius: '12px',
                        background: 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e1e8ed';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ fontWeight: '700', color: '#2c3e50', marginBottom: '0.5rem' }}>
                        {template.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                        {template.description}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#667eea', fontWeight: '600' }}>
                        {template.groupCount} groups • {template.typicalUse}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Management */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h4 style={{ margin: 0 }}>🎨 Group Setup</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {/* Quick Action Buttons */}
                  <div className="quick-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={assignAllStudents}
                      className="quick-action-btn assign-all-btn"
                      disabled={groupAssignments.length === 0 || students.length === 0}
                      style={{
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: groupAssignments.length === 0 || students.length === 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '36px',
                        opacity: groupAssignments.length === 0 || students.length === 0 ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (groupAssignments.length > 0 && students.length > 0) {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (groupAssignments.length > 0 && students.length > 0) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      ✅ Assign All
                    </button>
                    
                    <button
                      onClick={clearAllStudents}
                      className="quick-action-btn clear-all-btn"
                      disabled={groupAssignments.every(g => g.studentIds.length === 0)}
                      style={{
                        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: groupAssignments.every(g => g.studentIds.length === 0) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '36px',
                        opacity: groupAssignments.every(g => g.studentIds.length === 0) ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!groupAssignments.every(g => g.studentIds.length === 0)) {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!groupAssignments.every(g => g.studentIds.length === 0)) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      🗑️ Clear All
                    </button>
                  </div>
                  
                  <button
                    onClick={addGroup}
                    className="create-activity-button"
                    disabled={groupAssignments.length >= 6}
                    style={{ minHeight: '36px' }}
                  >
                    ➕ Add Group
                  </button>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="create-activity-button"
                    style={{ 
                      background: showPreview ? '#28a745' : '#6c757d',
                      minHeight: '36px'
                    }}
                  >
                    👁️ {showPreview ? 'Hide' : 'Show'} Preview
                  </button>
                </div>
              </div>

              {/* Groups Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                {groupAssignments.map(group => (
                  <GroupEditor
                    key={group.id}
                    group={group}
                    availableStudents={[...getUnassignedStudents(), ...students.filter(s => group.studentIds.includes(s.id))]}
                    availableStaff={allStaff.filter(s => s.id === group.staffMember.id || !groupAssignments.some(g => g.id !== group.id && g.staffMember.id === s.id))}
                    onUpdateGroup={(updates) => updateGroup(group.id, updates)}
                    onDeleteGroup={() => removeGroup(group.id)}
                    onMoveStudent={moveStudentToGroup}
                  />
                ))}
              </div>

              {/* Enhanced Unassigned Students with Dropdown Assignment */}
              {getUnassignedStudents().length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #fff3cd 0%, #fef5e7 100%)',
                  border: '2px solid #ffeaa7',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 12px rgba(255, 234, 167, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h5 style={{ margin: 0, color: '#856404', fontSize: '1.1rem', fontWeight: '700' }}>
                      ⚠️ Unassigned Students ({getUnassignedStudents().length})
                    </h5>
                    <div style={{ fontSize: '0.8rem', color: '#856404', fontWeight: '500' }}>
                      Use dropdowns below to assign quickly
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {getUnassignedStudents().map(student => (
                      <div
                        key={student.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          background: 'white',
                          border: '2px solid #ffeaa7',
                          borderRadius: '12px',
                          padding: '0.75rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          minWidth: '150px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#2c3e50'
                        }}>
                          <div style={{ width: '32px', height: '32px', overflow: 'hidden', borderRadius: '50%', flexShrink: 0 }}>
                            {student.photo ? (
                              <img src={student.photo} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                fontSize: '1rem',
                                fontWeight: '700'
                              }}>
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            )}
                          </div>
                          {student.name}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <select
                            className="student-assignment-dropdown"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                moveStudentToGroup(student.id, e.target.value);
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              border: '2px solid #e1e8ed',
                              borderRadius: '12px',
                              fontSize: '14px',
                              background: 'white',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              minHeight: '44px',
                              fontWeight: '500'
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#667eea';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#e1e8ed';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <option value="">🎯 Assign to group...</option>
                            {groupAssignments.map(group => {
                              const groupColor = GROUP_COLORS.find(c => c.value === group.color);
                              return (
                                <option key={group.id} value={group.id}>
                                  🔴 {group.groupName} ({group.studentIds.length} students)
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Preview */}
              {showPreview && (
                <div style={{
                  background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '1rem'
                }}>
                  <h5 style={{ margin: '0 0 1rem 0' }}>👁️ Display Mode Preview</h5>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '1rem',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: '700', 
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      {activity.emoji} {activity.name}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.min(groupAssignments.length, 3)}, 1fr)`,
                      gap: '1rem'
                    }}>
                      {groupAssignments.map(group => {
                        const groupStudents = students.filter(s => group.studentIds.includes(s.id));
                        return (
                          <div
                            key={group.id}
                            style={{
                              background: GROUP_COLORS.find(c => c.value === group.color)?.hex || '#3498db',
                              padding: '1rem',
                              borderRadius: '12px',
                              textAlign: 'center',
                              color: 'white'
                            }}
                          >
                            <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>
                              {group.groupName}
                            </div>
                            <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                              👨‍🏫 {group.staffMember.name}
                            </div>
                            <div style={{ fontSize: '0.8rem' }}>
                              👥 {groupStudents.length} students
                              {group.location && <div>📍 {group.location}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Non-Small-Groups Description */}
          {groupingType !== 'small-groups' && (
            <div style={{
              background: '#e3f2fd',
              border: '1px solid #bbdefb',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
              color: '#1565c0'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {getGroupingIcon(groupingType)}
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>
                {groupingType.replace('-', ' ').toUpperCase()} Setup
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {getGroupingDescription(groupingType)}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>
            💾 Save Group Setup
          </button>
        </div>
      </div>
    </div>
  );
};

// Individual Group Editor Component
interface GroupEditorProps {
  group: GroupAssignment;
  availableStudents: Student[];
  availableStaff: StaffMember[];
  onUpdateGroup: (updates: Partial<GroupAssignment>) => void;
  onDeleteGroup: () => void;
  onMoveStudent: (studentId: string, groupId: string) => void;
}

const GroupEditor: React.FC<GroupEditorProps> = ({
  group,
  availableStudents,
  availableStaff,
  onUpdateGroup,
  onDeleteGroup,
  onMoveStudent
}) => {
  const groupColor = GROUP_COLORS.find(c => c.value === group.color);
  const groupStudents = availableStudents.filter(s => group.studentIds.includes(s.id));

  return (
    <div style={{
      border: `3px solid ${groupColor?.hex || '#3498db'}`,
      borderRadius: '12px',
      padding: '1rem',
      background: 'white',
      position: 'relative'
    }}>
      {/* Delete Button */}
      <button
        onClick={onDeleteGroup}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        ×
      </button>

      {/* Group Header */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={group.groupName}
          onChange={(e) => onUpdateGroup({ groupName: e.target.value })}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #e1e8ed',
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '1rem',
            marginBottom: '0.5rem'
          }}
          placeholder="Group Name"
        />
        
        {/* Color Selector */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
          {GROUP_COLORS.map(color => (
            <button
              key={color.value}
              onClick={() => onUpdateGroup({ color: color.value as any })}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: group.color === color.value ? '3px solid #2c3e50' : '1px solid #e1e8ed',
                background: color.hex,
                cursor: 'pointer'
              }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Staff Assignment WITH PHOTOS */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: '700', color: '#2c3e50', display: 'block', marginBottom: '0.75rem' }}>
          👨‍🏫 Staff Member Assignment
        </label>
        
        {/* Current Staff Member Display */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '2px solid #667eea',
          borderRadius: '16px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minHeight: '80px'
        }}>
          {/* Staff Photo */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: group.staffMember.photo 
              ? `url(${group.staffMember.photo}) center/cover`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: '3px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white',
            fontWeight: '700',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            {!group.staffMember.photo && ((group.staffMember as any).avatar || '👨‍🏫')}
          </div>
          
          {/* Staff Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '0.25rem'
            }}>
              {group.staffMember.name}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6c757d',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {group.staffMember.role}
            </div>
            {(group.staffMember as any).specializations && (
              <div style={{
                fontSize: '0.8rem',
                color: '#667eea',
                marginTop: '0.25rem',
                fontStyle: 'italic'
              }}>
                Specializations: {(group.staffMember as any).specializations.join(', ')}
              </div>
            )}
          </div>
          
          {/* Assignment Status */}
          <div style={{
            background: '#28a745',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ✅ Assigned
          </div>
        </div>
        
        {/* Staff Selection Dropdown */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d', display: 'block', marginBottom: '0.5rem' }}>
            Change Staff Assignment:
          </label>
          <select
            className="student-assignment-dropdown"
            value={group.staffMember.id}
            onChange={(e) => {
              const selectedStaff = availableStaff.find(s => s.id === e.target.value);
              if (selectedStaff) {
                onUpdateGroup({ staffMember: selectedStaff });
              }
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e1e8ed',
              borderRadius: '12px',
              fontSize: '14px',
              background: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minHeight: '44px',
              fontWeight: '500'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e1e8ed';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {availableStaff.map(staff => (
              <option key={staff.id} value={staff.id}>
                👨‍🏫 {staff.name} ({staff.role})
                {(staff as any).specializations && ` • ${(staff as any).specializations.join(', ')}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Section */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d', display: 'block', marginBottom: '0.5rem' }}>
          👥 Students ({groupStudents.length})
        </label>
        
        {/* Enhanced Current Students Display */}
        <div style={{
          minHeight: '80px',
          border: `3px solid ${groupColor?.hex || '#3498db'}20`,
          borderRadius: '12px',
          padding: '0.75rem',
          background: `linear-gradient(135deg, ${groupColor?.hex || '#3498db'}08 0%, ${groupColor?.hex || '#3498db'}15 100%)`,
          marginBottom: '0.75rem',
          backdropFilter: 'blur(5px)'
        }}>
          {groupStudents.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#6c757d', 
              fontSize: '0.9rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{ fontSize: '2rem', opacity: 0.5 }}>👥</div>
              <div style={{ fontWeight: '600' }}>No students assigned yet</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Use the dropdown below to add students</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {groupStudents.map(student => (
                <div
                  key={student.id}
                  style={{
                    background: 'white',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    border: `2px solid ${groupColor?.hex || '#3498db'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease',
                    fontWeight: '600',
                    color: '#2c3e50',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => onMoveStudent(student.id, '')} // Remove from group
                  title="Click to remove from group"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.background = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  <div style={{ width: '24px', height: '24px', overflow: 'hidden', borderRadius: '50%', flexShrink: 0 }}>
                    {student.photo ? (
                      <img src={student.photo} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ 
                        background: `${groupColor?.hex || '#3498db'}`,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        fontSize: '0.7rem',
                        fontWeight: '700'
                      }}>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  {student.name}
                  <span style={{ color: '#e74c3c', fontSize: '0.7rem', marginLeft: '0.25rem' }}>×</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Add Student Dropdown */}
        <select
          className="student-assignment-dropdown"
          value=""
          onChange={(e) => {
            if (e.target.value) {
              onMoveStudent(e.target.value, group.id);
            }
          }}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e1e8ed',
            borderRadius: '12px',
            fontSize: '14px',
            background: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '44px',
            fontWeight: '500'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e1e8ed';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseEnter={(e) => {
            if (e.currentTarget !== document.activeElement) {
              e.currentTarget.style.borderColor = '#667eea';
            }
          }}
          onMouseLeave={(e) => {
            if (e.currentTarget !== document.activeElement) {
              e.currentTarget.style.borderColor = '#e1e8ed';
            }
          }}
        >
          <option value="">➕ Add student to {group.groupName}...</option>
          {availableStudents
            .filter(s => !group.studentIds.includes(s.id))
            .map(student => (
              <option key={student.id} value={student.id}>
                🧑‍🎓 {student.name}
              </option>
            ))}
        </select>
      </div>

      {/* Optional Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
        <input
          type="text"
          value={group.location || ''}
          onChange={(e) => onUpdateGroup({ location: e.target.value })}
          placeholder="Location (optional)"
          style={{
            padding: '0.5rem',
            border: '1px solid #e1e8ed',
            borderRadius: '6px',
            fontSize: '0.8rem'
          }}
        />
        <input
          type="text"
          value={group.activityVariation || ''}
          onChange={(e) => onUpdateGroup({ activityVariation: e.target.value })}
          placeholder="Activity variation (optional)"
          style={{
            padding: '0.5rem',
            border: '1px solid #e1e8ed',
            borderRadius: '6px',
            fontSize: '0.8rem'
          }}
        />
      </div>
    </div>
  );
};

export default GroupAssignmentModal;
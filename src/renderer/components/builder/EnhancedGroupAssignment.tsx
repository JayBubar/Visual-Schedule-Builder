import React, { useState, useEffect } from 'react';

// Types matching your project structure
interface Student {
  id: string;
  name: string;
  grade?: string;
  photo?: string | null;
  workingStyle: 'independent' | 'collaborative' | 'guided' | 'needs-support';
  accommodations?: string[];
  goals?: string[];
  behaviorNotes?: string;
  medicalNotes?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  emergencyContact?: string;
  resourceInfo?: {
    attendsResource: boolean;
    resourceType: string;
    resourceTeacher: string;
    timeframe: string;
  };
  preferredPartners?: string[];
  avoidPartners?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  photo?: string | null;
  isActive: boolean;
  startDate: string;
  notes?: string;
  isResourceTeacher?: boolean;
  isRelatedArtsTeacher?: boolean;
}

interface StudentGroup {
  id: string;
  name: string;
  label?: string;
  description: string;
  staffId: string;
  students: string[];
  studentIds: string[];
  color: string;
  isTemplate: boolean;
  groupType: 'academic' | 'social' | 'therapy' | 'mixed' | 'behavior';
  targetSkills: string[];
  maxSize: number;
  minSize: number;
  createdAt: string;
  updatedAt: string;
}

interface ActivityAssignment {
  staffIds: string[];
  groupIds: string[];
  isWholeClass: boolean;
  notes: string;
  groupingType?: 'whole-class' | 'small-groups' | 'individual' | 'flexible';
}

interface EnhancedGroupAssignmentProps {
  activity: {
    id: string;
    name: string;
    icon: string;
    duration: number;
    assignment?: ActivityAssignment;
  };
  staff: StaffMember[];
  students: Student[];
  groups: StudentGroup[];
  onSave: (assignment: ActivityAssignment) => void;
  onCancel: () => void;
}

const EnhancedGroupAssignment: React.FC<EnhancedGroupAssignmentProps> = ({
  activity,
  staff: propStaff,
  students: propStudents,
  groups: initialGroups,
  onSave,
  onCancel
}) => {
  // State management
  const [selectedStaff, setSelectedStaff] = useState<string[]>(activity.assignment?.staffIds || []);
  const [groupingType, setGroupingType] = useState<'whole-class' | 'small-groups' | 'individual' | 'flexible'>(
    activity.assignment?.groupingType || 'whole-class'
  );
  const [notes, setNotes] = useState(activity.assignment?.notes || '');
  
  // Use real data from your app's localStorage
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>(initialGroups);
  
  // Dynamic assignments
  const [studentAssignments, setStudentAssignments] = useState<Record<string, string>>({});
  const [staffAssignments, setStaffAssignments] = useState<Record<string, string>>({});
  const [draggedStudent, setDraggedStudent] = useState<string | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);

  // Load real data from localStorage (your actual app data)
  useEffect(() => {
    console.log('🔄 Loading real student and staff data from localStorage...');
    
    // Load students using your app's storage key
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      try {
        const parsedStudents = JSON.parse(savedStudents);
        console.log(`📚 Loaded ${parsedStudents.length} real students from localStorage`);
        setStudents(parsedStudents.filter((s: Student) => s.isActive !== false));
      } catch (error) {
        console.error('Error loading students:', error);
        setStudents(propStudents); // Fallback to props
      }
    } else {
      console.log('📚 No saved students found, using props');
      setStudents(propStudents);
    }

    // Load staff using your app's storage key  
    const savedStaff = localStorage.getItem('staff_members');
    if (savedStaff) {
      try {
        const parsedStaff = JSON.parse(savedStaff);
        console.log(`👨‍🏫 Loaded ${parsedStaff.length} real staff from localStorage`);
        setStaff(parsedStaff.filter((s: StaffMember) => s.isActive));
      } catch (error) {
        console.error('Error loading staff:', error);
        setStaff(propStaff); // Fallback to props
      }
    } else {
      console.log('👨‍🏫 No saved staff found, using props');
      setStaff(propStaff);
    }
  }, [propStudents, propStaff]);

  // Initialize student assignments from existing groups
  useEffect(() => {
    const assignments: Record<string, string> = {};
    const staffGroupAssignments: Record<string, string> = {};
    
    groups.forEach(group => {
      group.studentIds.forEach(studentId => {
        assignments[studentId] = group.id;
      });
      
      // Assign staff to groups based on staffId
      if (group.staffId) {
        staffGroupAssignments[group.staffId] = group.id;
      }
    });
    
    setStudentAssignments(assignments);
    setStaffAssignments(staffGroupAssignments);
  }, [groups]);

  // Get unassigned students
  const unassignedStudents = students.filter(student => !studentAssignments[student.id]);
  
  // Get students for a specific group
  const getGroupStudents = (groupId: string) => {
    return students.filter(student => studentAssignments[student.id] === groupId);
  };

  // Get staff for a specific group
  const getGroupStaff = (groupId: string) => {
    return staff.filter(staffMember => 
      staffAssignments[staffMember.id] === groupId || 
      selectedStaff.includes(staffMember.id)
    );
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, studentId: string) => {
    setDraggedStudent(studentId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, groupId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverGroup(groupId || 'unassigned');
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverGroup(null);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetGroupId?: string) => {
    e.preventDefault();
    
    if (!draggedStudent) return;

    const newAssignments = { ...studentAssignments };
    
    if (targetGroupId) {
      // Assign to group
      newAssignments[draggedStudent] = targetGroupId;
    } else {
      // Remove from any group (unassign)
      delete newAssignments[draggedStudent];
    }
    
    setStudentAssignments(newAssignments);
    setDraggedStudent(null);
    setDragOverGroup(null);
    
    // Update grouping type automatically
    if (targetGroupId && groupingType === 'whole-class') {
      setGroupingType('small-groups');
    }
  };

  // Assign staff to group
  const assignStaffToGroup = (staffId: string, groupId: string) => {
    setStaffAssignments(prev => ({
      ...prev,
      [staffId]: groupId
    }));
    
    // Also add to selected staff if not already there
    if (!selectedStaff.includes(staffId)) {
      setSelectedStaff(prev => [...prev, staffId]);
    }
  };

  // Remove staff from group (FIXED VERSION)
  const removeStaffFromGroup = (staffId: string) => {
    // Only remove from staff assignments (removes from specific group)
    // Keep in selectedStaff so they remain available for other groups
    setStaffAssignments(prev => {
      const newAssignments = { ...prev };
      delete newAssignments[staffId];
      return newAssignments;
    });
  };

  // Quick assign all students to groups
  const handleAssignAll = () => {
    if (groups.length === 0) return;
    
    const assignments: Record<string, string> = {};
    students.forEach((student, index) => {
      const groupIndex = index % groups.length;
      assignments[student.id] = groups[groupIndex].id;
    });
    
    setStudentAssignments(assignments);
    setGroupingType('small-groups');
  };

  // Clear all assignments
  const handleClearAll = () => {
    setStudentAssignments({});
    setStaffAssignments({});
    setGroupingType('individual');
  };

  // Toggle whole class
  const handleWholeClassToggle = (isWholeClass: boolean) => {
    if (isWholeClass) {
      setStudentAssignments({});
      setStaffAssignments({});
      setGroupingType('whole-class');
    }
  };

  // Handle save with enhanced data structure for Smartboard display
  const handleSave = () => {
    // Create detailed group assignments for Smartboard display
    const detailedGroupAssignments = groups.map(group => {
      const groupStudents = getGroupStudents(group.id);
      const groupStaff = getGroupStaff(group.id);
      const primaryStaff = staff.find(s => s.id === group.staffId) || groupStaff[0];
      
      if (groupStudents.length === 0) return null; // Skip empty groups
      
      return {
        id: group.id,
        groupName: group.name,
        color: group.color as 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange',
        staffMember: primaryStaff ? {
          id: primaryStaff.id,
          name: primaryStaff.name,
          role: primaryStaff.role,
          avatar: primaryStaff.photo || '👨‍🏫'
        } : null,
        studentIds: groupStudents.map(s => s.id),
        students: groupStudents,
        location: group.description || 'Classroom',
        groupType: group.groupType,
        targetSkills: group.targetSkills
      };
    }).filter(Boolean);

    // Update the activity assignment with enhanced structure
    const updatedGroups = groups.map(group => ({
      ...group,
      studentIds: students
        .filter(student => studentAssignments[student.id] === group.id)
        .map(student => student.id),
      students: students
        .filter(student => studentAssignments[student.id] === group.id)
        .map(student => student.id)
    }));

    const selectedGroupIds = updatedGroups
      .filter(group => group.studentIds.length > 0)
      .map(group => group.id);

    // Enhanced assignment object with group details for display
    const enhancedAssignment: ActivityAssignment & { groupAssignments?: any[] } = {
      staffIds: selectedStaff,
      groupIds: selectedGroupIds,
      isWholeClass: groupingType === 'whole-class',
      notes: notes.trim(),
      groupingType: groupingType,
      groupAssignments: detailedGroupAssignments // For Smartboard display
    };

    console.log('💾 Saving enhanced assignment:', enhancedAssignment);
    onSave(enhancedAssignment);
  };

  // Student card component with real photo support
  const StudentCard: React.FC<{ student: Student; isInGroup?: boolean; groupColor?: string }> = ({ 
    student, 
    isInGroup = false, 
    groupColor 
  }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, student.id)}
      style={{
        padding: '0.75rem',
        background: draggedStudent === student.id 
          ? 'rgba(102, 126, 234, 0.2)' 
          : isInGroup 
            ? `${groupColor}15` 
            : 'white',
        border: draggedStudent === student.id 
          ? '2px dashed #667eea' 
          : isInGroup 
            ? `2px solid ${groupColor}` 
            : '2px solid #e9ecef',
        borderRadius: '8px',
        cursor: 'grab',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        opacity: draggedStudent === student.id ? 0.7 : 1,
        transform: draggedStudent === student.id ? 'rotate(2deg)' : 'none'
      }}
      onMouseEnter={(e) => {
        if (draggedStudent !== student.id) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (draggedStudent !== student.id) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: student.photo 
            ? 'transparent' 
            : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
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
            student.name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#2c3e50' }}>
            {student.name}
          </div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>
            {student.grade || 'No grade'} • {student.workingStyle}
          </div>
        </div>
      </div>
    </div>
  );

  // Staff card component
  const StaffCard: React.FC<{ staffMember: StaffMember; groupColor?: string }> = ({ 
    staffMember, 
    groupColor 
  }) => (
    <div style={{
      padding: '0.5rem 0.75rem',
      background: `${groupColor}20`,
      border: `1px solid ${groupColor}`,
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        overflow: 'hidden',
        background: staffMember.photo 
          ? 'transparent' 
          : `linear-gradient(135deg, #28a745 0%, #20c997 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        flexShrink: 0
      }}>
        {staffMember.photo ? (
          <img
            src={staffMember.photo}
            alt={staffMember.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          '👨‍🏫'
        )}
      </div>
      <div>
        <div style={{ fontWeight: '600', fontSize: '12px', color: '#2c3e50' }}>
          {staffMember.name}
        </div>
        <div style={{ fontSize: '10px', color: '#6c757d' }}>
          {staffMember.role}
        </div>
      </div>
      <button
        onClick={() => removeStaffFromGroup(staffMember.id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#dc3545',
          cursor: 'pointer',
          fontSize: '14px',
          marginLeft: 'auto',
          padding: '2px'
        }}
        title="Remove from group"
      >
        ×
      </button>
    </div>
  );

  return (
    <div style={{ padding: '1.5rem', maxHeight: '80vh', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: '#2c3e50', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activity.icon} {activity.name}
        </h4>
        <p style={{ color: '#6c757d', fontSize: '14px' }}>
          Drag students to assign them to groups • {activity.duration} minutes • {students.length} students, {staff.length} staff
        </p>
      </div>

      {/* Staff Assignment */}
      <div style={{ marginBottom: '2rem' }}>
        <h5 style={{ marginBottom: '1rem', color: '#2c3e50' }}>👨‍🏫 Available Staff ({staff.length})</h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {staff.map(staffMember => (
            <label
              key={staffMember.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: selectedStaff.includes(staffMember.id) ? '#e3f2fd' : '#f8f9fa',
                borderRadius: '8px',
                border: selectedStaff.includes(staffMember.id) ? '2px solid #2196f3' : '1px solid #dee2e6',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <input
                type="checkbox"
                checked={selectedStaff.includes(staffMember.id)}
                onChange={() => {
                  setSelectedStaff(prev => 
                    prev.includes(staffMember.id) 
                      ? prev.filter(id => id !== staffMember.id)
                      : [...prev, staffMember.id]
                  );
                }}
                style={{ margin: 0 }}
              />
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: staffMember.photo 
                  ? 'transparent' 
                  : `linear-gradient(135deg, #28a745 0%, #20c997 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                {staffMember.photo ? (
                  <img
                    src={staffMember.photo}
                    alt={staffMember.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  '👨‍🏫'
                )}
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#2c3e50' }}>{staffMember.name}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>{staffMember.role}</div>
                {staffMember.specialties && staffMember.specialties.length > 0 && (
                  <div style={{ fontSize: '10px', color: '#28a745' }}>
                    {staffMember.specialties.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Grouping Style Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <h5 style={{ marginBottom: '1rem', color: '#2c3e50' }}>📋 Activity Grouping Style</h5>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { type: 'whole-class', label: '👥 Whole Class', desc: 'Everyone together' },
            { type: 'small-groups', label: '👤 Small Groups', desc: 'Divided groups' },
            { type: 'individual', label: '🧑 Individual', desc: 'Each student alone' },
            { type: 'flexible', label: '🔄 Flexible', desc: 'Mixed arrangements' }
          ].map(({ type, label, desc }) => (
            <button
              key={type}
              onClick={() => {
                setGroupingType(type as any);
                if (type === 'whole-class') {
                  handleWholeClassToggle(true);
                }
              }}
              style={{
                padding: '0.75rem 1rem',
                border: groupingType === type ? '2px solid #667eea' : '2px solid #dee2e6',
                background: groupingType === type ? 'rgba(102, 126, 234, 0.1)' : 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.85rem',
                fontWeight: '600',
                minHeight: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                flex: '1',
                minWidth: '120px'
              }}
            >
              <div style={{ fontSize: '0.9rem', color: groupingType === type ? '#667eea' : '#2c3e50' }}>
                {label}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: groupingType === type ? '#667eea' : '#6c757d',
                textAlign: 'center'
              }}>
                {desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Student Assignment */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h5 style={{ margin: 0, color: '#2c3e50' }}>👥 Assign Students ({students.length} total)</h5>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleAssignAll}
              disabled={groups.length === 0}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: groups.length === 0 ? 'not-allowed' : 'pointer',
                background: groups.length === 0 ? '#e9ecef' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: groups.length === 0 ? '#6c757d' : 'white',
                transition: 'all 0.3s ease'
              }}
            >
              ✅ Assign All
            </button>
            
            <button
              onClick={handleClearAll}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* Whole Class Option */}
        {groupingType === 'whole-class' && (
          <div style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)',
            borderRadius: '12px',
            border: '3px solid #28a745',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥</div>
            <div style={{ fontWeight: '700', color: '#155724', fontSize: '16px', marginBottom: '4px' }}>
              Whole Class Activity
            </div>
            <div style={{ fontSize: '14px', color: '#155724', fontWeight: '500' }}>
              All {students.length} students participate together
              {selectedStaff.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  Staff: {selectedStaff.map(id => staff.find(s => s.id === id)?.name).join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Group Assignment Interface */}
        {groupingType !== 'whole-class' && (
          <div style={{ display: 'flex', gap: '1.5rem', minHeight: '400px' }}>
            {/* Unassigned Students */}
            <div style={{ flex: '1' }}>
              <h6 style={{ 
                margin: '0 0 0.75rem 0', 
                color: '#495057', 
                fontSize: '14px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📝 Unassigned Students ({unassignedStudents.length})
              </h6>
              
              <div
                onDragOver={(e) => handleDragOver(e)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e)}
                style={{
                  minHeight: '200px',
                  padding: '1rem',
                  border: dragOverGroup === 'unassigned' 
                    ? '3px dashed #667eea' 
                    : '2px dashed #dee2e6',
                  borderRadius: '12px',
                  background: dragOverGroup === 'unassigned' 
                    ? 'rgba(102, 126, 234, 0.1)' 
                    : unassignedStudents.length === 0 
                      ? '#f8f9fa' 
                      : 'white',
                  transition: 'all 0.3s ease'
                }}
              >
                {unassignedStudents.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#6c757d',
                    fontSize: '14px',
                    padding: '2rem 1rem'
                  }}>
                    {dragOverGroup === 'unassigned' ? (
                      <div>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👆</div>
                        Drop student here to unassign
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                        All students assigned to groups
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {unassignedStudents.map(student => (
                      <StudentCard key={student.id} student={student} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Groups */}
            <div style={{ flex: '2' }}>
              <h6 style={{ 
                margin: '0 0 0.75rem 0', 
                color: '#495057', 
                fontSize: '14px', 
                fontWeight: '600'
              }}>
                🎯 Groups ({groups.length})
              </h6>
              
              {groups.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#6c757d',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  border: '2px dashed #dee2e6'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    No groups available.<br/>
                    Create groups in the Group Management section.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {groups.map(group => {
                    const groupStudents = getGroupStudents(group.id);
                    const groupStaff = getGroupStaff(group.id);
                    return (
                      <div
                        key={group.id}
                        onDragOver={(e) => handleDragOver(e, group.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, group.id)}
                        style={{
                          padding: '1rem',
                          borderRadius: '12px',
                          border: dragOverGroup === group.id 
                            ? `3px dashed ${group.color}` 
                            : `2px solid ${group.color}30`,
                          borderLeft: `6px solid ${group.color}`,
                          background: dragOverGroup === group.id 
                            ? `${group.color}15` 
                            : 'white',
                          transition: 'all 0.3s ease',
                          minHeight: '140px'
                        }}
                      >
                        {/* Group Header */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '0.75rem'
                        }}>
                          <div>
                            <div style={{ fontWeight: '700', color: '#2c3e50', fontSize: '15px' }}>
                              {group.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>
                              {groupStudents.length}/{group.maxSize} students • {groupStaff.length} staff • {group.groupType}
                            </div>
                          </div>
                          <div style={{
                            background: group.color,
                            color: 'white',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {groupStudents.length}
                          </div>
                        </div>
                        
                        {/* Staff Assignment for Group */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem'
                          }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#495057' }}>
                              👨‍🏫 Staff in this group:
                            </span>
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  assignStaffToGroup(e.target.value, group.id);
                                  e.target.value = '';
                                }
                              }}
                              style={{
                                fontSize: '11px',
                                padding: '2px 4px',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                background: 'white'
                              }}
                            >
                              <option value="">+ Add Staff</option>
                              {staff
                                .filter(s => selectedStaff.includes(s.id) && staffAssignments[s.id] !== group.id)
                                .map(s => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                          </div>
                          
                          {groupStaff.length === 0 ? (
                            <div style={{
                              fontSize: '11px',
                              color: '#6c757d',
                              fontStyle: 'italic',
                              textAlign: 'center',
                              padding: '0.25rem'
                            }}>
                              No staff assigned to this group
                            </div>
                          ) : (
                            <div>
                              {groupStaff.map(staffMember => (
                                <StaffCard 
                                  key={staffMember.id} 
                                  staffMember={staffMember} 
                                  groupColor={group.color}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Students in Group */}
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '0.5rem', display: 'block' }}>
                            👥 Students in this group:
                          </span>
                          
                          {groupStudents.length === 0 ? (
                            <div style={{
                              textAlign: 'center',
                              color: '#6c757d',
                              fontSize: '13px',
                              padding: '1rem',
                              fontStyle: 'italic',
                              border: `1px dashed ${group.color}50`,
                              borderRadius: '8px'
                            }}>
                              {dragOverGroup === group.id ? (
                                <span style={{ color: group.color, fontWeight: '600' }}>
                                  👆 Drop student here
                                </span>
                              ) : (
                                'Drag students here to assign'
                              )}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {groupStudents.map(student => (
                                <StudentCard 
                                  key={student.id} 
                                  student={student} 
                                  isInGroup 
                                  groupColor={group.color}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignment Summary */}
        {(Object.keys(studentAssignments).length > 0 || groupingType === 'whole-class') && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.1) 100%)',
            borderRadius: '12px',
            border: '2px solid rgba(40, 167, 69, 0.3)'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#155724', marginBottom: '0.5rem' }}>
              ✅ Assignment Summary
            </div>
            {groupingType === 'whole-class' ? (
              <div style={{ fontSize: '14px', color: '#155724' }}>
                🎯 All {students.length} students assigned to whole class activity
                {selectedStaff.length > 0 && (
                  <div>👨‍🏫 {selectedStaff.length} staff members assigned</div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: '#155724' }}>
                <div>👥 {Object.keys(studentAssignments).length} students assigned to groups • {unassignedStudents.length} unassigned</div>
                <div>👨‍🏫 {Object.keys(staffAssignments).length} staff members assigned to groups</div>
                <div>🎯 {groups.filter(g => getGroupStudents(g.id).length > 0).length} active groups</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '2rem' }}>
        <h5 style={{ marginBottom: '0.75rem', color: '#2c3e50' }}>📝 Additional Notes</h5>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any special instructions, accommodations, or notes for this activity..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '0.75rem',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          💾 Save Assignment
        </button>
      </div>
    </div>
  );
};

export default EnhancedGroupAssignment;
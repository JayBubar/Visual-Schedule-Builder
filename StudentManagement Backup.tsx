import React, { useState, useRef } from 'react';

// Types for our student and group system
interface Student {
  id: string;
  name: string;
  grade: string;
  photo: string | null;
  accommodations: string[];
}

interface StudentGroup {
  id: string;
  name: string;
  color: string;
  students: Student[];
  createdAt: Date;
}

// Global state (in a real app, this would be in a state management system)
let globalStudents: Student[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    grade: '3rd',
    photo: null,
    accommodations: ['Extra time', 'Visual supports']
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    grade: '3rd',
    photo: null,
    accommodations: ['Movement breaks', 'Sensory tools']
  },
  {
    id: '3',
    name: 'Sofia Garcia',
    grade: '2nd',
    photo: null,
    accommodations: ['Quiet space', 'Visual schedule']
  },
  {
    id: '4',
    name: 'Alex Chen',
    grade: '3rd',
    photo: null,
    accommodations: ['Technology supports', 'Clear instructions']
  }
];

let globalGroups: StudentGroup[] = [
  {
    id: 'group1',
    name: 'Reading Group A',
    color: '#4CAF50',
    students: [],
    createdAt: new Date()
  },
  {
    id: 'group2',
    name: 'Math Partners',
    color: '#2196F3',
    students: [],
    createdAt: new Date()
  }
];

// Group color options
const GROUP_COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336',
  '#00BCD4', '#795548', '#607D8B', '#E91E63', '#3F51B5'
];

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(globalStudents);
  const [groups, setGroups] = useState<StudentGroup[]>(globalGroups);
  const [activeTab, setActiveTab] = useState<'students' | 'groups'>('students');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [draggedStudent, setDraggedStudent] = useState<Student | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Student Management Functions
  const addStudent = () => {
    const newStudent: Student = {
      id: Date.now().toString(),
      name: 'New Student',
      grade: '3rd',
      photo: null,
      accommodations: []
    };
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    globalStudents = updatedStudents;
  };

  const removeStudent = (studentId: string) => {
    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);
    globalStudents = updatedStudents;
    
    // Remove from all groups
    const updatedGroups = groups.map(group => ({
      ...group,
      students: group.students.filter(s => s.id !== studentId)
    }));
    setGroups(updatedGroups);
    globalGroups = updatedGroups;
  };

  const updateStudent = (studentId: string, field: keyof Student, value: any) => {
    const updatedStudents = students.map(student =>
      student.id === studentId ? { ...student, [field]: value } : student
    );
    setStudents(updatedStudents);
    globalStudents = updatedStudents;
    
    // Update student in groups too
    const updatedGroups = groups.map(group => ({
      ...group,
      students: group.students.map(s => 
        s.id === studentId ? { ...s, [field]: value } : s
      )
    }));
    setGroups(updatedGroups);
    globalGroups = updatedGroups;
  };

  const handlePhotoUpload = (studentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        updateStudent(studentId, 'photo', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addAccommodation = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const newAccommodation = prompt('Enter new accommodation:');
      if (newAccommodation?.trim()) {
        updateStudent(studentId, 'accommodations', [...student.accommodations, newAccommodation.trim()]);
      }
    }
  };

  const removeAccommodation = (studentId: string, accommodation: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      updateStudent(studentId, 'accommodations', student.accommodations.filter(a => a !== accommodation));
    }
  };

  // Group Management Functions
  const createGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: StudentGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      color: GROUP_COLORS[groups.length % GROUP_COLORS.length],
      students: [],
      createdAt: new Date()
    };
    
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    globalGroups = updatedGroups;
    setNewGroupName('');
    setShowCreateGroup(false);
  };

  const removeGroup = (groupId: string) => {
    const updatedGroups = groups.filter(g => g.id !== groupId);
    setGroups(updatedGroups);
    globalGroups = updatedGroups;
  };

  const updateGroupName = (groupId: string, newName: string) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId ? { ...group, name: newName } : group
    );
    setGroups(updatedGroups);
    globalGroups = updatedGroups;
  };

  const addStudentToGroup = (groupId: string, student: Student) => {
    // Remove student from other groups first
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        // Add to this group if not already in it
        if (!group.students.find(s => s.id === student.id)) {
          return { ...group, students: [...group.students, student] };
        }
      } else {
        // Remove from other groups
        return { ...group, students: group.students.filter(s => s.id !== student.id) };
      }
      return group;
    });
    setGroups(updatedGroups);
    globalGroups = updatedGroups;
  };

  const removeStudentFromGroup = (groupId: string, studentId: string) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId 
        ? { ...group, students: group.students.filter(s => s.id !== studentId) }
        : group
    );
    setGroups(updatedGroups);
    globalGroups = updatedGroups;
  };

  // Drag and Drop Functions
  const handleDragStart = (student: Student) => {
    setDraggedStudent(student);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnGroup = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    if (draggedStudent) {
      addStudentToGroup(groupId, draggedStudent);
      setDraggedStudent(null);
    }
  };

  const handleDropOnUnassigned = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedStudent) {
      // Remove student from all groups
      const updatedGroups = groups.map(group => ({
        ...group,
        students: group.students.filter(s => s.id !== draggedStudent.id)
      }));
      setGroups(updatedGroups);
      globalGroups = updatedGroups;
      setDraggedStudent(null);
    }
  };

  // Get unassigned students
  const assignedStudentIds = new Set(groups.flatMap(group => group.students.map(s => s.id)));
  const unassignedStudents = students.filter(student => !assignedStudentIds.has(student.id));

  return (
    <div className="student-management">
      <div className="student-management-header">
        <h2>👥 Student Management</h2>
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            📋 Individual Students
          </button>
          <button 
            className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            👥 Groups & Teams
          </button>
        </div>
      </div>

      {activeTab === 'students' && (
        <div className="students-tab">
          <div className="section-header">
            <h3>Student Roster</h3>
            <button className="add-button" onClick={addStudent}>
              ➕ Add Student
            </button>
          </div>

          <div className="students-grid">
            {students.map(student => (
              <div key={student.id} className="student-card">
                <div className="student-photo-section">
                  <div 
                    className="photo-upload-area"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {student.photo ? (
                      <img src={student.photo} alt={student.name} className="student-photo" />
                    ) : (
                      <div className="photo-placeholder">
                        📷 Click to add photo
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handlePhotoUpload(student.id, e)}
                  />
                </div>

                <div className="student-info">
                  <input
                    type="text"
                    value={student.name}
                    onChange={(e) => updateStudent(student.id, 'name', e.target.value)}
                    className="student-name-input"
                  />
                  <input
                    type="text"
                    value={student.grade}
                    onChange={(e) => updateStudent(student.id, 'grade', e.target.value)}
                    className="student-grade-input"
                    placeholder="Grade"
                  />
                </div>

                <div className="accommodations-section">
                  <div className="accommodations-header">
                    <span>Accommodations:</span>
                    <button 
                      className="add-accommodation-btn"
                      onClick={() => addAccommodation(student.id)}
                    >
                      ➕
                    </button>
                  </div>
                  <div className="accommodations-list">
                    {student.accommodations.map((accommodation, index) => (
                      <span key={index} className="accommodation-tag">
                        {accommodation}
                        <button 
                          className="remove-accommodation"
                          onClick={() => removeAccommodation(student.id, accommodation)}
                        >
                          ❌
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  className="remove-student-btn"
                  onClick={() => removeStudent(student.id)}
                >
                  🗑️ Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="groups-tab">
          <div className="section-header">
            <h3>Student Groups & Teams</h3>
            <button 
              className="add-button" 
              onClick={() => setShowCreateGroup(true)}
            >
              ➕ Create Group
            </button>
          </div>

          {showCreateGroup && (
            <div className="create-group-form">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="group-name-input"
                onKeyPress={(e) => e.key === 'Enter' && createGroup()}
              />
              <button onClick={createGroup} className="create-group-btn">Create</button>
              <button onClick={() => setShowCreateGroup(false)} className="cancel-btn">Cancel</button>
            </div>
          )}

          <div className="groups-container">
            {/* Unassigned Students Pool */}
            <div 
              className="unassigned-students-pool"
              onDragOver={handleDragOver}
              onDrop={handleDropOnUnassigned}
            >
              <h4>📋 Unassigned Students</h4>
              <div className="students-pool">
                {unassignedStudents.map(student => (
                  <div
                    key={student.id}
                    className="pooled-student"
                    draggable
                    onDragStart={() => handleDragStart(student)}
                  >
                    {student.photo ? (
                      <img src={student.photo} alt={student.name} className="pooled-student-photo" />
                    ) : (
                      <div className="pooled-student-placeholder">👤</div>
                    )}
                    <span className="pooled-student-name">{student.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Groups */}
            <div className="groups-grid">
              {groups.map(group => (
                <div 
                  key={group.id} 
                  className="group-card"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnGroup(e, group.id)}
                  style={{ borderColor: group.color }}
                >
                  <div className="group-header" style={{ backgroundColor: group.color }}>
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => updateGroupName(group.id, e.target.value)}
                      className="group-name-input"
                    />
                    <button 
                      className="remove-group-btn"
                      onClick={() => removeGroup(group.id)}
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="group-students">
                    {group.students.map(student => (
                      <div key={student.id} className="group-student">
                        {student.photo ? (
                          <img src={student.photo} alt={student.name} className="group-student-photo" />
                        ) : (
                          <div className="group-student-placeholder">👤</div>
                        )}
                        <span className="group-student-name">{student.name}</span>
                        <button 
                          className="remove-from-group-btn"
                          onClick={() => removeStudentFromGroup(group.id, student.id)}
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                    {group.students.length === 0 && (
                      <div className="empty-group-message">
                        Drag students here to create a group
                      </div>
                    )}
                  </div>

                  <div className="group-stats">
                    👥 {group.students.length} student{group.students.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export both the component and the global data for use in other components
export default StudentManagement;
export { globalStudents, globalGroups, type Student, type StudentGroup };
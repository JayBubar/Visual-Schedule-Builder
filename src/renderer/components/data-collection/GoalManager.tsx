import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Target, BookOpen, Heart, Users, Activity, Calendar, AlertCircle, CheckCircle, Star, Clock, TrendingUp } from 'lucide-react';
import UnifiedDataService, { UnifiedStudent, IEPGoal } from '../../services/unifiedDataService';

interface GoalManagerProps {
  preSelectedStudentId?: string;
  onGoalSaved?: () => void;
}

const GoalManager: React.FC<GoalManagerProps> = ({ preSelectedStudentId, onGoalSaved }) => {
  const [goals, setGoals] = useState<IEPGoal[]>([]);
  const [students, setStudents] = useState<UnifiedStudent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<IEPGoal | null>(null);
  const [selectedStudent, setSelectedStudent] = useState(preSelectedStudentId || 'all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Goal form state
  const [goalForm, setGoalForm] = useState({
    studentId: '',
    domain: 'academic' as 'academic' | 'behavioral' | 'social-emotional' | 'physical',
    title: '',
    description: '',
    shortTermObjective: '',
    measurementType: 'percentage' as 'percentage' | 'frequency' | 'duration' | 'rating' | 'yes-no' | 'independence',
    criteria: '',
    target: 80,
    priority: 'medium' as 'high' | 'medium' | 'low',
    isActive: true
  });

  // Load data on component mount
  useEffect(() => {
    loadGoalsData();
    loadStudentsData();
  }, []);

  // Set pre-selected student when prop changes
  useEffect(() => {
    if (preSelectedStudentId) {
      setSelectedStudent(preSelectedStudentId);
      // Also pre-fill the form with the selected student
      setGoalForm(prev => ({
        ...prev,
        studentId: preSelectedStudentId
      }));
    }
  }, [preSelectedStudentId]);

  const loadGoalsData = () => {
    try {
      // Get all students and extract their goals
      const allStudents = UnifiedDataService.getAllStudents();
      const allGoals: IEPGoal[] = [];
      
      allStudents.forEach(student => {
        if (student.iepData && student.iepData.goals) {
          allGoals.push(...student.iepData.goals);
        }
      });
      
      console.log('📚 Loaded goals from UnifiedDataService:', allGoals.length);
      setGoals(allGoals);
    } catch (error) {
      console.error('Error loading goals from UnifiedDataService:', error);
      setGoals([]);
    }
  };

  const loadStudentsData = () => {
    try {
      const unifiedStudents = UnifiedDataService.getAllStudents();
      console.log('👥 Loaded students from UnifiedDataService:', unifiedStudents.length);
      setStudents(unifiedStudents);
    } catch (error) {
      console.error('Error loading students from UnifiedDataService:', error);
      setStudents([]);
    }
  };

  const domains = [
    { id: 'academic', name: 'Academic', icon: BookOpen, color: '#3B82F6', bgColor: '#EFF6FF' },
    { id: 'behavioral', name: 'Behavioral', icon: Heart, color: '#10B981', bgColor: '#ECFDF5' },
    { id: 'social-emotional', name: 'Social-Emotional', icon: Users, color: '#8B5CF6', bgColor: '#F5F3FF' },
    { id: 'physical', name: 'Physical/Motor', icon: Activity, color: '#F59E0B', bgColor: '#FFFBEB' }
  ];

  const measurementTypes = [
    { id: 'percentage', name: 'Percentage (%)', description: 'Accuracy-based measurement' },
    { id: 'frequency', name: 'Frequency Count', description: 'Number of occurrences' },
    { id: 'duration', name: 'Duration (minutes)', description: 'Time-based measurement' },
    { id: 'rating', name: 'Rating Scale (1-5)', description: '5-point rating scale' },
    { id: 'yes-no', name: 'Yes/No', description: 'Binary achievement' },
    { id: 'independence', name: 'Independence Level', description: '1-5 support scale' }
  ];

  const priorities = [
    { id: 'high', name: 'High Priority', color: '#EF4444', bgColor: '#FEF2F2' },
    { id: 'medium', name: 'Medium Priority', color: '#F59E0B', bgColor: '#FFFBEB' },
    { id: 'low', name: 'Low Priority', color: '#10B981', bgColor: '#ECFDF5' }
  ];

  const handleSaveGoal = () => {
    if (!goalForm.studentId || !goalForm.title || !goalForm.criteria) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      console.log('🔍 DEBUGGING GOAL SAVE - START');
      console.log('SAVING GOAL:', goalForm);
      console.log('SELECTED STUDENT ID:', goalForm.studentId);
      
      // Get unified data before save to debug
      const unifiedDataBefore = UnifiedDataService.getUnifiedData();
      console.log('UNIFIED DATA BEFORE SAVE:', unifiedDataBefore);
      console.log('STUDENTS BEFORE SAVE:', unifiedDataBefore?.students);
      
      const targetStudent = unifiedDataBefore?.students?.find(s => s.id === goalForm.studentId);
      console.log('TARGET STUDENT BEFORE SAVE:', targetStudent);
      console.log('TARGET STUDENT IEP GOALS BEFORE:', targetStudent?.iepData?.goals);

      if (editingGoal) {
        // Update existing goal via UnifiedDataService
        console.log('📝 Updating existing goal:', editingGoal.id);
        UnifiedDataService.updateGoal(editingGoal.id, {
          ...goalForm,
          lastDataPoint: editingGoal.lastDataPoint,
          dataPoints: editingGoal.dataPoints,
          currentProgress: editingGoal.currentProgress
        });
      } else {
        // Add new goal via UnifiedDataService
        console.log('➕ Adding new goal for student:', goalForm.studentId);
        const goalData = {
          ...goalForm,
          measurableObjective: goalForm.shortTermObjective,
          targetCriteria: goalForm.criteria,
          dataCollectionSchedule: 'daily',
          dateCreated: new Date().toISOString().split('T')[0],
          createdDate: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString(),
          dataPoints: 0,
          currentProgress: 0
        };
        console.log('GOAL DATA TO SAVE:', goalData);
        
        const savedGoal = UnifiedDataService.addGoalToStudent(goalForm.studentId, goalData);
        console.log('SAVED GOAL RETURNED:', savedGoal);
      }

      // Check unified data after save
      const unifiedDataAfter = UnifiedDataService.getUnifiedData();
      console.log('UNIFIED DATA AFTER SAVE:', unifiedDataAfter);
      console.log('STUDENTS AFTER SAVE:', unifiedDataAfter?.students);
      
      const targetStudentAfter = unifiedDataAfter?.students?.find(s => s.id === goalForm.studentId);
      console.log('TARGET STUDENT AFTER SAVE:', targetStudentAfter);
      console.log('TARGET STUDENT IEP GOALS AFTER:', targetStudentAfter?.iepData?.goals);
      console.log('GOAL COUNT AFTER SAVE:', targetStudentAfter?.iepData?.goals?.length);

      // Check localStorage directly
      const localStorageData = localStorage.getItem('visual-schedule-builder-unified-data');
      console.log('LOCALSTORAGE RAW DATA:', localStorageData);
      if (localStorageData) {
        const parsedData = JSON.parse(localStorageData);
        console.log('LOCALSTORAGE PARSED DATA:', parsedData);
        const lsStudent = parsedData.students?.find((s: any) => s.id === goalForm.studentId);
        console.log('LOCALSTORAGE STUDENT:', lsStudent);
        console.log('LOCALSTORAGE STUDENT GOALS:', lsStudent?.iepData?.goals);
      }

      // Reload goals data to reflect changes
      loadGoalsData();
      
      // Call the callback to refresh parent component data
      if (onGoalSaved) {
        console.log('🔄 Calling onGoalSaved callback');
        onGoalSaved();
      }
      
      // Reset form and close modal
      resetForm();
      setIsModalOpen(false);
      setEditingGoal(null);
      
      console.log('✅ Goal saved successfully via UnifiedDataService');
      console.log('🔍 DEBUGGING GOAL SAVE - END');
    } catch (error) {
      console.error('❌ Error saving goal:', error);
      alert('Error saving goal. Please try again.');
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalForm({
      studentId: goal.studentId,
      domain: goal.domain,
      title: goal.title,
      description: goal.description,
      shortTermObjective: goal.shortTermObjective,
      measurementType: goal.measurementType,
      criteria: goal.criteria,
      target: goal.target,
      priority: goal.priority,
      isActive: goal.isActive
    });
    setIsModalOpen(true);
  };

  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      try {
        // Find the goal to get its student ID
        const goalToDelete = goals.find(g => g.id === goalId);
        if (goalToDelete) {
          // Get the student and remove the goal from their iepData
          const student = UnifiedDataService.getStudent(goalToDelete.studentId);
          if (student && student.iepData && student.iepData.goals) {
            const updatedGoals = student.iepData.goals.filter(g => g.id !== goalId);
            const updatedStudent = {
              ...student,
              iepData: {
                ...student.iepData,
                goals: updatedGoals
              }
            };
            
            // Update the student via UnifiedDataService
            UnifiedDataService.updateStudent(student.id, updatedStudent);
            
            // Reload goals data to reflect changes
            loadGoalsData();
            
            console.log('✅ Goal deleted successfully via UnifiedDataService');
          }
        }
      } catch (error) {
        console.error('❌ Error deleting goal:', error);
        alert('Error deleting goal. Please try again.');
      }
    }
  };

  const handleToggleActive = (goalId) => {
    try {
      // Find the goal to get its current status and student ID
      const goalToToggle = goals.find(g => g.id === goalId);
      if (goalToToggle) {
        // Update the goal via UnifiedDataService
        UnifiedDataService.updateGoal(goalId, {
          isActive: !goalToToggle.isActive
        });
        
        // Reload goals data to reflect changes
        loadGoalsData();
        
        console.log('✅ Goal status toggled successfully via UnifiedDataService');
      }
    } catch (error) {
      console.error('❌ Error toggling goal status:', error);
      alert('Error updating goal status. Please try again.');
    }
  };

  const resetForm = () => {
    setGoalForm({
      studentId: '',
      domain: 'academic',
      title: '',
      description: '',
      shortTermObjective: '',
      measurementType: 'percentage',
      criteria: '',
      target: 80,
      priority: 'medium',
      isActive: true
    });
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getDomainInfo = (domainId) => {
    return domains.find(d => d.id === domainId) || domains[0];
  };

  const getPriorityInfo = (priorityId) => {
    return priorities.find(p => p.id === priorityId) || priorities[1];
  };

  // Filter goals based on selected filters and search
  const filteredGoals = goals.filter(goal => {
    const matchesStudent = selectedStudent === 'all' || goal.studentId === selectedStudent;
    const matchesDomain = selectedDomain === 'all' || goal.domain === selectedDomain;
    const matchesSearch = searchTerm === '' || 
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getStudentName(goal.studentId).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStudent && matchesDomain && matchesSearch;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <Target className="w-10 h-10" />
              IEP Goal Management
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.8)',
              margin: '0.5rem 0 0 0'
            }}>
              Create, edit, and manage student IEP goals and objectives
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            style={{
              background: 'rgba(255,255,255,0.9)',
              color: '#667eea',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }}
          >
            <Plus className="w-5 h-5" />
            Add New Goal
          </button>
        </div>

        {/* Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
              {goals.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Total Goals
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
              {goals.filter(g => g.isActive).length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Active Goals
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
              {students.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Students
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
              {goals.filter(g => g.priority === 'high').length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              High Priority
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.9)',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Student Filter */}
          <div>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.9)',
                fontSize: '1rem'
              }}
            >
              <option value="all">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {/* Domain Filter */}
          <div>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.9)',
                fontSize: '1rem'
              }}
            >
              <option value="all">All Domains</option>
              {domains.map(domain => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredGoals.map(goal => {
          const domainInfo = getDomainInfo(goal.domain);
          const priorityInfo = getPriorityInfo(goal.priority);
          const DomainIcon = domainInfo.icon;

          return (
            <div
              key={goal.id}
              style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
                opacity: goal.isActive ? 1 : 0.7
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    background: domainInfo.bgColor,
                    color: domainInfo.color,
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <DomainIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span style={{
                      background: domainInfo.bgColor,
                      color: domainInfo.color,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {domainInfo.name}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleToggleActive(goal.id)}
                    style={{
                      background: goal.isActive ? '#10B981' : '#6B7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {goal.isActive ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEditGoal(goal)}
                    style={{
                      background: '#F59E0B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    style={{
                      background: '#EF4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Student Name */}
              <div style={{
                fontSize: '0.9rem',
                color: '#6B7280',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Student: {getStudentName(goal.studentId)}
              </div>

              {/* Goal Title */}
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: '#1F2937',
                margin: '0 0 0.5rem 0'
              }}>
                {goal.title}
              </h3>

              {/* Description */}
              <p style={{
                color: '#6B7280',
                fontSize: '1rem',
                lineHeight: '1.5',
                margin: '0 0 1rem 0'
              }}>
                {goal.description}
              </p>

              {/* Criteria */}
              <div style={{
                background: '#F3F4F6',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                  Criteria:
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                  {goal.criteria}
                </div>
              </div>

              {/* Goal Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>
                    Measurement
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1F2937' }}>
                    {measurementTypes.find(m => m.id === goal.measurementType)?.name || goal.measurementType}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>
                    Target
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1F2937' }}>
                    {goal.target}{goal.measurementType === 'percentage' ? '%' : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>
                    Priority
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: priorityInfo.color,
                    background: priorityInfo.bgColor,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {priorityInfo.name.split(' ')[0]}
                  </div>
                </div>
              </div>

              {/* Progress */}
              {goal.dataPoints > 0 && (
                <div style={{
                  background: '#F3F4F6',
                  padding: '0.75rem',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>
                      Current Progress
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1F2937' }}>
                      {goal.currentProgress}% ({goal.dataPoints} data points)
                    </span>
                  </div>
                  <div style={{
                    background: '#E5E7EB',
                    borderRadius: '4px',
                    height: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: goal.currentProgress >= goal.target ? '#10B981' : '#3B82F6',
                      height: '100%',
                      width: `${Math.min((goal.currentProgress / goal.target) * 100, 100)}%`,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div style={{
                fontSize: '0.8rem',
                color: '#9CA3AF',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <Calendar className="w-3 h-3" />
                Created: {new Date(goal.dateCreated).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Goals Message */}
      {filteredGoals.length === 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Target className="w-16 h-16 text-white mx-auto mb-4" />
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            No goals found
          </h3>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1rem'
          }}>
            {goals.length === 0 
              ? 'Create your first IEP goal to get started.'
              : 'Try adjusting your filters or search terms.'
            }
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#1F2937',
                margin: 0
              }}>
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingGoal(null);
                  resetForm();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '8px'
                }}
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Student Selection */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Student *
                </label>
                <select
                  value={goalForm.studentId}
                  onChange={(e) => setGoalForm({ ...goalForm, studentId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Domain Selection */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Domain *
                </label>
              <select
                value={goalForm.domain}
                onChange={(e) => setGoalForm({ ...goalForm, domain: e.target.value as 'academic' | 'behavioral' | 'social-emotional' | 'physical' })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '1rem'
                }}
              >
                  {domains.map(domain => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Goal Title */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  placeholder="e.g., Reading Comprehension"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Description
                </label>
                <textarea
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  placeholder="Brief description of the goal area"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Short Term Objective */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Short Term Objective
                </label>
                <textarea
                  value={goalForm.shortTermObjective}
                  onChange={(e) => setGoalForm({ ...goalForm, shortTermObjective: e.target.value })}
                  placeholder="Specific, measurable objective that supports this goal"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Measurement Type and Target */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Measurement Type *
                  </label>
                  <select
                    value={goalForm.measurementType}
                    onChange={(e) => setGoalForm({ ...goalForm, measurementType: e.target.value as 'percentage' | 'frequency' | 'duration' | 'rating' | 'yes-no' | 'independence' })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '1rem'
                    }}
                  >
                    {measurementTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Target *
                  </label>
                  <input
                    type="number"
                    value={goalForm.target}
                    onChange={(e) => setGoalForm({ ...goalForm, target: parseInt(e.target.value) || 0 })}
                    min="0"
                    max={goalForm.measurementType === 'percentage' ? 100 : 999}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Criteria */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Criteria for Mastery *
                </label>
                <textarea
                  value={goalForm.criteria}
                  onChange={(e) => setGoalForm({ ...goalForm, criteria: e.target.value })}
                  placeholder="e.g., 80% accuracy over 5 consecutive trials"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              {/* Priority and Active Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Priority Level
                  </label>
                  <select
                    value={goalForm.priority}
                    onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '1rem'
                    }}
                  >
                    {priorities.map(priority => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Status
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB'
                  }}>
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={goalForm.isActive}
                      onChange={(e) => setGoalForm({ ...goalForm, isActive: e.target.checked })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <label htmlFor="isActive" style={{ fontSize: '1rem', color: '#374151' }}>
                      Active Goal
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #E5E7EB'
              }}>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingGoal(null);
                    resetForm();
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    background: 'white',
                    color: '#374151',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGoal}
                  style={{
                    flex: 2,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Save className="w-5 h-5" />
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalManager;

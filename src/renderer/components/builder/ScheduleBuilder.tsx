import React, { useState, useEffect } from 'react';
import GroupCreator from './GroupCreator';
import { Student as ProjectStudent, Staff, StudentGroup, Activity, ScheduleActivity, ActivityAssignment, ScheduleVariation, SavedActivity, StaffMember as ProjectStaffMember, ScheduleCategory } from '../../types';
import UnifiedDataService, { UnifiedStudent, UnifiedStaff } from '../../services/unifiedDataService';

// Type aliases to avoid conflicts with enhanced components
type BuilderStudent = ProjectStudent;
type BuilderStaffMember = ProjectStaffMember;
type EnhancedActivity = ScheduleActivity;

interface ScheduleBuilderProps {
  isActive: boolean;
  onScheduleUpdate?: (activities: EnhancedActivity[], startTime: string) => void; // 🎯 NEW: Callback for updates
}

interface AssignmentPanelProps {
  activity: EnhancedActivity;
  staff: Staff[];
  students: BuilderStudent[];
  groups: StudentGroup[];
  onSave: (assignment: ActivityAssignment) => void;
  onCancel: () => void;
}

// 🎯 NEW: Enhanced Save Modal with Animation
// 🎯 ENHANCED SAVE MODAL COMPONENT - Replace in ScheduleBuilder.tsx

// 🎯 NEW: Enhanced Save Modal with Animation
const SaveScheduleModal: React.FC<{
  isOpen: boolean;
  onSave: (name: string, description?: string) => void;
  onCancel: () => void;
  activities: EnhancedActivity[];
  startTime: string;
}> = ({ isOpen, onSave, onCancel, activities, startTime }) => {
  const [scheduleName, setScheduleName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScheduleName('');
      setDescription('');
      setIsSaving(false);
      setSaveSuccess(false);
      setShowConfetti(false);
      setError('');
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!scheduleName.trim()) {
      setError('Please enter a schedule name');
      return;
    }

    if (activities.length === 0) {
      setError('Cannot save an empty schedule');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Simulate save delay for animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the actual save function
      onSave(scheduleName.trim(), description.trim() || undefined);
      
      // Show success state with confetti
      setSaveSuccess(true);
      setShowConfetti(true);
      
      // Auto-close after success animation
      setTimeout(() => {
        onCancel();
      }, 3000);
      
    } catch (err) {
      setError('Failed to save schedule. Please try again.');
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const totalDuration = activities.reduce((total, activity) => total + activity.duration, 0);
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;

  const calculateEndTime = (start: string, minutes: number): string => {
    const [hours, mins] = start.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay save-modal-overlay">
      <div className={`modal-content save-modal ${saveSuccess ? 'success' : ''} ${isSaving ? 'saving' : ''}`}>
        
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="confetti-container">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)]
                }}
              />
            ))}
          </div>
        )}

        {/* Success State */}
        {saveSuccess && (
          <div className="save-success-state">
            <div className="success-icon-container">
              <div className="success-checkmark">✓</div>
              <div className="success-circle"></div>
            </div>
            <h3>Schedule Saved Successfully!</h3>
            <p>"{scheduleName}" has been saved to your library</p>
            <div className="success-stats">
              <div className="stat-item">
                <span className="stat-number">{activities.length}</span>
                <span className="stat-label">Activities</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{hours}h {minutes}m</span>
                <span className="stat-label">Duration</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{startTime}</span>
                <span className="stat-label">Start Time</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Save Form */}
        {!saveSuccess && (
          <>
            <div className="modal-header">
              <h3>💾 Save Current Schedule</h3>
              <button 
                className="close-button" 
                onClick={onCancel}
                disabled={isSaving}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Schedule Preview */}
              <div className="schedule-preview">
                <h4>📋 Schedule Summary</h4>
                <div className="schedule-stats">
                  <div className="stat">
                    <span className="stat-value">{activities.length}</span>
                    <span className="stat-label">Activities</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{hours}h {minutes}m</span>
                    <span className="stat-label">Total Time</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{startTime}</span>
                    <span className="stat-label">Start Time</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{calculateEndTime(startTime, totalDuration)}</span>
                    <span className="stat-label">End Time</span>
                  </div>
                </div>
                <div className="activities-preview">
                  {activities.slice(0, 4).map((activity, index) => (
                    <span key={index} className="activity-preview">
                      {activity.icon} {activity.name}
                    </span>
                  ))}
                  {activities.length > 4 && (
                    <span className="more-activities">
                      +{activities.length - 4} more activities
                    </span>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="form-group">
                <label htmlFor="schedule-name">
                  Schedule Name *
                </label>
                <input
                  id="schedule-name"
                  type="text"
                  value={scheduleName}
                  onChange={(e) => {
                    setScheduleName(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g., Monday Regular Schedule"
                  disabled={isSaving}
                  className={error ? 'error' : ''}
                  autoFocus
                />
                {error && <div className="error-message">{error}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="schedule-description">
                  Description (optional)
                </label>
                <textarea
                  id="schedule-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of when to use this schedule..."
                  disabled={isSaving}
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className={`save-btn ${isSaving ? 'saving' : ''}`}
                onClick={handleSave}
                disabled={isSaving || !scheduleName.trim()}
              >
                {isSaving ? (
                  <div className="saving-content">
                    <div className="saving-spinner">
                      <div className="spinner-circle"></div>
                    </div>
                    <span className="saving-text">Saving Schedule...</span>
                    <div className="saving-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </div>
                  </div>
                ) : (
                  <>
                    💾 Save Schedule
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          alignItems: center;
          justifyContent: center;
          zIndex: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .save-modal-overlay {
          backdrop-filter: blur(8px);
          background: rgba(0, 0, 0, 0.7);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes modalSlideIn {
          from {
            transform: scale(0.8) translateY(60px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        .save-modal {
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          transform: scale(1);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .save-modal.saving {
          transform: scale(1.02);
          box-shadow: 0 25px 80px rgba(102, 126, 234, 0.4);
        }

        .save-modal.success {
          transform: scale(1.05);
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          border: 3px solid #28a745;
          box-shadow: 0 30px 100px rgba(40, 167, 69, 0.5);
        }

        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          opacity: 0.8;
          animation: confettiFall 4s ease-in infinite;
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 0 2rem;
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6c757d;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .close-button:hover:not(:disabled) {
          background: #f8f9fa;
          color: #dc3545;
          transform: scale(1.1);
        }

        .modal-body {
          padding: 0 2rem;
        }

        .schedule-preview {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border-left: 5px solid #667eea;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .schedule-preview h4 {
          margin: 0 0 1rem 0;
          color: #495057;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .schedule-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat {
          text-align: center;
          background: white;
          padding: 0.75rem;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .stat:hover {
          transform: translateY(-2px);
        }

        .stat-value {
          display: block;
          font-size: 1.3rem;
          font-weight: 700;
          color: #667eea;
        }

        .stat-label {
          display: block;
          font-size: 0.8rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }

        .activities-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .activity-preview {
          background: white;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #495057;
          border: 1px solid #dee2e6;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .more-activities {
          background: #667eea;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input.error {
          border-color: #dc3545;
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .error-message {
          color: #dc3545;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          font-weight: 500;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 0 2rem 2rem 2rem;
          margin-top: 2rem;
        }

        .cancel-btn {
          padding: 0.75rem 1.5rem;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #5a6268;
          transform: translateY(-1px);
        }

        .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .save-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-width: 160px;
          min-height: 44px;
        }

        .save-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #5a67d8 0%, #667eea 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .save-btn.saving {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: not-allowed;
          animation: savingPulse 2s infinite;
        }

        @keyframes savingPulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3); 
          }
          50% { 
            transform: scale(1.02); 
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5); 
          }
        }

        .saving-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .saving-spinner {
          width: 16px;
          height: 16px;
          position: relative;
        }

        .spinner-circle {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .saving-text {
          font-size: 14px;
        }

        .saving-dots {
          display: flex;
          gap: 1px;
        }

        .saving-dots span {
          animation: dots 1.5s infinite;
          opacity: 0;
        }

        .saving-dots span:nth-child(1) { animation-delay: 0s; }
        .saving-dots span:nth-child(2) { animation-delay: 0.5s; }
        .saving-dots span:nth-child(3) { animation-delay: 1s; }

        @keyframes dots {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }

        /* Success State Styles */
        .save-success-state {
          text-align: center;
          padding: 3rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .success-icon-container {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem auto;
        }

        .success-checkmark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 3rem;
          color: #28a745;
          z-index: 2;
          animation: checkmarkBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .success-circle {
          position: absolute;
          top: 0;
          left: 0;
          width: 80px;
          height: 80px;
          border: 4px solid #28a745;
          border-radius: 50%;
          animation: successCircle 0.6s ease-out;
        }

        @keyframes checkmarkBounce {
          0% { 
            transform: translate(-50%, -50%) scale(0) rotate(45deg); 
            opacity: 0; 
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2) rotate(0deg); 
            opacity: 1; 
          }
          100% { 
            transform: translate(-50%, -50%) scale(1) rotate(0deg); 
            opacity: 1; 
          }
        }

        @keyframes successCircle {
          0% { 
            transform: scale(0); 
            opacity: 0; 
          }
          100% { 
            transform: scale(1); 
            opacity: 1; 
          }
        }

        .save-success-state h3 {
          color: #28a745;
          margin: 0 0 1rem 0;
          font-size: 2rem;
          font-weight: 700;
          animation: slideUp 0.6s ease 0.4s both;
        }

        .save-success-state p {
          color: #6c757d;
          margin: 0 0 2rem 0;
          font-size: 1.1rem;
          animation: slideUp 0.6s ease 0.6s both;
        }

        @keyframes slideUp {
          from { 
            transform: translateY(30px); 
            opacity: 0; 
          }
          to { 
            transform: translateY(0); 
            opacity: 1; 
          }
        }

        .success-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 1.5rem;
          animation: slideUp 0.6s ease 0.8s both;
        }

        .stat-item {
          text-align: center;
          background: rgba(255, 255, 255, 0.8);
          padding: 1rem;
          border-radius: 12px;
          min-width: 80px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
          display: block;
          font-size: 1.2rem;
          font-weight: 700;
          color: #28a745;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          display: block;
          font-size: 0.8rem;
          color: #6c757d;
          font-weight: 600;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .save-modal {
            width: 95%;
            margin: 1rem;
            max-width: none;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .schedule-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .success-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .modal-footer {
            flex-direction: column;
          }

          .cancel-btn,
          .save-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .save-success-state {
            padding: 2rem 1rem;
          }

          .save-success-state h3 {
            font-size: 1.5rem;
          }

          .success-icon-container {
            width: 60px;
            height: 60px;
          }

          .success-circle {
            width: 60px;
            height: 60px;
          }

          .success-checkmark {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({ isActive, onScheduleUpdate }) => {
  // State management
  const [schedule, setSchedule] = useState<EnhancedActivity[]>([]);
  const [startTime, setStartTime] = useState('08:00');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [students, setStudents] = useState<BuilderStudent[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [availableActivities, setAvailableActivities] = useState<(Omit<EnhancedActivity, 'assignment'> & { 
    addedFromLibrary?: boolean;
    originalId?: string;
    tags?: string[];
    materials?: string[];
    createdAt?: string;
  })[]>([]);

  // Tab interface state
  const [activeTab, setActiveTab] = useState<'activities' | 'saved' | 'builder'>('activities');
  
  // Saved schedules state
  const [savedSchedules, setSavedSchedules] = useState<ScheduleVariation[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [addingActivityId, setAddingActivityId] = useState<string | null>(null);
  
  // Edit management state variables
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    duration: 30,
    description: '',
    category: 'academic' as ScheduleCategory
  });
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // 🎯 CRITICAL: Notify parent of schedule changes
  useEffect(() => {
    if (onScheduleUpdate) {
      onScheduleUpdate(schedule, startTime);
    }
  }, [schedule, startTime, onScheduleUpdate]);

  // Helper functions for edit operations
  const startEditActivity = (activityId: string) => {
    const activity = schedule.find(a => a.id === activityId);
    if (activity) {
      setEditingActivityId(activityId);
      setEditForm({
        name: activity.name,
        duration: activity.duration,
        description: activity.description || '',
        category: activity.category
      });
    }
  };

  const cancelEdit = () => {
    setEditingActivityId(null);
    setEditForm({
      name: '',
      duration: 30,
      description: '',
      category: 'academic' as ScheduleCategory
    });
  };

  const saveActivityEdit = () => {
    if (!editingActivityId) return;
    
    setSchedule(prev => prev.map(activity => 
      activity.id === editingActivityId 
        ? { ...activity, ...editForm }
        : activity
    ));
    
    cancelEdit();
  };

  const toggleActivitySelection = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const startBulkEdit = () => {
    setBulkEditMode(true);
    setSelectedActivities([]);
  };

  const saveBulkEdit = (updates: Partial<EnhancedActivity>) => {
    setSchedule(prev => prev.map(activity => 
      selectedActivities.includes(activity.id)
        ? { ...activity, ...updates }
        : activity
    ));
    
    setBulkEditMode(false);
    setSelectedActivities([]);
  };

  // Load available activities from localStorage
  useEffect(() => {
    const storedActivities = localStorage.getItem('available_activities');
    if (storedActivities) {
      try {
        setAvailableActivities(JSON.parse(storedActivities));
      } catch (error) {
        console.error('Error loading available activities:', error);
      }
    }
  }, []);

  // Load saved schedules from localStorage
  useEffect(() => {
    const storedSchedules = localStorage.getItem('saved_schedules');
    if (storedSchedules) {
      try {
        setSavedSchedules(JSON.parse(storedSchedules));
      } catch (error) {
        console.error('Error loading saved schedules:', error);
      }
    }
  }, []);

  // Event listeners for Activity Library integration
  useEffect(() => {
    console.log('🔧 Setting up Activity Library event listeners...');
    
    const handleActivityAdded = (event: CustomEvent) => {
      const { activity, source, timestamp } = event.detail;
      const timeString = new Date(timestamp).toLocaleTimeString();
      
      console.group(`📝 Activity Added Event [${timeString}]`);
      console.log(`Source: ${source || 'unknown'}`);
      console.log(`Activity:`, {
        id: activity.id,
        originalId: activity.originalId,
        name: activity.name,
        duration: activity.duration,
        category: activity.category,
        isCustom: activity.isCustom,
        addedFromLibrary: activity.addedFromLibrary
      });
      
      // Update available activities list
      setAvailableActivities(prev => {
        console.log(`Current available activities count: ${prev.length}`);
        
        // Check for duplicates by ID (including unique instance IDs)
        const exists = prev.find(act => act.id === activity.id);
        if (!exists) {
          const formattedActivity = {
            id: activity.id,
            originalId: activity.originalId || activity.id,
            name: activity.name,
            icon: activity.icon || activity.emoji || '📝',
            duration: activity.duration || activity.defaultDuration || 30,
            category: activity.category,
            description: activity.description || activity.instructions || '',
            isCustom: activity.isCustom || false,
            tags: activity.tags || [],
            materials: activity.materials || [],
            addedFromLibrary: activity.addedFromLibrary || false,
            createdAt: activity.createdAt || new Date().toISOString()
          };
          
          const newActivities = [...prev, formattedActivity];
          
          // Persist to localStorage
          try {
            localStorage.setItem('available_activities', JSON.stringify(newActivities));
            console.log(`✅ Successfully saved to localStorage`);
          } catch (error) {
            console.error(`❌ Failed to save to localStorage:`, error);
          }
          
          console.log(`✅ Added activity: "${activity.name}" (ID: ${activity.id})`);
          console.log(`📊 New total activities: ${newActivities.length}`);
          console.groupEnd();
          return newActivities;
        } else {
          console.warn(`⚠️ Activity with ID ${activity.id} already exists, skipping duplicate`);
          console.groupEnd();
        }
        return prev;
      });
    };

    const handleActivitiesUpdated = (event: CustomEvent) => {
      const { activities, source, customCount, totalCount, timestamp } = event.detail;
      const timeString = new Date(timestamp).toLocaleTimeString();
      
      console.group(`🔄 Activities Updated Event [${timeString}]`);
      console.log(`Source: ${source || 'unknown'}`);
      console.log(`Statistics:`, {
        totalCount: totalCount || activities.length,
        customCount: customCount || 0,
        baseCount: (totalCount || activities.length) - (customCount || 0)
      });
      
      // Convert library activities to schedule builder format
      const formattedActivities = activities.map((activity: any, index: number) => {
        console.log(`📝 Processing activity ${index + 1}/${activities.length}: ${activity.name}`);
        return {
          id: activity.id,
          originalId: activity.originalId || activity.id,
          name: activity.name,
          icon: activity.icon || activity.emoji || '📝',
          duration: activity.defaultDuration || activity.duration || 30,
          category: activity.category,
          description: activity.description || '',
          isCustom: activity.isCustom || false,
          tags: activity.tags || [],
          materials: activity.materials || [],
          createdAt: activity.createdAt || new Date().toISOString()
        };
      });
      
      try {
        setAvailableActivities(formattedActivities);
        localStorage.setItem('available_activities', JSON.stringify(formattedActivities));
        console.log(`✅ Successfully updated ${formattedActivities.length} activities`);
      } catch (error) {
        console.error(`❌ Failed to update activities:`, error);
      }
      
      console.groupEnd();
    };

    // Add event listeners
    window.addEventListener('activityAdded', handleActivityAdded as EventListener);
    window.addEventListener('activitiesUpdated', handleActivitiesUpdated as EventListener);
    
    console.log('✅ Activity Library event listeners registered successfully');
    console.log('📡 Listening for events: activityAdded, activitiesUpdated');

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up Activity Library event listeners...');
      window.removeEventListener('activityAdded', handleActivityAdded as EventListener);
      window.removeEventListener('activitiesUpdated', handleActivitiesUpdated as EventListener);
      console.log('✅ Event listeners cleaned up successfully');
    };
  }, []);

  // COMMENTED OUT: Mock data was overwriting real data from localStorage
  // useEffect(() => {
  //   // Sample staff data
  //   setStaff([
  //     {
  //       id: 'staff1',
  //       name: 'Ms. Johnson',
  //       role: 'Lead Teacher',
  //       email: 'johnson@school.edu',
  //       photo: undefined,
  //       isMainTeacher: true,
  //       status: 'active'
  //     },
  //     {
  //       id: 'staff2',
  //       name: 'Mr. Davis',
  //       role: 'Aide',
  //       email: 'davis@school.edu',
  //       photo: undefined,
  //       isMainTeacher: false,
  //       status: 'active'
  //     },
  //     {
  //       id: 'staff3',
  //       name: 'Ms. Rodriguez',
  //       role: 'Speech Therapist',
  //       email: 'rodriguez@school.edu',
  //       photo: undefined,
  //       isMainTeacher: false,
  //       status: 'active'
  //     }
  //   ]);

  //   // Enhanced student data with all properties
  //   setStudents([
  //     { 
  //       id: 'student1', 
  //       name: 'Alex', 
  //       photo: undefined, 
  //       accommodations: ['extra time', 'visual supports'],
  //       workingStyle: 'collaborative',
  //       preferredPartners: ['student3'],
  //       avoidPartners: [],
  //       behaviorNotes: 'Works well in small groups'
  //     },
  //     { 
  //       id: 'student2', 
  //       name: 'Maria', 
  //       photo: undefined, 
  //       accommodations: ['movement breaks'],
  //       workingStyle: 'needs-support',
  //       preferredPartners: ['student4', 'student5'],
  //       avoidPartners: [],
  //       behaviorNotes: 'Benefits from structured activities'
  //     },
  //     { 
  //       id: 'student3', 
  //       name: 'Jordan', 
  //       photo: undefined, 
  //       accommodations: ['sensory tools'],
  //       workingStyle: 'independent',
  //       preferredPartners: ['student1'],
  //       avoidPartners: [],
  //       behaviorNotes: 'Natural leader, helps peers'
  //     },
  //     { 
  //       id: 'student4', 
  //       name: 'Sam', 
  //       photo: undefined, 
  //       accommodations: ['picture schedule'],
  //       workingStyle: 'needs-support',
  //       preferredPartners: ['student2'],
  //       avoidPartners: [],
  //       behaviorNotes: 'Responds well to routine'
  //     },
  //     { 
  //       id: 'student5', 
  //       name: 'Taylor', 
  //       photo: undefined, 
  //       accommodations: ['quiet space'],
  //       workingStyle: 'collaborative',
  //       preferredPartners: ['student2', 'student6'],
  //       avoidPartners: [],
  //       behaviorNotes: 'Enjoys peer interaction'
  //     },
  //     { 
  //       id: 'student6', 
  //       name: 'Casey', 
  //       photo: undefined, 
  //       accommodations: ['visual cues'],
  //       workingStyle: 'independent',
  //       preferredPartners: ['student5'],
  //       avoidPartners: [],
  //       behaviorNotes: 'Self-directed learner'
  //     }
  //   ]);

  //   // Sample groups with enhanced properties
  //   setGroups([
  //     {
  //       id: 'group1',
  //       name: 'Advanced Readers',
  //       label: 'Reading Group A',
  //       description: 'Students reading above grade level',
  //       staffId: 'staff1',
  //       students: ['student1', 'student3'],
  //       studentIds: ['student1', 'student3'],
  //       color: '#3498db',
  //       isTemplate: true,
  //       groupType: 'academic',
  //       targetSkills: ['fluency', 'comprehension'],
  //       maxSize: 4,
  //       minSize: 2,
  //       createdAt: new Date().toISOString(),
  //       updatedAt: new Date().toISOString()
  //     },
  //     {
  //       id: 'group2',
  //       name: 'Math Support',
  //       label: 'Extra Practice Group',
  //       description: 'Students needing additional math support',
  //       staffId: 'staff2',
  //       students: ['student2', 'student4', 'student5'],
  //       studentIds: ['student2', 'student4', 'student5'],
  //       color: '#e74c3c',
  //       isTemplate: true,
  //       groupType: 'academic',
  //       targetSkills: ['number sense', 'basic operations'],
  //       maxSize: 4,
  //       minSize: 2,
  //       createdAt: new Date().toISOString(),
  //       updatedAt: new Date().toISOString()
  //     }
  //   ]);
  // }, []);

  // Load real staff and students from localStorage
  useEffect(() => {
    console.log('🔄 Loading real staff and student data...');
    
    // Load real staff data
    const savedStaff = localStorage.getItem('staff_members');
    if (savedStaff) {
      try {
        const parsedStaff = JSON.parse(savedStaff);
        const activeStaff = parsedStaff.filter((s: any) => s.isActive);
        console.log(`👨‍🏫 Loaded ${activeStaff.length} real staff members:`, activeStaff.map(s => s.name));
        setStaff(activeStaff);
      } catch (error) {
        console.error('Error loading staff:', error);
      }
    }

    // Load real student data  
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      try {
        const parsedStudents = JSON.parse(savedStudents);
        const activeStudents = parsedStudents.filter((s: any) => s.isActive !== false);
        console.log(`👥 Loaded ${activeStudents.length} real students:`, activeStudents.map(s => s.name));
        setStudents(activeStudents);
      } catch (error) {
        console.error('Error loading students:', error);
      }
    }

    // Initialize with empty groups (real groups will be created via UI)
    setGroups([]);
  }, []);

  // Default activity library removed - using only Activity Library activities

  // Helper functions
  const addToSchedule = (activity: Omit<EnhancedActivity, 'assignment'>) => {
    // Set animation state
    setAddingActivityId(activity.id);
    
    // Add the activity to schedule (KEEP EXISTING LOGIC)
    const newActivity: EnhancedActivity = {
      ...activity,
      assignment: {
        staffIds: [],
        groupIds: [],
        isWholeClass: true,
        notes: ''
      }
    };
    
    setSchedule(prev => [...prev, newActivity]);
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setAddingActivityId(null);
    }, 300);
  };

  const removeFromSchedule = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateActivityAssignment = (activityId: string, assignment: ActivityAssignment) => {
    console.log('🔄 updateActivityAssignment called:', {
      activityId,
      assignment,
      hasGroupAssignments: !!(assignment as any).groupAssignments,
      groupCount: (assignment as any).groupAssignments?.length || 0
    });

    setSchedule(schedule.map(activity => {
      if (activity.id === activityId) {
        const updatedActivity = {
          ...activity,
          assignment,
          // 🎯 CRITICAL FIX: Extract groupAssignments from assignment
          groupAssignments: (assignment as any).groupAssignments || []
        };
        
        console.log('✅ Activity updated in updateActivityAssignment:', {
          activityName: activity.name,
          hasAssignment: !!updatedActivity.assignment,
          hasGroupAssignments: !!(updatedActivity.groupAssignments && updatedActivity.groupAssignments.length > 0),
          groupCount: updatedActivity.groupAssignments?.length || 0,
          rawGroupAssignments: updatedActivity.groupAssignments
        });
        
        return updatedActivity;
      }
      return activity;
    }));
  };

  const calculateTime = (startTime: string, minutes: number): string => {
    const [hours, mins] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return schedule.reduce((total, activity) => total + activity.duration, 0);
  };

  const getEndTime = () => {
    return calculateTime(startTime, getTotalDuration());
  };

  const openAssignmentPanel = (activityId: string) => {
    setSelectedActivity(activityId);
    setShowAssignmentPanel(true);
  };

  const handleGroupsSave = (updatedGroups: StudentGroup[]) => {
    setGroups(updatedGroups);
    setShowGroupCreator(false);
  };

  // Remove activity from available activities
  const removeFromAvailable = (activityId: string) => {
    setAvailableActivities(prev => {
      const updatedActivities = prev.filter(activity => activity.id !== activityId);
      localStorage.setItem('available_activities', JSON.stringify(updatedActivities));
      console.log(`Removed activity ${activityId} from available activities`);
      return updatedActivities;
    });
  };

  // 🎯 ENHANCED: Save current schedule with better data flow
  const saveCurrentSchedule = (name: string, description?: string) => {

    console.log('💾 BEFORE SAVE - Current schedule activities:');
    schedule.forEach((activity, index) => {
      console.log(`Activity ${index + 1}: ${activity.name}`, {
        hasAssignment: !!activity.assignment,
        hasGroupAssignments: !!(activity.groupAssignments && activity.groupAssignments.length > 0),
        groupCount: activity.groupAssignments?.length || 0,
        rawGroupAssignments: activity.groupAssignments
      });
    });

    // 🔥 CRITICAL: Ensure ALL activity properties are preserved
    const enhancedActivities = schedule.map((activity: any) => ({
      // Base activity properties
      ...activity,
      
      // 🎯 CRITICAL: Preserve ALL transition properties
      ...(activity.isTransition && {
        isTransition: activity.isTransition,
        transitionType: activity.transitionType,
        animationStyle: activity.animationStyle,
        showNextActivity: activity.showNextActivity,
        movementPrompts: activity.movementPrompts,
        autoStart: activity.autoStart,
        soundEnabled: activity.soundEnabled,
        customMessage: activity.customMessage
      })
    }));

    const savedActivities: SavedActivity[] = enhancedActivities.map(activity => {
      // 🎯 CRITICAL FIX: Ensure ALL properties are preserved
      const savedActivity = {
        id: activity.id,
        name: activity.name,
        icon: activity.icon,
        duration: activity.duration,
        category: activity.category,
        description: activity.description || '',
        isCustom: activity.isCustom || false,
        tags: activity.tags || [],
        materials: activity.materials || [],
        // 🔧 ENHANCED: Preserve assignment completely
        assignment: activity.assignment ? {
          ...activity.assignment,
          // Preserve groupAssignments in assignment too for backward compatibility
          groupAssignments: activity.groupAssignments || []
        } : {
          staffIds: [],
          groupIds: [],
          isWholeClass: true,
          notes: '',
          groupAssignments: activity.groupAssignments || []
        },
        // 🎯 CRITICAL: Preserve groupAssignments at the activity level
        groupAssignments: activity.groupAssignments || [],
        
        // 🔥 CRITICAL: Preserve transition properties in saved activities
        ...(activity.isTransition && {
          isTransition: activity.isTransition,
          transitionType: activity.transitionType,
          animationStyle: activity.animationStyle,
          showNextActivity: activity.showNextActivity,
          movementPrompts: activity.movementPrompts,
          autoStart: activity.autoStart,
          soundEnabled: activity.soundEnabled,
          customMessage: activity.customMessage
        })
      };

      console.log(`💾 Saving activity "${activity.name}" with groups:`, {
        hasGroupAssignments: !!(activity.groupAssignments && activity.groupAssignments.length > 0),
        groupCount: activity.groupAssignments?.length || 0,
        assignmentGroupCount: (activity.assignment as any)?.groupAssignments?.length || 0
      });

      return savedActivity;
    });

    const newSchedule: ScheduleVariation = {
      id: `schedule_${Date.now()}`,
      name: name,
      type: 'daily',
      category: 'academic',
      activities: savedActivities,
      startTime,
      endTime: getEndTime(),
      totalDuration: getTotalDuration(),
      color: '#667eea',
      icon: '📅',
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      usageCount: 0,
      description: description || '',
      tags: [],
      applicableDays: [],
      isDefault: false
    };

    console.log('💾 FINAL SCHEDULE TO SAVE:', {
      name: newSchedule.name,
      activityCount: newSchedule.activities.length,
      activitiesWithGroups: newSchedule.activities.filter(a => 
        a.groupAssignments && a.groupAssignments.length > 0
      ).length,
      id: newSchedule.id
    });

    const updatedSchedules = [...savedSchedules, newSchedule];
    setSavedSchedules(updatedSchedules);
    localStorage.setItem('saved_schedules', JSON.stringify(updatedSchedules));
    localStorage.setItem('scheduleVariations', JSON.stringify(updatedSchedules));
    
    // 🔧 CRITICAL FIX: Notify App.tsx that a schedule was saved
    const saveEvent = new CustomEvent('scheduleSaved', {
      detail: {
        scheduleId: newSchedule.id,
        scheduleName: newSchedule.name,
        activitiesWithGroups: newSchedule.activities.filter(a => 
          a.groupAssignments && a.groupAssignments.length > 0
        ).length
      }
    });
    window.dispatchEvent(saveEvent);
    
    console.log('📡 Dispatched scheduleSaved event to App.tsx');
    
    // 🔍 VERIFY SAVE
    setTimeout(() => {
      const verification = JSON.parse(localStorage.getItem('scheduleVariations') || '[]');
      console.log('🔍 VERIFICATION - Saved to localStorage:', verification.map(s => ({
        name: s.name,
        id: s.id,
        activitiesWithGroups: s.activities.filter(a => a.groupAssignments && a.groupAssignments.length > 0).length
      })));
    }, 100);
    
    console.log(`💾 Saved schedule with group assignments: ${newSchedule.name}`);
  };

  // Load a saved schedule
  const loadSchedule = (scheduleVariation: ScheduleVariation) => {
    const enhancedActivities = (scheduleVariation.activities || []).map((activity: any) => ({
      ...activity,
      assignment: activity.assignment || {
        staffIds: [],
        groupIds: [],
        isWholeClass: true,
        notes: ''
      },
      // CRITICAL: Preserve groupAssignments when loading
      groupAssignments: activity.groupAssignments || [],
      
      // 🎯 EXPLICITLY preserve transition properties
      ...(activity.isTransition && {
        isTransition: activity.isTransition,
        transitionType: activity.transitionType,
        animationStyle: activity.animationStyle,
        showNextActivity: activity.showNextActivity,
        movementPrompts: activity.movementPrompts,
        autoStart: activity.autoStart,
        soundEnabled: activity.soundEnabled,
        customMessage: activity.customMessage
      })
    }));

    setSchedule(enhancedActivities);
    setStartTime(scheduleVariation.startTime);
    setActiveTab('builder');

    // Update usage tracking
    const updatedSchedules = savedSchedules.map(schedule => 
      schedule.id === scheduleVariation.id 
        ? { 
            ...schedule, 
            lastUsed: new Date().toISOString(),
            usageCount: (schedule.usageCount || 0) + 1
          }
        : schedule
    );
    setSavedSchedules(updatedSchedules);
    localStorage.setItem('saved_schedules', JSON.stringify(updatedSchedules));
    localStorage.setItem('scheduleVariations', JSON.stringify(updatedSchedules));
    
    console.log(`📥 Loaded schedule with preserved group assignments: ${scheduleVariation.name}`);
    
    // 🎯 CRITICAL: Dispatch event for SmartboardDisplay
    window.dispatchEvent(new CustomEvent('scheduleLoaded', {
      detail: { 
        schedule: { ...scheduleVariation, activities: enhancedActivities },
        source: 'ScheduleBuilder',
        timestamp: Date.now()
      }
    }));
  };

  // Delete a saved schedule
  const deleteSchedule = (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      const updatedSchedules = savedSchedules.filter(schedule => schedule.id !== scheduleId);
      setSavedSchedules(updatedSchedules);
      localStorage.setItem('saved_schedules', JSON.stringify(updatedSchedules));
      localStorage.setItem('scheduleVariations', JSON.stringify(updatedSchedules));
      console.log(`Deleted schedule: ${scheduleId}`);
    }
  };

  if (!isActive) return null;

  const selectedActivityData = selectedActivity ? schedule.find(a => a.id === selectedActivity) : null;

  return (
    <div style={{
      padding: '1rem',
      height: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes saving-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 16px rgba(40, 167, 69, 0.3); }
          50% { transform: scale(1.02); box-shadow: 0 6px 20px rgba(40, 167, 69, 0.5); }
        }

        @keyframes confetti-fall {
          0% { transform: translateY(-150px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '2.5rem',
          fontWeight: '700',
          margin: '0 0 0.5rem 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🛠️ Schedule Builder
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '1.1rem',
          margin: 0
        }}>
          Build your daily schedule and assign staff and groups
        </p>
      </div>

      {/* Schedule Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'white',
          fontWeight: '600'
        }}>
          <label>Start Time:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontWeight: '600'
            }}
          />
        </div>
        
        <div style={{
          color: 'white',
          fontWeight: '600',
          background: 'rgba(255,255,255,0.1)',
          padding: '8px 16px',
          borderRadius: '8px'
        }}>
          Total: {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m
        </div>
        
        {schedule.length > 0 && (
          <button
            onClick={() => setSchedule([])}
            style={{
              background: 'linear-gradient(145deg, #dc3545, #c82333)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      {/* Glassmorphism Tab Interface */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        justifyContent: 'center'
      }}>
        {[
          { 
            id: 'activities', 
            icon: '📚', 
            label: 'Available Activities', 
            count: availableActivities.length
          },
          { 
            id: 'saved', 
            icon: '📂', 
            label: 'My Saved Schedules', 
            count: savedSchedules.length
          },
          { 
            id: 'builder', 
            icon: '🛠️', 
            label: 'Schedule Builder', 
            count: schedule.length
          }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '1rem 1.5rem',
              border: activeTab === tab.id ? '2px solid rgba(102, 126, 234, 0.3)' : '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              background: activeTab === tab.id 
                ? 'rgba(102, 126, 234, 0.15)' 
                : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: activeTab === tab.id ? '#667eea' : 'white',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              position: 'relative',
              minWidth: '150px'
            }}
          >
            <div style={{ position: 'relative', fontSize: '1.5rem' }}>
              {tab.icon}
              {tab.count > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: activeTab === tab.id ? '#667eea' : '#28a745',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 6px',
                  fontSize: '0.6rem',
                  fontWeight: '700',
                  minWidth: '16px',
                  textAlign: 'center'
                }}>
                  {tab.count}
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.8rem' }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '2rem',
        minHeight: '500px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Available Activities Tab */}
        {activeTab === 'activities' && (
          <div>
            <h3 style={{ 
              margin: '0 0 2rem 0',
              color: '#2c3e50',
              fontSize: '1.5rem',
              fontWeight: '700',
              textAlign: 'center'
            }}>
              📚 Activity Library
            </h3>
            
            {/* Available Activities from Library */}
            {availableActivities.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  color: '#495057',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  🔗 From Activity Library ({availableActivities.length})
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  {availableActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'white',
                        border: '1px solid #e9ecef',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem' }}>
                        {activity.icon || '📝'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#2c3e50',
                          marginBottom: '0.25rem'
                        }}>
                          {activity.name}
                        </div>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#6c757d'
                        }}>
                          {activity.duration}min • {activity.category}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => addToSchedule(activity)}
                          disabled={addingActivityId === activity.id}
                          style={{
                            background: addingActivityId === activity.id 
                              ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                              : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            cursor: addingActivityId === activity.id ? 'default' : 'pointer',
                            fontWeight: '600',
                            transform: addingActivityId === activity.id ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: addingActivityId === activity.id 
                              ? '0 4px 20px rgba(40, 167, 69, 0.4), 0 0 0 3px rgba(40, 167, 69, 0.2)'
                              : '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          {addingActivityId === activity.id ? (
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span style={{
                                display: 'inline-block',
                                width: '12px',
                                height: '12px',
                                border: '2px solid transparent',
                                borderTop: '2px solid white',
                                borderRadius: '50%',
                                animation: 'spin 0.6s linear infinite'
                              }}></span>
                              Adding...
                            </span>
                          ) : (
                            '+ Add'
                          )}
                        </button>
                        <button
                          onClick={() => removeFromAvailable(activity.id)}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {availableActivities.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6c757d',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #dee2e6',
                margin: '2rem 0'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  No activities from library yet.<br/>
                  Visit Activity Library to add activities.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Saved Schedules Tab */}
        {activeTab === 'saved' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h3 style={{ 
                margin: '0',
                color: '#2c3e50',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                📂 My Saved Schedules
              </h3>
              
              <button
                onClick={() => setShowSaveDialog(true)}
                disabled={schedule.length === 0}
                style={{
                  background: schedule.length === 0 
                    ? 'rgba(108, 117, 125, 0.5)' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: schedule.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: schedule.length === 0 ? 0.6 : 1
                }}
              >
                💾 Save Current Schedule
              </button>
            </div>

            {savedSchedules.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6c757d',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  No saved schedules yet.<br/>
                  Build a schedule and save it to get started.
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gap: '1rem'
              }}>
                {savedSchedules.map((schedule) => (
                  <div 
                    key={schedule.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.5rem',
                      background: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderLeft: `4px solid ${schedule.color || '#667eea'}`
                    }}
                  >
                    <div style={{ fontSize: '2rem' }}>
                      {schedule.icon || '📅'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '700', 
                        fontSize: '1.1rem',
                        color: '#2c3e50',
                        marginBottom: '0.5rem'
                      }}>
                        {schedule.name}
                      </div>
                      {schedule.description && (
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: '#6c757d',
                          marginBottom: '0.5rem'
                        }}>
                          {schedule.description}
                        </div>
                      )}
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#6c757d',
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        <span>📝 {schedule.activities.length} activities</span>
                        <span>⏱️ {Math.floor((schedule.totalDuration || 0) / 60)}h {(schedule.totalDuration || 0) % 60}m</span>
                        <span>🕐 {schedule.startTime} - {schedule.endTime}</span>
                        <span>Used {schedule.usageCount || 0} times</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => loadSchedule(schedule)}
                        style={{
                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        📥 Load
                      </button>
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Schedule Builder Tab */}
        {activeTab === 'builder' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h3 style={{ 
                margin: '0',
                color: '#2c3e50',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                🛠️ Schedule Builder
              </h3>
              
              <button
                onClick={() => setShowSaveDialog(true)}
                disabled={schedule.length === 0}
                style={{
                  background: schedule.length === 0 
                    ? 'rgba(108, 117, 125, 0.5)' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: schedule.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: schedule.length === 0 ? 0.6 : 1
                }}
              >
                💾 Save Current Schedule
              </button>
            </div>

            {schedule.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6c757d',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  Click activities from the library to build your schedule
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {/* Bulk Edit Header */}
                {bulkEditMode && (
                  <div style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>
                        📝 Bulk Edit Mode
                      </h4>
                      <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.9 }}>
                        Select activities to edit multiple at once ({selectedActivities.length} selected)
                      </p>
                    </div>
                    <button
                      onClick={() => setBulkEditMode(false)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {schedule.map((activity, index) => {
                  const activityStartTime = index === 0 
                    ? startTime 
                    : calculateTime(startTime, schedule.slice(0, index).reduce((sum, act) => sum + act.duration, 0));
                  const activityEndTime = calculateTime(activityStartTime, activity.duration);
                  const isEditing = editingActivityId === activity.id;
                  const isSelected = selectedActivities.includes(activity.id);

                  return (
                    <div
                      key={`${activity.id}-${index}`}
                      style={{
                        background: isSelected ? '#e3f2fd' : 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #2196f3' : '1px solid #e9ecef',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        position: 'relative'
                      }}
                    >
                      {/* Bulk Edit Checkbox */}
                      {bulkEditMode && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          zIndex: 2
                        }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleActivitySelection(activity.id)}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                      )}

                      {/* Remove button */}
                      {!bulkEditMode && !isEditing && (
                        <button
                          onClick={() => removeFromSchedule(index)}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      )}

                      {/* Activity Header with Edit Form */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem',
                        paddingLeft: bulkEditMode ? '30px' : '0',
                        paddingRight: (!bulkEditMode && !isEditing) ? '40px' : '0'
                      }}>
                        <div style={{ fontSize: '2rem' }}>
                          {activity.icon}
                        </div>
                        <div style={{ flex: '1' }}>
                          {isEditing ? (
                            // Edit Form
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                style={{
                                  padding: '8px 12px',
                                  border: '2px solid #667eea',
                                  borderRadius: '8px',
                                  fontSize: '1.1rem',
                                  fontWeight: '600'
                                }}
                                placeholder="Activity name"
                              />
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                  type="number"
                                  value={editForm.duration}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                                  style={{
                                    padding: '6px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    width: '80px'
                                  }}
                                  min="5"
                                  max="480"
                                />
                                <select
                                  value={editForm.category}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value as ScheduleCategory }))}
                                  style={{
                                    padding: '6px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    minWidth: '120px'
                                  }}
                                >
                                  <option value="academic">📚 Academic</option>
                                  <option value="social">👥 Social</option>
                                  <option value="movement">🏃 Movement</option>
                                  <option value="creative">🎨 Creative</option>
                                  <option value="therapy">💬 Therapy</option>
                                  <option value="routine">🍽️ Routine</option>
                                  <option value="transition">🚪 Transition</option>
                                  <option value="break">☕ Break</option>
                                  <option value="special">⭐ Special</option>
                                </select>
                              </div>
                              <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                style={{
                                  padding: '8px 12px',
                                  border: '1px solid #ddd',
                                  borderRadius: '8px',
                                  minHeight: '60px',
                                  resize: 'vertical'
                                }}
                                placeholder="Activity description..."
                              />
                            </div>
                          ) : (
                            // Display Mode
                            <>
                              <h4 style={{
                                margin: '0 0 0.5rem 0',
                                color: '#2c3e50',
                                fontSize: '1.2rem',
                                fontWeight: '600'
                              }}>
                                {activity.name}
                              </h4>
                              
                              <div style={{
                                display: 'flex',
                                gap: '1rem',
                                fontSize: '0.9rem',
                                color: '#666',
                                flexWrap: 'wrap'
                              }}>
                                <span style={{ fontWeight: '500' }}>
                                  🕐 {activityStartTime} - {activityEndTime}
                                </span>
                                <span style={{ fontWeight: '500' }}>
                                  ⏱️ {activity.duration} min
                                </span>
                                <span style={{ fontWeight: '500' }}>
                                  📂 {activity.category}
                                </span>
                              </div>
                              
                              {activity.description && (
                                <p style={{
                                  margin: '0.5rem 0 0 0',
                                  fontSize: '0.9rem',
                                  color: '#666',
                                  fontStyle: 'italic'
                                }}>
                                  {activity.description}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Staff Assignment Display */}
                      {!isEditing && activity.assignment && activity.assignment.staffIds.length > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                          paddingLeft: bulkEditMode ? '30px' : '0'
                        }}>
                          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                            👥 Staff:
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {activity.assignment.staffIds.map(staffId => {
                              const staffMember = staff.find(s => s.id === staffId);
                              return staffMember ? (
                                <span
                                  key={staffId}
                                  style={{
                                    background: '#3498db',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: '500'
                                  }}
                                >
                                  {staffMember.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Group Assignment Display */}
                      {!isEditing && activity.assignment && activity.assignment.groupIds.length > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                          paddingLeft: bulkEditMode ? '30px' : '0'
                        }}>
                          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                            👤 Groups:
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {activity.assignment.groupIds.map(groupId => {
                              const group = groups.find(g => g.id === groupId);
                              return group ? (
                                <span
                                  key={groupId}
                                  style={{
                                    background: '#27ae60',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: '500'
                                  }}
                                >
                                  {group.name} ({group.studentIds.length})
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #e9ecef',
                        paddingLeft: bulkEditMode ? '30px' : '0'
                      }}>
                        {isEditing ? (
                          // Edit Mode Buttons
                          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                            <button
                              onClick={saveActivityEdit}
                              style={{
                                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                flex: '1'
                              }}
                            >
                              ✅ Save Changes
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          // Normal Mode Buttons
                          <>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {!bulkEditMode && (
                                <button
                                  onClick={() => startEditActivity(activity.id)}
                                  style={{
                                    background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                  }}
                                >
                                  ✏️ Edit
                                </button>
                              )}
                              
                              <button
                                onClick={() => openAssignmentPanel(activity.id)}
                                style={{
                                  background: activity.assignment && 
                                    (activity.assignment.staffIds.length > 0 || activity.assignment.groupIds.length > 0)
                                    ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  fontSize: '0.9rem',
                                  cursor: 'pointer',
                                  fontWeight: '600'
                                }}
                              >
                                {activity.assignment && 
                                  (activity.assignment.staffIds.length > 0 || activity.assignment.groupIds.length > 0)
                                  ? '✅ Assigned' 
                                  : '👥 Assign'
                                }
                              </button>
                            </div>
                            
                            {!bulkEditMode && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => {
                                    if (index > 0) {
                                      const newSchedule = [...schedule];
                                      [newSchedule[index], newSchedule[index - 1]] = [newSchedule[index - 1], newSchedule[index]];
                                      setSchedule(newSchedule);
                                    }
                                  }}
                                  disabled={index === 0}
                                  style={{
                                    background: index === 0 ? '#ccc' : '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    width: '32px',
                                    height: '32px',
                                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => {
                                    if (index < schedule.length - 1) {
                                      const newSchedule = [...schedule];
                                      [newSchedule[index], newSchedule[index + 1]] = [newSchedule[index + 1], newSchedule[index]];
                                      setSchedule(newSchedule);
                                    }
                                  }}
                                  disabled={index === schedule.length - 1}
                                  style={{
                                    background: index === schedule.length - 1 ? '#ccc' : '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    width: '32px',
                                    height: '32px',
                                    cursor: index === schedule.length - 1 ? 'not-allowed' : 'pointer',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  ↓
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Bulk Edit Actions */}
                {!bulkEditMode && schedule.length > 1 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '1rem',
                    background: 'rgba(102, 126, 234, 0.05)',
                    borderRadius: '12px',
                    border: '1px dashed rgba(102, 126, 234, 0.3)'
                  }}>
                    <button
                      onClick={startBulkEdit}
                      style={{
                        background: 'linear-gradient(135deg, #6f42c1 0%, #563d7c 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      📝 Bulk Edit Activities
                    </button>
                  </div>
                )}
                
                {/* Schedule Summary */}
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(102, 126, 234, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    fontSize: '0.9rem',
                    color: '#495057',
                    fontWeight: '600'
                  }}>
                    <span>📅 {startTime} - {getEndTime()}</span>
                    <span>⏱️ {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m</span>
                    <span>📝 {schedule.length} activities</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Group Creator Modal */}
      {showGroupCreator && (
        <GroupCreator
          students={students}
          groups={groups}
          onSave={handleGroupsSave}
          onCancel={() => setShowGroupCreator(false)}
        />
      )}

      {/* 🎯 ENHANCED: Save Schedule Dialog with Animation */}
      <SaveScheduleModal
        isOpen={showSaveDialog}
        onSave={saveCurrentSchedule}
        onCancel={() => setShowSaveDialog(false)}
        activities={schedule}
        startTime={startTime}
      />

      {/* Assignment Panel Modal */}
      {showAssignmentPanel && selectedActivityData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90vw',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>👥 Assign {selectedActivityData.name}</h3>
              <button
                onClick={() => setShowAssignmentPanel(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ×
              </button>
            </div>
            
            <AssignmentPanel
              activity={selectedActivityData}
              staff={staff}
              students={students}
              groups={groups}
              onSave={(assignment) => {
                updateActivityAssignment(selectedActivityData.id, assignment);
                setShowAssignmentPanel(false);
              }}
              onCancel={() => setShowAssignmentPanel(false)}
            />
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {bulkEditMode && selectedActivities.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90vw',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>
                📝 Bulk Edit Activities ({selectedActivities.length} selected)
              </h3>
              <button
                onClick={() => setBulkEditMode(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ 
                margin: '0 0 1rem 0', 
                color: '#666',
                fontSize: '0.9rem'
              }}>
                Changes will be applied to all selected activities:
              </p>
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem'
              }}>
                {selectedActivities.map(activityId => {
                  const activity = schedule.find(a => a.id === activityId);
                  return activity ? (
                    <div key={activityId} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem',
                      fontSize: '0.9rem',
                      color: '#495057'
                    }}>
                      <span>{activity.icon}</span>
                      <span>{activity.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <BulkEditForm 
              onSave={(updates) => {
                saveBulkEdit(updates);
              }}
              onCancel={() => setBulkEditMode(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Bulk Edit Form Component
interface BulkEditFormProps {
  onSave: (updates: Partial<EnhancedActivity>) => void;
  onCancel: () => void;
}

const BulkEditForm: React.FC<BulkEditFormProps> = ({ onSave, onCancel }) => {
  const [updates, setUpdates] = useState<{
    duration?: number;
    category?: ScheduleCategory;
    description?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only include fields that have been changed
    const filteredUpdates: Partial<EnhancedActivity> = {};
    if (updates.duration !== undefined) filteredUpdates.duration = updates.duration;
    if (updates.category !== undefined) filteredUpdates.category = updates.category;
    if (updates.description !== undefined) filteredUpdates.description = updates.description;
    
    onSave(filteredUpdates);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: '600',
          color: '#2c3e50',
          fontSize: '0.9rem'
        }}>
          Duration (minutes)
        </label>
        <input
          type="number"
          placeholder="Leave empty to keep current values"
          value={updates.duration || ''}
          onChange={(e) => setUpdates(prev => ({ 
            ...prev, 
            duration: e.target.value ? parseInt(e.target.value) : undefined 
          }))}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="5"
          max="480"
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: '600',
          color: '#2c3e50',
          fontSize: '0.9rem'
        }}>
          Category
        </label>
        <select
          value={updates.category || ''}
          onChange={(e) => setUpdates(prev => ({ 
            ...prev, 
            category: e.target.value ? e.target.value as ScheduleCategory : undefined 
          }))}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="">Keep current categories</option>
          <option value="academic">📚 Academic</option>
          <option value="social">👥 Social</option>
          <option value="movement">🏃 Movement</option>
          <option value="creative">🎨 Creative</option>
          <option value="therapy">💬 Therapy</option>
          <option value="routine">🍽️ Routine</option>
          <option value="transition">🚪 Transition</option>
          <option value="break">☕ Break</option>
          <option value="special">⭐ Special</option>
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: '600',
          color: '#2c3e50',
          fontSize: '0.9rem'
        }}>
          Description
        </label>
        <textarea
          placeholder="Leave empty to keep current descriptions"
          value={updates.description || ''}
          onChange={(e) => setUpdates(prev => ({ 
            ...prev, 
            description: e.target.value || undefined 
          }))}
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '0.75rem',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        justifyContent: 'flex-end',
        paddingTop: '1rem',
        borderTop: '1px solid #e9ecef'
      }}>
        <button
          type="button"
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
          type="submit"
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
          📝 Apply Changes
        </button>
      </div>
    </form>
  );
};

// ================================
// COLOR-BASED GROUP ASSIGNMENT SYSTEM
// ================================

// Color definitions for groups
const GROUP_COLORS = [
  { id: 'orange', name: 'Orange', color: '#FF8C00', bg: '#FFF3E0' },
  { id: 'red', name: 'Red', color: '#DC3545', bg: '#FFEBEE' },
  { id: 'green', name: 'Green', color: '#28A745', bg: '#E8F5E8' },
  { id: 'blue', name: 'Blue', color: '#007BFF', bg: '#E3F2FD' },
  { id: 'purple', name: 'Purple', color: '#6F42C1', bg: '#F3E5F5' },
  { id: 'yellow', name: 'Yellow', color: '#FFC107', bg: '#FFFDE7' }
];

const SPECIAL_GROUPS = [
  { id: 'absent', name: 'Not at School Today', color: '#6C757D', bg: '#F8F9FA' },
  { id: 'pt', name: 'PT', color: '#17A2B8', bg: '#E0F7FA' },
  { id: 'related-arts', name: 'Related Arts', color: '#FD7E14', bg: '#FFF8E1' },
  { id: 'calm-time', name: 'Calm Time', color: '#20C997', bg: '#E8F8F5' }
];

interface GroupAssignment {
  id: string;
  groupName: string;
  color: string;
  studentIds: string[];
  staffId?: string;
  isIndependent: boolean;
}

const ClassroomGroupAssignment: React.FC<AssignmentPanelProps> = ({
  activity,
  students: propStudents,
  staff: propStaff,
  onSave,
  onCancel
}) => {
  // Load real data from localStorage with fallbacks
  const [realStudents, setRealStudents] = useState<any[]>([]);
  const [realStaff, setRealStaff] = useState<any[]>([]);
  const [groups, setGroups] = useState<GroupAssignment[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<string[]>([]);

  useEffect(() => {
    // Load real student data from UnifiedDataService
    try {
      const unifiedStudents = UnifiedDataService.getAllStudents();
      // Convert UnifiedStudent[] to compatible format
      const studentData = unifiedStudents.map((student: UnifiedStudent) => ({
        id: student.id,
        name: student.name,
        grade: student.grade,
        photo: student.photo,
        workingStyle: student.workingStyle,
        accommodations: student.accommodations || [],
        goals: student.goals || [],
        preferredPartners: student.preferredPartners || [],
        avoidPartners: student.avoidPartners || [],
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        isActive: student.isActive !== false,
        behaviorNotes: student.behaviorNotes,
        medicalNotes: student.medicalNotes
      }));
      
      setRealStudents(studentData);
      setUnassignedStudents(studentData.map((s: any) => s.id));
    } catch (error) {
      console.error('Error loading students from UnifiedDataService:', error);
      // Fallback to localStorage
      try {
        const savedStudents = localStorage.getItem('students');
        const studentData = savedStudents ? JSON.parse(savedStudents) : propStudents || [];
        setRealStudents(studentData);
        setUnassignedStudents(studentData.map((s: any) => s.id));
      } catch (fallbackError) {
        console.error('Error loading students from localStorage:', fallbackError);
        setRealStudents(propStudents || []);
        setUnassignedStudents((propStudents || []).map((s: any) => s.id));
      }
    }

    // Load real staff data from UnifiedDataService
    try {
      const unifiedStaff = UnifiedDataService.getAllStaff();
      // Convert UnifiedStaff[] to compatible format
      const staffData = unifiedStaff.map((staff: UnifiedStaff) => ({
        id: staff.id,
        name: staff.name,
        role: staff.role,
        email: staff.email,
        phone: staff.phone,
        photo: staff.photo,
        isActive: staff.isActive,
        startDate: staff.dateCreated,
        specialties: staff.specialties || [],
        notes: staff.notes,
        isResourceTeacher: staff.isResourceTeacher,
        isRelatedArtsTeacher: staff.isRelatedArtsTeacher
      }));
      
      setRealStaff(staffData);
    } catch (error) {
      console.error('Error loading staff from UnifiedDataService:', error);
      // Fallback to localStorage
      try {
        const savedStaff = localStorage.getItem('staff_members');
        const staffData = savedStaff ? JSON.parse(savedStaff) : propStaff || [];
        setRealStaff(staffData);
      } catch (fallbackError) {
        console.error('Error loading staff from localStorage:', fallbackError);
        setRealStaff(propStaff || []);
      }
    }
  }, [propStudents, propStaff]);

  const createGroup = (colorConfig: any) => {
    const newGroup: GroupAssignment = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      groupName: colorConfig.name,
      color: colorConfig.id,
      studentIds: [],
      isIndependent: false
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const deleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setUnassignedStudents(prev => [...prev, ...group.studentIds]);
      setGroups(prev => prev.filter(g => g.id !== groupId));
    }
  };

  const addStudentToGroup = (studentId: string, groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, studentIds: [...group.studentIds, studentId] }
        : group
    ));
    setUnassignedStudents(prev => prev.filter(id => id !== studentId));
  };

  const removeStudentFromGroup = (studentId: string, groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, studentIds: group.studentIds.filter(id => id !== studentId) }
        : group
    ));
    setUnassignedStudents(prev => [...prev, studentId]);
  };

  const assignStaffToGroup = (groupId: string, staffId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, staffId: staffId === 'none' ? undefined : staffId }
        : group
    ));
  };

  const toggleIndependent = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isIndependent: !group.isIndependent, staffId: undefined }
        : group
    ));
  };

  const handleSave = () => {
    // Create group assignments in the format that SmartboardDisplay expects
    const groupAssignments = groups
      .filter(group => group.studentIds.length > 0) // Only include groups with students
      .map(group => {
        const staffMember = group.staffId ? realStaff.find(s => s.id === group.staffId) : null;
        
        return {
          id: group.id,
          groupName: group.groupName,
          color: group.color as 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow',
          studentIds: group.studentIds,
          staffId: group.staffId,
          isIndependent: group.isIndependent,
          staffMember: staffMember ? {
            id: staffMember.id,
            name: staffMember.name,
            role: staffMember.role,
            photo: staffMember.photo,
            avatar: staffMember.avatar
          } : null
        };
      });

    // 🎯 CRITICAL: Create assignment object with groupAssignments
    const assignment = {
      staffIds: groups.filter(g => g.staffId).map(g => g.staffId!),
      groupIds: [],
      isWholeClass: false,
      notes: `Color groups: ${groups.map(g => `${g.groupName} (${g.studentIds.length} students)`).join(', ')}`,
      // 🔧 CRITICAL: Add groupAssignments to assignment object
      groupAssignments: groupAssignments
    };

    console.log('💾 ClassroomGroupAssignment handleSave - Assignment being passed:', {
      hasGroupAssignments: !!(assignment as any).groupAssignments,
      groupCount: (assignment as any).groupAssignments?.length || 0,
      staffNames: groups.filter(g => g.staffId).map(g => realStaff.find(s => s.id === g.staffId)?.name),
      fullAssignment: assignment
    });

    onSave(assignment);
  };

  const getColorConfig = (colorId: string) => {
    return [...GROUP_COLORS, ...SPECIAL_GROUPS].find(c => c.id === colorId) || GROUP_COLORS[0];
  };

  const getStudentName = (studentId: string) => {
    const student = realStudents.find((s: any) => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const getStaffName = (staffId: string) => {
    const staff = realStaff.find((s: any) => s.id === staffId);
    return staff?.name || 'Unknown Staff';
  };

  return (
    <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
      {/* Create New Groups */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '1.1rem' }}>🎨 Create Color Groups</h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {GROUP_COLORS.map(color => (
            <button
              key={color.id}
              onClick={() => createGroup(color)}
              style={{
                padding: '0.5rem 0.75rem',
                border: `2px solid ${color.color}`,
                background: color.bg,
                color: color.color,
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              + {color.name}
            </button>
          ))}
        </div>
        
        <h5 style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>Special Groups</h5>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SPECIAL_GROUPS.map(special => (
            <button
              key={special.id}
              onClick={() => createGroup(special)}
              style={{
                padding: '0.4rem 0.6rem',
                border: `2px solid ${special.color}`,
                background: special.bg,
                color: special.color,
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              + {special.name}
            </button>
          ))}
        </div>
      </div>

      {/* Unassigned Students */}
      {unassignedStudents.length > 0 && (
        <div style={{
          background: '#F8F9FA',
          border: '2px dashed #DEE2E6',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 0.75rem 0', color: '#495057', fontSize: '1rem' }}>
            👥 Students to Assign ({unassignedStudents.length})
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {unassignedStudents.map(studentId => (
              <div
                key={studentId}
                style={{
                  background: 'white',
                  border: '1px solid #CED4DA',
                  borderRadius: '6px',
                  padding: '0.4rem 0.6rem',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#495057'
                }}
              >
                {getStudentName(studentId)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Groups */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '1.1rem' }}>📋 Active Groups ({groups.length})</h4>
        
        {groups.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#6C757D',
            fontSize: '1rem'
          }}>
            No groups created yet. Click a color above to create your first group!
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {groups.map(group => {
            const colorConfig = getColorConfig(group.color);
            return (
              <div
                key={group.id}
                style={{
                  border: `2px solid ${colorConfig.color}`,
                  borderRadius: '12px',
                  background: colorConfig.bg,
                  overflow: 'hidden'
                }}
              >
                {/* Group Header */}
                <div style={{
                  background: colorConfig.color,
                  color: 'white',
                  padding: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>
                    {group.groupName} Group
                  </h5>
                  <button
                    onClick={() => deleteGroup(group.id)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.2rem 0.4rem',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ padding: '0.75rem' }}>
                  {/* Staff Assignment */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>
                      👨‍🏫 Staff Member:
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <select
                        value={group.staffId || 'none'}
                        onChange={(e) => assignStaffToGroup(group.id, e.target.value)}
                        disabled={group.isIndependent}
                        style={{
                          flex: 1,
                          padding: '0.4rem',
                          border: '1px solid #DEE2E6',
                          borderRadius: '6px',
                          fontSize: '13px',
                          background: group.isIndependent ? '#F8F9FA' : 'white'
                        }}
                      >
                        <option value="none">No staff assigned</option>
                        {realStaff.map((staff: any) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name} ({staff.role})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => toggleIndependent(group.id)}
                        style={{
                          padding: '0.4rem 0.6rem',
                          border: '1px solid',
                          borderColor: group.isIndependent ? '#28A745' : '#6C757D',
                          background: group.isIndependent ? '#D4EDDA' : 'white',
                          color: group.isIndependent ? '#155724' : '#6C757D',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {group.isIndependent ? '✓ Indep.' : 'Indep.'}
                      </button>
                    </div>
                  </div>

                  {/* Students in Group */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>
                      👥 Students ({group.studentIds.length}):
                    </label>
                    
                    {/* Add Student Dropdown */}
                    {unassignedStudents.length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addStudentToGroup(e.target.value, group.id);
                            e.target.value = '';
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '0.4rem',
                          border: '1px solid #DEE2E6',
                          borderRadius: '6px',
                          marginBottom: '0.5rem',
                          fontSize: '13px'
                        }}
                      >
                        <option value="">+ Add student...</option>
                        {unassignedStudents.map(studentId => (
                          <option key={studentId} value={studentId}>
                            {getStudentName(studentId)}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Current Students */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {group.studentIds.map(studentId => (
                        <div
                          key={studentId}
                          style={{
                            background: 'white',
                            border: '1px solid #DEE2E6',
                            borderRadius: '6px',
                            padding: '0.3rem 0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '12px'
                          }}
                        >
                          <span>{getStudentName(studentId)}</span>
                          <button
                            onClick={() => removeStudentFromGroup(studentId, group.id)}
                            style={{
                              background: '#DC3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              padding: '0.1rem 0.3rem',
                              fontSize: '10px',
                              cursor: 'pointer'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    {group.studentIds.length === 0 && (
                      <div style={{
                        textAlign: 'center',
                        padding: '0.75rem',
                        color: '#6C757D',
                        fontStyle: 'italic',
                        fontSize: '12px'
                      }}>
                        No students assigned yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {groups.length > 0 && (
        <div style={{
          background: '#E7F3FF',
          border: '1px solid #007BFF',
          borderRadius: '8px',
          padding: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <h5 style={{ margin: '0 0 0.4rem 0', color: '#0056B3', fontSize: '0.9rem' }}>📊 Assignment Summary</h5>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '12px', color: '#495057' }}>
            <span><strong>Groups:</strong> {groups.length}</span>
            <span><strong>Assigned:</strong> {groups.flatMap(g => g.studentIds).length}/{realStudents.length}</span>
            <span><strong>Unassigned:</strong> {unassignedStudents.length}</span>
            <span><strong>Staff:</strong> {groups.filter(g => g.staffId).length}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        paddingTop: '0.75rem',
        borderTop: '1px solid #DEE2E6'
      }}>
        <button
          onClick={handleSave}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#28A745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          💾 Save Assignment
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6C757D',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Simple Assignment Panel component that uses the color-based system
const AssignmentPanel: React.FC<AssignmentPanelProps> = (props) => {
  return <ClassroomGroupAssignment {...props} />;
};

export default ScheduleBuilder;

import React, { useState, useEffect, useRef } from 'react';
import { schedulePersistence, ScheduleStats } from '../../utils/schedulePersistence';
import { SavedSchedule, ScheduleTemplate, ScheduleActivity } from '../../types';

interface ScheduleManagerProps {
  currentSchedule: ScheduleActivity[];
  currentStartTime: string;
  onLoadSchedule: (activities: ScheduleActivity[], startTime: string) => void;
  onClose: () => void;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  currentSchedule,
  currentStartTime,
  onLoadSchedule,
  onClose
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<'load' | 'save' | 'templates' | 'import'>('load');
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<SavedSchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  
  // Save form state
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [saveTags, setSaveTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // Import state
  const [importData, setImportData] = useState('');
  const [importAsTemplate, setImportAsTemplate] = useState(false);
  
  // UI state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter schedules when search/filter changes
  useEffect(() => {
    filterSchedules();
  }, [schedules, searchTerm, selectedFilter]);

  const loadData = () => {
    try {
      const allSchedules = schedulePersistence.getSchedules();
      const allTemplates = schedulePersistence.getTemplates();
      const scheduleStats = schedulePersistence.getScheduleStats();
      
      setSchedules(allSchedules);
      setTemplates(allTemplates);
      setStats(scheduleStats);
    } catch (error) {
      showMessage('error', 'Failed to load schedule data');
    }
  };

  const filterSchedules = () => {
    let filtered = [...schedules];

    // Apply search filter
    if (searchTerm) {
      filtered = schedulePersistence.searchSchedules(searchTerm, false);
    }

    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(s => s.templateType === selectedFilter);
    }

    setFilteredSchedules(filtered);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveSchedule = async () => {
    if (!saveName.trim()) {
      showMessage('error', 'Please enter a schedule name');
      return;
    }

    if (currentSchedule.length === 0) {
      showMessage('error', 'Cannot save an empty schedule');
      return;
    }

    try {
      setLoading(true);
      
      await schedulePersistence.saveSchedule(
        saveName,
        saveDescription,
        currentStartTime,
        currentSchedule,
        saveAsTemplate,
        'custom',
        saveTags
      );

      showMessage('success', `Schedule "${saveName}" saved successfully!`);
      setSaveName('');
      setSaveDescription('');
      setSaveTags([]);
      setNewTag('');
      loadData();
      
      // Switch to load tab to show the saved schedule
      setActiveTab('load');
    } catch (error) {
      showMessage('error', `Failed to save schedule: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSchedule = (schedule: SavedSchedule) => {
    try {
      onLoadSchedule(schedule.activities, schedule.startTime);
      showMessage('success', `Loaded "${schedule.name}" successfully!`);
      onClose();
    } catch (error) {
      showMessage('error', `Failed to load schedule: ${error.message}`);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      setLoading(true);
      const success = schedulePersistence.deleteSchedule(id);
      
      if (success) {
        showMessage('success', 'Schedule deleted successfully');
        loadData();
      } else {
        showMessage('error', 'Failed to delete schedule');
      }
    } catch (error) {
      showMessage('error', `Failed to delete schedule: ${error.message}`);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleDuplicateSchedule = async (id: string) => {
    try {
      setLoading(true);
      const duplicate = schedulePersistence.duplicateSchedule(id);
      
      if (duplicate) {
        showMessage('success', `Created copy: "${duplicate.name}"`);
        loadData();
      } else {
        showMessage('error', 'Failed to duplicate schedule');
      }
    } catch (error) {
      showMessage('error', `Failed to duplicate schedule: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSchedule = (schedule: SavedSchedule) => {
    try {
      const exportData = schedulePersistence.exportSchedule(schedule.id);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${schedule.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_schedule.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage('success', `Exported "${schedule.name}" successfully!`);
    } catch (error) {
      showMessage('error', `Failed to export schedule: ${error.message}`);
    }
  };

  const handleImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  const handleImportSchedule = async () => {
    if (!importData.trim()) {
      showMessage('error', 'Please provide schedule data to import');
      return;
    }

    try {
      setLoading(true);
      const imported = schedulePersistence.importSchedule(importData, importAsTemplate);
      showMessage('success', `Imported "${imported.name}" successfully!`);
      setImportData('');
      loadData();
      setActiveTab('load');
    } catch (error) {
      showMessage('error', `Import failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !saveTags.includes(newTag.trim())) {
      setSaveTags([...saveTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setSaveTags(saveTags.filter(t => t !== tag));
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '1000px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <h3>📅 Schedule Manager</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {/* Message Display */}
        {message && (
          <div 
            style={{
              padding: '1rem',
              margin: '0 1.5rem',
              borderRadius: '8px',
              background: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
            }}
          >
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '2px solid #e9ecef',
          background: '#f8f9fa',
          margin: '0 1.5rem'
        }}>
          {[
            { key: 'load', label: '📂 Load', icon: '📂' },
            { key: 'save', label: '💾 Save', icon: '💾' },
            { key: 'templates', label: '📋 Templates', icon: '📋' },
            { key: 'import', label: '📥 Import/Export', icon: '📥' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === tab.key ? '#667eea' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#495057',
                fontWeight: activeTab === tab.key ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '8px 8px 0 0'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ padding: '1.5rem', maxHeight: '600px', overflowY: 'auto' }}>
          
          {/* Load Tab */}
          {activeTab === 'load' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4>📂 Load Saved Schedule</h4>
                
                {/* Search and Filter */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '2px solid #e1e8ed',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    style={{
                      padding: '0.75rem',
                      border: '2px solid #e1e8ed',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="academic">Academic</option>
                    <option value="therapy">Therapy</option>
                    <option value="half-day">Half Day</option>
                    <option value="holiday">Holiday</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Statistics */}
                {stats && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px',
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalSchedules}</div>
                      <div style={{ fontSize: '0.9rem' }}>Saved Schedules</div>
                    </div>
                    <div style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      borderRadius: '8px',
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{formatDuration(stats.averageDuration)}</div>
                      <div style={{ fontSize: '0.9rem' }}>Average Duration</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule List */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                {filteredSchedules.length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '3rem',
                    color: '#6c757d'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                    <h3>No Schedules Found</h3>
                    <p>
                      {searchTerm || selectedFilter !== 'all' 
                        ? 'No schedules match your current filters.'
                        : 'Save your first schedule to get started!'}
                    </p>
                  </div>
                ) : (
                  filteredSchedules.map(schedule => (
                    <div
                      key={schedule.id}
                      style={{
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
                        border: '2px solid #e9ecef',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
                      }}
                    >
                      <div style={{ marginBottom: '1rem' }}>
                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1.1rem' }}>
                          {schedule.name}
                        </h5>
                        {schedule.description && (
                          <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                            {schedule.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          <span style={{
                            background: '#e3f2fd',
                            color: '#1976d2',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {formatDuration(schedule.totalDuration)}
                          </span>
                          <span style={{
                            background: '#f3e5f5',
                            color: '#7b1fa2',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {schedule.activityCount} activities
                          </span>
                          {schedule.templateType && (
                            <span style={{
                              background: '#e8f5e8',
                              color: '#2e7d32',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {schedule.templateType}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '1rem' }}>
                        Created: {formatDate(schedule.createdAt)}
                        {schedule.updatedAt !== schedule.createdAt && (
                          <div>Updated: {formatDate(schedule.updatedAt)}</div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleLoadSchedule(schedule)}
                          style={{
                            flex: 1,
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}
                        >
                          📂 Load
                        </button>
                        <button
                          onClick={() => handleDuplicateSchedule(schedule.id)}
                          style={{
                            padding: '0.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleExportSchedule(schedule)}
                          style={{
                            padding: '0.5rem',
                            background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          📤
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(schedule.id)}
                          style={{
                            padding: '0.5rem',
                            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Save Tab */}
          {activeTab === 'save' && (
            <div>
              <h4>💾 Save Current Schedule</h4>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <strong>Current Schedule:</strong> {currentSchedule.length} activities, {formatDuration(currentSchedule.reduce((sum, a) => sum + a.duration, 0))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Schedule Name *
                  </label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Enter schedule name..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e1e8ed',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Save as Template
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={saveAsTemplate}
                      onChange={(e) => setSaveAsTemplate(e.target.checked)}
                    />
                    Make this schedule a reusable template
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Description
                </label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Describe this schedule..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e1e8ed',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Tags
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  {saveTags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1976d2',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    style={{
                      padding: '0.5rem 1rem',
                      background: newTag.trim() ? '#667eea' : '#dee2e6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: newTag.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '14px'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <button
                onClick={handleSaveSchedule}
                disabled={loading || !saveName.trim() || currentSchedule.length === 0}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: loading || !saveName.trim() || currentSchedule.length === 0 
                    ? '#dee2e6' 
                    : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || !saveName.trim() || currentSchedule.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {loading ? '💾 Saving...' : '💾 Save Schedule'}
              </button>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div>
              <h4>📋 Schedule Templates</h4>
              <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                Start with a professional template designed for different classroom needs.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                {templates.map(template => (
                  <div
                    key={template.id}
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
                      border: '2px solid #e9ecef',
                      borderLeft: `6px solid ${
                        template.templateType === 'academic' ? '#3498db' :
                        template.templateType === 'therapy' ? '#e74c3c' :
                        template.templateType === 'half-day' ? '#f39c12' :
                        template.templateType === 'holiday' ? '#9b59b6' : '#2ecc71'
                      }`,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    <div style={{ marginBottom: '1rem' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1.1rem' }}>
                        {template.name}
                      </h5>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                        {template.description}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          background: '#e8f5e8',
                          color: '#2e7d32',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {template.templateType}
                        </span>
                        <span style={{
                          background: '#e3f2fd',
                          color: '#1976d2',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {formatDuration(template.totalDuration)}
                        </span>
                        <span style={{
                          background: '#f3e5f5',
                          color: '#7b1fa2',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {template.activityCount} activities
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '1rem' }}>
                      Target: {template.targetGrade || 'All Grades'}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleLoadSchedule(template)}
                        style={{
                          flex: 1,
                          padding: '0.75rem 1rem',
                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        📋 Use Template
                      </button>
                      <button
                        onClick={() => handleExportSchedule(template)}
                        style={{
                          padding: '0.75rem',
                          background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        📤
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import/Export Tab */}
          {activeTab === 'import' && (
            <div>
              <h4>📥 Import & Export</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                
                {/* Import Section */}
                <div>
                  <h5>📥 Import Schedule</h5>
                  <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Import a schedule from a JSON file or paste the data directly.
                  </p>

                  <div style={{ marginBottom: '1rem' }}>
                    <button
                      onClick={handleImportFile}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '1rem'
                      }}
                    >
                      📁 Select File to Import
                    </button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Or paste JSON data:
                    </label>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Paste schedule JSON data here..."
                      rows={8}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e1e8ed',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={importAsTemplate}
                        onChange={(e) => setImportAsTemplate(e.target.checked)}
                      />
                      Import as template
                    </label>
                  </div>

                  <button
                    onClick={handleImportSchedule}
                    disabled={loading || !importData.trim()}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: loading || !importData.trim() 
                        ? '#dee2e6' 
                        : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: loading || !importData.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                  >
                    {loading ? '📥 Importing...' : '📥 Import Schedule'}
                  </button>
                </div>

                {/* Export Section */}
                <div>
                  <h5>📤 Export Options</h5>
                  <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Export schedules to share with other teachers or backup your data.
                  </p>

                  <div style={{ 
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <h6 style={{ margin: '0 0 0.5rem 0' }}>Quick Export</h6>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#6c757d' }}>
                      Individual schedules can be exported from the Load tab using the 📤 button.
                    </p>
                    
                    <button
                      onClick={() => {
                        try {
                          const exportData = schedulePersistence.exportAllSchedules();
                          const blob = new Blob([exportData], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `all_schedules_${new Date().toISOString().split('T')[0]}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          
                          showMessage('success', 'All schedules exported successfully!');
                        } catch (error) {
                          showMessage('error', `Export failed: ${error.message}`);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                      }}
                    >
                      📤 Export All Schedules
                    </button>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    <strong>💡 Tip:</strong> Exported schedules include all activities, assignments, and metadata. 
                    Share them with colleagues or use them as backups!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div 
            style={{
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
            }}
          >
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '400px',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#dc3545', marginBottom: '1rem' }}>⚠️ Delete Schedule</h4>
              <p style={{ marginBottom: '1.5rem' }}>
                Are you sure you want to delete this schedule? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteSchedule(showDeleteConfirm)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;
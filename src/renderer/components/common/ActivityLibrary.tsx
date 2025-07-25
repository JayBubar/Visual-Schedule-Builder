﻿import React, { useState, useMemo, useEffect } from 'react';
import { Activity } from '../../types';

interface ActivityLibraryProps {
  isActive: boolean;
}

// Extended Activity interface for library display
interface LibraryActivity extends Omit<Activity, 'duration'> {
  description: string;
  defaultDuration: number;
  tags: string[];
}

interface CustomActivity extends LibraryActivity {
  createdAt: string;
  updatedAt?: string;
}

// Activity creation/edit modal component
const ActivityModal: React.FC<{
  activity?: CustomActivity;
  onSave: (activity: CustomActivity) => void;
  onCancel: () => void;
  isOpen: boolean;
}> = ({ activity, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: '📝',
    category: 'academic' as const,
    defaultDuration: 30,
    description: '',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customIcon, setCustomIcon] = useState<string>('');

  // Common emojis for education
  const commonEmojis = [
    '📚', '✏️', '🔢', '🎨', '🎵', '⚽', '🧪', '🗺️', '💻', '🎭',
    '🍎', '🌅', '🤝', '🧘', '🔬', '📖', '✋', '🗣️', '💭', '🎯',
    '🏃', '🤲', '🍽️', '🚻', '🤫', '👷', '💃', '🏥', '📝', '🎉'
  ];

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name,
        icon: activity.icon,
        category: activity.category as any,
        defaultDuration: activity.defaultDuration,
        description: activity.description,
        tags: [...activity.tags],
      });
    } else {
      setFormData({
        name: '',
        icon: '📝',
        category: 'academic',
        defaultDuration: 30,
        description: '',
        tags: [],
      });
    }
  }, [activity, isOpen]);

  const handleSave = () => {
    if (!formData.name.trim()) return;

    const activityData: CustomActivity = {
      id: activity?.id || `custom_${Date.now()}`,
      name: formData.name.trim(),
      icon: customIcon || formData.icon,
      category: formData.category,
      defaultDuration: formData.defaultDuration,
      description: formData.description.trim(),
      tags: formData.tags,
      isCustom: true,
      createdAt: activity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(activityData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomIcon(result);
        setFormData(prev => ({ ...prev, icon: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content activity-modal">
        <div className="modal-header">
          <h3>{activity ? 'Edit Activity' : 'Create Custom Activity'}</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          {/* Activity Name */}
          <div className="form-group">
            <label>Activity Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Morning Reading Circle"
              required
            />
          </div>

          {/* Icon Selection */}
          <div className="form-group">
            <label>Icon</label>
            <div className="icon-selection">
              <div className="current-icon">
                {customIcon ? (
                  <img src={customIcon} alt="Custom icon" className="custom-icon-preview" />
                ) : (
                  <span className="emoji-preview">{formData.icon}</span>
                )}
              </div>
              
              <div className="icon-buttons">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="icon-button"
                >
                  😊 Choose Emoji
                </button>
                
                <label className="icon-button file-upload-button">
                  📁 Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {showEmojiPicker && (
                <div className="emoji-picker">
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className="emoji-option"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, icon: emoji }));
                        setCustomIcon('');
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category and Duration */}
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
              >
                <option value="academic">Academic</option>
                <option value="creative">Creative</option>
                <option value="movement">Movement</option>
                <option value="break">Break</option>
                <option value="social">Social</option>
                <option value="resource">Resource</option>
                <option value="transition">Transition</option>
              </select>
            </div>

            <div className="form-group">
              <label>Default Duration (minutes)</label>
              <input
                type="number"
                value={formData.defaultDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultDuration: parseInt(e.target.value) || 30 }))}
                min="1"
                max="180"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the activity..."
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input">
              <div className="tag-list">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag-chip">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="tag-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="add-tag-input">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                />
                <button type="button" onClick={addTag} disabled={!newTag.trim()}>
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={!formData.name.trim()}
          >
            {activity ? 'Save Changes' : 'Create Activity'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivityLibrary: React.FC<ActivityLibraryProps> = ({ isActive }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [customActivities, setCustomActivities] = useState<CustomActivity[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<CustomActivity | undefined>();
  const [addingActivities, setAddingActivities] = useState<Set<string>>(new Set());

  // Base activities database
  const baseActivities: LibraryActivity[] = [
    // Academic Activities
    { id: '1', name: 'Morning Meeting', icon: '🌅', category: 'social', description: 'Circle time and daily greeting', defaultDuration: 15, tags: ['circle', 'greeting', 'social'], isCustom: false },
    { id: '2', name: 'Math', icon: '🔢', category: 'academic', description: 'Mathematics instruction and practice', defaultDuration: 30, tags: ['numbers', 'calculation', 'problem-solving'], isCustom: false },
    { id: '3', name: 'Reading', icon: '📖', category: 'academic', description: 'Literacy and reading activities', defaultDuration: 30, tags: ['books', 'literacy', 'comprehension'], isCustom: false },
    { id: '4', name: 'Writing', icon: '✏️', category: 'academic', description: 'Writing practice and composition', defaultDuration: 25, tags: ['writing', 'composition', 'handwriting'], isCustom: false },
    { id: '5', name: 'Science', icon: '🔬', category: 'academic', description: 'Science exploration and experiments', defaultDuration: 25, tags: ['experiments', 'discovery', 'STEM'], isCustom: false },
    { id: '6', name: 'Social Studies', icon: '🗺️', category: 'academic', description: 'Geography, history, and social concepts', defaultDuration: 30, tags: ['geography', 'history', 'community'], isCustom: false },
    { id: '7', name: 'Computer Lab', icon: '💻', category: 'academic', description: 'Technology and computer skills', defaultDuration: 25, tags: ['technology', 'computers', 'digital'], isCustom: false },
    { id: '8', name: 'Library', icon: '📚', category: 'academic', description: 'Library visit and book selection', defaultDuration: 20, tags: ['books', 'research', 'quiet'], isCustom: false },

    // Creative & Arts
    { id: '9', name: 'Art', icon: '🎨', category: 'creative', description: 'Creative arts and crafts', defaultDuration: 30, tags: ['creativity', 'painting', 'crafts'], isCustom: false },
    { id: '10', name: 'Music', icon: '🎵', category: 'creative', description: 'Music and rhythm activities', defaultDuration: 25, tags: ['music', 'rhythm', 'singing'], isCustom: false },
    { id: '11', name: 'Drama', icon: '🎭', category: 'creative', description: 'Theater and dramatic play', defaultDuration: 30, tags: ['theater', 'acting', 'expression'], isCustom: false },
    { id: '12', name: 'Dance', icon: '💃', category: 'creative', description: 'Movement and dance activities', defaultDuration: 20, tags: ['movement', 'rhythm', 'exercise'], isCustom: false },

    // Physical & Movement
    { id: '13', name: 'PE', icon: '⚽', category: 'movement', description: 'Physical education and sports', defaultDuration: 30, tags: ['sports', 'exercise', 'teamwork'], isCustom: false },
    { id: '14', name: 'Recess', icon: '🏃', category: 'movement', description: 'Outdoor play and free time', defaultDuration: 20, tags: ['playground', 'outdoor', 'free-play'], isCustom: false },
    { id: '15', name: 'Yoga', icon: '🧘', category: 'movement', description: 'Mindfulness and gentle movement', defaultDuration: 15, tags: ['mindfulness', 'stretching', 'calm'], isCustom: false },
    { id: '16', name: 'Sensory Break', icon: '🤲', category: 'movement', description: 'Sensory integration activities', defaultDuration: 10, tags: ['sensory', 'regulation', 'break'], isCustom: false },

    // Breaks & Transitions
    { id: '17', name: 'Lunch', icon: '🍽️', category: 'break', description: 'Lunch break and social time', defaultDuration: 30, tags: ['food', 'social', 'nutrition'], isCustom: false },
    { id: '18', name: 'Snack', icon: '🍎', category: 'break', description: 'Snack time and nutrition break', defaultDuration: 10, tags: ['food', 'nutrition', 'energy'], isCustom: false },
    { id: '19', name: 'Bathroom', icon: '🚻', category: 'break', description: 'Bathroom and hygiene break', defaultDuration: 5, tags: ['hygiene', 'self-care', 'routine'], isCustom: false },
    { id: '20', name: 'Quiet Time', icon: '🤫', category: 'break', description: 'Rest and quiet activities', defaultDuration: 15, tags: ['rest', 'calm', 'quiet'], isCustom: false },

    // Social & Life Skills
    { id: '21', name: 'Social Skills', icon: '🤝', category: 'social', description: 'Social interaction practice', defaultDuration: 20, tags: ['friendship', 'communication', 'social'], isCustom: false },
    { id: '22', name: 'Life Skills', icon: '🧹', category: 'social', description: 'Daily living and independence skills', defaultDuration: 25, tags: ['independence', 'daily-living', 'practical'], isCustom: false },
    { id: '23', name: 'Community Helper', icon: '👷', category: 'social', description: 'Classroom jobs and responsibilities', defaultDuration: 10, tags: ['responsibility', 'helper', 'community'], isCustom: false },
    { id: '24', name: 'Show and Tell', icon: '🗣️', category: 'social', description: 'Presentation and sharing time', defaultDuration: 15, tags: ['presentation', 'sharing', 'confidence'], isCustom: false },

    // Therapy & Support
    { id: '25', name: 'Speech Therapy', icon: '🗣️', category: 'resource', description: 'Speech and language therapy', defaultDuration: 30, tags: ['speech', 'language', 'communication'], isCustom: false },
    { id: '26', name: 'OT', icon: '✋', category: 'resource', description: 'Occupational therapy session', defaultDuration: 30, tags: ['fine-motor', 'coordination', 'therapy'], isCustom: false },
    { id: '27', name: 'Counseling', icon: '💭', category: 'resource', description: 'Counseling and emotional support', defaultDuration: 30, tags: ['emotions', 'support', 'counseling'], isCustom: false },
    { id: '28', name: 'Resource Room', icon: '🎯', category: 'resource', description: 'Special education support', defaultDuration: 30, tags: ['support', 'individualized', 'academic'], isCustom: false }
  ];

  // Load custom activities from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('custom_activities');
    if (stored) {
      try {
        setCustomActivities(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading custom activities:', error);
      }
    }
  }, []);

  // Save custom activities to localStorage
  const saveCustomActivities = (activities: CustomActivity[]) => {
    localStorage.setItem('custom_activities', JSON.stringify(activities));
    setCustomActivities(activities);
    
    // Notify Schedule Builder of changes with enhanced payload
    window.dispatchEvent(new CustomEvent('activitiesUpdated', {
      detail: { 
        activities: [...baseActivities, ...activities],
        source: 'ActivityLibrary',
        timestamp: Date.now(),
        customCount: activities.length,
        totalCount: [...baseActivities, ...activities].length
      }
    }));
  };

  // Combine base and custom activities
  const allActivities = useMemo(() => {
    return [...baseActivities, ...customActivities];
  }, [customActivities]);

  const categories = ['All', 'academic', 'creative', 'movement', 'break', 'social', 'resource', 'transition'];

  // Filter activities based on search and category
  const filteredActivities = useMemo(() => {
    return allActivities.filter(activity => {
      const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || activity.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, allActivities]);

  // Get category counts
  const getCategoryCount = (category: string) => {
    if (category === 'All') return allActivities.length;
    return allActivities.filter(activity => activity.category === category).length;
  };

  // Handle activity actions
  const handleAddActivity = async (activity: LibraryActivity) => {
    // Prevent duplicate adds while processing
    if (addingActivities.has(activity.id)) {
      return;
    }

    // Set loading state
    setAddingActivities(prev => new Set([...prev, activity.id]));

    try {
      // Create unique instance ID to prevent duplicates
      const instanceId = `${activity.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Enhanced activity data mapping for Schedule Builder
      const activityToAdd = {
        id: instanceId, // Unique instance ID
        originalId: activity.id, // Keep reference to original
        name: activity.name,
        icon: activity.icon,
        emoji: activity.icon, // Alias for compatibility
        duration: activity.defaultDuration,
        category: activity.category,
        description: activity.description || '',
        materials: [], // Empty array for Schedule Builder compatibility
        instructions: activity.description || '',
        isCustom: activity.isCustom || false,
        tags: activity.tags || [],
        createdAt: new Date().toISOString(),
        addedFromLibrary: true // Flag to identify library additions
      };

      // Get existing activities and check for duplicates
      const existingActivities = JSON.parse(localStorage.getItem('available_activities') || '[]');
      
      // Check if this exact activity (by originalId) was recently added (within last 5 seconds)
      const recentDuplicates = existingActivities.filter((existing: any) => 
        existing.originalId === activity.id && 
        existing.addedFromLibrary &&
        (Date.now() - new Date(existing.createdAt).getTime()) < 5000
      );

      if (recentDuplicates.length > 0) {
        // Show warning but don't prevent adding
        console.warn(`Activity "${activity.name}" was recently added. Adding another instance.`);
      }

      // Add to available activities in Schedule Builder
      const updatedActivities = [...existingActivities, activityToAdd];
      localStorage.setItem('available_activities', JSON.stringify(updatedActivities));

      // Notify Schedule Builder with enhanced payload
      window.dispatchEvent(new CustomEvent('activityAdded', {
        detail: { 
          activity: activityToAdd,
          source: 'ActivityLibrary',
          timestamp: Date.now()
        }
      }));

      // Brief success animation delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Activity "${activity.name}" added to Schedule Builder with ID: ${instanceId}`);
      
    } catch (error) {
      console.error('Error adding activity:', error);
      alert(`Error adding "${activity.name}". Please try again.`);
    } finally {
      // Remove loading state
      setAddingActivities(prev => {
        const newSet = new Set(prev);
        newSet.delete(activity.id);
        return newSet;
      });
    }
  };

  const handleEditActivity = (activity: LibraryActivity) => {
    if (activity.isCustom) {
      setEditingActivity(activity as CustomActivity);
      setModalOpen(true);
    } else {
      // For built-in activities, create a custom version
      const customVersion: CustomActivity = {
        ...activity,
        id: `custom_${activity.id}_${Date.now()}`,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      setEditingActivity(customVersion);
      setModalOpen(true);
    }
  };

  const handleSaveActivity = (activity: CustomActivity) => {
    let updatedActivities;
    
    if (editingActivity && customActivities.find(a => a.id === editingActivity.id)) {
      // Update existing custom activity
      updatedActivities = customActivities.map(a => 
        a.id === editingActivity.id ? activity : a
      );
    } else {
      // Add new custom activity
      updatedActivities = [...customActivities, activity];
    }

    saveCustomActivities(updatedActivities);
    setModalOpen(false);
    setEditingActivity(undefined);
  };

  const handleDeleteActivity = (activity: LibraryActivity) => {
    if (!activity.isCustom) {
      alert('Built-in activities cannot be deleted. You can edit them to create custom versions.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${activity.name}"?`)) {
      const updatedActivities = customActivities.filter(a => a.id !== activity.id);
      saveCustomActivities(updatedActivities);
    }
  };

  const handleDuplicateActivity = (activity: LibraryActivity) => {
    const duplicate: CustomActivity = {
      ...activity,
      id: `custom_${Date.now()}`,
      name: `${activity.name} (Copy)`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    
    setEditingActivity(duplicate);
    setModalOpen(true);
  };

  if (!isActive) return null;

  return (
    <div className="activity-library-page">
      <div className="library-header">
        <h2 className="component-title">📚 Activity Library</h2>
        <p className="component-subtitle">
          Browse and manage your collection of educational activities
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="library-controls">
        <div className="search-section">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search activities, descriptions, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="filter-section">
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              >
                {category}
                <span className="category-count">({getCategoryCount(category)})</span>
              </button>
            ))}
          </div>

          <div className="view-controls">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid view"
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        Showing {filteredActivities.length} of {allActivities.length} activities
        {searchTerm && (
          <span className="search-summary"> for "{searchTerm}"</span>
        )}
        {selectedCategory !== 'All' && (
          <span className="filter-summary"> in {selectedCategory}</span>
        )}
      </div>

      {/* Activity Display */}
      <div className={`activities-container ${viewMode}`}>
        {filteredActivities.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No activities found</h3>
            <p>Try adjusting your search terms or category filter</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="reset-search">
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div key={activity.id} className="activity-item" data-category={activity.category}>
              <div className="activity-icon-large">
                {activity.icon.startsWith('data:') ? (
                  <img src={activity.icon} alt={activity.name} className="custom-activity-icon" />
                ) : (
                  activity.icon
                )}
              </div>
              <div className="activity-content">
                <div className="activity-header">
                  <h3 className="activity-title">
                    {activity.name}
                    {activity.isCustom && <span className="custom-badge">Custom</span>}
                  </h3>
                  <div className="activity-meta">
                    <span className="activity-category-badge">{activity.category}</span>
                    <span className="activity-duration">{activity.defaultDuration}min</span>
                  </div>
                </div>
                <p className="activity-description">{activity.description}</p>
                <div className="activity-tags">
                  {activity.tags.map(tag => (
                    <span key={tag} className="activity-tag">#{tag}</span>
                  ))}
                </div>
              </div>
              <div className="activity-actions">
                <button 
                  className={`action-button primary ${addingActivities.has(activity.id) ? 'adding' : ''}`}
                  title={addingActivities.has(activity.id) ? 'Adding to schedule...' : 'Add to schedule'}
                  onClick={() => handleAddActivity(activity)}
                  disabled={addingActivities.has(activity.id)}
                >
                  {addingActivities.has(activity.id) ? (
                    <>
                      <span className="spinner">⏳</span> Adding...
                    </>
                  ) : (
                    '+ Add'
                  )}
                </button>
                <button 
                  className="action-button secondary" 
                  title="Edit activity"
                  onClick={() => handleEditActivity(activity)}
                >
                  ✏️
                </button>
                <button 
                  className="action-button secondary" 
                  title="More options"
                  onClick={() => {
                    const action = window.confirm('Choose action:\nOK = Duplicate\nCancel = Delete');
                    if (action) {
                      handleDuplicateActivity(activity);
                    } else {
                      handleDeleteActivity(activity);
                    }
                  }}
                >
                  ⋯
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Custom Activity Button */}
      <div className="add-custom-section">
        <button 
          className="add-custom-button"
          onClick={() => {
            setEditingActivity(undefined);
            setModalOpen(true);
          }}
        >
          <span className="add-icon">➕</span>
          Create Custom Activity
        </button>
      </div>

      {/* Activity Modal */}
      <ActivityModal
        activity={editingActivity}
        onSave={handleSaveActivity}
        onCancel={() => {
          setModalOpen(false);
          setEditingActivity(undefined);
        }}
        isOpen={modalOpen}
      />

      <style>{`
        .activity-library-page {
          padding: 1.5rem;
          background: white;
          min-height: calc(100vh - 80px);
        }

        .library-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .library-controls {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          border: 1px solid #e9ecef;
        }

        .search-section {
          margin-bottom: 1rem;
        }

        .search-input-container {
          position: relative;
          max-width: 500px;
          margin: 0 auto;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          font-size: 1rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
        }

        .filter-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .category-filters {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .category-button {
          padding: 0.5rem 1rem;
          border: 2px solid #dee2e6;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .category-button:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .category-button.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .category-count {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .view-controls {
          display: flex;
          gap: 0.25rem;
          border: 2px solid #dee2e6;
          border-radius: 6px;
          overflow: hidden;
        }

        .view-button {
          padding: 0.5rem;
          border: none;
          background: white;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-size: 1rem;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .view-button:hover {
          background: #f8f9fa;
        }

        .view-button.active {
          background: #667eea;
          color: white;
        }

        .results-summary {
          margin-bottom: 1rem;
          color: #6c757d;
          font-size: 0.9rem;
          text-align: center;
        }

        .search-summary,
        .filter-summary {
          font-weight: 500;
          color: #495057;
        }

        .activities-container {
          margin-bottom: 2rem;
        }

        .activities-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1rem;
        }

        .activities-container.list .activity-item {
          display: flex;
          padding: 1rem;
        }

        .activities-container.list .activity-icon-large {
          font-size: 2rem;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .activity-item {
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          transform: translateY(-2px);
        }

        .activity-icon-large {
          font-size: 3rem;
          text-align: center;
          margin-bottom: 0.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 3rem;
        }

        .custom-activity-icon {
          width: 3rem;
          height: 3rem;
          object-fit: cover;
          border-radius: 8px;
        }

        .activity-content {
          flex: 1;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.5rem;
          gap: 1rem;
        }

        .activity-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: #495057;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .custom-badge {
          background: #28a745;
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .activity-meta {
          display: flex;
          flex-direction: column;
          align-items: end;
          gap: 0.25rem;
          flex-shrink: 0;
        }

        .activity-category-badge {
          background: #e9ecef;
          color: #495057;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .activity-duration {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 500;
        }

        .activity-description {
          color: #6c757d;
          margin: 0.5rem 0;
          line-height: 1.5;
        }

        .activity-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }

        .activity-tag {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 0.125rem 0.5rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .activity-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .action-button {
          padding: 0.5rem 1rem;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .action-button.primary {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .action-button.primary:hover:not(:disabled) {
          background: #5a67d8;
          border-color: #5a67d8;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }

        .action-button.primary.adding {
          background: #28a745;
          border-color: #28a745;
          cursor: not-allowed;
        }

        .action-button.primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .action-button.secondary {
          background: white;
          color: #6c757d;
        }

        .action-button.secondary:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        .no-results {
          text-align: center;
          padding: 3rem 1rem;
          color: #6c757d;
        }

        .no-results-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-results h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #495057;
        }

        .no-results p {
          margin-bottom: 1.5rem;
        }

        .reset-search {
          padding: 0.75rem 1.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .reset-search:hover {
          background: #5a67d8;
        }

        .add-custom-section {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #e9ecef;
        }

        .add-custom-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .add-custom-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
        }

        .add-icon {
          font-size: 1.25rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .activity-modal {
          max-width: 700px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.5rem;
          color: #495057;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6c757d;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }

        .close-button:hover {
          background: #f8f9fa;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #495057;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .icon-selection {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .current-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          border: 2px solid #dee2e6;
          border-radius: 12px;
          background: #f8f9fa;
        }

        .emoji-preview {
          font-size: 2rem;
        }

        .custom-icon-preview {
          width: 3rem;
          height: 3rem;
          object-fit: cover;
          border-radius: 8px;
        }

        .icon-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .icon-button,
        .file-upload-button {
          padding: 0.5rem 1rem;
          border: 2px solid #dee2e6;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .icon-button:hover,
        .file-upload-button:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .emoji-picker {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
          gap: 0.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          max-height: 200px;
          overflow-y: auto;
        }

        .emoji-option {
          padding: 0.5rem;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.5rem;
          transition: all 0.2s ease;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .emoji-option:hover {
          background: #667eea;
          color: white;
          transform: scale(1.1);
        }

        .tags-input {
          border: 2px solid #dee2e6;
          border-radius: 8px;
          padding: 0.5rem;
          background: white;
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .tag-chip {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #667eea;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .tag-remove {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 0.8rem;
          width: 1rem;
          height: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }

        .tag-remove:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .add-tag-input {
          display: flex;
          gap: 0.5rem;
        }

        .add-tag-input input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0.25rem;
          font-size: 0.9rem;
        }

        .add-tag-input button {
          padding: 0.25rem 0.75rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .add-tag-input button:hover:not(:disabled) {
          background: #5a67d8;
        }

        .add-tag-input button:disabled {
          background: #dee2e6;
          color: #6c757d;
          cursor: not-allowed;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e9ecef;
        }

        .cancel-btn,
        .save-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: #f8f9fa;
          color: #6c757d;
        }

        .cancel-btn:hover {
          background: #e9ecef;
        }

        .save-btn {
          background: #667eea;
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          background: #5a67d8;
        }

        .save-btn:disabled {
          background: #dee2e6;
          color: #6c757d;
          cursor: not-allowed;
        }

        /* Category-specific styling */
        .activity-item[data-category="academic"] .activity-category-badge {
          background: rgba(52, 152, 219, 0.1);
          color: #3498db;
        }

        .activity-item[data-category="creative"] .activity-category-badge {
          background: rgba(155, 89, 182, 0.1);
          color: #9b59b6;
        }

        .activity-item[data-category="movement"] .activity-category-badge {
          background: rgba(46, 204, 113, 0.1);
          color: #2ecc71;
        }

        .activity-item[data-category="break"] .activity-category-badge {
          background: rgba(241, 196, 15, 0.1);
          color: #f1c40f;
        }

        .activity-item[data-category="social"] .activity-category-badge {
          background: rgba(230, 126, 34, 0.1);
          color: #e67e22;
        }

        .activity-item[data-category="resource"] .activity-category-badge {
          background: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
        }

        .activity-item[data-category="transition"] .activity-category-badge {
          background: rgba(142, 68, 173, 0.1);
          color: #8e44ad;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .activity-library-page {
            padding: 1rem;
          }

          .library-controls {
            padding: 1rem;
          }

          .filter-section {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .category-filters {
            justify-content: center;
          }

          .view-controls {
            align-self: center;
          }

          .activities-container.grid {
            grid-template-columns: 1fr;
          }

          .activities-container.list .activity-item {
            flex-direction: column;
            text-align: center;
          }

          .activities-container.list .activity-icon-large {
            margin-right: 0;
            margin-bottom: 1rem;
          }

          .activity-header {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .activity-meta {
            align-items: center;
          }

          .activity-actions {
            flex-wrap: wrap;
            justify-content: center;
          }

          .action-button {
            flex: 1;
            min-width: 80px;
            justify-content: center;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .icon-buttons {
            justify-content: center;
          }

          .modal-content {
            margin: 0.5rem;
            max-width: calc(100vw - 1rem);
          }
        }

        @media (max-width: 480px) {
          .category-filters {
            flex-direction: column;
          }

          .category-button {
            justify-content: center;
          }

          .search-input {
            font-size: 16px; /* Prevents zoom on iOS */
          }

          .emoji-picker {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default ActivityLibrary;
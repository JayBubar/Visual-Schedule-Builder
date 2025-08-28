import React, { useState, useMemo, useEffect } from 'react';
import UnifiedDataService, { UnifiedActivity } from '../../services/unifiedDataService';

// DisplayVideoCheckbox Component
interface DisplayVideoCheckboxProps {
  videoId: string;
  slot: 'move1' | 'move2' | 'lesson1' | 'lesson2';
  label: string;
  video: any; // Use your video type
}

const DisplayVideoCheckbox: React.FC<DisplayVideoCheckboxProps> = ({ 
  videoId, 
  slot, 
  label, 
  video 
}) => {
  const [isSelected, setIsSelected] = useState(false);

  // Load current selection on mount
  useEffect(() => {
    const selectedVideos = localStorage.getItem('selectedDisplayVideos');
    if (selectedVideos) {
      const videos = JSON.parse(selectedVideos);
      setIsSelected(videos[slot]?.id === videoId);
    }
  }, [videoId, slot]);

  const handleChange = (checked: boolean) => {
    try {
      const selectedVideos = localStorage.getItem('selectedDisplayVideos');
      const videos = selectedVideos ? JSON.parse(selectedVideos) : {};
      
      if (checked) {
        // Select this video for this slot
        videos[slot] = {
          id: videoId,
          url: video.videoData?.videoUrl || video.url,
          title: video.name
        };
      } else {
        // Deselect this slot
        delete videos[slot];
      }
      
      localStorage.setItem('selectedDisplayVideos', JSON.stringify(videos));
      setIsSelected(checked);
      
      // If selecting, deselect other videos for this slot
      if (checked) {
        // Trigger re-render of other checkboxes (you might need a context or state management)
        window.dispatchEvent(new CustomEvent('displayVideoSelectionChanged'));
      }
    } catch (error) {
      console.error('Error updating video selection:', error);
    }
  };

  return (
    <label style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '4px',
      background: isSelected ? 'rgba(102, 126, 234, 0.2)' : 'transparent'
    }}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => handleChange(e.target.checked)}
        style={{ margin: 0 }}
      />
      <span style={{ 
        fontSize: '0.8rem',
        fontWeight: isSelected ? '600' : '400'
      }}>
        {label}
      </span>
    </label>
  );
};

// Utility function to generate unique IDs
let idCounter = 0;
const generateUniqueId = (prefix: string = 'id'): string => {
  idCounter++;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const counter = idCounter.toString(36);
  return `${prefix}_${timestamp}_${counter}_${random}`;
};

interface ActivityLibraryProps {
  isActive: boolean;
}

// Simplified content structure
interface LibraryContent {
  id: string;
  name: string;
  icon: string;
  category: 'academic' | 'break' | 'other';
  contentType: 'activity' | 'video' | 'document'; // ADD document type
  defaultDuration: number;
  description: string;
  tags: string[];
  isDeletable: boolean;
  isCustom: boolean;
  
  // Video-specific data
  videoData?: {
    videoUrl: string;
    notes?: string;
  };
  
  // Document-specific data (NEW)
  documentData?: {
    googleDriveUrl: string;
    documentType: 'lesson-plan' | 'worksheet' | 'standard' | 'resource' | 'other';
    notes?: string;
  };
  
  // Activity-specific data
  materials?: string[];
  instructions?: string;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

// Content creation/edit modal component
const ContentModal: React.FC<{
  content?: LibraryContent;
  onSave: (content: LibraryContent) => void;
  onCancel: () => void;
  isOpen: boolean;
}> = ({ content, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState<{
    name: string;
    icon: string;
    category: 'academic' | 'break' | 'other';
    contentType: 'activity' | 'video' | 'document'; // ADD document
    defaultDuration: number;
    description: string;
    tags: string[];
    videoUrl: string;
    googleDriveUrl: string; // NEW
    documentType: 'lesson-plan' | 'worksheet' | 'standard' | 'resource' | 'other'; // NEW
    notes: string;
    materials: string[];
    instructions: string;
  }>({
    name: '',
    icon: '📝',
    category: 'academic',
    contentType: 'activity',
    defaultDuration: 30,
    description: '',
    tags: [],
    videoUrl: '',
    googleDriveUrl: '', // NEW
    documentType: 'resource', // NEW
    notes: '',
    materials: [],
    instructions: '',
  });
  const [newTag, setNewTag] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // FIXED: Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showEmojiPicker && !target.closest('.icon-selection')) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Available icons organized by purpose
  const iconLibrary = {
    academic: ['📚', '✏️', '🔢', '🧪', '🗺️', '💻', '📖', '📝', '🎓', '🔬'],
    break: ['🍽️', '🍎', '🚻', '😴', '🔄', '⏰', '🛡️', '🚨', '⚠️', '🔔'],
    other: ['🗣️', '✋', '💭', '🎯', '🎨', '🎵', '⚽', '🤝', '🧘', '🎮'],
    document: ['📄', '📋', '📊', '📈', '📉', '🗂️', '📁', '🔗', '📎', '📑'], // NEW
    general: ['📋', '⭐', '🎉', '💡', '🔗', '📹', '🎬', '📺', '🌟', '✨']
  };

  // Common tags for different content types
  const tagSuggestions = {
    academic: ['math', 'reading', 'science', 'social-studies', 'morning-meeting'],
    break: ['nutrition', 'rest', 'hygiene', 'safety', 'routine'],
    other: ['therapy', 'support', 'choice', 'transition', 'resource'],
    video: ['seasonal', 'weather', 'educational', 'calming', 'motivational'],
    activity: ['hands-on', 'group', 'individual', 'discussion', 'practice'],
    document: ['lesson-plan', 'worksheet', 'standard', 'resource', 'template'] // NEW
  };

  useEffect(() => {
    if (content) {
      setFormData({
        name: content.name,
        icon: content.icon,
        category: content.category,
        contentType: content.contentType,
        defaultDuration: content.defaultDuration,
        description: content.description,
        tags: [...content.tags],
        videoUrl: content.videoData?.videoUrl || '',
        googleDriveUrl: content.documentData?.googleDriveUrl || '', // NEW
        documentType: content.documentData?.documentType || 'resource', // NEW
        notes: content.videoData?.notes || content.documentData?.notes || '',
        materials: content.materials || [],
        instructions: content.instructions || '',
      });
    } else {
      setFormData({
        name: '',
        icon: '📝',
        category: 'academic',
        contentType: 'activity',
        defaultDuration: 30,
        description: '',
        tags: [],
        videoUrl: '',
        googleDriveUrl: '', // NEW
        documentType: 'resource', // NEW
        notes: '',
        materials: [],
        instructions: '',
      });
    }
  }, [content, isOpen]);

  const handleSave = () => {
    if (!formData.name.trim()) return;
    if (formData.contentType === 'video' && !formData.videoUrl.trim()) return;
    if (formData.contentType === 'document' && !formData.googleDriveUrl.trim()) return; // NEW

    const contentData: LibraryContent = {
      id: content?.id || generateUniqueId('content'),
      name: formData.name.trim(),
      icon: formData.icon,
      category: formData.category,
      contentType: formData.contentType,
      defaultDuration: formData.defaultDuration,
      description: formData.description.trim(),
      tags: formData.tags,
      isDeletable: true, // Custom content is always deletable
      isCustom: true,
      createdAt: content?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Video-specific data
      ...(formData.contentType === 'video' && {
        videoData: {
          videoUrl: formData.videoUrl.trim(),
          notes: formData.notes.trim() || undefined,
        }
      }),
      
      // Document-specific data (NEW)
      ...(formData.contentType === 'document' && {
        documentData: {
          googleDriveUrl: formData.googleDriveUrl.trim(),
          documentType: formData.documentType,
          notes: formData.notes.trim() || undefined,
        }
      }),
      
      // Activity-specific data  
      ...(formData.contentType === 'activity' && {
        materials: formData.materials.filter(m => m.trim()),
        instructions: formData.instructions.trim() || undefined,
      })
    };

    onSave(contentData);
  };

  const addTag = (tag?: string) => {
    const tagToAdd = tag || newTag.trim();
    if (tagToAdd && !formData.tags.includes(tagToAdd)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagToAdd]
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

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, '']
    }));
  };

  const updateMaterial = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((m, i) => i === index ? value : m)
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  const availableTags = [
    ...tagSuggestions[formData.category],
    ...tagSuggestions[formData.contentType]
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content content-modal">
        <div className="modal-header">
          <h3>{content ? 'Edit Content' : `Create ${formData.contentType === 'video' ? 'Video' : 'Activity'}`}</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          {/* Content Type Selection */}
          <div className="form-group">
            <label>Content Type *</label>
            <div className="content-type-selector">
              <label className={`content-type-option ${formData.contentType === 'activity' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="contentType"
                  value="activity"
                  checked={formData.contentType === 'activity'}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value as any }))}
                />
                <div className="content-type-card">
                  <div className="content-type-icon">📚</div>
                  <div className="content-type-label">Activity</div>
                  <div className="content-type-desc">Classroom activity or lesson</div>
                </div>
              </label>
              <label className={`content-type-option ${formData.contentType === 'video' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="contentType"
                  value="video"
                  checked={formData.contentType === 'video'}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value as any }))}
                />
                <div className="content-type-card">
                  <div className="content-type-icon">🎬</div>
                  <div className="content-type-label">Video</div>
                  <div className="content-type-desc">Educational video content</div>
                </div>
              </label>
              <label className={`content-type-option ${formData.contentType === 'document' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="contentType"
                  value="document"
                  checked={formData.contentType === 'document'}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value as any }))}
                />
                <div className="content-type-card">
                  <div className="content-type-icon">📄</div>
                  <div className="content-type-label">Document</div>
                  <div className="content-type-desc">Google Drive link or resource</div>
                </div>
              </label>
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label>{formData.contentType === 'video' ? 'Video Title' : 'Activity Name'} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={formData.contentType === 'video' ? "e.g., Weather Song for Kids" : "e.g., Morning Reading Circle"}
              required
            />
          </div>

          {/* Video URL (for videos only) */}
          {formData.contentType === 'video' && (
            <div className="form-group">
              <label>Video URL *</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <small className="form-help">YouTube, Vimeo, or other video platform links</small>
            </div>
          )}

          {/* NEW: Google Drive URL (for documents only) */}
          {formData.contentType === 'document' && (
            <>
              <div className="form-group">
                <label>Google Drive URL *</label>
                <input
                  type="url"
                  value={formData.googleDriveUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, googleDriveUrl: e.target.value }))}
                  placeholder="https://docs.google.com/document/d/..."
                  required
                />
                <small className="form-help">Google Docs, Sheets, Drive folder, or other Google Drive links</small>
              </div>
              
              <div className="form-group">
                <label>Document Type</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value as any }))}
                >
                  <option value="lesson-plan">Lesson Plan</option>
                  <option value="worksheet">Worksheet</option>
                  <option value="standard">Educational Standard</option>
                  <option value="resource">Teaching Resource</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          {/* Icon and Category Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Icon</label>
              <div className="icon-selection" style={{ position: 'relative' }}>
                <div className="current-icon">
                  <span className="emoji-preview">{formData.icon}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="icon-button"
                >
                  Choose Icon
                </button>
                {showEmojiPicker && (
                  <div className="emoji-picker" style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    right: '0',
                    background: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    <div className="emoji-category">
                      <h4>For {formData.category}</h4>
                      <div className="emoji-grid">
                        {iconLibrary[formData.category].map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            className="emoji-option"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, icon: emoji }));
                              setShowEmojiPicker(false);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="emoji-category">
                      <h4>General</h4>
                      <div className="emoji-grid">
                        {iconLibrary.general.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            className="emoji-option"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, icon: emoji }));
                              setShowEmojiPicker(false);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
              >
                <option value="academic">Academic</option>
                <option value="break">Break</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duration (minutes)</label>
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
              placeholder={formData.contentType === 'video' ? 
                "Brief description of the video content..." : 
                "Brief description of the activity..."}
              rows={3}
            />
          </div>

          {/* Video Notes (for videos only) */}
          {formData.contentType === 'video' && (
            <div className="form-group">
              <label>Teacher Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes about when/how to use this video..."
                rows={2}
              />
            </div>
          )}

          {/* Materials (for activities only) */}
          {formData.contentType === 'activity' && (
            <div className="form-group">
              <label>Materials</label>
              <div className="materials-list">
                {formData.materials.map((material, index) => (
                  <div key={index} className="material-input">
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => updateMaterial(index, e.target.value)}
                      placeholder="e.g., pencils, worksheets, timer"
                    />
                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="remove-material"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addMaterial} className="add-material">
                  + Add Material
                </button>
              </div>
            </div>
          )}

          {/* Instructions (for activities only) */}
          {formData.contentType === 'activity' && (
            <div className="form-group">
              <label>Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Step-by-step instructions for the activity..."
                rows={4}
              />
            </div>
          )}

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <div className="tags-section">
              {availableTags.length > 0 && (
                <div className="suggested-tags">
                  <small>Suggested tags:</small>
                  <div className="tag-suggestions">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className={`tag-suggestion ${formData.tags.includes(tag) ? 'added' : ''}`}
                        disabled={formData.tags.includes(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
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
                    placeholder="Add custom tag..."
                  />
                  <button type="button" onClick={() => addTag()} disabled={!newTag.trim()}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={!formData.name.trim() || (formData.contentType === 'video' && !formData.videoUrl.trim())}
          >
            {content ? 'Save Changes' : `Create ${formData.contentType === 'video' ? 'Video' : 'Activity'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

const SimplifiedActivityLibrary: React.FC<ActivityLibraryProps> = ({ isActive }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'academic' | 'break' | 'other'>('all');
  const [selectedContentType, setSelectedContentType] = useState<'all' | 'activity' | 'video' | 'document'>('all');
  const [customContent, setCustomContent] = useState<LibraryContent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<LibraryContent | undefined>();
  const [addingContent, setAddingContent] = useState<Set<string>>(new Set());

  // Base content library (built-in, non-deletable items)
  const baseContent: LibraryContent[] = [
    // Academic
    { id: 'base-ela', name: 'ELA', icon: '📚', category: 'academic', contentType: 'activity', defaultDuration: 30, description: 'English Language Arts instruction', tags: ['reading', 'writing', 'language'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
    { id: 'base-science', name: 'Science', icon: '🔬', category: 'academic', contentType: 'activity', defaultDuration: 30, description: 'Science exploration and experiments', tags: ['experiments', 'discovery', 'STEM'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
    { id: 'base-math', name: 'Math', icon: '🔢', category: 'academic', contentType: 'activity', defaultDuration: 30, description: 'Mathematics instruction and practice', tags: ['numbers', 'calculation', 'problem-solving'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
    { id: 'base-social-studies', name: 'Social Studies', icon: '🗺️', category: 'academic', contentType: 'activity', defaultDuration: 30, description: 'Geography, history, and social concepts', tags: ['geography', 'history', 'community'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
    
    // Break
    { id: 'base-lunch', name: 'Lunch', icon: '🍽️', category: 'break', contentType: 'activity', defaultDuration: 30, description: 'Lunch break and social time', tags: ['food', 'social', 'nutrition'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
    { id: 'base-bathroom', name: 'Bathroom Break', icon: '🚻', category: 'break', contentType: 'activity', defaultDuration: 5, description: 'Bathroom and hygiene break', tags: ['hygiene', 'self-care', 'routine'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
    { id: 'base-snack', name: 'Snack Time', icon: '🍎', category: 'break', contentType: 'activity', defaultDuration: 10, description: 'Snack time and nutrition break', tags: ['food', 'nutrition', 'energy'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
    
    // Other
    { id: 'base-transition', name: 'Transition', icon: '🔄', category: 'other', contentType: 'activity', defaultDuration: 5, description: 'Movement between activities', tags: ['transition', 'routine', 'movement'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
    { id: 'base-resource', name: 'Resource', icon: '🎯', category: 'other', contentType: 'activity', defaultDuration: 30, description: 'Special education support time', tags: ['support', 'individualized', 'academic'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
    { id: 'base-choice', name: 'Choice Time', icon: '🎮', category: 'other', contentType: 'activity', defaultDuration: 20, description: 'Student choice activities', tags: ['choice', 'student-selected', 'flexible'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
    { id: 'base-safety', name: 'Safety Drill', icon: '🛡️', category: 'other', contentType: 'activity', defaultDuration: 10, description: 'Emergency preparedness and safety practice', tags: ['safety', 'drill', 'emergency'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
    { id: 'morning-meeting-builtin', name: 'Morning Meeting', icon: '🌅', category: 'other', contentType: 'activity', defaultDuration: 30, description: 'Daily morning meeting with welcome, attendance, behavior commitments, and learning activities', tags: ['morning', 'routine', 'community', 'daily'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString(), materials: ['Morning Meeting Hub configuration'], instructions: 'Automated morning meeting flow guided by Morning Meeting Hub settings' },
  ];

  // Load custom content from UnifiedDataService
  useEffect(() => {
    loadCustomContent();
  }, []);

  const loadCustomContent = () => {
    try {
      const unifiedActivities = UnifiedDataService.getAllActivities();
      
      const customContentFromUnified: LibraryContent[] = unifiedActivities
        .filter(activity => activity.isCustom)
        .map((activity: UnifiedActivity): LibraryContent => ({
          id: activity.id,
          name: activity.name,
          icon: (activity as any).icon || '📝',
          category: (activity as any).category || 'academic',
          contentType: (activity as any).contentType || 'activity',
          defaultDuration: activity.duration || 30,
          description: activity.description || '',
          tags: (activity as any).tags || [],
          isDeletable: true,
          isCustom: true,
          videoData: (activity as any).videoData,
          materials: activity.materials,
          instructions: activity.instructions,
          createdAt: activity.dateCreated,
          updatedAt: activity.dateCreated,
        }));

      setCustomContent(customContentFromUnified);
    } catch (error) {
      console.error('Error loading custom content:', error);
    }
  };

  // Save custom content to UnifiedDataService
  const saveCustomContent = (contentList: LibraryContent[]) => {
    contentList.forEach(content => {
      // Create the base UnifiedActivity object with only properties that exist in the interface
      const unifiedActivity: Partial<UnifiedActivity> = {
        name: content.name,
        category: content.category,
        description: content.description,
        duration: content.defaultDuration,
        materials: content.materials || [],
        instructions: content.instructions || '',
        isCustom: content.isCustom,
      };
      
      // Add extra properties that don't exist in UnifiedActivity interface
      // These will be stored but TypeScript won't complain
      const activityWithExtras = {
        ...unifiedActivity,
        icon: content.icon,
        tags: content.tags,
        contentType: content.contentType,
        videoData: content.videoData,
      };
      
      const existingActivity = UnifiedDataService.getActivity(content.id);
      if (existingActivity) {
        UnifiedDataService.updateActivity(content.id, activityWithExtras as any);
      } else {
        UnifiedDataService.addActivity(activityWithExtras as any);
      }
    });
    
    setCustomContent(contentList);
    
    // Notify Schedule Builder of changes
    window.dispatchEvent(new CustomEvent('activitiesUpdated', {
      detail: { 
        activities: [...baseContent, ...contentList],
        source: 'ActivityLibrary',
        timestamp: Date.now(),
      }
    }));
  };

  // All content (base + custom)
  const allContent = useMemo(() => {
    return [...baseContent, ...customContent];
  }, [customContent]);

  // Filter content based on search, category, and content type
  const filteredContent = useMemo(() => {
    return allContent.filter(content => {
      const matchesSearch = content.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
      const matchesContentType = selectedContentType === 'all' || content.contentType === selectedContentType;
      
      return matchesSearch && matchesCategory && matchesContentType;
    });
  }, [searchTerm, selectedCategory, selectedContentType, allContent]);

  // Get counts for filters
  const getCategoryCount = (category: string) => {
    if (category === 'all') return allContent.length;
    return allContent.filter(content => content.category === category).length;
  };

  const getContentTypeCount = (type: string) => {
    if (type === 'all') return allContent.length;
    return allContent.filter(content => content.contentType === type).length;
  };

  // Handle adding content to schedule
  const handleAddToSchedule = async (content: LibraryContent) => {
    if (addingContent.has(content.id)) return;

    setAddingContent(prev => new Set([...prev, content.id]));

    try {
      const instanceId = generateUniqueId(`${content.id}`);
      
      const contentToAdd = {
        id: instanceId,
        originalId: content.id,
        name: content.name,
        icon: content.icon,
        emoji: content.icon,
        duration: content.defaultDuration,
        category: content.category,
        contentType: content.contentType,
        description: content.description || '',
        materials: content.materials || [],
        instructions: content.instructions || '',
        isCustom: content.isCustom,
        tags: content.tags || [],
        createdAt: new Date().toISOString(),
        addedFromLibrary: true,
        videoData: content.videoData,
      };

      const existingActivities = JSON.parse(localStorage.getItem('available_activities') || '[]');
      const updatedActivities = [...existingActivities, contentToAdd];
      localStorage.setItem('available_activities', JSON.stringify(updatedActivities));

      window.dispatchEvent(new CustomEvent('activityAdded', {
        detail: { 
          activity: contentToAdd,
          source: 'ActivityLibrary',
          timestamp: Date.now()
        }
      }));

      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Content "${content.name}" added to Schedule Builder`);
      
    } catch (error) {
      console.error('Error adding content:', error);
      alert(`Error adding "${content.name}". Please try again.`);
    } finally {
      setAddingContent(prev => {
        const newSet = new Set(prev);
        newSet.delete(content.id);
        return newSet;
      });
    }
  };

  // Handle content editing
  const handleEditContent = (content: LibraryContent) => {
    if (!content.isDeletable) {
      alert('Built-in content cannot be edited. You can create a custom version instead.');
      return;
    }
    setEditingContent(content);
    setModalOpen(true);
  };

  // Handle content saving
  const handleSaveContent = (content: LibraryContent) => {
    let updatedContent;
    
    if (editingContent && customContent.find(c => c.id === editingContent.id)) {
      updatedContent = customContent.map(c => 
        c.id === editingContent.id ? content : c
      );
    } else {
      updatedContent = [...customContent, content];
    }

    saveCustomContent(updatedContent);
    setModalOpen(false);
    setEditingContent(undefined);
  };

  // Handle content deletion
  const handleDeleteContent = (content: LibraryContent) => {
    if (!content.isDeletable) {
      alert('Built-in content cannot be deleted.');
      return;
    }

    const deleteConfirmed = window.confirm(
      `Are you sure you want to delete "${content.name}"?\n\nThis action cannot be undone.`
    );

    if (deleteConfirmed) {
      try {
        UnifiedDataService.deleteActivity(content.id);
        const updatedContent = customContent.filter(c => c.id !== content.id);
        setCustomContent(updatedContent);
        
        window.dispatchEvent(new CustomEvent('activitiesUpdated', {
          detail: { 
            activities: [...baseContent, ...updatedContent],
            source: 'ActivityLibrary',
            timestamp: Date.now(),
            action: 'delete',
            deletedActivity: content
          }
        }));
        
      } catch (error) {
        console.error('Error deleting content:', error);
        alert(`Error deleting "${content.name}". Please try again.`);
      }
    }
  };

  // Handle content duplication
  const handleDuplicateContent = (content: LibraryContent) => {
    const duplicate: LibraryContent = {
      ...content,
      id: generateUniqueId('content'),
      name: `${content.name} (Copy)`,
      isDeletable: true,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    
    setEditingContent(duplicate);
    setModalOpen(true);
  };

  if (!isActive) return null;

  return (
    <div className="simplified-activity-library">
      <div className="library-header">
        <h2 className="component-title">📚 Activity & Video Library</h2>
        <p className="component-subtitle">
          Manage your classroom activities and educational videos
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="library-controls">
        <div className="search-section">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search activities, videos, descriptions, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="filters-and-actions">
          <div className="filter-section">
            {/* Category Filters - Top Row */}
            <div className="filter-row">
              <button
                onClick={() => setSelectedCategory('academic')}
                className={`category-button ${selectedCategory === 'academic' ? 'active' : ''}`}
              >
                📚 Academic ({getCategoryCount('academic')})
              </button>
              <button
                onClick={() => setSelectedCategory('break')}
                className={`category-button ${selectedCategory === 'break' ? 'active' : ''}`}
              >
                🍽️ Break ({getCategoryCount('break')})
              </button>
              <button
                onClick={() => setSelectedCategory('other')}
                className={`category-button ${selectedCategory === 'other' ? 'active' : ''}`}
              >
                🎯 Other ({getCategoryCount('other')})
              </button>
            </div>

            {/* Content Type Filters - Bottom Row */}
            <div className="filter-row">
              <button
                onClick={() => setSelectedContentType('all')}
                className={`content-type-button ${selectedContentType === 'all' ? 'active' : ''}`}
              >
                All ({getContentTypeCount('all')})
              </button>
              <button
                onClick={() => setSelectedContentType('video')}
                className={`content-type-button ${selectedContentType === 'video' ? 'active' : ''}`}
              >
                🎬 Video ({getContentTypeCount('video')})
              </button>
              <button
                onClick={() => setSelectedContentType('document')}
                className={`content-type-button ${selectedContentType === 'document' ? 'active' : ''}`}
              >
                📄 Documents ({getContentTypeCount('document')})
              </button>
              <button
                onClick={() => setSelectedContentType('activity')}
                className={`content-type-button ${selectedContentType === 'activity' ? 'active' : ''}`}
              >
                📚 Activities ({getContentTypeCount('activity')})
              </button>
            </div>
          </div>

          {/* Create Buttons - Right Side */}
          <div className="create-actions">
            <button 
              className="create-button activity"
              onClick={() => {
                setEditingContent(undefined);
                setModalOpen(true);
              }}
            >
              <span className="create-icon">📚</span>
              Create Custom Activity
            </button>
            <button 
              className="create-button video"
              onClick={() => {
                setEditingContent(undefined);
                setModalOpen(true);
              }}
            >
              <span className="create-icon">📥</span>
              Download Video/Docs
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        Showing {filteredContent.length} of {allContent.length} items
        {searchTerm && <span className="search-summary"> for "{searchTerm}"</span>}
        {selectedCategory !== 'all' && <span className="filter-summary"> in {selectedCategory}</span>}
        {selectedContentType !== 'all' && <span className="filter-summary"> • {selectedContentType}s only</span>}
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {filteredContent.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No content found</h3>
            <p>Try adjusting your search terms or filters</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="reset-search">
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredContent.map(content => (
            <div key={content.id} className={`content-item ${content.contentType}`} data-category={content.category}>
              <div className="content-header">
                <div className="content-icon">
                  {content.icon}
                  {content.contentType === 'video' && (
                    <div className="video-indicator">🎬</div>
                  )}
                </div>
                <div className="content-meta">
                  <div className="content-badges">
                    <span className={`category-badge ${content.category}`}>
                      {content.category}
                    </span>
                    <span className={`type-badge ${content.contentType}`}>
                      {content.contentType}
                    </span>
                    {!content.isDeletable && (
                      <span className="built-in-badge">Built-in</span>
                    )}
                    {content.isCustom && (
                      <span className="custom-badge">Custom</span>
                    )}
                  </div>
                  <div className="content-duration">{content.defaultDuration}min</div>
                </div>
              </div>

              <div className="content-body">
                <h3 className="content-title">{content.name}</h3>
                <p className="content-description">{content.description}</p>
                
                {/* Video-specific display */}
                {content.contentType === 'video' && content.videoData && (
                  <div className="video-details">
                    <div className="video-url">
                      <span className="video-label">🔗</span>
                      <a href={content.videoData.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                        View Video
                      </a>
                    </div>
                    {content.videoData.notes && (
                      <div className="video-notes">
                        <strong>Notes:</strong> {content.videoData.notes}
                      </div>
                    )}
                  </div>
                )}

                {/* NEW Document-specific display */}
                {content.contentType === 'document' && content.documentData && (
                  <div className="document-details">
                    <div className="document-url">
                      <span className="document-label">🔗</span>
                      <a href={content.documentData.googleDriveUrl} target="_blank" rel="noopener noreferrer" className="document-link">
                        Open Document
                      </a>
                    </div>
                    <div className="document-type">
                      <strong>Type:</strong> {content.documentData.documentType.replace('-', ' ')}
                    </div>
                    {content.documentData.notes && (
                      <div className="document-notes">
                        <strong>Notes:</strong> {content.documentData.notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Add video selection checkboxes for videos */}
                {content.contentType === 'video' && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(102, 126, 234, 0.3)'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 0.5rem 0', 
                      fontSize: '0.9rem', 
                      color: '#667eea',
                      fontWeight: '600'
                    }}>
                      📺 Smartboard Display Options
                    </h4>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '0.5rem' 
                    }}>
                      <DisplayVideoCheckbox
                        videoId={content.id}
                        slot="move1"
                        label="🏃‍♀️ Move Video 1"
                        video={content}
                      />
                      <DisplayVideoCheckbox
                        videoId={content.id}
                        slot="lesson1"
                        label="📚 Lesson Video 1"
                        video={content}
                      />
                      <DisplayVideoCheckbox
                        videoId={content.id}
                        slot="move2"
                        label="🤸‍♂️ Move Video 2"
                        video={content}
                      />
                      <DisplayVideoCheckbox
                        videoId={content.id}
                        slot="lesson2"
                        label="🎓 Lesson Video 2"
                        video={content}
                      />
                    </div>
                  </div>
                )}

                {/* Activity-specific display */}
                {content.contentType === 'activity' && content.materials && content.materials.length > 0 && (
                  <div className="activity-materials">
                    <strong>Materials:</strong> {content.materials.join(', ')}
                  </div>
                )}

                {/* Tags */}
                {content.tags.length > 0 && (
                  <div className="content-tags">
                    {content.tags.map(tag => (
                      <span key={tag} className="content-tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="content-actions">
                <button 
                  className={`action-button primary ${addingContent.has(content.id) ? 'adding' : ''}`}
                  title="Add to schedule"
                  onClick={() => handleAddToSchedule(content)}
                  disabled={addingContent.has(content.id)}
                >
                  {addingContent.has(content.id) ? (
                    <>
                      <span className="spinner">⏳</span> Adding...
                    </>
                  ) : (
                    '+ Add to Schedule'
                  )}
                </button>
                
                <div className="secondary-actions">
                  <button 
                    className="action-button secondary" 
                    title="Edit content"
                    onClick={() => handleEditContent(content)}
                    disabled={!content.isDeletable}
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-button secondary" 
                    title="Duplicate content"
                    onClick={() => handleDuplicateContent(content)}
                  >
                    📋
                  </button>
                  {content.isDeletable && (
                    <button 
                      className="action-button danger" 
                      title="Delete content"
                      onClick={() => handleDeleteContent(content)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>


      {/* Content Modal */}
      <ContentModal
        content={editingContent}
        onSave={handleSaveContent}
        onCancel={() => {
          setModalOpen(false);
          setEditingContent(undefined);
        }}
        isOpen={modalOpen}
      />

      <style>{`
        .simplified-activity-library {
          padding: 1.5rem;
          background: white;
          min-height: calc(100vh - 80px);
        }

        .library-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .component-title {
          font-size: 2rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 0.5rem 0;
        }

        .component-subtitle {
          color: #718096;
          font-size: 1.1rem;
          margin: 0;
        }

        .library-controls {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          border: 1px solid #e2e8f0;
        }

        .search-section {
          margin-bottom: 1.5rem;
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
          color: #a0aec0;
          font-size: 1rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid #e2e8f0;
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
          color: #a0aec0;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
        }

        .filters-and-actions {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }

        .filter-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .create-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 200px;
        }

        .create-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .create-button.activity {
          background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
          color: white;
        }

        .create-button.video {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .create-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .create-icon {
          font-size: 1rem;
        }

        .category-button,
        .content-type-button {
          padding: 0.5rem 1rem;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .category-button:hover,
        .content-type-button:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .category-button.active,
        .content-type-button.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .results-summary {
          margin-bottom: 1rem;
          color: #718096;
          font-size: 0.9rem;
          text-align: center;
        }

        .search-summary,
        .filter-summary {
          font-weight: 500;
          color: #4a5568;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .content-item {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .content-item:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          transform: translateY(-2px);
        }

        .content-item.video {
          border-left: 4px solid #e53e3e;
        }

        .content-item.activity {
          border-left: 4px solid #38a169;
        }

        .content-item.document {
          border-left: 4px solid #805ad5;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .content-icon {
          font-size: 3rem;
          position: relative;
          width: 4rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .video-indicator {
          position: absolute;
          bottom: -5px;
          right: -5px;
          font-size: 1rem;
          background: white;
          border-radius: 50%;
          padding: 2px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .content-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .content-badges {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          align-items: flex-end;
        }

        .category-badge,
        .type-badge,
        .built-in-badge,
        .custom-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-badge.academic {
          background: #bee3f8;
          color: #2b6cb0;
        }

        .category-badge.break {
          background: #fed7d7;
          color: #c53030;
        }

        .category-badge.other {
          background: #e6fffa;
          color: #2c7a7b;
        }

        .type-badge.activity {
          background: #c6f6d5;
          color: #276749;
        }

        .type-badge.video {
          background: #fbb6ce;
          color: #97266d;
        }

        .type-badge.document {
          background: #e9d8fd;
          color: #553c9a;
        }

        .built-in-badge {
          background: #edf2f7;
          color: #4a5568;
        }

        .custom-badge {
          background: #d6f5d6;
          color: #22543d;
        }

        .content-duration {
          font-size: 0.875rem;
          color: #718096;
          font-weight: 500;
        }

        .content-body {
          flex: 1;
        }

        .content-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #2d3748;
        }

        .content-description {
          color: #718096;
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }

        .video-details {
          background: rgba(229, 62, 62, 0.05);
          border-radius: 8px;
          padding: 0.75rem;
          margin: 0.5rem 0;
          border-left: 3px solid #e53e3e;
        }

        .video-url {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .video-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }

        .video-link:hover {
          text-decoration: underline;
        }

        .video-notes {
          font-size: 0.9rem;
          color: #4a5568;
          font-style: italic;
        }

        .activity-materials {
          background: rgba(56, 161, 105, 0.05);
          border-radius: 8px;
          padding: 0.75rem;
          margin: 0.5rem 0;
          border-left: 3px solid #38a169;
          font-size: 0.9rem;
          color: #4a5568;
        }

        .document-details {
          background: rgba(128, 90, 213, 0.05);
          border-radius: 8px;
          padding: 0.75rem;
          margin: 0.5rem 0;
          border-left: 3px solid #805ad5;
        }

        .document-url {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .document-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }

        .document-link:hover {
          text-decoration: underline;
        }

        .document-type {
          font-size: 0.9rem;
          color: #4a5568;
          margin-bottom: 0.5rem;
        }

        .document-notes {
          font-size: 0.9rem;
          color: #4a5568;
          font-style: italic;
        }

        .content-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-top: 0.5rem;
        }

        .content-tag {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 0.125rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .content-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .secondary-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .action-button {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
        }

        .action-button.primary {
          background: #667eea;
          color: white;
          border-color: #667eea;
          width: 100%;
        }

        .action-button.primary:hover:not(:disabled) {
          background: #5a67d8;
          border-color: #5a67d8;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }

        .action-button.primary.adding {
          background: #38a169;
          border-color: #38a169;
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
          color: #718096;
          flex: 1;
        }

        .action-button.secondary:hover:not(:disabled) {
          background: #f7fafc;
          border-color: #cbd5e0;
        }

        .action-button.secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-button.danger {
          background: white;
          color: #e53e3e;
          border-color: #e53e3e;
          flex: 1;
        }

        .action-button.danger:hover {
          background: #e53e3e;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(229, 62, 62, 0.3);
        }

        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem 1rem;
          color: #718096;
        }

        .no-results-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-results h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #4a5568;
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

        .add-content-section {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #e2e8f0;
        }

        .add-content-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .add-content-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .add-content-button.activity {
          background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
          color: white;
        }

        .add-content-button.video {
          background: linear-gradient(135deg, #e53e3e 0%, #fc8181 100%);
          color: white;
        }

        .add-content-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
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
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .content-modal {
          max-width: 800px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.5rem;
          color: #2d3748;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #718096;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }

        .close-button:hover {
          background: #f7fafc;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2d3748;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
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

        .form-help {
          color: #718096;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .content-type-selector {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }

        .content-type-option {
          cursor: pointer;
        }

        .content-type-option input {
          display: none;
        }

        .content-type-card {
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          transition: all 0.2s ease;
        }

        .content-type-option.selected .content-type-card {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .content-type-card:hover {
          border-color: #cbd5e0;
        }

        .content-type-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .content-type-label {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.25rem;
        }

        .content-type-desc {
          font-size: 0.8rem;
          color: #718096;
        }

        .icon-selection {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .current-icon {
          width: 3rem;
          height: 3rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7fafc;
        }

        .emoji-preview {
          font-size: 2rem;
        }

        .icon-button {
          padding: 0.5rem 1rem;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .icon-button:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .emoji-picker {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10;
          max-height: 300px;
          overflow-y: auto;
        }

        .emoji-category h4 {
          margin: 0 0 0.5rem 0;
          color: #4a5568;
          font-size: 0.9rem;
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 0.25rem;
          margin-bottom: 1rem;
        }

        .emoji-option {
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.2rem;
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

        .materials-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .material-input {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .material-input input {
          flex: 1;
        }

        .remove-material {
          background: #e53e3e;
          color: white;
          border: none;
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: background-color 0.2s ease;
        }

        .remove-material:hover {
          background: #c53030;
        }

        .add-material {
          padding: 0.5rem 1rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .add-material:hover {
          background: #5a67d8;
        }

        .tags-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .suggested-tags {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .suggested-tags small {
          color: #718096;
          font-weight: 500;
        }

        .tag-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .tag-suggestion {
          padding: 0.25rem 0.5rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }

        .tag-suggestion:hover:not(:disabled) {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .tag-suggestion.added {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .tag-suggestion:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tags-input {
          border: 2px solid #e2e8f0;
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
          background: #e2e8f0;
          color: #a0aec0;
          cursor: not-allowed;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
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
          background: #f7fafc;
          color: #718096;
        }

        .cancel-btn:hover {
          background: #edf2f7;
        }

        .save-btn {
          background: #667eea;
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          background: #5a67d8;
        }

        .save-btn:disabled {
          background: #e2e8f0;
          color: #a0aec0;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .simplified-activity-library {
            padding: 1rem;
          }

          .library-controls {
            padding: 1rem;
          }

          .filters-and-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .create-actions {
            min-width: auto;
            flex-direction: row;
            justify-content: center;
          }

          .filter-row {
            justify-content: center;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .content-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .content-meta {
            align-items: center;
          }

          .secondary-actions {
            flex-wrap: wrap;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .content-type-selector {
            grid-template-columns: 1fr;
          }

          .emoji-grid {
            grid-template-columns: repeat(6, 1fr);
          }

          .modal-content {
            margin: 0.5rem;
            max-width: calc(100vw - 1rem);
          }

          .tag-suggestions {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .filter-row {
            flex-direction: column;
          }

          .create-actions {
            flex-direction: column;
          }

          .category-button,
          .content-type-button {
            justify-content: center;
          }

          .search-input {
            font-size: 16px; /* Prevents zoom on iOS */
          }

          .content-title {
            font-size: 1.1rem;
          }

          .content-badges {
            align-items: center;
          }

          .emoji-grid {
            grid-template-columns: repeat(5, 1fr);
          }

          .material-input {
            flex-direction: column;
            gap: 0.25rem;
          }

          .remove-material {
            align-self: flex-end;
          }
        }

        /* Special category highlighting */
        .content-item[data-category="academic"] {
          border-left-color: #2b6cb0;
        }

        .content-item[data-category="break"] {
          border-left-color: #c53030;
        }

        .content-item[data-category="other"] {
          border-left-color: #2c7a7b;
        }

        /* Video-specific animations */
        .content-item.video .video-indicator {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        /* Loading states */
        .content-item .action-button.adding {
          position: relative;
          overflow: hidden;
        }

        .content-item .action-button.adding::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        /* Focus styles for accessibility */
        .category-button:focus,
        .content-type-button:focus,
        .action-button:focus,
        .emoji-option:focus,
        .tag-suggestion:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .content-item {
            border-width: 3px;
          }
          
          .content-badges > * {
            border: 1px solid currentColor;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .content-item,
          .action-button,
          .emoji-option,
          .category-button,
          .content-type-button {
            transition: none;
          }
          
          .video-indicator,
          .spinner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SimplifiedActivityLibrary;

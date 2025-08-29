import React, { useState, useMemo, useEffect } from 'react';
import UnifiedDataService, { UnifiedActivity } from '../../services/unifiedDataService';

// DisplayVideoCheckbox Component
interface DisplayVideoCheckboxProps {
  videoId: string;
  slot: 'move1' | 'move2' | 'lesson1' | 'lesson2';
  label: string;
  video: any;
}

const DisplayVideoCheckbox: React.FC<DisplayVideoCheckboxProps> = ({ 
  videoId, 
  slot, 
  label, 
  video 
}) => {
  const [isSelected, setIsSelected] = useState(false);

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
        videos[slot] = {
          id: videoId,
          url: video.videoData?.videoUrl || video.url,
          title: video.name
        };
      } else {
        delete videos[slot];
      }
      
      localStorage.setItem('selectedDisplayVideos', JSON.stringify(videos));
      setIsSelected(checked);
      
      if (checked) {
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
const generateUniqueId = (prefix: string = 'id'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const counter = Math.floor(Math.random() * 1000).toString(36);
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
  contentType: 'activity' | 'video' | 'document';
  defaultDuration: number;
  description: string;
  tags: string[];
  isDeletable: boolean;
  isCustom: boolean;
  videoData?: {
    videoUrl: string;
    notes?: string;
  };
  documentData?: {
    googleDriveUrl: string;
    documentType: 'lesson-plan' | 'worksheet' | 'standard' | 'resource' | 'other';
    notes?: string;
  };
  materials?: string[];
  instructions?: string;
  createdAt: string;
  updatedAt?: string;
}

// Base content library
const baseContent: LibraryContent[] = [
  { id: 'base-ela', name: 'ELA', icon: '📚', category: 'academic', contentType: 'activity', defaultDuration: 30, description: 'English Language Arts instruction', tags: ['reading', 'writing', 'language'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
  { id: 'base-science', name: 'Science', icon: '🔬', category: 'academic', contentType: 'activity', defaultDuration: 30, description: 'Science exploration and experiments', tags: ['experiments', 'discovery', 'STEM'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
  { id: 'base-math', name: 'Math', icon: '🔢', category: 'academic', contentType: 'activity', defaultDuration: 30, description: 'Mathematics instruction and practice', tags: ['numbers', 'calculation', 'problem-solving'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
  { id: 'base-social-studies', name: 'Social Studies', icon: '🗺️', category: 'academic', contentType: 'activity', defaultDuration: 30, description: 'Geography, history, and social concepts', tags: ['geography', 'history', 'community'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
  { id: 'base-lunch', name: 'Lunch', icon: '🍽️', category: 'break', contentType: 'activity', defaultDuration: 30, description: 'Lunch break and social time', tags: ['food', 'social', 'nutrition'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
  { id: 'base-bathroom', name: 'Bathroom Break', icon: '🚻', category: 'break', contentType: 'activity', defaultDuration: 5, description: 'Bathroom and hygiene break', tags: ['hygiene', 'self-care', 'routine'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
  { id: 'base-snack', name: 'Snack Time', icon: '🍎', category: 'break', contentType: 'activity', defaultDuration: 10, description: 'Snack time and nutrition break', tags: ['food', 'nutrition', 'energy'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
  { id: 'base-transition', name: 'Transition', icon: '🔄', category: 'other', contentType: 'activity', defaultDuration: 5, description: 'Movement between activities', tags: ['transition', 'routine', 'movement'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
  { id: 'base-resource', name: 'Resource', icon: '🎯', category: 'other', contentType: 'activity', defaultDuration: 30, description: 'Special education support time', tags: ['support', 'individualized', 'academic'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
  { id: 'base-choice', name: 'Choice Time', icon: '🎮', category: 'other', contentType: 'activity', defaultDuration: 20, description: 'Student choice activities', tags: ['choice', 'student-selected', 'flexible'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString() },
  { id: 'morning-meeting-builtin', name: 'Morning Meeting', icon: '🌅', category: 'other', contentType: 'activity', defaultDuration: 30, description: 'Daily morning meeting with welcome, attendance, behavior commitments, and learning activities', tags: ['morning', 'routine', 'community', 'daily'], isDeletable: false, isCustom: false, createdAt: new Date().toISOString(), materials: ['Morning Meeting Hub configuration'], instructions: 'Automated morning meeting flow guided by Morning Meeting Hub settings' },
];

// Content creation modal component
const ContentModal: React.FC<{
  content?: LibraryContent;
  onSave: (content: LibraryContent) => void;
  onCancel: () => void;
  isOpen: boolean;
}> = ({ content, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: '📝',
    category: 'academic' as 'academic' | 'break' | 'other',
    contentType: 'activity' as 'activity' | 'video' | 'document',
    defaultDuration: 30,
    description: '',
    tags: [] as string[],
    videoUrl: '',
    googleDriveUrl: '',
    documentType: 'resource' as 'lesson-plan' | 'worksheet' | 'standard' | 'resource' | 'other',
    notes: '',
    materials: [] as string[],
    instructions: '',
  });

  useEffect(() => {
    if (content) {
      setFormData({
        name: content.name || '',
        icon: content.icon || '📝',
        category: content.category || 'academic',
        contentType: content.contentType || 'activity',
        defaultDuration: content.defaultDuration || 30,
        description: content.description || '',
        tags: Array.isArray(content.tags) ? [...content.tags] : [],
        videoUrl: content.videoData?.videoUrl || '',
        googleDriveUrl: content.documentData?.googleDriveUrl || '',
        documentType: content.documentData?.documentType || 'resource',
        notes: content.videoData?.notes || content.documentData?.notes || '',
        materials: Array.isArray(content.materials) ? [...content.materials] : [],
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
        googleDriveUrl: '',
        documentType: 'resource',
        notes: '',
        materials: [],
        instructions: '',
      });
    }
  }, [content, isOpen]);

  const handleSave = () => {
    if (!formData.name.trim()) return;
    if (formData.contentType === 'video' && !formData.videoUrl.trim()) return;
    if (formData.contentType === 'document' && !formData.googleDriveUrl.trim()) return;

    const contentData: LibraryContent = {
      id: content?.id || generateUniqueId('content'),
      name: formData.name.trim(),
      icon: formData.icon,
      category: formData.category,
      contentType: formData.contentType,
      defaultDuration: formData.defaultDuration,
      description: formData.description.trim(),
      tags: formData.tags,
      isDeletable: true,
      isCustom: true,
      createdAt: content?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      ...(formData.contentType === 'video' && {
        videoData: {
          videoUrl: formData.videoUrl.trim(),
          notes: formData.notes.trim() || undefined,
        }
      }),
      
      ...(formData.contentType === 'document' && {
        documentData: {
          googleDriveUrl: formData.googleDriveUrl.trim(),
          documentType: formData.documentType,
          notes: formData.notes.trim() || undefined,
        }
      }),
      
      ...(formData.contentType === 'activity' && {
        materials: formData.materials.filter(m => m.trim()),
        instructions: formData.instructions.trim() || undefined,
      })
    };

    onSave(contentData);
  };

  if (!isOpen) return null;

  return (
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
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#2d3748' }}>
            {content ? 'Edit Content' : 'Create Content'}
          </h3>
          <button 
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#718096'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter name..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                Type
              </label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value as any }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="activity">Activity</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="academic">Academic</option>
                <option value="break">Break</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                Duration (min)
              </label>
              <input
                type="number"
                value={formData.defaultDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultDuration: parseInt(e.target.value) || 30 }))}
                min="1"
                max="180"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {formData.contentType === 'video' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                Video URL *
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
          )}

          {formData.contentType === 'document' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                Document URL *
              </label>
              <input
                type="url"
                value={formData.googleDriveUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, googleDriveUrl: e.target.value }))}
                placeholder="https://docs.google.com/document/d/..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          padding: '1.5rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button 
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: '#f7fafc',
              color: '#718096',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!formData.name.trim() || (formData.contentType === 'video' && !formData.videoUrl.trim()) || (formData.contentType === 'document' && !formData.googleDriveUrl.trim())}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: '#667eea',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: (!formData.name.trim() || (formData.contentType === 'video' && !formData.videoUrl.trim()) || (formData.contentType === 'document' && !formData.googleDriveUrl.trim())) ? 0.5 : 1
            }}
          >
            {content ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple Activity Library Component
const SimplifiedActivityLibrary: React.FC<ActivityLibraryProps> = ({ isActive }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'academic' | 'break' | 'other'>('all');
  const [selectedContentType, setSelectedContentType] = useState<'all' | 'activity' | 'video' | 'document'>('all');
  const [customContent, setCustomContent] = useState<LibraryContent[]>([]);
  const [addingContent, setAddingContent] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<LibraryContent | undefined>();

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
          documentData: (activity as any).documentData,
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

  const saveCustomContent = (contentList: LibraryContent[]) => {
    contentList.forEach(content => {
      const unifiedActivity: Partial<UnifiedActivity> = {
        name: content.name,
        category: content.category,
        description: content.description,
        duration: content.defaultDuration,
        materials: content.materials || [],
        instructions: content.instructions || '',
        isCustom: content.isCustom,
      };
      
      const activityWithExtras = {
        ...unifiedActivity,
        icon: content.icon,
        tags: content.tags,
        contentType: content.contentType,
        videoData: content.videoData,
        documentData: content.documentData,
      };
      
      const existingActivity = UnifiedDataService.getActivity(content.id);
      if (existingActivity) {
        UnifiedDataService.updateActivity(content.id, activityWithExtras as any);
      } else {
        UnifiedDataService.addActivity(activityWithExtras as any);
      }
    });
    
    setCustomContent(contentList);
    
    window.dispatchEvent(new CustomEvent('activitiesUpdated', {
      detail: { 
        activities: [...baseContent, ...contentList],
        source: 'ActivityLibrary',
        timestamp: Date.now(),
      }
    }));
  };

  const allContent = useMemo(() => {
    return [...baseContent, ...customContent];
  }, [customContent]);

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

  const getCategoryCount = (category: string) => {
    if (category === 'all') return allContent.length;
    return allContent.filter(content => content.category === category).length;
  };

  const getContentTypeCount = (type: string) => {
    if (type === 'all') return allContent.length;
    return allContent.filter(content => content.contentType === type).length;
  };

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

  const handleDeleteContent = (content: LibraryContent) => {
    if (!content.isDeletable) {
      alert('Built-in content cannot be deleted.');
      return;
    }

    const deleteConfirmed = window.confirm(
      `Are you sure you want to delete "${content.name}"?`
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

  if (!isActive) return null;

  return (
    <div style={{
      padding: '1.5rem',
      background: 'white',
      minHeight: 'calc(100vh - 80px)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#2d3748',
          margin: '0 0 0.5rem 0'
        }}>📚 Activity Library</h2>
        <p style={{
          color: '#718096',
          fontSize: '1.1rem',
          margin: '0'
        }}>
          Manage your classroom activities and educational content
        </p>
      </div>

      <div style={{
        background: '#f7fafc',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            position: 'relative',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <span style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#a0aec0',
              fontSize: '1rem'
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search activities, descriptions, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#a0aec0',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.25rem'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            flex: 1
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              {['all', 'academic', 'break', 'other'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as any)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: selectedCategory === category ? 'none' : '2px solid #e2e8f0',
                    background: selectedCategory === category ? '#667eea' : 'white',
                    color: selectedCategory === category ? 'white' : '#4a5568',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}
                >
                  {category === 'all' ? `All (${getCategoryCount('all')})` :
                   category === 'academic' ? `📚 Academic (${getCategoryCount('academic')})` :
                   category === 'break' ? `🍽️ Break (${getCategoryCount('break')})` :
                   `🎯 Other (${getCategoryCount('other')})`}
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              {['all', 'activity', 'video', 'document'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedContentType(type as any)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: selectedContentType === type ? 'none' : '2px solid #e2e8f0',
                    background: selectedContentType === type ? '#667eea' : 'white',
                    color: selectedContentType === type ? 'white' : '#4a5568',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}
                >
                  {type === 'all' ? `All Types (${getContentTypeCount('all')})` :
                   type === 'activity' ? `📄 Activities (${getContentTypeCount('activity')})` :
                   type === 'video' ? `🎬 Videos (${getContentTypeCount('video')})` :
                   `📁 Documents (${getContentTypeCount('document')})`}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            minWidth: '200px'
          }}>
            <button 
              onClick={() => {
                setEditingContent(undefined);
                setModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                background: 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)',
                color: 'white'
              }}
            >
              <span>📚</span>
              Create Content
            </button>
          </div>
        </div>
      </div>

      <div style={{
        marginBottom: '1rem',
        color: '#718096',
        fontSize: '0.9rem',
        textAlign: 'center'
      }}>
        Showing {filteredContent.length} of {allContent.length} items
        {searchTerm && <span style={{ fontWeight: '500', color: '#4a5568' }}> for "{searchTerm}"</span>}
        {selectedCategory !== 'all' && <span style={{ fontWeight: '500', color: '#4a5568' }}> in {selectedCategory}</span>}
        {selectedContentType !== 'all' && <span style={{ fontWeight: '500', color: '#4a5568' }}> • {selectedContentType}s only</span>}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {filteredContent.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#718096'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#4a5568' }}>
              No content found
            </h3>
            <p style={{ marginBottom: '1.5rem' }}>Try adjusting your search terms or filters</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease'
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredContent.map(content => (
            <div 
              key={content.id} 
              style={{
                background: 'white',
                border: '2px solid #e2e8f0',
                borderLeft: `4px solid ${
                  content.contentType === 'video' ? '#e53e3e' : 
                  content.contentType === 'document' ? '#805ad5' : 
                  '#38a169'
                }`,
                borderRadius: '12px',
                padding: '1.5rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  fontSize: '3rem',
                  position: 'relative',
                  width: '4rem',
                  height: '4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {content.icon}
                  {content.contentType === 'video' && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-5px',
                      right: '-5px',
                      fontSize: '1rem',
                      background: 'white',
                      borderRadius: '50%',
                      padding: '2px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>🎬</div>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    alignItems: 'flex-end'
                  }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: content.category === 'academic' ? '#bee3f8' : content.category === 'break' ? '#fed7d7' : '#e6fffa',
                      color: content.category === 'academic' ? '#2b6cb0' : content.category === 'break' ? '#c53030' : '#2c7a7b'
                    }}>
                      {content.category}
                    </span>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: content.contentType === 'activity' ? '#c6f6d5' : content.contentType === 'video' ? '#fbb6ce' : '#e9d8fd',
                      color: content.contentType === 'activity' ? '#276749' : content.contentType === 'video' ? '#97266d' : '#553c9a'
                    }}>
                      {content.contentType}
                    </span>
                    {!content.isDeletable && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: '#edf2f7',
                        color: '#4a5568'
                      }}>Built-in</span>
                    )}
                    {content.isCustom && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: '#d6f5d6',
                        color: '#22543d'
                      }}>Custom</span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#718096',
                    fontWeight: '500'
                  }}>
                    {content.defaultDuration}min
                  </div>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  margin: '0 0 0.5rem 0',
                  color: '#2d3748'
                }}>
                  {content.name}
                </h3>
                <p style={{
                  color: '#718096',
                  margin: '0 0 1rem 0',
                  lineHeight: 1.5
                }}>
                  {content.description}
                </p>

                {content.contentType === 'video' && content.videoData && (
                  <div style={{
                    background: 'rgba(229, 62, 62, 0.05)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    margin: '0.5rem 0',
                    borderLeft: '3px solid #e53e3e'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span>🔗</span>
                      <a href={content.videoData.videoUrl} target="_blank" rel="noopener noreferrer" style={{
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}>
                        View Video
                      </a>
                    </div>
                    {content.videoData.notes && (
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#4a5568',
                        fontStyle: 'italic'
                      }}>
                        <strong>Notes:</strong> {content.videoData.notes}
                      </div>
                    )}

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
                  </div>
                )}

                {content.contentType === 'document' && content.documentData && (
                  <div style={{
                    background: 'rgba(128, 90, 213, 0.05)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    margin: '0.5rem 0',
                    borderLeft: '3px solid #805ad5'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span>🔗</span>
                      <a href={content.documentData.googleDriveUrl} target="_blank" rel="noopener noreferrer" style={{
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}>
                        Open Document
                      </a>
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#4a5568',
                      marginBottom: '0.5rem'
                    }}>
                      Type: {content.documentData.documentType}
                    </div>
                    {content.documentData.notes && (
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#4a5568',
                        fontStyle: 'italic'
                      }}>
                        <strong>Notes:</strong> {content.documentData.notes}
                      </div>
                    )}
                  </div>
                )}

                {content.contentType === 'activity' && content.materials && content.materials.length > 0 && (
                  <div style={{
                    background: 'rgba(56, 161, 105, 0.05)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    margin: '0.5rem 0',
                    borderLeft: '3px solid #38a169',
                    fontSize: '0.9rem',
                    color: '#4a5568'
                  }}>
                    <strong>Materials:</strong> {content.materials.join(', ')}
                  </div>
                )}

                {content.tags.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.25rem',
                    marginTop: '0.5rem'
                  }}>
                    {content.tags.map(tag => (
                      <span key={tag} style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <button 
                  onClick={() => handleAddToSchedule(content)}
                  disabled={addingContent.has(content.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #667eea',
                    borderRadius: '6px',
                    cursor: addingContent.has(content.id) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    background: addingContent.has(content.id) ? '#38a169' : '#667eea',
                    color: 'white',
                    width: '100%',
                    opacity: addingContent.has(content.id) ? 0.7 : 1
                  }}
                >
                  {addingContent.has(content.id) ? (
                    <>
                      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Adding...
                    </>
                  ) : (
                    '+ Add to Schedule'
                  )}
                </button>
                
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'center'
                }}>
                  <button 
                    onClick={() => {
                      if (!content.isDeletable) {
                        alert('Built-in content cannot be edited. You can create a custom version instead.');
                        return;
                      }
                      setEditingContent(content);
                      setModalOpen(true);
                    }}
                    disabled={!content.isDeletable}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: content.isDeletable ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      background: 'white',
                      color: '#718096',
                      flex: 1,
                      opacity: content.isDeletable ? 1 : 0.5
                    }}
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => {
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
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      background: 'white',
                      color: '#718096',
                      flex: 1
                    }}
                  >
                    📋
                  </button>
                  {content.isDeletable && (
                    <button 
                      onClick={() => handleDeleteContent(content)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #e53e3e',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        background: 'white',
                        color: '#e53e3e',
                        flex: 1
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e53e3e';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#e53e3e';
                      }}
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SimplifiedActivityLibrary;
import React, { useState, useMemo, useEffect } from 'react';
import UnifiedDataService, { UnifiedActivity } from '../../services/unifiedDataService';
import MorningMeetingHub from '../morning-meeting/MorningMeetingHub';

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

interface LibraryProps {
  isActive: boolean;
}

// Complete content structure with choice items
interface LibraryContent {
  id: string;
  name: string;
  icon: string;
  category: 'academic' | 'break' | 'other';
  contentType: 'activity' | 'video' | 'document' | 'choice-item';
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
  choiceData?: {
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    skillAreas: string[];
    supervisionLevel: 'independent' | 'minimal' | 'moderate' | 'full';
    format: 'solo' | 'group' | 'flexible';
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
  defaultContentType?: 'activity' | 'video' | 'document' | 'choice-item';
}> = ({ content, onSave, onCancel, isOpen, defaultContentType = 'activity' }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: '📝',
    category: 'academic' as 'academic' | 'break' | 'other',
    contentType: defaultContentType,
    defaultDuration: 30,
    description: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    skillAreas: [] as string[],
    supervisionLevel: 'minimal' as 'independent' | 'minimal' | 'moderate' | 'full',
    format: 'solo' as 'solo' | 'group' | 'flexible',
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
        contentType: content.contentType || defaultContentType,
        defaultDuration: content.defaultDuration || 30,
        description: content.description || '',
        difficulty: content.choiceData?.difficulty || 'beginner',
        skillAreas: Array.isArray(content.choiceData?.skillAreas) ? [...content.choiceData.skillAreas] : [],
        supervisionLevel: content.choiceData?.supervisionLevel || 'minimal',
        format: content.choiceData?.format || 'solo',
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
        contentType: defaultContentType,
        defaultDuration: 30,
        description: '',
        difficulty: 'beginner',
        skillAreas: [],
        supervisionLevel: 'minimal',
        format: 'solo',
        tags: [],
        videoUrl: '',
        googleDriveUrl: '',
        documentType: 'resource',
        notes: '',
        materials: [],
        instructions: '',
      });
    }
  }, [content, isOpen, defaultContentType]);

  const handleSave = () => {
    if (!formData.name.trim()) return;
    if (formData.contentType === 'video' && !formData.videoUrl.trim()) return;
    if (formData.contentType === 'document' && !formData.googleDriveUrl.trim()) return;
    if (formData.contentType === 'choice-item' && !formData.description.trim()) return;

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

      ...(formData.contentType === 'choice-item' && {
        choiceData: {
          description: formData.description.trim(),
          difficulty: formData.difficulty,
          skillAreas: formData.skillAreas,
          supervisionLevel: formData.supervisionLevel,
          format: formData.format,
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
            {content ? 'Edit Content' : `Create ${formData.contentType === 'choice-item' ? 'Choice Item' : formData.contentType}`}
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
          {/* Content Type Selection for new content */}
          {!content && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                Content Type *
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem'
              }}>
                {[
                  { type: 'activity', icon: '📚', label: 'Activity' },
                  { type: 'video', icon: '🎬', label: 'Video' },
                  { type: 'document', icon: '📄', label: 'Document' },
                  { type: 'choice-item', icon: '🎯', label: 'Choice Item' }
                ].map(({ type, icon, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, contentType: type as any }))}
                    style={{
                      padding: '1rem',
                      border: formData.contentType === type ? '2px solid #667eea' : '2px solid #e2e8f0',
                      borderRadius: '8px',
                      background: formData.contentType === type ? 'rgba(102, 126, 234, 0.05)' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
                    <div>{label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name */}
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

          {/* URL Fields */}
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

          {/* Choice Item Fields */}
          {formData.contentType === 'choice-item' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                    Supervision
                  </label>
                  <select
                    value={formData.supervisionLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, supervisionLevel: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="independent">Independent</option>
                    <option value="minimal">Minimal</option>
                    <option value="moderate">Moderate</option>
                    <option value="full">Full</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                    Format
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="solo">Solo</option>
                    <option value="group">Group</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                  Skill Areas
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {['Fine Motor', 'Gross Motor', 'Communication', 'Social Skills', 'Math', 'Reading', 'Science', 'Art', 'Music', 'Sensory'].map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        const currentSkillAreas = Array.isArray(formData.skillAreas) ? formData.skillAreas : [];
                        if (currentSkillAreas.includes(skill)) {
                          setFormData(prev => ({
                            ...prev,
                            skillAreas: currentSkillAreas.filter(s => s !== skill)
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            skillAreas: [...currentSkillAreas, skill]
                          }));
                        }
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '2px solid #e2e8f0',
                        background: Array.isArray(formData.skillAreas) && formData.skillAreas.includes(skill) ? '#9f7aea' : 'white',
                        color: Array.isArray(formData.skillAreas) && formData.skillAreas.includes(skill) ? 'white' : '#4a5568',
                        borderColor: Array.isArray(formData.skillAreas) && formData.skillAreas.includes(skill) ? '#9f7aea' : '#e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Standard Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                Icon
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="📝"
                maxLength={2}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  textAlign: 'center'
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
              Description {formData.contentType === 'choice-item' && '*'}
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

          {/* Notes (for videos/documents) */}
          {(formData.contentType === 'video' || formData.contentType === 'document') && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes..."
                rows={2}
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
          )}
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
            disabled={
              !formData.name.trim() || 
              (formData.contentType === 'video' && !formData.videoUrl.trim()) || 
              (formData.contentType === 'document' && !formData.googleDriveUrl.trim()) ||
              (formData.contentType === 'choice-item' && !formData.description.trim())
            }
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: '#667eea',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: (
                !formData.name.trim() || 
                (formData.contentType === 'video' && !formData.videoUrl.trim()) || 
                (formData.contentType === 'document' && !formData.googleDriveUrl.trim()) ||
                (formData.contentType === 'choice-item' && !formData.description.trim())
              ) ? 0.5 : 1
            }}
          >
            {content ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Library Component with Tab System
const Library: React.FC<LibraryProps> = ({ isActive }) => {
  const [activeTab, setActiveTab] = useState<'activities' | 'media' | 'choice-items' | 'lesson-plans' | 'morning-meeting'>('activities');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<LibraryContent | undefined>();
  const [customContent, setCustomContent] = useState<LibraryContent[]>([]);

  // Tab-specific search that clears when switching tabs
  const handleTabChange = (newTab: typeof activeTab) => {
    setActiveTab(newTab);
    setSearchTerm(''); // Clear search when switching tabs
  };

  // Load custom content
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
          choiceData: (activity as any).choiceData,
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
        choiceData: content.choiceData,
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
        source: 'Library',
        timestamp: Date.now(),
      }
    }));
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

  const openModal = (content?: LibraryContent, contentType?: 'activity' | 'video' | 'document' | 'choice-item') => {
    setEditingContent(content);
    setModalOpen(true);
  };

  if (!isActive) return null;

  return (
    <div style={{
      padding: '1.5rem',
      background: 'white',
      minHeight: 'calc(100vh - 80px)'
    }}>
      {/* Library Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#2d3748',
          margin: '0 0 0.5rem 0'
        }}>📚 Library</h2>
        <p style={{
          color: '#718096',
          fontSize: '1.1rem',
          margin: '0'
        }}>
          Comprehensive content management for your classroom
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '2rem',
        background: '#f7fafc',
        borderRadius: '12px',
        padding: '0.5rem',
        border: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '0.25rem'
      }}>
        {[
          { id: 'activities', icon: '📋', label: 'Activities' },
          { id: 'media', icon: '🎬', label: 'Media' },
          { id: 'choice-items', icon: '🎯', label: 'Choice Items' },
          { id: 'lesson-plans', icon: '📄', label: 'Lesson Plans' },
          { id: 'morning-meeting', icon: '🌅', label: 'Morning Meeting' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              border: 'none',
              background: activeTab === tab.id ? '#667eea' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#718096',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              minWidth: '120px',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'activities' && (
          <ActivitiesTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onOpenModal={openModal}
            customContent={customContent}
          />
        )}
        
        {activeTab === 'media' && (
          <MediaTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onOpenModal={openModal}
            customContent={customContent}
          />
        )}
        
        {activeTab === 'choice-items' && (
          <ChoiceItemsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onOpenModal={openModal}
            customContent={customContent}
          />
        )}
        
        {activeTab === 'lesson-plans' && (
          <LessonPlansTab />
        )}
        
        {activeTab === 'morning-meeting' && (
          <div style={{ 
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '1rem',
            minHeight: '500px'
          }}>
            <MorningMeetingHub 
              isActive={true}
              onStartMorningMeeting={() => {
                // Handle starting morning meeting from within Library
                console.log('Starting Morning Meeting from Library tab');
                // You could dispatch an event or call a parent function here
                window.dispatchEvent(new CustomEvent('startMorningMeeting', {
                  detail: { source: 'Library' }
                }));
              }}
              onClose={() => {
                // Handle closing - switch back to activities tab
                setActiveTab('activities');
              }}
            />
          </div>
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
    </div>
  );
};

// Activities Tab Component
const ActivitiesTab: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenModal: (content?: LibraryContent, type?: string) => void;
  customContent: LibraryContent[];
}> = ({ searchTerm, setSearchTerm, onOpenModal, customContent }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'academic' | 'break' | 'other'>('all');
  const [addingContent, setAddingContent] = useState<Set<string>>(new Set());

  const baseActivities = baseContent.filter(content => content.contentType === 'activity');
  const customActivities = customContent.filter(content => content.contentType === 'activity');
  const allActivities = [...baseActivities, ...customActivities];

  const filteredActivities = useMemo(() => {
    return allActivities.filter(content => {
      const matchesSearch = content.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, allActivities]);

  const getCategoryCount = (category: string) => {
    if (category === 'all') return allActivities.length;
    return allActivities.filter(content => content.category === category).length;
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
        description: content.description || '',
        materials: content.materials || [],
        instructions: content.instructions || '',
        isCustom: content.isCustom,
        tags: content.tags || [],
        createdAt: new Date().toISOString(),
        addedFromLibrary: true,
      };

      const existingActivities = JSON.parse(localStorage.getItem('available_activities') || '[]');
      const updatedActivities = [...existingActivities, contentToAdd];
      localStorage.setItem('available_activities', JSON.stringify(updatedActivities));

      window.dispatchEvent(new CustomEvent('activityAdded', {
        detail: { 
          activity: contentToAdd,
          source: 'Library',
          timestamp: Date.now()
        }
      }));

      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error adding activity:', error);
      alert(`Error adding "${content.name}". Please try again.`);
    } finally {
      setAddingContent(prev => {
        const newSet = new Set(prev);
        newSet.delete(content.id);
        return newSet;
      });
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#2d3748',
          margin: '0 0 0.5rem 0'
        }}>📋 Activities for Schedule Builder</h3>
        <p style={{ color: '#718096', margin: 0 }}>
          Manage activities that can be scheduled in your daily routine
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: '#f7fafc',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0'
      }}>
        {/* Search */}
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
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
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
                  fontSize: '1rem'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters and Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
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
                  border: '2px solid #e2e8f0',
                  background: selectedCategory === category ? '#667eea' : 'white',
                  color: selectedCategory === category ? 'white' : '#4a5568',
                  borderColor: selectedCategory === category ? '#667eea' : '#e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
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

          <button 
            onClick={() => onOpenModal(undefined, 'activity')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span>📚</span>
            Create Activity
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div style={{
        marginBottom: '1rem',
        color: '#718096',
        fontSize: '0.9rem',
        textAlign: 'center'
      }}>
        Showing {filteredActivities.length} of {allActivities.length} activities
        {searchTerm && <span style={{ fontWeight: '500', color: '#4a5568' }}> for "{searchTerm}"</span>}
        {selectedCategory !== 'all' && <span style={{ fontWeight: '500', color: '#4a5568' }}> in {selectedCategory}</span>}
      </div>

      {/* Activities Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredActivities.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#718096'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#4a5568' }}>
              No activities found
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
                  fontWeight: '500'
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredActivities.map(activity => (
            <ActivityCard 
              key={activity.id} 
              content={activity} 
              onAddToSchedule={() => handleAddToSchedule(activity)}
              isAdding={addingContent.has(activity.id)}
              onEdit={() => onOpenModal(activity)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Media Tab Component
const MediaTab: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenModal: (content?: LibraryContent, type?: string) => void;
  customContent: LibraryContent[];
}> = ({ searchTerm, setSearchTerm, onOpenModal, customContent }) => {
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'video' | 'document'>('all');

  const customMedia = customContent.filter(content => 
    content.contentType === 'video' || content.contentType === 'document'
  );

  const filteredMedia = useMemo(() => {
    return customMedia.filter(content => {
      const matchesSearch = content.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedMediaType === 'all' || content.contentType === selectedMediaType;
      
      return matchesSearch && matchesType;
    });
  }, [searchTerm, selectedMediaType, customMedia]);

  const getMediaTypeCount = (type: string) => {
    if (type === 'all') return customMedia.length;
    return customMedia.filter(content => content.contentType === type).length;
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#2d3748',
          margin: '0 0 0.5rem 0'
        }}>🎬 Media Library</h3>
        <p style={{ color: '#718096', margin: 0 }}>
          Manage videos and documents with SmartBoard integration
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: '#f7fafc',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0'
      }}>
        {/* Search */}
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
              placeholder="Search videos and documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
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
                  fontSize: '1rem'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters and Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {['all', 'video', 'document'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedMediaType(type as any)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid #e2e8f0',
                  background: selectedMediaType === type ? '#667eea' : 'white',
                  color: selectedMediaType === type ? 'white' : '#4a5568',
                  borderColor: selectedMediaType === type ? '#667eea' : '#e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}
              >
                {type === 'all' ? `All Media (${getMediaTypeCount('all')})` :
                 type === 'video' ? `🎬 Videos (${getMediaTypeCount('video')})` :
                 `📄 Documents (${getMediaTypeCount('document')})`}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => onOpenModal(undefined, 'video')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #e53e3e 0%, #fc8181 100%)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <span>🎬</span>
              Add Video
            </button>
            <button 
              onClick={() => onOpenModal(undefined, 'document')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #805ad5 0%, #b794f6 100%)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <span>📄</span>
              Add Document
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div style={{
        marginBottom: '1rem',
        color: '#718096',
        fontSize: '0.9rem',
        textAlign: 'center'
      }}>
        Showing {filteredMedia.length} of {customMedia.length} media items
        {searchTerm && <span style={{ fontWeight: '500', color: '#4a5568' }}> for "{searchTerm}"</span>}
        {selectedMediaType !== 'all' && <span style={{ fontWeight: '500', color: '#4a5568' }}> • {selectedMediaType}s only</span>}
      </div>

      {/* Media Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredMedia.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#718096'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🎬</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#4a5568' }}>
              No media found
            </h3>
            <p style={{ marginBottom: '1.5rem' }}>Add videos and documents to get started</p>
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
                  fontWeight: '500'
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredMedia.map(media => (
            <MediaCard 
              key={media.id} 
              content={media} 
              onEdit={() => onOpenModal(media)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Choice Items Tab Component
const ChoiceItemsTab: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenModal: (content?: LibraryContent, type?: string) => void;
  customContent: LibraryContent[];
}> = ({ searchTerm, setSearchTerm, onOpenModal, customContent }) => {
  const [expandedChoice, setExpandedChoice] = useState<string | null>(null);

  const customChoiceItems = customContent.filter(content => content.contentType === 'choice-item');

  const filteredChoiceItems = useMemo(() => {
    return customChoiceItems.filter(content => {
      const matchesSearch = content.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (content.choiceData?.skillAreas || []).some(skill => 
                             skill.toLowerCase().includes(searchTerm.toLowerCase())
                           );
      
      return matchesSearch;
    });
    }, [searchTerm, customChoiceItems]);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#2d3748',
          margin: '0 0 0.5rem 0'
        }}>🎯 Choice Items Repository</h3>
        <p style={{ color: '#718096', margin: 0 }}>
          Compact repository of student choice activity options
        </p>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'rgba(159, 122, 234, 0.1)',
        border: '1px solid rgba(159, 122, 234, 0.3)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💡</div>
        <p style={{ 
          color: '#6b46c1', 
          margin: 0,
          fontWeight: '500',
          fontSize: '0.9rem'
        }}>
          Choice items are compact activity options that will be used by other systems in Bloom Classroom for student selection and assignment.
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: '#f7fafc',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0'
      }}>
        {/* Search */}
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
              placeholder="Search choice items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
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
                  fontSize: '1rem'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => onOpenModal(undefined, 'choice-item')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #9f7aea 0%, #b794f6 100%)',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span>🎯</span>
            Create Choice Item
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div style={{
        marginBottom: '1rem',
        color: '#718096',
        fontSize: '0.9rem',
        textAlign: 'center'
      }}>
        Showing {filteredChoiceItems.length} of {customChoiceItems.length} choice items
        {searchTerm && <span style={{ fontWeight: '500', color: '#4a5568' }}> for "{searchTerm}"</span>}
      </div>

      {/* Choice Items Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredChoiceItems.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#718096'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🎯</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#4a5568' }}>
              No choice items found
            </h3>
            <p style={{ marginBottom: '1.5rem' }}>Create choice items to build your repository</p>
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
                  fontWeight: '500'
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredChoiceItems.map(item => (
            <ChoiceRepositoryCard 
              key={item.id} 
              content={item} 
              isExpanded={expandedChoice === item.id}
              onToggleExpanded={() => setExpandedChoice(expandedChoice === item.id ? null : item.id)}
              onEdit={() => onOpenModal(item)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Lesson Plans Tab Component
const LessonPlansTab: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📄</div>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#2d3748',
        margin: '0 0 1rem 0'
      }}>Lesson Plans</h3>
      <p style={{
        color: '#718096',
        fontSize: '1.1rem',
        marginBottom: '2rem',
        maxWidth: '500px',
        margin: '0 auto 2rem auto'
      }}>
        Lesson plan management coming soon! This will integrate with your activities and standards tracking.
      </p>
      <div style={{
        background: 'rgba(102, 126, 234, 0.1)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '12px',
        padding: '1.5rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h4 style={{ 
          color: '#667eea', 
          margin: '0 0 1rem 0',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>Planned Features:</h4>
        <ul style={{
          color: '#4a5568',
          textAlign: 'left',
          margin: 0,
          paddingLeft: '1.5rem'
        }}>
          <li>Standards-aligned lesson plan templates</li>
          <li>Integration with Activity Library</li>
          <li>IEP goal alignment tracking</li>
          <li>Differentiation suggestions</li>
          <li>Assessment planning tools</li>
        </ul>
      </div>
    </div>
  );
};

// Activity Card Component
const ActivityCard: React.FC<{
  content: LibraryContent;
  onAddToSchedule: () => void;
  isAdding: boolean;
  onEdit: () => void;
}> = ({ content, onAddToSchedule, isAdding, onEdit }) => {
  return (
    <div style={{
      background: 'white',
      border: '2px solid #e2e8f0',
      borderLeft: '4px solid #38a169',
      borderRadius: '12px',
      padding: '1.5rem',
      transition: 'all 0.2s ease',
      height: 'fit-content'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '3rem' }}>{content.icon}</div>
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
          <div style={{
            fontSize: '0.875rem',
            color: '#718096',
            fontWeight: '500'
          }}>
            {content.defaultDuration}min
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
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

        {content.materials && content.materials.length > 0 && (
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
          onClick={onAddToSchedule}
          disabled={isAdding}
          style={{
            padding: '0.75rem 1rem',
            border: 'none',
            borderRadius: '6px',
            background: isAdding ? '#38a169' : '#667eea',
            color: 'white',
            cursor: isAdding ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: isAdding ? 0.7 : 1
          }}
        >
          {isAdding ? (
            <>
              <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
              Adding...
            </>
          ) : (
            '+ Add to Schedule'
          )}
        </button>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={onEdit}
            disabled={!content.isDeletable}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: 'white',
              color: content.isDeletable ? '#718096' : '#a0aec0',
              cursor: content.isDeletable ? 'pointer' : 'not-allowed',
              fontWeight: '500'
            }}
          >
            ✏️ Edit
          </button>
        </div>
      </div>
    </div>
  );
};

// Media Card Component
const MediaCard: React.FC<{
  content: LibraryContent;
  onEdit: () => void;
}> = ({ content, onEdit }) => {
  return (
    <div style={{
      background: 'white',
      border: '2px solid #e2e8f0',
      borderLeft: `4px solid ${content.contentType === 'video' ? '#e53e3e' : '#805ad5'}`,
      borderRadius: '12px',
      padding: '1.5rem',
      transition: 'all 0.2s ease',
      height: 'fit-content'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '3rem', position: 'relative' }}>
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
            background: content.contentType === 'video' ? '#fbb6ce' : '#e9d8fd',
            color: content.contentType === 'video' ? '#97266d' : '#553c9a'
          }}>
            {content.contentType}
          </span>
          <div style={{
            fontSize: '0.875rem',
            color: '#718096',
            fontWeight: '500'
          }}>
            {content.defaultDuration}min
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
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

        {/* Video/Document Details */}
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

            {/* SmartBoard Options */}
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
                📺 SmartBoard Display Options
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

      <div>
        <button 
          onClick={onEdit}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #667eea',
            borderRadius: '6px',
            background: 'white',
            color: '#667eea',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#667eea';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#667eea';
          }}
        >
          ✏️ Edit Content
        </button>
      </div>
    </div>
  );
};

// Choice Repository Card Component (Compact Design)
const ChoiceRepositoryCard: React.FC<{
  content: LibraryContent;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEdit: () => void;
}> = ({ content, isExpanded, onToggleExpanded, onEdit }) => {
  const choiceData = content.choiceData;
  if (!choiceData) return null;

  return (
    <div style={{
      background: 'white',
      border: '2px solid #e2e8f0',
      borderLeft: '4px solid #9f7aea',
      borderRadius: '12px',
      padding: '1rem',
      transition: 'all 0.2s ease',
      minHeight: '120px'
    }}>
      {/* Compact Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{ fontSize: '2rem' }}>{content.icon}</div>
          <div>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              margin: '0 0 0.25rem 0',
              color: '#2d3748'
            }}>
              {content.name}
            </h3>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <span style={{
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '600',
                background: choiceData.difficulty === 'beginner' ? '#c6f6d5' : 
                           choiceData.difficulty === 'intermediate' ? '#fbb6ce' : '#fed7d7',
                color: choiceData.difficulty === 'beginner' ? '#276749' : 
                       choiceData.difficulty === 'intermediate' ? '#97266d' : '#c53030'
              }}>
                {choiceData.difficulty}
              </span>
              <span style={{
                fontSize: '0.8rem',
                color: '#718096',
                textTransform: 'capitalize'
              }}>
                {choiceData.format}
              </span>
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: '#718096',
          fontWeight: '500'
        }}>
          {content.defaultDuration}min
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={onToggleExpanded}
        style={{
          width: '100%',
          padding: '0.5rem',
          background: '#9f7aea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '0.9rem',
          marginBottom: isExpanded ? '1rem' : '0'
        }}
      >
        {isExpanded ? 'Close Details' : 'Open Details'}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{
          borderTop: '1px solid rgba(159, 122, 234, 0.3)',
          paddingTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>
            <strong style={{ color: '#6b46c1', fontSize: '0.9rem' }}>Description:</strong>
            <p style={{
              fontSize: '0.9rem',
              color: '#4a5568',
              margin: '0.25rem 0 0 0',
              lineHeight: 1.4
            }}>
              {choiceData.description}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{
                fontSize: '0.8rem',
                color: '#6b46c1',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.25rem'
              }}>
                Supervision:
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#4a5568',
                textTransform: 'capitalize'
              }}>
                {choiceData.supervisionLevel}
              </div>
            </div>
          </div>

          {choiceData.skillAreas.length > 0 && (
            <div>
              <div style={{
                fontSize: '0.8rem',
                color: '#6b46c1',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.5rem'
              }}>
                Skills:
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.25rem'
              }}>
                {choiceData.skillAreas.map((skill, index) => (
                  <span key={index} style={{
                    background: '#9f7aea',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={onEdit}
            style={{
              padding: '0.5rem',
              border: '1px solid #9f7aea',
              borderRadius: '6px',
              background: 'white',
              color: '#9f7aea',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.9rem',
              marginTop: '0.5rem'
            }}
          >
            ✏️ Edit Choice Item
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;

// CSS Animations and Global Styles
const globalStyles = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
}

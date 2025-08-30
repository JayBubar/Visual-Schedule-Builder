import React, { useState, useMemo, useEffect } from 'react';
import UnifiedDataService, { UnifiedActivity } from '../../services/unifiedDataService';
import MorningMeetingHub from '../morning-meeting/MorningMeetingHub';

// Interface definitions for lesson plans and state standards
interface LessonPlanData {
  subject: string;
  gradeLevel: string[];
  duration: number;
  objectives: string[];
  materials: string[];
  procedure: {
    introduction: string;
    mainActivity: string;
    closure: string;
  };
  assessment: string;
  differentiation: string[];
  linkedStandardIds: string[];
  iepGoalAlignment: string[];
  preparationTime: number;
  groupSize: 'individual' | 'small-group' | 'whole-class' | 'flexible';
}

interface StateStandardData {
  standardCode: string;
  subject: string;
  gradeLevel: string[];
  description: string;
  learningObjectives: string[];
  assessmentCriteria: string[];
  crossCurricularConnections: string[];
  iepGoalDomains: string[];
  complexity: 'foundational' | 'developing' | 'proficient' | 'advanced';
  prerequisites: string[];
  state: string;
}

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
  contentType: 'activity' | 'video' | 'document' | 'choice-item' | 'lesson-plan' | 'state-standard';
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
  lessonPlanData?: {
    subject: string;
    gradeLevel: string[];
    duration: number;
    objectives: string[];
    materials: string[];
    procedure: {
      introduction: string;
      mainActivity: string;
      closure: string;
    };
    assessment: string;
    differentiation: string[];
    linkedStandardIds: string[];
    iepGoalAlignment: string[];
    preparationTime: number;
    groupSize: 'individual' | 'small-group' | 'whole-class' | 'flexible';
  };
  stateStandardData?: {
    standardCode: string;
    subject: string;
    gradeLevel: string[];
    description: string;
    learningObjectives: string[];
    assessmentCriteria: string[];
    crossCurricularConnections: string[];
    iepGoalDomains: string[];
    complexity: 'foundational' | 'developing' | 'proficient' | 'advanced';
    prerequisites: string[];
    state: string;
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
  defaultContentType?: 'activity' | 'video' | 'document' | 'choice-item' | 'lesson-plan' | 'state-standard';
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
// Complete Lesson Plans & State Standards Implementation
// Lesson Plan Creation/Edit Modal Component
// Add this to the LessonPlansTab implementation

const LessonPlanModal: React.FC<{
  isOpen: boolean;
  lessonPlan?: LibraryContent;
  onSave: (lessonPlan: LibraryContent) => void;
  onClose: () => void;
  availableStandards: LibraryContent[];
}> = ({ isOpen, lessonPlan, onSave, onClose, availableStandards }) => {
  const [formData, setFormData] = useState({
    name: lessonPlan?.name || '',
    subject: lessonPlan?.lessonPlanData?.subject || '',
    gradeLevel: lessonPlan?.lessonPlanData?.gradeLevel || [],
    duration: lessonPlan?.lessonPlanData?.duration || 45,
    objectives: lessonPlan?.lessonPlanData?.objectives || [''],
    materials: lessonPlan?.lessonPlanData?.materials || [''],
    introduction: lessonPlan?.lessonPlanData?.procedure.introduction || '',
    mainActivity: lessonPlan?.lessonPlanData?.procedure.mainActivity || '',
    closure: lessonPlan?.lessonPlanData?.procedure.closure || '',
    assessment: lessonPlan?.lessonPlanData?.assessment || '',
    differentiation: lessonPlan?.lessonPlanData?.differentiation || [''],
    linkedStandardIds: lessonPlan?.lessonPlanData?.linkedStandardIds || [],
    iepGoalAlignment: lessonPlan?.lessonPlanData?.iepGoalAlignment || [],
    preparationTime: lessonPlan?.lessonPlanData?.preparationTime || 15,
    groupSize: lessonPlan?.lessonPlanData?.groupSize || 'whole-class' as const
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'procedure' | 'standards' | 'accessibility'>('basic');

  useEffect(() => {
    if (isOpen && lessonPlan) {
      // Reset form when opening existing lesson
      setFormData({
        name: lessonPlan.name || '',
        subject: lessonPlan.lessonPlanData?.subject || '',
        gradeLevel: lessonPlan.lessonPlanData?.gradeLevel || [],
        duration: lessonPlan.lessonPlanData?.duration || 45,
        objectives: lessonPlan.lessonPlanData?.objectives || [''],
        materials: lessonPlan.lessonPlanData?.materials || [''],
        introduction: lessonPlan.lessonPlanData?.procedure.introduction || '',
        mainActivity: lessonPlan.lessonPlanData?.procedure.mainActivity || '',
        closure: lessonPlan.lessonPlanData?.procedure.closure || '',
        assessment: lessonPlan.lessonPlanData?.assessment || '',
        differentiation: lessonPlan.lessonPlanData?.differentiation || [''],
        linkedStandardIds: lessonPlan.lessonPlanData?.linkedStandardIds || [],
        iepGoalAlignment: lessonPlan.lessonPlanData?.iepGoalAlignment || [],
        preparationTime: lessonPlan.lessonPlanData?.preparationTime || 15,
        groupSize: lessonPlan.lessonPlanData?.groupSize || 'whole-class'
      });
    }
  }, [isOpen, lessonPlan]);

  const handleArrayFieldChange = (
    field: 'objectives' | 'materials' | 'differentiation' | 'iepGoalAlignment',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: 'objectives' | 'materials' | 'differentiation' | 'iepGoalAlignment') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'objectives' | 'materials' | 'differentiation' | 'iepGoalAlignment', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleGradeLevelChange = (grade: string) => {
    setFormData(prev => ({
      ...prev,
      gradeLevel: prev.gradeLevel.includes(grade)
        ? prev.gradeLevel.filter(g => g !== grade)
        : [...prev.gradeLevel, grade]
    }));
  };

  const handleStandardToggle = (standardId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedStandardIds: prev.linkedStandardIds.includes(standardId)
        ? prev.linkedStandardIds.filter(id => id !== standardId)
        : [...prev.linkedStandardIds, standardId]
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.subject.trim()) {
      alert('Please fill in required fields: Name and Subject');
      return;
    }

    const lessonPlanData: LessonPlanData = {
      subject: formData.subject.trim(),
      gradeLevel: formData.gradeLevel,
      duration: formData.duration,
      objectives: formData.objectives.filter(obj => obj.trim()),
      materials: formData.materials.filter(mat => mat.trim()),
      procedure: {
        introduction: formData.introduction.trim(),
        mainActivity: formData.mainActivity.trim(),
        closure: formData.closure.trim()
      },
      assessment: formData.assessment.trim(),
      differentiation: formData.differentiation.filter(diff => diff.trim()),
      linkedStandardIds: formData.linkedStandardIds,
      iepGoalAlignment: formData.iepGoalAlignment.filter(goal => goal.trim()),
      preparationTime: formData.preparationTime,
      groupSize: formData.groupSize
    };

    const newLessonPlan: LibraryContent = {
      id: lessonPlan?.id || generateUniqueId('lesson'),
      name: formData.name.trim(),
      icon: '📋',
      category: 'academic' as 'academic' | 'break' | 'other',
      contentType: 'lesson-plan' as const,
      defaultDuration: formData.duration,
      description: `${formData.subject} lesson plan for grades ${formData.gradeLevel.join(', ')}`,
      lessonPlanData,
      createdAt: lessonPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeletable: true,
      isCustom: true,
      tags: [formData.subject, ...formData.gradeLevel.map(g => `Grade ${g}`)]
    };

    onSave(newLessonPlan);
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
        borderRadius: '16px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #059669, #10b981)'
        }}>
          <div>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
              {lessonPlan ? '✏️ Edit Lesson Plan' : '➕ Create Lesson Plan'}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
              {lessonPlan ? 'Update your lesson plan details' : 'Design a comprehensive lesson plan'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '1.2rem',
              width: '40px',
              height: '40px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          background: '#f8fafc'
        }}>
          {[
            { id: 'basic', icon: '📝', label: 'Basic Info' },
            { id: 'procedure', icon: '📋', label: 'Procedure' },
            { id: 'standards', icon: '📚', label: 'Standards' },
            { id: 'accessibility', icon: '♿', label: 'Accessibility' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '1rem',
                border: 'none',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#059669' : '#6b7280',
                borderBottom: activeTab === tab.id ? '2px solid #059669' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '2rem',
          maxHeight: 'calc(90vh - 200px)',
          overflow: 'auto'
        }}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  Lesson Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Introduction to Fractions"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">Select Subject</option>
                    <option value="Math">Math</option>
                    <option value="English Language Arts">English Language Arts</option>
                    <option value="Science">Science</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Art">Art</option>
                    <option value="Music">Music</option>
                    <option value="Physical Education">Physical Education</option>
                    <option value="Life Skills">Life Skills</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 45 }))}
                    min="5"
                    max="180"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                    Group Size
                  </label>
                  <select
                    value={formData.groupSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, groupSize: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="individual">Individual</option>
                    <option value="small-group">Small Group</option>
                    <option value="whole-class">Whole Class</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  Grade Levels
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                  gap: '0.5rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}>
                  {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(grade => (
                    <label key={grade} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background: formData.gradeLevel.includes(grade) ? '#dcfce7' : 'white',
                      border: `2px solid ${formData.gradeLevel.includes(grade) ? '#16a34a' : '#e5e7eb'}`,
                      justifyContent: 'center',
                      fontWeight: '500'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.gradeLevel.includes(grade)}
                        onChange={() => handleGradeLevelChange(grade)}
                        style={{ margin: 0 }}
                      />
                      {grade}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  Learning Objectives
                </label>
                {formData.objectives.map((objective, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => handleArrayFieldChange('objectives', index, e.target.value)}
                      placeholder={`Objective ${index + 1}`}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        onClick={() => removeArrayField('objectives', index)}
                        style={{
                          padding: '0.75rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayField('objectives')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f0f9ff',
                    color: '#0369a1',
                    border: '2px dashed #0369a1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    fontWeight: '500'
                  }}
                >
                  + Add Objective
                </button>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  Materials Needed
                </label>
                {formData.materials.map((material, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => handleArrayFieldChange('materials', index, e.target.value)}
                      placeholder={`Material ${index + 1}`}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                    {formData.materials.length > 1 && (
                      <button
                        onClick={() => removeArrayField('materials', index)}
                        style={{
                          padding: '0.75rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayField('materials')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f0f9ff',
                    color: '#0369a1',
                    border: '2px dashed #0369a1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    fontWeight: '500'
                  }}
                >
                  + Add Material
                </button>
              </div>
            </div>
          )}

          {/* Procedure Tab */}
          {activeTab === 'procedure' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  🚀 Introduction / Hook
                </label>
                <textarea
                  value={formData.introduction}
                  onChange={(e) => setFormData(prev => ({ ...prev, introduction: e.target.value }))}
                  placeholder="How will you grab students' attention and introduce the topic?"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  📚 Main Activity / Instruction
                </label>
                <textarea
                  value={formData.mainActivity}
                  onChange={(e) => setFormData(prev => ({ ...prev, mainActivity: e.target.value }))}
                  placeholder="Detailed description of the main learning activities..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  🎯 Closure / Wrap-up
                </label>
                <textarea
                  value={formData.closure}
                  onChange={(e) => setFormData(prev => ({ ...prev, closure: e.target.value }))}
                  placeholder="How will you summarize learning and transition to next activity?"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  📊 Assessment / Evaluation
                </label>
                <textarea
                  value={formData.assessment}
                  onChange={(e) => setFormData(prev => ({ ...prev, assessment: e.target.value }))}
                  placeholder="How will you assess student understanding and progress?"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                    ⏱️ Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 15 }))}
                    min="0"
                    max="120"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Standards Tab */}
          {activeTab === 'standards' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#374151', marginBottom: '1rem' }}>
                  📚 Link State Standards
                </h3>
                {availableStandards.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '2px dashed #d1d5db'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                      No state standards loaded yet
                    </p>
                    <p style={{ color: '#374151', fontSize: '0.9rem' }}>
                      Go to the Standards section to import your state standards first
                    </p>
                  </div>
                ) : (
                  <div style={{
                    maxHeight: '400px',
                    overflow: 'auto',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    {availableStandards.map(standard => (
                      <div key={standard.id} style={{
                        display: 'flex',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        marginBottom: '0.5rem',
                        background: formData.linkedStandardIds.includes(standard.id) ? '#f0f9ff' : 'white'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.linkedStandardIds.includes(standard.id)}
                          onChange={() => handleStandardToggle(standard.id)}
                          style={{ margin: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                            {standard.name}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            {standard.stateStandardData?.subject} • Grades {standard.stateStandardData?.gradeLevel.join(', ')}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>
                            {standard.description?.slice(0, 120)}...
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {formData.linkedStandardIds.length > 0 && (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #22c55e',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1rem'
                  }}>
                    <div style={{ color: '#16a34a', fontWeight: '600', marginBottom: '0.5rem' }}>
                      ✅ {formData.linkedStandardIds.length} standards linked to this lesson
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#15803d' }}>
                      This lesson plan will be aligned with the selected state standards for curriculum compliance.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accessibility Tab */}
          {activeTab === 'accessibility' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  ♿ Differentiation Strategies
                </label>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  How will this lesson be adapted for different learning needs and abilities?
                </p>
                {formData.differentiation.map((strategy, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={strategy}
                      onChange={(e) => handleArrayFieldChange('differentiation', index, e.target.value)}
                      placeholder={`Differentiation strategy ${index + 1}`}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                    {formData.differentiation.length > 1 && (
                      <button
                        onClick={() => removeArrayField('differentiation', index)}
                        style={{
                          padding: '0.75rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayField('differentiation')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f0f9ff',
                    color: '#0369a1',
                    border: '2px dashed #0369a1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    fontWeight: '500'
                  }}
                >
                  + Add Differentiation Strategy
                </button>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  🎯 IEP Goal Alignment
                </label>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Which IEP goal domains does this lesson support?
                </p>
                {formData.iepGoalAlignment.map((goal, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <select
                      value={goal}
                      onChange={(e) => handleArrayFieldChange('iepGoalAlignment', index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="">Select IEP Domain</option>
                      <option value="Communication">Communication</option>
                      <option value="Social Skills">Social Skills</option>
                      <option value="Academics">Academics</option>
                      <option value="Independence">Independence</option>
                      <option value="Behavior">Behavior</option>
                      <option value="Motor Skills">Motor Skills</option>
                      <option value="Self-Care">Self-Care</option>
                      <option value="Vocational">Vocational</option>
                    </select>
                    {formData.iepGoalAlignment.length > 1 && (
                      <button
                        onClick={() => removeArrayField('iepGoalAlignment', index)}
                        style={{
                          padding: '0.75rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayField('iepGoalAlignment')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f0f9ff',
                    color: '#0369a1',
                    border: '2px dashed #0369a1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    fontWeight: '500'
                  }}
                >
                  + Add IEP Domain
                </button>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05))',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h4 style={{ color: '#7c3aed', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  💡 Accessibility Quick Tips
                </h4>
                <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span>👁️</span>
                    <span><strong>Visual:</strong> Large print, high contrast, visual supports, picture schedules</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span>👂</span>
                    <span><strong>Auditory:</strong> Reduce background noise, use FM systems, provide written instructions</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span>🧠</span>
                    <span><strong>Cognitive:</strong> Break into steps, provide extra time, use concrete examples</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span>🤝</span>
                    <span><strong>Social:</strong> Peer buddies, structured interactions, social stories</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 2rem',
          borderTop: '1px solid #e5e7eb',
          background: '#f8fafc'
        }}>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {lessonPlan ? 'Editing existing lesson plan' : 'Creating new lesson plan'}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                background: 'white',
                color: '#6b7280',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name.trim() || !formData.subject.trim()}
              style={{
                padding: '0.75rem 2rem',
                border: 'none',
                borderRadius: '8px',
                background: (!formData.name.trim() || !formData.subject.trim()) 
                  ? '#d1d5db' 
                  : 'linear-gradient(135deg, #059669, #10b981)',
                color: 'white',
                cursor: (!formData.name.trim() || !formData.subject.trim()) ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              {lessonPlan ? '💾 Save Changes' : '✨ Create Lesson Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated LessonPlansTab component with modal integration
const EnhancedLessonPlansTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [lessonPlans, setLessonPlans] = useState<LibraryContent[]>([]);
  const [stateStandards, setStateStandards] = useState<LibraryContent[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'lesson-plans' | 'standards'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LibraryContent | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = () => {
    const allContent = UnifiedDataService.getLibraryContent();
    setLessonPlans(allContent.filter(c => c.contentType === 'lesson-plan'));
    setStateStandards(allContent.filter(c => c.contentType === 'state-standard'));
  };

  const handleLessonSave = (lessonPlan: LibraryContent) => {
    // Save to UnifiedDataService
    if (editingLesson) {
      UnifiedDataService.updateLibraryContent(lessonPlan.id, lessonPlan);
      setLessonPlans(prev => prev.map(l => l.id === lessonPlan.id ? lessonPlan : l));
    } else {
      UnifiedDataService.addLibraryContent(lessonPlan);
      setLessonPlans(prev => [...prev, lessonPlan]);
    }

    // Close modal
    setIsModalOpen(false);
    setEditingLesson(null);

    // Dispatch update event
    window.dispatchEvent(new CustomEvent('libraryContentUpdated', {
      detail: { 
        content: lessonPlan,
        action: editingLesson ? 'updated' : 'created',
        contentType: 'lesson-plan'
      }
    }));
  };

  const handleStandardsUpload = (standards: StateStandardData[]) => {
    const standardsContent: LibraryContent[] = standards.map(standard => ({
      id: generateUniqueId('standard'),
      name: standard.standardCode,
      icon: '📚',
      category: 'academic' as const,
      contentType: 'state-standard' as const,
      defaultDuration: 0,
      description: standard.description,
      tags: [standard.subject, standard.complexity, ...standard.iepGoalDomains],
      isDeletable: true,
      isCustom: true,
      stateStandardData: standard,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Save to UnifiedDataService
    standardsContent.forEach(content => {
      UnifiedDataService.addLibraryContent(content);
    });

    // Update local state
    setStateStandards(prev => [...prev, ...standardsContent]);

    // Dispatch update event
    window.dispatchEvent(new CustomEvent('libraryContentUpdated', {
      detail: { 
        content: standardsContent,
        action: 'bulk-created',
        contentType: 'state-standard'
      }
    }));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Navigation and content sections remain the same as above */}
      {/* ... (previous JSX content) ... */}

      {/* Lesson Plan Modal */}
      <LessonPlanModal
        isOpen={isModalOpen}
        lessonPlan={editingLesson}
        availableStandards={stateStandards}
        onSave={handleLessonSave}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLesson(null);
        }}
      />
    </div>
  );
};

// Export the complete implementation
export { EnhancedLessonPlansTab, LessonPlanModal, StandardsUploadSection };

// State Standards Upload Component
const StandardsUploadSection: React.FC<{
  onStandardsUploaded: (standards: StateStandardData[]) => void;
  existingStandardsCount: number;
}> = ({ onStandardsUploaded, existingStandardsCount }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const fileContent = await file.text();
      
      // Simulate processing progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Parse the file content (JSON or CSV)
      let standards: StateStandardData[] = [];
      
      if (file.name.endsWith('.json')) {
        const jsonData = JSON.parse(fileContent);
        standards = parseJSONStandards(jsonData);
      } else if (file.name.endsWith('.csv')) {
        standards = parseCSVStandards(fileContent);
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.');
      }

      onStandardsUploaded(standards);
      alert(`✅ Successfully imported ${standards.length} state standards!`);
      
    } catch (error) {
      console.error('Error processing standards file:', error);
      alert(`❌ Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const parseJSONStandards = (jsonData: any): StateStandardData[] => {
    // Handle different JSON structures
    const standardsArray = Array.isArray(jsonData) ? jsonData : jsonData.standards || [jsonData];
    
    return standardsArray.map((item: any, index: number) => ({
      standardCode: item.code || item.standardCode || `STD-${index + 1}`,
      subject: item.subject || 'General',
      gradeLevel: Array.isArray(item.gradeLevel) ? item.gradeLevel : [item.gradeLevel || 'K'],
      description: item.description || item.text || '',
      learningObjectives: Array.isArray(item.objectives) ? item.objectives : [item.objective || ''].filter(Boolean),
      assessmentCriteria: item.assessmentCriteria || [],
      crossCurricularConnections: item.connections || [],
      iepGoalDomains: item.iepDomains || [],
      complexity: item.complexity || 'developing',
      prerequisites: item.prerequisites || [],
      state: item.state || 'Unknown'
    }));
  };

  const parseCSVStandards = (csvContent: string): StateStandardData[] => {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });

      return {
        standardCode: row.code || row.standardcode || `CSV-STD-${index + 1}`,
        subject: row.subject || 'General',
        gradeLevel: row.gradelevel ? row.gradelevel.split(';') : ['K'],
        description: row.description || row.text || '',
        learningObjectives: row.objectives ? row.objectives.split(';') : [],
        assessmentCriteria: row.assessmentcriteria ? row.assessmentcriteria.split(';') : [],
        crossCurricularConnections: row.connections ? row.connections.split(';') : [],
        iepGoalDomains: row.iepdomains ? row.iepdomains.split(';') : [],
        complexity: (row.complexity as any) || 'developing',
        prerequisites: row.prerequisites ? row.prerequisites.split(';') : [],
        state: row.state || 'Unknown'
      };
    });
  };

  return (
    <div style={{
      background: 'rgba(59, 130, 246, 0.05)',
      border: '2px dashed rgba(59, 130, 246, 0.3)',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      ...(isDragging && {
        background: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        transform: 'scale(1.02)'
      })
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
      <h3 style={{ color: '#3b82f6', marginBottom: '1rem', fontSize: '1.2rem' }}>
        Import State Standards
      </h3>
      
      {existingStandardsCount > 0 && (
        <div style={{ 
          background: 'rgba(34, 197, 94, 0.1)', 
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px', 
          padding: '0.75rem', 
          marginBottom: '1rem',
          color: '#16a34a'
        }}>
          ✅ {existingStandardsCount} standards currently loaded
        </div>
      )}

      {isProcessing ? (
        <div>
          <div style={{
            background: '#e5e7eb',
            borderRadius: '8px',
            height: '8px',
            marginBottom: '1rem',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              height: '100%',
              width: `${uploadProgress}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p>Processing standards... {uploadProgress}%</p>
        </div>
      ) : (
        <>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Upload a JSON or CSV file containing your state standards
          </p>
          
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const files = Array.from(e.dataTransfer.files);
              if (files[0]) handleFileUpload(files[0]);
            }}
          >
            <input
              type="file"
              accept=".json,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              style={{ display: 'none' }}
              id="standards-upload"
            />
            
            <label
              htmlFor="standards-upload"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              📤 Choose Standards File
            </label>
          </div>
          
          <div style={{ 
            marginTop: '1.5rem', 
            fontSize: '0.9rem', 
            color: '#6b7280',
            textAlign: 'left',
            maxWidth: '600px',
            margin: '1.5rem auto 0'
          }}>
            <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>Supported Formats:</h4>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li><strong>JSON:</strong> Array of standard objects with properties like code, subject, gradeLevel, description</li>
              <li><strong>CSV:</strong> Comma-separated with headers: code, subject, gradeLevel, description, objectives</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

// Enhanced Lesson Plans Tab Component
const LessonPlansTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [lessonPlans, setLessonPlans] = useState<LibraryContent[]>([]);
  const [stateStandards, setStateStandards] = useState<LibraryContent[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'lesson-plans' | 'standards'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LibraryContent | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = () => {
    const allContent = UnifiedDataService.getLibraryContent();
    setLessonPlans(allContent.filter(c => c.contentType === 'lesson-plan'));
    setStateStandards(allContent.filter(c => c.contentType === 'state-standard'));
  };

  const handleStandardsUpload = (standards: StateStandardData[]) => {
    const standardsContent: LibraryContent[] = standards.map(standard => ({
      id: generateUniqueId('standard'),
      name: standard.standardCode,
      icon: '📚',
      category: 'academic' as 'academic' | 'break' | 'other',
      contentType: 'state-standard' as const,
      defaultDuration: 0,
      description: standard.description,
      stateStandardData: standard,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeletable: true,
      isCustom: true,
      tags: [standard.subject, standard.complexity, ...standard.iepGoalDomains]
    }));

    // Save to UnifiedDataService
    standardsContent.forEach(content => {
      UnifiedDataService.addLibraryContent(content);
    });

    // Update local state
    setStateStandards(prev => [...prev, ...standardsContent]);
  };

  const handleLessonSave = (lessonPlan: LibraryContent) => {
    // Save to UnifiedDataService
    if (editingLesson) {
      UnifiedDataService.updateLibraryContent(lessonPlan.id, lessonPlan);
      setLessonPlans(prev => prev.map(l => (l.id === lessonPlan.id ? lessonPlan : l)));
    } else {
      UnifiedDataService.addLibraryContent(lessonPlan);
      setLessonPlans(prev => [...prev, lessonPlan]);
    }

    // Close modal
    setIsModalOpen(false);
    setEditingLesson(null);

    // Dispatch update event
    window.dispatchEvent(
      new CustomEvent('libraryContentUpdated', {
        detail: {
          content: lessonPlan,
          action: editingLesson ? 'updated' : 'created',
          contentType: 'lesson-plan',
        },
      })
    );
  };

  const filteredLessonPlans = lessonPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || plan.lessonPlanData?.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'all' || 
                        plan.lessonPlanData?.gradeLevel.includes(selectedGrade);
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  const subjects = [...new Set(lessonPlans.map(p => p.lessonPlanData?.subject).filter(Boolean))];
  const grades = [...new Set(lessonPlans.flatMap(p => p.lessonPlanData?.gradeLevel || []))];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '0.5rem',
        marginBottom: '2rem',
        border: '1px solid #e2e8f0'
      }}>
        {[
          { id: 'overview', icon: '📊', label: 'Overview' },
          { id: 'lesson-plans', icon: '📋', label: 'Lesson Plans' },
          { id: 'standards', icon: '📚', label: 'State Standards' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem',
              border: 'none',
              borderRadius: '8px',
              background: activeSection === tab.id ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
              color: activeSection === tab.id ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1))',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ color: '#3b82f6', marginBottom: '1rem' }}>Lesson Plans</h3>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.5rem' }}>
              {lessonPlans.length}
            </div>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Complete lesson plans with objectives, procedures, and assessments
            </p>
            <button
              onClick={() => setActiveSection('lesson-plans')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Manage Lessons
            </button>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(196, 181, 253, 0.1))',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>State Standards</h3>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#7c3aed', marginBottom: '0.5rem' }}>
              {stateStandards.length}
            </div>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Imported state standards for curriculum alignment
            </p>
            <button
              onClick={() => setActiveSection('standards')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Manage Standards
            </button>
          </div>
        </div>
      )}

      {/* Standards Section */}
      {activeSection === 'standards' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              📚 State Standards Repository
            </h3>
            <p style={{ color: '#6b7280' }}>
              Import and manage state standards for lesson plan alignment
            </p>
          </div>

          <StandardsUploadSection 
            onStandardsUploaded={handleStandardsUpload}
            existingStandardsCount={stateStandards.length}
          />

          {stateStandards.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>
                Loaded Standards ({stateStandards.length})
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                {stateStandards.slice(0, 6).map(standard => (
                  <div key={standard.id} style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <h5 style={{ margin: 0, color: '#1f2937', fontSize: '0.9rem', fontWeight: '600' }}>
                        {standard.name}
                      </h5>
                      <span style={{
                        background: '#f3f4f6',
                        color: '#6b7280',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}>
                        {standard.stateStandardData?.subject}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      color: '#6b7280',
                      fontSize: '0.8rem',
                      lineHeight: '1.4'
                    }}>
                      {standard.description?.slice(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
              {stateStandards.length > 6 && (
                <p style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280' }}>
                  ...and {stateStandards.length - 6} more standards
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lesson Plans Section */}
      {activeSection === 'lesson-plans' && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem' 
          }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                📋 Lesson Plans
              </h3>
              <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                Create and manage detailed lesson plans
              </p>
            </div>
            <button
              onClick={() => {
                setEditingLesson(null); // Clear any existing lesson
                setIsModalOpen(true);   // Open the modal
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 1.5rem',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ➕ Create Lesson Plan
            </button>
          </div>

          {/* Filters */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              placeholder="Search lesson plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            >
              <option value="all">All Grades</option>
              {grades.sort().map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>

          {/* Lesson Plans Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredLessonPlans.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#374151' }}>
                  No lesson plans found
                </h3>
                <p style={{ marginBottom: '1.5rem' }}>
                  Create your first lesson plan to get started
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Create Lesson Plan
                </button>
              </div>
            ) : (
              filteredLessonPlans.map(lesson => (
                <LessonPlanCard 
                  key={lesson.id}
                  lessonPlan={lesson}
                  onEdit={() => {
                    setEditingLesson(lesson);
                    setIsModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}
      {/* Add this at the end of your LessonPlansTab return statement */}
      <LessonPlanModal
        isOpen={isModalOpen}
        lessonPlan={editingLesson}
        availableStandards={stateStandards}
        onSave={handleLessonSave}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLesson(null);
        }}
      />
    </div>
  );
};

// Lesson Plan Card Component
const LessonPlanCard: React.FC<{
  lessonPlan: LibraryContent;
  onEdit: () => void;
}> = ({ lessonPlan, onEdit }) => {
  const data = lessonPlan.lessonPlanData;
  if (!data) return null;

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderLeft: '4px solid #059669',
      borderRadius: '8px',
      padding: '1.5rem',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div>
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#1f2937', fontSize: '1.1rem' }}>
            {lessonPlan.name}
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{
              background: '#dcfce7',
              color: '#16a34a',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {data.subject}
            </span>
            <span style={{
              background: '#ddd6fe',
              color: '#7c3aed',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {data.gradeLevel.join(', ')}
            </span>
          </div>
        </div>
        <div style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'right' }}>
          {data.duration}min
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h5 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '0.9rem' }}>
          Learning Objectives:
        </h5>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#6b7280', fontSize: '0.85rem' }}>
          {data.objectives.slice(0, 2).map((obj, index) => (
            <li key={index} style={{ marginBottom: '0.25rem' }}>{obj}</li>
          ))}
          {data.objectives.length > 2 && (
            <li style={{ color: '#9ca3af', fontStyle: 'italic' }}>
              +{data.objectives.length - 2} more objectives
            </li>
          )}
        </ul>
      </div>

      {data.linkedStandardIds.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '6px',
            padding: '0.5rem',
            fontSize: '0.8rem',
            color: '#92400e'
          }}>
            📚 Linked to {data.linkedStandardIds.length} state standards
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={onEdit}
          style={{
            flex: 1,
            padding: '0.5rem',
            background: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => {
            // Future: Export or duplicate functionality
            console.log('Export lesson plan:', lessonPlan);
          }}
          style={{
            padding: '0.5rem',
            background: 'transparent',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          📤
        </button>
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

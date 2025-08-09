// Enhanced UI Components for Smart Groups
// These components enhance the user experience with better feedback and modals

import React, { useState, useEffect } from 'react';
import { Check, X, Download, Calendar, ClipboardList, Users, FileText, Target, Clock, Star } from 'lucide-react';
import { exportLessonPlan, DownloadOptionsModal } from './enhanced-lesson-plan-download';

// Import types from SmartGroups
interface SmartGroupRecommendation {
  id: string;
  groupName: string;
  confidence: number;
  studentIds: string[];
  studentCount: number;
  standardsAddressed: any[];
  iepGoalsAddressed: any[];
  recommendedActivity: any;
  themeConnection?: any;
  benefits: string[];
  rationale: string;
  suggestedScheduling: any;
  dataCollectionPlan: any;
  generatedAt: string;
  teacherApproved?: boolean;
  implementationDate?: string;
}

interface DetailedLessonPlan {
  id: string;
  title: string;
  duration: number;
  theme: string;
  gradeLevel: string;
  objectives: LessonObjective[];
  materials: MaterialItem[];
  procedures: LessonStep[];
  assessments: AssessmentMethod[];
  accommodations: AccommodationStrategy[];
  extensions: ExtensionActivity[];
  standardsAddressed: any[];
  iepGoalsAddressed: any[];
  groupSize: number;
  staffRatio: string;
  setupInstructions: string[];
  cleanupInstructions: string[];
  dataCollectionPoints: DataCollectionPoint[];
  parentCommunication: string;
  generatedAt: string;
  lastModified: string;
  templateVersion: string;
}

interface LessonObjective {
  id: string;
  type: 'academic' | 'behavioral' | 'social';
  description: string;
  measurable: boolean;
  alignedStandard?: string;
  alignedIEPGoal?: string;
}

interface MaterialItem {
  name: string;
  quantity: number;
  location: string;
  alternatives?: string[];
  required: boolean;
}

interface LessonStep {
  stepNumber: number;
  phase: 'opening' | 'instruction' | 'practice' | 'closure';
  duration: number;
  instruction: string;
  teacherActions: string[];
  studentActions: string[];
  accommodations?: string[];
}

interface AssessmentMethod {
  type: 'formative' | 'summative';
  method: string;
  timing: 'during' | 'after';
  criteria: string[];
  dataCollection: boolean;
}

interface AccommodationStrategy {
  studentType: string;
  strategies: string[];
}

interface ExtensionActivity {
  title: string;
  description: string;
  difficulty: 'higher' | 'leadership';
  materials: string[];
  timeRequired: number;
}

interface DataCollectionPoint {
  id: string;
  moment: string;
  method: string;
  criteria: string[];
  iepGoalIds: string[];
}

// =============================================================================
// SUCCESS NOTIFICATION COMPONENT
// =============================================================================

interface SuccessNotificationProps {
  isVisible: boolean;
  title: string;
  message: string;
  actions?: Array<{ label: string; action: () => void; variant?: 'primary' | 'secondary' }>;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  isVisible,
  title,
  message,
  actions = [],
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
      zIndex: 10000,
      maxWidth: '400px',
      transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'all 0.3s ease-in-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          padding: '0.5rem',
          marginTop: '0.25rem'
        }}>
          <Check style={{ width: '1.5rem', height: '1.5rem' }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.1rem', 
            fontWeight: '700' 
          }}>
            {title}
          </h4>
          <p style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '0.9rem', 
            opacity: 0.9,
            lineHeight: '1.4'
          }}>
            {message}
          </p>
          
          {actions.length > 0 && (
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              flexWrap: 'wrap' 
            }}>
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  style={{
                    background: action.variant === 'secondary' 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'rgba(255, 255, 255, 0.9)',
                    color: action.variant === 'secondary' ? 'white' : '#059669',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Calendar style={{ width: '1rem', height: '1rem' }} />
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '4px',
            transition: 'background 0.2s ease'
          }}
        >
          <X style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// DATA COLLECTION SETUP PREVIEW
// =============================================================================

interface DataCollectionPreviewProps {
  dataCollectionReminders: any[];
  onSetupDataCollection: () => void;
}

export const DataCollectionPreview: React.FC<DataCollectionPreviewProps> = ({
  dataCollectionReminders,
  onSetupDataCollection
}) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      border: '1px solid #22c55e',
      borderRadius: '12px',
      padding: '1.5rem',
      margin: '1rem 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          background: '#22c55e',
          color: 'white',
          borderRadius: '50%',
          width: '2.5rem',
          height: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ClipboardList style={{ width: '1.25rem', height: '1.25rem' }} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#15803d' }}>Data Collection Setup</h4>
          <p style={{ margin: 0, color: '#166534', fontSize: '0.9rem' }}>
            {dataCollectionReminders.length} IEP goals ready for tracking
          </p>
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <h5 style={{ margin: '0 0 0.5rem 0', color: '#15803d', fontSize: '0.9rem' }}>
          Collection Points:
        </h5>
        {dataCollectionReminders.slice(0, 3).map((reminder, index) => (
          <div key={reminder.id} style={{
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '6px',
            padding: '0.5rem',
            marginBottom: '0.5rem',
            fontSize: '0.8rem',
            color: '#166534'
          }}>
            <strong>{reminder.groupName}</strong> - {reminder.measurementMoments.join(', ')}
          </div>
        ))}
        {dataCollectionReminders.length > 3 && (
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#166534', fontStyle: 'italic' }}>
            +{dataCollectionReminders.length - 3} more collection points
          </p>
        )}
      </div>

      <button
        onClick={onSetupDataCollection}
        style={{
          background: '#22c55e',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <Target style={{ width: '1rem', height: '1rem' }} />
        Setup Data Collection
      </button>
    </div>
  );
};

// =============================================================================
// IMPLEMENTATION STATUS TRACKER
// =============================================================================

interface ImplementationStatus {
  step: string;
  completed: boolean;
  inProgress: boolean;
  description: string;
}

interface ImplementationTrackerProps {
  steps: ImplementationStatus[];
}

export const ImplementationTracker: React.FC<ImplementationTrackerProps> = ({ steps }) => {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.5rem',
      margin: '1rem 0'
    }}>
      <h4 style={{ margin: '0 0 1rem 0', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ClipboardList style={{ width: '1.25rem', height: '1.25rem' }} />
        Implementation Progress
      </h4>
      
      <div style={{ position: 'relative' }}>
        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          left: '1rem',
          top: '1rem',
          bottom: '1rem',
          width: '2px',
          background: '#e2e8f0'
        }} />
        
        {steps.map((step, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: index === steps.length - 1 ? 0 : '1.5rem',
            position: 'relative'
          }}>
            {/* Step Indicator */}
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: step.completed ? '#22c55e' : 
                         step.inProgress ? '#3b82f6' : '#e2e8f0',
              color: step.completed || step.inProgress ? 'white' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: '700',
              position: 'relative',
              zIndex: 1
            }}>
              {step.completed ? (
                <Check style={{ width: '1rem', height: '1rem' }} />
              ) : step.inProgress ? (
                <div style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                index + 1
              )}
            </div>
            
            {/* Step Content */}
            <div style={{ flex: 1, paddingTop: '0.125rem' }}>
              <h5 style={{ 
                margin: '0 0 0.25rem 0', 
                color: step.completed ? '#22c55e' : 
                       step.inProgress ? '#3b82f6' : '#6b7280',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {step.step}
              </h5>
              <p style={{ 
                margin: 0, 
                color: '#6b7280', 
                fontSize: '0.8rem',
                lineHeight: '1.4'
              }}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// ENHANCED DETAILED LESSON MODAL
// =============================================================================

interface DetailedLessonModalProps {
  isOpen: boolean;
  recommendation: SmartGroupRecommendation;
  onClose: () => void;
  onGenerate: (recommendation: SmartGroupRecommendation) => Promise<DetailedLessonPlan>;
}

export const DetailedLessonModal: React.FC<DetailedLessonModalProps> = ({
  isOpen,
  recommendation,
  onClose,
  onGenerate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<DetailedLessonPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'procedures' | 'materials' | 'assessment'>('overview');
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const lesson = await onGenerate(recommendation);
      setGeneratedLesson(lesson);
    } catch (error) {
      console.error('Error generating lesson:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    setShowDownloadModal(true);
  };

  const handleDownloadWithOptions = async (format: string, options: any) => {
    try {
      await exportLessonPlan(generatedLesson!, options);
      console.log(`✅ Lesson plan downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
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
      zIndex: 9999,
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '20px 20px 0 0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: '700' }}>
                Detailed Lesson Plan Generator
              </h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
                {recommendation.groupName}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <X style={{ width: '1.5rem', height: '1.5rem' }} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '2rem', maxHeight: '60vh', overflow: 'auto' }}>
          {!generatedLesson ? (
            // Pre-generation view
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <FileText style={{ 
                  width: '4rem', 
                  height: '4rem', 
                  margin: '0 auto 1rem auto',
                  color: '#667eea'
                }} />
                <h3 style={{ margin: '0 0 1rem 0', color: '#1a202c' }}>
                  Generate Comprehensive Lesson Plan
                </h3>
                <p style={{ margin: '0 0 2rem 0', color: '#4a5568', lineHeight: '1.6' }}>
                  Create a detailed, standards-aligned lesson plan with step-by-step procedures, 
                  materials list, accommodations, and data collection points.
                </p>
                
                {/* Preview Features */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <Target style={{ width: '2rem', height: '2rem', color: '#667eea', margin: '0 auto 0.5rem auto' }} />
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: '600' }}>Learning Objectives</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Aligned to IEP goals & standards</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <ClipboardList style={{ width: '2rem', height: '2rem', color: '#667eea', margin: '0 auto 0.5rem auto' }} />
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: '600' }}>Step-by-Step</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Detailed procedures</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Users style={{ width: '2rem', height: '2rem', color: '#667eea', margin: '0 auto 0.5rem auto' }} />
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: '600' }}>Accommodations</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Student-specific supports</p>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{
                    background: isGenerating 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem 2rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    margin: '0 auto',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  {isGenerating ? (
                    <>
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Generating Lesson Plan...
                    </>
                  ) : (
                    <>
                      <Star style={{ width: '1.25rem', height: '1.25rem' }} />
                      Generate Detailed Lesson Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Post-generation view with basic content
            <div>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1a202c' }}>Lesson Plan Generated</h3>
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>{generatedLesson.title}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600' }}>DURATION</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#1a202c' }}>
                      {generatedLesson.duration} minutes
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600' }}>GROUP SIZE</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#1a202c' }}>
                      {generatedLesson.groupSize} students
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600' }}>THEME</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#1a202c' }}>
                      {generatedLesson.theme}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  onClick={handleDownload}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Download style={{ width: '1.25rem', height: '1.25rem' }} />
                  Download Lesson Plan
                </button>
                
                <button
                  onClick={() => {
                    // Save to lesson library
                    console.log('Saving to lesson library...');
                  }}
                  style={{
                    background: 'transparent',
                    color: '#667eea',
                    border: '2px solid #667eea',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Save to Library
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Download Modal */}
      {showDownloadModal && generatedLesson && (
        <DownloadOptionsModal
          isOpen={showDownloadModal}
          lessonPlan={generatedLesson}
          onClose={() => setShowDownloadModal(false)}
          onDownload={handleDownloadWithOptions}
        />
      )}
    </div>
  );
};

// =============================================================================
// ENHANCED IMPLEMENT BUTTON WITH LOADING STATES
// =============================================================================

interface EnhancedImplementButtonProps {
  recommendation: SmartGroupRecommendation;
  onImplement: (rec: SmartGroupRecommendation) => Promise<void>;
  isImplementing: boolean;
}

export const EnhancedImplementButton: React.FC<EnhancedImplementButtonProps> = ({
  recommendation,
  onImplement,
  isImplementing
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = async () => {
    try {
      await onImplement(recommendation);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Implementation failed:', error);
    }
  };

  if (showSuccess) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '16px',
        fontSize: '1.1rem',
        fontWeight: '700'
      }}>
        <Check style={{ width: '1.25rem', height: '1.25rem' }} />
        Successfully Implemented!
      </div>
    );
  }

  return (
    <button 
      onClick={handleClick}
      disabled={isImplementing}
      style={{
        flex: '1',
        minWidth: '200px',
        background: isImplementing 
          ? '#9ca3af' 
          : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        color: 'white',
        border: 'none',
        padding: '1rem 1.5rem',
        borderRadius: '16px',
        cursor: isImplementing ? 'not-allowed' : 'pointer',
        fontSize: '1.1rem',
        fontWeight: '700',
        transition: 'all 0.3s ease',
        boxShadow: isImplementing 
          ? '0 2px 8px rgba(156, 163, 175, 0.3)' 
          : '0 4px 15px rgba(40, 167, 69, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}
    >
      {isImplementing ? (
        <>
          <div style={{
            width: '1.25rem',
            height: '1.25rem',
            border: '2px solid transparent',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Implementing...
        </>
      ) : (
        <>
          <Users style={{ width: '1.25rem', height: '1.25rem' }} />
          Implement This Group
        </>
      )}
    </button>
  );
};

// =============================================================================
// SCHEDULE INTEGRATION PREVIEW COMPONENT
// =============================================================================

interface SchedulePreviewProps {
  scheduleEntry: any;
  onViewFullSchedule: () => void;
}

export const SchedulePreview: React.FC<SchedulePreviewProps> = ({
  scheduleEntry,
  onViewFullSchedule
}) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      border: '1px solid #3b82f6',
      borderRadius: '12px',
      padding: '1.5rem',
      margin: '1rem 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          background: '#3b82f6',
          color: 'white',
          borderRadius: '50%',
          width: '2.5rem',
          height: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Calendar style={{ width: '1.25rem', height: '1.25rem' }} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e40af' }}>Added to Schedule</h4>
          <p style={{ margin: 0, color: '#3730a3', fontSize: '0.9rem' }}>
            {scheduleEntry.groupName} • {scheduleEntry.scheduledTime} • {scheduleEntry.duration} min
          </p>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: '#3730a3', fontWeight: '600', textTransform: 'uppercase' }}>
            Frequency
          </span>
          <p style={{ margin: '0.25rem 0 0 0', color: '#1e40af', fontWeight: '600' }}>
            {scheduleEntry.frequency}
          </p>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', color: '#3730a3', fontWeight: '600', textTransform: 'uppercase' }}>
            Students
          </span>
          <p style={{ margin: '0.25rem 0 0 0', color: '#1e40af', fontWeight: '600' }}>
            {scheduleEntry.studentIds.length}
          </p>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', color: '#3730a3', fontWeight: '600', textTransform: 'uppercase' }}>
            Start Date
          </span>
          <p style={{ margin: '0.25rem 0 0 0', color: '#1e40af', fontWeight: '600' }}>
            {new Date(scheduleEntry.startDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <button
        onClick={onViewFullSchedule}
        style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <Calendar style={{ width: '1rem', height: '1rem' }} />
        View Full Schedule
      </button>
    </div>
  );
};

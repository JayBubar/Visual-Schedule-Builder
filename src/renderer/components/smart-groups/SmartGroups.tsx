// SmartGroups.tsx - Main Smart Groups Component
// Integrates with existing UnifiedDataService and Bloom app architecture

import React, { useState, useEffect } from 'react';
import { Brain, Calendar, Target, Users, Lightbulb, Settings, Upload, Download, Play, Check, X, Star, Clock, BookOpen, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import UnifiedDataService, { UnifiedStudent, IEPGoal, UnifiedActivity } from '../../services/unifiedDataService';

// Import our Smart Groups types and services
interface SmartGroupRecommendation {
  id: string;
  groupName: string;
  confidence: number;
  studentIds: string[];
  studentCount: number;
  standardsAddressed: {
    standardId: string;
    standard: StateStandard;
    coverageReason: string;
  }[];
  iepGoalsAddressed: {
    goalId: string;
    studentId: string;
    goal: IEPGoal;
    alignmentReason: string;
  }[];
  recommendedActivity: {
    activityId: string;
    activity: UnifiedActivity;
    adaptations: string[];
    duration: number;
    materials: string[];
    setup: string;
    implementation: string;
  };
  themeConnection?: {
    themeId: string;
    relevance: string;
    thematicElements: string[];
  };
  benefits: string[];
  rationale: string;
  suggestedScheduling: {
    frequency: 'daily' | 'weekly' | 'bi-weekly';
    duration: number;
    preferredTimes: string[];
  };
  dataCollectionPlan: {
    goalIds: string[];
    measurementMoments: string[];
    collectionMethod: string;
    successCriteria: string[];
  };
  generatedAt: string;
  teacherApproved?: boolean;
  implementationDate?: string;
}

interface StateStandard {
  id: string;
  code: string;
  state: string;
  grade: string;
  subject: 'ELA' | 'Math' | 'Science' | 'Social Studies';
  domain: string;
  title: string;
  description: string;
  subSkills: string[];
  complexity: 1 | 2 | 3 | 4 | 5;
}

interface SmartGroupsProps {
  isActive: boolean;
  onRecommendationImplemented?: (recommendation: SmartGroupRecommendation) => void;
}

const SmartGroups: React.FC<SmartGroupsProps> = ({ isActive, onRecommendationImplemented }) => {
  // ===== STATE MANAGEMENT =====
  const [currentView, setCurrentView] = useState<'setup' | 'recommendations' | 'implemented' | 'settings'>('setup');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<SmartGroupRecommendation[]>([]);
  const [implementedGroups, setImplementedGroups] = useState<SmartGroupRecommendation[]>([]);
  
  // Configuration state
  const [selectedState, setSelectedState] = useState('SC');
  const [selectedGrade, setSelectedGrade] = useState('3');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [customTheme, setCustomTheme] = useState('');
  
  // Data state
  const [students, setStudents] = useState<UnifiedStudent[]>([]);
  const [activities, setActivities] = useState<UnifiedActivity[]>([]);
  const [curriculumUploaded, setCurriculumUploaded] = useState(false);
  
  // UI state
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  // ===== PREDEFINED THEMES =====
  const predefinedThemes = {
    1: ['New Year Goals', 'Winter Weather', 'Martin Luther King Jr.', 'Arctic Animals'],
    2: ['Community Helpers', 'Presidents Day', 'Dental Health', 'Love & Friendship'],
    3: ['St. Patrick\'s Day', 'Spring Awakening', 'Weather Changes', 'Plants Growing'],
    4: ['Spring & New Growth', 'Easter & Rebirth', 'Weather & Lifecycle', 'Earth Day'],
    5: ['Mother\'s Day', 'Flowers & Gardens', 'Insects & Butterflies', 'May Day'],
    6: ['Father\'s Day', 'Summer Safety', 'Ocean & Beach', 'End of School'],
    7: ['Summer Fun', 'Independence Day', 'Space & Stars', 'Vacation Adventures'],
    8: ['Back to School', 'Community & Friendship', 'Summer Memories', 'New Beginnings'],
    9: ['Fall Harvest', 'Apples & Pumpkins', 'School Community', 'Changing Seasons'],
    10: ['Halloween Fun', 'Autumn Leaves', 'Fire Safety', 'Nocturnal Animals'],
    11: ['Thanksgiving', 'Gratitude & Family', 'Native Americans', 'Trees & Leaves'],
    12: ['Winter Celebrations', 'Light & Dark', 'Holiday Traditions', 'Winter Animals']
  };

  // ===== EFFECTS =====
  useEffect(() => {
    if (isActive) {
      loadData();
    }
  }, [isActive]);

  // ===== DATA LOADING =====
  const loadData = () => {
    try {
      const allStudents = UnifiedDataService.getAllStudents();
      const allActivities = UnifiedDataService.getAllActivities();
      
      console.log('🔍 SMART GROUPS DEBUG - Raw student data:', allStudents);
      console.log('🔍 SMART GROUPS DEBUG - First student structure:', allStudents[0]);
      
      // Check each student's IEP data structure
      allStudents.forEach((student, index) => {
        console.log(`🔍 Student ${index + 1} (${student.name}):`, {
          hasIepData: !!student.iepData,
          iepDataStructure: student.iepData,
          goalsCount: student.iepData?.goals?.length || 0,
          goals: student.iepData?.goals
        });
      });
      
      // Filter students with IEP goals
      const studentsWithGoals = allStudents.filter(student => 
        student.iepData?.goals && student.iepData.goals.length > 0
      );
      
      console.log('🔍 SMART GROUPS DEBUG - Students with goals:', studentsWithGoals);
      
      setStudents(studentsWithGoals);
      setActivities(allActivities);
      
      console.log('📚 Smart Groups loaded:', {
        totalStudents: allStudents.length,
        studentsWithGoals: studentsWithGoals.length,
        activities: allActivities.length,
        totalGoals: studentsWithGoals.reduce((total, s) => total + (s.iepData?.goals?.length || 0), 0)
      });
    } catch (error) {
      console.error('❌ Error loading Smart Groups data:', error);
    }
  };

  // ===== AI ANALYSIS SIMULATION =====
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis with realistic delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockRecommendations = generateMockRecommendations();
      setRecommendations(mockRecommendations);
      setCurrentView('recommendations');
      
      console.log('🧠 AI Analysis complete:', mockRecommendations.length, 'recommendations generated');
    } catch (error) {
      console.error('❌ AI Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ===== MOCK DATA GENERATION =====
  const generateMockRecommendations = (): SmartGroupRecommendation[] => {
    const activeTheme = customTheme || selectedTheme || 'Spring Learning';
    
    return [
      {
        id: `rec_${Date.now()}_1`,
        groupName: `${activeTheme} Reading Comprehension Group`,
        confidence: 94,
        studentIds: students.slice(0, Math.min(3, students.length)).map(s => s.id),
        studentCount: Math.min(3, students.length),
        standardsAddressed: [{
          standardId: 'CCSS.ELA.3.2',
          standard: {
            id: 'CCSS.ELA.3.2',
            code: 'CCSS.ELA-LITERACY.RL.3.2',
            state: selectedState,
            grade: selectedGrade,
            subject: 'ELA',
            domain: 'Reading Literature',
            title: 'Determine Central Message',
            description: 'Recount stories, including fables and folktales; determine the central message, lesson, or moral',
            subSkills: ['main idea', 'supporting details', 'theme identification'],
            complexity: 3
          },
          coverageReason: 'Activity provides structured practice with story analysis and theme identification'
        }],
        iepGoalsAddressed: students.slice(0, Math.min(3, students.length)).filter(s => s.iepData?.goals).map(student => {
          const goal = student.iepData!.goals[0];
          return {
            goalId: goal.id,
            studentId: student.id,
            goal,
            alignmentReason: `${activeTheme} themed stories provide engaging context for comprehension work`
          };
        }),
        recommendedActivity: {
          activityId: 'reading_comprehension_themed',
          activity: {
            id: 'reading_comprehension_themed',
            name: `${activeTheme} Story Mapping`,
            category: 'academic',
            description: `Interactive story analysis using ${activeTheme.toLowerCase()} themed books`,
            duration: 25,
            materials: ['Themed storybooks', 'Graphic organizers', 'Discussion prompts'],
            instructions: 'Students read themed stories and map main ideas using visual organizers',
            isCustom: true,
            dateCreated: new Date().toISOString()
          },
          adaptations: [
            'Use visual supports for story elements',
            'Provide choice of books at different reading levels',
            'Include audio support for struggling readers'
          ],
          duration: 25,
          materials: ['Themed storybooks', 'Story map templates', 'Discussion cards', 'Timer'],
          setup: 'Arrange students in semi-circle with story materials and graphic organizers ready',
          implementation: 'Guide students through story reading, mapping main ideas, and discussing themes'
        },
        themeConnection: {
          themeId: `theme_${selectedMonth}_${activeTheme}`,
          relevance: `All reading materials connect to ${activeTheme} theme for cohesive learning experience`,
          thematicElements: [activeTheme.toLowerCase(), 'seasonal connections', 'vocabulary building']
        },
        benefits: [
          `Covers required ${selectedGrade}rd grade ELA standard`,
          `Targets reading comprehension IEP goals for ${Math.min(3, students.length)} students`,
          'Efficient small group instruction with built-in data collection',
          `Integrates with ${activeTheme} theme for engaging, cohesive learning`,
          'Natural opportunities for peer learning and discussion'
        ],
        rationale: `This small group optimally combines ${selectedState} state standard CCSS.ELA.3.2 with aligned IEP reading goals. The ${activeTheme} themed approach maintains student engagement while providing structured opportunities for comprehension skill practice and progress monitoring.`,
        suggestedScheduling: {
          frequency: 'daily',
          duration: 25,
          preferredTimes: ['9:00 AM', '10:30 AM', '1:00 PM']
        },
        dataCollectionPlan: {
          goalIds: students.slice(0, Math.min(3, students.length)).filter(s => s.iepData?.goals).map(s => s.iepData!.goals[0].id),
          measurementMoments: ['Story preview', 'During mapping', 'Discussion wrap-up'],
          collectionMethod: 'Observational with quick rating scale',
          successCriteria: ['Identifies main idea independently', 'Uses graphic organizer correctly', 'Participates in discussion']
        },
        generatedAt: new Date().toISOString()
      }
    ];
  };

  // ===== IMPLEMENTATION HANDLERS =====
  const implementRecommendation = (recommendation: SmartGroupRecommendation) => {
    try {
      // Create activity in UnifiedDataService
      const groupActivity = {
        id: `smart_group_${recommendation.id}`,
        name: recommendation.groupName,
        category: 'academic' as any,
        description: recommendation.rationale,
        duration: recommendation.recommendedActivity.duration,
        materials: recommendation.recommendedActivity.materials,
        instructions: recommendation.recommendedActivity.implementation,
        isCustom: true,
        linkedGoalIds: recommendation.iepGoalsAddressed.map(g => g.goalId)
      };

      UnifiedDataService.addActivity(groupActivity);

      // Mark as implemented
      recommendation.teacherApproved = true;
      recommendation.implementationDate = new Date().toISOString();
      
      // Move to implemented groups
      setImplementedGroups(prev => [...prev, recommendation]);
      setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));

      // Callback for parent component
      onRecommendationImplemented?.(recommendation);

      console.log('✅ Smart Group implemented:', recommendation.groupName);
    } catch (error) {
      console.error('❌ Error implementing recommendation:', error);
    }
  };

  const rejectRecommendation = (recommendationId: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
  };

  // ===== FILE UPLOAD HANDLER =====
  const handleCurriculumUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate curriculum processing
      setTimeout(() => {
        setCurriculumUploaded(true);
        console.log('📄 Curriculum uploaded:', file.name);
      }, 1000);
    }
  };

  // ===== RENDER HELPER COMPONENTS =====
  const renderSetupView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Configuration Panel */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top accent bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px 20px 0 0'
        }} />
        
        <h2 style={{
          margin: '0 0 2rem 0',
          color: '#2c3e50',
          fontSize: '1.6rem',
          fontWeight: '700',
          textAlign: 'center',
          position: 'relative',
          paddingBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem'
        }}>
          <Settings style={{ width: '1.5rem', height: '1.5rem', color: '#667eea' }} />
          Smart Groups Configuration
        </h2>
        
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '3px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '2px',
          marginTop: '1rem'
        }} />
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* State Selection */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#495057',
              marginBottom: '0.5rem'
            }}>
              State Standards
            </label>
            <select 
              value={selectedState} 
              onChange={(e) => setSelectedState(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e1e8ed',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '500',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.15)';
                e.target.style.background = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e1e8ed';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)';
              }}
            >
              <option value="SC">South Carolina</option>
              <option value="NC">North Carolina</option>
              <option value="GA">Georgia</option>
              <option value="FL">Florida</option>
              <option value="TN">Tennessee</option>
              <option value="VA">Virginia</option>
            </select>
          </div>

          {/* Grade Selection */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#495057',
              marginBottom: '0.5rem'
            }}>
              Grade Level
            </label>
            <select 
              value={selectedGrade} 
              onChange={(e) => setSelectedGrade(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e1e8ed',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '500',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.15)';
                e.target.style.background = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e1e8ed';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)';
              }}
            >
              <option value="K">Kindergarten</option>
              <option value="1">1st Grade</option>
              <option value="2">2nd Grade</option>
              <option value="3">3rd Grade</option>
              <option value="4">4th Grade</option>
              <option value="5">5th Grade</option>
            </select>
          </div>

          {/* Month Selection */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#495057',
              marginBottom: '0.5rem'
            }}>
              Target Month
            </label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e1e8ed',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '500',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.15)';
                e.target.style.background = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e1e8ed';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)';
              }}
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2025, i, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          {/* Analysis Button */}
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button 
              onClick={runAIAnalysis}
              disabled={isAnalyzing || students.length === 0}
              style={{
                width: '100%',
                background: isAnalyzing || students.length === 0 
                  ? 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: isAnalyzing || students.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                boxShadow: isAnalyzing || students.length === 0 
                  ? 'none'
                  : '0 4px 15px rgba(102, 126, 234, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isAnalyzing && students.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isAnalyzing && students.length > 0) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }
              }}
            >
              {isAnalyzing ? (
                <>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain style={{ width: '1rem', height: '1rem' }} />
                  Generate Groups
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top accent bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #28a745 0%, #20c997 100%)',
          borderRadius: '20px 20px 0 0'
        }} />
        
        <h3 style={{
          margin: '0 0 1.5rem 0',
          color: '#2c3e50',
          fontSize: '1.3rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#28a745' }} />
          Theme Selection for {new Date(2025, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' })}
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          {(predefinedThemes[selectedMonth as keyof typeof predefinedThemes] || []).map((theme) => (
            <button
              key={theme}
              onClick={() => {setSelectedTheme(theme); setCustomTheme('');}}
              style={{
                textAlign: 'left',
                padding: '1rem',
                borderRadius: '12px',
                border: selectedTheme === theme 
                  ? '2px solid #28a745' 
                  : '2px solid #e1e8ed',
                background: selectedTheme === theme 
                  ? 'linear-gradient(145deg, #e8f5e8 0%, #d4edda 100%)' 
                  : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                color: selectedTheme === theme ? '#155724' : '#2c3e50',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                fontWeight: '600',
                boxShadow: selectedTheme === theme 
                  ? '0 4px 12px rgba(40, 167, 69, 0.2)'
                  : '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                if (selectedTheme !== theme) {
                  e.currentTarget.style.borderColor = '#28a745';
                  e.currentTarget.style.background = 'linear-gradient(145deg, #f8fff8 0%, #f0fff0 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTheme !== theme) {
                  e.currentTarget.style.borderColor = '#e1e8ed';
                  e.currentTarget.style.background = 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              {theme}
            </button>
          ))}
        </div>
        
        <div>
          <input
            type="text"
            placeholder="Or enter custom theme..."
            value={customTheme}
            onChange={(e) => {setCustomTheme(e.target.value); setSelectedTheme('');}}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '2px solid #e1e8ed',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '500',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#28a745';
              e.target.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.15)';
              e.target.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e1e8ed';
              e.target.style.boxShadow = 'none';
              e.target.style.background = 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)';
            }}
          />
        </div>
      </div>

      {/* Data Summary */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top accent bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #dc3545 0%, #e74c3c 100%)',
          borderRadius: '20px 20px 0 0'
        }} />
        
        <h3 style={{
          margin: '0 0 1.5rem 0',
          color: '#2c3e50',
          fontSize: '1.3rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Target style={{ width: '1.25rem', height: '1.25rem', color: '#dc3545' }} />
          Current Data Summary
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #e3f2fd 0%, #bbdefb 100%)',
            padding: '1.5rem',
            borderRadius: '16px',
            textAlign: 'center',
            border: '2px solid #2196f3',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
          }}>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1976d2',
              margin: '0 0 0.5rem 0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              {students.length}
            </p>
            <p style={{
              fontSize: '0.85rem',
              color: '#1565c0',
              margin: '0',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Students with IEP Goals
            </p>
          </div>
          
          <div style={{
            background: 'linear-gradient(145deg, #e8f5e8 0%, #d4edda 100%)',
            padding: '1.5rem',
            borderRadius: '16px',
            textAlign: 'center',
            border: '2px solid #28a745',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.2)'
          }}>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#155724',
              margin: '0 0 0.5rem 0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              {students.reduce((total, s) => total + (s.iepData?.goals?.length || 0), 0)}
            </p>
            <p style={{
              fontSize: '0.85rem',
              color: '#155724',
              margin: '0',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Total IEP Goals
            </p>
          </div>
          
          <div style={{
            background: 'linear-gradient(145deg, #f3e5f5 0%, #e1bee7 100%)',
            padding: '1.5rem',
            borderRadius: '16px',
            textAlign: 'center',
            border: '2px solid #9c27b0',
            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.2)'
          }}>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#6a1b9a',
              margin: '0 0 0.5rem 0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              {activities.length}
            </p>
            <p style={{
              fontSize: '0.85rem',
              color: '#6a1b9a',
              margin: '0',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Available Activities
            </p>
          </div>
          
          <div style={{
            background: 'linear-gradient(145deg, #fff3e0 0%, #ffe0b2 100%)',
            padding: '1.5rem',
            borderRadius: '16px',
            textAlign: 'center',
            border: '2px solid #ff9800',
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)'
          }}>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#e65100',
              margin: '0 0 0.5rem 0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              {selectedTheme || customTheme ? '✓' : '○'}
            </p>
            <p style={{
              fontSize: '0.85rem',
              color: '#e65100',
              margin: '0',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Theme Selected
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecommendationsView = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">AI Recommendations Ready!</h2>
            <p className="text-purple-100 text-lg">
              Found {recommendations.length} optimal small group opportunities
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            <span className="text-xl font-bold">Smart Groups</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.map((rec) => (
        <div key={rec.id} className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-all duration-300">
          {/* Header with Confidence Badge */}
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">{rec.groupName}</h3>
                <p className="text-emerald-100 text-sm">AI-optimized small group recommendation</p>
              </div>
              <div className="flex items-center gap-6">
                {/* Confidence Score - Prominent */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-300" />
                    <span className="text-2xl font-bold">{rec.confidence}%</span>
                  </div>
                  <p className="text-xs text-emerald-100 text-center">Match</p>
                </div>
                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-emerald-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">{rec.studentCount} Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">{rec.recommendedActivity.duration} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content with Better Structure */}
          <div className="p-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Left Column - Standards & Goals */}
              <div className="space-y-6">
                {/* Standards Section */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    Standards Addressed
                  </h4>
                  {rec.standardsAddressed.map((std, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                          {std.standard.subject}
                        </div>
                        <div className="flex-1">
                          <p className="font-mono text-sm font-bold text-blue-800 mb-2">{std.standard.code}</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{std.standard.description}</p>
                          <p className="text-xs text-blue-600 mt-2 italic">{std.coverageReason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* IEP Goals Section */}
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                  <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    IEP Goals ({rec.iepGoalsAddressed.length})
                  </h4>
                  <div className="space-y-3">
                    {rec.iepGoalsAddressed.map((goal, idx) => {
                      const student = students.find(s => s.id === goal.studentId);
                      return (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-800 font-bold text-sm">
                                {student?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-green-800 mb-1">{student?.name}</p>
                              <p className="text-sm text-gray-700 mb-2">{goal.goal.shortTermObjective}</p>
                              <p className="text-xs text-green-600 italic">{goal.alignmentReason}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column - Activity & Benefits */}
              <div className="space-y-6">
                {/* Recommended Activity */}
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  <h4 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    Recommended Activity
                  </h4>
                  <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
                    <h5 className="text-xl font-bold text-gray-900 mb-3">{rec.recommendedActivity.activity.name}</h5>
                    <p className="text-gray-700 mb-4 leading-relaxed">{rec.recommendedActivity.activity.description}</p>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-sm font-semibold text-amber-800 mb-1">Materials Needed:</p>
                        <p className="text-sm text-gray-700">{rec.recommendedActivity.materials.join(', ')}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-sm font-semibold text-amber-800 mb-1">Setup:</p>
                        <p className="text-sm text-gray-700">{rec.recommendedActivity.setup}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                  <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    Why This Works
                  </h4>
                  <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm">
                    <ul className="space-y-3">
                      {rec.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="p-1 bg-green-100 rounded-full mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700 leading-relaxed">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Theme Integration */}
                {rec.themeConnection && (
                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                    <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-3">
                      <div className="p-2 bg-indigo-500 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      Theme Integration
                    </h4>
                    <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm">
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">{rec.themeConnection.relevance}</p>
                      <div className="flex flex-wrap gap-2">
                        {rec.themeConnection.thematicElements.map((element, idx) => (
                          <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full border border-indigo-200">
                            {element}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Improved Styling */}
            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t-2 border-gray-100">
              <button 
                onClick={() => implementRecommendation(rec)}
                className="flex-1 min-w-[200px] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-6 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 font-bold text-lg"
              >
                <Play className="w-5 h-5" />
                Implement This Group
              </button>
              <button 
                onClick={() => setExpandedRecommendation(expandedRecommendation === rec.id ? null : rec.id)}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
              >
                {expandedRecommendation === rec.id ? 'Show Less' : 'Show Details'}
              </button>
              <button 
                onClick={() => rejectRecommendation(rec.id)}
                className="px-4 py-4 border-2 border-red-300 text-red-700 rounded-2xl hover:bg-red-50 hover:border-red-400 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {recommendations.length === 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No Recommendations Yet</h3>
          <p className="text-gray-600 mb-8 text-lg">Run the AI analysis to generate smart group recommendations.</p>
          <button 
            onClick={() => setCurrentView('setup')}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl hover:bg-blue-700 transition-colors font-semibold"
          >
            Back to Setup
          </button>
        </div>
      )}
    </div>
  );

  const renderImplementedView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Active Smart Groups</h2>
            <p className="text-green-100 mt-1">
              {implementedGroups.length} groups currently running
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-6 h-6 text-green-200" />
            <span className="text-lg font-semibold">Implemented</span>
          </div>
        </div>
      </div>

      {/* Implemented Groups */}
      {implementedGroups.map((group) => (
        <div key={group.id} className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{group.groupName}</h3>
              <p className="text-sm text-gray-600">
                Implemented on {new Date(group.implementationDate!).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
              <Check className="w-4 h-4" />
              <span className="text-sm font-semibold">Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Students</p>
              <p className="text-lg font-bold text-blue-600">{group.studentCount}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800">IEP Goals</p>
              <p className="text-lg font-bold text-green-600">{group.iepGoalsAddressed.length}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-purple-800">Confidence</p>
              <p className="text-lg font-bold text-purple-600">{group.confidence}%</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View Progress Data
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Edit Group
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      ))}

      {implementedGroups.length === 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Groups</h3>
          <p className="text-gray-600 mb-4">Implement AI recommendations to see your active smart groups here.</p>
          <button 
            onClick={() => setCurrentView(recommendations.length > 0 ? 'recommendations' : 'setup')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            {recommendations.length > 0 ? 'View Recommendations' : 'Generate Recommendations'}
          </button>
        </div>
      )}
    </div>
  );

  // ===== MAIN RENDER =====
  if (!isActive) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Smart Groups AI</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI-powered curriculum alignment that maps state standards to IEP goals and suggests optimal small group activities
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setCurrentView('setup')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                currentView === 'setup' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Setup & Config
            </button>
            <button
              onClick={() => setCurrentView('recommendations')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                currentView === 'recommendations' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Recommendations ({recommendations.length})
            </button>
            <button
              onClick={() => setCurrentView('implemented')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                currentView === 'implemented' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active Groups ({implementedGroups.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {currentView === 'setup' && renderSetupView()}
        {currentView === 'recommendations' && renderRecommendationsView()}
        {currentView === 'implemented' && renderImplementedView()}
      </div>
    </div>
  );
};

export default SmartGroups;

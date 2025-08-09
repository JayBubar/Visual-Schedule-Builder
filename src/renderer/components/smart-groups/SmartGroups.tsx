// SmartGroups.tsx - Main Smart Groups Component
// Integrates with existing UnifiedDataService and Bloom app architecture

import React, { useState, useEffect } from 'react';
import { Brain, Calendar, Target, Users, Lightbulb, Settings, Upload, Download, Play, Check, X, Star, Clock, BookOpen, TrendingUp, AlertCircle, Sparkles, Database } from 'lucide-react';
import UnifiedDataService, { UnifiedStudent, IEPGoal, UnifiedActivity } from '../../services/unifiedDataService';
import { 
  SuccessNotification, 
  DataCollectionPreview, 
  ImplementationTracker, 
  DetailedLessonModal, 
  EnhancedImplementButton, 
  SchedulePreview 
} from './SmartGroupsEnhancedUI';
import { QuickVerificationPanel, SmartGroupsVerificationDashboard } from './SmartGroupsVerification';
import { SmartGroupsDebugPanel } from './SmartGroupsDebugPanel';
import { generateRealSmartGroupRecommendations } from './real-claude-ai-integration';

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
  subject: 'ELA' | 'Math' | 'Science' | 'Social Studies' | 'Art' | 'PE';
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
  const [currentView, setCurrentView] = useState<'setup' | 'recommendations' | 'implemented' | 'verification'>('setup');
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

  // ===== NEW ENHANCED UI STATE =====
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isImplementing, setIsImplementing] = useState(false);
  const [implementationSteps, setImplementationSteps] = useState([
    { id: 'create-activity', label: 'Creating activity in system', status: 'pending' as const },
    { id: 'schedule-integration', label: 'Adding to daily schedule', status: 'pending' as const },
    { id: 'data-collection', label: 'Setting up data collection', status: 'pending' as const },
    { id: 'notifications', label: 'Creating reminders', status: 'pending' as const },
    { id: 'finalize', label: 'Finalizing implementation', status: 'pending' as const }
  ]);
  const [selectedRecommendationForDetail, setSelectedRecommendationForDetail] = useState<SmartGroupRecommendation | null>(null);
  const [showImplementationTracker, setShowImplementationTracker] = useState(false);
  const [successNotificationData, setSuccessNotificationData] = useState<{
    title: string;
    message: string;
    actions?: Array<{ label: string; action: () => void }>;
  } | null>(null);

  // ===== DETAILED LESSON MODAL STATE =====
  const [showDetailedLessonModal, setShowDetailedLessonModal] = useState(false);
  const [selectedRecommendationForLesson, setSelectedRecommendationForLesson] = useState<SmartGroupRecommendation | null>(null);

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

  // ===== REAL AI ANALYSIS WITH CLAUDE INTEGRATION =====
  const runAIAnalysis = async () => {
    if (students.length === 0) {
      alert('Please add students to your classroom before generating recommendations.');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const activeTheme = customTheme || selectedTheme || 'Learning';
      const stateStandards: StateStandard[] = []; // Add your state standards here when uploaded
      
      console.log('🧠 Starting REAL Claude AI analysis...');
      
      const recommendations = await generateRealSmartGroupRecommendations(
        selectedState,
        selectedGrade,
        selectedMonth,
        activeTheme,
        stateStandards
      );
      
      setRecommendations(recommendations);
      setCurrentView('recommendations');
      
      console.log('✅ Real AI generated', recommendations.length, 'recommendations');
    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      alert('Error generating recommendations. Please try again.');
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

  // ===== ENHANCED IMPLEMENTATION HANDLERS =====
  const implementRecommendation = async (recommendation: SmartGroupRecommendation) => {
    try {
      setIsAnalyzing(true); // Show loading state

      // Get active theme
      const activeTheme = customTheme || selectedTheme || 'Learning';

      // ✅ 1. Create activity in UnifiedDataService (EXISTING - ENHANCED)
      const groupActivity = {
        id: `smart_group_${recommendation.id}`,
        name: recommendation.groupName,
        category: 'academic' as any,
        description: recommendation.rationale,
        duration: recommendation.recommendedActivity.duration,
        materials: recommendation.recommendedActivity.materials,
        instructions: recommendation.recommendedActivity.implementation,
        isCustom: true,
        linkedGoalIds: recommendation.iepGoalsAddressed.map(g => g.goalId),
        // NEW: Add Smart Groups specific metadata
        smartGroupData: {
          confidence: recommendation.confidence,
          theme: activeTheme,
          generatedDate: new Date().toISOString(),
          dataCollectionPlan: recommendation.dataCollectionPlan,
          suggestedScheduling: recommendation.suggestedScheduling
        }
      };

      UnifiedDataService.addActivity(groupActivity);

      // 🆕 2. SCHEDULE INTEGRATION - Add to daily schedule
      const scheduleEntry = {
        id: `schedule_${recommendation.id}`,
        activityId: groupActivity.id,
        groupName: recommendation.groupName,
        studentIds: recommendation.studentIds,
        scheduledTime: recommendation.suggestedScheduling.preferredTimes[0] || '10:00 AM',
        frequency: recommendation.suggestedScheduling.frequency,
        duration: recommendation.suggestedScheduling.duration,
        startDate: new Date().toISOString().split('T')[0], // Today
        status: 'active' as const,
        smartGroupMetadata: {
          recommendationId: recommendation.id,
          autoGenerated: true,
          theme: activeTheme
        }
      };

      // Save to schedule system (using existing localStorage pattern)
      const existingSchedules = JSON.parse(localStorage.getItem('smartGroupSchedules') || '[]');
      existingSchedules.push(scheduleEntry);
      localStorage.setItem('smartGroupSchedules', JSON.stringify(existingSchedules));

      // 🆕 3. DATA COLLECTION SETUP - Create reminders and tracking
      const dataCollectionReminders = recommendation.dataCollectionPlan.goalIds.map(goalId => ({
        id: `data_reminder_${recommendation.id}_${goalId}`,
        goalId,
        groupId: recommendation.id,
        groupName: recommendation.groupName,
        measurementMoments: recommendation.dataCollectionPlan.measurementMoments,
        collectionMethod: recommendation.dataCollectionPlan.collectionMethod,
        successCriteria: recommendation.dataCollectionPlan.successCriteria,
        scheduledDates: generateDataCollectionDates(scheduleEntry), // Helper function
        status: 'pending',
        createdAt: new Date().toISOString()
      }));

      // Save data collection reminders
      const existingReminders = JSON.parse(localStorage.getItem('dataCollectionReminders') || '[]');
      existingReminders.push(...dataCollectionReminders);
      localStorage.setItem('dataCollectionReminders', JSON.stringify(existingReminders));

      // 🆕 4. UI FEEDBACK - Update state and show success
      recommendation.teacherApproved = true;
      recommendation.implementationDate = new Date().toISOString();
      
      // Move to implemented groups
      setImplementedGroups(prev => [...prev, {
        ...recommendation,
        scheduleEntry,
        dataCollectionReminders
      }]);
      setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));

      // 🆕 5. SUCCESS NOTIFICATION
      showSuccessNotification({
        title: 'Smart Group Implemented Successfully!',
        message: `"${recommendation.groupName}" has been added to your schedule and data collection system.`,
        actions: [
          { label: 'View Schedule', action: () => navigateToSchedule(scheduleEntry.id) },
          { label: 'Setup Data Collection', action: () => navigateToDataCollection(recommendation.id) }
        ]
      });

      // Callback for parent component
      onRecommendationImplemented?.(recommendation);

      console.log('✅ Smart Group fully implemented:', {
        activity: groupActivity.name,
        schedule: scheduleEntry.scheduledTime,
        dataCollection: dataCollectionReminders.length + ' reminders created'
      });

    } catch (error) {
      console.error('❌ Error implementing recommendation:', error);
      showErrorNotification({
        title: 'Implementation Failed',
        message: 'There was an error implementing this Smart Group. Please try again.',
        error: error.message
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 🆕 HELPER FUNCTIONS
  const generateDataCollectionDates = (scheduleEntry: any): string[] => {
    const dates = [];
    const startDate = new Date(scheduleEntry.startDate);
    
    // Generate next 4 weeks of collection dates based on frequency
    for (let week = 0; week < 4; week++) {
      const collectionDate = new Date(startDate);
      collectionDate.setDate(startDate.getDate() + (week * 7));
      dates.push(collectionDate.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const showSuccessNotification = (notification: {
    title: string;
    message: string;
    actions?: Array<{ label: string; action: () => void }>;
  }) => {
    // Create and show success toast/modal
    // This would integrate with your existing notification system
    console.log('🎉 SUCCESS:', notification);
    
    // For now, we'll use a simple alert, but this should be replaced with a proper toast system
    alert(`${notification.title}\n\n${notification.message}`);
  };

  const showErrorNotification = (notification: {
    title: string;
    message: string;
    error?: string;
  }) => {
    console.error('❌ ERROR:', notification);
    alert(`${notification.title}\n\n${notification.message}`);
  };

  const navigateToSchedule = (scheduleId: string) => {
    // Navigate to schedule view with specific entry highlighted
    // This would integrate with your existing navigation system
    console.log('🗓️ Navigate to schedule:', scheduleId);
  };

  const navigateToDataCollection = (groupId: string) => {
    // Navigate to data collection system with group pre-selected
    // This would integrate with your existing data collection interface
    console.log('📊 Navigate to data collection:', groupId);
  };

  const rejectRecommendation = (recommendationId: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
  };

  // ===== DETAILED LESSON PLAN GENERATION =====
  const generateDetailedLessonPlan = async (recommendation: SmartGroupRecommendation) => {
    // Mock lesson plan generation - in real implementation this would call an AI service
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing
    
    const activeTheme = customTheme || selectedTheme || 'Learning';
    
    return {
      id: `lesson_${recommendation.id}_${Date.now()}`,
      title: `${recommendation.groupName} - Detailed Lesson Plan`,
      duration: recommendation.recommendedActivity.duration,
      theme: activeTheme,
      gradeLevel: selectedGrade,
      objectives: [
        {
          id: 'obj_1',
          type: 'academic' as const,
          description: `Students will demonstrate understanding of ${recommendation.standardsAddressed[0]?.standard.title || 'key concepts'}`,
          measurable: true,
          alignedStandard: recommendation.standardsAddressed[0]?.standard.code,
          alignedIEPGoal: recommendation.iepGoalsAddressed[0]?.goal.id
        }
      ],
      materials: recommendation.recommendedActivity.materials.map(material => ({
        name: material,
        quantity: 1,
        location: 'Classroom',
        required: true
      })),
      procedures: [
        {
          stepNumber: 1,
          phase: 'opening' as const,
          duration: 5,
          instruction: 'Welcome students and introduce the activity theme',
          teacherActions: ['Greet students', 'Review previous learning', 'Introduce theme'],
          studentActions: ['Listen actively', 'Share prior knowledge', 'Ask questions']
        },
        {
          stepNumber: 2,
          phase: 'instruction' as const,
          duration: 15,
          instruction: recommendation.recommendedActivity.implementation,
          teacherActions: ['Model the activity', 'Provide guided practice', 'Monitor understanding'],
          studentActions: ['Follow along', 'Practice skills', 'Ask for help when needed']
        },
        {
          stepNumber: 3,
          phase: 'practice' as const,
          duration: 10,
          instruction: 'Students work independently or in pairs',
          teacherActions: ['Circulate and support', 'Collect data', 'Provide feedback'],
          studentActions: ['Apply learned skills', 'Collaborate with peers', 'Complete tasks']
        },
        {
          stepNumber: 4,
          phase: 'closure' as const,
          duration: 5,
          instruction: 'Review learning and preview next steps',
          teacherActions: ['Summarize key points', 'Preview next lesson', 'Assign follow-up'],
          studentActions: ['Share learning', 'Ask questions', 'Prepare for next time']
        }
      ],
      assessments: [
        {
          type: 'formative' as const,
          method: 'Observation checklist',
          timing: 'during' as const,
          criteria: recommendation.dataCollectionPlan.successCriteria,
          dataCollection: true
        }
      ],
      accommodations: recommendation.recommendedActivity.adaptations.map(adaptation => ({
        studentType: 'Students with learning differences',
        strategies: [adaptation]
      })),
      extensions: [
        {
          title: 'Advanced Challenge',
          description: 'Additional activities for students who finish early',
          difficulty: 'higher' as const,
          materials: ['Extension worksheets', 'Challenge cards'],
          timeRequired: 10
        }
      ],
      standardsAddressed: recommendation.standardsAddressed,
      iepGoalsAddressed: recommendation.iepGoalsAddressed,
      groupSize: recommendation.studentCount,
      staffRatio: '1:' + recommendation.studentCount,
      setupInstructions: [
        recommendation.recommendedActivity.setup,
        'Prepare all materials in advance',
        'Arrange seating for optimal interaction'
      ],
      cleanupInstructions: [
        'Students help organize materials',
        'Return items to designated locations',
        'Prepare space for next activity'
      ],
      dataCollectionPoints: recommendation.dataCollectionPlan.goalIds.map((goalId, index) => ({
        id: `data_point_${index}`,
        moment: recommendation.dataCollectionPlan.measurementMoments[index] || 'During activity',
        method: recommendation.dataCollectionPlan.collectionMethod,
        criteria: recommendation.dataCollectionPlan.successCriteria,
        iepGoalIds: [goalId]
      })),
      parentCommunication: `Your child participated in "${recommendation.groupName}" today, working on ${recommendation.standardsAddressed[0]?.standard.title || 'important skills'}. They showed progress in their IEP goals and engaged well with the ${activeTheme} theme.`,
      generatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      templateVersion: '1.0'
    };
  };

  // ===== LESSON MODAL HANDLERS =====
  const handleShowLessonModal = (recommendation: SmartGroupRecommendation) => {
    setSelectedRecommendationForLesson(recommendation);
    setShowDetailedLessonModal(true);
  };

  const handleCloseLessonModal = () => {
    setShowDetailedLessonModal(false);
    setSelectedRecommendationForLesson(null);
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

      {/* Curriculum Upload */}
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
          background: 'linear-gradient(90deg, #ff9800 0%, #f57c00 100%)',
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
          <Upload style={{ width: '1.25rem', height: '1.25rem', color: '#ff9800' }} />
          Curriculum Integration (Optional)
        </h3>
        
        <div style={{
          border: '2px dashed #e1e8ed',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          transition: 'all 0.3s ease'
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = '#ff9800';
          e.currentTarget.style.background = '#fff3e0';
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = '#e1e8ed';
          e.currentTarget.style.background = 'transparent';
        }}>
          <input
            type="file"
            id="curriculum-upload"
            accept=".pdf,.csv,.txt,.docx"
            onChange={handleCurriculumUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="curriculum-upload" style={{ cursor: 'pointer' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Upload style={{ width: '2rem', height: '2rem', color: '#9ca3af' }} />
              <p style={{
                fontSize: '0.9rem',
                color: '#6c757d',
                margin: '0'
              }}>
                Upload your curriculum guide, pacing calendar, or standards document
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                margin: '0'
              }}>
                Supports PDF, CSV, TXT, or Word documents
              </p>
            </div>
          </label>
          
          {curriculumUploaded && (
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#28a745'
            }}>
              <Check style={{ width: '1rem', height: '1rem' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                Curriculum uploaded successfully!
              </span>
            </div>
          )}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '2rem',
        color: 'white',
        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2
        }}>
          <div>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: '0 0 0.5rem 0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              AI Recommendations Ready!
            </h2>
            <p style={{
              fontSize: '1.2rem',
              opacity: 0.9,
              margin: '0'
            }}>
              Found {recommendations.length} optimal small group opportunities
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <Sparkles style={{ width: '2rem', height: '2rem', color: '#fbbf24' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>Smart Groups</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.map((rec) => (
        <div key={rec.id} style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 25px 50px rgba(102, 126, 234, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
        }}>
          {/* Header with Confidence Badge */}
          <div style={{
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            padding: '1.5rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  margin: '0 0 0.5rem 0',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                  {rec.groupName}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  opacity: 0.9,
                  margin: '0'
                }}>
                  AI-optimized small group recommendation
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap'
              }}>
                {/* Confidence Score - Prominent */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '1rem 1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    <Star style={{ width: '1.5rem', height: '1.5rem', color: '#fbbf24' }} />
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: '700'
                    }}>
                      {rec.confidence}%
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.75rem',
                    opacity: 0.9,
                    margin: '0'
                  }}>
                    Match
                  </p>
                </div>
                {/* Quick Stats */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  opacity: 0.9
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Users style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span style={{ fontWeight: '600' }}>{rec.studentCount} Students</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Clock style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span style={{ fontWeight: '600' }}>{rec.recommendedActivity.duration} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content with Better Structure */}
          <div style={{ padding: '2rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '2rem'
            }}>
              {/* Left Column - Standards & Goals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Standards Section */}
                <div style={{
                  background: 'linear-gradient(145deg, #e3f2fd 0%, #bbdefb 100%)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '2px solid #2196f3',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
                }}>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: '#1565c0',
                    margin: '0 0 1rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      padding: '0.5rem',
                      background: '#2196f3',
                      borderRadius: '8px'
                    }}>
                      <BookOpen style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                    </div>
                    Standards Addressed
                  </h4>
                  {rec.standardsAddressed.map((std, idx) => (
                    <div key={idx} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1rem',
                      border: '1px solid #bbdefb',
                      boxShadow: '0 2px 8px rgba(33, 150, 243, 0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem'
                      }}>
                        <div style={{
                          background: '#e3f2fd',
                          color: '#1565c0',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          {std.standard.subject}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            color: '#1565c0',
                            margin: '0 0 0.5rem 0'
                          }}>
                            {std.standard.code}
                          </p>
                          <p style={{
                            fontSize: '0.85rem',
                            color: '#2c3e50',
                            lineHeight: '1.5',
                            margin: '0 0 0.5rem 0'
                          }}>
                            {std.standard.description}
                          </p>
                          <p style={{
                            fontSize: '0.75rem',
                            color: '#1976d2',
                            fontStyle: 'italic',
                            margin: '0'
                          }}>
                            {std.coverageReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* IEP Goals Section */}
                <div style={{
                  background: 'linear-gradient(145deg, #e8f5e8 0%, #d4edda 100%)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '2px solid #28a745',
                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.2)'
                }}>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: '#155724',
                    margin: '0 0 1rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      padding: '0.5rem',
                      background: '#28a745',
                      borderRadius: '8px'
                    }}>
                      <Target style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                    </div>
                    IEP Goals ({rec.iepGoalsAddressed.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {rec.iepGoalsAddressed.map((goal, idx) => {
                      const student = students.find(s => s.id === goal.studentId);
                      return (
                        <div key={idx} style={{
                          background: 'white',
                          borderRadius: '12px',
                          padding: '1rem',
                          border: '1px solid #d4edda',
                          boxShadow: '0 2px 8px rgba(40, 167, 69, 0.1)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem'
                          }}>
                            <div style={{
                              width: '2.5rem',
                              height: '2.5rem',
                              background: '#e8f5e8',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <span style={{
                                color: '#155724',
                                fontWeight: '700',
                                fontSize: '0.85rem'
                              }}>
                                {student?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{
                                fontWeight: '600',
                                color: '#155724',
                                margin: '0 0 0.25rem 0'
                              }}>
                                {student?.name}
                              </p>
                              <p style={{
                                fontSize: '0.85rem',
                                color: '#2c3e50',
                                margin: '0 0 0.5rem 0'
                              }}>
                                {goal.goal.shortTermObjective}
                              </p>
                              <p style={{
                                fontSize: '0.75rem',
                                color: '#28a745',
                                fontStyle: 'italic',
                                margin: '0'
                              }}>
                                {goal.alignmentReason}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column - Activity & Benefits */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Recommended Activity */}
                <div style={{
                  background: 'linear-gradient(145deg, #fff3e0 0%, #ffe0b2 100%)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '2px solid #ff9800',
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)'
                }}>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: '#e65100',
                    margin: '0 0 1rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      padding: '0.5rem',
                      background: '#ff9800',
                      borderRadius: '8px'
                    }}>
                      <Lightbulb style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                    </div>
                    Recommended Activity
                  </h4>
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    border: '1px solid #ffe0b2',
                    boxShadow: '0 2px 8px rgba(255, 152, 0, 0.1)'
                  }}>
                    <h5 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#2c3e50',
                      margin: '0 0 0.75rem 0'
                    }}>
                      {rec.recommendedActivity.activity.name}
                    </h5>
                    <p style={{
                      color: '#2c3e50',
                      margin: '0 0 1rem 0',
                      lineHeight: '1.5'
                    }}>
                      {rec.recommendedActivity.activity.description}
                    </p>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: '1rem'
                    }}>
                      <div style={{
                        background: '#fff3e0',
                        borderRadius: '8px',
                        padding: '0.75rem'
                      }}>
                        <p style={{
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#e65100',
                          margin: '0 0 0.25rem 0'
                        }}>
                          Materials Needed:
                        </p>
                        <p style={{
                          fontSize: '0.85rem',
                          color: '#2c3e50',
                          margin: '0'
                        }}>
                          {rec.recommendedActivity.materials.join(', ')}
                        </p>
                      </div>
                      <div style={{
                        background: '#fff3e0',
                        borderRadius: '8px',
                        padding: '0.75rem'
                      }}>
                        <p style={{
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#e65100',
                          margin: '0 0 0.25rem 0'
                        }}>
                          Setup:
                        </p>
                        <p style={{
                          fontSize: '0.85rem',
                          color: '#2c3e50',
                          margin: '0'
                        }}>
                          {rec.recommendedActivity.setup}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div style={{
                  background: 'linear-gradient(145deg, #f3e5f5 0%, #e1bee7 100%)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '2px solid #9c27b0',
                  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.2)'
                }}>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: '#6a1b9a',
                    margin: '0 0 1rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      padding: '0.5rem',
                      background: '#9c27b0',
                      borderRadius: '8px'
                    }}>
                      <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                    </div>
                    Why This Works
                  </h4>
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    border: '1px solid #e1bee7',
                    boxShadow: '0 2px 8px rgba(156, 39, 176, 0.1)'
                  }}>
                    <ul style={{
                      listStyle: 'none',
                      padding: '0',
                      margin: '0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      {rec.benefits.map((benefit, idx) => (
                        <li key={idx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem'
                        }}>
                          <div style={{
                            padding: '0.25rem',
                            background: '#e8f5e8',
                            borderRadius: '50%',
                            marginTop: '0.125rem'
                          }}>
                            <Check style={{ width: '0.75rem', height: '0.75rem', color: '#28a745' }} />
                          </div>
                          <span style={{
                            fontSize: '0.85rem',
                            color: '#2c3e50',
                            lineHeight: '1.5'
                          }}>
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Theme Integration */}
                {rec.themeConnection && (
                  <div style={{
                    background: 'linear-gradient(145deg, #e8eaf6 0%, #c5cae9 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '2px solid #3f51b5',
                    boxShadow: '0 4px 12px rgba(63, 81, 181, 0.2)'
                  }}>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#283593',
                      margin: '0 0 1rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        padding: '0.5rem',
                        background: '#3f51b5',
                        borderRadius: '8px'
                      }}>
                        <Calendar style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                      </div>
                      Theme Integration
                    </h4>
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      border: '1px solid #c5cae9',
                      boxShadow: '0 2px 8px rgba(63, 81, 181, 0.1)'
                    }}>
                      <p style={{
                        fontSize: '0.85rem',
                        color: '#2c3e50',
                        margin: '0 0 0.75rem 0',
                        lineHeight: '1.5'
                      }}>
                        {rec.themeConnection.relevance}
                      </p>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        {rec.themeConnection.thematicElements.map((element, idx) => (
                          <span key={idx} style={{
                            padding: '0.25rem 0.75rem',
                            background: '#e8eaf6',
                            color: '#283593',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            borderRadius: '20px',
                            border: '1px solid #c5cae9'
                          }}>
                            {element}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Enhanced with New Components */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '2px solid #e1e8ed'
            }}>
              {/* Enhanced Implementation Button */}
              <EnhancedImplementButton
                recommendation={rec}
                onImplement={implementRecommendation}
                isImplementing={isAnalyzing}
              />
              
              {/* Generate Detailed Lesson Plan Button */}
              <button 
                onClick={() => handleShowLessonModal(rec)}
                style={{
                  padding: '1rem 1.5rem',
                  border: '2px solid #667eea',
                  borderRadius: '16px',
                  background: 'transparent',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#667eea';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#667eea';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <BookOpen style={{ width: '1rem', height: '1rem' }} />
                Generate Lesson Plan
              </button>
              <button 
                onClick={() => setExpandedRecommendation(expandedRecommendation === rec.id ? null : rec.id)}
                style={{
                  padding: '1rem 1.5rem',
                  border: '2px solid #6c757d',
                  borderRadius: '16px',
                  background: 'transparent',
                  color: '#6c757d',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#495057';
                  e.currentTarget.style.color = '#495057';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#6c757d';
                  e.currentTarget.style.color = '#6c757d';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {expandedRecommendation === rec.id ? 'Show Less' : 'Show Details'}
              </button>
              <button 
                onClick={() => rejectRecommendation(rec.id)}
                style={{
                  padding: '1rem',
                  border: '2px solid #dc3545',
                  borderRadius: '16px',
                  background: 'transparent',
                  color: '#dc3545',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8d7da';
                  e.currentTarget.style.borderColor = '#c82333';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#dc3545';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {recommendations.length === 0 && (
        <div style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{
            width: '6rem',
            height: '6rem',
            background: '#f1f3f4',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <AlertCircle style={{ width: '3rem', height: '3rem', color: '#9ca3af' }} />
          </div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#2c3e50',
            margin: '0 0 1rem 0'
          }}>
            No Recommendations Yet
          </h3>
          <p style={{
            color: '#6c757d',
            margin: '0 0 2rem 0',
            fontSize: '1.1rem'
          }}>
            Run the AI analysis to generate smart group recommendations.
          </p>
          <button 
            onClick={() => setCurrentView('setup')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
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
            <button
              onClick={() => setCurrentView('verification')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                currentView === 'verification' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database style={{ width: '1rem', height: '1rem' }} />
                System Check
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        {currentView === 'setup' && renderSetupView()}
        {currentView === 'recommendations' && renderRecommendationsView()}
        {currentView === 'implemented' && renderImplementedView()}
        {currentView === 'verification' && (
          <div className="space-y-6">
            <QuickVerificationPanel />
            <SmartGroupsVerificationDashboard />
          </div>
        )}
      </div>

      {/* Enhanced UI Modals */}
      {showDetailedLessonModal && selectedRecommendationForLesson && (
        <DetailedLessonModal
          isOpen={showDetailedLessonModal}
          recommendation={selectedRecommendationForLesson}
          onClose={handleCloseLessonModal}
          onGenerate={generateDetailedLessonPlan}
        />
      )}

      {/* Floating Debug Panel */}
      <SmartGroupsDebugPanel />
    </div>
  );
};

export default SmartGroups;

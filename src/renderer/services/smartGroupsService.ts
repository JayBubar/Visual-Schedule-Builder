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

interface MonthlyTheme {
  id: string;
  month: number;
  year: number;
  title: string;
  description: string;
  keywords: string[];
  subThemes: {
    week: number;
    title: string;
    focus: string;
    keywords: string[];
  }[];
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
  const [showDetailedLesson, setShowDetailedLesson] = useState<string | null>(null);

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
      
      // Filter students with IEP goals
      const studentsWithGoals = allStudents.filter(student => 
        student.iepData?.goals && student.iepData.goals.length > 0
      );
      
      setStudents(studentsWithGoals);
      setActivities(allActivities);
      
      console.log('📚 Smart Groups loaded:', {
        students: studentsWithGoals.length,
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
    const activeTheme = customTheme || selectedTheme;
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    
    return [
      {
        id: `rec_${Date.now()}_1`,
        groupName: `${activeTheme} Reading Comprehension Group`,
        confidence: 94,
        studentIds: students.slice(0, 3).map(s => s.id),
        studentCount: 3,
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
        iepGoalsAddressed: students.slice(0, 3).filter(s => s.iepData?.goals).map(student => {
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
          `Targets reading comprehension IEP goals for ${students.slice(0, 3).length} students`,
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
          goalIds: students.slice(0, 3).filter(s => s.iepData?.goals).map(s => s.iepData!.goals[0].id),
          measurementMoments: ['Story preview', 'During mapping', 'Discussion wrap-up'],
          collectionMethod: 'Observational with quick rating scale',
          successCriteria: ['Identifies main idea independently', 'Uses graphic organizer correctly', 'Participates in discussion']
        },
        generatedAt: new Date().toISOString()
      },
      {
        id: `rec_${Date.now()}_2`,
        groupName: `${activeTheme} Math Problem Solving Squad`,
        confidence: 89,
        studentIds: students.slice(2, 4).map(s => s.id),
        studentCount: 2,
        standardsAddressed: [{
          standardId: 'CCSS.MATH.3.8',
          standard: {
            id: 'CCSS.MATH.3.8',
            code: 'CCSS.MATH.CONTENT.3.OA.D.8',
            state: selectedState,
            grade: selectedGrade,
            subject: 'Math',
            domain: 'Operations & Algebraic Thinking',
            title: 'Two-Step Word Problems',
            description: 'Solve two-step word problems using the four operations',
            subSkills: ['problem solving', 'multi-step thinking', 'operation selection'],
            complexity: 4
          },
          coverageReason: 'Themed word problems provide authentic contexts for multi-step problem solving'
        }],
        iepGoalsAddressed: students.slice(2, 4).filter(s => s.iepData?.goals).map(student => {
          const mathGoal = student.iepData!.goals.find(g => g.domain === 'academic') || student.iepData!.goals[0];
          return {
            goalId: mathGoal.id,
            studentId: student.id,
            goal: mathGoal,
            alignmentReason: `${activeTheme} context makes abstract math concepts more concrete and engaging`
          };
        }),
        recommendedActivity: {
          activityId: 'themed_math_problems',
          activity: {
            id: 'themed_math_problems',
            name: `${activeTheme} Problem Theater`,
            category: 'academic',
            description: `Real-world ${activeTheme.toLowerCase()} math scenarios with manipulatives`,
            duration: 20,
            materials: ['Problem scenario cards', 'Math manipulatives', 'Recording sheets'],
            instructions: 'Students solve themed word problems using concrete materials and systematic approaches',
            isCustom: true,
            dateCreated: new Date().toISOString()
          },
          adaptations: [
            'Provide manipulatives for concrete problem solving',
            'Break complex problems into smaller steps',
            'Use visual models and diagrams'
          ],
          duration: 20,
          materials: ['Themed problem cards', 'Counting bears', 'Base-10 blocks', 'Recording sheets'],
          setup: 'Small table with math materials organized by problem type',
          implementation: 'Present themed scenarios, guide problem-solving process, practice with manipulatives'
        },
        benefits: [
          'Addresses critical 3rd grade math standard',
          'Supports calculation and problem-solving IEP goals',
          'Incorporates hands-on learning with manipulatives',
          'Easy progress monitoring during problem solving'
        ],
        rationale: `Combines required math standards with themed contexts to make abstract concepts concrete. Small group size allows for intensive individual support while maintaining peer learning opportunities.`,
        suggestedScheduling: {
          frequency: 'daily',
          duration: 20,
          preferredTimes: ['10:00 AM', '11:00 AM', '2:00 PM']
        },
        dataCollectionPlan: {
          goalIds: students.slice(2, 4).filter(s => s.iepData?.goals).map(s => s.iepData!.goals[0].id),
          measurementMoments: ['Problem introduction', 'Strategy selection', 'Solution completion'],
          collectionMethod: 'Trial-by-trial accuracy tracking',
          successCriteria: ['Selects appropriate operation', 'Uses systematic approach', 'Reaches correct solution']
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
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Smart Groups Configuration
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* State Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <select 
              value={selectedState} 
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
            <select 
              value={selectedGrade} 
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2025, i, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          {/* Analysis Button */}
          <div className="flex items-end">
            <button 
              onClick={runAIAnalysis}
              disabled={isAnalyzing || students.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Generate Groups
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Theme Selection for {new Date(2025, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' })}
        </h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(predefinedThemes[selectedMonth as keyof typeof predefinedThemes] || []).map((theme) => (
            <button
              key={theme}
              onClick={() => {setSelectedTheme(theme); setCustomTheme('');}}
              className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                selectedTheme === theme 
                  ? 'border-green-500 bg-green-50 text-green-900' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-medium">{theme}</span>
            </button>
          ))}
        </div>
        
        <div>
          <input
            type="text"
            placeholder="Or enter custom theme..."
            value={customTheme}
            onChange={(e) => {setCustomTheme(e.target.value); setSelectedTheme('');}}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Curriculum Upload */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-orange-600" />
          Curriculum Integration (Optional)
        </h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="curriculum-upload"
            accept=".pdf,.csv,.txt,.docx"
            onChange={handleCurriculumUpload}
            className="hidden"
          />
          <label htmlFor="curriculum-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                Upload your curriculum guide, pacing calendar, or standards document
              </p>
              <p className="text-xs text-gray-500">
                Supports PDF, CSV, TXT, or Word documents
              </p>
            </div>
          </label>
          
          {curriculumUploaded && (
            <div className="mt-3 flex items-center justify-center gap-2 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm">Curriculum uploaded successfully!</span>
            </div>
          )}
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-red-600" />
          Current Data Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{students.length}</p>
            <p className="text-sm text-gray-600">Students with IEP Goals</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {students.reduce((total, s) => total + (s.iepData?.goals?.length || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Total IEP Goals</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{activities.length}</p>
            <p className="text-sm text-gray-600">Available Activities</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {selectedTheme || customTheme ? '✓' : '○'}
            </p>
            <p className="text-sm text-gray-600">Theme Selected</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecommendationsView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">AI Recommendations Ready!</h2>
            <p className="text-purple-100 mt-1">
              Found {recommendations.length} optimal small group opportunities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <span className="text-lg font-semibold">Smart Groups</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.map((rec) => (
        <div key={rec.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{rec.groupName}</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="font-semibold">{rec.confidence}% Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{rec.studentCount} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{rec.recommendedActivity.duration} min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    Standards Addressed
                  </h4>
                  {rec.standardsAddressed.map((std, idx) => (
                    <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                      <p className="font-mono text-sm text-blue-800 mb-1">{std.standard.code}</p>
                      <p className="text-sm text-gray-700">{std.standard.description}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600" />
                    IEP Goals ({rec.iepGoalsAddressed.length})
                  </h4>
                  {rec.iepGoalsAddressed.map((goal, idx) => {
                    const student = students.find(s => s.id === goal.studentId);
                    return (
                      <div key={idx} className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-800">{student?.name}</p>
                        <p className="text-sm text-gray-700">{goal.goal.shortTermObjective}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    Recommended Activity
                  </h4>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">{rec.recommendedActivity.activity.name}</p>
                    <p className="text-sm text-gray-700 mb-2">{rec.recommendedActivity.activity.description}</p>
                    <p className="text-sm text-gray-600">Materials: {rec.recommendedActivity.materials.join(', ')}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Why This Works
                  </h4>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <ul className="space-y-1">
                      {rec.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {rec.themeConnection && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      Theme Integration
                    </h4>
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 mb-1">{rec.themeConnection.relevance}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rec.themeConnection.thematicElements.map((element, idx) => (
                          <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            {element}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Expandable Detailed Section */}
            {expandedRecommendation === rec.id && (
              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Implementation Guide</h5>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{rec.recommendedActivity.implementation}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Data Collection Plan</h5>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Method:</strong> {rec.dataCollectionPlan.collectionMethod}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Moments:</strong> {rec.dataCollectionPlan.measurementMoments.join(', ')}
                      </p>
                      <div>
                        <strong className="text-sm text-gray-700">Success Criteria:</strong>
                        <ul className="mt-1 space-y-1">
                          {rec.dataCollectionPlan.successCriteria.map((criteria, idx) => (
                            <li key={idx} className="text-xs text-gray-600 ml-4">• {criteria}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Adaptations & Modifications</h5>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <ul className="space-y-1">
                      {rec.recommendedActivity.adaptations.map((adaptation, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {adaptation}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Suggested Scheduling</h5>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Frequency:</strong> {rec.suggestedScheduling.frequency} • 
                      <strong> Duration:</strong> {rec.suggestedScheduling.duration} minutes • 
                      <strong> Best Times:</strong> {rec.suggestedScheduling.preferredTimes.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button 
                onClick={() => implementRecommendation(rec)}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Implement This Group
              </button>
              <button 
                onClick={() => setExpandedRecommendation(expandedRecommendation === rec.id ? null : rec.id)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                {expandedRecommendation === rec.id ? 'Show Less' : 'Show Details'}
              </button>
              <button 
                onClick={() => setShowDetailedLesson(rec.id)}
                className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-all duration-200"
              >
                Generate Lesson
              </button>
              <button 
                onClick={() => rejectRecommendation(rec.id)}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {recommendations.length === 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
          <p className="text-gray-600 mb-4">Run the AI analysis to generate smart group recommendations.</p>
          <button 
            onClick={() => setCurrentView('setup')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

        {/* Detailed Lesson Modal */}
        {showDetailedLesson && (
          <DetailedLessonModal 
            recommendationId={showDetailedLesson}
            recommendation={recommendations.find(r => r.id === showDetailedLesson)!}
            onClose={() => setShowDetailedLesson(null)}
          />
        )}
      </div>
    </div>
  );
};

// ===== DETAILED LESSON MODAL COMPONENT =====
interface DetailedLessonModalProps {
  recommendationId: string;
  recommendation: SmartGroupRecommendation;
  onClose: () => void;
}

const DetailedLessonModal: React.FC<DetailedLessonModalProps> = ({ 
  recommendation, 
  onClose 
}) => {
  const [lessonPlan, setLessonPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateDetailedLesson();
  }, []);

  const generateDetailedLesson = async () => {
    setIsGenerating(true);
    
    // Simulate lesson generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockLessonPlan = {
      title: `${recommendation.recommendedActivity.activity.name} - Detailed Lesson Plan`,
      duration: recommendation.recommendedActivity.duration,
      objectives: [
        `Students will ${recommendation.standardsAddressed[0]?.standard.title.toLowerCase()}`,
        ...recommendation.iepGoalsAddressed.map(g => g.goal.shortTermObjective)
      ],
      materials: recommendation.recommendedActivity.materials,
      lessonFlow: [
        {
          step: 1,
          title: 'Welcome & Review (3 min)',
          description: 'Greet students and review expectations',
          teacherActions: ['Welcome each student', 'Review group norms', 'Preview objectives'],
          dataCollection: 'Note attention and engagement'
        },
        {
          step: 2,
          title: 'Introduction (5 min)',
          description: 'Introduce activity and connect to goals',
          teacherActions: ['Present activity overview', 'Connect to IEP goals', 'Model expected behaviors'],
          dataCollection: 'Baseline observations for each goal'
        },
        {
          step: 3,
          title: `Main Activity (${recommendation.recommendedActivity.duration - 10} min)`,
          description: recommendation.recommendedActivity.implementation,
          teacherActions: ['Guide practice', 'Provide support', 'Collect data', 'Adjust as needed'],
          dataCollection: 'Primary data collection window'
        },
        {
          step: 4,
          title: 'Wrap-up (2 min)',
          description: 'Review learning and celebrate progress',
          teacherActions: ['Review key points', 'Celebrate progress', 'Preview next session'],
          dataCollection: 'Final progress checks'
        }
      ],
      assessment: {
        formative: ['Observation during activity', 'Quick progress checks'],
        summative: ['End-of-activity demonstration', 'Goal mastery checklist'],
        iepSpecific: recommendation.iepGoalsAddressed.map(g => ({
          student: g.studentId,
          goal: g.goal.shortTermObjective,
          criteria: g.goal.criteria,
          method: 'Direct observation with rating scale'
        }))
      }
    };
    
    setLessonPlan(mockLessonPlan);
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Detailed Lesson Plan</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isGenerating ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-900">Generating Detailed Lesson Plan...</p>
              <p className="text-gray-600">AI is creating step-by-step instructions, materials list, and assessment rubrics</p>
            </div>
          ) : lessonPlan && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{lessonPlan.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><strong>Duration:</strong> {lessonPlan.duration} minutes</p>
                  <p><strong>Group Size:</strong> {recommendation.studentCount} students</p>
                </div>
              </div>

              {/* Objectives */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Learning Objectives</h4>
                <ul className="space-y-2">
                  {lessonPlan.objectives.map((obj: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Materials */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Materials Needed</h4>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{lessonPlan.materials.join(', ')}</p>
                </div>
              </div>

              {/* Lesson Flow */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Lesson Flow</h4>
                <div className="space-y-4">
                  {lessonPlan.lessonFlow.map((step: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {step.step}
                        </div>
                        <h5 className="font-semibold text-gray-900">{step.title}</h5>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{step.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Teacher Actions:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {step.teacherActions.map((action: string, actionIdx: number) => (
                              <li key={actionIdx}>• {action}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Data Collection:</p>
                          <p className="text-xs text-gray-600">{step.dataCollection}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Assessment & Data Collection</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Formative Assessment</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {lessonPlan.assessment.formative.map((item: string, idx: number) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2">Summative Assessment</h5>
                    <ul className="text-sm text-green-800 space-y-1">
                      {lessonPlan.assessment.summative.map((item: string, idx: number) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* IEP-Specific Data Collection */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">IEP Goal Data Collection</h4>
                <div className="space-y-3">
                  {lessonPlan.assessment.iepSpecific.map((item: any, idx: number) => {
                    const student = UnifiedDataService.getStudent(item.student);
                    return (
                      <div key={idx} className="bg-purple-50 p-3 rounded-lg">
                        <p className="font-medium text-purple-900">{student?.name}</p>
                        <p className="text-sm text-purple-800 mb-1">{item.goal}</p>
                        <p className="text-xs text-purple-700">
                          <strong>Criteria:</strong> {item.criteria} • 
                          <strong> Method:</strong> {item.method}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                  <Download className="w-4 h-4 inline mr-2" />
                  Download Lesson Plan
                </button>
                <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-all duration-200">
                  Edit & Customize
                </button>
                <button className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-all duration-200">
                  Add to Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartGroups;
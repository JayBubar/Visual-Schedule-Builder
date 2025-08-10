import React, { useState, useEffect } from 'react';
import { 
  Student, 
  DailyCheckIn as DailyCheckInType,
  StudentBehaviorChoice,
  ActivityHighlight,
  BehaviorStatement
} from '../../types';
import UnifiedDataService from '../../services/unifiedDataService';
import { DataMigrationUtility } from '../../utils/dataMigration';

interface BehaviorCommitmentsProps {
  currentDate: Date;
  students: Student[];
  todayCheckIn: DailyCheckInType | null;
  onUpdateCheckIn: (checkIn: DailyCheckInType) => void;
  onNext: () => void;
  onBack: () => void;
}

interface BehaviorCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  commitments: string[];
  description: string;
}

const BehaviorCommitments: React.FC<BehaviorCommitmentsProps> = ({
  currentDate,
  students,
  todayCheckIn,
  onUpdateCheckIn,
  onNext,
  onBack
}) => {
  // Default behavior statements
  const DEFAULT_BEHAVIOR_STATEMENTS: BehaviorStatement[] = [
    { id: 'kindness_1', text: 'I will be kind to my friends', category: 'kindness', emoji: '🤝', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'kindness_2', text: 'I will help others when they need it', category: 'kindness', emoji: '🤝', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'kindness_3', text: 'I will share with my classmates', category: 'kindness', emoji: '🤝', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'kindness_4', text: 'I will use nice words', category: 'kindness', emoji: '🤝', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'kindness_5', text: 'I will include everyone in activities', category: 'kindness', emoji: '🤝', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'kindness_6', text: 'I will say please and thank you', category: 'kindness', emoji: '🤝', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    
    { id: 'respect_1', text: 'I will listen when others are talking', category: 'respect', emoji: '👂', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'respect_2', text: 'I will raise my hand to speak', category: 'respect', emoji: '👂', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'respect_3', text: 'I will take care of our classroom', category: 'respect', emoji: '👂', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'respect_4', text: 'I will follow directions the first time', category: 'respect', emoji: '👂', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'respect_5', text: 'I will use my inside voice', category: 'respect', emoji: '👂', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'respect_6', text: 'I will keep my hands to myself', category: 'respect', emoji: '👂', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    
    { id: 'effort_1', text: 'I will try my best in all activities', category: 'effort', emoji: '💪', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'effort_2', text: 'I will ask for help when I need it', category: 'effort', emoji: '💪', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'effort_3', text: 'I will finish my work', category: 'effort', emoji: '💪', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'effort_4', text: 'I will not give up when things are hard', category: 'effort', emoji: '💪', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'effort_5', text: 'I will pay attention during lessons', category: 'effort', emoji: '💪', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'effort_6', text: 'I will practice what I learn', category: 'effort', emoji: '💪', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    
    { id: 'responsibility_1', text: 'I will clean up after myself', category: 'responsibility', emoji: '📋', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'responsibility_2', text: 'I will take care of my belongings', category: 'responsibility', emoji: '📋', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'responsibility_3', text: 'I will remember my homework', category: 'responsibility', emoji: '📋', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'responsibility_4', text: 'I will be ready for activities', category: 'responsibility', emoji: '📋', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'responsibility_5', text: 'I will make good choices', category: 'responsibility', emoji: '📋', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'responsibility_6', text: 'I will tell the truth', category: 'responsibility', emoji: '📋', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    
    { id: 'safety_1', text: 'I will walk in the hallways', category: 'safety', emoji: '🛡️', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'safety_2', text: 'I will use materials safely', category: 'safety', emoji: '🛡️', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'safety_3', text: 'I will ask before leaving my seat', category: 'safety', emoji: '🛡️', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'safety_4', text: 'I will keep food out of my mouth during non-eating times', category: 'safety', emoji: '🛡️', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'safety_5', text: 'I will follow playground rules', category: 'safety', emoji: '🛡️', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'safety_6', text: 'I will tell an adult if someone is hurt', category: 'safety', emoji: '🛡️', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    
    { id: 'learning_1', text: 'I will ask questions when I don\'t understand', category: 'learning', emoji: '📚', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'learning_2', text: 'I will listen to learn new things', category: 'learning', emoji: '📚', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'learning_3', text: 'I will try new activities', category: 'learning', emoji: '📚', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'learning_4', text: 'I will help my friends learn too', category: 'learning', emoji: '📚', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'learning_5', text: 'I will celebrate my mistakes as learning', category: 'learning', emoji: '📚', isActive: true, isDefault: true, createdAt: new Date().toISOString() },
    { id: 'learning_6', text: 'I will be proud of my progress', category: 'learning', emoji: '📚', isActive: true, isDefault: true, createdAt: new Date().toISOString() }
  ];

  // NEW: Individual student choice tracking
  const [studentChoices, setStudentChoices] = useState<{[studentId: string]: string}>({});
  const [completedStudents, setCompletedStudents] = useState<Set<string>>(new Set());
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<string | null>(null);

  // Replace the hardcoded behaviorOptions array with:
  const [behaviorStatements, setBehaviorStatements] = useState<BehaviorStatement[]>(DEFAULT_BEHAVIOR_STATEMENTS);
  const [isLoadingStatements, setIsLoadingStatements] = useState(true);

  // Dynamic behavior categories - will be populated from custom statements or defaults
  const [behaviorCategories, setBehaviorCategories] = useState<BehaviorCategory[]>([]);

  // FIXED: Load behavior statements with proper data loading (same approach as celebrations)
  useEffect(() => {
    const loadBehaviorStatementsFixed = () => {
      try {
        console.log('🔄 [DEBUG] Loading behavior statements...');
        setIsLoadingStatements(true);
        
        // Method 1: Try UnifiedDataService (same pattern that worked for celebrations)
        const unifiedSettings = UnifiedDataService.getSettings();
        console.log('📋 [DEBUG] UnifiedDataService settings:', unifiedSettings);
        
        let customStatements = [];
        
        // Check multiple possible paths for custom statements
        if (unifiedSettings?.dailyCheckIn?.behaviorCommitments?.customStatements) {
          customStatements = unifiedSettings.dailyCheckIn.behaviorCommitments.customStatements;
          console.log('✅ [DEBUG] Found custom statements in dailyCheckIn.behaviorCommitments:', customStatements);
        } else if (unifiedSettings?.behaviorCommitments?.customStatements) {
          customStatements = unifiedSettings.behaviorCommitments.customStatements;
          console.log('✅ [DEBUG] Found custom statements in root behaviorCommitments:', customStatements);
        } else if (unifiedSettings?.customBehaviorStatements) {
          customStatements = unifiedSettings.customBehaviorStatements;
          console.log('✅ [DEBUG] Found custom statements in root customBehaviorStatements:', customStatements);
        } else {
          console.log('ℹ️ [DEBUG] No custom statements found in UnifiedDataService');
        }
        
        // Method 2: Try legacy calendarSettings (same as celebrations)
        if (customStatements.length === 0) {
          console.log('🔍 [DEBUG] Checking legacy calendarSettings for behavior statements...');
          const legacySettings = localStorage.getItem('calendarSettings');
          if (legacySettings) {
            const parsed = JSON.parse(legacySettings);
            console.log('📋 [DEBUG] Legacy settings:', parsed);
            if (parsed.customBehaviorCommitments) {
              // Convert legacy format: { categoryId: string[] } to BehaviorStatement[]
              const legacyStatements = parsed.customBehaviorCommitments;
              customStatements = [];
              
              Object.keys(legacyStatements).forEach(categoryId => {
                const statements = legacyStatements[categoryId] || [];
                statements.forEach((statement, index) => {
                  customStatements.push({
                    id: `legacy_${categoryId}_${index}`,
                    text: statement,
                    category: categoryId,
                    isActive: true,
                    isDefault: false,
                    createdAt: new Date().toISOString()
                  });
                });
              });
              
              console.log('✅ [DEBUG] Converted legacy behavior statements:', customStatements);
            }
          }
        }
        
        // Method 3: Create behavior categories with custom statements
        if (customStatements.length > 0) {
          // Convert custom statements to category format for the modal
          const categoriesWithCustom = convertStatementsToCategoryFormat(customStatements);
          setBehaviorCategories(categoriesWithCustom);
          setBehaviorStatements(customStatements); // Keep original format for other uses
          console.log('📊 [DEBUG] Using behavior categories with custom statements:', categoriesWithCustom);
        } else {
          // Use defaults - create default categories
          console.log('🧪 [DEBUG] No custom statements found, using defaults...');
          const defaultCategories = createDefaultCategories();
          setBehaviorCategories(defaultCategories);
          setBehaviorStatements(DEFAULT_BEHAVIOR_STATEMENTS);
          console.log('🧪 [DEBUG] Using default categories:', defaultCategories);
        }
        
      } catch (error) {
        console.error('❌ [DEBUG] Error loading behavior statements:', error);
        setBehaviorStatements(DEFAULT_BEHAVIOR_STATEMENTS);
      } finally {
        setIsLoadingStatements(false);
      }
    };

    loadBehaviorStatementsFixed();
  }, []);

  // Helper function to create default categories from DEFAULT_BEHAVIOR_STATEMENTS
  const createDefaultCategories = (): BehaviorCategory[] => {
    const categoryMeta = {
      kindness: { name: 'Kindness', icon: '💝', color: '#e91e63', description: 'Being caring and helpful to others' },
      respect: { name: 'Respect', icon: '🤝', color: '#2196f3', description: 'Treating others and our classroom with care' },
      effort: { name: 'Effort', icon: '💪', color: '#ff9800', description: 'Trying my best in everything I do' },
      responsibility: { name: 'Responsibility', icon: '🎯', color: '#4caf50', description: 'Taking care of myself and my belongings' },
      safety: { name: 'Safety', icon: '🛡️', color: '#f44336', description: 'Keeping myself and others safe' },
      learning: { name: 'Learning', icon: '📚', color: '#9c27b0', description: 'Growing my mind and skills every day' }
    };

    // Group default statements by category
    const defaultByCategory: { [key: string]: string[] } = {};
    DEFAULT_BEHAVIOR_STATEMENTS.forEach(statement => {
      const category = statement.category;
      if (!defaultByCategory[category]) {
        defaultByCategory[category] = [];
      }
      defaultByCategory[category].push(statement.text);
    });

    // Create categories with default statements
    const defaultCategories: BehaviorCategory[] = [];
    Object.keys(defaultByCategory).forEach(categoryId => {
      const meta = categoryMeta[categoryId] || categoryMeta.kindness;
      defaultCategories.push({
        id: categoryId,
        name: meta.name,
        icon: meta.icon,
        color: meta.color,
        description: meta.description,
        commitments: defaultByCategory[categoryId]
      });
    });

    return defaultCategories;
  };

  // Helper function to convert custom statements to category structure
  const convertStatementsToCategoryFormat = (customStatements) => {
    console.log('🔄 [DEBUG] Converting custom statements to categories:', customStatements);
    
    // Group custom statements by category
    const customByCategory = {};
    customStatements.forEach(statement => {
      if (statement.isActive !== false) {
        const category = statement.category || 'kindness';
        if (!customByCategory[category]) {
          customByCategory[category] = [];
        }
        customByCategory[category].push(statement.text);
      }
    });
    
    console.log('📊 [DEBUG] Grouped by category:', customByCategory);
    
    // Create new categories based on custom statements ONLY
    const newCategories = [];
    
    // Define category metadata
    const categoryMeta = {
      kindness: { name: 'Kindness', icon: '💝', color: '#e91e63', description: 'Being caring and helpful to others' },
      respect: { name: 'Respect', icon: '🤝', color: '#2196f3', description: 'Treating others and our classroom with care' },
      effort: { name: 'Effort', icon: '💪', color: '#ff9800', description: 'Trying my best in everything I do' },
      responsibility: { name: 'Responsibility', icon: '🎯', color: '#4caf50', description: 'Taking care of myself and my belongings' },
      safety: { name: 'Safety', icon: '🛡️', color: '#f44336', description: 'Keeping myself and others safe' },
      learning: { name: 'Learning', icon: '📚', color: '#9c27b0', description: 'Growing my mind and skills every day' }
    };
    
    // Create categories with ONLY custom statements
    Object.keys(customByCategory).forEach(categoryId => {
      const meta = categoryMeta[categoryId] || categoryMeta.kindness;
      newCategories.push({
        id: categoryId,
        name: meta.name,
        icon: meta.icon,
        color: meta.color,
        description: meta.description,
        commitments: customByCategory[categoryId]
      });
    });
    
    console.log('✅ [DEBUG] Created categories with custom statements only:', newCategories);
    return newCategories;
  };

  // Helper function to convert flat custom statements to category structure
  const convertCustomStatementsToCategoryFormat = (customStatements: any[]): BehaviorStatement[] => {
    const categories = [...DEFAULT_BEHAVIOR_STATEMENTS];
    
    // Group custom statements by category
    const customByCategory: { [key: string]: string[] } = {};
    
    customStatements.forEach(statement => {
      if (statement.isActive !== false) {
        const category = statement.category || 'kindness';
        if (!customByCategory[category]) {
          customByCategory[category] = [];
        }
        customByCategory[category].push(statement.text || statement.commitment || statement.statement);
      }
    });
    
    // Add custom statements to existing categories
    Object.keys(customByCategory).forEach(categoryId => {
      const categoryIndex = categories.findIndex(cat => cat.category === categoryId);
      if (categoryIndex !== -1) {
        // Add custom statements to existing category
        customByCategory[categoryId].forEach(customText => {
          categories.push({
            id: `custom_${Date.now()}_${Math.random()}`,
            text: customText,
            category: categoryId as any,
            emoji: categories[categoryIndex].emoji,
            isActive: true,
            isDefault: false,
            createdAt: new Date().toISOString()
          });
        });
      }
    });
    
    return categories;
  };

  // Add settings sync hook for real-time updates
  const useSettingsSync = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    useEffect(() => {
      const handleSettingsChange = (event: CustomEvent) => {
        console.log('🔄 Settings changed, refreshing behavior statements...');
        setRefreshTrigger(prev => prev + 1);
      };
      
      window.addEventListener('unifiedSettingsChanged', handleSettingsChange as EventListener);
      
      return () => {
        window.removeEventListener('unifiedSettingsChanged', handleSettingsChange as EventListener);
      };
    }, []);
    
    return refreshTrigger;
  };

  const refreshTrigger = useSettingsSync();

  // Re-run data loading when settings change
  useEffect(() => {
    if (refreshTrigger > 0) {
      // Reload behavior statements when settings change
      const reloadBehaviorStatements = async () => {
        try {
          console.log('🔄 [REFRESH] Reloading behavior statements from settings change...');
          setIsLoadingStatements(true);
          
          const settings = UnifiedDataService.getSettings();
          const customStatements = settings?.dailyCheckIn?.behaviorCommitments?.customStatements;
          
          if (customStatements && Array.isArray(customStatements) && customStatements.length > 0) {
            const categoriesWithCustom = convertCustomStatementsToCategoryFormat(customStatements);
            setBehaviorStatements(categoriesWithCustom);
            console.log('📊 Refreshed with custom statements:', categoriesWithCustom);
          } else {
            setBehaviorStatements(DEFAULT_BEHAVIOR_STATEMENTS);
            console.log('📊 Refreshed with default statements');
          }
        } catch (error) {
          console.error('❌ Failed to reload behavior statements:', error);
          setBehaviorStatements(DEFAULT_BEHAVIOR_STATEMENTS);
        } finally {
          setIsLoadingStatements(false);
        }
      };
      
      reloadBehaviorStatements();
    }
  }, [refreshTrigger]);

  // Load existing commitments on mount
  useEffect(() => {
    if (todayCheckIn?.behaviorCommitments) {
      const choices: {[studentId: string]: string} = {};
      const completed = new Set<string>();
      
      todayCheckIn.behaviorCommitments.forEach(commitment => {
        choices[commitment.studentId] = commitment.commitment;
        if (commitment.achieved) {
          completed.add(commitment.studentId);
        }
      });
      
      setStudentChoices(choices);
      setCompletedStudents(completed);
    }
  }, [todayCheckIn]);

  // Get category for a commitment text
  const getCategoryForCommitment = (commitmentText: string): BehaviorCategory | null => {
    for (const category of behaviorCategories) {
      if (category.commitments.includes(commitmentText)) {
        return category;
      }
    }
    return null;
  };

  // Handle student commitment selection
  const handleStudentCommitmentSelect = (student: Student, commitment: string) => {
    if (!todayCheckIn) return;

    const category = getCategoryForCommitment(commitment);
    if (!category) return;

    // Update local state
    const newChoices = { ...studentChoices };
    newChoices[student.id] = commitment;
    setStudentChoices(newChoices);

    // Create behavior choice object
    const behaviorChoice: StudentBehaviorChoice = {
      id: `commitment_${student.id}_${Date.now()}`,
      studentId: student.id,
      commitmentId: `behavior_${category.id}_${Date.now()}`,
      date: currentDate.toISOString().split('T')[0],
      completed: false,
      timestamp: new Date().toISOString(),
      studentName: student.name,
      studentPhoto: student.photo,
      commitment: commitment,
      category: category.id as any,
      achieved: completedStudents.has(student.id),
      selectedAt: new Date().toISOString()
    };

    // Update check-in data
    const existingCommitments = todayCheckIn.behaviorCommitments || [];
    const updatedCommitments = existingCommitments.filter(c => c.studentId !== student.id);
    updatedCommitments.push(behaviorChoice);

    const updatedCheckIn = {
      ...todayCheckIn,
      behaviorCommitments: updatedCommitments,
      updatedAt: new Date().toISOString()
    };

    onUpdateCheckIn(updatedCheckIn);
    setSelectedStudent(null); // Close selection modal
  };

  // Toggle student achievement
  const toggleStudentAchievement = (studentId: string) => {
    const newCompleted = new Set(completedStudents);
    const isCompleted = newCompleted.has(studentId);
    
    if (isCompleted) {
      newCompleted.delete(studentId);
    } else {
      newCompleted.add(studentId);
      // Show celebration
      setShowCelebration(studentId);
      setTimeout(() => setShowCelebration(null), 2000);
    }
    
    setCompletedStudents(newCompleted);

    // Update check-in data
    if (todayCheckIn?.behaviorCommitments) {
      const updatedCommitments = todayCheckIn.behaviorCommitments.map(commitment => {
        if (commitment.studentId === studentId) {
          return { ...commitment, achieved: !isCompleted };
        }
        return commitment;
      });

      const updatedCheckIn = {
        ...todayCheckIn,
        behaviorCommitments: updatedCommitments,
        updatedAt: new Date().toISOString()
      };

      onUpdateCheckIn(updatedCheckIn);
    }
  };

  // Remove student commitment
  const removeStudentCommitment = (studentId: string) => {
    const newChoices = { ...studentChoices };
    delete newChoices[studentId];
    setStudentChoices(newChoices);

    const newCompleted = new Set(completedStudents);
    newCompleted.delete(studentId);
    setCompletedStudents(newCompleted);

    if (todayCheckIn) {
      const updatedCommitments = (todayCheckIn.behaviorCommitments || []).filter(c => c.studentId !== studentId);
      const updatedCheckIn = {
        ...todayCheckIn,
        behaviorCommitments: updatedCommitments,
        updatedAt: new Date().toISOString()
      };
      onUpdateCheckIn(updatedCheckIn);
    }
  };

  const completedCount = completedStudents.size;
  const totalWithChoices = Object.keys(studentChoices).length;

  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      minHeight: '600px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      {/* Debug Tools for Behavior Statements */}
      <div style={{ 
        position: 'fixed', 
        top: '60px', // Below celebration buttons
        right: '10px', 
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        <button
          onClick={() => {
            console.log('🧪 Testing behavior statement data...');
            console.log('📋 UnifiedDataService.getSettings():', UnifiedDataService.getSettings());
            console.log('🗄️ localStorage calendarSettings:', localStorage.getItem('calendarSettings'));
            console.log('📊 Current behaviorStatements:', behaviorStatements);
            
            // Add a test custom statement directly to UnifiedDataService
            const testSettings = {
              dailyCheckIn: {
                behaviorCommitments: {
                  customStatements: [
                    {
                      id: 'manual_test_1',
                      text: 'I will test my custom behavior statement',
                      category: 'kindness',
                      isActive: true,
                      isDefault: false,
                      createdAt: new Date().toISOString()
                    },
                    {
                      id: 'manual_test_2', 
                      text: 'I will verify the behavior fix works',
                      category: 'respect',
                      isActive: true,
                      isDefault: false,
                      createdAt: new Date().toISOString()
                    }
                  ]
                }
              }
            };
            
            UnifiedDataService.updateSettings(testSettings);
            window.dispatchEvent(new CustomEvent('unifiedSettingsChanged', { detail: testSettings }));
            
            console.log('✅ Added manual test behavior statements');
            alert('Test behavior statements added! Check console for details.');
          }}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          🧪 Add Test Behaviors
        </button>
        
        <button
          onClick={() => {
            console.log('🧪 Refreshing behavior data...');
            const loadBehaviorStatementsFixed = () => {
              try {
                console.log('🔄 [DEBUG] Loading behavior statements...');
                setIsLoadingStatements(true);
                
                const unifiedSettings = UnifiedDataService.getSettings();
                console.log('📋 [DEBUG] UnifiedDataService settings:', unifiedSettings);
                
                let customStatements = [];
                
                if (unifiedSettings?.dailyCheckIn?.behaviorCommitments?.customStatements) {
                  customStatements = unifiedSettings.dailyCheckIn.behaviorCommitments.customStatements;
                  console.log('✅ [DEBUG] Found custom statements in dailyCheckIn.behaviorCommitments:', customStatements);
                } else if (unifiedSettings?.behaviorCommitments?.customStatements) {
                  customStatements = unifiedSettings.behaviorCommitments.customStatements;
                  console.log('✅ [DEBUG] Found custom statements in root behaviorCommitments:', customStatements);
                } else if (unifiedSettings?.customBehaviorStatements) {
                  customStatements = unifiedSettings.customBehaviorStatements;
                  console.log('✅ [DEBUG] Found custom statements in root customBehaviorStatements:', customStatements);
                } else {
                  console.log('ℹ️ [DEBUG] No custom statements found in UnifiedDataService');
                }
                
                if (customStatements.length === 0) {
                  console.log('🔍 [DEBUG] Checking legacy calendarSettings for behavior statements...');
                  const legacySettings = localStorage.getItem('calendarSettings');
                  if (legacySettings) {
                    const parsed = JSON.parse(legacySettings);
                    console.log('📋 [DEBUG] Legacy settings:', parsed);
                    if (parsed.customBehaviorCommitments) {
                      const legacyStatements = parsed.customBehaviorCommitments;
                      customStatements = [];
                      
                      Object.keys(legacyStatements).forEach(categoryId => {
                        const statements = legacyStatements[categoryId] || [];
                        statements.forEach((statement, index) => {
                          customStatements.push({
                            id: `legacy_${categoryId}_${index}`,
                            text: statement,
                            category: categoryId,
                            isActive: true,
                            isDefault: false,
                            createdAt: new Date().toISOString()
                          });
                        });
                      });
                      
                      console.log('✅ [DEBUG] Converted legacy behavior statements:', customStatements);
                    }
                  }
                }
                
                if (customStatements.length > 0) {
                  const categoriesWithCustom = convertStatementsToCategoryFormat(customStatements);
                  setBehaviorStatements(categoriesWithCustom);
                  console.log('📊 [DEBUG] Using behavior categories with custom statements:', categoriesWithCustom);
                } else {
                  console.log('🧪 [DEBUG] No custom statements found, using defaults with test data...');
                  const defaultsWithTest = [...DEFAULT_BEHAVIOR_STATEMENTS];
                  
                  defaultsWithTest[0] = {
                    ...defaultsWithTest[0],
                    text: '🧪 I will test that behavior statements are working'
                  };
                  
                  setBehaviorStatements(defaultsWithTest);
                  console.log('🧪 [DEBUG] Using defaults with test statement:', defaultsWithTest);
                }
                
              } catch (error) {
                console.error('❌ [DEBUG] Error loading behavior statements:', error);
                setBehaviorStatements(DEFAULT_BEHAVIOR_STATEMENTS);
              } finally {
                setIsLoadingStatements(false);
              }
            };
            
            loadBehaviorStatementsFixed();
            alert('Behavior data refreshed! Check console for details.');
          }}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Data
        </button>
        
        <button
          onClick={() => {
            console.log('🔍 Inspecting behavior categories:');
            behaviorCategories.forEach(category => {
              console.log(`📂 ${category.name} (${category.id}):`, category.commitments);
            });
            console.log('📊 Current behaviorStatements:', behaviorStatements);
            alert('Behavior categories logged! Check console for details.');
          }}
          style={{
            background: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          🔍 Inspect Categories
        </button>
      </div>

      {/* Header */}
      <div>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '1rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          💪 "I Will..." Commitments
        </h2>
        <p style={{
          fontSize: '1.3rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '1rem'
        }}>
          Each student chooses ONE behavior goal for today!
        </p>
        
        {/* Simple Completion Counter */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '1rem',
          display: 'inline-block',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            📊 {Object.keys(studentChoices).length} of {students.length} students have made choices
          </div>
          {totalWithChoices > 0 && (
            <div style={{
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.9)'
            }}>
              🏆 {completedCount} commitments achieved!
            </div>
          )}
        </div>
      </div>

      {/* Student Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {students.map(student => {
          const hasChoice = studentChoices[student.id];
          const isCompleted = completedStudents.has(student.id);
          const category = hasChoice ? getCategoryForCommitment(hasChoice) : null;

          return (
            <div
              key={student.id}
              style={{
                background: hasChoice 
                  ? (isCompleted 
                    ? 'linear-gradient(145deg, #28a745, #20c997)'
                    : `linear-gradient(145deg, ${category?.color || '#667eea'}40, ${category?.color || '#667eea'}20)`)
                  : 'rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '1.5rem',
                border: hasChoice 
                  ? (isCompleted 
                    ? '3px solid #28a745'
                    : `3px solid ${category?.color || '#667eea'}`)
                  : '2px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
              onClick={() => {
                if (hasChoice) {
                  toggleStudentAchievement(student.id);
                } else {
                  setSelectedStudent(student.id);
                }
              }}
              onMouseEnter={(e) => {
                if (!hasChoice) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!hasChoice) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {/* Student Photo */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: student.photo 
                  ? 'transparent' 
                  : 'linear-gradient(145deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                border: hasChoice 
                  ? (isCompleted ? '4px solid #FFD700' : `3px solid ${category?.color || '#667eea'}`)
                  : '2px solid rgba(255,255,255,0.3)',
                boxShadow: hasChoice 
                  ? '0 6px 20px rgba(0,0,0,0.3)'
                  : '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={student.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <span style={{
                    fontSize: '2rem',
                    color: 'white',
                    fontWeight: '700'
                  }}>
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>

              {/* Student Name */}
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1rem'
              }}>
                {student.name}
              </div>

              {/* Commitment Status */}
              {hasChoice ? (
                <div>
                  {/* Category Badge */}
                  <div style={{
                    background: category?.color || '#667eea',
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    display: 'inline-block',
                    marginBottom: '0.8rem'
                  }}>
                    {category?.icon} {category?.name}
                  </div>
                  
                  {/* Commitment Text */}
                  <div style={{
                    fontSize: '0.95rem',
                    color: 'white',
                    marginBottom: '1rem',
                    lineHeight: '1.3',
                    fontStyle: 'italic'
                  }}>
                    "{hasChoice}"
                  </div>
                  
                  {/* Achievement Status */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {isCompleted ? '✅' : '⏳'}
                    </span>
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {isCompleted ? 'Achieved!' : 'Working on it'}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '0.5rem',
                    opacity: 0.7
                  }}>
                    🎯
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontStyle: 'italic'
                  }}>
                    Click to choose commitment
                  </div>
                </div>
              )}

              {/* Remove Button */}
              {hasChoice && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Remove ${student.name}'s commitment?`)) {
                      removeStudentCommitment(student.id);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(220, 53, 69, 0.8)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    color: 'white',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  ×
                </button>
              )}

              {/* Achievement Celebration */}
              {showCelebration === student.id && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(255, 215, 0, 0.95)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  animation: 'celebrate 0.8s ease-in-out',
                  zIndex: 10,
                  boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)'
                }}>
                  🎉
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Commitment Selection Modal */}
      {selectedStudent && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #667eea, #764ba2)',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '3px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '2rem',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                Choose a commitment for {students.find(s => s.id === selectedStudent)?.name}
              </h3>
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.9)'
              }}>
                Select any statement from any category
              </p>
            </div>

            {/* Categories and Commitments */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {behaviorCategories.map(category => (
                <div key={category.id} style={{
                  background: `linear-gradient(145deg, ${category.color}30, ${category.color}10)`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: `2px solid ${category.color}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '2rem' }}>{category.icon}</span>
                    <div>
                      <h4 style={{
                        margin: '0',
                        fontSize: '1.3rem',
                        color: 'white',
                        fontWeight: '700'
                      }}>
                        {category.name}
                      </h4>
                      <p style={{
                        margin: '0',
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.8)'
                      }}>
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '0.8rem'
                  }}>
                    {category.commitments.map((commitment, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const student = students.find(s => s.id === selectedStudent);
                          if (student) {
                            handleStudentCommitmentSelect(student, commitment);
                          }
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderRadius: '12px',
                          color: 'white',
                          padding: '1rem',
                          fontSize: '0.95rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          textAlign: 'left',
                          lineHeight: '1.3'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        "{commitment}"
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div style={{
              textAlign: 'center',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Statement Count Display */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '2rem',
        textAlign: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ color: 'white', fontSize: '1rem', fontWeight: '600' }}>
          📊 Behavior Statements Loaded
        </div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          {behaviorCategories.length} categories • {' '}
          {behaviorCategories.reduce((total, cat) => total + cat.commitments.length, 0)} total statements
        </div>
        {behaviorStatements.some(statement => statement.text.includes('🧪')) && (
          <div style={{ color: '#ffc107', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            ⚠️ Test statements included
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '2rem',
        position: 'relative', // Ensure proper stacking context
        zIndex: 10 // Above any modal content
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
        >
          ← Back to Celebrations
        </button>
        
        <button
          onClick={onNext}
          style={{
            background: 'rgba(34, 197, 94, 0.8)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            position: 'relative',
            zIndex: 11 // Highest priority for the continue button
          }}
        >
          Continue to Choices →
        </button>
      </div>

      <style>{`
        @keyframes celebrate {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default BehaviorCommitments;

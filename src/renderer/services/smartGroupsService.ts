// Data Collection Integration
  dataCollectionPlan: {
    goalIds: string[];
    measurementMoments: string[];
    collectionMethod: string;
    successCriteria: string[];
  };
  
  // Generated metadata
  generatedAt: string;
  teacherApproved?: boolean;
  implementationDate?: string;
  notes?: string;
}

export interface AIAnalysisConfig {
  state: string; // "SC", "NC", etc.
  grade: string;
  analysisDepth: 'quick' | 'standard' | 'comprehensive';
  includeCustomActivities: boolean;
  themeWeight: number; // 0-1, how much to weight theme alignment
  standardsWeight: number; // 0-1, how much to weight standards coverage
  iepWeight: number; // 0-1, how much to weight IEP goal alignment
  groupSizePreference: { min: number; max: number };
  frequencyLimit: number; // Max recommendations per week
}

// ===== ENHANCED ACTIVITY FOR AI ANALYSIS =====

export interface AIEnhancedActivity extends UnifiedActivity {
  // AI Analysis Fields
  academicDomains: string[]; // ["math", "reading", "science"]
  socialSkills: string[]; // ["cooperation", "turn-taking", "communication"]
  cognitiveLoad: 1 | 2 | 3 | 4 | 5; // Mental effort required
  accommodationSupport: string[]; // ["visual-supports", "reduced-complexity"]
  engagementFactors: string[]; // ["hands-on", "movement", "technology"]
  
  // Enhanced fields
  skillLevel?: 'emerging' | 'developing' | 'proficient' | 'advanced';
  groupSize?: { min: number; max: number; optimal: number };
  supervision?: 'independent' | 'minimal' | 'moderate' | 'high';
  noise?: 'quiet' | 'moderate' | 'active';
  movement?: 'seated' | 'standing' | 'movement';
  
  // AI-Generated Enhancement
  standardsAlignment?: string[]; // Auto-detected standards this activity supports
  aiConfidence?: number; // 0-100 confidence in AI analysis
  lastAIUpdate?: string; // When AI last analyzed this activity
}

// ===== GOAL CLUSTERING INTERFACE =====

interface GoalCluster {
  id: string;
  goals: IEPGoal[];
  studentIds: string[];
  commonDomain: string;
  commonSkills: string[];
  averageComplexity: number;
}

// ===== SMART GROUPS AI SERVICE =====

export class SmartGroupsAIService {
  private static readonly STORAGE_KEY = 'bloom_smart_groups_data';
  private static readonly STANDARDS_KEY = 'bloom_state_standards';
  private static readonly THEMES_KEY = 'bloom_monthly_themes';
  
  // ===== STATE STANDARDS MANAGEMENT =====
  
  static async loadStateStandards(state: string, grade: string): Promise<StateStandard[]> {
    const cacheKey = `${state}_${grade}_standards`;
    const cached = localStorage.getItem(`${this.STANDARDS_KEY}_${cacheKey}`);
    
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        console.error('Error parsing cached standards:', error);
      }
    }
    
    // Generate mock standards - in production, this would call real APIs
    const mockStandards = await this.generateStateStandards(state, grade);
    localStorage.setItem(`${this.STANDARDS_KEY}_${cacheKey}`, JSON.stringify(mockStandards));
    
    return mockStandards;
  }
  
  private static async generateStateStandards(state: string, grade: string): Promise<StateStandard[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    
    const standards: StateStandard[] = [
      // ELA Standards
      {
        id: `${state}.ELA.${grade}.1`,
        code: `CCSS.ELA-LITERACY.RL.${grade}.2`,
        state,
        grade,
        subject: 'ELA',
        domain: 'Reading Literature',
        title: 'Determine Central Message',
        description: `Recount stories and determine the central message, lesson, or moral and explain how it is conveyed through key details`,
        subSkills: ['main idea', 'supporting details', 'summarization', 'theme identification', 'story elements'],
        complexity: Math.min(5, gradeNum + 2),
        assessmentMethods: ['oral retelling', 'graphic organizers', 'discussion', 'written response'],
        typicalActivities: ['story mapping', 'character analysis', 'theme discussions', 'read-alouds'],
        accommodationSupport: ['visual supports', 'reduced text complexity', 'partner reading', 'audio support']
      },
      {
        id: `${state}.ELA.${grade}.2`,
        code: `CCSS.ELA-LITERACY.RF.${grade}.3`,
        state,
        grade,
        subject: 'ELA',
        domain: 'Reading Foundational Skills',
        title: 'Phonics and Word Recognition',
        description: 'Know and apply grade-level phonics and word analysis skills in decoding words',
        subSkills: ['phonics', 'word recognition', 'decoding', 'fluency', 'sight words'],
        complexity: Math.min(4, gradeNum + 1),
        assessmentMethods: ['reading assessments', 'word recognition tests', 'fluency checks'],
        typicalActivities: ['phonics games', 'word sorts', 'guided reading', 'sight word practice'],
        accommodationSupport: ['multisensory approaches', 'repeated practice', 'visual cues']
      },
      
      // Math Standards
      {
        id: `${state}.MATH.${grade}.1`,
        code: `CCSS.MATH.CONTENT.${grade}.OA.A.1`,
        state,
        grade,
        subject: 'Math',
        domain: 'Operations & Algebraic Thinking',
        title: 'Addition and Subtraction Word Problems',
        description: 'Use addition and subtraction within appropriate range to solve word problems',
        subSkills: ['problem solving', 'addition', 'subtraction', 'word problems', 'strategy selection'],
        complexity: Math.min(5, gradeNum + 2),
        assessmentMethods: ['problem solving tasks', 'math journals', 'manipulative use', 'verbal explanations'],
        typicalActivities: ['real-world scenarios', 'math centers', 'collaborative problem solving', 'story problems'],
        accommodationSupport: ['manipulatives', 'visual models', 'reduced numbers', 'step-by-step guides']
      },
      {
        id: `${state}.MATH.${grade}.2`,
        code: `CCSS.MATH.CONTENT.${grade}.MD.A.1`,
        state,
        grade,
        subject: 'Math',
        domain: 'Measurement & Data',
        title: 'Measurement and Estimation',
        description: 'Measure lengths and solve problems involving measurement',
        subSkills: ['measurement', 'estimation', 'units', 'comparison', 'data collection'],
        complexity: Math.min(4, gradeNum + 1),
        assessmentMethods: ['hands-on measurement', 'estimation games', 'data charts'],
        typicalActivities: ['measuring activities', 'estimation stations', 'science experiments', 'cooking'],
        accommodationSupport: ['concrete tools', 'visual references', 'partner work']
      },
      
      // Science Standards
      {
        id: `${state}.SCI.${grade}.1`,
        code: `NGSS.${grade}-LS1-1`,
        state,
        grade,
        subject: 'Science',
        domain: 'Life Science',
        title: 'Plant and Animal Structures',
        description: 'Use materials to design solutions based on how plants and animals use structures',
        subSkills: ['observation', 'structures', 'function', 'design', 'life science'],
        complexity: Math.min(4, gradeNum + 1),
        assessmentMethods: ['observation logs', 'design challenges', 'experiments'],
        typicalActivities: ['nature walks', 'design challenges', 'observation journals', 'experiments'],
        accommodationSupport: ['visual guides', 'hands-on materials', 'simplified vocabulary']
      },
      
      // Social Studies Standards
      {
        id: `${state}.SS.${grade}.1`,
        code: `NCSS.${grade}.4`,
        state,
        grade,
        subject: 'Social Studies',
        domain: 'Individual Development and Identity',
        title: 'Community and Relationships',
        description: 'Explore factors that contribute to identity and community relationships',
        subSkills: ['community', 'identity', 'relationships', 'citizenship', 'diversity'],
        complexity: Math.min(3, gradeNum + 1),
        assessmentMethods: ['discussions', 'projects', 'role-playing', 'community maps'],
        typicalActivities: ['community helpers', 'family trees', 'cultural sharing', 'citizenship activities'],
        accommodationSupport: ['visual supports', 'discussion prompts', 'peer partnerships']
      }
    ];
    
    return standards;
  }
  
  // ===== THEME MANAGEMENT =====
  
  static saveMonthlyTheme(theme: MonthlyTheme): void {
    const themes = this.getAllThemes();
    const existingIndex = themes.findIndex(t => t.id === theme.id);
    
    if (existingIndex >= 0) {
      themes[existingIndex] = theme;
    } else {
      themes.push(theme);
    }
    
    localStorage.setItem(this.THEMES_KEY, JSON.stringify(themes));
    console.log('💾 Monthly theme saved:', theme.title);
  }
  
  static getMonthlyTheme(month: number, year: number): MonthlyTheme | null {
    const themes = this.getAllThemes();
    return themes.find(t => t.month === month && t.year === year) || null;
  }
  
  static getAllThemes(): MonthlyTheme[] {
    const stored = localStorage.getItem(this.THEMES_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  
  static createThemeFromSelection(month: number, year: number, title: string, description?: string): MonthlyTheme {
    const themeKeywords = this.generateThemeKeywords(title);
    
    return {
      id: `theme_${month}_${year}_${Date.now()}`,
      month,
      year,
      title,
      description: description || `${title} themed learning activities for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })}`,
      keywords: themeKeywords,
      subThemes: this.generateSubThemes(title, themeKeywords),
      stateStandardsPriority: [],
      learningObjectives: this.generateLearningObjectives(title),
      assessmentOpportunities: this.generateAssessmentOpportunities(title),
      materialSuggestions: this.generateMaterialSuggestions(title)
    };
  }
  
  private static generateThemeKeywords(title: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'spring': ['growth', 'plants', 'weather', 'flowers', 'gardens', 'lifecycle', 'renewal'],
      'weather': ['temperature', 'seasons', 'rain', 'sun', 'clouds', 'wind', 'forecast'],
      'plants': ['seeds', 'roots', 'leaves', 'growth', 'photosynthesis', 'gardening'],
      'animals': ['habitats', 'adaptation', 'lifecycle', 'food chain', 'migration'],
      'community': ['helpers', 'jobs', 'citizenship', 'cooperation', 'diversity'],
      'family': ['relationships', 'traditions', 'culture', 'generations', 'heritage'],
      'ocean': ['marine life', 'waves', 'coral reef', 'conservation', 'exploration'],
      'space': ['planets', 'solar system', 'astronauts', 'exploration', 'gravity']
    };
    
    const titleLower = title.toLowerCase();
    let keywords: string[] = [];
    
    Object.keys(keywordMap).forEach(key => {
      if (titleLower.includes(key)) {
        keywords.push(...keywordMap[key]);
      }
    });
    
    // Add base theme words
    keywords.push(...titleLower.split(' ').filter(word => word.length > 2));
    
    return [...new Set(keywords)]; // Remove duplicates
  }
  
  private static generateSubThemes(title: string, keywords: string[]): WeeklySubTheme[] {
    const baseThemes = [
      { week: 1, title: `Introduction to ${title}`, focus: 'Exploration & Discovery' },
      { week: 2, title: `Deep Dive into ${title}`, focus: 'Investigation & Learning' },
      { week: 3, title: `${title} in Action`, focus: 'Application & Practice' },
      { week: 4, title: `${title} Celebration`, focus: 'Synthesis & Sharing' }
    ];
    
    return baseThemes.map(theme => ({
      ...theme,
      keywords: keywords.slice(0, 3) // Use first 3 keywords for each week
    }));
  }
  
  private static generateLearningObjectives(title: string): string[] {
    return [
      `Students will explore concepts related to ${title}`,
      `Students will make connections between ${title} and their daily lives`,
      `Students will demonstrate understanding through creative expression`,
      `Students will collaborate effectively during ${title}-themed activities`
    ];
  }
  
  private static generateAssessmentOpportunities(title: string): string[] {
    return [
      `${title} themed project presentations`,
      'Observation during themed activities',
      'Student reflection journals',
      'Peer collaboration assessments',
      'Creative demonstrations of learning'
    ];
  }
  
  private static generateMaterialSuggestions(title: string): string[] {
    const baseMaterials = ['books', 'visual supports', 'hands-on materials', 'art supplies'];
    const themeMaterials: { [key: string]: string[] } = {
      'spring': ['seeds', 'soil', 'measuring tools', 'plant pots', 'growth charts'],
      'weather': ['thermometer', 'weather charts', 'cloud identification cards'],
      'ocean': ['shells', 'marine life pictures', 'blue materials', 'water sensory bin'],
      'space': ['star charts', 'planet models', 'telescope pictures', 'dark materials']
    };
    
    const titleLower = title.toLowerCase();
    let materials = [...baseMaterials];
    
    Object.keys(themeMaterials).forEach(key => {
      if (titleLower.includes(key)) {
        materials.push(...themeMaterials[key]);
      }
    });
    
    return materials;
  }
  
  // ===== AI ANALYSIS ENGINE =====
  
  static async generateSmartGroupRecommendations(
    config: AIAnalysisConfig,
    theme?: MonthlyTheme
  ): Promise<SmartGroupRecommendation[]> {
    console.log('🧠 Starting Smart Groups AI Analysis...', config);
    
    try {
      // Get data from existing UnifiedDataService
      const students = UnifiedDataService.getAllStudents();
      const activities = UnifiedDataService.getAllActivities();
      const standards = await this.loadStateStandards(config.state, config.grade);
      
      console.log('📊 Analysis data:', {
        students: students.length,
        studentsWithGoals: students.filter(s => s.iepData?.goals?.length).length,
        activities: activities.length,
        standards: standards.length
      });
      
      // Filter students with IEP goals
      const studentsWithGoals = students.filter(student => 
        student.iepData?.goals && student.iepData.goals.length > 0
      );
      
      if (studentsWithGoals.length < 2) {
        console.warn('⚠️ Not enough students with IEP goals for group formation');
        return [];
      }
      
      // Enhanced activity analysis
      const enhancedActivities = await this.enhanceActivitiesWithAI(activities, standards, theme);
      
      // AI analysis steps
      const recommendations: SmartGroupRecommendation[] = [];
      
      // 1. Analyze IEP goals for common patterns
      const goalClusters = this.analyzeGoalClusters(studentsWithGoals);
      console.log('🎯 Goal clusters found:', goalClusters.length);
      
      // 2. Find standards that need coverage
      const priorityStandards = this.identifyPriorityStandards(standards, theme);
      console.log('📚 Priority standards:', priorityStandards.length);
      
      // 3. Match goals to standards and activities
      for (const cluster of goalClusters) {
        for (const standard of priorityStandards) {
          const matchingActivities = this.findMatchingActivities(
            enhancedActivities, 
            cluster.goals, 
            standard, 
            theme
          );
          
          if (matchingActivities.length > 0) {
            const recommendation = await this.createRecommendation(
              cluster,
              standard,
              matchingActivities[0], // Best match
              theme,
              config
            );
            
            if (recommendation.confidence >= 70) { // Only high-confidence recommendations
              recommendations.push(recommendation);
            }
          }
        }
      }
      
      // Sort by confidence and limit results
      const finalRecommendations = recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, config.frequencyLimit || 5);
      
      console.log('✅ AI Analysis complete:', finalRecommendations.length, 'recommendations generated');
      return finalRecommendations;
      
    } catch (error) {
      console.error('❌ Error in AI analysis:', error);
      return [];
    }
  }
  
  private static async enhanceActivitiesWithAI(
    activities: UnifiedActivity[],
    standards: StateStandard[],
    theme?: MonthlyTheme
  ): Promise<AIEnhancedActivity[]> {
    console.log('🔍 Enhancing activities with AI analysis...');
    
    return activities.map(activity => {
      const enhanced: AIEnhancedActivity = {
        ...activity,
        academicDomains: this.inferAcademicDomains(activity),
        socialSkills: this.inferSocialSkills(activity),
        cognitiveLoad: this.inferCognitiveLoad(activity),
        accommodationSupport: this.inferAccommodations(activity),
        engagementFactors: this.inferEngagementFactors(activity),
        standardsAlignment: this.inferStandardsAlignment(activity, standards),
        aiConfidence: this.calculateActivityConfidence(activity),
        lastAIUpdate: new Date().toISOString()
      };
      
      return enhanced;
    });
  }
  
  private static inferAcademicDomains(activity: UnifiedActivity): string[] {
    const domains: string[] = [];
    const text = `${activity.name} ${activity.description || ''}`.toLowerCase();
    
    const domainKeywords = {
      math: ['math', 'number', 'count', 'add', 'subtract', 'measure', 'geometry', 'data', 'problem', 'calculate'],
      reading: ['read', 'story', 'book', 'text', 'comprehension', 'phonics', 'vocabulary', 'literature'],
      writing: ['write', 'journal', 'compose', 'author', 'edit', 'draft', 'narrative', 'opinion'],
      science: ['science', 'experiment', 'observe', 'investigate', 'hypothesis', 'nature', 'plant', 'animal'],
      social: ['community', 'history', 'geography', 'culture', 'citizenship', 'government', 'economy'],
      art: ['art', 'create', 'draw', 'paint', 'design', 'creative', 'aesthetic', 'visual'],
      music: ['music', 'sing', 'rhythm', 'instrument', 'song', 'melody', 'beat'],
      pe: ['physical', 'movement', 'exercise', 'sport', 'motor', 'coordination', 'fitness']
    };
    
    Object.entries(domainKeywords).forEach(([domain, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        domains.push(domain);
      }
    });
    
    // Category-based inference
    if (activity.category === 'academic') domains.push('academic');
    if (activity.category === 'social') domains.push('social');
    
    return [...new Set(domains)];
  }
  
  private static inferSocialSkills(activity: UnifiedActivity): string[] {
    const skills: string[] = [];
    const text = `${activity.name} ${activity.description || ''}`.toLowerCase();
    
    const skillKeywords = {
      cooperation: ['group', 'team', 'together', 'collaborate', 'share', 'partner'],
      communication: ['talk', 'discuss', 'present', 'explain', 'ask', 'tell', 'listen'],
      'turn-taking': ['turn', 'wait', 'alternate', 'rotate', 'sequence'],
      'problem-solving': ['solve', 'figure out', 'find', 'decide', 'choose', 'plan'],
      leadership: ['lead', 'guide', 'direct', 'manage', 'organize'],
      empathy: ['feel', 'understand', 'care', 'help', 'support', 'kind']
    };
    
    Object.entries(skillKeywords).forEach(([skill, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        skills.push(skill);
      }
    });
    
    return skills;
  }
  
  private static inferCognitiveLoad(activity: UnifiedActivity): 1 | 2 | 3 | 4 | 5 {
    const duration = activity.duration || 20;
    const text = `${activity.name} ${activity.description || ''}`.toLowerCase();
    
    let load = 2; // Default moderate load
    
    // Duration-based adjustment
    if (duration < 10) load -= 1;
    if (duration > 30) load += 1;
    if (duration > 45) load += 1;
    
    // Complexity keywords
    const highComplexity = ['analyze', 'evaluate', 'create', 'synthesize', 'complex', 'multi-step'];
    const lowComplexity = ['simple', 'basic', 'easy', 'identify', 'recall', 'match'];
    
    if (highComplexity.some(word => text.includes(word))) load += 2;
    if (lowComplexity.some(word => text.includes(word))) load -= 1;
    
    return Math.max(1, Math.min(5, load)) as 1 | 2 | 3 | 4 | 5;
  }
  
  private static inferAccommodations(activity: UnifiedActivity): string[] {
    const accommodations: string[] = [];
    const text = `${activity.name} ${activity.description || ''}`.toLowerCase();
    
    const accommodationKeywords = {
      'visual-supports': ['visual', 'picture', 'chart', 'graphic', 'diagram', 'image'],
      'tactile-supports': ['hands-on', 'manipulative', 'touch', 'feel', 'concrete', 'physical'],
      'audio-supports': ['listen', 'audio', 'sound', 'music', 'verbal', 'oral'],
      'reduced-complexity': ['simple', 'basic', 'step-by-step', 'guided', 'scaffold'],
      'extended-time': ['time', 'pace', 'slow', 'extended', 'flexible'],
      'movement-breaks': ['movement', 'active', 'break', 'stretch', 'physical']
    };
    
    Object.entries(accommodationKeywords).forEach(([accommodation, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        accommodations.push(accommodation);
      }
    });
    
    return accommodations;
  }
  
  private static inferEngagementFactors(activity: UnifiedActivity): string[] {
    const factors: string[] = [];
    const text = `${activity.name} ${activity.description || ''}`.toLowerCase();
    
    const factorKeywords = {
      'hands-on': ['hands-on', 'manipulative', 'build', 'create', 'make', 'construct'],
      'technology': ['computer', 'digital', 'app', 'tablet', 'screen', 'online'],
      'movement': ['move', 'active', 'dance', 'exercise', 'walk', 'run'],
      'games': ['game', 'play', 'fun', 'competition', 'challenge'],
      'art': ['art', 'draw', 'paint', 'color', 'craft', 'creative'],
      'music': ['music', 'sing', 'rhythm', 'song', 'instrument'],
      'nature': ['nature', 'outdoor', 'garden', 'plant', 'animal', 'environment']
    };
    
    Object.entries(factorKeywords).forEach(([factor, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        factors.push(factor);
      }
    });
    
    return factors;
  }
  
  private static inferStandardsAlignment(activity: UnifiedActivity, standards: StateStandard[]): string[] {
    const alignments: string[] = [];
    const activityText = `${activity.name} ${activity.description || ''}`.toLowerCase();
    
    standards.forEach(standard => {
      let matchScore = 0;
      
      // Check for subject alignment
      const activityDomains = this.inferAcademicDomains(activity);
      if (activityDomains.some(domain => standard.subject.toLowerCase().includes(domain))) {
        matchScore += 2;
      }
      
      // Check for skill keyword overlap
      standard.subSkills.forEach(skill => {
        if (activityText.includes(skill.toLowerCase())) {
          matchScore += 1;
        }
      });
      
      // Check for typical activities mentioned
      standard.typicalActivities.forEach(typical => {
        if (activityText.includes(typical.toLowerCase())) {
          matchScore += 3;
        }
      });
      
      // Check description overlap
      const standardText = standard.description.toLowerCase();
      const sharedWords = activityText.split(' ').filter(word => 
        word.length > 3 && standardText.includes(word)
      );
      matchScore += sharedWords.length * 0.5;
      
      if (matchScore >= 2) {
        alignments.push(standard.id);
      }
    });
    
    return alignments;
  }
  
  private static calculateActivityConfidence(activity: UnifiedActivity): number {
    let confidence = 70; // Base confidence
    
    // Boost for detailed descriptions
    if (activity.description && activity.description.length > 50) confidence += 10;
    
    // Boost for materials list
    if (activity.materials && activity.materials.length > 0) confidence += 5;
    
    // Boost for instructions
    if (activity.instructions && activity.instructions.length > 20) confidence += 10;
    
    // Boost for custom activities (teacher-created)
    if (activity.isCustom) confidence += 5;
    
    return Math.min(100, confidence);
  }
  
  private static analyzeGoalClusters(students: UnifiedStudent[]): GoalCluster[] {
    const clusters: GoalCluster[] = [];
    const processedGoals = new Set<string>();
    
    students.forEach(student => {
      student.iepData?.goals?.forEach(goal => {
        if (processedGoals.has(goal.id)) return;
        
        // Find similar goals across students
        const cluster: GoalCluster = {
          id: `cluster_${Date.now()}_${Math.random()}`,
          goals: [goal],
          studentIds: [student.id],
          commonDomain: goal.domain,
          commonSkills: this.extractSkillsFromGoal(goal),
          averageComplexity: this.estimateGoalComplexity(goal)
        };
        
        // Look for similar goals in other students
        students.forEach(otherStudent => {
          if (otherStudent.id === student.id) return;
          
          otherStudent.iepData?.goals?.forEach(otherGoal => {
            if (processedGoals.has(otherGoal.id)) return;
            
            if (this.areGoalsSimilar(goal, otherGoal)) {
              cluster.goals.push(otherGoal);
              cluster.studentIds.push(otherStudent.id);
              cluster.averageComplexity = (cluster.averageComplexity + this.estimateGoalComplexity(otherGoal)) / 2;
              processedGoals.add(otherGoal.id);
            }
          });
        });
        
        processedGoals.add(goal.id);
        
        // Only include clusters with 2+ students (small group requirement)
        if (cluster.studentIds.length >= 2 && cluster.studentIds.length <= 6) {
          clusters.push(cluster);
        }
      });
    });
    
    return clusters;
  }
  
  private static areGoalsSimilar(goal1: IEPGoal, goal2: IEPGoal): boolean {
    // Domain match is primary
    if (goal1.domain !== goal2.domain) return false;
    
    // Measurement type compatibility
    const compatibleMeasurements = this.areMovementTypesCompatible(goal1.measurementType, goal2.measurementType);
    if (!compatibleMeasurements) return false;
    
    // Skill overlap check
    const skills1 = this.extractSkillsFromGoal(goal1);
    const skills2 = this.extractSkillsFromGoal(goal2);
    const sharedSkills = skills1.filter(skill => skills2.includes(skill));
    
    return sharedSkills.length >= 1; // At least one shared skill
  }
  
  private static areMovementTypesCompatible(type1: string, type2: string): boolean {
    // Group compatible measurement types
    const percentageGroup = ['percentage', 'rating'];
    const countGroup = ['frequency', 'duration'];
    const binaryGroup = ['yes-no', 'independence'];
    
    if (type1 === type2) return true;
    if (percentageGroup.includes(type1) && percentageGroup.includes(type2)) return true;
    if (countGroup.includes(type1) && countGroup.includes(type2)) return true;
    if (binaryGroup.includes(type1) && binaryGroup.includes(type2)) return true;
    
    return false;
  }
  
  private static extractSkillsFromGoal(goal: IEPGoal): string[] {
    const text = `${goal.title || ''} ${goal.description || ''} ${goal.shortTermObjective || ''}`.toLowerCase();
    
    const skillKeywords = [
      'reading', 'math', 'counting', 'writing', 'social', 'communication',
      'behavior', 'attention', 'following directions', 'independence',
      'comprehension', 'phonics', 'fluency', 'vocabulary', 'addition',
      'subtraction', 'multiplication', 'problem solving', 'measurement',
      'cooperation', 'turn-taking', 'sharing', 'asking for help',
      'staying on task', 'completing work', 'organizing materials'
    ];
    
    return skillKeywords.filter(skill => text.includes(skill));
  }
  
  private static estimateGoalComplexity(goal: IEPGoal): number {
    let complexity = 3; // Default moderate complexity
    
    const text = `${goal.description || ''} ${goal.shortTermObjective || ''}`.toLowerCase();
    
    // Complexity indicators
    if (text.includes('multi-step') || text.includes('complex')) complexity += 2;
    if (text.includes('simple') || text.includes('basic')) complexity -= 1;
    if (text.includes('independent')) complexity += 1;
    if (text.includes('with support')) complexity -= 1;
    
    // Target-based complexity
    if (goal.target >= 90) complexity += 1;
    if (goal.target <= 50) complexity -= 1;
    
    return Math.max(1, Math.min(5, complexity));
  }
  
  private static identifyPriorityStandards(standards: StateStandard[], theme?: MonthlyTheme): StateStandard[] {
    // In production, this would use curriculum calendars and pacing guides
    let priorityStandards = standards.slice(0, 6); // Get first 6 standards
    
    // If theme is provided, prioritize standards that align with theme
    if (theme) {
      const themeAlignedStandards = standards.filter(standard => {
        const standardText = `${standard.title} ${standard.description}`.toLowerCase();
        return theme.keywords.some(keyword => 
          standardText.includes(keyword.toLowerCase())
        );
      });
      
      if (themeAlignedStandards.length > 0) {
        priorityStandards = [
          ...themeAlignedStandards.slice(0, 3),
          ...standards.filter(s => !themeAlignedStandards.includes(s)).slice(0, 3)
        ];
      }
    }
    
    return priorityStandards;
  }
  
  private static findMatchingActivities(
    activities: AIEnhancedActivity[],
    goals: IEPGoal[],
    standard: StateStandard,
    theme?: MonthlyTheme
  ): AIEnhancedActivity[] {
    return activities.filter(activity => {
      let matchScore = 0;
      
      // Check if activity aligns with standard
      if (activity.standardsAlignment?.includes(standard.id)) {
        matchScore += 3;
      }
      
      // Check if activity supports goal domains
      const supportsGoalDomains = goals.some(goal => {
        if (goal.domain === 'academic' && activity.academicDomains.length > 0) return true;
        if (goal.domain === 'behavioral' && activity.socialSkills.length > 0) return true;
        if (goal.domain === 'social-emotional' && activity.socialSkills.length > 0) return true;
        if (goal.domain === 'communication' && activity.socialSkills.includes('communication')) return true;
        return false;
      });
      
      if (supportsGoalDomains) matchScore += 2;
      
      // Check subject alignment
      if (activity.academicDomains.some(domain => 
        standard.subject.toLowerCase().includes(domain)
      )) {
        matchScore += 2;
      }
      
      // Check theme alignment if provided
      if (theme && this.activityMatchesTheme(activity, theme)) {
        matchScore += 1;
      }
      
      // Check appropriate complexity
      const averageGoalComplexity = goals.reduce((sum, goal) => 
        sum + this.estimateGoalComplexity(goal), 0
      ) / goals.length;
      
      if (Math.abs(activity.cognitiveLoad - averageGoalComplexity) <= 1) {
        matchScore += 1;
      }
      
      return matchScore >= 3; // Minimum threshold for consideration
    }).sort((a, b) => {
      // Sort by AI confidence and alignment strength
      const scoreA = (a.aiConfidence || 70) + (a.standardsAlignment?.length || 0) * 10;
      const scoreB = (b.aiConfidence || 70) + (b.standardsAlignment?.length || 0) * 10;
      return scoreB - scoreA;
    });
  }
  
  private static activityMatchesTheme(activity: AIEnhancedActivity, theme: MonthlyTheme): boolean {
    const activityText = `${activity.name} ${activity.description || ''}`.toLowerCase();
    return theme.keywords.some(keyword => 
      activityText.includes(keyword.toLowerCase())
    );
  }
  
  private static async createRecommendation(
    cluster: GoalCluster,
    standard: StateStandard,
    activity: AIEnhancedActivity,
    theme: MonthlyTheme | undefined,
    config: AIAnalysisConfig
  ): Promise<SmartGroupRecommendation> {
    // Calculate confidence based on multiple factors
    const confidence = this.calculateRecommendationConfidence(cluster, standard, activity, theme, config);
    
    // Get student names for the cluster
    const students = cluster.studentIds.map(id => UnifiedDataService.getStudent(id)).filter(s => s !== null);
    
    return {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      groupName: this.generateGroupName(cluster, standard, activity, theme),
      confidence,
      studentIds: cluster.studentIds,
      studentCount: cluster.studentIds.length,
      standardsAddressed: [{
        standardId: standard.id,
        standard,
        coverageReason: `Activity provides structured practice for ${standard.domain} skills with ${standard.subject} focus`
      }],
      iepGoalsAddressed: cluster.goals.map(goal => ({
        goalId: goal.id,
        studentId: goal.studentId,
        goal,
        alignmentReason: `${activity.name} provides natural opportunities for practicing ${goal.domain} skills in a ${theme ? 'themed ' : ''}small group setting`
      })),
      recommendedActivity: {
        activityId: activity.id,
        activity: activity as UnifiedActivity, // Convert back to base type
        adaptations: this.generateAdaptations(cluster.goals, activity),
        duration: activity.duration || 25,
        materials: activity.materials || [],
        setup: this.generateSetupInstructions(activity, cluster.studentIds.length),
        implementation: this.generateImplementationGuide(activity, cluster.goals, standard)
      },
      themeConnection: theme ? {
        themeId: theme.id,
        relevance: `All activities and materials connect to ${theme.title} theme for cohesive learning experience`,
        thematicElements: this.identifyThematicElements(activity, theme)
      } : undefined,
      benefits: this.generateBenefits(cluster, standard, activity, theme),
      rationale: this.generateRationale(cluster, standard, activity, theme),
      suggestedScheduling: {
        frequency: this.suggestFrequency(cluster.goals),
        duration: activity.duration || 25,
        preferredTimes: ['9:00 AM', '10:30 AM', '1:00 PM']
      },
      dataCollectionPlan: {
        goalIds: cluster.goals.map(g => g.id),
        measurementMoments: ['Activity start', 'Mid-activity check', 'Activity completion'],
        collectionMethod: this.suggestDataCollectionMethod(cluster.goals),
        successCriteria: cluster.goals.map(g => `Progress toward ${g.criteria} with ${g.target}% target`)
      },
      generatedAt: new Date().toISOString()
    };
  }
  
  private static calculateRecommendationConfidence(
    cluster: GoalCluster,
    standard: StateStandard,
    activity: AIEnhancedActivity,
    theme: MonthlyTheme | undefined,
    config: AIAnalysisConfig
  ): number {
    let confidence = 60; // Base confidence
    
    // Student group size bonus (optimal is 2-4 students)
    if (cluster.studentIds.length >= 2 && cluster.studentIds.length <= 4) {
      confidence += 15;
    } else if (cluster.studentIds.length <= 6) {
      confidence += 10;
    }
    
    // Standards alignment bonus
    if (activity.standardsAlignment?.includes(standard.id)) {
      confidence += 20;
    }
    
    // Goal domain alignment bonus
    const domainAlignment = cluster.goals.every(goal => {
      if (goal.domain === 'academic') return activity.academicDomains.length > 0;
      if (goal.domain === 'behavioral' || goal.domain === 'social-emotional') return activity.socialSkills.length > 0;
      return true;
    });
    
    if (domainAlignment) confidence += 15;
    
    // Theme alignment bonus
    if (theme && this.activityMatchesTheme(activity, theme)) {
      confidence += 10;
    }
    
    // Activity quality bonus
    confidence += Math.floor((activity.aiConfidence || 70) * 0.15);
    
    // Complexity match bonus
    if (Math.abs(activity.cognitiveLoad - cluster.averageComplexity) <= 1) {
      confidence += 10;
    }
    
    // Accommodation support bonus
    if (activity.accommodationSupport.length > 0) {
      confidence += 5;
    }
    
    return Math.min(100, Math.floor(confidence));
  }
  
  private static generateGroupName(
    cluster: GoalCluster,
    standard: StateStandard,
    activity: AIEnhancedActivity,
    theme?: MonthlyTheme
  ): string {
    const domain = cluster.commonDomain;
    const subject = standard.subject;
    const themePrefix = theme ? `${theme.title} ` : '';
    
    // Generate contextual group names
    const nameTemplates = [
      `${themePrefix}${subject} ${domain.charAt(0).toUpperCase() + domain.slice(1)} Group`,
      `${themePrefix}${standard.title} Squad`,
      `${themePrefix}${activity.name} Team`,
      `${subject} ${domain.charAt(0).toUpperCase() + domain.slice(1)} Stars`
    ];
    
    return nameTemplates[0]; // Use the first template for consistency
  }
  
  private static generateAdaptations(goals: IEPGoal[], activity: AIEnhancedActivity): string[] {
    const adaptations: string[] = [];
    
    // Goal-specific adaptations
    goals.forEach(goal => {
      switch (goal.domain) {
        case 'behavioral':
          adaptations.push('Provide clear behavior expectations and visual reminders');
          adaptations.push('Use positive reinforcement and frequent feedback');
          break;
        case 'social-emotional':
          adaptations.push('Model appropriate social interactions');
          adaptations.push('Provide social scripts and conversation starters');
          break;
        case 'communication':
          adaptations.push('Allow multiple communication modalities');
          adaptations.push('Provide extra wait time for responses');
          break;
        case 'physical':
          adaptations.push('Adapt materials for fine motor accessibility');
          adaptations.push('Provide alternative positioning options');
          break;
      }
      
      if (goal.measurementType === 'independence') {
        adaptations.push('Implement systematic prompting with planned fading');
      }
      
      if (goal.priority === 'high') {
        adaptations.push('Provide intensive focus on high-priority objectives');
      }
    });
    
    // Activity-specific adaptations
    if (activity.accommodationSupport.includes('visual-supports')) {
      adaptations.push('Use visual supports and graphic organizers');
    }
    
    if (activity.accommodationSupport.includes('tactile-supports')) {
      adaptations.push('Provide hands-on manipulatives and concrete materials');
    }
    
    if (activity.cognitiveLoad >= 4) {
      adaptations.push('Break complex tasks into smaller, manageable steps');
    }
    
    // Remove duplicates and return
    return [...new Set(adaptations)];
  }
  
  private static generateSetupInstructions(activity: AIEnhancedActivity, studentCount: number): string {
    const baseSetup = `Arrange seating for ${studentCount} students in a semi-circle for optimal teacher interaction and peer collaboration.`;
    
    const materialSetup = activity.materials?.length 
      ? ` Organize materials: ${activity.materials.join(', ')}. Ensure each student has easy access to needed supplies.`
      : ' Prepare basic classroom materials and any activity-specific supplies.';
    
    const environmentSetup = activity.noise === 'quiet' 
      ? ' Create a calm, focused environment with minimal distractions.'
      : activity.movement === 'movement'
      ? ' Ensure adequate space for movement and active participation.'
      : ' Set up a comfortable learning space conducive to group work.';
    
    const dataSetup = ' Position data collection materials within easy reach for seamless progress monitoring.';
    
    return baseSetup + materialSetup + environmentSetup + dataSetup;
  }
  
  private static generateImplementationGuide(
    activity: AIEnhancedActivity,
    goals: IEPGoal[],
    standard: StateStandard
  ): string {
    const steps = [
      `1. **Introduction (2-3 min):** Welcome students and connect today's activity to ${standard.title}`,
      `2. **Objective Review:** Explicitly state how ${activity.name} will help achieve individual IEP goals`,
      `3. **Modeling:** Demonstrate expected behaviors and skills using clear, step-by-step examples`,
      `4. **Guided Practice:** Support students as they engage with ${activity.name}, providing scaffolding as needed`,
      `5. **Independent Practice:** Allow students to apply skills with decreasing support`,
      `6. **Progress Monitoring:** Collect data on IEP goal performance throughout the activity`,
      `7. **Wrap-up:** Review learning objectives and celebrate individual progress toward goals`
    ];
    
    return steps.join('\n');
  }
  
  private static identifyThematicElements(activity: AIEnhancedActivity, theme: MonthlyTheme): string[] {
    const elements: string[] = [];
    const activityText = `${activity.name} ${activity.description || ''}`.toLowerCase();
    
    theme.keywords.forEach(keyword => {
      if (activityText.includes(keyword.toLowerCase())) {
        elements.push(keyword);
      }
    });
    
    // Add thematic materials if activity supports them
    if (activity.engagementFactors.includes('nature') && theme.keywords.includes('plants')) {
      elements.push('nature connection');
    }
    
    if (activity.engagementFactors.includes('art') && theme.title.toLowerCase().includes('spring')) {
      elements.push('seasonal art');
    }
    
    return [...new Set(elements)];
  }
  
  private static generateBenefits(
    cluster: GoalCluster,
    standard: StateStandard,
    activity: AIEnhancedActivity,
    theme?: MonthlyTheme
  ): string[] {
    const benefits = [
      `Addresses required ${standard.subject} standard: ${standard.code}`,
      `Targets ${cluster.goals.length} IEP goals across ${cluster.studentIds.length} students`,
      'Enables efficient small group instruction with individualized support',
      'Provides multiple data collection opportunities within a single activity',
      'Promotes peer learning and social skill development'
    ];
    
    if (theme) {
      benefits.push(`Integrates seamlessly with ${theme.title} theme for cohesive curriculum`);
    }
    
    if (activity.accommodationSupport.length > 0) {
      benefits.push('Includes built-in accommodations for diverse learning needs');
    }
    
    if (activity.engagementFactors.length > 0) {
      benefits.push(`Incorporates engaging elements: ${activity.engagementFactors.join(', ')}`);
    }
    
    return benefits;
  }
  
  private static generateRationale(
    cluster: GoalCluster,
    standard: StateStandard,
    activity: AIEnhancedActivity,
    theme?: MonthlyTheme
  ): string {
    const themeText = theme ? ` The ${theme.title} theme provides meaningful context that enhances engagement and retention.` : '';
    
    return `This small group recommendation optimizes instructional efficiency by combining state standard ${standard.code} with ${cluster.goals.length} aligned IEP goals. The ${activity.name} activity provides natural opportunities for skill practice and data collection while maintaining appropriate cognitive load for all participants.${themeText} This approach ensures both compliance requirements and individualized learning objectives are met simultaneously.`;
  }
  
  private static suggestFrequency(goals: IEPGoal[]): 'daily' | 'weekly' | 'bi-weekly' {
    const highPriorityGoals = goals.filter(g => g.priority === 'high').length;
    const totalGoals = goals.length;
    
    if (highPriorityGoals / totalGoals >= 0.5) return 'daily';
    if (totalGoals >= 3) return 'daily';
    return 'weekly';
  }
  
  private static suggestDataCollectionMethod(goals: IEPGoal[]): string {
    const measurementTypes = goals.map(g => g.measurementType);
    
    if (measurementTypes.includes('percentage') || measurementTypes.includes('frequency')) {
      return 'Frequency/accuracy tracking with quick tallies';
    }
    
    if (measurementTypes.includes('rating')) {
      return 'Rating scale observation (1-5 scale)';
    }
    
    if (measurementTypes.includes('yes-no')) {
      return 'Binary checklist (yes/no for each criterion)';
    }
    
    if (measurementTypes.includes('independence')) {
      return 'Independence level tracking (independent/minimal/moderate/maximum support)';
    }
    
    return 'Observational notes with specific criteria documentation';
  }
  
  // ===== RECOMMENDATION IMPLEMENTATION =====
  
  static implementRecommendation(recommendation: SmartGroupRecommendation): boolean {
    try {
      console.log('🚀 Implementing Smart Group:', recommendation.groupName);
      
      // 1. Create the activity in UnifiedDataService
      const groupActivity = {
        id: `smart_group_${recommendation.id}`,
        name: recommendation.groupName,
        category: 'academic' as any,
        description: recommendation.rationale,
        duration: recommendation.recommendedActivity.duration,
        materials: recommendation.recommendedActivity.materials,
        instructions: recommendation.recommendedActivity.implementation,
        isCustom: true,
        dateCreated: new Date().toISOString(),
        // Add smart group metadata
        smartGroupMetadata: {
          recommendationId: recommendation.id,
          confidence: recommendation.confidence,
          studentIds: recommendation.studentIds,
          goalIds: recommendation.iepGoalsAddressed.map(g => g.goalId),
          standardIds: recommendation.standardsAddressed.map(s => s.standardId),
          themeId: recommendation.themeConnection?.themeId
        }
      };

      UnifiedDataService.addActivity(groupActivity);
      
      // 2. Set up data collection reminders for each goal
      recommendation.iepGoalsAddressed.forEach(goalInfo => {
        this.scheduleDataCollectionReminder(goalInfo.goalId, goalInfo.studentId, groupActivity.id);
      });
      
      // 3. Save implementation record
      this.saveImplementationRecord(recommendation);
      
      console.log('✅ Smart Group implemented successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Error implementing recommendation:', error);
      return false;
    }
  }
  
  private static scheduleDataCollectionReminder(goalId: string, studentId: string, activityId: string): void {
    // This would integrate with your existing data collection system
    // For now, we'll just log the scheduling
    console.log('📊 Scheduled data collection for:', {
      goalId,
      studentId,
      activityId,
      scheduledFor: 'next activity session'
    });
    
    // In a full implementation, this might:
    // - Add reminders to teacher's calendar
    // - Create data collection templates
    // - Set up automatic prompts in the data entry system
  }
  
  private static saveImplementationRecord(recommendation: SmartGroupRecommendation): void {
    const implementations = this.getImplementationHistory();
    
    const record = {
      ...recommendation,
      teacherApproved: true,
      implementationDate: new Date().toISOString(),
      status: 'active' as const
    };
    
    implementations.push(record);
    localStorage.setItem(`${this.STORAGE_KEY}_implementations`, JSON.stringify(implementations));
  }
  
  static getImplementationHistory(): SmartGroupRecommendation[] {
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_implementations`);
    return stored ? JSON.parse(stored) : [];
  }
  
  // ===== UTILITY METHODS =====
  
  static clearAllData(): void {
    // Clear all Smart Groups related data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.STORAGE_KEY) || 
          key.startsWith(this.STANDARDS_KEY) || 
          key.startsWith(this.THEMES_KEY)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🧹 Smart Groups data cleared');
  }
  
  static exportRecommendations(recommendations: SmartGroupRecommendation[]): string {
    // Export recommendations as JSON for backup or sharing
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      recommendations
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  static validateRecommendation(recommendation: SmartGroupRecommendation): boolean {
    // Validate that recommendation has all required fields
    const required = ['id', 'groupName', 'confidence', 'studentIds', 'standardsAddressed', 'iepGoalsAddressed'];
    
    for (const field of required) {
      if (!recommendation[field as keyof SmartGroupRecommendation]) {
        console.error(`❌ Invalid recommendation: missing ${field}`);
        return false;
      }
    }
    
    // Validate student IDs exist in UnifiedDataService
    const validStudents = recommendation.studentIds.every(id => 
      UnifiedDataService.getStudent(id) !== null
    );
    
    if (!validStudents) {
      console.error('❌ Invalid recommendation: one or more student IDs not found');
      return false;
    }
    
    return true;
  }
}

// ===== EXPORT FOR INTEGRATION =====

export default SmartGroupsAIService;// smartGroupsService.ts - Integration with UnifiedDataService
// Connects Smart Groups AI with existing Bloom app infrastructure

import UnifiedDataService, { UnifiedStudent, IEPGoal, UnifiedActivity } from './unifiedDataService';

// ===== CORE INTERFACES =====

export interface StateStandard {
  id: string;
  code: string; // e.g., "CCSS.ELA-LITERACY.RL.3.2"
  state: string; // e.g., "SC", "NC", "GA"
  grade: string; // e.g., "K", "1", "2", "3"
  subject: 'ELA' | 'Math' | 'Science' | 'Social Studies' | 'Art' | 'PE';
  domain: string; // e.g., "Reading Literature"
  title: string;
  description: string;
  subSkills: string[]; // Key skills for AI matching
  complexity: 1 | 2 | 3 | 4 | 5;
  prerequisites?: string[];
  assessmentMethods: string[];
  typicalActivities: string[];
  accommodationSupport: string[];
}

export interface MonthlyTheme {
  id: string;
  month: number; // 1-12
  year: number;
  title: string; // "Spring & New Growth"
  description: string;
  keywords: string[]; // ["spring", "growth", "weather", "plants"]
  subThemes: WeeklySubTheme[];
  stateStandardsPriority: string[]; // Standards that must be covered this month
  learningObjectives: string[];
  assessmentOpportunities: string[];
  materialSuggestions: string[];
  fieldTripConnections?: string[];
  familyEngagementIdeas?: string[];
}

export interface WeeklySubTheme {
  week: number; // 1-4
  title: string; // "Signs of Spring"
  focus: string; // "Observation & Discovery"
  keywords: string[];
  suggestedActivities: string[];
}

export interface SmartGroupRecommendation {
  id: string;
  groupName: string;
  confidence: number; // 0-100 AI confidence score
  
  // Student Information
  studentIds: string[];
  studentCount: number;
  
  // Standards & Goals Alignment
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
  
  // Activity Recommendation
  recommendedActivity: {
    activityId: string;
    activity: UnifiedActivity;
    adaptations: string[];
    duration: number;
    materials: string[];
    setup: string;
    implementation: string;
  };
  
  // Theme Integration
  themeConnection?: {
    themeId: string;
    relevance: string;
    thematicElements: string[];
  };
  
  // Benefits & Rationale
  benefits: string[];
  rationale: string;
  
  // Implementation Details
  suggestedScheduling: {
    frequency: 'daily' | 'weekly' | 'bi-weekly';
    duration: number;
    preferredTimes: string[];
    prerequisites?: string[];
  };
  
  // Data Collection Integration
  dataCollectionPlan: {
    goalIds: string[];
    measurementMoments: string[];
    collectionMethod: string
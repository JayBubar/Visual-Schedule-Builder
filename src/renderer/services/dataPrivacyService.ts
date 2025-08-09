// dataPrivacyService.ts - Student Data Privacy & Masking for AI Analysis
// Ensures HIPAA compliance and protects student PII during AI processing

import { UnifiedStudent, IEPGoal, UnifiedActivity } from './unifiedDataService';

// ===== PRIVACY CONFIGURATION =====

export interface PrivacyConfig {
  enableDataMasking: boolean;              // Master switch for all privacy features
  aiDataSharingLevel: 'minimal' | 'educational' | 'full';  // Level of data shared with AI
  anonymizeStudentData: boolean;           // Remove all personal identifiers
  logAIInteractions: boolean;             // Whether to log AI requests (should be false in production)
  retainMaskedData: boolean;              // Whether to keep masked data for analysis
  encryptSensitiveFields: boolean;        // Encrypt PII fields
  allowBirthdateSharing: boolean;         // Whether birthdate can be used (age only)
  allowPhotoSharing: boolean;             // Whether photos can be processed
  auditTrailEnabled: boolean;             // Track all data access
}

// Default privacy-first configuration
const DEFAULT_PRIVACY_CONFIG: PrivacyConfig = {
  enableDataMasking: true,                // Always on by default
  aiDataSharingLevel: 'educational',      // Conservative default
  anonymizeStudentData: true,             // Always anonymize by default
  logAIInteractions: false,               // Never log by default (security)
  retainMaskedData: false,                // Don't retain by default
  encryptSensitiveFields: true,           // Always encrypt sensitive data
  allowBirthdateSharing: false,           // Never share birthdates
  allowPhotoSharing: false,               // Never share photos
  auditTrailEnabled: true                 // Always audit by default
};

// ===== MASKED DATA INTERFACES =====

export interface MaskedStudent {
  id: string;                             // Keep ID for internal reference
  anonymousId: string;                    // AI-safe anonymous identifier
  grade: string;                          // Educational data - safe to share
  workingStyle?: string;                  // Educational data - safe to share
  
  // REMOVED: name, photo, birthday, parent info, medical info
  // REPLACED WITH: Anonymous educational metadata
  
  learningProfile: {
    accommodationsCount: number;          // Number of accommodations (not details)
    iepGoalsCount: number;               // Number of goals (useful for grouping)
    complexityLevel: 'low' | 'medium' | 'high';  // Derived complexity level
    supportLevel: 'independent' | 'guided' | 'intensive';  // Support needed
    preferredGroupSize: 'individual' | 'small' | 'large';  // Group preference
  };
  
  // IEP data with PII removed
  educationalData: {
    goals: MaskedIEPGoal[];              // Goals with PII stripped
    accommodationTypes: string[];        // Types only, no personal details
    serviceTypes: string[];              // Related services types only
  };
  
  // Metadata for AI analysis
  aiMetadata: {
    studentType: string;                 // e.g., "Student_A", "Student_B"
    dataLevel: 'minimal' | 'educational' | 'full';  // What level of data included
    maskedAt: string;                    // When data was masked
    originalDataHash?: string;           // Hash of original data for verification
  };
}

export interface MaskedIEPGoal {
  id: string;                            // Keep goal ID for tracking
  anonymousId: string;                   // AI-safe anonymous identifier
  domain: 'academic' | 'behavioral' | 'social-emotional' | 'physical' | 'communication' | 'adaptive';
  
  // EDUCATIONAL DATA - Safe for AI analysis
  measurementType: 'percentage' | 'frequency' | 'duration' | 'rating' | 'yes-no' | 'independence';
  target: number;                        // Target percentage/frequency
  priority: 'high' | 'medium' | 'low';
  
  // MASKED DESCRIPTIONS - Remove any personal references
  generalObjective: string;              // "Student will improve reading comprehension"
  skillArea: string;                     // "Reading comprehension", "Math calculation"
  complexityLevel: 1 | 2 | 3 | 4 | 5;   // Derived complexity
  
  // REMOVED: Specific student names, personal details, family references
  // REMOVED: Specific behaviors that could identify student
  // REMOVED: Any references to specific incidents or personal history
  
  // Metadata for tracking
  aiMetadata: {
    originalGoalHash: string;            // Hash of original goal for reference
    maskedAt: string;                    // When goal was masked
    studentAnonymousId: string;          // Links to masked student
  };
}

// ===== DATA PRIVACY SERVICE =====

export class DataPrivacyService {
  private static config: PrivacyConfig = DEFAULT_PRIVACY_CONFIG;
  private static auditLog: PrivacyAuditEntry[] = [];
  
  // ===== CONFIGURATION MANAGEMENT =====
  
  static setPrivacyConfig(config: Partial<PrivacyConfig>): void {
    this.config = { ...this.config, ...config };
    this.auditAction('CONFIG_UPDATED', 'Privacy configuration updated');
    console.log('🔒 Privacy configuration updated:', config);
  }
  
  static getPrivacyConfig(): PrivacyConfig {
    return { ...this.config };
  }
  
  static resetToDefaults(): void {
    this.config = { ...DEFAULT_PRIVACY_CONFIG };
    this.auditAction('CONFIG_RESET', 'Privacy configuration reset to defaults');
  }
  
  // ===== MAIN MASKING METHODS =====
  
  static maskStudentsForAI(students: UnifiedStudent[]): MaskedStudent[] {
    if (!this.config.enableDataMasking) {
      console.warn('⚠️ Data masking is disabled - using full student data');
      return students as any; // Bypass masking (NOT RECOMMENDED)
    }
    
    this.auditAction('MASK_STUDENTS', `Masking ${students.length} students for AI analysis`);
    
    return students.map((student, index) => this.maskSingleStudent(student, index));
  }
  
  static maskIEPGoalsForAI(goals: IEPGoal[]): MaskedIEPGoal[] {
    if (!this.config.enableDataMasking) {
      console.warn('⚠️ Data masking is disabled - using full goal data');
      return goals as any; // Bypass masking (NOT RECOMMENDED)
    }
    
    this.auditAction('MASK_GOALS', `Masking ${goals.length} IEP goals for AI analysis`);
    
    return goals.map(goal => this.maskSingleGoal(goal));
  }
  
  // ===== INDIVIDUAL MASKING METHODS =====
  
  private static maskSingleStudent(student: UnifiedStudent, index: number): MaskedStudent {
    const anonymousId = this.generateAnonymousId('STUDENT', index);
    
    // Calculate derived metrics from original data
    const accommodationsCount = student.resourceInformation?.accommodations?.length || 0;
    const iepGoalsCount = student.iepData?.goals?.length || 0;
    
    const maskedStudent: MaskedStudent = {
      id: student.id,  // Keep for internal reference only
      anonymousId,
      grade: student.grade || 'Unknown',
      workingStyle: student.workingStyle,
      
      learningProfile: {
        accommodationsCount,
        iepGoalsCount,
        complexityLevel: this.deriveComplexityLevel(student),
        supportLevel: this.deriveSupportLevel(student),
        preferredGroupSize: this.deriveGroupPreference(student)
      },
      
      educationalData: {
        goals: student.iepData?.goals ? this.maskIEPGoalsForAI(student.iepData.goals) : [],
        accommodationTypes: this.extractAccommodationTypes(student),
        serviceTypes: this.extractServiceTypes(student)
      },
      
      aiMetadata: {
        studentType: anonymousId,
        dataLevel: this.config.aiDataSharingLevel,
        maskedAt: new Date().toISOString(),
        originalDataHash: this.config.retainMaskedData ? this.hashData(student) : undefined
      }
    };
    
    // Additional privacy checks
    this.validateMaskedStudent(maskedStudent);
    
    return maskedStudent;
  }
  
  private static maskSingleGoal(goal: IEPGoal): MaskedIEPGoal {
    const anonymousId = this.generateAnonymousId('GOAL', goal.id);
    
    const maskedGoal: MaskedIEPGoal = {
      id: goal.id,  // Keep for internal reference
      anonymousId,
      domain: goal.domain,
      measurementType: goal.measurementType,
      target: goal.target,
      priority: goal.priority,
      
      // Mask descriptions to remove personal information
      generalObjective: this.maskGoalDescription(goal.description || goal.shortTermObjective),
      skillArea: this.extractSkillArea(goal),
      complexityLevel: this.deriveGoalComplexity(goal),
      
      aiMetadata: {
        originalGoalHash: this.hashData(goal),
        maskedAt: new Date().toISOString(),
        studentAnonymousId: this.generateAnonymousId('STUDENT', goal.studentId)
      }
    };
    
    // Validate masked goal doesn't contain PII
    this.validateMaskedGoal(maskedGoal);
    
    return maskedGoal;
  }
  
  // ===== UTILITY METHODS =====
  
  private static generateAnonymousId(type: 'STUDENT' | 'GOAL', identifier: string | number): string {
    // Generate consistent but anonymous identifiers
    const hash = this.simpleHash(identifier.toString());
    return `${type}_${hash.substr(0, 8).toUpperCase()}`;
  }
  
  private static deriveComplexityLevel(student: UnifiedStudent): 'low' | 'medium' | 'high' {
    const goalCount = student.iepData?.goals?.length || 0;
    const accommodationCount = student.resourceInformation?.accommodations?.length || 0;
    
    if (goalCount >= 5 || accommodationCount >= 3) return 'high';
    if (goalCount >= 3 || accommodationCount >= 2) return 'medium';
    return 'low';
  }
  
  private static deriveSupportLevel(student: UnifiedStudent): 'independent' | 'guided' | 'intensive' {
    const workingStyle = student.workingStyle?.toLowerCase() || '';
    
    if (workingStyle.includes('independent')) return 'independent';
    if (workingStyle.includes('support') || workingStyle.includes('guided')) return 'intensive';
    return 'guided';
  }
  
  private static deriveGroupPreference(student: UnifiedStudent): 'individual' | 'small' | 'large' {
    const workingStyle = student.workingStyle?.toLowerCase() || '';
    
    if (workingStyle.includes('individual')) return 'individual';
    if (workingStyle.includes('collaborative') || workingStyle.includes('group')) return 'large';
    return 'small';
  }
  
  private static extractAccommodationTypes(student: UnifiedStudent): string[] {
    const accommodations = student.resourceInformation?.accommodations || [];
    
    // Extract general types, not specific personal accommodations
    return accommodations.map(acc => {
      const accLower = acc.toLowerCase();
      if (accLower.includes('visual')) return 'visual-support';
      if (accLower.includes('audio') || accLower.includes('hearing')) return 'audio-support';
      if (accLower.includes('time') || accLower.includes('extended')) return 'time-extension';
      if (accLower.includes('movement') || accLower.includes('break')) return 'movement-break';
      if (accLower.includes('reduced') || accLower.includes('modified')) return 'content-modification';
      return 'general-accommodation';
    });
  }
  
  private static extractServiceTypes(student: UnifiedStudent): string[] {
    const services = student.resourceInformation?.relatedServices || [];
    
    // Extract service types only, no personal details
    return services.map(service => {
      const serviceLower = service.toLowerCase();
      if (serviceLower.includes('speech')) return 'speech-therapy';
      if (serviceLower.includes('occupational') || serviceLower.includes('ot')) return 'occupational-therapy';
      if (serviceLower.includes('physical') || serviceLower.includes('pt')) return 'physical-therapy';
      if (serviceLower.includes('counseling') || serviceLower.includes('social')) return 'counseling';
      return 'support-service';
    });
  }
  
  private static maskGoalDescription(description: string): string {
    if (!description) return 'Educational objective';
    
    // Remove personal references and specific names
    let masked = description
      .replace(/\b[A-Z][a-z]+\b/g, 'Student')  // Replace proper names with "Student"
      .replace(/\bhe\b|\bshe\b|\bhis\b|\bher\b|\bhim\b/gi, 'Student')  // Replace pronouns
      .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '[Date]')  // Replace dates
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[ID]')  // Replace SSN-like patterns
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[Email]')  // Replace emails
      .replace(/\(\d{3}\)\s*\d{3}-\d{4}/g, '[Phone]');  // Replace phone numbers
    
    // Ensure it starts with generic language
    if (!masked.toLowerCase().startsWith('student will')) {
      masked = `Student will ${masked.toLowerCase()}`;
    }
    
    return masked;
  }
  
  private static extractSkillArea(goal: IEPGoal): string {
    const text = `${goal.title || ''} ${goal.description || ''} ${goal.shortTermObjective || ''}`.toLowerCase();
    
    // Extract general skill areas without personal details
    if (text.includes('read') || text.includes('comprehension')) return 'Reading Skills';
    if (text.includes('math') || text.includes('calculation')) return 'Math Skills';
    if (text.includes('write') || text.includes('composition')) return 'Writing Skills';
    if (text.includes('social') || text.includes('interaction')) return 'Social Skills';
    if (text.includes('behavior') || text.includes('conduct')) return 'Behavioral Skills';
    if (text.includes('communication') || text.includes('speech')) return 'Communication Skills';
    if (text.includes('motor') || text.includes('physical')) return 'Motor Skills';
    
    return `${goal.domain.charAt(0).toUpperCase() + goal.domain.slice(1)} Skills`;
  }
  
  private static deriveGoalComplexity(goal: IEPGoal): 1 | 2 | 3 | 4 | 5 {
    let complexity = 3; // Default medium
    
    const text = `${goal.description || ''} ${goal.shortTermObjective || ''}`.toLowerCase();
    
    // Increase complexity indicators
    if (text.includes('multi-step') || text.includes('complex')) complexity += 2;
    if (text.includes('independent')) complexity += 1;
    if (goal.target >= 90) complexity += 1;
    
    // Decrease complexity indicators
    if (text.includes('simple') || text.includes('basic')) complexity -= 1;
    if (text.includes('with support') || text.includes('guided')) complexity -= 1;
    if (goal.target <= 50) complexity -= 1;
    
    return Math.max(1, Math.min(5, complexity)) as 1 | 2 | 3 | 4 | 5;
  }
  
  // ===== VALIDATION METHODS =====
  
  private static validateMaskedStudent(student: MaskedStudent): void {
    const issues: string[] = [];
    
    // Check for potential PII leakage
    const studentStr = JSON.stringify(student);
    
    // Common PII patterns to check for
    const piiPatterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/,  // Full names
      /\b\d{3}-\d{2}-\d{4}\b/,        // SSN pattern
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/, // Date pattern
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\(\d{3}\)\s*\d{3}-\d{4}/       // Phone number
    ];
    
    piiPatterns.forEach((pattern, index) => {
      if (pattern.test(studentStr)) {
        issues.push(`Potential PII detected (pattern ${index + 1})`);
      }
    });
    
    if (issues.length > 0) {
      console.error('🚨 PRIVACY VIOLATION DETECTED:', issues);
      this.auditAction('PRIVACY_VIOLATION', `Issues: ${issues.join(', ')}`);
      throw new Error(`Privacy validation failed: ${issues.join(', ')}`);
    }
  }
  
  private static validateMaskedGoal(goal: MaskedIEPGoal): void {
    const issues: string[] = [];
    
    // Check goal description for personal information
    const description = goal.generalObjective.toLowerCase();
    
    // Flag suspicious personal references
    if (description.includes('mom') || description.includes('dad') || description.includes('family')) {
      issues.push('Contains family references');
    }
    
    if (/\b[a-z]+\s+will\s+/.test(description) && !description.startsWith('student will')) {
      issues.push('May contain personal name');
    }
    
    if (issues.length > 0) {
      console.warn('⚠️ Goal masking issues:', issues);
      this.auditAction('GOAL_MASKING_WARNING', `Goal ${goal.id}: ${issues.join(', ')}`);
    }
  }
  
  // ===== AUDIT & LOGGING =====
  
  private static auditAction(action: string, details: string): void {
    if (!this.config.auditTrailEnabled) return;
    
    const entry: PrivacyAuditEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      config: { ...this.config }
    };
    
    this.auditLog.push(entry);
    
    // Keep only last 1000 entries to prevent memory issues
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
    
    // In production, this should be sent to a secure audit service
    if (this.config.logAIInteractions) {
      console.log('🔍 Privacy Audit:', entry);
    }
  }
  
  static getAuditLog(): PrivacyAuditEntry[] {
    return [...this.auditLog];
  }
  
  static clearAuditLog(): void {
    this.auditLog = [];
    this.auditAction('AUDIT_LOG_CLEARED', 'Audit log manually cleared');
  }
  
  // ===== UTILITY FUNCTIONS =====
  
  private static hashData(data: any): string {
    // Simple hash function for data verification
    // In production, use a proper cryptographic hash
    return this.simpleHash(JSON.stringify(data));
  }
  
  private static simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
  
  // ===== PUBLIC CONVENIENCE METHODS =====
  
  static enableStrictPrivacy(): void {
    this.setPrivacyConfig({
      enableDataMasking: true,
      aiDataSharingLevel: 'minimal',
      anonymizeStudentData: true,
      logAIInteractions: false,
      retainMaskedData: false,
      allowBirthdateSharing: false,
      allowPhotoSharing: false
    });
    console.log('🔒 Strict privacy mode enabled');
  }
  
  static enableEducationalSharing(): void {
    this.setPrivacyConfig({
      enableDataMasking: true,
      aiDataSharingLevel: 'educational',
      anonymizeStudentData: true,
      logAIInteractions: false,
      retainMaskedData: false,
      allowBirthdateSharing: false,
      allowPhotoSharing: false
    });
    console.log('🎓 Educational sharing mode enabled');
  }
  
  static getPrivacyReport(): PrivacyReport {
    return {
      currentConfig: this.getPrivacyConfig(),
      auditEntryCount: this.auditLog.length,
      lastMaskingAction: this.auditLog.filter(entry => 
        entry.action.includes('MASK')
      ).pop()?.timestamp || 'Never',
      privacyViolations: this.auditLog.filter(entry => 
        entry.action.includes('VIOLATION')
      ).length,
      recommendations: this.generatePrivacyRecommendations()
    };
  }
  
  private static generatePrivacyRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (!this.config.enableDataMasking) {
      recommendations.push('⚠️ Enable data masking for AI interactions');
    }
    
    if (this.config.logAIInteractions) {
      recommendations.push('⚠️ Disable AI interaction logging for production');
    }
    
    if (this.config.aiDataSharingLevel === 'full') {
      recommendations.push('⚠️ Consider reducing AI data sharing level');
    }
    
    if (!this.config.auditTrailEnabled) {
      recommendations.push('📝 Enable audit trail for compliance tracking');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Privacy configuration looks good!');
    }
    
    return recommendations;
  }
}

// ===== SUPPORTING INTERFACES =====

interface PrivacyAuditEntry {
  timestamp: string;
  action: string;
  details: string;
  config: PrivacyConfig;
}

interface PrivacyReport {
  currentConfig: PrivacyConfig;
  auditEntryCount: number;
  lastMaskingAction: string;
  privacyViolations: number;
  recommendations: string[];
}

// ===== SMART GROUPS INTEGRATION =====

export class SmartGroupsPrivacyIntegration {
  
  // Main method to prepare data for AI analysis with full privacy protection
  static prepareDataForAI(
    students: UnifiedStudent[], 
    activities: UnifiedActivity[],
    config?: Partial<PrivacyConfig>
  ): AIReadyData {
    
    // Update privacy config if provided
    if (config) {
      DataPrivacyService.setPrivacyConfig(config);
    }
    
    console.log('🔒 Preparing data for AI analysis with privacy protection...');
    
    // Mask student data
    const maskedStudents = DataPrivacyService.maskStudentsForAI(students);
    
    // Activities can be shared as-is (no PII typically)
    const cleanActivities = this.sanitizeActivities(activities);
    
    // Create analysis summary without PII
    const analysisSummary = this.createAnalysisSummary(maskedStudents, cleanActivities);
    
    const aiData: AIReadyData = {
      students: maskedStudents,
      activities: cleanActivities,
      summary: analysisSummary,
      privacyMetadata: {
        maskingApplied: true,
        dataLevel: DataPrivacyService.getPrivacyConfig().aiDataSharingLevel,
        studentCount: maskedStudents.length,
        goalCount: maskedStudents.reduce((total, s) => total + s.educationalData.goals.length, 0),
        preparedAt: new Date().toISOString()
      }
    };
    
    // Final validation
    this.validateAIReadyData(aiData);
    
    console.log('✅ Data prepared for AI analysis:', {
      students: aiData.students.length,
      goals: aiData.privacyMetadata.goalCount,
      activities: aiData.activities.length,
      privacyLevel: aiData.privacyMetadata.dataLevel
    });
    
    return aiData;
  }
  
  private static sanitizeActivities(activities: UnifiedActivity[]): UnifiedActivity[] {
    // Activities typically don't contain PII, but let's be safe
    return activities.map(activity => ({
      ...activity,
      // Remove any potential PII from activity descriptions
      description: activity.description ? this.sanitizeText(activity.description) : undefined,
      instructions: activity.instructions ? this.sanitizeText(activity.instructions) : undefined,
      materials: activity.materials?.map(material => this.sanitizeText(material))
    }));
  }
  
  private static sanitizeText(text: string): string {
    // Remove potential teacher/student names and personal references
    return text
      .replace(/\b(Mrs?|Ms|Dr|Mr)\.\s*[A-Z][a-z]+\b/g, 'Teacher')
      .replace(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, 'Student')
      .replace(/\bI\b|\bmy\b|\bme\b/gi, 'Teacher')
      .trim();
  }
  
  private static createAnalysisSummary(students: MaskedStudent[], activities: UnifiedActivity[]): AnalysisSummary {
    const totalGoals = students.reduce((total, s) => total + s.educationalData.goals.length, 0);
    const goalsByDomain = students.flatMap(s => s.educationalData.goals).reduce((acc, goal) => {
      acc[goal.domain] = (acc[goal.domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const complexityDistribution = students.reduce((acc, student) => {
      acc[student.learningProfile.complexityLevel] = (acc[student.learningProfile.complexityLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalStudents: students.length,
      totalGoals,
      totalActivities: activities.length,
      goalsByDomain,
      complexityDistribution,
      averageGoalsPerStudent: Math.round((totalGoals / students.length) * 10) / 10,
      supportLevelDistribution: students.reduce((acc, student) => {
        acc[student.learningProfile.supportLevel] = (acc[student.learningProfile.supportLevel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
  
  private static validateAIReadyData(data: AIReadyData): void {
    const issues: string[] = [];
    
    // Check for any remaining PII in the data structure
    const dataString = JSON.stringify(data);
    
    // Common PII patterns
    const piiPatterns = [
      { pattern: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, name: 'Full names' },
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/, name: 'SSN patterns' },
      { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, name: 'Email addresses' },
      { pattern: /\(\d{3}\)\s*\d{3}-\d{4}/, name: 'Phone numbers' },
      { pattern: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/, name: 'Dates' }
    ];
    
    piiPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(dataString)) {
        issues.push(`Potential ${name} detected in AI data`);
      }
    });
    
    // Check for student anonymization
    data.students.forEach((student, index) => {
      if (!student.anonymousId.startsWith('STUDENT_')) {
        issues.push(`Student ${index} not properly anonymized`);
      }
    });
    
    if (issues.length > 0) {
      console.error('🚨 AI DATA VALIDATION FAILED:', issues);
      throw new Error(`AI data validation failed: ${issues.join(', ')}`);
    }
    
    console.log('✅ AI data validation passed - no PII detected');
  }
  
  // Method to map AI results back to real student IDs
  static mapAIResultsToRealStudents(
    aiResults: any, 
    originalStudents: UnifiedStudent[]
  ): any {
    console.log('🔄 Mapping AI results back to real student IDs...');
    
    // Create mapping from anonymous IDs to real IDs
    const maskedStudents = DataPrivacyService.maskStudentsForAI(originalStudents);
    const idMapping = new Map<string, string>();
    
    maskedStudents.forEach((masked, index) => {
      idMapping.set(masked.anonymousId, originalStudents[index].id);
    });
    
    // Recursively replace anonymous IDs with real IDs
    const mappedResults = this.replaceAnonymousIds(aiResults, idMapping);
    
    console.log('✅ AI results mapped back to real student IDs');
    return mappedResults;
  }
  
  private static replaceAnonymousIds(obj: any, idMapping: Map<string, string>): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.replaceAnonymousIds(item, idMapping));
    }
    
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.includes('studentId') || key.includes('StudentId')) {
        // Map anonymous ID back to real ID
        result[key] = idMapping.get(value as string) || value;
      } else if (key.includes('anonymousId')) {
        // Remove anonymous ID fields from final results
        continue;
      } else {
        result[key] = this.replaceAnonymousIds(value, idMapping);
      }
    }
    
    return result;
  }
}

// ===== AI-READY DATA INTERFACES =====

export interface AIReadyData {
  students: MaskedStudent[];
  activities: UnifiedActivity[];
  summary: AnalysisSummary;
  privacyMetadata: {
    maskingApplied: boolean;
    dataLevel: 'minimal' | 'educational' | 'full';
    studentCount: number;
    goalCount: number;
    preparedAt: string;
  };
}

interface AnalysisSummary {
  totalStudents: number;
  totalGoals: number;
  totalActivities: number;
  goalsByDomain: Record<string, number>;
  complexityDistribution: Record<string, number>;
  averageGoalsPerStudent: number;
  supportLevelDistribution: Record<string, number>;
}

// ===== PRIVACY SETTINGS COMPONENT INTERFACE =====

export interface PrivacySettingsProps {
  currentConfig: PrivacyConfig;
  onConfigChange: (config: Partial<PrivacyConfig>) => void;
  showAdvanced?: boolean;
}

// ===== EXAMPLE USAGE =====

/*
// Example: Using the privacy service in Smart Groups

import { DataPrivacyService, SmartGroupsPrivacyIntegration } from './dataPrivacyService';

// 1. Configure privacy settings (typically done once at app startup)
DataPrivacyService.enableEducationalSharing();

// 2. Prepare data for AI analysis
const students = UnifiedDataService.getAllStudents();
const activities = UnifiedDataService.getAllActivities();

const aiReadyData = SmartGroupsPrivacyIntegration.prepareDataForAI(students, activities);

// 3. Send to AI analysis (no PII included)
const aiRecommendations = await SmartGroupsAIService.generateRecommendations(aiReadyData);

// 4. Map results back to real student IDs
const finalRecommendations = SmartGroupsPrivacyIntegration.mapAIResultsToRealStudents(
  aiRecommendations, 
  students
);

// 5. Use recommendations in UI
setRecommendations(finalRecommendations);

// 6. Generate privacy report for administrators
const privacyReport = DataPrivacyService.getPrivacyReport();
console.log('Privacy Report:', privacyReport);
*/

// ===== PRIVACY COMPLIANCE UTILITIES =====

export class PrivacyComplianceUtils {
  
  // Generate a privacy compliance report for administrators
  static generateComplianceReport(): ComplianceReport {
    const config = DataPrivacyService.getPrivacyConfig();
    const auditLog = DataPrivacyService.getAuditLog();
    
    const report: ComplianceReport = {
      generatedAt: new Date().toISOString(),
      complianceLevel: this.assessComplianceLevel(config),
      privacySettings: config,
      dataProcessingActivity: {
        totalMaskingEvents: auditLog.filter(e => e.action.includes('MASK')).length,
        privacyViolations: auditLog.filter(e => e.action.includes('VIOLATION')).length,
        lastAIInteraction: auditLog.filter(e => e.action.includes('AI')).pop()?.timestamp || 'Never'
      },
      recommendations: this.generateComplianceRecommendations(config),
      hipaaCompliance: this.assessHIPAACompliance(config),
      ferpaCompliance: this.assessFERPACompliance(config)
    };
    
    return report;
  }
  
  private static assessComplianceLevel(config: PrivacyConfig): 'high' | 'medium' | 'low' {
    let score = 0;
    
    if (config.enableDataMasking) score += 2;
    if (config.anonymizeStudentData) score += 2;
    if (!config.logAIInteractions) score += 1;
    if (!config.allowBirthdateSharing) score += 1;
    if (!config.allowPhotoSharing) score += 1;
    if (config.auditTrailEnabled) score += 1;
    if (config.aiDataSharingLevel === 'minimal') score += 2;
    else if (config.aiDataSharingLevel === 'educational') score += 1;
    
    if (score >= 8) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }
  
  private static generateComplianceRecommendations(config: PrivacyConfig): string[] {
    const recommendations: string[] = [];
    
    if (!config.enableDataMasking) {
      recommendations.push('🚨 CRITICAL: Enable data masking immediately');
    }
    if (!config.anonymizeStudentData) {
      recommendations.push('🚨 CRITICAL: Enable student data anonymization');
    }
    if (config.logAIInteractions) {
      recommendations.push('⚠️ HIGH: Disable AI interaction logging');
    }
    if (config.allowBirthdateSharing) {
      recommendations.push('⚠️ MEDIUM: Disable birthdate sharing');
    }
    if (config.allowPhotoSharing) {
      recommendations.push('⚠️ MEDIUM: Disable photo sharing');
    }
    if (!config.auditTrailEnabled) {
      recommendations.push('📝 LOW: Enable audit trail for compliance tracking');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ All privacy settings are compliant');
    }
    
    return recommendations;
  }
  
  private static assessHIPAACompliance(config: PrivacyConfig): boolean {
    // HIPAA compliance checklist for educational health information
    return config.enableDataMasking && 
           config.anonymizeStudentData && 
           !config.allowBirthdateSharing && 
           !config.allowPhotoSharing;
  }
  
  private static assessFERPACompliance(config: PrivacyConfig): boolean {
    // FERPA compliance for educational records
    return config.enableDataMasking && 
           config.anonymizeStudentData && 
           config.auditTrailEnabled;
  }
}

interface ComplianceReport {
  generatedAt: string;
  complianceLevel: 'high' | 'medium' | 'low';
  privacySettings: PrivacyConfig;
  dataProcessingActivity: {
    totalMaskingEvents: number;
    privacyViolations: number;
    lastAIInteraction: string;
  };
  recommendations: string[];
  hipaaCompliance: boolean;
  ferpaCompliance: boolean;
}

export default DataPrivacyService;
// Enhanced Lesson Plan Download System
// This replaces the basic exportLessonPlan function with a professional download system

import React, { useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';

// =============================================================================
// ENHANCED EXPORT FUNCTIONALITY
// =============================================================================

interface ExportOptions {
  format: 'html' | 'pdf' | 'txt' | 'print';
  includeImages: boolean;
  includeDataCollection: boolean;
  teacherNotes: boolean;
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

// Enhanced export function that creates beautiful, professional lesson plans
export const exportLessonPlan = async (
  lessonPlan: DetailedLessonPlan, 
  options: ExportOptions = {
    format: 'html',
    includeImages: true,
    includeDataCollection: true,
    teacherNotes: true
  }
): Promise<void> => {
  try {
    switch (options.format) {
      case 'html':
        await exportAsHTML(lessonPlan, options);
        break;
      case 'pdf':
        await exportAsPDF(lessonPlan, options);
        break;
      case 'txt':
        await exportAsText(lessonPlan, options);
        break;
      case 'print':
        await printLessonPlan(lessonPlan, options);
        break;
      default:
        await exportAsHTML(lessonPlan, options);
    }
    
    console.log(`✅ Lesson plan exported as ${options.format.toUpperCase()}`);
  } catch (error) {
    console.error('❌ Error exporting lesson plan:', error);
    throw new Error(`Failed to export lesson plan as ${options.format}`);
  }
};

// =============================================================================
// HTML EXPORT (MOST PROFESSIONAL LOOKING)
// =============================================================================

const exportAsHTML = async (lessonPlan: DetailedLessonPlan, options: ExportOptions): Promise<void> => {
  const htmlContent = generateProfessionalHTML(lessonPlan, options);
  
  // Create and download HTML file
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(lessonPlan.title)}.html`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Generate beautiful, professional HTML lesson plan
const generateProfessionalHTML = (lessonPlan: DetailedLessonPlan, options: ExportOptions): string => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${lessonPlan.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
            padding: 2rem;
        }
        
        .lesson-plan {
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }
        
        .header .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 1rem;
        }
        
        .header .meta {
            display: flex;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
            font-size: 0.9rem;
        }
        
        .meta-item {
            background: rgba(255, 255, 255, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        
        .content {
            padding: 2rem;
        }
        
        .section {
            margin-bottom: 2.5rem;
            page-break-inside: avoid;
        }
        
        .section-header {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            color: #334155;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border-left: 4px solid #667eea;
        }
        
        .section-header h2 {
            font-size: 1.3rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .icon {
            width: 1.2rem;
            height: 1.2rem;
        }
        
        .overview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .overview-item {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .overview-item .label {
            font-size: 0.8rem;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.25rem;
        }
        
        .overview-item .value {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1e293b;
        }
        
        .objectives-list {
            list-style: none;
        }
        
        .objective-item {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 0.75rem;
            position: relative;
            padding-left: 3.5rem;
        }
        
        .objective-type {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            color: white;
        }
        
        .objective-type.academic { background: #3b82f6; }
        .objective-type.behavioral { background: #10b981; }
        .objective-type.social { background: #8b5cf6; }
        
        .materials-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 2fr;
            gap: 0.5rem;
            font-size: 0.9rem;
        }
        
        .materials-header {
            font-weight: 600;
            color: #374151;
            padding: 0.5rem;
            background: #f3f4f6;
            border-radius: 4px;
        }
        
        .materials-row {
            padding: 0.5rem;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .materials-row:nth-child(even) {
            background: #f9fafb;
        }
        
        .procedure-step {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            position: relative;
        }
        
        .step-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .step-number {
            background: #667eea;
            color: white;
            border-radius: 50%;
            width: 2.5rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.1rem;
        }
        
        .step-info h3 {
            color: #1e293b;
            font-size: 1.1rem;
            margin-bottom: 0.25rem;
        }
        
        .step-meta {
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        
        .step-phase {
            background: #f1f5f9;
            color: #475569;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: capitalize;
        }
        
        .step-duration {
            color: #64748b;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .actions-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .actions-column h4 {
            color: #374151;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        
        .actions-column ul {
            list-style: none;
        }
        
        .actions-column li {
            color: #6b7280;
            font-size: 0.85rem;
            margin-bottom: 0.25rem;
            padding-left: 1rem;
            position: relative;
        }
        
        .actions-column li::before {
            content: "•";
            color: #667eea;
            position: absolute;
            left: 0;
        }
        
        .assessment-item {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 0.75rem;
        }
        
        .assessment-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        .assessment-type {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            color: white;
        }
        
        .assessment-type.formative { background: #3b82f6; }
        .assessment-type.summative { background: #10b981; }
        
        .accommodation-group {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .accommodation-group h4 {
            color: #92400e;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .accommodation-group ul {
            list-style: none;
        }
        
        .accommodation-group li {
            color: #92400e;
            font-size: 0.85rem;
            margin-bottom: 0.25rem;
            padding-left: 1rem;
            position: relative;
        }
        
        .accommodation-group li::before {
            content: "→";
            position: absolute;
            left: 0;
        }
        
        .data-collection {
            background: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .data-collection h4 {
            color: #047857;
            margin-bottom: 0.5rem;
        }
        
        .data-point {
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
        }
        
        .data-point strong {
            color: #047857;
        }
        
        .footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 1.5rem 2rem;
            text-align: center;
            color: #64748b;
            font-size: 0.8rem;
        }
        
        .generated-info {
            margin-bottom: 0.5rem;
        }
        
        .bloom-branding {
            color: #667eea;
            font-weight: 600;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .lesson-plan {
                box-shadow: none;
                border-radius: 0;
            }
            
            .section {
                page-break-inside: avoid;
            }
            
            .procedure-step {
                page-break-inside: avoid;
            }
        }
        
        @page {
            margin: 0.75in;
            size: letter;
        }
    </style>
</head>
<body>
    <div class="lesson-plan">
        <div class="header">
            <h1>${lessonPlan.title}</h1>
            <div class="subtitle">Generated ${formatDate(lessonPlan.generatedAt)}</div>
            <div class="meta">
                <div class="meta-item">Duration: ${lessonPlan.duration} minutes</div>
                <div class="meta-item">Grade: ${lessonPlan.gradeLevel}</div>
                <div class="meta-item">Group Size: ${lessonPlan.groupSize}</div>
                <div class="meta-item">Theme: ${lessonPlan.theme}</div>
            </div>
        </div>
        
        <div class="content">
            <!-- LESSON OVERVIEW -->
            <div class="section">
                <div class="section-header">
                    <h2>📋 Lesson Overview</h2>
                </div>
                <div class="overview-grid">
                    <div class="overview-item">
                        <div class="label">Duration</div>
                        <div class="value">${lessonPlan.duration} minutes</div>
                    </div>
                    <div class="overview-item">
                        <div class="label">Group Size</div>
                        <div class="value">${lessonPlan.groupSize} students</div>
                    </div>
                    <div class="overview-item">
                        <div class="label">Staff Ratio</div>
                        <div class="value">${lessonPlan.staffRatio}</div>
                    </div>
                    <div class="overview-item">
                        <div class="label">Theme</div>
                        <div class="value">${lessonPlan.theme}</div>
                    </div>
                </div>
            </div>
            
            <!-- LEARNING OBJECTIVES -->
            <div class="section">
                <div class="section-header">
                    <h2>🎯 Learning Objectives</h2>
                </div>
                <ul class="objectives-list">
                    ${lessonPlan.objectives.map(objective => `
                        <li class="objective-item">
                            <span class="objective-type ${objective.type}">${objective.type}</span>
                            ${objective.description}
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <!-- MATERIALS -->
            <div class="section">
                <div class="section-header">
                    <h2>📦 Materials & Supplies</h2>
                </div>
                <div class="materials-grid">
                    <div class="materials-header">Material</div>
                    <div class="materials-header">Quantity</div>
                    <div class="materials-header">Location</div>
                    ${lessonPlan.materials.map(material => `
                        <div class="materials-row">${material.name}</div>
                        <div class="materials-row">${material.quantity}</div>
                        <div class="materials-row">${material.location}</div>
                    `).join('')}
                </div>
            </div>
            
            <!-- LESSON PROCEDURES -->
            <div class="section">
                <div class="section-header">
                    <h2>📝 Lesson Procedures</h2>
                </div>
                ${lessonPlan.procedures.map(step => `
                    <div class="procedure-step">
                        <div class="step-header">
                            <div class="step-number">${step.stepNumber}</div>
                            <div class="step-info">
                                <h3>${step.instruction}</h3>
                                <div class="step-meta">
                                    <span class="step-phase">${step.phase}</span>
                                    <span class="step-duration">⏱️ ${step.duration} min</span>
                                </div>
                            </div>
                        </div>
                        <div class="actions-grid">
                            <div class="actions-column">
                                <h4>Teacher Actions</h4>
                                <ul>
                                    ${step.teacherActions.map(action => `<li>${action}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="actions-column">
                                <h4>Student Actions</h4>
                                <ul>
                                    ${step.studentActions.map(action => `<li>${action}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- ASSESSMENT -->
            <div class="section">
                <div class="section-header">
                    <h2>📊 Assessment Methods</h2>
                </div>
                ${lessonPlan.assessments.map(assessment => `
                    <div class="assessment-item">
                        <div class="assessment-header">
                            <span class="assessment-type ${assessment.type}">${assessment.type}</span>
                            <span class="assessment-method">${assessment.method}</span>
                        </div>
                        <ul>
                            ${assessment.criteria.map(criterion => `<li>${criterion}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            
            <!-- ACCOMMODATIONS -->
            <div class="section">
                <div class="section-header">
                    <h2>♿ Student Accommodations</h2>
                </div>
                ${lessonPlan.accommodations.map(accommodation => `
                    <div class="accommodation-group">
                        <h4>${accommodation.studentType}</h4>
                        <ul>
                            ${accommodation.strategies.map(strategy => `<li>${strategy}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            
            ${options.includeDataCollection ? `
            <!-- DATA COLLECTION -->
            <div class="section">
                <div class="section-header">
                    <h2>📈 Data Collection Points</h2>
                </div>
                <div class="data-collection">
                    <h4>IEP Goal Tracking</h4>
                    ${lessonPlan.dataCollectionPoints.map(point => `
                        <div class="data-point">
                            <strong>${point.moment}:</strong> ${point.method}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- SETUP INSTRUCTIONS -->
            <div class="section">
                <div class="section-header">
                    <h2>🔧 Setup & Cleanup</h2>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <h4 style="color: #374151; margin-bottom: 0.5rem;">Setup Instructions</h4>
                        <ul style="list-style: none;">
                            ${lessonPlan.setupInstructions.map(instruction => `
                                <li style="margin-bottom: 0.25rem; padding-left: 1rem; position: relative;">
                                    <span style="position: absolute; left: 0; color: #667eea;">•</span>
                                    ${instruction}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div>
                        <h4 style="color: #374151; margin-bottom: 0.5rem;">Cleanup Instructions</h4>
                        <ul style="list-style: none;">
                            ${lessonPlan.cleanupInstructions.map(instruction => `
                                <li style="margin-bottom: 0.25rem; padding-left: 1rem; position: relative;">
                                    <span style="position: absolute; left: 0; color: #667eea;">•</span>
                                    ${instruction}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="generated-info">
                Generated on ${formatDate(lessonPlan.generatedAt)} • Template Version ${lessonPlan.templateVersion}
            </div>
            <div class="bloom-branding">
                Created with <strong>Bloom Classroom</strong> Smart Groups AI
            </div>
        </div>
    </div>
</body>
</html>`;
};

// =============================================================================
// TEXT EXPORT (SIMPLE, CLEAN)
// =============================================================================

const exportAsText = async (lessonPlan: DetailedLessonPlan, options: ExportOptions): Promise<void> => {
  const textContent = generateTextFormat(lessonPlan, options);
  
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(lessonPlan.title)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

const generateTextFormat = (lessonPlan: DetailedLessonPlan, options: ExportOptions): string => {
  return `
========================================
${lessonPlan.title.toUpperCase()}
========================================

Generated: ${new Date(lessonPlan.generatedAt).toLocaleDateString()}
Duration: ${lessonPlan.duration} minutes
Grade: ${lessonPlan.gradeLevel}
Group Size: ${lessonPlan.groupSize}
Theme: ${lessonPlan.theme}
Staff Ratio: ${lessonPlan.staffRatio}

========================================
LEARNING OBJECTIVES
========================================

${lessonPlan.objectives.map((obj, index) => `
${index + 1}. [${obj.type.toUpperCase()}] ${obj.description}
`).join('')}

========================================
MATERIALS & SUPPLIES
========================================

Required Materials:
${lessonPlan.materials.filter(m => m.required).map(m => `• ${m.name} (${m.quantity}) - Location: ${m.location}`).join('\n')}

Optional Materials:
${lessonPlan.materials.filter(m => !m.required).map(m => `• ${m.name} (${m.quantity}) - Location: ${m.location}`).join('\n')}

========================================
LESSON PROCEDURES
========================================

${lessonPlan.procedures.map(step => `
STEP ${step.stepNumber}: ${step.instruction.toUpperCase()}
Phase: ${step.phase} | Duration: ${step.duration} minutes

Teacher Actions:
${step.teacherActions.map(action => `  - ${action}`).join('\n')}

Student Actions:
${step.studentActions.map(action => `  - ${action}`).join('\n')}

${step.accommodations ? `Accommodations:\n${step.accommodations.map(acc => `  - ${acc}`).join('\n')}` : ''}
`).join('\n')}

========================================
ASSESSMENT METHODS
========================================

${lessonPlan.assessments.map(assessment => `
${assessment.type.toUpperCase()}: ${assessment.method}
Timing: ${assessment.timing}
Criteria:
${assessment.criteria.map(criterion => `  - ${criterion}`).join('\n')}
`).join('')}

========================================
STUDENT ACCOMMODATIONS
========================================

${lessonPlan.accommodations.map(acc => `
${acc.studentType}:
${acc.strategies.map(strategy => `  - ${strategy}`).join('\n')}
`).join('')}

${options.includeDataCollection ? `
========================================
DATA COLLECTION POINTS
========================================

${lessonPlan.dataCollectionPoints.map(point => `
${point.moment}: ${point.method}
Criteria: ${point.criteria.join(', ')}
`).join('')}
` : ''}

========================================
SETUP & CLEANUP
========================================

Setup Instructions:
${lessonPlan.setupInstructions.map(instruction => `• ${instruction}`).join('\n')}

Cleanup Instructions:
${lessonPlan.cleanupInstructions.map(instruction => `• ${instruction}`).join('\n')}

========================================
PARENT COMMUNICATION
========================================

${lessonPlan.parentCommunication}

========================================
Generated with Bloom Classroom Smart Groups AI
Template Version: ${lessonPlan.templateVersion}
========================================
`;
};

// =============================================================================
// PRINT FUNCTIONALITY
// =============================================================================

const printLessonPlan = async (lessonPlan: DetailedLessonPlan, options: ExportOptions): Promise<void> => {
  const htmlContent = generateProfessionalHTML(lessonPlan, options);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
};

// =============================================================================
// PDF EXPORT (Would require additional library)
// =============================================================================

const exportAsPDF = async (lessonPlan: DetailedLessonPlan, options: ExportOptions): Promise<void> => {
  // For PDF export, you would typically use jsPDF or html2pdf.js
  // For now, we'll fall back to HTML export with instructions
  
  console.log('📄 PDF export requires additional library. Generating HTML instead...');
  await exportAsHTML(lessonPlan, options);
  
  // Show helpful message to user
  alert(`PDF export is coming soon! 
  
For now, we've generated an HTML version that you can:
1. Open in your browser
2. Print to PDF using your browser's print function
3. Save as PDF using "Print to PDF" option

This HTML version is beautifully formatted and print-ready!`);
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9\s-_\.]/gi, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase();
};

// =============================================================================
// ENHANCED DOWNLOAD COMPONENT FOR UI
// =============================================================================

interface DownloadOptionsModalProps {
  isOpen: boolean;
  lessonPlan: DetailedLessonPlan;
  onClose: () => void;
  onDownload: (format: string, options: ExportOptions) => void;
}

export const DownloadOptionsModal: React.FC<DownloadOptionsModalProps> = ({
  isOpen,
  lessonPlan,
  onClose,
  onDownload
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'html' | 'txt' | 'print'>('html');
  const [options, setOptions] = useState<ExportOptions>({
    format: 'html',
    includeImages: true,
    includeDataCollection: true,
    teacherNotes: true
  });

  const formatOptions = [
    { 
      id: 'html' as const, 
      label: 'HTML (Recommended)', 
      description: 'Beautiful, print-ready format that opens in browser',
      icon: '🌐'
    },
    { 
      id: 'txt' as const, 
      label: 'Text File', 
      description: 'Simple text format for easy sharing',
      icon: '📄'
    },
    { 
      id: 'print' as const, 
      label: 'Print Directly', 
      description: 'Open print dialog immediately',
      icon: '🖨️'
    }
  ];

  const handleDownload = () => {
    onDownload(selectedFormat, { ...options, format: selectedFormat });
    onClose();
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
      zIndex: 10000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: 0, color: '#1a202c', fontSize: '1.5rem' }}>
            Download Lesson Plan
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#9ca3af'
            }}
          >
            ×
          </button>
        </div>

        {/* Format Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ 
            margin: '0 0 1rem 0', 
            color: '#374151', 
            fontSize: '1.1rem' 
          }}>
            Choose Format
          </h4>
          
          {formatOptions.map(format => (
            <div 
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              style={{
                border: selectedFormat === format.id ? '2px solid #667eea' : '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedFormat === format.id ? '#f0f4ff' : 'white'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginBottom: '0.25rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>{format.icon}</span>
                <span style={{ 
                  fontWeight: '600', 
                  color: selectedFormat === format.id ? '#667eea' : '#374151' 
                }}>
                  {format.label}
                </span>
              </div>
              <p style={{ 
                margin: '0', 
                fontSize: '0.85rem', 
                color: '#6b7280',
                paddingLeft: '2rem'
              }}>
                {format.description}
              </p>
            </div>
          ))}
        </div>

        {/* Options */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ 
            margin: '0 0 1rem 0', 
            color: '#374151', 
            fontSize: '1.1rem' 
          }}>
            Include Options
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '4px',
              transition: 'background 0.2s ease'
            }}>
              <input
                type="checkbox"
                checked={options.includeDataCollection}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  includeDataCollection: e.target.checked
                }))}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                Data Collection Points
              </span>
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '4px'
            }}>
              <input
                type="checkbox"
                checked={options.teacherNotes}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  teacherNotes: e.target.checked
                }))}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                Teacher Notes & Tips
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleDownload}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Download style={{ width: '1rem', height: '1rem' }} />
            Download {formatOptions.find(f => f.id === selectedFormat)?.label}
          </button>
        </div>
      </div>
    </div>
  );
};

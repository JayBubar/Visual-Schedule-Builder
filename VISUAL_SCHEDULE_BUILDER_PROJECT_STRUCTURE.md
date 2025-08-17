# Visual Schedule Builder - Complete Project Structure & Description

> **A comprehensive desktop application for creating interactive visual schedules in special education classrooms**

## 🎯 Project Overview

Visual Schedule Builder is an Electron-based React application designed specifically for special education teachers to create engaging, interactive daily schedules. The application transforms traditional static schedules into dynamic, touch-friendly experiences optimized for smartboard presentation and student interaction.

### Key Features
- **🎨 Drag-and-Drop Schedule Creation** - Intuitive visual interface for building schedules
- **📱 Touch-Friendly Smartboard Display** - Large, accessible interface for classroom interaction
- **🎭 Rich Visual Library** - 200+ pre-loaded activity icons plus custom image support
- **👥 Individual & Group Schedules** - Support for diverse student needs and accommodations
- **⏰ Real-Time Progress Tracking** - Students can check off completed activities with visual feedback
- **🎯 IEP Goal Integration** - Comprehensive IEP goal management and data collection
- **📊 Progress Analytics** - Real-time progress monitoring and reporting
- **♿ Accessibility First** - High contrast, screen reader support, and inclusive design

---

## 📁 Complete Project Structure

```
visual-schedule-builder/
├── 📄 Configuration Files
│   ├── package.json                    # Project dependencies and scripts
│   ├── package-lock.json              # Dependency lock file
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── tsconfig.main.json             # TypeScript config for main process
│   ├── vite.config.ts                 # Vite build configuration
│   ├── .eslintrc.js                   # ESLint configuration
│   ├── .gitignore                     # Git ignore rules
│   ├── .clinerules                    # Cline development rules
│   ├── index.html                     # Main HTML entry point
│   └── LICENSE                        # MIT License
│
├── 📚 Documentation
│   ├── README.md                      # Main project documentation
│   ├── CONTRIBUTING.md                # Contribution guidelines
│   ├── PROJECT_STRUCTURE.md           # Project setup guide
│   ├── CONSOLIDATION_MASTER_PLAN.md   # Development roadmap
│   ├── EXECUTIVE_SUMMARY_FINDINGS.md  # Project analysis
│   ├── PROJECT_AUDIT_REPORT.md        # Technical audit
│   ├── BUNDLE_ANALYSIS_REPORT.md      # Build analysis
│   ├── INTEGRATION-TEST.md            # Integration testing
│   ├── SMART_GROUPS_VERIFICATION_RESULTS.md # Smart groups testing
│   └── ACTIVITY-LIBRARY-INTEGRATION-COMPLETE.md # Activity library docs
│
├── 🎨 Assets
│   └── assests/                       # Application icons and assets
│       ├── icon.ico                   # Windows icon
│       ├── icon.png                   # Main application icon
│       ├── icon.incs.png             # Alternative icon format
│       └── installer.icon.png         # Installer icon
│
├── 🌐 Public Assets
│   └── public/
│       ├── manifest.json              # Web app manifest
│       ├── browserconfig.xml          # Browser configuration
│       ├── sw.js                      # Service worker
│       └── assets/                    # Public icons
│           ├── icon-192.png           # PWA icon 192x192
│           └── icon-512.png           # PWA icon 512x512
│
├── 📦 Release Build
│   └── release/
│       ├── builder-debug.yml          # Electron builder debug config
│       ├── builder-effective-config.yaml # Effective build config
│       ├── latest.yml                 # Update configuration
│       ├── Visual Schedule Builder Setup 1.0.0.exe.blockmap # Windows installer
│       └── win-unpacked/              # Unpacked Windows build
│           ├── chrome_*.pak           # Chromium resources
│           ├── *.dll                  # Windows libraries
│           ├── resources.pak          # Application resources
│           ├── locales/               # Internationalization files
│           └── resources/             # Packaged application
│               └── app.asar           # Application archive
│
└── 💻 Source Code
    └── src/
        ├── 🔧 Main Process (Electron)
        │   └── main/
        │       └── index.ts            # Electron main process entry point
        │
        ├── 🎨 Renderer Process (React Frontend)
        │   └── renderer/
        │       ├── 🚀 Application Core
        │       │   ├── main.tsx        # React application entry point
        │       │   └── App.tsx         # Main application component
        │       │
        │       ├── 🧩 Components
        │       │   ├── builder/        # Schedule Creation Interface
        │       │   │   ├── ScheduleBuilder.tsx      # Main schedule builder
        │       │   │   ├── GroupCreator.tsx         # Group management
        │       │   │   ├── EnhancedGroupAssignment.tsx # Advanced grouping
        │       │   │   └── ScheduleConflictDetector.tsx # Conflict detection
        │       │   │
        │       │   ├── display/        # Smartboard Presentation Mode
        │       │   │   ├── SmartboardDisplay.tsx    # Main display interface
        │       │   │   ├── AbsentStudentsDisplay.tsx # Absence management
        │       │   │   └── OutOfClassDisplay.tsx    # Out-of-class tracking
        │       │   │
        │       │   ├── management/     # Student & Staff Management
        │       │   │   ├── StudentManagement.tsx    # Student records & IEP integration
        │       │   │   ├── StaffManagement.tsx      # Staff management
        │       │   │   ├── Settings.tsx             # Application settings
        │       │   │   └── EnhancedResourceInput.tsx # Resource services input
        │       │   │
        │       │   ├── data-collection/ # IEP Data Collection System
        │       │   │   ├── GoalManager.tsx          # IEP goal management
        │       │   │   ├── IEPDataCollectionInterface.tsx # Main data collection
        │       │   │   ├── EnhancedDataEntry.tsx    # Advanced data entry
        │       │   │   ├── QuickDataEntry.tsx       # Quick data input
        │       │   │   ├── ProgressPanel.tsx        # Progress monitoring
        │       │   │   ├── ProgressDashboard.tsx    # Analytics dashboard
        │       │   │   ├── PrintDataSheetSystem.tsx # Printable data sheets
        │       │   │   ├── ReportsExportSystem.tsx  # Report generation
        │       │   │   └── index.ts                 # Data collection exports
        │       │   │
        │       │   ├── calendar/       # Daily Check-in & Calendar Features
        │       │   │   ├── DailyCheckIn.tsx         # Main daily check-in
        │       │   │   ├── WelcomeScreen.tsx        # Welcome interface
        │       │   │   ├── AreWeReady.tsx           # Readiness check
        │       │   │   ├── AttendanceSystem.tsx     # Attendance tracking
        │       │   │   ├── BehaviorCommitments.tsx  # Behavior goals
        │       │   │   ├── CelebrationSystem.tsx    # Student celebrations
        │       │   │   ├── DailyHighlights.tsx      # Daily achievements
        │       │   │   ├── IndependentChoices.tsx   # Student choices
        │       │   │   ├── ThreeDayView.tsx         # Multi-day calendar
        │       │   │   ├── CalendarWidget.tsx       # Calendar component
        │       │   │   ├── CalendarSettings.tsx     # Calendar configuration
        │       │   │   └── WeatherWidget.tsx        # Weather display
        │       │   │
        │       │   ├── common/         # Shared Components
        │       │   │   ├── Navigation.tsx           # Main navigation
        │       │   │   ├── StartScreen.tsx          # Application start screen
        │       │   │   ├── ActivityLibrary.tsx      # Activity management
        │       │   │   ├── SimpleActivityEditor.tsx # Activity editing
        │       │   │   ├── AudioNotificationSystem.tsx # Audio notifications
        │       │   │   └── CelebrationAnimations.tsx # Celebration effects
        │       │   │
        │       │   ├── smart-groups/   # AI-Powered Grouping
        │       │   │   └── SmartGroups.tsx          # Intelligent student grouping
        │       │   │
        │       │   ├── reports/        # Reporting System
        │       │   │   └── Reports.tsx              # Report generation
        │       │   │
        │       │   ├── integration/    # External Integrations
        │       │   │   └── (Future integrations)
        │       │   │
        │       │   └── intelligence/   # AI Features
        │       │       └── (AI-powered features)
        │       │
        │       ├── 🔧 Services
        │       │   ├── unifiedDataService.ts       # Central data management
        │       │   ├── smartGroupsService.ts       # AI grouping service
        │       │   ├── dataPrivacyService.ts       # Privacy management
        │       │   └── ResourceScheduleManager.tsx # Resource scheduling
        │       │
        │       ├── 🎣 Hooks
        │       │   ├── useRobustDataLoading.ts     # Data loading hook
        │       │   ├── useStaffData.ts             # Staff data hook
        │       │   └── useStudentData.ts           # Student data hook
        │       │
        │       ├── 🗂️ Types
        │       │   └── index.ts                    # TypeScript type definitions
        │       │
        │       ├── 🛠️ Utils
        │       │   ├── storage.ts                  # Data persistence
        │       │   ├── schedulePersistence.ts      # Schedule storage
        │       │   ├── dataMigration.ts            # Data migration
        │       │   ├── studentDataCleanup.ts       # Data cleanup
        │       │   ├── studentDataDiagnostic.ts    # Data diagnostics
        │       │   ├── activityGoalMapping.ts      # Activity-goal linking
        │       │   ├── celebrationManager.ts       # Celebration logic
        │       │   ├── choiceDataManager.ts        # Choice data management
        │       │   ├── choiceUtils.ts              # Choice utilities
        │       │   ├── groupingHelpers.ts          # Grouping algorithms
        │       │   ├── photoManager.ts             # Photo management
        │       │   └── weatherService.ts           # Weather integration
        │       │
        │       ├── 🎨 Styles
        │       │   ├── index.css                   # Global styles
        │       │   └── smart-groups-animations.css # Smart groups animations
        │       │
        │       ├── 📊 Data
        │       │   └── defaultTransitionActivities.ts # Default activities
        │       │
        │       ├── 🖼️ Assets
        │       │   └── blom-log.png                # Application logo
        │       │
        │       └── 🔗 Contexts
        │           └── TimerContext.tsx            # Timer state management
        │
        └── 🤝 Shared
            └── shared/                             # Shared utilities
```

---

## 🏗️ Technical Architecture

### **Frontend Framework**
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Framer Motion** for smooth animations
- **Lucide React** for consistent iconography

### **Desktop Framework**
- **Electron 22** for cross-platform desktop deployment
- **Electron Store** for persistent data storage
- **Electron Builder** for application packaging

### **Data Management**
- **UnifiedDataService** - Central data management system
- **Local Storage** with migration support
- **Robust data loading** with error handling
- **Real-time data synchronization**

### **Key Libraries**
- **React Router DOM** - Navigation and routing
- **Recharts** - Data visualization and analytics
- **React-to-Print** - Printable reports and data sheets
- **UUID** - Unique identifier generation

---

## 🎯 Core Features & Components

### **1. Schedule Builder (`src/renderer/components/builder/`)**
**Purpose**: Visual drag-and-drop interface for creating daily schedules
- **ScheduleBuilder.tsx** - Main schedule creation interface
- **GroupCreator.tsx** - Student grouping management
- **EnhancedGroupAssignment.tsx** - Advanced grouping with AI suggestions
- **ScheduleConflictDetector.tsx** - Automatic conflict detection and resolution

### **2. Smartboard Display (`src/renderer/components/display/`)**
**Purpose**: Touch-friendly presentation mode for classroom interaction
- **SmartboardDisplay.tsx** - Main display interface optimized for large screens
- **AbsentStudentsDisplay.tsx** - Visual absence tracking
- **OutOfClassDisplay.tsx** - Out-of-class student management

### **3. Student Management (`src/renderer/components/management/`)**
**Purpose**: Comprehensive student records with IEP integration
- **StudentManagement.tsx** - Central student management hub with IEP buttons
- **StaffManagement.tsx** - Staff member management
- **Settings.tsx** - Application configuration
- **EnhancedResourceInput.tsx** - Resource services configuration

### **4. IEP Data Collection (`src/renderer/components/data-collection/`)**
**Purpose**: Complete IEP goal management and progress monitoring system
- **GoalManager.tsx** - IEP goal creation and management
- **IEPDataCollectionInterface.tsx** - Main data collection interface
- **EnhancedDataEntry.tsx** - Advanced data entry with trial tracking
- **QuickDataEntry.tsx** - Rapid data input for busy classrooms
- **ProgressPanel.tsx** - Real-time progress monitoring
- **ProgressDashboard.tsx** - Analytics and trend visualization
- **PrintDataSheetSystem.tsx** - Printable data collection sheets
- **ReportsExportSystem.tsx** - Comprehensive report generation

### **5. Daily Check-in System (`src/renderer/components/calendar/`)**
**Purpose**: Morning routines and daily engagement features
- **DailyCheckIn.tsx** - Main daily check-in interface
- **WelcomeScreen.tsx** - Personalized welcome messages
- **AttendanceSystem.tsx** - Quick attendance tracking
- **BehaviorCommitments.tsx** - Daily behavior goal setting
- **CelebrationSystem.tsx** - Student achievement celebrations
- **DailyHighlights.tsx** - Daily achievement tracking
- **IndependentChoices.tsx** - Student choice activities

### **6. Activity Library (`src/renderer/components/common/`)**
**Purpose**: Comprehensive activity management system
- **ActivityLibrary.tsx** - Activity browsing and management
- **SimpleActivityEditor.tsx** - Quick activity creation and editing
- **AudioNotificationSystem.tsx** - Audio cues and notifications
- **CelebrationAnimations.tsx** - Visual celebration effects

### **7. Smart Groups (`src/renderer/components/smart-groups/`)**
**Purpose**: AI-powered intelligent student grouping
- **SmartGroups.tsx** - Machine learning-based grouping suggestions
- **smartGroupsService.ts** - AI algorithms for optimal grouping

---

## 🗄️ Data Management System

### **UnifiedDataService (`src/renderer/services/unifiedDataService.ts`)**
**Central data management system handling:**

#### **Student Data Management**
```typescript
interface UnifiedStudent {
  id: string;
  name: string;
  grade: string;
  photo?: string;
  dateCreated: string;
  
  // IEP Integration
  iepData: {
    goals: IEPGoal[];
    dataCollection: DataPoint[];
    progressAnalytics?: {
      overallProgress: number;
      goalsMet: number;
      totalGoals: number;
      lastDataCollection: string;
    };
  };
  
  // Birthday & Celebrations
  birthday?: string;
  allowBirthdayDisplay?: boolean;
  allowPhotoInCelebrations?: boolean;
  
  // Resource Information
  resourceInformation?: {
    attendsResourceServices: boolean;
    accommodations: string[];
    relatedServices: string[];
    allergies: string[];
    medicalNeeds: string[];
  };
}
```

#### **IEP Goal Management**
```typescript
interface IEPGoal {
  id: string;
  studentId: string;
  title: string;
  domain: 'academic' | 'behavioral' | 'social-emotional' | 'physical' | 'communication' | 'adaptive';
  description: string;
  shortTermObjective: string;
  measurementType: 'percentage' | 'frequency' | 'duration' | 'rating' | 'yes-no' | 'independence';
  criteria: string;
  target: number;
  priority: 'high' | 'medium' | 'low';
  currentProgress: number;
  isActive: boolean;
  
  // Nine-week progress monitoring
  nineWeekMilestones?: {
    quarter1: { target: number; actual?: number; notes?: string };
    quarter2: { target: number; actual?: number; notes?: string };
    quarter3: { target: number; actual?: number; notes?: string };
    quarter4: { target: number; actual?: number; notes?: string };
  };
}
```

#### **Data Collection System**
```typescript
interface DataPoint {
  id: string;
  goalId: string;
  studentId: string;
  date: string;
  time: string;
  value: number;
  totalOpportunities?: number;
  notes: string;
  context: string;
  collector: string;
  photos?: string[];
  voiceNotes?: string[];
}
```

---

## 🎨 User Interface Design

### **Design Philosophy**
- **Accessibility First** - High contrast, large touch targets, screen reader support
- **Touch-Friendly** - Optimized for smartboard interaction
- **Visual Clarity** - Clean, intuitive interface with clear visual hierarchy
- **Responsive Design** - Adapts to different screen sizes and orientations

### **Color Scheme & Styling**
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Success Green**: `#22c55e` for positive actions and progress
- **Warning Orange**: `#f59e0b` for attention items
- **Error Red**: `#ef4444` for critical actions
- **Glass Morphism**: `backdrop-filter: blur(20px)` for modern UI elements

### **Component Styling Patterns**
- **Cards**: Rounded corners, subtle shadows, hover animations
- **Buttons**: Gradient backgrounds, smooth transitions, clear states
- **Modals**: Full-screen overlays with backdrop blur
- **Progress Indicators**: Visual progress bars and percentage displays

---

## 🔄 Data Flow & State Management

### **Application State Flow**
1. **App.tsx** - Central state management and routing
2. **UnifiedDataService** - Data persistence and retrieval
3. **Component State** - Local component state for UI interactions
4. **Event System** - Custom events for cross-component communication

### **Data Persistence Strategy**
- **Primary Storage**: localStorage with structured JSON
- **Migration System**: Automatic legacy data migration
- **Backup Strategy**: Data export/import functionality
- **Conflict Resolution**: Automatic conflict detection and resolution

### **Real-time Updates**
- **Event-driven Updates** - Components listen for data change events
- **Automatic Refresh** - UI updates immediately after data changes
- **Progress Recalculation** - Real-time progress analytics updates

---

## 🧪 Development Workflow

### **Branch Strategy** (from .clinerules)
- **Main Branch**: `my-main-working-branch` (primary development)
- **Feature Branches**: Created from main working branch
- **Never work directly on main/master**

### **Development Commands**
```bash
# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm test

# Package for distribution
npm run package
```

### **Key Development Rules**
- Always check git status before starting work
- Commit changes frequently with descriptive messages
- Test IEP integration functionality after changes
- Verify student card buttons work: 🎯 Manage Goals, 📊 Data Collection, 🖨️ Print Sheets

---

## 🎯 Current Development Focus

### **IEP Integration Priority**
- **Goal Management** - Creating and editing IEP goals
- **Data Collection** - Multiple entry methods (Quick, Enhanced, Full)
- **Progress Monitoring** - Real-time analytics and trend analysis
- **Report Generation** - Printable data sheets and progress reports

### **Student Management Enhancements**
- **Birthday Integration** - Celebration system in Daily Check-in
- **Resource Services** - Enhanced resource teacher coordination
- **Photo Management** - Student photo upload and celebration preferences
- **Progress Graphics** - Visual progress indicators on student cards

### **Data Flow Debugging**
- **UnifiedDataService** debugging and optimization
- **GoalManager** data flow verification
- **Student card** button integration testing
- **Real-time updates** across all components

---

## 🚀 Future Roadmap

### **Phase 1: Core Stability** (Current)
- ✅ IEP goal management system
- ✅ Data collection interfaces
- ✅ Student management with birthday integration
- 🔄 Progress analytics and reporting

### **Phase 2: Enhanced Features**
- 📱 Mobile companion app
- 🔊 Audio notifications and cues
- 📊 Advanced analytics dashboard
- 🎨 Custom theme support

### **Phase 3: Integration & AI**
- 🤖 AI-powered schedule optimization
- 📚 School system integrations
- 👨‍👩‍👧‍👦 Parent communication portal
- 📈 Predictive analytics

### **Phase 4: Enterprise Features**
- 🏫 Multi-classroom support
- 👥 District-wide deployment
- 📋 Compliance reporting
- 🔐 Advanced security features

---

## 📊 Project Statistics

### **Codebase Metrics**
- **Total Files**: 100+ source files
- **Lines of Code**: 15,000+ lines
- **Components**: 50+ React components
- **Services**: 5 core services
- **Utilities**: 15+ utility modules

### **Feature Completeness**
- **Schedule Builder**: 90% complete
- **Student Management**: 95% complete
- **IEP Integration**: 85% complete
- **Data Collection**: 90% complete
- **Smartboard Display**: 80% complete
- **Daily Check-in**: 85% complete

---

## 🤝 Contributing

### **For Educators**
- Test features and provide feedback
- Suggest workflow improvements
- Share classroom use cases
- Report accessibility issues

### **For Developers**
- Follow TypeScript best practices
- Maintain component documentation
- Write tests for new features
- Ensure accessibility compliance

### **For Designers**
- Improve UI/UX design
- Create new icons and graphics
- Enhance accessibility features
- Design print-friendly layouts

---

## 📞 Support & Resources

### **Documentation**
- **README.md** - Getting started guide
- **CONTRIBUTING.md** - Contribution guidelines
- **PROJECT_STRUCTURE.md** - Technical setup guide

### **Development Tools**
- **VSCode** recommended IDE
- **React Developer Tools** browser extension
- **Electron DevTools** for debugging

### **Community**
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Community support and ideas
- **Email Support** - Direct developer contact

---

**Built with ❤️ for educators and students everywhere**

*Transforming special education through innovative technology and inclusive design*

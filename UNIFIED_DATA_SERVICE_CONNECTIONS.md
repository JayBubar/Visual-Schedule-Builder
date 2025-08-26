# Visual Schedule Builder - UnifiedDataService Connection Analysis

## Project File Tree (Updated)

```
visual-schedule-builder/
├── .clinerules
├── .eslintrc.js
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.main.json
├── vite.config.ts
├── index.html
├── README.md
├── LICENSE
├── contributing.md
├── 
├── Documentation Files/
│   ├── ACTIVITY-LIBRARY-INTEGRATION-COMPLETE.md
│   ├── BUNDLE_ANALYSIS_REPORT.md
│   ├── CONSOLIDATION_MASTER_PLAN.md
│   ├── EXECUTIVE_SUMMARY_FINDINGS.md
│   ├── INTEGRATION-TEST.md
│   ├── PROJECT_AUDIT_REPORT.md
│   ├── PROJECT_DIRECTORY_TREE.md
│   ├── PROJECT_STRUCTURE.md
│   ├── SMART_GROUPS_VERIFICATION_RESULTS.md
│   └── VISUAL_SCHEDULE_BUILDER_PROJECT_STRUCTURE.md
│
├── assests/
│   ├── icon.ico
│   ├── icon.incs.png
│   ├── icon.png
│   └── installer.icon.png
│
├── public/
│   ├── browserconfig.xml
│   ├── manifest.json
│   ├── sw.js
│   └── assets/
│       ├── icon-192.png
│       └── icon-512.png
│
├── release/
│   ├── builder-effective-config.yaml
│   ├── latest.yml
│   ├── Visual Schedule Builder Setup 1.0.0.exe.blockmap
│   └── win-unpacked/
│       └── [Electron build files...]
│
└── src/
    ├── shared/
    ├── main/
    │   └── index.ts
    └── renderer/
        ├── App.tsx ⭐ MAIN ENTRY POINT
        ├── main.tsx
        ├── 
        ├── assets/
        │   └── blom-log.png
        │
        ├── components/
        │   ├── builder/
        │   │   ├── EnhancedGroupAssignment.tsx
        │   │   ├── GroupCreator.tsx
        │   │   ├── ScheduleBuilder.tsx ⭐ USES UDS
        │   │   └── ScheduleConflictDetector.tsx
        │   │
        │   ├── calendar/
        │   │   ├── AreWeReady.tsx
        │   │   ├── AttendanceSystem.tsx ⭐ USES UDS
        │   │   ├── CalendarSettings.tsx
        │   │   ├── CelebrationSystem.tsx ⭐ USES UDS
        │   │   ├── DailyHighlights.tsx
        │   │   ├── IndependentChoices.tsx ⭐ USES UDS
        │   │   └── WeatherWidget.tsx
        │   │
        │   ├── common/
        │   │   ├── ActivityLibrary.tsx ⭐ USES UDS
        │   │   ├── AudioNotificationSystem.tsx
        │   │   ├── CelebrationAnimations.tsx
        │   │   ├── Navigation.tsx
        │   │   ├── SimpleActivityEditor.tsx
        │   │   └── StartScreen.tsx
        │   │
        │   ├── data-collection/ ⭐ HEAVY UDS USAGE
        │   │   ├── EnhancedDataEntry.tsx ⭐ USES UDS
        │   │   ├── GoalManager.tsx ⭐ USES UDS
        │   │   ├── IEPDataCollectionInterface.tsx ⭐ USES UDS
        │   │   ├── index.ts
        │   │   ├── PrintDataSheetSystem.tsx ⭐ USES UDS
        │   │   ├── ProgressDashboard.tsx
        │   │   ├── ProgressPanel.tsx ⭐ USES UDS
        │   │   ├── QuickDataEntry.tsx ⭐ USES UDS
        │   │   └── ReportsExportSystem.tsx
        │   │
        │   ├── display/
        │   │   ├── AbsentStudentsDisplay.tsx ⭐ USES UDS
        │   │   ├── OutOfClassDisplay.tsx
        │   │   ├── SmartboardDisplay.tsx ⭐ USES UDS
        │   │   └── TransitionDisplay.tsx
        │   │
        │   ├── integration/
        │   │   └── CalendarIEPIntegration.tsx
        │   │
        │   ├── intelligence/
        │   │   ├── enhanced-goal-intelligence-core.ts
        │   │   ├── enhanced-goal-intelligence-ui.tsx
        │   │   ├── enhanced-intelligence-integration.tsx
        │   │   └── index.ts
        │   │
        │   ├── management/ ⭐ HEAVY UDS USAGE
        │   │   ├── AttendanceManager.tsx ⭐ USES UDS
        │   │   ├── BehaviorStatementManager.tsx ⭐ USES UDS
        │   │   ├── EnhancedResourceInput.tsx
        │   │   ├── Settings.tsx ⭐ USES UDS
        │   │   ├── StaffManagement.tsx ⭐ USES UDS
        │   │   └── StudentManagement.tsx ⭐ USES UDS
        │   │
        │   ├── morning-meeting/ ⭐ USES UDS
        │   │   ├── index.ts
        │   │   ├── MorningMeetingFlow.tsx
        │   │   ├── MorningMeetingHub.tsx ⭐ USES UDS
        │   │   ├── common/
        │   │   │   └── MorningMeetingNavigation.tsx
        │   │   ├── steps/
        │   │   │   ├── AttendanceStep.tsx ⭐ USES UDS
        │   │   │   ├── BehaviorStep.tsx ⭐ USES UDS
        │   │   │   ├── BehaviorStep.css
        │   │   │   ├── CalendarMathStep.tsx
        │   │   │   ├── CelebrationStep.tsx
        │   │   │   ├── ClassroomRulesStep.tsx
        │   │   │   ├── DayReviewStep.tsx
        │   │   │   ├── index.ts
        │   │   │   ├── SeasonalStep.styles.ts
        │   │   │   ├── SeasonalStep.tsx
        │   │   │   ├── WeatherStep.styles.ts
        │   │   │   ├── WeatherStep.tsx ⭐ USES UDS
        │   │   │   └── WelcomeStep.tsx
        │   │   └── types/
        │   │       └── morningMeetingTypes.ts
        │   │
        │   ├── reports/ ⭐ USES UDS
        │   │   ├── Reports.tsx ⭐ USES UDS
        │   │   ├── StandardsReport.styles.ts
        │   │   └── StandardsReport.tsx ⭐ USES UDS
        │   │
        │   └── smart-groups/ ⭐ HEAVY UDS USAGE
        │       ├── enhanced-lesson-plan-download.tsx
        │       ├── real-claude-ai-integration.ts ⭐ USES UDS
        │       ├── SmartGroups.tsx ⭐ USES UDS
        │       ├── SmartGroupsDebugPanel.tsx ⭐ USES UDS
        │       ├── SmartGroupsEnhancedUI.tsx
        │       ├── SmartGroupsVerification.tsx ⭐ USES UDS
        │       ├── unified-smart-groups-integration.ts ⭐ USES UDS
        │       └── unified-smart-groups-integration.tsx ⭐ USES UDS
        │
        ├── contexts/
        │   └── TimerContext.tsx
        │
        ├── data/
        │   └── defaultTransitionActivities.ts
        │
        ├── hooks/
        │   ├── useRobustDataLoading.ts ⭐ USES UDS
        │   ├── useStaffData.ts
        │   └── useStudentData.ts
        │
        ├── services/ ⭐ CORE DATA LAYER
        │   ├── dataPrivacyService.ts ⭐ USES UDS
        │   ├── ResourceScheduleManager.tsx
        │   ├── smartGroupsService.ts ⭐ USES UDS
        │   └── unifiedDataService.ts ⭐ MAIN SERVICE
        │
        ├── styles/
        │   ├── index.css
        │   └── smart-groups-animations.css
        │
        ├── types/
        │   └── index.ts
        │
        └── utils/
            ├── activityGoalMapping.ts
            ├── celebrationManager.ts
            ├── choiceDataManager.ts
            ├── choiceUtils.ts
            ├── dataMigration.ts ⭐ USES UDS
            ├── groupingHelpers.ts
            ├── photoManager.ts
            ├── schedulePersistence.ts
            ├── storage.ts
            ├── studentDataCleanup.ts ⭐ USES UDS
            ├── studentDataDiagnostic.ts ⭐ USES UDS
            └── weatherService.ts
```

## UnifiedDataService Architecture Overview

### Core Service Location
- **Primary Service**: `src/renderer/services/unifiedDataService.ts`
- **Storage Key**: `'visual-schedule-builder-unified-data'`
- **Data Structure**: Centralized JSON object in localStorage

### Data Models Managed
1. **Students** (`UnifiedStudent[]`)
2. **Staff** (`UnifiedStaff[]`) 
3. **Activities** (`UnifiedActivity[]`)
4. **Attendance** (`AttendanceRecord[]`)
5. **Calendar Data** (behavior commitments, highlights, choices)
6. **Settings** (app configuration)
7. **IEP Goals & Data Points** (embedded in student records)

## Connection Analysis by Component Category

### 🎯 **HEAVY USAGE COMPONENTS** (Core Data Management)

#### **Data Collection System** (`components/data-collection/`)
- **IEPDataCollectionInterface.tsx**: Main IEP interface, loads all students/goals
- **GoalManager.tsx**: CRUD operations for IEP goals
- **QuickDataEntry.tsx**: Adds data points to goals
- **ProgressPanel.tsx**: Displays student progress analytics
- **EnhancedDataEntry.tsx**: Advanced data entry with trials tracking
- **PrintDataSheetSystem.tsx**: Uses student/goal data for printing

#### **Management System** (`components/management/`)
- **StudentManagement.tsx**: Primary student CRUD operations
- **StaffManagement.tsx**: Staff member management
- **AttendanceManager.tsx**: Daily attendance tracking
- **Settings.tsx**: App configuration management
- **BehaviorStatementManager.tsx**: Custom behavior statements

#### **Smart Groups System** (`components/smart-groups/`)
- **SmartGroups.tsx**: AI-powered grouping using student/activity data
- **SmartGroupsVerification.tsx**: System health checks
- **SmartGroupsDebugPanel.tsx**: Development debugging
- **unified-smart-groups-integration.ts**: Core integration logic
- **real-claude-ai-integration.ts**: AI service integration

### 🔄 **MODERATE USAGE COMPONENTS** (Data Display & Interaction)

#### **Display System** (`components/display/`)
- **SmartboardDisplay.tsx**: Main display component, filters absent students
- **AbsentStudentsDisplay.tsx**: Shows absent student information

#### **Morning Meeting System** (`components/morning-meeting/`)
- **MorningMeetingHub.tsx**: Configuration and settings management
- **AttendanceStep.tsx**: Loads students for attendance
- **BehaviorStep.tsx**: Uses student data for behavior tracking
- **WeatherStep.tsx**: Weather history storage

#### **Calendar System** (`components/calendar/`)
- **AttendanceSystem.tsx**: Calendar-based attendance
- **CelebrationSystem.tsx**: Student celebration preferences
- **IndependentChoices.tsx**: Student choice activities

#### **Reports System** (`components/reports/`)
- **Reports.tsx**: Progress and IEP reporting
- **StandardsReport.tsx**: Educational standards tracking

### 🔧 **UTILITY & SUPPORT COMPONENTS**

#### **Common Components** (`components/common/`)
- **ActivityLibrary.tsx**: Custom activity management

#### **Builder System** (`components/builder/`)
- **ScheduleBuilder.tsx**: Uses student/staff data for scheduling

#### **Hooks** (`hooks/`)
- **useRobustDataLoading.ts**: Robust data loading with fallbacks

#### **Services** (`services/`)
- **smartGroupsService.ts**: AI grouping service integration
- **dataPrivacyService.ts**: Privacy-compliant data handling

#### **Utilities** (`utils/`)
- **dataMigration.ts**: Legacy data migration
- **studentDataCleanup.ts**: Data cleanup operations
- **studentDataDiagnostic.ts**: Data integrity checking

### 📱 **APPLICATION ENTRY POINT**
- **App.tsx**: Main application component, loads initial data and settings

## Key Integration Patterns

### 1. **Data Loading Pattern**
```typescript
// Primary loading
const students = UnifiedDataService.getAllStudents();
const staff = UnifiedDataService.getAllStaff();
const activities = UnifiedDataService.getAllActivities();
```

### 2. **Student Management Pattern**
```typescript
// Add student
const newStudent = UnifiedDataService.addStudent(studentData);

// Update student
UnifiedDataService.updateStudent(studentId, updates);

// Get specific student
const student = UnifiedDataService.getStudent(studentId);
```

### 3. **IEP Goal Management Pattern**
```typescript
// Add goal to student
const goal = UnifiedDataService.addGoalToStudent(studentId, goalData);

// Add data point
const dataPoint = UnifiedDataService.addDataPoint(dataPointData);

// Get goal data points
const dataPoints = UnifiedDataService.getGoalDataPoints(goalId);
```

### 4. **Attendance Management Pattern**
```typescript
// Update attendance
UnifiedDataService.updateStudentAttendance(studentId, date, isPresent);

// Get absent students
const absentIds = UnifiedDataService.getAbsentStudentsToday();

// Filter active students
const activeStudents = UnifiedDataService.filterActiveStudents(allStudents);
```

### 5. **Settings Management Pattern**
```typescript
// Load settings
const settings = UnifiedDataService.getSettings();

// Update settings
UnifiedDataService.updateSettings(newSettings);
```

## Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Components    │───▶│ UnifiedDataService│───▶│   localStorage  │
│                 │    │                  │    │                 │
│ • Management    │    │ • Students       │    │ Key:            │
│ • Data Collection│    │ • Staff          │    │ 'visual-        │
│ • Smart Groups  │    │ • Activities     │    │  schedule-      │
│ • Morning Meeting│    │ • Attendance     │    │  builder-       │
│ • Reports       │    │ • Calendar       │    │  unified-data'  │
│ • Display       │    │ • Settings       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Migration & Compatibility

### Legacy Data Sources
- `'students'` → Migrated to `UnifiedStudent[]`
- `'iepGoals'` → Migrated to student.iepData.goals
- `'iepDataPoints'` → Migrated to student.iepData.dataCollection
- `'visualScheduleBuilderSettings'` → Migrated to unified settings

### Fallback Strategy
Most components implement fallback patterns:
1. Try UnifiedDataService first
2. Fall back to props/legacy localStorage
3. Use empty defaults if all fail

## System Health & Monitoring

### Status Checking
```typescript
const status = UnifiedDataService.getSystemStatus();
// Returns: hasUnifiedData, hasLegacyData, totalStudents, totalGoals, totalDataPoints
```

### Data Recovery
```typescript
const recovered = UnifiedDataService.recoverMissingDataPoints();
// Attempts to recover lost data from legacy storage
```

## Summary

The UnifiedDataService serves as the **central nervous system** of the Visual Schedule Builder application, with **65+ direct integrations** across the codebase. It provides:

- ✅ **Centralized data management** for all app entities
- ✅ **Consistent API** across all components  
- ✅ **Legacy data migration** and compatibility
- ✅ **Robust error handling** with fallback strategies
- ✅ **Real-time data synchronization** across components
- ✅ **Educational compliance** features (IEP, attendance, progress tracking)

The service is most heavily utilized in:
1. **Data Collection** (IEP goals, progress tracking)
2. **Student/Staff Management** (CRUD operations)
3. **Smart Groups** (AI-powered educational grouping)
4. **Morning Meeting** (daily workflow integration)
5. **Attendance & Calendar** (daily operations)

This architecture ensures data consistency, reduces code duplication, and provides a scalable foundation for the educational application.

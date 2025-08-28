# Visual Schedule Builder - Resource Pull-out & Absent Students File Reference

## 📋 Overview
This document identifies all files in the Visual Schedule Builder project that are related to **resource pull-out** and **absent student** functionality. Files marked with ⭐ are directly related to these features.

---

## 📁 Complete Directory Structure

```
Visual Schedule Builder/
├── .clinerules
├── .eslintrc.js
├── .gitignore
├── ACTIVITY-LIBRARY-INTEGRATION-COMPLETE.md
├── BUNDLE_ANALYSIS_REPORT.md
├── CONSOLIDATION_MASTER_PLAN.md
├── contributing.md
├── debug-morning-meeting.js
├── demo-choice-activities-script.js
├── EXECUTIVE_SUMMARY_FINDINGS.md
├── index.html
├── INTEGRATION-TEST.md
├── LICENSE
├── package-lock.json
├── package.json
├── PROJECT_AUDIT_REPORT.md
├── PROJECT_DIRECTORY_TREE.md
├── PROJECT_STRUCTURE.md
├── README.md
├── school-friendly-holidays.md
├── search_legacy.ps1
├── SMART_GROUPS_VERIFICATION_RESULTS.md
├── tsconfig.json
├── tsconfig.main.json
├── UNIFIED_DATA_SERVICE_CONNECTIONS.md
├── VISUAL_SCHEDULE_BUILDER_PROJECT_STRUCTURE.md
├── vite.config.ts
├── assests/
│   ├── icon.ico
│   ├── icon.incs.png
│   ├── icon.png
│   └── installer.icon.png
├── public/
│   ├── browserconfig.xml
│   ├── manifest.json
│   ├── sw.js
│   └── assets/
│       ├── icon-192.png
│       └── icon-512.png
└── src/
    ├── shared
    ├── main/
    │   └── index.ts
    └── renderer/
        ├── App.tsx
        ├── main.tsx
        ├── assets/
        │   └── blom-log.png
        ├── components/
        │   ├── builder/
        │   │   ├── EnhancedGroupAssignment.tsx
        │   │   ├── GroupCreator.tsx
        │   │   ├── ScheduleBuilder.tsx
        │   │   └── ScheduleConflictDetector.tsx
        │   ├── calendar/
        │   │   ├── ⭐ AttendanceSystem.tsx
        │   │   ├── CalendarSettings.tsx
        │   │   ├── CelebrationSystem.tsx
        │   │   ├── IndependentChoices.tsx
        │   │   └── WeatherWidget.tsx
        │   ├── common/
        │   │   ├── ActivityLibrary.tsx
        │   │   ├── AudioNotificationSystem.tsx
        │   │   ├── CelebrationAnimations.tsx
        │   │   ├── Navigation.tsx
        │   │   ├── SimpleActivityEditor.tsx
        │   │   └── StartScreen.tsx
        │   ├── data-collection/
        │   │   ├── EnhancedDataEntry.tsx
        │   │   ├── GoalManager.tsx
        │   │   ├── IEPDataCollectionInterface.tsx
        │   │   ├── index.ts
        │   │   ├── PrintDataSheetSystem.tsx
        │   │   ├── ProgressDashboard.tsx
        │   │   ├── ProgressPanel.tsx
        │   │   ├── QuickDataEntry.tsx
        │   │   └── ReportsExportSystem.tsx
        │   ├── display/
        │   │   ├── ⭐ AbsentStudentsDisplay.tsx
        │   │   ├── ⭐ OutOfClassDisplay.tsx
        │   │   ├── SmartboardDisplay.tsx
        │   │   └── TransitionDisplay.tsx
        │   ├── integration/
        │   │   └── CalendarIEPIntegration.tsx
        │   ├── intelligence/
        │   │   ├── enhanced-goal-intelligence-core.ts
        │   │   ├── enhanced-goal-intelligence-ui.tsx
        │   │   ├── enhanced-intelligence-integration.tsx
        │   │   └── index.ts
        │   ├── management/
        │   │   ├── ⭐ AttendanceManager.tsx
        │   │   ├── BehaviorStatementManager.tsx
        │   │   ├── ⭐ EnhancedResourceInput.tsx
        │   │   ├── Settings.tsx
        │   │   ├── StaffManagement.tsx
        │   │   ├── StudentCard.tsx
        │   │   ├── ⭐ StudentManagement.tsx
        │   │   └── ⭐ StudentModal.tsx
        │   ├── morning-meeting/
        │   │   ├── index.ts
        │   │   ├── MorningMeetingFlow.tsx
        │   │   ├── MorningMeetingHub.tsx
        │   │   ├── common/
        │   │   │   ├── MorningMeetingNavigation.tsx
        │   │   │   └── StepNavigation.tsx
        │   │   ├── steps/
        │   │   │   ├── ⭐ AttendanceStep.tsx
        │   │   │   ├── BehaviorStep.tsx
        │   │   │   ├── CalendarMathStep.tsx
        │   │   │   ├── CelebrationStep.tsx
        │   │   │   ├── ClassroomRulesStep.tsx
        │   │   │   ├── DayReviewStep.tsx
        │   │   │   ├── index.ts
        │   │   │   ├── SeasonalStep.tsx
        │   │   │   ├── WeatherStep.styles.ts
        │   │   │   ├── WeatherStep.tsx
        │   │   │   └── WelcomeStep.tsx
        │   │   └── types/
        │   │       └── morningMeetingTypes.ts
        │   ├── reports/
        │   │   ├── Reports.tsx
        │   │   ├── StandardsReport.styles.ts
        │   │   └── StandardsReport.tsx
        │   └── smart-groups/
        │       ├── enhanced-lesson-plan-download.tsx
        │       ├── real-claude-ai-integration.ts
        │       ├── SmartGroups.tsx
        │       ├── SmartGroupsDebugPanel.tsx
        │       ├── SmartGroupsEnhancedUI.tsx
        │       ├── SmartGroupsVerification.tsx
        │       ├── unified-smart-groups-integration.ts
        │       └── unified-smart-groups-integration.tsx
        ├── contexts/
        │   └── TimerContext.tsx
        ├── data/
        │   └── defaultTransitionActivities.ts
        ├── hooks/
        │   ├── useStaffData.ts
        │   └── useStudentData.ts
        ├── services/
        │   ├── dataPrivacyService.ts
        │   ├── ⭐ ResourceScheduleManager.tsx
        │   ├── smartGroupsService.ts
        │   └── ⭐ unifiedDataService.ts
        ├── styles/
        │   ├── index.css
        │   └── smart-groups-animations.css
        ├── types/
        │   └── index.ts
        └── utils/
            ├── activityGoalMapping.ts
            ├── celebrationManager.ts
            ├── choiceDataManager.ts
            ├── choiceUtils.ts
            ├── dataMigration.ts
            ├── ⭐ groupingHelpers.ts
            ├── photoManager.ts
            ├── schedulePersistence.ts
            ├── storage.ts
            ├── studentDataCleanup.ts
            ├── studentDataDiagnostic.ts
            └── weatherService.ts
```

---

## 🎯 Resource Pull-out Related Files

### Primary Components
| File | Purpose | Description |
|------|---------|-------------|
| ⭐ `src/renderer/components/display/OutOfClassDisplay.tsx` | **Out of Class Display** | Main component for displaying students who are currently out of class for resource services |
| ⭐ `src/renderer/components/management/EnhancedResourceInput.tsx` | **Resource Input** | Enhanced input component for managing student resource information and settings |
| ⭐ `src/renderer/services/ResourceScheduleManager.tsx` | **Resource Scheduling** | Service for managing resource pull-out schedules and timing |

### Supporting Components
| File | Purpose | Description |
|------|---------|-------------|
| ⭐ `src/renderer/components/management/StudentManagement.tsx` | **Student Management** | Contains resource information fields and management interface |
| ⭐ `src/renderer/components/management/StudentModal.tsx` | **Student Editing** | Modal for editing student information including resource settings |
| ⭐ `src/renderer/utils/groupingHelpers.ts` | **Grouping Logic** | Utility functions for grouping students by resource status |

---

## 👥 Absent Students Related Files

### Primary Components
| File | Purpose | Description |
|------|---------|-------------|
| ⭐ `src/renderer/components/display/AbsentStudentsDisplay.tsx` | **Absent Display** | Main component for displaying absent students |
| ⭐ `src/renderer/components/calendar/AttendanceSystem.tsx` | **Attendance System** | Comprehensive attendance tracking system |
| ⭐ `src/renderer/components/management/AttendanceManager.tsx` | **Attendance Management** | Interface for managing student attendance |

### Supporting Components
| File | Purpose | Description |
|------|---------|-------------|
| ⭐ `src/renderer/components/morning-meeting/steps/AttendanceStep.tsx` | **Morning Meeting Attendance** | Attendance step in the morning meeting flow |
| ⭐ `src/renderer/components/management/StudentManagement.tsx` | **Student Management** | Includes attendance tracking functionality |
| ⭐ `src/renderer/components/management/StudentModal.tsx` | **Student Editing** | Modal for editing student information including attendance settings |

---

## 🔧 Central Data Service

### Core Service
| File | Purpose | Key Methods |
|------|---------|-------------|
| ⭐ `src/renderer/services/unifiedDataService.ts` | **Unified Data Service** | Central data management service containing:<br/>• `getAllAttendance()`<br/>• `getAttendanceForDate()`<br/>• `getAbsentStudentsToday()`<br/>• `updateStudentAttendance()`<br/>• `filterActiveStudents()`<br/>• Resource information management |

---

## 🔄 Data Flow & Integration

### Attendance Data Flow
```
AttendanceStep.tsx → unifiedDataService.ts → AbsentStudentsDisplay.tsx
     ↓                        ↓                        ↓
AttendanceManager.tsx → AttendanceSystem.tsx → OutOfClassDisplay.tsx
```

### Resource Data Flow
```
StudentModal.tsx → EnhancedResourceInput.tsx → unifiedDataService.ts
     ↓                        ↓                        ↓
StudentManagement.tsx → ResourceScheduleManager.tsx → OutOfClassDisplay.tsx
```

---

## 📝 Key Features

### Attendance Features
- ✅ Daily attendance tracking
- ✅ Absent student identification
- ✅ Morning meeting attendance integration
- ✅ Historical attendance records
- ✅ Attendance-based student filtering

### Resource Pull-out Features
- ✅ Resource service scheduling
- ✅ Out-of-class student tracking
- ✅ Resource teacher assignments
- ✅ Service timeframe management
- ✅ Resource accommodation tracking

---

## 🚀 Usage Examples

### Getting Absent Students
```typescript
// Get today's absent students
const absentStudents = UnifiedDataService.getAbsentStudentsToday();

// Get absent students for specific date
const absentStudents = UnifiedDataService.getAbsentStudentsForDate('2025-08-27');
```

### Managing Resource Information
```typescript
// Update student resource information
UnifiedDataService.updateStudent(studentId, {
  resourceInformation: {
    attendsResourceServices: true,
    accommodations: ['Extended time', 'Small group'],
    relatedServices: ['Speech therapy'],
    resourceTeacher: 'Ms. Johnson'
  }
});
```

### Filtering Active Students
```typescript
// Filter out absent students from a list
const activeStudents = UnifiedDataService.filterActiveStudents(allStudents);
```

---

## 📊 File Statistics

- **Total Resource Pull-out Files**: 6 files
- **Total Absent Student Files**: 6 files  
- **Shared/Supporting Files**: 3 files
- **Central Data Service**: 1 file (handles both features)

---

*Generated on: August 27, 2025*  
*Project: Visual Schedule Builder*  
*Branch: version-two-progress*

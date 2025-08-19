# Visual Schedule Builder - Complete Directory Tree

**Generated:** January 19, 2025  
**Purpose:** Comprehensive project structure analysis with file status indicators

## Root Level
```
visual-schedule-builder/
├── 📄 .clinerules                                    # ✅ ACTIVE - Development rules
├── 📄 .eslintrc.js                                   # ✅ ACTIVE - ESLint configuration
├── 📄 .gitignore                                     # ✅ ACTIVE - Git ignore rules
├── 📄 index.html                                     # ✅ ACTIVE - Main HTML entry point
├── 📄 package.json                                   # ✅ ACTIVE - Project dependencies
├── 📄 package-lock.json                              # ✅ ACTIVE - Dependency lock file
├── 📄 tsconfig.json                                  # ✅ ACTIVE - TypeScript config
├── 📄 tsconfig.main.json                             # ✅ ACTIVE - Main process TS config
├── 📄 vite.config.ts                                 # ✅ ACTIVE - Vite build config
├── 📄 LICENSE                                        # ✅ ACTIVE - Project license
├── 📄 README.md                                      # ✅ ACTIVE - Project documentation
├── 📄 contributing.md                                # ✅ ACTIVE - Contribution guidelines
│
├── 📁 Documentation Files/
│   ├── 📄 ACTIVITY-LIBRARY-INTEGRATION-COMPLETE.md  # 📚 REFERENCE - Integration docs
│   ├── 📄 BUNDLE_ANALYSIS_REPORT.md                 # 📚 REFERENCE - Bundle analysis
│   ├── 📄 CONSOLIDATION_MASTER_PLAN.md              # 📚 REFERENCE - Consolidation plan
│   ├── 📄 EXECUTIVE_SUMMARY_FINDINGS.md             # 📚 REFERENCE - Executive summary
│   ├── 📄 INTEGRATION-TEST.md                       # 📚 REFERENCE - Integration tests
│   ├── 📄 PROJECT_AUDIT_REPORT.md                   # 📚 REFERENCE - Audit report
│   ├── 📄 PROJECT_STRUCTURE.md                      # 📚 REFERENCE - Structure docs
│   ├── 📄 SMART_GROUPS_VERIFICATION_RESULTS.md      # 📚 REFERENCE - Verification results
│   └── 📄 VISUAL_SCHEDULE_BUILDER_PROJECT_STRUCTURE.md # 📚 REFERENCE - Project structure
│
├── 📁 Build/Release Files/
│   ├── 📄 demo-choice-activities-script.js          # 🔧 UTILITY - Demo script
│   ├── 📄 tate before branch reorganization         # ❌ UNUSED - Temp file (DELETE)
│   ├── 📄 tatus                                     # ❌ UNUSED - Temp file (DELETE)
│   └── 📁 release/                                   # 🏗️ BUILD OUTPUT
│       ├── 📄 builder-debug.yml
│       ├── 📄 builder-effective-config.yaml
│       ├── 📄 latest.yml
│       ├── 📄 Visual Schedule Builder Setup 1.0.0.exe.blockmap
│       └── 📁 win-unpacked/ (Electron build output - 60+ files)
│
├── 📁 assests/ [sic]                                 # 🖼️ ASSETS
│   ├── 📄 icon.ico                                  # ✅ ACTIVE - App icon
│   ├── 📄 icon.incs.png                             # ✅ ACTIVE - Icon variant
│   ├── 📄 icon.png                                  # ✅ ACTIVE - Icon variant
│   └── 📄 installer.icon.png                        # ✅ ACTIVE - Installer icon
│
├── 📁 public/                                        # 🌐 PUBLIC ASSETS
│   ├── 📄 browserconfig.xml                         # ✅ ACTIVE - Browser config
│   ├── 📄 manifest.json                             # ✅ ACTIVE - PWA manifest
│   ├── 📄 sw.js                                     # ✅ ACTIVE - Service worker
│   └── 📁 assets/
│       ├── 📄 icon-192.png                          # ✅ ACTIVE - PWA icon
│       └── 📄 icon-512.png                          # ✅ ACTIVE - PWA icon
│
└── 📁 src/                                           # 💻 SOURCE CODE
    ├── 📄 shared                                     # ❓ UNKNOWN - Needs investigation
    ├── 📁 main/                                      # ⚡ ELECTRON MAIN PROCESS
    │   └── 📄 index.ts                               # ✅ ACTIVE - Main process entry
    │
    └── 📁 renderer/                                  # 🖥️ RENDERER PROCESS
        ├── 📄 App.tsx                                # ✅ ACTIVE - Main React app
        ├── 📄 main.tsx                               # ✅ ACTIVE - React entry point
        │
        ├── 📁 assets/                                # 🖼️ RENDERER ASSETS
        │   └── 📄 blom-log.png                       # ✅ ACTIVE - Logo image
        │
        ├── 📁 components/                            # 🧩 REACT COMPONENTS
        │   ├── 📁 builder/                           # 🏗️ SCHEDULE BUILDER
        │   │   ├── 📄 EnhancedGroupAssignment.tsx    # ✅ ACTIVE - Group assignment
        │   │   ├── 📄 GroupCreator.tsx               # ✅ ACTIVE - Group creation
        │   │   ├── 📄 ScheduleBuilder.tsx            # ✅ ACTIVE - Main builder
        │   │   └── 📄 ScheduleConflictDetector.tsx   # ✅ ACTIVE - Conflict detection
        │   │
        │   ├── 📁 calendar/                          # 📅 CALENDAR/MORNING MEETING
        │   │   ├── 📄 AreWeReady.tsx                 # ✅ ACTIVE - Readiness check
        │   │   ├── 📄 AttendanceSystem.tsx           # ✅ ACTIVE - Attendance tracking
        │   │   ├── 📄 BehaviorCommitments.tsx        # 🚨 BROKEN - Uses wrapper
        │   │   ├── 📄 CalendarMathStep.tsx           # 🚨 BROKEN - Uses wrapper
        │   │   ├── 📄 CalendarSettings.tsx           # ✅ ACTIVE - Calendar settings
        │   │   ├── 📄 CalendarWidget.tsx             # ✅ ACTIVE - Calendar widget
        │   │   ├── 📄 CelebrationSystem.tsx          # ✅ ACTIVE - Celebrations
        │   │   ├── 📄 DailyCheckIn.tsx               # ✅ ACTIVE - Main check-in
        │   │   ├── 📄 DailyCheckInStepWrapper.tsx    # ❌ PROBLEMATIC - Causes layout issues
        │   │   ├── 📄 DailyHighlights.tsx            # ✅ ACTIVE - Daily highlights
        │   │   ├── 📄 IndependentChoices.tsx         # ✅ ACTIVE - Choice activities
        │   │   ├── 📄 SeasonalLearningStep.tsx       # 🚨 BROKEN - Uses wrapper
        │   │   ├── 📄 ThreeDayView.tsx               # ✅ ACTIVE - 3-day calendar
        │   │   ├── 📄 WeatherClothingStep.tsx        # 🚨 BROKEN - Uses wrapper
        │   │   ├── 📄 WeatherWidget.tsx              # ✅ ACTIVE - Weather display
        │   │   └── 📄 WelcomeScreen.tsx              # ✅ ACTIVE - Welcome screen
        │   │
        │   ├── 📁 common/                            # 🔧 SHARED COMPONENTS
        │   │   ├── 📄 ActivityLibrary.tsx            # ✅ ACTIVE - Activity management
        │   │   ├── 📄 AudioNotificationSystem.tsx    # ✅ ACTIVE - Audio notifications
        │   │   ├── 📄 CelebrationAnimations.tsx      # ✅ ACTIVE - Celebration effects
        │   │   ├── 📄 Navigation.tsx                 # ✅ ACTIVE - App navigation
        │   │   ├── 📄 SimpleActivityEditor.tsx       # ✅ ACTIVE - Activity editor
        │   │   └── 📄 StartScreen.tsx                # ✅ ACTIVE - Start screen
        │   │
        │   ├── 📁 data-collection/                   # 📊 IEP DATA COLLECTION
        │   │   ├── 📄 EnhancedDataEntry.tsx          # ✅ ACTIVE - Data entry
        │   │   ├── 📄 GoalManager.tsx                # ✅ ACTIVE - Goal management
        │   │   ├── 📄 IEPDataCollectionInterface.tsx # ✅ ACTIVE - IEP interface
        │   │   ├── 📄 index.ts                       # ✅ ACTIVE - Module exports
        │   │   ├── 📄 PrintDataSheetSystem.tsx       # ✅ ACTIVE - Print system
        │   │   ├── 📄 ProgressDashboard.tsx          # ✅ ACTIVE - Progress tracking
        │   │   ├── 📄 ProgressPanel.tsx              # ✅ ACTIVE - Progress panel
        │   │   └── 📄 QuickDataEntry.tsx             # ✅ ACTIVE - Quick entry
        │   │
        │   ├── 📁 display/                           # 🖥️ SMARTBOARD DISPLAY
        │   │   ├── 📄 AbsentStudentsDisplay.tsx      # ✅ ACTIVE - Absent students
        │   │   ├── 📄 OutOfClassDisplay.tsx          # ✅ ACTIVE - Out of class
        │   │   ├── 📄 SmartboardDisplay.tsx          # ✅ ACTIVE - Main display
        │   │   └── 📄 TransitionDisplay.tsx          # ✅ ACTIVE - Transitions
        │   │
        │   ├── 📁 integration/                       # 🔗 INTEGRATIONS
        │   │   └── 📄 CalendarIEPIntegration.tsx     # ✅ ACTIVE - Calendar/IEP integration
        │   │
        │   ├── 📁 intelligence/                      # 🧠 AI/INTELLIGENCE
        │   │   ├── 📄 enhanced-goal-intelligence-core.ts      # ✅ ACTIVE - AI core
        │   │   ├── 📄 enhanced-goal-intelligence-ui.tsx       # ✅ ACTIVE - AI UI
        │   │   ├── 📄 enhanced-intelligence-integration.tsx   # ✅ ACTIVE - AI integration
        │   │   └── 📄 index.ts                                # ✅ ACTIVE - Module exports
        │   │
        │   ├── 📁 management/                        # ⚙️ MANAGEMENT
        │   │   ├── 📄 AttendanceManager.tsx          # ✅ ACTIVE - Attendance management
        │   │   ├── 📄 BehaviorStatementManager.tsx   # ✅ ACTIVE - Behavior statements
        │   │   ├── 📄 EnhancedResourceInput.tsx      # ✅ ACTIVE - Resource input
        │   │   ├── 📄 Settings.tsx                   # ✅ ACTIVE - App settings
        │   │   ├── 📄 StaffManagement.tsx            # ✅ ACTIVE - Staff management
        │   │   └── 📄 StudentManagement.tsx          # ✅ ACTIVE - Student management
        │   │
        │   ├── 📁 reports/                           # 📈 REPORTING
        │   │   └── 📄 Reports.tsx                    # ✅ ACTIVE - Reports interface
        │   │
        │   └── 📁 smart-groups/                      # 👥 SMART GROUPS
        │       ├── 📄 enhanced-lesson-plan-download.tsx      # ✅ ACTIVE - Lesson downloads
        │       ├── 📄 real-claude-ai-integration.ts          # ✅ ACTIVE - Claude AI
        │       ├── 📄 SmartGroups.tsx                         # ✅ ACTIVE - Main smart groups
        │       ├── 📄 SmartGroupsDebugPanel.tsx               # 🔧 DEBUG - Debug panel
        │       ├── 📄 SmartGroupsEnhancedUI.tsx               # ✅ ACTIVE - Enhanced UI
        │       ├── 📄 SmartGroupsVerification.tsx             # 🔧 DEBUG - Verification
        │       ├── 📄 unified-smart-groups-integration.ts     # ✅ ACTIVE - Integration (TS)
        │       └── 📄 unified-smart-groups-integration.tsx    # ✅ ACTIVE - Integration (TSX)
        │
        ├── 📁 contexts/                              # ⚛️ REACT CONTEXTS
        │   └── 📄 TimerContext.tsx                   # ✅ ACTIVE - Timer context
        │
        ├── 📁 data/                                  # 📊 DATA FILES
        │   └── 📄 defaultTransitionActivities.ts     # ✅ ACTIVE - Default transitions
        │
        ├── 📁 hooks/                                 # 🎣 REACT HOOKS
        │   ├── 📄 useRobustDataLoading.ts            # ✅ ACTIVE - Data loading
        │   ├── 📄 useStaffData.ts                    # ✅ ACTIVE - Staff data hook
        │   └── 📄 useStudentData.ts                  # ✅ ACTIVE - Student data hook
        │
        ├── 📁 services/                              # 🔧 SERVICES
        │   ├── 📄 dataPrivacyService.ts              # ✅ ACTIVE - Privacy service
        │   ├── 📄 ResourceScheduleManager.tsx        # ✅ ACTIVE - Resource scheduling
        │   ├── 📄 smartGroupsService.ts              # ✅ ACTIVE - Smart groups
        │   └── 📄 unifiedDataService.ts              # ✅ ACTIVE - Unified data
        │
        ├── 📁 styles/                                # 🎨 STYLES
        │   ├── 📄 index.css                          # ✅ ACTIVE - Main styles
        │   └── 📄 smart-groups-animations.css        # ✅ ACTIVE - Animation styles
        │
        ├── 📁 types/                                 # 📝 TYPE DEFINITIONS
        │   └── 📄 index.ts                           # ✅ ACTIVE - Type definitions
        │
        └── 📁 utils/                                 # 🛠️ UTILITIES
            ├── 📄 activityGoalMapping.ts             # ✅ ACTIVE - Goal mapping
            ├── 📄 celebrationManager.ts              # ✅ ACTIVE - Celebration logic
            ├── 📄 choiceDataManager.ts               # ✅ ACTIVE - Choice data
            ├── 📄 choiceUtils.ts                     # ✅ ACTIVE - Choice utilities
            ├── 📄 dataMigration.ts                   # ✅ ACTIVE - Data migration
            ├── 📄 groupingHelpers.ts                 # ✅ ACTIVE - Grouping helpers
            ├── 📄 photoManager.ts                    # ✅ ACTIVE - Photo management
            ├── 📄 schedulePersistence.ts             # ✅ ACTIVE - Schedule storage
            ├── 📄 storage.ts                         # ✅ ACTIVE - Storage utilities
            ├── 📄 studentDataCleanup.ts              # ✅ ACTIVE - Data cleanup
            ├── 📄 studentDataDiagnostic.ts           # ✅ ACTIVE - Data diagnostics
            └── 📄 weatherService.ts                  # ✅ ACTIVE - Weather service
```

## Summary Statistics
- **Total Files**: ~150+ files
- **Active Components**: 85+ files
- **Broken Components**: 4 files (due to DailyCheckInStepWrapper)
- **Problematic Files**: 1 file (DailyCheckInStepWrapper.tsx)
- **Unused/Temp Files**: 2 files (tate, tatus)
- **Debug/Development**: 2 files (debug panels)

## Legend
- ✅ **ACTIVE** - Currently used and functional
- 🚨 **BROKEN** - Currently broken due to DailyCheckInStepWrapper
- ❌ **UNUSED/PROBLEMATIC** - Not used or causing issues
- 📚 **REFERENCE** - Documentation/reference files
- 🏗️ **BUILD OUTPUT** - Generated build files
- 🔧 **DEBUG/UTILITY** - Debug tools or utilities
- ❓ **UNKNOWN** - Needs investigation

## Critical Issues Identified

### 1. Layout Problems (URGENT)
**Root Cause:** `DailyCheckInStepWrapper.tsx`
- Creates huge header blocks
- Adds unnecessary footer bars
- Reintroduces scrolling issues
- Uses fixed positioning that conflicts with existing layout

**Affected Components:**
- `BehaviorCommitments.tsx` - 🚨 BROKEN
- `CalendarMathStep.tsx` - 🚨 BROKEN  
- `WeatherClothingStep.tsx` - 🚨 BROKEN
- `SeasonalLearningStep.tsx` - 🚨 BROKEN

### 2. Functional Issues
- Calendar Math progression (month → week → day) no longer works
- "Start Schedule" button missing from final morning meeting step
- Video integration incomplete

### 3. Cleanup Needed
**Files to Delete:**
- `tate before branch reorganization` - Temp file
- `tatus` - Temp file

### 4. SmartboardDisplay Pattern
**Correct Layout Approach:**
- Uses `height: '100vh', width: '100vw', overflow: 'hidden'`
- Dynamic flex layout with calculated heights
- No scrolling - everything fits within viewport
- Uses `clamp()` functions for responsive sizing
- Clean structure: fixed header, dynamic content, fixed controls

## Recommended Actions

### Immediate (High Priority)
1. **Remove DailyCheckInStepWrapper** from all 4 broken components
2. **Restore original layout structure** following SmartboardDisplay pattern
3. **Fix Calendar Math progression** functionality
4. **Restore proper navigation flow**

### Short Term (Medium Priority)
1. **Add simple video buttons** at top of components (original request)
2. **Delete temp files** (tate, tatus)
3. **Test all morning meeting components**

### Long Term (Low Priority)
1. **Investigate `src/shared` file**
2. **Review debug components** for potential removal
3. **Optimize build output** if needed

## Notes
- This is a comprehensive, well-structured project with extensive functionality
- The main issue is the problematic wrapper component breaking the layout system
- Original video integration request was much simpler than implemented solution
- SmartboardDisplay.tsx shows the correct layout pattern to follow

---
**File Generated:** January 19, 2025  
**Last Updated:** Morning Meeting Layout Crisis Resolution  
**Status:** Analysis Complete - Ready for Implementation

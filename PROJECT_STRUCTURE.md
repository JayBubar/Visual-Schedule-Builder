# Visual Schedule Builder - Project Structure Guide

This document explains how to set up the complete project structure for the Visual Schedule Builder application.

## 📁 Complete Directory Structure

After setting up the repository with the provided files, create the following directory structure:

```
visual-schedule-builder/
├── .github/                          # GitHub configuration
│   ├── workflows/                    # GitHub Actions CI/CD
│   │   ├── build.yml                # Build and test workflow
│   │   ├── release.yml              # Release workflow
│   │   └── codeql.yml               # Security analysis
│   ├── ISSUE_TEMPLATE/               # Issue templates
│   │   ├── bug_report.md            # Bug report template
│   │   ├── feature_request.md       # Feature request template
│   │   └── educator_feedback.md     # Educator feedback template
│   └── pull_request_template.md     # PR template
├── assets/                           # Application assets
│   ├── icons/                       # Activity icons library
│   │   ├── academic/                # Academic activity icons
│   │   ├── specials/                # Special activities (PE, Art, Music)
│   │   ├── transitions/             # Transition activity icons
│   │   ├── breaks/                  # Break and free time icons
│   │   └── social/                  # Social activity icons
│   ├── images/                      # Application images
│   │   ├── logo.png                 # App logo
│   │   ├── icon.png                 # App icon
│   │   └── screenshots/             # Screenshots for README
│   └── sounds/                      # Audio files for transitions
├── docs/                            # Documentation
│   ├── installation.md             # Installation guide
│   ├── user-guide.md               # User manual
│   ├── development.md              # Developer setup guide
│   ├── accessibility.md            # Accessibility guidelines
│   ├── api.md                      # API documentation
│   ├── testing.md                 # Testing guide
│   ├── architecture.md            # Technical architecture
│   └── contributing-dev.md        # Developer contribution guide
├── src/                            # Source code
│   ├── main/                       # Electron main process
│   │   ├── index.ts ✅             # Main entry point (created)
│   │   ├── preload.ts              # Preload script for secure IPC
│   │   ├── menu.ts                 # Application menu setup
│   │   ├── ipc.ts                  # IPC handlers
│   │   └── store.ts                # Data persistence logic
│   ├── renderer/                   # React frontend
│   │   ├── main.tsx ✅             # React entry point (created)
│   │   ├── App.tsx ✅              # Main app component (created)
│   │   ├── components/             # React components
│   │   │   ├── builder/            # Schedule creation interface
│   │   │   │   ├── ScheduleBuilder.tsx
│   │   │   │   ├── ScheduleCanvas.tsx
│   │   │   │   ├── ActivityLibrary.tsx
│   │   │   │   ├── TimeSlotManager.tsx
│   │   │   │   ├── TemplateSelector.tsx
│   │   │   │   └── DragDropComponents.tsx
│   │   │   ├── display/            # Smartboard presentation mode
│   │   │   │   ├── SmartboardDisplay.tsx
│   │   │   │   ├── ActivityCard.tsx
│   │   │   │   ├── ProgressTracker.tsx
│   │   │   │   ├── TransitionTimer.tsx
│   │   │   │   └── TouchInterface.tsx
│   │   │   ├── management/         # Settings and student profiles
│   │   │   │   ├── StudentManagement.tsx
│   │   │   │   ├── StudentProfile.tsx
│   │   │   │   ├── Settings.tsx
│   │   │   │   ├── ScheduleList.tsx
│   │   │   │   └── DataExport.tsx
│   │   │   └── common/             # Shared components
│   │   │       ├── Navigation.tsx
│   │   │       ├── ActivityLibrary.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── FormElements.tsx
│   │   │       └── LoadingSpinner.tsx
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useSchedule.ts      # Schedule management
│   │   │   ├── useElectronAPI.ts   # Electron integration
│   │   │   ├── useActivityLibrary.ts # Activity management
│   │   │   ├── useKeyboardShortcuts.ts # Keyboard handling
│   │   │   └── useAccessibility.ts # A11y helpers
│   │   ├── utils/                  # Utility functions
│   │   │   ├── schedule.ts         # Schedule operations
│   │   │   ├── storage.ts          # Data persistence
│   │   │   ├── export.ts           # Export functionality
│   │   │   ├── accessibility.ts    # A11y utilities
│   │   │   └── validation.ts       # Input validation
│   │   ├── types/                  # TypeScript type definitions
│   │   │   ├── schedule.ts         # Schedule-related types
│   │   │   ├── student.ts          # Student profile types
│   │   │   ├── activity.ts         # Activity types
│   │   │   ├── electron.ts         # Electron API types
│   │   │   └── index.ts            # Exported types
│   │   ├── styles/                 # CSS and styling
│   │   │   ├── index.css           # Global styles
│   │   │   ├── components/         # Component-specific styles
│   │   │   ├── themes/             # Theme variations
│   │   │   └── accessibility.css   # Accessibility overrides
│   │   └── assets/                 # Frontend assets
│   │       ├── images/             # UI images
│   │       └── fonts/              # Custom fonts
│   └── shared/                     # Shared types and utilities
│       ├── types/                  # Types used by both main and renderer
│       ├── constants.ts            # Shared constants
│       └── utils.ts                # Shared utility functions
├── tests/                          # Test files
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   ├── e2e/                        # End-to-end tests
│   ├── accessibility/              # Accessibility tests
│   └── fixtures/                   # Test data and fixtures
├── build/                          # Build configuration
│   ├── webpack/                    # Webpack configs (if needed)
│   ├── electron/                   # Electron build configs
│   └── scripts/                    # Build scripts
├── release/                        # Build output (auto-generated)
├── [Root files] ✅                # All configuration files (created)
│   ├── README.md ✅
│   ├── package.json ✅
│   ├── CONTRIBUTING.md ✅
│   ├── LICENSE ✅
│   ├── .gitignore ✅
│   ├── vite.config.ts ✅
│   ├── tsconfig.json ✅
│   ├── tsconfig.main.json ✅
│   ├── index.html ✅
│   ├── eslint.config.js
│   ├── prettier.config.js
│   ├── jest.config.js
│   └── playwright.config.ts
└── .vscode/                        # VS Code configuration
    ├── settings.json               # Editor settings
    ├── extensions.json             # Recommended extensions
    └── launch.json                 # Debug configuration
```

## 🚀 Setup Instructions

### Step 1: Create Base Directory Structure

After cloning the repository and adding all the provided files, create the directory structure:

```bash
# Navigate to your project
cd visual-schedule-builder

# Create main directories
mkdir -p src/renderer/components/{builder,display,management,common}
mkdir -p src/renderer/{hooks,utils,types,styles,assets}
mkdir -p src/shared/{types}
mkdir -p assets/{icons/{academic,specials,transitions,breaks,social},images,sounds}
mkdir -p docs tests/{unit,integration,e2e,accessibility,fixtures}
mkdir -p .github/{workflows,ISSUE_TEMPLATE}
mkdir -p build/{scripts}
mkdir -p .vscode
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm run typecheck
```

### Step 3: Create Essential CSS File

Create `src/renderer/styles/index.css`:

```css
/* Essential styles for the application */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow: auto;
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* Keyboard shortcuts hints */
.keyboard-hints {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  gap: 10px;
}

.keyboard-hint {
  opacity: 0.7;
}

/* Placeholder for component development */
.component-placeholder {
  padding: 40px;
  text-align: center;
  border: 2px dashed #ccc;
  margin: 20px;
  border-radius: 8px;
}
```

### Step 4: Create Placeholder Components

Create basic placeholder components to get the app running:

1. **src/renderer/components/common/Navigation.tsx**
2. **src/renderer/components/builder/ScheduleBuilder.tsx**
3. **src/renderer/components/display/SmartboardDisplay.tsx**
4. **src/renderer/components/management/StudentManagement.tsx**
5. **src/renderer/components/management/Settings.tsx**
6. **src/renderer/components/common/ActivityLibrary.tsx**

### Step 5: Test the Setup

```bash
# Start development server
npm run dev

# In another terminal, run tests
npm test

# Check TypeScript
npm run typecheck

# Check linting
npm run lint
```

## 📝 Next Development Steps

Once the structure is created:

1. **Create placeholder components** to get the app running
2. **Set up basic routing** between views
3. **Implement drag-and-drop** for schedule building
4. **Add icon library** with initial activity icons
5. **Create smartboard display** components
6. **Add data persistence** for schedules

## 🔧 Development Workflow

1. **Feature branches**: `git checkout -b feature/component-name`
2. **Component development**: Start with placeholder, add functionality
3. **Testing**: Add tests as you build components
4. **Accessibility**: Test with keyboard navigation and screen readers
5. **Pull requests**: Use the PR template for reviews

## 📚 Documentation

Each major component should include:
- JSDoc comments for complex functions
- README in component folders for complex features
- Accessibility notes for interactive elements
- Testing instructions for manual verification

---

**Ready to start development!** Begin with creating the placeholder components to get the application running, then gradually implement the core features according to the roadmap.

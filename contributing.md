# Contributing to Visual Schedule Builder

Thank you for your interest in contributing to Visual Schedule Builder! This project exists to help educators create better learning experiences for students with diverse needs. Every contribution, no matter how small, makes a difference.

## 🌟 Ways to Contribute

### 🎓 For Educators
Your expertise is invaluable! Even if you're not a developer, you can contribute significantly:

- **Feature Requests**: Share what would make your classroom life easier
- **User Testing**: Try new features and report what works/doesn't work
- **Icon Suggestions**: Suggest activities or icons missing from our library
- **Workflow Feedback**: Tell us how you'd use the app in your daily routine
- **Accessibility Insights**: Share what accommodations your students need
- **Documentation**: Help us write user guides that actually make sense

### 💻 For Developers
Help us build robust, accessible software:

- **Bug Fixes**: Fix issues reported by educators and users
- **Feature Development**: Implement new functionality from our roadmap
- **Performance Optimization**: Help the app run smoothly on older classroom computers
- **Cross-Platform Support**: Ensure compatibility across Windows, macOS, and Linux
- **Testing**: Write tests to prevent regressions
- **Code Review**: Help maintain code quality

### 🎨 For Designers
Make the app beautiful and accessible:

- **UI/UX Improvements**: Enhance user experience for teachers and students
- **Icon Creation**: Design clear, recognizable activity icons
- **Accessibility Design**: Ensure high contrast and readable layouts
- **Smartboard Optimization**: Design for large touch interfaces
- **Visual Design**: Create engaging, student-friendly interfaces

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setting Up Your Development Environment

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/yourusername/visual-schedule-builder.git
cd visual-schedule-builder

# 3. Add upstream remote
git remote add upstream https://github.com/JayBubar/visual-schedule-builder.git

# 4. Install dependencies
npm install

# 5. Start development server
npm run dev

# 6. Create a feature branch
git checkout -b feature/your-feature-name
```

### Project Structure
```
src/
├── main/           # Electron main process
├── renderer/       # React frontend
│   ├── components/ # React components
│   ├── hooks/      # Custom React hooks
│   ├── utils/      # Utility functions
│   ├── types/      # TypeScript type definitions
│   └── styles/     # CSS and styling
├── shared/         # Shared utilities
tests/              # Test files
docs/               # Documentation
assets/             # Static assets (icons, images)
```

## 📝 Contribution Guidelines

### Code Style
- Use TypeScript for new code
- Follow existing code formatting (we use ESLint + Prettier)
- Write descriptive commit messages
- Include JSDoc comments for public functions
- Use semantic HTML for accessibility

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(builder): add drag-and-drop reordering`
- `fix(display): resolve touch interaction on smartboards`
- `docs(readme): update installation instructions`
- `accessibility(display): improve screen reader support`

### Pull Request Process

1. **Create an Issue First** (for significant changes)
   - Describe the problem or feature
   - Get feedback before implementing

2. **Write Good PR Descriptions**
   - Explain what changes and why
   - Include screenshots for UI changes
   - List any breaking changes
   - Reference related issues

3. **Ensure Quality**
   - All tests pass (`npm test`)
   - Code passes linting (`npm run lint`)
   - TypeScript compiles without errors (`npm run type-check`)

4. **Get Review**
   - Respond to feedback constructively
   - Make requested changes
   - Keep the PR focused and small when possible

### Testing
- Write tests for new features
- Update tests for modified functionality
- Test on multiple platforms when possible
- Include accessibility testing

## 🐛 Reporting Bugs

### Before Submitting
- Check existing issues to avoid duplicates
- Test with the latest version
- Gather reproduction steps

### Bug Report Template
```markdown
**Describe the Bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 10, macOS 12]
- App Version: [e.g. 0.1.0]
- Hardware: [e.g. Surface Pro, MacBook Air]
```

## 💡 Suggesting Features

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other context, mockups, or examples.

**Educational Impact**
How would this help students or teachers?
```

## 🏫 Educational Context

### Understanding Our Users
- **Teachers** often work with limited time and older technology
- **Students** may have diverse cognitive, physical, or sensory needs
- **Classrooms** use various smartboard brands and sizes
- **Schedules** change frequently due to assemblies, weather, etc.

### Accessibility Priorities
- High contrast for vision impairments
- Large touch targets for motor difficulties
- Screen reader compatibility
- Simple, predictable navigation
- Support for switch devices
- Customizable visual density

### Performance Considerations
- App should work on 5+ year old classroom computers
- Fast startup time for busy mornings
- Offline functionality (no internet dependency)
- Low memory usage
- Quick save/load for schedule changes

## 🎯 Development Priorities

### Phase 1: MVP (Current)
- Basic schedule builder with drag-and-drop
- Core activity library
- Simple smartboard display
- Save/load functionality

### Phase 2: Enhancement
- Touch interaction improvements
- Progress tracking
- Visual transition timers
- Student profiles

### Phase 3: Advanced Features
- Custom assets
- Advanced templates
- Data export
- Accessibility improvements

## 🏆 Recognition

### Contributor Recognition
- Contributors listed in README
- Social media shoutouts for major contributions
- Conference presentation credits
- LinkedIn recommendations for significant contributors

### Types of Contributions We Celebrate
- Code contributions
- Bug reports that improve the app
- Documentation improvements
- User testing and feedback
- Community building
- Accessibility improvements

## 📞 Getting Help

### Where to Ask Questions
- **GitHub Discussions**: General questions and ideas
- **Issues**: Specific bugs or feature requests
- **Discord**: Real-time chat with contributors *(coming soon)*

### Mentorship
New to open source? We're here to help!
- Tag issues with `good-first-issue` for beginners
- Maintainers provide guidance on complex features
- Pair programming sessions available for major features

## 📋 Code of Conduct

### Our Pledge
We're committed to creating a welcoming, inclusive environment for educators, developers, and anyone passionate about accessible education technology.

### Expected Behavior
- Be respectful and inclusive
- Focus on what's best for students and educators
- Provide constructive feedback
- Show empathy for diverse perspectives
- Support newcomers to the project

### Unacceptable Behavior
- Harassment or discrimination of any kind
- Inappropriate comments about disabilities or special needs
- Sharing private information without permission
- Disruptive behavior in discussions

## 🙏 Thank You

Your contributions help create better learning experiences for students who need them most. Whether you're fixing a bug, adding a feature, or sharing feedback, you're making classrooms more inclusive and effective.

**Questions?** Open a discussion or reach out to the maintainers. We're excited to work with you!

---

*Remember: The best code is code that helps students learn and grow. Let's build something amazing together!*

// 🎯 DEFAULT TRANSITION ACTIVITIES
// File: src/renderer/data/defaultTransitionActivities.ts

import { ActivityLibraryItem, ScheduleCategory } from '../types';

export const defaultTransitionActivities: ActivityLibraryItem[] = [
  {
    id: 'transition-animated-countdown',
    name: 'Transition Time',
    emoji: '🔄',
    icon: '🔄',
    category: 'transition' as ScheduleCategory,
    defaultDuration: 5,
    description: 'Fun transition time with countdown and animations',
    isCustom: false,
    tags: ['transition', 'movement', 'countdown'],
    materials: [],
    instructions: 'Time to get ready for the next activity!',
    ageGroup: 'all',
    difficulty: 'easy',
    // Transition-specific properties
    isTransition: true,
    transitionType: 'animated-countdown',
    animationStyle: 'running-kids',
    showNextActivity: true,
    movementPrompts: [
      'Stretch your arms up high! 🙌',
      'Take 3 deep breaths 🌬️',
      'Wiggle your fingers! ✋',
      'March in place! 🚶‍♀️',
      'Touch your toes! 👇'
    ],
    autoStart: false,
    soundEnabled: true,
    customMessage: 'Let\'s get ready for our next activity!'
  },
  {
    id: 'transition-brain-break',
    name: 'Brain Break',
    emoji: '🧠',
    icon: '🧠',
    category: 'transition' as ScheduleCategory,
    defaultDuration: 3,
    description: 'Quick brain break with movement prompts',
    isCustom: false,
    tags: ['brain-break', 'movement', 'energy'],
    materials: [],
    instructions: 'Quick movement to reset and refocus!',
    ageGroup: 'all',
    difficulty: 'easy',
    isTransition: true,
    transitionType: 'brain-break',
    animationStyle: 'bouncing-balls',
    showNextActivity: false,
    movementPrompts: [
      'Jump 5 times! 🦘',
      'Spin around slowly! 🌀',
      'Clap your hands! 👏',
      'Stomp your feet! 👠',
      'Give yourself a hug! 🤗'
    ],
    autoStart: false,
    soundEnabled: true,
    customMessage: 'Time for a quick brain break!'
  },
  {
    id: 'transition-cleanup-prep',
    name: 'Cleanup & Prep',
    emoji: '🧹',
    icon: '🧹',
    category: 'transition' as ScheduleCategory,
    defaultDuration: 7,
    description: 'Time to clean up and prepare for next activity',
    isCustom: false,
    tags: ['cleanup', 'preparation', 'organization'],
    materials: [],
    instructions: 'Clean up current activity and get ready for what\'s next!',
    ageGroup: 'all',
    difficulty: 'easy',
    isTransition: true,
    transitionType: 'cleanup-prep',
    animationStyle: 'organizing-items',
    showNextActivity: true,
    movementPrompts: [
      'Put materials away neatly 📚',
      'Push in your chair 💺',
      'Check your workspace ✨',
      'Get materials for next activity 📝',
      'Take your position! 🎯'
    ],
    autoStart: false,
    soundEnabled: true,
    customMessage: 'Time to clean up and get ready!'
  },
  {
    id: 'transition-movement-break',
    name: 'Movement Break',
    emoji: '💃',
    icon: '💃',
    category: 'transition' as ScheduleCategory,
    defaultDuration: 4,
    description: 'Fun movement break with dancing and stretching',
    isCustom: false,
    tags: ['movement', 'dance', 'energy', 'stretching'],
    materials: [],
    instructions: 'Time to move our bodies and have fun!',
    ageGroup: 'all',
    difficulty: 'easy',
    isTransition: true,
    transitionType: 'movement-break',
    animationStyle: 'dancing-emojis',
    showNextActivity: true,
    movementPrompts: [
      'Dance like a robot! 🤖',
      'Stretch like a cat! 🐱',
      'Hop like a bunny! 🐰',
      'Flap your wings like a bird! 🦅',
      'Freeze like a statue! 🗿'
    ],
    autoStart: false,
    soundEnabled: true,
    customMessage: 'Let\'s move and groove!'
  },
  {
    id: 'transition-floating-shapes',
    name: 'Calm Transition',
    emoji: '🔵',
    icon: '🔵',
    category: 'transition' as ScheduleCategory,
    defaultDuration: 3,
    description: 'Gentle transition with floating shapes and calm prompts',
    isCustom: false,
    tags: ['calm', 'gentle', 'peaceful', 'mindfulness'],
    materials: [],
    instructions: 'Take a moment to breathe and prepare peacefully.',
    ageGroup: 'all',
    difficulty: 'easy',
    isTransition: true,
    transitionType: 'animated-countdown',
    animationStyle: 'floating-shapes',
    showNextActivity: true,
    movementPrompts: [
      'Take a deep breath in... and out 🌬️',
      'Close your eyes and count to 3 👁️',
      'Gently roll your shoulders 🔄',
      'Sit up tall and proud 🏛️',
      'Smile and feel ready! 😊'
    ],
    autoStart: false,
    soundEnabled: false,
    customMessage: 'Let\'s transition peacefully together.'
  }
];

// Helper function to add transitions to existing activity library
export const addTransitionsToLibrary = (existingLibrary: ActivityLibraryItem[]): ActivityLibraryItem[] => {
  // Filter out any existing transition activities to avoid duplicates
  const nonTransitionActivities = existingLibrary.filter(activity => !activity.isTransition);
  
  // Add our default transition activities
  return [...nonTransitionActivities, ...defaultTransitionActivities];
};

// Utility function to create a custom transition activity
export const createCustomTransition = (
  name: string,
  duration: number = 5,
  transitionType: 'animated-countdown' | 'brain-break' | 'cleanup-prep' | 'movement-break' = 'animated-countdown',
  animationStyle: 'running-kids' | 'floating-shapes' | 'bouncing-balls' | 'organizing-items' | 'dancing-emojis' = 'running-kids',
  customMessage?: string,
  movementPrompts?: string[]
): ActivityLibraryItem => {
  return {
    id: `transition-custom-${Date.now()}`,
    name,
    emoji: getTransitionEmoji(transitionType),
    icon: getTransitionEmoji(transitionType),
    category: 'transition' as ScheduleCategory,
    defaultDuration: duration,
    description: `Custom transition: ${name}`,
    isCustom: true,
    tags: ['transition', 'custom', transitionType],
    materials: [],
    instructions: customMessage || 'Custom transition activity',
    ageGroup: 'all',
    difficulty: 'easy',
    isTransition: true,
    transitionType,
    animationStyle,
    showNextActivity: true,
    movementPrompts: movementPrompts || getDefaultPrompts(transitionType),
    autoStart: false,
    soundEnabled: true,
    customMessage
  };
};

// Helper function to get appropriate emoji for transition type
const getTransitionEmoji = (transitionType: string): string => {
  switch (transitionType) {
    case 'brain-break': return '🧠';
    case 'cleanup-prep': return '🧹';
    case 'movement-break': return '💃';
    default: return '🔄';
  }
};

// Helper function to get default prompts for transition type
const getDefaultPrompts = (transitionType: string): string[] => {
  switch (transitionType) {
    case 'brain-break':
      return [
        'Jump 5 times! 🦘',
        'Spin around slowly! 🌀',
        'Clap your hands! 👏',
        'Wiggle your whole body! 🤸‍♀️'
      ];
    case 'cleanup-prep':
      return [
        'Put materials away 📚',
        'Push in your chair 💺',
        'Check your workspace ✨',
        'Get ready for next activity! 🎯'
      ];
    case 'movement-break':
      return [
        'Dance like a robot! 🤖',
        'Stretch like a cat! 🐱',
        'Hop like a bunny! 🐰',
        'Freeze like a statue! 🗿'
      ];
    default:
      return [
        'Take a deep breath 🌬️',
        'Stretch your arms up! 🙌',
        'Get ready to focus! 🎯',
        'You\'re doing great! ⭐'
      ];
  }
};

export default defaultTransitionActivities;
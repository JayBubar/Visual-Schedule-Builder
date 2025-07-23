import { GroupingType, EnhancedActivity } from '../types';

export function getGroupingIcon(groupingType: GroupingType): string {
  switch (groupingType) {
    case 'whole-class': return '👥';
    case 'small-groups': return '🔵🟢🟠';
    case 'individual': return '🧍';
    case 'flexible': return '🔄';
    default: return '👥';
  }
}

export function getGroupingBadge(activity: EnhancedActivity): string {
  if (activity.groupingType === 'small-groups' && activity.groupAssignments.length > 0) {
    return `${activity.groupAssignments.length} Groups`;
  }
  return activity.groupingType.replace('-', ' ').toUpperCase();
}

export function getGroupingDescription(groupingType: GroupingType): string {
  switch (groupingType) {
    case 'whole-class': return 'All students together with one instructor';
    case 'small-groups': return 'Students divided into small groups with assigned staff';
    case 'individual': return 'Students working independently or one-on-one';
    case 'flexible': return 'Grouping can be adjusted during the activity';
    default: return 'Standard classroom grouping';
  }
}

export const GROUP_COLORS = [
  { value: 'blue', label: 'Blue Team', hex: '#3498db' },
  { value: 'green', label: 'Green Team', hex: '#2ecc71' },
  { value: 'orange', label: 'Orange Team', hex: '#f39c12' },
  { value: 'purple', label: 'Purple Team', hex: '#9b59b6' },
  { value: 'red', label: 'Red Team', hex: '#e74c3c' },
  { value: 'yellow', label: 'Yellow Team', hex: '#f1c40f' }
];
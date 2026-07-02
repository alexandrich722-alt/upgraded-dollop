// NOVA Life OS — Shared Constants
// Single source of truth for storage keys, entity names, routes, limits

export const STORAGE_KEY = 'nova-life-os-state-v2';
export const ONBOARDED_KEY = 'nova-life-os-onboarded';
export const STATE_VERSION = 2;

export const LIMITS = {
  AI_MESSAGES: 100,
  REFLECTIONS: 500,
  TRANSACTIONS: 1000,
  MAX_TASKS: 2000,
  SAVE_DEBOUNCE_MS: 500,
} as const;

export const NAV_GROUPS = {
  main: 'Main',
  manage: 'Manage',
  growth: 'Growth',
  system: 'System',
} as const;

export const ENTITY_NAMES = {
  tasks: 'tasks',
  goals: 'goals',
  projects: 'projects',
  habits: 'habits',
  reflections: 'reflections',
  dailyNotes: 'dailyNotes',
  contacts: 'contacts',
  skills: 'skills',
  quests: 'quests',
  bosses: 'bosses',
  mentors: 'mentors',
  mentorMessages: 'mentorMessages',
  protocols: 'protocols',
  marketplaceInstalls: 'marketplaceInstalls',
  aiMessages: 'aiMessages',
} as const;

export const PRIORITY_ORDER: Record<string, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
} as const;

export const STATUS_FLOW: Record<string, string> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
} as const;

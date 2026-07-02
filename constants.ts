// NOVA Life OS — Constants

export const STORAGE_KEY = 'nova-life-os-state-v3';
export const ONBOARDED_KEY = 'nova-life-os-onboarded';

export const LIMITS = {
  SAVE_DEBOUNCE_MS: 500,
  MAX_TASKS: 500,
  MAX_GOALS: 50,
  MAX_HABITS: 30,
  MAX_REFLECTIONS: 365,
};

export const STATUS_FLOW = {
  todo: ['in_progress', 'done'],
  in_progress: ['todo', 'done'],
  done: ['todo'],
};

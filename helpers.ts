// NOVA Life OS — Achievement Definitions
// 100+ achievements across all categories

import type { Achievement, NovaState } from '../types';

// ─── All Achievement Definitions ────────────────────────────────────────────

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  // ── Tasks ──────────────────────────────────────────────────────────────────
  { id: 'task_first', title: 'First Blood', description: 'Complete your first task', category: 'tasks', icon: '✅', xpReward: 50, condition: 'Complete 1 task', rarity: 'common' },
  { id: 'task_10', title: 'Getting Things Done', description: 'Complete 10 tasks', category: 'tasks', icon: '🎯', xpReward: 100, condition: 'Complete 10 tasks', rarity: 'common' },
  { id: 'task_50', title: 'Execution Machine', description: 'Complete 50 tasks', category: 'tasks', icon: '⚡', xpReward: 250, condition: 'Complete 50 tasks', rarity: 'rare' },
  { id: 'task_100', title: 'Centurion', description: 'Complete 100 tasks', category: 'tasks', icon: '💯', xpReward: 500, condition: 'Complete 100 tasks', rarity: 'rare' },
  { id: 'task_500', title: 'Legend of Execution', description: 'Complete 500 tasks', category: 'tasks', icon: '🏆', xpReward: 2000, condition: 'Complete 500 tasks', rarity: 'epic' },
  { id: 'task_1000', title: 'Thousand Tasks', description: 'Complete 1000 tasks', category: 'tasks', icon: '👑', xpReward: 5000, condition: 'Complete 1000 tasks', rarity: 'legendary' },
  { id: 'task_critical', title: 'Critical Mass', description: 'Complete a critical priority task', category: 'tasks', icon: '🔥', xpReward: 75, condition: 'Complete 1 critical task', rarity: 'common' },
  { id: 'task_on_time', title: 'Deadline Slayer', description: 'Complete 10 tasks before their deadline', category: 'tasks', icon: '⏱️', xpReward: 150, condition: 'Complete 10 tasks before deadline', rarity: 'rare' },
  { id: 'task_no_overdue', title: 'Zero Overdue', description: 'Have no overdue tasks for a full week', category: 'tasks', icon: '🌟', xpReward: 200, condition: 'No overdue tasks for 7 days', rarity: 'rare' },
  { id: 'task_5_in_day', title: 'Hyper Productive', description: 'Complete 5 tasks in a single day', category: 'tasks', icon: '🚀', xpReward: 150, condition: 'Complete 5 tasks in one day', rarity: 'common' },

  // ── Goals ──────────────────────────────────────────────────────────────────
  { id: 'goal_first', title: 'The Dreamer', description: 'Create your first goal', category: 'goals', icon: '🌅', xpReward: 50, condition: 'Create 1 goal', rarity: 'common' },
  { id: 'goal_complete', title: 'Goal Crusher', description: 'Complete your first goal', category: 'goals', icon: '🎉', xpReward: 300, condition: 'Complete 1 goal', rarity: 'rare' },
  { id: 'goal_5_complete', title: 'Serial Achiever', description: 'Complete 5 goals', category: 'goals', icon: '🏅', xpReward: 1000, condition: 'Complete 5 goals', rarity: 'epic' },
  { id: 'goal_milestone_first', title: 'Milestone Maker', description: 'Complete your first milestone', category: 'goals', icon: '🪨', xpReward: 30, condition: 'Complete 1 milestone', rarity: 'common' },
  { id: 'goal_milestone_20', title: 'Milestone Master', description: 'Complete 20 milestones', category: 'goals', icon: '⛰️', xpReward: 200, condition: 'Complete 20 milestones', rarity: 'rare' },
  { id: 'goal_critical', title: 'The Main Quest', description: 'Set a critical priority goal', category: 'goals', icon: '⭐', xpReward: 50, condition: 'Create 1 critical goal', rarity: 'common' },
  { id: 'goal_linked', title: 'Connected Mind', description: 'Link a task, project, and habit to one goal', category: 'goals', icon: '🔗', xpReward: 100, condition: 'One goal with task+project+habit linked', rarity: 'rare' },

  // ── Habits ─────────────────────────────────────────────────────────────────
  { id: 'habit_first', title: 'Creature of Habit', description: 'Create your first habit', category: 'habits', icon: '🌱', xpReward: 30, condition: 'Create 1 habit', rarity: 'common' },
  { id: 'habit_streak_7', title: 'One Week Warrior', description: '7-day habit streak', category: 'habits', icon: '🔥', xpReward: 100, condition: '7-day streak on any habit', rarity: 'common' },
  { id: 'habit_streak_30', title: 'Thirty Day Champion', description: '30-day habit streak', category: 'habits', icon: '💎', xpReward: 500, condition: '30-day streak on any habit', rarity: 'rare' },
  { id: 'habit_streak_100', title: 'Century Streaker', description: '100-day habit streak', category: 'habits', icon: '👾', xpReward: 1500, condition: '100-day streak on any habit', rarity: 'epic' },
  { id: 'habit_streak_365', title: 'Year of Discipline', description: '365-day habit streak', category: 'habits', icon: '🌙', xpReward: 5000, condition: '365-day streak on any habit', rarity: 'legendary' },
  { id: 'habit_all_today', title: 'Perfect Day', description: 'Complete all habits in a single day', category: 'habits', icon: '☀️', xpReward: 200, condition: 'Complete all habits today', rarity: 'common' },
  { id: 'habit_bad_break', title: 'Breaking Bad', description: "Break a bad habit for 30 days in a row", category: 'habits', icon: '🚫', xpReward: 500, condition: 'Bad habit: 30 consecutive clean days', rarity: 'epic' },
  { id: 'habit_stack_first', title: 'Habit Architect', description: 'Create your first habit stack', category: 'habits', icon: '🏗️', xpReward: 75, condition: 'Stack one habit after another', rarity: 'rare' },
  { id: 'habit_5_active', title: 'Five Pillars', description: 'Have 5 active habits simultaneously', category: 'habits', icon: '🏛️', xpReward: 100, condition: 'Have 5+ active habits', rarity: 'common' },

  // ── Finance ────────────────────────────────────────────────────────────────
  { id: 'finance_first', title: 'Money Tracker', description: 'Log your first transaction', category: 'finance', icon: '💰', xpReward: 30, condition: 'Log 1 transaction', rarity: 'common' },
  { id: 'finance_30_days', title: 'Budget Keeper', description: 'Track expenses every day for 30 days', category: 'finance', icon: '📊', xpReward: 300, condition: '30 days of transaction logging', rarity: 'rare' },
  { id: 'finance_under_budget', title: 'Under Budget', description: 'Stay under monthly budget for a full month', category: 'finance', icon: '✨', xpReward: 400, condition: 'Monthly expenses under budget', rarity: 'rare' },
  { id: 'finance_savings_goal', title: 'Future Builder', description: 'Reach your first savings goal', category: 'finance', icon: '🏦', xpReward: 500, condition: 'Complete 1 savings goal', rarity: 'epic' },
  { id: 'finance_debt_free', title: 'Debt Slayer', description: 'Pay off a debt completely', category: 'finance', icon: '🗡️', xpReward: 1000, condition: 'Pay off 1 debt to $0', rarity: 'epic' },
  { id: 'finance_no_subs', title: 'Sub Auditor', description: 'Cancel at least 1 unused subscription', category: 'finance', icon: '✂️', xpReward: 100, condition: 'Cancel 1 subscription', rarity: 'common' },
  { id: 'finance_net_worth_positive', title: 'Net Positive', description: 'Achieve positive net worth', category: 'finance', icon: '📈', xpReward: 750, condition: 'Savings > Debts', rarity: 'rare' },

  // ── Social ─────────────────────────────────────────────────────────────────
  { id: 'social_first', title: 'People Person', description: 'Add your first contact', category: 'social', icon: '👋', xpReward: 30, condition: 'Add 1 contact', rarity: 'common' },
  { id: 'social_5_contacts', title: 'The Network', description: 'Add 5 contacts', category: 'social', icon: '🤝', xpReward: 100, condition: 'Have 5 contacts', rarity: 'common' },
  { id: 'social_log_10', title: 'Stay Connected', description: 'Log 10 contact interactions', category: 'social', icon: '📱', xpReward: 150, condition: 'Log 10 interactions', rarity: 'common' },
  { id: 'social_birthday_remembered', title: 'Thoughtful Friend', description: 'Log a birthday for 3 contacts', category: 'social', icon: '🎂', xpReward: 75, condition: 'Add birthday to 3 contacts', rarity: 'common' },
  { id: 'social_no_neglect', title: 'Consistent Friend', description: 'Contact all important people within 7 days', category: 'social', icon: '💌', xpReward: 200, condition: 'All importance-5 contacts contacted within 7 days', rarity: 'rare' },

  // ── Growth ─────────────────────────────────────────────────────────────────
  { id: 'skill_first_level', title: 'Apprentice', description: 'Level up any skill', category: 'growth', icon: '⚗️', xpReward: 50, condition: 'Skill reaches level 2', rarity: 'common' },
  { id: 'skill_level_5', title: 'Practitioner', description: 'Reach level 5 in any skill', category: 'growth', icon: '🎓', xpReward: 200, condition: 'Any skill at level 5', rarity: 'rare' },
  { id: 'skill_level_10', title: 'Master Class', description: 'Reach level 10 in any skill', category: 'growth', icon: '🎯', xpReward: 750, condition: 'Any skill at level 10', rarity: 'epic' },
  { id: 'quest_first', title: 'Quest Begins', description: 'Start your first quest', category: 'quests', icon: '⚔️', xpReward: 50, condition: 'Create 1 quest', rarity: 'common' },
  { id: 'quest_complete', title: 'Quest Complete', description: 'Finish your first quest', category: 'quests', icon: '🏆', xpReward: 200, condition: 'Complete 1 quest', rarity: 'rare' },
  { id: 'quest_5_complete', title: 'Quest Master', description: 'Complete 5 quests', category: 'quests', icon: '🌠', xpReward: 750, condition: 'Complete 5 quests', rarity: 'epic' },
  { id: 'boss_first', title: 'Boss Fighter', description: 'Defeat your first boss', category: 'quests', icon: '💀', xpReward: 200, condition: 'Defeat 1 boss', rarity: 'rare' },
  { id: 'boss_5', title: 'Boss Slayer', description: 'Defeat 5 bosses', category: 'quests', icon: '🗡️', xpReward: 500, condition: 'Defeat 5 bosses', rarity: 'epic' },

  // ── Reflection ─────────────────────────────────────────────────────────────
  { id: 'reflection_first', title: 'Inner Voice', description: 'Write your first reflection', category: 'reflection', icon: '📖', xpReward: 50, condition: 'Write 1 reflection', rarity: 'common' },
  { id: 'reflection_7_days', title: 'Journal Streak', description: 'Reflect 7 days in a row', category: 'reflection', icon: '✍️', xpReward: 150, condition: '7-day journal streak', rarity: 'common' },
  { id: 'reflection_30_days', title: 'The Analyst', description: 'Reflect 30 days in a row', category: 'reflection', icon: '🔬', xpReward: 500, condition: '30-day journal streak', rarity: 'rare' },
  { id: 'reflection_100', title: 'Chronicler', description: 'Write 100 reflections', category: 'reflection', icon: '📚', xpReward: 750, condition: 'Write 100 reflections', rarity: 'epic' },
  { id: 'reflection_high_mood', title: 'Mood Peak', description: 'Log mood 10/10 three times', category: 'reflection', icon: '😄', xpReward: 100, condition: 'Three 10/10 mood entries', rarity: 'rare' },

  // ── Streaks ─────────────────────────────────────────────────────────────────
  { id: 'streak_daily_3', title: 'Back to Back', description: 'Open NOVA 3 days in a row', category: 'streaks', icon: '📆', xpReward: 30, condition: '3-day app streak', rarity: 'common' },
  { id: 'streak_daily_7', title: 'Weekly Ritual', description: 'Open NOVA 7 days in a row', category: 'streaks', icon: '🗓️', xpReward: 100, condition: '7-day app streak', rarity: 'common' },
  { id: 'streak_daily_30', title: 'Monthly Operator', description: 'Open NOVA 30 days in a row', category: 'streaks', icon: '🌓', xpReward: 400, condition: '30-day app streak', rarity: 'rare' },
  { id: 'streak_daily_100', title: 'The Committed', description: 'Open NOVA 100 days in a row', category: 'streaks', icon: '🌑', xpReward: 1500, condition: '100-day app streak', rarity: 'epic' },
  { id: 'streak_daily_365', title: 'The Operator', description: 'Open NOVA 365 days in a row', category: 'streaks', icon: '🌟', xpReward: 10000, condition: '365-day app streak', rarity: 'legendary' },

  // ── Meta ────────────────────────────────────────────────────────────────────
  { id: 'meta_onboarding', title: 'System Initialized', description: 'Complete NOVA onboarding', category: 'meta', icon: '🚀', xpReward: 100, condition: 'Finish onboarding', rarity: 'common' },
  { id: 'meta_all_screens', title: 'Explorer', description: 'Visit every screen in NOVA', category: 'meta', icon: '🗺️', xpReward: 150, condition: 'Visit all 21 screens', rarity: 'common' },
  { id: 'meta_first_install', title: 'Marketplace Pioneer', description: 'Install your first marketplace system', category: 'meta', icon: '🏪', xpReward: 100, condition: 'Install 1 marketplace product', rarity: 'common' },
  { id: 'meta_ai_first', title: 'First Contact', description: 'Have your first AI conversation', category: 'meta', icon: '🤖', xpReward: 50, condition: 'Send 1 AI message', rarity: 'common' },
  { id: 'meta_life_graph', title: 'Systems Thinker', description: 'View your Life Graph', category: 'meta', icon: '🕸️', xpReward: 50, condition: 'Open Life Graph', rarity: 'common' },
  { id: 'meta_export', title: 'Data Sovereign', description: 'Export your NOVA data', category: 'meta', icon: '💾', xpReward: 50, condition: 'Export data', rarity: 'common' },
  { id: 'meta_time_capsule', title: 'Letter to the Future', description: 'Create a time capsule message', category: 'meta', icon: '💌', xpReward: 100, condition: 'Create 1 time capsule', rarity: 'rare' },
  { id: 'meta_time_capsule_reveal', title: 'Message from the Past', description: 'Open a time capsule', category: 'meta', icon: '📬', xpReward: 200, condition: 'Time capsule revealed', rarity: 'rare' },
  { id: 'meta_konami', title: 'The Chosen One', description: 'Discover the secret code', category: 'meta', icon: '🎮', xpReward: 500, condition: 'Enter the Konami Code', rarity: 'legendary' },
  { id: 'meta_ghost_mode', title: 'Night Owl', description: 'Open NOVA between 2am and 5am', category: 'meta', icon: '🦉', xpReward: 100, condition: 'Access NOVA at 2-5am', rarity: 'rare' },
  { id: 'meta_level_10', title: 'Rising Operator', description: 'Reach level 10', category: 'meta', icon: '🔟', xpReward: 500, condition: 'User level 10', rarity: 'rare' },
  { id: 'meta_level_25', title: 'Elite Operator', description: 'Reach level 25', category: 'meta', icon: '💠', xpReward: 1500, condition: 'User level 25', rarity: 'epic' },
  { id: 'meta_level_50', title: 'Master Operator', description: 'Reach level 50', category: 'meta', icon: '🌌', xpReward: 5000, condition: 'User level 50', rarity: 'epic' },
  { id: 'meta_level_100', title: 'NOVA Legend', description: 'Reach level 100', category: 'meta', icon: '∞', xpReward: 20000, condition: 'User level 100', rarity: 'legendary' },
  { id: 'meta_perfect_week', title: 'Perfect Week', description: 'Complete 5+ tasks, 3+ habits, and write a reflection every day for 7 days', category: 'meta', icon: '🌈', xpReward: 1000, condition: 'Perfect week', rarity: 'epic' },
  { id: 'meta_full_system', title: 'Life Operator', description: 'Have active goals, projects, habits, tasks, reflections, and contacts simultaneously', category: 'meta', icon: '⚡', xpReward: 300, condition: 'All core modules active', rarity: 'rare' },
];

// ─── Achievement Checking Engine ──────────────────────────────────────────────

export function checkAchievements(state: NovaState): string[] {
  const unlocked = new Set(state.achievements.filter(a => a.unlockedAt).map(a => a.id));
  const newlyUnlocked: string[] = [];

  const doneTasks = state.tasks.filter(t => t.status === 'done');
  const activeGoals = state.goals.filter(g => g.status === 'active' && !g.archived);
  const completedGoals = state.goals.filter(g => g.status === 'completed');
  const activeHabits = state.habits.filter(h => !h.archived);
  const maxStreak = Math.max(0, ...activeHabits.map(h => h.streak));
  const bestStreak = Math.max(0, ...activeHabits.map(h => h.bestStreak));
  const todayStr = new Date().toISOString().split('T')[0];
  const allHabitsDoneToday = activeHabits.length > 0 && activeHabits.every(h => h.history.some(d => d.startsWith(todayStr)));
  const completedMilestones = state.goals.flatMap(g => g.milestones).filter(m => m.done).length;
  const completedQuests = state.quests.filter(q => q.status === 'completed');
  const defeatedBosses = state.bosses.filter(b => b.defeated);

  const check = (id: string, cond: boolean) => {
    if (cond && !unlocked.has(id)) newlyUnlocked.push(id);
  };

  // Tasks
  check('task_first', doneTasks.length >= 1);
  check('task_10', doneTasks.length >= 10);
  check('task_50', doneTasks.length >= 50);
  check('task_100', doneTasks.length >= 100);
  check('task_500', doneTasks.length >= 500);
  check('task_1000', doneTasks.length >= 1000);
  check('task_critical', doneTasks.some(t => t.priority === 'critical'));

  // Goals
  check('goal_first', state.goals.length >= 1);
  check('goal_complete', completedGoals.length >= 1);
  check('goal_5_complete', completedGoals.length >= 5);
  check('goal_milestone_first', completedMilestones >= 1);
  check('goal_milestone_20', completedMilestones >= 20);
  check('goal_critical', state.goals.some(g => g.priority === 'critical'));
  check('goal_linked', state.goals.some(g => g.relatedProjects.length > 0 && g.relatedHabits.length > 0 && g.relatedTasks.length > 0));

  // Habits
  check('habit_first', activeHabits.length >= 1);
  check('habit_streak_7', maxStreak >= 7 || bestStreak >= 7);
  check('habit_streak_30', maxStreak >= 30 || bestStreak >= 30);
  check('habit_streak_100', maxStreak >= 100 || bestStreak >= 100);
  check('habit_streak_365', maxStreak >= 365 || bestStreak >= 365);
  check('habit_all_today', allHabitsDoneToday);
  check('habit_5_active', activeHabits.length >= 5);
  check('habit_stack_first', activeHabits.some(h => h.stackedAfter !== null));

  // Finance
  check('finance_first', state.finance.transactions.length >= 1);
  check('finance_debt_free', state.finance.debts.some(d => d.remaining <= 0 && d.amount > 0));
  check('finance_savings_goal', state.finance.savingsGoals.some(s => s.current >= s.target && s.target > 0));
  const totalSavings = state.finance.savingsGoals.reduce((a, s) => a + s.current, 0);
  const totalDebt = state.finance.debts.reduce((a, d) => a + d.remaining, 0);
  check('finance_net_worth_positive', totalSavings > totalDebt && totalDebt >= 0);

  // Social
  check('social_first', state.contacts.length >= 1);
  check('social_5_contacts', state.contacts.length >= 5);
  const totalInteractions = state.contacts.reduce((a, c) => a + (c.interactionLog?.length || 0), 0);
  check('social_log_10', totalInteractions >= 10);
  check('social_birthday_remembered', state.contacts.filter(c => c.birthday).length >= 3);

  // Growth
  check('skill_first_level', state.skills.some(s => s.level >= 2));
  check('skill_level_5', state.skills.some(s => s.level >= 5));
  check('skill_level_10', state.skills.some(s => s.level >= 10));
  check('quest_first', state.quests.length >= 1);
  check('quest_complete', completedQuests.length >= 1);
  check('quest_5_complete', completedQuests.length >= 5);
  check('boss_first', defeatedBosses.length >= 1);
  check('boss_5', defeatedBosses.length >= 5);

  // Reflection
  check('reflection_first', state.reflections.length >= 1);
  check('reflection_100', state.reflections.length >= 100);
  check('reflection_high_mood', state.reflections.filter(r => r.mood >= 10).length >= 3);

  // Streaks
  check('streak_daily_3', state.profile.currentStreak >= 3);
  check('streak_daily_7', state.profile.currentStreak >= 7 || state.profile.longestStreak >= 7);
  check('streak_daily_30', state.profile.currentStreak >= 30 || state.profile.longestStreak >= 30);
  check('streak_daily_100', state.profile.currentStreak >= 100 || state.profile.longestStreak >= 100);
  check('streak_daily_365', state.profile.currentStreak >= 365 || state.profile.longestStreak >= 365);

  // Meta
  check('meta_ai_first', state.aiMessages.length >= 1);
  check('meta_first_install', state.marketplaceInstalls.length >= 1);
  check('meta_time_capsule', state.timeCapsules?.length >= 1);
  check('meta_time_capsule_reveal', state.timeCapsules?.some(tc => tc.revealed));
  check('meta_level_10', state.profile.level >= 10);
  check('meta_level_25', state.profile.level >= 25);
  check('meta_level_50', state.profile.level >= 50);
  check('meta_level_100', state.profile.level >= 100);
  check('meta_full_system', activeGoals.length > 0 && state.projects.length > 0 && activeHabits.length > 0 && doneTasks.length > 0 && state.reflections.length > 0 && state.contacts.length > 0);

  return newlyUnlocked;
}

// ─── XP from Achievements ──────────────────────────────────────────────────────

export function getAchievementById(id: string): Omit<Achievement, 'unlockedAt'> | undefined {
  return ALL_ACHIEVEMENTS.find(a => a.id === id);
}

export function getTotalAchievementXP(state: NovaState): number {
  return state.achievements
    .filter(a => a.unlockedAt)
    .reduce((total, a) => {
      const def = getAchievementById(a.id);
      return total + (def?.xpReward || 0);
    }, 0);
}

export function getAchievementProgress(state: NovaState): { unlocked: number; total: number; percent: number } {
  const unlocked = state.achievements.filter(a => a.unlockedAt).length;
  const total = ALL_ACHIEVEMENTS.length;
  return { unlocked, total, percent: Math.round((unlocked / total) * 100) };
}

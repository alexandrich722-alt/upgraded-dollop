// NOVA Life OS — AI Processing Mock Service
// Provides mock AI responses when no real AI is configured

import type { NovaState } from '../types';

export type AIRequestType =
  | 'daily_planning'
  | 'evening_review'
  | 'weekly_review'
  | 'anti_chaos'
  | 'task_cleanup'
  | 'burnout_risk'
  | 'finance_audit'
  | 'life_graph_analysis'
  | 'mentor_advice'
  | 'mind_dump'
  | 'goal_review'
  | 'habit_analysis';

interface AIResponse {
  text: string;
  actions: { type: string; label: string; description: string; payload?: any }[];
  isMock: boolean;
}

function analyzeState(state: NovaState): { activeTasks: number; overdueTasks: number; activeGoals: number; habitsToday: number; budgetUsed: number; streak: number } {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const activeTasks = state.tasks.filter(t => !t.archived && t.status !== 'done').length;
  const overdueTasks = state.tasks.filter(t => !t.archived && t.status !== 'done' && t.deadline && new Date(t.deadline) < now).length;
  const activeGoals = state.goals.filter(g => !g.archived && g.status === 'active').length;
  const habitsToday = state.habits.filter(h => !h.archived && h.history.some(d => d.startsWith(today))).length;
  const totalHabits = state.habits.filter(h => !h.archived).length;

  const monthStart = today.slice(0, 7);
  const expenses = state.finance.transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(monthStart))
    .reduce((sum, t) => sum + t.amount, 0);
  const budgetUsed = state.finance.monthlyBudget > 0 ? Math.round((expenses / state.finance.monthlyBudget) * 100) : 0;

  return {
    activeTasks,
    overdueTasks,
    activeGoals,
    habitsToday,
    budgetUsed,
    streak: state.profile.currentStreak,
  };
}

export async function processAI(type: AIRequestType, userText: string, state: NovaState): Promise<AIResponse> {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

  const stats = analyzeState(state);

  const responses: Record<AIRequestType, () => AIResponse> = {
    daily_planning: () => ({
      text: `Good morning! You have ${stats.activeTasks} active tasks${stats.overdueTasks > 0 ? ` (${stats.overdueTasks} overdue)` : ''} and ${stats.activeGoals} active goals.\n\nYour top priority today:\n• Complete the most critical task first\n• ${stats.habitsToday > 0 ? 'Great progress on habits!' : 'Start with your morning habit to build momentum.'}\n\nFocus recommendation: Start with deep work for 2 hours before checking messages.`,
      actions: [
        { type: 'focus_session', label: 'Start Focus Session', description: 'Block 2 hours for deep work' },
        { type: 'review_tasks', label: 'Review Tasks', description: `View all ${stats.activeTasks} tasks` },
      ],
      isMock: true,
    }),

    evening_review: () => ({
      text: `Evening check-in:\n\nTasks: ${stats.activeTasks} remaining\nHabits: ${stats.habitsToday} completed today\nStreak: ${stats.streak} days\n\nReflection prompt: What went well today? What could improve tomorrow?`,
      actions: [
        { type: 'create_reflection', label: 'Write Reflection', description: 'Log your evening thoughts' },
        { type: 'plan_tomorrow', label: 'Plan Tomorrow', description: 'Set up tomorrow\'s priorities' },
      ],
      isMock: true,
    }),

    weekly_review: () => ({
      text: `Weekly Summary:\n\nGoals: ${stats.activeGoals} active\nTasks: ${stats.activeTasks} pending\nBudget: ${stats.budgetUsed}% used\nStreak: ${stats.streak} days\n\nKey insight: ${stats.overdueTasks > 0 ? 'Some tasks need attention.' : 'You\'re on track!'}`,
      actions: [
        { type: 'review_goals', label: 'Review Goals', description: 'Check goal progress' },
        { type: 'archive_completed', label: 'Archive Completed', description: 'Clean up done items' },
      ],
      isMock: true,
    }),

    anti_chaos: () => ({
      text: `Chaos reduction analysis:\n\n${stats.overdueTasks > 0 ? `⚠️ ${stats.overdueTasks} overdue tasks need attention` : '✓ No overdue tasks'}\n${stats.budgetUsed > 80 ? `⚠️ Budget at ${stats.budgetUsed}%` : `✓ Budget on track (${stats.budgetUsed}%)`}\n\nRecommendation: Focus on one critical item at a time. Close all tabs except the one you need.`,
      actions: [
        { type: 'prioritize', label: 'Prioritize Now', description: 'Find your #1 priority' },
        { type: 'declutter', label: 'Task Cleanup', description: 'Archive irrelevant tasks' },
      ],
      isMock: true,
    }),

    task_cleanup: () => ({
      text: `Task analysis:\n\n${stats.activeTasks} active tasks\n${stats.overdueTasks} overdue\n\nSuggested actions:\n• Archive tasks older than 30 days with no progress\n• Break large tasks into smaller steps\n• Set realistic deadlines`,
      actions: [
        { type: 'archive_old', label: 'Archive Old Tasks', description: 'Remove stale items' },
        { type: 'review_tasks', label: 'Review All Tasks', description: 'Manual cleanup' },
      ],
      isMock: true,
    }),

    burnout_risk: () => ({
      text: `Burnout check:\n\nWorkload: ${stats.activeTasks > 15 ? 'High' : stats.activeTasks > 8 ? 'Moderate' : 'Manageable'}\nRecovery: ${stats.streak > 7 ? 'Consistent - good!' : 'Build a sustainable rhythm'}\n\n${stats.activeTasks > 15 ? '⚠️ Consider delegating or postponing non-essential tasks.' : '✓ Your load seems manageable.'}`,
      actions: [
        { type: 'schedule_break', label: 'Schedule Break', description: 'Block recovery time' },
        { type: 'reduce_load', label: 'Reduce Load', description: 'Identify what to drop' },
      ],
      isMock: true,
    }),

    finance_audit: () => ({
      text: `Finance snapshot:\n\nBudget: ${stats.budgetUsed}% used this month\n${stats.budgetUsed > 90 ? '⚠️ Near budget limit' : stats.budgetUsed > 70 ? 'Monitor spending' : '✓ On track'}\n\nRecommendation: Review subscriptions and impulse purchases.`,
      actions: [
        { type: 'review_expenses', label: 'Review Expenses', description: 'See where money goes' },
        { type: 'check_subs', label: 'Check Subscriptions', description: 'Audit recurring charges' },
      ],
      isMock: true,
    }),

    life_graph_analysis: () => ({
      text: `Life graph analysis:\n\nGoals: ${stats.activeGoals}\nTasks: ${stats.activeTasks}\nHabits: ${stats.habitsToday} today\nStreak: ${stats.streak} days\n\nPattern: Your productivity correlates with morning habit completion and goal clarity.`,
      actions: [
        { type: 'view_graph', label: 'View Life Graph', description: 'See connections' },
        { type: 'set_main_goal', label: 'Set Main Goal', description: 'Clarify priorities' },
      ],
      isMock: true,
    }),

    mentor_advice: () => ({
      text: `Based on your current state:\n\n${stats.activeTasks} tasks pending, ${stats.activeGoals} goals tracking.\n\nThe key to progress isn't doing more — it's doing what matters most. What's the ONE thing that, if done today, would make everything else easier?`,
      actions: [
        { type: 'find_priority', label: 'Find Priority', description: 'Identify your #1 task' },
        { type: 'deep_work', label: 'Start Deep Work', description: 'Focus for 2 hours' },
      ],
      isMock: true,
    }),

    mind_dump: () => ({
      text: `I've analyzed your input.\n\nDetected themes:\n• Tasks and action items\n• Concerns and blockers\n• Ideas and opportunities\n\nReady to create tasks or add reflections based on your input.`,
      actions: [
        { type: 'create_tasks', label: 'Create Tasks', description: 'Extract action items' },
        { type: 'create_reflection', label: 'Save as Reflection', description: 'Log these thoughts' },
      ],
      isMock: true,
    }),

    goal_review: () => ({
      text: `Goal review:\n\n${stats.activeGoals} active goals\n\nRecommendation: Review progress on each goal weekly. Celebrate wins, adjust targets, drop what no longer serves you.`,
      actions: [
        { type: 'review_goals', label: 'Review Goals', description: 'Check progress' },
        { type: 'add_milestone', label: 'Add Milestone', description: 'Break down a goal' },
      ],
      isMock: true,
    }),

    habit_analysis: () => ({
      text: `Habit tracking:\n\n${stats.habitsToday} habits completed today\nStreak: ${stats.streak} days\n\n${stats.streak > 7 ? 'Strong streak! Keep the momentum.' : 'Build consistency with small wins.'}`,
      actions: [
        { type: 'review_habits', label: 'Review Habits', description: 'See all habits' },
        { type: 'add_habit', label: 'Add Habit', description: 'Start something new' },
      ],
      isMock: true,
    }),
  };

  return responses[type]?.() || {
    text: `Processing your request...\n\nBased on your current state with ${stats.activeTasks} tasks and ${stats.activeGoals} goals, I recommend focusing on what matters most today.`,
    actions: [
      { type: 'review', label: 'Review', description: 'See overview' },
    ],
    isMock: true,
  };
}

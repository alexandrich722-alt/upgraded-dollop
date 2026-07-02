// NOVA Life OS — Pattern Detection Engine
// Analyzes user data to find behavioral patterns, correlations, and insights

import type { NovaState, PatternInsight } from '../types';
import { uid, now, avg } from '../lib/helpers';

export function detectPatterns(state: NovaState): PatternInsight[] {
  const insights: PatternInsight[] = [];
  // ─── Mood × Habit Correlation ─────────────────────────────────────────────
  const reflections = state.reflections.slice(0, 30);
  if (reflections.length >= 7) {
    state.habits.filter(h => !h.archived).forEach(habit => {
      const withHabit = reflections.filter(r => habit.history.some(d => d.startsWith(r.date.split('T')[0])));
      const withoutHabit = reflections.filter(r => !habit.history.some(d => d.startsWith(r.date.split('T')[0])));

      if (withHabit.length >= 3 && withoutHabit.length >= 3) {
        const moodWith = avg(withHabit.map(r => r.mood));
        const moodWithout = avg(withoutHabit.map(r => r.mood));
        const diff = moodWith - moodWithout;

        if (Math.abs(diff) >= 1.5) {
          insights.push({
            id: uid(),
            type: diff > 0 ? 'correlation' : 'warning',
            title: diff > 0 ? `${habit.title} boosts your mood` : `${habit.title} correlates with lower mood`,
            body: diff > 0
              ? `On days you do "${habit.title}", your mood averages ${moodWith.toFixed(1)}/10 vs ${moodWithout.toFixed(1)}/10 on days you skip. That's a +${diff.toFixed(1)} mood boost.`
              : `Surprisingly, days with "${habit.title}" show ${moodWith.toFixed(1)}/10 mood vs ${moodWithout.toFixed(1)}/10 without. Worth reflecting on.`,
            data: { habitId: habit.id, moodWith, moodWithout, diff },
            generatedAt: now(),
            dismissed: false,
          });
        }
      }
    });
  }

  // ─── Stress Risk Warning ───────────────────────────────────────────────────
  if (reflections.length >= 3) {
    const recentStress = avg(reflections.slice(0, 5).map(r => r.stress));
    const recentEnergy = avg(reflections.slice(0, 5).map(r => r.energy));
    if (recentStress >= 7 && recentEnergy <= 4) {
      insights.push({
        id: uid(),
        type: 'warning',
        title: 'Burnout risk detected',
        body: `Your last 5 entries show avg stress ${recentStress.toFixed(1)}/10 and energy ${recentEnergy.toFixed(1)}/10. This combination predicts burnout. Reduce your task load today.`,
        data: { recentStress, recentEnergy },
        generatedAt: now(),
        dismissed: false,
      });
    }
  }

  // ─── Overdue Task Accumulation ────────────────────────────────────────────
  const overdueTasks = state.tasks.filter(t => !t.archived && t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date());
  if (overdueTasks.length >= 5) {
    insights.push({
      id: uid(),
      type: 'warning',
      title: `${overdueTasks.length} overdue tasks — overload signal`,
      body: `You have ${overdueTasks.length} tasks past their deadline. This creates cognitive drag and anxiety. Schedule 30 minutes to triage: delete, delegate, or reschedule each one.`,
      data: { count: overdueTasks.length },
      generatedAt: now(),
      dismissed: false,
    });
  }

  // ─── Habit Streak at Risk ─────────────────────────────────────────────────
  const activeHabits = state.habits.filter(h => !h.archived);
  const habitsAtRisk = activeHabits.filter(h => {
    const lastDone = h.history.length > 0 ? h.history[h.history.length - 1] : null;
    if (!lastDone) return h.streak > 7;
    const daysSince = Math.floor((Date.now() - new Date(lastDone).getTime()) / 86400000);
    return daysSince >= 1 && h.streak >= 7; // 7+ day streak not done today
  });
  if (habitsAtRisk.length > 0) {
    insights.push({
      id: uid(),
      type: 'warning',
      title: `Streak at risk: ${habitsAtRisk.map(h => h.title).join(', ')}`,
      body: `You have ${habitsAtRisk.length} habit${habitsAtRisk.length > 1 ? 's' : ''} with long streaks not yet done today. Don't break the chain!`,
      data: { habitIds: habitsAtRisk.map(h => h.id) },
      generatedAt: now(),
      dismissed: false,
    });
  }

  // ─── Celebration: Goal Near Completion ────────────────────────────────────
  const nearComplete = state.goals.filter(g => g.status === 'active' && g.progress >= 80 && !g.archived);
  nearComplete.forEach(goal => {
    insights.push({
      id: uid(),
      type: 'celebration',
      title: `Almost there: ${goal.title}`,
      body: `Your goal "${goal.title}" is ${goal.progress}% complete. You're in the final stretch. What's the one action that closes the remaining ${100 - goal.progress}%?`,
      data: { goalId: goal.id, progress: goal.progress },
      generatedAt: now(),
      dismissed: false,
    });
  });

  // ─── Unlinked Tasks Warning ───────────────────────────────────────────────
  const unlinkedTasks = state.tasks.filter(t => !t.archived && t.status !== 'done' && !t.goalId && !t.projectId);
  if (unlinkedTasks.length >= 5) {
    insights.push({
      id: uid(),
      type: 'suggestion',
      title: `${unlinkedTasks.length} tasks with no purpose`,
      body: `You have ${unlinkedTasks.length} tasks not connected to any goal or project. Random tasks are entropy. Link them to a goal or delete them.`,
      data: { count: unlinkedTasks.length },
      generatedAt: now(),
      dismissed: false,
    });
  }

  // ─── Finance: Over Budget Warning ────────────────────────────────────────
  const monthStr = new Date().toISOString().slice(0, 7);
  const monthExpenses = state.finance.transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(monthStr))
    .reduce((a, t) => a + t.amount, 0);
  if (state.finance.monthlyBudget > 0 && monthExpenses > state.finance.monthlyBudget * 0.9) {
    const pct = Math.round((monthExpenses / state.finance.monthlyBudget) * 100);
    insights.push({
      id: uid(),
      type: 'warning',
      title: `At ${pct}% of monthly budget`,
      body: `You've spent $${monthExpenses.toFixed(0)} of your $${state.finance.monthlyBudget} budget this month. ${pct >= 100 ? 'Over budget — avoid non-essential spending.' : `Only $${(state.finance.monthlyBudget - monthExpenses).toFixed(0)} remaining.`}`,
      data: { spent: monthExpenses, budget: state.finance.monthlyBudget, pct },
      generatedAt: now(),
      dismissed: false,
    });
  }

  // ─── Subscription Audit Suggestion ───────────────────────────────────────
  const subTotal = state.finance.subscriptions
    .filter(s => s.active)
    .reduce((a, s) => a + (s.frequency === 'yearly' ? s.amount / 12 : s.amount), 0);
  if (subTotal > 100 && state.finance.subscriptions.length >= 3) {
    insights.push({
      id: uid(),
      type: 'suggestion',
      title: `$${subTotal.toFixed(0)}/month on subscriptions`,
      body: `You have ${state.finance.subscriptions.filter(s => s.active).length} active subscriptions totaling $${subTotal.toFixed(0)}/month. That's $${(subTotal * 12).toFixed(0)}/year. Which ones haven't you used this month?`,
      data: { subTotal, count: state.finance.subscriptions.length },
      generatedAt: now(),
      dismissed: false,
    });
  }

  // ─── Life Score Celebration ───────────────────────────────────────────────
  if (state.profile.lifeScore >= 80) {
    insights.push({
      id: uid(),
      type: 'celebration',
      title: `Life Score ${state.profile.lifeScore} — You're thriving`,
      body: `Your Life Score hit ${state.profile.lifeScore}/100. All four dimensions (clarity, energy, progress, consistency) are elevated. This is the state where big things get done.`,
      data: { lifeScore: state.profile.lifeScore },
      generatedAt: now(),
      dismissed: false,
    });
  }

  // ─── Momentum Detection ───────────────────────────────────────────────────
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });
  const tasksDoneThisWeek = state.tasks.filter(t => t.completedAt && last7Days.some(d => t.completedAt!.startsWith(d))).length;
  if (tasksDoneThisWeek >= 20) {
    insights.push({
      id: uid(),
      type: 'celebration',
      title: `On fire — ${tasksDoneThisWeek} tasks this week`,
      body: `You completed ${tasksDoneThisWeek} tasks in the last 7 days. That's exceptional momentum. Channel it — what's the biggest move you can make right now?`,
      data: { tasksDoneThisWeek },
      generatedAt: now(),
      dismissed: false,
    });
  }

  // Deduplicate by type+data key to prevent flooding
  const seen = new Set<string>();
  return insights.filter(ins => {
    const key = `${ins.type}-${ins.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8); // max 8 insights at a time
}

// ─── "NOVA Knows You" Profile Analysis ────────────────────────────────────────

export interface NovaPersonalityProfile {
  archetype: string;
  archetypeDesc: string;
  peakTime: string;
  weakPattern: string;
  strength: string;
  blindspot: string;
  recommendation: string;
  stats: {
    totalTasksDone: number;
    totalHabitDays: number;
    longestStreak: number;
    goalsCompleted: number;
    reflectionCount: number;
    avgMood: number;
    avgEnergy: number;
    avgStress: number;
    totalXP: number;
    level: number;
  };
}

export function buildPersonalityProfile(state: NovaState): NovaPersonalityProfile {
  const doneTasks = state.tasks.filter(t => t.status === 'done');
  const habits = state.habits.filter(h => !h.archived);
  const totalHabitDays = habits.reduce((a, h) => a + h.history.length, 0);
  const longestStreak = Math.max(0, ...habits.map(h => h.bestStreak));
  const completedGoals = state.goals.filter(g => g.status === 'completed').length;
  const reflections = state.reflections;
  const avgMood = reflections.length ? avg(reflections.slice(0, 30).map(r => r.mood)) : 5;
  const avgEnergy = reflections.length ? avg(reflections.slice(0, 30).map(r => r.energy)) : 5;
  const avgStress = reflections.length ? avg(reflections.slice(0, 30).map(r => r.stress)) : 5;

  // Archetype classification
  const taskRate = doneTasks.length;
  const habitRate = habits.length > 0 ? avg(habits.map(h => h.completionRate)) : 0;
  const overdue = state.tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length;

  let archetype = 'The Operator';
  let archetypeDesc = 'Systematic, execution-focused, builds momentum through consistency.';

  if (habitRate > 70 && longestStreak > 30) {
    archetype = 'The Disciplined';
    archetypeDesc = 'Exceptional consistency. You build systems and stick to them.';
  } else if (taskRate > 100 && overdue < 3) {
    archetype = 'The Executor';
    archetypeDesc = 'High task velocity with minimal drag. You ship.';
  } else if (reflections.length > 30) {
    archetype = 'The Reflective';
    archetypeDesc = 'Deep self-awareness. You learn faster than most because you process experiences.';
  } else if (completedGoals >= 3) {
    archetype = 'The Goal Crusher';
    archetypeDesc = 'You set ambitious targets and hit them. Strategic thinker.';
  } else if (avgStress > 7) {
    archetype = 'The Overcomer';
    archetypeDesc = 'High stress but still showing up. Resilient, but needs recovery.';
  }

  // Hour analysis (simplified — based on task completion times)
  const completionHours = doneTasks
    .filter(t => t.completedAt)
    .map(t => new Date(t.completedAt!).getHours());
  const morningTasks = completionHours.filter(h => h >= 6 && h < 12).length;
  const afternoonTasks = completionHours.filter(h => h >= 12 && h < 17).length;
  const eveningTasks = completionHours.filter(h => h >= 17 && h < 22).length;
  const peakTime = morningTasks >= afternoonTasks && morningTasks >= eveningTasks
    ? 'Morning person — most productive 6am-12pm'
    : afternoonTasks >= eveningTasks
    ? 'Afternoon peak — energy builds through the day'
    : 'Evening operator — comes alive after 5pm';

  const weakPattern = overdue > 5
    ? 'You accumulate overdue tasks — you plan more than you execute'
    : habitRate < 50
    ? 'Habits start strong but drop off — consistency is the gap'
    : avgStress > 6
    ? 'Stress is a recurring theme — review your load vs capacity ratio'
    : 'No critical weak pattern detected — keep building';

  const strength = habitRate > 60
    ? 'Consistency — your habits stick'
    : taskRate > 50
    ? 'Execution — you get things done'
    : reflections.length > 10
    ? 'Self-awareness — you reflect and learn'
    : 'Showing up — you\'re building the foundation';

  const blindspot = overdue > 3
    ? 'Overcommitting — you say yes to too much'
    : habits.some(h => h.isBad)
    ? 'One or more habits you\'re trying to break are persistent'
    : avgEnergy < 5
    ? 'Energy management — you may be underprioritizing recovery'
    : 'No significant blindspot detected yet';

  const recommendation = habitRate < 50
    ? 'Focus on 1-2 non-negotiable habits. Consistency > quantity.'
    : overdue > 5
    ? 'Schedule a 30-min triage session. Delete or delegate at least 5 tasks.'
    : avgStress > 6
    ? 'Add 1 recovery ritual. Walk, meditate, or simply sit without screens.'
    : 'You\'re in good shape. Push your #1 goal forward this week.';

  return {
    archetype,
    archetypeDesc,
    peakTime,
    weakPattern,
    strength,
    blindspot,
    recommendation,
    stats: {
      totalTasksDone: doneTasks.length,
      totalHabitDays,
      longestStreak,
      goalsCompleted: completedGoals,
      reflectionCount: reflections.length,
      avgMood: Math.round(avgMood * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgStress: Math.round(avgStress * 10) / 10,
      totalXP: state.profile.xp,
      level: state.profile.level,
    },
  };
}


export default buildPersonalityProfile
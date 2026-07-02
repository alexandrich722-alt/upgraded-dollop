// NOVA Life OS — Score Service
// Pure functions for computing life scores from state data

import type { NovaState, UserProfile } from '../types';
import { avg, sum } from './helpers';

export function computeScores(state: NovaState): Partial<UserProfile> {
  const activeGoals = state.goals.filter(g => g.status === 'active' && !g.archived);
  const activeTasks = state.tasks.filter(t => !t.archived && t.status !== 'done');
  const doneTasks = state.tasks.filter(t => t.status === 'done');
  const habits = state.habits.filter(h => !h.archived);
  const recentReflections = state.reflections.slice(0, 7);

  // Clarity: task-goal linkage + goal progress
  const linkedTasks = activeTasks.filter(t => t.goalId || t.projectId).length;
  const clarityRaw = activeTasks.length > 0 ? (linkedTasks / activeTasks.length) * 100 : 70;
  const goalProgress = activeGoals.length > 0 ? avg(activeGoals.map(g => g.progress)) : 50;
  const clarityScore = Math.round(clarityRaw * 0.4 + goalProgress * 0.6);

  // Energy: from reflections + habit consistency
  const avgEnergy = recentReflections.length > 0
    ? avg(recentReflections.map(r => r.energy)) * 10
    : 60;
  const habitRate = habits.length > 0 ? avg(habits.map(h => h.completionRate)) : 50;
  const energyScore = Math.round(avgEnergy * 0.5 + habitRate * 0.5);

  // Progress: task completion + goal progress + habit streaks
  const taskCompletion = state.tasks.length > 0
    ? (doneTasks.length / state.tasks.length) * 100
    : 50;
  const avgStreak = habits.length > 0
    ? Math.min(100, avg(habits.map(h => h.streak)) * 10)
    : 30;
  const progressScore = Math.round(taskCompletion * 0.4 + goalProgress * 0.4 + avgStreak * 0.2);

  // Life Score: composite
  const lifeScore = Math.round(clarityScore * 0.3 + energyScore * 0.3 + progressScore * 0.4);

  // XP from completed tasks + habit streaks
  const xp = doneTasks.length * 50 + sum(habits.map(h => h.streak * 10));
  const level = Math.floor(xp / 500) + 1;

  return { clarityScore, energyScore, progressScore, lifeScore, xp, level };
}

export function getScoreTrend(state: NovaState, days = 7): { date: string; score: number }[] {
  const trend: { date: string; score: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split('T')[0];
    const doneTasks = state.tasks.filter(t => t.status === 'done' && t.completedAt?.startsWith(dayStr)).length;
    const habitsDone = state.habits.filter(h => h.history.some(hd => hd.startsWith(dayStr))).length;
    trend.push({ date: dayStr, score: doneTasks + habitsDone });
  }
  return trend;
}

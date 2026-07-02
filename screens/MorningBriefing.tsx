// NOVA Life OS — Morning Briefing
// Daily morning summary for intentional days

import { useState, useEffect, useMemo } from 'react';
import { Sun, Zap, Target, TrendingUp, TrendingDown, Minus, Heart, MessageCircle, DollarSign, AlertTriangle as AlertTriangle, Sparkles, CheckCircle as CheckCircle2, ArrowRight, Coffee, Brain, Battery, BatteryMedium, BatteryLow } from 'lucide-react';
import { useStore } from '../store';
import { Card, SectionHeader, Badge } from '../components/ui';
import { TodayMission } from '../types';

interface MorningBriefingProps {
  onClose?: () => void;
}

export function MorningBriefing({ onClose }: MorningBriefingProps) {
  const { state } = useStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeTasks = state.tasks.filter(t => !t.archived && t.status !== 'done');
    const doneTasks = state.tasks.filter(t => t.status === 'done');
    const overdue = activeTasks.filter(t => t.deadline && new Date(t.deadline) < new Date());
    const activeGoals = state.goals.filter(g => g.status === 'active' && !g.archived);
    const mainGoal = activeGoals.find(g => g.priority === 'critical') || activeGoals[0];
    const habits = state.habits.filter(h => !h.archived);
    const recentReflections = state.reflections.slice(0, 7);
    const contactsNeedingAttention = state.contacts.filter(c => {
      if (!c.reminders?.length) return false;
      const lastContact = c.lastContact ? new Date(c.lastContact) : null;
      if (!lastContact) return true;
      const daysSince = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 7;
    }).slice(0, 3);

    // Energy trend
    const avgEnergy = recentReflections.length
      ? Math.round(recentReflections.reduce((a, r) => a + r.energy, 0) / recentReflections.length)
      : 5;
    const avgMood = recentReflections.length
      ? Math.round(recentReflections.reduce((a, r) => a + r.mood, 0) / recentReflections.length)
      : 5;
    const avgStress = recentReflections.length
      ? Math.round(recentReflections.reduce((a, r) => a + r.stress, 0) / recentReflections.length)
      : 5;

    // Today's expenses
    const todayStr = new Date().toISOString().split('T')[0];
    const todayExpenses = state.finance.transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(todayStr))
      .reduce((a, t) => a + t.amount, 0);
    const dailyBudget = state.finance.monthlyBudget / 30;

    // Top tasks by priority
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const topTasks = [...activeTasks]
      .sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2))
      .slice(0, 3);

    // Habits for today
    const habitOfTheDay = habits.find(h => !h.isBad);

    // Risk warning
    const risks: string[] = [];
    if (overdue.length > 0) risks.push(`${overdue.length} overdue tasks`);
    if (activeTasks.length > 10) risks.push(`${activeTasks.length} active tasks (overload risk)`);
    if (avgStress > 7) risks.push('High stress detected');
    if (avgEnergy < 4) risks.push('Low energy pattern');

    return {
      activeTasks: activeTasks.length,
      doneTasks: doneTasks.length,
      overdue: overdue.length,
      overdueTasks: overdue.slice(0, 3),
      mainGoal,
      topTasks,
      habitOfTheDay,
      contactsNeedingAttention,
      avgEnergy,
      avgMood,
      avgStress,
      todayExpenses,
      dailyBudget,
      risks,
      activeQuests: state.quests.filter(q => !q.completed).length,
      streakDays: habits.reduce((max, h) => Math.max(max, h.streak || 0), 0),
    };
  }, [state]);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good night';
    if (hour < 9) return 'Good morning';
    if (hour < 12) return 'Good day';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }, []);

  const energyIcon = metrics.avgEnergy > 6 ? Battery : metrics.avgEnergy > 4 ? BatteryMedium : BatteryLow;
  const EnergyIcon = energyIcon;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-nova-text">{greeting}, {state.profile.name || 'there'}</h1>
            <p className="text-sm text-nova-dim">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-ghost text-sm">
            Dismiss
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <Card className="p-3 text-center">
          <Zap className="w-5 h-5 mx-auto mb-1 text-accent-cyan" />
          <p className="text-lg font-bold text-nova-text">{state.profile.energyScore || 50}</p>
          <p className="text-xs text-nova-muted">Energy</p>
        </Card>
        <Card className="p-3 text-center">
          <Target className="w-5 h-5 mx-auto mb-1 text-accent-violet" />
          <p className="text-lg font-bold text-nova-text">{metrics.activeTasks}</p>
          <p className="text-xs text-nova-muted">Tasks</p>
        </Card>
        <Card className="p-3 text-center">
          <Heart className="w-5 h-5 mx-auto mb-1 text-accent-rose" />
          <p className="text-lg font-bold text-nova-text">{metrics.avgMood}/10</p>
          <p className="text-xs text-nova-muted">Mood</p>
        </Card>
        <Card className="p-3 text-center">
          <Coffee className="w-5 h-5 mx-auto mb-1 text-accent-amber" />
          <p className="text-lg font-bold text-nova-text">{metrics.streakDays}</p>
          <p className="text-xs text-nova-muted">Streak</p>
        </Card>
      </div>

      {/* Risk Warning */}
      {metrics.risks.length > 0 && (
        <Card className="p-4 mb-4 border-accent-rose/30 bg-accent-rose/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-accent-rose shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-accent-rose mb-1">Attention needed</p>
              <p className="text-xs text-nova-dim">{metrics.risks.join(' • ')}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Focus */}
      {metrics.mainGoal && (
        <Card className="p-4 mb-4" onClick={() => setExpanded(expanded === 'goal' ? null : 'goal')}>
          <div className="flex items-start gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-accent-violet/15 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-accent-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-nova-muted mb-0.5">Your main focus</p>
              <p className="text-sm font-medium text-nova-text truncate">{metrics.mainGoal.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-nova-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-cyan to-accent-violet rounded-full transition-all"
                    style={{ width: `${metrics.mainGoal.progress || 0}%` }}
                  />
                </div>
                <span className="text-xs text-nova-dim">{metrics.mainGoal.progress || 0}%</span>
              </div>
            </div>
            <ArrowRight className={`w-4 h-4 text-nova-muted transition-transform ${expanded === 'goal' ? 'rotate-90' : ''}`} />
          </div>
          {expanded === 'goal' && metrics.mainGoal.milestones && (
            <div className="mt-3 pt-3 border-t border-nova-border space-y-2">
              {metrics.mainGoal.milestones.slice(0, 4).map((m, i) => (
                <div key={m.id || i} className="flex items-center gap-2 text-xs">
                  {m.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-nova-border" />
                  )}
                  <span className={m.done ? 'text-nova-dim line-through' : 'text-nova-text'}>{m.title}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Today's Top 3 */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-nova-text flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-cyan" />
            Today's Top Priorities
          </h3>
          {metrics.overdue > 0 && (
            <Badge color="rose">{metrics.overdue} overdue</Badge>
          )}
        </div>
        <div className="space-y-2">
          {metrics.topTasks.length > 0 ? metrics.topTasks.map((task, i) => (
            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-nova-surface border border-nova-border">
              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-accent-cyan/20 text-accent-cyan' :
                i === 1 ? 'bg-accent-violet/20 text-accent-violet' :
                'bg-nova-border text-nova-muted'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-nova-text truncate">{task.title}</p>
                {task.deadline && (
                  <p className="text-xs text-nova-muted">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                )}
              </div>
              <Badge color={task.priority === 'critical' ? 'rose' : task.priority === 'high' ? 'amber' : 'default'}>
                {task.priority}
              </Badge>
            </div>
          )) : (
            <div className="text-center py-4">
              <p className="text-sm text-nova-dim">No tasks yet</p>
              <p className="text-xs text-nova-muted mt-1">Add tasks to see your priorities here</p>
            </div>
          )}
        </div>
      </Card>

      {/* Habit of the Day */}
      {metrics.habitOfTheDay && (
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-medium text-nova-text flex items-center gap-2 mb-3">
            <Coffee className="w-4 h-4 text-accent-amber" />
            Habit of the Day
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-emerald/15 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
            </div>
            <div>
              <p className="text-sm font-medium text-nova-text">{metrics.habitOfTheDay.title}</p>
              <p className="text-xs text-nova-muted">
                {metrics.habitOfTheDay.streak ? `${metrics.habitOfTheDay.streak} day streak` : 'Start your streak today'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Energy & Wellness */}
      <Card className="p-4 mb-4">
        <h3 className="text-sm font-medium text-nova-text flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-accent-violet" />
          Your Energy & Wellness
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-nova-surface border border-nova-border">
            <EnergyIcon className={`w-5 h-5 mx-auto mb-1 ${metrics.avgEnergy > 6 ? 'text-accent-emerald' : metrics.avgEnergy > 4 ? 'text-accent-amber' : 'text-accent-rose'}`} />
            <p className="text-lg font-bold text-nova-text">{metrics.avgEnergy}/10</p>
            <p className="text-xs text-nova-muted">Energy</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-nova-surface border border-nova-border">
            <Heart className={`w-5 h-5 mx-auto mb-1 ${metrics.avgMood > 6 ? 'text-accent-emerald' : metrics.avgMood > 4 ? 'text-accent-amber' : 'text-accent-rose'}`} />
            <p className="text-lg font-bold text-nova-text">{metrics.avgMood}/10</p>
            <p className="text-xs text-nova-muted">Mood</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-nova-surface border border-nova-border">
            <Zap className={`w-5 h-5 mx-auto mb-1 ${metrics.avgStress < 4 ? 'text-accent-emerald' : metrics.avgStress < 7 ? 'text-accent-amber' : 'text-accent-rose'}`} />
            <p className="text-lg font-bold text-nova-text">{metrics.avgStress}/10</p>
            <p className="text-xs text-nova-muted">Stress</p>
          </div>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-accent-cyan/5 border border-accent-cyan/10">
          <p className="text-xs text-nova-dim">
            {metrics.avgEnergy > 6
              ? 'Good energy! Plan 2 deep work blocks today.'
              : metrics.avgEnergy > 4
              ? 'Medium energy. Focus on 1 key task, avoid overcommitting.'
              : 'Low energy detected. Protect your energy—essential tasks only.'}
          </p>
        </div>
      </Card>

      {/* Relationship Reminder */}
      {metrics.contactsNeedingAttention.length > 0 && (
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-medium text-nova-text flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-accent-rose" />
            Relationship Reminder
          </h3>
          {metrics.contactsNeedingAttention.map(contact => (
            <div key={contact.id} className="flex items-center gap-3 p-2 rounded-lg bg-nova-surface border border-nova-border">
              <div className="w-10 h-10 rounded-full bg-accent-rose/15 flex items-center justify-center">
                <span className="text-sm font-medium text-accent-rose">
                  {contact.name?.charAt(0) || '?'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-nova-text">{contact.name}</p>
                <p className="text-xs text-nova-muted">Reach out today</p>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Finance Signal */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-nova-text flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-accent-emerald" />
          Finance Snapshot
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-nova-muted">Today's spending</p>
            <p className="text-lg font-bold text-nova-text">
              ${metrics.todayExpenses.toFixed(0)} <span className="text-xs text-nova-muted font-normal">/ ${metrics.dailyBudget.toFixed(0)} daily limit</span>
            </p>
          </div>
          <div className={`text-xs px-2 py-1 rounded-full ${
            metrics.todayExpenses > metrics.dailyBudget
              ? 'bg-accent-rose/15 text-accent-rose'
              : 'bg-accent-emerald/15 text-accent-emerald'
          }`}>
            {metrics.todayExpenses > metrics.dailyBudget ? 'Over budget' : 'On track'}
          </div>
        </div>
      </Card>

      {/* Recommendation */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-violet/10 border border-accent-violet/20">
          <Sparkles className="w-4 h-4 text-accent-violet" />
          <span className="text-sm text-accent-violet">
            {metrics.avgEnergy > 6
              ? 'High energy day! Tackle your hardest task first.'
              : metrics.overdue > 0
              ? 'Start by triaging your overdue tasks—pick one to complete.'
              : 'Focus on your #1 priority today. Everything else can wait.'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MorningBriefing;

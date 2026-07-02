// NOVA Life OS — Life Dashboard Command Center
// Comprehensive command center view of all life areas

import { useState, useMemo } from 'react';
import { Target, SquareCheck as CheckSquare, Heart, DollarSign, Users, Zap, TrendingUp, TrendingDown, Minus, Sun, Moon, Brain, Battery, BatteryMedium, BatteryLow, TriangleAlert as AlertTriangle, Sparkles, ChevronRight, Eye, EyeOff, Settings, Coffee, Calendar, Clock, Award, Rocket } from 'lucide-react';
import { useStore } from './store';
import { Card, SectionHeader, Badge, ProgressBar, ScoreRing } from './components/ui';

export default function LifeDashboard() {
  const { state } = useStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('focus');

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const activeTasks = state.tasks.filter(t => !t.archived && t.status !== 'done');
    const doneTasks = state.tasks.filter(t => t.status === 'done');
    const overdue = activeTasks.filter(t => t.deadline && new Date(t.deadline) < new Date());
    const activeGoals = state.goals.filter(g => g.status === 'active' && !g.archived);
    const criticalGoals = activeGoals.filter(g => g.priority === 'critical');
    const activeProjects = state.projects.filter(p => p.status === 'active' && !p.archived);
    const habits = state.habits.filter(h => !h.archived);
    const goodHabits = habits.filter(h => !h.isBad);
    const badHabits = habits.filter(h => h.isBad);
    const recentReflections = state.reflections.slice(0, 7);
    const allTimeReflections = state.reflections;

    // Energy trend (last 7 days)
    const avgEnergy = recentReflections.length
      ? Math.round(recentReflections.reduce((a, r) => a + r.energy, 0) / recentReflections.length)
      : 5;
    const avgMood = recentReflections.length
      ? Math.round(recentReflections.reduce((a, r) => a + r.mood, 0) / recentReflections.length)
      : 5;
    const avgStress = recentReflections.length
      ? Math.round(recentReflections.reduce((a, r) => a + r.stress, 0) / recentReflections.length)
      : 5;

    // Finance
    const monthStr = new Date().toISOString().slice(0, 7);
    const monthExpenses = state.finance.transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(monthStr))
      .reduce((a, t) => a + t.amount, 0);
    const monthIncome = state.finance.transactions
      .filter(t => t.type === 'income' && t.date.startsWith(monthStr))
      .reduce((a, t) => a + t.amount, 0);
    const activeSubscriptions = state.finance.subscriptions.filter(s => s.active);
    const monthlySubscriptionCost = activeSubscriptions.reduce((a, s) => a + s.amount, 0);

    // Contacts
    const contactsNeedingAttention = state.contacts.filter(c => {
      if (!c.reminders?.length) return false;
      const lastContact = c.lastContact ? new Date(c.lastContact) : null;
      if (!lastContact) return true;
      const daysSince = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 7;
    });
    const topContacts = state.contacts.slice(0, 5);

    // Progress
    const tasksCompletedThisWeek = doneTasks.filter(t => {
      if (!t.completedAt) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(t.completedAt) >= weekAgo;
    }).length;
    const habitCompletionRate = habits.length
      ? Math.round(habits.reduce((a, h) => a + (h.completionRate || 0), 0) / habits.length)
      : 0;
    const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

    // Quests & Bosses
    const activeQuests = state.quests.filter(q => !q.completed);
    const activeBosses = state.bosses.filter(b => !b.defeated);

    // Risks
    const risks: { type: 'warning' | 'critical'; message: string }[] = [];
    if (overdue.length > 3) risks.push({ type: 'critical', message: `${overdue.length} overdue tasks` });
    else if (overdue.length > 0) risks.push({ type: 'warning', message: `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}` });
    if (activeTasks.length > 12) risks.push({ type: 'warning', message: `${activeTasks.length} active tasks (overload risk)` });
    if (avgStress > 7) risks.push({ type: 'critical', message: 'High stress detected' });
    if (avgEnergy < 4) risks.push({ type: 'warning', message: 'Low energy pattern' });
    if (monthExpenses > state.finance.monthlyBudget) risks.push({ type: 'warning', message: 'Over budget this month' });
    if (contactsNeedingAttention.length > 3) risks.push({ type: 'warning', message: `${contactsNeedingAttention.length} contacts need attention` });

    // Recommendations
    const recommendations: string[] = [];
    if (avgEnergy < 5) recommendations.push('Protect your energy today — limit to 3 essential tasks');
    if (avgStress > 6) recommendations.push('Add a 10-minute recovery block between deep work');
    if (overdue.length > 0) recommendations.push('Triage overdue tasks first thing today');
    if (criticalGoals.length > 3) recommendations.push('Focus on ONE critical goal this week');
    if (recommendations.length === 0) recommendations.push('You\'re in balance — maintain your rhythm');

    return {
      // Tasks
      activeTasks: activeTasks.length,
      doneTasks: doneTasks.length,
      overdue: overdue.length,
      overdueTasks: overdue.slice(0, 3),
      tasksCompletedThisWeek,
      // Goals
      activeGoals: activeGoals.length,
      criticalGoals: criticalGoals.length,
      mainGoal: criticalGoals[0] || activeGoals[0],
      allGoals: activeGoals.slice(0, 5),
      // Projects
      activeProjects: activeProjects.length,
      recentProjects: activeProjects.slice(0, 3),
      // Habits
      habits: habits.length,
      goodHabits: goodHabits.length,
      badHabits: badHabits.length,
      habitCompletionRate,
      topHabit: goodHabits[0],
      longestStreak,
      // Wellness
      avgEnergy,
      avgMood,
      avgStress,
      reflections: allTimeReflections.length,
      // Finance
      monthExpenses,
      monthIncome,
      monthlyBudget: state.finance.monthlyBudget,
      budgetRemaining: state.finance.monthlyBudget - monthExpenses,
      activeSubscriptions: activeSubscriptions.length,
      monthlySubscriptionCost,
      // Social
      contacts: state.contacts.length,
      contactsNeedingAttention: contactsNeedingAttention.length,
      topContacts,
      // Progress
      activeQuests: activeQuests.length,
      activeBosses: activeBosses.length,
      totalXP: state.profile.xp || 0,
      level: state.profile.level || 1,
      // Scores
      lifeScore: state.profile.lifeScore || 50,
      clarityScore: state.profile.clarityScore || 50,
      energyScore: state.profile.energyScore || 50,
      progressScore: state.profile.progressScore || 50,
      // Alerts
      risks,
      recommendations,
    };
  }, [state]);

  const EnergyIcon = metrics.avgEnergy > 6 ? Battery : metrics.avgEnergy > 4 ? BatteryMedium : BatteryLow;

  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-nova-text flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            Life Command Center
          </h1>
          <p className="text-sm text-nova-muted mt-1">
            {timeOfDay === 'morning' && 'Good morning'}
            {timeOfDay === 'afternoon' && 'Good afternoon'}
            {timeOfDay === 'evening' && 'Good evening'}
            {timeOfDay === 'night' && 'Good night'}
            , {state.profile.name || 'there'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color="cyan">Level {metrics.level}</Badge>
          <span className="text-sm text-nova-muted">{metrics.totalXP.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Alert Banner */}
      {metrics.risks.length > 0 && (
        <Card className="p-4 border-accent-rose/30 bg-accent-rose/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-accent-rose shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-accent-rose mb-2">Attention needed</p>
              <div className="flex flex-wrap gap-2">
                {metrics.risks.map((r, i) => (
                  <Badge key={i} color={r.type === 'critical' ? 'rose' : 'amber'}>{r.message}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Life Scores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ScoreCard score={metrics.lifeScore} label="Life Score" color="cyan" />
        <ScoreCard score={metrics.clarityScore} label="Clarity" color="violet" />
        <ScoreCard score={metrics.energyScore} label="Energy" color="gold" />
        <ScoreCard score={metrics.progressScore} label="Progress" color="emerald" />
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Focus */}
        <div className="lg:col-span-2 space-y-4">
          {/* Focus Area */}
          <Card className="p-5 border-l-4 border-l-accent-cyan">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-nova-text flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-cyan" />
                Focus Area
              </h2>
              <button onClick={() => setExpandedSection(expandedSection === 'focus' ? null : 'focus')} className="btn-ghost text-xs">
                {expandedSection === 'focus' ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {metrics.mainGoal ? (
              <div>
                <p className="text-sm text-nova-muted mb-1">Main Goal</p>
                <h3 className="text-xl font-bold text-nova-text mb-3">{metrics.mainGoal.title}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <ProgressBar value={metrics.mainGoal.progress || 0} color="cyan" className="flex-1" />
                  <span className="text-sm font-medium text-nova-text">{metrics.mainGoal.progress || 0}%</span>
                </div>
                {expandedSection === 'focus' && metrics.mainGoal.milestones && (
                  <div className="mt-4 pt-4 border-t border-nova-border">
                    <p className="text-xs text-nova-muted uppercase tracking-wider mb-2">Milestones</p>
                    <div className="space-y-2">
                      {metrics.mainGoal.milestones.slice(0, 5).map((m, i) => (
                        <div key={m.id || i} className="flex items-center gap-2 text-sm">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${m.done ? 'bg-accent-emerald/20' : 'bg-nova-surface border border-nova-border'}`}>
                            {m.done && <CheckSquare className="w-3 h-3 text-accent-emerald" />}
                          </div>
                          <span className={m.done ? 'text-nova-muted line-through' : 'text-nova-dim'}>{m.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-nova-muted mx-auto mb-3" />
                <p className="text-sm text-nova-muted">No main goal set</p>
                <p className="text-xs text-nova-dim mt-1">Set a critical priority goal to see it here</p>
              </div>
            )}
          </Card>

          {/* Today's Tasks */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-nova-text flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-accent-violet" />
                Tasks Overview
              </h2>
              <Badge color="default">{metrics.activeTasks} active</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-nova-surface">
                <p className="text-2xl font-bold text-nova-text">{metrics.tasksCompletedThisWeek}</p>
                <p className="text-xs text-nova-muted">Done this week</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-nova-surface">
                <p className="text-2xl font-bold text-nova-text">{metrics.activeTasks}</p>
                <p className="text-xs text-nova-muted">Active</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent-rose/10">
                <p className="text-2xl font-bold text-accent-rose">{metrics.overdue}</p>
                <p className="text-xs text-nova-muted">Overdue</p>
              </div>
            </div>
            {metrics.overdueTasks.length > 0 && (
              <div>
                <p className="text-xs text-nova-muted uppercase tracking-wider mb-2">Overdue tasks</p>
                <div className="space-y-2">
                  {metrics.overdueTasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-accent-rose/5 border border-accent-rose/20">
                      <span className="text-sm text-nova-text truncate">{t.title}</span>
                      <Badge color="rose">Overdue</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Habits */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-nova-text flex items-center gap-2">
                <Coffee className="w-5 h-5 text-accent-emerald" />
                Habits
              </h2>
              <div className="flex items-center gap-2">
                <Badge color="emerald">{metrics.habitCompletionRate}%</Badge>
                <Badge color="gold">{metrics.longestStreak}d streak</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-accent-emerald/5 border border-accent-emerald/20">
                <p className="text-2xl font-bold text-accent-emerald">{metrics.goodHabits}</p>
                <p className="text-xs text-nova-muted">Positive habits</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent-rose/5 border border-accent-rose/20">
                <p className="text-2xl font-bold text-accent-rose">{metrics.badHabits}</p>
                <p className="text-xs text-nova-muted">To break</p>
              </div>
            </div>
            {metrics.topHabit && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-nova-surface">
                <div className="w-8 h-8 rounded-lg bg-accent-emerald/15 flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-accent-emerald" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-nova-text">{metrics.topHabit.title}</p>
                  <p className="text-xs text-nova-muted">
                    {metrics.topHabit.streak ? `${metrics.topHabit.streak} day streak` : 'Start today!'}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Status */}
        <div className="space-y-4">
          {/* Wellness */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-nova-text flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-accent-rose" />
              Wellness
            </h2>
            <div className="space-y-4">
              <MetricBar label="Energy" value={metrics.avgEnergy} color={metrics.avgEnergy > 6 ? 'emerald' : metrics.avgEnergy > 4 ? 'amber' : 'rose'} />
              <MetricBar label="Mood" value={metrics.avgMood} color={metrics.avgMood > 6 ? 'emerald' : metrics.avgMood > 4 ? 'amber' : 'rose'} />
              <MetricBar label="Stress" value={metrics.avgStress} inverted color={metrics.avgStress < 5 ? 'emerald' : metrics.avgStress < 7 ? 'amber' : 'rose'} />
            </div>
            <div className="mt-4 pt-4 border-t border-nova-border">
              <p className="text-xs text-nova-muted mb-2">Recommendation</p>
              <p className="text-sm text-nova-text">{metrics.recommendations[0]}</p>
            </div>
          </Card>

          {/* Finance */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-nova-text flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-accent-emerald" />
              Finance
            </h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-nova-muted">This month</span>
                <span className="font-medium text-nova-text">${metrics.monthExpenses.toFixed(0)} / ${metrics.monthlyBudget}</span>
              </div>
              <ProgressBar
                value={(metrics.monthExpenses / metrics.monthlyBudget) * 100}
                color={metrics.monthExpenses > metrics.monthlyBudget ? 'rose' : 'emerald'}
              />
              <p className={`text-xs mt-1 ${metrics.budgetRemaining >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                {metrics.budgetRemaining >= 0 ? `$${metrics.budgetRemaining.toFixed(0)} remaining` : `$${Math.abs(metrics.budgetRemaining).toFixed(0)} over budget`}
              </p>
            </div>
            {metrics.activeSubscriptions > 0 && (
              <div className="pt-3 border-t border-nova-border">
                <div className="flex justify-between">
                  <span className="text-xs text-nova-muted">Subscriptions</span>
                  <span className="text-xs text-nova-text">{metrics.activeSubscriptions} (${metrics.monthlySubscriptionCost.toFixed(0)}/mo)</span>
                </div>
              </div>
            )}
          </Card>

          {/* Social */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-nova-text flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-accent-violet" />
              Relationships
            </h2>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-nova-muted">{metrics.contacts} contacts</span>
              {metrics.contactsNeedingAttention > 0 && (
                <Badge color="amber">{metrics.contactsNeedingAttention} need attention</Badge>
              )}
            </div>
            {metrics.contactsNeedingAttention > 0 && (
              <p className="text-xs text-nova-dim">Reach out to someone today</p>
            )}
          </Card>

          {/* Quests */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-nova-text flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-accent-gold" />
              Active Quests
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-nova-surface">
                <p className="text-xl font-bold text-nova-text">{metrics.activeQuests}</p>
                <p className="text-xs text-nova-muted">Quests</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-nova-surface">
                <p className="text-xl font-bold text-nova-text">{metrics.activeBosses}</p>
                <p className="text-xs text-nova-muted">Bosses</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper components
function ScoreCard({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <Card className="p-4 flex flex-col items-center">
      <ScoreRing value={score} label={label} color={color} size={70} />
    </Card>
  );
}

function MetricBar({ label, value, color, inverted }: { label: string; value: number; color: string; inverted?: boolean }) {
  const barColor = inverted
    ? value > 6 ? 'rose' : value > 4 ? 'amber' : color
    : color;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-nova-muted">{label}</span>
        <span className={`text-nova-text font-medium`}>{value}/10</span>
      </div>
      <div className="h-2 bg-nova-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            barColor === 'emerald' ? 'bg-accent-emerald' :
            barColor === 'amber' ? 'bg-accent-amber' :
            'bg-accent-rose'
          }`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

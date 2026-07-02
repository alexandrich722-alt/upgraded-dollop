import { useState, useMemo } from 'react';
import { Target, FolderKanban, TrendingUp, Wallet, BookOpen, Clock, Calendar, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store';
import { Card, SectionHeader, ScoreRing, ProgressBar, Badge } from '../components/ui';

const allCards = [
  { id: 'lifeScore', label: 'Life Score', color: 'cyan' },
  { id: 'clarityScore', label: 'Clarity Score', color: 'violet' },
  { id: 'energyScore', label: 'Energy Score', color: 'gold' },
  { id: 'progressScore', label: 'Progress Score', color: 'emerald' },
  { id: 'weeklyProgress', label: 'Weekly Progress', color: 'cyan' },
  { id: 'activeGoals', label: 'Active Goals', color: 'violet' },
  { id: 'activeProjects', label: 'Active Projects', color: 'blue' },
  { id: 'focusTime', label: 'Focus Time', color: 'gold' },
  { id: 'habitsCompletion', label: 'Habits Completion', color: 'emerald' },
  { id: 'financeOverview', label: 'Finance Overview', color: 'emerald' },
  { id: 'reflectionTrend', label: 'Reflection Trend', color: 'rose' },
  { id: 'upcomingDeadlines', label: 'Upcoming Deadlines', color: 'gold' },
  { id: 'aiInsight', label: 'AI Insight of the Day', color: 'cyan' },
];

export default function Dashboard() {
  const { state, updateSettings } = useStore();
  const [showToggle, setShowToggle] = useState(false);
  const visible = state.settings.dashboardCards;

  const toggleCard = (id: string) => {
    const next = visible.includes(id) ? visible.filter(c => c !== id) : [...visible, id];
    updateSettings({ dashboardCards: next });
  };

  const activeGoals = state.goals.filter(g => g.status === 'active' && !g.archived);
  const activeProjects = state.projects.filter(p => p.status === 'active' && !p.archived);
  const doneTasks = state.tasks.filter(t => t.status === 'done');
  const habits = state.habits.filter(h => !h.archived);
  const avgHabitRate = habits.length ? Math.round(habits.reduce((a, h) => a + h.completionRate, 0) / habits.length) : 0;
  const expenses = state.finance.transactions.filter(t => t.type === 'expense');
  const monthExpenses = expenses.filter(t => t.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((a, t) => a + t.amount, 0);
  const upcomingDeadlines = state.tasks.filter(t => !t.archived && t.status !== 'done' && t.deadline).filter(t => {
    const d = new Date(t.deadline as string);
    const diff = (d.getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= 7;
  }).sort((a, b) => new Date(a.deadline as string).getTime() - new Date(b.deadline as string).getTime());

  const recentReflections = state.reflections.slice(0, 7);
  const avgMood = recentReflections.length ? recentReflections.reduce((a, r) => a + r.mood, 0) / recentReflections.length : 0;

  const weeklyData = useMemo(() => {
    const days: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const completed = state.tasks.filter(t => t.status === 'done' && t.completedAt && t.completedAt.startsWith(dayStr)).length;
      const habitsDone = state.habits.filter(h => h.history.some(hd => hd.startsWith(dayStr))).length;
      days.push({ label: d.toLocaleDateString('en', { weekday: 'narrow' }), value: completed + habitsDone });
    }
    return days;
  }, [state.tasks, state.habits]);

  const maxWeekly = Math.max(...weeklyData.map(d => d.value), 1);

  const renderCard = (id: string) => {
    switch (id) {
      case 'lifeScore': return <ScoreCard score={state.profile.lifeScore} label="Life Score" color="cyan" mesh="gradient-mesh" />;
      case 'clarityScore': return <ScoreCard score={state.profile.clarityScore} label="Clarity Score" color="violet" mesh="gradient-mesh-violet" />;
      case 'energyScore': return <ScoreCard score={state.profile.energyScore} label="Energy Score" color="gold" mesh="gradient-mesh-gold" />;
      case 'progressScore': return <ScoreCard score={state.profile.progressScore} label="Progress Score" color="emerald" mesh="gradient-mesh-emerald" />;
      case 'weeklyProgress':
        return (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-accent-cyan" /><h3 className="section-title text-sm">Weekly Progress</h3></div>
            <div className="flex items-end justify-between gap-1.5 h-24">
              {weeklyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-gradient-to-t from-accent-cyan/30 to-accent-cyan rounded-t-md transition-all duration-700 ease-out" style={{ height: `${(d.value / maxWeekly) * 100}%`, minHeight: d.value > 0 ? '8px' : '2px', boxShadow: d.value > 0 ? '0 0 8px rgba(34,211,238,0.2)' : 'none' }} />
                  <span className="text-[10px] text-nova-muted">{d.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-nova-muted mt-3 text-center">{weeklyData.reduce((a, d) => a + d.value, 0)} completions this week</p>
          </Card>
        );
      case 'activeGoals':
        return (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-accent-violet" /><h3 className="section-title text-sm">Active Goals</h3></div>
            <p className="font-display text-3xl font-bold text-nova-text mb-3">{activeGoals.length}</p>
            <div className="space-y-2">
              {activeGoals.slice(0, 3).map(g => (
                <div key={g.id}>
                  <div className="flex justify-between text-xs mb-1"><span className="text-nova-dim truncate">{g.title}</span><span className="text-nova-muted">{g.progress}%</span></div>
                  <ProgressBar value={g.progress} color="violet" size="sm" />
                </div>
              ))}
            </div>
          </Card>
        );
      case 'activeProjects':
        return (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3"><FolderKanban className="w-4 h-4 text-accent-blue" /><h3 className="section-title text-sm">Active Projects</h3></div>
            <p className="font-display text-3xl font-bold text-nova-text mb-3">{activeProjects.length}</p>
            <div className="space-y-1.5">
              {activeProjects.slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <span className="text-nova-dim truncate">{p.title}</span>
                  <Badge color="blue">{p.progress}%</Badge>
                </div>
              ))}
            </div>
          </Card>
        );
      case 'focusTime':
        return (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-accent-gold" /><h3 className="section-title text-sm">Focus Time</h3></div>
            <p className="font-display text-3xl font-bold text-nova-text">{doneTasks.reduce((a, t) => a + t.actualMinutes, 0)}<span className="text-base text-nova-muted ml-1">min</span></p>
            <p className="text-xs text-nova-muted mt-1">{doneTasks.length} tasks completed</p>
          </Card>
        );
      case 'habitsCompletion':
        return (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-accent-emerald" /><h3 className="section-title text-sm">Habits Completion</h3></div>
            <p className="font-display text-3xl font-bold text-nova-text mb-2">{avgHabitRate}%</p>
            <ProgressBar value={avgHabitRate} color="emerald" />
            <p className="text-xs text-nova-muted mt-2">{habits.length} habits tracked</p>
          </Card>
        );
      case 'financeOverview':
        return (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3"><Wallet className="w-4 h-4 text-accent-emerald" /><h3 className="section-title text-sm">Finance Overview</h3></div>
            <p className="font-display text-3xl font-bold text-nova-text">${monthExpenses.toFixed(0)}<span className="text-sm text-nova-muted ml-1">/ ${state.finance.monthlyBudget}</span></p>
            <ProgressBar value={state.finance.monthlyBudget > 0 ? Math.min(100, (monthExpenses / state.finance.monthlyBudget) * 100) : 0} color={monthExpenses > state.finance.monthlyBudget ? 'rose' : 'emerald'} />
            <p className="text-xs text-nova-muted mt-2">Spent this month</p>
          </Card>
        );
      case 'reflectionTrend':
        return (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3"><BookOpen className="w-4 h-4 text-accent-rose" /><h3 className="section-title text-sm">Reflection Trend</h3></div>
            <p className="font-display text-3xl font-bold text-nova-text">{avgMood.toFixed(1)}<span className="text-sm text-nova-muted ml-1">/ 10</span></p>
            <p className="text-xs text-nova-muted mt-2">Avg mood, last {recentReflections.length} entries</p>
          </Card>
        );
      case 'upcomingDeadlines':
        return (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-accent-gold" /><h3 className="section-title text-sm">Upcoming Deadlines</h3></div>
            {upcomingDeadlines.length === 0 ? <p className="text-sm text-nova-muted">No deadlines this week</p> : (
              <div className="space-y-2">
                {upcomingDeadlines.slice(0, 4).map(t => {
                  const days = Math.ceil((new Date(t.deadline as string).getTime() - Date.now()) / 86400000);
                  return (
                    <div key={t.id} className="flex items-center justify-between text-xs">
                      <span className="text-nova-dim truncate flex-1">{t.title}</span>
                      <Badge color={days <= 1 ? 'rose' : days <= 3 ? 'gold' : 'muted'}>{days <= 0 ? 'Today' : `${days}d`}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      case 'aiInsight':
        return (
          <Card className="p-5 gradient-mesh border-accent-cyan/20">
            <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-accent-cyan" /><h3 className="section-title text-sm">AI Insight of the Day</h3></div>
            <p className="text-sm text-nova-text leading-relaxed">
              {activeGoals.length > 0
                ? `You have ${activeGoals.length} active goals and ${state.tasks.filter(t => !t.archived && t.status !== 'done').length} active tasks. Focus on "${activeGoals[0].title}" — ${activeGoals[0].progress}% done. ${state.tasks.filter(t => !t.archived && t.status !== 'done' && !t.goalId).length > 0 ? `${state.tasks.filter(t => !t.archived && t.status !== 'done' && !t.goalId).length} tasks aren't linked to any goal — link or delete them.` : 'All tasks are connected to goals. Good graph health.'}`
                : 'Set a goal to get personalized AI insights.'}
            </p>
            <p className="text-xs text-nova-muted mt-3 italic">Demo analysis — AI unavailable.</p>
          </Card>
        );
      default: return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      <SectionHeader
        title="Dashboard"
        subtitle="Your life at a glance"
        action={<button onClick={() => setShowToggle(!showToggle)} className="btn-ghost text-xs" aria-label="Customize dashboard">{showToggle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}{showToggle ? 'Hide' : 'Customize'}</button>}
      />
      {showToggle && (
        <Card className="p-4 mb-4 animate-slide-up">
          <p className="text-xs text-nova-muted mb-3">Toggle cards to show/hide</p>
          <div className="flex flex-wrap gap-2">
            {allCards.map(c => (
              <button key={c.id} onClick={() => toggleCard(c.id)} className={`badge cursor-pointer transition-all ${visible.includes(c.id) ? 'bg-accent-cyan/12 text-accent-cyan border border-accent-cyan/20' : 'bg-nova-surface text-nova-muted border border-nova-border'}`}>{c.label}</button>
            ))}
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map(id => <div key={id} className={id === 'aiInsight' ? 'sm:col-span-2' : ''}>{renderCard(id)}</div>)}
      </div>
    </div>
  );
}

function ScoreCard({ score, label, color, mesh }: { score: number; label: string; color: string; mesh: string }) {
  return (
    <Card className={`p-5 flex flex-col items-center justify-center ${mesh}`}>
      <ScoreRing value={score} label={label} color={color} size={90} />
    </Card>
  );
}

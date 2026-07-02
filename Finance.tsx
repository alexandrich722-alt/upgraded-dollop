import { useState, useEffect } from 'react';
import { Zap, Target, TrendingUp, Wallet, Users, AlertTriangle, Heart, Play, Moon, CheckCircle2, Circle, Clock, BookOpen } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { generateTodayMission } from '../lib/ai';
import { Card, SectionHeader, Badge, Modal, EmptyState } from '../components/ui';
import type { TodayMission as TM } from '../types';

export default function TodayMission() {
  const { state, setTodayMission, toggleTask, addReflection } = useStore();
  const { toast } = useToast();
  const [showCheckin, setShowCheckin] = useState(false);
  const [showEveningReview, setShowEveningReview] = useState(false);
  const [energy, setEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [mood, setMood] = useState(5);
  const [focus, setFocus] = useState('');
  const [constraints, setConstraints] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewLesson, setReviewLesson] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const hasMission = state.todayMission && state.todayMission.date.startsWith(todayStr);

  useEffect(() => { if (!hasMission) setShowCheckin(true); }, [hasMission]);

  const generateMission = () => {
    const gen = generateTodayMission(state);
    const mission: TM = {
      date: new Date().toISOString(),
      mainFocus: focus || gen.mainFocus,
      topTasks: gen.topTasks,
      energyStatus: energy === 'low' ? 'Low — keep to essential tasks only' : energy === 'high' ? 'High — plan 2 deep work blocks' : 'Medium — 1 deep work block max',
      habitOfTheDay: gen.habitOfTheDay,
      financeSignal: gen.financeSignal,
      relationshipReminder: gen.relationshipReminder,
      riskWarning: gen.riskWarning,
      recoveryAction: gen.recoveryAction,
      startedAt: null, completedAt: null,
    };
    setTodayMission(mission);
    setShowCheckin(false);
    toast('success', 'Today Mission generated');
  };

  const startMission = () => { if (state.todayMission) { setTodayMission({ ...state.todayMission, startedAt: new Date().toISOString() }); toast('success', 'Mission started — let\'s go!'); } };
  const completeMission = () => setShowEveningReview(true);

  const saveEveningReview = () => {
    const m = state.todayMission;
    if (!m) return;
    const done = m.topTasks.map(id => state.tasks.find(t => t.id === id)).filter(t => t && t.status === 'done');
    const notDone = m.topTasks.map(id => state.tasks.find(t => t.id === id)).filter(t => t && t.status !== 'done');
    addReflection({
      date: new Date().toISOString(),
      text: reviewText || `Evening Review:\nCompleted: ${done.map(t => t!.title).join(', ') || 'none'}\nNot done: ${notDone.map(t => t!.title).join(', ') || 'all done!'}`,
      mood, energy: energy === 'low' ? 3 : energy === 'high' ? 8 : 5,
      stress: notDone.length > 2 ? 7 : 4, tags: ['evening-review'],
      insights: reviewLesson ? [reviewLesson] : [], linkedGoals: [], linkedTasks: m.topTasks,
    });
    setTodayMission({ ...m, completedAt: new Date().toISOString() });
    setShowEveningReview(false);
    toast('success', 'Evening review saved. Great work today!');
  };

  if (!hasMission || !state.todayMission) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <SectionHeader title="Today Mission" subtitle="Start your day with a short check-in" />
        <Card className="p-6 sm:p-8 gradient-mesh">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 flex items-center justify-center animate-pulse-glow border border-accent-cyan/20">
              <Zap className="w-10 h-10 text-accent-cyan" />
            </div>
            <h2 className="font-display text-2xl font-bold text-nova-text mb-2 tracking-tight">Morning Check-in</h2>
            <p className="text-sm text-nova-dim max-w-md mx-auto">Take 30 seconds to set the tone. NOVA will build your mission from this.</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="label">Energy Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map(e => (
                  <button key={e} onClick={() => setEnergy(e)} className={`btn transition-all ${energy === e ? 'bg-accent-cyan text-nova-bg font-semibold shadow-glow-cyan' : 'btn-ghost'}`}>
                    {e.charAt(0).toUpperCase() + e.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Mood: {mood}/10</label>
              <input type="range" min="1" max="10" value={mood} onChange={e => setMood(Number(e.target.value))} className="w-full accent-accent-cyan" aria-label="Mood level" />
            </div>
            <div>
              <label className="label">Main Focus Today</label>
              <input className="input" placeholder="e.g., Ship the Today Mission screen" value={focus} onChange={e => setFocus(e.target.value)} />
            </div>
            <div>
              <label className="label">Constraints / Limitations</label>
              <input className="input" placeholder="e.g., Meetings 2-4pm, low energy afternoon" value={constraints} onChange={e => setConstraints(e.target.value)} />
            </div>
            <button onClick={generateMission} className="btn-primary w-full text-base py-3">
              <Zap className="w-5 h-5" /> Generate Today Mission
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const m = state.todayMission;
  const tasks = m.topTasks.map(id => state.tasks.find(t => t.id === id)).filter(Boolean);
  const habit = state.habits.find(h => h.id === m.habitOfTheDay);
  const doneCount = tasks.filter(t => t!.status === 'done').length;
  const started = !!m.startedAt;
  const completed = !!m.completedAt;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <SectionHeader
        title="Today Mission"
        subtitle={new Date(m.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        action={completed ? <Badge color="emerald">Completed</Badge> : started ? <Badge color="gold">{doneCount}/{tasks.length} done</Badge> : <Badge color="cyan">Ready</Badge>}
      />

      {/* Main Focus — premium hero card */}
      <Card className="p-5 sm:p-6 mb-4 gradient-mesh border-accent-cyan/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-cyan/15 flex items-center justify-center shrink-0 border border-accent-cyan/20">
            <Target className="w-6 h-6 text-accent-cyan" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-nova-muted uppercase tracking-wider mb-1">Main Focus of the Day</p>
            <h2 className="font-display text-xl font-bold text-nova-text tracking-tight">{m.mainFocus}</h2>
            {constraints && <p className="text-xs text-nova-muted mt-1.5">{constraints}</p>}
          </div>
        </div>
      </Card>

      {/* Top 3 Tasks */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
            <h3 className="section-title">Top 3 Tasks</h3>
          </div>
          {tasks.length > 0 && <span className="text-xs text-nova-muted">{doneCount}/{tasks.length} completed</span>}
        </div>
        {tasks.length === 0 ? (
          <EmptyState title="No tasks selected" description="Add tasks to build your mission" />
        ) : (
          <div className="space-y-2">
            {tasks.map((t, i) => (
              <div key={t!.id} className="flex items-center gap-3 p-3 rounded-xl bg-nova-surface hover:bg-nova-card-hover transition-all duration-200 group">
                <button onClick={() => toggleTask(t!.id)} className="shrink-0 hover:scale-110 transition-transform" aria-label={`Toggle: ${t!.title}`}>
                  {t!.status === 'done'
                    ? <CheckCircle2 className="w-5 h-5 text-accent-emerald" style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.4))' }} />
                    : <Circle className="w-5 h-5 text-nova-muted group-hover:text-accent-cyan transition-colors" />}
                </button>
                <span className="text-xs text-nova-muted font-mono">{i + 1}.</span>
                <span className={`flex-1 text-sm ${t!.status === 'done' ? 'line-through text-nova-muted' : 'text-nova-text'}`}>{t!.title}</span>
                {t!.estimatedMinutes > 0 && <span className="flex items-center gap-1 text-xs text-nova-muted"><Clock className="w-3 h-3" /> {t!.estimatedMinutes}m</span>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Signal cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SignalCard icon={Zap} color="gold" title="Energy Status" text={m.energyStatus} />
        <SignalCard icon={Wallet} color="emerald" title="Finance Signal" text={m.financeSignal} />
        <SignalCard icon={Users} color="blue" title="Relationship Reminder" text={m.relationshipReminder} />
        <SignalCard icon={AlertTriangle} color="rose" title="Risk Warning" text={m.riskWarning} />
        <SignalCard icon={Heart} color="rose" title="Recovery Action" text={m.recoveryAction} />
        {habit && (
          <Card className="p-4 gradient-mesh-violet">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent-violet/15 flex items-center justify-center border border-accent-violet/20">
                <TrendingUp className="w-4 h-4 text-accent-violet" />
              </div>
              <div>
                <p className="text-xs text-nova-muted uppercase tracking-wider">Habit of the Day</p>
                <p className="text-sm font-medium text-nova-text">{habit.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge color="violet">{habit.streak} day streak</Badge>
              <span className="text-xs text-nova-muted">{habit.completionRate}% completion</span>
            </div>
          </Card>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!started ? (
          <button onClick={startMission} className="btn-primary flex-1 py-3 text-base">
            <Play className="w-5 h-5" /> Start Mission
          </button>
        ) : !completed ? (
          <button onClick={completeMission} className="btn-violet flex-1 py-3 text-base">
            <Moon className="w-5 h-5" /> Evening Review
          </button>
        ) : (
          <div className="flex-1 text-center py-3 text-accent-emerald font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Mission Complete
          </div>
        )}
        <button onClick={() => setShowCheckin(true)} className="btn-ghost py-3">Regenerate</button>
      </div>

      {/* Modals */}
      <Modal open={showCheckin} onClose={() => setShowCheckin(false)} title="Regenerate Today Mission">
        <div className="space-y-4">
          <div>
            <label className="label">Energy Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map(e => (
                <button key={e} onClick={() => setEnergy(e)} className={`btn ${energy === e ? 'bg-accent-cyan text-nova-bg font-semibold' : 'btn-ghost'}`}>{e.charAt(0).toUpperCase() + e.slice(1)}</button>
              ))}
            </div>
          </div>
          <div><label className="label">Main Focus</label><input className="input" value={focus} onChange={e => setFocus(e.target.value)} placeholder="What matters most today?" /></div>
          <button onClick={generateMission} className="btn-primary w-full">Regenerate Mission</button>
        </div>
      </Modal>

      <Modal open={showEveningReview} onClose={() => setShowEveningReview(false)} title="Evening Review" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-nova-surface border border-nova-border">
            <p className="text-xs text-nova-muted uppercase tracking-wider mb-2">Today's Results</p>
            <div className="space-y-1">
              {tasks.map(t => (
                <div key={t!.id} className="flex items-center gap-2 text-sm">
                  {t!.status === 'done' ? <CheckCircle2 className="w-4 h-4 text-accent-emerald" /> : <Circle className="w-4 h-4 text-nova-muted" />}
                  <span className={t!.status === 'done' ? 'text-nova-text' : 'text-nova-dim'}>{t!.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div><label className="label">What happened today?</label><textarea className="input min-h-[80px] resize-none" value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Reflect on your day..." /></div>
          <div><label className="label">Lesson of the day</label><input className="input" value={reviewLesson} onChange={e => setReviewLesson(e.target.value)} placeholder="What did you learn?" /></div>
          <div><label className="label">Mood: {mood}/10</label><input type="range" min="1" max="10" value={mood} onChange={e => setMood(Number(e.target.value))} className="w-full accent-accent-violet" /></div>
          <button onClick={saveEveningReview} className="btn-primary w-full py-3"><BookOpen className="w-4 h-4" /> Save Evening Review</button>
        </div>
      </Modal>
    </div>
  );
}

function SignalCard({ icon: Icon, color, title, text }: { icon: any; color: string; title: string; text: string }) {
  const colors: Record<string, string> = {
    gold: 'bg-accent-gold/12 text-accent-gold border-accent-gold/15',
    emerald: 'bg-accent-emerald/12 text-accent-emerald border-accent-emerald/15',
    blue: 'bg-accent-blue/12 text-accent-blue border-accent-blue/15',
    rose: 'bg-accent-rose/12 text-accent-rose border-accent-rose/15',
    cyan: 'bg-accent-cyan/12 text-accent-cyan border-accent-cyan/15',
  };
  const meshes: Record<string, string> = {
    gold: 'gradient-mesh-gold', emerald: 'gradient-mesh-emerald', blue: 'gradient-mesh',
    rose: 'gradient-mesh-rose', cyan: 'gradient-mesh',
  };
  return (
    <Card className={`p-4 ${meshes[color] || meshes.cyan}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colors[color] || colors.cyan}`}>
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-xs text-nova-muted uppercase tracking-wider">{title}</p>
      </div>
      <p className="text-sm text-nova-text">{text}</p>
    </Card>
  );
}

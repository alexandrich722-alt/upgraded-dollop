import { useState } from 'react';
import { Swords, Plus, Trash2, Clock, Award, Target, Check, Zap } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, ProgressBar, Modal, EmptyState, ConfirmDialog } from '../components/ui';
import type { Quest } from '../types';

const questTypes = [
  { duration: 7 as const, label: '7-Day Sprint', color: 'cyan', days: 7 },
  { duration: 14 as const, label: '14-Day Challenge', color: 'violet', days: 14 },
  { duration: 30 as const, label: '30-Day Quest', color: 'gold', days: 30 },
  { duration: 90 as const, label: '90-Day Epic', color: 'rose', days: 90 },
];

export default function Quests() {
  const { state, addQuest, updateQuest, deleteQuest } = useStore();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Quest>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const quests = state.quests;

  const openNew = () => {
    setForm({ title: '', description: '', duration: 7, stages: [{ title: 'Start', done: false }, { title: 'Midpoint', done: false }, { title: 'Finish', done: false }], linkedGoal: null, xpReward: 100, status: 'active', dailyMissions: [], rewards: ['XP', 'Skill point'], createdAt: new Date().toISOString() });
    setShowForm(true);
  };

  const save = () => {
    if (!form.title?.trim()) return;
    addQuest(form);
    toast('success', 'Quest created');
    setShowForm(false);
  };

  const toggleStage = (questId: string, stageIdx: number) => {
    const q = state.quests.find(x => x.id === questId);
    if (!q) return;
    const stages = q.stages.map((s, i) => i === stageIdx ? { ...s, done: !s.done } : s);
    const allDone = stages.every(s => s.done);
    updateQuest(questId, { stages, status: allDone ? 'completed' : 'active' });
    if (allDone) toast('success', `Quest complete! +${q.xpReward} XP earned!`);
    else toast('info', 'Stage toggled');
  };

  const completeQuest = (q: Quest) => {
    updateQuest(q.id, { status: 'completed' });
    toast('success', `Quest "${q.title}" completed! +${q.xpReward} XP!`);
  };

  const daysLeft = (createdAt: string, totalDays: number) => {
    const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
    return Math.max(0, totalDays - elapsed);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <SectionHeader title="RPG Quests" subtitle={`${quests.filter(q => q.status === 'active').length} active quests`} action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> New Quest</button>} />

      {quests.length === 0 ? (
        <EmptyState icon={<Swords className="w-8 h-8" />} title="No quests yet" description="Embark on a quest to level up" action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Create Quest</button>} />
      ) : (
        <div className="space-y-4">
          {quests.map(q => {
            const qt = questTypes.find(t => t.duration === q.duration) || questTypes[0];
            const doneStages = q.stages.filter(s => s.done).length;
            const progress = q.stages.length > 0 ? (doneStages / q.stages.length) * 100 : 0;
            const left = daysLeft(q.createdAt, qt.days);
            const goal = state.goals.find(g => g.id === q.linkedGoal);
            const isComplete = q.status === 'completed';
            return (
              <Card key={q.id} className={`p-5 ${isComplete ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Swords className={`w-4 h-4 ${isComplete ? 'text-accent-emerald' : 'text-accent-cyan'}`} />
                      <h3 className="font-display font-semibold text-nova-text">{q.title}</h3>
                      {isComplete && <Badge color="emerald"><Check className="w-3 h-3" /> Complete</Badge>}
                    </div>
                    {q.description && <p className="text-xs text-nova-dim">{q.description}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!isComplete && doneStages === q.stages.length && <button onClick={() => completeQuest(q)} className="btn-ghost text-xs"><Award className="w-3.5 h-3.5 text-accent-gold" /> Claim</button>}
                    <button onClick={() => setDeleteId(q.id)} className="p-1.5 rounded-lg hover:bg-nova-surface"><Trash2 className="w-4 h-4 text-nova-muted hover:text-accent-rose" /></button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge color={qt.color}>{qt.label}</Badge>
                  {goal && <Badge color="violet"><Target className="w-3 h-3" /> {goal.title}</Badge>}
                  <Badge color="gold"><Zap className="w-3 h-3" /> {q.xpReward} XP</Badge>
                  {!isComplete && <Badge color="muted"><Clock className="w-3 h-3" /> {left}d left</Badge>}
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span className="text-nova-muted">Progress</span><span className="text-nova-text">{doneStages}/{q.stages.length} stages</span></div>
                  <ProgressBar value={progress} color={qt.color} />
                </div>

                <div className="space-y-1">
                  {q.stages.map((s, i) => (
                    <button key={i} onClick={() => toggleStage(q.id, i)} disabled={isComplete} className="flex items-center gap-2 text-xs w-full text-left p-2 rounded-lg hover:bg-nova-surface transition-colors disabled:cursor-default">
                      <span className={s.done ? 'text-accent-emerald' : 'text-nova-muted'}>{s.done ? '✓' : '○'}</span>
                      <span className={s.done ? 'text-nova-muted line-through' : 'text-nova-dim'}>{s.title}</span>
                    </button>
                  ))}
                </div>

                {q.rewards.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-nova-border">
                    <span className="text-xs text-nova-muted">Rewards:</span>
                    {q.rewards.map((r, i) => <Badge key={i} color="gold">{r}</Badge>)}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Quest">
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., 30-Day Deep Work Challenge" autoFocus /></div>
          <div><label className="label">Description</label><input className="input" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label">Quest Type</label>
            <div className="grid grid-cols-2 gap-2">
              {questTypes.map(qt => <button key={qt.duration} onClick={() => setForm({ ...form, duration: qt.duration, xpReward: qt.days * 10 })} className={`btn text-xs ${form.duration === qt.duration ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25' : 'btn-ghost'}`}>{qt.label}</button>)}
            </div>
          </div>
          <div><label className="label">Linked Goal</label><select className="input" value={form.linkedGoal || ''} onChange={e => setForm({ ...form, linkedGoal: e.target.value || null })}><option value="">None</option>{state.goals.filter(g => !g.archived).map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</select></div>
          <div><label className="label">XP Reward</label><input type="number" className="input" value={form.xpReward || 100} onChange={e => setForm({ ...form, xpReward: Number(e.target.value) })} /></div>
          <button onClick={save} className="btn-primary w-full">Create Quest</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { deleteQuest(deleteId); toast('info', 'Quest deleted'); } }} title="Delete Quest" message="Are you sure?" />
    </div>
  );
}

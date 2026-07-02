import { useState } from 'react';
import { Plus, Target, Trash2, Edit3, Check, Milestone, ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, ProgressBar, Modal, PriorityBadge, StatusBadge, EmptyState, ConfirmDialog } from '../components/ui';
import type { Goal } from '../types';

const emptyGoal: Partial<Goal> = { title: '', description: '', category: 'General', why: '', status: 'active', priority: 'medium', deadline: null, progress: 0 };

export default function Goals() {
  const { state, addGoal, updateGoal, deleteGoal, toggleMilestone, addMilestone } = useStore();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState<Partial<Goal>>(emptyGoal);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newMilestone, setNewMilestone] = useState<Record<string, string>>({});

  const goals = state.goals.filter(g => !g.archived);

  const openNew = () => { setForm(emptyGoal); setEditing(null); setShowForm(true); };
  const openEdit = (g: Goal) => { setForm(g); setEditing(g); setShowForm(true); };

  const save = () => {
    if (!form.title?.trim()) return;
    if (editing) { updateGoal(editing.id, form); toast('success', 'Goal updated'); }
    else { addGoal(form); toast('success', 'Goal created'); }
    setShowForm(false);
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const addMs = (goalId: string) => {
    const title = newMilestone[goalId]?.trim();
    if (!title) return;
    addMilestone(goalId, title);
    setNewMilestone({ ...newMilestone, [goalId]: '' });
    toast('success', 'Milestone added');
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto animate-fade-in">
      <SectionHeader title="Goals" subtitle={`${goals.length} active goals`} action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> New Goal</button>} />

      {goals.length === 0 ? (
        <EmptyState icon={<Target className="w-8 h-8" />} title="No goals yet" description="Create your first goal to start operating your life" action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Create Goal</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(g => {
            const isExpanded = expanded.has(g.id);
            const doneMs = g.milestones.filter(m => m.done).length;
            return (
              <Card key={g.id} className="p-5 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-nova-text mb-1">{g.title}</h3>
                    <p className="text-xs text-nova-dim">{g.category}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg hover:bg-nova-surface" aria-label="Edit goal"><Edit3 className="w-4 h-4 text-nova-muted" /></button>
                    <button onClick={() => setDeleteId(g.id)} className="p-1.5 rounded-lg hover:bg-nova-surface" aria-label="Delete goal"><Trash2 className="w-4 h-4 text-accent-rose" /></button>
                  </div>
                </div>

                {g.description && <p className="text-sm text-nova-dim mb-3">{g.description}</p>}
                {g.why && <p className="text-xs text-nova-muted italic mb-3">Why: {g.why}</p>}

                <div className="flex items-center gap-2 mb-3">
                  <PriorityBadge priority={g.priority} />
                  <StatusBadge status={g.status} />
                  {g.deadline && <Badge color="muted">{new Date(g.deadline).toLocaleDateString()}</Badge>}
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span className="text-nova-muted">Progress</span><span className="text-nova-text font-medium">{g.progress}%</span></div>
                  <ProgressBar value={g.progress} color="violet" />
                </div>

                {/* Milestones — expandable */}
                {g.milestones.length > 0 && (
                  <div className="mb-2">
                    <button onClick={() => toggleExpand(g.id)} className="flex items-center gap-1 text-xs text-nova-muted uppercase tracking-wider mb-1 hover:text-nova-text transition-colors">
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      <Milestone className="w-3 h-3" /> Milestones ({doneMs}/{g.milestones.length})
                    </button>
                    {isExpanded && (
                      <div className="space-y-1 animate-slide-up">
                        {g.milestones.map(m => (
                          <button key={m.id} onClick={() => toggleMilestone(g.id, m.id)} className="flex items-center gap-2 text-xs w-full text-left p-1.5 rounded-lg hover:bg-nova-surface transition-colors">
                            <span className={m.done ? 'text-accent-emerald' : 'text-nova-muted'}>{m.done ? '✓' : '○'}</span>
                            <span className={m.done ? 'text-nova-muted line-through' : 'text-nova-dim'}>{m.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Add milestone */}
                {isExpanded && (
                  <div className="flex gap-2 mt-2 animate-slide-up">
                    <input
                      className="input text-xs py-1.5"
                      placeholder="New milestone..."
                      value={newMilestone[g.id] || ''}
                      onChange={e => setNewMilestone({ ...newMilestone, [g.id]: e.target.value })}
                      onKeyDown={e => { if (e.key === 'Enter') addMs(g.id); }}
                    />
                    <button onClick={() => addMs(g.id)} className="btn-ghost text-xs px-3"><Plus className="w-3 h-3" /></button>
                  </div>
                )}

                {!isExpanded && g.milestones.length === 0 && (
                  <button onClick={() => toggleExpand(g.id)} className="text-xs text-accent-cyan hover:text-accent-cyan/80">+ Add milestones</button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Goal' : 'New Goal'}>
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Launch NOVA MVP" autoFocus />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[60px] resize-none" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Why (motivation)</label>
            <input className="input" value={form.why || ''} onChange={e => setForm({ ...form, why: e.target.value })} placeholder="Why does this matter?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <input className="input" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority || 'medium'} onChange={e => setForm({ ...form, priority: e.target.value as any })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Deadline</label>
              <input type="date" className="input" value={form.deadline?.split('T')[0] || ''} onChange={e => setForm({ ...form, deadline: e.target.value ? new Date(e.target.value).toISOString() : null })} />
            </div>
            <div>
              <label className="label">Progress: {form.progress || 0}%</label>
              <input type="range" min="0" max="100" value={form.progress || 0} onChange={e => setForm({ ...form, progress: Number(e.target.value) })} className="w-full accent-accent-violet mt-3" />
            </div>
          </div>
          <p className="text-xs text-nova-muted">Tip: Progress auto-updates when you complete milestones.</p>
          <button onClick={save} className="btn-primary w-full"><Check className="w-4 h-4" /> {editing ? 'Save Changes' : 'Create Goal'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { deleteGoal(deleteId); toast('info', 'Goal deleted'); } }} title="Delete Goal" message="Are you sure? This cannot be undone." />
    </div>
  );
}

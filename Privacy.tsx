import { useState, useMemo } from 'react';
import { Plus, CheckSquare, Trash2, Clock, Calendar, Edit3, Circle, Play, CheckCircle2, Tag } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, Modal, PriorityBadge, EmptyState, ConfirmDialog } from '../components/ui';
import type { Task, Priority } from '../types';

export default function Tasks() {
  const { state, addTask, updateTask, deleteTask, cycleTaskStatus } = useStore();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'in_progress' | 'done'>('all');
  const [quickAdd, setQuickAdd] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [form, setForm] = useState<Partial<Task>>({ title: '', description: '', priority: 'medium', estimatedMinutes: 25, energyLevel: 'medium', tags: [] });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const tasks = useMemo(() => {
    let list = state.tasks.filter(t => !t.archived);
    const todayStr = new Date().toISOString().split('T')[0];
    if (filter === 'today') list = list.filter(t => t.deadline?.startsWith(todayStr) || t.status === 'in_progress');
    else if (filter === 'overdue') list = list.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done');
    else if (filter === 'in_progress') list = list.filter(t => t.status === 'in_progress');
    else if (filter === 'done') list = list.filter(t => t.status === 'done');
    return list.sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      const o = { critical: 0, high: 1, medium: 2, low: 3 };
      return o[a.priority] - o[b.priority];
    });
  }, [state.tasks, filter]);

  const quickAddTask = () => {
    if (!quickAdd.trim()) return;
    addTask({ title: quickAdd, priority: 'medium', estimatedMinutes: 25, energyLevel: 'medium' });
    toast('success', 'Task added');
    setQuickAdd('');
  };

  const openNew = () => {
    setForm({ title: '', description: '', priority: 'medium', estimatedMinutes: 25, energyLevel: 'medium', tags: [] });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (t: Task) => {
    setForm(t);
    setEditing(t);
    setShowForm(true);
  };

  const save = () => {
    if (!form.title?.trim()) return;
    if (editing) { updateTask(editing.id, form); toast('success', 'Task updated'); }
    else { addTask(form); toast('success', 'Task created'); }
    setShowForm(false);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setForm({ ...form, tags: [...(form.tags || []), tagInput.trim()] });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: (form.tags || []).filter(t => t !== tag) });
  };

  const counts = {
    all: state.tasks.filter(t => !t.archived).length,
    today: state.tasks.filter(t => !t.archived && t.deadline?.startsWith(new Date().toISOString().split('T')[0])).length,
    overdue: state.tasks.filter(t => !t.archived && t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length,
    in_progress: state.tasks.filter(t => !t.archived && t.status === 'in_progress').length,
    done: state.tasks.filter(t => t.status === 'done' && !t.archived).length,
  };

  const statusIcon = (status: string) => {
    if (status === 'done') return <CheckCircle2 className="w-5 h-5 text-accent-emerald" />;
    if (status === 'in_progress') return <Play className="w-5 h-5 text-accent-gold" fill="currentColor" />;
    return <Circle className="w-5 h-5 text-nova-muted" />;
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <SectionHeader title="Tasks" subtitle={`${counts.all} total · ${counts.overdue} overdue`} action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> New Task</button>} />

      {/* Quick add */}
      <div className="flex gap-2 mb-4">
        <input
          className="input flex-1"
          placeholder="Quick add a task and press Enter..."
          value={quickAdd}
          onChange={e => setQuickAdd(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') quickAddTask(); }}
          aria-label="Quick add task"
        />
        <button onClick={quickAddTask} className="btn-primary" aria-label="Add task"><Plus className="w-4 h-4" /></button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {(['all', 'today', 'overdue', 'in_progress', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`badge cursor-pointer whitespace-nowrap ${filter === f ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30' : 'bg-nova-surface text-nova-muted border border-nova-border'}`}>
            {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <EmptyState icon={<CheckSquare className="w-8 h-8" />} title="No tasks here" description="Add a task to get started" action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> New Task</button>} />
      ) : (
        <div className="space-y-2">
          {tasks.map(t => {
            const project = state.projects.find(p => p.id === t.projectId);
            const goal = state.goals.find(g => g.id === t.goalId);
            const overdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done';
            return (
              <Card key={t.id} className={`p-3 flex items-center gap-3 ${t.status === 'done' ? 'opacity-50' : ''} ${overdue ? 'border-accent-rose/30' : ''}`}>
                <button onClick={() => cycleTaskStatus(t.id)} className="shrink-0 hover:scale-110 transition-transform" aria-label={`Toggle task status: ${t.title}`}>
                  {statusIcon(t.status)}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${t.status === 'done' ? 'line-through text-nova-muted' : 'text-nova-text'}`}>{t.title}</p>
                  {t.description && <p className="text-xs text-nova-muted mt-0.5 truncate">{t.description}</p>}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <PriorityBadge priority={t.priority} />
                    {t.estimatedMinutes > 0 && <span className="flex items-center gap-1 text-xs text-nova-muted"><Clock className="w-3 h-3" /> {t.estimatedMinutes}m</span>}
                    {t.deadline && <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-accent-rose' : 'text-nova-muted'}`}><Calendar className="w-3 h-3" /> {new Date(t.deadline).toLocaleDateString()}</span>}
                    {project && <Badge color="blue">{project.title}</Badge>}
                    {goal && <Badge color="violet">{goal.title}</Badge>}
                    {t.tags.map(tag => <Badge key={tag} color="muted">#{tag}</Badge>)}
                  </div>
                </div>
                <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-nova-surface shrink-0" aria-label="Edit task"><Edit3 className="w-4 h-4 text-nova-muted" /></button>
                <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg hover:bg-nova-surface shrink-0" aria-label="Delete task"><Trash2 className="w-4 h-4 text-nova-muted hover:text-accent-rose" /></button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Task' : 'New Task'}>
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" autoFocus />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[60px] resize-none" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional details..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority || 'medium'} onChange={e => setForm({ ...form, priority: e.target.value as Priority })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="label">Est. minutes</label>
              <input type="number" className="input" value={form.estimatedMinutes || 25} onChange={e => setForm({ ...form, estimatedMinutes: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Project</label>
              <select className="input" value={form.projectId || ''} onChange={e => setForm({ ...form, projectId: e.target.value || null })}>
                <option value="">None</option>
                {state.projects.filter(p => !p.archived).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Goal</label>
              <select className="input" value={form.goalId || ''} onChange={e => setForm({ ...form, goalId: e.target.value || null })}>
                <option value="">None</option>
                {state.goals.filter(g => !g.archived).map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Deadline</label>
            <input type="date" className="input" value={form.deadline?.split('T')[0] || ''} onChange={e => setForm({ ...form, deadline: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          </div>
          <div>
            <label className="label">Tags</label>
            <div className="flex gap-2">
              <input className="input flex-1" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Add a tag..." />
              <button onClick={addTag} className="btn-ghost"><Tag className="w-4 h-4" /></button>
            </div>
            {(form.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(form.tags || []).map(t => <button key={t} onClick={() => removeTag(t)} className="badge bg-accent-cyan/15 text-accent-cyan cursor-pointer hover:bg-accent-rose/15 hover:text-accent-rose">#{t} ✕</button>)}
              </div>
            )}
          </div>
          <button onClick={save} className="btn-primary w-full">{editing ? 'Save Changes' : 'Create Task'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { deleteTask(deleteId); toast('info', 'Task deleted'); } }} title="Delete Task" message="Are you sure?" />
    </div>
  );
}

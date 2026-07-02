import { useState } from 'react';
import { Plus, FolderKanban, Trash2, CreditCard as Edit3, TriangleAlert as AlertTriangle, Check, Circle, Clock, ListTodo, SquareKanban as KanbanSquare } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, ProgressBar, Modal, PriorityBadge, StatusBadge, EmptyState, ConfirmDialog } from '../components/ui';
import type { Project } from '../types';

const emptyProject: Partial<Project> = { title: '', description: '', category: 'General', status: 'active', priority: 'medium', progress: 0, stages: [], risks: [], resources: [], relatedGoals: [] };

export default function Projects() {
  const { state, addProject, updateProject, deleteProject, addTask, toggleTask } = useStore();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Partial<Project>>(emptyProject);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newRisk, setNewRisk] = useState('');
  const [newStage, setNewStage] = useState('');

  const projects = state.projects.filter(p => !p.archived);
  const current = selectedProject ? state.projects.find(p => p.id === selectedProject) : null;
  const projectTasks = current ? state.tasks.filter(t => t.projectId === current.id && !t.archived) : [];

  const openNew = () => { setForm(emptyProject); setEditing(null); setShowForm(true); };
  const openEdit = (p: Project) => { setForm(p); setEditing(p); setShowForm(true); };
  const save = () => { if (!form.title?.trim()) return; if (editing) { updateProject(editing.id, form); toast('success', 'Project updated'); } else { addProject(form); toast('success', 'Project created'); } setShowForm(false); };

  const addProjectTask = () => {
    if (!newTaskTitle.trim() || !current) return;
    addTask({ title: newTaskTitle, projectId: current.id, priority: 'medium', estimatedMinutes: 25, energyLevel: 'medium' });
    toast('success', 'Task added to project');
    setNewTaskTitle('');
  };

  const addRisk = () => { if (!newRisk.trim() || !current) return; updateProject(current.id, { risks: [...current.risks, newRisk] }); toast('success', 'Risk added'); setNewRisk(''); };
  const addStage = () => { if (!newStage.trim() || !current) return; updateProject(current.id, { stages: [...current.stages, newStage] }); toast('success', 'Stage added'); setNewStage(''); };

  if (current) {
    const todo = projectTasks.filter(t => t.status === 'todo');
    const inProgress = projectTasks.filter(t => t.status === 'in_progress');
    const done = projectTasks.filter(t => t.status === 'done');

    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedProject(null)} className="btn-ghost text-xs">← Back</button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-nova-text">{current.title}</h1>
            <p className="text-sm text-nova-dim">{current.description}</p>
          </div>
          <button onClick={() => openEdit(current)} className="btn-ghost text-xs"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <PriorityBadge priority={current.priority} />
          <StatusBadge status={current.status} />
          <Badge color="cyan">{current.progress}%</Badge>
          {current.deadline && <Badge color="muted">{new Date(current.deadline).toLocaleDateString()}</Badge>}
        </div>

        <ProgressBar value={current.progress} color="blue" />

        {/* View toggle */}
        <div className="flex gap-2 mt-6 mb-4">
          <button onClick={() => setView('list')} className={`badge cursor-pointer ${view === 'list' ? 'bg-accent-cyan/12 text-accent-cyan border border-accent-cyan/20' : 'bg-nova-surface text-nova-muted border border-nova-border'}`}><ListTodo className="w-3 h-3" /> List</button>
          <button onClick={() => setView('kanban')} className={`badge cursor-pointer ${view === 'kanban' ? 'bg-accent-cyan/12 text-accent-cyan border border-accent-cyan/20' : 'bg-nova-surface text-nova-muted border border-nova-border'}`}><KanbanSquare className="w-3 h-3" /> Kanban</button>
        </div>

        {/* Tasks */}
        <Card className="p-4 mb-4">
          <div className="flex gap-2 mb-3">
            <input className="input flex-1" placeholder="Add a task to this project..." value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addProjectTask(); }} />
            <button onClick={addProjectTask} className="btn-primary"><Plus className="w-4 h-4" /></button>
          </div>

          {view === 'list' ? (
            <div className="space-y-2">
              {projectTasks.length === 0 && <p className="text-sm text-nova-muted text-center py-4">No tasks yet</p>}
              {projectTasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-nova-surface hover:bg-nova-card-hover transition-colors">
                  <button onClick={() => toggleTask(t.id)} className="shrink-0">{t.status === 'done' ? <Check className="w-4 h-4 text-accent-emerald" /> : <Circle className="w-4 h-4 text-nova-muted" />}</button>
                  <span className={`flex-1 text-sm ${t.status === 'done' ? 'line-through text-nova-muted' : 'text-nova-text'}`}>{t.title}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <KanbanColumn title="To Do" color="muted" tasks={todo} onToggle={toggleTask} />
              <KanbanColumn title="In Progress" color="gold" tasks={inProgress} onToggle={toggleTask} />
              <KanbanColumn title="Done" color="emerald" tasks={done} onToggle={toggleTask} />
            </div>
          )}
        </Card>

        {/* Stages */}
        <Card className="p-4 mb-4">
          <h3 className="section-title text-sm mb-3">Stages / Roadmap</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {current.stages.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nova-surface border border-nova-border">
                  <span className="text-xs text-nova-muted">{i + 1}.</span>
                  <span className="text-xs text-nova-text">{s}</span>
                </div>
                {i < current.stages.length - 1 && <span className="text-nova-muted">→</span>}
              </div>
            ))}
            {current.stages.length === 0 && <p className="text-xs text-nova-muted">No stages defined</p>}
          </div>
          <div className="flex gap-2">
            <input className="input flex-1 text-xs" placeholder="Add stage..." value={newStage} onChange={e => setNewStage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addStage(); }} />
            <button onClick={addStage} className="btn-ghost text-xs px-3"><Plus className="w-3 h-3" /></button>
          </div>
        </Card>

        {/* Risks */}
        <Card className="p-4">
          <h3 className="section-title text-sm mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-accent-gold" /> Risks</h3>
          <div className="space-y-2 mb-3">
            {current.risks.map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-nova-surface">
                <AlertTriangle className="w-4 h-4 shrink-0 text-accent-gold" />
                <span className="text-xs text-nova-dim flex-1">{r}</span>
                
              </div>
            ))}
            {current.risks.length === 0 && <p className="text-xs text-nova-muted">No risks identified</p>}
          </div>
          <div className="flex gap-2">
            <input className="input flex-1 text-xs" placeholder="Add risk..." value={newRisk} onChange={e => setNewRisk(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addRisk(); }} />
            <button onClick={addRisk} className="btn-ghost text-xs px-3"><Plus className="w-3 h-3" /></button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      <SectionHeader title="Projects" subtitle={`${projects.length} active projects`} action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> New Project</button>} />

      {projects.length === 0 ? (
        <EmptyState icon={<FolderKanban className="w-8 h-8" />} title="No projects yet" description="Create a project to organize related tasks" action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Create Project</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => {
            const taskCount = state.tasks.filter(t => t.projectId === p.id && !t.archived).length;
            const doneCount = state.tasks.filter(t => t.projectId === p.id && t.status === 'done').length;
            return (
              <Card key={p.id} className="p-5 card-hover cursor-pointer" onClick={() => setSelectedProject(p.id)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-nova-text mb-1">{p.title}</h3>
                    <p className="text-xs text-nova-dim">{p.category}</p>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-nova-surface" aria-label="Edit project"><Edit3 className="w-4 h-4 text-nova-muted" /></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-nova-surface" aria-label="Delete project"><Trash2 className="w-4 h-4 text-nova-muted hover:text-accent-rose" /></button>
                  </div>
                </div>
                {p.description && <p className="text-sm text-nova-dim mb-3 line-clamp-2">{p.description}</p>}
                <div className="flex items-center gap-2 mb-3">
                  <PriorityBadge priority={p.priority} />
                  <StatusBadge status={p.status} />
                  {p.deadline && <Badge color="muted"><Clock className="w-3 h-3" /> {new Date(p.deadline).toLocaleDateString()}</Badge>}
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1"><span className="text-nova-muted">Progress</span><span className="text-nova-text">{p.progress}%</span></div>
                  <ProgressBar value={p.progress} color="blue" size="sm" />
                </div>
                <p className="text-xs text-nova-muted">{taskCount} tasks · {doneCount} done</p>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Project' : 'New Project'}>
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus /></div>
          <div><label className="label">Description</label><textarea className="input min-h-[60px] resize-none" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Category</label><input className="input" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            <div><label className="label">Priority</label><select className="input" value={form.priority || 'medium'} onChange={e => setForm({ ...form, priority: e.target.value as any })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Status</label><select className="input" value={form.status || 'active'} onChange={e => setForm({ ...form, status: e.target.value as any })}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option></select></div>
            <div><label className="label">Progress: {form.progress || 0}%</label><input type="range" min="0" max="100" value={form.progress || 0} onChange={e => setForm({ ...form, progress: Number(e.target.value) })} className="w-full accent-accent-blue mt-3" /></div>
          </div>
          <div><label className="label">Linked Goal</label><select className="input" value={form.relatedGoals?.[0] || '' || ''} onChange={e => setForm({ ...form, relatedGoals: e.target.value ? [e.target.value] : [] })}><option value="">None</option>{state.goals.filter(g => !g.archived).map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</select></div>
          <button onClick={save} className="btn-primary w-full">{editing ? 'Save Changes' : 'Create Project'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { deleteProject(deleteId); toast('info', 'Project deleted'); } }} title="Delete Project" message="Are you sure?" />
    </div>
  );
}

function KanbanColumn({ title, color, tasks, onToggle }: { title: string; color: string; tasks: any[]; onToggle: (id: string) => void }) {
  return (
    <div className="bg-nova-surface rounded-xl p-2 min-h-[100px]">
      <p className={`text-xs font-medium mb-2 px-1 ${color === 'emerald' ? 'text-accent-emerald' : color === 'gold' ? 'text-accent-gold' : 'text-nova-muted'}`}>{title} ({tasks.length})</p>
      <div className="space-y-1.5">
        {tasks.map(t => (
          <div key={t.id} className="p-2 rounded-lg bg-nova-card border border-nova-border hover:border-nova-muted/30 transition-colors cursor-pointer" onClick={() => onToggle(t.id)}>
            <p className="text-xs text-nova-text">{t.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

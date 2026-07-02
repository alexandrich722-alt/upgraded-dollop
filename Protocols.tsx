import { useState, useMemo } from 'react';
import { Plus, Lock, Star, Zap, Edit3, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, ProgressBar, Modal, EmptyState, ConfirmDialog } from '../components/ui';
import type { Skill } from '../types';

const categoryColors: Record<string, string> = {
  Productivity: 'cyan', Creativity: 'violet', Health: 'emerald', Social: 'blue', Technical: 'gold', Mindset: 'rose',
};

export default function Skills() {
  const { state, updateSkill } = useStore();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Skill | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Partial<Skill>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const skills = state.skills;
  const categories = useMemo(() => {
    const cats: Record<string, Skill[]> = {};
    skills.forEach(s => { const c = s.category || 'Other'; if (!cats[c]) cats[c] = []; cats[c].push(s); });
    return cats;
  }, [skills]);

  const openNew = () => { setForm({ title: '', category: 'Productivity', level: 1, xp: 0, prerequisites: [], practices: [], unlocks: [], relatedHabits: [], relatedGoals: [] }); setEditing(null); setShowForm(true); };
  const openEdit = (s: Skill) => { setForm(s); setEditing(s); setShowForm(true); };

  const save = () => {
    if (!form.title?.trim()) return;
    if (editing) { updateSkill(editing.id, form); toast('success', 'Skill updated'); }
    setShowForm(false);
  };

  const practiceSkill = (s: Skill) => {
    const newXP = s.xp + 25;
    const leveledUp = newXP >= 100;
    updateSkill(s.id, {
      xp: leveledUp ? newXP - 100 : newXP,
      level: leveledUp ? s.level + 1 : s.level,
    });
    if (leveledUp) toast('success', `Level Up! ${s.title} is now level ${s.level + 1}!`);
    else toast('info', `+25 XP to ${s.title}`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto animate-fade-in">
      <SectionHeader title="Skill Tree" subtitle="Level up your abilities" action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> New Skill</button>} />

      {skills.length === 0 ? (
        <EmptyState icon={<Star className="w-8 h-8" />} title="No skills yet" description="Add skills to track your growth" action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Skill</button>} />
      ) : (
        <div className="space-y-6">
          {Object.entries(categories).map(([category, catSkills]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full bg-accent-${categoryColors[category] || 'cyan'}`} />
                <h3 className="text-xs font-semibold text-nova-muted uppercase tracking-wider">{category}</h3>
                <div className="flex-1 h-px bg-nova-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catSkills.map(s => {
                  const isLocked = false;
                  const xpPercent = s.xp;
                  return (
                    <Card key={s.id} className={`p-4 card-hover ${isLocked ? 'opacity-60' : ''} ${selected?.id === s.id ? 'ring-2 ring-accent-cyan/30' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLocked ? 'bg-nova-surface' : 'bg-accent-cyan/10 border border-accent-cyan/20'}`}>
                            {isLocked ? <Lock className="w-4 h-4 text-nova-muted" /> : <Star className="w-5 h-5 text-accent-cyan" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-nova-text">{s.title}</p>
                            <p className="text-xs text-nova-muted">Level {s.level}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(s)} className="p-1 rounded hover:bg-nova-surface" aria-label="Edit skill"><Edit3 className="w-3.5 h-3.5 text-nova-muted" /></button>
                          <button onClick={() => setDeleteId(s.id)} className="p-1 rounded hover:bg-nova-surface" aria-label="Delete skill"><Trash2 className="w-3.5 h-3.5 text-nova-muted hover:text-accent-rose" /></button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1"><span className="text-nova-muted">XP</span><span className="text-nova-text">{s.xp}/{100}</span></div>
                        <ProgressBar value={xpPercent} color={categoryColors[category] || 'cyan'} size="sm" />
                      </div>

                      {s.practices.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-nova-muted mb-1">Practices:</p>
                          <div className="flex flex-wrap gap-1">
                            {s.practices.slice(0, 3).map((p, i) => <Badge key={i} color="muted">{p}</Badge>)}
                          </div>
                        </div>
                      )}

                      {!isLocked && (
                        <button onClick={() => practiceSkill(s)} className="btn-ghost w-full text-xs">
                          <Zap className="w-3 h-3" /> Practice (+25 XP)
                        </button>
                      )}
                      {isLocked && s.prerequisites.length > 0 && (
                        <p className="text-xs text-nova-muted text-center">Requires: {s.prerequisites.join(', ')}</p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title || 'Skill'}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge color={categoryColors[selected.category] || 'cyan'}>Level {selected.level}</Badge>
              <Badge color="muted">{selected.xp} XP</Badge>
            </div>
            {selected.practices.length > 0 && (
              <div><p className="label">Practices</p><div className="flex flex-wrap gap-1">{selected.practices.map((p, i) => <Badge key={i} color="cyan">{p}</Badge>)}</div></div>
            )}
            {selected.unlocks.length > 0 && (
              <div><p className="label">Unlocks</p><div className="flex flex-wrap gap-1">{selected.unlocks.map((u, i) => <Badge key={i} color="violet">{u}</Badge>)}</div></div>
            )}
            {selected.prerequisites.length > 0 && (
              <div><p className="label">Prerequisites</p><div className="flex flex-wrap gap-1">{selected.prerequisites.map((p, i) => <Badge key={i} color="gold">{p}</Badge>)}</div></div>
            )}
            <button onClick={() => practiceSkill(selected)} className="btn-primary w-full"><Zap className="w-4 h-4" /> Practice (+25 XP)</button>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Skill' : 'New Skill'}>
        <div className="space-y-4">
          <div><label className="label">Name</label><input className="input" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Deep Work" autoFocus /></div>
          <div><label className="label">Category</label>
            <select className="input" value={form.category || 'Productivity'} onChange={e => setForm({ ...form, category: e.target.value })}>
              {Object.keys(categoryColors).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Level</label><input type="number" className="input" value={form.level || 1} onChange={e => setForm({ ...form, level: Number(e.target.value) })} /></div>
            <div><label className="label">XP</label><input type="number" className="input" value={form.xp || 0} onChange={e => setForm({ ...form, xp: Number(e.target.value) })} /></div>
          </div>
          <div><label className="label">Practices (comma-separated)</label><input className="input" value={(form.practices || []).join(', ')} onChange={e => setForm({ ...form, practices: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Morning pages, Meditation, Deep work session" /></div>
          <div><label className="label">Unlocks (comma-separated)</label><input className="input" value={(form.unlocks || []).join(', ')} onChange={e => setForm({ ...form, unlocks: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Advanced Focus, Flow State" /></div>
          <button onClick={save} className="btn-primary w-full">{editing ? 'Save Changes' : 'Create Skill'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { updateSkill(deleteId, { level: 0 }); toast('info', 'Skill removed'); } }} title="Remove Skill" message="Hide this skill from your tree?" />
    </div>
  );
}

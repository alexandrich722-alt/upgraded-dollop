import { useState, useMemo } from 'react';
import { Plus, BookOpen, Trash2, Edit3, Search, TrendingUp } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, Modal, EmptyState, ConfirmDialog } from '../components/ui';
import type { Reflection } from '../types';

export default function Reflections() {
  const { state, addReflection, deleteReflection } = useStore();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reflection | null>(null);
  const [form, setForm] = useState<Partial<Reflection>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewMonth, setViewMonth] = useState(new Date());

  const reflections = state.reflections;
  const filtered = useMemo(() => {
    if (!search.trim()) return reflections;
    const q = search.toLowerCase();
    return reflections.filter(r => r.text.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)));
  }, [reflections, search]);

  const avgMood = reflections.length > 0 ? reflections.slice(0, 14).reduce((a, r) => a + r.mood, 0) / Math.min(14, reflections.length) : 0;

  const monthDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d));
    return arr;
  }, [viewMonth]);

  const getMoodForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const r = reflections.find(ref => ref.date.startsWith(dateStr));
    return r ? r.mood : null;
  };

  const moodColor = (mood: number | null) => {
    if (mood === null) return 'bg-nova-surface border border-nova-border';
    if (mood >= 8) return 'bg-accent-emerald/25 border border-accent-emerald/30';
    if (mood >= 6) return 'bg-accent-cyan/20 border border-accent-cyan/25';
    if (mood >= 4) return 'bg-accent-gold/20 border border-accent-gold/25';
    return 'bg-accent-rose/20 border border-accent-rose/25';
  };

  const openNew = () => { setForm({ date: new Date().toISOString(), text: '', mood: 5, energy: 5, stress: 5, tags: [], insights: [], linkedGoals: [], linkedTasks: [] }); setEditing(null); setShowForm(true); };
  const save = () => { if (!form.text?.trim()) return; if (editing) { deleteReflection(editing.id); addReflection(form); toast('success', 'Reflection updated'); } else { addReflection(form); toast('success', 'Reflection saved'); } setShowForm(false); };

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <SectionHeader title="Reflections" subtitle={`${reflections.length} entries · avg mood ${avgMood.toFixed(1)}/10`} action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> New Entry</button>} />

      {reflections.length === 0 && !search ? (
        <EmptyState icon={<BookOpen className="w-8 h-8" />} title="No reflections yet" description="Journal your thoughts, track your mood" action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Write First Entry</button>} />
      ) : (
        <div className="space-y-4">
          {/* Mood calendar */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent-rose" /> Mood Calendar</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} className="text-xs text-nova-muted hover:text-nova-text">←</button>
                <span className="text-xs text-nova-text font-medium">{viewMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} className="text-xs text-nova-muted hover:text-nova-text">→</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((d, i) => <div key={i} className="text-[10px] text-nova-muted text-center">{d}</div>)}
              {monthDays.map((date, i) => {
                if (!date) return <div key={i} />;
                const mood = getMoodForDate(date);
                const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                return (
                  <div key={i} className={`aspect-square rounded-md text-[9px] flex items-center justify-center ${moodColor(mood)} ${isToday ? 'ring-1 ring-accent-cyan/40' : ''}`} title={mood ? `Mood: ${mood}/10` : 'No entry'}>
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-3 text-[10px] text-nova-muted">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-accent-rose/20 border border-accent-rose/25" /> Low</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-accent-gold/20 border border-accent-gold/25" /> Mid</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-accent-cyan/20 border border-accent-cyan/25" /> Good</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-accent-emerald/25 border border-accent-emerald/30" /> Great</span>
            </div>
          </Card>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nova-muted" />
              <input className="input pl-10" placeholder="Search reflections..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search reflections" />
            </div>
          </div>

          {/* Entries */}
          <div className="space-y-3">
            {filtered.length === 0 && search && <p className="text-sm text-nova-muted text-center py-4">No reflections match "{search}"</p>}
            {filtered.map(r => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-nova-muted">{new Date(r.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color={r.mood >= 7 ? 'emerald' : r.mood >= 4 ? 'gold' : 'rose'}>Mood: {r.mood}/10</Badge>
                      <Badge color="cyan">Energy: {r.energy}/10</Badge>
                      <Badge color="muted">Stress: {r.stress}/10</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setForm(r); setEditing(r); setShowForm(true); }} className="p-1 rounded hover:bg-nova-surface"><Edit3 className="w-3.5 h-3.5 text-nova-muted" /></button>
                    <button onClick={() => setDeleteId(r.id)} className="p-1 rounded hover:bg-nova-surface"><Trash2 className="w-3.5 h-3.5 text-nova-muted hover:text-accent-rose" /></button>
                  </div>
                </div>
                <p className="text-sm text-nova-text whitespace-pre-wrap leading-relaxed">{r.text}</p>
                {r.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{r.tags.map(t => <Badge key={t} color="muted">#{t}</Badge>)}</div>}
                {r.insights.length > 0 && <div className="mt-2 p-2 rounded-lg bg-accent-cyan/8 border border-accent-cyan/15"><p className="text-xs text-accent-cyan">Insight: {r.insights[0]}</p></div>}
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Reflection' : 'New Reflection'}>
        <div className="space-y-4">
          <div><label className="label">What's on your mind?</label><textarea className="input min-h-[120px] resize-none" value={form.text || ''} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="Write your thoughts..." autoFocus /></div>
          <div><label className="label">Mood: {form.mood || 5}/10</label><input type="range" min="1" max="10" value={form.mood || 5} onChange={e => setForm({ ...form, mood: Number(e.target.value) })} className="w-full accent-accent-rose" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Energy: {form.energy || 5}/10</label><input type="range" min="1" max="10" value={form.energy || 5} onChange={e => setForm({ ...form, energy: Number(e.target.value) })} className="w-full accent-accent-cyan" /></div>
            <div><label className="label">Stress: {form.stress || 5}/10</label><input type="range" min="1" max="10" value={form.stress || 5} onChange={e => setForm({ ...form, stress: Number(e.target.value) })} className="w-full accent-accent-gold" /></div>
          </div>
          <div><label className="label">Tags (comma-separated)</label><input className="input" value={(form.tags || []).join(', ')} onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="gratitude, work, personal" /></div>
          <div><label className="label">Insight (optional)</label><input className="input" value={(form.insights || []).join(', ')} onChange={e => setForm({ ...form, insights: e.target.value.split(',').filter(Boolean) })} placeholder="What did you learn?" /></div>
          <button onClick={save} className="btn-primary w-full">{editing ? 'Save Changes' : 'Save Reflection'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { deleteReflection(deleteId); toast('info', 'Reflection deleted'); } }} title="Delete Reflection" message="Are you sure?" />
    </div>
  );
}

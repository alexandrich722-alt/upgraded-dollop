import { useState, useMemo } from 'react';
import { Plus, Flame, Trash2, Edit3, Check, Calendar } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, Modal, EmptyState, ConfirmDialog } from '../components/ui';
import type { Habit } from '../types';

const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Habits() {
  const { state, addHabit, updateHabit, toggleHabit, deleteHabit } = useStore();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [form, setForm] = useState<Partial<Habit>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());

  const habits = state.habits.filter(h => !h.archived);
  const todayStr = new Date().toISOString().split('T')[0];

  const monthDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startOffset = firstDay.getDay();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d));
    return arr;
  }, [viewMonth]);

  const isHabitDoneOn = (h: Habit, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return h.history.some(d => d.startsWith(dateStr));
  };

  const toggleHabitOnDate = (h: Habit, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const already = h.history.some(d => d.startsWith(dateStr));
    if (already) {
      updateHabit(h.id, { history: h.history.filter(d => !d.startsWith(dateStr)) });
      toast('info', `Unchecked ${h.title} for ${dateStr}`);
    } else {
      updateHabit(h.id, { history: [...h.history, dateStr + 'T12:00:00.000Z'], streak: h.streak + 1, bestStreak: Math.max(h.bestStreak, h.streak + 1) });
      toast('success', `Checked ${h.title} for ${dateStr}`);
    }
  };

  const openNew = () => { setForm({ title: '', description: '', category: 'Productivity', frequency: 'daily', target: 1, isBad: false, relatedGoalId: null }); setEditing(null); setShowForm(true); };
  const openEdit = (h: Habit) => { setForm(h); setEditing(h); setShowForm(true); };

  const save = () => {
    if (!form.title?.trim()) return;
    if (editing) { updateHabit(editing.id, form); toast('success', 'Habit updated'); }
    else { addHabit(form); toast('success', 'Habit created'); }
    setShowForm(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      <SectionHeader title="Habits" subtitle={`${habits.length} habits · ${habits.filter(h => h.history.some(d => d.startsWith(todayStr))).length} done today`} action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> New Habit</button>} />

      {habits.length === 0 ? (
        <EmptyState icon={<Flame className="w-8 h-8" />} title="No habits yet" description="Build consistency with daily habits" action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Create Habit</button>} />
      ) : (
        <div className="space-y-4">
          {habits.map(h => {
            const doneToday = h.history.some(d => d.startsWith(todayStr));
            return (
              <Card key={h.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => { toggleHabit(h.id); toast(doneToday ? 'info' : 'success', doneToday ? `Unchecked ${h.title}` : `Done! ${h.title}`); }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${doneToday ? 'bg-accent-emerald/20 border border-accent-emerald/30 scale-105' : 'bg-nova-surface border border-nova-border hover:border-accent-emerald/30'}`}
                      aria-label={`Toggle ${h.title}`}
                    >
                      {doneToday ? <Check className="w-5 h-5 text-accent-emerald" style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.4))' }} /> : <span className="w-5 h-5 rounded-full border-2 border-nova-muted/30" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-nova-text">{h.title}</p>
                      {h.description && <p className="text-xs text-nova-muted truncate">{h.description}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        {h.streak > 0 && (
                          <span className="flex items-center gap-1 text-xs text-accent-gold">
                            <Flame className="w-3 h-3" /> {h.streak} day streak
                          </span>
                        )}
                        <span className="text-xs text-nova-muted">{h.completionRate}% completion</span>
                        {h.isBad && <Badge color="rose">Bad Habit</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(h)} className="p-1.5 rounded-lg hover:bg-nova-surface" aria-label="Edit habit"><Edit3 className="w-4 h-4 text-nova-muted" /></button>
                    <button onClick={() => setDeleteId(h.id)} className="p-1.5 rounded-lg hover:bg-nova-surface" aria-label="Delete habit"><Trash2 className="w-4 h-4 text-nova-muted hover:text-accent-rose" /></button>
                  </div>
                </div>

                {/* 7-day strip */}
                <div className="flex gap-1.5 mb-3">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    const dateStr = d.toISOString().split('T')[0];
                    const done = h.history.some(hd => hd.startsWith(dateStr));
                    const isToday = dateStr === todayStr;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-nova-muted">{days[d.getDay()]}</span>
                        <button
                          onClick={() => toggleHabitOnDate(h, d)}
                          className={`w-7 h-7 rounded-lg transition-all ${done ? 'bg-accent-emerald/20 border border-accent-emerald/30' : 'bg-nova-surface border border-nova-border hover:border-nova-muted/30'} ${isToday ? 'ring-1 ring-accent-cyan/30' : ''}`}
                          aria-label={`Toggle ${h.title} for ${dateStr}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Monthly heatmap toggle */}
                <details className="group">
                  <summary className="flex items-center gap-1 text-xs text-nova-muted cursor-pointer hover:text-nova-text transition-colors list-none">
                    <Calendar className="w-3 h-3" />
                    <span>Monthly view</span>
                    <span className="group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <div className="mt-3 animate-slide-up">
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} className="text-xs text-nova-muted hover:text-nova-text">←</button>
                      <span className="text-xs text-nova-text font-medium">{viewMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</span>
                      <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} className="text-xs text-nova-muted hover:text-nova-text">→</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {days.map(d => <div key={d} className="text-[10px] text-nova-muted text-center">{d}</div>)}
                      {monthDays.map((date, i) => {
                        if (!date) return <div key={i} />;
                        const done = isHabitDoneOn(h, date);
                        const isFuture = date > new Date();
                        const isToday = date.toISOString().split('T')[0] === todayStr;
                        return (
                          <button
                            key={i}
                            onClick={() => !isFuture && toggleHabitOnDate(h, date)}
                            disabled={isFuture}
                            className={`aspect-square rounded-md transition-all text-[9px] flex items-center justify-center ${done ? 'bg-accent-emerald/25 border border-accent-emerald/30 text-accent-emerald' : isFuture ? 'bg-transparent' : 'bg-nova-surface border border-nova-border hover:border-nova-muted/30'} ${isToday ? 'ring-1 ring-accent-cyan/40' : ''}`}
                            aria-label={`${done ? 'Done' : 'Not done'} on ${date.toDateString()}`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </details>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Habit' : 'New Habit'}>
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Morning meditation" autoFocus /></div>
          <div><label className="label">Description</label><input className="input" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Category</label><input className="input" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            <div><label className="label">Frequency</label><select className="input" value={form.frequency || 'daily'} onChange={e => setForm({ ...form, frequency: e.target.value as any })}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="custom">Custom</option></select></div>
          </div>
          <div><label className="label">Linked Goal</label><select className="input" value={form.relatedGoalId || ''} onChange={e => setForm({ ...form, relatedGoalId: e.target.value || null })}><option value="">None</option>{state.goals.filter(g => !g.archived).map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</select></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="isBad" checked={form.isBad || false} onChange={e => setForm({ ...form, isBad: e.target.checked })} className="w-4 h-4 accent-accent-rose" /><label htmlFor="isBad" className="text-sm text-nova-dim">Track as bad habit (to break)</label></div>
          <button onClick={save} className="btn-primary w-full">{editing ? 'Save Changes' : 'Create Habit'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { deleteHabit(deleteId); toast('info', 'Habit deleted'); } }} title="Delete Habit" message="Are you sure?" />
    </div>
  );
}

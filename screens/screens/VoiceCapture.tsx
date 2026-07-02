import { useState } from 'react';
import { Share2, Clock, Check, Play, Plus } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, Modal, EmptyState } from '../components/ui';
import type { Protocol } from '../types';

export default function Protocols() {
  const { state, addProtocol } = useStore();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Protocol | null>(null);
  const [activeSteps, setActiveSteps] = useState<Set<number>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Protocol>>({});

  const protocols = state.protocols;

  const openProtocol = (p: Protocol) => { setSelected(p); setActiveSteps(new Set()); };
  const toggleStep = (idx: number) => {
    setActiveSteps(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });
    if (activeSteps.size + 1 === selected?.steps.length) toast('success', 'Protocol complete!');
  };

  const saveProtocol = () => {
    if (!form.name?.trim()) return;
    addProtocol({ name: form.name, description: form.description || '', category: form.category || 'General', steps: form.steps || [] });
    toast('success', 'Protocol created');
    setShowForm(false);
    setForm({});
  };

  if (selected) {
    const allDone = activeSteps.size === selected.steps.length;
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelected(null)} className="btn-ghost text-xs">← Back</button>
          <div className="flex-1"><h1 className="font-display text-2xl font-bold text-nova-text">{selected.name}</h1><p className="text-sm text-nova-dim">{selected.description}</p></div>
          <Badge color="cyan">{selected.category}</Badge>
        </div>

        <Card className={`p-6 ${allDone ? 'gradient-mesh-emerald' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <Play className={`w-5 h-5 ${allDone ? 'text-accent-emerald' : 'text-accent-cyan'}`} />
            <h3 className="section-title">{allDone ? 'Protocol Complete!' : 'Execute Protocol'}</h3>
          </div>
          <div className="space-y-2">
            {selected.steps.map((step, i) => {
              const done = activeSteps.has(i);
              return (
                <button key={i} onClick={() => toggleStep(i)} className="flex items-center gap-3 w-full text-left p-3 rounded-xl bg-nova-surface hover:bg-nova-card-hover transition-all">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? 'bg-accent-emerald/20 border border-accent-emerald/30' : 'bg-nova-bg border border-nova-border'}`}>
                    {done ? <Check className="w-4 h-4 text-accent-emerald" /> : <span className="text-xs text-nova-muted">{i + 1}</span>}
                  </div>
                  <span className={`text-sm ${done ? 'text-nova-muted line-through' : 'text-nova-text'}`}>{step}</span>
                </button>
              );
            })}
          </div>
          {allDone && <p className="text-sm text-accent-emerald text-center mt-4">Protocol executed successfully!</p>}
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <SectionHeader title="Life Protocols" subtitle="Ready-to-use behavioral algorithms" action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Protocol</button>} />

      {protocols.length === 0 ? (
        <EmptyState icon={<Share2 className="w-8 h-8" />} title="No protocols yet" description="Create a protocol for repeatable routines" action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create Protocol</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {protocols.map(p => (
            <Card key={p.id} className="p-5 card-hover cursor-pointer" onClick={() => openProtocol(p)}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center shrink-0 border border-accent-cyan/15">
                  <Share2 className="w-5 h-5 text-accent-cyan" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-nova-text">{p.name}</h3>
                  <p className="text-xs text-nova-dim">{p.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge color="cyan">{p.category}</Badge>
                <span className="flex items-center gap-1 text-xs text-nova-muted"><Clock className="w-3 h-3" /> {p.steps.length} steps</span>
              </div>
              <div className="space-y-1">
                {p.steps.slice(0, 3).map((s, i) => <p key={i} className="text-xs text-nova-muted flex items-center gap-1.5"><span className="text-nova-border">{i + 1}.</span> {s}</p>)}
                {p.steps.length > 3 && <p className="text-xs text-nova-muted">+{p.steps.length - 3} more steps</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Protocol">
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Morning Launch Protocol" autoFocus /></div>
          <div><label className="label">Description</label><input className="input" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label">Category</label><input className="input" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Morning, Focus, Recovery..." /></div>
          <div><label className="label">Steps (one per line)</label><textarea className="input min-h-[120px] resize-none" value={(form.steps || []).join('\n')} onChange={e => setForm({ ...form, steps: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })} placeholder="Step 1&#10;Step 2&#10;Step 3" /></div>
          <button onClick={saveProtocol} className="btn-primary w-full">Create Protocol</button>
        </div>
      </Modal>
    </div>
  );
}

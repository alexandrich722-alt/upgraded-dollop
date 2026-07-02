import { useState } from 'react';
import { Plus, Users, Trash2, Edit3, Phone, Send, Gift, Clock, Heart, MessageCircle } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, Modal, EmptyState, ConfirmDialog } from '../components/ui';
import type { Contact } from '../types';

export default function Social() {
  const { state, addContact, updateContact, deleteContact } = useStore();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState<Partial<Contact>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [newGift, setNewGift] = useState('');
  const [newReminder, setNewReminder] = useState('');
  const [interactionText, setInteractionText] = useState('');

  const contacts = state.contacts;

  const openNew = () => { setForm({ name: '', relationship: '', importance: 3, birthday: null, phone: '', telegram: '', lastContactedAt: null, giftIdeas: [], reminders: [] }); setEditing(null); setShowForm(true); };
  const openEdit = (c: Contact) => { setForm(c); setEditing(c); setShowForm(true); };
  const save = () => { if (!form.name?.trim()) return; if (editing) { updateContact(editing.id, form); toast('success', 'Contact updated'); } else { addContact(form); toast('success', 'Contact added'); } setShowForm(false); };

  const logInteraction = (c: Contact) => {
    if (!interactionText.trim()) return;
    updateContact(c.id, { lastContactedAt: new Date().toISOString() });
    toast('success', `Logged contact with ${c.name}`);
    setInteractionText('');
  };

  const addGift = () => { if (!newGift.trim() || !selected) return; updateContact(selected.id, { giftIdeas: [...selected.giftIdeas, newGift] }); toast('success', 'Gift idea added'); setNewGift(''); };
  const addReminder = () => { if (!newReminder.trim() || !selected) return; updateContact(selected.id, { reminders: [...selected.reminders, newReminder] }); toast('success', 'Reminder added'); setNewReminder(''); };

  const daysSince = (date: string | null) => { if (!date) return null; return Math.floor((Date.now() - new Date(date).getTime()) / 86400000); };
  const needsContact = (c: Contact) => { const d = daysSince(c.lastContactedAt); return d === null || d > 7; };

  if (selected) {
    const d = daysSince(selected.lastContactedAt);
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelected(null)} className="btn-ghost text-xs">← Back</button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center text-lg font-bold text-nova-bg">{selected.name.charAt(0)}</div>
            <div><h1 className="font-display text-xl font-bold text-nova-text">{selected.name}</h1><p className="text-sm text-nova-dim">{selected.relationship}</p></div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {selected.phone && <a href={`tel:${selected.phone}`} className="btn-ghost text-xs"><Phone className="w-3.5 h-3.5" /> Call</a>}
          {selected.telegram && <a href={`https://t.me/${selected.telegram}`} target="_blank" rel="noopener" className="btn-ghost text-xs"><Send className="w-3.5 h-3.5" /> Telegram</a>}
          {selected.birthday && <Badge color="gold">Birthday: {new Date(selected.birthday).toLocaleDateString()}</Badge>}
          {d !== null && <Badge color={d > 7 ? 'rose' : 'emerald'}>Last contact: {d} days ago</Badge>}
        </div>

        {/* Log interaction */}
        <Card className="p-4 mb-4">
          <h3 className="section-title text-sm mb-3 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-accent-cyan" /> Log Interaction</h3>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Had coffee, called, texted..." value={interactionText} onChange={e => setInteractionText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') logInteraction(selected); }} />
            <button onClick={() => logInteraction(selected)} className="btn-primary"><Plus className="w-4 h-4" /></button>
          </div>
        </Card>

        {/* Gift ideas */}
        <Card className="p-4 mb-4">
          <h3 className="section-title text-sm mb-3 flex items-center gap-2"><Gift className="w-4 h-4 text-accent-violet" /> Gift Ideas</h3>
          <div className="space-y-1.5 mb-3">
            {selected.giftIdeas.map((g, i) => <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-nova-surface"><Gift className="w-3.5 h-3.5 text-accent-violet shrink-0" /><span className="text-xs text-nova-dim flex-1">{g}</span><button onClick={() => updateContact(selected.id, { giftIdeas: selected.giftIdeas.filter((_, j) => j !== i) })} className="text-nova-muted hover:text-accent-rose"><Trash2 className="w-3 h-3" /></button></div>)}
            {selected.giftIdeas.length === 0 && <p className="text-xs text-nova-muted">No gift ideas yet</p>}
          </div>
          <div className="flex gap-2">
            <input className="input flex-1 text-xs" placeholder="Add gift idea..." value={newGift} onChange={e => setNewGift(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addGift(); }} />
            <button onClick={addGift} className="btn-ghost text-xs px-3"><Plus className="w-3 h-3" /></button>
          </div>
        </Card>

        {/* Reminders */}
        <Card className="p-4">
          <h3 className="section-title text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-accent-gold" /> Reminders</h3>
          <div className="space-y-1.5 mb-3">
            {selected.reminders.map((r, i) => <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-nova-surface"><Clock className="w-3.5 h-3.5 text-accent-gold shrink-0" /><span className="text-xs text-nova-dim flex-1">{r}</span><button onClick={() => updateContact(selected.id, { reminders: selected.reminders.filter((_, j) => j !== i) })} className="text-nova-muted hover:text-accent-rose"><Trash2 className="w-3 h-3" /></button></div>)}
            {selected.reminders.length === 0 && <p className="text-xs text-nova-muted">No reminders</p>}
          </div>
          <div className="flex gap-2">
            <input className="input flex-1 text-xs" placeholder="Add reminder..." value={newReminder} onChange={e => setNewReminder(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addReminder(); }} />
            <button onClick={addReminder} className="btn-ghost text-xs px-3"><Plus className="w-3 h-3" /></button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <SectionHeader title="Relationships" subtitle={`${contacts.length} contacts · ${contacts.filter(needsContact).length} need outreach`} action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Contact</button>} />

      {contacts.length === 0 ? (
        <EmptyState icon={<Users className="w-8 h-8" />} title="No contacts yet" description="Track people who matter" action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Contact</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map(c => {
            const d = daysSince(c.lastContactedAt);
            const needs = needsContact(c);
            return (
              <Card key={c.id} className="p-4 card-hover cursor-pointer" onClick={() => setSelected(c)}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center text-base font-bold text-nova-bg shrink-0">{c.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-nova-text">{c.name}</p>
                      <div className="flex gap-0.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(c)} className="p-1 rounded hover:bg-nova-surface"><Edit3 className="w-3.5 h-3.5 text-nova-muted" /></button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1 rounded hover:bg-nova-surface"><Trash2 className="w-3.5 h-3.5 text-nova-muted hover:text-accent-rose" /></button>
                      </div>
                    </div>
                    <p className="text-xs text-nova-dim">{c.relationship}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {Array.from({ length: 5 }).map((_, i) => <Heart key={i} className={`w-3 h-3 ${i < c.importance ? 'text-accent-rose fill-accent-rose/30' : 'text-nova-border'}`} />)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {d === null ? <Badge color="rose">Never contacted</Badge> : needs ? <Badge color="rose">{d} days ago</Badge> : <Badge color="emerald">{d}d ago</Badge>}
                      {c.birthday && <Badge color="muted">{new Date(c.birthday).toLocaleDateString()}</Badge>}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Contact' : 'Add Contact'}>
        <div className="space-y-4">
          <div><label className="label">Name</label><input className="input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus /></div>
          <div><label className="label">Relationship</label><input className="input" value={form.relationship || ''} onChange={e => setForm({ ...form, relationship: e.target.value })} placeholder="Family, Friend, Mentor..." /></div>
          <div><label className="label">Importance: {form.importance || 3}/5</label><input type="range" min="1" max="5" value={form.importance || 3} onChange={e => setForm({ ...form, importance: Number(e.target.value) })} className="w-full accent-accent-rose" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Phone</label><input className="input" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1234567890" /></div>
            <div><label className="label">Telegram</label><input className="input" value={form.telegram || ''} onChange={e => setForm({ ...form, telegram: e.target.value })} placeholder="@username" /></div>
          </div>
          <div><label className="label">Birthday</label><input type="date" className="input" value={form.birthday?.split('T')[0] || ''} onChange={e => setForm({ ...form, birthday: e.target.value ? new Date(e.target.value).toISOString() : null })} /></div>
          <button onClick={save} className="btn-primary w-full">{editing ? 'Save Changes' : 'Add Contact'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { deleteContact(deleteId); toast('info', 'Contact deleted'); } }} title="Delete Contact" message="Are you sure?" />
    </div>
  );
}

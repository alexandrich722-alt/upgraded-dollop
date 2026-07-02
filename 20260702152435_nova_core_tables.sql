import { useState } from 'react';
import { Clock, Plus, Mail, Eye } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, Modal, EmptyState } from '../components/ui';

const PRESET_DELAYS = [
  { label: '1 week', days: 7 },
  { label: '1 month', days: 30 },
  { label: '90 days', days: 90 },
  { label: '6 months', days: 180 },
  { label: '1 year', days: 365 },
];

export default function TimeCapsule() {
  const { state, addTimeCapsule, revealTimeCapsule } = useStore();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDelay, setSelectedDelay] = useState(90);

  const capsules = state.timeCapsules || [];

  const create = () => {
    if (!message.trim()) { toast('error', 'Write a message first'); return; }
    const revealAt = new Date(Date.now() + selectedDelay * 86400000).toISOString();
    addTimeCapsule({ message: message.trim(), revealAt });
    toast('success', `Time capsule sealed. Opens in ${selectedDelay} days!`);
    setMessage('');
    setShowForm(false);
  };

  const canReveal = (tc: { revealAt: string; revealed: boolean }) =>
    !tc.revealed && new Date(tc.revealAt) <= new Date();

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in">
      <SectionHeader
        title="Time Capsules"
        subtitle="Messages to your future self"
        action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Capsule</button>}
      />

      {capsules.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8" />}
          title="No time capsules"
          description="Leave a message for your future self. NOVA will reveal it when the time comes."
          action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create First Capsule</button>}
        />
      ) : (
        <div className="space-y-4">
          {capsules.map(tc => {
            const daysUntil = Math.max(0, Math.ceil((new Date(tc.revealAt).getTime() - Date.now()) / 86400000));
            const ready = canReveal(tc);
            return (
              <Card key={tc.id} className={`p-5 ${ready ? 'gradient-mesh border-accent-gold/20' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tc.revealed ? 'bg-nova-surface' : ready ? 'bg-accent-gold/15 border border-accent-gold/25' : 'bg-accent-violet/10 border border-accent-violet/15'}`}>
                      {tc.revealed ? <Mail className="w-5 h-5 text-nova-muted" /> : ready ? <Eye className="w-5 h-5 text-accent-gold" /> : <Clock className="w-5 h-5 text-accent-violet" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-nova-text">
                        {tc.revealed ? 'Opened' : ready ? 'Ready to reveal!' : `Opens in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                      </p>
                      <p className="text-xs text-nova-muted">
                        Written {new Date(tc.createdAt).toLocaleDateString()} · Reveal {new Date(tc.revealAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {ready && !tc.revealed && (
                    <Badge color="gold">Ready</Badge>
                  )}
                </div>

                {tc.revealed ? (
                  <div className="bg-nova-surface rounded-xl p-4">
                    <p className="text-sm text-nova-text italic leading-relaxed">"{tc.message}"</p>
                    <p className="text-xs text-nova-muted mt-2">— You, {new Date(tc.createdAt).toLocaleDateString()}</p>
                  </div>
                ) : ready ? (
                  <button
                    onClick={() => revealTimeCapsule(tc.id)}
                    className="btn-primary w-full"
                  >
                    <Eye className="w-4 h-4" /> Open Time Capsule
                  </button>
                ) : (
                  <div className="bg-nova-surface rounded-xl p-3">
                    <p className="text-xs text-nova-muted text-center">🔒 Sealed until {new Date(tc.revealAt).toLocaleDateString()}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Time Capsule">
        <div className="space-y-4">
          <div>
            <label className="label">Message to your future self</label>
            <textarea
              className="input min-h-[160px] resize-none"
              placeholder="Dear future me...&#10;&#10;Right now I'm working on... My biggest fear is... I hope by the time you read this..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-nova-muted mt-1">{message.length} characters</p>
          </div>

          <div>
            <label className="label">Open in...</label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_DELAYS.map(d => (
                <button
                  key={d.days}
                  onClick={() => setSelectedDelay(d.days)}
                  className={`btn text-xs py-2 ${selectedDelay === d.days ? 'bg-accent-violet/15 text-accent-violet border border-accent-violet/25' : 'btn-ghost'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-nova-muted mt-2">
              Will be revealed on {new Date(Date.now() + selectedDelay * 86400000).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <button onClick={create} className="btn-primary w-full">
            <Clock className="w-4 h-4" /> Seal Capsule
          </button>
        </div>
      </Modal>
    </div>
  );
}

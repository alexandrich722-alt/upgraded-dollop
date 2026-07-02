import { useState } from 'react';
import { Skull, Sword, Shield, Zap, Heart, Trophy, Plus } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, ProgressBar, Modal, EmptyState } from '../components/ui';
import type { Boss } from '../types';

export default function BossBattle() {
  const { state, updateBoss, toggleTask, toggleHabit } = useStore();
  const { toast } = useToast();
  const [battling, setBattling] = useState<Boss | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Boss>>({});

  const bosses = state.bosses;
  const activeTasks = state.tasks.filter(t => !t.archived && t.status !== 'done');
  const activeHabits = state.habits.filter(h => !h.archived);

  const attack = (type: 'task' | 'habit' | 'focus') => {
    if (!battling) return;
    let damage = 0;
    let action = '';

    if (type === 'task') {
      const task = activeTasks[0];
      if (task) { toggleTask(task.id); damage = 20; action = `Completed "${task.title}" — 20 damage!`; }
      else { action = 'No active tasks to complete!'; }
    } else if (type === 'habit') {
      const habit = activeHabits[0];
      if (habit) { toggleHabit(habit.id); damage = 15; action = `Did "${habit.title}" — 15 damage!`; }
      else { action = 'No active habits!'; }
    } else {
      damage = 10;
      action = 'Focus strike — 10 damage!';
    }

    if (damage > 0) {
      const newHp = Math.max(0, battling.hp - damage);
      const newBoss = { ...battling, hp: newHp };
      setBattling(newBoss);
      updateBoss(battling.id, { hp: newHp });
      setLog(prev => [action, ...prev].slice(0, 8));

      if (newHp === 0) {
        toast('success', `Victory! You defeated ${battling.name}!`);
        setLog(prev => [`Victory! ${battling.name} defeated!`, ...prev]);
      }
    } else {
      setLog(prev => [action, ...prev].slice(0, 8));
      toast('info', action);
    }
  };

  const saveBoss = () => {
    if (!form.name?.trim()) return;
    updateBoss(crypto.randomUUID(), { name: form.name, hp: form.maxHp || 100, maxHp: form.maxHp || 100, description: form.description || '', linkedBadPattern: '', victoryCondition: '', rewards: form.rewards || [], defeated: false });
    toast('success', 'Boss created');
    setShowForm(false);
    setForm({});
  };

  if (battling) {
    const hpPercent = (battling.hp / battling.maxHp) * 100;
    const isDefeated = battling.hp === 0;
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setBattling(null); setLog([]); }} className="btn-ghost text-xs">← Retreat</button>
        </div>

        {/* Boss card */}
        <Card className={`p-8 text-center mb-6 ${isDefeated ? 'gradient-mesh-emerald' : 'gradient-mesh-rose'}`}>
          <div className={`w-24 h-24 mx-auto mb-4 rounded-3xl flex items-center justify-center ${isDefeated ? 'bg-accent-emerald/15' : 'bg-accent-rose/15'} border-2 ${isDefeated ? 'border-accent-emerald/30' : 'border-accent-rose/30'} ${isDefeated ? '' : 'animate-pulse-glow'}`}>
            {isDefeated ? <Trophy className="w-12 h-12 text-accent-emerald" /> : <Skull className="w-12 h-12 text-accent-rose" />}
          </div>
          <h2 className="font-display text-2xl font-bold text-nova-text mb-1">{battling.name}</h2>
          <p className="text-sm text-nova-dim mb-4">{battling.description}</p>

          {/* HP bar */}
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between text-xs mb-1"><span className="text-nova-muted">Boss HP</span><span className="text-nova-text">{battling.hp}/{battling.maxHp}</span></div>
            <div className="h-4 bg-nova-surface rounded-full overflow-hidden">
              <div className="h-4 bg-gradient-to-r from-accent-rose to-accent-gold rounded-full transition-all duration-500" style={{ width: `${hpPercent}%`, boxShadow: '0 0 12px rgba(251,113,133,0.3)' }} />
            </div>
          </div>
        </Card>

        {isDefeated ? (
          <Card className="p-6 text-center">
            <Trophy className="w-12 h-12 text-accent-gold mx-auto mb-3" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.3))' }} />
            <h3 className="font-display text-xl font-bold text-nova-text mb-2">Victory!</h3>
            <p className="text-sm text-nova-dim mb-4">You defeated {battling.name}!</p>
            {battling.rewards.length > 0 && <div className="flex flex-wrap gap-2 justify-center mb-4">{battling.rewards.map((r, i) => <Badge key={i} color="gold">{r}</Badge>)}</div>}
            <button onClick={() => { setBattling(null); setLog([]); }} className="btn-primary">Continue</button>
          </Card>
        ) : (
          <>
            {/* Attack buttons */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button onClick={() => attack('task')} disabled={activeTasks.length === 0} className="btn-violet flex-col py-4">
                <Sword className="w-6 h-6 mb-1" />
                <span className="text-xs">Complete Task</span>
                <span className="text-[10px] text-nova-bg/60">20 dmg</span>
              </button>
              <button onClick={() => attack('habit')} disabled={activeHabits.length === 0} className="btn-violet flex-col py-4">
                <Shield className="w-6 h-6 mb-1" />
                <span className="text-xs">Do Habit</span>
                <span className="text-[10px] text-nova-bg/60">15 dmg</span>
              </button>
              <button onClick={() => attack('focus')} className="btn-violet flex-col py-4">
                <Zap className="w-6 h-6 mb-1" />
                <span className="text-xs">Focus Strike</span>
                <span className="text-[10px] text-nova-bg/60">10 dmg</span>
              </button>
            </div>

            {/* Battle log */}
            <Card className="p-4">
              <h3 className="section-title text-sm mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-accent-rose" /> Battle Log</h3>
              <div className="space-y-1.5">
                {log.length === 0 && <p className="text-xs text-nova-muted">No actions yet. Attack!</p>}
                {log.map((entry, i) => <p key={i} className="text-xs text-nova-dim animate-slide-up">{entry}</p>)}
              </div>
            </Card>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <SectionHeader title="Boss Battles" subtitle="Defeat bosses by completing real tasks and habits" action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Boss</button>} />

      {bosses.length === 0 ? (
        <EmptyState icon={<Skull className="w-8 h-8" />} title="No bosses yet" description="Create a boss to battle" action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create Boss</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bosses.map(b => {
            const hpPercent = (b.hp / b.maxHp) * 100;
            return (
              <Card key={b.id} className={`p-5 card-hover cursor-pointer ${b.defeated ? 'opacity-60' : ''}`} onClick={() => { setBattling(b); setLog([]); }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${b.defeated ? 'bg-accent-emerald/15' : 'bg-accent-rose/15'} border ${b.defeated ? 'border-accent-emerald/20' : 'border-accent-rose/20'}`}>
                    {b.defeated ? <Trophy className="w-6 h-6 text-accent-emerald" /> : <Skull className="w-6 h-6 text-accent-rose" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-nova-text">{b.name}</h3>
                    <p className="text-xs text-nova-dim">{b.description}</p>
                  </div>
                  {b.defeated && <Badge color="emerald">Defeated</Badge>}
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1"><span className="text-nova-muted">HP</span><span className="text-nova-text">{b.hp}/{b.maxHp}</span></div>
                  <ProgressBar value={hpPercent} color="rose" />
                </div>
                {b.rewards.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{b.rewards.map((r, i) => <Badge key={i} color="gold">{r}</Badge>)}</div>}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Boss">
        <div className="space-y-4">
          <div><label className="label">Boss Name</label><input className="input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Procrastination Demon" autoFocus /></div>
          <div><label className="label">Description</label><input className="input" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="The boss that feeds on delay" /></div>
          <div><label className="label">Max HP</label><input type="number" className="input" value={form.maxHp || 100} onChange={e => setForm({ ...form, maxHp: Number(e.target.value), hp: Number(e.target.value) })} /></div>
          <div><label className="label">Rewards (comma-separated)</label><input className="input" value={(form.rewards || []).join(', ')} onChange={e => setForm({ ...form, rewards: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="100 XP, Focus Boost" /></div>
          <button onClick={saveBoss} className="btn-primary w-full">Create Boss</button>
        </div>
      </Modal>
    </div>
  );
}

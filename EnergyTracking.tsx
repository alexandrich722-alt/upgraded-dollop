// NOVA Life OS — Energy & Context Tracking System
// Track energy patterns, optimal work times, and context management

import { useState, useMemo, useEffect } from 'react';
import { Battery, BatteryMedium, BatteryLow, Sun, Moon, Brain, Coffee, Zap, TrendingUp, TrendingDown, Minus, ChevronUp, ChevronDown, Plus, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Clock } from 'lucide-react';
import { useStore } from './store';
import { Card, Badge, ProgressBar } from './components/ui';

interface EnergyLog {
  id: string;
  timestamp: string;
  level: number; // 1-10
  context: 'work' | 'rest' | 'exercise' | 'social' | 'creative' | 'routine';
  mood?: number; // 1-10
  focus?: number; // 1-10
  notes?: string;
  tags?: string[];
}

interface EnergyPattern {
  hour: number;
  avgLevel: number;
  bestContext: string;
  confidence: number;
}

const CONTEXT_LABELS = {
  work: 'Deep Work',
  rest: 'Rest/Recovery',
  exercise: 'Physical Activity',
  social: 'Social',
  creative: 'Creative Work',
  routine: 'Routine Tasks',
};

const CONTEXT_ICONS = {
  work: Brain,
  rest: Moon,
  exercise: Zap,
  social: Coffee,
  creative: Sun,
  routine: Clock,
};

// Simulated historical data for pattern detection
function generateHistoricalPatterns(): EnergyPattern[] {
  const patterns: EnergyPattern[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    let baseEnergy = 5;
    // Morning peak
    if (hour >= 8 && hour <= 11) baseEnergy = 7.5 + Math.random() * 1.5;
    // Post-lunch dip
    else if (hour >= 13 && hour <= 14) baseEnergy = 4 + Math.random() * 1;
    // Afternoon recovery
    else if (hour >= 15 && hour <= 17) baseEnergy = 6 + Math.random() * 1;
    // Evening
    else if (hour >= 18 && hour <= 20) baseEnergy = 5 + Math.random() * 1.5;
    // Late night
    else if (hour > 20) baseEnergy = 4 + Math.random() * 1;

    patterns.push({
      hour,
      avgLevel: Math.round(baseEnergy * 10) / 10,
      bestContext: hour < 12 ? 'work' : hour < 15 ? 'routine' : hour < 18 ? 'creative' : 'rest',
      confidence: 0.6 + Math.random() * 0.3,
    });
  }
  return patterns;
}

export default function EnergyTracking() {
  const { state } = useStore();
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [showLogger, setShowLogger] = useState(false);
  const [newEnergy, setNewEnergy] = useState(5);
  const [newContext, setNewContext] = useState<EnergyLog['context']>('work');
  const [newMood, setNewMood] = useState(5);
  const [newFocus, setNewFocus] = useState(5);
  const [newNotes, setNewNotes] = useState('');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Load patterns (simulated)
  const patterns = useMemo(() => generateHistoricalPatterns(), []);

  // Current hour recommendation
  const currentHour = new Date().getHours();
  const currentPattern = patterns.find(p => p.hour === currentHour) || patterns[0];
  const currentEnergyLevel = currentPattern.avgLevel;

  // Best hours for deep work
  const bestDeepWorkHours = useMemo(() =>
    [...patterns]
      .filter(p => p.hour >= 8 && p.hour <= 18)
      .sort((a, b) => b.avgLevel - a.avgLevel)
      .slice(0, 3)
      .sort((a, b) => a.hour - b.hour),
    [patterns]
  );

  // Low energy periods to avoid
  const lowEnergyHours = useMemo(() =>
    patterns.filter(p => p.avgLevel < 5).map(p => p.hour),
    [patterns]
  );

  // Group logs by day
  const logsByDay = useMemo(() => {
    const groups: Record<string, EnergyLog[]> = {};
    logs.forEach(log => {
      const day = log.timestamp.split('T')[0];
      if (!groups[day]) groups[day] = [];
      groups[day].push(log);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [logs]);

  // Add new log
  const addLog = () => {
    const log: EnergyLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level: newEnergy,
      context: newContext,
      mood: newMood,
      focus: newFocus,
      notes: newNotes || undefined,
    };
    setLogs(prev => [log, ...prev]);
    setShowLogger(false);
    setNewEnergy(5);
    setNewMood(5);
    setNewFocus(5);
    setNewNotes('');
  };

  // Quick log
  const quickLog = (level: number) => {
    const log: EnergyLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      context: 'routine',
    };
    setLogs(prev => [log, ...prev]);
  };

  // Get energy icon
  const getEnergyIcon = (level: number) => {
    if (level >= 7) return { Icon: Battery, color: 'emerald' };
    if (level >= 4) return { Icon: BatteryMedium, color: 'amber' };
    return { Icon: BatteryLow, color: 'rose' };
  };

  const { Icon: CurrentEnergyIcon, color: currentColor } = getEnergyIcon(currentEnergyLevel);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-nova-text flex items-center gap-3">
            <Battery className="w-7 h-7 text-accent-cyan" />
            Energy Tracking
          </h1>
          <p className="text-sm text-nova-muted mt-1">Track patterns, optimize your day</p>
        </div>
        <button
          onClick={() => setShowLogger(!showLogger)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Log Energy
        </button>
      </div>

      {/* Current Energy Card */}
      <Card className="p-6 border-l-4 border-l-accent-cyan">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-nova-muted mb-1">Right Now ({currentHour}:00)</p>
            <div className="flex items-center gap-3 mb-4">
              <CurrentEnergyIcon className={`w-10 h-10 text-accent-${currentColor}`} />
              <div>
                <p className="text-3xl font-bold text-nova-text">{currentEnergyLevel.toFixed(1)}</p>
                <p className="text-sm text-nova-muted">/ 10 energy</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge color={currentColor}>
                {currentEnergyLevel >= 7 ? 'High Energy' : currentEnergyLevel >= 4 ? 'Medium Energy' : 'Low Energy'}
              </Badge>
              <Badge color="default">{CONTEXT_LABELS[currentPattern.bestContext]} recommended</Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-nova-muted mb-2">Quick Log</p>
            <div className="flex flex-col gap-1">
              <button onClick={() => quickLog(8)} className="btn-ghost text-xs px-3">High 🚀</button>
              <button onClick={() => quickLog(5)} className="btn-ghost text-xs px-3">Medium ⚡</button>
              <button onClick={() => quickLog(3)} className="btn-ghost text-xs px-3">Low 🔋</button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-nova-border">
          <p className="text-sm text-nova-text">
            {currentEnergyLevel >= 7
              ? 'Great energy! This is optimal time for deep work on your hardest task.'
              : currentEnergyLevel >= 5
              ? 'Moderate energy. Good for routine tasks and meetings. Save deep work for peak hours.'
              : 'Low energy detected. Focus on rest, light tasks, or take a break before pushing.'}
          </p>
        </div>
      </Card>

      {/* Logger Modal */}
      {showLogger && (
        <Card className="p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-nova-text">Log Your Energy</h3>
            <button onClick={() => setShowLogger(false)} className="btn-ghost text-xs">Cancel</button>
          </div>

          <div className="space-y-4">
            {/* Energy */}
            <div>
              <label className="label">Energy Level</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newEnergy}
                  onChange={e => setNewEnergy(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-bold text-nova-text w-8">{newEnergy}</span>
              </div>
            </div>

            {/* Context */}
            <div>
              <label className="label">What are you doing?</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(CONTEXT_LABELS) as EnergyLog['context'][]).map(ctx => {
                  const Icon = CONTEXT_ICONS[ctx];
                  return (
                    <button
                      key={ctx}
                      onClick={() => setNewContext(ctx)}
                      className={`p-3 rounded-lg text-center transition-all ${
                        newContext === ctx
                          ? 'bg-accent-cyan/15 border-2 border-accent-cyan text-accent-cyan'
                          : 'bg-nova-surface border border-nova-border text-nova-dim hover:border-nova-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">{CONTEXT_LABELS[ctx]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mood & Focus */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Mood: {newMood}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newMood}
                  onChange={e => setNewMood(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="label">Focus: {newFocus}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newFocus}
                  onChange={e => setNewFocus(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="label">Notes (optional)</label>
              <input
                className="input"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="What's affecting your energy?"
              />
            </div>

            <button onClick={addLog} className="btn-primary w-full">
              <CheckCircle2 className="w-4 h-4" /> Save Log
            </button>
          </div>
        </Card>
      )}

      {/* Daily Energy Pattern */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-nova-text mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent-cyan" />
          Your Daily Energy Pattern
        </h3>
        <div className="h-32 flex items-end gap-1">
          {patterns.map(p => {
            const isCurrentHour = p.hour === currentHour;
            const isBest = bestDeepWorkHours.some(b => b.hour === p.hour);
            const isLow = lowEnergyHours.includes(p.hour);
            const height = (p.avgLevel / 10) * 100;
            return (
              <div
                key={p.hour}
                className={`flex-1 flex flex-col items-center justify-end ${
                  isCurrentHour ? 'ring-2 ring-accent-cyan rounded-t' : ''
                }`}
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isBest
                      ? 'bg-gradient-to-t from-accent-emerald/50 to-accent-emerald'
                      : isLow
                      ? 'bg-gradient-to-t from-accent-rose/30 to-accent-rose/50'
                      : 'bg-gradient-to-t from-accent-cyan/30 to-accent-cyan'
                  }`}
                  style={{ height: `${height}%`, minHeight: '4px' }}
                />
                <span className={`text-[10px] mt-1 ${isCurrentHour ? 'text-accent-cyan font-bold' : 'text-nova-muted'}`}>
                  {p.hour}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-accent-emerald" />
            <span className="text-nova-muted">Peak hours</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-accent-rose/50" />
            <span className="text-nova-muted">Low energy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border-2 border-accent-cyan" />
            <span className="text-nova-muted">Current</span>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best for Deep Work */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-nova-text mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-accent-violet" />
            Best Hours for Deep Work
          </h3>
          <div className="space-y-2">
            {bestDeepWorkHours.map((h, i) => (
              <div key={h.hour} className="flex items-center justify-between text-sm">
                <span className="text-nova-dim">
                  {h.hour}:00 - {h.hour + 1}:00
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-nova-text font-medium">{h.avgLevel.toFixed(1)}</span>
                  {i === 0 && <Badge color="emerald">Best</Badge>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-nova-muted mt-3">
            Schedule your hardest tasks during these hours
          </p>
        </Card>

        {/* Low Energy Periods */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-nova-text mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent-amber" />
            Low Energy Periods
          </h3>
          <div className="space-y-2">
            {lowEnergyHours.length > 0 ? (
              lowEnergyHours.map(hour => (
                <div key={hour} className="flex items-center justify-between text-sm">
                  <span className="text-nova-dim">{hour}:00 - {hour + 1}:00</span>
                  <Badge color="amber">Avoid deep work</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-nova-muted">No significant low energy periods detected</p>
            )}
          </div>
          <p className="text-xs text-nova-muted mt-3">
            Use these for meetings, routine tasks, or breaks
          </p>
        </Card>
      </div>

      {/* Recent Logs */}
      {logs.length > 0 && (
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-nova-text mb-4">Recent Logs</h3>
          <div className="space-y-3">
            {logs.slice(0, 10).map(log => {
              const { Icon, color } = getEnergyIcon(log.level);
              const ContextIcon = CONTEXT_ICONS[log.context];
              return (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-nova-surface">
                  <Icon className={`w-6 h-6 text-accent-${color}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-nova-text">{log.level}/10</span>
                      <Badge color="default">{CONTEXT_LABELS[log.context]}</Badge>
                    </div>
                    {log.notes && <p className="text-xs text-nova-muted mt-1">{log.notes}</p>}
                  </div>
                  <span className="text-xs text-nova-muted">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-4 bg-accent-cyan/5 border-accent-cyan/20">
        <p className="text-sm text-nova-text">
          <span className="font-medium">Tip:</span> Log your energy 3-5 times per day for a week to discover your personal patterns. Everyone's energy rhythm is different.
        </p>
      </Card>
    </div>
  );
}

// NOVA Life OS — Mood Check-In System
// Track mood, find correlations, get insights

import { useState, useMemo, useEffect } from 'react';
import { Heart, Sun, Cloud, CloudRain, TriangleAlert as AlertTriangle, TrendingUp, TrendingDown, Minus, ChevronRight, Smile, Meh, Frown, Brain, Coffee, Zap, Moon, Activity, ChartBar as BarChart3 } from 'lucide-react';
import { useStore } from './store';
import { Card, Badge, ProgressBar } from './components/ui';

interface MoodEntry {
  id: string;
  timestamp: string;
  mood: number; // 1-10
  energy: number; // 1-10
  stress: number; // 1-10
  factors: string[];
  notes?: string;
  activities?: string[];
}

interface Correlation {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  strength: number; // 0-1
  description: string;
}

const MOOD_FACTORS = [
  { id: 'sleep-well', label: 'Good sleep', type: 'positive' },
  { id: 'sleep-bad', label: 'Poor sleep', type: 'negative' },
  { id: 'exercise', label: 'Exercise', type: 'positive' },
  { id: 'social', label: 'Social time', type: 'positive' },
  { id: 'work-stress', label: 'Work stress', type: 'negative' },
  { id: 'accomplishment', label: 'Accomplishment', type: 'positive' },
  { id: 'conflict', label: 'Conflict', type: 'negative' },
  { id: 'nature', label: 'Time in nature', type: 'positive' },
  { id: 'screens', label: 'Excessive screen time', type: 'negative' },
  { id: 'meditation', label: 'Meditation', type: 'positive' },
  { id: 'caffeine', label: 'Too much caffeine', type: 'negative' },
  { id: 'alcohol', label: 'Alcohol', type: 'negative' },
  { id: 'healthy-food', label: 'Healthy eating', type: 'positive' },
  { id: 'junk-food', label: 'Junk food', type: 'negative' },
  { id: 'sunlight', label: 'Morning sunlight', type: 'positive' },
  { id: 'late-night', label: 'Late night', type: 'negative' },
];

const ACTIVITIES = [
  'Deep work', 'Meetings', 'Exercise', 'Social', 'Creative', 'Learning', 'Rest', 'Commute', 'Chores', 'Entertainment',
];

export default function MoodCheckIn() {
  const { state } = useStore();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [showFullCheckIn, setShowFullCheckIn] = useState(false);
  const [quickMood, setQuickMood] = useState<number | null>(null);

  // New entry form
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Calculate averages and trends
  const stats = useMemo(() => {
    if (entries.length === 0) {
      // Use reflection data as fallback
      const reflections = state.reflections.slice(0, 7);
      return {
        avgMood: reflections.length ? Math.round(reflections.reduce((a, r) => a + r.mood, 0) / reflections.length) : 5,
        avgEnergy: reflections.length ? Math.round(reflections.reduce((a, r) => a + r.energy, 0) / reflections.length) : 5,
        avgStress: reflections.length ? Math.round(reflections.reduce((a, r) => a + r.stress, 0) / reflections.length) : 5,
        trend: 'stable' as const,
        entriesCount: 0,
      };
    }

    const recent = entries.slice(0, 7);
    const older = entries.slice(7, 14);

    const avgMood = Math.round(recent.reduce((a, e) => a + e.mood, 0) / recent.length);
    const avgEnergy = Math.round(recent.reduce((a, e) => a + e.energy, 0) / recent.length);
    const avgStress = Math.round(recent.reduce((a, e) => a + e.stress, 0) / recent.length);

    const olderAvgMood = older.length ? older.reduce((a, e) => a + e.mood, 0) / older.length : avgMood;
    const trend = avgMood > olderAvgMood + 0.5 ? 'up' : avgMood < olderAvgMood - 0.5 ? 'down' : 'stable';

    return { avgMood, avgEnergy, avgStress, trend, entriesCount: entries.length };
  }, [entries, state.reflections]);

  // Find correlations
  const correlations = useMemo((): Correlation[] => {
    if (entries.length < 5) return [];

    const factorStats: Record<string, { count: number; moodSum: number }> = {};

    entries.forEach(entry => {
      const moodNorm = entry.mood / 10;
      entry.factors.forEach(factor => {
        if (!factorStats[factor]) factorStats[factor] = { count: 0, moodSum: 0 };
        factorStats[factor].count++;
        factorStats[factor].moodSum += entry.mood;
      });
    });

    const globalAvg = stats.avgMood;
    const results: Correlation[] = [];

    Object.entries(factorStats).forEach(([factor, data]) => {
      if (data.count < 2) return;
      const factorAvg = data.moodSum / data.count;
      const diff = factorAvg - globalAvg;
      const factorDef = MOOD_FACTORS.find(f => f.id === factor);

      if (Math.abs(diff) >= 0.5) {
        results.push({
          factor: factorDef?.label || factor,
          impact: diff > 0 ? 'positive' : 'negative',
          strength: Math.min(1, Math.abs(diff) / 3),
          description: `When "${factorDef?.label || factor}" is present, mood averages ${factorAvg.toFixed(1)} vs your usual ${globalAvg.toFixed(1)}`,
        });
      }
    });

    return results.sort((a, b) => b.strength - a.strength).slice(0, 5);
  }, [entries, stats.avgMood]);

  // Add entry
  const addEntry = (quickMoodValue?: number) => {
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      mood: quickMoodValue ?? mood,
      energy: quickMoodValue ? 5 : energy,
      stress: quickMoodValue ? 5 : stress,
      factors: quickMoodValue ? [] : selectedFactors,
      notes: quickMoodValue ? undefined : notes || undefined,
      activities: quickMoodValue ? [] : selectedActivities,
    };
    setEntries(prev => [entry, ...prev]);
    setShowFullCheckIn(false);
    setQuickMood(null);
    setMood(5);
    setEnergy(5);
    setStress(5);
    setSelectedFactors([]);
    setSelectedActivities([]);
    setNotes('');
  };

  // Toggle factor
  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev =>
      prev.includes(factorId)
        ? prev.filter(f => f !== factorId)
        : [...prev, factorId]
    );
  };

  // Toggle activity
  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  // Get mood icon
  const getMoodIcon = (moodLevel: number) => {
    if (moodLevel >= 7) return { Icon: Smile, color: 'emerald' };
    if (moodLevel >= 4) return { Icon: Meh, color: 'amber' };
    return { Icon: Frown, color: 'rose' };
  };

  const { Icon: MoodIcon, color: moodColor } = getMoodIcon(stats.avgMood);

  // Group entries by day
  const entriesByDay = useMemo(() => {
    const groups: Record<string, MoodEntry[]> = {};
    entries.forEach(entry => {
      const day = entry.timestamp.split('T')[0];
      if (!groups[day]) groups[day] = [];
      groups[day].push(entry);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [entries]);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-nova-text flex items-center gap-3">
            <Heart className="w-7 h-7 text-accent-rose" />
            Mood Check-In
          </h1>
          <p className="text-sm text-nova-muted mt-1">Track patterns, understand yourself</p>
        </div>
        <button
          onClick={() => setShowFullCheckIn(!showFullCheckIn)}
          className="btn-primary"
        >
          {showFullCheckIn ? 'Cancel' : '+ Check In'}
        </button>
      </div>

      {/* Current Status Card */}
      <Card className="p-6 border-l-4 border-l-accent-rose">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-nova-muted mb-2">Your average mood (last 7 days)</p>
            <div className="flex items-center gap-4">
              <MoodIcon className={`w-12 h-12 text-accent-${moodColor}`} />
              <div>
                <p className="text-4xl font-bold text-nova-text">{stats.avgMood}</p>
                <p className="text-sm text-nova-muted">/ 10</p>
              </div>
              <div className="ml-4">
                {stats.trend === 'up' && (
                  <div className="flex items-center gap-1 text-accent-emerald">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm">Improving</span>
                  </div>
                )}
                {stats.trend === 'down' && (
                  <div className="flex items-center gap-1 text-accent-rose">
                    <TrendingDown className="w-5 h-5" />
                    <span className="text-sm">Declining</span>
                  </div>
                )}
                {stats.trend === 'stable' && (
                  <div className="flex items-center gap-1 text-nova-muted">
                    <Minus className="w-5 h-5" />
                    <span className="text-sm">Stable</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-nova-muted mb-2">Quick check-in</p>
            <div className="flex gap-2">
              <button
                onClick={() => addEntry(8)}
                className="w-12 h-12 rounded-xl bg-accent-emerald/15 flex items-center justify-center hover:bg-accent-emerald/25 transition-colors"
              >
                <Smile className="w-6 h-6 text-accent-emerald" />
              </button>
              <button
                onClick={() => addEntry(5)}
                className="w-12 h-12 rounded-xl bg-accent-amber/15 flex items-center justify-center hover:bg-accent-amber/25 transition-colors"
              >
                <Meh className="w-6 h-6 text-accent-amber" />
              </button>
              <button
                onClick={() => addEntry(3)}
                className="w-12 h-12 rounded-xl bg-accent-rose/15 flex items-center justify-center hover:bg-accent-rose/25 transition-colors"
              >
                <Frown className="w-6 h-6 text-accent-rose" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 pt-4 border-t border-nova-border grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-nova-text">{stats.avgEnergy}</p>
            <p className="text-xs text-nova-muted flex items-center justify-center gap-1"><Zap className="w-3 h-3" /> Energy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-nova-text">{stats.avgStress}</p>
            <p className="text-xs text-nova-muted flex items-center justify-center gap-1"><Activity className="w-3 h-3" /> Stress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-nova-text">{stats.entriesCount}</p>
            <p className="text-xs text-nova-muted flex items-center justify-center gap-1"><BarChart3 className="w-3 h-3" /> Entries</p>
          </div>
        </div>
      </Card>

      {/* Full Check-In Form */}
      {showFullCheckIn && (
        <Card className="p-5 animate-slide-up">
          <h3 className="text-lg font-semibold text-nova-text mb-4">How are you feeling?</h3>

          <div className="space-y-6">
            {/* Mood Slider */}
            <div>
              <label className="label flex items-center justify-between">
                <span>Mood</span>
                <span className="text-lg font-bold text-nova-text">{mood}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={e => setMood(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-nova-muted mt-1">
                <span>Terrible</span>
                <span>Amazing</span>
              </div>
            </div>

            {/* Energy & Stress */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center justify-between">
                  <span>Energy</span>
                  <span>{energy}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={e => setEnergy(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="label flex items-center justify-between">
                  <span>Stress</span>
                  <span>{stress}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stress}
                  onChange={e => setStress(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Factors */}
            <div>
              <label className="label">What's affecting you? (select all that apply)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MOOD_FACTORS.map(factor => (
                  <button
                    key={factor.id}
                    onClick={() => toggleFactor(factor.id)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      selectedFactors.includes(factor.id)
                        ? factor.type === 'positive'
                          ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30'
                          : 'bg-accent-rose/15 text-accent-rose border border-accent-rose/30'
                        : 'bg-nova-surface text-nova-dim border border-nova-border hover:border-nova-muted'
                    }`}
                  >
                    {factor.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div>
              <label className="label">What have you been doing?</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {ACTIVITIES.map(activity => (
                  <button
                    key={activity}
                    onClick={() => toggleActivity(activity)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      selectedActivities.includes(activity)
                        ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                        : 'bg-nova-surface text-nova-dim border border-nova-border hover:border-nova-muted'
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                className="input min-h-[80px] resize-none"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="What's on your mind?"
              />
            </div>

            <button onClick={() => addEntry()} className="btn-primary w-full">
              <Heart className="w-4 h-4" /> Save Check-In
            </button>
          </div>
        </Card>
      )}

      {/* Correlations */}
      {correlations.length > 0 && (
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-nova-text mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-violet" />
            Your Mood Patterns
          </h3>
          <p className="text-sm text-nova-muted mb-4">
            Based on {entries.length} check-ins, here's what affects your mood:
          </p>
          <div className="space-y-3">
            {correlations.map((corr, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  corr.impact === 'positive'
                    ? 'bg-accent-emerald/5 border-accent-emerald/20'
                    : 'bg-accent-rose/5 border-accent-rose/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-nova-text">{corr.factor}</span>
                  <Badge color={corr.impact === 'positive' ? 'emerald' : 'rose'}>
                    {corr.impact === 'positive' ? '+ Boosts' : '- Lowers'} mood
                  </Badge>
                </div>
                <p className="text-xs text-nova-dim">{corr.description}</p>
                <div className="mt-2">
                  <div className="h-1.5 bg-nova-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        corr.impact === 'positive' ? 'bg-accent-emerald' : 'bg-accent-rose'
                      }`}
                      style={{ width: `${corr.strength * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-nova-muted mt-1">
                    {corr.strength > 0.7 ? 'Strong correlation' : corr.strength > 0.4 ? 'Moderate correlation' : 'Slight correlation'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Wellness Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Insight Card */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-nova-text mb-3 flex items-center gap-2">
            <Sun className="w-4 h-4 text-accent-amber" />
            Reflection
          </h3>
          <p className="text-sm text-nova-dim leading-relaxed">
            {stats.avgMood >= 7
              ? 'You\'re doing great! Maintain your current routines and keep doing what works.'
              : stats.avgMood >= 5
              ? 'You\'re in a stable place. Small improvements to sleep or exercise could boost your mood further.'
              : 'It seems like things are tough right now. Consider reaching out to someone, reducing commitments, or adding recovery activities.'}
          </p>
        </Card>

        {/* Recommendation */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-nova-text mb-3 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-accent-cyan" />
            Recommendation
          </h3>
          <p className="text-sm text-nova-dim leading-relaxed">
            {stats.avgStress > 7
              ? 'High stress detected. Try adding a 10-minute break between tasks, or consider meditation before bed.'
              : stats.avgEnergy < 4
              ? 'Low energy pattern. Focus on sleep quality and morning sunlight. Consider shorter work sessions.'
              : 'Your patterns look healthy. Keep tracking to discover more insights about what works for you.'}
          </p>
        </Card>
      </div>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-nova-text mb-4">Recent Check-Ins</h3>
          <div className="space-y-4">
            {entriesByDay.slice(0, 5).map(([day, dayEntries]) => (
              <div key={day}>
                <p className="text-xs text-nova-muted uppercase tracking-wider mb-2">
                  {new Date(day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <div className="space-y-2">
                  {dayEntries.map(entry => {
                    const { Icon, color } = getMoodIcon(entry.mood);
                    return (
                      <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-nova-surface">
                        <Icon className={`w-6 h-6 text-accent-${color}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-nova-text">{entry.mood}/10</span>
                            <span className="text-xs text-nova-muted">
                              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {entry.factors.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {entry.factors.slice(0, 4).map(f => {
                                const factor = MOOD_FACTORS.find(mf => mf.id === f);
                                return (
                                  <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-nova-border text-nova-muted">
                                    {factor?.label || f}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          {entry.notes && (
                            <p className="text-xs text-nova-dim mt-1.5">{entry.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Note about mental health */}
      <Card className="p-4 bg-accent-amber/5 border-accent-amber/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-accent-amber shrink-0 mt-0.5" />
          <p className="text-sm text-nova-dim">
            <span className="font-medium text-nova-text">Note:</span> NOVA is not a mental health service. If you're experiencing persistent low mood, anxiety, or crisis, please reach out to a mental health professional or support service.
          </p>
        </div>
      </Card>
    </div>
  );
}

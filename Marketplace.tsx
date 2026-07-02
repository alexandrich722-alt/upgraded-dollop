import { useState } from 'react';
import { Brain, TrendingUp, Zap, AlertTriangle, Lightbulb, Star, BarChart2, Clock } from 'lucide-react';
import { useStore } from '../store';
import { buildPersonalityProfile } from '../lib/patternDetection';
import { Card, SectionHeader } from '../components/ui';

export default function NovaKnows() {
  const { state } = useStore();
  const [revealed, setRevealed] = useState(false);
  const profile = buildPersonalityProfile(state);

  const statItems = [
    { label: 'Tasks Done', value: profile.stats.totalTasksDone.toLocaleString(), icon: '✅' },
    { label: 'Habit Days', value: profile.stats.totalHabitDays.toLocaleString(), icon: '🔥' },
    { label: 'Longest Streak', value: `${profile.stats.longestStreak}d`, icon: '⚡' },
    { label: 'Goals Completed', value: profile.stats.goalsCompleted, icon: '🎯' },
    { label: 'Reflections', value: profile.stats.reflectionCount, icon: '📖' },
    { label: 'Avg Mood', value: `${profile.stats.avgMood}/10`, icon: '😊' },
    { label: 'Avg Energy', value: `${profile.stats.avgEnergy}/10`, icon: '💡' },
    { label: 'Avg Stress', value: `${profile.stats.avgStress}/10`, icon: '🌡️' },
    { label: 'Total XP', value: profile.stats.totalXP.toLocaleString(), icon: '✨' },
    { label: 'Level', value: profile.stats.level, icon: '🏆' },
  ];

  if (!revealed) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto animate-fade-in flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 flex items-center justify-center mb-6 border border-accent-cyan/20">
          <Brain className="w-10 h-10 text-accent-cyan" style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.4))' }} />
        </div>
        <h1 className="font-display text-3xl font-bold text-nova-text mb-3">NOVA Knows You</h1>
        <p className="text-nova-dim mb-8 max-w-sm leading-relaxed">
          Based on everything you've shared — your tasks, habits, reflections, finances, relationships — NOVA has built a profile of who you are. Ready to see it?
        </p>
        <button
          onClick={() => setRevealed(true)}
          className="btn-primary text-base px-8 py-3"
        >
          <Brain className="w-5 h-5" /> Show Me
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in">
      <SectionHeader title="NOVA Knows You" subtitle="Behavioral analysis based on your data" />

      {/* Archetype card */}
      <Card className="p-6 mb-4 gradient-mesh text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 flex items-center justify-center border border-accent-cyan/20">
          <Star className="w-8 h-8 text-accent-gold" style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.3))' }} />
        </div>
        <h2 className="font-display text-2xl font-bold text-nova-text mb-1">{profile.archetype}</h2>
        <p className="text-nova-dim text-sm leading-relaxed">{profile.archetypeDesc}</p>
      </Card>

      {/* Insights grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-accent-cyan" /><p className="text-xs text-nova-muted uppercase tracking-wider">Peak Time</p></div>
          <p className="text-sm text-nova-text">{profile.peakTime}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-accent-emerald" /><p className="text-xs text-nova-muted uppercase tracking-wider">Your Strength</p></div>
          <p className="text-sm text-nova-text">{profile.strength}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-accent-gold" /><p className="text-xs text-nova-muted uppercase tracking-wider">Weak Pattern</p></div>
          <p className="text-sm text-nova-text">{profile.weakPattern}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-accent-rose" /><p className="text-xs text-nova-muted uppercase tracking-wider">Blind Spot</p></div>
          <p className="text-sm text-nova-text">{profile.blindspot}</p>
        </Card>
      </div>

      {/* Recommendation */}
      <Card className="p-5 mb-4 bg-accent-cyan/5 border-accent-cyan/15">
        <div className="flex items-center gap-2 mb-2"><Lightbulb className="w-4 h-4 text-accent-cyan" /><p className="text-xs text-nova-muted uppercase tracking-wider">NOVA's Recommendation</p></div>
        <p className="text-sm text-nova-text leading-relaxed">{profile.recommendation}</p>
      </Card>

      {/* Stats grid */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4"><BarChart2 className="w-4 h-4 text-accent-violet" /><h3 className="text-sm font-medium text-nova-text">Your Life in Numbers</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {statItems.map(item => (
            <div key={item.label} className="text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="font-display text-lg font-bold text-nova-text">{item.value}</div>
              <div className="text-[10px] text-nova-muted">{item.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

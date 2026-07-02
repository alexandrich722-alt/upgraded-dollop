import { useState, useMemo } from 'react';
import { Trophy, Lock, Zap } from 'lucide-react';
import { useStore } from '../store';
import { ALL_ACHIEVEMENTS } from '../lib/achievements';
import { Card, SectionHeader } from '../components/ui';
import type { AchievementCategory } from '../types';

const RARITY_COLORS = {
  common: 'text-nova-muted',
  rare: 'text-accent-cyan',
  epic: 'text-accent-violet',
  legendary: 'text-accent-gold',
};

const RARITY_BG = {
  common: 'bg-nova-surface border-nova-border',
  rare: 'bg-accent-cyan/8 border-accent-cyan/20',
  epic: 'bg-accent-violet/8 border-accent-violet/20',
  legendary: 'bg-accent-gold/8 border-accent-gold/20',
};

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  tasks: 'Tasks', goals: 'Goals', habits: 'Habits', finance: 'Finance',
  social: 'Social', growth: 'Growth', reflection: 'Reflection',
  quests: 'Quests', streaks: 'Streaks', meta: 'Meta',
};

export default function Achievements() {
  const { state } = useStore();
  const [filter, setFilter] = useState<'all' | 'unlocked' | AchievementCategory>('all');

  const achievementMap = useMemo(() => {
    const m: Record<string, { unlockedAt: string | null }> = {};
    state.achievements.forEach(a => { m[a.id] = { unlockedAt: a.unlockedAt }; });
    return m;
  }, [state.achievements]);

  const allWithStatus = useMemo(() => ALL_ACHIEVEMENTS.map(def => ({
    ...def,
    unlockedAt: achievementMap[def.id]?.unlockedAt || null,
  })), [achievementMap]);

  const filtered = useMemo(() => {
    if (filter === 'all') return allWithStatus;
    if (filter === 'unlocked') return allWithStatus.filter(a => a.unlockedAt);
    return allWithStatus.filter(a => a.category === filter);
  }, [allWithStatus, filter]);

  const unlocked = allWithStatus.filter(a => a.unlockedAt).length;
  const totalXP = allWithStatus.filter(a => a.unlockedAt).reduce((s, a) => s + a.xpReward, 0);

  const categories: (AchievementCategory | 'all' | 'unlocked')[] = ['all', 'unlocked', ...Object.keys(CATEGORY_LABELS) as AchievementCategory[]];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      <SectionHeader
        title="Hall of Fame"
        subtitle={`${unlocked}/${ALL_ACHIEVEMENTS.length} unlocked · ${totalXP.toLocaleString()} XP earned`}
      />

      {/* Progress bar */}
      <Card className="p-4 mb-6 gradient-mesh">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-nova-dim">Achievement Progress</span>
          <span className="text-nova-text font-medium">{Math.round((unlocked / ALL_ACHIEVEMENTS.length) * 100)}%</span>
        </div>
        <div className="h-2.5 bg-nova-surface rounded-full overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-gold transition-all duration-700"
            style={{ width: `${Math.max(2, (unlocked / ALL_ACHIEVEMENTS.length) * 100)}%`, boxShadow: '0 0 8px rgba(34,211,238,0.3)' }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-nova-muted">
          {(['common', 'rare', 'epic', 'legendary'] as const).map(r => {
            const count = allWithStatus.filter(a => a.rarity === r && a.unlockedAt).length;
            const total = ALL_ACHIEVEMENTS.filter(a => a.rarity === r).length;
            return (
              <span key={r} className={`font-medium ${RARITY_COLORS[r]}`}>
                {r.charAt(0).toUpperCase() + r.slice(1)}: {count}/{total}
              </span>
            );
          })}
        </div>
      </Card>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        {categories.slice(0, 8).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`badge cursor-pointer whitespace-nowrap transition-all shrink-0 ${filter === cat ? 'bg-accent-cyan/12 text-accent-cyan border border-accent-cyan/20' : 'bg-nova-surface text-nova-muted border border-nova-border hover:border-nova-muted/40'}`}
          >
            {cat === 'all' ? `All (${ALL_ACHIEVEMENTS.length})` : cat === 'unlocked' ? `Unlocked (${unlocked})` : CATEGORY_LABELS[cat as AchievementCategory]}
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(achievement => {
          const isUnlocked = Boolean(achievement.unlockedAt);
          return (
            <div
              key={achievement.id}
              className={`relative p-4 rounded-2xl border transition-all duration-300 ${isUnlocked ? RARITY_BG[achievement.rarity] + ' shadow-sm' : 'bg-nova-surface/40 border-nova-border/40 opacity-60'}`}
            >
              {/* Rarity glow for legendary */}
              {isUnlocked && achievement.rarity === 'legendary' && (
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(251,191,36,0.08)' }} />
              )}

              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-all ${isUnlocked ? '' : 'grayscale opacity-40'}`}>
                  {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-nova-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className={`text-sm font-medium ${isUnlocked ? 'text-nova-text' : 'text-nova-muted'}`}>{achievement.title}</p>
                    {achievement.rarity !== 'common' && (
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${RARITY_COLORS[achievement.rarity]}`}>
                        {achievement.rarity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-nova-muted leading-relaxed">{isUnlocked ? achievement.description : achievement.condition}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`flex items-center gap-1 text-xs font-medium ${isUnlocked ? 'text-accent-gold' : 'text-nova-muted'}`}>
                      <Zap className="w-3 h-3" /> {achievement.xpReward} XP
                    </span>
                    {isUnlocked && achievement.unlockedAt && (
                      <span className="text-[10px] text-nova-muted">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-nova-muted mx-auto mb-3" />
          <p className="text-nova-dim">No achievements in this category yet.</p>
        </div>
      )}
    </div>
  );
}

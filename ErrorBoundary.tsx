import { useState, lazy, Suspense, useEffect, useMemo, useCallback } from 'react';
import { Menu, X, Zap, Search, Trophy } from 'lucide-react';
import { StoreProvider, useStore, eventBus } from './store';
import { ToastProvider, useToast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { navItems, navGroups } from './navigation';
import { Skeleton, Modal } from './components/ui';
import Onboarding from './components/Onboarding';
import { useKonamiCode, useGhostMode, useTimeCapsuleCheck, getGhostMessage } from './lib/easterEggs';
import { ALL_ACHIEVEMENTS } from './lib/achievements';

// Eagerly loaded screens
import TodayMission from './screens/TodayMission';
import Dashboard from './screens/Dashboard';
import AIChief from './screens/AIChief';
import VoiceCapture from './screens/VoiceCapture';
import Goals from './screens/Goals';
import Projects from './screens/Projects';
import Tasks from './screens/Tasks';
import Habits from './screens/Habits';
import Social from './screens/Social';
import Skills from './screens/Skills';
import Quests from './screens/Quests';
import Mentors from './screens/Mentors';
import Installed from './screens/Installed';
import Protocols from './screens/Protocols';
import Settings from './screens/Settings';
import Privacy from './screens/Privacy';

// Lazy loaded heavy modules
const Finance = lazy(() => import('./screens/Finance'));
const Reflections = lazy(() => import('./screens/Reflections'));
const LifeGraph = lazy(() => import('./screens/LifeGraph'));
const BossBattle = lazy(() => import('./screens/BossBattle'));
const Marketplace = lazy(() => import('./screens/Marketplace'));
const Achievements = lazy(() => import('./screens/Achievements'));
const NovaKnows = lazy(() => import('./screens/NovaKnows'));
const TimeCapsule = lazy(() => import('./screens/TimeCapsule'));

const screenMap: Record<string, React.ComponentType> = {
  today: TodayMission, dashboard: Dashboard, ai: AIChief, voice: VoiceCapture,
  goals: Goals, projects: Projects, tasks: Tasks, habits: Habits, social: Social,
  skills: Skills, quests: Quests, mentors: Mentors, installed: Installed,
  protocols: Protocols, settings: Settings, privacy: Privacy,
  finance: Finance, reflections: Reflections, 'life-graph': LifeGraph,
  bosses: BossBattle, marketplace: Marketplace,
  achievements: Achievements, 'nova-knows': NovaKnows, 'time-capsule': TimeCapsule,
};

const lazyScreens = new Set(['finance', 'reflections', 'life-graph', 'bosses', 'marketplace', 'achievements', 'nova-knows', 'time-capsule']);

function ScreenLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
    </div>
  );
}

// ─── Global Achievement Toast ─────────────────────────────────────────────────
function AchievementToastListener() {
  const { toast } = useToast();
  useEffect(() => {
    const off = eventBus.on('achievement:unlocked', (payload) => {
      const def = ALL_ACHIEVEMENTS.find(a => a.id === payload?.id);
      if (def) toast('success', `Achievement unlocked: ${def.icon} ${def.title} (+${def.xpReward} XP)`);
    });
    return off;
  }, [toast]);
  return null;
}

// ─── Global Search ─────────────────────────────────────────────────────────────
function GlobalSearch({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (id: string) => void }) {
  const { state } = useStore();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const res: { type: string; label: string; sublabel?: string; screen: string }[] = [];
    state.tasks.filter(t => !t.archived && t.title.toLowerCase().includes(q)).slice(0, 4).forEach(t => res.push({ type: 'Task', label: t.title, sublabel: t.priority, screen: 'tasks' }));
    state.goals.filter(g => !g.archived && g.title.toLowerCase().includes(q)).slice(0, 4).forEach(g => res.push({ type: 'Goal', label: g.title, sublabel: `${g.progress}%`, screen: 'goals' }));
    state.projects.filter(p => !p.archived && p.title.toLowerCase().includes(q)).slice(0, 3).forEach(p => res.push({ type: 'Project', label: p.title, sublabel: `${p.progress}%`, screen: 'projects' }));
    state.habits.filter(h => !h.archived && h.title.toLowerCase().includes(q)).slice(0, 3).forEach(h => res.push({ type: 'Habit', label: h.title, sublabel: `${h.streak}d streak`, screen: 'habits' }));
    state.contacts.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3).forEach(c => res.push({ type: 'Contact', label: c.name, sublabel: c.relationship, screen: 'social' }));
    navItems.filter(n => n.label.toLowerCase().includes(q)).forEach(n => res.push({ type: 'Screen', label: n.label, screen: n.id }));
    return res.slice(0, 12);
  }, [query, state]);

  return (
    <Modal open={open} onClose={onClose} title="Search" maxWidth="max-w-lg">
      <input className="input mb-4" placeholder="Search tasks, goals, projects, habits, people..." value={query} onChange={e => setQuery(e.target.value)} autoFocus aria-label="Global search" />
      <div className="space-y-1 max-h-80 overflow-y-auto no-scrollbar">
        {query.trim() && results.length === 0 && <p className="text-sm text-nova-muted text-center py-4">No results found</p>}
        {!query.trim() && (
          <div className="grid grid-cols-2 gap-2 py-2">
            {['today', 'goals', 'tasks', 'habits', 'finance', 'achievements', 'nova-knows', 'time-capsule'].map(id => {
              const item = navItems.find(n => n.id === id);
              if (!item) return null;
              const Icon = item.icon;
              return (
                <button key={id} onClick={() => { onNavigate(id); onClose(); setQuery(''); }} className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-nova-surface transition-colors text-left">
                  <Icon className="w-4 h-4 text-nova-muted shrink-0" />
                  <span className="text-sm text-nova-dim">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
        {results.map((r, i) => (
          <button key={i} onClick={() => { onNavigate(r.screen); onClose(); setQuery(''); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-nova-surface transition-colors text-left">
            <span className="badge bg-nova-surface text-nova-muted shrink-0">{r.type}</span>
            <div className="flex-1 min-w-0"><p className="text-sm text-nova-text truncate">{r.label}</p>{r.sublabel && <p className="text-xs text-nova-muted">{r.sublabel}</p>}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ─── Ghost Mode Modal ─────────────────────────────────────────────────────────
function GhostModeModal({ name }: { name: string }) {
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isGhost = useGhostMode();
  const { unlockAchievement } = useStore();

  useEffect(() => {
    if (isGhost && !shown && !dismissed) {
      setShown(true);
      unlockAchievement('meta_ghost_mode');
    }
  }, [isGhost, shown, dismissed, unlockAchievement]);

  if (!shown || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-lg" onClick={() => setDismissed(true)} />
      <div className="relative max-w-sm w-full text-center glass-strong rounded-3xl p-8 border border-nova-border animate-scale-in">
        <div className="text-5xl mb-4">🦉</div>
        <p className="text-nova-text font-medium mb-2">Ghost Mode Activated</p>
        <p className="text-nova-dim text-sm mb-6">{getGhostMessage(name)}</p>
        <button onClick={() => setDismissed(true)} className="btn-ghost w-full">I'm okay</button>
      </div>
    </div>
  );
}

// ─── Time Capsule Reveal Modal ────────────────────────────────────────────────
function TimeCapsuleReveal() {
  const { revealed, dismiss } = useTimeCapsuleCheck();
  if (!revealed) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={dismiss} />
      <div className="relative max-w-md w-full glass-strong rounded-3xl p-8 border border-accent-gold/20 animate-scale-in" style={{ boxShadow: '0 0 40px rgba(251,191,36,0.1)' }}>
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">📬</div>
          <h2 className="font-display text-xl font-bold text-nova-text">Message from the Past</h2>
          <p className="text-xs text-nova-muted mt-1">Written {new Date(revealed.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="bg-nova-surface rounded-2xl p-4 mb-6">
          <p className="text-nova-text italic leading-relaxed text-sm">"{revealed.message}"</p>
        </div>
        <button onClick={dismiss} className="btn-primary w-full">Close</button>
      </div>
    </div>
  );
}

// ─── Konami Modal ─────────────────────────────────────────────────────────────
function KonamiModal({ state: appState, onClose, onNavigate }: { state: any; onClose: () => void; onNavigate: (id: string) => void }) {
  const { unlockAchievement } = useStore();

  useEffect(() => {
    unlockAchievement('meta_konami');
  }, [unlockAchievement]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative max-w-lg w-full glass-strong rounded-3xl p-8 border border-accent-gold/30 animate-scale-in" style={{ boxShadow: '0 0 60px rgba(251,191,36,0.15)' }}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎮</div>
          <h2 className="font-display text-2xl font-bold text-nova-text">God Mode Activated</h2>
          <p className="text-nova-dim text-sm">You found the secret. The Chosen One achievement is yours.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Total Tasks Done', value: appState.tasks.filter((t: any) => t.status === 'done').length },
            { label: 'Total Habit Days', value: appState.habits.reduce((a: number, h: any) => a + h.history.length, 0) },
            { label: 'XP Earned', value: appState.profile.totalXpEarned || appState.profile.xp },
            { label: 'Reflections', value: appState.reflections.length },
            { label: 'Contacts', value: appState.contacts.length },
            { label: 'Life Score', value: `${appState.profile.lifeScore}/100` },
          ].map(item => (
            <div key={item.label} className="bg-nova-surface rounded-xl p-3 text-center">
              <div className="font-display text-xl font-bold text-accent-gold">{item.value}</div>
              <div className="text-xs text-nova-muted">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { onNavigate('achievements'); onClose(); }} className="btn-primary flex-1"><Trophy className="w-4 h-4" /> Hall of Fame</button>
          <button onClick={() => { onNavigate('nova-knows'); onClose(); }} className="btn-ghost flex-1">NOVA Knows You</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  const { state } = useStore();
  const xpPercent = ((state.profile.totalXpEarned || state.profile.xp) % 500) / 500 * 100;
  const unlockedCount = state.achievements.filter(a => a.unlockedAt).length;

  // Only show nav items that are in main groups (not easter egg screens in sidebar)
  const sidebarItems = navItems.filter(n => !['nova-knows', 'time-capsule'].includes(n.id));

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-nova-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center shrink-0 shadow-glow-cyan">
          <Zap className="w-5 h-5 text-nova-bg" fill="currentColor" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-nova-text text-lg leading-none tracking-tight">NOVA</h1>
          <p className="text-[10px] text-nova-muted uppercase tracking-[0.2em] mt-0.5">Life OS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar py-3" aria-label="Main navigation">
        {navGroups.map(group => {
          const groupItems = sidebarItems.filter(n => n.group === group.id);
          if (groupItems.length === 0) return null;
          return (
            <div key={group.id} className="mb-1">
              <p className="px-5 py-2 text-[10px] font-semibold text-nova-muted uppercase tracking-[0.15em]">{group.label}</p>
              {groupItems.map(item => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-200 relative group ${isActive ? 'text-accent-cyan' : 'text-nova-dim hover:text-nova-text'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-accent-cyan shadow-glow-cyan" />}
                    <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span className="font-medium truncate">{item.label}</span>
                    {item.id === 'achievements' && unlockedCount > 0 && (
                      <span className="ml-auto text-[10px] text-accent-gold font-bold">{unlockedCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-nova-border">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-nova-surface transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center text-sm font-bold text-nova-bg shrink-0">
            {state.profile.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-nova-text truncate">{state.profile.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-nova-muted">Lv {state.profile.level}</span>
              <div className="flex-1 h-1 bg-nova-surface rounded-full overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-accent-cyan to-accent-violet rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
              </div>
              <span className="text-[10px] text-nova-muted">{(state.profile.totalXpEarned || state.profile.xp) % 500}/500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileBottomNav({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  const items = navItems.filter(n => ['today', 'tasks', 'ai', 'habits', 'dashboard'].includes(n.id));
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-nova-border lg:hidden">
      <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${isActive ? 'text-accent-cyan' : 'text-nova-muted'}`} aria-label={item.label} aria-current={isActive ? 'page' : undefined}>
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main App Content ─────────────────────────────────────────────────────────
function AppContent() {
  const [active, setActive] = useState('today');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [konamiOpen, setKonamiOpen] = useState(false);
  const { onboardingComplete, state } = useStore();

  const navigate = useCallback((id: string) => {
    setActive(id);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobileMenuOpen(false); setSearchOpen(false); setKonamiOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useKonamiCode(useCallback(() => setKonamiOpen(true), []));

  if (!onboardingComplete) return <Onboarding />;

  const Screen = screenMap[active] || TodayMission;
  const isLazy = lazyScreens.has(active);

  return (
    <div className="min-h-screen bg-nova-bg flex relative">
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-50" />

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-nova-border bg-nova-surface/40 backdrop-blur-sm sticky top-0 h-screen z-20">
        <Sidebar active={active} onNavigate={navigate} />
      </aside>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-nova-surface border-r border-nova-border animate-slide-in-right">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-nova-card" aria-label="Close menu">
              <X className="w-5 h-5 text-nova-dim" />
            </button>
            <Sidebar active={active} onNavigate={navigate} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 glass-strong border-b border-nova-border px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileMenuOpen(true)} className="p-1.5 rounded-lg hover:bg-nova-card transition-colors" aria-label="Open menu">
            <Menu className="w-5 h-5 text-nova-text" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center shadow-glow-cyan">
              <Zap className="w-4 h-4 text-nova-bg" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-nova-text tracking-tight">NOVA</span>
          </div>
          <button onClick={() => setSearchOpen(true)} className="p-1.5 rounded-lg hover:bg-nova-card transition-colors" aria-label="Search">
            <Search className="w-5 h-5 text-nova-text" />
          </button>
        </header>

        {/* Desktop search */}
        <button onClick={() => setSearchOpen(true)} className="hidden lg:flex items-center gap-2 absolute top-4 right-4 z-30 px-3 py-1.5 rounded-lg glass text-xs text-nova-muted hover:text-nova-text transition-colors" aria-label="Search (Ctrl+K)">
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
          <kbd className="px-1.5 py-0.5 rounded bg-nova-surface text-[10px] font-mono border border-nova-border">⌘K</kbd>
        </button>

        <main className="flex-1 pb-20 lg:pb-0">
          <ErrorBoundary key={active}>
            {isLazy ? (
              <Suspense fallback={<ScreenLoader />}>
                <Screen />
              </Suspense>
            ) : (
              <Screen />
            )}
          </ErrorBoundary>
        </main>
      </div>

      <MobileBottomNav active={active} onNavigate={navigate} />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={navigate} />

      {/* Easter eggs */}
      <GhostModeModal name={state.profile.name} />
      <TimeCapsuleReveal />
      {konamiOpen && <KonamiModal state={state} onClose={() => setKonamiOpen(false)} onNavigate={navigate} />}

      {/* Achievement listener */}
      <AchievementToastListener />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}

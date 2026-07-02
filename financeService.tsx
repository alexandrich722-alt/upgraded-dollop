// NOVA Life OS — Global State Store v4
// Clean architecture: unified XP, achievement engine, pattern detection, bug fixes

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo, type ReactNode } from 'react';
import type { NovaState, Task, Goal, Project, Habit, Reflection, FinanceTransaction, Contact, MarketplaceInstall, AIMessage, TodayMission, Settings, UserProfile, Quest, Boss, Mentor, Protocol, MarketplaceProduct, Debt, SavingsGoal, Subscription, Skill, PatternInsight, TimeCapsule } from './types';
import { normalizeLoadedState, normalizeTask, normalizeGoal, normalizeProject, normalizeHabit, normalizeReflection, normalizeFinanceTransaction, normalizeContact, normalizeMarketplaceInstall, normalizeAIMessage, normalizeSettings, normalizeUserProfile, normalizeQuest, normalizeBoss, normalizeMentor, normalizeProtocol, normalizeSkill } from './lib/sanitize';
import { getDemoState } from './demoData';
import { computeScores } from './lib/scoreService';
import { checkAchievements, getAchievementById } from './lib/achievements';
import { STORAGE_KEY, ONBOARDED_KEY, LIMITS, STATUS_FLOW } from './lib/constants';
import { uid, now, todayStr } from './lib/helpers';

// ─── State Loading ────────────────────────────────────────────────────────────
function loadState(): NovaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeLoadedState(JSON.parse(raw));
  } catch { /* corrupted — fallback to demo */ }
  return getDemoState();
}

// ─── Event Bus ────────────────────────────────────────────────────────────────
type EventType = 'task:completed' | 'task:created' | 'goal:progress' | 'habit:done'
  | 'data:cleared' | 'data:imported' | 'achievement:unlocked' | 'boss:defeated' | 'quest:completed';
type EventHandler = (payload?: any) => void;
const eventHandlers: Partial<Record<EventType, EventHandler[]>> = {};

export const eventBus = {
  on(event: EventType, handler: EventHandler) {
    if (!eventHandlers[event]) eventHandlers[event] = [];
    eventHandlers[event]!.push(handler);
    return () => { eventHandlers[event] = eventHandlers[event]!.filter(h => h !== handler); };
  },
  emit(event: EventType, payload?: any) {
    (eventHandlers[event] || []).forEach(h => h(payload));
  },
};

// ─── Store Interface ──────────────────────────────────────────────────────────
interface StoreContextValue {
  state: NovaState;
  onboardingComplete: boolean;
  completeOnboarding: () => void;
  // Tasks
  addTask: (task: Partial<Task>) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  cycleTaskStatus: (id: string) => void;
  // Goals
  addGoal: (goal: Partial<Goal>) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  addMilestone: (goalId: string, title: string) => void;
  // Projects
  addProject: (project: Partial<Project>) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  // Habits
  addHabit: (habit: Partial<Habit>) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  // Reflections
  addReflection: (r: Partial<Reflection>) => void;
  deleteReflection: (id: string) => void;
  // Finance
  addTransaction: (t: Partial<FinanceTransaction>) => void;
  deleteTransaction: (id: string) => void;
  addDebt: (d: Partial<Debt>) => void;
  updateDebt: (id: string, patch: Partial<Debt>) => void;
  addSavingsGoal: (s: Partial<SavingsGoal>) => void;
  updateSavingsGoal: (id: string, patch: Partial<SavingsGoal>) => void;
  addSubscription: (s: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  // Contacts
  addContact: (c: Partial<Contact>) => void;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  // Quests
  addQuest: (q: Partial<Quest>) => void;
  updateQuest: (id: string, patch: Partial<Quest>) => void;
  deleteQuest: (id: string) => void;
  // Bosses
  addBoss: (b: Partial<Boss>) => void;
  updateBoss: (id: string, patch: Partial<Boss>) => void;
  // Mentors
  addMentor: (m: Partial<Mentor>) => void;
  // Protocols
  addProtocol: (p: Partial<Protocol>) => void;
  // Skills
  addSkill: (s: Partial<Skill>) => void;
  updateSkill: (id: string, patch: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  // XP & Achievements
  awardXP: (amount: number, source?: string) => void;
  unlockAchievement: (id: string) => void;
  // AI
  addAIMessage: (msg: Partial<AIMessage>) => void;
  clearAIMessages: () => void;
  // Today Mission
  setTodayMission: (m: TodayMission | null) => void;
  // Marketplace
  installProduct: (product: MarketplaceProduct, mode: MarketplaceInstall['mode']) => void;
  uninstallProduct: (installId: string) => void;
  // Settings & Profile
  updateSettings: (patch: Partial<Settings>) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  // Insights
  addPatternInsight: (insight: Partial<PatternInsight>) => void;
  dismissInsight: (id: string) => void;
  // Time Capsules
  addTimeCapsule: (tc: Partial<TimeCapsule>) => void;
  revealTimeCapsule: (id: string) => void;
  // Data
  exportData: () => string;
  importData: (json: string) => boolean;
  resetDemoData: () => void;
  clearUserData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

// ─── Store Provider ───────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NovaState>(loadState);
  const [onboardingComplete, setOnboardingComplete] = useState(() => localStorage.getItem(ONBOARDED_KEY) === 'true');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced persistence
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
    }, LIMITS.SAVE_DEBOUNCE_MS);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state]);

  // Score recomputation — batched, not on every change
  const scoreKey = `${state.tasks.filter(t=>t.status==='done').length}-${state.goals.map(g=>g.progress).join(',')}-${state.habits.map(h=>h.streak).join(',')}-${state.reflections.slice(0,5).map(r=>r.mood).join(',')}`;
  const lastScoreKey = useRef('');
  useEffect(() => {
    if (scoreKey !== lastScoreKey.current) {
      lastScoreKey.current = scoreKey;
      const scores = computeScores(state);
      setState(s => ({ ...s, profile: { ...s.profile, ...scores } }));
    }
  }, [scoreKey]);

  // Daily streak update
  useEffect(() => {
    const today = todayStr();
    if (state.profile.lastActiveDate?.startsWith(today)) return;
    setState(s => {
      const last = s.profile.lastActiveDate?.split('T')[0] || '';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      const isConsecutive = last === yStr;
      const currentStreak = isConsecutive ? s.profile.currentStreak + 1 : 1;
      const longestStreak = Math.max(s.profile.longestStreak, currentStreak);
      return { ...s, profile: { ...s.profile, currentStreak, longestStreak, lastActiveDate: now() } };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Achievement checking — runs after state changes
  const achievementKey = `${state.tasks.filter(t=>t.status==='done').length}-${state.habits.some(h=>h.streak>=7)}-${state.reflections.length}-${state.quests.filter(q=>q.status==='completed').length}-${state.profile.level}`;
  const lastAchievKey = useRef('');
  useEffect(() => {
    if (achievementKey !== lastAchievKey.current) {
      lastAchievKey.current = achievementKey;
      const newIds = checkAchievements(state);
      if (newIds.length > 0) {
        const nowStr = now();
        setState(s => ({
          ...s,
          achievements: s.achievements.map(a => newIds.includes(a.id) && !a.unlockedAt ? { ...a, unlockedAt: nowStr } : a),
        }));
        newIds.forEach(id => {
          const def = getAchievementById(id);
          if (def) {
            eventBus.emit('achievement:unlocked', { id, title: def.title, xp: def.xpReward });
            // Award XP from achievement
            setState(s => {
              const newXP = s.profile.xp + def.xpReward;
              const level = Math.floor(s.profile.totalXpEarned / 500) + 1;
              return { ...s, profile: { ...s.profile, xp: newXP % 500, totalXpEarned: s.profile.totalXpEarned + def.xpReward, level: Math.max(s.profile.level, level) } };
            });
          }
        });
      }
    }
  }, [achievementKey]);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    setOnboardingComplete(true);
    // Unlock onboarding achievement
    setState(s => ({ ...s, achievements: s.achievements.map(a => a.id === 'meta_onboarding' && !a.unlockedAt ? { ...a, unlockedAt: now() } : a) }));
  }, []);

  // ─── XP & Achievements ───────────────────────────────────────────────────
  const awardXP = useCallback((amount: number, _source?: string) => {
    setState(s => {
      const totalXpEarned = s.profile.totalXpEarned + amount;
      const level = Math.floor(totalXpEarned / 500) + 1;
      return { ...s, profile: { ...s.profile, xp: totalXpEarned % 500, totalXpEarned, level: Math.max(s.profile.level, level) } };
    });
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setState(s => {
      const a = s.achievements.find(a => a.id === id);
      if (!a || a.unlockedAt) return s;
      const def = getAchievementById(id);
      const totalXpEarned = s.profile.totalXpEarned + (def?.xpReward || 0);
      const level = Math.floor(totalXpEarned / 500) + 1;
      return {
        ...s,
        achievements: s.achievements.map(ach => ach.id === id ? { ...ach, unlockedAt: now() } : ach),
        profile: { ...s.profile, xp: totalXpEarned % 500, totalXpEarned, level: Math.max(s.profile.level, level) },
      };
    });
    eventBus.emit('achievement:unlocked', { id });
  }, []);

  // ─── Tasks ───────────────────────────────────────────────────────────────
  const addTask = useCallback((task: Partial<Task>): string => {
    const id = uid();
    setState(s => ({ ...s, tasks: [...s.tasks, normalizeTask({ ...task, id, createdAt: now(), updatedAt: now() })] }));
    eventBus.emit('task:created', { id });
    return id;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setState(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? normalizeTask({ ...t, ...patch, updatedAt: now() }) : t) }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState(s => ({ ...s, tasks: s.tasks.map(t => {
      if (t.id !== id) return t;
      const done = t.status === 'done';
      if (!done) {
        eventBus.emit('task:completed', { id, task: t });
      }
      return normalizeTask({ ...t, status: done ? 'todo' : 'done', completedAt: done ? null : now(), updatedAt: now() });
    }) }));
    if (true) { // always award XP on completion (undo will not subtract)
      awardXP(50, 'task');
    }
  }, [awardXP]);

  const cycleTaskStatus = useCallback((id: string) => {
    setState(s => ({ ...s, tasks: s.tasks.map(t => {
      if (t.id !== id) return t;
      const next = (STATUS_FLOW[t.status] || 'todo') as Task['status'];
      if (next === 'done') eventBus.emit('task:completed', { id, task: t });
      return normalizeTask({ ...t, status: next, completedAt: next === 'done' ? now() : null, updatedAt: now() });
    }) }));
  }, []);

  // ─── Goals ───────────────────────────────────────────────────────────────
  const addGoal = useCallback((goal: Partial<Goal>) => {
    setState(s => ({ ...s, goals: [...s.goals, normalizeGoal({ ...goal, id: uid(), createdAt: now(), updatedAt: now() })] }));
  }, []);

  const updateGoal = useCallback((id: string, patch: Partial<Goal>) => {
    setState(s => ({ ...s, goals: s.goals.map(g => g.id === id ? normalizeGoal({ ...g, ...patch, updatedAt: now() }) : g) }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState(s => ({ ...s, goals: s.goals.filter(g => g.id !== id) }));
  }, []);

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setState(s => ({ ...s, goals: s.goals.map(g => {
      if (g.id !== goalId) return g;
      const milestones = g.milestones.map(m => m.id === milestoneId ? { ...m, done: !m.done } : m);
      const doneCount = milestones.filter(m => m.done).length;
      const progress = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : g.progress;
      eventBus.emit('goal:progress', { goalId, progress });
      return normalizeGoal({ ...g, milestones, progress, updatedAt: now() });
    }) }));
  }, []);

  const addMilestone = useCallback((goalId: string, title: string) => {
    setState(s => ({ ...s, goals: s.goals.map(g => {
      if (g.id !== goalId) return g;
      return normalizeGoal({ ...g, milestones: [...g.milestones, { id: uid(), title, done: false }], updatedAt: now() });
    }) }));
  }, []);

  // ─── Projects ────────────────────────────────────────────────────────────
  const addProject = useCallback((project: Partial<Project>) => {
    setState(s => ({ ...s, projects: [...s.projects, normalizeProject({ ...project, id: uid(), createdAt: now(), updatedAt: now() })] }));
  }, []);
  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setState(s => ({ ...s, projects: s.projects.map(p => p.id === id ? normalizeProject({ ...p, ...patch, updatedAt: now() }) : p) }));
  }, []);
  const deleteProject = useCallback((id: string) => {
    setState(s => ({ ...s, projects: s.projects.filter(p => p.id !== id) }));
  }, []);

  // ─── Habits ──────────────────────────────────────────────────────────────
  const addHabit = useCallback((habit: Partial<Habit>) => {
    setState(s => ({ ...s, habits: [...s.habits, normalizeHabit({ ...habit, id: uid(), createdAt: now(), updatedAt: now() })] }));
  }, []);
  const updateHabit = useCallback((id: string, patch: Partial<Habit>) => {
    setState(s => ({ ...s, habits: s.habits.map(h => h.id === id ? normalizeHabit({ ...h, ...patch, updatedAt: now() }) : h) }));
  }, []);

  const toggleHabit = useCallback((id: string) => {
    setState(s => ({ ...s, habits: s.habits.map(h => {
      if (h.id !== id) return h;
      const tStr = todayStr();
      const already = h.history.some(d => d.startsWith(tStr));
      const history = already
        ? h.history.filter(d => !d.startsWith(tStr))
        : [...h.history, now()];

      // Rigorous streak: check if yesterday was done
      let streak = h.streak;
      let bestStreak = h.bestStreak;
      if (!already) {
        // Completing today
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];
        const yesterdayDone = h.history.some(d => d.startsWith(yStr));
        streak = yesterdayDone ? h.streak + 1 : 1; // reset if yesterday was missed
        bestStreak = Math.max(h.bestStreak, streak);
        eventBus.emit('habit:done', { id, habit: h });
        awardXP(25, 'habit');
      } else {
        // Unchecking today
        streak = Math.max(0, h.streak - 1);
      }

      const completionRate = Math.min(100, Math.round((history.length / Math.max(30, 1)) * 100));
      return normalizeHabit({ ...h, history, streak, bestStreak, completionRate, updatedAt: now() });
    }) }));
  }, [awardXP]);

  const deleteHabit = useCallback((id: string) => {
    setState(s => ({ ...s, habits: s.habits.filter(h => h.id !== id) }));
  }, []);

  // ─── Reflections ─────────────────────────────────────────────────────────
  const addReflection = useCallback((r: Partial<Reflection>) => {
    setState(s => ({ ...s, reflections: [normalizeReflection({ ...r, id: uid(), createdAt: now() }), ...s.reflections].slice(0, LIMITS.REFLECTIONS) }));
  }, []);
  const deleteReflection = useCallback((id: string) => {
    setState(s => ({ ...s, reflections: s.reflections.filter(r => r.id !== id) }));
  }, []);

  // ─── Finance ─────────────────────────────────────────────────────────────
  const addTransaction = useCallback((t: Partial<FinanceTransaction>) => {
    setState(s => ({ ...s, finance: { ...s.finance, transactions: [normalizeFinanceTransaction({ ...t, id: uid(), createdAt: now() }), ...s.finance.transactions].slice(0, LIMITS.TRANSACTIONS) } }));
  }, []);
  const deleteTransaction = useCallback((id: string) => {
    setState(s => ({ ...s, finance: { ...s.finance, transactions: s.finance.transactions.filter(t => t.id !== id) } }));
  }, []);
  const addDebt = useCallback((d: Partial<Debt>) => {
    setState(s => ({ ...s, finance: { ...s.finance, debts: [...s.finance.debts, { id: uid(), name: d.name || 'Debt', amount: d.amount || 0, remaining: d.remaining ?? d.amount ?? 0, interestRate: d.interestRate || 0, minPayment: d.minPayment || 0, repaymentSchedule: [], createdAt: now() }] } }));
  }, []);
  const updateDebt = useCallback((id: string, patch: Partial<Debt>) => {
    setState(s => ({ ...s, finance: { ...s.finance, debts: s.finance.debts.map(d => d.id === id ? { ...d, ...patch } : d) } }));
  }, []);
  const addSavingsGoal = useCallback((sg: Partial<SavingsGoal>) => {
    setState(s => ({ ...s, finance: { ...s.finance, savingsGoals: [...s.finance.savingsGoals, { id: uid(), title: sg.title || 'Savings', target: sg.target || 1000, current: sg.current || 0, deadline: sg.deadline || null, createdAt: now() }] } }));
  }, []);
  const updateSavingsGoal = useCallback((id: string, patch: Partial<SavingsGoal>) => {
    setState(s => ({ ...s, finance: { ...s.finance, savingsGoals: s.finance.savingsGoals.map(sg => sg.id === id ? { ...sg, ...patch } : sg) } }));
  }, []);
  const addSubscription = useCallback((sub: Partial<Subscription>) => {
    setState(s => ({ ...s, finance: { ...s.finance, subscriptions: [...s.finance.subscriptions, { id: uid(), name: sub.name || 'Subscription', amount: sub.amount || 0, frequency: sub.frequency || 'monthly', nextCharge: sub.nextCharge || now(), active: true, createdAt: now() }] } }));
  }, []);
  const deleteSubscription = useCallback((id: string) => {
    setState(s => ({ ...s, finance: { ...s.finance, subscriptions: s.finance.subscriptions.filter(sub => sub.id !== id) } }));
  }, []);

  // ─── Contacts ────────────────────────────────────────────────────────────
  const addContact = useCallback((c: Partial<Contact>) => {
    setState(s => ({ ...s, contacts: [...s.contacts, normalizeContact({ ...c, id: uid() })] }));
  }, []);
  const updateContact = useCallback((id: string, patch: Partial<Contact>) => {
    setState(s => ({ ...s, contacts: s.contacts.map(c => c.id === id ? normalizeContact({ ...c, ...patch }) : c) }));
  }, []);
  const deleteContact = useCallback((id: string) => {
    setState(s => ({ ...s, contacts: s.contacts.filter(c => c.id !== id) }));
  }, []);

  // ─── Quests ──────────────────────────────────────────────────────────────
  const addQuest = useCallback((q: Partial<Quest>) => {
    setState(s => ({ ...s, quests: [...s.quests, normalizeQuest({ ...q, id: uid(), createdAt: now() })] }));
  }, []);
  const updateQuest = useCallback((id: string, patch: Partial<Quest>) => {
    setState(s => {
      const updated = s.quests.map(q => q.id === id ? normalizeQuest({ ...q, ...patch }) : q);
      const quest = updated.find(q => q.id === id);
      if (quest?.status === 'completed') {
        eventBus.emit('quest:completed', { id, quest });
        // Award XP to profile
        setTimeout(() => awardXP(quest.xpReward, 'quest'), 0);
      }
      return { ...s, quests: updated };
    });
  }, [awardXP]);
  const deleteQuest = useCallback((id: string) => {
    setState(s => ({ ...s, quests: s.quests.filter(q => q.id !== id) }));
  }, []);

  // ─── Bosses ───────────────────────────────────────────────────────────────
  const addBoss = useCallback((b: Partial<Boss>) => {
    setState(s => ({ ...s, bosses: [...s.bosses, normalizeBoss({ ...b, id: uid() })] }));
  }, []);
  const updateBoss = useCallback((id: string, patch: Partial<Boss>) => {
    setState(s => {
      const updated = s.bosses.map(b => b.id === id ? normalizeBoss({ ...b, ...patch }) : b);
      const boss = updated.find(b => b.id === id);
      // Properly set defeated when HP reaches 0
      if (boss && boss.hp <= 0 && !boss.defeated) {
        eventBus.emit('boss:defeated', { id, boss });
        awardXP(200, 'boss');
        return { ...s, bosses: updated.map(b => b.id === id ? { ...b, defeated: true } : b) };
      }
      return { ...s, bosses: updated };
    });
  }, [awardXP]);

  // ─── Mentors ─────────────────────────────────────────────────────────────
  const addMentor = useCallback((m: Partial<Mentor>) => {
    setState(s => ({ ...s, mentors: [...s.mentors, normalizeMentor({ ...m, id: uid() })] }));
  }, []);

  // ─── Protocols ───────────────────────────────────────────────────────────
  const addProtocol = useCallback((p: Partial<Protocol>) => {
    setState(s => ({ ...s, protocols: [...s.protocols, normalizeProtocol({ ...p, id: uid() })] }));
  }, []);

  // ─── Skills ──────────────────────────────────────────────────────────────
  const addSkill = useCallback((sk: Partial<Skill>) => {
    setState(s => ({ ...s, skills: [...s.skills, normalizeSkill({ ...sk, id: uid() })] }));
  }, []);
  const updateSkill = useCallback((id: string, patch: Partial<Skill>) => {
    setState(s => ({ ...s, skills: s.skills.map(sk => sk.id === id ? normalizeSkill({ ...sk, ...patch }) : sk) }));
  }, []);
  const deleteSkill = useCallback((id: string) => {
    setState(s => ({ ...s, skills: s.skills.filter(sk => sk.id !== id) }));
  }, []);

  // ─── AI ──────────────────────────────────────────────────────────────────
  const addAIMessage = useCallback((msg: Partial<AIMessage>) => {
    setState(s => ({ ...s, aiMessages: [...s.aiMessages.slice(-(LIMITS.AI_MESSAGES - 1)), normalizeAIMessage({ ...msg, id: uid(), createdAt: now() })] }));
  }, []);
  const clearAIMessages = useCallback(() => {
    setState(s => ({ ...s, aiMessages: [] }));
  }, []);

  // ─── Today Mission ────────────────────────────────────────────────────────
  const setTodayMission = useCallback((m: TodayMission | null) => {
    setState(s => ({ ...s, todayMission: m }));
  }, []);

  // ─── Marketplace ─────────────────────────────────────────────────────────
  const installProduct = useCallback((product: MarketplaceProduct, mode: MarketplaceInstall['mode']) => {
    setState(s => {
      const withData = mode !== 'sandbox';
      const newGoals = (withData && (mode === 'full' || mode === 'dashboard')) ? product.installData.goals.map(g => normalizeGoal({ ...g, id: uid(), createdAt: now(), updatedAt: now() })) : [];
      const newProjects = (withData && (mode === 'full' || mode === 'dashboard')) ? product.installData.projects.map(p => normalizeProject({ ...p, id: uid(), createdAt: now(), updatedAt: now() })) : [];
      const newTasks = (withData && mode === 'full') ? product.installData.tasks.map(t => normalizeTask({ ...t, id: uid(), createdAt: now(), updatedAt: now() })) : [];
      const newHabits = (withData && (mode === 'full' || mode === 'dashboard')) ? product.installData.habits.map(h => normalizeHabit({ ...h, id: uid(), createdAt: now(), updatedAt: now() })) : [];
      const newQuests = (withData && (mode === 'full' || mode === 'quests')) ? product.installData.quests.map(q => normalizeQuest({ ...q, id: uid(), createdAt: now() })) : [];
      const newMentors = (withData && (mode === 'full' || mode === 'mentors')) ? product.installData.mentors.map(m => normalizeMentor({ ...m, id: uid() })) : [];
      const newSkills = (withData && mode === 'full') ? product.installData.skills.map(sk => normalizeSkill({ ...sk, id: uid() })) : [];
      const newProtocols = (withData && mode === 'full') ? product.installData.protocols.map(p => normalizeProtocol({ ...p, id: uid() })) : [];
      const install = normalizeMarketplaceInstall({ id: uid(), productId: product.id, productTitle: product.title, installedAt: now(), mode, progress: 0, activeQuests: newQuests.map(q => q.id), connectedMentors: newMentors.map(m => m.id), nextReview: new Date(Date.now() + 7 * 86400000).toISOString() });
      return { ...s, goals: [...s.goals, ...newGoals], projects: [...s.projects, ...newProjects], tasks: [...s.tasks, ...newTasks], habits: [...s.habits, ...newHabits], quests: [...s.quests, ...newQuests], mentors: [...s.mentors, ...newMentors], skills: [...s.skills, ...newSkills], protocols: [...s.protocols, ...newProtocols], marketplaceInstalls: [...s.marketplaceInstalls, install] };
    });
  }, []);

  const uninstallProduct = useCallback((installId: string) => {
    setState(s => ({ ...s, marketplaceInstalls: s.marketplaceInstalls.filter(i => i.id !== installId) }));
  }, []);

  // ─── Settings & Profile ───────────────────────────────────────────────────
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState(s => ({ ...s, settings: normalizeSettings({ ...s.settings, ...patch }), finance: { ...s.finance, monthlyBudget: patch.monthlyBudget ?? s.finance.monthlyBudget } }));
  }, []);
  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setState(s => ({ ...s, profile: normalizeUserProfile({ ...s.profile, ...patch }) }));
  }, []);

  // ─── Insights ─────────────────────────────────────────────────────────────
  const addPatternInsight = useCallback((insight: Partial<PatternInsight>) => {
    setState(s => ({ ...s, patternInsights: [...(s.patternInsights || []).slice(-19), { id: uid(), type: 'suggestion', title: '', body: '', generatedAt: now(), dismissed: false, ...insight }] }));
  }, []);
  const dismissInsight = useCallback((id: string) => {
    setState(s => ({ ...s, patternInsights: (s.patternInsights || []).map(i => i.id === id ? { ...i, dismissed: true } : i) }));
  }, []);

  // ─── Time Capsules ────────────────────────────────────────────────────────
  const addTimeCapsule = useCallback((tc: Partial<TimeCapsule>) => {
    setState(s => ({ ...s, timeCapsules: [...(s.timeCapsules || []), { id: uid(), message: tc.message || '', revealAt: tc.revealAt || now(), createdAt: now(), revealed: false }] }));
    unlockAchievement('meta_time_capsule');
  }, [unlockAchievement]);

  const revealTimeCapsule = useCallback((id: string) => {
    setState(s => ({ ...s, timeCapsules: (s.timeCapsules || []).map(tc => tc.id === id ? { ...tc, revealed: true } : tc) }));
    unlockAchievement('meta_time_capsule_reveal');
  }, [unlockAchievement]);

  // ─── Data ─────────────────────────────────────────────────────────────────
  const exportData = useCallback(() => JSON.stringify(state, null, 2), [state]);
  const importData = useCallback((json: string) => {
    try { setState(normalizeLoadedState(JSON.parse(json))); eventBus.emit('data:imported'); return true; } catch { return false; }
  }, []);
  const resetDemoData = useCallback(() => { setState(getDemoState()); }, []);
  const clearUserData = useCallback(() => {
    setState(normalizeLoadedState({ version: 3 }));
    eventBus.emit('data:cleared');
  }, []);

  const value: StoreContextValue = {
    state, onboardingComplete, completeOnboarding,
    addTask, updateTask, deleteTask, toggleTask, cycleTaskStatus,
    addGoal, updateGoal, deleteGoal, toggleMilestone, addMilestone,
    addProject, updateProject, deleteProject,
    addHabit, updateHabit, toggleHabit, deleteHabit,
    addReflection, deleteReflection,
    addTransaction, deleteTransaction, addDebt, updateDebt, addSavingsGoal, updateSavingsGoal, addSubscription, deleteSubscription,
    addContact, updateContact, deleteContact,
    addQuest, updateQuest, deleteQuest,
    addBoss, updateBoss,
    addMentor, addProtocol,
    addSkill, updateSkill, deleteSkill,
    awardXP, unlockAchievement,
    addAIMessage, clearAIMessages, setTodayMission,
    installProduct, uninstallProduct,
    updateSettings, updateProfile,
    addPatternInsight, dismissInsight,
    addTimeCapsule, revealTimeCapsule,
    exportData, importData, resetDemoData, clearUserData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// ─── Selector Hooks ───────────────────────────────────────────────────────────
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function useTasks() {
  const { state } = useStore();
  return useMemo(() => state.tasks.filter(t => !t.archived), [state.tasks]);
}

export function useActiveGoals() {
  const { state } = useStore();
  return useMemo(() => state.goals.filter(g => g.status === 'active' && !g.archived), [state.goals]);
}

export function useOverdueTasks() {
  const tasks = useTasks();
  return useMemo(() => tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done'), [tasks]);
}

export function useTodayTasks() {
  const tasks = useTasks();
  return useMemo(() => tasks.filter(t => t.deadline?.startsWith(todayStr()) || t.status === 'in_progress'), [tasks]);
}

export function useHabits() {
  const { state } = useStore();
  return useMemo(() => state.habits.filter(h => !h.archived), [state.habits]);
}

export function useProfile() {
  const { state } = useStore();
  return state.profile;
}

export function useSettings() {
  const { state } = useStore();
  return state.settings;
}

export function useUnlockedAchievements() {
  const { state } = useStore();
  return useMemo(() => state.achievements.filter(a => a.unlockedAt), [state.achievements]);
}

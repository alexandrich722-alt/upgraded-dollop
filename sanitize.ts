// NOVA Life OS — Deep State Sanitization v3
// Normalizes all entities: validates types, clamps numbers, defaults arrays,
// fixes dateOrNull vs idOrNull, handles schema migration from v1→v3.

import type {
  NovaState, Task, Goal, Milestone, Project, Habit, Reflection, DailyNote,
  FinanceTransaction, Debt, SavingsGoal, Subscription, Contact, Skill, Quest,
  Boss, Mentor, MentorMessage, MarketplaceInstall, Protocol, AIMessage, AIAction,
  Settings, UserProfile, TodayMission, Achievement, PatternInsight, TimeCapsule,
  BudgetCategory,
} from '../types';
import { uid, now } from './helpers';
import { ALL_ACHIEVEMENTS } from './achievements';

// ─── Primitive Sanitizers ────────────────────────────────────────────────────

const str = (v: unknown, d = ''): string => (typeof v === 'string' ? v : d);
const num = (v: unknown, d = 0): number => (typeof v === 'number' && !isNaN(v) ? v : d);
const bool = (v: unknown, d = false): boolean => (typeof v === 'boolean' ? v : d);
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const dateOrNull = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null);
const idOrNull = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], d: T): T =>
  allowed.includes(v as T) ? (v as T) : d;

// ─── Entity Normalizers ──────────────────────────────────────────────────────

export function normalizeTask(t: Partial<Task>): Task {
  return {
    id: str(t?.id) || uid(),
    title: str(t?.title, 'Untitled Task'),
    description: str(t?.description),
    status: oneOf(t?.status, ['todo', 'in_progress', 'done'] as const, 'todo'),
    priority: oneOf(t?.priority, ['low', 'medium', 'high', 'critical'] as const, 'medium'),
    deadline: dateOrNull(t?.deadline),
    estimatedMinutes: clamp(num(t?.estimatedMinutes), 0, 1440),
    actualMinutes: clamp(num(t?.actualMinutes), 0, 1440),
    energyLevel: oneOf(t?.energyLevel, ['low', 'medium', 'high', 'peak'] as const, 'medium'),
    projectId: idOrNull(t?.projectId),
    goalId: idOrNull(t?.goalId),
    tags: arr<string>(t?.tags).map(x => str(x)).filter(Boolean),
    createdAt: str(t?.createdAt) || now(),
    updatedAt: str(t?.updatedAt) || now(),
    completedAt: dateOrNull(t?.completedAt),
    archived: bool(t?.archived),
    recurring: oneOf(t?.recurring, ['none', 'daily', 'weekly', 'monthly'] as const, 'none'),
    parentTaskId: idOrNull(t?.parentTaskId),
  };
}

export function normalizeGoal(t: Partial<Goal>): Goal {
  return {
    id: str(t?.id) || uid(),
    title: str(t?.title, 'Untitled Goal'),
    description: str(t?.description),
    category: str(t?.category, 'Personal'),
    why: str(t?.why),
    status: oneOf(t?.status, ['active', 'archived', 'completed', 'paused'] as const, 'active'),
    priority: oneOf(t?.priority, ['low', 'medium', 'high', 'critical'] as const, 'medium'),
    deadline: dateOrNull(t?.deadline),
    progress: clamp(num(t?.progress), 0, 100),
    milestones: arr<any>(t?.milestones).map(normalizeMilestone),
    metrics: arr<string>(t?.metrics).map(x => str(x)).filter(Boolean),
    obstacles: arr<string>(t?.obstacles).map(x => str(x)).filter(Boolean),
    relatedProjects: arr<string>(t?.relatedProjects).map(x => str(x)).filter(Boolean),
    relatedHabits: arr<string>(t?.relatedHabits).map(x => str(x)).filter(Boolean),
    relatedTasks: arr<string>(t?.relatedTasks).map(x => str(x)).filter(Boolean),
    createdAt: str(t?.createdAt) || now(),
    updatedAt: str(t?.updatedAt) || now(),
    archived: bool(t?.archived),
  };
}

function normalizeMilestone(m: any): Milestone {
  return { id: str(m?.id) || uid(), title: str(m?.title, 'Milestone'), done: bool(m?.done) };
}

export function normalizeProject(t: Partial<Project>): Project {
  return {
    id: str(t?.id) || uid(),
    title: str(t?.title, 'Untitled Project'),
    description: str(t?.description),
    purpose: str(t?.purpose),
    why: str(t?.why),
    category: str(t?.category, 'General'),
    status: oneOf(t?.status, ['active', 'archived', 'completed', 'paused'] as const, 'active'),
    priority: oneOf(t?.priority, ['low', 'medium', 'high', 'critical'] as const, 'medium'),
    deadline: dateOrNull(t?.deadline),
    progress: clamp(num(t?.progress), 0, 100),
    stages: arr<string>(t?.stages).map(x => str(x)).filter(Boolean),
    tasks: arr<string>(t?.tasks).map(x => str(x)).filter(Boolean),
    roadmap: arr<string>(t?.roadmap).map(x => str(x)).filter(Boolean),
    risks: arr<string>(t?.risks).map(x => str(x)).filter(Boolean),
    resources: arr<string>(t?.resources).map(x => str(x)).filter(Boolean),
    relatedGoals: arr<string>(t?.relatedGoals).map(x => str(x)).filter(Boolean),
    relatedIdeas: arr<string>(t?.relatedIdeas).map(x => str(x)).filter(Boolean),
    history: arr<string>(t?.history).map(x => str(x)).filter(Boolean),
    aiRecommendations: arr<string>(t?.aiRecommendations).map(x => str(x)).filter(Boolean),
    createdAt: str(t?.createdAt) || now(),
    updatedAt: str(t?.updatedAt) || now(),
    archived: bool(t?.archived),
  };
}

export function normalizeHabit(t: Partial<Habit>): Habit {
  return {
    id: str(t?.id) || uid(),
    title: str(t?.title, 'Untitled Habit'),
    description: str(t?.description),
    category: str(t?.category, 'General'),
    why: str(t?.why),
    frequency: oneOf(t?.frequency, ['daily', 'weekly', 'custom'] as const, 'daily'),
    target: clamp(num(t?.target, 1), 1, 365),
    streak: clamp(num(t?.streak), 0, 9999),
    bestStreak: clamp(num(t?.bestStreak), 0, 9999),
    history: arr<string>(t?.history).filter(x => typeof x === 'string'),
    completionRate: clamp(num(t?.completionRate), 0, 100),
    relatedGoalId: idOrNull(t?.relatedGoalId),
    isBad: bool(t?.isBad),
    stackedAfter: idOrNull(t?.stackedAfter),
    createdAt: str(t?.createdAt) || now(),
    updatedAt: str(t?.updatedAt) || now(),
    archived: bool(t?.archived),
  };
}

export function normalizeReflection(t: Partial<Reflection>): Reflection {
  return {
    id: str(t?.id) || uid(),
    date: str(t?.date) || now(),
    text: str(t?.text),
    mood: clamp(num(t?.mood, 5), 1, 10),
    energy: clamp(num(t?.energy, 5), 1, 10),
    stress: clamp(num(t?.stress, 5), 1, 10),
    tags: arr<string>(t?.tags).map(x => str(x)).filter(Boolean),
    insights: arr<string>(t?.insights).map(x => str(x)).filter(Boolean),
    linkedGoals: arr<string>(t?.linkedGoals).map(x => str(x)).filter(Boolean),
    linkedTasks: arr<string>(t?.linkedTasks).map(x => str(x)).filter(Boolean),
    createdAt: str(t?.createdAt) || now(),
  };
}

export function normalizeDailyNote(t: Partial<DailyNote>): DailyNote {
  return {
    id: str(t?.id) || uid(),
    date: str(t?.date) || now(),
    energy: oneOf(t?.energy, ['low', 'medium', 'high', 'peak'] as const, 'medium'),
    mood: clamp(num(t?.mood, 5), 1, 10),
    mainFocus: str(t?.mainFocus),
    constraints: str(t?.constraints),
    eveningReview: str(t?.eveningReview),
    lesson: str(t?.lesson),
    createdAt: str(t?.createdAt) || now(),
  };
}

export function normalizeFinanceTransaction(t: Partial<FinanceTransaction>): FinanceTransaction {
  return {
    id: str(t?.id) || uid(),
    date: str(t?.date) || now(),
    amount: Math.max(0, num(t?.amount)),
    type: oneOf(t?.type, ['income', 'expense'] as const, 'expense'),
    category: str(t?.category, 'Other'),
    description: str(t?.description),
    tags: arr<string>(t?.tags).map(x => str(x)).filter(Boolean),
    createdAt: str(t?.createdAt) || now(),
  };
}

export function normalizeDebt(t: Partial<Debt>): Debt {
  return {
    id: str(t?.id) || uid(),
    name: str(t?.name, 'Debt'),
    amount: Math.max(0, num(t?.amount)),
    remaining: Math.max(0, num(t?.remaining)),
    interestRate: clamp(num(t?.interestRate), 0, 100),
    minPayment: Math.max(0, num(t?.minPayment)),
    repaymentSchedule: arr<any>(t?.repaymentSchedule).map(x => ({
      date: str(x?.date) || now(),
      amount: Math.max(0, num(x?.amount)),
      done: bool(x?.done),
    })),
    createdAt: str(t?.createdAt) || now(),
  };
}

export function normalizeSavingsGoal(t: Partial<SavingsGoal>): SavingsGoal {
  return {
    id: str(t?.id) || uid(),
    title: str(t?.title, 'Savings Goal'),
    target: Math.max(0, num(t?.target, 1000)),
    current: Math.max(0, num(t?.current)),
    deadline: dateOrNull(t?.deadline),
    createdAt: str(t?.createdAt) || now(),
  };
}

export function normalizeSubscription(t: Partial<Subscription>): Subscription {
  return {
    id: str(t?.id) || uid(),
    name: str(t?.name, 'Subscription'),
    amount: Math.max(0, num(t?.amount)),
    frequency: oneOf(t?.frequency, ['monthly', 'yearly'] as const, 'monthly'),
    nextCharge: str(t?.nextCharge) || now(),
    active: bool(t?.active, true),
    createdAt: str(t?.createdAt) || now(),
  };
}

export function normalizeContact(t: Partial<Contact>): Contact {
  return {
    id: str(t?.id) || uid(),
    name: str(t?.name, 'Unknown'),
    relationship: str(t?.relationship),
    birthday: dateOrNull(t?.birthday),
    phone: str(t?.phone),
    telegram: str(t?.telegram),
    notes: str(t?.notes),
    giftIdeas: arr<string>(t?.giftIdeas).map(x => str(x)).filter(Boolean),
    lastContactedAt: dateOrNull(t?.lastContactedAt),
    importance: clamp(num(t?.importance, 3), 1, 5),
    reminders: arr<string>(t?.reminders).map(x => str(x)).filter(Boolean),
    interactionLog: arr<any>(t?.interactionLog).map(x => ({
      date: str(x?.date) || now(),
      note: str(x?.note),
    })),
  };
}

export function normalizeSkill(t: Partial<Skill>): Skill {
  return {
    id: str(t?.id) || uid(),
    title: str(t?.title, 'Skill'),
    description: str(t?.description),
    category: str(t?.category, 'General'),
    level: Math.max(1, num(t?.level, 1)),
    xp: clamp(num(t?.xp), 0, 99),
    prerequisites: arr<string>(t?.prerequisites).map(x => str(x)).filter(Boolean),
    practices: arr<string>(t?.practices).map(x => str(x)).filter(Boolean),
    relatedHabits: arr<string>(t?.relatedHabits).map(x => str(x)).filter(Boolean),
    relatedGoals: arr<string>(t?.relatedGoals).map(x => str(x)).filter(Boolean),
    unlocks: arr<string>(t?.unlocks).map(x => str(x)).filter(Boolean),
  };
}

export function normalizeQuest(t: Partial<Quest>): Quest {
  return {
    id: str(t?.id) || uid(),
    title: str(t?.title, 'Quest'),
    description: str(t?.description),
    duration: Math.max(1, num(t?.duration, 7)),
    status: oneOf(t?.status, ['active', 'archived', 'completed', 'paused'] as const, 'active'),
    xpReward: Math.max(0, num(t?.xpReward, 100)),
    stages: arr<any>(t?.stages).map(s => ({ title: str(s?.title, 'Stage'), done: bool(s?.done) })),
    dailyMissions: arr<string>(t?.dailyMissions).map(x => str(x)).filter(Boolean),
    linkedGoal: idOrNull(t?.linkedGoal),
    linkedHabits: arr<string>(t?.linkedHabits).map(x => str(x)).filter(Boolean),
    boss: idOrNull(t?.boss),
    rewards: arr<string>(t?.rewards).map(x => str(x)).filter(Boolean),
    createdAt: str(t?.createdAt) || now(),
  };
}

export function normalizeBoss(t: Partial<Boss>): Boss {
  return {
    id: str(t?.id) || uid(),
    name: str(t?.name, 'Boss'),
    description: str(t?.description),
    hp: Math.max(0, num(t?.hp)),
    maxHp: Math.max(1, num(t?.maxHp, 100)),
    attacks: arr<string>(t?.attacks).map(x => str(x)).filter(Boolean),
    weakness: str(t?.weakness),
    linkedBadPattern: str(t?.linkedBadPattern),
    victoryCondition: str(t?.victoryCondition),
    rewards: arr<string>(t?.rewards).map(x => str(x)).filter(Boolean),
    logs: arr<string>(t?.logs).map(x => str(x)).filter(Boolean),
    defeated: bool(t?.defeated),
  };
}

export function normalizeMentor(t: Partial<Mentor>): Mentor {
  return {
    id: str(t?.id) || uid(),
    name: str(t?.name, 'Mentor'),
    persona: str(t?.persona, 'ruthless_operator'),
    tone: str(t?.tone),
    domain: str(t?.domain),
    rules: arr<string>(t?.rules).map(x => str(x)).filter(Boolean),
    dataAccess: arr<string>(t?.dataAccess).map(x => str(x)).filter(Boolean),
    trustLevel: clamp(num(t?.trustLevel, 1), 1, 5),
    unlockableQuotes: arr<string>(t?.unlockableQuotes).map(x => str(x)).filter(Boolean),
  };
}

export function normalizeMentorMessage(t: Partial<MentorMessage>): MentorMessage {
  return {
    id: str(t?.id) || uid(),
    mentorId: str(t?.mentorId),
    text: str(t?.text),
    fromUser: bool(t?.fromUser),
    createdAt: str(t?.createdAt) || now(),
  };
}

export function normalizeMarketplaceInstall(t: Partial<MarketplaceInstall>): MarketplaceInstall {
  return {
    id: str(t?.id) || uid(),
    productId: str(t?.productId),
    productTitle: str(t?.productTitle),
    installedAt: str(t?.installedAt) || now(),
    mode: oneOf(t?.mode, ['full', 'quests', 'mentors', 'dashboard', 'sandbox'] as const, 'full'),
    progress: clamp(num(t?.progress), 0, 100),
    activeQuests: arr<string>(t?.activeQuests).map(x => str(x)).filter(Boolean),
    connectedMentors: arr<string>(t?.connectedMentors).map(x => str(x)).filter(Boolean),
    nextReview: dateOrNull(t?.nextReview),
  };
}

export function normalizeProtocol(t: Partial<Protocol>): Protocol {
  return {
    id: str(t?.id) || uid(),
    name: str(t?.name, 'Protocol'),
    description: str(t?.description),
    steps: arr<string>(t?.steps).map(x => str(x)).filter(Boolean),
    category: str(t?.category, 'General'),
  };
}

export function normalizeAIMessage(t: Partial<AIMessage>): AIMessage {
  return {
    id: str(t?.id) || uid(),
    role: oneOf(t?.role, ['user', 'assistant'] as const, 'user'),
    text: str(t?.text),
    actions: arr<any>(t?.actions).map((a): AIAction => ({
      id: str(a?.id) || uid(),
      type: str(a?.type),
      label: str(a?.label),
      description: str(a?.description),
      applied: bool(a?.applied),
      payload: (a?.payload && typeof a.payload === 'object') ? a.payload : {},
    })),
    createdAt: str(t?.createdAt) || now(),
    isMock: bool(t?.isMock, true),
  };
}

export function normalizeSettings(t: Partial<Settings>): Settings {
  return {
    theme: oneOf(t?.theme, ['dark', 'light'] as const, 'dark'),
    accentColor: str(t?.accentColor, 'cyan'),
    language: oneOf(t?.language, ['en', 'ru'] as const, 'en'),
    pinEnabled: bool(t?.pinEnabled),
    pin: typeof t?.pin === 'string' ? t.pin : null,
    aiProvider: oneOf(t?.aiProvider, ['mock', 'gemini', 'openai'] as const, 'mock'),
    privacyMode: bool(t?.privacyMode),
    dashboardCards: arr<string>(t?.dashboardCards).length > 0
      ? arr<string>(t.dashboardCards).map(x => str(x)).filter(Boolean)
      : ['lifeScore', 'clarityScore', 'energyScore', 'progressScore', 'weeklyProgress', 'activeGoals', 'activeProjects', 'focusTime', 'habitsCompletion', 'financeOverview', 'reflectionTrend', 'upcomingDeadlines', 'aiInsight'],
    monthlyBudget: Math.max(0, num(t?.monthlyBudget, 2000)),
    budgetCategories: arr<any>(t?.budgetCategories).map((c): BudgetCategory => ({
      id: str(c?.id) || uid(),
      name: str(c?.name),
      limit: Math.max(0, num(c?.limit)),
      color: str(c?.color, 'cyan'),
    })),
    weekStartsOn: (t?.weekStartsOn === 0 || t?.weekStartsOn === 1) ? t.weekStartsOn : 1,
    dailyReviewTime: str(t?.dailyReviewTime, '21:00'),
  };
}

export function normalizeUserProfile(t: Partial<UserProfile>): UserProfile {
  return {
    name: str(t?.name, 'Operator'),
    role: str(t?.role, 'Life OS User'),
    avatar: str(t?.avatar),
    level: Math.max(1, num(t?.level, 1)),
    xp: Math.max(0, num(t?.xp)),
    totalXpEarned: Math.max(0, num(t?.totalXpEarned)),
    lifeScore: clamp(num(t?.lifeScore, 50), 0, 100),
    clarityScore: clamp(num(t?.clarityScore, 50), 0, 100),
    energyScore: clamp(num(t?.energyScore, 50), 0, 100),
    progressScore: clamp(num(t?.progressScore, 50), 0, 100),
    joinedAt: str(t?.joinedAt) || now(),
    currentStreak: Math.max(0, num(t?.currentStreak)),
    longestStreak: Math.max(0, num(t?.longestStreak)),
    lastActiveDate: str(t?.lastActiveDate) || now(),
  };
}

export function normalizeTodayMission(t: Partial<TodayMission> | null | undefined): TodayMission | null {
  if (!t) return null;
  return {
    date: str(t?.date) || now(),
    mainFocus: str(t?.mainFocus),
    topTasks: arr<string>(t?.topTasks).map(x => str(x)).filter(Boolean),
    energyStatus: str(t?.energyStatus),
    habitOfTheDay: idOrNull(t?.habitOfTheDay),
    financeSignal: str(t?.financeSignal),
    relationshipReminder: str(t?.relationshipReminder),
    riskWarning: str(t?.riskWarning),
    recoveryAction: str(t?.recoveryAction),
    startedAt: dateOrNull(t?.startedAt),
    completedAt: dateOrNull(t?.completedAt),
  };
}

function normalizeAchievement(t: any): Achievement {
  return {
    id: str(t?.id),
    title: str(t?.title),
    description: str(t?.description),
    category: str(t?.category) as any,
    icon: str(t?.icon, '🏆'),
    xpReward: Math.max(0, num(t?.xpReward)),
    unlockedAt: dateOrNull(t?.unlockedAt),
    condition: str(t?.condition),
    rarity: oneOf(t?.rarity, ['common', 'rare', 'epic', 'legendary'] as const, 'common'),
  };
}

function normalizePatternInsight(t: any): PatternInsight {
  return {
    id: str(t?.id) || uid(),
    type: oneOf(t?.type, ['correlation', 'warning', 'celebration', 'suggestion'] as const, 'suggestion'),
    title: str(t?.title),
    body: str(t?.body),
    data: (t?.data && typeof t.data === 'object') ? t.data : {},
    generatedAt: str(t?.generatedAt) || now(),
    dismissed: bool(t?.dismissed),
  };
}

function normalizeTimeCapsule(t: any): TimeCapsule {
  return {
    id: str(t?.id) || uid(),
    message: str(t?.message),
    revealAt: str(t?.revealAt) || now(),
    createdAt: str(t?.createdAt) || now(),
    revealed: bool(t?.revealed),
  };
}

// ─── Root State Normalizer ────────────────────────────────────────────────────

export function normalizeLoadedState(raw: any): NovaState {
  // Build the full achievement list from definitions, merging unlock times from saved state
  const savedAchievements: Record<string, Achievement> = {};
  arr<any>(raw?.achievements).forEach(a => { savedAchievements[str(a?.id)] = normalizeAchievement(a); });

  const achievements: Achievement[] = ALL_ACHIEVEMENTS.map(def => ({
    ...def,
    unlockedAt: savedAchievements[def.id]?.unlockedAt || null,
  }));

  // Migrate finance.monthlyBudget from settings if present
  const budgetFromSettings = num((raw?.settings as any)?.monthlyBudget, 0);
  const budgetFromFinance = num(raw?.finance?.monthlyBudget, 0);
  const monthlyBudget = budgetFromSettings || budgetFromFinance || 2000;

  return {
    version: 3,
    profile: normalizeUserProfile(raw?.profile),
    goals: arr<any>(raw?.goals).map(normalizeGoal),
    projects: arr<any>(raw?.projects).map(normalizeProject),
    tasks: arr<any>(raw?.tasks).map(normalizeTask),
    habits: arr<any>(raw?.habits).map(normalizeHabit),
    reflections: arr<any>(raw?.reflections).map(normalizeReflection),
    dailyNotes: arr<any>(raw?.dailyNotes).map(normalizeDailyNote),
    finance: {
      transactions: arr<any>(raw?.finance?.transactions).map(normalizeFinanceTransaction),
      debts: arr<any>(raw?.finance?.debts).map(normalizeDebt),
      savingsGoals: arr<any>(raw?.finance?.savingsGoals).map(normalizeSavingsGoal),
      subscriptions: arr<any>(raw?.finance?.subscriptions).map(normalizeSubscription),
      monthlyBudget,
    },
    contacts: arr<any>(raw?.contacts).map(normalizeContact),
    skills: arr<any>(raw?.skills).map(normalizeSkill),
    quests: arr<any>(raw?.quests).map(normalizeQuest),
    bosses: arr<any>(raw?.bosses).map(normalizeBoss),
    mentors: arr<any>(raw?.mentors).map(normalizeMentor),
    mentorMessages: arr<any>(raw?.mentorMessages).map(normalizeMentorMessage),
    marketplaceInstalls: arr<any>(raw?.marketplaceInstalls).map(normalizeMarketplaceInstall),
    protocols: arr<any>(raw?.protocols).map(normalizeProtocol),
    aiMessages: arr<any>(raw?.aiMessages).map(normalizeAIMessage),
    settings: normalizeSettings({ ...raw?.settings, monthlyBudget }),
    todayMission: normalizeTodayMission(raw?.todayMission),
    achievements,
    patternInsights: arr<any>(raw?.patternInsights).map(normalizePatternInsight),
    timeCapsules: arr<any>(raw?.timeCapsules).map(normalizeTimeCapsule),
  };
}

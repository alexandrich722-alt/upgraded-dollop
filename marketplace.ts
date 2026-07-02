// NOVA Life OS — AI Service v3
// Real calls to nova-ai edge function; intelligent mock fallback.

import type { NovaState, AIAction } from '../types';

export type AIRequestType =
  | 'daily_planning' | 'evening_review' | 'weekly_review' | 'mind_dump'
  | 'anti_chaos' | 'goal_breakdown' | 'project_roadmap' | 'finance_audit'
  | 'reflection_analysis' | 'burnout_risk' | 'decision_matrix'
  | 'marketplace_adaptation' | 'mentor_advice' | 'life_graph_analysis'
  | 'task_cleanup' | 'chat' | 'pattern_detection';

export interface AIResponse {
  text: string;
  actions: Omit<AIAction, 'id' | 'applied'>[];
  isMock: boolean;
  provider?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ─── Build minimal context (to avoid token limits) ────────────────────────────

function buildContext(state: NovaState): Record<string, unknown> {
  return {
    profile: { name: state.profile.name, level: state.profile.level, xp: state.profile.xp, lifeScore: state.profile.lifeScore, energyScore: state.profile.energyScore },
    tasks: state.tasks.filter(t => !t.archived && t.status !== 'done').slice(0, 15).map(t => ({ title: t.title, priority: t.priority, deadline: t.deadline, status: t.status })),
    goals: state.goals.filter(g => g.status === 'active' && !g.archived).slice(0, 5).map(g => ({ title: g.title, progress: g.progress, priority: g.priority })),
    habits: state.habits.filter(h => !h.archived).slice(0, 8).map(h => ({ title: h.title, streak: h.streak, completionRate: h.completionRate, isBad: h.isBad })),
    reflections: state.reflections.slice(0, 5).map(r => ({ mood: r.mood, energy: r.energy, stress: r.stress, date: r.date.split('T')[0] })),
    finance: {
      monthlyBudget: state.finance.monthlyBudget,
      subscriptions: state.finance.subscriptions.filter(s => s.active).length,
      transactions: state.finance.transactions.filter(t => t.type === 'expense').slice(0, 10).map(t => ({ amount: t.amount, category: t.category })),
    },
  };
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export async function processAI(
  type: AIRequestType,
  input: string,
  state: NovaState,
  messages?: { role: string; text: string }[]
): Promise<AIResponse> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/nova-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        type,
        input,
        context: buildContext(state),
        messages: messages?.slice(-8) || [],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) throw new Error(`AI API ${res.status}`);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    return {
      text: String(data.text || ''),
      actions: Array.isArray(data.actions) ? data.actions : [],
      isMock: Boolean(data.isMock),
      provider: data.provider,
    };
  } catch (_err) {
    // Intelligent mock fallback
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
    return getMockResponse(type, input, state);
  }
}

// ─── Mock Fallback ────────────────────────────────────────────────────────────

const MOCK = '[Demo — connect AI for personalized insights] ';

function getMockResponse(type: AIRequestType, input: string, state: NovaState): AIResponse {
  const activeTasks = state.tasks.filter(t => !t.archived && t.status !== 'done');
  const doneTasks = state.tasks.filter(t => t.status === 'done');
  const activeGoals = state.goals.filter(g => g.status === 'active' && !g.archived);
  const habits = state.habits.filter(h => !h.archived);
  const reflections = state.reflections.slice(0, 7);
  const name = state.profile.name;
  const overdue = activeTasks.filter(t => t.deadline && new Date(t.deadline) < new Date());

  switch (type) {
    case 'daily_planning':
    case 'chat': {
      const top3 = [...activeTasks].sort((a, b) => {
        const o: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return (o[a.priority] ?? 2) - (o[b.priority] ?? 2);
      }).slice(0, 3);
      const mainGoal = activeGoals.find(g => g.priority === 'critical') || activeGoals[0];
      return {
        text: `${MOCK}${name}, here's your daily briefing:\n\nMain goal: "${mainGoal?.title || 'Not set'}" — ${mainGoal?.progress || 0}% complete\n\nTop 3 priorities:\n${top3.map((t, i) => `${i + 1}. ${t.title} [${t.priority}]`).join('\n') || 'No tasks yet'}\n\n${overdue.length > 0 ? `⚠️ ${overdue.length} overdue tasks need triage.\n\n` : ''}Energy: ${state.profile.energyScore > 60 ? 'Good — plan deep work blocks' : 'Low — protect your energy today'}\n\nHabit of the day: ${habits[0]?.title || 'Set a habit to track'}`,
        actions: [
          { type: 'start_mission', label: 'Start Today\'s Mission', description: 'Lock in your top 3 priorities' },
          ...(overdue.length > 0 ? [{ type: 'triage_overdue', label: `Triage ${overdue.length} overdue`, description: 'Review overdue tasks' }] : []),
        ],
        isMock: true,
      };
    }

    case 'mind_dump': {
      const taskKeywords = ['need to', 'must', 'have to', 'should', 'fix', 'finish', 'call', 'pay', 'write', 'build', 'review'];
      const sentences = input.split(/[.!?;\n]+/).map(s => s.trim()).filter(Boolean);
      const tasks = sentences.filter(s => taskKeywords.some(k => s.toLowerCase().includes(k)));
      const hasStress = input.toLowerCase().match(/stress|overwhelm|anxious|tired|worried|fear/);
      return {
        text: `${MOCK}Mind dump processed, ${name}:\n\nTask signals: ${tasks.length || 'none detected'}\n${tasks.slice(0, 5).map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n${hasStress ? '⚠️ I notice stress signals in your text. Before adding tasks — what can you remove or delegate?\n\n' : ''}Recommendation: Pick the 1-2 most impactful tasks. Delete the rest.`,
        actions: [
          { type: 'create_tasks', label: `Create ${Math.min(tasks.length, 5)} tasks`, description: 'Add detected tasks to your list' },
          { type: 'save_reflection', label: 'Save as reflection', description: 'Log this as a journal entry' },
        ],
        isMock: true,
      };
    }

    case 'burnout_risk': {
      const avgStress = reflections.length ? reflections.reduce((a, r) => a + r.stress, 0) / reflections.length : 5;
      const avgEnergy = reflections.length ? reflections.reduce((a, r) => a + r.energy, 0) / reflections.length : 5;
      const risk = avgStress > 7 && avgEnergy < 4 ? 'HIGH' : avgStress > 5 || avgEnergy < 5 ? 'MODERATE' : 'LOW';
      return {
        text: `${MOCK}Burnout assessment for ${name}: **${risk}**\n\nAvg stress: ${avgStress.toFixed(1)}/10 | Avg energy: ${avgEnergy.toFixed(1)}/10\nActive tasks: ${activeTasks.length}\n\n${risk === 'HIGH' ? 'Reduce to 1 task today. Schedule recovery time. This is not optional.' : risk === 'MODERATE' ? 'Watch your load. Don\'t add tasks — finish and close 3.' : 'You\'re in good shape. Keep your current rhythm.'}\n\nNote: NOVA is not a medical service. If feeling in crisis, contact a professional.`,
        actions: [{ type: 'reduce_load', label: 'Reduce today\'s load', description: 'Keep only 1-2 essential tasks' }],
        isMock: true,
      };
    }

    case 'finance_audit': {
      const monthStr = new Date().toISOString().slice(0, 7);
      const expenses = state.finance.transactions.filter(t => t.type === 'expense' && t.date.startsWith(monthStr));
      const total = expenses.reduce((a, t) => a + t.amount, 0);
      const subs = state.finance.subscriptions.filter(s => s.active);
      const subTotal = subs.reduce((a, s) => a + s.amount, 0);
      return {
        text: `${MOCK}Finance audit, ${name}:\n\nThis month: $${total.toFixed(0)} / $${state.finance.monthlyBudget} budget\nSubscriptions: ${subs.length} active ($${subTotal.toFixed(0)}/month)\n\n${total > state.finance.monthlyBudget ? `⚠️ Over budget by $${(total - state.finance.monthlyBudget).toFixed(0)}. Cut discretionary spending.` : `$${(state.finance.monthlyBudget - total).toFixed(0)} remaining.`}\n\n${subTotal > 100 ? `Consider auditing your ${subs.length} subscriptions — that\'s $${(subTotal * 12).toFixed(0)}/year.` : 'Subscription spending looks reasonable.'}`,
        actions: [{ type: 'review_subs', label: 'Review subscriptions', description: 'Audit recurring payments' }],
        isMock: true,
      };
    }

    case 'weekly_review': {
      const avgHabitRate = habits.length ? Math.round(habits.reduce((a, h) => a + h.completionRate, 0) / habits.length) : 0;
      return {
        text: `${MOCK}Weekly review for ${name}:\n\nCompleted: ${doneTasks.length} tasks total\nGoal progress: ${activeGoals.map(g => `${g.title}: ${g.progress}%`).join(', ') || 'none set'}\nHabits: ${avgHabitRate}% average completion\n${overdue.length > 0 ? `Overdue: ${overdue.length} tasks\n` : ''}\nNext week: Pick ONE goal as the priority. Cut anything not serving it.`,
        actions: [{ type: 'plan_week', label: 'Plan next week', description: 'Set weekly priorities' }],
        isMock: true,
      };
    }

    case 'reflection_analysis': {
      const avgMood = reflections.length ? reflections.reduce((a, r) => a + r.mood, 0) / reflections.length : 5;
      const avgStress = reflections.length ? reflections.reduce((a, r) => a + r.stress, 0) / reflections.length : 5;
      return {
        text: `${MOCK}Reflection analysis (last ${reflections.length} entries), ${name}:\n\nMood avg: ${avgMood.toFixed(1)}/10 ${avgMood > 6 ? '↑ positive' : avgMood < 4 ? '↓ low — take action' : '→ stable'}\nStress avg: ${avgStress.toFixed(1)}/10 ${avgStress > 7 ? '↑ high — reduce load' : '→ manageable'}\n\n${avgStress > 6 && avgMood < 5 ? 'Pattern: High stress + low mood. Consider reducing commitments or adding recovery rituals.' : 'Pattern: Stable. Maintain current rhythm.'}\n\nNote: NOVA is not a psychological service.`,
        actions: [{ type: 'recovery_plan', label: 'Create recovery plan', description: 'Schedule recovery this week' }],
        isMock: true,
      };
    }

    default:
      return {
        text: `${MOCK}${name}, I'm analyzing your data. You have ${activeTasks.length} active tasks, ${activeGoals.length} goals, and ${habits.length} habits. What specific area would you like to work on?`,
        actions: [{ type: 'start_mission', label: 'Start Today\'s Mission', description: 'Set your daily priorities' }],
        isMock: true,
      };
  }
}

// ─── Today Mission Generator ──────────────────────────────────────────────────

export function generateTodayMission(state: NovaState) {
  const activeTasks = state.tasks.filter(t => !t.archived && t.status !== 'done');
  const sorted = [...activeTasks].sort((a, b) => {
    const o: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (o[a.priority] ?? 2) - (o[b.priority] ?? 2);
  });
  const mainGoal = state.goals.find(g => g.priority === 'critical' && g.status === 'active') || state.goals[0];
  const habit = state.habits.find(h => !h.archived && !h.isBad);
  const contact = state.contacts.find(c => c.reminders.length > 0) || state.contacts[0];
  const todayExpenses = state.finance.transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(new Date().toISOString().split('T')[0]))
    .reduce((a, t) => a + t.amount, 0);
  const dailyLimit = state.finance.monthlyBudget / 30;
  const overdue = activeTasks.filter(t => t.deadline && new Date(t.deadline) < new Date());

  return {
    mainFocus: mainGoal?.title || 'Set your main focus',
    topTasks: sorted.slice(0, 3).map(t => t.id),
    energyStatus: state.profile.energyScore > 70
      ? 'High — plan 2 deep work blocks'
      : state.profile.energyScore > 50
      ? 'Medium — 1 deep work block max'
      : 'Low — essential tasks only',
    habitOfTheDay: habit?.id || null,
    financeSignal: `Daily limit: $${dailyLimit.toFixed(0)}${todayExpenses > 0 ? ` — spent $${todayExpenses.toFixed(0)}` : ''}`,
    relationshipReminder: contact ? `Message ${contact.name}` : 'No reminders',
    riskWarning: overdue.length > 0
      ? `${overdue.length} overdue — triage now`
      : activeTasks.length > 10
      ? `${activeTasks.length} tasks — risk of overload`
      : 'No critical risks',
    recoveryAction: state.profile.energyScore < 50
      ? '20-min walk + rest after work'
      : '15-min walk between blocks',
  };
}

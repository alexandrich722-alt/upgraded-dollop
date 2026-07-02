import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Zap, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { processAI, type AIRequestType } from '../lib/ai';
import { SectionHeader, Badge, EmptyState } from '../components/ui';

const quickActions: { label: string; type: AIRequestType; icon: any; color: string }[] = [
  { label: 'Plan my day', type: 'daily_planning', icon: Zap, color: 'cyan' },
  { label: 'Evening review', type: 'evening_review', icon: CheckCircle2, color: 'emerald' },
  { label: 'Weekly review', type: 'weekly_review', icon: Sparkles, color: 'violet' },
  { label: 'Anti-chaos', type: 'anti_chaos', icon: AlertTriangle, color: 'rose' },
  { label: 'Task cleanup', type: 'task_cleanup', icon: CheckCircle2, color: 'gold' },
  { label: 'Burnout check', type: 'burnout_risk', icon: AlertTriangle, color: 'rose' },
  { label: 'Finance audit', type: 'finance_audit', icon: Zap, color: 'emerald' },
  { label: 'Life graph', type: 'life_graph_analysis', icon: Sparkles, color: 'cyan' },
];

export default function AIChief() {
  const { state, addAIMessage, clearAIMessages, addTask, deleteTask, updateTask, addReflection, setTodayMission, updateGoal, addGoal, updateProject } = useStore();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastUserText, setLastUserText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.aiMessages, loading]);

  const send = async (text: string, type?: AIRequestType) => {
    const userText = text || `Run: ${type}`;
    if (!text.trim() && !type) return;
    setLastUserText(text);
    addAIMessage({ role: 'user', text: userText, actions: [], isMock: false });
    setInput('');
    setLoading(true);
    try {
      const reqType = type || 'mentor_advice';
      const res = await processAI(reqType, text, state);
      addAIMessage({
        role: 'assistant',
        text: res.text,
        actions: res.actions.map(a => ({ ...a, id: crypto.randomUUID(), applied: false, type: a.type, label: a.label, description: a.description })),
        isMock: res.isMock,
      });
    } catch {
      addAIMessage({ role: 'assistant', text: 'Demo analysis — AI unavailable. Something went wrong. Please try again.', actions: [], isMock: true });
    }
    setLoading(false);
  };

  const applyAction = (actionType: string, actionLabel: string) => {
    switch (actionType) {
      case 'create_tasks': {
        const text = lastUserText || input;
        const sentences = text.split(/[.!?;\n]+/).map(s => s.trim()).filter(Boolean);
        const taskKeywords = ['need to', 'must', 'have to', 'should', 'fix', 'finish', 'complete', 'send', 'write', 'call', 'pay', 'build', 'review', 'dodelat', 'нужно', 'надо', 'доделать', 'оплатить', 'написать'];
        const tasks = sentences.filter(s => taskKeywords.some(k => s.toLowerCase().includes(k)));
        if (tasks.length === 0) { toast('error', 'No tasks detected in your message'); return; }
        tasks.forEach(t => addTask({ title: t, priority: 'medium', estimatedMinutes: 25, energyLevel: 'medium' }));
        toast('success', `Created ${tasks.length} task${tasks.length !== 1 ? 's' : ''} from your message`);
        break;
      }
      case 'delete_stale': {
        const stale = state.tasks.filter(t => { const age = Date.now() - new Date(t.createdAt).getTime(); return age > 14 * 86400000 && t.status !== 'done' && !t.archived; });
        if (stale.length === 0) { toast('info', 'No stale tasks found'); return; }
        stale.forEach(t => deleteTask(t.id));
        toast('success', `Deleted ${stale.length} stale task${stale.length !== 1 ? 's' : ''}`);
        break;
      }
      case 'keep_top_3': {
        const active = state.tasks.filter(t => !t.archived && t.status !== 'done').sort((a, b) => {
          const o = { critical: 0, high: 1, medium: 2, low: 3 };
          return o[a.priority] - o[b.priority];
        });
        const toArchive = active.slice(3);
        if (toArchive.length === 0) { toast('info', 'You already have 3 or fewer active tasks'); return; }
        toArchive.forEach(t => updateTask(t.id, { archived: true }));
        toast('success', `Archived ${toArchive.length} task${toArchive.length !== 1 ? 's' : ''} — top 3 kept`);
        break;
      }
      case 'start_mission': {
        const active = state.tasks.filter(t => !t.archived && t.status !== 'done').sort((a, b) => {
          const o = { critical: 0, high: 1, medium: 2, low: 3 };
          return o[a.priority] - o[b.priority];
        });
        const top3 = active.slice(0, 3).map(t => t.id);
        const mainGoal = state.goals.find(g => g.priority === 'critical' && g.status === 'active') || state.goals[0];
        setTodayMission({
          date: new Date().toISOString(),
          mainFocus: mainGoal?.title || 'Focus on the most important thing',
          topTasks: top3,
          energyStatus: state.profile.energyScore > 70 ? 'High — 2 deep work blocks' : 'Medium — 1 deep work block',
          habitOfTheDay: state.habits.find(h => !h.archived)?.id || null,
          financeSignal: `Daily limit: $${(state.finance.monthlyBudget / 30).toFixed(2)}`,
          relationshipReminder: state.contacts[0] ? `Write to ${state.contacts[0].name}` : 'No reminders',
          riskWarning: active.length > 8 ? 'Overload risk — too many tasks' : 'No major risks',
          recoveryAction: '15-min walk between focus blocks',
          startedAt: new Date().toISOString(),
          completedAt: null,
        });
        toast('success', 'Today Mission started with your top 3 tasks');
        break;
      }
      case 'triage_overdue': {
        const overdue = state.tasks.filter(t => !t.archived && t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date());
        if (overdue.length === 0) { toast('info', 'No overdue tasks'); return; }
        overdue.forEach(t => updateTask(t.id, { deadline: new Date(Date.now() + 86400000).toISOString() }));
        toast('success', `Rescheduled ${overdue.length} overdue task${overdue.length !== 1 ? 's' : ''} to tomorrow`);
        break;
      }
      case 'reschedule': {
        const notDone = state.tasks.filter(t => !t.archived && t.status !== 'done' && t.deadline && t.deadline.startsWith(new Date().toISOString().split('T')[0]));
        notDone.forEach(t => updateTask(t.id, { deadline: new Date(Date.now() + 86400000).toISOString() }));
        toast('success', `Moved ${notDone.length} task${notDone.length !== 1 ? 's' : ''} to tomorrow`);
        break;
      }
      case 'save_review': {
        const done = state.tasks.filter(t => t.status === 'done' && t.completedAt && t.completedAt.startsWith(new Date().toISOString().split('T')[0]));
        const notDone = state.tasks.filter(t => !t.archived && t.status !== 'done' && t.deadline && t.deadline.startsWith(new Date().toISOString().split('T')[0]));
        addReflection({
          date: new Date().toISOString(),
          text: `Evening Review:\nCompleted: ${done.map(t => t.title).join(', ') || 'none'}\nNot done: ${notDone.map(t => t.title).join(', ') || 'all done!'}\nLesson: ${done.length > notDone.length ? 'Good execution day' : 'Overplanned — pick fewer tomorrow'}`,
          mood: done.length > notDone.length ? 7 : 4,
          energy: 5, stress: notDone.length > 3 ? 7 : 4,
          tags: ['evening-review'], insights: [], linkedGoals: [], linkedTasks: [],
        });
        toast('success', 'Evening review saved to your reflections');
        break;
      }
      case 'plan_next_week': {
        const goals = state.goals.filter(g => g.status === 'active' && !g.archived);
        if (goals.length === 0) { toast('info', 'No active goals to plan around'); return; }
        toast('success', `Next week plan set — focus on "${goals[0].title}"`);
        break;
      }
      case 'create_goal': {
        addGoal({ title: lastUserText.slice(0, 60) || 'New Goal', description: 'Created from AI suggestion', category: 'General', priority: 'high', progress: 0, milestones: [{ id: crypto.randomUUID(), title: 'Define success criteria', done: false }, { id: crypto.randomUUID(), title: 'Break into phases', done: false }] });
        toast('success', 'Goal created with starter milestones');
        break;
      }
      case 'create_roadmap': {
        const project = state.projects.find(p => p.status === 'active' && !p.archived);
        if (project) { updateProject(project.id, { stages: ['Foundation', 'Core Build', 'Polish', 'Launch'] }); toast('success', `Roadmap applied to ${project.title}`); }
        else toast('info', 'No active project to apply roadmap');
        break;
      }
      case 'cancel_subs': {
        const subs = state.finance.subscriptions.filter(s => s.active);
        toast('info', `${subs.length} active subscriptions — review them in Finance`);
        break;
      }
      case 'recovery_plan': {
        addTask({ title: 'Recovery: 20-min walk + 10-min rest', priority: 'high', estimatedMinutes: 30, energyLevel: 'low' });
        toast('success', 'Recovery plan added to your tasks');
        break;
      }
      case 'reduce_load': {
        const active = state.tasks.filter(t => !t.archived && t.status !== 'done');
        const toArchive = active.filter(t => t.priority === 'low' || t.priority === 'medium');
        toArchive.forEach(t => updateTask(t.id, { archived: true }));
        toast('success', `Reduced load — archived ${toArchive.length} non-critical task${toArchive.length !== 1 ? 's' : ''}`);
        break;
      }
      case 'log_decision': {
        addReflection({ date: new Date().toISOString(), text: `Decision logged: ${lastUserText.slice(0, 100)}`, mood: 5, energy: 5, stress: 5, tags: ['decision'], insights: [], linkedGoals: [], linkedTasks: [] });
        toast('success', 'Decision logged to your reflections');
        break;
      }
      case 'install_adapted': {
        toast('info', 'Visit Marketplace to install with adaptation');
        break;
      }
      case 'link_tasks': {
        const unlinked = state.tasks.filter(t => !t.archived && t.status !== 'done' && !t.goalId);
        const firstGoal = state.goals.find(g => g.status === 'active' && !g.archived);
        if (firstGoal && unlinked.length > 0) {
          unlinked.forEach(t => updateTask(t.id, { goalId: firstGoal.id }));
          toast('success', `Linked ${unlinked.length} task${unlinked.length !== 1 ? 's' : ''} to "${firstGoal.title}"`);
        } else { toast('info', 'No unlinked tasks or no active goals'); }
        break;
      }
      case 'add_deadlines': {
        const noDeadline = state.tasks.filter(t => !t.archived && t.status !== 'done' && !t.deadline);
        noDeadline.forEach(t => updateTask(t.id, { deadline: new Date(Date.now() + 3 * 86400000).toISOString() }));
        toast('success', `Added 3-day deadlines to ${noDeadline.length} task${noDeadline.length !== 1 ? 's' : ''}`);
        break;
      }
      case 'set_focus': {
        const mainGoal = state.goals.find(g => g.priority === 'critical' && g.status === 'active') || state.goals[0];
        if (mainGoal) { updateGoal(mainGoal.id, { progress: Math.min(100, mainGoal.progress + 5) }); toast('success', `Focus set on "${mainGoal.title}"`); }
        else toast('info', 'No active goal to set focus on');
        break;
      }
      default:
        toast('info', actionLabel);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto h-[calc(100vh-5rem)] lg:h-[calc(100vh-0rem)] flex flex-col animate-fade-in">
      <SectionHeader
        title="AI Chief of Staff"
        subtitle="Your personal AI operator"
        action={state.aiMessages.length > 0 ? (
          <button onClick={() => { clearAIMessages(); toast('info', 'Chat cleared'); }} className="btn-ghost text-xs">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        ) : undefined}
      />

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickActions.map(a => {
          const Icon = a.icon;
          return (
            <button key={a.type} onClick={() => send('', a.type)} disabled={loading} className="btn-ghost text-xs">
              <Icon className="w-3.5 h-3.5" /> {a.label}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4 min-h-0">
        {state.aiMessages.length === 0 && !loading && (
          <EmptyState
            icon={<Bot className="w-8 h-8" />}
            title="Ask NOVA anything"
            description="Plan your day, analyze your chaos, audit your finances, or just talk through a decision."
          />
        )}
        {state.aiMessages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-accent-cyan/15 border border-accent-cyan/20' : 'glass'}`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-nova-bg" />
                  </div>
                  <span className="text-xs font-medium text-nova-dim">NOVA</span>
                  {msg.isMock && <Badge color="gold">Demo</Badge>}
                </div>
              )}
              <p className="text-sm text-nova-text whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              {msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.actions.map(a => (
                    <button
                      key={a.id}
                      onClick={() => applyAction(a.type, a.label)}
                      className="btn-ghost text-xs"
                      title={a.description}
                    >
                      <Zap className="w-3 h-3" /> {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass rounded-2xl p-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-nova-bg" />
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 shrink-0">
        <input
          className="input flex-1"
          placeholder="Ask NOVA to plan, analyze, or decide..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !loading) send(input); }}
          disabled={loading}
          aria-label="Ask NOVA"
        />
        <button onClick={() => send(input)} disabled={loading || !input.trim()} className="btn-primary" aria-label="Send message">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

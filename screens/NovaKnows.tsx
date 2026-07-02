import { useState, useRef, useEffect } from 'react';
import { Users, Send, Quote, Plus, Star } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, Modal, EmptyState } from '../components/ui';
import type { Mentor, MentorMessage } from '../types';

const mentorStyles = [
  { id: 'ruthless_operator', name: 'Ruthless Operator', desc: 'No excuses, just results', color: 'rose' },
  { id: 'stoic_philosopher', name: 'Stoic Philosopher', desc: 'Wisdom and perspective', color: 'cyan' },
  { id: 'creative_visionary', name: 'Creative Visionary', desc: 'Think different, dream big', color: 'violet' },
  { id: 'cfo', name: 'CFO', desc: 'Numbers don\'t lie', color: 'emerald' },
  { id: 'fitness_coach', name: 'Fitness Coach', desc: 'Body drives the mind', color: 'gold' },
  { id: 'zen_master', name: 'Zen Master', desc: 'Peace, clarity, flow', color: 'blue' },
  { id: 'startup_founder', name: 'Startup Founder', desc: 'Move fast, ship things', color: 'cyan' },
  { id: 'psychologist', name: 'Psychologist', desc: 'Understand the why', color: 'rose' },
];

function generateResponse(style: string, userText: string, state: any): string {
  const activeTasks = state.tasks.filter((t: any) => !t.archived && t.status !== 'done');
  const activeGoals = state.goals.filter((g: any) => !g.archived && g.status === 'active');
  const habits = state.habits.filter((h: any) => !h.archived);
  const reflections = state.reflections.slice(0, 5);
  const text = userText.toLowerCase();

  switch (style) {
    case 'ruthless_operator':
      if (text.includes('tired') || text.includes('burn')) return `Tired? You have ${activeTasks.length} tasks and ${activeGoals.length} goals. Sleep is for people who don't have dreams. Pick the hardest task and do it NOW. Everything else is an excuse.`;
      if (text.includes('procrastinat') || text.includes('delay')) return `Procrastination is a choice. You're choosing comfort over your goals. Close this app, open your #1 task, and don't come back until it's done.`;
      return `Stop thinking, start doing. You have ${activeTasks.length} active tasks. Pick the highest priority one and execute. Analysis paralysis is just fear wearing a suit.`;
    case 'stoic_philosopher':
      if (text.includes('anxious') || text.includes('worry')) return `You suffer more in imagination than in reality. What's the worst that can actually happen? Accept what you can't control. Focus on what you can: your next action.`;
      if (text.includes('fail') || text.includes('mistake')) return `The obstacle is the way. Every failure is data. Marcus Aurelius would say: what stands in the way becomes the way. What did you learn?`;
      return `You have ${activeGoals.length} goals. Remember: wealth is not having many things, but few wants. Are you pursuing what matters, or what looks good?`;
    case 'creative_visionary':
      if (text.includes('stuck') || text.includes('block')) return `Stuck? Step away. Go for a walk without your phone. The best ideas come when you're not trying. Your subconscious has been working on it while you weren't looking.`;
      return `What if you approached this differently? What would the opposite look like? What would this look like in 10 years? Expand your thinking. You have ${activeGoals.length} goals — are they big enough?`;
    case 'cfo':
      const expenses = state.finance.transactions.filter((t: any) => t.type === 'expense' && t.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((a: number, t: any) => a + t.amount, 0);
      return `Let's look at the numbers. You've spent $${expenses.toFixed(0)} this month against a $${state.finance.monthlyBudget} budget. ${expenses > state.finance.monthlyBudget ? 'You\'re over budget. Cut non-essential spending immediately.' : 'You\'re within budget. Good.'} Every dollar has a job. What's yours doing?`;
    case 'fitness_coach':
      const habitStreaks = habits.map((h: any) => `${h.title}: ${h.streak}d`).join(', ');
      return `Your body drives your mind. ${habitStreaks || 'No habits tracked yet.'} Energy creates energy. Even 10 minutes of movement will shift your state. What's one physical action you can take right now?`;
    case 'zen_master':
      if (text.includes('stress') || text.includes('overwhelm')) return `Breathe. In this moment, you are okay. The stress is not the situation — it's your resistance to it. Let go of what you can't control. What is one small thing you can do with full presence?`;
      return `You have ${activeTasks.length} tasks. But how many truly matter? Do less, but do it with more presence. Quality over quantity. What is the one thing that would make today complete?`;
    case 'startup_founder':
      return `Ship it. You have ${activeTasks.length} tasks — which one moves the needle most? Do that one. Perfection is the enemy of done. What can you ship today?`;
    case 'psychologist':
      if (reflections.length > 0) {
        const avgMood = reflections.reduce((a: number, r: any) => a + r.mood, 0) / reflections.length;
        return `Your recent mood average is ${avgMood.toFixed(1)}/10. ${avgMood < 5 ? 'I notice you\'ve been struggling. What\'s underneath that? Sometimes we avoid the real issue by staying busy.' : 'You seem to be doing well. What\'s contributing to that?'}`;
      }
      return `What pattern do you notice in your behavior? Often the problem isn't the problem — it's how we're relating to it. What would you tell a friend in your situation?`;
    default:
      return `I hear you. Let me think about this in the context of your current situation...`;
  }
}

export default function Mentors() {
  const { state, addMentor } = useStore();
  const { toast } = useToast();
  const [chatting, setChatting] = useState<Mentor | null>(null);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [input, setInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ name: string; persona: string }>({ name: '', persona: 'ruthless_operator' });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const openChat = (m: Mentor) => { setChatting(m); setMessages([]); };
  const closeChat = () => { setChatting(null); setMessages([]); setInput(''); };

  const send = () => {
    if (!input.trim() || !chatting) return;
    const userMsg: MentorMessage = { id: crypto.randomUUID(), mentorId: chatting.id, fromUser: true, text: input, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    const userText = input;
    setInput('');
    setTimeout(() => {
      const response = generateResponse(chatting.persona || 'ruthless_operator', userText, state);
      const aiMsg: MentorMessage = { id: crypto.randomUUID(), mentorId: chatting.id, fromUser: false, text: response, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  const saveMentor = () => {
    if (!form.name.trim()) return;
    addMentor({ name: form.name, persona: form.persona, tone: '', domain: '', trustLevel: 1, rules: [], dataAccess: [], unlockableQuotes: [] } as any);
    toast('success', `${form.name} added to your mentors`);
    setShowForm(false);
    setForm({ name: '', persona: 'ruthless_operator' });
  };

  if (chatting) {
    const styleInfo = mentorStyles.find(s => s.id === (chatting.persona || 'ruthless_operator')) || mentorStyles[0];
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto h-[calc(100vh-5rem)] lg:h-screen flex flex-col animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={closeChat} className="btn-ghost text-xs">← Back</button>
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-nova-bg bg-gradient-to-br from-accent-${styleInfo.color} to-accent-violet`}>{chatting.name.charAt(0)}</div>
            <div><h2 className="font-display text-lg font-bold text-nova-text">{chatting.name}</h2><p className="text-xs text-nova-dim">{styleInfo.desc}</p></div>
          </div>
          <Badge color={styleInfo.color}>Trust Lv {chatting.trustLevel}</Badge>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar space-y-3 mb-4 min-h-0">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Quote className="w-8 h-8 text-nova-muted mx-auto mb-3" />
              <p className="text-sm text-nova-dim">Ask {chatting.name} anything. They know your goals, tasks, habits, and finances.</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.fromUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className={`max-w-[85%] rounded-2xl p-3.5 ${msg.fromUser ? 'bg-accent-cyan/15 border border-accent-cyan/20' : 'glass'}`}>
                <p className="text-sm text-nova-text whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 shrink-0">
          <input className="input flex-1" placeholder={`Ask ${chatting.name}...`} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} aria-label="Message" />
          <button onClick={send} disabled={!input.trim()} className="btn-primary" aria-label="Send"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <SectionHeader title="Shadow Mentors" subtitle="AI mentors with distinct perspectives" action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Mentor</button>} />

      {state.mentors.length === 0 ? (
        <EmptyState icon={<Users className="w-8 h-8" />} title="No mentors yet" description="Add an AI mentor for guidance" action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Mentor</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.mentors.map(m => {
            const styleInfo = mentorStyles.find(s => s.id === m.persona) || mentorStyles[0] || mentorStyles[0];
            return (
              <Card key={m.id} className="p-5 card-hover cursor-pointer" onClick={() => openChat(m)}>
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-nova-bg bg-gradient-to-br from-accent-${styleInfo.color} to-accent-violet shrink-0`}>{m.name.charAt(0)}</div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-nova-text">{m.name}</h3>
                    <p className="text-xs text-nova-dim">{styleInfo.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge color={styleInfo.color}>{styleInfo.name}</Badge>
                      <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < m.trustLevel ? 'text-accent-gold fill-accent-gold/30' : 'text-nova-border'}`} />)}</div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Mentor">
        <div className="space-y-4">
          <div><label className="label">Mentor Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Marcus, Yoda, Gordon..." autoFocus /></div>
          <div><label className="label">Mentor Style</label><select className="input" value={form.persona} onChange={e => setForm({ ...form, persona: e.target.value })}>{mentorStyles.map(s => <option key={s.id} value={s.id}>{s.name} — {s.desc}</option>)}</select></div>
          <button onClick={saveMentor} className="btn-primary w-full">Add Mentor</button>
        </div>
      </Modal>
    </div>
  );
}

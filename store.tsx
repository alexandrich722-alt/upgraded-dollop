import { useState } from 'react';
import { Zap, Target, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from './Toast';

export default function Onboarding() {
  const { updateProfile, completeOnboarding, addGoal, addHabit } = useStore();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [mainGoal, setMainGoal] = useState('');

  const steps = [
    { title: 'Welcome to NOVA', subtitle: 'Your personal AI Chief of Staff for life' },
    { title: 'Tell us about you', subtitle: 'We\'ll personalize your experience' },
    { title: 'What\'s your main goal?', subtitle: 'NOVA will help you get there' },
    { title: 'You\'re all set', subtitle: 'Your life OS is ready' },
  ];

  const finish = () => {
    if (name) updateProfile({ name });
    if (role) updateProfile({ role });
    if (mainGoal) {
      addGoal({ title: mainGoal, description: 'Your main focus', category: 'General', priority: 'critical', progress: 0, milestones: [{ id: crypto.randomUUID(), title: 'Define what success looks like', done: false }] });
    }
    addHabit({ title: 'Morning planning', description: 'Plan your day every morning', category: 'Productivity', frequency: 'daily', target: 1 });
    completeOnboarding();
    toast('success', 'Welcome to NOVA Life OS! Your journey starts now.');
  };

  return (
    <div className="min-h-screen bg-nova-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-cyan/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-accent-violet/5 rounded-full blur-[100px]" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center shadow-glow-cyan animate-pulse-glow">
            <Zap className="w-8 h-8 text-nova-bg" fill="currentColor" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gradient-cyan tracking-tight">NOVA Life OS</h1>
          <p className="text-sm text-nova-muted mt-1">Stop managing apps. Start operating your life.</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-accent-cyan shadow-glow-cyan' : i < step ? 'w-4 bg-accent-cyan/50' : 'w-4 bg-nova-border'}`} />
          ))}
        </div>

        {/* Step content */}
        <div className="glass-strong rounded-2xl p-6 animate-slide-up" key={step}>
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-nova-text mb-1 tracking-tight">{steps[step].title}</h2>
            <p className="text-sm text-nova-dim">{steps[step].subtitle}</p>
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { icon: Target, title: 'Turn chaos into clarity', desc: 'NOVA analyzes your goals, tasks, and energy to build a clear daily plan' },
                  { icon: Sparkles, title: 'AI Chief of Staff', desc: 'Get concrete recommendations, not generic advice' },
                  { icon: CheckCircle2, title: 'RPG your life', desc: 'Quests, bosses, skill trees — growth that feels like a game' },
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-nova-surface border border-nova-border">
                      <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 flex items-center justify-center shrink-0 border border-accent-cyan/15">
                        <Icon className="w-4 h-4 text-accent-cyan" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-nova-text">{f.title}</p>
                        <p className="text-xs text-nova-muted mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setStep(1)} className="btn-primary w-full py-3">Get Started <ArrowRight className="w-4 h-4" /></button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div><label className="label">Your Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Alex" autoFocus /></div>
              <div><label className="label">Your Role</label><input className="input" value={role} onChange={e => setRole(e.target.value)} placeholder="Founder / Creator / Student..." /></div>
              <div className="flex gap-2">
                <button onClick={() => setStep(0)} className="btn-ghost flex-1">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1">Continue <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">What's your #1 goal right now?</label>
                <input className="input" value={mainGoal} onChange={e => setMainGoal(e.target.value)} placeholder="Launch my startup, Get fit, Write a book..." autoFocus />
                <p className="text-xs text-nova-muted mt-2">This becomes your main focus. You can change it anytime.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Continue <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-emerald/15 flex items-center justify-center border border-accent-emerald/20">
                <CheckCircle2 className="w-8 h-8 text-accent-emerald" style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.3))' }} />
              </div>
              <p className="text-sm text-nova-dim">{name ? `Welcome, ${name}!` : 'Welcome!'} Your Life OS is configured with:</p>
              <div className="text-left space-y-2 p-4 rounded-xl bg-nova-surface border border-nova-border">
                {mainGoal && <p className="text-sm text-nova-text">• Main goal: <span className="text-accent-cyan">{mainGoal}</span></p>}
                <p className="text-sm text-nova-text">• Morning planning habit</p>
                <p className="text-sm text-nova-text">• Today Mission ready to generate</p>
                <p className="text-sm text-nova-text">• AI Chief of Staff on standby</p>
              </div>
              <button onClick={finish} className="btn-primary w-full py-3">Enter NOVA <Zap className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

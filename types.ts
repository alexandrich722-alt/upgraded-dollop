import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Sparkles, CheckCircle2, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { processAI } from '../lib/ai';
import { Card, SectionHeader, Badge } from '../components/ui';

const examples = [
  { text: "I need to finish the NOVA presentation, call mom, and I'm worried about the deadline on Friday. Also I had a great idea for a new feature.", icon: '💡' },
  { text: "Feeling overwhelmed today. Too many meetings. Need to cancel the 3pm and focus on the product launch. Also need to pay rent.", icon: '😰' },
  { text: "Great session with the team. We decided to pivot the strategy. Next steps: update roadmap, schedule all-hands, and create a new goal for Q4.", icon: '🎯' },
];

export default function VoiceCapture() {
  const { state, addTask, addReflection, addAIMessage } = useStore();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ text: string; actions: any[]; isMock: boolean } | null>(null);
  const [interimText, setInterimText] = useState('');
  const [waveform, setWaveform] = useState<number[]>(Array(24).fill(20));
  const recognitionRef = useRef<any>(null);
  const waveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Web Speech API
  const startRecording = () => {
    setRecording(true);
    setResult(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += transcript;
          else interim += transcript;
        }
        if (final) setText(prev => (prev + ' ' + final).trim());
        setInterimText(interim);
      };

      recognition.onerror = () => {
        toast('error', 'Speech recognition error. Try typing instead.');
        stopRecording();
      };

      recognition.onend = () => {
        if (recording) recognition.start();
      };

      recognition.start();
      recognitionRef.current = recognition;
    } else {
      toast('info', 'Speech recognition not supported. Type your mind dump instead.');
    }

    // Waveform animation
    waveRef.current = setInterval(() => {
      setWaveform(prev => prev.map(() => 20 + Math.random() * 80));
    }, 100);
  };

  const stopRecording = () => {
    setRecording(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.onend = null; recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (waveRef.current) { clearInterval(waveRef.current); waveRef.current = null; }
    setInterimText('');
    setWaveform(Array(24).fill(20));
  };

  useEffect(() => () => { if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {} if (waveRef.current) clearInterval(waveRef.current); }, []);

  const analyze = async () => {
    if (!text.trim()) { toast('error', 'Enter some text first'); return; }
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await processAI('mind_dump', text, state);
      setResult({ text: res.text, actions: res.actions.map(a => ({ ...a, id: crypto.randomUUID(), applied: false }) as any), isMock: res.isMock });
      addAIMessage({ role: 'user', text: `Mind dump: ${text.slice(0, 100)}...`, actions: [], isMock: false });
      addAIMessage({ role: 'assistant', text: res.text, actions: res.actions.map(a => ({ ...a, id: crypto.randomUUID(), applied: false }) as any), isMock: res.isMock });
    } catch {
      toast('error', 'Analysis failed. Try again.');
    }
    setAnalyzing(false);
  };

  const applyAction = (actionType: string, actionId: string) => {
    switch (actionType) {
      case 'create_tasks': {
        const sentences = text.split(/[.!?;\n]+/).map(s => s.trim()).filter(Boolean);
        const keywords = ['need to', 'must', 'have to', 'should', 'fix', 'finish', 'complete', 'send', 'write', 'call', 'pay', 'build', 'review', 'надо', 'нужно', 'доделать', 'оплатить', 'написать', 'позвонить'];
        const tasks = sentences.filter(s => keywords.some(k => s.toLowerCase().includes(k)));
        if (tasks.length === 0) { toast('error', 'No tasks detected'); return; }
        tasks.forEach(t => addTask({ title: t, priority: 'medium', estimatedMinutes: 25, energyLevel: 'medium' }));
        toast('success', `Created ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`);
        break;
      }
      case 'save_reflection': {
        addReflection({ date: new Date().toISOString(), text, mood: 5, energy: 5, stress: 5, tags: ['mind-dump'], insights: [], linkedGoals: [], linkedTasks: [] });
        toast('success', 'Saved to reflections');
        break;
      }
      default:
        toast('info', 'Action applied');
    }
    setResult(prev => prev ? { ...prev, actions: prev.actions.map(a => a.id === actionId ? { ...a, applied: true } : a) } : null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in">
      <SectionHeader title="Voice & Mind Dump" subtitle="Capture thoughts, let AI organize them" />

      {/* Recording area */}
      <Card className="p-6 mb-4 gradient-mesh">
        {/* Waveform / Mic */}
        <div className="flex flex-col items-center mb-6">
          {recording ? (
            <div className="flex items-center justify-center gap-1 h-20 mb-4">
              {waveform.map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-accent-cyan/40 to-accent-cyan transition-all duration-100"
                  style={{ height: `${h}%`, boxShadow: '0 0 4px rgba(34,211,238,0.3)' }}
                />
              ))}
            </div>
          ) : (
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${recording ? 'bg-accent-rose/20 scale-110' : 'bg-accent-cyan/15 hover:bg-accent-cyan/25 hover:scale-105'}`}
              aria-label={recording ? 'Stop recording' : 'Start recording'}
            >
              {recording ? <Square className="w-8 h-8 text-accent-rose" fill="currentColor" /> : <Mic className="w-8 h-8 text-accent-cyan" />}
            </button>
          )}
          <p className="text-sm text-nova-dim mt-2">
            {recording ? (interimText ? `Listening: "${interimText.slice(0, 40)}..."` : 'Listening...') : 'Tap to speak or type below'}
          </p>
        </div>

        {/* Text input */}
        <textarea
          className="input min-h-[120px] resize-none"
          placeholder="Dump everything on your mind... tasks, ideas, worries, decisions. NOVA will organize it."
          value={text}
          onChange={e => setText(e.target.value)}
          aria-label="Mind dump text"
        />

        <div className="flex gap-2 mt-3">
          <button onClick={analyze} disabled={!text.trim() || analyzing} className="btn-primary flex-1">
            <Sparkles className="w-4 h-4" /> {analyzing ? 'Analyzing...' : 'Analyze with AI'}
          </button>
          {text && <button onClick={() => { setText(''); setResult(null); }} className="btn-ghost"><Trash2 className="w-4 h-4" /></button>}
        </div>
      </Card>

      {/* Result */}
      {analyzing && (
        <Card className="p-5 mb-4">
          <div className="flex items-center gap-2 text-sm text-nova-dim">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            Analyzing your mind dump...
          </div>
        </Card>
      )}

      {result && (
        <Card className="p-5 mb-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-nova-bg" />
            </div>
            <div>
              <p className="text-sm font-medium text-nova-text">AI Analysis</p>
              {result.isMock && <Badge color="gold">Demo</Badge>}
            </div>
          </div>
          <p className="text-sm text-nova-text whitespace-pre-wrap leading-relaxed mb-4">{result.text}</p>
          {result.actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.actions.map(a => (
                <button
                  key={a.id}
                  onClick={() => applyAction(a.type, a.id)}
                  disabled={a.applied}
                  className={`btn text-xs ${a.applied ? 'bg-accent-emerald/15 text-accent-emerald cursor-default' : 'btn-ghost'}`}
                >
                  {a.applied ? <><CheckCircle2 className="w-3 h-3" /> Done</> : <><Sparkles className="w-3 h-3" /> {a.label}</>}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Examples */}
      {!result && !analyzing && (
        <div>
          <p className="text-xs text-nova-muted uppercase tracking-wider mb-3">Try an example</p>
          <div className="space-y-2">
            {examples.map((ex, i) => (
              <button key={i} onClick={() => setText(ex.text)} className="w-full text-left">
                <Card className="p-3 card-hover">
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0">{ex.icon}</span>
                    <p className="text-xs text-nova-dim line-clamp-2">{ex.text}</p>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

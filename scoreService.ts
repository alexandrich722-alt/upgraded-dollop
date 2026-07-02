// NOVA Life OS — Shared UI Components v3 — Premium Apple-level

import { type ReactNode, useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

export function Card({ children, className = '', hover = false, onClick, gradient }: { children: ReactNode; className?: string; hover?: boolean; onClick?: () => void; gradient?: string }) {
  const interactive = onClick !== undefined;
  return (
    <div
      onClick={onClick}
      onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick!(); } } : undefined}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      className={`card ${hover ? 'card-hover cursor-pointer' : ''} ${interactive ? 'focus:outline-none focus:ring-2 focus:ring-accent-cyan/30' : ''} ${gradient || ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold text-nova-text tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-sm text-nova-dim mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Badge({ children, color = 'cyan' }: { children: ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    cyan: 'bg-accent-cyan/12 text-accent-cyan border border-accent-cyan/15',
    violet: 'bg-accent-violet/12 text-accent-violet border border-accent-violet/15',
    emerald: 'bg-accent-emerald/12 text-accent-emerald border border-accent-emerald/15',
    gold: 'bg-accent-gold/12 text-accent-gold border border-accent-gold/15',
    rose: 'bg-accent-rose/12 text-accent-rose border border-accent-rose/15',
    blue: 'bg-accent-blue/12 text-accent-blue border border-accent-blue/15',
    muted: 'bg-nova-surface text-nova-dim border border-nova-border',
  };
  return <span className={`badge ${colors[color] || colors.cyan}`}>{children}</span>;
}

export function ProgressBar({ value, color = 'cyan', size = 'md' }: { value: number; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const colors: Record<string, string> = {
    cyan: 'bg-accent-cyan', violet: 'bg-accent-violet', emerald: 'bg-accent-emerald',
    gold: 'bg-accent-gold', rose: 'bg-accent-rose', blue: 'bg-accent-blue',
  };
  const glow: Record<string, string> = {
    cyan: 'shadow-[0_0_8px_rgba(34,211,238,0.3)]', violet: 'shadow-[0_0_8px_rgba(167,139,250,0.3)]',
    emerald: 'shadow-[0_0_8px_rgba(52,211,153,0.3)]', gold: 'shadow-[0_0_8px_rgba(251,191,36,0.3)]',
    rose: 'shadow-[0_0_8px_rgba(251,113,133,0.3)]', blue: 'shadow-[0_0_8px_rgba(96,165,250,0.3)]',
  };
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-2.5' };
  return (
    <div className={`w-full bg-nova-surface rounded-full overflow-hidden ${heights[size]}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`${heights[size]} ${colors[color] || colors.cyan} ${glow[color] || glow.cyan} rounded-full transition-all duration-700 ease-out`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function ScoreRing({ value, label, color = 'cyan', size = 80 }: { value: number; label: string; color?: string; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const colors: Record<string, string> = {
    cyan: '#22d3ee', violet: '#a78bfa', emerald: '#34d399', gold: '#fbbf24', rose: '#fb7185', blue: '#60a5fa',
  };
  const glowColor = colors[color] || colors.cyan;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label}: ${Math.round(value)} out of 100`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1c1c36" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={glowColor} strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 4px ${glowColor}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-xl text-nova-text">{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-xs text-nova-dim font-medium">{label}</span>
    </div>
  );
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; maxWidth?: string }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>('button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleTab);
    setTimeout(() => {
      const firstInput = modalRef.current?.querySelector<HTMLElement>('input, textarea, select, button');
      firstInput?.focus();
    }, 50);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleTab); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div ref={modalRef} className={`relative glass-strong rounded-2xl w-full ${maxWidth} max-h-[85vh] overflow-y-auto no-scrollbar animate-slide-up`}>
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-nova-border bg-nova-card/90 backdrop-blur-xl z-10">
          <h2 className="font-display text-lg font-semibold text-nova-text">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-nova-surface transition-colors" aria-label="Close dialog">
            <X className="w-5 h-5 text-nova-dim" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="w-16 h-16 mb-4 rounded-2xl bg-nova-surface border border-nova-border flex items-center justify-center text-nova-muted">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-nova-text mb-1">{title}</h3>
      {description && <p className="text-sm text-nova-dim max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-nova-dim mb-6">{message}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="btn-ghost">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} className="btn-primary">Confirm</button>
      </div>
    </Modal>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { color: string; label: string }> = {
    critical: { color: 'rose', label: 'Critical' }, high: { color: 'gold', label: 'High' },
    medium: { color: 'cyan', label: 'Medium' }, low: { color: 'muted', label: 'Low' },
  };
  const p = map[priority] || map.medium;
  return <Badge color={p.color}>{p.label}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    active: { color: 'emerald', label: 'Active' }, completed: { color: 'cyan', label: 'Completed' },
    paused: { color: 'gold', label: 'Paused' }, archived: { color: 'muted', label: 'Archived' },
    todo: { color: 'muted', label: 'To Do' }, in_progress: { color: 'gold', label: 'In Progress' },
    done: { color: 'emerald', label: 'Done' },
  };
  const s = map[status] || map.active;
  return <Badge color={s.color}>{s.label}</Badge>;
}

export function useDelayedValue<T>(value: T, delay = 300): T {
  const [delayed, setDelayed] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDelayed(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return delayed;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} role="status" aria-label="Loading" />;
}

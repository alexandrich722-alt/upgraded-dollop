// NOVA Life OS — Toast Notification System v2 — Premium
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; type: ToastType; message: string; action?: { label: string; onClick: () => void } }

const ToastContext = createContext<{ toast: (type: ToastType, message: string, action?: { label: string; onClick: () => void }) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string, action?: { label: string; onClick: () => void }) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message, action }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 lg:bottom-6 right-4 left-4 lg:left-auto z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="glass-strong rounded-xl p-3.5 flex items-center gap-3 animate-slide-up pointer-events-auto max-w-md mx-auto lg:mx-0 lg:ml-auto"
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-accent-emerald shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.3))' }} />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-accent-rose shrink-0" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-accent-cyan shrink-0" />}
            <p className="text-sm text-nova-text flex-1">{t.message}</p>
            {t.action && (
              <button onClick={() => { t.action!.onClick(); dismiss(t.id); }} className="text-xs font-medium text-accent-cyan hover:text-accent-cyan/80 shrink-0 transition-colors">
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismiss(t.id)} className="p-0.5 rounded hover:bg-nova-surface shrink-0 transition-colors" aria-label="Dismiss">
              <X className="w-4 h-4 text-nova-muted" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: () => {} };
  return ctx;
}

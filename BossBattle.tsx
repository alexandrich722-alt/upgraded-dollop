// NOVA Life OS — Easter Eggs Module
// Konami Code, Ghost Mode, Time Capsule, 365-day celebration

import { useEffect, useState } from 'react';
import { useStore } from './store';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

export function useKonamiCode(onActivate: () => void) {
  useEffect(() => {
    let keys: string[] = [];
    const handler = (e: KeyboardEvent) => {
      keys = [...keys, e.key].slice(-KONAMI.length);
      if (keys.join(',') === KONAMI.join(',')) {
        onActivate();
        keys = [];
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onActivate]);
}

export function useGhostMode(): boolean {
  const [isGhost, setIsGhost] = useState(false);
  useEffect(() => {
    const hour = new Date().getHours();
    setIsGhost(hour >= 2 && hour < 5);
  }, []);
  return isGhost;
}

export function use365Celebration(): boolean {
  const { state } = useStore();
  return state.profile.longestStreak >= 365 || state.profile.currentStreak >= 365;
}

export function useTimeCapsuleCheck() {
  const { state, revealTimeCapsule } = useStore();
  const [revealed, setRevealed] = useState<{ id: string; message: string; createdAt: string } | null>(null);

  useEffect(() => {
    const due = (state.timeCapsules || []).find(tc => !tc.revealed && new Date(tc.revealAt) <= new Date());
    if (due) {
      revealTimeCapsule(due.id);
      setRevealed({ id: due.id, message: due.message, createdAt: due.createdAt });
    }
  }, [state.timeCapsules, revealTimeCapsule]);

  return { revealed, dismiss: () => setRevealed(null) };
}

// Ghost mode messages (shown 2-5am)
export const GHOST_MESSAGES = [
  "You're up at {time}. Everything okay? NOVA is here.",
  "The world is quiet at {time}. What's keeping you awake?",
  "Late night operator detected. NOVA sees you, {name}.",
  "It's {time}. The best ideas come in the dark. Write it down.",
  "Even at {time}, NOVA has your back. What do you need?",
  "Night owl mode activated, {name}. The world sleeps while you operate.",
];

export function getGhostMessage(name: string): string {
  const hour = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  const msg = GHOST_MESSAGES[Math.floor(Math.random() * GHOST_MESSAGES.length)];
  return msg.replace('{time}', hour).replace('{name}', name);
}

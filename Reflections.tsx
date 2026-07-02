// NOVA Life OS — Navigation Configuration v3

import {
  Zap, LayoutDashboard, Bot, Mic, Target, FolderKanban, CheckSquare,
  Repeat, Wallet, BookOpen, Share2, GitBranch, TreePine, Swords,
  Skull, Users, Store, Package, Settings, ShieldCheck, Trophy,
  Brain, Clock, type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group: 'main' | 'manage' | 'growth' | 'system';
  lazy?: boolean;
}

export const navItems: NavItem[] = [
  // Command Center
  { id: 'today', label: 'Today Mission', icon: Zap, group: 'main' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'ai', label: 'AI Chief of Staff', icon: Bot, group: 'main' },
  { id: 'voice', label: 'Voice Capture', icon: Mic, group: 'main' },

  // Life Management
  { id: 'goals', label: 'Goals', icon: Target, group: 'manage' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, group: 'manage' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, group: 'manage' },
  { id: 'habits', label: 'Habits', icon: Repeat, group: 'manage' },
  { id: 'finance', label: 'Finance', icon: Wallet, group: 'manage', lazy: true },
  { id: 'reflections', label: 'Reflections', icon: BookOpen, group: 'manage', lazy: true },
  { id: 'social', label: 'Relationships', icon: Users, group: 'manage' },

  // Growth & RPG
  { id: 'life-graph', label: 'Life Graph', icon: GitBranch, group: 'growth', lazy: true },
  { id: 'skills', label: 'Skill Tree', icon: TreePine, group: 'growth' },
  { id: 'quests', label: 'RPG Quests', icon: Swords, group: 'growth' },
  { id: 'bosses', label: 'Boss Battle', icon: Skull, group: 'growth', lazy: true },
  { id: 'mentors', label: 'Shadow Mentors', icon: Users, group: 'growth' },
  { id: 'achievements', label: 'Hall of Fame', icon: Trophy, group: 'growth', lazy: true },

  // Hidden / Easter egg screens (accessible via nav search or direct link)
  { id: 'nova-knows', label: 'NOVA Knows You', icon: Brain, group: 'growth', lazy: true },
  { id: 'time-capsule', label: 'Time Capsules', icon: Clock, group: 'growth', lazy: true },

  // System
  { id: 'marketplace', label: 'Marketplace', icon: Store, group: 'system', lazy: true },
  { id: 'installed', label: 'Installed Systems', icon: Package, group: 'system' },
  { id: 'protocols', label: 'Life Protocols', icon: Share2, group: 'system' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'system' },
  { id: 'privacy', label: 'Privacy Vault', icon: ShieldCheck, group: 'system' },
];

export const navGroups: { id: string; label: string }[] = [
  { id: 'main', label: 'Command Center' },
  { id: 'manage', label: 'Life Management' },
  { id: 'growth', label: 'Growth & RPG' },
  { id: 'system', label: 'System' },
];

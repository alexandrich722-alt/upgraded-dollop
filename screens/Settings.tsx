import { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Globe, Lock, Bell, Palette, Download, Upload, Trash2, RotateCcw, Info } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge } from '../components/ui';

export default function Settings() {
  const { state, updateSettings, updateProfile, exportData, importData, resetDemoData, clearUserData } = useStore();
  const { toast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-life-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Data exported successfully');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        importData(data);
        toast('success', 'Data imported successfully');
      } catch {
        toast('error', 'Failed to import data. Invalid file format.');
      }
    };
    input.click();
  };

  const handleReset = () => {
    resetDemoData();
    toast('success', 'Demo data restored');
    setShowResetConfirm(false);
  };

  const handleClear = () => {
    clearUserData();
    toast('success', 'All data cleared');
    setShowClearConfirm(false);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <SectionHeader
        title="Settings"
        subtitle="Configure your NOVA Life OS experience"
        action={<Badge color="cyan">v1.0</Badge>}
      />

      {/* Profile Section */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center border border-accent-cyan/15">
            <Info className="w-5 h-5 text-accent-cyan" />
          </div>
          <div>
            <h3 className="font-semibold text-nova-text">Profile</h3>
            <p className="text-sm text-nova-muted">Your operator identity</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={state.profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="label">Role</label>
            <input
              className="input"
              value={state.profile.role}
              onChange={(e) => updateProfile({ role: e.target.value })}
              placeholder="e.g. Founder, Student, Creator"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-nova-dim">
          <span>Level {state.profile.level}</span>
          <span>•</span>
          <span>{state.profile.totalXpEarned} XP earned</span>
          <span>•</span>
          <span>{state.profile.currentStreak} day streak</span>
        </div>
      </Card>

      {/* Appearance Section */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-violet/10 flex items-center justify-center border border-accent-violet/15">
            <Palette className="w-5 h-5 text-accent-violet" />
          </div>
          <div>
            <h3 className="font-semibold text-nova-text">Appearance</h3>
            <p className="text-sm text-nova-muted">Theme and colors</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Theme</label>
            <select
              className="input"
              value={state.settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as 'dark' | 'light' })}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div>
            <label className="label">Accent Color</label>
            <select
              className="input"
              value={state.settings.accentColor}
              onChange={(e) => updateSettings({ accentColor: e.target.value })}
            >
              <option value="cyan">Cyan</option>
              <option value="violet">Violet</option>
              <option value="emerald">Emerald</option>
              <option value="gold">Gold</option>
              <option value="rose">Rose</option>
              <option value="blue">Blue</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Preferences Section */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 flex items-center justify-center border border-accent-emerald/15">
            <Globe className="w-5 h-5 text-accent-emerald" />
          </div>
          <div>
            <h3 className="font-semibold text-nova-text">Preferences</h3>
            <p className="text-sm text-nova-muted">Regional and behavior settings</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Language</label>
            <select
              className="input"
              value={state.settings.language}
              onChange={(e) => updateSettings({ language: e.target.value })}
            >
              <option value="en">English</option>
              <option value="ru">Russian</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
            </select>
          </div>
          <div>
            <label className="label">Week Starts On</label>
            <select
              className="input"
              value={state.settings.weekStartsOn}
              onChange={(e) => updateSettings({ weekStartsOn: Number(e.target.value) as 0 | 1 | 6 })}
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Daily Review Time</label>
          <input
            type="time"
            className="input"
            value={state.settings.dailyReviewTime}
            onChange={(e) => updateSettings({ dailyReviewTime: e.target.value })}
          />
        </div>
      </Card>

      {/* Data Management Section */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center border border-accent-gold/15">
            <Download className="w-5 h-5 text-accent-gold" />
          </div>
          <div>
            <h3 className="font-semibold text-nova-text">Data Management</h3>
            <p className="text-sm text-nova-muted">Backup, restore, and manage your data</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} className="btn btn-ghost">
            <Download className="w-4 h-4" /> Export Data
          </button>
          <button onClick={handleImport} className="btn btn-ghost">
            <Upload className="w-4 h-4" /> Import Data
          </button>
          <button onClick={() => setShowResetConfirm(true)} className="btn btn-ghost">
            <RotateCcw className="w-4 h-4" /> Reset to Demo
          </button>
          <button onClick={() => setShowClearConfirm(true)} className="btn btn-danger">
            <Trash2 className="w-4 h-4" /> Clear All Data
          </button>
        </div>
      </Card>

      {/* About Section */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-nova-surface flex items-center justify-center border border-nova-border">
            <SettingsIcon className="w-5 h-5 text-nova-dim" />
          </div>
          <div>
            <h3 className="font-semibold text-nova-text">About NOVA Life OS</h3>
            <p className="text-sm text-nova-muted">Version and credits</p>
          </div>
        </div>
        <div className="text-sm text-nova-dim space-y-2">
          <p>NOVA Life OS v1.0 — Your personal AI Chief of Staff for life.</p>
          <p>Built with React, TypeScript, and Tailwind CSS.</p>
          <p className="text-xs text-nova-muted mt-4">All data is stored locally in your browser.</p>
        </div>
      </Card>

      {/* Confirmation Modals */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowResetConfirm(false)} />
          <div className="relative glass-strong rounded-2xl p-6 max-w-sm animate-slide-up">
            <h3 className="font-semibold text-nova-text mb-2">Reset to Demo Data?</h3>
            <p className="text-sm text-nova-dim mb-4">This will replace your current data with demo data. This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowResetConfirm(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleReset} className="btn btn-primary">Reset</button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowClearConfirm(false)} />
          <div className="relative glass-strong rounded-2xl p-6 max-w-sm animate-slide-up">
            <h3 className="font-semibold text-nova-text mb-2">Clear All Data?</h3>
            <p className="text-sm text-nova-dim mb-4">This will permanently delete all your data. This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowClearConfirm(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleClear} className="btn btn-danger">Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

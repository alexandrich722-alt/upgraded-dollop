import { useState } from 'react';
import { Download, Upload, RefreshCw, Trash2, Palette, Globe, Bot, Check } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, Modal, ConfirmDialog } from '../components/ui';

const accentColors: { id: string; label: string; hex: string }[] = [
  { id: 'cyan', label: 'Cyan', hex: '#22d3ee' },
  { id: 'violet', label: 'Violet', hex: '#a78bfa' },
  { id: 'emerald', label: 'Emerald', hex: '#34d399' },
  { id: 'gold', label: 'Gold', hex: '#fbbf24' },
  { id: 'rose', label: 'Rose', hex: '#fb7185' },
  { id: 'blue', label: 'Blue', hex: '#60a5fa' },
];

export default function Settings() {
  const { state, updateSettings, updateProfile, exportData, importData, resetDemoData, clearUserData } = useStore();
  const { toast } = useToast();
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<'success' | 'error' | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [name, setName] = useState(state.profile.name);
  const [role, setRole] = useState(state.profile.role);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-life-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
    toast('success', 'Data exported successfully');
  };

  const handleImport = () => {
    const ok = importData(importText);
    setImportResult(ok ? 'success' : 'error');
    if (ok) { toast('success', 'Data imported successfully'); setTimeout(() => { setShowImport(false); setImportText(''); setImportResult(null); }, 1500); }
    else toast('error', 'Import failed — invalid JSON');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(reader.result as string);
    reader.readAsText(file);
  };

  const saveProfile = () => { updateProfile({ name, role }); toast('success', 'Profile saved'); };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in">
      <SectionHeader title="Settings" subtitle="Configure your NOVA Life OS" />

      <div className="space-y-4">
        {/* Profile */}
        <Card className="p-5">
          <h3 className="section-title text-sm mb-3">Profile</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label className="label">Role</label><input className="input" value={role} onChange={e => setRole(e.target.value)} /></div>
          </div>
          <button onClick={saveProfile} className="btn-ghost mt-3 text-xs"><Check className="w-3.5 h-3.5" /> Save Profile</button>
        </Card>

        {/* Appearance */}
        <Card className="p-5">
          <h3 className="section-title text-sm mb-3 flex items-center gap-2"><Palette className="w-4 h-4 text-accent-violet" /> Appearance</h3>
          <div>
            <label className="label">Accent Color</label>
            <div className="flex gap-2">
              {accentColors.map(c => (
                <button
                  key={c.id}
                  onClick={() => { updateSettings({ accentColor: c.id }); toast('success', `Accent color: ${c.label}`); }}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${state.settings.accentColor === c.id ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                  style={{ background: c.hex }}
                  aria-label={`Set accent color to ${c.label}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-3">
            <label className="label flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Language</label>
            <select className="input" value={state.settings.language} onChange={e => { updateSettings({ language: e.target.value as any }); toast('info', 'Language preference saved'); }}>
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
            <p className="text-xs text-nova-muted mt-1">Full localization coming soon. UI is in English for now.</p>
          </div>
        </Card>

        {/* AI */}
        <Card className="p-5">
          <h3 className="section-title text-sm mb-3 flex items-center gap-2"><Bot className="w-4 h-4 text-accent-cyan" /> AI Provider</h3>
          <select className="input" value={state.settings.aiProvider} onChange={e => { updateSettings({ aiProvider: e.target.value as any }); toast('info', `AI provider set to ${e.target.value}`); }}>
            <option value="mock">Mock (Demo — no API key needed)</option>
            <option value="gemini">Gemini (requires API key in backend)</option>
            <option value="openai">OpenAI (requires API key in backend)</option>
          </select>
          <p className="text-xs text-nova-muted mt-2">API keys are stored in environment variables on the server, never on the frontend.</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge color={state.settings.aiProvider === 'mock' ? 'gold' : 'emerald'}>
              {state.settings.aiProvider === 'mock' ? 'Demo Mode Active' : 'API Mode (requires backend)'}
            </Badge>
          </div>
        </Card>

        {/* Data */}
        <Card className="p-5">
          <h3 className="section-title text-sm mb-3">Data Management</h3>
          <div className="space-y-2">
            <button onClick={() => setShowExport(true)} className="btn-ghost w-full justify-start"><Download className="w-4 h-4" /> Export Data (JSON)</button>
            <button onClick={() => setShowImport(true)} className="btn-ghost w-full justify-start"><Upload className="w-4 h-4" /> Import Data (JSON)</button>
            <button onClick={() => setShowResetConfirm(true)} className="btn-ghost w-full justify-start"><RefreshCw className="w-4 h-4" /> Reset to Demo Data</button>
            <button onClick={() => setShowClearConfirm(true)} className="btn-danger w-full justify-start"><Trash2 className="w-4 h-4" /> Clear All User Data</button>
          </div>
        </Card>

        {/* About */}
        <Card className="p-5">
          <h3 className="section-title text-sm mb-3">About</h3>
          <div className="space-y-1 text-sm text-nova-dim">
            <p>NOVA Life OS v1.0</p>
            <p>Stop managing apps. Start operating your life.</p>
            <p className="text-xs text-nova-muted mt-2">Local-first. Your data stays in your browser. No account required for MVP.</p>
          </div>
        </Card>
      </div>

      {/* Export modal */}
      <Modal open={showExport} onClose={() => setShowExport(false)} title="Export Data" maxWidth="max-w-sm">
        <p className="text-sm text-nova-dim mb-4">Download a complete backup of your NOVA Life OS data as a JSON file.</p>
        <button onClick={handleExport} className="btn-primary w-full"><Download className="w-4 h-4" /> Download Backup</button>
      </Modal>

      {/* Import modal */}
      <Modal open={showImport} onClose={() => setShowImport(false)} title="Import Data" maxWidth="max-w-lg">
        <div className="space-y-3">
          <p className="text-sm text-nova-dim">Paste JSON data or upload a file. This will replace all current data.</p>
          <input type="file" accept=".json" onChange={handleFileImport} className="input" />
          <textarea className="input min-h-[120px] resize-none font-mono text-xs" placeholder="Paste JSON here..." value={importText} onChange={e => setImportText(e.target.value)} />
          {importResult === 'success' && <p className="text-sm text-accent-emerald flex items-center gap-1"><Check className="w-4 h-4" /> Import successful!</p>}
          {importResult === 'error' && <p className="text-sm text-accent-rose">Invalid JSON. Please check your data.</p>}
          <button onClick={handleImport} disabled={!importText.trim()} className="btn-primary w-full"><Upload className="w-4 h-4" /> Import</button>
        </div>
      </Modal>

      <ConfirmDialog open={showResetConfirm} onClose={() => setShowResetConfirm(false)} onConfirm={() => { resetDemoData(); toast('success', 'Demo data restored'); }} title="Reset to Demo Data" message="This will replace all your data with the demo dataset. Continue?" />
      <ConfirmDialog open={showClearConfirm} onClose={() => setShowClearConfirm(false)} onConfirm={() => { clearUserData(); toast('info', 'All data cleared'); }} title="Clear All Data" message="This will delete all your data and start fresh. This cannot be undone. Continue?" />
    </div>
  );
}

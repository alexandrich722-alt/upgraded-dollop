import { useState } from 'react';
import { Lock, Shield, Eye, Download, Upload, Trash2, KeyRound, Check } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, Badge, Modal } from '../components/ui';

export default function Privacy() {
  const { state, updateSettings, exportData, importData, clearUserData } = useStore();
  const { toast } = useToast();
  const [pin, setPin] = useState(state.settings.pin || '');
  const [showPin, setShowPin] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [importText, setImportText] = useState('');

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-privacy-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
    toast('success', 'Data exported');
  };

  const handleImport = () => {
    const ok = importData(importText);
    if (ok) { toast('success', 'Data imported'); setShowImport(false); setImportText(''); }
    else toast('error', 'Invalid JSON');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(reader.result as string);
    reader.readAsText(file);
  };

  const savePin = () => {
    updateSettings({ pinEnabled: pin.length >= 4, pin: pin.length >= 4 ? pin : null });
    toast(pin.length >= 4 ? 'success' : 'info', pin.length >= 4 ? 'PIN enabled' : 'PIN must be at least 4 digits');
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in">
      <SectionHeader title="Privacy Vault" subtitle="Your data, your control" />

      <div className="space-y-4">
        {/* PIN Lock */}
        <Card className="p-5">
          <h3 className="section-title text-sm mb-3 flex items-center gap-2"><Lock className="w-4 h-4 text-accent-gold" /> PIN Lock</h3>
          <p className="text-xs text-nova-dim mb-4">Set a PIN to require authentication when opening NOVA. The PIN is stored locally and restricts access to this browser only.</p>
          <div className="flex gap-2">
            <input type={showPin ? 'text' : 'password'} className="input flex-1" placeholder="Enter 4-8 digit PIN" value={pin} onChange={e => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))} maxLength={8} aria-label="PIN" />
            <button onClick={() => setShowPin(!showPin)} className="btn-ghost" aria-label="Toggle PIN visibility">{showPin ? <Eye className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}</button>
            <button onClick={savePin} className="btn-primary"><Check className="w-4 h-4" /> Save</button>
          </div>
          {state.settings.pinEnabled && <div className="mt-2"><Badge color="emerald">PIN Active</Badge></div>}
        </Card>

        {/* Privacy Principles */}
        <Card className="p-5">
          <h3 className="section-title text-sm mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-accent-cyan" /> Privacy Principles</h3>
          <div className="space-y-2">
            {[
              { title: 'Local-first', desc: 'Your data stays in your browser. No cloud sync in this version.' },
              { title: 'No tracking', desc: 'No analytics, no cookies, no third-party scripts.' },
              { title: 'No encryption at rest', desc: 'Data in localStorage is not encrypted. Use PIN for casual privacy only.' },
              { title: 'Full export anytime', desc: 'Download all your data as a JSON file at any time.' },
              { title: 'Full deletion', desc: 'Clear all data permanently with one click.' },
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-1.5 shrink-0" />
                <div><p className="text-sm font-medium text-nova-text">{p.title}</p><p className="text-xs text-nova-muted">{p.desc}</p></div>
              </div>
            ))}
          </div>
        </Card>

        {/* Data Rights */}
        <Card className="p-5">
          <h3 className="section-title text-sm mb-3">Your Data Rights</h3>
          <div className="space-y-2">
            <button onClick={() => setShowExport(true)} className="btn-ghost w-full justify-start"><Download className="w-4 h-4" /> Export All Data</button>
            <button onClick={() => setShowImport(true)} className="btn-ghost w-full justify-start"><Upload className="w-4 h-4" /> Import Data</button>
            <button onClick={() => setShowClear(true)} className="btn-danger w-full justify-start"><Trash2 className="w-4 h-4" /> Delete All Data</button>
          </div>
        </Card>

        {/* Marketplace Permissions */}
        {state.marketplaceInstalls.length > 0 && (
          <Card className="p-5">
            <h3 className="section-title text-sm mb-3">Marketplace Permissions</h3>
            <div className="space-y-2">
              {state.marketplaceInstalls.map(install => (
                <div key={install.id} className="flex items-center justify-between p-2 rounded-lg bg-nova-surface">
                  <span className="text-sm text-nova-text">{install.productTitle}</span>
                  <Badge color={install.mode === 'full' ? 'rose' : install.mode === 'sandbox' ? 'muted' : 'cyan'}>{install.mode}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <Modal open={showExport} onClose={() => setShowExport(false)} title="Export All Data" maxWidth="max-w-sm">
        <p className="text-sm text-nova-dim mb-4">Download a complete backup of your NOVA Life OS data.</p>
        <button onClick={handleExport} className="btn-primary w-full"><Download className="w-4 h-4" /> Download</button>
      </Modal>

      <Modal open={showImport} onClose={() => setShowImport(false)} title="Import Data" maxWidth="max-w-lg">
        <div className="space-y-3">
          <input type="file" accept=".json" onChange={handleFileImport} className="input" />
          <textarea className="input min-h-[100px] resize-none font-mono text-xs" placeholder="Or paste JSON here..." value={importText} onChange={e => setImportText(e.target.value)} />
          <button onClick={handleImport} disabled={!importText.trim()} className="btn-primary w-full"><Upload className="w-4 h-4" /> Import</button>
        </div>
      </Modal>

      <Modal open={showClear} onClose={() => setShowClear(false)} title="Delete All Data" maxWidth="max-w-sm">
        <p className="text-sm text-accent-rose mb-4">This will permanently delete all your data. This cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={() => setShowClear(false)} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => { clearUserData(); setShowClear(false); toast('info', 'All data deleted'); }} className="btn-danger flex-1"><Trash2 className="w-4 h-4" /> Delete</button>
        </div>
      </Modal>
    </div>
  );
}

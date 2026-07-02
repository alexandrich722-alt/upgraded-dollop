import { Package, Trash2, Clock, Users, Target } from 'lucide-react';
import { useStore } from '../store';
import { Card, SectionHeader, Badge, ProgressBar, EmptyState, ConfirmDialog } from '../components/ui';
import { useState } from 'react';

export default function Installed() {
  const { state, uninstallProduct } = useStore();
  const [uninstallId, setUninstallId] = useState<string | null>(null);

  const installs = state.marketplaceInstalls;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <SectionHeader title="Installed Systems" subtitle={`${installs.length} systems installed`} />

      {installs.length === 0 ? (
        <EmptyState icon={<Package className="w-8 h-8" />} title="No systems installed" description="Visit the Marketplace to install life systems" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {installs.map(inst => {
            const activeQuests = state.quests.filter(q => inst.activeQuests.includes(q.id));
            const mentors = state.mentors.filter(m => inst.connectedMentors.includes(m.id));
            return (
              <Card key={inst.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-accent-cyan" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-nova-text">{inst.productTitle}</h3>
                      <p className="text-xs text-nova-muted">Installed {new Date(inst.installedAt).toLocaleDateString()} · {inst.mode}</p>
                    </div>
                  </div>
                  <button onClick={() => setUninstallId(inst.id)} className="p-1.5 rounded-lg hover:bg-nova-surface"><Trash2 className="w-4 h-4 text-nova-muted hover:text-accent-rose" /></button>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span className="text-nova-muted">Progress</span><span className="text-nova-text">{inst.progress}%</span></div>
                  <ProgressBar value={inst.progress} color="cyan" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-nova-surface">
                    <p className="text-nova-muted flex items-center gap-1 mb-1"><Target className="w-3 h-3" /> Active Quests</p>
                    <p className="text-nova-text font-medium">{activeQuests.length}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-nova-surface">
                    <p className="text-nova-muted flex items-center gap-1 mb-1"><Users className="w-3 h-3" /> Mentors</p>
                    <p className="text-nova-text font-medium">{mentors.length}</p>
                  </div>
                </div>

                {activeQuests.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-nova-muted uppercase tracking-wider">Active Quests</p>
                    {activeQuests.map(q => (
                      <div key={q.id} className="flex items-center justify-between text-xs">
                        <span className="text-nova-dim">{q.title}</span>
                        <Badge color="gold">{q.stages.filter(s => s.done).length}/{q.stages.length}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {inst.nextReview && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-accent-gold">
                    <Clock className="w-3 h-3" /> Next review: {new Date(inst.nextReview).toLocaleDateString()}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog open={!!uninstallId} onClose={() => setUninstallId(null)} onConfirm={() => uninstallId && uninstallProduct(uninstallId)} title="Uninstall System" message="This will remove the system from your installed list. Your data will remain. Continue?" />
    </div>
  );
}

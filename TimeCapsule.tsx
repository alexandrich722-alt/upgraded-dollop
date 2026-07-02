import { useState } from 'react';
import { Store, Search, Check, Package, Sparkles, Shield, ArrowLeft, Download } from 'lucide-react';
import { useStore } from '../store';
import { marketplaceProducts, marketplaceCategories } from '../lib/marketplace';
import { Card, SectionHeader, Badge, Modal, EmptyState } from '../components/ui';
import type { MarketplaceProduct, MarketplaceInstall } from '../types';

const iconMap: Record<string, any> = {
  Rocket: '🚀', GraduationCap: '🎓', DollarSign: '💰', HeartPulse: '💚', Brain: '🧠',
};

export default function Marketplace() {
  const { state, installProduct } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<MarketplaceProduct | null>(null);
  const [installMode, setInstallMode] = useState<MarketplaceInstall['mode']>('full');
  const [showInstall, setShowInstall] = useState(false);
  const [installStep, setInstallStep] = useState(0);
  const [installed, setInstalled] = useState(false);

  const filtered = marketplaceProducts.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && p.category !== category) return false;
    return true;
  });

  const featured = marketplaceProducts.filter(p => p.featured);

  const openProduct = (p: MarketplaceProduct) => { setSelected(p); setInstallStep(0); setInstalled(false); };
  const closeProduct = () => { setSelected(null); setShowInstall(false); setInstallStep(0); setInstalled(false); };

  const startInstall = () => { setShowInstall(true); setInstallStep(0); };

  const nextStep = () => {
    if (installStep < 3) setInstallStep(installStep + 1);
    else {
      installProduct(selected!, installMode);
      setInstalled(true);
    }
  };

  const isInstalled = (productId: string) => state.marketplaceInstalls.some(i => i.productId === productId);

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <SectionHeader title="Marketplace" subtitle="Install complete life systems" />

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nova-muted" />
          <input className="input pl-10" placeholder="Search systems..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        <button onClick={() => setCategory(null)} className={`badge cursor-pointer whitespace-nowrap ${!category ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30' : 'bg-nova-surface text-nova-muted border border-nova-border'}`}>All</button>
        {marketplaceCategories.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`badge cursor-pointer whitespace-nowrap ${category === c ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30' : 'bg-nova-surface text-nova-muted border border-nova-border'}`}>{c}</button>
        ))}
      </div>

      {/* Featured */}
      {!search && !category && (
        <div className="mb-6">
          <h3 className="section-title text-sm mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent-gold" /> Featured Systems</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => openProduct(p)} installed={isInstalled(p.id)} />
            ))}
          </div>
        </div>
      )}

      {/* All products */}
      <h3 className="section-title text-sm mb-3">{search || category ? 'Search Results' : 'All Systems'}</h3>
      {filtered.length === 0 ? (
        <EmptyState icon={<Store className="w-8 h-8" />} title="No systems found" description="Try a different search or category" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} onClick={() => openProduct(p)} installed={isInstalled(p.id)} />)}
        </div>
      )}

      {/* Product detail / install wizard */}
      <Modal open={!!selected} onClose={closeProduct} title={selected?.title || ''} maxWidth="max-w-2xl">
        {selected && (
          <div className="space-y-5">
            {!showInstall ? (
              <>
                {/* Product header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nova-surface to-nova-card flex items-center justify-center text-3xl">{iconMap[selected.icon] || '📦'}</div>
                  <div className="flex-1">
                    <h2 className="font-display text-xl font-bold text-nova-text">{selected.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color="cyan">{selected.category}</Badge>
                      <Badge color="muted">{selected.duration}</Badge>
                      <Badge color="gold">{selected.difficulty}</Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-nova-dim leading-relaxed">{selected.description}</p>

                {/* Permissions */}
                <div className="p-3 rounded-xl bg-accent-rose/5 border border-accent-rose/10">
                  <p className="text-xs text-accent-rose uppercase tracking-wider mb-2 flex items-center gap-1"><Shield className="w-3 h-3" /> This template will have access to:</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.permissions.map(p => <Badge key={p} color="rose">{p}</Badge>)}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <p className="label">What will be installed</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(selected.preview).map(([key, count]) => count > 0 && (
                      <div key={key} className="p-2 rounded-lg bg-nova-surface text-center">
                        <p className="font-display text-lg font-bold text-nova-text">{count}</p>
                        <p className="text-xs text-nova-muted capitalize">{key}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* First mission */}
                <div className="p-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/10">
                  <p className="text-xs text-accent-cyan uppercase tracking-wider mb-2">Your first mission after install:</p>
                  <ol className="space-y-1">
                    {selected.firstMission.map((m, i) => <li key={i} className="text-sm text-nova-text flex gap-2"><span className="text-accent-cyan font-medium">{i + 1}.</span> {m}</li>)}
                  </ol>
                </div>

                <button onClick={startInstall} className="btn-primary w-full py-3 text-base">
                  <Download className="w-5 h-5" /> Install to My Life
                </button>
              </>
            ) : installed ? (
              /* Install complete */
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-accent-emerald/15 flex items-center justify-center">
                  <Check className="w-10 h-10 text-accent-emerald" />
                </div>
                <h2 className="font-display text-xl font-bold text-nova-text mb-2">{selected.title} Installed!</h2>
                <p className="text-sm text-nova-dim mb-6">Your first mission:</p>
                <div className="space-y-2 text-left max-w-sm mx-auto mb-6">
                  {selected.firstMission.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-nova-surface">
                      <span className="w-6 h-6 rounded-full bg-accent-cyan/15 text-accent-cyan text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-sm text-nova-text">{m}</span>
                    </div>
                  ))}
                </div>
                <button onClick={closeProduct} className="btn-primary">Start Mission</button>
              </div>
            ) : (
              /* Install wizard */
              <div className="space-y-5">
                {/* Progress */}
                <div className="flex items-center gap-2">
                  {['Preview', 'Mode', 'Adapt', 'Confirm'].map((step, i) => (
                    <div key={step} className="flex items-center gap-2 flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${i <= installStep ? 'bg-accent-cyan text-nova-bg' : 'bg-nova-surface text-nova-muted'}`}>{i + 1}</div>
                      <span className={`text-xs ${i <= installStep ? 'text-nova-text' : 'text-nova-muted'}`}>{step}</span>
                      {i < 3 && <div className={`flex-1 h-0.5 ${i < installStep ? 'bg-accent-cyan' : 'bg-nova-border'}`} />}
                    </div>
                  ))}
                </div>

                {installStep === 0 && (
                  <div>
                    <h3 className="section-title text-sm mb-3">Preview Installation</h3>
                    <p className="text-sm text-nova-dim mb-4">This will install the following to your life:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selected.preview).map(([key, count]) => count > 0 && (
                        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-nova-surface">
                          <span className="text-sm text-nova-dim capitalize">{key}</span>
                          <Badge color="cyan">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {installStep === 1 && (
                  <div>
                    <h3 className="section-title text-sm mb-3">Select Install Mode</h3>
                    <div className="space-y-2">
                      {[
                        { mode: 'full', label: 'Full Install', desc: 'Everything: goals, projects, tasks, habits, quests, mentors, skills, protocols' },
                        { mode: 'quests', label: 'Only Quests', desc: 'Just the quest packs' },
                        { mode: 'mentors', label: 'Only Mentors', desc: 'Just the mentor packs' },
                        { mode: 'dashboard', label: 'Only Dashboard', desc: 'Goals, projects, and habits only' },
                        { mode: 'sandbox', label: 'Sandbox Preview', desc: 'Preview without affecting your data' },
                      ].map(opt => (
                        <button key={opt.mode} onClick={() => setInstallMode(opt.mode as any)} className={`w-full text-left p-3 rounded-xl border transition-all ${installMode === opt.mode ? 'border-accent-cyan/40 bg-accent-cyan/5' : 'border-nova-border bg-nova-surface hover:border-nova-muted/40'}`}>
                          <p className="text-sm font-medium text-nova-text">{opt.label}</p>
                          <p className="text-xs text-nova-muted mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {installStep === 2 && (
                  <div>
                    <h3 className="section-title text-sm mb-3">AI Adaptation</h3>
                    <p className="text-sm text-nova-dim mb-4">NOVA will adapt this system to your life. Answer a few questions:</p>
                    <div className="space-y-3">
                      {selected.adaptationQuestions.map((q, i) => (
                        <div key={i}>
                          <label className="label">{q}</label>
                          <input className="input" placeholder="Your answer (optional)..." />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-nova-muted mt-3 italic">Demo analysis — AI unavailable. System will install with default settings.</p>
                  </div>
                )}

                {installStep === 3 && (
                  <div>
                    <h3 className="section-title text-sm mb-3">Confirm Installation</h3>
                    <div className="p-4 rounded-xl bg-nova-surface space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-nova-muted">Product</span><span className="text-nova-text">{selected.title}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-nova-muted">Mode</span><span className="text-nova-text capitalize">{installMode}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-nova-muted">Permissions</span><span className="text-nova-text">{selected.permissions.join(', ')}</span></div>
                    </div>
                    <div className="p-3 rounded-xl bg-accent-rose/5 border border-accent-rose/10 mt-3">
                      <p className="text-xs text-accent-rose">By installing, you grant this system access to the listed data. You can uninstall anytime.</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {installStep > 0 && !installed && <button onClick={() => setInstallStep(installStep - 1)} className="btn-ghost flex-1"><ArrowLeft className="w-4 h-4" /> Back</button>}
                  <button onClick={nextStep} className="btn-primary flex-1">
                    {installStep === 3 ? <><Download className="w-4 h-4" /> Install Now</> : 'Continue'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function ProductCard({ product, onClick, installed }: { product: MarketplaceProduct; onClick: () => void; installed: boolean }) {
  const colorClass: Record<string, string> = {
    cyan: 'from-accent-cyan/20 to-accent-cyan/5 border-accent-cyan/20',
    blue: 'from-accent-blue/20 to-accent-blue/5 border-accent-blue/20',
    emerald: 'from-accent-emerald/20 to-accent-emerald/5 border-accent-emerald/20',
    rose: 'from-accent-rose/20 to-accent-rose/5 border-accent-rose/20',
    violet: 'from-accent-violet/20 to-accent-violet/5 border-accent-violet/20',
    gold: 'from-accent-gold/20 to-accent-gold/5 border-accent-gold/20',
  };
  return (
    <Card className={`p-5 card-hover bg-gradient-to-br ${colorClass[product.color] || colorClass.cyan}`} onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-2xl bg-nova-bg/40 flex items-center justify-center text-2xl">{iconMap[product.icon] || '📦'}</div>
        {installed && <Badge color="emerald"><Check className="w-3 h-3" /> Installed</Badge>}
      </div>
      <h3 className="font-display font-semibold text-nova-text mb-1">{product.title}</h3>
      <p className="text-xs text-nova-dim mb-3 line-clamp-2">{product.description}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge color="muted">{product.category}</Badge>
        <Badge color="cyan">{product.duration}</Badge>
      </div>
      <div className="flex items-center gap-1 mt-3 text-xs text-nova-muted">
        <Package className="w-3 h-3" />
        {Object.entries(product.preview).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(' · ')}
      </div>
    </Card>
  );
}

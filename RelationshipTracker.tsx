// NOVA Life OS — Enhanced Relationship Tracker
// Deep relationship management with health scores, interaction tracking, and reminders

import { useState, useMemo } from 'react';
import { Users, Heart, MessageCircle, Calendar, Phone, Mail, Video, Gift, MapPin, Clock, Star, TrendingUp, TrendingDown, TriangleAlert as AlertTriangle, Plus, ChevronRight, CreditCard as Edit3, Trash2, Award, Coffee, Briefcase, Hop as Home, GraduationCap } from 'lucide-react';
import { useStore } from './store';
import { Card, Badge, ProgressBar } from './components/ui';

interface RelationshipCategory {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const CATEGORIES: RelationshipCategory[] = [
  { id: 'family', label: 'Family', icon: Home, color: 'rose' },
  { id: 'partner', label: 'Partner', icon: Heart, color: 'rose' },
  { id: 'close-friends', label: 'Close Friends', icon: Heart, color: 'violet' },
  { id: 'friends', label: 'Friends', icon: Coffee, color: 'cyan' },
  { id: 'professional', label: 'Professional', icon: Briefcase, color: 'blue' },
  { id: 'acquaintances', label: 'Acquaintances', icon: Users, color: 'default' },
];

const INTERACTION_TYPES = [
  { id: 'call', label: 'Phone Call', icon: Phone },
  { id: 'video', label: 'Video Call', icon: Video },
  { id: 'meet', label: 'In Person', icon: MapPin },
  { id: 'message', label: 'Message', icon: MessageCircle },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'gift', label: 'Gift', icon: Gift },
];

const REMINDER_FREQUENCIES = [
  { id: 'daily', label: 'Daily', days: 1 },
  { id: 'weekly', label: 'Weekly', days: 7 },
  { id: 'biweekly', label: 'Every 2 weeks', days: 14 },
  { id: 'monthly', label: 'Monthly', days: 30 },
  { id: 'quarterly', label: 'Quarterly', days: 90 },
];

export default function RelationshipTracker() {
  const { state } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showInteraction, setShowInteraction] = useState<string | null>(null);

  // Local state for relationships (in real app, would use store)
  const [relationships, setRelationships] = useState([
    {
      id: '1',
      name: 'Mom',
      category: 'family',
      importance: 5,
      lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      nextReminder: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      reminderFrequency: 'weekly',
      notes: 'Likes to hear about work',
      birthday: '1965-03-15',
      interactions: [
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'call', notes: 'Talked about vacation plans', quality: 4 },
        { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), type: 'meet', notes: 'Sunday dinner', quality: 5 },
      ],
      tags: ['supportive', 'family-time'],
    },
    {
      id: '2',
      name: 'Alex',
      category: 'close-friends',
      importance: 4,
      lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      nextReminder: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      reminderFrequency: 'biweekly',
      notes: 'Met at startup event',
      interactions: [
        { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), type: 'meet', notes: 'Coffee catch-up', quality: 4 },
      ],
      tags: ['entrepreneur', 'tech'],
    },
    {
      id: '3',
      name: 'Sarah (Manager)',
      category: 'professional',
      importance: 4,
      lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      nextReminder: null,
      reminderFrequency: null,
      notes: 'Weekly 1:1',
      interactions: [
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'video', notes: 'Weekly sync', quality: 3 },
      ],
      tags: ['work', 'manager'],
    },
  ]);

  // Calculate relationship health scores
  const relationshipsWithHealth = useMemo(() => {
    return relationships.map(rel => {
      // Health score based on:
      // 1. Days since last contact vs ideal frequency
      // 2. Quality of recent interactions
      // 3. Consistency of contact

      const daysSinceContact = Math.floor((Date.now() - new Date(rel.lastContact).getTime()) / (24 * 60 * 60 * 1000));
      const reminderDays = REMINDER_FREQUENCIES.find(r => r.id === rel.reminderFrequency)?.days || 30;
      const idealDays = reminderDays * (6 - rel.importance); // More important = more frequent

      // Contact score (0-40)
      const contactScore = Math.max(0, Math.min(40, 40 - (daysSinceContact / idealDays) * 20));

      // Quality score (0-30)
      const recentInteractions = rel.interactions?.slice(0, 5) || [];
      const avgQuality = recentInteractions.length
        ? recentInteractions.reduce((a, i) => a + (i.quality || 3), 0) / recentInteractions.length
        : 3;
      const qualityScore = (avgQuality / 5) * 30;

      // Consistency score (0-30)
      const interactions3mo = rel.interactions?.filter(i =>
        new Date(i.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      ).length || 0;
      const expectedInteractions = 90 / idealDays;
      const consistencyScore = Math.min(30, (interactions3mo / expectedInteractions) * 15);

      const healthScore = Math.round(contactScore + qualityScore + consistencyScore);

      // Status
      let status: 'healthy' | 'attention' | 'critical' = 'healthy';
      if (daysSinceContact > idealDays * 2) status = 'critical';
      else if (daysSinceContact > idealDays) status = 'attention';

      return {
        ...rel,
        healthScore,
        status,
        daysSinceContact,
        avgQuality: Math.round(avgQuality * 10) / 10,
      };
    });
  }, [relationships]);

  // Stats
  const stats = useMemo(() => {
    const healthy = relationshipsWithHealth.filter(r => r.status === 'healthy').length;
    const attention = relationshipsWithHealth.filter(r => r.status === 'attention').length;
    const critical = relationshipsWithHealth.filter(r => r.status === 'critical').length;
    const avgHealth = relationshipsWithHealth.length
      ? Math.round(relationshipsWithHealth.reduce((a, r) => a + r.healthScore, 0) / relationshipsWithHealth.length)
      : 0;

    return { healthy, attention, critical, avgHealth, total: relationships.length };
  }, [relationshipsWithHealth]);

  // Needs attention
  const needsAttention = useMemo(() =>
    relationshipsWithHealth
      .filter(r => r.status !== 'healthy')
      .sort((a, b) => a.healthScore - b.healthScore),
    [relationshipsWithHealth]
  );

  // Get category info
  const getCategory = (categoryId: string) => CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[5];

  // Log interaction
  const logInteraction = (relationshipId: string, type: string, notes: string, quality: number) => {
    setRelationships(prev => prev.map(rel => {
      if (rel.id !== relationshipId) return rel;
      return {
        ...rel,
        lastContact: new Date().toISOString(),
        interactions: [
          { date: new Date().toISOString(), type, notes, quality },
          ...(rel.interactions || []),
        ].slice(0, 20),
      };
    }));
    setShowInteraction(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-nova-text flex items-center gap-3">
            <Users className="w-7 h-7 text-accent-violet" />
            Relationships
          </h1>
          <p className="text-sm text-nova-muted mt-1">Nurture meaningful connections</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Person
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-nova-text">{stats.total}</p>
          <p className="text-xs text-nova-muted">Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-accent-emerald">{stats.healthy}</p>
          <p className="text-xs text-nova-muted">Healthy</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-accent-amber">{stats.attention}</p>
          <p className="text-xs text-nova-muted">Needs Attention</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-nova-text">{stats.avgHealth}%</p>
          <p className="text-xs text-nova-muted">Avg Health</p>
        </Card>
      </div>

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <Card className="p-5 border-l-4 border-l-accent-amber">
          <h3 className="text-sm font-semibold text-nova-text flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-accent-amber" />
            Relationships needing attention
          </h3>
          <div className="space-y-3">
            {needsAttention.slice(0, 3).map(rel => {
              const cat = getCategory(rel.category);
              const CatIcon = cat.icon;
              return (
                <div key={rel.id} className="flex items-center justify-between p-3 rounded-lg bg-nova-surface">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-accent-${cat.color}/15 flex items-center justify-center`}>
                      <CatIcon className={`w-5 h-5 text-accent-${cat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-nova-text">{rel.name}</p>
                      <p className="text-xs text-nova-muted">{rel.daysSinceContact} days since contact</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={rel.healthScore} color={rel.status === 'critical' ? 'rose' : 'amber'} size="sm" className="w-16" />
                    <span className="text-xs text-nova-muted">{rel.healthScore}%</span>
                    <button
                      onClick={() => setShowInteraction(rel.id)}
                      className="btn-ghost text-xs"
                    >
                      Log
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Add Relationship Form */}
      {showForm && (
        <Card className="p-5 animate-slide-up">
          <h3 className="text-lg font-semibold text-nova-text mb-4">Add Person</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input className="input" placeholder="Their name" />
            </div>
            <div>
              <label className="label">Category</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3 rounded-lg text-center transition-all ${
                        selectedCategory === cat.id
                          ? `bg-accent-${cat.color}/15 border-2 border-accent-${cat.color}/50`
                          : 'bg-nova-surface border border-nova-border hover:border-nova-muted'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${selectedCategory === cat.id ? `text-accent-${cat.color}` : 'text-nova-muted'}`} />
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Importance (1-5)</label>
                <input type="range" min="1" max="5" defaultValue="3" className="w-full" />
              </div>
              <div>
                <label className="label">Remind me</label>
                <select className="input">
                  {REMINDER_FREQUENCIES.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => setShowForm(false)} className="btn-primary flex-1">Add Person</button>
            </div>
          </div>
        </Card>
      )}

      {/* Relationship List */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-nova-text">All Relationships</h3>
          <span className="text-sm text-nova-muted">{relationshipsWithHealth.length} people</span>
        </div>

        <div className="space-y-3">
          {relationshipsWithHealth.map(rel => {
            const cat = getCategory(rel.category);
            const CatIcon = cat.icon;
            const showInteractionForm = showInteraction === rel.id;

            return (
              <div key={rel.id} className="rounded-xl border border-nova-border overflow-hidden">
                {/* Main row */}
                <div className="p-4 flex items-center justify-between hover:bg-nova-surface/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-accent-${cat.color}/15 flex items-center justify-center`}>
                      <span className={`text-lg font-semibold text-accent-${cat.color}`}>
                        {rel.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-nova-text">{rel.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge color={cat.color}>{cat.label}</Badge>
                        <span className="text-xs text-nova-muted">{rel.daysSinceContact}d ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Health Score */}
                    <div className="text-right hidden sm:block">
                      <p className={`text-lg font-bold ${
                        rel.status === 'healthy' ? 'text-accent-emerald' :
                        rel.status === 'attention' ? 'text-accent-amber' :
                        'text-accent-rose'
                      }`}>
                        {rel.healthScore}%
                      </p>
                      <p className="text-xs text-nova-muted">health</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowInteraction(showInteractionForm ? null : rel.id)}
                        className="btn-ghost text-xs"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button className="btn-ghost text-xs">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interaction Form */}
                {showInteractionForm && (
                  <div className="p-4 border-t border-nova-border bg-nova-surface/30 animate-slide-up">
                    <p className="text-sm font-medium text-nova-text mb-3">Log Interaction with {rel.name}</p>
                    <div className="space-y-3">
                      <div>
                        <label className="label text-xs">Type</label>
                        <div className="flex gap-2">
                          {INTERACTION_TYPES.slice(0, 4).map(t => {
                            const Icon = t.icon;
                            return (
                              <button key={t.id} className="btn-ghost text-xs px-3">
                                <Icon className="w-4 h-4" /> {t.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="label text-xs">Notes</label>
                        <input className="input" placeholder="What did you talk about?" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setShowInteraction(null)} className="btn-ghost text-xs">Cancel</button>
                        <button
                          onClick={() => logInteraction(rel.id, 'message', 'Quick check-in', 4)}
                          className="btn-primary text-xs"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Network Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-nova-text mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-emerald" />
            Network Strengths
          </h3>
          <div className="space-y-2 text-sm">
            {stats.healthy > stats.total * 0.5 && (
              <p className="text-nova-dim">Strong maintenance of core relationships</p>
            )}
            {relationshipsWithHealth.filter(r => r.importance >= 4 && r.status === 'healthy').length >= 3 && (
              <p className="text-nova-dim">Important relationships are well-nurtured</p>
            )}
            {!needsAttention.length && (
              <p className="text-nova-dim">All relationships are healthy!</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-nova-text mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-accent-gold" />
            Suggestions
          </h3>
          <div className="space-y-2 text-sm">
            {needsAttention.length > 0 && (
              <p className="text-nova-dim">Reach out to {needsAttention[0]?.name} today</p>
            )}
            {relationshipsWithHealth.filter(r => r.category === 'close-friends' && r.status !== 'healthy').length > 0 && (
              <p className="text-nova-dim">Schedule quality time with close friends this week</p>
            )}
            {relationshipsWithHealth.filter(r => r.category === 'family').length === 0 && (
              <p className="text-nova-dim">Consider adding family contacts for holistic tracking</p>
            )}
          </div>
        </Card>
      </div>

      {/* Relationship Tips */}
      <Card className="p-4 bg-accent-violet/5 border-accent-violet/20">
        <p className="text-sm text-nova-text">
          <span className="font-medium">Remember:</span> Quality over quantity. A few deep relationships are worth more than many superficial ones. Focus on the people who matter most to you.
        </p>
      </Card>
    </div>
  );
}

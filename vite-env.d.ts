import { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, Target, DollarSign } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { Card, SectionHeader, ProgressBar, Modal, EmptyState, ConfirmDialog } from '../components/ui';
import type { FinanceTransaction, Debt, SavingsGoal, Subscription } from '../types';

type Tab = 'overview' | 'transactions' | 'subscriptions' | 'savings' | 'debts';

export default function Finance() {
  const { state, addTransaction, deleteTransaction, addDebt, addSavingsGoal, addSubscription, updateSettings } = useStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [showTxForm, setShowTxForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);
  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  const [txForm, setTxForm] = useState<Partial<FinanceTransaction>>({ type: 'expense', amount: 0, category: '', description: '', date: new Date().toISOString() });
  const [budget, setBudget] = useState(state.finance.monthlyBudget);
  const [subForm, setSubForm] = useState<Partial<Subscription>>({ name: '', amount: 0, frequency: 'monthly' });
  const [savingsForm, setSavingsForm] = useState<Partial<SavingsGoal>>({ title: '', target: 1000, current: 0 });
  const [debtForm, setDebtForm] = useState<Partial<Debt>>({ name: '', amount: 0, remaining: 0, interestRate: 0, minPayment: 0 });

  const transactions = state.finance.transactions;
  const monthStr = new Date().toISOString().slice(0, 7);
  const monthTx = transactions.filter(t => t.date.startsWith(monthStr));
  const income = monthTx.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const balance = income - expenses;

  // Spending by category
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    monthTx.filter(t => t.type === 'expense').forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [monthTx]);

  // 6-month spending trend
  const trendData = useMemo(() => {
    const months: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.toISOString().slice(0, 7);
      const spent = transactions.filter(t => t.type === 'expense' && t.date.startsWith(m)).reduce((a, t) => a + t.amount, 0);
      months.push({ label: d.toLocaleDateString('en', { month: 'short' }), value: spent });
    }
    return months;
  }, [transactions]);
  const maxTrend = Math.max(...trendData.map(d => d.value), 1);

  const saveTx = () => {
    if (!txForm.amount || txForm.amount <= 0) { toast('error', 'Enter an amount'); return; }
    addTransaction({ ...txForm, date: txForm.date || new Date().toISOString() });
    toast('success', 'Transaction added');
    setShowTxForm(false);
    setTxForm({ type: 'expense', amount: 0, category: '', description: '', date: new Date().toISOString() });
  };

  const saveSub = () => { if (!subForm.name?.trim()) return; addSubscription(subForm); toast('success', 'Subscription added'); setShowSubForm(false); setSubForm({ name: '', amount: 0, frequency: 'monthly' }); };
  const saveSavings = () => { if (!savingsForm.title?.trim()) return; addSavingsGoal(savingsForm); toast('success', 'Savings goal added'); setShowSavingsForm(false); setSavingsForm({ title: '', target: 1000, current: 0 }); };
  const saveDebt = () => { if (!debtForm.name?.trim()) return; addDebt(debtForm); toast('success', 'Debt added'); setShowDebtForm(false); setDebtForm({ name: '', amount: 0, remaining: 0, interestRate: 0, minPayment: 0 }); };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' }, { id: 'transactions', label: 'Transactions' },
    { id: 'subscriptions', label: 'Subscriptions' }, { id: 'savings', label: 'Savings' }, { id: 'debts', label: 'Debts' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      <SectionHeader title="Finance Lite" subtitle="Track spending, subscriptions, and savings" action={<button onClick={() => setShowTxForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Transaction</button>} />

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`badge cursor-pointer whitespace-nowrap transition-all ${tab === t.id ? 'bg-accent-cyan/12 text-accent-cyan border border-accent-cyan/20' : 'bg-nova-surface text-nova-muted border border-nova-border'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 gradient-mesh-emerald"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-accent-emerald" /><p className="text-xs text-nova-muted uppercase tracking-wider">Income</p></div><p className="font-display text-2xl font-bold text-nova-text">${income.toFixed(0)}</p></Card>
            <Card className="p-4 gradient-mesh-rose"><div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-accent-rose" /><p className="text-xs text-nova-muted uppercase tracking-wider">Expenses</p></div><p className="font-display text-2xl font-bold text-nova-text">${expenses.toFixed(0)}</p></Card>
            <Card className="p-4 gradient-mesh"><div className="flex items-center gap-2 mb-2"><Wallet className="w-4 h-4 text-accent-cyan" /><p className="text-xs text-nova-muted uppercase tracking-wider">Balance</p></div><p className={`font-display text-2xl font-bold ${balance >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>${balance.toFixed(0)}</p></Card>
            <Card className="p-4 gradient-mesh-gold"><div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-accent-gold" /><p className="text-xs text-nova-muted uppercase tracking-wider">Budget</p></div><p className="font-display text-2xl font-bold text-nova-text">${state.finance.monthlyBudget}</p><button onClick={() => setShowBudgetForm(true)} className="text-xs text-accent-cyan hover:text-accent-cyan/80 mt-1">Edit budget</button></Card>
          </div>

          {/* Budget progress */}
          <Card className="p-5">
            <div className="flex justify-between text-sm mb-2"><span className="text-nova-dim">Monthly Budget</span><span className="text-nova-text font-medium">${expenses.toFixed(0)} / ${state.finance.monthlyBudget}</span></div>
            <ProgressBar value={state.finance.monthlyBudget > 0 ? Math.min(100, (expenses / state.finance.monthlyBudget) * 100) : 0} color={expenses > state.finance.monthlyBudget ? 'rose' : 'emerald'} />
            {expenses > state.finance.monthlyBudget && <p className="text-xs text-accent-rose mt-2">Over budget by ${(expenses - state.finance.monthlyBudget).toFixed(0)}</p>}
          </Card>

          {/* Spending trend chart */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-accent-cyan" /><h3 className="section-title text-sm">6-Month Spending Trend</h3></div>
            <div className="flex items-end justify-between gap-2 h-32">
              {trendData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-nova-muted">${d.value.toFixed(0)}</span>
                  <div className="w-full bg-gradient-to-t from-accent-cyan/30 to-accent-cyan rounded-t-md transition-all duration-700" style={{ height: `${(d.value / maxTrend) * 100}%`, minHeight: '4px', boxShadow: '0 0 8px rgba(34,211,238,0.15)' }} />
                  <span className="text-[10px] text-nova-muted">{d.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Category breakdown */}
          {categoryData.length > 0 && (
            <Card className="p-5">
              <h3 className="section-title text-sm mb-3">Spending by Category</h3>
              <div className="space-y-2">
                {categoryData.map(([cat, amount]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs text-nova-dim w-24 truncate">{cat}</span>
                    <div className="flex-1"><ProgressBar value={(amount / expenses) * 100} color="cyan" size="sm" /></div>
                    <span className="text-xs text-nova-text font-medium w-16 text-right">${amount.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'transactions' && (
        <div className="space-y-2">
          {transactions.length === 0 ? <EmptyState icon={<Wallet className="w-8 h-8" />} title="No transactions" description="Add your first transaction" /> : transactions.slice(0, 50).map(t => (
            <Card key={t.id} className="p-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-accent-emerald/12 text-accent-emerald' : 'bg-accent-rose/12 text-accent-rose'}`}>
                {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-nova-text truncate">{t.description || t.category}</p>
                <p className="text-xs text-nova-muted">{t.category} · {new Date(t.date).toLocaleDateString()}</p>
              </div>
              <span className={`text-sm font-medium ${t.type === 'income' ? 'text-accent-emerald' : 'text-nova-text'}`}>{t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}</span>
              <button onClick={() => setDeleteTxId(t.id)} className="p-1 rounded hover:bg-nova-surface" aria-label="Delete transaction"><Trash2 className="w-3.5 h-3.5 text-nova-muted hover:text-accent-rose" /></button>
            </Card>
          ))}
        </div>
      )}

      {tab === 'subscriptions' && (
        <div className="space-y-2">
          <button onClick={() => setShowSubForm(true)} className="btn-ghost w-full"><Plus className="w-4 h-4" /> Add Subscription</button>
          {state.finance.subscriptions.length === 0 ? <EmptyState icon={<CreditCard className="w-8 h-8" />} title="No subscriptions" description="Track recurring payments" /> : state.finance.subscriptions.map(s => (
            <Card key={s.id} className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-violet/12 flex items-center justify-center shrink-0"><CreditCard className="w-4 h-4 text-accent-violet" /></div>
              <div className="flex-1 min-w-0"><p className="text-sm text-nova-text">{s.name}</p><p className="text-xs text-nova-muted">{s.frequency} · next: {new Date(s.nextCharge).toLocaleDateString()}</p></div>
              <span className="text-sm font-medium text-nova-text">${s.amount.toFixed(2)}</span>
            </Card>
          ))}
        </div>
      )}

      {tab === 'savings' && (
        <div className="space-y-2">
          <button onClick={() => setShowSavingsForm(true)} className="btn-ghost w-full"><Plus className="w-4 h-4" /> Add Savings Goal</button>
          {state.finance.savingsGoals.length === 0 ? <EmptyState icon={<PiggyBank className="w-8 h-8" />} title="No savings goals" description="Set a savings target" /> : state.finance.savingsGoals.map(s => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center justify-between mb-2"><p className="text-sm font-medium text-nova-text">{s.title}</p><span className="text-sm text-nova-text">${s.current.toFixed(0)} / ${s.target.toFixed(0)}</span></div>
              <ProgressBar value={(s.current / s.target) * 100} color="emerald" />
              {s.deadline && <p className="text-xs text-nova-muted mt-2">Deadline: {new Date(s.deadline).toLocaleDateString()}</p>}
            </Card>
          ))}
        </div>
      )}

      {tab === 'debts' && (
        <div className="space-y-2">
          <button onClick={() => setShowDebtForm(true)} className="btn-ghost w-full"><Plus className="w-4 h-4" /> Add Debt</button>
          {state.finance.debts.length === 0 ? <EmptyState icon={<DollarSign className="w-8 h-8" />} title="No debts tracked" description="Track loans and credit card debt" /> : state.finance.debts.map(d => (
            <Card key={d.id} className="p-4">
              <div className="flex items-center justify-between mb-2"><p className="text-sm font-medium text-nova-text">{d.name}</p><span className="text-sm text-accent-rose">${d.remaining.toFixed(0)} / ${d.amount.toFixed(0)}</span></div>
              <ProgressBar value={((d.amount - d.remaining) / d.amount) * 100} color="rose" />
              <div className="flex items-center gap-3 mt-2 text-xs text-nova-muted">
                {d.interestRate > 0 && <span>{d.interestRate}% APR</span>}
                {d.minPayment > 0 && <span>Min: ${d.minPayment}/mo</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Forms */}
      <Modal open={showTxForm} onClose={() => setShowTxForm(false)} title="Add Transaction">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setTxForm({ ...txForm, type: 'expense' })} className={`btn ${txForm.type === 'expense' ? 'bg-accent-rose/20 text-accent-rose border border-accent-rose/30' : 'btn-ghost'}`}>Expense</button>
            <button onClick={() => setTxForm({ ...txForm, type: 'income' })} className={`btn ${txForm.type === 'income' ? 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30' : 'btn-ghost'}`}>Income</button>
          </div>
          <div><label className="label">Amount</label><input type="number" step="0.01" className="input" value={txForm.amount || ''} onChange={e => setTxForm({ ...txForm, amount: Number(e.target.value) })} placeholder="0.00" autoFocus /></div>
          <div><label className="label">Category</label><input className="input" value={txForm.category || ''} onChange={e => setTxForm({ ...txForm, category: e.target.value })} placeholder="Food, Rent, Salary..." /></div>
          <div><label className="label">Description</label><input className="input" value={txForm.description || ''} onChange={e => setTxForm({ ...txForm, description: e.target.value })} placeholder="Optional" /></div>
          <div><label className="label">Date</label><input type="date" className="input" value={txForm.date?.split('T')[0] || ''} onChange={e => setTxForm({ ...txForm, date: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString() })} /></div>
          <button onClick={saveTx} className="btn-primary w-full">Add Transaction</button>
        </div>
      </Modal>

      <Modal open={showBudgetForm} onClose={() => setShowBudgetForm(false)} title="Set Monthly Budget" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div><label className="label">Monthly Budget ($)</label><input type="number" className="input" value={budget} onChange={e => setBudget(Number(e.target.value))} autoFocus /></div>
          <button onClick={() => { updateSettings({} as any); setShowBudgetForm(false); toast('success', 'Budget updated'); }} className="btn-primary w-full">Save Budget</button>
        </div>
      </Modal>

      <Modal open={showSubForm} onClose={() => setShowSubForm(false)} title="Add Subscription" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div><label className="label">Name</label><input className="input" value={subForm.name || ''} onChange={e => setSubForm({ ...subForm, name: e.target.value })} placeholder="Netflix, Gym..." autoFocus /></div>
          <div><label className="label">Amount</label><input type="number" step="0.01" className="input" value={subForm.amount || ''} onChange={e => setSubForm({ ...subForm, amount: Number(e.target.value) })} /></div>
          <div><label className="label">Frequency</label><select className="input" value={subForm.frequency || 'monthly'} onChange={e => setSubForm({ ...subForm, frequency: e.target.value as any })}><option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="weekly">Weekly</option></select></div>
          <button onClick={saveSub} className="btn-primary w-full">Add</button>
        </div>
      </Modal>

      <Modal open={showSavingsForm} onClose={() => setShowSavingsForm(false)} title="Add Savings Goal" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={savingsForm.title || ''} onChange={e => setSavingsForm({ ...savingsForm, title: e.target.value })} placeholder="Emergency Fund" autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Target ($)</label><input type="number" className="input" value={savingsForm.target || ''} onChange={e => setSavingsForm({ ...savingsForm, target: Number(e.target.value) })} /></div>
            <div><label className="label">Current ($)</label><input type="number" className="input" value={savingsForm.current || ''} onChange={e => setSavingsForm({ ...savingsForm, current: Number(e.target.value) })} /></div>
          </div>
          <button onClick={saveSavings} className="btn-primary w-full">Add</button>
        </div>
      </Modal>

      <Modal open={showDebtForm} onClose={() => setShowDebtForm(false)} title="Add Debt" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div><label className="label">Name</label><input className="input" value={debtForm.name || ''} onChange={e => setDebtForm({ ...debtForm, name: e.target.value })} placeholder="Credit Card, Student Loan..." autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Total Amount</label><input type="number" className="input" value={debtForm.amount || ''} onChange={e => setDebtForm({ ...debtForm, amount: Number(e.target.value) })} /></div>
            <div><label className="label">Remaining</label><input type="number" className="input" value={debtForm.remaining || ''} onChange={e => setDebtForm({ ...debtForm, remaining: Number(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Interest Rate (%)</label><input type="number" step="0.1" className="input" value={debtForm.interestRate || ''} onChange={e => setDebtForm({ ...debtForm, interestRate: Number(e.target.value) })} /></div>
            <div><label className="label">Min Payment</label><input type="number" className="input" value={debtForm.minPayment || ''} onChange={e => setDebtForm({ ...debtForm, minPayment: Number(e.target.value) })} /></div>
          </div>
          <button onClick={saveDebt} className="btn-primary w-full">Add</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTxId} onClose={() => setDeleteTxId(null)} onConfirm={() => { if (deleteTxId) { deleteTransaction(deleteTxId); toast('info', 'Transaction deleted'); } }} title="Delete Transaction" message="Are you sure?" />
    </div>
  );
}

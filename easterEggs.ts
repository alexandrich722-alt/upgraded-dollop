// NOVA Life OS — Finance Service
// Pure functions for financial calculations

import type { NovaState, FinanceTransaction } from '../types';
import { isThisMonth, sum } from './helpers';

export function getMonthlySummary(state: NovaState) {
  const monthTx = state.finance.transactions.filter(t => isThisMonth(t.date));
  const income = sum(monthTx.filter(t => t.type === 'income').map(t => t.amount));
  const expenses = sum(monthTx.filter(t => t.type === 'expense').map(t => t.amount));
  const balance = income - expenses;
  const budgetUsed = state.finance.monthlyBudget > 0
    ? Math.min(100, (expenses / state.finance.monthlyBudget) * 100)
    : 0;
  const overBudget = expenses > state.finance.monthlyBudget;
  return { income, expenses, balance, budgetUsed, overBudget, monthTx };
}

export function getCategoryBreakdown(transactions: FinanceTransaction[]): { category: string; amount: number }[] {
  const cats: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
  return Object.entries(cats)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function getSpendingTrend(transactions: FinanceTransaction[], months = 6): { label: string; value: number }[] {
  const trend: { label: string; value: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.toISOString().slice(0, 7);
    const spent = sum(
      transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(m))
        .map(t => t.amount)
    );
    trend.push({ label: d.toLocaleDateString('en', { month: 'short' }), value: spent });
  }
  return trend;
}

export function getMonthlySubscriptions(state: NovaState): number {
  return sum(
    state.finance.subscriptions
      .filter(s => s.active)
      .map(s => s.frequency === 'yearly' ? s.amount / 12 : s.amount)
  );
}

export function getTotalDebt(state: NovaState): number {
  return sum(state.finance.debts.map(d => d.remaining));
}

export function getTotalSavings(state: NovaState): number {
  return sum(state.finance.savingsGoals.map(s => s.current));
}

export function getNetWorth(state: NovaState): number {
  return getTotalSavings(state) - getTotalDebt(state);
}

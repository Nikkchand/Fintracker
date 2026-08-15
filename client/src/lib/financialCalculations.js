/**
 * FinTrakr Shared Financial Calculations Library (Frontend)
 * Guarantees consistent budget, net worth, savings, and goal calculations across all UI pages.
 */

export const BUDGET_STATUS_THRESHOLDS = {
  HEALTHY_MAX: 69.99,
  WARNING_MAX: 89.99,
  CRITICAL_MAX: 99.99
};

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function getBudgetStatus(percentage) {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 70) return 'warning';
  return 'healthy';
}

export function getCurrentMonthPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();

  return {
    period_start: `${year}-${month}-01`,
    period_end: `${year}-${month}-${String(lastDay).padStart(2, '0')}`
  };
}

/**
 * Calculates single budget usage deterministically
 */
export function calculateBudgetUsage(budget, transactions = []) {
  const period = getCurrentMonthPeriod();
  const periodStart = budget.period_start || period.period_start;
  const periodEnd = budget.period_end || period.period_end;
  const limit = Number(budget.limit_amount || budget.amount || 0);

  // Filter transactions: type expense, category match, date in period
  const spent = transactions
    .filter(t => {
      if (t.type !== 'expense') return false;
      if (t.category !== budget.category) return false;
      const txDate = (t.transaction_date || t.date || '').slice(0, 10);
      if (!txDate) return false;
      return txDate >= periodStart && txDate <= periodEnd;
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const remaining = limit - spent;
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const status = getBudgetStatus(percentage);

  return {
    id: budget.id,
    category: budget.category,
    limit_amount: limit,
    limit: limit,
    spent: spent,
    remaining: remaining,
    percentage: Math.round(percentage * 100) / 100,
    status: status,
    period_start: periodStart,
    period_end: periodEnd
  };
}

/**
 * Calculates monthly summary metrics from transactions
 */
export function calculateMonthlySummary(transactions = [], period = getCurrentMonthPeriod()) {
  const { period_start, period_end } = period;

  let income = 0;
  let expenses = 0;

  transactions.forEach(t => {
    const txDate = (t.transaction_date || t.date || '').slice(0, 10);
    if (txDate >= period_start && txDate <= period_end) {
      const amount = Number(t.amount || 0);
      if (t.type === 'income') income += amount;
      if (t.type === 'expense') expenses += amount;
    }
  });

  const netSavings = income - expenses;
  const savings = netSavings > 0 ? netSavings : 0;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  return {
    income,
    expenses,
    savings,
    netSavings,
    savingsRate: Math.round(savingsRate * 10) / 10,
    period_start,
    period_end
  };
}

/**
 * Calculates total Net Worth across accounts
 */
export function calculateNetWorth(accounts = []) {
  return accounts.reduce((total, acc) => {
    const balance = Number(acc.balance || 0);
    if (acc.type === 'credit') {
      return total - Math.abs(balance);
    }
    return total + balance;
  }, 0);
}

/**
 * Calculates goal progress metrics
 */
export function calculateGoalProgress(goal) {
  const target = Number(goal.target_amount || goal.targetAmount || 0);
  const current = Number(goal.current_amount || goal.currentAmount || 0);
  const remaining = Math.max(0, target - current);
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return {
    ...goal,
    target_amount: target,
    current_amount: current,
    remaining,
    percentage,
    isCompleted: current >= target
  };
}

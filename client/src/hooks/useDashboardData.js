import { useFinance } from '../context/FinanceContext';

export const useDashboardData = () => {
  const finance = useFinance();

  return {
    transactions: finance.transactions || [],
    goals: finance.goals || [],
    budgets: finance.budgets || [],
    accounts: finance.accounts || [],
    summary: finance.summary || {
      income: 0,
      expenses: 0,
      balance: 0,
      savings: 0,
      savingsRate: 0,
      netWorth: 0
    },
    loading: finance.loading,
    error: finance.error,
    refreshData: finance.refreshData
  };
};

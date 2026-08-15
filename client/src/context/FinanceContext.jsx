import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';
import {
  calculateBudgetUsage,
  calculateMonthlySummary,
  calculateNetWorth,
  calculateGoalProgress
} from '../lib/financialCalculations';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const { user } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recurringRules, setRecurringRules] = useState([]);
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    savings: 0,
    savingsRate: 0,
    balance: 0,
    netWorth: 0
  });
  const [categorySpending, setCategorySpending] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setRecurringRules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data && res.data.success) {
        const { accounts, transactions, budgets, goals, summary, categorySpending } = res.data.data;

        setAccounts(accounts || []);
        setTransactions(transactions || []);
        setBudgets(budgets || []);
        setGoals(goals || []);
        setSummary(summary || { income: 0, expenses: 0, savings: 0, savingsRate: 0, balance: 0, netWorth: 0 });
        setCategorySpending(categorySpending || []);
      }
    } catch (err) {
      console.warn('Failed to fetch dashboard API, falling back to endpoints:', err.message);
      // Fallback endpoint fetch
      try {
        const [accRes, txRes, bRes, gRes, rRes] = await Promise.all([
          api.get('/accounts').catch(() => ({ data: { data: [] } })),
          api.get('/transactions').catch(() => ({ data: { data: [] } })),
          api.get('/budgets').catch(() => ({ data: { data: [] } })),
          api.get('/goals').catch(() => ({ data: { data: [] } })),
          api.get('/recurring').catch(() => ({ data: { data: [] } }))
        ]);

        const accs = accRes.data.data || [];
        const txs = txRes.data.data || [];
        const bdgs = bRes.data.data || [];
        const gls = gRes.data.data || [];
        const recs = rRes.data.data || [];

        setAccounts(accs);
        setTransactions(txs);
        setBudgets(bdgs.map(b => calculateBudgetUsage(b, txs)));
        setGoals(gls.map(g => calculateGoalProgress(g)));
        setRecurringRules(recs);

        const sum = calculateMonthlySummary(txs);
        const nw = calculateNetWorth(accs);
        setSummary({ ...sum, balance: nw, netWorth: nw });
      } catch (innerErr) {
        setError('Failed to fetch financial data from server.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ACCOUNTS MUTATIONS
  const addAccount = async (accountData) => {
    try {
      const res = await api.post('/accounts', accountData);
      if (res.data.success) {
        await fetchDashboardData();
        return res.data.data;
      }
    } catch (err) {
      console.error('Error adding account:', err);
      throw err;
    }
  };

  const updateAccount = async (id, updates) => {
    try {
      const res = await api.patch(`/accounts/${id}`, updates);
      if (res.data.success) {
        await fetchDashboardData();
        return res.data.data;
      }
    } catch (err) {
      console.error('Error updating account:', err);
      throw err;
    }
  };

  const deleteAccount = async (id) => {
    try {
      await api.delete(`/accounts/${id}`);
      if (selectedAccountId === id) setSelectedAccountId('all');
      await fetchDashboardData();
    } catch (err) {
      console.error('Error deleting account:', err);
      throw err;
    }
  };

  // TRANSACTIONS MUTATIONS
  const addTransaction = async (txData) => {
    try {
      const res = await api.post('/transactions', txData);
      if (res.data.success) {
        await fetchDashboardData();
        return res.data.data;
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (id, updates) => {
    try {
      const res = await api.patch(`/transactions/${id}`, updates);
      if (res.data.success) {
        await fetchDashboardData();
        return res.data.data;
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  const addTransfer = async (transferData) => {
    try {
      const res = await api.post('/transactions/transfer', transferData);
      if (res.data.success) {
        await fetchDashboardData();
        return res.data.data;
      }
    } catch (err) {
      console.error('Error executing transfer:', err);
      throw err;
    }
  };

  // BUDGETS MUTATIONS
  const setBudget = async (budgetData) => {
    try {
      const res = await api.post('/budgets', budgetData);
      if (res.data.success) {
        await fetchDashboardData();
        return res.data.data;
      }
    } catch (err) {
      console.error('Error setting budget:', err);
      throw err;
    }
  };

  const deleteBudget = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Error deleting budget:', err);
      throw err;
    }
  };

  // GOALS MUTATIONS
  const addGoal = async (goalData) => {
    try {
      const res = await api.post('/goals', goalData);
      if (res.data.success) {
        await fetchDashboardData();
        return res.data.data;
      }
    } catch (err) {
      console.error('Error adding goal:', err);
      throw err;
    }
  };

  const addGoalContribution = async (goalId, amount, notes) => {
    try {
      const res = await api.post(`/goals/${goalId}/contribute`, { amount, notes });
      if (res.data.success) {
        await fetchDashboardData();
        return res.data.data;
      }
    } catch (err) {
      console.error('Error adding goal contribution:', err);
      throw err;
    }
  };

  const deleteGoal = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Error deleting goal:', err);
      throw err;
    }
  };

  // RECURRING MUTATIONS
  const addRecurring = async (ruleData) => {
    try {
      const res = await api.post('/recurring', ruleData);
      if (res.data.success) {
        await fetchDashboardData();
        return res.data.data;
      }
    } catch (err) {
      console.error('Error adding recurring rule:', err);
      throw err;
    }
  };

  const toggleRecurringStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
      const res = await api.patch(`/recurring/${id}`, { status: nextStatus });
      if (res.data.success) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Error toggling recurring status:', err);
      throw err;
    }
  };

  const deleteRecurring = async (id) => {
    try {
      await api.delete(`/recurring/${id}`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Error deleting recurring rule:', err);
      throw err;
    }
  };

  const autoProcessDueRecurring = async () => {
    try {
      const res = await api.post('/recurring/process-due');
      if (res.data.success) {
        await fetchDashboardData();
        return res.data;
      }
    } catch (err) {
      console.error('Error auto-processing due recurring:', err);
      throw err;
    }
  };

  const value = {
    accounts,
    transactions,
    budgets,
    goals,
    recurringRules,
    summary,
    categorySpending,
    selectedAccountId,
    setSelectedAccountId,
    loading,
    error,
    refreshData: fetchDashboardData,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addTransfer,
    setBudget,
    deleteBudget,
    addGoal,
    addGoalContribution,
    deleteGoal,
    addRecurring,
    toggleRecurringStatus,
    deleteRecurring,
    autoProcessDueRecurring
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

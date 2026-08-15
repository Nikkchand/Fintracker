import { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import SummaryCard from '../components/Dashboard/SummaryCard';
import AddTransactionModal from '../components/Dashboard/AddTransactionModal';
import AIReceiptScannerModal from '../components/AIReceiptScannerModal';
import BudgetAlertBanner from '../components/Budgets/BudgetAlertBanner';
import SpendingChart from '../components/Dashboard/SpendingChart';
import { Plus, Wallet, ArrowUpRight, ArrowDownRight, Target, Camera, Sparkles, Building2 } from 'lucide-react';
import { formatINR } from '../lib/financialCalculations';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const {
    summary,
    loading,
    transactions,
    goals,
    budgets,
    accounts,
    selectedAccountId,
    addTransaction
  } = useFinance();

  const selectedAccountObj = accounts.find(a => a.id === selectedAccountId);

  // FIX: Filter transactions strictly by account ID when selected (remove || t.user_id bug)
  const filteredTransactions = useMemo(() => {
    if (!selectedAccountId || selectedAccountId === 'all') return transactions || [];
    return (transactions || []).filter(t => (t.account_id || t.accountId) === selectedAccountId);
  }, [transactions, selectedAccountId]);

  const { balance: totalBalance, income: monthlyIncome, expenses: monthlyExpenses, netWorth } = summary;
  const displayBalance = selectedAccountObj ? selectedAccountObj.balance : (netWorth || totalBalance);

  const recentTransactions = (filteredTransactions || []).slice(0, 5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // FIX: Replace window.location.reload() with seamless state synchronization
  const handleTransactionAdded = async (newTx) => {
    // FinanceContext automatically refetches and updates all dependent components
  };

  // Prepare chart data
  const { spendingData: chartSpendingData } = useMemo(() => {
    if (!filteredTransactions || !filteredTransactions.length) return { spendingData: [] };

    const spendingByMonth = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.transaction_date || a.date) - new Date(b.transaction_date || b.date));

    sorted.forEach(t => {
      if (t.type === 'expense') {
        const transactionDate = new Date(t.transaction_date || t.date);
        if (transactionDate >= sixMonthsAgo) {
          const monthStr = transactionDate.toLocaleDateString('en-US', { month: 'short' });
          if (!spendingByMonth[monthStr]) spendingByMonth[monthStr] = 0;
          spendingByMonth[monthStr] += Number(t.amount);
        }
      }
    });

    const spendingData = Object.entries(spendingByMonth)
      .map(([name, amount]) => ({ name, amount, type: 'expense' }))
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.name) - months.indexOf(b.name);
      })
      .slice(-6);

    return { spendingData };
  }, [filteredTransactions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Financial Overview
            {selectedAccountObj && (
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900/60 text-primary dark:text-indigo-300 font-bold px-3 py-1 rounded-full">
                {selectedAccountObj.name}
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time intelligence dashboard & categorical performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/20"
          >
            <Camera className="h-4 w-4" />
            <span>Scan Receipt</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Smart Budget Alert Banner - FIX: Pass real budgets and transactions from context */}
      <BudgetAlertBanner budgets={budgets} transactions={filteredTransactions} />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-6 text-white shadow-xl transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider">
                {selectedAccountObj ? selectedAccountObj.name : 'Total Consolidated Net Worth'}
              </p>
              <h2 className="text-3xl font-black mt-1">
                {formatINR(displayBalance)}
              </h2>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-indigo-100 text-xs">
            <span>Across {accounts.length} linked bank accounts & wallets</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Monthly Income</p>
              <h2 className="text-3xl font-black mt-1 text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {formatINR(monthlyIncome)}
              </h2>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
              <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Monthly Expenses</p>
              <h2 className="text-3xl font-black mt-1 text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {formatINR(monthlyExpenses)}
              </h2>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
              <ArrowDownRight className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-80">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Categorical Expense Trend</h3>
          <SpendingChart data={chartSpendingData} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-80 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Savings Goals</h3>
            <Link to="/goals" className="text-sm text-primary hover:text-indigo-700 font-medium">View All</Link>
          </div>

          {(!goals || goals.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Target className="h-8 w-8 mb-2 opacity-50" />
              <p>No goals set yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map(goal => {
                const target = Number(goal.target_amount || goal.targetAmount || 0);
                const current = Number(goal.current_amount || goal.currentAmount || 0);
                const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                return (
                  <div key={goal.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{goal.name}</span>
                      <span className="text-xs font-bold text-primary">{percent}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span>{formatINR(current)}</span>
                      <span>{formatINR(target)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Transactions</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm text-primary hover:text-indigo-700 font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {recentTransactions.length === 0 ? (
            <p className="p-6 text-center text-gray-500 dark:text-gray-400">No transactions yet.</p>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">{
                    tx.category === 'Food' ? '🍔' :
                      tx.category === 'Rent' ? '🏠' :
                        tx.category === 'Travel' ? '✈️' :
                          tx.category === 'Bills' ? '💡' :
                            tx.category === 'Shopping' ? '🛍️' :
                              tx.category === 'Education' ? '🎓' : '📦'
                  }</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{tx.title}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.transaction_date || tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-semibold ${tx.type === 'income' ? 'text-emerald-500' : tx.type === 'transfer' ? 'text-blue-500' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↔ ' : '-'}{formatINR(tx.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTransactionAdded={handleTransactionAdded}
      />

      <AIReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onReceiptScanned={handleTransactionAdded}
      />
    </div>
  );
};

export default Dashboard;

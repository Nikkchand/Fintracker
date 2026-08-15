import { useState } from 'react';
import { RefreshCw, Plus, Pause, Play, Trash2, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../lib/financialCalculations';

const RecurringTransactions = () => {
  const {
    recurringRules,
    accounts,
    addRecurring,
    toggleRecurringStatus,
    deleteRecurring,
    autoProcessDueRecurring
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [lastProcessedMsg, setLastProcessedMsg] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Rent',
    frequency: 'monthly',
    nextDueDate: new Date().toISOString().split('T')[0],
    accountId: accounts[0]?.id || ''
  });

  const handleSaveRecurring = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) return;

    try {
      await addRecurring({
        ...formData,
        amount: Number(formData.amount)
      });
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Rent',
        frequency: 'monthly',
        nextDueDate: new Date().toISOString().split('T')[0],
        accountId: accounts[0]?.id || ''
      });
    } catch (err) {
      console.error('Failed to create recurring rule:', err);
    }
  };

  const handleAutoProcessDue = async () => {
    try {
      const res = await autoProcessDueRecurring();
      setLastProcessedMsg(res?.message || 'Auto-process engine executed successfully.');
      setTimeout(() => setLastProcessedMsg(null), 4000);
    } catch (err) {
      console.error('Auto process failed:', err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <RefreshCw className="h-8 w-8 text-primary" />
            Recurring Payments & Subscriptions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Automate rent, salaries, subscriptions, & bill payments with intelligent scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoProcessDue}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-md transition-all text-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Run Auto-Process Engine</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Recurring Rule</span>
          </button>
        </div>
      </div>

      {lastProcessedMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200 text-sm font-semibold animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>{lastProcessedMsg}</span>
        </div>
      )}

      {/* Subscriptions Grid */}
      {(!recurringRules || recurringRules.length === 0) ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 text-gray-400">
          <RefreshCw className="h-10 w-10 mx-auto mb-2 opacity-40 text-primary" />
          <p className="font-semibold text-gray-600 dark:text-gray-300">No recurring rules configured.</p>
          <p className="text-xs text-gray-400 mt-1">Add automated rules for monthly rent, salaries, or subscriptions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurringRules.map(item => {
            const status = item.status || 'active';
            const isActive = status === 'active';
            const nextDue = item.next_due_date || item.nextDueDate || '';

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border transition-all duration-300 relative flex flex-col justify-between ${
                  isActive ? 'border-gray-200 dark:border-gray-700 hover:shadow-md' : 'border-gray-100 dark:border-gray-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full ${
                      item.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                    }`}>
                      {item.type} • {item.frequency}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleRecurringStatus(item.id, status)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                        }`}
                        title={isActive ? 'Pause Automation' : 'Activate Automation'}
                      >
                        {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteRecurring(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-2xl font-black mt-2 text-gray-900 dark:text-white">
                    {item.type === 'income' ? '+' : '-'}{formatINR(item.amount)}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 mt-6 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Next due: <strong className="text-gray-800 dark:text-gray-200">{nextDue ? new Date(nextDue).toLocaleDateString() : 'N/A'}</strong>
                  </span>
                  <span className={`font-semibold ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for New Recurring Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-primary" />
                Add Recurring Rule
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecurring} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Title / Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broadband Bill or Salary"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">First / Next Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.nextDueDate}
                    onChange={e => setFormData({ ...formData, nextDueDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-indigo-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/25"
                >
                  Save Recurring Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTransactions;

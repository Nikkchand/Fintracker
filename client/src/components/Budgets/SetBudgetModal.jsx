import { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, AlertCircle } from 'lucide-react';

const SetBudgetModal = ({ isOpen, onClose, onBudgetSet }) => {
  const { setBudget } = useFinance();
  const [category, setCategory] = useState({ name: 'Food', icon: '🍔' });
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    { name: 'Food', icon: '🍔' },
    { name: 'Rent', icon: '🏠' },
    { name: 'Travel', icon: '✈️' },
    { name: 'Bills', icon: '💡' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Education', icon: '🎓' },
    { name: 'Other', icon: '📦' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const budgetData = {
        category: category.name,
        limit_amount: Number(amount)  // backend reads limit_amount || limit, not 'amount'
      };

      if (onBudgetSet) {
        await onBudgetSet(budgetData);
      } else {
        await setBudget(budgetData);
      }

      onClose();
      setAmount('');
    } catch (err) {
      console.error('Failed to set budget:', err);
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Failed to set budget. Check backend server.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Set Monthly Budget</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    category.name === cat.name
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-primary text-primary font-bold'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs mt-1">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Limit (₹)</label>
            <input
              type="number"
              required
              min="1"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary p-2.5 transition-colors font-bold text-lg"
              placeholder="e.g. 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/30"
            >
              {loading ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetBudgetModal;

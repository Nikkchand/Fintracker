import { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, Target } from 'lucide-react';
import { formatINR } from '../../lib/financialCalculations';

const AddMoneyModal = ({ isOpen, onClose, goal }) => {
  const { addGoalContribution } = useFinance();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !goal) return null;

  const target = Number(goal.target_amount || goal.targetAmount || 0);
  const current = Number(goal.current_amount || goal.currentAmount || 0);
  const remaining = Math.max(0, target - current);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);

    try {
      await addGoalContribution(goal.id, Number(amount), notes);
      onClose();
      setAmount('');
      setNotes('');
    } catch (err) {
      console.error('Failed to contribute to goal:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Deposit to Goal</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-indigo-50/50 dark:bg-gray-700/50 p-4 rounded-xl space-y-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Target Goal</p>
            <p className="font-bold text-gray-900 dark:text-white text-base">{goal.name}</p>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 pt-1">
              <span>Saved: {formatINR(current)}</span>
              <span>Remaining: {formatINR(remaining)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contribution Amount (₹)</label>
            <input
              type="number"
              required
              min="1"
              max={remaining > 0 ? remaining : undefined}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary p-2.5 transition-colors font-bold text-lg"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Deposit Source (Optional)</label>
            <input
              type="text"
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary p-2.5 transition-colors text-sm"
              placeholder="e.g. Bonus allocation"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/30 text-sm"
            >
              {loading ? 'Depositing...' : 'Confirm Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMoneyModal;

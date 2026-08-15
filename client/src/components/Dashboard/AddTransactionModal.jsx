import { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, AlertCircle } from 'lucide-react';

const AddTransactionModal = ({ isOpen, onClose, onTransactionAdded }) => {
  const { addTransaction, accounts } = useFinance();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState({ name: 'Food', icon: '🍔' });
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    { name: 'Food', icon: '🍔' },
    { name: 'Rent', icon: '🏠' },
    { name: 'Travel', icon: '✈️' },
    { name: 'Bills', icon: '💡' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Education', icon: '🎓' },
    { name: 'Salary', icon: '💰' },
    { name: 'Other', icon: '📦' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const txData = {
        title: title.trim(),
        amount: Number(amount),
        type,
        category: category.name,
        transaction_date: date,
        account_id: accountId || (accounts[0]?.id || null),
        notes
      };

      const newTx = await addTransaction(txData);
      if (onTransactionAdded) onTransactionAdded(newTx);

      onClose();
      setTitle('');
      setAmount('');
      setNotes('');
    } catch (err) {
      console.error('Error adding transaction:', err);
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Failed to add transaction. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden my-auto">
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add New Transaction</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary p-2.5 transition-colors"
              placeholder="e.g. Grocery Shopping"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary p-2.5 transition-colors font-bold text-lg"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary p-2.5 transition-colors font-medium"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
              </select>
            </div>
          </div>

          {accounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account</label>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary p-2.5 transition-colors text-sm"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="">Default Account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type}) - Balance: ₹{Number(acc.balance).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary p-2.5 transition-colors"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary p-2.5 transition-colors text-sm"
              rows="2"
              placeholder="Add transaction notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-4 mt-6 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title || !amount}
              className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/30 text-sm"
            >
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;

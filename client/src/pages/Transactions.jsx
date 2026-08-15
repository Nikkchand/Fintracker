import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Search, Filter, Trash2, Edit2, ArrowRightLeft, Plus } from 'lucide-react';
import { formatINR } from '../lib/financialCalculations';
import AddTransactionModal from '../components/Dashboard/AddTransactionModal';

const Transactions = () => {
  const { transactions, loading, deleteTransaction, addTransfer, accounts } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const [transferData, setTransferData] = useState({
    from_account_id: accounts[0]?.id || '',
    to_account_id: accounts[1]?.id || '',
    amount: '',
    notes: ''
  });

  const categories = ['All', 'Food', 'Rent', 'Travel', 'Bills', 'Shopping', 'Education', 'Salary', 'Freelance', 'Other'];

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction? Financial history will recalculate.')) return;
    try {
      await deleteTransaction(id);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    if (!transferData.from_account_id || !transferData.to_account_id || !transferData.amount) return;

    try {
      await addTransfer({
        ...transferData,
        amount: Number(transferData.amount)
      });
      setIsTransferModalOpen(false);
      setTransferData({
        from_account_id: accounts[0]?.id || '',
        to_account_id: accounts[1]?.id || '',
        amount: '',
        notes: ''
      });
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Transfer failed');
    }
  };

  const filteredTransactions = (transactions || []).filter(t => {
    const titleText = t && t.title ? String(t.title).toLowerCase() : '';
    const matchesSearch = titleText.includes((searchTerm || '').toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="p-10 text-center">Loading transactions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Transactions</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Audit log of all income, expenses, and internal transfers.</p>
        </div>

        <div className="flex items-center gap-3">
          {accounts.length >= 2 && (
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 text-primary dark:text-indigo-300 border border-primary/20 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors text-xs"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>Make Transfer</span>
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary text-sm appearance-none cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(t.transaction_date || t.date || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold uppercase">
                    <span className={`px-2 py-0.5 rounded-full ${
                      t.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' :
                        t.type === 'transfer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
                          'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                    t.type === 'income' ? 'text-emerald-500' : t.type === 'transfer' ? 'text-blue-500' : 'text-red-500'
                  }`}>
                    {t.type === 'income' ? '+' : t.type === 'transfer' ? '↔ ' : '-'}{formatINR(t.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                      title="Delete Transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No transactions found
            </div>
          )}
        </div>
      </div>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              Internal Transfer
            </h3>
            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">From Account</label>
                <select
                  required
                  value={transferData.from_account_id}
                  onChange={e => setTransferData({ ...transferData, from_account_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (₹{Number(a.balance).toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">To Account</label>
                <select
                  required
                  value={transferData.to_account_id}
                  onChange={e => setTransferData({ ...transferData, to_account_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (₹{Number(a.balance).toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Transfer Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 10000"
                  value={transferData.amount}
                  onChange={e => setTransferData({ ...transferData, amount: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-bold text-lg"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-indigo-700 shadow-md"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

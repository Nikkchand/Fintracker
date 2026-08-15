import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import AccountCard from '../components/Accounts/AccountCard';
import { Plus, Wallet, ShieldCheck, Building2, X, AlertCircle } from 'lucide-react';
import { formatINR } from '../lib/financialCalculations';

const COLOR_OPTIONS = [
  { label: 'Royal Indigo', value: 'from-blue-600 to-indigo-700' },
  { label: 'Emerald Mint', value: 'from-emerald-600 to-teal-700' },
  { label: 'Deep Purple', value: 'from-purple-600 to-pink-600' },
  { label: 'Sunset Amber', value: 'from-amber-500 to-orange-600' },
  { label: 'Dark Midnight', value: 'from-slate-800 to-gray-900' }
];

const Accounts = () => {
  const {
    accounts,
    summary,
    selectedAccountId,
    setSelectedAccountId,
    addAccount,
    loading
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    balance: '',
    accountNumber: '',
    color: COLOR_OPTIONS[0].value,
    icon: 'Building2',
    isDefault: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setModalLoading(true);
    setErrorMsg('');

    try {
      await addAccount({
        ...formData,
        balance: Number(formData.balance) || 0
      });

      setFormData({
        name: '',
        type: 'checking',
        balance: '',
        accountNumber: '',
        color: COLOR_OPTIONS[0].value,
        icon: 'Building2',
        isDefault: false
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding account:', err);
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Failed to add bank account');
    } finally {
      setModalLoading(false);
    }
  };

  const totalBalance = summary?.netWorth || summary?.balance || 0;

  if (loading) return <div className="p-10 text-center">Loading account details...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Wallet className="h-8 w-8 text-primary" />
            Bank Accounts & Wallets
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Connect and manage all your checking, savings, cards, and investment accounts in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedAccountId !== 'all' && (
            <button
              onClick={() => setSelectedAccountId('all')}
              className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Reset Filter (Show All)
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Total Consolidated Balance Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Total Consolidated Net Worth
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              {formatINR(totalBalance)}
            </h2>
            <p className="text-indigo-200 text-xs mt-2">
              Across {accounts.length} active financial accounts
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
              <span className="text-xs text-indigo-200 block font-medium">Checking & Savings</span>
              <span className="text-xl font-bold">
                {formatINR(accounts.filter(a => a.type === 'checking' || a.type === 'savings').reduce((s, a) => s + Number(a.balance), 0))}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
              <span className="text-xs text-indigo-200 block font-medium">Investments</span>
              <span className="text-xl font-bold">
                {formatINR(accounts.filter(a => a.type === 'investment').reduce((s, a) => s + Number(a.balance), 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 text-gray-400">
          <Building2 className="h-10 w-10 mx-auto mb-2 opacity-40 text-primary" />
          <p className="font-semibold text-gray-600 dark:text-gray-300">No bank accounts linked yet.</p>
          <p className="text-xs text-gray-400 mt-1">Click 'Add Account' to set up your primary checking or savings account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(acc => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Add New Account
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Salary Account"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => {
                      const type = e.target.value;
                      let icon = 'Building2';
                      if (type === 'savings') icon = 'PiggyBank';
                      if (type === 'credit') icon = 'CreditCard';
                      if (type === 'investment') icon = 'TrendingUp';
                      if (type === 'cash') icon = 'Wallet';
                      setFormData({ ...formData, type, icon });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit">Credit Card</option>
                    <option value="investment">Investment</option>
                    <option value="cash">Cash Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Initial Balance (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={e => setFormData({ ...formData, balance: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Number / Mask (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. •••• 5678"
                  value={formData.accountNumber}
                  onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Card Color Theme
                </label>
                <select
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {COLOR_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 text-primary rounded focus:ring-primary border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Set as Default Account
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/25 transition-colors disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;

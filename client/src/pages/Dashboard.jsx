import { useState, useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import SummaryCard from '../components/Dashboard/SummaryCard';
import AddTransactionModal from '../components/Dashboard/AddTransactionModal';
import SpendingChart from '../components/Dashboard/SpendingChart';
import { Plus, Wallet, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';

const Dashboard = () => {
    const { summary, loading, transactions, goals } = useDashboardData();
    const { balance: totalBalance, income: monthlyIncome, expenses: monthlyExpenses } = summary;
    console.log("Dashboard render:", { loading, transactions, summary });
    const recentTransactions = (transactions || []).slice(0, 5);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Simple refresh by reload for now
    const handleTransactionAdded = () => {
        window.location.reload();
    };

    // Prepare chart data
    const { spendingData: chartSpendingData, categoryData } = useMemo(() => {
        if (!transactions.length) return { spendingData: [], categoryData: [] };

        const spendingByMonth = {};
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Sort transactions by date asc
        const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

        sorted.forEach(t => {
            if (t.type === 'expense') {
                const transactionDate = new Date(t.date);
                if (transactionDate >= sixMonthsAgo) { // Only consider transactions within the last 6 months
                    const monthStr = transactionDate.toLocaleDateString('en-US', { month: 'short' });
                    if (!spendingByMonth[monthStr]) spendingByMonth[monthStr] = 0;
                    spendingByMonth[monthStr] += Number(t.amount);
                }
            }
        });

        // Filter for last 6 months for chart
        const spendingData = Object.entries(spendingByMonth)
            .map(([name, amount]) => ({ name, amount, type: 'expense' }))
            .sort((a, b) => {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return months.indexOf(a.name) - months.indexOf(b.name);
            })
            .slice(-6);

        return { spendingData, categoryData: [] };
    }, [transactions]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add Transaction</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium">Total Balance</p>
                            <h2 className="text-3xl font-bold mt-1">₹{totalBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Wallet className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-indigo-100 text-sm">
                        <span>Available for spending</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Monthly Income</p>
                            <h2 className="text-3xl font-bold mt-1 text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">₹{monthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                            <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Monthly Expenses</p>
                            <h2 className="text-3xl font-bold mt-1 text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">₹{monthlyExpenses.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
                        </div>
                        <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                            <ArrowDownRight className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-80">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Expense Trend</h3>
                    <SpendingChart data={chartSpendingData} />
                </div>

                {/* Savings Goals Progress */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-80 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Savings Goals</h3>
                        <a href="/goals" className="text-sm text-primary hover:text-indigo-700 font-medium">View All</a>
                    </div>

                    {(!goals || goals.length === 0) ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Target className="h-8 w-8 mb-2 opacity-50" />
                            <p>No goals set yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {goals.slice(0, 3).map(goal => {
                                const percent = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
                                return (
                                    <div key={goal.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{goal.name}</span>
                                            <span className="text-xs font-bold text-primary">{percent}%</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            <span>{Number(goal.current_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                                            <span>{Number(goal.target_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
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
                                        <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`font-semibold ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {tx.type === 'income' ? '+' : '-'}{Number(tx.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
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
        </div>
    );
};

export default Dashboard;

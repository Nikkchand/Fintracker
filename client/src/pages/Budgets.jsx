import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import SetBudgetModal from '../components/Budgets/SetBudgetModal';

const Budgets = () => {
    const { user } = useAuth();
    const [budgets, setBudgets] = useState([]);
    const [transactions, setTransactions] = useState([]); // Need txs to calc spent
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            // Fetch budgets
            const budgetQuery = query(collection(db, 'budgets'), where('user_id', '==', user.uid));
            const budgetDocs = await getDocs(budgetQuery);
            const budgetData = budgetDocs.docs.map(d => ({ id: d.id, ...d.data() }));

            // Fetch transactions
            const txQuery = query(collection(db, 'transactions'), where('user_id', '==', user.uid));
            const txDocs = await getDocs(txQuery);
            const txData = txDocs.docs.map(d => ({ id: d.id, ...d.data() }));

            setBudgets(budgetData);
            setTransactions(txData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching budget data:", error);
            setLoading(false);
        }
    };

    // Calculate spent amount for a category
    const getSpentAmount = (category) => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        return transactions
            .filter(t =>
                t.type === 'expense' &&
                t.category === category &&
                t.date.startsWith(currentMonth)
            )
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
    };

    if (loading) return <div className="p-10 text-center">Loading budgets...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Budget Manager</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                >
                    <Plus className="h-5 w-5" />
                    <span>Set Budget</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map(budget => {
                    const spent = getSpentAmount(budget.category);
                    const percentage = Math.min((spent / budget.amount) * 100, 100);
                    const isOver = spent > budget.amount;

                    return (
                        <div key={budget.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {budget.category === 'Food' ? '🍔' :
                                            budget.category === 'Rent' ? '🏠' :
                                                budget.category === 'Travel' ? '✈️' :
                                                    budget.category === 'Bills' ? '💡' :
                                                        budget.category === 'Shopping' ? '🛍️' :
                                                            budget.category === 'Education' ? '🎓' : '📦'}
                                    </span>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{budget.category}</h3>
                                </div>
                                <span className="text-gray-400">Monthly</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Spent: {Number(spent).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">Limit: {Number(budget.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`h-2.5 rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <p className={`text-xs mt-1 ${isOver ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                    {Math.round(percentage)}% used {isOver && '(Over Budget!)'}
                                </p>
                            </div>
                        </div>
                    );
                })}

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 border-dashed border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <div className="flex flex-col items-center gap-2">
                        <Plus className="h-8 w-8 text-gray-300" />
                        <p>Add new category</p>
                    </div>
                </button>
            </div>

            <SetBudgetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onBudgetSet={fetchData}
            />
        </div>
    );
};

export default Budgets;

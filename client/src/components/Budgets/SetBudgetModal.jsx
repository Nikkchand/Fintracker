import { useState } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';

const SetBudgetModal = ({ isOpen, onClose, onBudgetSet }) => {
    const { user } = useAuth();
    const [category, setCategory] = useState({ name: 'Food', icon: '🍔' });
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        try {
            const month = new Date().toISOString().slice(0, 7); // YYYY-MM
            const newBudget = {
                user_id: user.uid,
                category: category.name,
                amount: Number(amount),
                month,
                created_at: new Date().toISOString()
            };

            await addDoc(collection(db, 'budgets'), newBudget);
            onBudgetSet();
            onClose();
            setAmount('');
        } catch (error) {
            console.error("Error setting budget:", error);
            alert("Failed to set budget");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Set Monthly Budget</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <div className="grid grid-cols-4 gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${category.name === cat.name
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-primary text-primary'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    <span className="text-xl">{cat.icon}</span>
                                    <span className="text-xs mt-1">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Limit</label>
                        <input
                            type="number"
                            required
                            min="0"
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary p-2.5 transition-colors"
                            placeholder="e.g. 5000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
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
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/30"
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

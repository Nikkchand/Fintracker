import { useState } from 'react';
import { db } from '../../services/firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';

const AddMoneyModal = ({ isOpen, onClose, goal, balance, onGoalUpdated }) => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!goal) return;

        const amountNum = Number(amount);
        if (amountNum > balance) {
            alert("Insufficient balance!");
            return;
        }

        setLoading(true);
        try {
            // 1. Update Goal Amount
            const newAmount = Number(goal.current_amount) + amountNum;
            const goalRef = doc(db, 'goals', goal.id);
            await updateDoc(goalRef, {
                current_amount: newAmount
            });

            // 2. Create Transaction (Deduct from Balance)
            await addDoc(collection(db, 'transactions'), {
                user_id: user.uid,
                title: `Transfer to Goal: ${goal.name}`,
                amount: amountNum,
                type: 'expense',
                category: 'Savings',
                date: new Date().toISOString().split('T')[0],
                notes: `Added ${amountNum} to ${goal.name}`,
                created_at: new Date().toISOString()
            });

            onGoalUpdated();
            onClose();
            setAmount('');
        } catch (error) {
            console.error("Error adding money:", error);
            alert("Failed to add money");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !goal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Money to {goal.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Available Balance</span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                                {Number(balance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </span>
                        </div>
                        <div className="h-px bg-indigo-200 dark:bg-indigo-800 my-2"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Goal Balance</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {Number(goal.current_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                            Target: {Number(goal.target_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount to Add</label>
                        <input
                            type="number"
                            required
                            min="1"
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary p-2.5 transition-colors"
                            placeholder="e.g. 500"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            autoFocus
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
                            {loading ? 'Adding...' : 'Add Money'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMoneyModal;

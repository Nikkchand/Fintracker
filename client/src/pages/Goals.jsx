import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { Plus, Target } from 'lucide-react';
import NewGoalModal from '../components/Goals/NewGoalModal';
import AddMoneyModal from '../components/Goals/AddMoneyModal';

const Goals = () => {
    const { user } = useAuth();
    const { summary } = useDashboardData(); // Fetch summary for balance
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    useEffect(() => {
        if (!user) return;
        fetchGoals();
    }, [user]);

    const fetchGoals = async () => {
        try {
            const goalsQuery = query(collection(db, 'goals'), where('user_id', '==', user.uid));
            const goalsDocs = await getDocs(goalsQuery);
            const goalsData = goalsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGoals(goalsData);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const openAddMoneyModal = (goal) => {
        setSelectedGoal(goal);
        setIsAddMoneyModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Savings Goals</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                >
                    <Plus className="h-5 w-5" />
                    <span>New Goal</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? <p>Loading...</p> : goals.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-400">
                        No savings goals yet.
                    </div>
                ) : (
                    goals.map(goal => {
                        const percent = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
                        return (
                            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                                <div className="relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{goal.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Target: {Number(goal.target_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                                        </div>
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-primary">
                                            <Target className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                            {Number(goal.current_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{percent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div
                                            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <button
                                        onClick={() => openAddMoneyModal(goal)}
                                        className="text-sm text-primary hover:text-indigo-700 font-medium"
                                    >
                                        + Add Money
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <NewGoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onGoalAdded={fetchGoals}
            />

            <AddMoneyModal
                isOpen={isAddMoneyModalOpen}
                onClose={() => setIsAddMoneyModalOpen(false)}
                goal={selectedGoal}
                balance={summary?.balance || 0}
                onGoalUpdated={fetchGoals}
            />
        </div>
    );
};

export default Goals;

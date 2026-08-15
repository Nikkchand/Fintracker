import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Target, Trash2 } from 'lucide-react';
import NewGoalModal from '../components/Goals/NewGoalModal';
import AddMoneyModal from '../components/Goals/AddMoneyModal';
import { formatINR } from '../lib/financialCalculations';

const Goals = () => {
  const { goals, loading, deleteGoal, summary } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const openAddMoneyModal = (goal) => {
    setSelectedGoal(goal);
    setIsAddMoneyModalOpen(true);
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      await deleteGoal(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Savings Goals</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track target milestones and make contribution deposits.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 text-sm"
        >
          <Plus className="h-5 w-5" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="col-span-full text-center py-10 text-gray-400">Loading goals...</p>
        ) : !goals || goals.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Target className="h-10 w-10 mx-auto mb-2 opacity-40 text-primary" />
            <p className="font-semibold text-gray-600 dark:text-gray-300">No savings goals yet.</p>
            <p className="text-xs text-gray-400 mt-1">Click 'New Goal' to set your first target!</p>
          </div>
        ) : (
          goals.map(goal => {
            const target = Number(goal.target_amount || goal.targetAmount || 0);
            const current = Number(goal.current_amount || goal.currentAmount || 0);
            const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
            const isCompleted = current >= target;

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover relative overflow-hidden group space-y-4"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>

                <div className="relative flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{goal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Target: {formatINR(target)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Delete Goal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-primary">
                      <Target className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatINR(current)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{percent}% {isCompleted && '🎉 Completed!'}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => openAddMoneyModal(goal)}
                    disabled={isCompleted}
                    className="text-sm text-primary hover:text-indigo-700 font-medium disabled:opacity-40"
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
      />

      <AddMoneyModal
        isOpen={isAddMoneyModalOpen}
        onClose={() => setIsAddMoneyModalOpen(false)}
        goal={selectedGoal}
        balance={summary?.balance || 0}
      />
    </div>
  );
};

export default Goals;

import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2 } from 'lucide-react';
import SetBudgetModal from '../components/Budgets/SetBudgetModal';
import BudgetAlertBanner from '../components/Budgets/BudgetAlertBanner';
import { calculateBudgetUsage, formatINR } from '../lib/financialCalculations';

const Budgets = () => {
  const { budgets, transactions, loading, deleteBudget, setBudget } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Single authoritative source calculation for budgets
  const calculatedBudgets = (budgets || []).map(b => calculateBudgetUsage(b, transactions));

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget limit?')) {
      await deleteBudget(id);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading budgets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Budget Manager</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set spending thresholds and receive automated warning alerts.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 text-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Set Budget Limit</span>
        </button>
      </div>

      {/* Smart Budget Alert Banner */}
      <BudgetAlertBanner budgets={budgets} transactions={transactions} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculatedBudgets.map(budget => {
          const { id, category, spent, limit, percentage, status } = budget;
          const isOver = status === 'exceeded';
          const isCritical = status === 'critical';
          const isWarning = status === 'warning';

          // Progress bar display width (visual bar cap at 100 for width CSS, but text shows true %)
          const progressWidth = Math.min(percentage, 100);

          return (
            <div
              key={id || category}
              className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border transition-all space-y-4 relative group ${
                isOver
                  ? 'border-red-400 dark:border-red-800 ring-2 ring-red-400/30'
                  : isCritical
                  ? 'border-rose-400 dark:border-rose-800 ring-2 ring-rose-400/30'
                  : isWarning
                  ? 'border-amber-400 dark:border-amber-800 ring-2 ring-amber-400/30'
                  : 'border-gray-100 dark:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                    {category === 'Food' ? '🍔' :
                      category === 'Rent' ? '🏠' :
                        category === 'Travel' ? '✈️' :
                          category === 'Bills' ? '💡' :
                            category === 'Shopping' ? '🛍️' :
                              category === 'Education' ? '🎓' : '📦'}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{category}</h3>
                    <span className="text-gray-400 text-[11px] font-medium">Monthly Limit</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteBudget(id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                  title="Delete Budget"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm font-medium">
                  <span className="text-gray-600 dark:text-gray-400">Spent: <strong>{formatINR(spent)}</strong></span>
                  <span className="text-gray-900 dark:text-gray-100">Cap: <strong>{formatINR(limit)}</strong></span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isOver ? 'bg-red-500' : isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressWidth}%` }}
                  ></div>
                </div>

                <p className={`text-xs mt-1 font-bold ${
                  isOver ? 'text-red-500' : isCritical ? 'text-rose-500' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'
                }`}>
                  {percentage}% used {isOver ? '(Over Budget Limit!)' : isCritical ? '(Critical Budget Alert!)' : isWarning ? '(Near Limit Warning!)' : '• Healthy'}
                </p>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 border-dashed border-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            <Plus className="h-8 w-8 text-primary" />
            <p className="font-bold text-sm text-gray-700 dark:text-gray-300">Set New Category Budget</p>
          </div>
        </button>
      </div>

      <SetBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBudgetSet={async (newBudget) => {
          await setBudget(newBudget);
        }}
      />
    </div>
  );
};

export default Budgets;

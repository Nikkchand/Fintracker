import { AlertTriangle, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateBudgetUsage } from '../../lib/financialCalculations';

const BudgetAlertBanner = ({ budgets = [], transactions = [] }) => {
  if (!budgets || !budgets.length) return null;

  // Single source calculation
  const flaggedBudgets = budgets
    .map(b => calculateBudgetUsage(b, transactions))
    .filter(b => b.percentage >= 70);

  if (flaggedBudgets.length === 0) return null;

  const criticalOverBudget = flaggedBudgets.filter(b => b.percentage >= 100);
  const warningNearBudget = flaggedBudgets.filter(b => b.percentage >= 70 && b.percentage < 100);

  return (
    <div className="space-y-3 mb-6">
      {criticalOverBudget.length > 0 && (
        <div className="bg-red-500/10 dark:bg-red-950/40 border border-red-500/30 dark:border-red-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-md">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                Budget Threshold Exceeded! ({criticalOverBudget.length} Categories)
              </h4>
              <p className="text-xs text-red-700 dark:text-red-300">
                {criticalOverBudget.map(b => `${b.category} (${Math.round(b.percentage)}% spent)`).join(', ')}
              </p>
            </div>
          </div>
          <Link
            to="/budgets"
            className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Adjust Budgets</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {warningNearBudget.length > 0 && (
        <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 dark:border-amber-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Approaching Monthly Budget Limit (≥70%)
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {warningNearBudget.map(b => `${b.category} (${Math.round(b.percentage)}% used)`).join(', ')}
              </p>
            </div>
          </div>
          <Link
            to="/budgets"
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1 shrink-0"
          >
            <span>View Details</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default BudgetAlertBanner;

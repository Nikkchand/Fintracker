import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatINR } from '../lib/financialCalculations';
import { BarChart2 } from 'lucide-react';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

const Analytics = () => {
  const { transactions, loading } = useFinance();

  const categoryData = useMemo(() => {
    if (!transactions || !transactions.length) return [];

    const grouped = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Other';
      if (!grouped[cat]) grouped[cat] = 0;
      grouped[cat] += Number(t.amount || 0);
    });

    return Object.keys(grouped).map(cat => ({ name: cat, value: grouped[cat] }));
  }, [transactions]);

  const monthlyData = useMemo(() => {
    if (!transactions || !transactions.length) return [];

    const grouped = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const date = new Date(t.transaction_date || t.date);
      if (!isNaN(date.getTime())) {
        const month = date.toLocaleString('default', { month: 'short' });
        if (!grouped[month]) grouped[month] = 0;
        grouped[month] += Number(t.amount || 0);
      }
    });

    return Object.keys(grouped).map(month => ({ name: month, amount: grouped[month] }));
  }, [transactions]);

  if (loading) return <div className="p-10 text-center">Loading analytics data...</div>;

  const hasExpenses = categoryData.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Analytics</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Categorical spending breakdown and monthly trend analysis.</p>
      </div>

      {!hasExpenses ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-700">
          <BarChart2 className="h-12 w-12 mx-auto text-gray-400 mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No Expense Data Available</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Add transactions or scan receipts to generate categorical pie charts and spending trend reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Pie Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-96">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Expense by Category</h3>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatINR(value), 'Spent']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Bar Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-96">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Monthly Spending</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `₹${val}`} />
                <Tooltip formatter={(value) => [formatINR(value), 'Total Spent']} />
                <Bar dataKey="amount" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

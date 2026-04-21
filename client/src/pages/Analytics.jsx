import { useState, useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const Analytics = () => {
    const { transactions, loading } = useDashboardData();

    const categoryData = useMemo(() => {
        if (!transactions.length) return [];

        const grouped = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            if (!grouped[t.category]) grouped[t.category] = 0;
            grouped[t.category] += Number(t.amount);
        });

        return Object.keys(grouped).map(cat => ({ name: cat, value: grouped[cat] }));
    }, [transactions]);

    const monthlyData = useMemo(() => {
        if (!transactions.length) return [];

        // Mocking monthly data by grouping 
        const grouped = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            const date = new Date(t.date);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!grouped[month]) grouped[month] = 0;
            grouped[month] += Number(t.amount);
        });

        return Object.keys(grouped).map(month => ({ name: month, amount: grouped[month] }));
    }, [transactions]);


    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Pie Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-96">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Expense by Category</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
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
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">No expense data</div>
                    )}
                </div>

                {/* Monthly Bar Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-96">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Monthly Spending</h3>
                    {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;

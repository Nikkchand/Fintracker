const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');
const db = require('../database/db');
const {
  calculateBudgetUsage,
  calculateMonthlySummary,
  calculateNetWorth,
  calculateGoalProgress
} = require('../services/financialService');

// GET /api/dashboard
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const accounts = await db.getAccounts(userId);
    const transactions = await db.getTransactions(userId);
    const rawBudgets = await db.getBudgets(userId);
    const rawGoals = await db.getGoals(userId);
    const recurring = await db.getRecurring(userId);

    // Single source of truth calculations
    const summary = calculateMonthlySummary(transactions);
    const totalNetWorth = calculateNetWorth(accounts);

    const budgets = rawBudgets.map(b => calculateBudgetUsage(b, transactions));
    const goals = rawGoals.map(g => calculateGoalProgress(g));
    const recentTransactions = transactions.slice(0, 10);

    // Calculate category spending breakdown for charts
    const categorySpending = {};
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const txDate = (t.transaction_date || t.date || '').slice(0, 7);
        if (txDate === currentMonthPrefix) {
          const cat = t.category || 'Other';
          categorySpending[cat] = (categorySpending[cat] || 0) + Number(t.amount || 0);
        }
      }
    });

    const categoryData = Object.entries(categorySpending).map(([category, amount]) => ({
      name: category,
      amount,
      value: amount
    }));

    res.json({
      success: true,
      data: {
        summary: {
          ...summary,
          netWorth: totalNetWorth,
          balance: totalNetWorth
        },
        accounts,
        transactions,
        recentTransactions,
        budgets,
        goals,
        recurring,
        categorySpending: categoryData
      }
    });
  } catch (err) {
    console.error('Dashboard Endpoint Error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

module.exports = router;

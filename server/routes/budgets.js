const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');
const db = require('../database/db');
const { calculateBudgetUsage } = require('../services/financialService');

// GET /api/budgets
router.get('/', authenticateUser, async (req, res) => {
  try {
    const budgets = await db.getBudgets(req.user.id);
    const transactions = await db.getTransactions(req.user.id);

    // Calculate real usage dynamically
    const enrichedBudgets = budgets.map(b => calculateBudgetUsage(b, transactions));

    res.json({ success: true, data: enrichedBudgets });
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/budgets
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { category, limit_amount, limit, period_start, period_end } = req.body;
    const amount = limit_amount || limit;

    if (!category || !amount) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Category and limit amount are required' }
      });
    }

    const budget = await db.upsertBudget(req.user.id, {
      category,
      limit_amount: Number(amount),
      period_start,
      period_end
    });

    const transactions = await db.getTransactions(req.user.id);
    const enriched = calculateBudgetUsage(budget, transactions);

    res.status(201).json({ success: true, data: enriched });
  } catch (err) {
    console.error('Error upserting budget:', err);
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteBudget(id, req.user.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Budget not found or access denied' }
      });
    }

    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (err) {
    console.error('Error deleting budget:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

module.exports = router;

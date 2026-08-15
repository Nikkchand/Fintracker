const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');
const db = require('../database/db');
const { calculateGoalProgress } = require('../services/financialService');

// GET /api/goals
router.get('/', authenticateUser, async (req, res) => {
  try {
    const goals = await db.getGoals(req.user.id);
    const enriched = goals.map(g => calculateGoalProgress(g));
    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Error fetching goals:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/goals
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { name, target_amount, targetAmount, deadline, current_amount, currentAmount, icon, color, notes } = req.body;
    const target = target_amount || targetAmount;

    if (!name || !target) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Goal name and target amount are required' }
      });
    }

    const newGoal = await db.createGoal(req.user.id, {
      name,
      target_amount: Number(target),
      current_amount: Number(current_amount || currentAmount || 0),
      deadline,
      icon,
      color,
      notes
    });

    const enriched = calculateGoalProgress(newGoal);
    res.status(201).json({ success: true, data: enriched });
  } catch (err) {
    console.error('Error creating goal:', err);
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// POST /api/goals/:id/contribute
router.post('/:id/contribute', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Valid contribution amount is required' }
      });
    }

    const result = await db.addGoalContribution(id, req.user.id, Number(amount), notes);
    const enriched = calculateGoalProgress(result.goal);

    res.json({
      success: true,
      data: {
        goal: enriched,
        contribution: result.contribution
      }
    });
  } catch (err) {
    console.error('Error adding contribution:', err);
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// PATCH /api/goals/:id
router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateGoal(id, req.user.id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Goal not found or access denied' }
      });
    }

    const enriched = calculateGoalProgress(updated);
    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Error updating goal:', err);
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteGoal(id, req.user.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Goal not found or access denied' }
      });
    }

    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (err) {
    console.error('Error deleting goal:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');
const db = require('../database/db');

// GET /api/recurring
router.get('/', authenticateUser, async (req, res) => {
  try {
    const items = await db.getRecurring(req.user.id);
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('Error fetching recurring transactions:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/recurring
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { title, amount, type, category, frequency, next_due_date, nextDueDate, account_id, accountId, notes } = req.body;

    if (!title || !amount) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Title and amount are required' }
      });
    }

    const newItem = await db.createRecurring(req.user.id, {
      title,
      amount: Number(amount),
      type: type || 'expense',
      category: category || 'Other',
      frequency: frequency || 'monthly',
      next_due_date: next_due_date || nextDueDate || new Date().toISOString().slice(0, 10),
      account_id: account_id || accountId || null,
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    console.error('Error creating recurring rule:', err);
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// PATCH /api/recurring/:id
router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateRecurring(id, req.user.id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Recurring transaction not found or access denied' }
      });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating recurring rule:', err);
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// DELETE /api/recurring/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteRecurring(id, req.user.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Recurring transaction not found or access denied' }
      });
    }

    res.json({ success: true, message: 'Recurring transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting recurring rule:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');
const db = require('../database/db');

// GET /api/transactions
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { accountId, category, type, search } = req.query;
    const transactions = await db.getTransactions(req.user.id, { accountId, category, type, search });
    res.json({ success: true, data: transactions });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/transactions
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { title, amount, type, category, date, transaction_date, notes, account_id, accountId, merchant } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Transaction title is required' }
      });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Transaction amount must be a positive number' }
      });
    }

    const targetAccountId = account_id || accountId || null;

    const newTx = await db.createTransaction(req.user.id, {
      title: title.trim(),
      amount: numAmount,
      type: type || 'expense',
      category: category || 'Other',
      transaction_date: transaction_date || date || new Date().toISOString().slice(0, 10),
      notes: notes || '',
      account_id: targetAccountId,
      merchant: merchant || ''
    });

    res.status(201).json({ success: true, data: newTx });
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// POST /api/transactions/transfer
router.post('/transfer', authenticateUser, async (req, res) => {
  try {
    const { from_account_id, to_account_id, amount, date, notes } = req.body;

    if (!from_account_id || !to_account_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Both source and destination accounts are required' }
      });
    }

    const transferTx = await db.createTransfer(req.user.id, {
      from_account_id,
      to_account_id,
      amount,
      date,
      notes
    });

    res.status(201).json({ success: true, data: transferTx });
  } catch (err) {
    console.error('Error creating transfer:', err);
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// PATCH /api/transactions/:id
router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.getTransaction(id, req.user.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Transaction not found or access denied' }
      });
    }

    const updated = await db.updateTransaction(id, req.user.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.getTransaction(id, req.user.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Transaction not found or access denied' }
      });
    }

    await db.deleteTransaction(id, req.user.id);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

module.exports = router;

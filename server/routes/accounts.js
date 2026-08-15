const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');
const db = require('../database/db');

// GET /api/accounts
router.get('/', authenticateUser, async (req, res) => {
  try {
    const accounts = await db.getAccounts(req.user.id);
    res.json({ success: true, data: accounts });
  } catch (err) {
    console.error('Error fetching accounts:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/accounts
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { name, type, balance, accountNumber, color, icon, isDefault } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Account name is required' }
      });
    }

    const newAccount = await db.createAccount(req.user.id, {
      name: name.trim(),
      type: type || 'checking',
      balance: Number(balance) || 0,
      accountNumber: accountNumber || '',
      color: color || 'from-indigo-600 to-purple-600',
      icon: icon || 'Building2',
      isDefault: !!isDefault
    });

    res.status(201).json({ success: true, data: newAccount });
  } catch (err) {
    console.error('Error creating account:', err);
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// PATCH /api/accounts/:id
router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const account = await db.getAccount(id, req.user.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found or access denied' }
      });
    }

    const updated = await db.updateAccount(id, req.user.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating account:', err);
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// DELETE /api/accounts/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const account = await db.getAccount(id, req.user.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found or access denied' }
      });
    }

    await db.deleteAccount(id, req.user.id);
    res.json({ success: true, message: 'Account deleted/archived successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

module.exports = router;

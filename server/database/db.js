/**
 * FinTrakr — Production PostgreSQL Data Access Layer
 * Backed by Supabase / Cloud SQL / RDS via pg.Pool.
 * All queries are fully parameterized to prevent SQL injection.
 * Numeric values are converted to standard JS Numbers to match frontend contracts.
 */

const { Pool, types } = require('pg');

// Automatically parse NUMERIC/DECIMAL (OID 1700) and BIGINT (OID 20) as floats/integers in JavaScript
types.setTypeParser(1700, val => (val === null ? null : parseFloat(val)));
types.setTypeParser(20, val => (val === null ? null : parseInt(val, 10)));

const isProduction = process.env.NODE_ENV === 'production';
const hasSslRequirement = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('supabase') || process.env.DATABASE_URL.includes('sslmode=require'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (isProduction || hasSslRequirement)
    ? { rejectUnauthorized: false }
    : false,
  // Force IPv4 to avoid ENETUNREACH on Render (Supabase IPv6 unreachable from Render free tier)
  family: 4
});

// Test connection on startup
pool.on('error', (err) => {
  console.error('❌ Unexpected idle PostgreSQL client error:', err.message);
});

const db = {
  pool,

  // Health check query
  async healthCheck() {
    try {
      const { rows } = await pool.query('SELECT NOW() as db_time, 1 as healthy');
      return { status: 'healthy', timestamp: rows[0].db_time };
    } catch (err) {
      return { status: 'unhealthy', error: err.message };
    }
  },

  // ── USERS ──────────────────────────────────────────────────────────────────

  async getUser(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async upsertUser(user) {
    if (!user || !user.id) return null;
    const { rows } = await pool.query(`
      INSERT INTO users (id, email, display_name, photo_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        email        = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        photo_url    = EXCLUDED.photo_url,
        updated_at   = NOW()
      RETURNING *
    `, [
      user.id,
      user.email || '',
      user.display_name || 'User',
      user.photo_url || ''
    ]);
    return rows[0];
  },

  // ── ACCOUNTS ───────────────────────────────────────────────────────────────

  async getAccounts(userId) {
    const { rows } = await pool.query(`
      SELECT * FROM accounts
      WHERE user_id = $1 AND is_archived = FALSE
      ORDER BY created_at DESC
    `, [userId]);
    return rows.map(r => ({
      ...r,
      balance: Number(r.balance) || 0
    }));
  },

  async getAccount(id, userId) {
    const { rows } = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      balance: Number(rows[0].balance) || 0
    };
  },

  async createAccount(userId, accountData) {
    const isDefault = accountData.isDefault || accountData.is_default;

    const countRes = await pool.query(
      'SELECT COUNT(*) FROM accounts WHERE user_id = $1 AND is_archived = FALSE',
      [userId]
    );
    const isFirstAccount = parseInt(countRes.rows[0].count, 10) === 0;
    const setDefault = isFirstAccount || !!isDefault;

    if (setDefault) {
      await pool.query(
        'UPDATE accounts SET is_default = FALSE WHERE user_id = $1',
        [userId]
      );
    }

    const { rows } = await pool.query(`
      INSERT INTO accounts
        (id, user_id, name, type, balance, account_number, color, icon, is_default, is_archived, currency)
      VALUES
        (gen_random_uuid()::TEXT, $1, $2, $3, $4, $5, $6, $7, $8, FALSE, $9)
      RETURNING *
    `, [
      userId,
      accountData.name,
      accountData.type || 'checking',
      Number(accountData.balance) || 0,
      accountData.accountNumber || accountData.account_number || `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
      accountData.color || 'from-indigo-600 to-purple-600',
      accountData.icon || 'Building2',
      setDefault,
      accountData.currency || 'INR'
    ]);

    return {
      ...rows[0],
      balance: Number(rows[0].balance) || 0
    };
  },

  async updateAccount(id, userId, updates) {
    const existing = await this.getAccount(id, userId);
    if (!existing) return null;

    if (updates.is_default || updates.isDefault) {
      await pool.query(
        'UPDATE accounts SET is_default = FALSE WHERE user_id = $1',
        [userId]
      );
    }

    const newBalance = updates.balance !== undefined ? Number(updates.balance) : existing.balance;

    const { rows } = await pool.query(`
      UPDATE accounts SET
        name           = COALESCE($3, name),
        type           = COALESCE($4, type),
        balance        = $5,
        account_number = COALESCE($6, account_number),
        color          = COALESCE($7, color),
        icon           = COALESCE($8, icon),
        is_default     = COALESCE($9, is_default),
        currency       = COALESCE($10, currency),
        updated_at     = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [
      id, userId,
      updates.name || null,
      updates.type || null,
      newBalance,
      updates.account_number || updates.accountNumber || null,
      updates.color || null,
      updates.icon || null,
      updates.is_default !== undefined ? updates.is_default : (updates.isDefault !== undefined ? updates.isDefault : null),
      updates.currency || null
    ]);

    if (!rows[0]) return null;
    return {
      ...rows[0],
      balance: Number(rows[0].balance) || 0
    };
  },

  async deleteAccount(id, userId) {
    const txRes = await pool.query(
      'SELECT COUNT(*) FROM transactions WHERE (account_id = $1 OR transfer_to_account_id = $1) AND user_id = $2',
      [id, userId]
    );
    const hasTransactions = parseInt(txRes.rows[0].count, 10) > 0;

    if (hasTransactions) {
      await pool.query(
        'UPDATE accounts SET is_archived = TRUE, updated_at = NOW() WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
    } else {
      const { rowCount } = await pool.query(
        'DELETE FROM accounts WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      if (rowCount === 0) return false;
    }
    return true;
  },

  // ── TRANSACTIONS ───────────────────────────────────────────────────────────

  async getTransactions(userId, filters = {}) {
    let query = 'SELECT * FROM transactions WHERE user_id = $1';
    const params = [userId];
    let pIdx = 2;

    if (filters.accountId && filters.accountId !== 'all') {
      query += ` AND (account_id = $${pIdx} OR transfer_to_account_id = $${pIdx})`;
      params.push(filters.accountId);
      pIdx++;
    }
    if (filters.category && filters.category !== 'All') {
      query += ` AND category = $${pIdx}`;
      params.push(filters.category);
      pIdx++;
    }
    if (filters.type) {
      query += ` AND type = $${pIdx}`;
      params.push(filters.type);
      pIdx++;
    }
    if (filters.search) {
      query += ` AND (LOWER(title) LIKE $${pIdx} OR LOWER(merchant) LIKE $${pIdx})`;
      params.push(`%${filters.search.toLowerCase()}%`);
      pIdx++;
    }

    query += ' ORDER BY transaction_date DESC, created_at DESC';

    const { rows } = await pool.query(query, params);
    return rows.map(r => ({
      ...r,
      transaction_date: r.transaction_date instanceof Date
        ? r.transaction_date.toISOString().slice(0, 10)
        : String(r.transaction_date).slice(0, 10),
      amount: Number(r.amount) || 0
    }));
  },

  async getTransaction(id, userId) {
    const { rows } = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      ...r,
      transaction_date: r.transaction_date instanceof Date
        ? r.transaction_date.toISOString().slice(0, 10)
        : String(r.transaction_date).slice(0, 10),
      amount: Number(r.amount) || 0
    };
  },

  async createTransaction(userId, txData) {
    const amount = Number(txData.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Transaction amount must be a positive number');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(`
        INSERT INTO transactions
          (id, user_id, account_id, category, type, amount, currency, title,
           merchant, description, transaction_date, notes, receipt_id, transfer_to_account_id)
        VALUES
          (gen_random_uuid()::TEXT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        userId,
        txData.account_id || null,
        txData.category || 'Other',
        txData.type || 'expense',
        amount,
        txData.currency || 'INR',
        txData.title || 'Untitled Transaction',
        txData.merchant || '',
        txData.description || '',
        txData.transaction_date || txData.date || new Date().toISOString().slice(0, 10),
        txData.notes || '',
        txData.receipt_id || null,
        txData.transfer_to_account_id || null
      ]);

      const newTx = rows[0];

      // Update account balance atomically
      if (newTx.account_id) {
        if (newTx.type === 'expense') {
          await client.query(
            'UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
            [amount, newTx.account_id, userId]
          );
        } else if (newTx.type === 'income') {
          await client.query(
            'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
            [amount, newTx.account_id, userId]
          );
        }
      }

      await client.query('COMMIT');

      return {
        ...newTx,
        transaction_date: newTx.transaction_date instanceof Date
          ? newTx.transaction_date.toISOString().slice(0, 10)
          : String(newTx.transaction_date).slice(0, 10),
        amount: Number(newTx.amount) || 0
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async updateTransaction(id, userId, updates) {
    const existing = await this.getTransaction(id, userId);
    if (!existing) return null;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Revert old balance effect
      if (existing.account_id) {
        if (existing.type === 'expense') {
          await client.query(
            'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
            [existing.amount, existing.account_id, userId]
          );
        } else if (existing.type === 'income') {
          await client.query(
            'UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
            [existing.amount, existing.account_id, userId]
          );
        }
      }

      const newAmount = updates.amount !== undefined ? Number(updates.amount) : existing.amount;
      const newAccountId = updates.account_id !== undefined ? updates.account_id : existing.account_id;
      const newType = updates.type || existing.type;

      const { rows } = await client.query(`
        UPDATE transactions SET
          account_id              = COALESCE($3, account_id),
          category                = COALESCE($4, category),
          type                    = COALESCE($5, type),
          amount                  = $6,
          title                   = COALESCE($7, title),
          merchant                = COALESCE($8, merchant),
          transaction_date        = COALESCE($9, transaction_date),
          notes                   = COALESCE($10, notes),
          updated_at              = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [
        id, userId,
        updates.account_id !== undefined ? updates.account_id : existing.account_id,
        updates.category || null,
        updates.type || null,
        newAmount,
        updates.title || null,
        updates.merchant !== undefined ? updates.merchant : null,
        updates.transaction_date || updates.date || null,
        updates.notes !== undefined ? updates.notes : null
      ]);

      // Apply new balance effect
      if (newAccountId) {
        if (newType === 'expense') {
          await client.query(
            'UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
            [newAmount, newAccountId, userId]
          );
        } else if (newType === 'income') {
          await client.query(
            'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
            [newAmount, newAccountId, userId]
          );
        }
      }

      await client.query('COMMIT');
      const r = rows[0];
      return {
        ...r,
        transaction_date: r.transaction_date instanceof Date
          ? r.transaction_date.toISOString().slice(0, 10)
          : String(r.transaction_date).slice(0, 10),
        amount: Number(r.amount) || 0
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async deleteTransaction(id, userId) {
    const tx = await this.getTransaction(id, userId);
    if (!tx) return false;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Revert account balance
      if (tx.account_id) {
        if (tx.type === 'expense') {
          await client.query(
            'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
            [tx.amount, tx.account_id, userId]
          );
        } else if (tx.type === 'income') {
          await client.query(
            'UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
            [tx.amount, tx.account_id, userId]
          );
        }
      }

      // Revert transfer target balance if applicable
      if (tx.type === 'transfer' && tx.transfer_to_account_id) {
        await client.query(
          'UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
          [tx.amount, tx.transfer_to_account_id, userId]
        );
      }

      await client.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, userId]);
      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // ── TRANSFERS ──────────────────────────────────────────────────────────────

  async createTransfer(userId, transferData) {
    const { from_account_id, to_account_id, amount, date, notes } = transferData;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) throw new Error('Transfer amount must be greater than 0');
    if (from_account_id === to_account_id) throw new Error('Source and destination accounts must be different');

    const fromRes = await pool.query('SELECT * FROM accounts WHERE id = $1 AND user_id = $2', [from_account_id, userId]);
    const toRes   = await pool.query('SELECT * FROM accounts WHERE id = $1 AND user_id = $2', [to_account_id,   userId]);

    if (!fromRes.rows[0] || !toRes.rows[0]) throw new Error('Invalid source or target account');

    const fromAccount = fromRes.rows[0];
    const toAccount   = toRes.rows[0];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
        [numAmount, from_account_id, userId]
      );
      await client.query(
        'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
        [numAmount, to_account_id, userId]
      );

      const { rows } = await client.query(`
        INSERT INTO transactions
          (id, user_id, account_id, transfer_to_account_id, category, type, amount, currency, title, description, transaction_date, notes)
        VALUES
          (gen_random_uuid()::TEXT, $1, $2, $3, 'Transfer', 'transfer', $4, 'INR', $5, $6, $7, $8)
        RETURNING *
      `, [
        userId, from_account_id, to_account_id, numAmount,
        `Transfer: ${fromAccount.name} → ${toAccount.name}`,
        `Internal transfer of ₹${numAmount.toLocaleString('en-IN')}`,
        date || new Date().toISOString().slice(0, 10),
        notes || ''
      ]);

      await client.query('COMMIT');
      const r = rows[0];
      return {
        ...r,
        transaction_date: r.transaction_date instanceof Date
          ? r.transaction_date.toISOString().slice(0, 10)
          : String(r.transaction_date).slice(0, 10),
        amount: Number(r.amount) || 0
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // ── BUDGETS ────────────────────────────────────────────────────────────────

  async getBudgets(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM budgets WHERE user_id = $1 ORDER BY period_start DESC',
      [userId]
    );
    return rows.map(r => ({
      ...r,
      limit_amount: Number(r.limit_amount) || 0,
      period_start: r.period_start instanceof Date ? r.period_start.toISOString().slice(0, 10) : String(r.period_start).slice(0, 10),
      period_end: r.period_end instanceof Date ? r.period_end.toISOString().slice(0, 10) : String(r.period_end).slice(0, 10)
    }));
  },

  async getBudget(id, userId) {
    const { rows } = await pool.query(
      'SELECT * FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      limit_amount: Number(rows[0].limit_amount) || 0,
      period_start: rows[0].period_start instanceof Date ? rows[0].period_start.toISOString().slice(0, 10) : String(rows[0].period_start).slice(0, 10),
      period_end: rows[0].period_end instanceof Date ? rows[0].period_end.toISOString().slice(0, 10) : String(rows[0].period_end).slice(0, 10)
    };
  },

  async upsertBudget(userId, budgetData) {
    const { category, limit_amount } = budgetData;
    const numLimit = Number(limit_amount);
    if (isNaN(numLimit) || numLimit <= 0) throw new Error('Budget limit must be a positive number');

    const now = new Date();
    const pStart = budgetData.period_start || `${now.toISOString().slice(0, 7)}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const pEnd = budgetData.period_end || `${now.toISOString().slice(0, 7)}-${String(lastDay).padStart(2, '0')}`;

    const { rows } = await pool.query(`
      INSERT INTO budgets (id, user_id, category, limit_amount, period_start, period_end, currency)
      VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, $5, 'INR')
      ON CONFLICT (user_id, category, period_start) DO UPDATE SET
        limit_amount = EXCLUDED.limit_amount,
        period_end   = EXCLUDED.period_end,
        updated_at   = NOW()
      RETURNING *
    `, [userId, category, numLimit, pStart, pEnd]);

    return {
      ...rows[0],
      limit_amount: Number(rows[0].limit_amount) || 0,
      period_start: rows[0].period_start instanceof Date ? rows[0].period_start.toISOString().slice(0, 10) : String(rows[0].period_start).slice(0, 10),
      period_end: rows[0].period_end instanceof Date ? rows[0].period_end.toISOString().slice(0, 10) : String(rows[0].period_end).slice(0, 10)
    };
  },

  async deleteBudget(id, userId) {
    const { rowCount } = await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  },

  // ── GOALS ──────────────────────────────────────────────────────────────────

  async getGoals(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return rows.map(r => ({
      ...r,
      target_amount: Number(r.target_amount) || 0,
      current_amount: Number(r.current_amount) || 0,
      deadline: r.deadline instanceof Date ? r.deadline.toISOString().slice(0, 10) : (r.deadline ? String(r.deadline).slice(0, 10) : '')
    }));
  },

  async getGoal(id, userId) {
    const { rows } = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      target_amount: Number(rows[0].target_amount) || 0,
      current_amount: Number(rows[0].current_amount) || 0,
      deadline: rows[0].deadline instanceof Date ? rows[0].deadline.toISOString().slice(0, 10) : (rows[0].deadline ? String(rows[0].deadline).slice(0, 10) : '')
    };
  },

  async createGoal(userId, goalData) {
    const target = Number(goalData.target_amount);
    if (isNaN(target) || target <= 0) throw new Error('Goal target amount must be a positive number');

    const { rows } = await pool.query(`
      INSERT INTO goals (id, user_id, name, target_amount, current_amount, deadline, status, icon, color, notes)
      VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, $5, 'active', $6, $7, $8)
      RETURNING *
    `, [
      userId,
      goalData.name,
      target,
      Number(goalData.current_amount) || 0,
      goalData.deadline || null,
      goalData.icon || '🎯',
      goalData.color || '#6366F1',
      goalData.notes || ''
    ]);

    return {
      ...rows[0],
      target_amount: Number(rows[0].target_amount) || 0,
      current_amount: Number(rows[0].current_amount) || 0,
      deadline: rows[0].deadline instanceof Date ? rows[0].deadline.toISOString().slice(0, 10) : (rows[0].deadline ? String(rows[0].deadline).slice(0, 10) : '')
    };
  },

  async updateGoal(id, userId, updates) {
    const existing = await this.getGoal(id, userId);
    if (!existing) return null;

    const { rows } = await pool.query(`
      UPDATE goals SET
        name           = COALESCE($3, name),
        target_amount  = COALESCE($4, target_amount),
        current_amount = COALESCE($5, current_amount),
        deadline       = COALESCE($6, deadline),
        status         = COALESCE($7, status),
        notes          = COALESCE($8, notes),
        updated_at     = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [
      id, userId,
      updates.name || null,
      updates.target_amount !== undefined ? Number(updates.target_amount) : null,
      updates.current_amount !== undefined ? Number(updates.current_amount) : null,
      updates.deadline !== undefined ? updates.deadline : null,
      updates.status || null,
      updates.notes !== undefined ? updates.notes : null
    ]);

    if (!rows[0]) return null;
    return {
      ...rows[0],
      target_amount: Number(rows[0].target_amount) || 0,
      current_amount: Number(rows[0].current_amount) || 0,
      deadline: rows[0].deadline instanceof Date ? rows[0].deadline.toISOString().slice(0, 10) : (rows[0].deadline ? String(rows[0].deadline).slice(0, 10) : '')
    };
  },

  async deleteGoal(id, userId) {
    const { rowCount } = await pool.query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  },

  async addGoalContribution(goalId, userId, amount, notes) {
    const goal = await this.getGoal(goalId, userId);
    if (!goal) throw new Error('Goal not found');

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) throw new Error('Contribution amount must be greater than 0');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const newCurrent = Number(goal.current_amount) + numAmount;
      const newStatus = newCurrent >= Number(goal.target_amount) ? 'completed' : goal.status;

      const { rows: goalRows } = await client.query(`
        UPDATE goals SET
          current_amount = $3,
          status         = $4,
          updated_at     = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [goalId, userId, newCurrent, newStatus]);

      const { rows: contribRows } = await client.query(`
        INSERT INTO goal_contributions (id, goal_id, user_id, amount, notes, contributed_at)
        VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, NOW())
        RETURNING *
      `, [goalId, userId, numAmount, notes || '']);

      await client.query('COMMIT');

      const updatedGoal = goalRows[0];
      return {
        goal: {
          ...updatedGoal,
          target_amount: Number(updatedGoal.target_amount) || 0,
          current_amount: Number(updatedGoal.current_amount) || 0
        },
        contribution: {
          ...contribRows[0],
          amount: Number(contribRows[0].amount) || 0
        }
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // ── RECURRING TRANSACTIONS ─────────────────────────────────────────────────

  async getRecurring(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM recurring_transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return rows.map(r => ({
      ...r,
      amount: Number(r.amount) || 0,
      next_due_date: r.next_due_date instanceof Date ? r.next_due_date.toISOString().slice(0, 10) : String(r.next_due_date).slice(0, 10),
      start_date: r.start_date instanceof Date ? r.start_date.toISOString().slice(0, 10) : String(r.start_date).slice(0, 10)
    }));
  },

  async createRecurring(userId, data) {
    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) throw new Error('Amount must be positive');

    const { rows } = await pool.query(`
      INSERT INTO recurring_transactions
        (id, user_id, account_id, category, type, amount, title, frequency, start_date, next_due_date, end_date, status, notes)
      VALUES
        (gen_random_uuid()::TEXT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', $11)
      RETURNING *
    `, [
      userId,
      data.account_id || data.accountId || null,
      data.category || 'Other',
      data.type || 'expense',
      amount,
      data.title,
      data.frequency || 'monthly',
      data.start_date || data.nextDueDate || new Date().toISOString().slice(0, 10),
      data.next_due_date || data.nextDueDate || new Date().toISOString().slice(0, 10),
      data.end_date || null,
      data.notes || ''
    ]);

    const r = rows[0];
    return {
      ...r,
      amount: Number(r.amount) || 0,
      next_due_date: r.next_due_date instanceof Date ? r.next_due_date.toISOString().slice(0, 10) : String(r.next_due_date).slice(0, 10),
      start_date: r.start_date instanceof Date ? r.start_date.toISOString().slice(0, 10) : String(r.start_date).slice(0, 10)
    };
  },

  async updateRecurring(id, userId, updates) {
    const { rows } = await pool.query(`
      UPDATE recurring_transactions SET
        account_id    = COALESCE($3, account_id),
        category      = COALESCE($4, category),
        type          = COALESCE($5, type),
        amount        = COALESCE($6, amount),
        title         = COALESCE($7, title),
        frequency     = COALESCE($8, frequency),
        next_due_date = COALESCE($9, next_due_date),
        status        = COALESCE($10, status),
        notes         = COALESCE($11, notes),
        updated_at    = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [
      id, userId,
      updates.account_id || null,
      updates.category || null,
      updates.type || null,
      updates.amount !== undefined ? Number(updates.amount) : null,
      updates.title || null,
      updates.frequency || null,
      updates.next_due_date || updates.nextDueDate || null,
      updates.status || null,
      updates.notes !== undefined ? updates.notes : null
    ]);

    if (!rows[0]) return null;
    const r = rows[0];
    return {
      ...r,
      amount: Number(r.amount) || 0,
      next_due_date: r.next_due_date instanceof Date ? r.next_due_date.toISOString().slice(0, 10) : String(r.next_due_date).slice(0, 10)
    };
  },

  async deleteRecurring(id, userId) {
    const { rowCount } = await pool.query(
      'DELETE FROM recurring_transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  }
};

module.exports = db;

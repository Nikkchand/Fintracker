-- FinTrakr Production PostgreSQL Schema
-- Compatible with Supabase, Neon, Google Cloud SQL, RDS
-- Created: 2026-08-16

-- Enable UUID extension (available by default on Supabase/most managed Postgres)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                        -- Firebase UID
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('checking','savings','credit','investment','cash','wallet','other')),
    balance NUMERIC(15,2) NOT NULL DEFAULT 0,
    account_number TEXT,
    color TEXT DEFAULT 'from-indigo-600 to-purple-600',
    icon TEXT DEFAULT 'Wallet',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    currency TEXT NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON accounts(user_id, is_archived);

-- ============================================================
-- CATEGORIES (system defaults)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,  -- NULL = system category
    name TEXT NOT NULL,
    icon TEXT DEFAULT '📦',
    color TEXT DEFAULT '#6366F1',
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO categories (id, user_id, name, icon, color, is_system) VALUES
    ('cat-food',          NULL, 'Food',          '🍔', '#F59E0B', TRUE),
    ('cat-rent',          NULL, 'Rent',          '🏠', '#3B82F6', TRUE),
    ('cat-travel',        NULL, 'Travel',        '✈️', '#8B5CF6', TRUE),
    ('cat-bills',         NULL, 'Bills',         '💡', '#F97316', TRUE),
    ('cat-shopping',      NULL, 'Shopping',      '🛍️', '#EC4899', TRUE),
    ('cat-education',     NULL, 'Education',     '🎓', '#06B6D4', TRUE),
    ('cat-salary',        NULL, 'Salary',        '💰', '#10B981', TRUE),
    ('cat-freelance',     NULL, 'Freelance',     '💻', '#6366F1', TRUE),
    ('cat-health',        NULL, 'Health',        '🏥', '#EF4444', TRUE),
    ('cat-entertainment', NULL, 'Entertainment', '🎬', '#84CC16', TRUE),
    ('cat-other',         NULL, 'Other',         '📦', '#9CA3AF', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    category TEXT NOT NULL DEFAULT 'Other',
    type TEXT NOT NULL CHECK(type IN ('income','expense','transfer')),
    amount NUMERIC(15,2) NOT NULL CHECK(amount > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    title TEXT NOT NULL,
    merchant TEXT,
    description TEXT,
    transaction_date DATE NOT NULL,
    notes TEXT,
    receipt_id TEXT,
    transfer_to_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tx_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_tx_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(user_id, category);
CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(user_id, type);

-- ============================================================
-- BUDGETS
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    limit_amount NUMERIC(15,2) NOT NULL CHECK(limit_amount > 0),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, category, period_start)
);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, period_start, period_end);

-- ============================================================
-- GOALS
-- ============================================================
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(15,2) NOT NULL CHECK(target_amount > 0),
    current_amount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK(current_amount >= 0),
    deadline DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','paused','cancelled')),
    icon TEXT DEFAULT '🎯',
    color TEXT DEFAULT '#6366F1',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- ============================================================
-- GOAL CONTRIBUTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS goal_contributions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL CHECK(amount > 0),
    notes TEXT,
    contributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contributions_goal_id ON goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON goal_contributions(user_id);

-- ============================================================
-- RECURRING TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    category TEXT NOT NULL DEFAULT 'Other',
    type TEXT NOT NULL CHECK(type IN ('income','expense')),
    amount NUMERIC(15,2) NOT NULL CHECK(amount > 0),
    title TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK(frequency IN ('daily','weekly','monthly','yearly')),
    start_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','cancelled')),
    notes TEXT,
    last_processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next_due ON recurring_transactions(next_due_date, status);

-- ============================================================
-- AI REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_reports (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL DEFAULT 'monthly_insights',
    content TEXT NOT NULL,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_reports_user ON ai_reports(user_id);

-- =============================================================================
-- Budget Tracker - Database Setup Script
-- Target: PostgreSQL 15+
-- Idempotent: safe to run multiple times
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table: users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL          NOT NULL,
    name          VARCHAR(255)    NOT NULL,
    email         VARCHAR(255)    NOT NULL,
    password_hash VARCHAR(255)    NULL     DEFAULT NULL,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users       PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE      (email)
);

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users (email);

-- -----------------------------------------------------------------------------
-- Table: categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id   SERIAL         NOT NULL,
    name VARCHAR(100)   NOT NULL,
    type VARCHAR(10)    NOT NULL,

    CONSTRAINT pk_categories      PRIMARY KEY (id),
    CONSTRAINT uq_categories_name UNIQUE      (name),
    CONSTRAINT ck_categories_type CHECK       (type IN ('income', 'expense'))
);

-- Seed data (idempotent via ON CONFLICT DO NOTHING)
INSERT INTO categories (id, name, type) VALUES
    (1, 'Food',          'expense'),
    (2, 'Utilities',     'expense'),
    (3, 'Transport',     'expense'),
    (4, 'Entertainment', 'expense'),
    (5, 'Health',        'expense'),
    (6, 'Income',        'income'),
    (7, 'Other',         'expense')
ON CONFLICT (name) DO NOTHING;

-- Ensure the sequence stays ahead of the manually-specified IDs
SELECT setval(
    pg_get_serial_sequence('categories', 'id'),
    GREATEST((SELECT MAX(id) FROM categories), 1),
    true
);

-- -----------------------------------------------------------------------------
-- Table: transactions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id          SERIAL           NOT NULL,
    name        VARCHAR(255)     NOT NULL,
    amount      NUMERIC(12, 2)   NOT NULL,
    category_id INTEGER          NOT NULL,
    user_id     INTEGER          NOT NULL,
    date        DATE             NOT NULL,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_transactions          PRIMARY KEY (id),
    CONSTRAINT fk_transactions_category FOREIGN KEY (category_id)
        REFERENCES categories (id) ON DELETE RESTRICT,
    CONSTRAINT fk_transactions_user     FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_transactions_amount   CHECK (amount <> 0)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id
    ON transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date
    ON transactions (date);

CREATE INDEX IF NOT EXISTS idx_transactions_category_id
    ON transactions (category_id);

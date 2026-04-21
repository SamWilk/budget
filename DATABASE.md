# Database Schema — Budget Tracker (PostgreSQL)

This document defines all database objects (tables, columns, constraints, indexes, and relationships)
required for the Budget Tracker application. It is intended to be consumed by an agent or developer
to generate SQL DDL scripts.

---

## Overview

The application has three core entities:

| Entity      | Table Name     | Description                                      |
| ----------- | -------------- | ------------------------------------------------ |
| User        | `users`        | Application accounts. Auth is email-based (JWT). |
| Category    | `categories`   | Labels for transactions (income or expense).     |
| Transaction | `transactions` | Financial records owned by a user.               |

---

## Table: `users`

Stores registered user accounts.

| Column          | Data Type      | Nullable | Default        | Description                                                               |
| --------------- | -------------- | -------- | -------------- | ------------------------------------------------------------------------- |
| `id`            | `SERIAL`       | NOT NULL | auto-increment | Primary key.                                                              |
| `name`          | `VARCHAR(255)` | NOT NULL | —              | Display name of the user.                                                 |
| `email`         | `VARCHAR(255)` | NOT NULL | —              | Unique email address. Used to identify user.                              |
| `password_hash` | `VARCHAR(255)` | NULL     | NULL           | Bcrypt hash of password. NULL = email-only login (current dev behaviour). |
| `created_at`    | `TIMESTAMPTZ`  | NOT NULL | `NOW()`        | Timestamp of account creation.                                            |

### Constraints

- `PRIMARY KEY (id)`
- `UNIQUE (email)`

### Indexes

- `idx_users_email` on `email` — supports login lookup by email.

---

## Table: `categories`

Lookup table of transaction categories. Shared across all users (global, not user-scoped).

| Column | Data Type      | Nullable | Default        | Description                                            |
| ------ | -------------- | -------- | -------------- | ------------------------------------------------------ |
| `id`   | `SERIAL`       | NOT NULL | auto-increment | Primary key.                                           |
| `name` | `VARCHAR(100)` | NOT NULL | —              | Human-readable category label (e.g. "Food", "Income"). |
| `type` | `VARCHAR(10)`  | NOT NULL | —              | Must be one of: `income`, `expense`.                   |

### Constraints

- `PRIMARY KEY (id)`
- `UNIQUE (name)` — prevents duplicate category names.
- `CHECK (type IN ('income', 'expense'))` — enforces valid category types.

### Seed Data

The following rows must be inserted as initial seed data:

| id  | name          | type    |
| --- | ------------- | ------- |
| 1   | Food          | expense |
| 2   | Utilities     | expense |
| 3   | Transport     | expense |
| 4   | Entertainment | expense |
| 5   | Health        | expense |
| 6   | Income        | income  |
| 7   | Other         | expense |

---

## Table: `transactions`

Financial transactions belonging to a specific user, linked to a category.

| Column        | Data Type       | Nullable | Default        | Description                                                              |
| ------------- | --------------- | -------- | -------------- | ------------------------------------------------------------------------ |
| `id`          | `SERIAL`        | NOT NULL | auto-increment | Primary key.                                                             |
| `name`        | `VARCHAR(255)`  | NOT NULL | —              | Short description of the transaction (e.g. "Grocery run").               |
| `amount`      | `NUMERIC(12,2)` | NOT NULL | —              | Monetary value. Must be non-zero. Positive = income, negative = expense. |
| `category_id` | `INTEGER`       | NOT NULL | —              | Foreign key → `categories.id`.                                           |
| `user_id`     | `INTEGER`       | NOT NULL | —              | Foreign key → `users.id`. Scopes the record to the owning user.          |
| `date`        | `DATE`          | NOT NULL | —              | The date the transaction occurred (not the creation timestamp).          |
| `created_at`  | `TIMESTAMPTZ`   | NOT NULL | `NOW()`        | Timestamp of record creation.                                            |

### Constraints

- `PRIMARY KEY (id)`
- `FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT`
  — Prevent deletion of a category that is in use by transactions.
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
  — Deleting a user removes all their transactions.
- `CHECK (amount <> 0)` — amount must be non-zero.

### Indexes

- `idx_transactions_user_id` on `user_id` — supports filtering transactions by user (used on every list query).
- `idx_transactions_date` on `date` — supports date-range queries and ordering.
- `idx_transactions_category_id` on `category_id` — supports join to categories and category-based filtering.

---

## Relationships

```
users (1) ──< transactions (many)   via transactions.user_id → users.id
categories (1) ──< transactions (many)   via transactions.category_id → categories.id
```

- One user can have zero or many transactions.
- One category can be assigned to zero or many transactions.
- Categories are not user-scoped (they are global/shared).

---

## Notes for SQL Script Generation

1. **Schema order**: Create tables in this order to satisfy foreign key dependencies:
   `users` → `categories` → `transactions`

2. **Sequences**: Use `SERIAL` (or `GENERATED ALWAYS AS IDENTITY`) for all primary keys.

3. **Timezone**: Use `TIMESTAMPTZ` (not `TIMESTAMP`) for all timestamp columns to ensure UTC storage.

4. **Password field**: `password_hash` is nullable to support the current dev flow (email-only login).
   When password auth is added, populate this column with a bcrypt hash and add a `NOT NULL` constraint.

5. **Seed data**: Insert the 7 seed categories after creating the `categories` table.
   Use `ON CONFLICT DO NOTHING` to make the seed idempotent.

6. **Environment**: Target PostgreSQL 15+.

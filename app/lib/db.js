import pg from 'pg';

const { Pool } = pg;

// Return NUMERIC(12,2) as JS number instead of string
pg.types.setTypeParser(1700, parseFloat);
// Return DATE as 'YYYY-MM-DD' string instead of JS Date (avoids UTC midnight timezone shift)
pg.types.setTypeParser(1082, (val) => val);

const globalForPg = globalThis;

const pool =
  globalForPg._pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== 'production') {
  globalForPg._pgPool = pool;
}

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

// --- Categories ---

export async function getCategories() {
  const { rows } = await query('SELECT id, name, type FROM categories ORDER BY id');
  return rows;
}

export async function getCategoryById(id) {
  const { rows } = await query(
    'SELECT id, name, type FROM categories WHERE id = $1',
    [id],
  );
  return rows[0] || null;
}

export async function createCategory({ name, type }) {
  const { rows } = await query(
    'INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING id, name, type',
    [name, type],
  );
  return rows[0];
}

export async function updateCategory(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  if (updates.name !== undefined) { fields.push(`name = $${i++}`); values.push(updates.name); }
  if (updates.type !== undefined) { fields.push(`type = $${i++}`); values.push(updates.type); }
  if (fields.length === 0) return getCategoryById(id);
  values.push(id);
  const { rows } = await query(
    `UPDATE categories SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, name, type`,
    values,
  );
  return rows[0] || null;
}

export async function deleteCategory(id) {
  const { rowCount } = await query('DELETE FROM categories WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

// --- Users ---

export async function getUsers() {
  const { rows } = await query(
    'SELECT id, name, email, created_at AS "createdAt" FROM users ORDER BY id',
  );
  return rows;
}

export async function getUserById(id) {
  const { rows } = await query(
    'SELECT id, name, email, created_at AS "createdAt" FROM users WHERE id = $1',
    [id],
  );
  return rows[0] || null;
}

export async function getUserByEmail(email) {
  const { rows } = await query(
    'SELECT id, name, email, created_at AS "createdAt" FROM users WHERE email = $1',
    [email],
  );
  return rows[0] || null;
}

export async function createUser({ name, email }) {
  const { rows } = await query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at AS "createdAt"',
    [name, email],
  );
  return rows[0];
}

export async function updateUser(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  if (updates.name !== undefined) { fields.push(`name = $${i++}`); values.push(updates.name); }
  if (updates.email !== undefined) { fields.push(`email = $${i++}`); values.push(updates.email); }
  if (fields.length === 0) return getUserById(id);
  values.push(id);
  const { rows } = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, name, email, created_at AS "createdAt"`,
    values,
  );
  return rows[0] || null;
}

export async function deleteUser(id) {
  const { rowCount } = await query('DELETE FROM users WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

// --- Transactions ---

export async function getTransactions(userId) {
  const { rows } = await query(
    `SELECT t.id, t.name, t.amount, t.category_id AS "categoryId", t.user_id AS "userId",
            t.date, t.created_at AS "createdAt", c.name AS category
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
     ORDER BY t.date DESC, t.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function getTransactionById(id, userId) {
  const { rows } = await query(
    `SELECT t.id, t.name, t.amount, t.category_id AS "categoryId", t.user_id AS "userId",
            t.date, t.created_at AS "createdAt", c.name AS category
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.id = $1 AND t.user_id = $2`,
    [id, userId],
  );
  return rows[0] || null;
}

export async function createTransaction({ name, amount, categoryId, date, userId }) {
  const { rows } = await query(
    `INSERT INTO transactions (name, amount, category_id, user_id, date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, amount, category_id AS "categoryId", user_id AS "userId",
               date, created_at AS "createdAt"`,
    [name, amount, categoryId, userId, date],
  );
  const t = rows[0];
  const cat = await getCategoryById(categoryId);
  return { ...t, category: cat ? cat.name : 'Unknown' };
}

export async function updateTransaction(id, updates, userId) {
  const fields = [];
  const values = [];
  let i = 1;
  if (updates.name !== undefined) { fields.push(`name = $${i++}`); values.push(updates.name); }
  if (updates.amount !== undefined) { fields.push(`amount = $${i++}`); values.push(updates.amount); }
  if (updates.categoryId !== undefined) { fields.push(`category_id = $${i++}`); values.push(updates.categoryId); }
  if (updates.date !== undefined) { fields.push(`date = $${i++}`); values.push(updates.date); }
  if (fields.length === 0) return getTransactionById(id, userId);
  values.push(id, userId);
  const { rows } = await query(
    `UPDATE transactions SET ${fields.join(', ')} WHERE id = $${i} AND user_id = $${i + 1}
     RETURNING id, name, amount, category_id AS "categoryId", user_id AS "userId",
               date, created_at AS "createdAt"`,
    values,
  );
  if (!rows[0]) return null;
  const t = rows[0];
  const cat = await getCategoryById(t.categoryId);
  return { ...t, category: cat ? cat.name : 'Unknown' };
}

export async function deleteTransaction(id, userId) {
  const { rowCount } = await query(
    'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
    [id, userId],
  );
  return (rowCount ?? 0) > 0;
}

export async function clearTransactions(userId) {
  await query('DELETE FROM transactions WHERE user_id = $1', [userId]);
}

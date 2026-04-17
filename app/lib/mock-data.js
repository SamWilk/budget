let nextUserId = 3;
let nextCategoryId = 8;
let nextTransactionId = 6;

const users = [
  {
    id: 1,
    name: "Sam",
    email: "sam@example.com",
    createdAt: "2026-04-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Alex",
    email: "alex@example.com",
    createdAt: "2026-04-05T00:00:00Z",
  },
];

const categories = [
  { id: 1, name: "Food", type: "expense" },
  { id: 2, name: "Utilities", type: "expense" },
  { id: 3, name: "Transport", type: "expense" },
  { id: 4, name: "Entertainment", type: "expense" },
  { id: 5, name: "Health", type: "expense" },
  { id: 6, name: "Income", type: "income" },
  { id: 7, name: "Other", type: "expense" },
];

const transactions = [];

export function getCategories() {
  return [...categories];
}

export function getCategoryById(id) {
  return categories.find((c) => c.id === id) || null;
}

export function createCategory({ name, type }) {
  const category = { id: nextCategoryId++, name, type };
  categories.push(category);
  return category;
}

export function updateCategory(id, updates) {
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;
  categories[index] = { ...categories[index], ...updates };
  return categories[index];
}

export function deleteCategory(id) {
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return false;
  categories.splice(index, 1);
  return true;
}

// --- Users ---

export function getUsers() {
  return users.map(({ ...u }) => u);
}

export function getUserById(id) {
  return users.find((u) => u.id === id) || null;
}

export function getUserByEmail(email) {
  return users.find((u) => u.email === email) || null;
}

export function createUser({ name, email }) {
  const user = {
    id: nextUserId++,
    name,
    email,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

export function updateUser(id, updates) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  return users[index];
}

export function deleteUser(id) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

// --- Transactions ---

export function getTransactions(userId) {
  const filtered = userId
    ? transactions.filter((t) => t.userId === userId)
    : transactions;
  return filtered.map((t) => {
    const category = getCategoryById(t.categoryId);
    return { ...t, category: category ? category.name : "Unknown" };
  });
}

export function getTransactionById(id, userId) {
  const t = transactions.find(
    (t) => t.id === id && (!userId || t.userId === userId),
  );
  if (!t) return null;
  const category = getCategoryById(t.categoryId);
  return { ...t, category: category ? category.name : "Unknown" };
}

export function createTransaction({ name, amount, categoryId, date, userId }) {
  const transaction = {
    id: nextTransactionId++,
    name,
    amount,
    categoryId,
    userId,
    date,
    createdAt: new Date().toISOString(),
  };
  transactions.push(transaction);
  const category = getCategoryById(categoryId);
  return { ...transaction, category: category ? category.name : "Unknown" };
}

export function updateTransaction(id, updates, userId) {
  const index = transactions.findIndex(
    (t) => t.id === id && (!userId || t.userId === userId),
  );
  if (index === -1) return null;
  transactions[index] = { ...transactions[index], ...updates };
  const t = transactions[index];
  const category = getCategoryById(t.categoryId);
  return { ...t, category: category ? category.name : "Unknown" };
}

export function deleteTransaction(id, userId) {
  const index = transactions.findIndex(
    (t) => t.id === id && (!userId || t.userId === userId),
  );
  if (index === -1) return false;
  transactions.splice(index, 1);
  return true;
}

export function clearTransactions(userId) {
  for (let i = transactions.length - 1; i >= 0; i--) {
    if (transactions[i].userId === userId) {
      transactions.splice(i, 1);
    }
  }
}

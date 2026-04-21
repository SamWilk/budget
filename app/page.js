"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import SummaryCard from "./components/SummaryCard/SummaryCard";
import TransactionList from "./components/TransactionList/TransactionList";
import SpendingChart from "./components/SpendingChart/SpendingChart";
import AddTransactionModal from "./components/AddTransactionModal/AddTransactionModal";

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCurrency(value) {
  return Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const [txRes, catRes, userRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/categories"),
        fetch("/api/users/me"),
      ]);
      if (
        txRes.status === 401 ||
        catRes.status === 401 ||
        userRes.status === 401
      ) {
        router.push("/login");
        return;
      }
      const [txData, catData, userData] = await Promise.all([
        txRes.json(),
        catRes.json(),
        userRes.json(),
      ]);
      setTransactions(txData);
      setCategories(catData);
      setUser(userData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income + expenses;

  async function handleAdd(newTx) {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTx),
    });
    const created = await res.json();
    setTransactions((prev) => [created, ...prev]);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleClear() {
    if (!confirm("Clear all transactions? This can't be undone.")) return;
    await fetch("/api/transactions", { method: "DELETE" });
    setTransactions([]);
  }

  // Format transactions for display
  const displayTransactions = transactions.map((t) => ({
    ...t,
    date: formatDate(t.date),
  }));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h1>Budget Tracker</h1>
          {user && (
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Log out
            </button>
          )}
        </div>
        {user && <p className={styles.greeting}>Welcome, {user.name}</p>}
      </header>

      <main className={styles.main}>
        <section className={styles.summary}>
          <SummaryCard
            label="Balance"
            value={`$${formatCurrency(balance)}`}
            variant="balance"
          />
          <SummaryCard
            label="Income"
            value={`+$${formatCurrency(income)}`}
            variant="income"
          />
          <SummaryCard
            label="Expenses"
            value={`-$${formatCurrency(expenses)}`}
            variant="expense"
          />
        </section>

        <div className={styles.columns}>
          {!loading && <SpendingChart transactions={transactions} />}

          <TransactionList
            transactions={displayTransactions}
            onAddClick={() => setShowModal(true)}
            onClear={handleClear}
            loading={loading}
          />
        </div>
      </main>

      {showModal && (
        <AddTransactionModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}

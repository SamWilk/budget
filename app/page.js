"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import SummaryCard from "./components/SummaryCard/SummaryCard";
import TransactionList from "./components/TransactionList/TransactionList";
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

        <TransactionList
          transactions={displayTransactions}
          onAddClick={() => setShowModal(true)}
          loading={loading}
        />
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

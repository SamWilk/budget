"use client";

import { useState } from "react";
import styles from "./page.module.css";
import SummaryCard from "./components/SummaryCard/SummaryCard";
import TransactionList from "./components/TransactionList/TransactionList";
import AddTransactionModal from "./components/AddTransactionModal/AddTransactionModal";

const INITIAL_TRANSACTIONS = [
  { id: 1, name: "Groceries", amount: -82.5, date: "Apr 15", category: "Food" },
  {
    id: 2,
    name: "Paycheck",
    amount: 2400.0,
    date: "Apr 14",
    category: "Income",
  },
  {
    id: 3,
    name: "Electric Bill",
    amount: -124.3,
    date: "Apr 12",
    category: "Utilities",
  },
  {
    id: 4,
    name: "Coffee Shop",
    amount: -5.75,
    date: "Apr 11",
    category: "Food",
  },
  {
    id: 5,
    name: "Freelance Work",
    amount: 350.0,
    date: "Apr 10",
    category: "Income",
  },
];

function formatCurrency(value) {
  return Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export default function Home() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [showModal, setShowModal] = useState(false);

  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income + expenses;

  function handleAdd(transaction) {
    setTransactions((prev) => [transaction, ...prev]);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Budget Tracker</h1>
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
          transactions={transactions}
          onAddClick={() => setShowModal(true)}
        />
      </main>

      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}

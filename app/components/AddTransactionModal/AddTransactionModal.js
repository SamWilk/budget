"use client";

import { useState } from "react";
import styles from "./AddTransactionModal.module.css";

export default function AddTransactionModal({ categories, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");

  function handleSubmit(e) {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount === 0) return;

    const selectedCategory = categories.find(
      (c) => c.id === Number(categoryId),
    );
    const finalAmount =
      selectedCategory?.type === "income"
        ? Math.abs(parsedAmount)
        : -Math.abs(parsedAmount);

    onAdd({
      name: name.trim(),
      amount: finalAmount,
      categoryId: Number(categoryId),
      date: new Date().toISOString().split("T")[0],
    });

    onClose();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Add Transaction</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries"
              autoFocus
              required
            />
          </label>
          <label className={styles.field}>
            <span>Amount</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </label>
          <label className={styles.field}>
            <span>Category</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

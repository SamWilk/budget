import styles from "./TransactionList.module.css";
import TransactionItem from "../TransactionItem/TransactionItem";

export default function TransactionList({
  transactions,
  onAddClick,
  onClear,
  loading,
}) {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2>Recent Transactions</h2>
        <div className={styles.actions}>
          {transactions.length > 0 && (
            <button className={styles.clearBtn} onClick={onClear}>
              Clear All
            </button>
          )}
          <button className={styles.addBtn} onClick={onAddClick}>
            + Add
          </button>
        </div>
      </div>
      {loading ? (
        <p className={styles.empty}>Loading...</p>
      ) : transactions.length === 0 ? (
        <p className={styles.empty}>
          No transactions yet. Add one to get started.
        </p>
      ) : (
        <ul className={styles.list}>
          {transactions.map((t) => (
            <TransactionItem
              key={t.id}
              name={t.name}
              amount={t.amount}
              category={t.category}
              date={t.date}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

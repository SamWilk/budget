import styles from "./TransactionItem.module.css";

export default function TransactionItem({ name, amount, category, date }) {
  const isPositive = amount > 0;

  return (
    <li className={styles.item}>
      <div className={styles.left}>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>
          {category}
          {date ? ` · ${date}` : ""}
        </span>
      </div>
      <span
        className={`${styles.amount} ${isPositive ? styles.positive : styles.negative}`}
      >
        {isPositive ? "+" : "-"}$
        {Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </span>
    </li>
  );
}

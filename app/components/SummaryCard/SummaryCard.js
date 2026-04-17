import styles from "./SummaryCard.module.css";

export default function SummaryCard({ label, value, variant }) {
  return (
    <div className={`${styles.card} ${styles[variant] || ""}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

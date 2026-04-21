"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Sign up failed");
      setSubmitting(false);
      return;
    }

    router.push("/");
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Budget Tracker</h1>
        <p className={styles.subtitle}>Create an account</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className={styles.input}
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

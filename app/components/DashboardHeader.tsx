"use client";

import React from "react";
import styles from "./DashboardHeader.module.css";

type Props = {
  displayName?: string | null;
  email?: string | null;
};

export default function DashboardHeader({ displayName, email }: Props) {
  const initials = displayName
    ? displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : email
    ? email[0].toUpperCase()
    : "U";

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}></div>
        <div className={styles.titleWrap}>
          <div className={styles.title}>iPurpose</div>
          <div className={styles.tag}>Your AI-powered life design platform</div>
        </div>
      </div>

      <div className={styles.user}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userInfo}>
          <div className={styles.name}>{displayName || "User"}</div>
          <div className={styles.email}>{email || ""}</div>
        </div>
      </div>
    </header>
  );
}

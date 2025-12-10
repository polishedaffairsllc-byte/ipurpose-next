"use client";

import React from "react";
import styles from "./DashboardHeader.module.css";

type Props = {
  displayName?: string | null;
  email?: string | null;
};

export default function DashboardHeader({ displayName, email }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}></div>
        <div className={styles.titleWrap}>
          <div className={styles.title}>iPurpose</div>
          <div className={styles.tag}>Living with Intention</div>
        </div>
      </div>
      <div className={styles.user}>
        <div className={styles.userInfo}>
          <div className={styles.name}>{displayName || "User"}</div>
          <div className={styles.email}>{email || ""}</div>
        </div>
        <div className={styles.avatar}>
          {(displayName?.[0] || email?.[0] || "U").toUpperCase()}
        </div>
      </div>
    </header>
  );
}

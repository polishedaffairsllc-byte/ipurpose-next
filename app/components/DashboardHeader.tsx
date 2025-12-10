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
        <div className={styles.logo} aria-hidden="true"></div>
        <div className={styles.titleWrap}>
          <div className={styles.title}>iPurpose</div>
          <div className={styles.tag}>Focus your work. Amplify your impact.</div>
        </div>
      </div>

      <div className={styles.user}>
        <div className={styles.avatar} aria-hidden="true">
          {displayName ? displayName.charAt(0).toUpperCase() : "U"}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.name}>{displayName ?? "User"}</div>
          <div className={styles.email}>{email ?? ""}</div>
        </div>
      </div>
    </header>
  );
}

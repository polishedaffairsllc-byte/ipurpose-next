"use client";

import React from "react";
import styles from "./IPCard.module.css";

export default function IPCard({ children }: { children: React.ReactNode }) {
  return <div className={styles.card}>{children}</div>;
}


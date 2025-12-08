"use client";

import React from "react";
import styles from "./IPButton.module.css";

interface IPButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function IPButton({ children, ...props }: IPButtonProps) {
  return (
    <button className={styles.button} {...props}>
      {children}
    </button>
  );
}


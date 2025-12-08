"use client";

import React from "react";
import styles from "./IPHeading.module.css";

interface IPHeadingProps {
  children: React.ReactNode;
  size?: "xl" | "lg" | "md" | "sm";
}

export default function IPHeading({ children, size = "xl" }: IPHeadingProps) {
  const map = {
    xl: styles.headingXL,
    lg: styles.headingLG,
    md: styles.headingMD,
    sm: styles.headingSM,
  };

  return <h1 className={map[size]}>{children}</h1>;
}


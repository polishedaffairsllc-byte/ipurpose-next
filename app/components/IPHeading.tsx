import React from "react";
import styles from "./IPHeading.module.css";

export type IPHeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

export default function IPHeading({
  children,
  size = "md",
  className = "",
  ...rest
}: IPHeadingProps) {
  const sizeClass =
    size === "xl"
      ? styles.xl
      : size === "lg"
      ? styles.lg
      : size === "sm"
      ? styles.sm
      : styles.md;

  return (
    <h2 className={`${styles.heading ?? ""} ${sizeClass ?? ""} ${className}`.trim()} {...rest}>
      {children}
    </h2>
  );
}

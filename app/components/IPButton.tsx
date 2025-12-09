import React from "react";
import styles from "./IPButton.module.css";

export type IPButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "champagne";
};

export default function IPButton({
  children,
  className = "",
  variant = "primary",
  ...rest
}: IPButtonProps) {
  const variantClass =
    variant === "secondary"
      ? styles.secondary
      : variant === "champagne"
      ? styles.champagne
      : styles.primary;

  return (
    <button
      type={rest.type ?? "button"}
      className={`${styles.button} ${variantClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

"use client";

import React from "react";
import clsx from "clsx";

interface IPInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function IPInput({ label, className, ...props }: IPInputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ip-muted font-montserrat">
          {label}
        </label>
      )}

      <input
        className={clsx(
          "w-full rounded-brand border border-ip-border bg-ip-input px-4 py-2.5 text-ip-heading placeholder-ip-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-ip-lavender",
          className
        )}
        {...props}
      />
    </div>
  );
}


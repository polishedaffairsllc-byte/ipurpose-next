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
'use client';

import React from 'react';

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 bg-indigoDeep text-offWhite shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side: Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-lavenderViolet rounded-full flex items-center justify-center font-italiana text-xl">
            iP
          </div>
          <h1 className="font-italiana text-2xl font-normal">iPurpose</h1>
        </div>

        {/* Right side: Profile circle */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-salmonPeach rounded-full flex items-center justify-center text-warmCharcoal font-semibold cursor-pointer hover:ring-2 hover:ring-lavenderViolet transition-all">
            U
          </div>
        </div>
      </div>
    </header>
  );
}

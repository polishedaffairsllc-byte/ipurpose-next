'use client';

import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  displayName?: string | null;
  email?: string | null;
}

export default function DashboardHeader({ displayName, email }: DashboardHeaderProps) {
  const userInitial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  return (
    <header className={styles.header}>
      {/* Brand Section */}
      <div className={styles.brand}>
        <div className={styles.logo} />
        <div className={styles.titleWrap}>
          <div className={styles.title}>iPurpose</div>
          <div className={styles.tag}>Where Alignment Meets Action</div>
        </div>
      </div>

      {/* User Section */}
      <div className={styles.user}>
        <div className={styles.userInfo}>
          <div className={styles.name}>{displayName || 'User'}</div>
          <div className={styles.email}>{email || ''}</div>
        </div>
        <div className={styles.avatar}>{userInitial}</div>
      </div>
    </header>
  );
}
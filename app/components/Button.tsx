import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lavenderViolet/40 focus:ring-offset-2';
  
  const variants = {
    primary: 'ipurpose-button-gradient',
    secondary: 'bg-gradient-to-r from-lavenderViolet/10 to-salmonPeach/10 text-indigoDeep hover:from-lavenderViolet/20 hover:to-salmonPeach/20 border border-lavenderViolet/20',
    ghost: 'text-indigoDeep hover:bg-lavenderViolet/10 hover:shadow-soft-sm',
    accent: 'bg-gradient-to-r from-salmonPeach to-softGold text-warmCharcoal hover:shadow-soft-md',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };
  
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
  
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}

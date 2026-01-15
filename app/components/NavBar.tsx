"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState("Guest");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Hide navbar on login, signup, home, clarity-check, discover, about, program, contact, privacy, terms, and all public pages
  const hiddenRoutes = ["/login", "/signup", "/", "/clarity-check", "/discover", "/about", "/program", "/contact", "/privacy", "/terms", "/google-review", "/info-session"];
  const isHidden = hiddenRoutes.includes(pathname) || 
                   pathname.startsWith("/dashboard") || 
                   pathname.startsWith("/soul") || 
                   pathname.startsWith("/systems") || 
                   pathname.startsWith("/ai") || 
                   pathname.startsWith("/insights") || 
                   pathname.startsWith("/settings");
  
  useEffect(() => {
    // Check if user is logged in by looking for session cookie
    const checkSession = async () => {
      try {
        // Try to fetch a protected route to see if we're logged in
        const response = await fetch("/api/profile", { 
          credentials: "include",
          method: "GET"
        });
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setDisplayName(data.displayName || data.email?.split("@")[0] || "Friend");
        }
      } catch (e) {
        // Not logged in or error
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);
  
  if (isHidden) {
    return null;
  }

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-lavenderViolet/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img 
              src="/images/my-logo.png" 
              alt="iPurpose Logo"
              style={{ width: '320px', height: '64px', objectFit: 'contain' }}
            />
          </Link>
          
          {/* Left Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/discover" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
            >
              Discover
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
            >
              About
            </Link>
            <Link 
              href="/program" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
            >
              6-Week Program
            </Link>
            {isLoggedIn && (
              <>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/soul" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
                >
                  Soul
                </Link>
                <Link 
                  href="/systems" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
                >
                  Systems
                </Link>
                <Link 
                  href="/ai" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
                >
                  AI
                </Link>
              </>
            )}
          </nav>

          {/* Right Side - CTAs and Auth */}
          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/clarity-check"
              className="hidden sm:inline-block px-6 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-lavenderViolet to-indigoDeep hover:shadow-lg transition-all"
            >
              Clarity Check
            </Link>
            {isLoggedIn ? (
              <>
                <span className="hidden lg:block text-sm text-warmCharcoal/70">
                  {displayName}
                </span>
                <Link
                  href="/settings"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
                >
                  Settings
                </Link>
                <form action="/api/auth/logout" method="post" className="inline-block">
                  <button 
                    type="submit" 
                    className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-salmonPeach to-lavenderViolet hover:shadow-lg transition-all cursor-pointer border-none"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-lavenderViolet to-salmonPeach hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

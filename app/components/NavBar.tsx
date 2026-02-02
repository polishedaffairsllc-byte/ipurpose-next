"use server";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import React from "react";

export default async function NavBar() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Only show on protected/internal routes
  const publicRoutes = ["/login", "/signup", "/", "/clarity-check", "/discover", "/about", "/program", "/contact", "/privacy", "/terms", "/google-review", "/info-session"];
  const isPublic = publicRoutes.includes(pathname) || pathname.startsWith("/api");
  
  if (isPublic) {
    return null;
  }

  return (
    <header
      className="border-b border-white/10 text-white"
      style={{ backgroundColor: '#0f1017' }}
    >
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
              href="/dashboard" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/soul" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              Soul
            </Link>
            <Link 
              href="/systems" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              Systems
            </Link>
            <Link 
              href="/ai" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              AI
            </Link>
          </nav>

          {/* Right Side - CTAs and Auth */}
          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/settings"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              Settings
            </Link>
            <form action="/api/auth/logout" method="post" className="inline-block">
              <button 
                type="submit" 
                className="px-6 py-2 rounded-lg text-sm font-semibold text-[#0f1017] bg-gradient-to-r from-salmonPeach to-lavenderViolet hover:shadow-lg transition-all cursor-pointer border-none"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

"use server";
import Link from "next/link";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import React from "react";

export default async function NavBar() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  let displayName = "Guest";

  if (session) {
    try {
      const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
      const user = await firebaseAdmin.auth().getUser(decoded.uid);
      displayName = user.displayName || (user.email ? user.email.split("@")[0] : "Friend");
    } catch (e) {
      // If verification fails, fall back to Guest
    }
  }

  return (
    <header className="top-nav">
      <div className="brand">
        <div>iPurpose</div>
        <small>Portal</small>
      </div>

      <nav className="nav-links" aria-label="Main navigation">
        <Link className="nav-link" href="/dashboard">Dashboard</Link>
        <Link className="nav-link" href="/ai">AI</Link>
        <Link className="nav-link" href="/soul">Soul</Link>
        <Link className="nav-link" href="/systems">Systems</Link>
        <Link className="nav-link" href="/settings">Settings</Link>
        <form action="/api/auth/logout" method="post" style={{ display: "inline" }}>
          <button type="submit" className="nav-link" style={{ background: "transparent", border: "none", cursor: "pointer" }}>Logout</button>
        </form>
      </nav>

      <div className="user-greeting">Welcome, {displayName}</div>
    </header>
  );
}

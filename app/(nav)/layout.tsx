import React from "react";
import Footer from "@/app/components/Footer";

export default async function NavLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

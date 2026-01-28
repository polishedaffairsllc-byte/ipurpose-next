import React from "react";
import { cookies } from "next/headers";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";

export default async function NavLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav isAuthed={Boolean(session)} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

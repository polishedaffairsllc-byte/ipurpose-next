import { getDeepenPageAccess } from "@/lib/deepenPageAccess";
import DeepenNavigation from "@/app/components/DeepenNavigation";
import Footer from "@/app/components/Footer";

export default async function DeepenLayout({ children }: { children: React.ReactNode }) {
  const hasAccess = await getDeepenPageAccess();

  // If they don't have access, render children directly (the sales page handles its own UI)
  if (!hasAccess) {
    return <>{children}</>;
  }

  // Subscribers get the Deepen nav + themed layout
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DeepenNavigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

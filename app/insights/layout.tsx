import DeepenNavigation from "@/app/components/DeepenNavigation";
import Footer from "@/app/components/Footer";

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DeepenNavigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

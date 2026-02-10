import AcceleratorNavigation from "@/app/components/AcceleratorNavigation";
import Footer from "@/app/components/Footer";

export default function AcceleratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AcceleratorNavigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

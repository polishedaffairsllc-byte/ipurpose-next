import "./globals.css";
import type { Metadata } from "next";
import { AuthContextProvider } from './context/AuthContext';
import FloatingOrbs from "./components/FloatingOrbs";
import DynamicBackground from "./components/DynamicBackground";
import ConnectionNetwork from "./components/ConnectionNetwork";
import NavBar from "./components/NavBar";
import DashboardSidebar from "./components/DashboardSidebar";

export const metadata: Metadata = {
  title: "iPurpose Platform",
  description: "Align your Soul. Empower your Systems. Expand through AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen font-montserrat text-warmCharcoal">
        <DynamicBackground />
        
        {/* Background texture layer */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -20 }}>
          <div className="absolute inset-0 bg-gradient-to-br from-lavenderViolet/5 via-transparent to-salmonPeach/5"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-softGold/3 via-transparent to-lavenderViolet/3"></div>
        </div>
        
        <FloatingOrbs />
        <ConnectionNetwork />
        
        <AuthContextProvider>
          <NavBar />
          <DashboardSidebar />
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}

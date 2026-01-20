import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AuthContextProvider } from './context/AuthContext';
import FloatingOrbs from "./components/FloatingOrbs";
import DynamicBackground from "./components/DynamicBackground";
import ConnectionNetwork from "./components/ConnectionNetwork";
import InternalNavbar from "./components/InternalNavbar";

export const metadata: Metadata = {
  title: "iPurpose — Where Inner Alignment Becomes Coherent Action",
  description: "iPurpose helps creators move from stuck or self-doubting into clarity and coherent action by integrating inner alignment, practical structure, and thoughtful use of AI.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Trigger rebuild to ensure NavBar removal is picked up
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen font-marcellus text-warmCharcoal">
        <DynamicBackground />
        
        {/* Background texture layer */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -20 }}>
          <div className="absolute inset-0 bg-gradient-to-br from-lavenderViolet/5 via-transparent to-salmonPeach/5"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-softGold/3 via-transparent to-lavenderViolet/3"></div>
        </div>
        
        <FloatingOrbs />
        <ConnectionNetwork />
        
        <AuthContextProvider>
          <InternalNavbar />
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}

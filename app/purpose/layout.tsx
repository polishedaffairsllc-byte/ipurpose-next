import './purpose.css';
import type { ReactNode } from 'react';
import PublicHeader from '@/app/components/PublicHeader';
import Footer from '@/app/components/Footer';

export default function PurposeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="purpose:relative purpose:min-h-screen purpose:bg-lightMistGray purpose:text-indigoDeep">
      <a href="#purpose-content" className="purpose:sr-only purpose:z-50 purpose:rounded-lg purpose:bg-indigoDeep purpose:px-6 purpose:py-3 purpose:text-base purpose:text-lightMistGray purpose:focus:not-sr-only purpose:focus:fixed purpose:focus:left-4 purpose:focus:top-4">Skip to content</a>
      <PublicHeader />
      {children}
      <Footer />
    </div>
  );
}

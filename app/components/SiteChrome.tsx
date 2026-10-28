'use client';
import { usePathname } from 'next/navigation';
import { AuthContextProvider } from '../context/AuthContext';
import BackgroundLayer from './BackgroundLayer';
import InternalNavbar from './InternalNavbar';
import VideoBackground from './VideoBackground';
import PixelInitializer from './PixelInitializer';
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/partnerships/sdsn/')) return children;
  return <>
    {pathname !== '/foundhers-stage' && <PixelInitializer />}
    <div className="fixed inset-0 -z-40"><VideoBackground src="/videos/water-reflection.mp4" /></div>
    <BackgroundLayer />
    <AuthContextProvider><InternalNavbar />{children}</AuthContextProvider>
  </>;
}

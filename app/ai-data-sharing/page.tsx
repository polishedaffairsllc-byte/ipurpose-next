import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';
import PolicyContent from '../components/PolicyContent';
import { aiDataSharingContent } from '@/lib/aiDataSharingContent';
export const metadata = { title: 'AI Data Sharing — iPurpose' };
export default function AiDataSharingPage() {
  return <><PublicHeader /><main className="text-body" style={{ padding: 32, maxWidth: 800, margin: '0 auto', lineHeight: 1.8 }}><PolicyContent blocks={aiDataSharingContent} /><Link href="/privacy">Privacy Policy</Link></main><Footer /></>;
}

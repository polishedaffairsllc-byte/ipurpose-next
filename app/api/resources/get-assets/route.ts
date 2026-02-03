import { NextRequest, NextResponse } from 'next/server';
import { requireUid } from '@/lib/firebase/requireUser';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * GET /api/resources/get-assets
 * Fetches available assets for the authenticated user based on purchase history
 * Returns: { assets: [{ id, title, type, downloadUrl }] }
 */
export async function GET(req: NextRequest) {
  try {
    const uid = await requireUid();

    // Query purchases collection for this user
    const purchasesRef = collection(db, 'purchases');
    const q = query(purchasesRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    const assets: any[] = [];
    const purchasedProducts = new Set<string>();

    querySnapshot.forEach((doc) => {
      const purchase = doc.data();
      if (purchase.product_id) {
        purchasedProducts.add(purchase.product_id);
      }
    });

    // Map products to their assets
    if (purchasedProducts.has('price_starter_pack')) {
      assets.push({
        id: 'starter-pack-pdf',
        title: 'Starter Pack Workbook',
        type: 'pdf',
        description: 'Printable workbook with clarity framework and worksheets',
        filename: 'iPurpose-Starter-Pack.pdf',
        downloadUrl: '/api/resources/download/starter-pack-pdf',
      });
    }

    if (purchasedProducts.has('price_ai_blueprint')) {
      assets.push({
        id: 'ai-blueprint-pdf',
        title: 'AI Blueprint Prompts',
        type: 'pdf',
        description: 'Curated AI prompts and guidance for iPurpose work',
        filename: 'iPurpose-AI-Blueprint.pdf',
        downloadUrl: '/api/resources/download/ai-blueprint-pdf',
      });
    }

    if (purchasedProducts.has('price_accelerator')) {
      assets.push(
        {
          id: 'accelerator-orientation',
          title: 'Accelerator Orientation',
          type: 'guide',
          description: 'Welcome to Accelerator - program overview and getting started',
          unlockUrl: '/orientation',
        },
        {
          id: 'accelerator-resources',
          title: 'Complete Resources Library',
          type: 'library',
          description: 'Access to all platform assets, phased by your progress',
          unlockUrl: '/resources',
        }
      );
    }

    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Error fetching assets:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

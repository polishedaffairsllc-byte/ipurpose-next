import { NextRequest, NextResponse } from 'next/server';
import { requireUid } from '@/lib/firebase/requireUser';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * GET /api/resources/download/[assetId]
 * Serves downloadable PDF asset files
 * Requires authentication + purchase verification
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const uid = await requireUid();
    const { assetId } = await params;

    // Map asset IDs to product requirements
    const assetMap: Record<string, string> = {
      'starter-pack-pdf': 'price_starter_pack',
      'ai-blueprint-pdf': 'price_ai_blueprint',
    };

    const requiredProduct = assetMap[assetId];
    if (!requiredProduct) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Verify purchase
    const purchasesRef = collection(db, 'purchases');
    const q = query(
      purchasesRef,
      where('uid', '==', uid),
      where('product_id', '==', requiredProduct)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Asset not available - purchase required' },
        { status: 403 }
      );
    }

    // TODO: Generate or fetch PDF file
    // For now, return placeholder response
    const pdfBuffer = Buffer.from('PDF placeholder - implement file generation');
    
    const filename =
      assetId === 'starter-pack-pdf'
        ? 'iPurpose-Starter-Pack.pdf'
        : 'iPurpose-AI-Blueprint.pdf';

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading asset:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}

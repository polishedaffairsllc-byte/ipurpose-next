import { buildKNUSTDeckPdf } from '@/lib/partnerships/knust-pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(buildKNUSTDeckPdf(), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="iPurpose_KNUST_Career_Services_Pilot_Concept.pdf"',
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  });
}

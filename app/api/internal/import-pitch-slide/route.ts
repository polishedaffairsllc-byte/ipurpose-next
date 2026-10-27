import { put } from '@vercel/blob';
import { NextRequest } from 'next/server';

const IMPORT_KEY = 'sdsn-pitch-assets-2026';

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('key') !== IMPORT_KEY) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const source = request.nextUrl.searchParams.get('source');
  const name = request.nextUrl.searchParams.get('name');

  if (!source || !name || !/^[a-z0-9/_-]+\.(png|jpg|jpeg|webp)$/i.test(name)) {
    return Response.json({ error: 'Invalid source or name' }, { status: 400 });
  }

  let sourceUrl: URL;
  try {
    sourceUrl = new URL(source);
  } catch {
    return Response.json({ error: 'Invalid source URL' }, { status: 400 });
  }

  if (sourceUrl.protocol !== 'https:' || sourceUrl.hostname !== 'media.canva.com') {
    return Response.json({ error: 'Source host not allowed' }, { status: 400 });
  }

  const upstream = await fetch(sourceUrl, { cache: 'no-store' });
  if (!upstream.ok) {
    return Response.json({ error: `Source fetch failed: ${upstream.status}` }, { status: 502 });
  }

  const bytes = await upstream.arrayBuffer();
  const contentType = upstream.headers.get('content-type') || 'image/jpeg';

  const blob = await put(`pitch-assets/${name}`, bytes, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    cacheControlMaxAge: 31536000,
  });

  return Response.json({ url: blob.url, pathname: blob.pathname, contentType: blob.contentType });
}

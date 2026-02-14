import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { decodeConfig } from '@/utils/config';

export async function POST(request: Request) {
  try {
    const { urls, config: encodedConfig } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
    }

    if (!encodedConfig) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 400 });
    }

    // Decode the config to verify the URLs belong to it
    const config = decodeConfig(encodedConfig);
    if (!config) {
      return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 });
    }

    // Extract all legitimate URLs from the config
    const authorizedUrls = new Set<string>();
    if (config.backgroundUrl) authorizedUrls.add(config.backgroundUrl);
    if (config.videoUrl) authorizedUrls.add(config.videoUrl);
    if (config.galleryImages) {
      Object.values(config.galleryImages).forEach(dayImages => {
        dayImages.forEach(url => authorizedUrls.add(url));
      });
    }

    // Filter provided URLs to only those that are authorized
    const urlsToDelete = urls.filter(url => authorizedUrls.has(url));

    if (urlsToDelete.length === 0) {
      return NextResponse.json({ error: 'No authorized URLs found' }, { status: 403 });
    }

    const secretKey = process.env.BLOB_READ_WRITE_TOKEN;
    if (!secretKey) {
      return NextResponse.json({ error: 'Blob token not configured' }, { status: 500 });
    }

    // Delete ONLY the authorized URLs
    await del(urlsToDelete);

    return NextResponse.json({ success: true, deletedCount: urlsToDelete.length });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

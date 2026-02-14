import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
    }

    const secretKey = process.env.BLOB_READ_WRITE_TOKEN;
    if (!secretKey) {
      return NextResponse.json({ error: 'Blob token not configured' }, { status: 500 });
    }

    // Delete all provided URLs from Vercel Blob
    await del(urls);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

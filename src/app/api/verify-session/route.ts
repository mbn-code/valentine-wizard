import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia' as any,
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({ 
      status: session.payment_status,
      success: session.payment_status === 'paid',
      plan: session.metadata?.plan
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { verifyPremiumPlan } from '@/utils/crypto';

export async function POST(req: Request) {
  try {
    const { plan, partnerNames, signature } = await req.json();

    if (!plan || !partnerNames || !signature) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const signingSecret = process.env.SIGNING_SECRET || 'fallback-secret-for-dev-only-change-this';

    const isValid = await verifyPremiumPlan(plan, partnerNames, signature, signingSecret);

    return NextResponse.json({ success: isValid });
  } catch (error: any) {
    console.error('Premium verification error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-valentine-cream p-8 md:p-24 text-gray-800">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-valentine-red font-bold hover:underline mb-8">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 text-valentine-red">
          <Scale size={40} />
          <h1 className="text-4xl font-bold font-sacramento">Terms of Service</h1>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-valentine-soft">
          <p className="font-bold text-gray-700">Effective Date: February 14, 2026</p>
          
          <h2 className="text-xl font-bold text-valentine-red mt-6">1. Acceptance of Terms</h2>
          <p>
            By using Valentine Wizard, you agree to these terms. If you do not agree, please do not use the service.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">2. Description of Service</h2>
          <p>
            We provide a digital tool to create personalized, interactive web pages. Paid tiers ("The Romance" and "The Sanctuary") unlock additional customization features.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">3. Payments and Refunds</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Final Sale:</strong> Due to the nature of digital goods and immediate asset processing costs, all purchases are final. We do not offer refunds once a premium link has been generated.</li>
            <li><strong>One-time Payment:</strong> Payments are one-time fees, not recurring subscriptions.</li>
          </ul>

          <h2 className="text-xl font-bold text-valentine-red mt-6">4. User Content</h2>
          <p>
            You are responsible for the photos, videos, and text you upload. You must own the rights to the content you share. We reserve the right to remove content that violates laws or third-party rights if reported.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">5. Data Deletion</h2>
          <p>
            We provide a "Delete" feature to remove your media. Please note that once deleted, assets cannot be recovered and the service will no longer function for that specific link.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">6. Limitation of Liability</h2>
          <p>
            The service is provided "as is". We are not responsible for links becoming inaccessible due to browser changes, hosting provider downtime, or user accidental deletion.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">7. Contact</h2>
          <p>
            For support or legal inquiries, contact <span className="font-bold">malthe@mbn-code.dk</span>.
          </p>
        </section>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { Inter, Sacramento } from "next/font/google";
import "./globals.css";
import HeartCursor from "@/components/HeartCursor";
import CookieBanner from "@/components/CookieBanner";
import { ValentineProvider } from "@/utils/ValentineContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sacramento = Sacramento({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-sacramento" 
});

export const metadata: Metadata = {
  metadataBase: new URL("https://valentine-wizard.vercel.app"),
  title: "Valentine Wizard ❤️ | Your Digital Sanctuary",
  description: "Surprise your partner with a personalized interactive sanctuary. Add photos, music, and secret notes that unlock over time. The perfect digital gift.",
  openGraph: {
    title: "Valentine Wizard | Create Your Story",
    description: "The ultimate digital gift for your significant other. Interactive memories, secret videos, and timed reveals.",
    url: "https://valentine-wizard.vercel.app",
    siteName: "Valentine Wizard",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Valentine Wizard Sanctuary Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Valentine Wizard ❤️",
    description: "Create a digital sanctuary for your partner. Photos, music, and secret notes.",
    images: ["/og-image.png"],
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sacramento.variable} font-sans`}>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <ValentineProvider>
          <HeartCursor />
          <CookieBanner />
          {children}
        </ValentineProvider>
      </body>
    </html>
  );
}

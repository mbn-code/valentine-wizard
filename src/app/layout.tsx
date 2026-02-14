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
  metadataBase: new URL("https://valentize.vercel.app"),
  title: "Valentine Wizard | Create Your Digital Sanctuary",
  description: "Surprise your partner with a personalized interactive sanctuary. Add photos, music, and secret notes that unlock over time.",
  openGraph: {
    title: "Valentine Wizard",
    description: "The ultimate digital gift for your significant other.",
    url: "https://valentize.vercel.app",
    siteName: "Valentine Wizard",
    images: [
      {
        url: "/og-image.png", // User should add this later
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Valentine Wizard",
    description: "The ultimate digital gift for your significant other.",
    images: ["/og-image.png"],
  },
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

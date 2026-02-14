import type { Metadata } from "next";
import { Inter, Sacramento } from "next/font/google";
import "./globals.css";
import HeartCursor from "@/components/HeartCursor";
import { ValentineProvider } from "@/utils/ValentineContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sacramento = Sacramento({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-sacramento" 
});

export const metadata: Metadata = {
  title: "Valentine Wizard",
  description: "Create your own Valentine sanctuary",
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
          {children}
        </ValentineProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monopoli WNI - Arena Meja Nusantara",
  description: "Monopoly Indonesia dengan meme culture - Multiplayer Online",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-on-background font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

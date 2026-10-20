import type { Metadata, Viewport } from "next";
import { Archivo, Inter, Instrument_Serif, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap", axes: ["wdth"] });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "oneTake — a native video editor",
  description: "Cut, grade and export video. Native on macOS, Windows and Linux.",
  metadataBase: new URL("https://marshiyar.github.io/onetake-site/"),
  openGraph: { title: "oneTake", description: "Cut, grade and export video. Native on macOS, Windows and Linux.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#121316" },
    { media: "(prefers-color-scheme: light)", color: "#f2f1ee" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable} ${instrument.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

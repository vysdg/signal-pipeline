import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const geistSans   = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono   = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });
const dmSerif     = DM_Serif_Display({ variable: "--font-serif", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Signal Pipeline — Revenue Intelligence",
  description: "Pipeline de inteligência de vendas orientada a eventos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSerif.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}

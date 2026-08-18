import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plex     = IBM_Plex_Sans({ variable: "--font-sans", weight: ["400","500","600"], subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-mono", weight: ["400","500"],      subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Signal Pipeline — Revenue Intelligence",
  description: "Pipeline de inteligência de vendas orientada a eventos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${plex.variable} ${plexMono.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

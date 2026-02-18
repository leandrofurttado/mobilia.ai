import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import LayoutShell from "./components/LayoutShell";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Homevia — Transforme seu espaço com IA",
  description: "Envie uma foto do seu cômodo e receba uma versão moderna e aconchegante, com lista de móveis identificados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={quicksand.variable}>
      <body className={`${quicksand.className} min-h-screen antialiased`}>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CotizaNet - Cotizaciones, pedidos y cobranza para PyMEs",
  description: "Sistema de gestión de cotizaciones, pedidos y cobranza para PyMEs mexicanas. Simplifica tu negocio con CotizaNet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

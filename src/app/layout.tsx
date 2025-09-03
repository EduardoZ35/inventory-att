import type { Metadata } from "next";
import "./globals.css";
import ConditionalLayoutWrapper from '@/components/ConditionalLayoutWrapper';
import { QueryProvider } from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: "Control & Soporte Tecnológico",
  description: "Sistema integral de inventario especializado en equipos tecnológicos: relojes de asistencia, huelleros, impresoras térmicas y repuestos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-gray-950">
        <QueryProvider>
          <ConditionalLayoutWrapper>
            {children}
          </ConditionalLayoutWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}

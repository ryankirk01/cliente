import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prospecção Maps',
  description: 'Plataforma privada para encontrar oportunidades no Google Maps.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

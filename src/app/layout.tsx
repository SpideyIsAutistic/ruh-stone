import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ruhstone.com'),
  title: 'RUH STONE — Handcrafted Objects & Artisan Decor',
  description:
    'Thoughtfully crafted objects shaped by tradition, material and human hands. Contemporary Indian craftsmanship, hand-carved stone vessels, wheel-thrown ceramics, beaten kansa bronze, and sculptural decor.',
  keywords: [
    'RUH STONE',
    'Handcrafted Objects',
    'Artisan Decor',
    'Indian Craftsmanship',
    'Handmade Ceramics',
    'Carved Stone Vessels',
    'Sculptural Objects',
    'Beaten Brass',
    'Quiet Luxury Decor',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'RUH STONE — The Beauty of the Handmade',
    description:
      'Thoughtfully crafted objects shaped by tradition, material and human hands. Collectible artisan decor.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'RUH STONE',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#FAF7F2] text-[#23201D] font-sans antialiased selection:bg-[#D1C2AC]/50 selection:text-[#23201D] min-h-screen">
        {children}
      </body>
    </html>
  );
}

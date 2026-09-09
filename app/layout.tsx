import type {Metadata} from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css'; // Global styles

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'MKA Studio | Catálogo Inmersivo 3D',
  description: 'Catálogo interactivo en dark mode con física tridimensional, GSAP ScrollTrigger y Flip para piezas de diseño y tecnología.',
  openGraph: {
    title: 'MKA Studio | Catálogo Inmersivo 3D',
    description: 'Catálogo interactivo en dark mode con física tridimensional, GSAP ScrollTrigger y Flip para piezas de diseño y tecnología.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MKA Studio | Catálogo Inmersivo 3D',
    description: 'Catálogo interactivo en dark mode con física tridimensional, GSAP ScrollTrigger y Flip para piezas de diseño y tecnología.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es" className={`dark bg-[#0A0A0A] overflow-x-hidden no-scrollbar ${dmSans.variable}`}>
      <body className={`${dmSans.className} bg-[#0A0A0A] text-[#E5E5E5] antialiased min-h-screen selection:bg-white selection:text-black overflow-x-hidden no-scrollbar`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}


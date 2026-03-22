import type { Metadata } from 'next';
import { Inter, Onest } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-body', display: 'swap' });
const onest = Onest({ subsets: ['latin', 'cyrillic'], variable: '--font-heading', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Шпаргалочка — оберіть автора за рейтингом та відгуками', template: '%s | Шпаргалочка' },
  description: 'Платформа, де студенти обирають автора для курсових, дипломних та інших робіт за рейтингом, відгуками та ціною.',
  metadataBase: new URL('https://shpargalochka.org.ua'),
  openGraph: { type: 'website', locale: 'uk_UA', siteName: 'Шпаргалочка' },
  icons: { icon: '/favicon.svg' },
};

const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Шпаргалочка',
  url: 'https://shpargalochka.org.ua',
  logo: 'https://shpargalochka.org.ua/favicon.svg',
  description: 'Платформа, де студенти обирають автора за рейтингом, відгуками та ціною для виконання курсових, дипломних, рефератів та інших навчальних робіт.',
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', url: 'https://t.me/Shpargalochka_bot' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${inter.variable} ${onest.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 font-body">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }} />
      </body>
    </html>
  );
}

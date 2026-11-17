import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { FavoritesProvider } from '@/contexts/FavoritesContext';

// Prevent FontAwesome from adding its CSS since we did it manually above
config.autoAddCss = false;

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Top Pokédex',
  description: 'Uma pokédex moderna e interativa com busca, filtros, favoritos e criação de pokémons customizados. Explore, descubra e colecione!',
  keywords: ['pokemon', 'pokedex', 'interactive', 'search', 'favorites', 'custom'],
  authors: [{ name: 'Matheus Luz' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png?v=3', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png?v=3', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.ico?v=3' },
    ],
    shortcut: '/favicon/favicon.ico?v=3',
    apple: '/favicon/apple-touch-icon.png?v=3',
    other: [
      { url: '/favicon/android-chrome-192x192.png?v=3', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/android-chrome-512x512.png?v=3', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json?v=3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <FavoritesProvider>
          {children}
          <Toaster />
        </FavoritesProvider>
      </body>
    </html>
  );
}
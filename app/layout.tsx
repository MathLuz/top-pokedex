import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { FavoritesProvider } from '@/contexts/FavoritesContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pokédex Interativa - Explore o Mundo Pokémon',
  description: 'Uma pokédex moderna e interativa com busca, filtros, favoritos e criação de pokémons customizados. Explore, descubra e colecione!',
  keywords: ['pokemon', 'pokedex', 'interactive', 'search', 'favorites', 'custom'],
  authors: [{ name: 'Matheus Luz' }],
  viewport: 'width=device-width, initial-scale=1',
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
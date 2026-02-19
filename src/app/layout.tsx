import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { PreprocessorProvider } from '@/components/PreprocessorProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'Makro | Terminal',
  description: 'Bloomberg-style financial news terminal with AI sentiment analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} bg-terminal-bg text-terminal-text min-h-screen`}>
        <PreprocessorProvider>
          {children}
        </PreprocessorProvider>
      </body>
    </html>
  );
}

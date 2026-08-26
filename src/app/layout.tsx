import type { Metadata } from 'next';
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Fira_Code } from 'next/font/google';
import './globals.css';

const displayFont = Bricolage_Grotesque({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '700', '800'],
});

const bodyFont = Plus_Jakarta_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const codeFont = Fira_Code({
  variable: '--font-code',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Clean Code Analyzer · Sua bússola para código Java limpo',
  description: 'Analisador interativo de Clean Code para Java. Pratique refatoração com feedback instantâneo, exercícios guiados e uma IA mentorada.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${displayFont.variable} ${bodyFont.variable} ${codeFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

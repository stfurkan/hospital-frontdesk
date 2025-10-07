import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NavigationLoader } from '@/components/navigation-loader';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Hastane Ön Büro Sistemi',
  description: 'Hospital front desk patient registration and management system'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='tr'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavigationLoader />
        {children}
      </body>
    </html>
  );
}

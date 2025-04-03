import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const workSans = Work_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-work-sans',
});

export const metadata: Metadata = {
  title: 'EON',
  description: 'Spark your savings journey',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffc300' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' transform='rotate(45)'%3E%3Cpath d='M12 6C6.5 6 4 8.5 4 14s2.5 8 8 8 8-2.5 8-8-2.5-8-8-8z'/%3E%3C/svg%3E"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
      </head>
      <body className={workSans.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

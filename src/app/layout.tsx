import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { LanguageProvider } from '@/contexts/language-context';

export const metadata: Metadata = {
  title: 'بحوث Streaming',
  description: 'المنصة رقم #1 في العالم',
  category: 'Entertainment'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="https://l.top4top.io/p_3899p00zm1.png" type="image/png" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <AuthProvider>
          <LanguageProvider>
              {children}
              <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

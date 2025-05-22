import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/Providers'
import Image from 'next/image'
import Link from 'next/link'

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: 'Choose Proper Present',
  description: 'A wishlist application for choosing the perfect present',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-4 group">
                <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
                  <Image
                    src="/images/logo.svg"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Choose Proper Present For Me
                </span>
              </Link>
            </div>
          </div>
        </header>
        <main>
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}

import './globals.css'
import { SupabaseProvider } from '@/lib/supabase-provider'

export const metadata = {
  title: 'Benches with a View - Discover Beautiful Bench Locations',
  description: 'Find and share the most beautiful bench locations around the world. Every bench tells a story, every view creates a memory.',
  keywords: 'benches, views, photography, locations, community, travel, outdoor, nature',
  authors: [{ name: 'Benches with a View' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#800020',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#800020" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}

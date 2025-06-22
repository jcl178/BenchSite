import './globals.css'
import { SupabaseProvider } from '@/lib/supabase-provider'

export const metadata = {
  title: 'Bench Finder',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}

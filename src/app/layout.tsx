import type { Metadata } from "next";
import { Google_Sans } from "next/font/google";
import { ThemeProvider } from "@/app/components/theme-provider";
import Header from "@/app/components/header";
import "./globals.css";
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getStaffProfileSummary } from '@/lib/supabase-admin';

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOS Bixos",
  description: "Guia para integração de novos ingressantes da faculdade.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user
    ? await getStaffProfileSummary(user.id)
    : null;
  
  return (
    <html
      lang="pt-BR"
      className={`${googleSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <Header
            isAuthenticated={Boolean(user)}
            fotoPerfil={profile?.fotoPerfilUrl ?? ''}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

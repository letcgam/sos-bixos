import type { Metadata } from "next";
import { Google_Sans } from "next/font/google";
import { ThemeProvider } from "@/app/components/theme-provider";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import "./globals.css";
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getStaffProfileSummary } from '@/lib/supabase-admin';

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOS Bixos - Acolhimento e Integração Acadêmica",
  description: "Tire dúvidas. Encontre apoio de colegas. Conheça sua instituição.",
  // Configuração de compartilhamento (Open Graph)
  openGraph: {
    title: "SOS Bixos - Acolhimento e Integração Acadêmica",
    description: "Tire dúvidas. Encontre apoio de colegas. Conheça sua instituição.",
    url: "https://sos-bixo.vercel.app", // URL final da Vercel
    siteName: "SOS Bixos",
    images: [
      {
        url: "https://sos-bixo.vercel.app/og-image.png", // URL absoluta da imagem de compartilhamento
        width: 1200,
        height: 630,
        alt: "SOS Bixos Preview",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  // Configuração de compartilhamento no Twitter (Opcional)
  twitter: {
    card: "summary_large_image",
    title: "SOS Bixo - Acolhimento e Integração Acadêmica",
    description: "Tire dúvidas. Encontre apoio de colegas. Conheça sua instituição.",
    images: ["https://sos-bixo.vercel.app/og-image.png"],
  },
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
      <body className="min-h-dvh flex flex-col justify-between" suppressHydrationWarning>
        <ThemeProvider>
          <Header
            isAuthenticated={Boolean(user)}
            fotoPerfil={profile?.fotoPerfilUrl ?? ''}
          />
          {children}
        </ThemeProvider>
        <Footer/>
      </body>
    </html>
  );
}

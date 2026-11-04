import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseInstitutionImagePattern = supabaseUrl
  ? new URL('/storage/v1/object/public/instituicao/**', supabaseUrl)
  : null;

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: supabaseInstitutionImagePattern
      ? [supabaseInstitutionImagePattern]
      : [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '21mb',
    },
  },
  reactCompiler: true,
};

export default nextConfig;

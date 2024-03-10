import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXTAUTH_SECRET: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    NEXTAUTH_URL: z.string().url(),
    SUPABASE_DATABASE_URL: z.string().url(),
    SUPABASE_PUBLIC_ANON_KEY: z.string().min(1),
    SUPABASE_ENDPOINT: z.string().url(),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().min(1),
    NEXT_PUBLIC_MAPBOX_STYLE_LIGHT: z.string().min(1),
    NEXT_PUBLIC_MAPBOX_STYLE_DARK: z.string().min(1),
  },

  runtimeEnv: {
    SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_MAPBOX_STYLE_LIGHT: process.env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT,
    NEXT_PUBLIC_MAPBOX_STYLE_DARK: process.env.NEXT_PUBLIC_MAPBOX_STYLE_DARK,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SUPABASE_PUBLIC_ANON_KEY: process.env.SUPABASE_PUBLIC_ANON_KEY,
    SUPABASE_ENDPOINT: process.env.SUPABASE_ENDPOINT,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

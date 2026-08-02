import "server-only";
import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
};

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().optional()
);

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().optional()
);

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().email().optional()
);

const schema = z.object({
  // ==========================
  // SUPABASE
  // ==========================
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,

  SUPABASE_URL: optionalUrl,
  SUPABASE_ANON_KEY: optionalString,

  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  SUPABASE_SERVICE_KEY: optionalString,

  // ==========================
  // STRIPE
  // ==========================
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_SECRET: optionalString,

  STRIPE_WEBHOOK_SECRET: optionalString,
  STRIPE_WEBHOOK: optionalString,

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString,

  // ==========================
  // RESEND
  // ==========================
  RESEND_API_KEY: optionalString,
  RESEND_FROM_EMAIL: optionalEmail,

  // ==========================
  // ADMIN
  // ==========================
  ADMIN_EMAIL: optionalEmail,

  // ==========================
  // SITE
  // ==========================
  SITE_URL: z.string().url().default("http://localhost:3000"),

  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_SITE_NAME: optionalString,
});

export function serverEnv() {
  return schema.parse(process.env);
}

export function requireSupabaseAdminEnv() {
  const env = serverEnv();

  const url =
    env.NEXT_PUBLIC_SUPABASE_URL ??
    env.SUPABASE_URL;

  const key =
    env.SUPABASE_SERVICE_ROLE_KEY ??
    env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_ADMIN_CONFIG_MISSING"
    );
  }

  return {
    url,
    key,
  };
}
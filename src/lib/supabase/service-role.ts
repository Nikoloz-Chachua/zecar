import "server-only";
import { createClient } from "@supabase/supabase-js";
import { ingestionConfig } from "./config";
// SUPABASE_SERVICE_ROLE_KEY is read only through ingestionConfig in this server-only module.

export function createAnalyticsServiceClient() {
  const config = ingestionConfig();
  return config.configured ? createClient(config.url, config.serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

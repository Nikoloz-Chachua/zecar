import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hardenCookieOptions, supabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const config = supabaseConfig();
  if (!config.configured) return supabaseResponse;

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, hardenCookieOptions(options)));
        Object.entries(headers).forEach(([name, value]) => supabaseResponse.headers.set(name, value));
      },
    },
  });

  await supabase.auth.getUser();
  return supabaseResponse;
}
